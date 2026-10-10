import type { Seniority, Stack } from "@/data/pay";
import type { TalentProfile } from "@/data/talent-pool";

/**
 * Pure aggregate functions behind the talent signal (company page + city
 * dashboard). Input: talent records. Output: plain numbers. No I/O, no
 * randomness, so the backend can run the same logic server-side and return
 * only aggregates to the company side.
 *
 * Trust rule: companies see counts of rooted engineers and counts of engineers
 * who are BOTH open to opportunities AND opted in to being visible. They never
 * see "open but not opted in" on its own, and small cells are suppressed so an
 * aggregate can't point at one person.
 */

export const stackOrder: Stack[] = ["backend", "fullstack", "frontend", "data-ml", "devops", "mobile", "security", "product"];
export const seniorityOrder: Seniority[] = ["junior", "mid", "senior", "staff"];

/** Cells with fewer engineers than this are shown as "<5" on the company side. */
export const MIN_CELL = 5;

const pct = (num: number, den: number) => (den ? num / den : 0);

export const isOpen = (t: TalentProfile) => t.openTo !== "not-looking";
/** The only "availability" companies ever see: open AND chose to be visible. */
export const isOpenAndVisible = (t: TalentProfile) => isOpen(t) && t.optedInVisible;
export const isRootedOrGrove = (t: TalentProfile) => t.level === "rooted" || t.level === "grove";
export const isBilingual = (t: TalentProfile) => t.languages.length >= 2;

export interface TalentFilter {
  stack?: Stack | "all";
  seniority?: Seniority | "all";
  /** Only engineers who completed a hands-on AI build training. */
  aiTrained?: boolean;
}

export function filterTalent(pool: TalentProfile[], f: TalentFilter = {}): TalentProfile[] {
  return pool.filter(
    (t) =>
      (!f.stack || f.stack === "all" || t.stack === f.stack) &&
      (!f.seniority || f.seniority === "all" || t.seniority === f.seniority) &&
      (!f.aiTrained || t.aiTrained),
  );
}

export interface TalentCell {
  /** Rooted engineers in this cell. */
  total: number;
  /** Open to opportunities AND opted in to being visible. */
  openVisible: number;
}

export type TalentGrid = Record<Stack, Record<Seniority, TalentCell>>;

/** Counts by stack × seniority. */
export function countsByStackSeniority(pool: TalentProfile[]): TalentGrid {
  const grid = Object.fromEntries(
    stackOrder.map((s) => [s, Object.fromEntries(seniorityOrder.map((l) => [l, { total: 0, openVisible: 0 }]))]),
  ) as TalentGrid;
  for (const t of pool) {
    const cell = grid[t.stack][t.seniority];
    cell.total++;
    if (isOpenAndVisible(t)) cell.openVisible++;
  }
  return grid;
}

/** Counts by stack only (summed across seniority). */
export function countsByStack(pool: TalentProfile[]): { stack: Stack; total: number; openVisible: number }[] {
  const grid = countsByStackSeniority(pool);
  return stackOrder.map((stack) => {
    const cells = seniorityOrder.map((l) => grid[stack][l]);
    return {
      stack,
      total: cells.reduce((a, c) => a + c.total, 0),
      openVisible: cells.reduce((a, c) => a + c.openVisible, 0),
    };
  });
}

/** Counts by seniority only (summed across stack). */
export function countsBySeniority(pool: TalentProfile[]): { seniority: Seniority; total: number; openVisible: number }[] {
  return seniorityOrder.map((seniority) => {
    const xs = pool.filter((t) => t.seniority === seniority);
    return { seniority, total: xs.length, openVisible: xs.filter(isOpenAndVisible).length };
  });
}

export function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export interface TalentSummary {
  total: number;
  /** Open to opportunities AND opted in. */
  openVisible: number;
  openVisibleShare: number;
  /** Share at Rooted or Grove level (embedded in community for a while). */
  rootedOrGroveShare: number;
  /** Share opted in to being visible to companies (any availability). */
  optedInShare: number;
  bilingualShare: number;
  mentoringShare: number;
  medianYearsInMiami: number;
  /* Skills signals */
  aiTrainedShare: number;
  /** Total hackathon projects (sum of hackathons joined). */
  hackathonProjects: number;
  /** Engineers with at least one shipped project. */
  withShippedProjects: number;
  withShippedProjectsShare: number;
}

export function talentSummary(pool: TalentProfile[]): TalentSummary {
  const n = pool.length;
  const openVisible = pool.filter(isOpenAndVisible).length;
  return {
    total: n,
    openVisible,
    openVisibleShare: pct(openVisible, n),
    rootedOrGroveShare: pct(pool.filter(isRootedOrGrove).length, n),
    optedInShare: pct(pool.filter((t) => t.optedInVisible).length, n),
    bilingualShare: pct(pool.filter(isBilingual).length, n),
    mentoringShare: pct(pool.filter((t) => t.mentorsStudents).length, n),
    medianYearsInMiami: median(pool.map((t) => t.yearsInMiami)),
    aiTrainedShare: pct(pool.filter((t) => t.aiTrained).length, n),
    hackathonProjects: pool.reduce((a, t) => a + t.hackathons, 0),
    withShippedProjects: pool.filter((t) => t.shippedProjects > 0).length,
    withShippedProjectsShare: pct(pool.filter((t) => t.shippedProjects > 0).length, n),
  };
}

/** Company-side display of a count: small non-zero cells are suppressed. */
export function displayCount(n: number): string {
  return n > 0 && n < MIN_CELL ? `<${MIN_CELL}` : String(n);
}
