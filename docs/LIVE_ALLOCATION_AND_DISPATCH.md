# Live allocation and dispatch evidence

This batch covers next-018 (page-specific priority proof) and next-030 (adaptive YouTube discovery). It changes scheduling and diagnostics, without adding provider concurrency or automatic deep scans.

## YouTube discovery

Each automatic dispatch re-evaluates eligible creators. A mixed batch reserves at least 25% of its slots for discovery; a large, old or unchecked discovery backlog normally gets 75%. A discovery class with more recent failed attempts than successful observations also receives recovery capacity. Otherwise overdue known-live observations can use up to 75%, with ordinary batches split evenly. A one-slot dispatch chooses the oldest attempt across the two classes. Spare slots are borrowed when only one class has work.

Within each class, rotation uses the latest successful or failed attempt, then the successful observation and canonical creator ID as stable tie-breakers. Failure does not advance successful freshness or assert offline. Existing retry deadlines exclude only affected creators. Already dispatched creators remain excluded for that turn, so a slow response cannot consume another slot. Per-class diagnostics count distinct creators with successful observations and latest failed attempts in the previous five minutes, including creators waiting to retry. The displayed per-minute average is that distinct observation count divided by five, not a transfer rate or ETA.

The real store still uses three application requests of up to eight YouTube creators, with at most eight upstream live transfers and existing 80ms live pacing. Twitch, room-page and archive limits are unchanged. Successful-throughput accounting now admits the full followed YouTube population because adaptive dispatch can choose a newly due creator outside the initial sweep selection.

## Queue ownership

A page switch changes undispatched automatic work only. Deferred archive owners retry on their matching page; accepted responses still reconcile after pause/visibility gates open. Live requests use independent provider lanes, so a held archive cannot occupy their slot. Explicit archive requests remain available and eligible jobs are FIFO. Pause bypass changes eligibility, never insertion order; repeated bypass traffic cannot reverse an older eligible archive behind new jobs.

Settings → Pull management → Pull dispatch diagnostics shows the last twelve transitions from a bounded 64-event session trace. Queued, started, held response, completed, failed, cancelled and page-deferred states are distinct. The trace stores numeric request IDs, fixed lane/operation labels, times and elapsed queue time only. It stores no creator identifiers, URLs, credentials or response bodies and adds no polling or persistence. A started app request includes its internal server work; it does not imply that the upstream provider has replied. Opening the collapsed diagnostic subscribes only its small child component.

The server YouTube transport also offers a local diagnostics snapshot for controlled tests, with actual upstream starts recorded after pacing/readiness checks. This is not an exposed cross-user endpoint. Existing scoped/global cooldown revisions and body/transfer caps are preserved.

## Verification contracts

- scripts/live-allocation-batch.test.mjs: mixed debt/urgency/recovery policies, single-slot selection, absolute retry waits, 2,000 creators under failing-prefix and held-response pressure, FIFO/page changes, actual app-lane dispatch bound, real upstream cooldown isolation, and 100 bounded trace cycles.
- Fairness bound: in a simulated 2,000-creator population with 160 known-live creators, 600 permanently failing discovery creators and 24 held discovery requests, every other eligible creator is attempted within 400 one-second dispatches of up to eight creators. This is a simulated scheduling bound, not a guarantee of YouTube response time.
- Live admission bound: an idle live lane starts within 250ms in a deterministic local test while an archive response is held. Existing live-lane work, interaction/visibility gates, configured pacing or provider waits can delay actual network starts.
- scripts/live-priority-browser-check.mjs: isolated desktop/mobile browsers exercise the actual store, live rotation across 1,588 YouTube and 591 Twitch follows, stalled first YouTube response, archive priorities, idle checks, persistence and the new diagnostic controls.
- Existing quick-live, store admission, queue/pause, provider budget, cooldown and milestone migration suites remain regression gates.

No real-network throughput, physical phone behavior, authentication or long-running soak result is implied by controlled provider fixtures.
