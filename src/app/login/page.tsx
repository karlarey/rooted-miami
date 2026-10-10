import type { Metadata } from "next";
import { linkedinEnabled } from "@/lib/auth";
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
          Rooted <span className="text-brand">Miami</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-muted">
          New city. New roots. From nomad to local, one side quest at a time.
        </p>
      </div>

      <p className="mx-auto mt-6 mb-5 rounded-full border border-accent/60 bg-surface-2 px-3 py-1.5 text-center text-xs text-ink">
        <span className="font-semibold">Secure sign-in.</span> Your account and progress are saved in Rooted&rsquo;s database. Passwords are stored hashed.
      </p>

      <LoginForm linkedinEnabled={linkedinEnabled} />

      <p className="mt-auto pt-8 text-center text-xs text-muted">
        ¡Bienvenido! Built for the Brain Gain track: helping Miami keep the talent it attracts.
      </p>
    </main>
  );
}
