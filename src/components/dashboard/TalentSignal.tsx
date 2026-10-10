import Link from "next/link";
import { fmt1, fmtPct } from "@/components/dashboard/format";
import { MetricSection } from "@/components/dashboard/MetricSection";
import { StatTile } from "@/components/dashboard/StatTile";
import { seniorityLabels, stackLabels } from "@/data/pay";
import type { TalentProfile } from "@/data/talent-pool";
import { countsBySeniority, countsByStack, displayCount, talentSummary } from "@/lib/talent";

const W = 340;
const ROW = 28;
const LABEL_W = 112;
const VALUE_W = 64;

/**
 * City dashboard section: the aggregate talent signal Beacon Council / Talent
 * Bridge Miami would use to recruit companies. Aggregates only; "open" always
 * means open to opportunities AND opted in to being visible.
 */
export function TalentSignal({ pool, index }: { pool: TalentProfile[]; index: number }) {
  const s = talentSummary(pool);
  const byStack = countsByStack(pool);
  const bySen = countsBySeniority(pool);
  const max = Math.max(1, ...byStack.map((d) => d.total));
  const barMax = W - LABEL_W - VALUE_W;
  const H = byStack.length * ROW;
  const summary = byStack.map((d) => `${stackLabels[d.stack]} ${d.total} (${d.openVisible} open and opted in)`).join(", ");

  return (
    <MetricSection
      id="talent-signal"
      index={index}
      title="Talent signal for recruiting companies to Miami"
      role="The flywheel: rooted engineers attract jobs"
    >
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <figure className="min-w-0 rounded-2xl border border-line bg-surface p-4">
          <figcaption className="text-sm font-semibold text-ink">Rooted engineers by stack</figcaption>
          <p className="text-xs text-muted">
            Full bar: engineers in the pool. Dark segment: open to opportunities and opted in to being visible.
          </p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="ts-title ts-desc" className="mt-3 h-auto w-full">
            <title id="ts-title">Rooted engineers by stack (simulated)</title>
            <desc id="ts-desc">{summary}.</desc>
            {byStack.map((d, i) => {
              const w = Math.max(4, (d.total / max) * barMax);
              const wOpen = (d.openVisible / max) * barMax;
              const cy = i * ROW + ROW / 2;
              return (
                <g key={d.stack}>
                  <text x={0} y={cy + 4} className="fill-ink text-[12px]">
                    {stackLabels[d.stack]}
                  </text>
                  <rect x={LABEL_W} y={cy - 8} width={w} height={16} rx={3} className="fill-teal-soft" />
                  <rect x={LABEL_W} y={cy - 8} width={wOpen} height={16} rx={3} className="fill-teal" />
                  <text x={LABEL_W + w + 6} y={cy + 4} className="fill-ink text-[12px] font-semibold tabular-nums">
                    {d.total}
                    <tspan className="fill-muted font-normal"> · {d.openVisible}</tspan>
                  </text>
                </g>
              );
            })}
          </svg>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Rooted engineers by seniority">
            {bySen.map((d) => (
              <li key={d.seniority}>
                <span className="font-semibold text-ink tabular-nums">{displayCount(d.total)}</span>{" "}
                {seniorityLabels[d.seniority]} ({d.openVisible} open)
              </li>
            ))}
          </ul>
        </figure>

        <div className="grid grid-cols-2 gap-3 content-start">
          <StatTile label="Rooted engineers" value={String(s.total)} detail="In the opt-in talent pool" />
          <StatTile
            label="Open and opted in"
            value={fmtPct(s.openVisibleShare)}
            detail={`${s.openVisible} engineers chose to hear from companies`}
            accent="coral"
          />
          <StatTile
            label="AI-trained"
            value={fmtPct(s.aiTrainedShare)}
            detail="Hands-on AI build training"
            accent="gold"
          />
          <StatTile
            label="Rooted or Grove"
            value={fmtPct(s.rootedOrGroveShare)}
            detail={`Median ${fmt1(s.medianYearsInMiami)} years in Miami`}
          />
        </div>
      </div>
      <p className="mt-3 text-sm">
        <Link href="/companies" className="font-medium text-coral underline-offset-2 hover:underline">
          See what companies get →
        </Link>
        <span className="block text-xs text-muted sm:ml-2 sm:inline">
          Aggregates only. Companies never see wellbeing or intent-to-stay data.
        </span>
      </p>
    </MetricSection>
  );
}
