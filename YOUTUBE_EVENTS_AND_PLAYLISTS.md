# YouTube upcoming broadcasts and playlist reconciliation

Completed next-025 and next-026 in roadmap revision 67.

## Using the features

- Open Live to see Coming up on YouTube. The list shows provider schedules, changed times, uncertainty and the last positive observation. It has 12 cards per page, an official event link and a focused Check creator action.
- A scheduled time passing never turns an event live. A positive live observation is required. Complete negative evidence must survive the existing ten-minute hold before a previously live event becomes a completed replay. Disappearing before the first live observation remains uncertain.
- Go-live alerts in Settings now include confirmed YouTube broadcasts. The canonical video and compact follow ledger retain the first alert receipt across retries, postponed times, notice dismissal and reload. These are in-app alerts; they do not publish Stream Signal posts or contact social accounts.
- Open YouTube, expand creator controls and select a playlist. Reconcile playlist from start begins a new bounded walk. Pull creator videos resumes its saved continuation. Choose Playlist order to browse observed order independently of publication dates.
- Provisional walks keep unseen entries. Only a validated complete walk from the beginning, with every distinct returned entry admitted, can remove an obsolete playlist membership. A legacy suffix, mismatched continuation, duplicate/inconsistent traversal, unreadable page or entry limit cannot prove removals. Restart from the beginning when a finished provisional walk cannot verify its count.
- Removal changes the playlist edge, never the saved card or personal feedback key. Other memberships survive. Cards with no other source move to Retained YouTube videos. Empty readable complete playlists follow the same rule.

## Implementation and performance

The existing public metadata requests now project upcoming identity and an explicit Unix schedule separately from concurrent viewers and publication dates. Waiting audiences never supply live viewer counts. Unknown schedules stay unknown. A per-creator ledger retains at most 64 event records; canonical cards also retain their event/alert evidence.

Near-start creators become due at the existing known-live interval from 15 minutes before to 30 minutes after their scheduled start. They borrow at most one quarter of discovery slots, while the remaining slots keep oldest-attempt fairness. Existing request limits, transfer concurrency, failure waits, provider cooldowns and periodic owners are unchanged. There is no new timer or additional watch-page fanout.

Playlist membership markers contain a walk ID, observation clock and order. Compact versioned checkpoints resume only their matching continuation. Full reconciliation yields during catalog scans and rebases against foreground edits. Ordinary creator pulls preserve verified creator ownership when the same card appears in a playlist. The shared merge retains event receipts and continues reusing unchanged card references.

Persistence uses the existing follow mirror, IndexedDB preferences and remote cache. New live notices trigger a preference checkpoint; ordinary status-only turns keep their lightweight follow-only path. No new credentials, dependencies, external repositories or storage service were introduced. Existing library persistence is not claimed to be a transactional catalog journal; next-001 remains open.

## Verification

See MILESTONE_VERIFICATION.md, revision 67, for exact commands, counts and artifacts. Deterministic public-response fixtures exercise real adapters and store actions in isolated desktop and touch-mobile profiles on development and the production build. Physical-device playback, real-provider coverage/throughput, provider layout changes, long-running memory behavior and crash/revocation drills remain separate external checks.
