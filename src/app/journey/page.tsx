"use client";

import Link from "next/link";
import { useMemo } from "react";
import { IntentChart } from "@/components/journey/IntentChart";
import { QuestCard } from "@/components/journey/QuestCard";
import { PanaChat } from "@/components/pana/PanaChat";
import { quests } from "@/data/quests";
import { levelOrder, levels } from "@/lib/levels";
import { nextSteps } from "@/lib/progress";
import { recommend, welcomePackage } from "@/lib/recommend";
import { useJourney } from "@/lib/use-journey";

export default function JourneyPage() {
  const { journey, ready, level, accept, complete, reset } = useJourney();
  const { profile, accepted, checkIns } = journey;

  const pkg = useMemo(() => welcomePackage(profile, level), [profile, level]);
  const more = useMemo(
    () => recommend(profile, level, 8).filter((r) => !pkg.some((p) => p.quest.id === r.quest.id)).slice(0, 4),
    [profile, level, pkg],
  );
  const acceptedQuests = quests.filter((q) => accepted.includes(q.id));
  const doneQuests = quests.filter((q) => profile.completedQuests.includes(q.id));
  const steps = nextSteps(profile.completedQuests);
  const levelIndex = levelOrder.indexOf(level);

  if (!ready) return <main className="p-8 text-muted">Loading your journey…</main>;

  const status = (id: string) =>
    profile.completedQuests.includes(id) ? "done" : accepted.includes(id) ? "accepted" : "suggested";

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-coral">ROOTED MIAMI</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {profile.name}&rsquo;s journey to becoming a Miamian
          </h1>
          <p className="mt-1 text-sm text-muted">
            From {profile.movedFrom} · lives in {profile.livesIn} · {profile.role}
          </p>
        </div>
        <nav className="flex gap-3 text-sm">
          <Link href="/stages" className="text-muted hover:text-coral">
            Stages
          </Link>
          <Link href="/dashboard" className="text-muted hover:text-coral">
            City dashboard
          </Link>
          <button onClick={reset} className="text-muted hover:text-coral">
            Reset demo
          </button>
        </nav>
      </header>

      {/* Level strip */}
      <section aria-label="Your level" className="mt-6 rounded-2xl border border-line bg-surface p-4">
        <ol className="grid grid-cols-4 gap-2">
          {levelOrder.map((id, i) => (
            <li key={id} className="text-center">
              <div
                className={`mx-auto h-2 rounded-full ${i <= levelIndex ? "bg-coral" : "bg-line"}`}
                aria-hidden
              />
              <p className={`mt-2 text-sm ${id === level ? "font-semibold text-ink" : "text-muted"}`}>
                {levels[id].emoji} <span className="hidden sm:inline">{levels[id].name}</span>
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm">
          <strong>
            {levels[level].emoji} {levels[level].name}: {levels[level].milestone}.
          </strong>{" "}
          {steps.length > 0 ? (
            <span className="text-muted">Next: {steps.join(" · ")}</span>
          ) : (
            <span className="text-teal">You&rsquo;re a Host. Keep growing the grove.</span>
          )}
        </p>
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

          {more.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">More side quests for you</h2>
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

          <section className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="text-lg font-semibold">How you&rsquo;re doing</h2>
            <p className="text-sm text-muted">From your check-ins with El Pana.</p>
            <div className="mt-3">
              <IntentChart checkIns={checkIns} />
            </div>
          </section>

          {doneQuests.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">Completed ({doneQuests.length})</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {doneQuests.map((q) => (
                  <li key={q.id} className="rounded-full bg-teal-soft px-3 py-1 text-xs text-teal">
                    ✓ {q.title}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="h-[560px] lg:h-full">
            <PanaChat profile={profile} />
          </div>
        </aside>
      </div>
    </main>
  );
}
