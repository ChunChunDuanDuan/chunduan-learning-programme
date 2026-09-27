# Grammar Tables Phase 1 — pre-change audit

Date: 2026-09-27. The existing repository has uncommitted Phase 1/2 work; preserve it.

| Area | Observed state | Decision |
| --- | --- | --- |
| `/languages/grc`, `/languages/la` | Both use the same overview and dynamic language layout; modules come from `languages[code].modules`. | Add one module only to Greek and Latin configuration. |
| Grammar | `language_notes` is the user's explanatory Grammar/Concept CRUD. | Keep it intact; reference its records by matching same-language topic/title/tags. |
| Vocabulary | `vocabulary` retains IDs and has `language_metadata` JSON. Greek noun field is `declension_noun_class`; Latin noun field is `declension`. | Match explicit metadata values, including a backwards-compatible `declensionClass` key; do not infer from word endings. |
| Persistence | `loadLanguage` already scopes rows to an authenticated user and language. Existing local storage is used for recent language path; no favorite preference table was found. | Reuse `loadLanguage` for related entries; persist favorite table IDs in user- and language-scoped local storage. No migration. |
| Routes | Shared `[module]` and `[entryId]` pages already serve all six languages. | Branch on `grammar-tables` only for `grc` and `la`; keep all existing modules untouched. |
| Responsive | Shell uses `min-w-0`, `max-w-6xl`, mobile padding, and wrapping local navigation. No Grammar Tables view yet. | Keep page width constrained and scroll only the table wrapper on narrow screens. Device visual verification still required. |
| Context isolation | Language local navigation stays within its language; Cross-language is separate. | No cross-language links or Grammar Tables tab for English/German/Russian/Japanese. |

Content convention: the [Open University Reading Greek reference](https://fass.open.ac.uk/sites/fass.open.ac.uk/files/files/classical-studies/Reading_Greek_Language_Reference_Book_May_2022.pdf) confirms 1a–1d, 2a–2b, and the early third-declension types. Greek tables are Attic-oriented references, not an exhaustive morphology engine. Latin forms and case uses were checked against [Dickinson College Commentaries' Allen and Greenough grammar](https://dcc.dickinson.edu/grammar/latin/rules-noun-declension).
