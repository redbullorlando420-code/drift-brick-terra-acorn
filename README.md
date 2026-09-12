# Reelcase

Reelcase is a fast, browser-first personal media desk. It brings local video, public YouTube and Twitch follows, photos, print files, game shortcuts, history, and optional LAN Watch Rooms into one private library—without uploading a personal catalog behind the scenes.

## Why Reelcase

Your library stays useful even when a provider is slow, a folder is temporarily unavailable, or a tab is resumed days later. Reelcase keeps its catalog, feedback, history, and recovery records in the browser, makes provider refreshes additive, and treats expensive enrichment as background work rather than a reason to block the first screen.

## Highlights

- **Local-first media library** — Scan approved folders or files, play browser-compatible video, and keep favorites, tags, notes, ratings, and category choices on this device.
- **Continue and history recovery** — Resume with stable provider URLs or local fingerprints, retain an append-only activity journal, filter by source, export records, and keep recovery cards when a source disappears.
- **YouTube and Twitch that preserve archives** — Follow public channels, retain cached provider cards during failures, separate live streams, clips, and VODs, and run focused historical pulls within visible budgets.
- **Fast Home** — The Home shell, search, and core controls paint first. Discovery ranking, artwork-heavy rails, and optional recommendations wait for idle time.
- **Explainable recommendations** — Shelf copy explains whether a rail is driven by freshness, ratings, saved creators, follow state, or unfinished progress—never opaque provider transport tags.
- **Rating rhythm** — A local weekly rating goal, streak counter, and clear rewards turn lightweight feedback into better shelves without sending activity anywhere.
- **Adult discovery** — Adults opens without a PIN. Private shelves stay separate from public rails; Eporner API v2 powers a paginated in-app catalog with provider tags/embeds, and other destinations appear as Adult milestones link-outs.
- **Optional Companion support** — The local Companion can inspect approved folders and prepare bounded metadata or thumbnail work. It never receives broad filesystem access from the browser.
- **LAN Watch Rooms** — Create room codes for direct peer presence, chat, next-up voting, local-video sync, and provider embed fallbacks. Exact timeline control is reserved for playable local media.

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
