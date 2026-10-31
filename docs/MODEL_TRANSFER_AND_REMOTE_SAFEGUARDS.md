# Reviewed model recovery and RustDesk launch safeguards

Milestones next-082 and next-093. Companion source v19, protocol 1. The completed RustDesk milestone covers application approval/launcher safeguards; **no real remote desktop session is verified**. RustDesk authentication, native permissions and handoff behavior remain externally unverified until an installed client is tested with a separately approved peer.

## Model recovery workflow

Stable Diffusion → Model library → Saved model transfers shows up to eight private local receipts. Nothing resumes at startup, on reload or merely by opening the library. Choose Review transfer to verify the owned partial, pinned publisher repository/revision/file/role, declared length, SHA-256 and strong ETag when the server supplies one. Review reads the partial and a small remote identity probe; it does not append or truncate the partial. Large-file hashing may take minutes; only one heavyweight review is admitted at a time.

Resume verified transfer revalidates the source again, then appends from the last verified checkpoint. Pause retains the owned partial and durable receipt. Native permission revocation or service interruption stops the transfer without enabling unverified weights. A resumed transfer requires the current model-transfer grant. There is no automatic retry or resumed model job after restart.

A changed source, failed checksum, replaced/modified partial or changed folder cannot be silently adopted. Review separate fresh transfer previews current publisher metadata and requires its own acknowledgement. The start action checks the reviewed fingerprint again. The old partial/receipt remain identifiable. New final names are exclusive: an existing different model file is preserved, and an existing identical file is accepted only after complete size/hash/format checks.

Cancel saved transfer deletes only a temporary file whose identity and checkpoint prefix are still verified. Modified or moved partials are retained with an explanation. It never deletes installed weights. Cancel active transfer cleans owned temporary files, including prepared unused bundle components. Pause and cancel are distinct. Local browser uploads keep their existing bounded streaming/format checks; they are not resumable network downloads. Their permission is checked before upload.

## Storage and integrity limits

Transfers stay under the Companion-managed checkpoint/component folders; model-transfer permission is separate from approval for user media roots. Folder and file identities are pinned, replaced folders/partials are rejected, and symlink destinations outside managed storage are denied. No whole-disk search is added. Filesystem hard-link support is required for final publication, tested on Windows NTFS. Unsupported filesystems fail without overwriting installed models.

The private .local-model-transfers.json journal is bounded to eight receipts and 128 KiB and excluded from Git. Corrupt/future journals are preserved and block new recovery-managed downloads. Only terminal receipts without retained partial data may be evicted. Legacy unowned partial filenames are not discovered or adopted.

Remote byte ranges are at most 4 MiB. Safetensors compatibility headers have their separate existing 8 MB limit; range assembly can retain both chunks and the combined buffer, so a large header can temporarily require roughly 16 MB of byte buffers, excluding metadata parsing and runtime overhead. Files are hashed with 64 KiB read buffers; no full model is loaded into browser or Node memory. Durable file checkpoints occur every 16 MiB, at completion and on a handled interruption. An abrupt crash may leave up to one checkpoint interval plus one range of uncommitted suffix data. Explicit resume verifies the saved prefix before trimming only that owned suffix.

Pinned HTTPS Hugging Face sources, allowlisted Hugging Face/CDN redirect hosts, exact Content-Range and byte budgets are enforced. Strong ETag changes or disappearance deny append. Where no strong ETag exists, the pinned revision, size and mandatory publisher SHA-256 bind identity; full checksum/format validation still precedes publication. Public ungated model sources only; no credentials, arbitrary scripts or model-card commands are accepted.

A verified temporary file is exclusively hard-linked to its final new path after a publishing checkpoint. A lost completion receipt leaves a recoverable publishing record: explicit recovery hashes and validates the existing destination and removes only the proven owned temporary name. It does not download the weights again. Errors preserve prior installed models and safe recovery information. This is process-interruption recovery, not a claim of guaranteed durability through physical disk/power failure.

## RustDesk safeguards and session limits

Check RustDesk is explicit; opening the page starts neither a probe nor a connection. New controls require the remote-launch-safeguards capability. One-use approval is bound to the page's ephemeral requester nonce, app origin, exact numeric peer and typed confirmation, with a maximum 30-second lifetime. Backgrounding, editing the peer or cancelling clears/revokes pending approval. Client countdown uses a monotonic deadline; the server remains authoritative for expiry. Approvals and peer IDs are never persisted.

A mismatched page/origin cannot consume the legitimate page's approval. Another pending page must cancel or wait for expiry. Replayed/expired approvals cannot launch. Passwords, unattended access, custom paths, URLs and extra command arguments are rejected. The native command remains a literal argument vector with no shell: --connect, numeric peer, --no-server. No service installation, unattended password or session-permission reconfiguration is added.

The app stores at most ten memory-only launch outcomes and twenty allowlisted activity entries, with no peer, requester or token. Launch requested, failure, stop requested and observed launcher exit are separate states. A missing response prompts status review and never triggers automatic launch retry. Stop request retains the tracked process until its exit is observed; launcher exit does not prove a handed-off session disconnected. Closing the native session is the reliable action outside this page. Page cleanup is scoped to its requester/origin and cannot stop another page’s launcher. The trusted legacy empty-scope API retains its explicit global lock behavior. Companion shutdown requests stopping only the launcher it owns.

Unattended access is unsupported through Realhub; any future/native configuration requires a separate deliberate choice. A launcher receipt is not pairing, authentication, session access or connection verification.

Primary sources checked on 2026-10-30:

- [RustDesk client documentation](https://rustdesk.com/docs/en/client/) — native client setup and permissions.
- [RustDesk argument handling](https://github.com/rustdesk/rustdesk/blob/master/src/core_main.rs) — upstream --connect / --no-server handling. These flags do not establish session verification or override an already running client's permissions.
- [RustDesk repository](https://github.com/rustdesk/rustdesk) — credited in Mission plan.

## Evidence boundary

Generated 17 MiB fixtures test interruption, exact continuation after process restart, size/hash/ETag changes, ownership replacement, checksum rejection, cancelled cleanup, fresh-source review, journal failure/future schema, bounded admission and publication receipt recovery. Copied-service HTTP uses actual Windows files/HTTP with controlled Hugging Face responses and child-process mocks. Browser checks use isolated desktop and touch-mobile profiles. No real model download, RustDesk executable/peer/session, account credential or running user Companion was used. See MILESTONE_VERIFICATION.md for exact results.
