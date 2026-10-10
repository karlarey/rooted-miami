"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

/** Account name of the signed-in user, or null when signed out (or still loading). */
function useAccountName() {
  const { data } = authClient.useSession();
  return data?.user.name?.trim() || null;
}

/** Hero nav, right side: "Sign in" when signed out; name, Profile and Switch account when signed in. */
export function HomeAccountNav() {
  const router = useRouter();
  const accountName = useAccountName();

  if (!accountName) {
    return (
      <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-white/80 hover:text-white">
        Sign in
      </Link>
    );
  }

  const switchAccount = async () => {
    await authClient.signOut().catch(() => {});
    router.push("/login");
  };

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <Link href="/journey" className="max-w-[12rem] truncate rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20">
        {accountName}
      </Link>
      <Link href="/sharing" className="rounded-full px-3 py-1.5 text-white/80 hover:text-white">
        Profile
      </Link>
      <button type="button" onClick={switchAccount} className="rounded-full px-3 py-1.5 text-white/80 hover:text-white">
        Switch account
      </button>
    </div>
  );
}

/** "See <name>'s journey" for the signed-in user; the Alex demo persona otherwise. */
export function JourneyButton({ className }: { className: string }) {
  const accountName = useAccountName();
  return (
    <Link href="/journey" className={className}>
      {accountName ? `See ${accountName}’s journey` : "See Alex’s journey"}
    </Link>
  );
}
