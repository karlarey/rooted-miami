"use client";

import { useState } from "react";
import { payBenchmarks, seniorityLabels, type PayBenchmark, type Stack } from "@/data/pay";
import { seniorityOrder } from "@/lib/talent";

/**
 * Market rates for companies: what engineers expect by seniority and role family,
 * Miami vs Austin vs NYC (BLS OEWS May 2025), plus the Miami offer that matches
 * Austin's buying power (BEA RPP 2024). Palette validated with the dataviz
 * validator (categorical slots 1-3, light + dark): identity is also carried by
 * the legend and a direct value label on every bar, and there's a table view.
 */

const families: { id: Stack; label: string; covers: string }[] = [
  { id: "backend", label: "Software engineering", covers: "Backend, frontend, full-stack, mobile and DevOps (BLS: Software Developers)" },
  { id: "data-ml", label: "Data / ML", covers: "Data scientists and ML engineers (BLS: Data Scientists)" },
  { id: "security", label: "Security", covers: "Security engineers (BLS: Information Security Analysts)" },
  { id: "product", label: "Product / Eng leadership", covers: "Product and engineering managers (BLS: Computer and Information Systems Managers)" },
];

const series = [
  { key: "miamiLocal", label: "Miami", color: "var(--series-miami)" },
  { key: "austin", label: "Austin", color: "var(--series-austin)" },
  { key: "nyc", label: "New York City", color: "var(--series-nyc)" },
] as const satisfies readonly { key: keyof PayBenchmark; label: string; color: string }[];

const usdK = (n: number) => `$${Math.round(n / 1000)}K`;
const parity = (b: PayBenchmark) => Math.max(b.miamiTarget ?? b.austin, b.austin);

export function MarketRates() {
  const [family, setFamily] = useState<Stack>("backend");
  const [asTable, setAsTable] = useState(false);
  const rows = seniorityOrder.map((l) => payBenchmarks.find((b) => b.stack === family && b.seniority === l)!).filter(Boolean);
  const max = Math.max(...rows.flatMap((b) => [b.nyc, b.austin, b.miamiLocal, parity(b)]));
  const senior = rows.find((b) => b.seniority === "senior")!;
  const fam = families.find((f) => f.id === family)!;

  return (
    <div className="font-ui text-rb-ink [--series-austin:#eb6834] [--series-miami:#2a78d6] [--series-nyc:#1baf7a] dark:[--series-austin:#d95926] dark:[--series-miami:#3987e5] dark:[--series-nyc:#199e70]">
      <div role="tablist" aria-label="Role family" className="flex flex-wrap gap-2">
        {families.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={family === f.id}
            onClick={() => setFamily(f.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ease-out motion-reduce:transition-none ${
              family === f.id ? "bg-rb-primary text-rb-on-primary" : "border border-rb-line text-rb-ink hover:bg-rb-sage-soft"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-rb-muted">{fam.covers}</p>

      {/* Headline: the one number a hiring manager needs. */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-rb-line bg-rb-surface p-5 shadow-[var(--rb-shadow)]">
          <p className="text-sm text-rb-muted">Senior, Miami market</p>
          <p className="mt-1 font-display text-3xl font-bold">{usdK(senior.miamiLocal)}</p>
          <p className="text-xs text-rb-muted">What Miami employers pay today (75th percentile)</p>
        </div>
        <div className="rounded-3xl border border-rb-line bg-rb-surface p-5 shadow-[var(--rb-shadow)]">
          <p className="text-sm text-rb-muted">Senior, Austin / NYC</p>
          <p className="mt-1 font-display text-3xl font-bold">
            {usdK(senior.austin)} <span className="text-rb-muted">/</span> {usdK(senior.nyc)}
          </p>
          <p className="text-xs text-rb-muted">Where Miami engineers get recruited to</p>
        </div>
        <div className="rounded-3xl bg-rb-lime p-5 text-rb-on-lime">
          <p className="text-sm font-medium">Offer to compete (senior)</p>
          <p className="mt-1 font-display text-3xl font-bold">{usdK(parity(senior))}+</p>
          <p className="text-xs">Matches Austin&rsquo;s buying power in Miami. Miami costs {Math.round((114.155 / 98.066 - 1) * 100)}% more.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-4 text-sm" aria-label="Legend">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <span aria-hidden className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-0.5 bg-rb-ink" />
            Offer to compete
          </li>
        </ul>
        <button onClick={() => setAsTable((v) => !v)} className="text-sm text-rb-muted underline hover:text-rb-ink">
          {asTable ? "Show chart" : "Show as table"}
        </button>
      </div>

      {asTable ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-rb-muted uppercase">
              <tr>
                <th className="py-2 pr-4 font-medium">Seniority</th>
                <th className="py-2 pr-4 font-medium">Miami</th>
                <th className="py-2 pr-4 font-medium">Austin</th>
                <th className="py-2 pr-4 font-medium">New York City</th>
                <th className="py-2 font-medium">Offer to compete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.seniority} className="border-t border-rb-line">
                  <td className="py-3 pr-4 font-medium">{seniorityLabels[b.seniority]}</td>
                  <td className="py-3 pr-4">{usdK(b.miamiLocal)}</td>
                  <td className="py-3 pr-4">{usdK(b.austin)}</td>
                  <td className="py-3 pr-4">{usdK(b.nyc)}</td>
                  <td className="py-3 font-semibold">{usdK(parity(b))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 space-y-5" role="img" aria-label={`Annual base pay by seniority for ${fam.label}: Miami, Austin and New York City`}>
          {rows.map((b) => (
            <div key={b.seniority} className="grid grid-cols-[5.5rem_1fr] items-start gap-3">
              <p className="pt-1 text-sm font-medium">{seniorityLabels[b.seniority]}</p>
              <div className="relative space-y-[2px]">
                {series.map((s) => (
                  <div key={s.key} className="group flex items-center gap-2" title={`${s.label}, ${seniorityLabels[b.seniority]}: ${usdK(b[s.key])}`}>
                    <div
                      className="h-4 rounded-r-[4px] transition-opacity duration-200 group-hover:opacity-80 motion-reduce:transition-none"
                      style={{ width: `${(b[s.key] / max) * 82}%`, background: s.color }}
                    />
                    <span className="text-xs text-rb-ink tabular-nums">{usdK(b[s.key])}</span>
                  </div>
                ))}
                <div
                  aria-hidden
                  className="absolute -top-1 -bottom-1 w-0.5 bg-rb-ink"
                  style={{ left: `${(parity(b) / max) * 82}%` }}
                  title={`Offer to compete: ${usdK(parity(b))}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-rb-muted">
        Annual base wages, no bonus or equity. BLS OEWS May 2025, metro areas Miami-Fort Lauderdale-West Palm Beach, Austin-Round
        Rock-San Marcos and New York-Newark-Jersey City. Seniority maps to wage percentiles: junior 25th, mid median, senior 75th,
        staff 90th. Offer to compete = Austin wage × Miami/Austin Regional Price Parity (BEA 2024); no state income tax in either.
      </p>
    </div>
  );
}
