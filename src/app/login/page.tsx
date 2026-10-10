import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in · Rooted Miami",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-10 pb-8">
      <div className="text-center">
        <p className="text-4xl" aria-hidden>
          🌱
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
          Rooted <span className="text-coral">Miami</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-muted">
          Your journey to becoming a Miamian, one side quest at a time.
        </p>
      </div>

      <p className="mx-auto mt-6 mb-5 rounded-full border border-gold/60 bg-surface-2 px-3 py-1.5 text-center text-xs text-ink">
        <span className="font-semibold">Demo login.</span> No password, no account. Anything you type stays in this
        browser.
      </p>

      <LoginForm />

      <p className="mt-auto pt-8 text-center text-xs text-muted">
        ¡Bienvenido! Built for the Brain Gain track: helping Miami keep the talent it attracts.
      </p>
    </main>
  );
}
