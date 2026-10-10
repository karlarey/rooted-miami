import { alex } from "@/data/alex";
import { levels, packageItems } from "@/lib/levels";
import { welcomePackage } from "@/lib/recommend";

export default function Home() {
  const pkg = welcomePackage(alex, "seed");

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="font-mono text-sm text-orange-600">ROOTED MIAMI</p>
      <h1 className="mt-2 text-4xl font-bold">Becoming a Miamian, one side quest at a time.</h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        Welcome package for {alex.name} · {levels.seed.emoji} {levels.seed.name}
      </p>

      <ul className="mt-8 space-y-4">
        {pkg.map(({ quest, reasons }) => (
          <li key={quest.id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="text-sm text-neutral-500">
              {packageItems[quest.item].emoji} {packageItems[quest.item].name}
            </p>
            <p className="mt-1 font-semibold">{quest.title}</p>
            <p className="mt-1 text-sm">{quest.description}</p>
            {reasons[0] && <p className="mt-2 text-xs text-orange-600">Why: {reasons.join(" · ")}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
