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
  /** Event ids the engineer signed up for (src/data/events.ts). */
  rsvps?: string[];
}

const KEY = "rooted.journey.v1";

function initial(profile: Profile = alex): Journey {
  return { profile, accepted: [], checkIns: [checkInFor("seed", 0)], rsvps: [] };
}

function load(): Journey | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Journey) : null;
  } catch {
    return null;
  }
}


/** Signed-in users: persist to the database too (ignored when signed out). */
function pushToServer(body: object) {
  fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(
    () => {},
  );
}

async function pullFromServer<T>(key: "journey" | "sharing"): Promise<T | null> {
  try {
    const res = await fetch("/api/me");
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return (data[key] as T) ?? null;
  } catch {
    return null;
  }
}

function save(j: Journey) {
  pushToServer({ journey: j });
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
    // The database wins when signed in. Wait for it before showing anything,
    // so a stale browser copy (e.g. the demo persona) never flashes.
    pullFromServer<Journey>("journey").then((server) => {
      if (server) {
        setJourney(server);
        try {
          localStorage.setItem(KEY, JSON.stringify(server));
        } catch {}
      }
      setReady(true);
    });
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

  const rsvp = useCallback(
    (eventId: string, going: boolean) =>
      update((j) => {
        const current = j.rsvps ?? [];
        const rsvps = going ? [...new Set([...current, eventId])] : current.filter((r) => r !== eventId);
        return { ...j, rsvps };
      }),
    [update],
  );

  const reset = useCallback(() => update(() => initial(alex)), [update]);

  return { journey, ready, level: levelFor(journey.profile.completedQuests), start, accept, complete, rsvp, reset };
}
