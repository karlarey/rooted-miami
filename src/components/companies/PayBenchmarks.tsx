import { fmtUsd } from "@/components/dashboard/format";
import { isIllustrative, payBenchmarks, seniorityLabels, stackLabels, type PayBenchmark, type Stack } from "@/data/pay";
import { seniorityOrder } from "@/lib/talent";

const series = [
  { key: "miamiLocal", label: "Miami, local employer", bar: "bg-coral" },
  { key: "miamiRemote", label: "Miami, remote role (estimate)", bar: "bg-gold" },
  { key: "austin", label: "Austin", bar: "bg-teal" },
  { key: "nyc", label: "New York City", bar: "bg-muted" },
] as const satisfies readonly { key: keyof PayBenchmark; label: string; bar: string }[];

export function IllustrativeBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-coral bg-coral-soft px-2 py-0.5 text-[11px] font-semibold text-ink">
      Illustrative: replace with real data
    </span>
  );
}

/**
 * Annual base pay by seniority for one stack: Miami local vs Miami remote vs
 * Austin (the model city) vs NYC. Every row whose source is still "placeholder"
 * carries a visible Illustrative badge (src/data/pay.ts).
 */
export function PayBenchmarks({ stack, fallback = false }: { stack: Stack; fallback?: boolean }) {
  const rows = seniorityOrder
    .map((l) => payBenchmarks.find((b) => b.stack === stack && b.seniority === l))
    .filter((b): b is PayBenchmark => Boolean(b));
  const max = Math.max(1, ...rows.flatMap((b) => series.map((s) => b[s.key])));
  const anyIllustrative = rows.some(isIllustrative);

  return (
    <section aria-labelledby="pay-title">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 id="pay-title" className="text-lg font-bold text-ink">
          Pay benchmarks: {stackLabels[stack]}
        </h3>
        {anyIllustrative && <IllustrativeBadge />}
      </div>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Annual base salary by seniority. Miami local vs. remote roles held from Miami vs. Austin vs. New York.
        {fallback && " Showing Full-stack; pick a stack above to compare another."}
      </p>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Legend">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 rounded-sm ${s.bar}`} />
            {s.label}
          </li>
        ))}
      </ul>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {rows.map((b) => (
          <figure key={b.seniority} className="min-w-0 rounded-2xl border border-line bg-surface p-4">
            <figcaption className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">{seniorityLabels[b.seniority]}</span>
              {isIllustrative(b) ? (
                <IllustrativeBadge />
              ) : (
                <span className="text-[11px] text-muted">
                  Source:{" "}
                  {b.sourceUrl ? (
                    <a href={b.sourceUrl} className="underline">
                      {b.source}
                    </a>
                  ) : (
                    b.source
                  )}
                  {b.asOf && `, ${b.asOf}`}
                </span>
              )}
            </figcaption>
            <dl className="mt-3 space-y-2">
              {series.map((s) => {
                const v = b[s.key];
                return (
                  <div key={s.key} className="grid grid-cols-[7.5rem_1fr] items-center gap-2 text-xs">
                    <dt className="text-muted">{s.label}</dt>
                    <dd className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`h-3 rounded-sm ${s.bar}`}
                        style={{ width: `${Math.max(4, (v / max) * 70)}%` }}
                      />
                      <span className="shrink-0 font-semibold text-ink tabular-nums">{fmtUsd(v)}</span>
                    </dd>
                  </div>
                );
              })}
            </dl>
            <p className="mt-2 text-xs text-muted">
              Miami local is {Math.round((1 - b.miamiLocal / b.nyc) * 100)}% below NYC for the same role.
            </p>
          </figure>
        ))}
      </div>
    </section>
  );
}
