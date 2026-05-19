import Link from "next/link";

const quickActions = [
  {
    title: "Review recent learning",
    description: "Open your recent vocabulary, sentences, and articles.",
    href: "/review",
    label: "Open Review",
  },
  {
    title: "Add vocabulary",
    description: "Generate translation candidates from a Chinese prompt.",
    href: "/vocabulary",
    label: "Open Vocabulary",
  },
  {
    title: "Add sentence",
    description: "Generate target-language sentences from Chinese prompts.",
    href: "/sentences",
    label: "Open Sentences",
  },
  {
    title: "Add article",
    description: "Generate or save reading materials for language practice.",
    href: "/articles",
    label: "Open Articles",
  },
];

const modules = [
  {
    title: "Vocabulary",
    href: "/vocabulary",
    description:
      "Enter Chinese prompts and generate target-language vocabulary with contextual nuance.",
    features: [
      "Chinese prompt → target-language candidates",
      "Bracket context, e.g. 規定性[黑格爾哲學]",
      "Nuance comparison",
    ],
  },
  {
    title: "Sentence Practice",
    href: "/sentences",
    description:
      "Turn Chinese prompts into English, German, or Russian sentences with explanations.",
    features: [
      "Chinese prompt → target sentence",
      "AI grammar explanation",
      "Notes for later review",
    ],
  },
  {
    title: "Articles / Reading Practice",
    href: "/articles",
    description:
      "Generate, save, edit, and review reading materials across your target languages.",
    features: [
      "AI article generation",
      "Chinese translation",
      "Reading notes",
    ],
  },
];

const languageModules = [
  {
    title: "English",
    href: "/languages/en",
    description: "C1-level reading, vocabulary, and sentence practice.",
  },
  {
    title: "Deutsch",
    href: "/languages/de",
    description: "A1-level German learning with simple structures and examples.",
  },
  {
    title: "Русский",
    href: "/languages/ru",
    description: "Beginner Russian practice with basic vocabulary and sentences.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-neutral-200 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            ChunDuan&apos;s Learning Programme
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            A personal language-learning workspace for vocabulary, sentence
            practice, reading, review, and daily learning records.
          </p>
        </header>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                Today&apos;s entry point
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Start from review, then continue building.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
                Your learning system now has three connected language databases:
                vocabulary, sentences, and articles. The Review page gathers
                recent items into one place, so you can return to what you have
                just learned before adding new material.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/review"
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-950 shadow-sm hover:bg-neutral-50"
                >
                  Open Review
                </Link>

                <Link
                  href="/daily-log"
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-950 shadow-sm hover:bg-neutral-50"
                >
                  Write Daily Log
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-neutral-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                Current system
              </p>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-medium text-neutral-950">
                    Vocabulary + AI
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Chinese prompt to translation candidates and nuance.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-medium text-neutral-950">
                    Sentences + AI
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Chinese prompt to target-language sentence.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-medium text-neutral-950">
                    Articles + AI
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Generated readings with translation and notes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                Quick actions
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Continue learning
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{action.title}</h3>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {action.description}
                </p>

                <p className="mt-4 text-sm font-medium text-neutral-950">
                  {action.label} →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
              Core modules
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Language learning databases
            </h2>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-2xl font-semibold">{module.title}</h3>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {module.description}
                </p>

                <div className="mt-5 grid gap-2">
                  {module.features.map((feature) => (
                    <p
                      key={feature}
                      className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600"
                    >
                      {feature}
                    </p>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
              Languages
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Language dashboards
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {languageModules.map((languageModule) => (
              <Link
                key={languageModule.href}
                href={languageModule.href}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-2xl font-semibold">
                  {languageModule.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {languageModule.description}
                </p>

                <p className="mt-5 text-sm font-medium text-neutral-950">
                  Open dashboard →
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}