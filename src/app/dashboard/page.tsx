import Link from "next/link";

const dashboardSections = [
  {
    title: "Study Schedule",
    href: "/schedule",
    description: "Plan today's learning blocks, stopping points, and return paths.",
  },
  {
    title: "Night Sparks",
    href: "/night-sparks",
    description: "Keep thinking lightly at night when philosophy is too heavy to read.",
  },
  {
    title: "Learning Progress",
    href: "/progress",
    description: "Review uploaded daily results and watch the programme accumulate.",
  },
  {
    title: "Daily Log",
    href: "/daily-log",
    description: "Record the day without turning every reflection into a formal task.",
  },
];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          ChunDuan&apos;s Learning Programme control room.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:bg-neutral-50"
          >
            <h2 className="text-lg font-medium">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {section.description}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
