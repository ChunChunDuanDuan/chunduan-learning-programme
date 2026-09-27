# Learning Programme 2.0 Phase 2 — Phase 1 audit

Audit date: 2026-09-27. Phase 1 changes are still uncommitted in the existing repository; Phase 2 builds on them without resetting that work.

| Area | Existing state | Phase 2 work |
| --- | --- | --- |
| Four environments | Four root entries, nested layouts, no global sidebar, separate PWA metadata | Centralize stable environment and local-navigation definitions; keep root authentication generic |
| Login | One Supabase browser client, safe `next` destination including nested paths | Keep shared mechanism; test nested destinations |
| Six language routes | One dynamic layout and one dynamic module route; no six duplicate pages | Keep shared pages; add search and entry detail routes |
| Vocabulary | Shared adapter, CRUD form, language metadata JSON, Text occurrences | Complete language/POS fields, dictionary display, filters, and Text-side relation workflow |
| Sentences | Shared CRUD and optional source Text relation | Complete Text-origin create/link workflow and detail links |
| Texts | Existing articles table adapted as Texts, types and custom type fields | Show/edit optional author/source; reuse saved custom types; complete relation UI |
| Grammar/Concepts | Structured `language_notes` table and shared CRUD route | Add cross-module search and more useful detail presentation |
| Search | Per-module scoped search, Greek normalization utility | Add one scoped `/search` for all modules and expand Greek equivalence tests |
| Cross-language | New comparison tables and atomic reference RPC, CRUD UI, inline entry creation, legacy read-only archive | Make linked-entry picker and edit flow easier to use, add filters and verify relation updates |
| Continue | Not implemented | Add language-specific last visited link on Overview; entering from `/languages` still opens Overview |
| Japanese tools | Old Kana, analysis, Anki tools retained behind shared routing | Preserve existing tools and avoid a second primary vocabulary/sentence implementation |
| Philosophy/Fitness/Record | Existing inner features retained, Record wrappers relocated | Regression only; future local modules require only their own environment changes |
| Visual assets | Neutral slots and fixed folder convention | Preserve unchanged; no final images or icon art |
| Legacy routes | Redirects in Next config and wrappers | Keep and retest |
| Phase 1 migration | Tested locally with PGlite, not applied to remote Supabase | Keep additive migration; ensure Phase 2 code works once prerequisites are applied |

Remote read-only inspection found that `language_notes`, `language_comparisons`, `language_comparison_links`, `sentence_text_sources`, and `vocabulary_text_occurrences` are absent. The remote migration history also predates the Phase 1 migration. This explains the current read-only warning. No remote schema or user rows were changed during this audit.

The existing remote language values are `English`, `Deutsch`, `Русский`, and one legacy `All` sentence with `mode = 'all'`; they match the adapters and legacy mixed-sentence path. No Greek or Latin source rows were present in the inspected legacy tables.
