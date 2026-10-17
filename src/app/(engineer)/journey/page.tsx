"use client";

import Link from "next/link";
import { useMemo } from "react";
import { IntentChart } from "@/components/journey/IntentChart";
import { NearbyEngineers } from "@/components/journey/NearbyEngineers";
import { QuestCard } from "@/components/journey/QuestCard";
import { PanaChat } from "@/components/pana/PanaChat";
import { LevelPath } from "@/components/stages/LevelPath";
import { LevelUpCelebration } from "@/components/stages/LevelUpCelebration";
import { useLevelUp } from "@/components/stages/useLevelUp";
import { quests } from "@/data/quests";
import { likeMinded } from "@/lib/like-minded";
import { recommend, welcomePackage } from "@/lib/recommend";
import { useJourney } from "@/lib/use-journey";

export default function JourneyPage() {
  const { journey, ready, level, accept, complete, reset } = useJourney();
  const { profile, accepted, checkIns } = journey;
  const { celebrating, dismiss } = useLevelUp(level, ready);

  const pkg = useMemo(() => welcomePackage(profile, level), [profile, level]);
  // Each quest shows up once: welcome package first, then "people like you", then the rest.
  const more = useMemo(() => {
    const shown = new Set(pkg.map((p) => p.quest.id));
    const peers = likeMinded(profile).map((p) => ({ quest: p.quest, reasons: [p.reason] }));
    const picks: { quest: (typeof quests)[number]; reasons: string[] }[] = [];
    for (const r of [...peers, ...recommend(profile, level, 8)]) {
      if (shown.has(r.quest.id) || profile.completedQuests.includes(r.quest.id)) continue;
      shown.add(r.quest.id);
      picks.push(r);
    }
    return picks.slice(0, 4);
  }, [profile, level, pkg]);
  const inPackage = new Set(pkg.map((p) => p.quest.id));
  const shownBelow = new Set(more.map((m) => m.quest.id));
  // Accepted quests already visible further down keep their card there.
  const acceptedQuests = quests.filter((q) => accepted.includes(q.id) && !inPackage.has(q.id) && !shownBelow.has(q.id));
  const doneQuests = quests.filter((q) => profile.completedQuests.includes(q.id));

  if (!ready) return <main className="p-8 text-muted">Loading your journey…</main>;

  const status = (id: string) =>
    profile.completedQuests.includes(id) ? "done" : accepted.includes(id) ? "accepted" : "suggested";

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Your journey</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {profile.name}&rsquo;s journey to becoming a Miamian
          </h1>
          <p className="mt-1 text-sm text-muted">
            From {profile.movedFrom} · lives in {profile.livesIn} · {profile.role}
          </p>
        </div>
        <nav className="flex gap-3 text-sm">
          <button onClick={reset} className="text-muted hover:text-brand">
            Reset demo
          </button>
        </nav>
      </header>

      <section aria-label="Your stage" className="mt-6">
        <LevelPath level={level} completed={profile.completedQuests} compact />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {acceptedQuests.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">In progress</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {acceptedQuests.map((q) => (
                  <QuestCard key={q.id} quest={q} status="accepted" onComplete={() => complete(q.id)} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold">Your welcome package</h2>
            <p className="text-sm text-muted">One side quest for each part of building a life here.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {pkg.map(({ quest, reasons }) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  reasons={reasons}
                  status={status(quest.id)}
                  onAccept={() => accept(quest.id)}
                  onComplete={() => complete(quest.id)}
                />
              ))}
            </div>
          </section>

          <NearbyEngineers profile={profile} />

          {more.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">More side quests for you</h2>
              <p className="text-sm text-muted">Including what engineers like you who stayed in Miami did (simulated members).</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {more.map(({ quest, reasons }) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    reasons={reasons}
                    status={status(quest.id)}
                    onAccept={() => accept(quest.id)}
                    onComplete={() => complete(quest.id)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <h2 className="text-lg font-semibold">How you&rsquo;re doing</h2>
            <p className="text-sm text-muted">From your check-ins with Pana.</p>
            <div className="mt-3">
              <IntentChart checkIns={checkIns} />
            </div>
            {doneQuests.length > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold">Completed ({doneQuests.length})</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {doneQuests.map((q) => (
                    <li key={q.id} className="rounded-full bg-leaf-soft px-3 py-1 text-xs text-leaf">
                      ✓ {q.title}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-4 text-sm">
              💼 Wondering what you should earn here?{" "}
              <Link href="/negotiate" className="font-medium text-brand underline">
                Know your number
              </Link>
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-36 lg:h-[calc(100vh-10.5rem)]">
          <div className="h-[560px] lg:h-full">
            <PanaChat key={profile.name} profile={profile} />
          </div>
        </aside>
      </div>
      {celebrating && <LevelUpCelebration level={celebrating} onClose={dismiss} />}
    </main>
  );
}
