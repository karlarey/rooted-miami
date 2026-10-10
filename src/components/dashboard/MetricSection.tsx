import type { ReactNode } from "react";

interface MetricSectionProps {
  id: string;
  index: number;
  title: string;
  /** Role in the impact chain, e.g. "the outcome". */
  role: string;
  children: ReactNode;
}

export function MetricSection({ id, index, title, role, children }: MetricSectionProps) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id={id} className="text-xl font-bold text-ink">
          <span className="text-coral">{index}.</span> {title}
        </h2>
        <span className="text-sm text-muted">{role}</span>
        <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">Simulated</span>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
