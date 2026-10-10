import { seniorityLabels, stackLabels, type Seniority, type Stack } from "@/data/pay";
import { benchmark, miamiPosition, negotiationRange } from "@/lib/pay-math";
import type { ChatMessage } from "./providers";

/**
 * Pana's negotiation practice: a role-play where Pana plays a hiring
 * manager, then switches to coach when the user types "coach me".
 * Safe to import on the client (type-only import from providers).
 */

export type Situation = "offer" | "raise" | "remote";
export type PracticeMode = "roleplay" | "coach";

export const situationLabels: Record<Situation, string> = {
  offer: "Negotiating a new offer",
  raise: "Asking for a raise",
  remote: "Considering a remote role",
};

export const situations = Object.keys(situationLabels) as Situation[];

export function isSituation(s: unknown): s is Situation {
  return typeof s === "string" && s in situationLabels;
}
export function isStack(s: unknown): s is Stack {
  return typeof s === "string" && s in stackLabels;
}
export function isSeniority(s: unknown): s is Seniority {
  return typeof s === "string" && s in seniorityLabels;
}

/** $156K style. */
export const usdK = (n: number) => `$${Math.round(n / 1000)}K`;

export interface NegotiationInput {
  stack: Stack;
  seniority: Seniority;
  situation: Situation;
  /** Current pay or offer, annual base USD. Optional. */
  current?: number;
}

/** True when the user asked Pana to step out of the role-play. */
export function wantsCoach(messages: ChatMessage[]): boolean {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return !!last && /coach\s*me/i.test(last.content);
}

/** The hiring manager's first line, shown in the UI before the user speaks. */
export function openingLine(situation: Situation): string {
  switch (situation) {
    case "offer":
      return "Thanks for coming in. We're excited about you, and I'd like to talk about the offer. What questions do you have about the package?";
    case "raise":
      return "Thanks for setting this up. You mentioned you wanted to talk about compensation. What's on your mind?";
    case "remote":
      return "Great to meet you. We're a remote-first team, and our pay bands depend on where you live. Since you're in Miami, let's talk about where you'd land.";
  }
}

function numbers(input: NegotiationInput) {
  const b = benchmark(input.stack, input.seniority);
  if (!b) throw new Error(`No benchmark for ${input.stack}/${input.seniority}`);
  const range = negotiationRange(b);
  const median = benchmark(input.stack, "mid")?.miamiLocal ?? b.miamiLocal;
  const p75 = benchmark(input.stack, "senior")?.miamiLocal ?? b.miamiLocal;
  const position = input.current ? miamiPosition(input.stack, input.current) : null;
  return { b, range, median, p75, position };
}

export function negotiationSystemPrompt(input: NegotiationInput, mode: PracticeMode): string {
  const { b, range, median, p75, position } = numbers(input);
  const role = `${seniorityLabels[input.seniority]} ${stackLabels[input.stack]} engineer`;
  const current = input.current
    ? `${usdK(input.current)} (about the ${position?.percentile}th percentile in Miami${
        position?.outOfRange === "below" ? ", below the 25th" : position?.outOfRange === "above" ? ", above the 90th" : ""
      })`
    : "not shared";

  const facts = `The user's numbers (annual base salary only, BLS OEWS May 2025 unless noted):
- Role: ${role}, living in Miami. Situation: ${situationLabels[input.situation]}.
- Their current pay or offer: ${current}.
- Miami market for this role and level: ${usdK(b.miamiLocal)} (walk-away).
- Miami median for this stack: ${usdK(median)}; Miami 75th percentile: ${usdK(p75)}.
- Austin pays ${usdK(b.austin)}; NYC pays ${usdK(b.nyc)}.
- Remote role held from Miami: about ${usdK(b.miamiRemote)} (an ESTIMATE, NYC x 0.85; say so if you use it).
- Miami costs 16% more than Austin overall and 29% more for housing (BEA Regional Price Parities 2024).
- Austin buying-power parity: ${usdK(range.anchor)} (anchor). Target: ${usdK(range.target)}.`;

  const rules = `Rules:
- Never invent company names, people, internal pay bands or statistics. Use only the numbers above. Refer to "our company" or "the team".
- Never promise or predict an outcome ("you'll get it"). This is practice, not financial or legal advice.
- Keep replies short: 2–4 sentences, plain text, no markdown headings.`;

  if (mode === "coach") {
    return `You are Pana, a warm Miami buddy on Rooted, stepping out of a salary negotiation role-play to coach the user.

Read the conversation so far (you played the hiring manager). Give exactly 2–3 concrete, numbered tips on how they did and what to say next, each tied to their numbers below. Quote a better line they could use. Be encouraging and honest. End with: "Say anything to jump back into the practice."

${facts}

${rules}`;
  }

  return `You are Pana, a warm Miami buddy on Rooted, role-playing a hiring manager so the user can practice negotiating pay. Stay in character as the manager.

The manager is friendly but firm: appreciative of the candidate, careful with budget. Push back at least once with a realistic objection ("that's above our band", "we don't negotiate base", "remote pay is set by location"). Concede only when the user gives a data-backed reason, and then only partly, or offer a non-salary lever (sign-on bonus, equity, learning budget, review date). The manager may know the Miami market numbers below but does not volunteer the user's anchor.
You already opened with: "${openingLine(input.situation)}"
If the user types "coach me", they want feedback instead (handled separately).

${facts}

${rules}`;
}

