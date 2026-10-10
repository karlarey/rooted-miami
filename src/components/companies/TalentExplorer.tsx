"use client";

import { useId, useMemo, useState } from "react";
import { fmt1, fmtPct } from "@/components/dashboard/format";
import { StatTile } from "@/components/dashboard/StatTile";
import { seniorityLabels, stackLabels, type Seniority, type Stack } from "@/data/pay";
import { talentPool } from "@/data/talent-pool";
import {
  countsByStackSeniority,
  displayCount,
  filterTalent,
  MIN_CELL,
  seniorityOrder,
  stackOrder,
  talentSummary,
} from "@/lib/talent";
import { PayBenchmarks } from "./PayBenchmarks";

type StackSel = Stack | "all";
type SenSel = Seniority | "all";

/** Heatmap intensity steps (theme token + opacity, no raw colors). */
const heat = ["bg-teal/5", "bg-teal/15", "bg-teal/30", "bg-teal/45", "bg-teal/60"] as const;

/**
 * Interactive talent map: stack × seniority counts of rooted engineers, plus
 * how many are open to opportunities AND opted in. Today: computed from the
 * simulated pool in the browser. Later: GET /api/talent/aggregates, which
 * returns the same grid computed server-side (aggregates only).
 */
export function TalentExplorer() {
  const [stack, setStack] = useState<StackSel>("all");
  const [seniority, setSeniority] = useState<SenSel>("all");
  const [aiOnly, setAiOnly] = useState(false);
  const stackId = useId();
  const senId = useId();

  const base = useMemo(() => filterTalent(talentPool, { aiTrained: aiOnly }), [aiOnly]);
  const grid = useMemo(() => countsByStackSeniority(base), [base]);
  const max = useMemo(
    () => Math.max(1, ...stackOrder.flatMap((s) => seniorityOrder.map((l) => grid[s][l].total))),
    [grid],
  );
  const selected = useMemo(() => filterTalent(base, { stack, seniority }), [base, stack, seniority]);
  const sum = talentSummary(selected);
  const tooSmall = sum.total < MIN_CELL;
  const pctOrDash = (x: number) => (tooSmall ? "–" : fmtPct(x));

  const selLabel = `${stack === "all" ? "All stacks" : stackLabels[stack]} · ${
    seniority === "all" ? "all levels" : seniorityLabels[seniority]
  }${aiOnly ? " · AI-trained" : ""}`;

  const pickCell = (s: Stack, l: Seniority) => {
    const same = stack === s && seniority === l;
    setStack(same ? "all" : s);
    setSeniority(same ? "all" : l);
  };

  const selectClass =
    "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-teal";

  return (
    <div>
      <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-[1fr_1fr_auto] sm:max-w-xl">
        <div>
          <label htmlFor={stackId} className="text-sm font-medium text-ink">
            Stack
          </label>
          <select id={stackId} value={stack} onChange={(e) => setStack(e.target.value as StackSel)} className={selectClass}>
            <option value="all">All stacks</option>
            {stackOrder.map((s) => (
              <option key={s} value={s}>
                {stackLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={senId} className="text-sm font-medium text-ink">
            Seniority
          </label>
          <select
            id={senId}
            value={seniority}
            onChange={(e) => setSeniority(e.target.value as SenSel)}
            className={selectClass}
          >
            <option value="all">All levels</option>
            {seniorityOrder.map((l) => (
              <option key={l} value={l}>
                {seniorityLabels[l]}
              </option>
            ))}
          </select>
        </div>
        <label className="col-span-2 flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink sm:col-span-1">
          <input
            type="checkbox"
            checked={aiOnly}
            onChange={(e) => setAiOnly(e.target.checked)}
            className="h-4 w-4 accent-teal"
          />
          AI-trained only
        </label>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <figure className="min-w-0 rounded-2xl border border-line bg-surface p-4">
          <figcaption>
            <span className="text-sm font-semibold text-ink">Rooted engineers by stack and seniority</span>
            <span className="block text-xs text-muted">
              Big number: engineers in the pool. Small number: open to opportunities <em>and</em> opted in. Tap a cell
              to filter; tap again to clear. Cells under {MIN_CELL} show as &ldquo;&lt;{MIN_CELL}&rdquo;.
            </span>
          </figcaption>

          <table className="mt-3 w-full table-fixed border-separate border-spacing-1 text-center">
            <caption className="sr-only">
              Simulated counts of rooted engineers by stack (rows) and seniority (columns), with the number open to
              opportunities and opted in.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="w-[30%] text-left text-xs font-medium text-muted">
                  <span className="sr-only">Stack</span>
                </th>
                {seniorityOrder.map((l) => (
                  <th
                    key={l}
                    scope="col"
                    className={`text-xs font-medium ${seniority === l ? "text-teal" : "text-muted"}`}
                  >
                    {seniorityLabels[l]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stackOrder.map((s) => (
                <tr key={s}>
                  <th
                    scope="row"
                    className={`truncate text-left text-xs font-medium sm:text-sm ${stack === s ? "text-teal" : "text-ink"}`}
                  >
                    {stackLabels[s]}
                  </th>
                  {seniorityOrder.map((l) => {
                    const c = grid[s][l];
                    const step = Math.min(heat.length - 1, Math.floor((c.total / max) * heat.length));
                    const inSel = (stack === "all" || stack === s) && (seniority === "all" || seniority === l);
                    const exact = stack === s && seniority === l;
                    const filtered = stack !== "all" || seniority !== "all";
                    const ring = exact ? "ring-2 ring-teal" : filtered && inSel ? "ring-1 ring-teal/60" : "";
                    return (
                      <td key={l} className="p-0">
                        <button
                          type="button"
                          onClick={() => pickCell(s, l)}
                          aria-pressed={exact}
                          aria-label={`${stackLabels[s]}, ${seniorityLabels[l]}: ${displayCount(c.total)} rooted engineers, ${c.openVisible} open and opted in`}
                          className={`w-full rounded-lg py-1.5 tabular-nums transition ${heat[step]} ${ring} focus:outline-none focus-visible:ring-2 focus-visible:ring-coral`}
                        >
                          <span className="block text-sm font-semibold text-ink sm:text-base">
                            {displayCount(c.total)}
                          </span>
                          <span className="block text-[11px] text-teal">{c.openVisible} open</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>

        <div aria-live="polite">
          <p className="text-sm font-semibold text-ink">{selLabel}</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <StatTile label="Rooted engineers" value={displayCount(sum.total)} detail="In the Rooted community" />
            <StatTile
              label="Open and opted in"
              value={String(sum.openVisible)}
              detail={tooSmall ? "Opted-in profiles only" : `${fmtPct(sum.openVisibleShare)} of this group`}
              accent="coral"
            />
            <StatTile
              label="Rooted or Grove level"
              value={pctOrDash(sum.rootedOrGroveShare)}
              detail="Embedded in community for a while"
              accent="gold"
            />
            <StatTile
              label="Median years in Miami"
              value={tooSmall ? "–" : fmt1(sum.medianYearsInMiami)}
              detail="Living here, not passing through"
            />
            <StatTile label="Bilingual" value={pctOrDash(sum.bilingualShare)} detail="English plus another language" />
            <StatTile
              label="AI-trained"
              value={pctOrDash(sum.aiTrainedShare)}
              detail="Hands-on AI build training"
              accent="coral"
            />
            <StatTile
              label="Shipped a project"
              value={displayCount(sum.withShippedProjects)}
              detail={`${sum.hackathonProjects} hackathon projects built`}
            />
            <StatTile
              label="Mentor students"
              value={pctOrDash(sum.mentoringShare)}
              detail="FIU, MDC and UM mentees"
              accent="gold"
            />
          </div>
          {tooSmall && (
            <p className="mt-2 text-xs text-muted">
              Percentages hidden for groups under {MIN_CELL} engineers so no aggregate points at one person.
            </p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <PayBenchmarks stack={stack === "all" ? "fullstack" : stack} fallback={stack === "all"} />
      </div>
    </div>
  );
}
