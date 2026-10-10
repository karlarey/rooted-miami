"use client";

import { useMemo, useState } from "react";
import { buildEvents, type RootedEvent } from "@/data/events";
import { packageItems } from "@/lib/levels";
import { recommend } from "@/lib/recommend";
import { quests } from "@/data/quests";
import { useJourney } from "@/lib/use-journey";

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/** Standard iCalendar file: works with Google, Apple and Outlook calendars. */
function toIcs(events: RootedEvent[]): string {
  const stamp = (iso: string, addMin = 0) => {
    const d = new Date(new Date(iso).getTime() + addMin * 60_000);
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };
  const esc = (s: string) => s.replace(/[,;\\]/g, (c) => `\\${c}`);
  const body = events
    .map((e) =>
      [
        "BEGIN:VEVENT",
        `UID:${e.id}@rooted.miami`,
        `DTSTAMP:${stamp(new Date().toISOString())}`,
        `DTSTART:${stamp(e.start)}`,
        `DTEND:${stamp(e.start, e.durationMinutes)}`,
        `SUMMARY:${esc(e.title)}`,
        `LOCATION:${esc(e.place)}, Miami`,
        "DESCRIPTION:A Rooted side quest. Pana will see you there.",
        "END:VEVENT",
      ].join("\r\n"),
    )
    .join("\r\n");
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Rooted//Miami//EN\r\n${body}\r\nEND:VCALENDAR\r\n`;
}

function download(events: RootedEvent[], name: string) {
  const url = URL.createObjectURL(new Blob([toIcs(events)], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function groupByDay(events: RootedEvent[]) {
  const groups = new Map<string, RootedEvent[]>();
  for (const e of events) {
    const day = e.start.slice(0, 10);
    groups.set(day, [...(groups.get(day) ?? []), e]);
  }
  return [...groups.entries()];
}

export default function CalendarPage() {
  const { journey, ready, level, rsvp } = useJourney();
  const [now] = useState(() => new Date());
  const events = useMemo(() => buildEvents(now).filter((e) => new Date(e.start) >= now), [now]);
  const rsvps = useMemo(() => journey.rsvps ?? [], [journey.rsvps]);

  const mine = events.filter((e) => rsvps.includes(e.id));
  const suggested = useMemo(() => {
    const wanted = new Set([
      ...journey.accepted,
      ...recommend(journey.profile, level, 10).map((r) => r.quest.id),
    ]);
    const seen = new Set<string>();
    return events.filter((e) => {
      if (rsvps.includes(e.id) || !wanted.has(e.questId) || seen.has(e.questId)) return false;
      seen.add(e.questId);
      return true;
    });
  }, [events, journey.accepted, journey.profile, level, rsvps]);

  if (!ready) return <main className="p-8 text-muted">Loading your calendar…</main>;

  const itemOf = (e: RootedEvent) => packageItems[quests.find((q) => q.id === e.questId)?.item ?? "community"];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Your calendar</p>
          <h1 className="mt-1 text-3xl font-bold">What&rsquo;s coming up</h1>
          <p className="mt-1 text-muted">Dinners, rituals, hackathons: everything you signed up for in one place.</p>
        </div>
        {mine.length > 0 && (
          <button
            onClick={() => download(mine, "rooted-calendar.ics")}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
          >
            Add all to my calendar
          </button>
        )}
      </div>
      <p className="mt-3 inline-flex rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">
        Sample schedule for the demo: dates and times are illustrative.
      </p>

      <section className="mt-8" aria-label="Signed up">
        {mine.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            Nothing yet. Sign up for something below and it shows up here.
          </div>
        ) : (
          <ol className="space-y-6">
            {groupByDay(mine).map(([day, list]) => (
              <li key={day}>
                <h2 className="text-sm font-semibold text-muted">{dayLabel(list[0].start)}</h2>
                <ul className="mt-2 space-y-2">
                  {list.map((e) => (
                    <li key={e.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
                      <div className="w-16 shrink-0 text-center">
                        <p className="font-display text-lg font-semibold">{timeLabel(e.start)}</p>
                      </div>
                      <div className="min-w-0 flex-1 border-l border-line pl-4">
                        <p className="text-xs text-muted">
                          {itemOf(e).emoji} {itemOf(e).name}
                        </p>
                        <p className="font-semibold">{e.title}</p>
                        <p className="text-sm text-muted">📍 {e.place}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm">
                        <button onClick={() => download([e], `${e.id}.ics`)} className="text-leaf hover:underline">
                          Add to calendar
                        </button>
                        <button onClick={() => rsvp(e.id, false)} className="text-muted hover:text-ink">
                          Can&rsquo;t go
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>

      {suggested.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Coming up for you</h2>
          <p className="text-sm text-muted">From your quests and Pana&rsquo;s picks.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {suggested.map((e) => (
              <li key={e.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
                <p className="text-xs text-muted">
                  {dayLabel(e.start)} · {timeLabel(e.start)}
                </p>
                <p className="mt-1 font-semibold">{e.title}</p>
                <p className="text-sm text-muted">📍 {e.place}</p>
                <button
                  onClick={() => rsvp(e.id, true)}
                  className="mt-3 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-on-accent"
                >
                  I&rsquo;m going
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
