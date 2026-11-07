# Saved searches and structured filters

Revision 90 · 2026-11-03 · next-121 and next-122

The bookmark button beside Search opens **Search workspaces**. Create a query using plain words, source, exact tags, exact category and a duration range in minutes. **Open search** applies it to the public or private desk. **Save as new** retains the query in the current local profile. Select a saved entry to rename or edit it with **Update selected**; arrow buttons reorder entries, and Remove deletes only that query. None of these actions pulls media or deletes catalog rows.

The public and private workspace lists are separate. Switching the editor's desk clears its draft fields. Private saved names and text are not rendered in the public list. Private searches still require the existing Adults unlock and ranking visibility checks. Saved profiles remain local profiles, with their existing privacy properties.

The existing Adults search box keeps its in-place tag behavior. Use the workspace editor to construct structured private queries.

Revision 91 adds [canonical Unicode matching and explicit local spelling suggestions](UNICODE_SEARCH_AND_SPELLING.md). Saved query version 1 remains compatible.

Revision 92 adds optional [publication/local-added date filters and count evidence](SEARCH_DATES_AND_COUNT_EVIDENCE.md), with explicit unknown and partial-date handling.

## Query contract

`src/lib/videos/search-query.ts` owns the version 1 model. It supports at most 300 text characters, eight exact tags of 80 characters each, an 80-character category and inclusive duration endpoints of 0–604800 seconds. Unknown durations do not match duration constraints. Tags include saved and inferred tags; category uses the personal category override, falling back to the media genre. All constraints must match. Public/private, hidden, unavailable and sample visibility are applied by the existing result owner.

The form uses minutes, converting to whole seconds before validation. Search also accepts these explicit operators:

```text
racing source:youtube tag:"racing" category:"Film" duration:600..3600
source:local duration:600..
tag:"space opera" duration:..7200
```

Supported sources are `all`, `youtube`, `twitch` and `local`. An explicit source replaces the implicit YouTube/Twitch desk constraint while preserving the private boundary. Without an explicit source, existing provider desk behavior remains. Operator-like literal words can be quoted, such as `"title: literal text"`. URLs and Windows drive paths remain plain text. Unsupported operators, malformed quotes, repeated singleton fields and invalid ranges explain the error and return no matches.

Active constraint chips use the same model. Removing a chip preserves text and all other fields. An unconstrained empty query returns to the existing Home behavior. Existing text tokenization, prefix expansion, topic aliases and ranking formula remain in use; this work does not introduce a multilingual index or semantic search.

## Ownership, storage and performance

- `structured-search.ts` sends only words to the existing search worker. Structured predicates then visit its matching ordinals. Plain indexed queries return the original worker packet directly. Filter-only queries and worker failures yield in cancelable slices and do not build a second index.
- Existing search effects abort replaced requests. Result query/snapshot identity and ranking scope checks reject late output before it can appear. Neither opening a workspace nor selecting a saved row starts background pulls.
- `search-workspaces.ts` stores a version 1 envelope at the profile adapter key `reelcase.search-workspaces.v1`: at most 32 queries and 96000 serialized characters. It contains only names, scope and query fields, without copied media graphs or result arrays.
- Writes happen only through explicit controls. A read-before-write baseline detects an already-changed tab and requires Reload saved searches; this is a localStorage conflict check, not a cross-process transactional lock. Quota failures preserve the prior bytes and leave edits available. Unsupported/future envelopes disable saving instead of replacing stored data with an empty list.
- Saved searches are local to this browser origin/profile. No cloud account, cross-origin transfer or provider integration was added. Profile configuration-only packs intentionally remain limited to their existing configuration allowlist; saved searches are not configuration fields.

## Verification

`screenshots/search-workspaces-tests.txt` records **143 passing tests**, covering query round trips and largest escaped values, invalid/future input, sparse 100000-row candidates, cancelable scans, worker fallback, ranking, keyboard draft ownership, profile isolation, quota/conflict preservation and the revision 90 migration. `screenshots/search-workspaces-regressions.txt` records **16 passing tests** for worker lifecycle and existing profile/storage/backup boundaries. Typecheck and production build pass.

Run the search workflow check with:

```text
node scripts/search-workspaces-browser-check.mjs http://127.0.0.1:8080/ screenshots/search-workspaces-dev.json
node scripts/search-workspaces-browser-check.mjs http://127.0.0.1:8083/ screenshots/search-workspaces-production.json
```

The check uses disposable desktop/mobile browser contexts with 3006 deterministic saved rows and a registered alternate profile. It verifies query generation and exact result title, keyboard/mouse chips, reload, rename, reorder, deletion, quota/range errors, public/private list separation, profile switching, rapid query replacement and future storage preservation. Dev and production consoles are clean. Desktop/mobile editor and result screenshots were inspected. Provider responses and companion calls are stubbed; no real library or provider download is used.

The mission migration promotes only next-121 and next-122 once, preserving earlier reopened milestones and custom notes. Default totals are **309/406 complete**, **107/200 next-level**, and **11/100 new batch**. Existing dev/production mission browser checks cover these totals, bounded queue paging, exports and persistence.

Both complete sidebar audits pass 66 page reports each. The final Home desktop/mobile smoke pass has no console errors, horizontal overflow, brand/auth warnings or production baseline divergence. Reports use the `screenshots/search-workspaces-*` prefix; the build, typecheck, feature workflow, mission migration, page inventory and Home verdicts are retained there.
