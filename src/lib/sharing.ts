"use client";

import { useCallback, useEffect, useState } from "react";
import type { Seniority, Stack } from "@/data/pay";

/**
 * The engineer's sharing preferences: what companies can see and whether they
 * can message. One source of truth for signup, profile settings and Talent
 * Finder. Shape matches EngineerVisibility in docs/messaging-contract.md.
 * Defaults are private: nothing is shared until the engineer opts in.
 */
export type WorkMode = "office" | "hybrid" | "remote";

export interface SharingPreferences {
  openToMessages: boolean;
  paused: boolean;
  shareName: boolean;
  shared: {
    stack?: Stack;
    seniority?: Seniority;
    skills: string[];
    headline?: string;
    neighborhood?: string;
    workModes: WorkMode[];
  };
  /** Set once the engineer has reviewed these settings during signup. */
  reviewed: boolean;
}

export const defaultSharing: SharingPreferences = {
  openToMessages: false,
  paused: false,
  shareName: false,
  shared: { skills: [], workModes: [] },
  reviewed: false,
};

const KEY = "rooted.sharing.v1";

function load(): SharingPreferences | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaultSharing, ...(JSON.parse(raw) as SharingPreferences) } : null;
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

function save(p: SharingPreferences) {
  pushToServer({ sharing: p });
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage unavailable: preferences live in memory for this visit.
  }
}

/**
 * Prefill what companies would see (e.g. skills and headline from a LinkedIn
 * import) without opting the engineer in. Visibility stays off until they
 * choose it on /sharing.
 */
export function seedSharing(shared: Partial<SharingPreferences["shared"]>) {
  const current = load() ?? defaultSharing;
  save({ ...current, shared: { ...current.shared, ...shared } });
}

export function useSharing() {
  const [prefs, setPrefs] = useState<SharingPreferences>(defaultSharing);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = load();
    if (stored) setPrefs(stored); // eslint-disable-line react-hooks/set-state-in-effect
    setReady(true);
    pullFromServer<SharingPreferences>("sharing").then((server) => {
      if (server) setPrefs({ ...defaultSharing, ...server });
    });
  }, []);

  const update = useCallback((next: SharingPreferences) => {
    save(next);
    setPrefs(next);
  }, []);

  return { prefs, ready, update };
}

/** How the engineer appears to companies, given their preferences. */
export function publicHeadline(prefs: SharingPreferences, name: string): string {
  const level = prefs.shared.seniority ? `${prefs.shared.seniority[0].toUpperCase()}${prefs.shared.seniority.slice(1)}` : "";
  const role = [level, prefs.shared.stack, "engineer"].filter(Boolean).join(" ");
  const where = prefs.shared.neighborhood ? `, ${prefs.shared.neighborhood}` : "";
  return prefs.shareName ? `${name} · ${role}${where}` : `${role}${where}`;
}
