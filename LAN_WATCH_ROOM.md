# LAN Watch Room implementation plan

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
