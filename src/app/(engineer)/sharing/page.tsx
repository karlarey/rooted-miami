"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { seniorityLabels, stackLabels, type Seniority, type Stack } from "@/data/pay";
import { publicHeadline, useSharing, type SharingPreferences, type WorkMode } from "@/lib/sharing";
import { useJourney } from "@/lib/use-journey";

const workModes: WorkMode[] = ["office", "hybrid", "remote"];

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line bg-surface p-4">
      <span>
        <span className="block font-medium">{label}</span>
        <span className="block text-sm text-muted">{hint}</span>
      </span>
      <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--coral)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function SharingForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const { journey, ready: journeyReady } = useJourney();
  const { prefs, ready, update } = useSharing();
  const [draft, setDraft] = useState<SharingPreferences | null>(null);

  if (!ready || !journeyReady) return <p className="text-muted">Loading your settings…</p>;

  const profile = journey.profile;
  // Start from saved preferences, filling gaps from the profile (and LinkedIn import).
  const p: SharingPreferences = draft ?? {
    ...prefs,
    shared: {
      ...prefs.shared,
      stack: prefs.shared.stack ?? profile.stack,
      seniority: prefs.shared.seniority ?? profile.seniority,
      neighborhood: prefs.shared.neighborhood ?? profile.livesIn,
      workModes: prefs.shared.workModes.length ? prefs.shared.workModes : [profile.worksFrom],
    },
  };
  const set = (patch: Partial<SharingPreferences>) => setDraft({ ...p, ...patch });
  const setShared = (patch: Partial<SharingPreferences["shared"]>) => setDraft({ ...p, shared: { ...p.shared, ...patch } });

  function saveAndContinue() {
    update({ ...p, reviewed: true });
    router.push(next ?? "/journey");
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Toggle
          label="Companies can message me"
          hint="Only Miami companies on Rooted, and every first message must include the role and pay band."
          checked={p.openToMessages}
          onChange={(v) => set({ openToMessages: v })}
        />
        {p.openToMessages && (
          <Toggle
            label="Pause messages for now"
            hint="Stay visible later without losing your settings."
            checked={p.paused}
            onChange={(v) => set({ paused: v })}
          />
        )}
        <Toggle
          label="Show my name"
          hint="Off: companies see your role and neighborhood only, until you reply."
          checked={p.shareName}
          onChange={(v) => set({ shareName: v })}
        />
      </section>

      <fieldset className="space-y-4 rounded-2xl border border-line bg-surface shadow-card p-4" disabled={!p.openToMessages}>
        <legend className="px-1 font-semibold">What companies see</legend>
        {!p.openToMessages && <p className="text-sm text-muted">Turn on messages to choose what to share.</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Stack</span>
            <select
              className="mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3"
              value={p.shared.stack ?? ""}
              onChange={(e) => setShared({ stack: (e.target.value || undefined) as Stack | undefined })}
            >
              <option value="">Don&rsquo;t share</option>
              {(Object.keys(stackLabels) as Stack[]).map((s) => (
                <option key={s} value={s}>
                  {stackLabels[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Seniority</span>
            <select
              className="mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3"
              value={p.shared.seniority ?? ""}
              onChange={(e) => setShared({ seniority: (e.target.value || undefined) as Seniority | undefined })}
            >
              <option value="">Don&rsquo;t share</option>
              {(Object.keys(seniorityLabels) as Seniority[]).map((s) => (
                <option key={s} value={s}>
                  {seniorityLabels[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-muted">Headline (from LinkedIn, editable)</span>
          <input
            className="mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3"
            value={p.shared.headline ?? ""}
            maxLength={120}
            placeholder="e.g. Backend engineer, payments and APIs"
            onChange={(e) => setShared({ headline: e.target.value || undefined })}
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted">Skills (comma separated)</span>
          <input
            className="mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3"
            value={p.shared.skills.join(", ")}
            placeholder="TypeScript, Postgres, AWS"
            onChange={(e) =>
              setShared({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 15) })
            }
          />
        </label>

        <div className="text-sm">
          <span className="text-muted">Open to</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {workModes.map((m) => {
              const on = p.shared.workModes.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setShared({ workModes: on ? p.shared.workModes.filter((x) => x !== m) : [...p.shared.workModes, m] })
                  }
                  className={`rounded-full border px-4 py-1.5 capitalize ${on ? "border-brand bg-accent-soft text-brand" : "border-line"}`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </fieldset>

      <section className="rounded-2xl bg-surface-2 p-4 text-sm" aria-live="polite">
        <p className="font-semibold">Preview: how companies see you</p>
        {p.openToMessages && !p.paused ? (
          <>
            <p className="mt-2 text-base">{publicHeadline(p, profile.name)}</p>
            {p.shared.headline && <p className="text-muted">{p.shared.headline}</p>}
            {p.shared.skills.length > 0 && <p className="mt-1 text-muted">{p.shared.skills.join(" · ")}</p>}
          </>
        ) : (
          <p className="mt-2 text-muted">You&rsquo;re invisible to companies. That&rsquo;s totally fine.</p>
        )}
        <p className="mt-3 text-xs text-muted">
          Companies never see your check-ins, wellbeing or whether you&rsquo;re thinking about leaving. Change this anytime.
        </p>
      </section>

      <button
        onClick={saveAndContinue}
        className="w-full rounded-full bg-primary px-5 py-3.5 font-semibold text-on-primary hover:opacity-90"
      >
        Save and continue →
      </button>
    </div>
  );
}

export default function SharingPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold">What companies see</h1>
      <p className="mt-1 text-muted">
        Miami companies can reach you directly on Rooted instead of LinkedIn. You decide if, and what they see.
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <SharingForm />
        </Suspense>
      </div>
    </main>
  );
}
