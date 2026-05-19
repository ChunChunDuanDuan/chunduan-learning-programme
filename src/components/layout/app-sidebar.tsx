import Link from "next/link";

const sections = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/",
      },
      {
        label: "Review",
        href: "/review",
      },
    ],
  },
  {
    title: "Journal",
    items: [
      {
        label: "Daily Log",
        href: "/daily-log",
      },
    ],
  },
  {
    title: "Language Learning",
    items: [
      {
        label: "Vocabulary",
        href: "/vocabulary",
      },
      {
        label: "Sentence Practice",
        href: "/sentences",
      },
      {
        label: "Articles",
        href: "/articles",
      },
      {
        label: "English",
        href: "/languages/en",
      },
      {
        label: "Deutsch",
        href: "/languages/de",
      },
      {
        label: "Русский",
        href: "/languages/ru",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: "/settings",
      },
      {
        label: "Login",
        href: "/login",
      },
    ],
  },
];

export function AppSidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-neutral-200 bg-neutral-50 px-4 py-6">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Learning Programme
        </p>

        <h1 className="mt-2 text-lg font-semibold text-neutral-950">
          ChunDuan&apos;s
        </h1>
      </div>

      <nav className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs uppercase tracking-[0.18em] text-neutral-400">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm text-neutral-700 transition hover:bg-white hover:text-neutral-950 hover:shadow-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}