"use client";

import { useCallback, useEffect, useState } from "react";
import { alex } from "@/data/alex";
import { checkInFor, levelFor } from "./progress";
import type { CheckIn, Profile } from "./types";

/**
 * Client-side journey state for the demo. This hook is the seam for the
 * backend: swap localStorage for the API calls listed in docs/api-contract.md
 * and the screens stay the same.
 */
export interface Journey {
  profile: Profile;
  accepted: string[];
  checkIns: CheckIn[];
}

const KEY = "rooted.journey.v1";

function initial(profile: Profile = alex): Journey {
  return { profile, accepted: [], checkIns: [checkInFor("seed", 0)] };
}

function load(): Journey | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Journey) : null;
  } catch {
    return null;
  }
}

function save(j: Journey) {
  try {
    localStorage.setItem(KEY, JSON.stringify(j));
  } catch {
    // Storage unavailable (private mode): the demo still works in memory.
  }
}

export function useJourney() {
  const [journey, setJourney] = useState<Journey>(() => initial());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount so server and client render match.
    const stored = load();
    if (stored) setJourney(stored); // eslint-disable-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  const update = useCallback((fn: (j: Journey) => Journey) => {
    setJourney((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const start = useCallback((profile: Profile) => {
    // Save immediately: callers navigate right after starting a journey.
    const next = initial(profile);
    save(next);
    setJourney(next);
  }, []);

  const accept = useCallback(
    (id: string) => update((j) => (j.accepted.includes(id) ? j : { ...j, accepted: [...j.accepted, id] })),
    [update],
  );

  const complete = useCallback(
    (id: string) =>
      update((j) => {
        if (j.profile.completedQuests.includes(id)) return j;
        const before = levelFor(j.profile.completedQuests);
        const completedQuests = [...j.profile.completedQuests, id];
        const after = levelFor(completedQuests);
        const checkIns =
          after !== before ? [...j.checkIns, checkInFor(after, j.checkIns.at(-1)!.month + 2)] : j.checkIns;
        return {
          ...j,
          profile: { ...j.profile, completedQuests },
          accepted: j.accepted.filter((a) => a !== id),
          checkIns,
        };
      }),
    [update],
  );

  const reset = useCallback(() => update(() => initial(alex)), [update]);

  return { journey, ready, level: levelFor(journey.profile.completedQuests), start, accept, complete, reset };
}
