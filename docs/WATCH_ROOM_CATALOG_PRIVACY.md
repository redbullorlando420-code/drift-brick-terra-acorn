# Watch Room catalog privacy and public recommendations

Completed milestones: next-043 (guest catalog privacy review), next-069 (private recommendation isolation audit). Mission revision 58.

## Sharing workflow

In a host room, open **Guest library browsing**. Browsing starts off in every room session. Select public collections, enable browsing, review the first guest-visible page, then Apply catalog sharing. Filter and page the collection list instead of mounting hundreds of controls. A title preview retains at most 24 rows. Local titles require their own opt-in and a selected collection.

Removing an active collection, disabling local titles, or turning browsing off takes effect immediately. Adding access uses preview and Apply. Reloading the guest retains the live host's policy; restarting the host starts with browsing off. Access is intentionally session-scoped rather than silently restored from an older invitation.

Discovery, queue roles, and current playback are separate permissions. Revoking discovery does not interrupt an already authorized current title or confirmed queue. Guests can still submit unrelated public YouTube/Twitch links when their role permits. A known host title cannot be rediscovered under a different guest ID or canonical provider URL to evade a denied collection.

## Wire field audit

| Surface | Allowed fields | Excluded fields |
| --- | --- | --- |
| Catalog status | Availability and numeric catalog revision | Collection IDs/names, title counts, follows, room credentials |
| Public discovery page | Canonical provider identity/official watch and embed URLs, title, creator, safe poster, live flag, duration, publication evidence, views | Descriptions and annotations, saved tags, source membership, paths, handles, account state |
| Local discovery page | Opaque per-title alias, filename, optional duration | Original catalog ID/path, size, modified time, fingerprint, file handles, file bytes |
| Guest search terms | Shared title and creator only | Description/tag/folder search oracles |
| Host playback/queue packets | Existing explicitly selected playback identity | Host description/annotation text |
| Connection diagnostics | Aggregate stages, fixed state codes, bounded times | Titles, source labels, raw events, invitation and peer identities |

Catalog pages are bounded to 24 descriptors and 24 KB of encoded metadata. Requests cap query/offset/ID sizes, allow four pending guest searches, and keep one host job per connected peer. There is no continuous catalog poller or per-heartbeat storage write. Index preparation, scans, and previews yield and can be aborted. Unavailable preparation fails closed.

Authority changes before the UI's asynchronous cleanup. Replies must still belong to the exact authority snapshot at send time; guest pages and requests carry catalog revisions. Old responses are discarded after a status change, old page offsets reset, and stale known-title additions fail even after a revoke/regrant. Availability changes while the host prepares candidates also restart guest search automatically. Already delivered information cannot be erased from another device.

## Public/private boundary audit

- **Home:** Quick Home is navigation only. Landing/YouTube/Twitch/Live/classic shelves, public saved/history/continue cards and counts use private membership checks. The private desk remains an explicitly private surface.
- **Guide:** Eligibility runs before favorite/like/history counts, affinity origins, topic choices and query evidence. Private titles and private-only labels cannot supply public explanation evidence.
- **Topics:** Posting indexes, alias candidates and cross-source bridge evidence exclude private membership before building counts/samples. Visibility input changes invalidate the index.
- **Movies/anime/recent shelves:** The same boundary applies before selection, preventing a merged private source from surfacing through a public primary folder.
- **Room discovery:** Private/adult/hidden/unavailable/unknown-local sources are excluded; private canonical duplicates are vetoed. Unlocking the private desk grants no room discovery access. Current playback/confirmed queue stay explicitly authorized.
- **Ordinary recommendation exports:** distributionExport exports aggregate counts and anonymous creator buckets. It includes no raw title, tag, path, prompt, creator identity or selection key. Connection diagnostics use their own strict allowlist.
- **Intentional private exports:** full library packs, explicit private stats backups and user-authored session exports retain their documented scopes. A full personal backup is not silently changed into a public recommendation report. Room session exports contain only public media already explicitly shared in that session, not host catalog discovery.

For merged metadata, any private sourceIds membership is a veto, even when folderId names a public collection. Built-in adult provider privacy also applies to legacy folders missing a flag. Private state stays local; toggling private unlock does not change ordinary Guide/Topic/room results.

## Implementation entry points

- src/lib/videos/public-visibility.ts: shared source membership boundary.
- src/lib/multiplayer/room-catalog-policy.ts: cooperative public collection index, projection, search fields, request authorization.
- src/components/library/use-room-catalog-access.ts: immediate revision authority, interruptible index lifecycle.
- src/components/library/use-room-host-catalog.ts: host/guest revision and cancellation protocol.
- src/components/library/room-catalog-sharing.tsx: collection selection and preview.
- src/components/library/watch-room-section.tsx: selection, batch, suggestion and legacy queue boundaries.

## Verification

Evidence is recorded in MILESTONE_VERIFICATION.md and screenshots/catalog-privacy-verification-summary.json. Isolated synthetic catalogs include 100,000 titles, a private folder, adult provider, merged private membership, canonical aliases, hidden/unavailable entries, path canaries, and private favorite/history/tag signals. Real WebRTC desktop/mobile browser checks cover preview/apply, pagination, local-title opt-in, revoke/regrant, held responses, stale additions, guest queue controls and reconnect. External player documents are controlled fixtures.

Physical phones, cross-network TURN, provider account authorization and a long-running personal-library soak are not established by these checks. No external integration is newly connected by these milestones.
