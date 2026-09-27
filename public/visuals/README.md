# Phase 2 visual assets

Put the images at these repository-relative paths. Directory placeholders are committed with `.gitkeep`.

| Surface | Exact file |
| --- | --- |
| Home — Languages | `public/visuals/home/languages/cover.webp` |
| Home — Philosophy | `public/visuals/home/philosophy/cover.webp` |
| Home — Fitness | `public/visuals/home/fitness/cover.webp` |
| Home — Record | `public/visuals/home/record/cover.webp` |
| English | `public/visuals/languages/en/cover.webp` |
| German | `public/visuals/languages/de/cover.webp` |
| Russian | `public/visuals/languages/ru/cover.webp` |
| Japanese | `public/visuals/languages/ja/cover.webp` |
| Ancient Greek | `public/visuals/languages/grc/cover.webp` |
| Latin | `public/visuals/languages/la/cover.webp` |
| Cross-language | `public/visuals/languages/cross-language/cover.webp` |
| Main installation icon | `public/visuals/pwa/main/icon-512.png` |
| Languages installation icon | `public/visuals/pwa/languages/icon-512.png` |
| Philosophy installation icon | `public/visuals/pwa/philosophy/icon-512.png` |
| Fitness installation icon | `public/visuals/pwa/fitness/icon-512.png` |
| Record installation icon | `public/visuals/pwa/record/icon-512.png` |

Covers use a 16:10 slot with `object-fit: cover`. `VisualEntryCard` accepts `aspectRatio`, `alt`, `subtitle`, and independent `primary` / `language` variants. Paths are centralized in `src/lib/environments.ts` and `src/lib/languages/config.ts`.

Icons must be square PNGs, separate from covers. Each PWA directory optionally accepts `icon-192.png` and `icon-180.png`; otherwise the icon route scales its `icon-512.png`. When no icon exists, the route generates a neutral initial-based placeholder of the correct size. No language-specific PWA icons are created.

Rebuild/redeploy after adding assets: static page rendering checks which files exist. There is no need to change routes or layout. Missing covers render neutral placeholders and image loading failures also fall back safely.
