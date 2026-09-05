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
- Games: selected folders are cataloged by file names only. Web browsers cannot launch desktop executables.
- Media: local folder access and video scanning are handled by `src/lib/videos/scan.ts`.
