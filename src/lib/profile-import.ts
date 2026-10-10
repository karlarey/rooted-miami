import type { Seniority, Stack } from "@/data/pay";
import type { Profile } from "@/lib/types";

/**
 * Turns the text of a LinkedIn "Save to PDF" export into onboarding fields.
 *
 * Deterministic and offline: always runs, also in mock mode. An LLM may refine the
 * result afterwards (see src/app/api/profile/import/route.ts), but this is the floor.
 * Works on plain text only; the PDF and its text are never stored or logged.
 */

export type ImportedFields = Partial<Pick<Profile, "name" | "role" | "movedFrom" | "languages" | "stack" | "seniority">> & {
  skills: string[];
};

export interface ImportResult {
  fields: ImportedFields;
  /** 0–1: how much of the profile we could read with some certainty. */
  confidence: number;
  source: "heuristic" | "llm";
}

export const STACKS: readonly Stack[] = [
  "backend",
  "frontend",
  "fullstack",
  "data-ml",
  "mobile",
  "devops",
  "security",
  "product",
];
export const SENIORITIES: readonly Seniority[] = ["junior", "mid", "senior", "staff"];

/** Max characters of profile text we look at (a long LinkedIn export is ~10K). */
export const MAX_TEXT_CHARS = 40_000;

const SECTION_HEADERS = [
  "Contact",
  "Top Skills",
  "Skills",
  "Languages",
  "Certifications",
  "Honors-Awards",
  "Publications",
  "Patents",
  "Summary",
  "Experience",
  "Education",
  "Volunteer Experience",
  "Projects",
] as const;
type Section = (typeof SECTION_HEADERS)[number] | "header";

const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";
/** "January 2020 - Present (4 years 9 months)" or "2018 - 2020". */
const DATE_RANGE = new RegExp(
  `^(?:(?:${MONTHS})\\s+)?((?:19|20)\\d{2})\\s*[-–]\\s*(?:Present|(?:(?:${MONTHS})\\s+)?(?:19|20)\\d{2})`,
  "i",
);
const PAGE_MARKER = /^Page \d+ of \d+$/i;

