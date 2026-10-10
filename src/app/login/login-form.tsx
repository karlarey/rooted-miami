"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveNewcomer } from "@/components/onboarding/newcomer";
import { alex } from "@/data/alex";
import { authClient } from "@/lib/auth-client";
import { useJourney } from "@/lib/use-journey";

const field =
  "h-12 w-full rounded-xl border border-line bg-bg px-4 text-base text-ink placeholder:text-muted focus:border-leaf focus:outline-none";

export function LoginForm({ linkedinEnabled = false }: { linkedinEnabled?: boolean }) {
  const router = useRouter();
  const { start } = useJourney();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const continueAsAlex = async () => {
    // The demo persona never writes into a real account.
    await authClient.signOut().catch(() => {});
    start(alex);
    router.push("/journey");
  };

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const n = name.trim();
    const res =
      mode === "signup"
        ? await authClient.signUp.email({ name: n || "Newcomer", email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
    setBusy(false);
    if (res.error) {
      setError(res.error.message ?? "Something went wrong. Try again.");
      return;
    }
    if (mode === "signup") {
      saveNewcomer({ name: n, email: email.trim() });
      router.push(n ? `/onboarding?name=${encodeURIComponent(n)}` : "/onboarding");
    } else {
      router.push("/journey");
    }
  };

  const continueWithLinkedIn = () => {
    if (linkedinEnabled) {
      authClient.signIn.social({ provider: "linkedin", callbackURL: "/onboarding?import=linkedin" });
    } else {
      router.push("/onboarding?import=linkedin");
    }
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
          onClick={continueWithLinkedIn}
          className="mt-4 w-full rounded-full bg-[#0a66c2] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
        >
          {linkedinEnabled ? "Continue with LinkedIn" : "Import my LinkedIn profile (PDF)"}
        </button>
        <p className="mt-2 text-xs text-muted">{linkedinEnabled ? "Signs you in with LinkedIn. Then upload your profile PDF so Pana knows your role and skills." : "On LinkedIn: your profile → More → Save to PDF. Read once, never stored."}</p>
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

      <form onSubmit={submitAccount} className="space-y-3 rounded-2xl border border-line bg-surface shadow-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-ink">{mode === "signup" ? "Create your account" : "Welcome back"}</p>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
            }}
            className="text-sm font-medium text-leaf hover:underline"
          >
            {mode === "signup" ? "I have an account" : "Create an account"}
          </button>
        </div>
        {mode === "signup" && (
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
        )}
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Email</span>
          <input
            className={field}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Password</span>
          <input
            className={field}
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-miami">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary px-5 py-3 text-base font-semibold text-on-primary transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "One sec…" : mode === "signup" ? "Create account and meet Pana →" : "Sign in →"}
        </button>
      </form>
    </div>
  );
}
