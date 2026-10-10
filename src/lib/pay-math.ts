import { payBenchmarks, type PayBenchmark, type Seniority, type Stack } from "@/data/pay";

/**
 * Shared pay math for the talent negotiation tool and the employer pay check,
 * so both sides always see the same numbers.
 *
 * Benchmarks map seniority to OEWS wage percentiles (see src/data/pay.ts):
 * junior = 25th, mid = 50th, senior = 75th, staff = 90th. That gives us four
 * points on the Miami wage distribution for each stack.
 */

const percentileOf: Record<Seniority, number> = { junior: 25, mid: 50, senior: 75, staff: 90 };

export function benchmark(stack: Stack, seniority: Seniority): PayBenchmark | undefined {
  return payBenchmarks.find((b) => b.stack === stack && b.seniority === seniority);
}

/** Miami wage distribution for a stack as [percentile, wage] points, ascending. */
function miamiCurve(stack: Stack): [number, number][] {
  return payBenchmarks
    .filter((b) => b.stack === stack)
    .map((b) => [percentileOf[b.seniority], b.miamiLocal] as [number, number])
    .sort((a, b) => a[0] - b[0]);
}

export interface Position {
  /** Estimated percentile (25–90) among Miami workers in this occupation. */
  percentile: number;
  /** True when the salary is below the 25th or above the 90th percentile. */
  outOfRange: "below" | "above" | null;
}

/** Where a salary sits among Miami wages for this stack (linear interpolation). */
export function miamiPosition(stack: Stack, salary: number): Position {
  const curve = miamiCurve(stack);
  if (salary <= curve[0][1]) return { percentile: curve[0][0], outOfRange: salary < curve[0][1] ? "below" : null };
  const last = curve[curve.length - 1];
  if (salary >= last[1]) return { percentile: last[0], outOfRange: salary > last[1] ? "above" : null };
  for (let i = 1; i < curve.length; i++) {
    const [p0, w0] = curve[i - 1];
    const [p1, w1] = curve[i];
    if (salary <= w1) return { percentile: Math.round(p0 + ((salary - w0) / (w1 - w0)) * (p1 - p0)), outOfRange: null };
  }
  return { percentile: last[0], outOfRange: null };
}

export interface NegotiationRange {
  /** Walk-away: the Miami market rate for this role and level. */
  walkAway: number;
  /** Target: the midpoint between the market rate and Austin buying-power parity. */
  target: number;
  /** Anchor: Austin buying-power parity (or Austin pay if higher). */
  anchor: number;
}

const round = (n: number) => Math.round(n / 1000) * 1000;

/**
 * A data-backed range for one role. Anchor high at the pay that matches
 * Austin's buying power, target the midpoint, never accept below market.
 */
export function negotiationRange(b: PayBenchmark): NegotiationRange {
  const parity = Math.max(b.miamiTarget ?? b.austin, b.austin);
  return {
    walkAway: b.miamiLocal,
    target: round((b.miamiLocal + parity) / 2),
    anchor: round(parity),
  };
}

export type CompetitivenessRisk = "high" | "medium" | "low";

/**
 * How exposed an employer's pay is to losing engineers to Austin or remote
 * roles. Below Miami market: high. Below Austin parity: medium. Otherwise low.
 */
export function competitiveness(b: PayBenchmark, offered: number): { risk: CompetitivenessRisk; gapToParity: number } {
  const parity = Math.max(b.miamiTarget ?? b.austin, b.austin);
  const gapToParity = Math.max(0, parity - offered);
  const risk: CompetitivenessRisk = offered < b.miamiLocal ? "high" : offered < parity ? "medium" : "low";
  return { risk, gapToParity };
}