/** Known origin cities, normalized to the labels onboarding uses. */
const CITIES: { label: string; pattern: RegExp }[] = [
  { label: "New York City", pattern: /\b(new york|nyc|brooklyn|manhattan|queens|jersey city|hoboken)\b/i },
  { label: "SF Bay Area", pattern: /\b(san francisco|bay area|oakland|san jose|palo alto|mountain view|sunnyvale|berkeley)\b/i },
  { label: "Chicago", pattern: /\bchicago\b/i },
  { label: "Boston", pattern: /\b(boston|cambridge, massachusetts)\b/i },
  { label: "Los Angeles", pattern: /\b(los angeles|santa monica|greater la)\b/i },
  { label: "Seattle", pattern: /\b(seattle|bellevue|redmond)\b/i },
  { label: "Austin", pattern: /\baustin\b/i },
  { label: "Washington DC", pattern: /\b(washington,? d\.?c\.?|washington dc|dc-baltimore)\b/i },
  { label: "Atlanta", pattern: /\batlanta\b/i },
  { label: "Denver", pattern: /\b(denver|boulder)\b/i },
  { label: "Toronto", pattern: /\btoronto\b/i },
  { label: "London", pattern: /\blondon\b/i },
  { label: "Mexico City", pattern: /\b(mexico city|ciudad de m[eé]xico)\b/i },
  { label: "Bogotá", pattern: /\bbogot[aá]\b/i },
  { label: "Caracas", pattern: /\bcaracas\b/i },
  { label: "São Paulo", pattern: /\bs[aã]o paulo\b/i },
  { label: "Buenos Aires", pattern: /\bbuenos aires\b/i },
  { label: "Madrid", pattern: /\bmadrid\b/i },
];
const MIAMI = /\b(miami|fort lauderdale|brickell|coral gables|doral|wynwood|south florida)\b/i;
/** "City, State, Country" style location lines. */
const LOCATION_LINE = /^[A-Z][\p{L} .'-]+,\s*[\p{L} .'-]+(,\s*[\p{L} .'-]+)?$|^Greater [\p{L} .'-]+ Area$|Metropolitan Area$|Bay Area$/u;

/** Keywords that count as skills, and the stacks they vote for. */
const SKILL_KEYWORDS: { skill: string; pattern: RegExp; stacks: Stack[] }[] = [
  { skill: "Go", pattern: /\b(golang|go \(programming|go lang)\b/i, stacks: ["backend"] },
  { skill: "Java", pattern: /\bjava\b(?!script)/i, stacks: ["backend"] },
  { skill: "Kotlin", pattern: /\bkotlin\b/i, stacks: ["mobile", "backend"] },
  { skill: "Python", pattern: /\bpython\b/i, stacks: ["backend", "data-ml"] },
  { skill: "Node.js", pattern: /\bnode(\.js|js)?\b/i, stacks: ["backend"] },
  { skill: "Ruby on Rails", pattern: /\b(ruby on rails|rails)\b/i, stacks: ["backend"] },
  { skill: "C#", pattern: /\bc#|\.net\b/i, stacks: ["backend"] },
  { skill: "Rust", pattern: /\brust\b/i, stacks: ["backend"] },
  { skill: "Scala", pattern: /\bscala\b/i, stacks: ["backend", "data-ml"] },
  { skill: "PostgreSQL", pattern: /\b(postgres(ql)?)\b/i, stacks: ["backend"] },
  { skill: "MySQL", pattern: /\bmysql\b/i, stacks: ["backend"] },
  { skill: "Redis", pattern: /\bredis\b/i, stacks: ["backend"] },
  { skill: "Kafka", pattern: /\bkafka\b/i, stacks: ["backend", "data-ml"] },
  { skill: "Microservices", pattern: /\bmicroservices?\b/i, stacks: ["backend"] },
  { skill: "REST APIs", pattern: /\b(rest(ful)? apis?|api design)\b/i, stacks: ["backend"] },
  { skill: "GraphQL", pattern: /\bgraphql\b/i, stacks: ["backend", "frontend"] },
  { skill: "Distributed Systems", pattern: /\bdistributed systems\b/i, stacks: ["backend"] },
  { skill: "TypeScript", pattern: /\btypescript\b/i, stacks: ["frontend", "backend"] },
  { skill: "JavaScript", pattern: /\bjavascript\b/i, stacks: ["frontend"] },
  { skill: "React", pattern: /\breact(\.js|js)?\b(?! native)/i, stacks: ["frontend"] },
  { skill: "Next.js", pattern: /\bnext\.?js\b/i, stacks: ["frontend"] },
  { skill: "Vue", pattern: /\bvue(\.js)?\b/i, stacks: ["frontend"] },
  { skill: "Angular", pattern: /\bangular\b/i, stacks: ["frontend"] },
  { skill: "CSS", pattern: /\b(css|tailwind|sass)\b/i, stacks: ["frontend"] },
  { skill: "Accessibility", pattern: /\b(accessibility|a11y|wcag)\b/i, stacks: ["frontend"] },
  { skill: "iOS", pattern: /\bios\b/i, stacks: ["mobile"] },
  { skill: "Swift", pattern: /\bswift(ui)?\b/i, stacks: ["mobile"] },
  { skill: "Android", pattern: /\bandroid\b/i, stacks: ["mobile"] },
  { skill: "React Native", pattern: /\breact native\b/i, stacks: ["mobile"] },
  { skill: "Flutter", pattern: /\bflutter\b/i, stacks: ["mobile"] },
  { skill: "Machine Learning", pattern: /\b(machine learning|ml engineer|deep learning)\b/i, stacks: ["data-ml"] },
  { skill: "PyTorch", pattern: /\bpytorch\b/i, stacks: ["data-ml"] },
  { skill: "TensorFlow", pattern: /\btensorflow\b/i, stacks: ["data-ml"] },
  { skill: "LLMs", pattern: /\b(llms?|large language models?|generative ai|genai)\b/i, stacks: ["data-ml"] },
  { skill: "SQL", pattern: /\bsql\b/i, stacks: ["data-ml", "backend"] },
  { skill: "Spark", pattern: /\b(apache )?spark\b/i, stacks: ["data-ml"] },
  { skill: "Data Engineering", pattern: /\b(data engineering|etl|airflow|dbt|snowflake)\b/i, stacks: ["data-ml"] },
  { skill: "Analytics", pattern: /\b(data analysis|analytics|pandas)\b/i, stacks: ["data-ml"] },
  { skill: "AWS", pattern: /\b(aws|amazon web services)\b/i, stacks: ["devops", "backend"] },
  { skill: "GCP", pattern: /\b(gcp|google cloud)\b/i, stacks: ["devops"] },
  { skill: "Azure", pattern: /\bazure\b/i, stacks: ["devops"] },
  { skill: "Kubernetes", pattern: /\b(kubernetes|k8s)\b/i, stacks: ["devops"] },
  { skill: "Docker", pattern: /\bdocker\b/i, stacks: ["devops"] },
  { skill: "Terraform", pattern: /\bterraform\b/i, stacks: ["devops"] },
  { skill: "CI/CD", pattern: /\b(ci\/cd|continuous integration|github actions|jenkins)\b/i, stacks: ["devops"] },
  { skill: "SRE", pattern: /\b(sre|site reliability|observability)\b/i, stacks: ["devops"] },
  { skill: "Security", pattern: /\b(cybersecurity|information security|appsec|application security|penetration testing|soc 2|iam)\b/i, stacks: ["security"] },
  { skill: "Product Management", pattern: /\b(product management|product strategy|roadmaps?)\b/i, stacks: ["product"] },
  { skill: "User Research", pattern: /\b(user research|product discovery)\b/i, stacks: ["product"] },
  { skill: "Agile", pattern: /\b(agile|scrum)\b/i, stacks: [] },
];

/** Title phrases that decide the stack outright (checked in order). */
const TITLE_STACK: { pattern: RegExp; stack: Stack }[] = [
  { pattern: /\b(full[- ]?stack)\b/i, stack: "fullstack" },
  { pattern: /\b(product manager|product owner|head of product|\bpm\b)\b/i, stack: "product" },
  { pattern: /\b(security|appsec|infosec|penetration)\b/i, stack: "security" },
  { pattern: /\b(devops|sre|site reliability|platform|infrastructure|cloud engineer)\b/i, stack: "devops" },
  { pattern: /\b(machine learning|ml|data scien|data engineer|ai engineer|analytics engineer|data)\b/i, stack: "data-ml" },
  { pattern: /\b(ios|android|mobile)\b/i, stack: "mobile" },
  { pattern: /\b(front[- ]?end|ui engineer|web developer)\b/i, stack: "frontend" },
  { pattern: /\b(back[- ]?end|server|api)\b/i, stack: "backend" },
];

const SPANISH_STRONG = /native|bilingual|full professional|professional working/i;

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

function splitSections(text: string): Map<Section, string[]> {
  const sections = new Map<Section, string[]>([["header", []]]);
  let current: Section = "header";
  for (const raw of text.split(/\r?\n/)) {
    const l = clean(raw);
    if (!l || PAGE_MARKER.test(l)) continue;
    const header = SECTION_HEADERS.find((h) => h.toLowerCase() === l.toLowerCase());
    if (header) {
      current = header;
      if (!sections.has(current)) sections.set(current, []);
      continue;
    }
    sections.get(current)!.push(l);
  }
  return sections;
}

/** Title of the most recent role: the line above the first date range in Experience. */
function currentTitle(experience: string[]): string | undefined {
  const i = experience.findIndex((l) => DATE_RANGE.test(l));
  if (i > 0) {
    const t = experience[i - 1];
    if (t.length <= 80 && !LOCATION_LINE.test(t)) return t;
  }
  return undefined;
}

/** LinkedIn headline: "Senior Backend Engineer at Acme | Go, Kafka". */
function headline(lines: string[]): string | undefined {
  const roleWord = /\b(engineer|developer|scientist|architect|manager|lead|designer|analyst|sre|cto|founder)\b/i;
  const candidates = lines.filter((l) => roleWord.test(l) && !/certif|course|award/i.test(l) && l.length <= 160);
  const h = candidates.find((l) => /\s(at|@)\s|\|/.test(l)) ?? candidates[0];
  return h ? clean(h.split(/\s+(?:at|@)\s+|\s*\|\s*/)[0]) : undefined;
}

function yearsOfExperience(experience: string[], now = new Date()): number | undefined {
  const starts = experience
    .map((l) => DATE_RANGE.exec(l)?.[1])
    .filter((y): y is string => Boolean(y))
    .map(Number);
  if (!starts.length) return undefined;
  return Math.max(0, now.getFullYear() - Math.min(...starts));
}

export function seniorityFrom(title: string | undefined, years: number | undefined): Seniority | undefined {
  const t = title ?? "";
  if (/\b(intern|junior|jr\.?|entry[- ]level|associate|graduate|apprentice|trainee)\b/i.test(t)) return "junior";
  if (/\b(staff|principal|distinguished|architect|head of|director|vp|vice president|cto|chief)\b/i.test(t)) return "staff";
  if (/\b(lead|tech lead|senior|sr\.?|iii)\b/i.test(t)) return years !== undefined && years >= 10 && /\blead\b/i.test(t) ? "staff" : "senior";
  if (/\b(ii|2)\b/i.test(t)) return "mid";
  if (years === undefined) return undefined;
  if (years < 2) return "junior";
  if (years < 5) return "mid";
  if (years < 12) return "senior";
  return "staff";
}

function stackFrom(title: string | undefined, skillStacks: Stack[]): Stack | undefined {
  if (title) {
    const hit = TITLE_STACK.find((t) => t.pattern.test(title));
    if (hit) return hit.stack;
  }
  const score = new Map<Stack, number>();
  for (const s of skillStacks) score.set(s, (score.get(s) ?? 0) + 1);
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return undefined;
  const fe = score.get("frontend") ?? 0;
  const be = score.get("backend") ?? 0;
  // Strong on both sides and nothing else dominates: full-stack.
  if (fe >= 2 && be >= 2 && Math.min(fe, be) / Math.max(fe, be) >= 0.6 && ["frontend", "backend"].includes(ranked[0][0])) {
    return "fullstack";
  }
  return ranked[0][0];
}

function cityFrom(lines: string[]): string | undefined {
  for (const l of lines) {
    if (l.length > 80 || MIAMI.test(l)) continue;
    const hit = CITIES.find((c) => c.pattern.test(l));
    if (hit) return hit.label;
  }
  return undefined;
}

const KNOWN_LANGUAGES =
  /^(english|spanish|español|espanol|portuguese|português|french|français|german|deutsch|italian|italiano|mandarin|chinese|cantonese|japanese|korean|hindi|arabic|russian|ukrainian|polish|hebrew|haitian creole|creole|kreyòl|dutch|turkish|vietnamese|tagalog|greek)$/i;
const PROFICIENCY = /proficiency|native|bilingual|elementary|fluent/i;

function languagesFrom(lines: string[]): string[] | undefined {
  const out: string[] = [];
  for (const l of lines) {
    const m = /^([\p{L} ]{2,30}?)\s*(?:\(([^)]*)\))?$/u.exec(l);
    if (!m) continue;
    const lang = clean(m[1]);
    // The sidebar can run straight into the name and headline, so only accept real languages.
    if (!KNOWN_LANGUAGES.test(lang) && !(m[2] && PROFICIENCY.test(m[2]))) continue;
    if (/^(spanish|español|espanol)$/i.test(lang)) {
      out.push(!m[2] || SPANISH_STRONG.test(m[2]) ? "Spanish" : "some Spanish");
    } else {
      out.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  }
  return out.length ? [...new Set(out)] : undefined;
}

/** Turns "Senior Backend Engineer" into the friendlier "Backend engineer" style used across the app. */
function roleLabel(title: string): string {
  const t = clean(title.replace(/\b(senior|sr\.?|junior|jr\.?|staff|principal|lead|ii+|iv)\b/gi, " "));
  if (!t) return title;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase().replace(/\b(ios|ai|ml|ui|ux|api|sre|qa)\b/g, (s) => s.toUpperCase());
}

export function extractProfileFields(input: string): ImportResult {
  const text = input.slice(0, MAX_TEXT_CHARS);
  const sections = splitSections(text);
  const experience = sections.get("Experience") ?? [];
  const summary = sections.get("Summary") ?? [];
  // Everything before Summary/Experience: the sidebar (contact, skills, languages…), then
  // name, headline and location. PDF text order runs the sidebar into the name, so we
  // search this block as a whole instead of trusting section boundaries.
  const header = ["header", "Contact", "Top Skills", "Skills", "Languages", "Certifications", "Honors-Awards", "Publications", "Patents"]
    .flatMap((k) => sections.get(k as Section) ?? [])
    .filter((l) => !/linkedin\.com|@|https?:|www\./i.test(l));
  // LinkedIn lists at most a handful of top skills; anything after is the next block.
  const topSkills = [...(sections.get("Top Skills") ?? []).slice(0, 5), ...(sections.get("Skills") ?? []).slice(0, 10)].filter(
    (l) => l.length <= 40 && !LOCATION_LINE.test(l) && !/\s(at|@)\s|\|/.test(l),
  );

  const title = currentTitle(experience) ?? headline(header);
  const years = yearsOfExperience(experience);

  // Skills: LinkedIn's own "Top Skills" first, then keywords found anywhere.
  const scanText = [title ?? "", ...topSkills, ...summary, ...experience, ...header].join("\n");
  const skillStacks: Stack[] = [];
  const keywordSkills: string[] = [];
  for (const k of SKILL_KEYWORDS) {
    if (k.pattern.test(scanText)) {
      keywordSkills.push(k.skill);
      skillStacks.push(...k.stacks);
    }
  }
  const skills = [...new Set([...topSkills, ...keywordSkills])].slice(0, 12);

  const stack = stackFrom(title, skillStacks);
  const seniority = seniorityFrom(title, years);
  // Profile location sits in the header; older roles' locations sit in Experience.
  const movedFrom = cityFrom(header) ?? cityFrom(experience);
  const languages = languagesFrom(sections.get("Languages") ?? []);

  const fields: ImportedFields = { skills };
  if (title) fields.role = roleLabel(title);
  if (stack) fields.stack = stack;
  if (seniority) fields.seniority = seniority;
  if (movedFrom) fields.movedFrom = movedFrom;
  if (languages) fields.languages = languages.includes("English") ? languages : ["English", ...languages];

  const found = [fields.role, fields.stack, fields.seniority, fields.movedFrom, fields.languages].filter(Boolean).length;
  const confidence = Math.round(((found / 5) * 0.8 + (skills.length ? 0.2 : 0)) * 100) / 100;

  return { fields, confidence, source: "heuristic" };
}

/**
 * Validates untrusted (LLM) output and merges it over the heuristic result.
 * Only known enum values and short strings survive; anything else keeps the heuristic value.
 */
export function mergeRefinement(base: ImportResult, raw: unknown): ImportResult {
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown, max = 60) => (typeof v === "string" && v.trim() && v.length <= max ? clean(v) : undefined);
  const fields: ImportedFields = { ...base.fields };

  const role = str(r.role);
  if (role) fields.role = role;
  if (typeof r.stack === "string" && (STACKS as readonly string[]).includes(r.stack)) fields.stack = r.stack as Stack;
  if (typeof r.seniority === "string" && (SENIORITIES as readonly string[]).includes(r.seniority)) {
    fields.seniority = r.seniority as Seniority;
  }
  const city = str(r.movedFrom);
  if (city && !MIAMI.test(city)) fields.movedFrom = CITIES.find((c) => c.pattern.test(city))?.label ?? city;
  if (Array.isArray(r.languages)) {
    const langs = r.languages.map((l) => str(l, 30)).filter((l): l is string => Boolean(l)).slice(0, 6);
    if (langs.length) fields.languages = langs;
  }
  if (Array.isArray(r.skills)) {
    const skills = r.skills.map((s) => str(s, 50)).filter((s): s is string => Boolean(s));
    if (skills.length) fields.skills = [...new Set([...skills, ...base.fields.skills])].slice(0, 12);
  }

  const found = [fields.role, fields.stack, fields.seniority, fields.movedFrom, fields.languages].filter(Boolean).length;
  const confidence = Math.round(Math.min(1, (found / 5) * 0.8 + (fields.skills.length ? 0.2 : 0)) * 100) / 100;
  return { fields, confidence, source: "llm" };
}

/** Built-in sample for demos: a LinkedIn "Save to PDF" export, as text. Fictional person. */
export const SAMPLE_LINKEDIN_TEXT = `Contact
www.linkedin.com/in/sample-engineer (LinkedIn)
Top Skills
Go
Distributed Systems
PostgreSQL
Languages
English (Native or Bilingual)
Spanish (Limited Working Proficiency)
Certifications
AWS Certified Solutions Architect – Associate
Sam Rivera
Senior Backend Engineer at Lumen Payments | Go, Kafka, Postgres
New York, New York, United States
Summary
Backend engineer who likes boring, reliable systems. I build payment APIs and
event pipelines in Go and Python, run them on AWS and Kubernetes, and mentor
junior engineers. Weekend tennis player.
Experience
Lumen Payments
Senior Backend Engineer
March 2021 - Present (4 years 7 months)
New York, New York, United States
Own the ledger service (Go, PostgreSQL, Kafka). Cut p99 latency 40%.
Brightside Health
Software Engineer II
June 2018 - February 2021 (2 years 9 months)
New York, New York, United States
Built REST APIs and microservices in Python and Node.js.
Page 1 of 2
Codepath Labs
Software Engineering Intern
June 2017 - August 2017 (3 months)
Boston, Massachusetts, United States
Education
Northeastern University
Bachelor of Science - BS, Computer Science · (2014 - 2018)
Page 2 of 2`;
