"use client";

import { useId, useState } from "react";
import { seniorityLabels, stackLabels, type Seniority, type Stack } from "@/data/pay";
import { situationLabels, situations, usdK, type Situation } from "@/lib/pana/negotiation";
import { useJourney } from "@/lib/use-journey";
import { analyze, levers, positionMeaning, script, SOURCES, talkingPoints, type SourceKey } from "./content";
import { PracticeChat } from "./PracticeChat";
import { RangeBar } from "./RangeBar";

const stacks = Object.keys(stackLabels) as Stack[];
const levels = Object.keys(seniorityLabels) as Seniority[];

const currentLabels: Record<Situation, string> = {
  offer: "Offer amount (annual base)",
  raise: "Current pay (annual base)",
  remote: "Remote offer (annual base)",
};

/** Accepts "156000", "$156,000", "156k" or "156.5K". */
function parseMoney(raw: string): number | undefined {
  const s = raw.replace(/[$,\s]/g, "").toLowerCase();
  if (!s) return undefined;
  const n = s.endsWith("k") ? parseFloat(s.slice(0, -1)) * 1000 : parseFloat(s);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  // "156" almost certainly means $156K.
  return n < 1000 ? n * 1000 : n;
}

function Source({ k }: { k: SourceKey }) {
  const s = SOURCES[k];
  return s.url ? (
    <a href={s.url} target="_blank" rel="noreferrer" className="underline hover:text-brand">
      {s.label}
    </a>
  ) : (
    <span>{s.label}</span>
  );
}

