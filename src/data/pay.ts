/**
 * Pay benchmarks for Miami tech roles.
 *
 * ⚠️ ILLUSTRATIVE PLACEHOLDERS: every row has source "placeholder" until the
 * team replaces it with real data (e.g. BLS OEWS for the Miami MSA, Levels.fyi,
 * employer surveys). The UI must show an "Illustrative" badge for placeholder
 * rows. Replace values and set `source` + `sourceUrl` + `asOf` per row.
 */

export type Seniority = "junior" | "mid" | "senior" | "staff";

export type Stack = "backend" | "frontend" | "fullstack" | "data-ml" | "mobile" | "devops" | "security" | "product";

export interface PayBenchmark {
  stack: Stack;
  seniority: Seniority;
  /** Annual base salary in USD, local Miami employer. */
  miamiLocal: number;
  /** Annual base salary in USD, remote role held while living in Miami. */
  miamiRemote: number;
  /** Annual base salary in USD, same role in New York City, for comparison. */
  nyc: number;
  /** Annual base salary in USD, same role in Austin: the model city (got expensive, companies came, pay adjusted). */
  austin: number;
  source: "placeholder" | string;
  sourceUrl?: string;
  asOf?: string;
}

export const stackLabels: Record<Stack, string> = {
  backend: "Backend",
  frontend: "Frontend",
  fullstack: "Full-stack",
  "data-ml": "Data / ML",
  mobile: "Mobile",
  devops: "DevOps / Platform",
  security: "Security",
  product: "Product",
};

export const seniorityLabels: Record<Seniority, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff+",
};

const seniorityBase: Record<Seniority, number> = { junior: 85_000, mid: 115_000, senior: 150_000, staff: 190_000 };
const stackFactor: Record<Stack, number> = {
  backend: 1.0,
  frontend: 0.95,
  fullstack: 0.98,
  "data-ml": 1.1,
  mobile: 0.97,
  devops: 1.03,
  security: 1.05,
  product: 1.0,
};

/** Placeholder grid generated from simple factors. Replace with real rows. */
export const payBenchmarks: PayBenchmark[] = (Object.keys(stackFactor) as Stack[]).flatMap((stack) =>
  (Object.keys(seniorityBase) as Seniority[]).map((seniority) => {
    const base = Math.round((seniorityBase[seniority] * stackFactor[stack]) / 1000) * 1000;
    return {
      stack,
      seniority,
      miamiLocal: base,
      miamiRemote: Math.round((base * 1.15) / 1000) * 1000,
      nyc: Math.round((base * 1.3) / 1000) * 1000,
      austin: Math.round((base * 1.12) / 1000) * 1000,
      source: "placeholder",
    };
  }),
);

export function isIllustrative(b: PayBenchmark): boolean {
  return b.source === "placeholder";
}
