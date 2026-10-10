interface StatTileProps {
  label: string;
  value: string;
  /** Short plain-language detail under the number. */
  detail?: string;
  /** e.g. "from 5.4 at join" */
  change?: string;
  accent?: "teal" | "coral" | "gold";
}

const accentBar = { teal: "bg-teal", coral: "bg-coral", gold: "bg-gold" } as const;

export function StatTile({ label, value, detail, change, accent = "teal" }: StatTileProps) {
  return (
    <div className="relative min-w-0 overflow-hidden break-words rounded-2xl border border-line bg-surface p-4">
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${accentBar[accent]}`} />
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-ink tabular-nums">{value}</p>
      {change && <p className="mt-1 text-sm font-medium text-teal">{change}</p>}
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </div>
  );
}
