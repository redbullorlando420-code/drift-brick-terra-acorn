# Reelcase

Reelcase is a fast, browser-first personal media desk. It brings local video, public YouTube and Twitch follows, photos, print files, game shortcuts, history, and optional LAN Watch Rooms into one private library—without uploading a personal catalog behind the scenes.

## Why Reelcase

Your library stays useful even when a provider is slow, a folder is temporarily unavailable, or a tab is resumed days later. Reelcase keeps its catalog, feedback, history, and recovery records in the browser, makes provider refreshes additive, and treats expensive enrichment as background work rather than a reason to block the first screen.

## One-click Windows start

The **Realhub** desktop shortcut starts the app server and Companion in a visible Node.js console,
waits for both to be ready, then opens the library in your default browser. It reuses
services that are already running and protects against rapid duplicate launches.
Leave the launcher console open. Ctrl+C stops only services this launcher started; already-running services are reused. Closing the browser alone leaves services running.

`Start-Realhub.cmd` in this folder runs the same launcher. To recreate the desktop
shortcut after moving the app folder, run `cscript //NoLogo scripts/install-desktop-shortcut.vbs`.
Startup and service errors appear in the console. The shortcut no longer uses hidden PowerShell, encoded commands or execution-policy bypass flags.
Existing Companion configuration and approved-root/origin safeguards are retained.

See [Local image models](./STUDIO_MODELS.md) for Qwen-Image 2.1, compatible Hugging Face imports, model file types and the antivirus alert investigation.

## Highlights

- **Local-first media library** — Scan approved folders or files, play browser-compatible video, and keep favorites, tags, notes, ratings, and category choices on this device.
- **Continue and history recovery** — Resume with stable provider URLs or local fingerprints, retain an append-only activity journal, filter by source, export records, and keep recovery cards when a source disappears.
- **YouTube and Twitch that preserve archives** — Follow public channels, retain cached provider cards during failures, separate live streams, clips, and VODs, and run focused historical pulls within visible budgets.
- **Fast Home** — The Home shell, search, and core controls paint first. Discovery ranking, artwork-heavy rails, and optional recommendations wait for idle time.
- **Explainable recommendations** — Shelf copy explains whether a rail is driven by freshness, ratings, saved creators, follow state, or unfinished progress—never opaque provider transport tags.
- **Rating rhythm** — A local weekly rating goal, streak counter, and clear rewards turn lightweight feedback into better shelves without sending activity anywhere.
- **Adult discovery** — Adults opens without a PIN. Private shelves stay separate from public rails; Eporner API v2 and RedTube’s webmaster API power paginated in-app catalogs with source + fetish tags/embeds, and other destinations appear as Adult milestones link-outs with labeled source tags.
- **Optional Companion support** — The local Companion can inspect approved folders and prepare bounded metadata or thumbnail work. It never receives broad filesystem access from the browser.
- **LAN Watch Rooms** — Create room codes for direct peer presence, chat, next-up voting, local-video sync, and provider embed fallbacks. Exact timeline control is reserved for playable local media.
- **Watch room recovery** — Jump between Player, Queue and Chat, replay or requeue recent public videos, and reload a player on one device without resetting the shared queue. Provider failures offer explicit recovery actions.
- **Guest queue review** — Optionally collect public video suggestions separately from the live queue. Hosts approve to the end or next position, or dismiss; limits, duplicate checks and reconnect support keep requests manageable.
- **Reusable watch lists** — Save up to 12 named public queues in this browser. Preview, rename, update and remove with undo; append a list without interrupting playback. Guest lists follow host editing and review rules.
- **Shared watch queues** — Move directly to a position, select and edit batches, export/reuse public queue links, filter and undo a 48-title queue; validate pasted link batches; let the host control guest edits. Public upcoming links recover after a host reload without autoplay. Selection/skip requests retry safely, and steady playback avoids repeating full queue snapshots. See [Watch Room behavior and checks](LAN_WATCH_ROOM.md).

## YouTube tag enrichment

