# Multilingual search and visible-catalog spelling

Revision 91 · 2026-11-03 · next-123 and next-124

Library search now uses canonical Unicode keys for titles, creators, tags and other already-indexed fields. For example, `CAFÉ` and `Cafe` followed by a combining acute accent find the same accented titles. `Cafe` remains distinct from `Café`; visually similar Latin and Cyrillic letters remain distinct. Cyrillic, Japanese, Arabic, Korean, astral letters and mixed punctuation are covered by fixtures. This is text matching, not translation or transliteration.

When a settled search has no results, **Try a spelling from this desk** may offer up to three alternatives. A correction must be one inserted, removed or changed code point in the normalized word, or an adjacent transposition, and be grounded in at least two eligible titles. Nothing applies automatically. Choosing a suggestion keeps the existing source, tag, category and duration constraints. Existing prefixes that already occur in the visible vocabulary do not trigger speculative corrections.

## Implementation and boundaries

- `src/lib/videos/search-text.ts` defines version 2 disposable keys: NFC composition, lowercase, then NFC again. The shared Unicode letter/mark/number tokenizer retains compound tag tokens and their hyphen/underscore segments. Worker search, cooperative fallback, legacy index, ranking and quick suggestions use the same normalization. Exact structured fields use `search-constraints.ts`.
- Stored names, creator spelling, stable IDs, manual tags and categories are never rewritten by normalization. There is no persisted search-index migration or full-catalog storage rewrite. The disposable worker rebuilds through the existing acknowledged packets, with at most 512 rows per packet and existing time/character budgets. Generation ownership, cancellation, idle retirement and the compact posting budget remain in place.
- `search-spelling.ts` creates a temporary vocabulary only for settled zero-result searches. It scans eligible metadata cooperatively with 128-row/four-millisecond slice budgets, checks abort before and after every yield, and retains at most 8192 short terms. Terms count once per title; for multiword queries, supporting titles must also contain the other query words. Only three alternatives survive deterministic frequency/order/word ordering.
- Vocabulary reads at most 512 title characters, 128 creator characters, an 80-character category and the first 24 tags of 80 characters each. It never reads paths, descriptions, private notes, history or watch activity. Supported correction queries contain one to four words of at least four code points and at most 32 UTF-16 units each. Limited samples may omit valid corrections; the UI labels a capped sample when showing suggestions.
- Public/private folder and provider identity, recovered-private markers, hidden/unavailable/sample flags, source scope and structured constraints are checked before vocabulary admission. Locked private desks return no vocabulary. The component does not mount in Watch Room/guest or provider-online search. No global vocabulary cache or persistent correction history is shared across profiles.
- The UI waits 350 ms, cancels replaced or inactive work, and publishes only a packet whose full eligibility input still matches. It hides stale suggestions before effect cleanup and rechecks visibility ownership on activation. Applying a correction changes only the query through the existing search owner; there are no remote calls, automatic rewrites, storage autosaves or new pollers.

## Verification

`screenshots/unicode-search-tests.txt` records **186 passing tests** covering normalization, exact Unicode fields, original data preservation, all edit types, co-occurrence/frequency evidence, private/hidden/guest exclusions, bounded 100000-row scans, vocabulary/candidate limits, cancellation, fallback/ranking, worker lifecycle/topic aliases, profile/storage boundaries and the revision 91 migration. Production build and typecheck pass.

Reproduce the interactive check:

```text
node scripts/unicode-search-browser-check.mjs http://127.0.0.1:8080/ screenshots/unicode-search-dev.json
node scripts/unicode-search-browser-check.mjs http://127.0.0.1:8083/ screenshots/unicode-search-production.json
```

The isolated desktop fixture contains **100012** saved rows, and mobile contains **10012**. It drives the real app and worker, replaces a query during index construction, checks canonical-equivalent and distinct spellings, exercises exact tag/category filters, chooses a correction by keyboard, preserves source/duration chips, verifies private-only vocabulary stays absent from the public desk, retires stale corrections and reloads without changing original decomposed title spelling. Provider and companion responses are stubbed; no real user profile or upstream download is involved. Rendered desktop/mobile suggestion panels are inspected.

Revision 91 promotes only next-123 and next-124 once. Prior reopens and custom notes remain intact. Default totals are **311/406 complete**, **109/200 next-level**, and **13/100 new batch**. Migration, mission paging/exports, full navigation and Home render checks use the `screenshots/unicode-search-*` report prefix.

Both complete navigation audits pass 66 desktop/mobile page reports each. Home smoke checks have clean consoles/layout, no brand/auth warnings and no production baseline divergence. The temporary production QA server was stopped after verification; the existing application server remains running.

Limits: NFC/lowercase preserves accents and script distinctions; it does not implement locale-specific collation, phonetic matching or translation. Spelling suggestions are deliberately conservative, use a bounded visible metadata sample, and do not search captions, private notes or online catalogs. Physical-phone timing and long-session memory soak remain separate verification work.
