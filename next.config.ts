import type { NextConfig } from "next";
import { LANGUAGE_CODES, languages } from "./src/lib/languages/config";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.68.55"],
  async redirects() {
    const modules = { vocabulary: "vocabulary", sentences: "sentences", articles: "texts" };
    return [
      ...Object.entries(modules).flatMap(([source, module]) => [
        ...LANGUAGE_CODES.flatMap((code) => languages[code].aliases.map((alias) => ({ source: `/${source}`, has: [{ type: "query" as const, key: "language", value: alias }], destination: `/languages/${code}/${module}`, permanent: false }))),
        { source: `/${source}`, destination: "/languages", permanent: false },
      ]),
      ...["schedule", "progress", "daily-log"].map((route) => ({ source: `/${route}`, destination: `/record/${route}`, permanent: false })),
      { source: "/language-comparison", destination: "/languages/cross-language", permanent: false },
      { source: "/review", destination: "/languages/cross-language", permanent: false },
      { source: "/dashboard", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
