# Supabase migration history reconciliation (2026-09-27)

The app and Supabase CLI are linked to project `zhvxolrdkxeiznnazoji`. The remote
history contained two versions whose original SQL was missing from the local
`supabase/migrations` directory. `supabase migration fetch --linked` restored
the authoritative remote versions:

| Remote version | Purpose | Equivalent older local copy retained here |
| --- | --- | --- |
| `20260614135240` | Textual Linker tables and policies | `202606140002_create_textual_linker.sql` |
| `20260710155951` | Japanese learning tables and policies | `202607100001_create_japanese_learning_tables.sql` |

The older files had the same SQL after newline and trailing-semicolon
normalization, but their versions were never applied remotely. They are kept
here for provenance, outside the active migration directory, so the CLI will
not try to replay their DDL. The files with remote versions live in
`supabase/migrations` and are the authoritative active migrations.

Before pushing, `db push --linked --include-all --dry-run --skip-vault` listed
exactly four local-only versions. They were then applied successfully:

| Version | Purpose |
| --- | --- |
| `202606130001` | Philosophy learning tables |
| `202606140001` | Night Sparks table |
| `202607220001` | Japanese column on legacy sentences |
| `20260927032145` | Language Programme Phase 1 fields, notes, comparisons and text relations |

The other already-applied versions are `20260719054338` (fitness tables) and
`20260719054503` (updated-at function hardening). All eight active versions
now appear in both the local and remote migration lists. Neither `db pull` nor
`migration repair` was needed. No remote database reset was performed.

The Phase 1 migration added `meanings`, `tags`, `metadata`, and
`language_metadata` where needed on existing vocabulary, Japanese vocabulary,
sentence, Japanese sentence, and article tables, plus the legacy sentence
`japanese` column and article `text_type`/`custom_type`. It created
`language_notes`, `language_comparisons`, `language_comparison_links`,
`sentence_text_sources`, and `vocabulary_text_occurrences`. These new tables
have row-level security and authenticated-user grants. The philosophy and
Night Sparks migrations added five more tables with RLS.

Exact row counts in nine existing tables matched before and after the push:
articles 3, food_entries 35, japanese_sentences 0, japanese_vocabulary 0,
sentences 20, text_link_queries 6, text_link_results 30, vocabulary 24, and
weight_entries 4. Existing article, sentence, vocabulary, and Textual Linker
rows were readable under the authenticated role after migration. The new
JSONB fields had safe defaults on all existing rows.

Read-only PostgREST requests for the new projections on vocabulary, Japanese
vocabulary, sentences, and articles all returned HTTP 200, confirming that
the Data API schema cache also recognizes those columns.

Authenticated, rollback-only remote transactions verified insert, update, and
readback of language-specific vocabulary fields for English, German, Russian,
Japanese, Ancient Greek, and Latin. Greek and Latin noun and verb fields were
covered. A second rollback-only transaction verified grammar notes, a
cross-language comparison with two links, sentence-to-text sources, and
vocabulary occurrences; deferred constraints passed. Follow-up queries found
zero test rows. Local checks passed: 40 tests, TypeScript typecheck, and
production build. ESLint passed with three existing `no-img-element` warnings.

Browser-level authenticated save-and-refresh checks were not available in this
run, so the SQL checks do not prove the live site's UI flow or deployment state.
