"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Engineer-side sections. Order = tab order; `crumb` is the breadcrumb label. */
const sections = [
  { href: "/journey", label: "Journey", crumb: "Your journey" },
  { href: "/stages", label: "Stages", crumb: "Stages" },
  { href: "/negotiate", label: "Know your number", crumb: "Know your number" },
  { href: "/sharing", label: "What companies see", crumb: "What companies see" },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const current = sections.find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="font-bold tracking-tight">
            🌱 Rooted <span className="text-coral">Miami</span>
          </Link>
          <Link href="/login" className="text-sm text-muted hover:text-coral">
            Switch user
          </Link>
        </div>

        <nav aria-label="Main" className="-mx-4 overflow-x-auto px-4">
          <ul className="flex gap-1 pb-2">
            {sections.map((s) => {
              const active = s === current;
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    aria-current={active ? "page" : undefined}
                    className={`block whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                      active ? "bg-coral-soft font-semibold text-coral" : "text-muted hover:text-ink"
                    }`}
                  >
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <nav aria-label="Breadcrumb" className="border-t border-line bg-bg">
        <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2 text-xs text-muted">
          <li>
            <Link href="/" className="hover:text-coral">
              Home
            </Link>
          </li>
          {current && current.href !== "/journey" && (
            <>
              <li aria-hidden>›</li>
              <li>
                <Link href="/journey" className="hover:text-coral">
                  Your journey
                </Link>
              </li>
            </>
          )}
          {current && (
            <>
              <li aria-hidden>›</li>
              <li aria-current="page" className="font-medium text-ink">
                {current.crumb}
              </li>
            </>
          )}
        </ol>
      </nav>
    </header>
  );
}
