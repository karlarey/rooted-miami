"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { seniorityLabels, stackLabels, type Seniority, type Stack } from "@/data/pay";
import type { TalentCard } from "@/data/talent-visibility";
import type { Opportunity } from "@/lib/opportunities";
import { benchmark, competitiveness } from "@/lib/pay-math";
import type { WorkMode } from "@/lib/sharing";
import { seniorityOrder, stackOrder } from "@/lib/talent";
import type { FinderResult } from "@/lib/talent-finder";
import type { ScoredCard, TalentQuery } from "@/lib/talent-search";

/* Demo company: fictional, so nothing here passes as a real employer. */
const COMPANY = { id: "demo-company", name: "AI Brisa Labs" };

const usd = (n: number) => `$${Math.round(n / 1000)}K`;
const levelBadge: Record<TalentCard["level"], string> = { seed: "🌱 Seed", sprout: "🌿 Sprout", rooted: "🌳 Rooted", grove: "🌲 Grove" };

const card = "rounded-3xl border border-rb-line bg-rb-surface p-6 shadow-[var(--rb-shadow)]";
const input =
  "mt-1 w-full rounded-xl border border-rb-line bg-rb-bg px-3 py-2 text-rb-ink placeholder:text-rb-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-rb-sage";
const label = "text-sm font-medium text-rb-ink";
const btnPrimary =
  "rounded-full bg-rb-primary px-5 py-3 text-sm font-medium text-rb-on-primary transition duration-200 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";
const btnAccent =
  "rounded-full bg-rb-lime px-5 py-3 text-sm font-medium text-rb-on-lime transition duration-200 ease-out hover:opacity-90 disabled:opacity-40 motion-reduce:transition-none";
const btnOutline =
  "rounded-full border border-rb-ink px-5 py-3 text-sm font-medium text-rb-ink transition duration-200 ease-out hover:bg-rb-sage-soft motion-reduce:transition-none";
const pill = "rounded-full px-3 py-1 text-xs font-medium";

const emptyQuery: TalentQuery = { stack: "all", seniority: "all", workMode: "all", neighborhood: "all", skills: [] };

export function TalentFinderPortal() {
  const [query, setQuery] = useState<TalentQuery>(emptyQuery);
  const [results, setResults] = useState<ScoredCard[] | null>(null);
  const [finder, setFinder] = useState<FinderResult | null>(null);
  const [composeFor, setComposeFor] = useState<ScoredCard | null>(null);
  const [sent, setSent] = useState<Opportunity[]>([]);
  /** Engineers already shown in earlier shortlists for this search ("pull 3 new" skips them). */
  const [passedOver, setPassedOver] = useState<Set<string>>(new Set());

  const newSearch = (q: TalentQuery) => {
    setPassedOver(new Set());
    setQuery(q);
  };

  const search = useCallback(async (q: TalentQuery) => {
    const p = new URLSearchParams();
    for (const k of ["stack", "seniority", "workMode", "neighborhood"] as const) if (q[k] && q[k] !== "all") p.set(k, String(q[k]));
    if (q.skills?.length) p.set("skills", q.skills.join(","));
    const res = await fetch(`/api/talent/search?${p}`);
    setResults((await res.json()).results);
  }, []);

  const loadSent = useCallback(async () => {
    const res = await fetch(`/api/opportunities?companyId=${COMPANY.id}`);
    setSent(await res.json());
  }, []);

  useEffect(() => {
    search(query); // eslint-disable-line react-hooks/set-state-in-effect
  }, [query, search]);
  useEffect(() => {
    loadSent(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadSent]);

  const contacted = new Set(sent.filter((o) => o.status !== "passed").map((o) => o.engineerId));
  const unseen = (results ?? []).filter((c) => !passedOver.has(c.engineerId));
  const shortlist = unseen.slice(0, 3);
  const remaining = Math.max(0, unseen.length - shortlist.length);

  return (
    <div className="font-ui">
      <AskTalentFinder
        onResult={(r) => {
          setFinder(r);
          newSearch(r.query);
        }}
      />

      <section aria-labelledby="results" className="mt-12">
        <p className="text-xs font-medium tracking-widest text-rb-muted uppercase">
          {finder ? `Shortlist · ${finder.headcount} × ${finder.role}` : "Shortlist"}
        </p>
        <h2 id="results" className="mt-1 font-display text-2xl font-semibold text-rb-ink sm:text-3xl">
          {!results ? "Loading talent…" : shortlist.length ? "Your top 3 candidates" : "No candidates left for this search"}
        </h2>
        <p className="mt-1 text-sm text-rb-muted">
          {results && `${results.length} opted-in engineers match. Ranked by matching skills, then time rooted in Miami.`}
        </p>
        <Filters query={query} onChange={newSearch} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortlist.map((c, i) => (
            <TalentCardView key={c.engineerId} rank={passedOver.size + i + 1} c={c} contacted={contacted.has(c.engineerId)} onReach={() => setComposeFor(c)} />
          ))}
        </div>
        {results && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPassedOver(new Set([...passedOver, ...shortlist.map((c) => c.engineerId)]))}
              disabled={remaining === 0}
              className={btnAccent}
            >
              {shortlist.some((c) => contacted.has(c.engineerId)) ? "No replies? Pull 3 new" : "Pull 3 new"}
            </button>
            <span className="text-sm text-rb-muted">
              {remaining > 0 ? `${remaining} more matching engineer${remaining === 1 ? "" : "s"} in the pool` : "You've seen every match. Widen the filters to find more."}
            </span>
            {passedOver.size > 0 && (
              <button onClick={() => setPassedOver(new Set())} className="text-sm text-rb-muted underline hover:text-rb-ink">
                Back to the top 3
              </button>
            )}
          </div>
        )}
      </section>

      <SentPipeline sent={sent} onRefresh={loadSent} />

      {composeFor && (
        <Composer
          engineer={composeFor}
          finder={finder}
          onClose={() => setComposeFor(null)}
          onSent={async () => {
            setComposeFor(null);
            await loadSent();
          }}
        />
      )}
    </div>
  );
}

