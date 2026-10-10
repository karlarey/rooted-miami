import type { NegotiationRange } from "@/lib/pay-math";
import { usdK } from "@/lib/pana/negotiation";

/** Walk-away, target and anchor on one scale, with the user's number if given. */
export function RangeBar({ range, current, currentLabel }: { range: NegotiationRange; current?: number; currentLabel: string }) {
  const values = [range.walkAway, range.anchor, ...(current ? [current] : [])];
  const lo = Math.min(...values) * 0.94;
  const hi = Math.max(...values) * 1.04;
  const pct = (n: number) => `${((n - lo) / (hi - lo)) * 100}%`;

  const points = [
    { key: "walk", label: "Walk-away", value: range.walkAway, dot: "bg-muted" },
    { key: "target", label: "Target", value: range.target, dot: "bg-teal" },
    { key: "anchor", label: "Anchor", value: range.anchor, dot: "bg-coral" },
  ];

  return (
    <figure>
      <div className="relative mx-2 mt-10 mb-9 h-3 rounded-full bg-surface-2" aria-hidden>
        <div
          className="absolute inset-y-0 rounded-full bg-teal-soft"
          style={{ left: pct(range.walkAway), width: `calc(${pct(range.anchor)} - ${pct(range.walkAway)})` }}
        />
        {points.map((p) => (
          <div key={p.key} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: pct(p.value) }}>
            <div className={`h-4 w-4 rounded-full border-2 border-surface ${p.dot}`} />
            <span
              className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-ink"
            >
              {usdK(p.value)}
            </span>
          </div>
        ))}
        {current && (
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: pct(current) }}>
            <div className="h-7 w-1 rounded-full bg-gold" />
            <span className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-2 text-xs font-semibold text-ink">
              You
            </span>
          </div>
        )}
      </div>
      <figcaption>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {current && (
            <div className="rounded-xl bg-surface-2 p-2">
              <dt className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2.5 w-1 rounded-full bg-gold" aria-hidden /> {currentLabel}
              </dt>
              <dd className="font-semibold">{usdK(current)}</dd>
            </div>
          )}
          {points.map((p) => (
            <div key={p.key} className="rounded-xl bg-surface-2 p-2">
              <dt className="flex items-center gap-1.5 text-xs text-muted">
                <span className={`h-2.5 w-2.5 rounded-full ${p.dot}`} aria-hidden /> {p.label}
              </dt>
              <dd className="font-semibold">{usdK(p.value)}</dd>
            </div>
          ))}
        </dl>
      </figcaption>
    </figure>
  );
}
