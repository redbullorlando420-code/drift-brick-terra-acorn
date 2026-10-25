# LAN Watch Room implementation guide

## Guest ready checks, votes and playback access

Use **Ready & votes** in the room shortcut bar to reach **Make it a group watch**. Every connected person can choose **I’m ready** or **Need a moment**, and cast one latest vote for an upcoming video. Guest choices are confirmed by the host. A vote never starts, skips or reorders playback: the host can explicitly choose **Put the top vote next**, using the normal queue action and Undo behavior. Ties keep the current queue order. Votes disappear when a title is consumed/removed or its voter leaves. Readiness and votes are session-only and remain available while queue editing is locked.

The host independently controls **Allow guests to play and pause** and **Allow guests to seek videos**. Both default on and are saved in the host’s existing browser storage; guests receive the confirmed policy on join/reconnect. The host checks incoming requests as well as disabling guest buttons. A seek-only guest cannot change playback state, and a playback-only guest cannot smuggle a timeline jump. Live feeds keep independent provider clocks and do not support shared seeking. Device-only start/reload, readiness, voting and chat remain available when shared controls are locked.

Participation uses bounded host-owned peer state (65 people, existing 48-title queue), transport identities and semantic updates. Ordinary clock heartbeats add no participation messages, provider polling or storage writes. Host reload begins a fresh participation session; it does not erase the separately saved public queue. This uses the existing cooperative room trust model.

## Twitch guest embed setup on a phone

Twitch requires an HTTPS embedding page and a player at least 400 × 300 pixels. A desktop loopback preview can behave differently from a phone using an HTTP household-network address. Enlarging the player or copying the desktop hostname into the phone’s parent field does not supply HTTPS.

The room builds Twitch parents from the current viewer’s hostname and available actual ancestor origins, replacing stale catalog parent values. The SDK derives its live channel/VOD from the canonical provider URL. Mobile live/VOD/clip stages retain the official minimum dimensions in a horizontally scrollable viewport; rotate the phone for more space. Status messages sit below Twitch, rather than covering its controls. A bounded readiness timeout provides recovery without reload loops.

An HTTP network guest receives **Twitch needs an HTTPS room address** and the existing external Twitch link. Chat, queue, votes and permitted room play/pause remain available; local Start on this device is hidden because it cannot fix the address. External Twitch playback cannot synchronize itself with this room.

On the host’s local app tab, open **Join on your phone → HTTPS invitation for Twitch**. **Use running HTTPS address** reads the existing host controller once. If none is running, expand **Start temporary HTTPS sharing** and choose **Start temporary HTTPS link**. This explicitly starts the existing Cloudflare trial controller and makes the app available at a temporary public address. The invitation and QR update for the same active room without recreating the host player; the phone must rejoin through that HTTPS link. Starting waits for at most twelve status checks, cancels checks on hide/unmount and adds no idle poller. Cloudflared must be installed; error messages leave manual HTTPS address entry available under Phone address. Controls retain the controller’s loopback-only safeguards. An existing trusted HTTPS deployment can be entered instead.

**Stop temporary HTTPS link** stops the controller and clears its saved invitation/QR. Closing the panel alone does not stop a running tunnel. Share a temporary public link only with invited guests. The tunnel provides the page/signaling address; cross-network peer connectivity may still require TURN. No tunnel starts automatically.