/* ---------- Talent Finder (AI) ---------- */

function AskTalentFinder({ onResult }: { onResult: (r: FinderResult) => void }) {
  const [text, setText] = useState("We're a fintech in Wynwood hiring 3 senior backend engineers, hybrid, Go and PostgreSQL.");
  const [busy, setBusy] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FinderResult | null>(null);

  const ask = async (fast: boolean): Promise<FinderResult> => {
    const res = await fetch("/api/talent-finder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request: text, company: COMPANY.name, fast }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  // Progressive: an instant keyword read fills results now; Gemma 4 (~15s, it thinks first) refines them.
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const quick = await ask(true);
      setResult(quick);
      onResult(quick);
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
    setRefining(true);
    try {
      const ai = await ask(false);
      setResult(ai);
      onResult(ai);
    } catch (err) {
      setError((err as Error).message || "Talent Finder is offline. Use the filters below.");
    } finally {
      setRefining(false);
    }
  }

  return (
    <section aria-labelledby="ask" className="rounded-3xl bg-rb-primary p-6 text-rb-on-primary sm:p-8 dark:bg-rb-surface dark:text-rb-ink">
      <p className="text-xs font-medium tracking-widest uppercase opacity-80">Talent Finder · your AI talent discovery agent</p>
      <h2 id="ask" className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
        Who are you hiring in Miami?
      </h2>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="ask-input" className="sr-only">
          Describe the role
        </label>
        <textarea
          id="ask-input"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-inherit placeholder:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-rb-lime dark:border-rb-line dark:bg-rb-bg"
          placeholder="e.g. 2 mid frontend engineers, React, remote-friendly, Brickell office"
        />
        <button type="submit" disabled={busy || refining || !text.trim()} className={`${btnAccent} self-start sm:self-stretch`}>
          {busy ? "Finding…" : refining ? "Refining…" : "Find talent"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-rb-coral-soft px-4 py-2 text-sm text-rb-ink">
          {error}
        </p>
      )}
      {refining && (
        <p aria-live="polite" className="mt-3 flex items-center gap-2 text-sm opacity-90">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rb-lime motion-reduce:animate-none" />
          Gemma 4 is reading your request and drafting a personal note…
        </p>
      )}
      {result && (
        <div className="mt-5 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl bg-white/10 p-4 dark:bg-rb-bg">
            <p className="text-sm opacity-90">{result.rationale}</p>
            <p className="mt-2 text-xs opacity-70">
              Searching for <strong>{result.headcount}</strong> × {result.role} · engine: {result.engine}
            </p>
          </div>
          {result.suggestedBand && (
            <div className="rounded-2xl bg-rb-lime p-4 text-rb-on-lime">
              <p className="text-xs font-medium tracking-wide uppercase">Fair band to keep them in Miami</p>
              <p className="mt-1 font-display text-2xl font-bold">
                {usd(result.suggestedBand.min)}–{usd(result.suggestedBand.max)}
              </p>
              <p className="mt-1 text-xs">Miami market {usd(result.suggestedBand.marketRate)} → Austin buying-power parity. BLS OEWS 2025.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------- filters + cards ---------- */

function Filters({ query, onChange }: { query: TalentQuery; onChange: (q: TalentQuery) => void }) {
  const sel = (k: keyof TalentQuery, opts: [string, string][], name: string) => (
    <label className="min-w-36 flex-1">
      <span className={label}>{name}</span>
      <select value={String(query[k] ?? "all")} onChange={(e) => onChange({ ...query, [k]: e.target.value })} className={input}>
        <option value="all">Any</option>
        {opts.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="mt-4 flex flex-wrap items-end gap-3">
      {sel("stack", stackOrder.map((s) => [s, stackLabels[s]]), "Stack")}
      {sel("seniority", seniorityOrder.map((s) => [s, seniorityLabels[s]]), "Seniority")}
      {sel("workMode", [["office", "Office"], ["hybrid", "Hybrid"], ["remote", "Remote"]], "Work mode")}
      {sel(
        "neighborhood",
        ["Brickell", "Downtown", "Wynwood", "Edgewater", "Little Havana", "Little Haiti", "Coconut Grove", "Coral Gables", "Key Biscayne", "Miami Beach", "Doral"].map((n) => [n, n]),
        "Lives in",
      )}
      {!!query.skills?.length && (
        <div className="flex flex-wrap items-center gap-2">
          {query.skills.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ ...query, skills: query.skills!.filter((x) => x !== s) })}
              className={`${pill} bg-rb-sage-soft text-rb-ink hover:bg-rb-coral-soft`}
              aria-label={`Remove skill ${s}`}
            >
              {s} ✕
            </button>
          ))}
        </div>
      )}
      <button onClick={() => onChange(emptyQuery)} className="px-2 py-2 text-sm text-rb-muted underline hover:text-rb-ink">
        Clear
      </button>
    </div>
  );
}

function TalentCardView({ c, rank, contacted, onReach }: { c: ScoredCard; rank: number; contacted: boolean; onReach: () => void }) {
  return (
    <article className={`${card} flex flex-col`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-rb-muted">#{rank}</p>
          <h3 className="font-display text-lg leading-snug font-semibold text-rb-ink">{c.headline}</h3>
        </div>
        <span className={`${pill} shrink-0 bg-rb-sage-soft text-rb-ink`}>{levelBadge[c.level]}</span>
      </div>
      <p className="mt-1 text-sm text-rb-muted">
        {c.yearsInMiami} yrs in Miami · {c.workModes.join(" / ")} · {c.languages.join(", ")}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
        {c.skills.map((s) => (
          <li key={s} className={`${pill} ${c.matchedSkills.includes(s) ? "bg-rb-lime text-rb-on-lime" : "border border-rb-line text-rb-ink"}`}>
            {s}
          </li>
        ))}
      </ul>
      <ul className="mt-3 space-y-1 text-sm text-rb-ink">
        {c.mentorsStudents && <li>🎓 Mentors FIU / MDC students</li>}
        {c.aiTrained && <li>✨ Completed a Rooted AI build training</li>}
        {c.shippedProjects > 0 && <li>🚀 Shipped {c.shippedProjects} project{c.shippedProjects > 1 ? "s" : ""} to real users</li>}
      </ul>
      <div className="mt-auto pt-5">
        {contacted ? (
          <p className={`${pill} inline-block bg-rb-sage-soft text-rb-ink`}>✓ Message sent</p>
        ) : (
          <button onClick={onReach} className={btnPrimary}>
            Reach out
          </button>
        )}
      </div>
    </article>
  );
}

/* ---------- composer with pay check ---------- */

const riskCopy = {
  high: { cls: "bg-rb-coral-soft", title: "Below Miami market", body: "Most Miami engineers at this level already earn more. Expect a pass." },
  medium: { cls: "bg-rb-lime/40", title: "Below Austin parity", body: "Competitive locally, but Austin pays more for the same buying power. That's where engineers who leave Miami go." },
  low: { cls: "bg-rb-sage-soft", title: "Competitive", body: "At or above Austin buying-power parity. This band helps keep talent in Miami." },
} as const;

function Composer({ engineer, finder, onClose, onSent }: { engineer: ScoredCard; finder: FinderResult | null; onClose: () => void; onSent: () => void }) {
  const fromFinder = finder?.query.stack === engineer.stack;
  const [role, setRole] = useState(fromFinder ? finder!.role : `${seniorityLabels[engineer.seniority]} ${stackLabels[engineer.stack]} engineer`);
  const [payMin, setPayMin] = useState(fromFinder && finder!.suggestedBand ? String(finder!.suggestedBand.min) : "");
  const [payMax, setPayMax] = useState(fromFinder && finder!.suggestedBand ? String(finder!.suggestedBand.max) : "");
  const [workMode, setWorkMode] = useState<WorkMode>(engineer.workModes[0]);
  const [message, setMessage] = useState(finder?.draftMessage ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const b = benchmark(engineer.stack as Stack, engineer.seniority as Seniority);
  const max = Number(payMax);
  const check = b && max > 0 ? competitiveness(b, max) : null;
  const bandOk = Number(payMin) > 0 && max >= Number(payMin);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: COMPANY.id,
        companyName: COMPANY.name,
        engineerId: engineer.engineerId,
        role,
        stack: engineer.stack,
        seniority: engineer.seniority,
        payMin: Number(payMin),
        payMax: Number(payMax),
        workMode,
        neighborhood: "Wynwood",
        message,
      }),
    });
    setBusy(false);
    if (!res.ok) return setError((await res.json()).error);
    onSent();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title"
        onSubmit={send}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-rb-bg p-6 font-ui shadow-xl sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-widest text-rb-muted uppercase">First message</p>
            <h2 id="compose-title" className="mt-1 font-display text-2xl font-semibold text-rb-ink">
              {engineer.headline}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-3 py-1 text-rb-muted hover:bg-rb-sage-soft">
            ✕
          </button>
        </div>

        <label className="mt-5 block">
          <span className={label}>Role</span>
          <input value={role} onChange={(e) => setRole(e.target.value)} required className={input} />
        </label>

        <fieldset className="mt-4">
          <legend className={label}>Pay band, annual base (USD). Required: no band, no send.</legend>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <input inputMode="numeric" placeholder="Min, e.g. 150000" aria-label="Pay band minimum" value={payMin} onChange={(e) => setPayMin(e.target.value.replace(/\D/g, ""))} className={input} />
            <input inputMode="numeric" placeholder="Max, e.g. 175000" aria-label="Pay band maximum" value={payMax} onChange={(e) => setPayMax(e.target.value.replace(/\D/g, ""))} className={input} />
          </div>
        </fieldset>

        {b && (
          <div aria-live="polite" className={`mt-3 rounded-2xl p-4 text-rb-ink ${check ? riskCopy[check.risk].cls : "bg-rb-surface border border-rb-line"}`}>
            <p className="text-xs font-medium tracking-wide uppercase">Pay check · {seniorityLabels[engineer.seniority]} {stackLabels[engineer.stack]}</p>
            {check ? (
              <>
                <p className="mt-1 font-display text-lg font-semibold">{riskCopy[check.risk].title}</p>
                <p className="text-sm">{riskCopy[check.risk].body}</p>
                {check.gapToParity > 0 && <p className="mt-1 text-sm font-medium">{usd(check.gapToParity)} under Austin parity.</p>}
              </>
            ) : (
              <p className="mt-1 text-sm">Enter your band to compare it with what this engineer can earn.</p>
            )}
            <p className="mt-2 text-xs text-rb-muted">
              Miami market {usd(b.miamiLocal)} · Austin {usd(b.austin)} · Austin parity in Miami {usd(Math.max(b.miamiTarget ?? b.austin, b.austin))}. BLS OEWS 2025, BEA RPP 2024.
            </p>
          </div>
        )}

        <label className="mt-4 block">
          <span className={label}>Work mode</span>
          <select value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)} className={input}>
            {(["office", "hybrid", "remote"] as WorkMode[]).map((m) => (
              <option key={m} value={m}>
                {m[0].toUpperCase() + m.slice(1)}
                {engineer.workModes.includes(m) ? "" : " (not their preference)"}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className={label}>Note</span>
          <textarea rows={5} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} required className={input} placeholder="Why this role, why your team, why Miami." />
          <span className="text-xs text-rb-muted">{message.length}/1000 · They see your company, role, band and note. You see their reply only if they choose to answer.</span>
        </label>

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-rb-coral-soft px-4 py-2 text-sm text-rb-ink">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={busy || !bandOk || !message.trim()} className={btnPrimary}>
            {busy ? "Sending…" : "Send opportunity"}
          </button>
          <button type="button" onClick={onClose} className={btnOutline}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- sent pipeline ---------- */

const statusPill: Record<Opportunity["status"], [string, string]> = {
  new: ["Delivered", "bg-rb-sage-soft"],
  replied: ["Replied: thread open", "bg-rb-lime text-rb-on-lime"],
  passed: ["Not right now", "bg-rb-coral-soft"],
  blocked: ["Not right now", "bg-rb-coral-soft"], // companies never learn they were blocked
};

function SentPipeline({ sent, onRefresh }: { sent: Opportunity[]; onRefresh: () => void }) {
  return (
    <section aria-labelledby="sent" className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-rb-muted uppercase">Your pipeline</p>
          <h2 id="sent" className="mt-1 font-display text-2xl font-semibold text-rb-ink sm:text-3xl">
            Opportunities sent
          </h2>
        </div>
        <button onClick={onRefresh} className={btnOutline}>
          Refresh
        </button>
      </div>
      {sent.length === 0 ? (
        <p className={`${card} mt-4 text-rb-muted`}>Nothing sent yet. Reach out to an engineer above; every message carries a pay band.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm text-rb-ink">
            <thead className="text-xs text-rb-muted uppercase">
              <tr>
                <th className="py-2 pr-4 font-medium">Engineer</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Band</th>
                <th className="py-2 pr-4 font-medium">Pay check</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sent.map((o) => (
                <tr key={o.id} className="border-t border-rb-line">
                  <td className="py-3 pr-4">{o.engineerHeadline}</td>
                  <td className="py-3 pr-4">{o.role}</td>
                  <td className="py-3 pr-4">
                    {usd(o.payMin)}–{usd(o.payMax)}
                  </td>
                  <td className="py-3 pr-4">{o.payRisk ? riskCopy[o.payRisk].title : "n/a"}</td>
                  <td className="py-3">
                    <span className={`${pill} ${statusPill[o.status][1]}`}>{statusPill[o.status][0]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sent.some((o) => o.status === "replied") && (
        <div className="mt-8 space-y-4">
          <h3 className="font-display text-xl font-semibold text-rb-ink">Conversations</h3>
          {sent
            .filter((o) => o.status === "replied")
            .map((o) => (
              <Conversation key={o.id} o={o} onChange={onRefresh} />
            ))}
        </div>
      )}
    </section>
  );
}

/** A thread the engineer opened by replying. The company only sees what the engineer writes. */
function Conversation({ o, onChange }: { o: Opportunity; onChange: () => void }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/opportunities/${o.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "company", body: draft }),
    });
    setBusy(false);
    if (!res.ok) return setError((await res.json()).error);
    setDraft("");
    onChange();
  }

  return (
    <div className={card}>
      <p className="text-xs font-medium tracking-widest text-rb-muted uppercase">{o.role}</p>
      <p className="mt-1 font-display text-lg font-semibold text-rb-ink">{o.engineerHeadline}</p>
      <div className="mt-4 space-y-2 text-sm">
        {[{ id: "first", from: "company" as const, body: o.message, createdAt: o.createdAt }, ...o.thread].map((m) => (
          <div key={m.id} className={`flex ${m.from === "company" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 ${
                m.from === "company" ? "bg-rb-sage-soft text-rb-ink" : "border border-rb-line bg-rb-bg text-rb-ink"
              }`}
            >
              {m.body}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-4 flex flex-wrap gap-2">
        <input
          value={draft}
          maxLength={1000}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write back…"
          aria-label={`Message to ${o.engineerHeadline}`}
          className={`${input} mt-0 min-w-0 flex-1`}
        />
        <button type="submit" disabled={busy || !draft.trim()} className={btnPrimary}>
          {busy ? "Sending…" : "Send"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rb-ink">
          {error}
        </p>
      )}
    </div>
  );
}
