import Link from "next/link";

const philosophySections = [
  {
    title: "Concept Dictionary",
    href: "/philosophy/concepts",
    description:
      "Collect recurring philosophical concepts such as being, ground, cause, actuality, idea, subject, and substance.",
  },
  {
    title: "Text Maps",
    href: "/philosophy/texts",
    description:
      "Map the overall argumentative structure of a book, chapter, lecture, or section.",
  },
  {
    title: "Question Tracking",
    href: "/philosophy/questions",
    description:
      "Track philosophical questions that are still active, difficult, or not yet fully resolved.",
  },
  {
    title: "Outputs",
    href: "/philosophy/outputs",
    description:
      "Turn concepts, texts, and questions into short essays, reading reports, or research plans.",
  },
];

export default function PhilosophyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Philosophy Learning Area
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
          This is not a daily note space. It is a long-term philosophical
          database where daily learning results become searchable, cumulative,
          and reusable.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">How This Fits the Programme</h2>
        <div className="mt-4 grid gap-4 text-sm text-neutral-600 md:grid-cols-2">
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="font-bold text-neutral-950">
              Study Schedule / Daily Result
            </p>
            <p className="mt-2 leading-6">
              Records what I read today, the current argument, and where I got
              stuck. It preserves the daily learning scene.
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="font-bold text-neutral-950">
              Philosophy Learning Area
            </p>
            <p className="mt-2 leading-6">
              Organizes daily learning into long-term concepts, text
              structures, question threads, and finished outputs.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {philosophySections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:bg-neutral-50"
          >
            <h2 className="text-lg font-bold">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {section.description}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
