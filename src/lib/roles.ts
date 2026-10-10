"use client";

import { useCallback, useEffect, useState } from "react";

export type Role = "engineer" | "company";

const KEY = "rooted.roles.v1";

/** Which Rooted profiles this account has: People (engineer) and/or Business (company). */
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>(["engineer"]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setRoles(JSON.parse(raw) as Role[]); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {}
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { roles?: Role[] } | null) => d?.roles && setRoles(d.roles))
      .catch(() => {});
  }, []);

  const update = useCallback((next: Role[]) => {
    setRoles(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles: next }),
    }).catch(() => {});
  }, []);

  return { roles, hasBusiness: roles.includes("company"), update };
}
