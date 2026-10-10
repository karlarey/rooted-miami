import type { Seniority, Stack } from "@/data/pay";
import { talentCards, type TalentCard } from "@/data/talent-visibility";
import type { WorkMode } from "@/lib/sharing";

export interface TalentQuery {
  stack?: Stack | "all";
  seniority?: Seniority | "all";
  skills?: string[];
  workMode?: WorkMode | "all";
  neighborhood?: string | "all";
}

export interface ScoredCard extends TalentCard {
  /** Requested skills this engineer shared. Used to explain the match. */
  matchedSkills: string[];
}

/** Hard filters on stack, seniority, work mode, neighborhood; skills rank (any match), so a search never comes back empty for one missing skill. */
export function searchTalent(q: TalentQuery, cards: TalentCard[] = talentCards): ScoredCard[] {
  const wanted = (q.skills ?? []).map((s) => s.toLowerCase());
  return cards
    .filter(
      (c) =>
        (!q.stack || q.stack === "all" || c.stack === q.stack) &&
        (!q.seniority || q.seniority === "all" || c.seniority === q.seniority) &&
        (!q.workMode || q.workMode === "all" || c.workModes.includes(q.workMode)) &&
        (!q.neighborhood || q.neighborhood === "all" || c.neighborhood === q.neighborhood),
    )
    .map((c) => ({ ...c, matchedSkills: c.skills.filter((s) => wanted.includes(s.toLowerCase())) }))
    .filter((c) => !wanted.length || c.matchedSkills.length > 0)
    .sort(
      (a, b) =>
        b.matchedSkills.length - a.matchedSkills.length ||
        b.yearsInMiami - a.yearsInMiami ||
        a.engineerId.localeCompare(b.engineerId),
    );
}
