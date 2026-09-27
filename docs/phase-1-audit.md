# Phase 1 architecture audit

- Next.js 16.2.6 App Router, React 19, Tailwind 4; existing Supabase client/auth session.
- The root AppShell couples authentication to a global desktop/mobile sidebar. Split out auth gating; keep one session and preserve the intended URL.
- Vocabulary, sentences and articles are Supabase tables. Legacy language values are English / Deutsch / Русский / 日本語; sentences also have multi-language rows (`mode=all`).
- Japanese vocabulary/sentences, kana, analysis and Anki use separate existing tables. Preserve IDs and Japanese tools behind adapters, not a new independent vocabulary system.
- Comparison documents and term alignments contain copied legacy text. Keep a read-only compatibility archive; new comparisons use references to official entries.
- Articles remain the backing table for Texts. Add fields rather than rename/drop tables. Existing IDs, notes, translation and metadata survive.
- Philosophy has concepts/texts/questions/outputs with its own navigation. Fitness has food/weight tabs. Their components and data logic stay unchanged.
- Schedule/progress/daily-log pages delegate to shared components; relocate wrappers only.
- Night Sparks has a localStorage fallback; other learning modules use Supabase. Leave unrelated storage intact.
- No existing manifest/service worker or icon assets. Add five manifests/entry metadata with independent icon fallbacks.
- Preserve pre-existing uncommitted changes in the four AI API routes, sentence/article pages and Japanese sentence migration.
- Static en/de/ru/ja routes currently shadow the dynamic language page. Replace with one validated dynamic architecture; retain static reference content and Japanese tools under that architecture.

Database inspection was read-only. Deployment of schema changes is separate from local source changes.