function Card({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-line bg-surface shadow-card p-4 sm:p-5">
      <h2 id={id} className="text-lg font-semibold text-ink">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

const selectCls =
  "mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-brand";

export function NegotiateTool() {
  const { journey, ready, complete } = useJourney();
  const profile = journey.profile;

  // User choices override the journey profile; unset means "use the profile".
  const [stackSel, setStack] = useState<Stack | null>(null);
  const [senioritySel, setSeniority] = useState<Seniority | null>(null);
  const [situation, setSituation] = useState<Situation>("offer");
  const [currentRaw, setCurrentRaw] = useState("");

  const stack = stackSel ?? profile.stack ?? "backend";
  const seniority = senioritySel ?? profile.seniority ?? "mid";
  const current = parseMoney(currentRaw);
  const input = { stack, seniority, situation, current };
  const a = analyze(input);
  const ids = useId();
  const prefilled = ready && !!profile.stack && stackSel === null && senioritySel === null;
  const questDone = profile.completedQuests.includes("pay-check");

  if (!a) return null;
  const { b, range, position } = a;
  const comparison = [
    { label: "Miami, local employer", value: b.miamiLocal, note: "BLS OEWS May 2025", bar: "bg-primary" },
    { label: "Miami, remote role", value: b.miamiRemote, note: "Estimate: NYC × 0.85", bar: "bg-accent" },
    { label: "Austin", value: b.austin, note: "BLS OEWS May 2025", bar: "bg-leaf" },
    { label: "New York City", value: b.nyc, note: "BLS OEWS May 2025", bar: "bg-leaf" },
  ];
  const max = Math.max(...comparison.map((c) => c.value), range.anchor);

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="rounded-2xl border border-line bg-surface shadow-card p-4 sm:p-5" aria-labelledby={`${ids}-form`}>
        <h2 id={`${ids}-form`} className="text-lg font-semibold">
          Your situation
        </h2>
        {prefilled && <p className="mt-1 text-xs text-muted">Prefilled from your Rooted profile. Change anything.</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Stack
            <select className={selectCls} value={stack} onChange={(e) => setStack(e.target.value as Stack)}>
              {stacks.map((s) => (
                <option key={s} value={s}>
                  {stackLabels[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Seniority
            <select className={selectCls} value={seniority} onChange={(e) => setSeniority(e.target.value as Seniority)}>
              {levels.map((s) => (
                <option key={s} value={s}>
                  {seniorityLabels[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="mt-4">
          <legend className="text-sm font-medium">What are you doing?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {situations.map((s) => (
              <label
                key={s}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
                  situation === s ? "border-brand bg-accent-soft text-ink" : "border-line text-muted hover:border-brand"
                }`}
              >
                <input
                  type="radio"
                  name="situation"
                  value={s}
                  checked={situation === s}
                  onChange={() => setSituation(s)}
                  className="sr-only"
                />
                {situationLabels[s]}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="mt-4 block text-sm font-medium">
          {currentLabels[situation]} <span className="font-normal text-muted">(optional)</span>
          <input
            inputMode="decimal"
            value={currentRaw}
            onChange={(e) => setCurrentRaw(e.target.value)}
            placeholder="e.g. 150k"
            className={selectCls}
            aria-describedby={`${ids}-hint`}
          />
        </label>
        <p id={`${ids}-hint`} className="mt-1 text-xs text-muted">
          Stays in your browser. Base salary only, no bonus or equity.
        </p>
      </form>

      <div aria-live="polite" className="space-y-6">
        <Card id={`${ids}-stand`} title="Where you stand">
          {position && current ? (
            <>
              <p className="text-3xl font-bold text-ink">
                ~{position.percentile}
                <span className="text-lg">th percentile</span>
              </p>
              <p className="text-sm text-muted">
                {usdK(current)} among Miami {stackLabels[stack]} workers ({SOURCES.oews.label})
              </p>
              {position.outOfRange && (
                <p
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-ink ${
                    position.outOfRange === "below" ? "bg-accent-soft" : "bg-leaf-soft"
                  }`}
                >
                  {position.outOfRange === "below" ? "Below the 25th percentile" : "Above the 90th percentile"}
                </p>
              )}
              <p className="mt-2 text-sm">{positionMeaning(position)}</p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Add your {situation === "raise" ? "current pay" : "offer"} above to see where it lands among Miami wages for{" "}
              {stackLabels[stack]}.
            </p>
          )}
        </Card>

        <Card id={`${ids}-range`} title="Your range">
          <p className="text-sm text-muted">
            {a.role} engineer in Miami, annual base. Anchor high, aim for the target, don&rsquo;t accept below the walk-away.
          </p>
          <RangeBar range={range} current={current} currentLabel={situation === "raise" ? "Current pay" : "Offer"} />
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <strong className="text-brand">Anchor {usdK(range.anchor)}</strong>: Austin buying-power parity (Austin pay × 1.164).
            </li>
            <li>
              <strong className="text-leaf">Target {usdK(range.target)}</strong>: midway between Miami market and Austin parity.
            </li>
            <li>
              <strong>Walk-away {usdK(range.walkAway)}</strong>: the Miami market rate for this level.
            </li>
          </ul>
          {current && current < range.walkAway && (
            <p className="mt-3 rounded-xl bg-accent-soft p-3 text-sm">
              Your number is <strong>{usdK(range.walkAway - current)} below</strong> the Miami market for this level.
            </p>
          )}
        </Card>

        <Card id={`${ids}-compare`} title="Same role, four places">
          <ul className="space-y-3">
            {comparison.map((c) => (
              <li key={c.label}>
                <div className="flex flex-wrap justify-between gap-x-2 text-sm">
                  <span>
                    {c.label} <span className="text-xs text-muted">· {c.note}</span>
                  </span>
                  <strong>{usdK(c.value)}</strong>
                </div>
                <div className="mt-1 h-2 rounded-full bg-surface-2" aria-hidden>
                  <div className={`h-2 rounded-full ${c.bar}`} style={{ width: `${(c.value / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Remote pay has no public source; it&rsquo;s our estimate of a typical &ldquo;tier 2&rdquo; location band. Neither Florida nor
            Texas has a state income tax.
          </p>
        </Card>

        <Card id={`${ids}-points`} title="Talking points, with sources">
          <ul className="space-y-2">
            {talkingPoints(a, situation, current).map((p) => (
              <li key={p.text} className="rounded-xl bg-surface-2 p-3 text-sm">
                {p.text}
                <span className="mt-1 block text-xs text-muted">
                  Source: <Source k={p.source} />
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card id={`${ids}-script`} title="Your script">
          <ol className="space-y-3">
            {script(a, situation, current).map((s, i) => (
              <li key={s.label} className="text-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                  {i + 1}. {s.label.toUpperCase()}
                </p>
                <p className="mt-1">{s.line}</p>
              </li>
            ))}
          </ol>
        </Card>

        <Card id={`${ids}-levers`} title="Levers beyond base salary">
          <ul className="grid gap-2 sm:grid-cols-2">
            {levers(a).map((l) => (
              <li key={l.title} className="rounded-xl border border-line p-3 text-sm">
                <p className="font-semibold">{l.title}</p>
                <p className="mt-1 text-muted">{l.detail}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Housing figure: <Source k="rpp" />. Stipend finding: Rooted research on pay and migration.
          </p>
        </Card>
      </div>

      <section aria-labelledby={`${ids}-practice`}>
        <h2 id={`${ids}-practice`} className="mb-1 text-lg font-semibold">
          Practice with Pana
        </h2>
        <p className="mb-3 text-sm text-muted">
          Pana plays a friendly-but-firm hiring manager using your numbers. Press &ldquo;Coach me&rdquo; for 2–3 tips.
        </p>
        <PracticeChat input={input} />
      </section>

      <aside className="rounded-2xl border border-line bg-surface-2 p-4 text-sm">
        <p className="font-semibold">Limits</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
          <li>Base salary only. OEWS excludes bonus and equity, which can widen the gap at senior levels.</li>
          <li>
            Seniority maps to wage percentiles (junior 25th, mid 50th, senior 75th, staff 90th), and stacks map to the closest
            occupation. Percentiles between those points are estimates.
          </li>
          <li>Remote pay is an estimate. Your company&rsquo;s bands may differ.</li>
          <li>This is information, not financial or legal advice.</li>
        </ul>
      </aside>

      <div className="flex flex-col items-start gap-2 rounded-2xl border border-line bg-surface shadow-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span aria-hidden>💼 </span>Side quest: <strong>Check your pay against Miami benchmarks</strong>
        </p>
        <button
          type="button"
          onClick={() => complete("pay-check")}
          disabled={!ready || questDone}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:bg-leaf-soft disabled:text-ink"
        >
          {questDone ? "✓ Quest done" : "Mark 'Check your pay against Miami benchmarks' done"}
        </button>
      </div>
    </div>
  );
}