In **Settings → YouTube video tags & descriptions**, use **Pull tags for next 5 videos** to fetch creator keywords and full descriptions from public watch pages. A video preview also offers **Pull video tags & description** and source-labeled recommended tags. Pulls run sequentially; Stop or closing the preview prevents the remaining requests. Live and upcoming streams are skipped. Completed metadata saves and tag evidence survive reloads and routine channel refreshes. Public metadata can be unavailable on consent, restricted or removed-video pages; existing tags remain saved.

Suggestions prioritize relevant creator tags, hashtags, named subjects and chapter phrases, then useful title/description words. Normalization removes duplicate phrases; promotional lines, links and generic filler are excluded. Description-only words receive less weight in inferred YouTube recommendation preferences; explicit tag hearts retain full influence. Manual edits, unknown saved tags and locked fields remain protected, including changes made while a pull is saving. **Improve YouTube tags** rechecks already-cached metadata in cooperative idle batches without fetching watch pages. Full descriptions stay in IndexedDB; browse cards and workers retain only compact evidence.

YouTube documents creator tags and descriptions as separate metadata fields in its [video resource reference](https://developers.google.com/youtube/v3/docs/videos#snippet.tags). This app uses the matching public watch-page player metadata rather than introducing a Data API key or accessing browser cookies. These are local search/recommendation suggestions, not a claim about YouTube's own discovery algorithm; [YouTube explains its use of tags here](https://support.google.com/youtube/answer/146402?hl=en).

Browser regression: `node scripts/youtube-tags-check.mjs URL screenshots/youtube-tags.json`. Add `--public-check` for one actual public server-function request; all other cases use isolated browser storage and provider fixtures.

## Product map

| Area | What it does | Main implementation |
| --- | --- | --- |
| Home and provider shelves | Immediate first screen, idle recommendation work, visual rails | `src/components/library/library-app.tsx` |
| Cards and browsing | Virtual-friendly card surfaces, artwork and feedback actions | `src/components/library/browse.tsx`, `src/components/library/video-card.tsx` |
| Local catalog state | Durable browser store, scans, progress, history, follows | `src/lib/videos/store.ts` |
| Provider boundary | Public YouTube/Twitch/Eporner retrieval, backoff, cache-safe merge | `src/lib/remote/api.ts`, `src/lib/remote-merge.ts` |
| Feedback and streaks | Ratings, creator taste, local weekly rhythm | `src/lib/media-feedback.ts`, `src/lib/rating-streaks.ts` |
| Performance observability | Render, interaction, thumbnail, cache diagnostics | `src/lib/interaction-budget.ts`, `src/lib/videos/thumbs.ts` |
| Watch Rooms | Signaling, peer protocol, queue, reconciliation | `src/lib/multiplayer/`, `src/components/library/hub-sections.tsx` |

## Privacy and boundaries

Reelcase is designed around local control:

- Catalog metadata, ratings, notes, history, and mission-plan state are stored in the browser.
- Library exports contain metadata only—never media bytes, local file permissions, or adult-library metadata.
- Provider cards use public provider data and keep known-good cached cards when a refresh is unavailable or rate-limited.
- Browsers cannot launch arbitrary local executables. Game and desktop-launcher entries make that boundary explicit and use an approved Companion path when available.
- Embedded provider players may not expose exact timeline APIs. Watch Room exact sync therefore applies to local/library video; provider rooms offer an honest synchronized control path with direct-link fallback.

## Development

Install dependencies with the project’s normal package workflow, then use:

```bash
npm run dev
npm run typecheck
npm run build
```

Useful quality checks:

```bash
npm run test
npm run lint
node scripts/browser-smoke.mjs http://127.0.0.1:8080/ screenshots/smoke.png
```

## Project notes

- [PROJECT_GUIDE.md](PROJECT_GUIDE.md) covers product-maintenance conventions.
- [LAN_WATCH_ROOM.md](LAN_WATCH_ROOM.md) documents the LAN peer-room protocol and rollout expectations.
- The in-app **Mission plan** is the live delivery queue. It distinguishes completed safeguards from work still in progress so roadmap status stays useful rather than aspirational.