/** Parses the first dollar amount the user said, e.g. "$160K", "160k", "160,000". */
function amountIn(text: string): number | null {
  const m = text.match(/\$?\s?(\d{2,3}(?:,\d{3})+|\d{5,6}|\d{2,3}(?:\.\d)?\s?[kK])\b/);
  if (!m) return null;
  const raw = m[1].replace(/,/g, "").trim();
  const n = /k$/i.test(raw) ? parseFloat(raw) * 1000 : parseFloat(raw);
  return Number.isFinite(n) && n >= 20_000 ? n : null;
}

/**
 * Canned but sensible replies for mock mode (the shared mock in providers.ts
 * ignores the system prompt, so the negotiate route uses this instead).
 */
export function mockNegotiationReply(input: NegotiationInput, messages: ChatMessage[], mode: PracticeMode): string {
  const { b, range, median } = numbers(input);
  const userMsgs = messages.filter((m) => m.role === "user");
  const asked = userMsgs.map((m) => amountIn(m.content)).filter((n): n is number => n !== null);
  const lastAsk = asked.at(-1) ?? null;
  const mentionedData = userMsgs.some((m) => /bls|oews|austin|percentile|median|market|cost|bea|data/i.test(m.content));

  if (mode === "coach") {
    const tips: string[] = [];
    if (lastAsk === null) {
      tips.push(
        `Name a number first. Try: "Based on Austin buying power for this role, I'm looking for ${usdK(range.anchor)} in base."`,
      );
    } else if (lastAsk < range.target) {
      tips.push(
        `Your ask of ${usdK(lastAsk)} is below your target of ${usdK(range.target)}. Anchor higher, at ${usdK(range.anchor)}, so you have room to land on target.`,
      );
    } else {
      tips.push(`Good anchor at ${usdK(lastAsk)}. Now hold it: pause after you say it and let them respond first.`);
    }
    tips.push(
      mentionedData
        ? `Nice use of data. Keep the source short: "Miami's median for this role is ${usdK(median)} (BLS OEWS May 2025), and Miami costs 16% more than Austin."`
        : `Back your number with data: "Miami's median for this role is ${usdK(median)} (BLS OEWS May 2025), and Miami costs 16% more than Austin (BEA 2024)."`,
    );
    tips.push(
      `If they say it's above the band, don't drop your number. Ask: "If base is fixed, can we close the gap with a sign-on bonus or a level review in 6 months?" Your walk-away is ${usdK(range.walkAway)}, the Miami market rate.`,
    );
    return `Coach mode, pana 🤙\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nSay anything to jump back into the practice.`;
  }

  const turn = userMsgs.length;
  const band = input.situation === "remote" ? b.miamiRemote : b.miamiLocal;

  if (lastAsk !== null && asked.length === 1) {
    if (lastAsk > band) {
      return `I appreciate you being direct. ${usdK(lastAsk)} is above our band for this level, which tops out around ${usdK(band)}. What's behind that number?`;
    }
    return `${usdK(lastAsk)} is something we can work with. Before I take it back to the team, is base the only thing that matters to you here?`;
  }
  if (lastAsk !== null && mentionedData) {
    return `That's fair, and I hear you on Miami costs. I can't move base all the way to ${usdK(lastAsk)}, but I could ask about meeting you partway, plus a sign-on bonus. Would that work for you?`;
  }
  if (mentionedData) {
    return "You've done your homework, I'll give you that. Our bands are set company-wide, though. What number would make this a clear yes for you?";
  }
  if (turn <= 1) {
    return input.situation === "raise"
      ? "We value what you've done this year. Budgets are tight, though. What did you have in mind?"
      : "We think our offer is competitive for Miami. What number were you hoping for?";
  }
  return "I hear you. To take this to the team I need something concrete: a number, and why. Type \"coach me\" anytime if you want tips.";
}
