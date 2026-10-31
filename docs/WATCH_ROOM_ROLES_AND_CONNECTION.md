# Watch Room roles and connection evidence

This batch delivers next-041 (connection state timeline) and next-046 (room role presets) inside the existing Watch Room.

## Role workflow

Presets apply to all guests in the current room. Selecting one opens a consequence preview. Apply updates the existing independent controls; Cancel changes nothing. A custom control edit invalidates an already-open preview so the host must review it again. Existing saved control values remain the default, and unchanged values are not written again.

| Preset | Queue | Play/pause | Seek supported videos |
| --- | --- | --- | --- |
| Viewer | Host only | Host only | Host only |
| Contributor | Public suggestions requiring host review | Host only | Host only |
| Co-controller | Edit order and select titles | Allowed | Allowed |
| Custom | Independent existing controls | Independent | Independent |

Chat, manual Ready and queue votes remain available. Live streams retain their independent clocks. None of the presets changes host-catalog visibility, local-title sharing, file consent, remote access or provider eligibility.

Every permission change increments a host-owned revision. Queue-delivery retries retain their original revision and request identity; play/seek and approved local-handoff requests carry the same authority revision. The host checks the current ref-backed policy before any mutation, including immediately after a UI role change. Revoked/regranted privileges cannot make an older request valid again. Already-applied queue receipts can be replayed without executing a second mutation. A fresh request uses the latest host policy. Revision zero preserves legacy initial controls; after a host policy change a client that cannot send the revision must refresh before requesting mutations. Replacing a reloaded host resets the guest's permission clock alongside the existing host-state generation reset.

## Connection stages and recovery

The collapsed timeline distinguishes actual signaling observations, ICE state, reliable data-channel readiness, an accepted room-state handshake and this device's player. A malformed or failed signaling poll changes the signaling stage without claiming that an established peer channel disconnected. A player loading, buffering, autoplay block or error changes only the player stage. Same-browser relay delivery is described separately from a connected WebRTC path.

The history retains at most 24 stage transitions, and the expanded list renders at most 12 recent changes. Repeated state/clock heartbeats do not append events. No new poller or persisted diagnostic ledger is introduced.

Recovery actions reuse existing ownership boundaries:

- Retry signaling only requests a roster poll, serializes with in-flight polls and leaves channels/media untouched.
- Retry failed peer paths recreates only unhealthy peers, with a snapshot iteration and a bounded explicit-retry interval; healthy reliable channels are retained.
- Request room state uses the existing canonical reconciliation and preserves the current queue.
- Reload this player only uses the existing device-local player recovery. Autoplay still requires a device-local gesture where applicable.

Copy room diagnostic uses an allowlist, replacing the previous raw room export. It includes fixed stage codes, bounded transition timestamps, role and aggregate peer/queue counts. It excludes room/invitation identities, peer names/addresses, raw transport logs, local paths, media titles/fingerprints, chat and relay credentials. Clipboard denial exposes a selectable redacted text field. Visible connection details and invitation controls remain available within the private room; they are not copied into this diagnostic.

## Evidence and limits

- scripts/room-roles-timeline.test.mjs checks presets, stale revisions across every mutation type, independent player failures, 24-event retention, nested canary redaction, real P2PRoom signaling recovery, serialized polls and selective peer recreation. The fake transport has an explicit recreation ceiling so a regression fails before unbounded allocation.
- .grok/room-workflow-regressions.mjs runs the room script suites and native queue/media/clock/receipt/migration suites. Final log: screenshots/room-roles-regression-tests.txt.
- scripts/watch-room-roles-timeline-check.mjs uses real WebRTC between isolated desktop and touch-phone Chrome contexts. It holds the host handshake, previews/cancels roles, tests stale and current requests, submits reviewed suggestions, injects a device autoplay block and malformed signaling response, tests redacted copy/fallback, and reloads guests and a replacement host.
- scripts/watch-room-guest-controls-check.mjs retains the existing guest seek/play, readiness, vote, departure and reload regression. Its reload assertion waits for the host-confirmed permission revision, rather than treating a conservative pre-handshake UI as restored state.
- scripts/mission100-browser-check.mjs verifies additive migration, custom/manual states, clipboard fallback, exports and reload on desktop/mobile.

Provider documents and injected failures are controlled fixtures. Physical phones, cross-network TURN behavior, real provider autoplay/authentication, and continuous long-session soak are not claimed. Queue-intent reconciliation across a full host process restart remains its separate roadmap item.
