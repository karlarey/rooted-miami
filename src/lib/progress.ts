import { quests } from "@/data/quests";
import type { CheckIn, LevelId } from "./types";

/**
 * Level rules (demo version of the milestones in docs/concept.md):
 * Sprout: 3+ quests incl. a recurring community ritual.
 * Rooted: 6+ quests incl. a purpose quest.
 * Grove:  a grove quest (hosting, welcoming, hiring a mentee).
 */
export function levelFor(completed: string[]): LevelId {
  const done = quests.filter((q) => completed.includes(q.id));
  const hasRitual = done.some((q) => q.item === "community" && q.recurring);
  const hasPurpose = done.some((q) => q.item === "purpose");
  const hasGrove = done.some((q) => q.level === "grove");

  if (hasGrove && hasPurpose && done.length >= 7) return "grove";
  if (hasPurpose && hasRitual && done.length >= 6) return "rooted";
  if (hasRitual && done.length >= 3) return "sprout";
  return "seed";
}

/** What's still needed to reach the next level, in plain language. */
export function nextSteps(completed: string[]): string[] {
  const done = quests.filter((q) => completed.includes(q.id));
  const level = levelFor(completed);
  const hasRitual = done.some((q) => q.item === "community" && q.recurring);
  const hasPurpose = done.some((q) => q.item === "purpose");
  const steps: string[] = [];

  if (level === "seed") {
    if (!hasRitual) steps.push("Start a weekly ritual");
    if (done.length < 3) steps.push(`Complete ${3 - done.length} more quest${3 - done.length > 1 ? "s" : ""}`);
  } else if (level === "sprout") {
    if (!hasPurpose) steps.push("Take on a purpose quest: mentor or volunteer");
    if (done.length < 6) steps.push(`Complete ${6 - done.length} more quest${6 - done.length > 1 ? "s" : ""}`);
  } else if (level === "rooted") {
    steps.push("Welcome a newcomer, host, or start your own ritual");
  }
  return steps;
}

/**
 * Demo check-in arc: a check-in is recorded each time Alex levels up.
 * In production these come from El Pana's monthly 5-question check-in.
 */
const arc: Record<LevelId, Omit<CheckIn, "month">> = {
  seed: { intentToStay: 4, lifeSatisfaction: 5, peopleOutsideWork: 0, belonging: 1, miamian: "no" },
  sprout: { intentToStay: 6, lifeSatisfaction: 6, peopleOutsideWork: 2, belonging: 2, miamian: "not-yet" },
  rooted: { intentToStay: 8, lifeSatisfaction: 8, peopleOutsideWork: 5, belonging: 4, miamian: "yes" },
  grove: { intentToStay: 9, lifeSatisfaction: 8, peopleOutsideWork: 8, belonging: 5, miamian: "yes" },
};

export function checkInFor(level: LevelId, month: number): CheckIn {
  return { month, ...arc[level] };
}
