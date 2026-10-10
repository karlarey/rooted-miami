/**
 * Pay benchmarks for Miami tech roles.
 *
 * Source: BLS Occupational Employment and Wage Statistics (OEWS), May 2025, metro areas:
 * Miami-Fort Lauderdale-West Palm Beach (33100), Austin-Round Rock-San Marcos (12420),
 * New York-Newark-Jersey City (35620). Annual base wages only (no bonus or equity).
 *
 * OEWS has no seniority levels, so we map them to wage percentiles:
 * junior = 25th, mid = median, senior = 75th, staff+ = 90th.
 * Stacks map to the nearest SOC occupation (see `stackSoc`).
 *
 * `miamiTarget` is the Miami pay that matches Austin's purchasing power:
 * Austin wage x (Miami RPP / Austin RPP), BEA Regional Price Parities 2024 (114.155 / 98.066).
 * Neither Florida nor Texas has a state income tax, so the comparison holds after tax.
 *
 * `miamiRemote` has no public source; it is an estimate (NYC wage x 0.85, a typical
 * "tier 2" geo pay band). The UI should label it as an estimate.
 * See docs/research/pay-and-migration.md.
 */

export type Seniority = "junior" | "mid" | "senior" | "staff";

export type Stack = "backend" | "frontend" | "fullstack" | "data-ml" | "mobile" | "devops" | "security" | "product";

export interface PayBenchmark {
  stack: Stack;
  seniority: Seniority;
  /** Annual base salary in USD, local Miami employer. */
  miamiLocal: number;
  /** Annual base salary in USD, remote role held while living in Miami. Estimate. */
  miamiRemote: number;
  /** Annual base salary in USD, same role in New York City, for comparison. */
  nyc: number;
  /** Annual base salary in USD, same role in Austin, the top destination for engineers leaving Miami. */
  austin: number;
  /** Miami pay needed to match Austin's purchasing power (Austin x cost-of-living ratio). */
  miamiTarget?: number;
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

/** Miami RPP / Austin RPP, BEA 2024. */
export const MIAMI_VS_AUSTIN_COST = 114.155 / 98.066;

/** Nearest SOC occupation per stack. Web developers are suppressed for Miami, so frontend uses software developers. */
const stackSoc: Record<Stack, string> = {
  backend: "15-1252",
  frontend: "15-1252",
  fullstack: "15-1252",
  mobile: "15-1252",
  devops: "15-1252",
  "data-ml": "15-2051",
  security: "15-1212",
  product: "11-3021",
};

type Percentiles = Record<Seniority, number>;

/** OEWS May 2025 annual wages: 25th, median, 75th, 90th percentile. */
const oews: Record<string, { mia: Percentiles; aus: Percentiles; nyc: Percentiles }> = {
  // Software Developers
  "15-1252": {
    mia: { junior: 102_710, mid: 132_650, senior: 165_710, staff: 199_280 },
    aus: { junior: 104_000, mid: 134_120, senior: 168_730, staff: 209_890 },
    nyc: { junior: 130_650, mid: 166_830, senior: 205_970, staff: 224_590 },
  },
  // Data Scientists
  "15-2051": {
    mia: { junior: 85_840, mid: 127_450, senior: 154_890, staff: 199_130 },
    aus: { junior: 85_780, mid: 127_360, senior: 161_560, staff: 186_010 },
    nyc: { junior: 101_320, mid: 135_980, senior: 173_160, staff: 216_030 },
  },
  // Information Security Analysts
  "15-1212": {
    mia: { junior: 91_270, mid: 125_310, senior: 149_490, staff: 170_690 },
    aus: { junior: 102_860, mid: 134_100, senior: 162_800, staff: 186_680 },
    nyc: { junior: 107_810, mid: 140_470, senior: 175_710, staff: 216_280 },
  },
  // Computer and Information Systems Managers
  "11-3021": {
    mia: { junior: 128_390, mid: 169_600, senior: 210_860, staff: 277_400 },
    aus: { junior: 142_850, mid: 176_990, senior: 220_450, staff: 291_790 },
    nyc: { junior: 171_950, mid: 215_300, senior: 285_570, staff: 322_410 },
  },
};

const round = (n: number) => Math.round(n / 1000) * 1000;

export const payBenchmarks: PayBenchmark[] = (Object.keys(stackSoc) as Stack[]).flatMap((stack) =>
  (Object.keys(seniorityLabels) as Seniority[]).map((seniority) => {
    const w = oews[stackSoc[stack]];
    return {
      stack,
      seniority,
      miamiLocal: round(w.mia[seniority]),
      miamiRemote: round(w.nyc[seniority] * 0.85),
      nyc: round(w.nyc[seniority]),
      austin: round(w.aus[seniority]),
      miamiTarget: round(w.aus[seniority] * MIAMI_VS_AUSTIN_COST),
      source: "BLS OEWS May 2025 (remote row estimated)",
      sourceUrl: "https://www.bls.gov/oes/tables.htm",
      asOf: "2025-05",
    };
  }),
);

export function isIllustrative(b: PayBenchmark): boolean {
  return b.source === "placeholder";
}
