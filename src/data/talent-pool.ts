import type { Seniority, Stack } from "@/data/pay";
import type { LevelId, Neighborhood } from "@/lib/types";

/**
 * SIMULATED DATA. Not real people, not real results.
 *
 * ~400 synthetic engineers in the Rooted community, generated deterministically
 * (seeded PRNG, no Math.random) so the company page and the city dashboard can
 * show the *talent signal* Rooted would provide to companies considering Miami.
 *
 * Trust rule (docs/concept.md): engineers opt in to being visible. In
 * production the company side only ever receives aggregates (see
 * src/lib/talent.ts) or opted-in profiles; `openTo` for engineers who have not
 * opted in never leaves the backend except inside suppressed aggregates, and
 * wellbeing / intent-to-stay check-ins are never part of this record at all.
 */

export const TALENT_SEED = 3051990;
export const TALENT_POOL_SIZE = 400;

export type OpenTo = "not-looking" | "open" | "actively-looking";

export type Language = "English" | "Spanish" | "Portuguese" | "Haitian Creole" | "French";

export interface TalentProfile {
  id: string;
  stack: Stack;
  seniority: Seniority;
  /** Years living in Miami (one decimal). */
  yearsInMiami: number;
  level: LevelId;
  neighborhood: Exclude<Neighborhood, "Citywide">;
  openTo: OpenTo;
  /** Engineer chose to be visible to companies. Default is off. */
  optedInVisible: boolean;
  mentorsStudents: boolean;
  languages: Language[];
  /* Skills signals: Rooted engineers keep upskilling here. */
  /** Completed at least one hands-on AI build training through Rooted. */
  aiTrained: boolean;
  /** Miami hackathons joined. */
  hackathons: number;
  /** Projects shipped to real users (hackathon builds that went live, side projects, OSS). */
  shippedProjects: number;
}

/* ---------- seeded PRNG (mulberry32) ---------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

function weighted<T extends string>(rng: Rng, weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = rng() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r < 0) return k;
  }
  return entries[entries.length - 1][0];
}

const between = (rng: Rng, lo: number, hi: number) => lo + rng() * (hi - lo);

/* ---------- distributions (plausible, not measured) ---------- */

const stackWeights: Record<Stack, number> = {
  backend: 20,
  fullstack: 20,
  frontend: 14,
  "data-ml": 12,
  devops: 10,
  product: 10,
  mobile: 8,
  security: 6,
};

const seniorityWeights: Record<Seniority, number> = { junior: 20, mid: 35, senior: 32, staff: 13 };

const levelWeights: Record<LevelId, number> = { seed: 20, sprout: 30, rooted: 32, grove: 18 };

/** Years in Miami range by level: the level marks real milestones, which take time. */
const yearsByLevel: Record<LevelId, [number, number]> = {
  seed: [0.1, 1],
  sprout: [0.5, 2],
  rooted: [1.5, 5],
  grove: [3, 15],
};

const mentorRate: Record<LevelId, number> = { seed: 0.08, sprout: 0.25, rooted: 0.45, grove: 0.6 };

const openToWeights: Record<OpenTo, number> = { "not-looking": 62, open: 28, "actively-looking": 10 };

const neighborhoodWeights: Record<TalentProfile["neighborhood"], number> = {
  Brickell: 18,
  Downtown: 10,
  Wynwood: 9,
  Edgewater: 9,
  "Little Havana": 6,
  "Little Haiti": 4,
  "Coconut Grove": 8,
  "Coral Gables": 12,
  "Key Biscayne": 3,
  "Miami Beach": 11,
  Doral: 10,
};

function makeProfile(rng: Rng, i: number): TalentProfile {
  const stack = weighted(rng, stackWeights);
  let seniority = weighted(rng, seniorityWeights);
  // Product roles skew senior; there are few junior PMs in the pool.
  if (stack === "product" && seniority === "junior" && rng() < 0.6) seniority = "mid";

  const level = weighted(rng, levelWeights);
  const [lo, hi] = yearsByLevel[level];
  const yearsInMiami = Math.round(between(rng, lo, hi) * 10) / 10;

  const openTo = weighted(rng, openToWeights);
  // Opt-in is the engineer's choice. Most visible profiles are people open to
  // opportunities; a few not-looking engineers stay visible for community
  // presence (tech talks, mentoring), never as a recruiting default.
  const optedInVisible = openTo === "not-looking" ? rng() < 0.05 : rng() < (openTo === "actively-looking" ? 0.85 : 0.65);

  const languages: Language[] = ["English"];
  if (rng() < 0.46) languages.push("Spanish");
  if (rng() < 0.08) languages.push("Portuguese");
  if (rng() < 0.05) languages.push("Haitian Creole");
  if (rng() < 0.04) languages.push("French");

  // Engagement with community skills events grows with level.
  const engaged = { seed: 0.3, sprout: 0.5, rooted: 0.65, grove: 0.75 }[level];
  const aiTrained = rng() < engaged * 0.75;
  const hackathons = rng() < engaged ? 1 + Math.floor(rng() * (level === "grove" ? 6 : 4)) : 0;
  const shippedProjects = hackathons > 0 && rng() < 0.55 ? 1 + Math.floor(rng() * 3) : rng() < 0.15 ? 1 : 0;

  return {
    id: `t${String(i + 1).padStart(3, "0")}`,
    stack,
    seniority,
    yearsInMiami,
    level,
    neighborhood: weighted(rng, neighborhoodWeights),
    openTo,
    optedInVisible,
    mentorsStudents: rng() < mentorRate[level],
    languages,
    aiTrained,
    hackathons,
    shippedProjects,
  };
}

export function generateTalentPool(seed = TALENT_SEED, n = TALENT_POOL_SIZE): TalentProfile[] {
  const rng = mulberry32(seed);
  return Array.from({ length: n }, (_, i) => makeProfile(rng, i));
}

/** The simulated pool. Later: replaced by GET /api/talent/aggregates (aggregates only). */
export const talentPool: TalentProfile[] = generateTalentPool();
