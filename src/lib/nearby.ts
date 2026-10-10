import { syntheticMembers } from "@/data/synthetic-members";
import { levels } from "./levels";
import type { Interest, Neighborhood, Profile } from "./types";

/**
 * Engineers near you: fellow members who opted in to meet other engineers,
 * close by and with things in common. Simulated members until real accounts
 * opt in; the UI must say so. Reciprocal: you only see others once you're
 * findable yourself.
 */

const near: Partial<Record<Neighborhood, Neighborhood[]>> = {
  Brickell: ["Downtown", "Little Havana", "Key Biscayne", "Edgewater"],
  Downtown: ["Brickell", "Edgewater", "Wynwood"],
  Edgewater: ["Wynwood", "Downtown", "Little Haiti"],
  Wynwood: ["Edgewater", "Little Haiti", "Downtown"],
  "Little Havana": ["Brickell", "Coral Gables"],
  "Little Haiti": ["Wynwood", "Edgewater"],
  "Coconut Grove": ["Coral Gables", "Brickell"],
  "Coral Gables": ["Coconut Grove", "Little Havana"],
  "Key Biscayne": ["Brickell"],
};

const interestLabel: Partial<Record<Interest, string>> = {
  "team-sports": "team sports",
  "community-service": "volunteering",
  racket: "racket sports",
};

export interface NearbyEngineer {
  id: string;
  firstName: string;
  neighborhood: Neighborhood;
  movedFrom: string;
  level: string;
  shared: string[];
  distance: "same neighborhood" | "next door";
  /** One line Pana uses to introduce them. */
  why: string;
}

export function nearbyEngineers(me: Profile, limit = 4): NearbyEngineer[] {
  const close = new Set([me.livesIn, ...(near[me.livesIn] ?? [])]);
  return syntheticMembers
    .filter((m) => m.leftMonth === undefined && close.has(m.profile.livesIn))
    .map((m) => {
      const shared = m.profile.interests.filter((i) => me.interests.includes(i));
      const same = m.profile.livesIn === me.livesIn;
      const score = shared.length * 2 + (same ? 3 : 1) + (m.profile.movedFrom === me.movedFrom ? 2 : 0);
      return { m, shared, same, score };
    })
    .filter((x) => x.shared.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ m, shared, same }) => {
      const labels = shared.map((i) => interestLabel[i] ?? i);
      const from = m.profile.movedFrom === me.movedFrom ? `also came from ${m.profile.movedFrom}` : `came from ${m.profile.movedFrom}`;
      return {
        id: m.id,
        firstName: m.profile.name.split(" ")[0],
        neighborhood: m.profile.livesIn,
        movedFrom: m.profile.movedFrom,
        level: `${levels[m.level].emoji} ${levels[m.level].name}`,
        shared: labels,
        distance: same ? "same neighborhood" : "next door",
        why: `Into ${labels.slice(0, 2).join(" and ")}, ${from}`,
      };
    });
}
