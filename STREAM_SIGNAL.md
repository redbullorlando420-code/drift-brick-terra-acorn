# Stream Signal

Open **Workspace → Stream Signal** in the existing left sidebar. The mobile menu contains the same item. Existing pages, sign-in configuration and media data are preserved. The feature has its own lazy module.

## Announcements

Defaults: **notyoda**, Twitch `https://www.twitch.tv/notyoda`, YouTube `https://www.youtube.com/@astronauta2706`, and **iRacing Arcade**. Channel Setup edits the creator and channel URLs; Announcements edits the next stream's title, category and community message. HTTPS provider/channel URLs are validated before generation.

Generation uses local templates and creates four independent editable drafts with both stream links. X starts short; edits are preserved even when longer. Copy, Save and Open Platform are separate from the manual shared checklist. Compose on X fills its composer with the current edited draft. Only Mark shared changes the checklist; Undo reverses it. Neither action is a verified publication receipt.

Each pack captures its own channel/stream details. New packs do not replace previous packs or their edits. History pages contain eight packs at a time; older records remain in IndexedDB. Export downloads a UTF-8 text file with every current draft, the four platform URLs and both stream URLs. The Story download renders a local **1080 × 1920 PNG** with no remote images or generation service. After upload, add a Link sticker inside Instagram; image pixels are not clickable links. Personal Facebook/Instagram accounts use manual sharing. TikTok profile-link availability depends on the account.

## Storage and isolation

Small documents share the existing `reelcase` IndexedDB `activity` store under an encoded current-app-user namespace. Profile and individual pack records are separate; editing one post does not serialize the full archive or media library. Changes save after a 450 ms quiet period; explicit Save flushes immediately. Page-hide/navigation recovery mirrors only pending documents in localStorage and replays only that user's matching keys. Save failures retain the editable draft, show an error and offer retry/export. No record pruning or schema upgrade is introduced.

The app currently has sign-in disabled. In that configuration the workspace is local to the browser profile. With existing app sign-in enabled, the section uses the resolved current user, gates signed-out/loading state and remounts on user changes. There is no cloud sync or new authentication system.

## Chat Plays Lab

This is a local, event-driven battle simulator. It has no connected chat or game adapter. Voting windows are configurable from 2–120 seconds. It accepts one latest valid ballot per normalized viewer, retains previous ballots on invalid replacements, rejects duplicate message IDs, counts whole sequences and resolves ties alphabetically by the complete normalized sequence. Supported moves are attack, defend and heal, in sequences of at most four moves.

Limits: 200 voters per window, 512 recent replay IDs, 12 queued moves and 100 controller log entries. A sequence that cannot fit the queue is rejected entirely. Closing a window queues moves; execution requires a user click. Every move checks fresh resources/state. A failed check interrupts remaining moves in that sequence. Emergency stop clears votes, the deadline and all pending moves, and requires reset. Leaving the lab resets the local simulation and cancels its timer. There is no polling or automatic execution.

## External integrations

X/Facebook/Instagram/TikTok publishing, Twitch live detection, Twitch/YouTube live chat, and the local game adapter are **unconnected**. No social credentials are collected. Live detection was intentionally left unconfigured: it needs an authenticated backend, server-held credentials and a durable per-stream duplicate ledger. Existing public media-provider support does not supply that system.

AI Blueprint describes chat choosing strategic goals while a separate authenticated local adapter/controller handles continuous driving, fresh observations, acknowledgements, timeouts and interruption. The website and battle simulator do not control installed iRacing Arcade.

## Verification

- `npm run typecheck` and `npm run build`.
- `npm test`: **1,046 passing tests** (492 script tests + 554 TypeScript tests).
- `node scripts/stream-signal-check.mjs <app-url> <screenshots/report.json>`: isolated desktop/mobile checks for URL errors, generation, editing, real clipboard contents, intercepted X/platform handoffs, Mark shared/Undo, text export, PNG dimensions, archive paging, saved settings, navigation/reload recovery, user namespaces, simulated disk failure/retry, voting deadlines, duplicate messages, ballot replacement, move execution, reset and emergency stop. No social posts are sent.
- Home smoke checks compare dev/production hydration and consoles at 1280 × 800 and 390 × 844. Feature and Story screenshots are visually reviewed.
- `scripts/hub-bundle-check.mjs` verifies **17 independent desk boundaries**, including Stream Signal, with none eagerly loaded by Home.

Reports and screenshots use the `screenshots/stream-signal-*` prefix. Browser results use synthetic profiles and intercepted external handoffs; they do not verify real platform publication, actual live-chat delivery, cross-device sync, or installed-game control.
