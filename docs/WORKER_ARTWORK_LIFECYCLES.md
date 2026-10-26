# Worker recovery and artwork lifecycles

## Application-owned workers

| Owner | Failure / cancellation boundary | Recovery |
| --- | --- | --- |
| Search index | One worker, generation-owned callbacks and a 15-second response watchdog. Pending requests are capped at eight. A changed catalog settles obsolete requests; worker errors, unreadable results and postMessage errors drop its catalog and pending callbacks. | The existing cooperative catalog scan remains available. Search shows an explicit Retry search index control. A failed index does not restart on each new keystroke. Retry builds the current snapshot/query. Idle retirement still releases the worker. |
| Preview suggestions | One shared short-lived worker/candidate map, target generation and request ID. A 30-second deadline covers packing/ranking. Error, unreadable message, invalid result, timeout and failed postMessage release the worker, scheduled build and candidate references. | Keep compatible completed suggestion IDs and show Retry preview suggestions. Failure is latched across incidental metadata/watch-count changes; retry, explicit Refresh suggestions or a new title may start work. Closing the preview retains the existing one-second reuse grace, then releases it. |
| YouTube personal ranking | A disposable worker per active snapshot. Shelf/page outcomes are tracked separately under a 30-second watchdog. Structured-clone failures, worker/message errors, malformed bounded results and cancellation release enrichment holds and the worker. | Existing compatible shelves and newest-first browsing remain available. Retry personal ranking explicitly builds fresh work. Incidental input updates do not silently retry a failed job. |
| Statistics | Existing acknowledged 256-row packets and 30/60-second watchdogs remain. Failure aborts packing, releases waits and stops the worker; old callbacks cannot update an aborted scope. | Pending resolves to an error state. Retry is available for initial failure and while showing a previous completed snapshot. |
| Adult browse | Existing one-active/one-latest job ownership remains. The deadline starts before packing, not just after the final browse message. Failed owners drop queued/sent snapshots and cannot publish late results. | Existing compatible results remain; pending is false on failure and the existing explicit retry control starts a new worker. |

Provider transport jobs and optional vision/runtime SDK internals are separate owners. This batch does not claim a new provider network scheduler or a resumable ML engine. No optional model download or external call was started to test recovery. Worker errors use fixed user-facing messages rather than recording native error text, titles, paths or URLs.

## Native artwork ownership

Photos dimension reads and local thumbnail frame extraction share a bitmap pool. It dispatches at most four native createImageBitmap calls (or the current smaller profile ceiling) and retains at most 96 waiting jobs. In normal use photo batches and thumbnail workers are smaller than that queue limit. The pool subscribes to profile changes only while work exists.

Native createImageBitmap cannot be forcibly aborted. Cancelling its caller rejects promptly, removes queued source references and prevents publication. An already-dispatched native call keeps its slot until its actual promise settles; an obsolete returned bitmap is closed. This prevents rapid navigation from replacing cancelled calls with unbounded new native calls. A reduced profile can temporarily show more in-flight native calls than its new ceiling; no new dispatch occurs until those calls drain. The global hard ceiling remains four. A permanently stuck native call keeps its slot rather than permitting unbounded replacements.

Thumbnail capture owns a decoder abort scope, video element, timer and canvas. Completion, timeout and cancellation stop/reset the video, withdraw pending decoder work and zero the canvas. A delivered bitmap is closed immediately after drawing, before waiting for canvas encoding. Late encoded blobs cannot enter the cache after cancellation. The existing bounded artwork cache revokes evicted blob URLs, immediately applies lower profiles and bounds late disk/Companion recalls. Deliberately saved artwork remains on disk.

Remote card artwork uses existing revocable image admission. Lowering the budget withdraws excess unfinished low-priority cards first. Hiding the page or opening a viewer removes unfinished DOM image sources without treating a healthy URL as a failed candidate; returning may resume it. Legacy one-shot owners retain responsibility for releasing their own leases. Browser network/cache/decoded-image internals cannot be measured or forcibly freed through this DOM contract; no exact browser/GPU memory claim is made.

Photos abort their dimension jobs on unmount. Photo-owned object URLs are revoked by the existing owner cleanup; returned dimension bitmaps are always closed and cancelled results do not change saved metadata. The pool's late-completion path retains no URL or bitmap after close.

## Diagnostics

Settings → Enable diagnostics → Performance scorecard records small, on-demand snapshots: search state/generation/pending count, admitted image counts, native decode active/queued/limit, cancellation and obsolete-close counters and peak native calls. It adds no polling, image buffers, title log or source URLs. Export measurements uses the existing count/timing export. Existing opt-in diagnostics consent remains required.

## Evidence and limits

- Deterministic tests exercise 100 cancelled decode cycles, full queue backpressure, disposal, native failure, profile reductions, search crash/timeout/constructor/postMessage failure, bounded pending work and late/superseded result isolation.
- Isolated desktop and 390x844 Chrome use real application workers with deliberate error events. Tests verify search fallback/latest-query retry, preview refresh failure/retry, statistics constructor failure, YouTube ranking recovery and exported diagnostics. A real browser-generated PNG is used for held native bitmap completion. Repeated photo navigation leaves four native calls, closes all four obsolete bitmaps and releases all photo URLs.
- The existing artwork lifecycle browser fixture now performs 100 viewer interruptions per viewport against 60,000 synthetic YouTube rows, held CDN responses and offline Companion. It verifies returning artwork, lower profile admission, text-first mode across real tabs and bounded mounted image counts. This measures application ownership and DOM retention, not an eight-hour soak or exact OS/browser heap bytes.
- No real provider availability, physical phone, optional ML model, native Companion process or GPU resource measurement is established by these fixtures. The eight-hour soak, provider allocation benchmark, recommendation CPU budgeting and other roadmap work remain separate.
