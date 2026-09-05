# Reelcase

Reelcase is a browser-first personal media desk. It organizes local video, public YouTube and Twitch follows, photos, print files, game shortcuts, and optional LAN Watch Rooms without silently uploading a personal library.

## What works today

- Scan local folders and play browser-compatible media; retain watch progress, favorites, ratings, categories, tags, notes, and history locally.
- Browse movie shelves including classics, quick watches, genre browsing, top picks, and randomized playback.
- Follow public YouTube and Twitch channels, with a dedicated live-first Twitch view.
- Build private adult-library shelves behind a local PIN. Tags and metadata stay isolated from public browsing.
- Add `.url` game shortcuts and launch their explicit web destination; catalog `.exe`, `.lnk`, and app-reference files with optional custom cover icons. Browsers cannot safely start a local executable.
- Create LAN Watch Rooms with room codes, direct peer presence, chat, local-video clock sync, guest consent, an editable next-up queue, and a compact/theater/cinema stage size.

## Architecture

| Area | Location | Notes |
| --- | --- | --- |
| Main library UI | `src/components/library/library-app.tsx` | Composes media shelves and locked private browsing. |
| Hub tools | `src/components/library/hub-sections.tsx` | Settings, games, photos, prints, watch rooms, and external handoffs. |
| Local state | `src/lib/videos/store.ts` | Zustand store persisted in the browser. |
| Remote discovery | `src/lib/remote/api.ts` | Server-side public YouTube/Twitch lookup boundary. |
| LAN peer layer | `src/lib/multiplayer/` | WebRTC room protocol and signaling client. |

## Privacy and capability limits

Local paths, media bytes, browser permissions, and adult-library metadata are never included in exports. An export contains catalog metadata only. Roku and desktop launchers need platform-specific native integration for confirmed device control; the browser offers an explicit manual handoff path instead. Embedded provider players may not expose precise timestamp controls, so exact Watch Room sync is for local/library video.

## Development

Run the usual checks before publishing changes:

```bash
npm run typecheck
npm run build
```

See [PROJECT_GUIDE.md](PROJECT_GUIDE.md) for product-maintenance conventions and [LAN_WATCH_ROOM.md](LAN_WATCH_ROOM.md) for the peer-room protocol and rollout requirements.
