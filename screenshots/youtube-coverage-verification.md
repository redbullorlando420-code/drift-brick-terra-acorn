# YouTube saved coverage and performance — 2026-10-02

The old 1,545 / 2,326 figure combined 1,549 verified sources with 777 unmatched names. Its 781 empty entries therefore included only four confirmed sources without cached uploads. Coverage now counts the actual saved catalog, including hidden videos, and distinguishes verified sources from pending names and held legacy fragments.

Final real-library observation: 82,926 distinct YouTube video IDs, zero duplicate cached rows; 1,557 / 1,564 verified sources have uploads; seven have no cached uploads; 768 names await exact matching; 559 legacy fragments remain held. These counts change as live pulls finish. No saved media was deleted.

The real mobile Fill empty sources action started a seven-target archive pull. Desktop preview playback opened successfully while pulling. Desktop and mobile layouts were inspected; mobile had no horizontal overflow. Proof: youtube-coverage-fixed-desktop.png and youtube-coverage-fixed-mobile.png.

Coverage uses compact counters, exact source/channel overlap accounting, and at most 64 numeric sample positions per creator. It retains no video objects. Recounts yield in short background tasks and share work for the same immutable snapshot. Empty-source pulls resolve counts again at click time. Folder status and count changes preserve privacy identity; YouTube shelves sort changed cards instead of repeatedly sorting the whole catalog. Twitch-only updates reuse the YouTube shelf. Import resolution removes its pending alias while preserving distinct confirmed channel IDs.

Synthetic Node benchmark: one million entries, 2,500 creators. Building the compact index took 774 ms across 714 background heartbeats. Twenty coverage updates took about 6 ms, compared with 8,842 ms for the prior full row-union calculation. An appended YouTube shelf update took 33 ms. These measure the specific algorithms, not overall browser latency. Node task scheduling used setImmediate to approximate scheduler.postTask rather than Windows timer delays. See youtube-coverage-million-benchmark.json.

Verification: 73 YouTube/store tests passed; the full 268 library tests passed separately; typecheck and production build passed. Final desktop/mobile dev and production browser smoke checks had no console/page errors, no overflow, no branding warnings, and no production baseline divergence. Production screenshots were inspected.

The broader npm test script has seven failures in untouched platform/template checks: browser-smoke output-root assertion; two Windows symlink permission checks; three wrapper subprocess checks for a Node executable path containing spaces; and the migration-template assertion about the existing network migration. Retrying outside the sandbox did not clear these. The npm chain therefore stops before its library tests, which were run separately above.

This verification does not establish an indefinite memory soak result. Provider-unavailable/private/live-only creators can still have no public upload catalog; unmatched display names still require a unique match or an explicit channel URL/handle.
