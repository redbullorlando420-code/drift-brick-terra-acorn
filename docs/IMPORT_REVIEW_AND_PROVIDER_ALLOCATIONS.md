# Large import review and provider allocation safeguards

Revision 66 · 2026-10-29 · next-017 and next-012.

## Creator import workflow

The YouTube and Twitch import tools now review the draft before submitting it. A list of 10,000 entries mounts at most ten review rows, using a fixed 112 px row and a 448 px viewport with overscan. The list supports Arrow Up/Down, Home/End and Space/Enter; focus is identified by canonical query rather than a mounted DOM index. Filtering and status changes keep the underlying choices intact. Lists over 10,000 entries show a clear review limit; the full bounded draft remains saved so the user can split it.

Exact links/handles are ready for an explicit import; plain YouTube names start held. Including a name authorizes checking it, not guessing an identity: the existing server resolver must still find one unambiguous public creator. Already verified sources are disabled. Bulk query submission, public Twitch follow discovery and saved-list controls route into review. Single-source actions keep their existing behavior.

Each click submits at most 50 reviewed entries through the existing importer and its smaller provider request batches. Normal batches skip prior failures. The Failed filter offers a separate explicit retry. Provider errors and unfinished work retain their choices. Failure status survives beyond the bounded 128-reason cache, so a long failing prefix cannot repeatedly consume normal batches after its message strings are evicted. A local submission latch prevents double clicks while the existing durable draft writer is flushing.

The optional version-1 review sidecar lives inside the existing import session: choices, status/filter, logical focus key and bounded failure reasons. The existing 300 ms coalesced writer, browser mirror and IndexedDB backup handle persistence. Older sessions retain their original shape when they have no review data. Choice records cap at 10,000 keys / 2 MiB of estimated key payload; current-draft changes prune irrelevant decision keys. These are import decisions, not library deletions or changes to personal feedback.

Reviewed drafts are separated from accepted recovery entries. Holding/excluding a draft row never seeds an unrelated follow stub. Reviewed batches do not automatically resume at startup, including with automatic pulls enabled. Existing legacy saved-list recovery still works for sessions without a review sidecar. Accepted batch work continues to respect global pause, visibility and existing provider cooldowns; the review explicitly explains when Resume pulls is needed. Cancelling a batch leaves unprocessed choices available for a later explicit action.

## Provider JSON and retained archive rows

Previously, responses had an 8 MiB decompressed body limit, but a compact JSON body could still allocate a large graph. Older archive renderer retention also kept command/tracking trees that the catalog never consumed.

`provider-json.ts` scans serialized JSON before calling JSON.parse. Per page it enforces:

- Existing 8 MiB UTF-8 response ceiling.
- At most 120,000 lexical value/key/container tokens and 40,000 containers.
- Maximum nesting depth 96 and 256 Ki UTF-16 units in one serialized string.
- A 32 MiB declared scratch payload estimate: UTF-8 text bytes + UTF-16 text units × 2 + tokens × 24 + containers × 64.

This estimate is a structural payload safeguard, **not an exact engine heap ceiling**. It does not include every allocator, transport/body copy, concurrent page, sorting array or browser process. Actual engine object overhead and GC vary. There is no claim of a process-wide 32 MiB RAM limit.

The guarded reader is used for public JSON metadata reads and embedded YouTube initial/player JSON. A graph-budget rejection is propagated as a budget failure, not swallowed as an empty channel. Existing walkers keep earlier accepted pages and their safe continuation on later failures. Twitch archive responses over their 100-row page contract and overlong identities/cursors are rejected rather than truncated into a new identity.

YouTube retained archive renderers and Twitch archive users now project only consumed catalog fields. Titles, description snippets, format/live markers, publication evidence, runtime, views, creator labels, artwork and legal page cursors survive. Unused menus, commands, tracking and unrelated trees leave with the provider page. Identity/cursor strings are never shortened into different identities. Deep results retain the existing durable-library/cache policies and unchanged card references.

The server retains at most 16 scalar parse samples, without payloads, URLs, headers or account data. Rejected samples count only the prefix scanned before rejection. Settings → diagnostics describes the graph limits; no new diagnostics poll, provider request, account access or cache clone is added.

## Reproducible allocation baseline

Run:

```text
node --expose-gc scripts/provider-allocation-benchmark.mjs screenshots/provider-allocation.json
```

The version-1 synthetic fixtures contain 100 YouTube/Twitch rows, 20 unused commands per menu and 256 tracking characters per command. The baseline gates require a scratch payload estimate below 6 MiB and a projected 100-row page below 128 KiB, with projected payload below one quarter of legacy retained payload. Measured serialized payloads:

| Fixture | Raw response | Legacy retained rows | Compact retained rows |
| --- | ---: | ---: | ---: |
| YouTube | 1,243,291 B | 1,241,491 B | 31,491 B |
| Twitch | 619,587 B | 619,471 B | 12,271 B |

The benchmark also reports heap growth at parse/projection checkpoints when GC is available. Those samples can miss transient peaks and are not used as a portable heap gate. The fixtures are deterministic representations of supported fields, not real-provider throughput or long-running production memory measurements.

## Checks

```text
node .grok/import-payload-regressions.mjs
node .grok/room-workflow-regressions.mjs
npm run typecheck
npm run build
node scripts/import-review-browser-check.mjs http://127.0.0.1:8080/ screenshots/import-review-dev.json
node scripts/mission100-browser-check.mjs http://127.0.0.1:8080/ screenshots/import-payload-mission-dev.json
```

The regression runner caps file concurrency at two. It checks provider/import scripts, native YouTube adapters and remote merging. Tests cover pre-parse rejection, escaped/multibyte strings, exact string ceilings, compact projections, continuation preservation, a 100k-card refresh with unchanged references, 10k review windows, durable decisions and explicit retries. Three older native fixtures were updated to supply required publication provenance / the already-existing metadata field; production date/mix/playlist behavior was preserved.

The browser check uses isolated 10,000-name drafts, controlled provider responses and desktop/mobile Chromium emulation. It checks keyboard review, reload persistence, pause/resume, ambiguous failure recovery, explicit verified admission and automatic-recovery isolation. No real follows or account cookies are used. Repeat against built output, and use the Home smoke check to compare desktop/mobile hydration and layout. Physical-phone and real-provider soak behavior remain unverified.
