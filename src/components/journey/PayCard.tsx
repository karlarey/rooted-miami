import { isIllustrative, payBenchmarks, seniorityLabels, stackLabels } from "@/data/pay";
import type { Profile } from "@/lib/types";

const usd = (n: number) => `$${Math.round(n / 1000)}K`;

/** Pay for the user's role: Miami local vs. remote-from-Miami vs. other cities. */
export function PayCard({ profile }: { profile: Profile }) {
  if (!profile.stack || !profile.seniority) return null;
  const b = payBenchmarks.find((p) => p.stack === profile.stack && p.seniority === profile.seniority);
  if (!b) return null;

  const rows = [
    { label: "Miami employer", value: b.miamiLocal, highlight: true },
    { label: "Remote, living in Miami", value: b.miamiRemote, highlight: false },
    { label: "New York City", value: b.nyc, highlight: false },
  ];
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">💼 Your pay in Miami</h2>
        {isIllustrative(b) && (
          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-medium text-ink">
            Illustrative: replace with real data
          </span>
        )}
      </div>
      <p className="text-sm text-muted">
        {seniorityLabels[b.seniority]} {stackLabels[b.stack]} engineer · base salary
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="flex justify-between text-sm">
              <span>{r.label}</span>
              <strong>{usd(r.value)}</strong>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface-2">
              <div
                className={`h-2 rounded-full ${r.highlight ? "bg-coral" : "bg-teal"}`}
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      {!isIllustrative(b) && b.source && <p className="mt-2 text-xs text-muted">Source: {b.source}</p>}
    </section>
  );
}
