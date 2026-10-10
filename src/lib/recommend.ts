import { quests } from "@/data/quests";
import { levelOrder } from "./levels";
import type { LevelId, Profile, Quest } from "./types";

export interface Recommendation {
  quest: Quest;
  score: number;
  reasons: string[];
}

/**
 * Content-based recommender. Scores each quest against the profile and
 * explains why. The production version adds "engineers like you who stayed"
 * signals from check-in data; this is the cold-start baseline.
 */
export function recommend(profile: Profile, level: LevelId, limit = 3): Recommendation[] {
  const maxLevel = levelOrder.indexOf(level);

  return quests
    .filter((q) => !profile.completedQuests.includes(q.id))
    .filter((q) => levelOrder.indexOf(q.level) <= maxLevel)
    .map((quest) => {
      let score = 0;
      const reasons: string[] = [];

      const shared = quest.interests.filter((i) => profile.interests.includes(i));
      if (shared.length > 0) {
        score += 3 * shared.length;
        reasons.push(`You're into ${shared.join(" and ")}`);
      }
      if (quest.recurring) {
        score += 3;
        reasons.push("It repeats every week, so it can become a ritual");
      }
      if (quest.neighborhood === profile.livesIn) {
        score += 2;
        reasons.push(`It's in ${profile.livesIn}, close to home`);
      }
      if (!profile.hasCar && quest.carFree) score += 2;
      if (quest.timeMinutes / 60 <= profile.weekendHours) score += 1;
      if (profile.household === "alone" && quest.item === "community") score += 2;
      if (quest.level === level) score += 1;

      return { quest, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Pick one quest per welcome-package item so the plan stays balanced. */
export function welcomePackage(profile: Profile, level: LevelId): Recommendation[] {
  const all = recommend(profile, level, quests.length);
  const picked = new Map<string, Recommendation>();
  for (const rec of all) {
    if (!picked.has(rec.quest.item)) picked.set(rec.quest.item, rec);
  }
  return [...picked.values()];
}
