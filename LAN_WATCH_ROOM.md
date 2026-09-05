# LAN Watch Room implementation guide

## What is live in the browser

- Hosts create a short room code; guests join with that code and a display name.
- Peer state, room chat, selected title, play/pause/seek events, ongoing local-video clock ticks, and the next-up queue are sent through the room's direct data channel.
- The stage has compact, theater, and cinema widths. Compact is the default so the room does not stretch video wider than a normal player.
- Hosts can add titles to the queue, reorder the next item, remove an entry, or trigger **Play next**. A local video moving to its end advances the queue.
- A guest-consent checkbox is required before requesting any local-video sharing. The app does not upload local media.

## Protocol messages

`sync` carries `playing` and `position`; `video` carries a selected library id; `queue` carries the ordered library-id list; and `chat` carries display text. Clients should tolerate unknown message types so rooms remain compatible while the protocol grows.

## Stage 1 — local room foundation

- Room code and display name are created locally.
- The selected home video remains private until the host explicitly chooses to share it.
- Playback events use a compact protocol: `play`, `pause`, `seek`, `sync`, and `chat`.
- Guests must have an authorized copy of the video or receive an explicit host-approved transfer path.

## Stage 2 — peer connectivity

- Use the existing `src/lib/multiplayer/P2PRoom` WebRTC client.
- Add an opt-in signaling relay at `/api/rtc` before enabling cross-device rooms.
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
