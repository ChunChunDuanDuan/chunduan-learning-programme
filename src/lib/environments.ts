export const ENVIRONMENT_KEYS = ["languages", "philosophy", "fitness", "record"] as const;
export type EnvironmentKey = (typeof ENVIRONMENT_KEYS)[number];
export type PwaKey = "main" | EnvironmentKey;

export type LocalLink = { label: string; href: string };
export type EnvironmentDefinition = {
  id: EnvironmentKey;
  name: string;
  title: string;
  basePath: `/${EnvironmentKey}`;
  href: `/${EnvironmentKey}`;
  visual: string;
  pwa: { name: string; startUrl: string; icon: string };
  localNavigation: readonly LocalLink[];
};

function environment(id: EnvironmentKey, name: string, localNavigation: LocalLink[] = []): EnvironmentDefinition {
  const basePath = `/${id}` as const;
  return {
    id, name, title: name, basePath, href: basePath,
    visual: `/visuals/home/${id}/cover.webp`,
    pwa: { name, startUrl: basePath, icon: `/visuals/pwa/${id}` },
    localNavigation,
  };
}

export const environments: Record<EnvironmentKey, EnvironmentDefinition> = {
  languages: environment("languages", "Languages"),
  philosophy: environment("philosophy", "Philosophy"),
  fitness: environment("fitness", "Fitness"),
  record: environment("record", "Record", [
    { label: "Record", href: "/record" },
    { label: "Schedule", href: "/record/schedule" },
    { label: "Progress", href: "/record/progress" },
    { label: "Daily Log", href: "/record/daily-log" },
  ]),
};

export const pwaEntries: Record<PwaKey, { title: string; startUrl: string; icon: string }> = {
  main: { title: "Learning Programme", startUrl: "/", icon: "/visuals/pwa/main" },
  ...Object.fromEntries(ENVIRONMENT_KEYS.map((id) => [id, {
    title: environments[id].pwa.name,
    startUrl: environments[id].pwa.startUrl,
    icon: environments[id].pwa.icon,
  }])) as Record<EnvironmentKey, { title: string; startUrl: string; icon: string }>,
};
