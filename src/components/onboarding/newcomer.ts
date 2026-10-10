/**
 * Demo sign-in details. Kept in the browser only; nothing is sent anywhere.
 * A real backend would replace this with an account (see docs/api-contract.md).
 */
export interface Newcomer {
  name: string;
  email?: string;
}

const KEY = "rooted.newcomer.v1";

export function saveNewcomer(n: Newcomer) {
  try {
    localStorage.setItem(KEY, JSON.stringify(n));
  } catch {
    // Storage unavailable (private mode): the name still travels in the URL.
  }
}

export function loadNewcomer(): Newcomer | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Newcomer) : null;
  } catch {
    return null;
  }
}
