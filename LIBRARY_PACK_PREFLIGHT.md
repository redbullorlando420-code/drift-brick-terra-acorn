# Library pack inspection and bounded export

Delivered together: next-003 and next-005, mission-plan revision 68.

## Use in Realhub

Open Settings → Library pack · review before import.

- Export streaming library pack downloads a version 2 .reelpack file. Cancellation discards pending download bytes and never publishes a completed filename before the final manifest.
- Inspect backup file accepts .reelpack, legacy .zip, supported loose .json, and follows/history/links .csv. Inspect Companion pack reads the already approved local Companion folder. Inspection and discarding a report do not apply incoming data.
- Read the version, source counts, record counts, duplicates, differing existing values, section counts, and rejected-record locations. Invalid sections block the entire reviewed import. The report retains the first 50 rejection locations and first 20 conflicts while counting all encountered issues.
- Merge follows is the default. Replace follows explicitly replaces current YouTube/Twitch follows with the unique incoming sources; an explicitly empty follow list can clear follows. Saved media and unrelated personal records remain.
- Check the review acknowledgement, then Apply reviewed import. The app rechecks the report against current relevant state; changed consequences require another review. No composer, automatic pull, or inspection silently applies a pack.
- History/favorites combine, counters retain the maximum, imported ratings/notes/resume records can replace matching values, and feature ledgers retain their established merge rules. New/different is a candidate count, not a promise that every counter changes. Existing persistence handles the writes and save status.

Packs contain creator sources, collections, history, recovery links, favorites/likes, counters, ratings/hearts, notes, resume pointers, photo metadata and supported review ledgers. They do not contain original media, catalog artwork, browser permissions, or authentication cookies. Existing Full backup, Catalog CSV and provider export controls remain available. Legacy ZIP/Companion exports retain their read-only Adult statistics reports; streaming packs retain personal Adult marks through the existing metadata fields. A pack is not a full media catalog clone.

## Baseline and format

The old builder retained a map of pretty JSON documents, duplicate CSV representations and the compressed destination. The new exporter iterates existing metadata references, scans map records without Object.entries of the full map, writes at most 128 records per chunk, and awaits every destination write. Large feature ledgers split into individual fields/map records. Each emitted UTF-8 JSON line is at most 128 KiB. The body ends in a manifest containing the section count, record count, pre-manifest byte count and FNV-1a checksum. The checksum detects corruption and truncation; it is neither signature authentication nor encryption.

The reader consumes File.stream, validates UTF-8/newlines, header version, shapes, safe keys, duplicate section/map identities and the final manifest, then validates supported record schemas before exposing apply. Parsed sections stay staged in one object graph; apply reuses them without stringify/parse copies. Validation yields after at most 128 records and checks cancellation between batches. Disk-backed atomic restore generations are separate work.

Limits: 128 MiB final streaming download, 1,000,000 records, 128 sections and 128 KiB lines. A single larger record fails explicitly. Legacy inspection caps compressed ZIPs at 32 MiB, individual expanded files at 32 MiB, total expanded bytes at 128 MiB and entries at 128; declared expansion is checked before extraction. Legacy export is intentionally limited to 10,000 records and 8 MiB of equivalent streaming output; use the streaming button for larger libraries. Unsupported future versions fail before apply.

The browser Blob fallback retains final output bytes, potentially up to 128 MiB. The bound is on serialization/write chunks, not total process heap. Input data, staged records, duplicate indexes, UTF-8 buffers and the finished Blob also consume memory. Import apply still uses the established persistence and merge path; there is no transaction, crash recovery, cross-tab writer lock or rollback added by this pair. Those roadmap milestones remain open. Inspection itself never writes imported data.

## Reproducible evidence

- scripts/library-pack-transfer.test.mjs: fourteen new behavioral cases, including 100,000 metadata records exported, inspected and restored with exact IDs, favorites, ratings and resume marks; cancellation, backpressure, checksum/truncation, future versions, schema errors, duplicate identities/paths, ZIP expansion bounds, CSV quoting, large sidecar chunking and explicit empty-follow replacement.
- scripts/library-pack-benchmark.mjs → screenshots/pack-transfer-benchmark.json: 100,000 synthetic metadata records. Legacy retained text before ZIP: 7,253,777 bytes; largest document: 2,504,955 bytes. Streaming file: 3,695,635 bytes; largest acknowledged write: 8,604 bytes; 808 writes, one in flight. Encoded allocation counts are measured, not sampled peak heap. The small benchmark trades 51 ms synchronous legacy serialization for 141 ms bounded serialization; it is not a claim of faster total wall time or real-device speed.
- scripts/library-pack-transfer-browser-check.mjs: isolated desktop 1440×1000 and touch mobile 390×844; rejected future file, no inspection mutation, conflict review, replace-follows consequences, discard, 100k cancellation and complete preflight, explicit apply, reload persistence and downloaded-pack reinspection. Development and built output are checked separately.
- Existing source-policy, provider/import and room/roadmap regressions, build, type checks, Home smoke and mission browser checks are retained in MILESTONE_VERIFICATION.md.

No new external repository or dependency was introduced. ZIP compatibility uses the existing fflate dependency. Browser checks use isolated synthetic storage and stub the Companion/provider endpoints; they do not verify a real approved Companion folder, physical phone behavior, storage exhaustion or an eight-hour memory soak.
