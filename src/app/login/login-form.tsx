"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveNewcomer } from "@/components/onboarding/newcomer";
import { alex } from "@/data/alex";
import { useJourney } from "@/lib/use-journey";

const field =
  "h-12 w-full rounded-xl border border-line bg-bg px-4 text-base text-ink placeholder:text-muted focus:border-leaf focus:outline-none";

export function LoginForm() {
  const router = useRouter();
  const { start } = useJourney();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const continueAsAlex = () => {
    start(alex);
    router.push("/journey");
  };

  const startOwn = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    saveNewcomer({ name: n, email: email.trim() || undefined });
    router.push(n ? `/onboarding?name=${encodeURIComponent(n)}` : "/onboarding");
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line bg-surface shadow-card p-5">
        <p className="font-semibold text-ink">Bring your LinkedIn</p>
        <p className="mt-1 text-sm text-muted">
          Pana reads your profile once to skip the boring questions. Then you choose what companies can see.
        </p>
        <button
          type="button"
          onClick={() => router.push("/onboarding?import=linkedin")}
          className="mt-4 w-full rounded-full bg-[#0a66c2] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
        >
          Continue with LinkedIn
        </button>
        <p className="mt-2 text-xs text-muted">Demo: upload your LinkedIn profile PDF. Read once, never stored.</p>
      </section>

      <section className="rounded-2xl border border-line bg-surface shadow-card p-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-xl font-bold text-brand"
          >
            A
          </span>
          <div>
            <p className="font-semibold text-ink">Alex · backend engineer</p>
            <p className="text-sm text-muted">Moved from NYC for an office job in Wynwood. Came solo.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={continueAsAlex}
          className="mt-4 w-full rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-on-primary transition active:scale-[0.98]"
        >
          Continue as Alex (demo) →
        </button>
      </section>

      <div className="flex items-center gap-3 text-xs text-muted" aria-hidden>
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={startOwn} className="space-y-3 rounded-2xl border border-line bg-surface shadow-card p-5">
        <p className="font-semibold text-ink">Start my own journey</p>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">First name</span>
          <input
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="given-name"
            placeholder="What should Pana call you?"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">
            Email <span className="text-muted/70">(optional)</span>
          </span>
          <input
            className={field}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full border-2 border-leaf px-5 py-3 text-base font-semibold text-leaf transition hover:bg-leaf-soft active:scale-[0.98]"
        >
          Meet Pana →
        </button>
      </form>
    </div>
  );
}
