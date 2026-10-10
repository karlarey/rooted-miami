"use client";

import Link from "next/link";
import { LevelPath } from "@/components/stages/LevelPath";
import { stageCopy } from "@/components/stages/copy";
import { quests } from "@/data/quests";
import { levelOrder, levels, packageItems } from "@/lib/levels";
import { useJourney } from "@/lib/use-journey";
import type { CheckIn } from "@/lib/types";

const miamianLabel: Record<CheckIn["miamian"], string> = { yes: "Yes", "not-yet": "Not yet", no: "No" };

const whyReal = [
  {
    emoji: "🧭",
    title: "Real life, not points",
    body: "Each stage is something that actually changed: a routine, a friend you can call, a student who needs you. No streaks to protect.",
  },
  {
    emoji: "🚪",
    title: "Earned off the app",
    body: "Every quest ends with you somewhere in Miami: a court, a ventanita, a classroom. The app just keeps track.",
  },
  {
    emoji: "📈",
    title: "Checked against how you feel",
    body: "When you grow a stage, El Pana asks five quick questions: intent to stay, life satisfaction, people you can call, belonging, and \"Are you a Miamian?\"",
  },
  {
    emoji: "🌲",
    title: "It ends with you welcoming others",
    body: "The top stage isn't a trophy. It's becoming the person who makes Miami home for the next newcomer.",
  },
];

export default function StagesPage() {
  const { journey, level, ready } = useJourney();
  const completed = journey.profile.completedQuests;
  const latest = journey.checkIns.at(-1);
  const firstName = journey.profile.name.split(" ")[0];

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:pt-10">
      <header>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-coral">Your stages</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-ink sm:text-4xl">From newcomer to Miamian</h1>
        <p className="mt-3 text-base text-muted">
          Seed, Sprout, Rooted, Grove. Four stages, each one a real milestone in making Miami home.
        </p>
      </header>

      {/* Where you are */}
      <section aria-labelledby="you-heading" className="mt-8">
        <div className="rounded-2xl bg-surface-2 p-4">
          <h2 id="you-heading" className="text-lg font-semibold text-ink">
            {ready ? (
              <>
                {firstName}, you&apos;re a {levels[level].emoji} {levels[level].name}
              </>
            ) : (
              "Finding where you are…"
            )}
          </h2>
          <p className="mt-1 text-sm text-muted">{stageCopy[level].feeling}</p>
          {latest && (
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="Intent to stay" value={`${latest.intentToStay}/10`} />
              <Stat label="People to call" value={String(latest.peopleOutsideWork)} />
              <Stat label="Miamian?" value={miamianLabel[latest.miamian]} />
            </dl>
          )}
        </div>
      </section>

      {/* The path */}
      <section aria-labelledby="path-heading" className="mt-10">
        <h2 id="path-heading" className="mb-4 text-xl font-semibold text-ink">
          Your path
        </h2>
        <LevelPath level={level} completed={completed} />
      </section>

      {/* Why real */}
      <section aria-labelledby="why-heading" className="mt-12">
        <h2 id="why-heading" className="text-xl font-semibold text-ink">
          Why stages are real milestones
        </h2>
        <p className="mt-1 text-sm text-muted">
          People don&apos;t stay in a city for its amenities. They stay because they belong and people here need them.
          The stages track exactly that.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {whyReal.map((w) => (
            <li key={w.title} className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-semibold text-ink">
                <span aria-hidden className="mr-1.5">
                  {w.emoji}
                </span>
                {w.title}
              </p>
              <p className="mt-1 text-sm text-muted">{w.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Quests by stage */}
      <section aria-labelledby="quests-heading" className="mt-12">
        <h2 id="quests-heading" className="text-xl font-semibold text-ink">
          Quests that grow each stage
        </h2>
        <p className="mt-1 text-sm text-muted">
          Any quest counts toward your next stage. These are the ones made for each moment.
        </p>

        <div className="mt-4 space-y-3">
          {levelOrder.map((id) => {
            const stageQuests = quests.filter((q) => q.level === id);
            const doneCount = stageQuests.filter((q) => completed.includes(q.id)).length;
            return (
              <details
                key={id}
                open={id === level}
                className="group rounded-2xl border border-line bg-surface [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  <span aria-hidden className="text-2xl">
                    {levels[id].emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">
                      {levels[id].name}
                      <span className="font-normal text-muted"> · {levels[id].milestone}</span>
                    </span>
                    <span className="block text-xs text-muted">
                      {doneCount} of {stageQuests.length} done
                    </span>
                  </span>
                  <span aria-hidden className="text-muted transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </summary>

                <div className="border-t border-line px-4 pb-4 pt-3">
                  <p className="text-xs text-muted">
                    <span className="font-semibold text-ink">How Rooted counts it: </span>
                    {stageCopy[id].demoRule}
                  </p>
                  <ul className="mt-3 divide-y divide-line">
                    {stageQuests.map((q) => {
                      const done = completed.includes(q.id);
                      return (
                        <li key={q.id} className="flex items-start gap-3 py-2.5">
                          <span
                            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-xs ${
                              done ? "border-teal bg-teal text-surface" : "border-line"
                            }`}
                          >
                            {done ? <span aria-hidden>✓</span> : null}
                            <span className="sr-only">{done ? "Done" : "Not done yet"}</span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-sm font-medium ${done ? "text-muted" : "text-ink"}`}>
                              {q.title}
                            </span>
                            <span className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted">
                              <span>
                                {packageItems[q.item].emoji} {packageItems[q.item].name}
                              </span>
                              {q.recurring && <span className="text-teal">↻ Weekly ritual</span>}
                              <span>{q.neighborhood}</span>
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link
          href="/journey"
          className="inline-block rounded-full bg-coral px-6 py-3 text-sm font-semibold text-surface hover:opacity-90"
        >
          Back to your side quests
        </Link>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-2">
      <dt className="text-[11px] leading-tight text-muted">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold text-ink">{value}</dd>
    </div>
  );
}
