import { quests } from "@/data/quests";
import { syntheticMembers, type SyntheticMember } from "@/data/synthetic-members";
import type { Profile, Quest } from "./types";

/**
 * "People like you": collaborative recommendations from members similar to
 * the engineer, based on what Pana knows about them (profile + completed
 * quests). Only members who STAYED count, so we learn what keeps people here.
 *
 * Members are simulated (src/data/synthetic-members.ts) until real check-in
 * data exists; the UI must say so.
 */

export interface LikeMindedPick {
  quest: Quest;
  /** How many similar members who stayed did this quest. */
  peers: number;
  /** Plain-language reason, e.g. "4 engineers like you (NYC, Brickell) who stayed did this". */
  reason: string;
}

function similarity(me: Profile, m: SyntheticMember["profile"]): number {
  let score = 0;
  const shared = m.interests.filter((i) => me.interests.includes(i)).length;
  score += shared * 2;
  if (m.movedFrom === me.movedFrom) score += 3;
  if (m.livesIn === me.livesIn) score += 2;
  if (m.worksFrom === me.worksFrom) score += 1;
  if (m.household === me.household) score += 1;
  if (me.stack && m.stack === me.stack) score += 1;
  const doneTogether = m.completedQuests.filter((q) => me.completedQuests.includes(q)).length;
  score += doneTogether;
  return score;
}

function describe(me: Profile): string {
  const bits = [me.movedFrom.replace("New York City", "NYC"), me.livesIn].filter(Boolean);
  return bits.join(", ");
}

export function likeMinded(me: Profile, limit = 3, cohortSize = 25): LikeMindedPick[] {
  const cohort = syntheticMembers
    .filter((m) => m.leftMonth === undefined)
    .map((m) => ({ m, s: similarity(me, m.profile) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, cohortSize)
    .map(({ m }) => m);

  const counts = new Map<string, number>();
  for (const m of cohort) {
    for (const id of m.profile.completedQuests) {
      if (!me.completedQuests.includes(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  const who = describe(me);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, peers]) => ({ quest: quests.find((q) => q.id === id), peers }))
    .filter((x): x is { quest: Quest; peers: number } => Boolean(x.quest) && x.peers >= 2)
    .slice(0, limit)
    .map(({ quest, peers }) => ({
      quest,
      peers,
      reason: `${peers} people like you${who ? ` (${who})` : ""} who stayed did this`,
    }));
}
