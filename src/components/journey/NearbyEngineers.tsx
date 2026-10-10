"use client";

import Link from "next/link";
import { useState } from "react";
import { nearbyEngineers } from "@/lib/nearby";
import { useSharing } from "@/lib/sharing";
import type { Profile } from "@/lib/types";

/** Pana's picks of engineers nearby, for members who opted in to meet others. */
export function NearbyEngineers({ profile }: { profile: Profile }) {
  const { prefs, ready, update } = useSharing();
  const [asked, setAsked] = useState<string[]>([]);
  if (!ready) return null;

  if (!prefs.openToEngineers) {
    return (
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="text-lg font-semibold">👋 Engineers near you</h2>
        <p className="mt-1 text-sm text-muted">
          Pana can introduce you to engineers in and around {profile.livesIn} who share your interests. It works both
          ways: turn this on and they can find you too.
        </p>
        <button
          onClick={() => update({ ...prefs, openToEngineers: true })}
          className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
        >
          Let other engineers find me
        </button>
      </section>
    );
  }

  const people = nearbyEngineers(profile);
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">👋 Engineers near you</h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">Simulated members</span>
      </div>
      <p className="text-sm text-muted">Pana&rsquo;s picks around {profile.livesIn}. Intros only happen if both say yes.</p>
      {people.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No one nearby yet. Pana will tell you when someone joins.</p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {people.map((p) => (
            <li key={p.id} className="flex gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
              <span
                aria-hidden
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft font-display font-semibold text-brand"
              >
                {p.firstName[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {p.firstName} <span className="text-xs font-normal text-muted">· {p.level}</span>
                </p>
                <p className="text-xs text-muted">
                  📍 {p.neighborhood} ({p.distance})
                </p>
                <p className="mt-1 text-sm">{p.why}</p>
                {asked.includes(p.id) ? (
                  <p className="mt-2 text-sm font-medium text-leaf">Pana asked {p.firstName}. You&rsquo;ll hear back soon.</p>
                ) : (
                  <button
                    onClick={() => setAsked([...asked, p.id])}
                    className="mt-2 rounded-full border border-brand px-3 py-1 text-sm font-medium text-brand hover:bg-accent-soft"
                  >
                    Say hi through Pana
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-muted">
        Change this anytime in <Link href="/sharing" className="underline">your settings</Link>.
      </p>
    </section>
  );
}
