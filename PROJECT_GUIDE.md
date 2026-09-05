# Reelcase upgrade guide

Reelcase is a browser-first personal media hub built with TanStack Start, React, Tailwind v4, and Zustand.

## Product boundaries

- Treat local media, print files, game folders, history, favorites, and follows as private browser data.
- The app can catalog selected files but must never upload their contents or expose local paths to a third party.
- Browser file handles are device-specific. Exports must contain metadata only, never source media or permission handles.
- Shopping links may open retailer searches, but do not automate checkout, payment, login, or account changes.
- YouTube and Twitch integrations must remain user-initiated, capped, and resilient when a public endpoint changes.

## Where to work

- `src/components/library/library-app.tsx` composes primary sections.
- `src/components/library/connect-panel.tsx` owns channel-follow and import UX.
- `src/components/library/hub-sections.tsx` owns Settings, print catalog, games catalog, and shop shortcuts.
- `src/lib/videos/store.ts` is the durable in-browser library state.
- `src/lib/remote/api.ts` owns server-side YouTube and Twitch lookups.

## Safe upgrade checklist

1. Keep all client-facing data in localStorage or IndexedDB unless the user explicitly asks for authenticated, cross-device storage.
2. Preserve the existing dark design tokens; use Radix-based UI components and lucide icons.
3. Never remove the preview bridge or platform branding from the root route.
4. Run `npm run typecheck` and `npm run build` after code changes.
5. Verify the running Home page, responsive layout, and browser console before shipping.

## Local catalog formats

- Prints: `.stl`, `.obj`, `.3mf`, and `.gcode`.
- Games: selected folders catalog executable and shortcut names. `.url` files can launch their explicitly-declared `https` destination; `.exe`, `.lnk`, and `.appref-ms` entries stay cataloged until a native companion is installed. Users may attach a custom local cover icon.
- Media: local folder access and video scanning are handled by `src/lib/videos/scan.ts`.

## Feature map

- Movie features live in `library-app.tsx` and `player.tsx`: rails, random/next playback, progress, metadata, ratings, quick tags, and private notes.
- Adult browsing uses the same local tag store but only renders after the PIN gate. Never copy adult rows to public rails.
- The game section intentionally distinguishes safe web shortcuts from desktop executables. Do not bypass browser security using `file:` paths or shell-like protocols.
- Watch Room UI belongs in `hub-sections.tsx`; protocol notes and multi-device verification live in `LAN_WATCH_ROOM.md`.
