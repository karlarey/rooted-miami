"use client";

import { useState, type FormEvent } from "react";
import { seniorityLabels, stackLabels, type Seniority, type Stack } from "@/data/pay";
import { seniorityOrder, stackOrder } from "@/lib/talent";

interface TalentRequest {
  role: string;
  stack: Stack;
  seniority: Seniority;
  count: number;
  company: string;
  email: string;
}

const field =
  "mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-teal";
const labelCls = "text-sm font-medium text-ink";

/**
 * Client-only for now: on submit we show a confirmation and send nothing.
 * TODO(backend): POST /api/talent/requests with the TalentRequest body; the
 * backend stores it and Rooted introduces only engineers who are open AND
 * opted in. Companies never get a list of the pool.
 */
export function RequestTalentForm() {
  const [sent, setSent] = useState<TalentRequest | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSent({
      role: String(f.get("role") ?? ""),
      stack: f.get("stack") as Stack,
      seniority: f.get("seniority") as Seniority,
      count: Number(f.get("count") ?? 1),
      company: String(f.get("company") ?? ""),
      email: String(f.get("email") ?? ""),
    });
  }

  if (sent) {
    return (
      <div role="status" className="rounded-2xl border-2 border-teal bg-teal-soft p-5">
        <p className="text-lg font-semibold text-ink">Request received (demo).</p>
        <p className="mt-1 text-sm text-ink">
          {sent.company} is looking for {sent.count} {seniorityLabels[sent.seniority].toLowerCase()}{" "}
          {stackLabels[sent.stack]} {sent.count === 1 ? "engineer" : "engineers"} ({sent.role}). In the real product,
          Rooted would reach out to {sent.email} and introduce only engineers who chose to be visible.
        </p>
        <p className="mt-2 text-xs text-muted">Nothing was sent anywhere: this form is client-only in the prototype.</p>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="mt-3 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink"
        >
          Make another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="rt-role" className={labelCls}>
            Role
          </label>
          <input id="rt-role" name="role" required placeholder="e.g. Senior backend engineer, payments" className={field} />
        </div>
        <div>
          <label htmlFor="rt-stack" className={labelCls}>
            Stack
          </label>
          <select id="rt-stack" name="stack" defaultValue="backend" className={field}>
            {stackOrder.map((s) => (
              <option key={s} value={s}>
                {stackLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rt-seniority" className={labelCls}>
            Seniority
          </label>
          <select id="rt-seniority" name="seniority" defaultValue="senior" className={field}>
            {seniorityOrder.map((l) => (
              <option key={l} value={l}>
                {seniorityLabels[l]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rt-count" className={labelCls}>
            How many hires
          </label>
          <input id="rt-count" name="count" type="number" min={1} max={50} defaultValue={1} required className={field} />
        </div>
        <div>
          <label htmlFor="rt-company" className={labelCls}>
            Company
          </label>
          <input id="rt-company" name="company" required autoComplete="organization" className={field} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="rt-email" className={labelCls}>
            Work email
          </label>
          <input id="rt-email" name="email" type="email" required autoComplete="email" className={field} />
        </div>
      </div>
      <button
        type="submit"
        className="mt-5 w-full rounded-full bg-coral px-5 py-3 font-semibold text-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:w-auto"
      >
        Request talent
      </button>
      <p className="mt-2 text-xs text-muted">Prototype: submitting shows a confirmation and sends nothing.</p>
    </form>
  );
}
