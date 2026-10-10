import { GoogleGenAI } from "@google/genai";
import { seniorityLabels, stackLabels, type Seniority, type Stack } from "@/data/pay";
import { allSkills } from "@/data/talent-visibility";
import { benchmark, negotiationRange } from "@/lib/pay-math";
import type { WorkMode } from "@/lib/sharing";
import { seniorityOrder, stackOrder } from "@/lib/talent";
import type { TalentQuery } from "@/lib/talent-search";

/**
 * Talent Finder: the companies' AI agent (docs/concept.md, docs/brand.md).
 * Gemma 4 via the Gemini API turns a plain-language hiring request into search
 * filters and drafts a first message. Pay numbers never come from the model:
 * the suggested band is computed from BLS data with negotiationRange().
 * Without GEMINI_API_KEY it falls back to a keyword parser so the page always works.
 */

export interface FinderResult {
  query: TalentQuery;
  role: string;
  headcount: number;
  draftMessage: string;
  rationale: string;
  /** Fair band from BLS: Miami market target → Austin buying-power parity. */
  suggestedBand: { min: number; max: number; marketRate: number } | null;
  engine: string;
}


let gemmaModel: string | null = process.env.GEMMA_MODEL ?? null;

/** Finds the largest Gemma 4 model the key can use (ListModels), unless GEMMA_MODEL pins one. */
async function resolveGemma(ai: GoogleGenAI): Promise<string> {
  if (gemmaModel) return gemmaModel;
  const names: string[] = [];
  for await (const m of await ai.models.list()) if (m.name) names.push(m.name.replace(/^models\//, ""));
  const gemma4 = names.filter((n) => n.startsWith("gemma-4"));
  if (!gemma4.length) throw new Error(`No Gemma 4 model available to this key (saw: ${names.filter((n) => n.startsWith("gemma")).join(", ") || "none"})`);
  const size = (n: string) => Number(n.match(/(\d+)b/)?.[1] ?? 0);
  gemmaModel = gemma4.sort((a, b) => size(b) - size(a))[0];
  return gemmaModel;
}

function prompt(request: string, company: string) {
  return `You are Talent Finder, the AI partner that helps companies hire engineers who live in Miami through Rooted.
Company: ${company}
Hiring request: """${request}"""

Allowed values:
stack: ${stackOrder.join(" | ")}
seniority: ${seniorityOrder.join(" | ")}
workMode: office | hybrid | remote | all
skills (choose 0-4, exact spelling): ${allSkills.join(", ")}

Rules: Do not mention or invent salary numbers (we add a data-backed pay band). Do not reference age, gender, ethnicity, nationality or any protected trait. The draft is the company's first message to an engineer who opted in to hear from companies: warm, specific, under 600 characters, mention why the team is in Miami, end with a low-pressure question.

Reply with ONLY JSON:
{"stack":"","seniority":"","workMode":"","skills":[],"role":"","headcount":1,"rationale":"one sentence on how you read the request","draftMessage":""}`;
}

function extractJson(text: string) {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s < 0 || e <= s) throw new Error("Talent Finder did not return JSON");
  return JSON.parse(text.slice(s, e + 1));
}

/** Keyword fallback: same output shape, no AI. */
function parseLocally(request: string, company: string) {
  const r = request.toLowerCase();
  const stackHints: [Stack, RegExp][] = [
    ["data-ml", /\b(data|ml|machine learning|ai engineer|llm)\b/],
    ["devops", /\b(devops|sre|platform|infra)/],
    ["security", /\bsecurity|appsec/],
    ["mobile", /\b(mobile|ios|android)\b/],
    ["frontend", /\bfront[- ]?end|react\b/],
    ["fullstack", /\bfull[- ]?stack/],
    ["product", /\bproduct manager|\bpm\b/],
    ["backend", /\bback[- ]?end|api|payments/],
  ];
  const stack = stackHints.find(([, re]) => re.test(r))?.[0] ?? "all";
  const seniority = (seniorityOrder.find((s) => r.includes(s)) ?? (/\blead|principal\b/.test(r) ? "staff" : "all")) as Seniority | "all";
  const workMode = (["remote", "hybrid", "office"] as WorkMode[]).find((m) => r.includes(m)) ?? "all";
  // A neighborhood in the request is the company's office, not where engineers must live: never filter on it.
  const neighborhood = "all";
  const esc = (s: string) => s.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const skills = allSkills.filter((s) => new RegExp(`(^|[^a-z])${esc(s)}([^a-z]|$)`).test(r)).slice(0, 4);
  const headcount = Number(r.match(/\b(\d{1,2})\b/)?.[1] ?? 1);
  const role = stack === "all" ? "Engineer" : `${seniority === "all" ? "" : seniorityLabels[seniority] + " "}${stackLabels[stack]} engineer`.trim();
  return {
    stack,
    seniority,
    workMode,
    neighborhood,
    skills,
    role,
    headcount,
    rationale: "Read with the keyword parser (no AI key configured).",
    draftMessage: `Hi! I'm hiring at ${company} here in Miami and your profile stood out. We're building our team locally because we want people who are part of this city. Would you be open to a 20-minute coffee chat this week?`,
  };
}

const pick = <T extends string>(v: unknown, allowed: readonly T[], dflt: T | "all"): T | "all" =>
  allowed.includes(v as T) ? (v as T) : dflt;

export async function runTalentFinder(request: string, company: string): Promise<FinderResult> {
  let raw: ReturnType<typeof parseLocally>;
  let engine = "keyword parser (no GEMINI_API_KEY)";
  if (process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = await resolveGemma(ai);
    const res = await ai.models.generateContent({ model, contents: prompt(request, company), config: { temperature: 0.3 } });
    raw = extractJson(res.text ?? "");
    engine = model;
  } else {
    raw = parseLocally(request, company);
  }

  // Validate everything the model said against our vocabularies.
  const stack = pick<Stack>(raw.stack, stackOrder, "all");
  const seniority = pick<Seniority>(raw.seniority, seniorityOrder, "all");
  const workMode = pick<WorkMode>(raw.workMode, ["office", "hybrid", "remote"], "all");
  // Office location is not a filter on where engineers live (fair access across Miami).
  const neighborhood = "all";
  const skills = (Array.isArray(raw.skills) ? raw.skills : []).filter((s: string) => allSkills.includes(s)).slice(0, 4);

  const b = stack !== "all" ? benchmark(stack, seniority === "all" ? "mid" : seniority) : undefined;
  const range = b ? negotiationRange(b) : null;

  return {
    query: { stack, seniority, workMode, neighborhood, skills },
    role: String(raw.role || "Engineer").slice(0, 80),
    headcount: Math.max(1, Math.min(20, Number(raw.headcount) || 1)),
    draftMessage: String(raw.draftMessage || "").slice(0, 1000),
    rationale: String(raw.rationale || ""),
    suggestedBand: range ? { min: range.target, max: range.anchor, marketRate: range.walkAway } : null,
    engine,
  };
}
