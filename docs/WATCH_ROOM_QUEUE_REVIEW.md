# Watch Room queue review

Milestones **next-144**, **next-145** and **next-146** ship together in Mission Plan revision **102**.

## Temporary moderation

From the host's player panel, open **Temporary queue moderators**, select a connected guest, and grant 1, 5 or 15 minutes. The guest can reorder, shuffle, or remove upcoming entries. The grant does not let them add a title, play the next title, control the current video, access the library, or delegate access. Broader permissions already set by the host are independent.

The host checks the request's peer, the current reliable WebRTC connection generation, grant ID, scope, permission revision, and monotonic expiry before any edit. Edits use the existing bounded, revisioned queue intentions and delivery receipts. Revoking removes the grant locally before notifying the guest. Reconnect or reload needs a new grant, and delayed edits cannot regrant authority. Grants are session data and are unavailable on relay-only connections without a confirmed reliable WebRTC channel.

## Duplicate links

Equivalent YouTube and Twitch URLs use verified provider identity, not title resemblance. Pasted equivalents and guest requests matching confirmed media can appear in **Duplicate review** with their source and original request record. The host can **Keep both** to create a separate upcoming slot, or **Consolidate matches** to leave the earliest upcoming match in place. The current video, unrelated order and existing delivery receipts remain intact. Decisions send a separate outcome to the requester. Duplicate reviews are bounded to eight groups and four held requests per group.

Approved repeats are authoritative slots with their own IDs. They survive a guest rejoin and the host's browser queue recovery, and can be played individually. They are excluded from discovery to avoid displaying the same media as multiple search candidates. Pending duplicate reviews are session-only. Generic link exports and saved playlists remain lists of unique public media identities and do not carry the original approval.

## Search evidence and revocation

Search rows identify **Host-shared library**, **Saved in my library**, or **Public YouTube search**. Availability text distinguishes provider playback from host files. An empty-library guest can search only the collections the host opted to share, then suggest an available host title for approval. Local suggestions expose a basename and an opaque room ID; the underlying path remains on the host. The host resolves an approved local slot back to its original file when it plays. Guest drafts still store public links only.

The search result's own revision follows a direct action or a staged public draft. Switching source/query/page or revoking access removes stale result actions. The host checks current catalog policy, exact media identity, and revision again on request and approval. A client label does not authorize a source. Already confirmed playback and queue entries are independent of browse access.

Verification uses disposable desktop host and phone-sized guest browsers connected over real local WebRTC. Provider media and artwork in the new checks are controlled fixtures; the approved local file is a real bundled MP4. These checks do not establish external provider availability, physical-phone behavior, or WAN performance.
