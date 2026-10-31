# Paced room transport and reconnect receipts

Milestones next-042 and next-048, mission revision 59.

## Product behavior

Open **Queue delivery** above the shared queue to inspect pending edits and recent receipts. Guests see Waiting for host, Checking receipt, Waiting for connection, Applied, Superseded, Rejected, or Expired. Sixteen operations can be pending; eight completed outcomes are retained for the room session. No media titles, invitation keys, private source labels or draft text are recorded in the receipt timeline.

After an unconfirmed edit, the guest asks the current host for a receipt before considering a retry. An applied receipt retires the pending operation without resending it. A missing receipt permits at most one retry, using the same operation ID, only if the host epoch, queue revision and selected-video revision still match. A changed queue/selection or replacement host supersedes the pending operation. Host permission and catalog scope checks still apply to the retry.

Unconfirmed operations expire after 45 seconds. The host also rejects original and retried packets after their 45-second validity window, including originals arriving after the 90-second receipt cache expires. Edit time is anchored to an accepted host snapshot and advanced with the device's monotonic clock, rather than assuming phone and computer wall clocks match. A receipt-query fence makes a late original undergo the same revision checks as a retry. Host receipt/query tables are bounded; saturation rejects new work without applying it.

A confirmed queue stays authoritative throughout recovery. Neither pending edits nor unsent draft text are inserted into it optimistically. Ordinary room updates preserve the mounted guest's unsent link text. Pending receipt state is intentionally session-only: tab reload does not revive old intentions. Existing public queue recovery remains separate, and a replacement host starts a new delivery epoch.

## Transport budgets

Each peer has its own outbox; one slow guest cannot stop another peer's channel. Before every reliable write, scheduling reads actual RTCDataChannel.bufferedAmount.

| Work | Scheduling |
| --- | --- |
| Chat, pause/play/seek, canonical queue/state, acknowledgements, receipt queries | Control FIFO, before catalog pages |
| Passive observed playback clocks | Latest observation only; pause, explicit seek, new video and canonical state discard obsolete pending clocks |
| Host catalog pages | Paced behind native backpressure; at most one page per flush |

Bounds per peer: 64 queued messages; 256 KiB application queue; 192 KiB available to catalog traffic so controls retain reserve; 256 KiB maximum control packet; 32 KiB maximum catalog packet. Actual catalog descriptors retain their existing 24 KiB page budget. Catalog admission stops above 8 KiB of native buffered data; controls use a separate 256 KiB native ceiling. Control pressure can reclaim unsent catalog/timing work. A native low-buffer event flushes pending work; a 50 ms fallback exists only while an application queue is nonempty. Queued packets expire after eight seconds. Close, peer recreation and room teardown release outboxes and timers.

Scheduling cannot preempt bytes already handed to SCTP. These are queue and memory bounds, not a guarantee of any particular latency on a disconnected or arbitrarily slow network. Oversized/stalled sends fail boundedly. Queue operations recover through their receipt workflow; interrupted catalog searches retry once with the same request ID before the existing eight-second deadline. Cancellation removes waiting catalog results. A last-moment authority predicate and catalog-status revocation purge obsolete unsent metadata, preserving the prior privacy milestone.

## Wire and authority

- Accepted host snapshots advertise an opaque session deliveryEpoch, receiptProtocol 1 and deliveryTime.
- Modern guest operations carry stable requestId, captured queue/selection/permission/catalog revisions and intentAt. Retrying never refreshes the original authority, operation identity or expiry time.
- queue-receipt-query contains one bounded query ID and at most sixteen operation IDs. Replies are targeted to the requesting connected peer; they contain receipts or missing results and current host revisions.
- Receipt lookups are isolated by peer plus operation ID. A third guest cannot acknowledge another guest's edits. A replacement host's epoch cannot authorize old work.
- The receipt path is read-only until the guest has explicitly sent a valid current retry. It never directly mutates the queue. Normal new concurrent intentions retain the app's existing host-side rebasing behavior.
- Legacy local handoff controls remain explicit existing actions; this ledger covers operations sent through the queue-delivery workflow. Device-local autoplay and media consent are unchanged.

## Verification scope

Use scripts/watch-room-reconnect-check.mjs for the three-client browser workflow, scripts/room-outbox.test.mjs for scheduler boundaries, and src/lib/multiplayer/room-delivery.test.ts for receipt/fence behavior. Existing privacy, role/timeline, guest controls and mission migration workflows remain regression checks.

The browser fixture uses three isolated clients with real WebRTC, controlled bufferedAmount pressure, deliberately dropped acknowledgements and held mutations, an actual guest PC close/recreate, and a deterministic local clock step for expiry. It verifies control delivery under held catalogs, same-ID bounded search retry, a missing edit's single safe retry, consumed-title non-reappearance, changed-basis supersession, permission rejection, expiry and unchanged draft text. Player documents are controlled fixtures. This does not establish real network throughput, physical phone media behavior, cross-network TURN reliability or a long-duration personal-library soak.