Official requirements: [Twitch embedding](https://dev.twitch.tv/docs/embed), [Twitch video and clips](https://dev.twitch.tv/docs/embed/video-and-clips/).

## Starting YouTube and Twitch on a phone

A phone may require a direct tap before playing video with sound. Use **Start on this device**, or press Play inside the provider player when required by the browser. These startup actions catch up to the current host position without sending a room pause/play request. Shared Play/Pause controls still intentionally affect everyone.

YouTube retries its player-ready handshake for up to ten seconds instead of assuming iframe load means playback is ready. Explicit device start retries that handshake when necessary. Current-time and player-state observations keep the host clock tied to actual playback, including buffering. Guests correct significant decoder drift with a three-second cooldown; ordinary one-second heartbeat progression does not repeatedly seek. Returning from a phone lock screen or background requests fresh host state and timing.

Three bounded clock samples on join and a fresh sample on return compensate for phone/computer wall-clock differences. These are small peer messages, with no new provider fetch loop or storage writes. Twitch VOD PLAY/PLAYING events use current room state and align the guest locally after its first tap. Live feeds and noninteractive clips cannot guarantee frame-exact synchronization; provider ads, availability and mobile browser autoplay policy remain outside the room's control.

## Reusable watch lists

Inside the queue, open **Saved watch lists**. Name the current upcoming public queue and choose **Save queue as list**. Keep up to 12 lists of 48 videos in this browser. The playing video, local files, room invitations and participant catalog identifiers are excluded. List names and unsubmitted saved lists are never sent to the room.

**Add list to queue** appends a single batch without autoplay or replacing existing videos. Current/queued duplicates are skipped; when space runs out, the result reports how many were omitted and the saved list stays intact. Host **Undo queue change** reverses the entire batch. Guests use the normal acknowledged host request, or **Suggest list** when review is enabled; suggestion limits still apply. A locked or disconnected room disables submission while personal list editing remains available.

Preview saved titles and selectable public links, rename a list, explicitly **Replace with queue**, or remove it with **Undo removed list**. Lists survive reload independently of the last-queue recovery draft. Updates from another tab refresh the list panel; explicit edits read the latest saved data first. Storage errors or unreadable records show an error without clearing saved data or changing playback. There is no polling or automatic named-list saving. Lists are local to this browser profile, following the existing personal library storage model; they do not sync across devices.

## What is live in the browser

- Hosts create a short room code; guests join with that code and a display name.
- Peer state, room chat, selected title, play/pause/seek events, ongoing local-video clock ticks, and the next-up queue are sent through the room's direct data channel.
- The stage has compact, theater, and cinema widths; theater is the current default.
- Hosts can add titles to the queue, reorder the next item, remove an entry, or trigger **Play next**. A local video moving to its end advances the queue.
- A guest-consent checkbox is required before requesting any local-video sharing. The app does not upload local media.
- A `localhost` room invitation is never copied for another device. Open Connection guide, follow the detected home-network address, start the room there, and then copy the invitation. An invitation can only work while the Reelcase server remains running.

## Shared queue and recovery

Hosts can opt into **Review guest additions before queuing** while allowing guest access. In this mode, guests paste **Suggest links** or choose **Suggest** beside a public library video; they cannot directly reorder, remove, shuffle, skip or select the live video. The host enforces the policy against incoming packets. Suggestions do not change the live queue, playback or its saved draft. The existing direct-edit mode remains the default, and disabling guest access also closes new suggestions.

The **Requests** shortcut opens a shared review list. It holds at most 24 canonical public videos, with at most eight pending per guest connection. Equivalent URLs and device IDs merge with an existing pending/playing/queued identity. Invalid media and limit overflow receive explicit submission counts; local file descriptors are rejected. Names come from the connected peer roster. Submission retries share one request identity and replay the host's receipt, rather than adding duplicate requests.

Only the host can **Approve to end**, **Approve next**, or **Dismiss**. Approval adds one title without interrupting playback and uses one normal queue revision/Undo step. Queue Undo restores the previous order; the request remains resolved. If the title is already playing or queued when reviewed, approval resolves it without reordering. A full queue retains pending suggestions for later approval. Closing review mode preserves existing requests for a decision and does not automatically add them. Decisions notify the submitting connection, and normal full states synchronize the review list to late/rejoining guests.

The host's review preference is saved in this browser. Pending requests belong only to the current host session and are cleared after host reload/room exit; the separately saved public live queue still has explicit recovery. No new provider polling or recurring storage writes are added. These are cooperative room controls using the existing peer/host trust model, not account-based moderation or identity enforcement.

The sticky **Player / Queue / Chat** shortcut bar shows the next title and scrolls directly to each area, with focus on the queue heading, player or chat input. Navigation changes only this device's view.

**Recently played** contains up to 12 distinct public YouTube/Twitch titles from the current room session, newest first. Switching titles records the previous public title; the current title is hidden from the list. Hosts can replay or queue again; guests use the same host-confirmed requests, retries and editing policy as the main queue. Requeue retains the current video and suppresses duplicates. Late/rejoining guests receive history in the normal full state. History is session-only, clears with the room, and excludes local filenames, file handles and stream addresses. Existing personal library records remain unchanged by incoming room history.

**Reload this player** refreshes only the current device's remote player or incoming local-video decoder. It retains the queue, selection and shared clock, and does not rebuild peer connections or send a skip request. Remote players reapply the current device's timing on readiness. Failed Twitch script loads clear their cached failure for a manual retry. YouTube's documented errors and blocked autoplay produce local messages and direct-provider links, without consuming the queue. Only messages from the current embedded frame and matching origin are accepted. Some provider restrictions still require opening the provider or choosing another title; an iframe load alone is not proof that a video can play. Error definitions follow [YouTube's IFrame API reference](https://developers.google.com/youtube/iframe_api_reference#onError).

The primary queue sits beside chat and shows the current video, next title, ordered upcoming entries, known runtime and live/unknown-length counts before the add controls. It accepts up to 48 distinct playable titles; public links work without importing a guest's library. Pasted batches report valid, duplicate and invalid links. Queue filtering changes only what this device displays. Relative up/down moves and Next priority apply to the host's latest order, retaining simultaneous guest additions.

Hosts can **Undo queue change** after an add, removal, reorder, shuffle or clear. It restores one previous queue snapshot without changing current playback. Selecting another title invalidates that undo. Local file handles required for this single undo remain in memory and are released with the room; they are never written into recovery storage.

**Move to…** opens a position picker for any queued title, usable with touch or a keyboard. **Select titles** enables checkboxes and **Select visible titles** follows the local queue filter. Selection includes an explicit count of filtered titles. **Queue selected next**, **Move selected to end**, and **Remove selected** each send one bounded intention, preserving the host's latest relative order within the selected group and retaining unrelated additions. Titles consumed or removed before the request arrives are ignored, never reinserted. Each accepted batch is a single Undo step. Guest requests use the existing confirmation/retry mechanism and host editing policy.

**Save or share queue links** provides Copy, a plain-text download, and selectable links when the clipboard is unavailable. Export contains normalized public YouTube/Twitch upcoming links only, in confirmed order, including supported clips and live channel links. Local or unavailable titles are counted and omitted, as are the current video and room invitation. Paste the exported lines into Add videos in another room to reuse the queue; existing titles are deduplicated. Export is explicit, adds no background writes or network requests, and does not alter playback.

When automatic next is off, completion pauses the room and preserves upcoming titles. An exhausted queue also pauses cleanly. Pressing Play after completion replays the current video from the start. Unavailable heads are skipped without requiring repeated Play next clicks.

Public upcoming links are saved after a short pause under `reelcase.watch-room.queue.v1`, capped at 48 normalized descriptors. Leaving or closing the room flushes a pending save. Local file names, paths, fingerprints, file handles, media bytes, stream addresses and peer details are excluded. After a reload, **Resume last room** uses this browser's previous room code; **Restore saved queue** restores public upcoming links explicitly, without starting playback. Local files must be selected and approved again. Recovery does not silently overwrite a nonempty live queue. Clearing the queue clears its saved draft; an immediate undo restores it.

**Allow guests to edit the queue and select videos** controls guest additions, moves, removals, shuffle, next/play selection and local-handoff proposals. The host enforces the setting against incoming requests as well as disabling controls on guest devices. Chat, readiness and voting remain available. Play/pause and seeking have their own independent host permissions. This remains the existing cooperative, client-authoritative room model, with no new authentication or public matchmaking service.

## Finding videos, Cinema and saved watch history

The sticky **Find videos** shortcut opens and focuses the room search, even if its section was closed. **My library** searches every prepared playable title as you type, with terms matching across title, creator, available description, genre and video tags. Results page in groups of 24 rather than stopping at 20 or mounting the entire catalog. Searches are debounced, yield between slices and cancel when superseded. Public provider videos are not excluded simply because a title mentions Blender or another sample-film name.

**YouTube search** sends a public search only when submitted. It uses the existing server-side YouTube WEB transport and cooldowns, with no account cookies or API key. More/Previous browse provider continuations (up to 20 pages); there is no background search polling. Identical server requests share work, and at most 24 pages are cached for two minutes. Results stay out of personal follows and the durable library: playing or queuing one uses the existing provider descriptors and host-confirmed queue path. Errors leave a retry and a direct YouTube search link available. Changing a query cancels the browser request and ignores stale responses.

Search and queue cards show lazy thumbnails with an icon fallback, readable titles, provider, creator, duration/live status, and publication/view details where supplied. Relative YouTube publication labels remain labels; they are never converted into guessed upload dates. Public descriptions are bounded before sharing. The queue appears before chat/invitations, has numbered positions and an Up next highlight, and keeps its existing move, filter, selection, undo, export and guest-review controls.

**Cinema** places the player across the room's available width and moves queue/chat utilities below it. **Theater** keeps the side column; **Compact** caps the player at 448 pixels. All modes fit mobile widths. Switching modes changes layout without remounting the iframe or local player. The mobile shortcuts scroll horizontally within their own bar, preserving screen space without document overflow.

**History → Your watch history** retains the latest 80 public titles watched in this browser, including the current title, across room changes and reloads. It supports search, Watch again, Queue and an explicit Clear action. Entries are deduplicated by provider identity and contain only validated, bounded public descriptors and a watched timestamp. Local filenames, paths, fingerprints, streams, peer identities and room codes are excluded. Writes occur on a newly played selection, not on clock ticks, pauses, search typing or queue rendering. Storage errors retain a session copy with a notice. This personal browser history is separate from the existing 12-item shared session history and is not sent to other viewers.

`node scripts/watch-room-discovery-check.mjs URL screenshots/watch-discovery.json` verifies library paging, rich metadata, queue artwork, all three stage modes without iframe reload, persistent history/replay/clear, explicit public search, pagination, failure handling and stale-response cancellation on desktop and mobile. `node scripts/watch-room-search-native-check.mjs URL screenshots/watch-search-native.json` verifies real YouTube first/next/previous search pages without a provider fixture.

## Protocol messages

YouTube Live follows the host's explicit play/pause intent, while each viewer handles its own buffering and live latency. Heartbeats, resync replies and different elapsed-broadcast clocks never trigger live seeks or repeated Play commands. Live `/live/` links retain their classification, and trusted iframe `videoData.isLive` evidence for a watch URL is shared with guests in the current title's descriptor and `live` timing flag. Evidence is scoped to the selected title and never written into the personal catalog. YouTube's moving live duration is excluded from VOD endpoint clamping. Live seek buttons are disabled; switching back to a VOD restores regular seeking and clock correction. A device-only start/reload still handles blocked mobile autoplay without pausing the room.

`sync` carries `playing` and `position`; `video` carries a selected library id; `queue` carries the ordered library-id list; and `chat` carries display text. Clients should tolerate unknown message types so rooms remain compatible while the protocol grows.

Queue intentions, guest `video-request` and `next-request` carry a request identity and receive a targeted `queue-result`. Lost requests or receipts retry with that same identity after three seconds; pending work expires after twelve seconds and requests reconciliation. The host retains bounded short-lived receipts so a retry cannot apply a relative move, shuffle, selection or skip twice. A changed host identity cancels pending intentions instead of replaying them against the restarted host.

Host `video`, `sync` and `room-state` packets include a monotonic `selectionRevision`; older or conflicting same-revision title changes are rejected. Guests follow their confirmed host and can rebind after it disconnects/reloads. Full state still supplies late joiners with queue metadata, policy and current playback. Ongoing playback uses small timing packets instead of repeating the full queue every second. Display-name edits update presence through the existing signaling poll, preserving peer channels and local-video streams. Ended events read the latest host playback state: paused/stale callbacks do not advance the queue, and unavailable heads are skipped in one bounded pass.

## Stage 1 — local room foundation

- Room code and display name are created locally.
- The selected home video remains private until the host explicitly chooses to share it.
- Playback events use a compact protocol: `play`, `pause`, `seek`, `sync`, and `chat`.
- Guests must have an authorized copy of the video or receive an explicit host-approved transfer path.

## Stage 2 — peer connectivity

- Use the existing `src/lib/multiplayer/P2PRoom` WebRTC client.
- The signaling relay at `/api/rtc` registers peers; a same-browser fallback alone does not count as successful registration.
- In an active room, expand **Connection recovery** to supply temporary TURN URLs, username, and credential from your relay provider on each device. Credentials stay in memory, are excluded from diagnostics, and are removed on reload or Clear relay. Applying settings reconnects the room.
- **Test relay only** disables direct ICE paths and same-browser fallback. Configuration acceptance is not proof of connectivity: verify a connected peer with candidate type `relay`, chat delivery, and playback before counting TURN as validated.
- Show peer status, connection failures, and a strict 8-person room cap.
- Never expose a peer's address, local files, or media without confirmation.

## Stage 3 — YouTube and Roku handoff

- Improve YouTube discovery from user-selected channels and live sources.
- Roku pairing requires a Roku-compatible channel/casting protocol and an explicit device-pairing action.
- Do not claim a TV is paired until the device confirms it.

## Validation checklist

1. Open the same room code on two devices on the same network.
2. Verify peer presence, chat delivery, play/pause/seek, and a local-file timeline drift under one second.
3. Add, reorder, and play an item from the shared queue.
4. Confirm leaving a room stops messages and that the guest-consent requirement remains in place.
5. Treat embedded YouTube/Twitch playback as selection sharing unless the provider's official player API confirms timestamp control.
6. Repeat with relay-only enabled using a real TURN service on separate networks. This external-service/device check remains open.

## Reproducible browser check

Run `node scripts/watch-room-browser-check.mjs` against the development app, or pass the production preview URL as its argument. The check opens isolated Chrome browser contexts with desktop host and mobile guest viewports, so BroadcastChannel cannot carry the messages. It verifies a selected direct ICE path, a transport acknowledgement, guest chat, host play/pause, guest seek, the local-file consent gate and fingerprint match, local queue add/removal, leave, no mobile horizontal overflow, and no browser errors. On a single computer, Chrome needs its local-IP test flag to allow the two isolated contexts to discover one another; the script supplies it. This is a local browser test, not proof of physical device or TURN behavior.

`node scripts/watch-room-collaboration-check.mjs URL screenshots/watch-queue.json --existing-guest --refined` adds three isolated clients, colliding guest catalog IDs, dropped messages/receipts, 48-entry queues, provider end events, actual local RTC video decoding, manual timing, host permissions, undo/filtering, public-only draft recovery after host reload, presence-name changes without reconnection and steady-playback traffic checks. Provider embeds and address discovery are fixtures; real provider availability, physical-device behavior and cross-network TURN remain separate checks.

`node scripts/watch-room-phone-check.mjs URL screenshots/watch-live.json` exercises delayed YouTube readiness, blocked mobile autoplay, skewed device clocks, VOD drift/buffering, Twitch VOD correction, and two YouTube live selections. Live scenarios use different viewer clocks, repeated host buffering, guest buffering, resync, explicit pause/resume and guest iframe reload; they assert no repeated play/pause/seek commands and then verify VOD synchronization returns after switching titles.

For the physical matrix, record the browser and OS on each device, whether both opened the same home-network address and room code, the candidate type on each peer, chat and play/pause/seek results, local-file drift, queue add/reorder/play, and leave behavior. For the relay matrix, enter short-lived TURN credentials on both devices, enable **Test relay only**, then require `relay` as the connected candidate type on both sides before counting chat and playback as passing. Copy room diagnostics omit credentials.

## Host-library browsing for guests — 2026-10-21

Guests can use **Host library** inside Find videos without importing follows or having any personal videos. An empty-library guest starts there automatically. Public playable titles are discoverable by default; the host can turn browsing off under **Guest library browsing** and must separately opt in to sharing local video titles. File paths and handles stay on the host. Selecting/queueing a discovered title uses the existing host validation, acknowledged requests, guest locks, review mode, queue ordering and Undo. Browsing does not grant playback access to a local file.

Search is debounced, cancellable and on demand over the existing peer connection: at most 24 validated descriptors and 24,000 UTF-8 bytes per response, with an exact continuation offset for shorter pages. No full catalog is broadcast, stored in the guest library or repeated with playback clocks. Replies are accepted only from the confirmed media host; incoming searches require a connected peer. In-flight work, receipts and response time are bounded; sharing changes and reconnects refresh the search.

`node scripts/watch-room-host-catalog-check.mjs URL screenshots/host-catalog.json` opens a desktop host with 120 public titles and one local title and an empty mobile guest, using real isolated-context WebRTC. It verifies paging, unqueued discovery, queue add/priority/removal, host sharing revocation, local-title opt-in, guest locks, playback selection, reconnect, descriptor privacy and absence of repeated result pages during clock heartbeats. Development and production passed; reports are screenshots/host-catalog-dev.json and screenshots/host-catalog-built.json. Production collaboration also passed all 39 checks and phone/live playback passed all 7 grouped checks. Provider playback is a fixture; physical phones and cross-network TURN remain separate checks.
