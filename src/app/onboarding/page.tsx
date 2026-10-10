import type { Metadata } from "next";
import { OnboardingChat } from "@/components/onboarding/onboarding-chat";

export const metadata: Metadata = {
  title: "Meet El Pana · Rooted Miami",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { name } = await searchParams;
  const initialName = typeof name === "string" ? name.trim().slice(0, 40) || undefined : undefined;

  return <OnboardingChat initialName={initialName} />;
}
