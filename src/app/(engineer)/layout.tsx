import { AppNav } from "@/components/nav/AppNav";

/** Shared shell for the engineer side: main nav + breadcrumbs. */
export default function EngineerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      {children}
    </>
  );
}
