import { seniorityLabels, stackLabels, type PayBenchmark } from "@/data/pay";
import { benchmark, miamiPosition, negotiationRange, type NegotiationRange, type Position } from "@/lib/pay-math";
import { usdK, type NegotiationInput, type Situation } from "@/lib/pana/negotiation";

/** Everything the results panel needs, derived from the shared pay math. */
export interface Analysis {
  b: PayBenchmark;
  range: NegotiationRange;
  median: number;
  p75: number;
  position: Position | null;
  role: string;
}

export function analyze(input: NegotiationInput): Analysis | null {
  const b = benchmark(input.stack, input.seniority);
  if (!b) return null;
  return {
    b,
    range: negotiationRange(b),
    median: benchmark(input.stack, "mid")?.miamiLocal ?? b.miamiLocal,
    p75: benchmark(input.stack, "senior")?.miamiLocal ?? b.miamiLocal,
    position: input.current ? miamiPosition(input.stack, input.current) : null,
    role: `${seniorityLabels[input.seniority]} ${stackLabels[input.stack]}`,
  };
}

export const SOURCES = {
  oews: { label: "BLS OEWS May 2025", url: "https://www.bls.gov/oes/tables.htm" },
  rpp: { label: "BEA Regional Price Parities 2024", url: "https://apps.bea.gov/regional/zip/MARPP.zip" },
  pums: { label: "Census ACS PUMS 2023–24", url: "https://www2.census.gov/programs-surveys/acs/data/pums/" },
  estimate: { label: "Rooted estimate (NYC × 0.85, no public source)", url: undefined },
  research: { label: "Rooted research: pay and migration", url: undefined },
} as const;

export type SourceKey = keyof typeof SOURCES;

export function positionMeaning(p: Position): string {
  if (p.outOfRange === "below") return "Below the 25th percentile: more than 3 in 4 Miami workers in this occupation earn more. You have strong grounds to ask.";
  if (p.outOfRange === "above") return "Above the 90th percentile: you already out-earn 9 in 10 Miami peers. Focus on levers beyond base.";
  if (p.percentile < 40) return `About ${100 - p.percentile} in 100 Miami peers earn more than this. There's clear room to move up.`;
  if (p.percentile <= 60) return "Right around the Miami middle. Fair for Miami, but below what Austin's buying power implies.";
  if (p.percentile < 75) return "Above the Miami median. Retention research says employers should benchmark to the 75th percentile, so you can still push.";
  return `Higher than about ${p.percentile} in 100 Miami peers. You're near the top of the local market.`;
}

export interface TalkingPoint {
  text: string;
  source: SourceKey;
}

export function talkingPoints(a: Analysis, situation: Situation, current?: number): TalkingPoint[] {
  const { b, range, median, p75, position, role } = a;
  const points: TalkingPoint[] = [
    { text: `Miami's median base pay for this occupation is ${usdK(median)}; the 75th percentile is ${usdK(p75)}.`, source: "oews" },
    { text: `For a ${role} engineer, Miami pays about ${usdK(b.miamiLocal)}, Austin ${usdK(b.austin)} and New York ${usdK(b.nyc)}.`, source: "oews" },
    { text: "Miami costs 16% more than Austin overall, and 29% more for housing.", source: "rpp" },
    { text: `Matching Austin's buying power for this role takes about ${usdK(range.anchor)} in Miami (Austin pay × 1.164).`, source: "rpp" },
    { text: "Tech workers who leave Miami earn more than those who stay ($86.5K vs $82K median), so pay is a retention issue, not just a cost.", source: "pums" },
  ];
  if (position && current) {
    points.unshift({
      text: `${usdK(current)} sits around the ${position.percentile}th percentile for this occupation in Miami.`,
      source: "oews",
    });
  }
  if (situation === "remote") {
    points.push({ text: `Remote roles held from Miami typically pay around ${usdK(b.miamiRemote)} for this level (estimate).`, source: "estimate" });
  }
  return points;
}

export interface ScriptStep {
  label: string;
  line: string;
}

export function script(a: Analysis, situation: Situation, current?: number): ScriptStep[] {
  const { b, range, median, role } = a;
  const opening: Record<Situation, string> = {
    offer: `"Thank you, I'm excited about this role and the team. Before I accept, I'd like to talk about base pay."`,
    raise: `"I've enjoyed growing here and I want to keep building my career in Miami. I'd like to talk about my compensation${current ? `, which is ${usdK(current)} today` : ""}."`,
    remote: `"I'm excited about this role. I live in Miami, and I'd like to make sure the location band reflects Miami's real costs."`,
  };
  const anchorBasis =
    situation === "remote"
      ? `Remote ${role} roles from Miami land around ${usdK(b.miamiRemote)}, and Miami costs 16% more than Austin`
      : `Miami's median for this role is ${usdK(median)} (BLS OEWS May 2025), and Miami costs 16% more than Austin (BEA 2024)`;
  return [
    { label: "Opening", line: opening[situation] },
    {
      label: "Anchor",
      line: `"${anchorBasis}. Matching Austin's buying power for this role is about ${usdK(range.anchor)}, so I'm looking for a base of ${usdK(range.anchor)}."`,
    },
    {
      label: `If they say "that's above our band"`,
      line: `"I understand bands are set company-wide. Could we get to ${usdK(range.target)} in base, or close the gap with a sign-on bonus and a level review in six months?"`,
    },
    {
      label: "Close",
      line: `"If we can get to ${usdK(range.target)}, I'm ready to say yes${situation === "raise" ? " and keep growing here" : " today"}. Can you send that in writing?"`,
    },
  ];
}

export interface Lever {
  title: string;
  detail: string;
}

export function levers(a: Analysis): Lever[] {
  const gap = Math.max(0, a.range.target - a.b.miamiLocal);
  return [
    {
      title: "Sign-on bonus",
      detail: `A one-time bonus can bridge a base gap${gap ? ` (about ${usdK(gap)} between market and target)` : ""} without changing their bands.`,
    },
    { title: "Equity", detail: "Ask for the grant size, vesting schedule and the latest valuation, not just the share count." },
    { title: "Remote days", detail: "Fewer commute days is worth real money in Miami traffic. Ask for it in writing." },
    {
      title: "Learning budget",
      detail: "Ask for a yearly budget for AI trainings, certifications and conferences. Easy to approve, and it grows your next number.",
    },
    {
      title: "Relocation or housing stipend",
      detail:
        "Housing costs 29% more in Miami than Austin. Our research shows a housing stipend can cost an employer less than raising base pay for everyone, so it's often easier to say yes to.",
    },
    {
      title: "Title and level review date",
      detail: "If base is stuck, get a review date (for example 6 months) and the criteria for the next level in writing.",
    },
  ];
}
