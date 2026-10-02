# YouTube request regression verification — 2026-10-02

## Findings and changes

- The app job queue did not pace upstream HTTP calls within a job. Archive continuations, imports, feeds and live checks could burst. YouTube metadata requests now share one process-local serial transport, including response body transfer, with the configured minimum gap between actual starts.
- Healthy routine creator refreshes now use one RSS request instead of fetching RSS, Videos and live pages every time. Empty/unavailable feeds retain page recovery. Live checks run separately and use confirmed channel IDs.
- An endpoint-only live/feed/details rate limit no longer blocks the archive. Explicit Google network blocks still hold all YouTube metadata requests, including comments/chat and oEmbed. These back off for 15, 30 and 60 minutes on consecutive blocked probes, honoring longer Retry-After values.
- Ambiguous old provider-wide cooldown checkpoints are ignored. New catalog/all deadlines remain durable without putting the catalog in localStorage.
- Request timeouts start when HTTP work starts, after queue/pacing waits. App job deadlines and YouTube import batch sizes accommodate slow pacing settings; Twitch-only imports retain their previous batch size.

## Validation

- Typecheck and production build passed.
- 30 focused JavaScript tests passed, covering actual request spacing/body serialization, scoped cooldowns, network block suppression, Retry-After, cancellation, queued request deadlines, public RSS/archive paths, import storage and real store admission.
- 42 catalog, live, page parsing, sweep and pull-scheduler tests passed.
- Dev and built-output smoke checks passed at 1280×800 and 390×844: visible content, no console/page errors, no horizontal overflow, no brand/auth warnings, no production divergence.
- Populated Chrome UI verified desktop/mobile YouTube navigation and cooldown notice. Saved favorites (35) and history (674) restore after reload. YouTube reports 67,703 distinct cached video IDs and zero duplicate cached rows, with 32,297 slots available under the 100,000 cap.

## Live limitation

The controlled HTTP diagnostic received HTTP 429 with Google's explicit unusual-traffic response for a saved creator's Videos page; RSS returned 404. An automatic retry subsequently displayed the same explicit block and a new quiet period. Successful catalog growth is therefore not yet verified against the live provider. No CAPTCHA, identity rotation or network-block bypass was attempted. The app request amplification is established; it is not proof that it was the sole cause of Google's block.

The serial transport is local to one server process; it does not establish coordination between separately deployed server instances. Windows preview was started through the existing npm preview script because preview:restart requires Linux /proc. Preview was stopped after verification; the development app was left running.
