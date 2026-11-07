# Watch room: arrival, transitions and guest drafts

Milestones: **next-141**, **next-142**, **next-143**. Mission revision **97**.

## Guest arrival

The guest checklist sits next to connection recovery. Transport connectivity, receipt of authoritative host state, selected media and local player observations remain separate facts. A manual Ready vote never unlocks autoplay or proves playback.

The checklist offers the existing device-only Start action when a gesture is needed, player reload for an error or stuck preparation, and an independent provider fallback for unsupported embeds. Local media explains the host stream or approved matching-copy path without requesting a directory permission. Healthy playing and deliberately paused rooms offer no unnecessary Start action. Local playback observations do not claim equal live latency across devices.

## Authoritative item transitions

`room-transition.ts` gives the existing selection revision and media identity a local version-1 interpretation. Only an authoritative video or room-state packet establishes or advances a selection. Timing packets must match both the established revision and identity; a future sync cannot advance the revision before being rejected. Old clocks cannot rewind a repeated A → B → A title, and old readiness remains scoped to its selection. Existing timestamp, host identity, queue revision, receipts and permission checks still apply. Legacy revision-zero packets retain conservative compatibility.

Player observations and provider resources use a generation containing room, item identity, selection revision and reload generation. A replaced iframe or SDK listener cannot report readiness for its successor. Native/streamed player generations also track their source lifetime; device timing preferences remain separate from rebuilding media resources. An empty host state is accepted without inventing a selected video.

## Guest-local drafts

In **Find videos → My suggestion drafts**, guests can paste public YouTube/Twitch links or use **Add to draft** on a public search result. The list is stored in the existing profile namespace at `reelcase.room-guest-drafts.v1` on this browser origin. It supports metadata/provider preview, up/down ordering, removal, explicit reload and local clear. Draft editing never changes host playback or its queue.

- At most 16 rows are stored; one explicit submission selects 1–8 distinct rows in draft order.
- Provider identities are canonicalized and deduplicated. Local files, descriptions, posters, filesystem paths and unknown fields are excluded from persistence.
- Host-discovered rows carry the sharing revision at which they were staged. Changed/unverified sharing blocks submission and requires finding/staging the result again. The host also revalidates the existing delivered intent against current policy.
- Storage validation, conflict and quota failures preserve prior bytes and do not send a batch. Unsupported schemas remain untouched.
- Submitted status is saved **before** entering the existing acknowledged delivery queue. Its request IDs, reconnect retries, host deduplication, permissions and receipts remain authoritative.
- Submitted does not mean accepted. A reload cannot automatically resubmit a submitted draft. Ambiguous delivery stays conservatively locked; intentional retry requires the user to review receipts, acknowledge possible repetition, return selected rows to drafts, then submit separately.
- Unsent drafts survive disconnect/reload. A nonempty draft for another room is retained until the user returns there or explicitly clears it. This version stores one active room draft per local profile.

No new provider polling, background scheduling or per-keystroke storage writes are added. Reads/writes and list work are bounded; the draft list scrolls independently on small screens.

## Verification and limits

Automated evidence is under `screenshots/room-arrival-*`. The focused test set covers room clocks, delivery/outbox, queue ordering, catalog privacy, player observations, device settings, session files, schemas, draft bounds/claims/storage conflicts/profile isolation, and one-time milestone promotion. `scripts/watch-room-readiness-check.mjs` exercises actual desktop/mobile room transport, controlled YouTube/Twitch observations, decoded local MP4 streaming, rapid A/B/A transitions and guest drafts across reload. `scripts/watch-room-host-catalog-check.mjs` also proves host-result staging and rejection after sharing revocation. `scripts/watch-room-phone-check.mjs` covers blocked autoplay, clock skew, buffering, live/VOD switching and Twitch drift recovery.

Final results: build/typecheck passed; 238 focused automated tests passed; both navigation audits completed 66 reports with no failures; current/legacy Mission plan migrations passed. Home matched its baseline with clean consoles and no overflow. The Connection guide initially encountered a transient HTTP 429 during repeated full audits; subsequent complete development/production audits passed without suppressing that error. Desktop/mobile checklist, drafts and Home screenshots were visually inspected.

Use disposable profiles for browser checks. Build with `npm.cmd run build`, check types with `npm.cmd run typecheck`, then run the room checks against development and the built Vercel function host. Navigation and Home smoke checks cover desktop and mobile; current/legacy Mission plan migrations verify revision 97 without resetting earlier manual reopens or custom notes.

These checks use deterministic provider fixtures and real local WebRTC media. They do **not** establish physical iOS/Android autoplay policy, actual YouTube/Twitch account access, provider ads/embedding restrictions, equal live latency, or an overnight memory soak. External playback cannot be synchronized or observed by the in-app player. Local drafts do not sync across devices/origins, and explicitly retrying an ambiguous submitted suggestion can repeat it.
