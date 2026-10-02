# Library responsiveness — October 2, 2026

Changed sidebar provider counting to reuse semantic privacy inputs and completed snapshots. Count work runs in short background tasks with no metadata packets or worker copies. Later immutable saves compare row identities and inspect only changed metadata. Previous catalog references are weak; cached visibility variants and playback position hints are bounded. Activity counts publish separately, so their initial scan cannot hide provider badges.

Sidebar and preview recommendation browsing share the held browse snapshot during a foreground preview/player. Selected video metadata remains live. Idle overlay roots no longer subscribe to catalog changes. Playback queues retain IDs instead of stale card objects, and selected playback lookup validates numeric position hints against each new snapshot.

Validation:
- Build and typecheck passed.
- 273 library/type tests and 73 provider/pull tests passed; final focused counter, lookup, playback queue and deferred store tests passed (11).
- One-million-entry synthetic benchmark: cold count 641.2 ms across short tasks; 100 cached updates 0.12 ms with zero card metadata reads and zero traversal tasks; append count 80.7 ms across 1,954 background tasks with no reads of unchanged metadata. This measures count CPU work, not whole-app latency or a browser memory soak.
- Across 100 appended snapshots, selected playback lookup checked one position per request. Benchmark duration includes allocating million-entry array copies, so it is not a click latency measurement.
- Development and production smoke checks passed desktop 1280×800 and mobile 390×844: visible content, no page/console errors, no horizontal overflow, no baseline divergence. Screenshots inspected.
- Existing Chrome library: about 157k indexed entries, 84,796 YouTube videos. Exercised YouTube navigation, mobile menu, preview, Watch now, actual provider playback and return to library on desktop and mobile. Error log was empty. Pull jobs remained enabled. Saved preferences and entries preserved.

The full npm script's seven previously established Windows/template failures were not rerun; the relevant suites above pass. No long idle memory soak was performed in this turn.
