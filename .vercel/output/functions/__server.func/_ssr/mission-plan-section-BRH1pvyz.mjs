import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Bt as Download, P as Rocket, r as Wifi, tn as Bot, vt as Images } from "../_libs/lucide-react.mjs";
import { t as createLocalId } from "./local-id-CsDq4efR.mjs";
import { D as negotiateCompanion, S as companionSetAutostart, o as companionAckJobs, p as companionHealth } from "./companion-DacueTBp.mjs";
import { Bt as Input, Vt as Button } from "./library-app-BzjSyqkW.mjs";
import { a as CardHeader, c as InfoCard, f as downloadCsv, n as CardContent, o as CardTitle, r as CardDescription, s as HubShell, t as Card } from "./hub-shared-4nVqg49O.mjs";
import { t as FeatureReadinessPanel } from "./feature-readiness-panel-D2oGV5_v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mission-plan-section-BRH1pvyz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MISSION_PLAN_REVISION_KEY = "reelcase.mission-plan.revision";
var NEXT_LEVEL_COMPLETED_IDS = [
	"next-022",
	"next-038",
	"next-024",
	"next-023",
	"next-031",
	"next-032",
	"next-039",
	"next-033",
	"next-027",
	"next-047",
	"next-044",
	"next-028",
	"next-051",
	"next-052",
	"next-053",
	"next-054",
	"next-055",
	"next-056",
	"next-057",
	"next-058",
	"next-059",
	"next-060",
	"next-061",
	"next-062",
	"next-063",
	"next-064",
	"next-065",
	"next-066",
	"next-067",
	"next-068",
	"next-070",
	"next-088",
	"next-089",
	"next-090",
	"next-081",
	"next-083",
	"next-084",
	"next-085",
	"next-095",
	"next-013",
	"next-016",
	"next-021",
	"next-029",
	"next-018",
	"next-030",
	"next-041",
	"next-046",
	"next-043",
	"next-069",
	"next-042",
	"next-048",
	"next-045",
	"next-049",
	"next-050",
	"next-096",
	"next-071",
	"next-072",
	"next-075",
	"next-079",
	"next-037",
	"next-040",
	"next-015",
	"next-019",
	"next-012",
	"next-017",
	"next-025",
	"next-026",
	"next-003",
	"next-005",
	"next-073",
	"next-091",
	"next-076",
	"next-077",
	"next-078",
	"next-080",
	"next-092",
	"next-097",
	"next-082",
	"next-093",
	"next-098",
	"next-001",
	"next-002",
	"next-036",
	"next-086",
	"next-006",
	"next-087"
];
/** Apply newly verified defaults once, without resetting later manual status changes. */
function mergeMissionPlan(saved, defaults, previousRevision) {
	if (!saved) return defaults;
	const defaultsById = new Map(defaults.map((mission) => [mission.id, mission]));
	const savedIds = new Set(saved.map((mission) => mission.id));
	const migrateOriginalCompletions = previousRevision < 2;
	const migrateHydrationCompletion = previousRevision < 3;
	const migrateYoutubeTraceCompletion = previousRevision < 4;
	const migrateYoutubeArtworkCompletion = previousRevision < 5;
	const migrateViewerDetailsCompletion = previousRevision < 6;
	const migrateSearchBudgetCompletion = previousRevision < 7;
	const migrateTimerCompletion = previousRevision < 9;
	const migrateNavigationCompletion = previousRevision < 10;
	const migrateEnrichmentCompletion = previousRevision < 12;
	const migrateVirtualizationCompletion = previousRevision < 13;
	const migrateStartupCompletion = previousRevision < 14;
	const migrateSlowDeviceCompletion = previousRevision < 15;
	const migrateRenderAuditCompletion = previousRevision < 16;
	const migrateMobileBudgetCompletion = previousRevision < 17;
	const migrateAccessibleBrowsingCompletion = previousRevision < 18;
	const migrateDiagnosticsCompletion = previousRevision < 19;
	const migrateTwitchCheckpointCompletion = previousRevision < 20;
	const migrateTwitchSearchCompletion = previousRevision < 21;
	const migrateProviderBudgetCompletion = previousRevision < 22;
	const migrateYoutubeMetadataCompletion = previousRevision < 23;
	const migrateTwitchQueueCompletion = previousRevision < 24;
	const migrateCreatorOfflineDeviceCompletion = previousRevision < 25;
	return [...saved.map((item) => {
		const current = defaultsById.get(item.id);
		if (!current) return item;
		const promoted = current.done && (previousRevision < 27 && ["next-022", "next-038"].includes(item.id) || previousRevision < 28 && item.id === "next-024" || previousRevision < 29 && item.id === "next-023" || previousRevision < 30 && item.id === "next-031" || previousRevision < 31 && item.id === "next-032" || previousRevision < 32 && item.id === "next-039" || previousRevision < 33 && item.id === "next-033" || previousRevision < 34 && item.id === "next-027" || previousRevision < 35 && item.id === "next-047" || previousRevision < 36 && item.id === "next-044" || previousRevision < 37 && item.id === "next-028" || previousRevision < 38 && item.id === "next-051" || previousRevision < 39 && item.id === "next-052" || previousRevision < 40 && item.id === "next-053" || previousRevision < 41 && item.id === "next-054" || previousRevision < 42 && item.id === "next-055" || previousRevision < 43 && item.id === "next-056" || previousRevision < 44 && item.id === "next-057" || previousRevision < 45 && item.id === "next-058" || previousRevision < 46 && item.id === "next-059" || previousRevision < 47 && item.id === "next-060" || previousRevision < 48 && [
			"next-061",
			"next-062",
			"next-063"
		].includes(item.id) || previousRevision < 49 && [
			"next-064",
			"next-065",
			"next-066"
		].includes(item.id) || previousRevision < 50 && [
			"next-067",
			"next-068",
			"next-070"
		].includes(item.id) || previousRevision < 51 && [
			"next-088",
			"next-089",
			"next-090"
		].includes(item.id) || previousRevision < 52 && [
			"next-081",
			"next-083",
			"next-084"
		].includes(item.id) || previousRevision < 53 && ["next-085", "next-095"].includes(item.id) || previousRevision < 54 && ["next-013", "next-016"].includes(item.id) || previousRevision < 55 && ["next-021", "next-029"].includes(item.id) || previousRevision < 56 && ["next-018", "next-030"].includes(item.id) || previousRevision < 57 && ["next-041", "next-046"].includes(item.id) || previousRevision < 58 && ["next-043", "next-069"].includes(item.id) || previousRevision < 59 && ["next-042", "next-048"].includes(item.id) || previousRevision < 60 && ["next-045", "next-049"].includes(item.id) || previousRevision < 61 && ["next-050", "next-096"].includes(item.id) || previousRevision < 62 && ["next-071", "next-072"].includes(item.id) || previousRevision < 63 && ["next-075", "next-079"].includes(item.id) || previousRevision < 64 && ["next-037", "next-040"].includes(item.id) || previousRevision < 65 && ["next-015", "next-019"].includes(item.id) || previousRevision < 66 && ["next-012", "next-017"].includes(item.id) || previousRevision < 67 && ["next-025", "next-026"].includes(item.id) || previousRevision < 68 && ["next-003", "next-005"].includes(item.id) || previousRevision < 69 && ["next-073", "next-091"].includes(item.id) || previousRevision < 70 && ["next-076", "next-077"].includes(item.id) || previousRevision < 71 && ["next-078", "next-080"].includes(item.id) || previousRevision < 72 && ["next-092", "next-097"].includes(item.id) || previousRevision < 73 && ["next-082", "next-093"].includes(item.id) || previousRevision < 74 && item.id === "next-098" || previousRevision < 75 && ["next-001", "next-002"].includes(item.id) || previousRevision < 76 && ["next-036", "next-086"].includes(item.id) || previousRevision < 77 && ["next-006", "next-087"].includes(item.id) || migrateOriginalCompletions || migrateHydrationCompletion && item.id === "recent-saved-library-hydration" || migrateYoutubeTraceCompletion && item.id === "youtube-upgrade-03" || migrateYoutubeArtworkCompletion && item.id === "youtube-upgrade-05" || migrateViewerDetailsCompletion && (item.id === "viewer-detail-isolation" || item.id === "viewer-detail-memory-budget") || migrateSearchBudgetCompletion && item.id === "recent-search-result-budget" || migrateTimerCompletion && item.id === "smooth-09" || migrateNavigationCompletion && item.id === "smooth-01" || migrateEnrichmentCompletion && item.id === "speed-06" || migrateVirtualizationCompletion && item.id === "smooth-02" || migrateStartupCompletion && (item.id === "speed-01" || item.id === "recent-cold-home-readiness") || migrateSlowDeviceCompletion && item.id === "smooth-10" || migrateRenderAuditCompletion && item.id === "speed-03" || migrateMobileBudgetCompletion && item.id === "speed-09" || migrateAccessibleBrowsingCompletion && item.id === "smooth-11" || migrateDiagnosticsCompletion && [
			"speed-08",
			"speed-10",
			"smooth-12"
		].includes(item.id) || migrateTwitchCheckpointCompletion && [
			"twitch-upgrade-01",
			"twitch-upgrade-03",
			"twitch-upgrade-09"
		].includes(item.id) || migrateTwitchSearchCompletion && [
			"twitch-upgrade-16",
			"twitch-upgrade-17",
			"twitch-upgrade-20"
		].includes(item.id) || migrateProviderBudgetCompletion && item.id === "speed-02" || migrateYoutubeMetadataCompletion && [
			"youtube-upgrade-07",
			"youtube-upgrade-08",
			"youtube-upgrade-20"
		].includes(item.id) || migrateTwitchQueueCompletion && [
			"twitch-upgrade-02",
			"twitch-upgrade-08",
			"twitch-upgrade-10",
			"twitch-upgrade-18"
		].includes(item.id) || migrateCreatorOfflineDeviceCompletion && [
			"youtube-upgrade-06",
			"youtube-upgrade-17",
			"youtube-upgrade-18",
			"twitch-upgrade-19"
		].includes(item.id));
		const done = Boolean(item.done || promoted);
		const savedStatus = item.status === "planned" || item.status === "in-progress" || item.status === "blocked" ? item.status : void 0;
		const startedTimerAudit = previousRevision < 8 && item.id === "smooth-09" && savedStatus !== "blocked";
		const startedEnrichmentAudit = previousRevision < 11 && item.id === "speed-06" && savedStatus !== "blocked";
		return {
			...current,
			...item,
			title: current.title,
			detail: current.detail,
			...current.brief ? { brief: current.brief } : {},
			done,
			status: done ? "complete" : startedTimerAudit || startedEnrichmentAudit ? "in-progress" : savedStatus ?? current.status ?? "planned"
		};
	}), ...defaults.filter((mission) => !savedIds.has(mission.id))];
}
var MODEL_EXECUTION_RULES = [
	"Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.",
	"Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.",
	"Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.",
	"Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.",
	"Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.",
	"Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.",
	"Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions."
];
var critical = /* @__PURE__ */ new Set([
	1,
	2,
	4,
	6,
	11,
	12,
	18,
	22,
	24,
	38,
	42,
	43,
	69,
	73,
	91,
	93,
	99
]);
var tracks = [
	{
		track: "Data durability",
		offset: 0,
		rows: [
			[
				"Crash-safe catalog mutations",
				"Catalog rows and preference ledgers can commit separately during interruption.",
				"src/lib/videos/catalog-mutations.ts|src/lib/videos/store.ts|src/lib/videos/persist.ts",
				"Trace a pull, cleanup and tag edit across persistence boundaries; document the partial-write states.|Add a versioned operation journal with idempotent replay and a commit marker; reuse existing stores rather than duplicating media graphs.|Recover interrupted operations before admitting conflicting writes; expose a bounded recovery outcome.",
				"Inject failure before and after each transaction boundary; reload retains accepted rows and manual metadata exactly once.|Recovery scans only pending operations and leaves a 100k-row catalog interactive.",
				[]
			],
			[
				"Storage pressure recovery",
				"Quota errors need a safe workflow that distinguishes disposable cache from personal state.",
				"src/lib/videos/storage-recovery.ts|src/components/library/storage-recovery-panel.tsx|src/lib/videos/persist.ts|src/components/library/settings-section.tsx",
				"Inventory browser stores by reclaimability and estimated size; label unavailable measurements.|Offer a preview of disposable artwork/detail cleanup with protected ratings, history, follows and drafts.|Handle quota failure with bounded cleanup and explicit retry; never silently delete media or personal records.",
				"Force QuotaExceededError during writes and verify the prior saved state remains readable.|A preview and cancellation remove nothing; confirmed cleanup reports reclaimed estimates without claiming exact disk bytes.",
				[1]
			],
			[
				"Backup preflight report",
				"A large backup should be inspected before it can change current data.",
				"src/lib/videos/pack-preflight.ts|src/components/library/library-pack-transfer.tsx",
				"Trace current library-pack parsing and add a read-only preflight summary of versions, sources, counts and conflicts.|Validate record shapes, sizes and duplicate identities incrementally with actionable rejected-record locations.|Show merge/replace consequences before applying the existing import path.",
				"Malformed, truncated and future-version packs produce a report with no storage mutation.|A 100k-record pack preflight yields to input and reports which personal records would change.",
				[]
			],
			[
				"Atomic restore with recovery slot",
				"An interrupted restore must not leave half of a new library installed.",
				"src/lib/videos/persist.ts|src/lib/videos/store.ts",
				"Build on backup preflight and stage incoming data under a temporary restore generation.|Switch the active generation only after verification; retain one bounded recovery manifest of the previous generation.|Resume or discard an interrupted staging operation and provide explicit rollback before old data is reclaimed.",
				"Crash at staging and activation boundaries; reload selects one complete generation.|Rollback restores follows, tags, ratings and resume marks together without reopening remote providers.",
				[1, 3]
			],
			[
				"Streaming library-pack export",
				"Large exports should avoid building multiple full-library JSON strings in memory.",
				"src/lib/videos/library-pack-stream.ts|src/lib/videos/pack-stream.ts|src/components/library/library-pack-transfer.tsx",
				"Measure allocations of the existing exporter and define a versioned chunk format compatible with preflight.|Read catalog pages into a bounded stream with record counts and a final integrity manifest.|Support cancellation and the browser download capabilities already available; keep credentials and temporary media bytes out.",
				"Export and restore 100k records with exact IDs and manual signals retained.|Cancel halfway and verify scratch buffers release and the incomplete file is rejected as incomplete.",
				[3]
			],
			[
				"Cross-tab catalog writer lease",
				"Two open tabs can race while pulling, cleaning or importing the same catalog.",
				"src/lib/writer-lease.ts|src/lib/videos/store.ts|src/lib/videos/persist.ts|src/lib/videos/catalog-mutations.ts|src/components/library/catalog-writer-status.tsx",
				"Map shared mutations and introduce a same-origin writer lease with owner generation and expiry.|Broadcast compact invalidations after committed writes; rebase readers without shipping whole catalogs.|Recover stale leases after a tab crash and surface ownership when a second tab requests mutation.",
				"Two isolated tabs cannot apply conflicting cleanup/import transactions simultaneously.|Closing the owner releases work after expiry; a delayed old owner cannot commit against a newer lease.",
				[1]
			],
			[
				"Deletion and undo tombstones",
				"Late provider responses can revive intentionally removed media across sessions.",
				"src/lib/videos/store.ts|src/lib/videos/persist.ts",
				"Audit every remote admission path against removal and existing cleanup suppression.|Persist bounded deletion tombstones by canonical identity with reason and explicit restore action.|Apply tombstones during pull, backup merge and recovery; distinguish cleanup retirement from deliberate removal.",
				"Remove a title while its provider response is held; no late response or reload revives it.|Explicit restore clears only the chosen tombstone and retains unrelated saved feedback.",
				[1, 6]
			],
			[
				"Backup conflict review",
				"Import merging needs explainable choices when two backups disagree about personal metadata.",
				"src/lib/videos/persist.ts|src/lib/videos/types.ts",
				"Define field-level conflict policy for ratings, tags, locks, categories and resume timestamps.|Show a bounded review queue with keep-current, use-imported and merge-safe choices; preserve provenance.|Journal choices and apply them through the restore transaction path.",
				"Opposing manual tags or ratings are never silently overwritten.|Interrupted review resumes with identical decisions and deterministic merged output.",
				[3, 4]
			],
			[
				"File identity migration ledger",
				"Renamed or moved local files need verified identity continuity without guessing by filename.",
				"src/lib/videos/types.ts|src/lib/videos/store.ts|companion/reelcase-companion.mjs",
				"Map current path/fingerprint matching and define confidence tiers using approved-root metadata.|Present ambiguous matches for review; record approved alias migrations without copying source media.|Move personal signals through a journaled identity update and retain reversible alias history.",
				"Two files with the same name but different fingerprints never merge automatically.|An approved move preserves rating, history and resume across reload; undo restores the prior mapping.",
				[1, 7]
			],
			[
				"Portable profile boundaries",
				"Optional multiple local profiles require explicit isolation of personal and private state.",
				"src/lib/videos/store.ts|src/lib/videos/persist.ts",
				"Inventory all localStorage and IndexedDB keys and document which may be shared as disposable cache.|Implement an opt-in local profile namespace and migration preview for the current profile.|Switch profiles only after flushing writers and releasing active detail/provider state; preserve a default profile.",
				"Profile A history, private tags and drafts do not appear in Profile B or its exports.|Switch during a pending read and confirm no late result writes into the other profile.",
				[4, 6]
			]
		]
	},
	{
		track: "Performance at scale",
		offset: 10,
		rows: [
			[
				"Eight-hour lifecycle soak harness",
				"Short browser checks cannot reveal slow retention across a full day of use.",
				"src/lib/periodic-scheduler.ts|src/components/library/library-app.tsx|scripts/browser-smoke.mjs",
				"Locate the lifecycle owner and existing memory harness; script repeated browse, search, preview, playback and room cycles.|Sample heap where supported, DOM nodes, object URLs and active jobs without continuous production instrumentation.|Compare warm-cycle plateaus with declared tolerances and save a reproducible report and failure artifacts.",
				"An accelerated CI run detects an intentionally leaked listener or object URL.|Run the eight-hour variant on an available desktop browser; report missing heap APIs and physical-phone coverage honestly.",
				[]
			],
			[
				"Provider payload allocation budget",
				"Bounded HTTP bodies can still expand into large parsed and normalized object graphs.",
				"src/lib/provider-budgets.ts|src/lib/remote/provider-json.ts|src/lib/remote/provider-projection.ts|src/lib/remote/api.ts|scripts/provider-allocation-benchmark.mjs",
				"Measure raw, parsed and admitted payload sizes for representative YouTube/Twitch pages.|Discard unused provider fields before retaining cache entries and avoid duplicate normalization buffers.|Add a regression budget for peak intermediate allocations with a documented baseline.",
				"Oversized valid metadata is rejected or streamed without losing earlier accepted pages.|A 100k-library pull stays within the declared scratch budget and preserves unchanged card references.",
				[]
			],
			[
				"Worker crash recovery",
				"A terminated search or inference worker must not strand loading state or retain catalog copies.",
				"src/lib/videos/search-worker-index.ts|src/components/library/search-worker-recovery.tsx|src/components/library/use-preview-ranking.ts|src/components/library/use-youtube-ranking.ts|src/components/library/use-library-stats.ts|src/components/library/use-adult-browse.ts",
				"Find current worker entry points and ownership; add generation-scoped error and timeout handling.|Restart once on explicit retry or use a bounded cooperative fallback; cancel superseded jobs.|Release old message buffers and show which work failed without clearing saved results.",
				"Kill a worker mid-query and verify loading resolves to a clear retry state.|Retry returns the correct latest query only and does not duplicate retained indexes.",
				[]
			],
			[
				"IndexedDB cursor backpressure",
				"Paged hydration should pause when UI admission is busy rather than accumulating unread pages.",
				"src/lib/videos/persist.ts|src/lib/videos/store.ts",
				"Trace hydration page production, queue depth and commit cost under slow-device settings.|Introduce consumer acknowledgements with a strict pending-page ceiling and cancellation on profile change.|Resume from the last committed position without repeating or dropping catalog records.",
				"Artificially slow rendering holds pending pages at the configured bound.|A 100k-record restore remains complete after pause/resume and a mid-page cancellation.",
				[10]
			],
			[
				"Budget expensive recommendation passes",
				"Recommendation preprocessing needs a measurable CPU budget across multiple open desks.",
				"src/lib/ranking-budget.ts|src/components/library/use-youtube-ranking.ts|src/components/library/use-twitch-vod-ranking.ts|src/components/library/performance-scorecard.tsx",
				"Measure ranking passes triggered by source, rating and progress changes and identify duplicate work.|Coalesce invalidations by input revision; yield between ranking slices and cancel obsolete passes.|Expose bounded timing samples in existing diagnostics without retaining full candidate graphs.",
				"Rapidly change filters and ratings; only the final revision publishes.|A 100k-title fixture keeps interaction latency within a declared baseline and retains ranking correctness.",
				[]
			],
			[
				"Artwork decode cancellation",
				"Navigation can leave decoded artwork alive after its cards leave the viewport.",
				"src/lib/videos/bitmap-pool.ts|src/lib/videos/thumbs.ts|src/lib/videos/image-load-budget.ts|src/lib/videos/thumbnail-queue.ts|src/components/library/photos-section.tsx",
				"Locate image-slot and object-URL owners; distinguish network completion from decode retention.|Cancel or release obsolete decode jobs and apply the current low-memory profile to in-flight results.|Add lifecycle counters to existing diagnostics without per-image polling.",
				"Navigate away while decodes are held; late completion retains no obsolete bitmap or URL.|Repeat 100 viewport cycles and show bounded decode jobs and retained artwork entries.",
				[]
			],
			[
				"Large import preview virtualization",
				"Import review should stay responsive even when every source needs a decision.",
				"src/lib/videos/import-session.ts|src/lib/videos/import-review.ts|src/components/library/import-review.tsx|src/components/library/connect-panel.tsx",
				"Trace imported creator rows, ambiguity groups and progress rendering at 10k inputs.|Virtualize review rows while keeping logical selection, errors and keyboard position stable.|Apply decisions in bounded batches and retain pending review state after reload.",
				"Review 10k mixed sources without mounting 10k DOM rows.|Keyboard navigation, filter changes and reload preserve unresolved decisions and never auto-follow ambiguous identities.",
				[]
			],
			[
				"Page-specific network priority proof",
				"Foreground priorities need evidence that deferred provider work cannot monopolize the next page.",
				"src/lib/pull-priority.ts|src/lib/pull-control.ts|src/lib/pull-scheduler.ts|src/lib/pull-dispatch-trace.ts|src/components/library/pull-dispatch-panel.tsx|src/lib/remote/youtube-transport.ts",
				"Create deterministic queued/held requests for Live, creator archive, clips and on-demand details.|Verify priority changes only affect undispatched work; accepted results must still drain safely.|Add a diagnostic trace of queued versus in-flight work and tune starvation limits from measured results.",
				"Open Live during a deep archive; a live request starts within the declared dispatch bound.|Repeated priority changes do not starve an oldest-due archive forever or bypass a provider cooldown.",
				[]
			],
			[
				"Reduced-data transfer accounting",
				"Low-bandwidth mode should expose what it actually saves instead of implying all network use stops.",
				"src/lib/data-saver.ts|src/lib/transfer-accounting.ts|src/lib/videos/image-load-budget.ts|src/components/library/data-saver-panel.tsx|src/components/library/settings-section.tsx",
				"Classify artwork, metadata, native embeds and Companion transfers with measured or unknown byte totals.|Show a bounded session summary and explicit controls for optional prefetches.|Keep essential room timing and user-initiated actions functional while optional transfers pause.",
				"Save Data suppresses optional artwork/prefetch with no surprise model downloads.|Unknown iframe/media bytes are labeled unmeasured; accounting adds no polling or sensitive URL log.",
				[]
			],
			[
				"Performance release artifact comparison",
				"Performance changes need comparable measurements across builds and data sizes.",
				"PERFORMANCE_CHECKS.md|scripts/browser-smoke.mjs|src/lib/provider-budgets.ts",
				"Define versioned benchmark artifacts with dataset shape, device hints, warm/cold state and measured phases.|Compare matching artifacts only and require explicit review for changed thresholds.|Add a release command that reports regressions with trace/screenshot links and exit status.",
				"Inject a slow or memory-heavy implementation and verify the gate fails.|A missing baseline or unavailable metric is reported as unmeasured rather than passed.",
				[
					11,
					12,
					14,
					15
				]
			]
		]
	},
	{
		track: "YouTube reliability",
		offset: 20,
		rows: [
			[
				"YouTube feed gap repair",
				"RSS windows can omit uploads when a creator posts more items than the recent feed retains.",
				"src/lib/remote/api.ts|src/lib/remote/youtube-browse.ts|src/lib/videos/youtube-feed-gap.ts|src/lib/videos/recent-pull.ts|src/components/library/provider-pull-panel.tsx",
				"Detect when a previously saved feed watermark is absent without treating a missing watermark as proof of deletion.|Offer a bounded gap-repair action using the creator's separate upload continuation; preserve normal archive progress.|Show gap, repairing and unresolved states and deduplicate admitted uploads.",
				"A fixture with more than 15 intervening uploads recovers the missing range without duplicate cards.|A failed repair keeps both old feed evidence and the archive cursor; no unbounded automatic history walk starts.",
				[]
			],
			[
				"YouTube response contract fixtures",
				"Public metadata shape changes need explicit detection before a successful empty result is reported.",
				"src/lib/remote/api.ts|src/lib/remote/youtube-live-browse.ts",
				"Collect small redacted fixtures of supported feed, browse, continuation and live renderer shapes.|Validate required identities/continuations at adapter boundaries and separate valid empty shelves from unreadable payloads.|Add a contract fixture runner and a concise unsupported-shape diagnostic.",
				"A renamed or missing renderer field fails the adapter contract instead of marking a stream offline.|Fixtures contain no account identifiers, cookies or provider secrets and remain small enough for CI.",
				[]
			],
			[
				"YouTube live coverage progress model",
				"Large live-check backlogs need clearer throughput and freshness reporting.",
				"src/lib/videos/youtube-quick-live.ts|src/components/library/youtube-live-check-status.tsx",
				"Derive checked, due, waiting and unavailable counts from actual creator observations and attempt clocks.|Calculate an estimate only after enough recent successful samples; show uncertainty and provider waits separately.|Expose a creator-level due list with focused retry and no extra background scans.",
				"A mixed 2k-creator fixture reports correct distinct counts without counting failures as successful checks.|When throughput stops or cooldown begins, the estimate becomes waiting/unknown instead of promising a completion time.",
				[]
			],
			[
				"YouTube ambiguous negative live evidence",
				"Incomplete live listings should not be interpreted as confirmed stream endings.",
				"src/lib/remote/youtube-live.ts|src/lib/videos/live-retention.ts|src/lib/videos/youtube-live-health.ts",
				"Audit each negative path and record its evidence source and observation time.|Require a complete relevant catalog observation before entering the existing offline hold; retain unknown states separately.|Show why a stream remains provisionally live and offer a bounded recheck.",
				"Consent, malformed and partial responses never start a confirmed-offline timer.|A genuine complete negative ages through the existing hold and recovers immediately on fresh positive evidence.",
				[22]
			],
			[
				"YouTube upcoming event transitions",
				"Scheduled broadcasts need a distinct path into live, postponed or completed states.",
				"src/lib/remote/youtube-live.ts|src/lib/videos/youtube-events.ts|src/components/library/youtube-upcoming.tsx",
				"Model upcoming identity, scheduled time, last observation and uncertainty separately from live viewers.|Schedule bounded checks near a known start while preserving fairness for ordinary creators.|Handle changed start times and completed events without notification duplication.",
				"A postponed event never appears live merely because its scheduled time passed.|Upcoming → live → completed retains one canonical video and emits at most one live announcement.",
				[23, 24]
			],
			[
				"Playlist membership reconciliation",
				"Playlist edits need to update membership without deleting the underlying saved video.",
				"src/lib/remote/api.ts|src/lib/videos/youtube-playlist-walk.ts|src/lib/videos/store.ts|src/components/library/playlist-reconciliation.tsx",
				"Separate canonical video identity from playlist membership/order and record whether a playlist walk completed.|Diff membership only after a complete traversal; show partial walks as provisional.|Retain favorites/history and other source memberships when an item leaves one playlist.",
				"A removed playlist item stays available through another source and keeps all personal feedback.|Interrupted playlist pagination never removes unobserved tail memberships.",
				[22]
			],
			[
				"YouTube publication uncertainty",
				"Approximate upload dates should not be presented as exact timestamps.",
				"src/lib/remote/youtube-publication.ts|src/lib/videos/youtube-metadata.ts",
				"Audit current date sources and represent exact, approximate and unknown evidence without rewriting user locks.|Show precision/source in details and define stable ordering when date ranges overlap.|Repair dates only from a matching canonical video and preserve provenance through reload/export.",
				"Relative dates and upcoming times cannot overwrite a known exact publication date.|Unknown dates remain visibly unknown and sorting is stable across time zones and reloads.",
				[]
			],
			[
				"YouTube embed failure triage",
				"An unavailable embed needs a precise recovery action without promising a bypass.",
				"src/lib/multiplayer/room-player-recovery.ts|src/components/library/watch-room-section.tsx",
				"Map observed player error codes, origin/setup failures and device autoplay states to distinct explanations.|Provide official Watch on YouTube and device-local retry actions while keeping room playback unchanged.|Record bounded per-title error evidence without probing restricted content or downloading media automatically.",
				"A non-embeddable title does not trigger repeated room seeks, reload loops or false permission changes.|Two clients can continue chat/queue while one uses the official external link; no age or access restriction is bypassed.",
				[]
			],
			[
				"YouTube endpoint-specific recovery guidance",
				"Feed, browse and HTML failures need targeted recovery instead of a generic channel failure.",
				"src/lib/remote/youtube-transport.ts|src/lib/videos/youtube-recovery.ts|src/components/library/provider-pull-panel.tsx",
				"Expose which endpoint lane failed, its last success and the effective retry deadline.|Offer only actions that use healthy lanes or explicitly retry the affected creator.|Keep provider-wide network blocks distinct from endpoint-specific failures and preserve cooldown revisions.",
				"A feed-only hold leaves a healthy archive/live path available without clearing the hold.|A global challenge blocks all affected queued requests and the UI states the actual wait.",
				[22]
			],
			[
				"YouTube adaptive discovery allocation",
				"Discovery allocation should respond to backlog age without repeatedly favoring known-live creators.",
				"src/lib/videos/youtube-quick-live.ts|src/lib/videos/youtube-live-allocation.ts|src/components/library/youtube-live-allocation-panel.tsx|src/lib/remote/youtube-sweep.ts",
				"Measure oldest-due age and successful throughput for known-live and discovery classes.|Implement a bounded weighted policy with a minimum discovery share and no new request concurrency.|Expose allocation reasons in diagnostics and test policy under slow/failing prefixes.",
				"A 2k-creator mixed fixture reaches every eligible tail creator within a declared simulated bound.|Frequent live observations cannot consume all slots; provider cooldowns and manual pause still win.",
				[23, 24]
			]
		]
	},
	{
		track: "Twitch depth and coverage",
		offset: 30,
		rows: [
			[
				"Clip coverage evidence panel",
				"Clip pulls expose totals but not why a requested clip count was not reached.",
				"src/lib/remote/twitch-clips.ts|src/components/library/twitch-clips-control.tsx",
				"Render existing per-window diagnostics with requested quota, accepted count, duplicates and stop reason.|Distinguish sparse/exhausted windows, page-budget stops, partial failures and warm cache hits.|Provide a focused next action without claiming public highlight shelves are exhaustive.",
				"A sparse, duplicate-heavy and rate-limited fixture each produces a different accurate explanation.|Opening diagnostics triggers no provider read and retains at most the current bounded snapshot.",
				[]
			],
			[
				"Clip observation freshness audit",
				"Recent clip refreshes need proof that cached observations never masquerade as new provider checks.",
				"src/lib/remote/api.ts|src/lib/videos/twitch-clip-refresh.ts|src/lib/videos/follow-checkpoints.ts",
				"Trace recent cache hits, attempt clocks and successful observation clocks through storage and UI.|Expose checked-at versus attempted-at and let an explicit fresh read invalidate only its clip cache key.|Keep metadata merges from older observations from rewinding views or publication evidence.",
				"A warm retry advances the attempt clock while retaining the original observation time.|A held older response cannot replace fresher clip metrics or clear a newer retry deadline.",
				[]
			],
			[
				"Twitch creator pull policies",
				"A 600-follow library needs per-creator choices beyond one global refresh budget.",
				"src/lib/videos/twitch-refresh-selection.ts|src/components/library/follow-manager.tsx",
				"Add optional per-creator clip/VOD inclusion and a bounded priority tier with a documented default migration.|Apply policies to automatic selection while keeping manual selected-creator actions explicit.|Show skipped-by-policy separately from failed or not-yet-checked creators.",
				"Disabling clips for one creator does not suppress its live check or VOD history.|Low-priority creators still rotate when enabled; importing old follows preserves current behavior.",
				[]
			],
			[
				"Twitch channel rename evidence",
				"Renamed channels should keep their history only when a stable Twitch identity proves continuity.",
				"src/lib/remote/api.ts|src/lib/videos/store.ts|src/components/library/follow-manager.tsx",
				"Compare resolved stable user IDs before treating a new login as an existing creator.|Offer a reviewable alias update and migrate source references through the identity journal.|Retain old bookmarks as aliases while detecting a recycled login belonging to another user.",
				"A renamed stable user retains VODs, clips, ratings and live policy.|A reused login with a different user ID remains separate and cannot inherit personal signals silently.",
				[9]
			],
			[
				"Expired Twitch media recovery",
				"Expired VODs and removed clips need a non-destructive unavailable workflow.",
				"src/lib/videos/store.ts|src/components/library/pre-video.tsx",
				"Record verified unavailability separately from temporary fetch/embed errors.|Provide a scoped review queue to hide, retain as a bookmark or explicitly remove unavailable media.|Preserve favorites, ratings and notes and avoid automatically rechecking the entire library.",
				"A transient 503 never marks a saved VOD permanently expired.|A confirmed removed clip remains recoverable with its personal signals after reload and backup.",
				[7]
			],
			[
				"Twitch media identity aliases",
				"Alternate clip URLs and slug/id representations can create duplicate cards.",
				"src/lib/videos/twitch-identity.ts|src/lib/videos/catalog-identity.ts|src/lib/videos/remote-merge.ts|src/lib/remote/api.ts|src/lib/videos/types.ts|src/lib/videos/store.ts|src/lib/multiplayer/room-media.ts",
				"Enumerate supported Twitch clip/VOD URL forms and derive canonical typed identities.|Record verified slug/id aliases and merge duplicate source memberships without losing manual metadata.|Apply identity normalization consistently to imports, room links and archive admissions.",
				"Different official URLs for one clip yield one saved card and one room queue identity.|Distinct clips with similar titles or recycled display names never merge.",
				[1]
			],
			[
				"Twitch VOD chapter context",
				"Long VODs need useful game/chapter context without making routine pulls heavier.",
				"src/lib/remote/twitch-chapters.ts|src/lib/remote/api.ts|src/components/library/twitch-chapters.tsx|docs/TWITCH_CHAPTERS_AND_CANARY.md",
				"Verify a permitted public metadata source for VOD chapter/game segments before implementing an adapter.|Load segments only on explicit detail expansion and cache a bounded selected-VOD record.|Offer timestamp navigation when the player supports it and a truthful external fallback otherwise.",
				"No chapter requests occur during routine live/clip pulls.|A VOD with missing or malformed segments remains playable with no invented chapters.",
				[],
				"A usable public segment source must be verified; document unsupported provider access rather than inventing data."
			],
			[
				"Twitch live batch fault isolation",
				"One bad alias or response field should not invalidate a healthy multi-channel live batch.",
				"src/lib/remote/twitch-live-batch.ts|src/lib/videos/twitch-quick-live.ts",
				"Add mixed fixtures with null users, field errors, service failures and valid live/offline siblings.|Map errors to the exact creator and distinguish whole-request failure from a partial response.|Commit healthy observations immediately and assign retries only where evidence failed.",
				"A single malformed user in a 100-target batch leaves all valid sibling viewer counts current.|A transport failure preserves previous observations for every affected creator and does not assert offline.",
				[]
			],
			[
				"Twitch content type precision",
				"Clips, highlights, uploads and past broadcasts need explicit provider-backed classification.",
				"src/lib/remote/api.ts|src/lib/videos/types.ts|src/components/library/library-app.tsx",
				"Carry the queried broadcast shelf and canonical media type through normalization and persistence.|Expose filters and labels without relying on duration or title guesses.|Preserve type provenance during shallow refreshes and resolve old unknown rows only from exact evidence.",
				"A short VOD is never classified as a clip and a long clip retains its clip identity.|Mixed archive pages preserve the correct type after reload, export and recommendation ranking.",
				[]
			],
			[
				"Twitch pull canary runner",
				"Public Twitch changes need a small reproducible real-network check separate from synthetic tests.",
				"scripts/twitch-canary.mjs|scripts/twitch-canary-core.mjs|src/lib/remote/api.ts|docs/TWITCH_CHAPTERS_AND_CANARY.md",
				"Add an explicit command accepting a small caller-supplied public creator list and a strict request ceiling.|Report clip/VOD/live contracts, paging stop reasons, status codes and timing without cookies or account data.|Keep rate-limited runs resumable and exclude this command from ordinary page startup and CI by default.",
				"A controlled fake provider proves the request cap and redacted report shape.|Run against available public creators and clearly label failed/unavailable checks; never translate an unrun canary into a pass.",
				[
					31,
					38,
					39
				]
			]
		]
	},
	{
		track: "Watch Together collaboration",
		offset: 40,
		rows: [
			[
				"Watch Room connection state timeline",
				"Guests need a clear distinction between signaling, transport and player readiness.",
				"src/components/library/watch-room-section.tsx|src/lib/multiplayer/room-connection-timeline.ts|src/components/library/room-connection-panel.tsx|src/lib/multiplayer/p2p.ts|src/lib/multiplayer/room-delivery.ts",
				"Derive a bounded connection timeline from actual signaling, ICE, room handshake and player events.|Show the last successful stage and an appropriate retry that does not reset a healthy room.|Export a redacted diagnostic excluding invitations, credentials, local paths and private catalog data.",
				"Simulate failure at each stage and verify a distinct state and recovery action.|A slow player cannot be reported as a disconnected peer, and retry preserves the queue.",
				[]
			],
			[
				"Room transport congestion control",
				"Queue/search payloads can compete with timing and chat on a slow data channel.",
				"src/lib/multiplayer/room-outbox.ts|src/lib/multiplayer/p2p.ts|src/components/library/room-queue-delivery-panel.tsx",
				"Measure bufferedAmount and classify timing, chat and bulk catalog packets.|Bound queued bytes, coalesce obsolete timing packets and pace catalog pages behind transport backpressure.|Retain acknowledgements and define recovery when a bulk transfer is interrupted.",
				"A throttled three-client fixture keeps chat and pause responsive during catalog paging.|Queued bytes remain bounded and interrupted pages retry without duplicate queue mutations.",
				[]
			],
			[
				"Guest catalog privacy review",
				"Host-library sharing needs granular visibility beyond a single broad permission.",
				"src/lib/multiplayer/room-catalog-policy.ts|src/components/library/room-catalog-sharing.tsx|src/components/library/use-room-host-catalog.ts",
				"Review every host catalog field sent to peers and define explicit shareable source/collection scopes.|Preview guest-visible titles before enabling a scope; exclude private/adult/local-path metadata by default.|Revoke scope visibility immediately and invalidate pending search pages by permission revision.",
				"A guest cannot receive an excluded title via search, pagination, stale request or queue suggestion.|Revocation during a held response prevents delivery while preserving current authorized playback.",
				[]
			],
			[
				"Per-guest playback readiness",
				"Room readiness should distinguish a participant's vote from actual media readiness.",
				"src/lib/multiplayer/room-participation.ts|src/components/library/watch-room-section.tsx",
				"Keep manual Ready separate from local player loading, autoplay block and observed playback.|Send only bounded capability/readiness changes, not continuous player telemetry.|Show host actions for waiting participants without automatically forcing every guest to play.",
				"A manually ready guest with blocked autoplay is visibly distinguishable from a playing guest.|Repeated readiness events do not grow history, trigger seeks or bypass host permissions.",
				[]
			],
			[
				"Live latency guidance",
				"Live providers cannot promise exact synchronization when ads and DVR windows differ.",
				"src/lib/multiplayer/room-provider-clock.ts|src/components/library/room-live-guidance.tsx|src/components/library/watch-room-section.tsx",
				"Represent live independent-clock and DVR-capable modes explicitly using observed capabilities.|Show device-local catch-up and latency guidance without endless corrective seeks.|Separate ad/buffering uncertainty from confirmed shared pause state.",
				"A guest in an ad or independent live feed never causes a room-wide seek loop.|DVR seeking is offered only when supported, and current playback remains stable after reload.",
				[]
			],
			[
				"Room role presets",
				"Host permissions need understandable presets with server/host enforcement preserved.",
				"src/lib/multiplayer/room-playback-access.ts|src/lib/multiplayer/room-roles.ts|src/components/library/room-role-presets.tsx|src/components/library/watch-room-section.tsx",
				"Define named viewer, contributor and co-controller presets over existing independent permissions.|Preview changes and allow custom combinations without silently granting local-library access.|Enforce the effective permissions on every incoming operation and acknowledge rejected actions.",
				"Switch roles while requests are in flight; stale privileges cannot authorize a later mutation.|Keyboard and mobile controls reflect the preset while host-enforced validation remains authoritative.",
				[]
			],
			[
				"Session playlist handoff file",
				"A room should export a useful public playback plan without exposing private room state.",
				"src/lib/multiplayer/room-playlists.ts|src/lib/multiplayer/room-watch-history.ts",
				"Define a versioned public-only session file with played/current/upcoming identities and known runtimes.|Preview duplicates, unavailable providers and queue capacity before importing into an existing room.|Apply imported upcoming items as one undoable host-approved operation; never restore autoplay.",
				"Export omits invitation tokens, peer names, local paths and unmatched file identities.|Re-import retains current playback and deduplicates canonical public links.",
				[]
			],
			[
				"Reconnect queue intent reconciliation",
				"Guests need clear receipts when disconnecting during an edit rather than guessing whether it applied.",
				"src/lib/multiplayer/room-delivery.ts|src/components/library/use-room-queue-delivery.ts|src/components/library/room-queue-delivery-panel.tsx",
				"Track bounded pending intents with stable operation IDs and the last host-confirmed revision.|After reconnect, query receipts before retrying a mutation; show applied, superseded or rejected outcomes.|Expire orphaned intents and keep local draft text separate from confirmed room state.",
				"Disconnect after host apply but before receipt; retry changes the queue exactly once.|A removed or consumed title cannot reappear through a delayed reconnect intent.",
				[]
			],
			[
				"Provider-independent subtitles",
				"Room participants need a device-local subtitle preference where provider APIs permit it.",
				"src/lib/multiplayer/room-device-captions.ts|src/components/library/room-device-captions.tsx|src/components/library/room-stream-player.tsx|src/components/library/watch-room-section.tsx",
				"Inventory local-video tracks and supported YouTube/Twitch caption controls without proxying media.|Expose per-device caption/language choices and clear unsupported-provider guidance.|Preserve a local preference without broadcasting personal accessibility choices to peers.",
				"Changing captions on a guest never pauses or changes the host's player.|Missing tracks and unsupported embeds show an honest fallback and preserve keyboard focus.",
				[]
			],
			[
				"Room accessibility audit protocol",
				"Complex room changes need repeatable assistive-technology verification beyond layout screenshots.",
				"docs/ACCESSIBILITY_STATUS_AND_FOCUS.md|src/components/library/use-room-list-focus.ts|src/components/library/room-queue-panel.tsx|src/components/library/room-suggestions-panel.tsx|scripts/watch-room-roles-timeline-check.mjs",
				"Document named regions, announcement priorities and focus ownership for queue/chat/dialog changes.|Add automated keyboard checks for suggestion review, reconnect errors and player recovery.|Run available screen-reader checks and record exact browser/tool coverage and remaining physical-device requirements.",
				"Queue updates announce useful summaries without repeating every timing heartbeat.|Focus survives a consumed title, dismissed dialog and reconnect; unperformed screen-reader checks remain unverified.",
				[
					41,
					44,
					46
				]
			]
		]
	},
	{
		track: "Recommendations and topics",
		offset: 50,
		rows: [
			[
				"Recommendation evaluation dataset",
				"Ranking improvements need a stable relevance benchmark instead of subjective spot checks.",
				"src/lib/recommendations.ts|src/lib/videos/twitch-recommendations.ts",
				"Create a small synthetic corpus with explicit creator, topic, freshness and negative-feedback judgments.|Define relevance, diversity and repeat-exposure metrics with interpretable expected rankings.|Run current ranking as a baseline and save versioned score artifacts before changing weights.",
				"The benchmark catches a ranking that boosts operational tags or repeats one creator everywhere.|Report per-source metrics and missing judgments without presenting synthetic scores as user satisfaction.",
				[]
			],
			[
				"Explicit recommendation rejection reasons",
				"Disliking a title, creator or topic should have different reversible effects.",
				"src/lib/recommendations.ts|src/components/library/pre-video.tsx",
				"Add opt-in not-interested reasons scoped to this title, creator or topic with an undo path.|Persist bounded negative evidence separately from unavailable/hidden state and explain its ranking effect.|Apply negatives without overriding explicit favorites or leaking private preferences into room packets.",
				"Rejecting one title does not silently suppress every title by the creator.|Undo and backup restore recover the previous ranking inputs exactly.",
				[51]
			],
			[
				"Recommendation exposure ledger",
				"Unopened repeated recommendations need measured exposure decay rather than permanent exclusion.",
				"src/lib/recommendations.ts|src/lib/videos/persist.ts",
				"Define exposure only for genuinely visible cards using existing viewport infrastructure.|Coalesce bounded exposure writes away from scrolling and separate impressions from opens/likes.|Add transparent decay with a reset option and no hidden tracking outside this local app.",
				"Offscreen, minimized and immediately skipped cards do not accumulate exposure.|A long browse session retains a capped ledger and fresh preferences can still promote an exposed favorite.",
				[51]
			],
			[
				"Topic alias review workflow",
				"Synonyms and misspellings need review without collapsing unrelated topics.",
				"src/lib/videos/topics.ts|src/lib/videos/topic-rules.ts|src/components/library/use-topic-catalog.ts",
				"Detect candidate aliases from current taxonomy and show supporting source/title counts.|Require explicit approval for ambiguous merges and retain reversible alias provenance.|Rebuild only affected topic postings and preserve locked/manual labels.",
				"A reviewed spelling alias joins search and recommendations across reload.|Ambiguous short names remain separate; undo restores distinct counts and manual tags.",
				[51]
			],
			[
				"Tag recommendation confidence",
				"Inferred tags need calibrated confidence and evidence rather than a flat suggestion list.",
				"src/lib/videos/youtube-metadata.ts|src/lib/videos/topic-rules.ts",
				"Separate creator keywords, title phrases, chapters and description evidence using existing provenance.|Score confidence against a labeled fixture set and show the evidence source for each candidate.|Keep low-confidence suggestions review-only and preserve user locks during asynchronous acceptance.",
				"Promotional or unrelated description text cannot become a high-confidence interest tag.|Editing a tag while suggestions load preserves the manual value and records accepted evidence.",
				[51, 54]
			],
			[
				"AI Guide grounded explanation",
				"Guide suggestions need traceable reasons and a useful no-evidence state.",
				"src/lib/recommendations.ts|src/components/library/ai-guide.tsx",
				"Inspect current guide inputs and require saved tag/title/feedback evidence for each recommendation reason.|Display concise matching evidence and separate deterministic ranking from optional model wording.|Offer reason-specific feedback and a cold-start topic chooser when evidence is sparse.",
				"A recommendation cites real matching fields and never invents watched history or creator facts.|Empty, private-only and contradictory signal fixtures produce safe, understandable alternatives.",
				[
					51,
					52,
					55
				]
			],
			[
				"Recommendation session tuning",
				"Users need temporary discovery controls without permanently rewriting their taste profile.",
				"src/lib/recommendations.ts|src/components/library/library-app.tsx",
				"Add device-session controls for familiar versus exploratory, length and provider mix using existing ranking stages.|Keep these inputs separate from saved likes/tags and show an explicit reset.|Recompute cooperatively with cancellation and stable visible-card focus.",
				"Switching session mix changes eligible candidates without changing persistent likes or ratings.|Reload/reset behavior is documented and a 100k corpus avoids synchronous full ranking in render.",
				[51, 53]
			],
			[
				"Cross-source topic bridge audit",
				"A cross-source match needs meaningful shared topics rather than coincidental creator/source labels.",
				"src/lib/recommendations.ts|src/lib/videos/topics.ts",
				"Build fixtures for local, YouTube, Twitch and photo candidates with true and false topic bridges.|Require source-aware content evidence and exclude operational and private-only labels from public bridges.|Show which topic connected a candidate and allow bridge suppression without deleting tags.",
				"Matching by provider name, date or filename extension never creates a taste bridge.|A saved content topic bridges legitimate sources while respecting adult/private isolation.",
				[51, 54]
			],
			[
				"Recommendation fairness report",
				"Creator/provider diversity needs a diagnostic of actual output distributions.",
				"src/lib/recommendations.ts|src/components/library/stats-section.tsx",
				"Calculate bounded output summaries for creator share, provider share, novelty and repeated titles.|Compare declared diversity policy with actual top shelves and expose explanation for unavoidable concentration.|Export aggregate metrics without private titles unless the user explicitly chooses them.",
				"A single-source library is not falsely labeled unfair for lacking other providers.|A multi-source fixture detects one creator dominating beyond configured policy without altering saved preferences.",
				[
					51,
					57,
					58
				]
			],
			[
				"Feedback experiment replay",
				"Ranking changes should be replayable against the same saved evidence before rollout.",
				"src/lib/recommendations.ts|src/components/library/stats-section.tsx",
				"Create a read-only replay runner over a bounded anonymized signal snapshot and candidate corpus.|Compare current versus proposed weights with the evaluation metrics and top-change explanations.|Require explicit acceptance to change a local ranking preset; preserve the previous preset for rollback.",
				"Previewing an experiment writes no real likes, history, exposure or tags.|The same snapshot and preset yield deterministic metrics and a reversible accepted change.",
				[51, 59]
			]
		]
	},
	{
		track: "Film, anime and private media",
		offset: 60,
		rows: [
			[
				"Film identity review",
				"Movie membership needs a verified identity workflow for ambiguous titles and remakes.",
				"src/lib/videos/movie-catalog.ts|src/lib/videos/movie-selection.ts",
				"Add reviewable title/year/runtime identity candidates using local evidence and an optional permitted metadata source.|Keep confidence and origin visible; require selection when remakes or similarly named films conflict.|Store identity separately from display title and preserve manual corrections through refresh.",
				"Two remakes with the same title stay distinct and an unverified candidate is never labeled confirmed.|Changing identity updates film shelves without rewriting locked filenames or personal feedback.",
				[]
			],
			[
				"Movie cuts and editions",
				"Different cuts or resolutions of one film should be grouped without discarding copies.",
				"src/lib/videos/movie-catalog.ts|src/lib/videos/types.ts",
				"Recognize explicit edition tokens and represent a film with multiple owned/source versions.|Offer preferred-version selection using verified runtime/source availability rather than file-size guesses.|Keep resume/progress per version and a reversible group choice.",
				"Theatrical and extended cuts retain separate resume marks and file links.|A group action never deletes a duplicate-looking source and ungroup restores the original cards.",
				[9, 61]
			],
			[
				"Movie metadata provenance review",
				"Film posters and release data need safe correction when an external match is wrong.",
				"src/lib/videos/movie-catalog.ts|src/components/library/pre-video.tsx",
				"Expose each film field's source/confidence and the current manual lock state.|Preview an alternate metadata match before applying selected fields only.|Retain prior metadata for undo and avoid automatically downloading large artwork sets.",
				"Correcting a poster cannot overwrite a locked title, year or category.|A failed metadata request leaves the previous confirmed film visible and usable.",
				[61]
			],
			[
				"Anime series identity review",
				"Release names alone cannot reliably distinguish sequels, remakes and alternate numbering.",
				"src/lib/videos/anime-title.ts|src/lib/videos/anime-catalog.ts",
				"Add explicit local series identities and review ambiguous parsed series/season candidates.|Support aliases and absolute-versus-season numbering without requiring an external account.|Keep parsing evidence visible and reversible before grouping saved episodes.",
				"Two remakes or sequel series with similar names remain distinct until approved.|A reviewed identity survives filename variation, refresh and backup import without losing episode progress.",
				[]
			],
			[
				"Anime episode gap map",
				"Series browsing should show known missing episodes without inventing a complete release schedule.",
				"src/lib/videos/anime-catalog.ts|src/lib/videos/anime-title.ts",
				"Compute gaps only within observed or explicitly entered season ranges.|Show duplicate versions, specials and unresolved episode numbers separately from confirmed missing slots.|Link each slot to owned playable versions while keeping natural episode order.",
				"Episodes 1, 2 and 4 show a bounded gap at 3 without inventing episodes after 4.|Specials and absolute numbering cannot create hundreds of false gaps; ambiguous data remains unverified.",
				[64]
			],
			[
				"Anime next-episode policy",
				"Continue watching needs a user-controlled next-episode choice across specials and multiple versions.",
				"src/lib/videos/anime-catalog.ts|src/lib/videos/store.ts",
				"Resolve the next confirmed episode from series identity, season order and completion threshold.|Preview skips over missing episodes and keep specials/OVAs opt-in.|Launch only on an explicit action or existing permitted autoplay preference; preserve version-specific resume.",
				"Completing episode 2 recommends 3 when present and explains a skip when absent.|A special or alternate version cannot unexpectedly autoplay as the next numbered episode.",
				[64, 65]
			],
			[
				"Adult provider capability registry",
				"Adult sources need explicit supported media/search/live capabilities and honest unsupported states.",
				"src/lib/remote/api.ts|src/lib/remote/live-rooms.ts",
				"Inventory existing permitted adapters and define capabilities for video, photos, tags, paging and live embeds.|Drive source controls from declared capabilities rather than offering nonfunctional generic actions.|Keep 18+ isolation and official external fallback for providers without permitted in-app players.",
				"Unsupported search/embed options are absent or clearly explained for the affected provider.|Changing a capability does not expose private saved cards or enable new scraping behavior.",
				[]
			],
			[
				"Adult pull quality fixtures",
				"Provider-specific metadata regressions need source-by-source quality evidence.",
				"src/lib/remote/api.ts|src/lib/videos/topic-rules.ts",
				"Create redacted fixtures for each existing permitted adapter, covering IDs, titles, dates, thumbnails and cursors.|Measure missing-field and duplicate rates without fetching private accounts or bypassing access restrictions.|Add targeted adapter diagnostics and preserve the last healthy result on malformed pages.",
				"A malformed provider payload cannot be interpreted as an empty exhausted catalog.|Unknown publication dates remain unknown and failures affect only the relevant source.",
				[67]
			],
			[
				"Private recommendation isolation audit",
				"Private labels and viewing signals need proof they cannot influence public sharing surfaces.",
				"src/lib/videos/public-visibility.ts|src/lib/videos/guide-picks.ts|src/lib/videos/topic-postings.ts|src/lib/multiplayer/room-catalog-policy.ts",
				"Map private/adult signals through Home, topics, guide reasons, exports and room discovery.|Define an explicit boundary for local private recommendations versus public descriptors.|Add adversarial mixed-catalog fixtures and redacted diagnostic assertions.",
				"A public room, ordinary export preview and public recommendation reason reveal no private title or label.|Unlocking the private section changes only explicitly private surfaces and does not relax guest visibility.",
				[
					43,
					58,
					67
				]
			],
			[
				"Saved provider login guidance",
				"Embedded-site login failures need consistent first-party recovery without credential handling.",
				"src/lib/videos/official-room.ts|src/components/library/official-room-player.tsx",
				"Audit official provider panels and centralize first-party login guidance and remembered external/embedded choices.|Explain browser cookie/session boundaries and provide safe top-level links and selectable URL fallback.|Never read/export credentials or cookies, weaken browser protections or claim external login authenticates an iframe.",
				"A login-loop recovery unloads the affected embed and retains the chosen official URL after reload.|Restricted embeds remain unsupported and the app does not proxy authentication or clear unrelated site data.",
				[67]
			]
		]
	},
	{
		track: "Desktop and local workflows",
		offset: 70,
		rows: [
			[
				"Companion protocol negotiation",
				"Browser and Companion version drift needs actionable capability negotiation.",
				"src/lib/companion-protocol.ts|src/lib/companion.ts|src/components/library/companion-recovery-panel.tsx|companion/reelcase-companion.mjs",
				"Define a versioned capability response for file, download, artwork, print and launch operations.|Gate each browser control by negotiated capability while retaining older supported Companion versions.|Show minimum-version guidance for missing features without disabling unrelated working features.",
				"An older Companion can still serve supported file operations while newer controls remain unavailable.|Unknown capability fields are ignored safely and incompatible major versions fail with a clear reason.",
				[]
			],
			[
				"Companion task queue recovery",
				"Long local jobs need durable outcomes when the browser or Companion restarts.",
				"companion/download-manager.mjs|src/components/library/companion-recovery-panel.tsx|src/components/library/youtube-download-dialog.tsx|docs/COMPANION_PROTOCOL_AND_RECOVERY.md",
				"Inventory existing job persistence and introduce bounded idempotent task receipts where absent.|Recover queued/running/interrupted states without re-launching completed external actions.|Expose resume/cancel for supported job types and a read-only history with clear retention.",
				"Restart during a download or scan; completed files are not downloaded again without user intent.|Cancelled/interrupted jobs cannot be reported complete and receipts contain no secret headers.",
				[71]
			],
			[
				"Approved-root change audit",
				"Root permission changes need immediate enforcement for queued and active Companion operations.",
				"companion/root-authority.mjs|companion/download-manager.mjs|companion/reelcase-companion.mjs|src/components/library/root-access-panel.tsx",
				"Trace approved-root checks at enqueue, traversal, file-open and final write boundaries.|Revalidate canonical paths and root generation after symlink/junction or permission changes.|Stop affected queued work and report denied paths without broad disk enumeration.",
				"Revoke a root during a held operation; no later read/write escapes the remaining approved roots.|Traversal, junction and renamed-root fixtures are denied while normal approved files remain usable.",
				[71]
			],
			[
				"Local media health remediation",
				"Disconnected files need grouped repair actions with verified matching and no destructive guesses.",
				"src/lib/videos/local-runtime.ts|src/lib/videos/store.ts|companion/reelcase-companion.mjs",
				"Group unavailable local entries by approved source and distinguish missing permission from missing files.|Offer reconnect, rescan selected folder and reviewed identity match using the migration ledger.|Update only verified matches and preserve bookmarks for unresolved entries.",
				"A disconnected drive is never treated as proof that all its files were deleted.|A reviewed reconnect restores playback and progress without a whole-disk scan.",
				[9, 73]
			],
			[
				"Downloader authentication state",
				"Browser-cookie authentication needs clear consent, scope and failure reporting.",
				"src/components/library/youtube-download-dialog.tsx|companion/download-auth.mjs|companion/download-manager.mjs|docs/COMPANION_UPDATE_AND_AUTH.md",
				"Audit the existing yt-dlp authentication path and show selected browser/profile without exposing cookie contents.|Require an explicit user action to use eligible local session credentials and keep extraction on the Companion.|Distinguish expired session, unsupported access and downloader failure; provide provider-approved external fallback.",
				"Cookies/tokens never enter browser storage, exports, logs or app server payloads.|Denied/restricted content is not promised playable; failed auth retains the queued URL and a safe retry action.",
				[71, 72]
			],
			[
				"Download disk-budget preflight",
				"Large download batches need disk-space and destination checks before work begins.",
				"companion/download-preflight.mjs|companion/download-manager.mjs|src/lib/youtube-download.ts|src/components/library/youtube-download-dialog.tsx|docs/DOWNLOAD_BUDGET_AND_GAME_RECEIPTS.md",
				"Check approved destination, existing partial files and available-space estimates before each queued job.|Show unknown-size estimates honestly and reserve a configurable bounded safety margin.|Pause safely on insufficient space and resume the verified partial file when supported.",
				"A low-space fixture prevents a new write and preserves the existing partial file.|Changing destination or root approval revalidates the path and cannot overwrite an unrelated file.",
				[72, 73]
			],
			[
				"Game launch receipt and recovery",
				"One-click launches need evidence of what happened without repeatedly starting the same executable.",
				"companion/launch-manager.mjs|companion/reelcase-companion.mjs|src/lib/companion.ts|src/components/library/games-section.tsx|docs/DOWNLOAD_BUDGET_AND_GAME_RECEIPTS.md",
				"Return a bounded launch receipt with approved shortcut identity, time and observed start outcome.|Separate accepted launch from verified process readiness and show retry only when appropriate.|Prevent double-click duplicate launches within a short idempotency window without globally blocking other games.",
				"Repeated identical launch intents produce one process request and a reusable receipt.|A missing shortcut or permission revocation produces a clear error without shell-command interpolation.",
				[71, 73]
			],
			[
				"Print model save transaction",
				"Print edits need a safe save-as workflow that preserves originals and editor state.",
				"src/components/library/print-model-viewer.tsx|src/components/library/print-save-panel.tsx|src/lib/print-save.ts|companion/print-transactions.mjs|docs/PRINT_SAVE_AND_PLATFORM_CONTRACT.md",
				"Trace model transforms/material edits and define which formats can faithfully store them.|Preview format limitations and save to an approved new path using an atomic temporary file.|Retain the original and recover interrupted saves without marking unsaved edits as persisted.",
				"A write failure leaves the original model unchanged and the editor marked unsaved.|Reopening a supported saved format reproduces verified transforms; unsupported material loss is clearly disclosed.",
				[72, 73]
			],
			[
				"Companion update health checklist",
				"Upgrading the local service should not silently break browser integration.",
				"src/lib/companion-update.ts|src/components/library/companion-update-panel.tsx|companion/reelcase-companion.mjs|docs/COMPANION_UPDATE_AND_AUTH.md",
				"Create an explicit pre/post-update health check for capabilities, roots, queued jobs and configured tool versions.|Export a redacted diagnostic and retain a rollback reference for the previous service configuration.|Keep updating/manual installation separate from ordinary browser health checks.",
				"A simulated incompatible update surfaces missing capabilities and leaves saved catalog data intact.|Health checks do not install packages, change firewall rules or restart unrelated processes.",
				[71, 72]
			],
			[
				"Cross-platform local integration contract",
				"Platform-specific Companion behavior needs explicit capability fallbacks rather than Windows assumptions.",
				"companion/platform-contract.mjs|companion/platform-capabilities.mjs|src/lib/companion-protocol.ts|src/components/library/use-companion-support.ts|companion/README.md|docs/PRINT_SAVE_AND_PLATFORM_CONTRACT.md",
				"Inventory Windows-only shortcut, tray, startup and file inspection paths.|Define a platform-neutral core contract and honest unsupported states for other platforms.|Add filesystem/path and capability fixtures for supported environments without claiming unavailable native tests.",
				"Unsupported platform actions do not appear enabled or execute Windows shell commands.|Document which native OS checks ran; browser-only operation remains usable with no Companion.",
				[
					71,
					73,
					79
				]
			]
		]
	},
	{
		track: "AI studio and creator tools",
		offset: 80,
		rows: [
			[
				"Image model compatibility preflight",
				"A Hugging Face download is not necessarily compatible with the configured image engine.",
				"src/components/library/studio-model-library.tsx|src/components/library/stable-diffusion-section.tsx|src/lib/studio-model-notes.ts|companion/studio-model-preflight.mjs",
				"Inventory supported engine/model families and validate downloaded metadata, format and required companion components.|Show a compatibility checklist before selecting a checkpoint, including architecture and estimated hardware needs.|Keep incompatible or incomplete models visible with exact missing requirements instead of enabling generation.",
				"An unsupported Qwen-family artifact cannot be mislabeled as an AUTOMATIC1111-compatible checkpoint.|Valid compatible models remain selectable after reload and failure leaves the previous working model selected.",
				[]
			],
			[
				"Resumable model download integrity",
				"Large model downloads need explicit resumable verification without retaining entire files in browser memory.",
				"companion/model-transfers.mjs|companion/studio-models.mjs|src/components/library/model-transfer-recovery.tsx|src/components/library/studio-model-library.tsx",
				"Use approved local storage for chunked downloads with verified HTTPS source and optional publisher checksum.|Resume only when remote identity/ETag matches the partial file; otherwise preview a restart.|Publish a model as installed only after complete size/checksum validation and cancellation cleanup.",
				"Interrupt and resume a large fixture without duplicating bytes or loading the complete model into JS memory.|A changed remote file or checksum failure cannot replace the active verified model.",
				[
					72,
					73,
					81
				]
			],
			[
				"Model card requirements notes",
				"Users need executable setup guidance for the exact model rather than generic download advice.",
				"src/components/library/studio-model-library.tsx|src/lib/studio-recipes.ts",
				"Store a local note with canonical model URL/revision, license, model family and required engine components.|Provide a reviewable import form for model-card requirements; treat remote text as data, never executable instructions.|Generate a setup checklist and verified/unverified labels tied to compatibility preflight.",
				"A note distinguishes checkpoint, LoRA, VAE, text encoder and diffusion pipeline roles.|Unsupported or ambiguous versions remain unverified and no remote model card can trigger a command or download automatically.",
				[81]
			],
			[
				"Generation job lifecycle",
				"Generation needs reliable queued, running, cancelled and failed states across reconnects.",
				"src/lib/studio-session.ts|src/lib/studio-jobs.ts|src/lib/studio-documents.ts|src/components/library/stable-diffusion-section.tsx",
				"Map engine job identifiers and define a bounded local session record for parameters and outcomes.|Reconnect by verified job identity where supported; otherwise show an interrupted state without resubmission.|Cancel explicitly and keep completed output references separate from transient progress.",
				"Reload while an engine request is held; the app cannot launch a duplicate generation silently.|Engine disconnect and cancellation preserve the previous completed images and input prompt.",
				[81]
			],
			[
				"Reproducible generation recipes",
				"A saved image needs enough provenance to reproduce its settings with an honest compatibility warning.",
				"src/lib/studio-recipes.ts|src/components/library/studio-recipes.tsx|src/lib/studio-session.ts",
				"Record model revision/hash when available, sampler, seed, dimensions and supported engine parameters.|Preview a recipe before loading it and map only fields supported by the current engine.|Export a portable recipe excluding local paths, tokens and private server configuration.",
				"Loading a recipe with a missing model prompts for a compatible choice rather than silently substituting.|Replaying a deterministic supported fixture reproduces settings; pixel identity is not claimed across different engines.",
				[
					81,
					83,
					84
				]
			],
			[
				"Image output storage policy",
				"Generated images and previews need bounded local retention without losing deliberately saved work.",
				"src/lib/studio-outputs.ts|src/lib/studio-session.ts|src/components/library/studio-output-library.tsx|src/components/library/stable-diffusion-section.tsx",
				"Separate temporary previews, completed unsaved results and explicitly saved outputs.|Show retention/storage controls and preview cleanup of disposable previews only.|Release image URLs and buffers after navigation, engine failure and cleanup.",
				"A long generation fixture retains only the declared preview budget.|Saved outputs and recipes survive cleanup/reload; missing local files remain identifiable rather than silently deleted.",
				[2, 84]
			],
			[
				"Stream Signal pack revisions",
				"Announcement edits need revision-aware recovery across tabs without accidental publication state.",
				"src/lib/stream-signal-revisions.ts|src/lib/stream-signal.ts|src/components/library/use-stream-signal.ts|src/components/library/stream-signal-section.tsx",
				"Assign stable pack/draft revisions and detect conflicting edits using the cross-tab writer protocol.|Offer keep-current or restore-prior text with a compact edit history and explicit manual sharing receipts.|Keep Copy/Open actions separate from Mark shared and preserve both channel links.",
				"Two tabs editing one draft cannot silently erase the newer text.|Reload/undo restores text and manual checklist state without claiming any external platform published it.",
				[6]
			],
			[
				"Announcement card accessibility",
				"Story cards need readable exports and a text alternative at mobile sharing sizes.",
				"src/lib/stream-signal-card.ts|src/components/library/signal-story-export.tsx|src/components/library/stream-signal-section.tsx",
				"Measure card text fit for long creator names, titles and messages at 1080×1920.|Add bounded wrapping/overflow warnings and a plain-text alt/caption export.|Verify contrast and safe placement while explaining that link stickers are added inside the platform.",
				"Long Unicode titles fit or trigger an explicit warning before export.|The downloaded PNG has exact dimensions and the text export contains both verified stream links.",
				[]
			],
			[
				"Chat Plays deterministic replay",
				"The simulator needs reproducible event replay before it can inform a future local controller.",
				"src/lib/stream-signal-lab.ts|src/lib/stream-signal-replay.ts|src/components/library/stream-signal-lab.tsx|src/components/library/stream-signal-replay.tsx",
				"Record a bounded seed/configuration and normalized simulated ballot/event log.|Replay voting windows, duplicate rejection, sequence votes and resource checks deterministically.|Show divergence details and ensure emergency stop clears votes and pending moves during replay.",
				"Replaying the same event set produces identical ballots, tie-breaks and execution order.|Malformed or late events are rejected and no simulated input is labeled connected to real chat or a game.",
				[]
			],
			[
				"Local racing adapter contract",
				"The AI Blueprint needs an implementation-ready boundary for a future authenticated local game adapter.",
				"src/lib/racing-adapter-contract.ts|src/components/library/racing-contract-lab.tsx|src/components/library/stream-signal-section.tsx|companion/README.md|docs/LOCAL_RACING_ADAPTER_CONTRACT.md",
				"Document versioned observation, strategic intent, acknowledgement, timeout and emergency-stop messages.|Define authenticated local pairing, allowed commands and stale-observation rejection; keep continuous driving control local.|Provide an offline contract validator and simulator example, explicitly separating it from a real installed-game integration.",
				"Invalid, stale or unauthenticated intents fail the contract validator and cannot enqueue actions.|Documentation states that no real iRacing control is complete until a separate permitted adapter is implemented and tested.",
				[89],
				"A separate local game adapter and supported game integration are required for real driving; this milestone delivers only the boundary and validator."
			]
		]
	},
	{
		track: "Trust, accessibility and release",
		offset: 90,
		rows: [
			[
				"Sensitive export redaction review",
				"Diagnostics and portable files need one audited boundary for secrets and private source data.",
				"src/lib/diagnostic-export.ts|src/components/library/diagnostic-export-preview.tsx|src/components/library/performance-scorecard.tsx|src/lib/multiplayer/room-connection-timeline.ts",
				"Enumerate all export/clipboard/download paths and classify credentials, invitation tokens, local paths and private titles.|Create a shared allowlist-based redactor for diagnostic exports while preserving intentional private backups under explicit choice.|Add a preview showing excluded classes and test nested/unexpected fields.",
				"Canary secrets injected into diagnostic inputs never appear in output bytes or console logs.|A deliberately selected full private backup remains restorable and clearly distinguished from a shareable diagnostic.",
				[
					3,
					43,
					69
				]
			],
			[
				"Capability consent ledger",
				"Optional integrations need understandable remembered consent and revocation.",
				"src/lib/capability-consent.ts|companion/capability-consent.mjs|src/components/library/capability-permissions.tsx|src/lib/companion.ts|src/components/library/settings-section.tsx",
				"List local file roots, model downloads, external sharing, provider sessions and optional assistant capabilities.|Show what each capability permits, its current state and how to revoke it without erasing unrelated content.|Re-check consent generation before delayed operations start or commit.",
				"Revoking a capability cancels or denies relevant pending work and leaves unrelated saved data intact.|An unknown/unconfigured integration is never presented as connected or authorized.",
				[
					71,
					73,
					81
				]
			],
			[
				"Remote desktop pairing safeguards",
				"Remote desktop access needs verifiable pairing and expiry rather than broad unattended access defaults.",
				"companion/creative-tools.mjs|src/components/library/remote-desktop-section.tsx|docs/MODEL_TRANSFER_AND_REMOTE_SAFEGUARDS.md",
				"Audit the actual RustDesk launch/integration boundary and document which process handles authentication.|Add explicit pairing/session visibility, expiry guidance and stop/disconnect actions supported by the real integration.|Keep credentials out of URLs/exports and gate unattended access behind an explicit separate choice.",
				"A simulated expired pairing cannot initiate a new session through the app.|Document real native verification separately; a launcher button alone must not be marked as a working remote desktop session.",
				[71, 92],
				"This milestone delivers application approval and launch safeguards, not a verified remote session. Native RustDesk session verification requires an installed client and an explicitly approved peer; do not start a session without that authorization."
			],
			[
				"Destructive action recovery design",
				"Removal, reset and replacement actions need consistent previews and meaningful undo limits.",
				"src/lib/videos/store.ts|src/components/library/settings-section.tsx|src/components/library/mission-plan-section.tsx",
				"Inventory irreversible versus reversible mutations and distinguish hiding a card from deleting source files.|Apply a shared consequence preview and recoverable transaction where supported.|State undo scope/expiry and retain failure recovery information without adding confirmations to ordinary navigation.",
				"Reset/import/delete previews accurately name affected records before mutation.|Cancellation changes nothing and undo restores all promised fields without deleting source media.",
				[
					1,
					4,
					7
				]
			],
			[
				"Keyboard command coverage map",
				"Keyboard access needs a discoverable map and collision tests across dialogs and players.",
				"src/components/library/keyboard-help.tsx|src/lib/keyboard-commands.ts|src/components/library/library-app.tsx|src/components/library/player.tsx",
				"Inventory existing shortcuts, focus scopes and native provider key handling.|Add a searchable shortcut help view with context-sensitive availability and user-editable conflicts where supported.|Test shortcuts while typing, in nested dialogs and on virtualized card windows.",
				"Text inputs and native player controls retain their expected keys.|Every displayed command is reachable with visible focus and closing help restores the originating control.",
				[]
			],
			[
				"Accessible status announcement policy",
				"Progress and error updates should be useful to assistive technology without becoming noise.",
				"src/lib/status-announcement.ts|src/components/library/batch-status-announcement.tsx|src/components/library/live-check-status.tsx|src/components/library/twitch-clips-control.tsx|src/components/library/mission-plan-section.tsx|docs/ACCESSIBILITY_STATUS_AND_FOCUS.md",
				"Inventory live regions and define polite batch summaries versus urgent user-action errors.|Coalesce rapid provider/room updates and retain a readable last outcome.|Verify reduced-motion and high-contrast presentation alongside keyboard navigation.",
				"A 100-creator batch does not announce every internal counter tick.|Important failure and completion states are announced once with a usable recovery control.",
				[50, 95]
			],
			[
				"Onboarding using existing library state",
				"New and returning users need next steps that reflect actual configuration.",
				"src/lib/setup-readiness.ts|src/components/library/setup-checklist.tsx|src/components/library/light-home.tsx|src/components/library/settings-section.tsx",
				"Derive onboarding readiness from saved sources, approved Companion capabilities and usable catalog state.|Offer a small contextual checklist with dismiss/resume and no fabricated sample connections.|Keep costly scans/provider imports explicitly initiated and show offline-first options.",
				"An empty library gets useful choices while a populated returning profile avoids onboarding interruption.|Dismissing or completing a step persists without launching downloads, scans or account connections.",
				[71, 92]
			],
			[
				"Feature readiness inventory",
				"The app needs one truthful distinction between implemented, configured and externally verified features.",
				"src/lib/feature-readiness.ts|src/components/library/feature-readiness-panel.tsx|src/components/library/settings-section.tsx|src/components/library/mission-plan-section.tsx|MILESTONE_VERIFICATION.md",
				"Define readiness dimensions using actual capability/configuration and linked verification artifacts.|Show unsupported, unconfigured, ready and externally unverified states with concrete next steps.|Keep milestone completion separate from integration connection state and avoid automatic completion promotion.",
				"A built simulator is not labeled connected chat or game control, and an installed model is not proof of generation.|Missing evidence is visibly unverified; opening the inventory performs no external setup.",
				[
					79,
					81,
					90,
					93
				]
			],
			[
				"Release rollback drill",
				"A release needs a rehearsed recovery path for stored data and browser assets.",
				"src/lib/videos/persist.ts|scripts/browser-smoke.mjs|MILESTONE_VERIFICATION.md",
				"Document compatible schema ranges and create a disposable profile containing realistic saved signals.|Exercise upgrade, interrupted migration and rollback using production outputs without touching real user data.|Block rollback paths that cannot read the current schema and provide an explicit safe restore procedure.",
				"The drill restores the previous usable app/data combination or clearly rejects an unsafe downgrade.|Evidence includes output revision, schema revision and preserved personal-field counts without secrets.",
				[
					4,
					20,
					91
				]
			],
			[
				"Model-executable release handoff",
				"Future model work needs a consistent verified handoff rather than vague completion claims.",
				"src/lib/mission-plan.ts|src/components/library/mission-plan-section.tsx|MILESTONE_VERIFICATION.md",
				"Define a per-milestone handoff with changed files, baseline, validation commands, artifacts and remaining dependencies.|Validate dependency completion and distinguish code delivery from external verification before status changes.|Export a selected milestone brief plus its dependency context and acceptance checklist without private application data.",
				"A blocked external check cannot be silently converted to a complete milestone.|An exported handoff contains enough exact scope and evidence requirements for another model to resume without guessing.",
				[
					20,
					91,
					98,
					99
				]
			]
		]
	}
];
var NEXT_LEVEL_MISSIONS = tracks.flatMap(({ track, offset, rows }) => rows.map(([title, detail, files, steps, acceptance, dependencies, external], index) => {
	const n = offset + index + 1;
	return {
		id: "next-" + String(n).padStart(3, "0"),
		title,
		detail,
		done: NEXT_LEVEL_COMPLETED_IDS.includes("next-" + String(n).padStart(3, "0")),
		status: NEXT_LEVEL_COMPLETED_IDS.includes("next-" + String(n).padStart(3, "0")) ? "complete" : "planned",
		brief: {
			track,
			priority: critical.has(n) ? "P0" : n <= 60 ? "P1" : "P2",
			dependsOn: dependencies.map((d) => "next-" + String(d).padStart(3, "0")),
			files: files.split("|"),
			steps: steps.split("|"),
			acceptance: acceptance.split("|"),
			...external ? { external } : {}
		}
	};
}));
var NEXT_LEVEL_TRACKS = tracks.map((t) => t.track);
function formatMissionBrief(mission, context = NEXT_LEVEL_MISSIONS) {
	const brief = mission.brief;
	const dependencies = brief?.dependsOn.map((id) => {
		const dependency = context.find((m) => m.id === id);
		return "- " + id + (dependency ? " — " + dependency.title + " [" + (dependency.done ? "complete" : dependency.status ?? "planned") + "]" : " — resolve this prerequisite");
	}) ?? [];
	return [
		"# " + mission.id + " — " + mission.title,
		"Status: " + (mission.done ? "complete" : mission.status ?? "planned"),
		...brief ? ["Track: " + brief.track, "Priority: " + brief.priority] : [],
		"\n## Problem and intended outcome",
		mission.detail,
		"\n## Execution contract",
		...MODEL_EXECUTION_RULES.map((rule, i) => i + 1 + ". " + rule),
		"\n## Dependencies",
		...dependencies.length ? dependencies : ["None."],
		"\n## Start in",
		...brief?.files.map((f) => "- " + f) ?? ["Inspect the existing implementation and its tests."],
		"\n## Implementation",
		...brief?.steps.map((s, i) => i + 1 + ". " + s) ?? ["Implement the intended outcome and preserve current saved behavior."],
		"\n## Acceptance checks",
		...brief?.acceptance.map((a) => "- [ ] " + a) ?? ["- [ ] Demonstrate the requested behavior, failure recovery and relevant validation."],
		...brief?.external ? [
			"\n## External requirement",
			brief.external,
			"Do not claim this external requirement passed from fixtures alone."
		] : [],
		"\n## Required handoff",
		"Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status."
	].join("\n");
}
function formatNextLevelRoadmap(missions = NEXT_LEVEL_MISSIONS) {
	return [
		"# Realhub — 100 next-level milestones",
		"Status lines reflect verified defaults or the supplied in-app snapshot. Existing completion decisions are retained. P0 denotes foundational correctness/reliability risk; P1 denotes core workflow quality; P2 denotes capability and polish. Dependencies take precedence over priority.",
		"This file is generated from verified defaults. Use the current in-app status when executing; later manual status decisions remain local.",
		...missions.map((m) => formatMissionBrief(m, missions))
	].join("\n\n---\n\n") + "\n";
}
var REPOSITORY_CREDITS = [
	{
		name: "ComfyUI",
		url: "https://github.com/Comfy-Org/ComfyUI",
		license: "GPL-3.0",
		use: "Isolated local Qwen-Image 2.1 inference engine; fixed built-in workflow, custom nodes and cloud API nodes disabled."
	},
	{
		name: "Qwen-Image 2.1",
		url: "https://huggingface.co/Qwen/Qwen-Image-2.1",
		license: "Qwen Research License Agreement",
		use: "Image generation model; model card, license and intended-use terms apply."
	},
	{
		name: "Comfy-Org Qwen-Image 2.1 weights",
		url: "https://huggingface.co/Comfy-Org/Qwen-Image-2.1",
		license: "See upstream Qwen model license",
		use: "Official quantized diffusion model, Qwen3-VL text encoder and matching VAE distribution; files are checksum verified."
	},
	{
		name: "AUTOMATIC1111 Stable Diffusion WebUI",
		url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
		license: "AGPL-3.0",
		use: "Local API integration; source prepared separately. A running engine and checkpoint are required."
	},
	{
		name: "RustDesk",
		url: "https://github.com/rustdesk/rustdesk",
		license: "AGPL-3.0",
		use: "Checksum-verified portable client, page-scoped expiring outbound approval and launcher receipts. Native authentication/session permissions remain in RustDesk; real sessions are externally unverified."
	},
	{
		name: "shadcn/ui",
		url: "https://github.com/shadcn-ui/ui",
		license: "MIT",
		use: "Accessible component patterns and adapted Card primitives, styled with Realhub tokens."
	},
	{
		name: "youtube-dl",
		url: "https://github.com/ytdl-org/youtube-dl",
		license: "Unlicense",
		use: "Local YouTube video downloads through Companion; official nightly distribution."
	},
	{
		name: "yt-dlp",
		url: "https://github.com/yt-dlp/yt-dlp",
		license: "Unlicense",
		use: "Local YouTube downloads with opt-in browser-session authentication and playback of completed files. Official checksum-verified release; account access is still required. Its Twitch extractor was also used to cross-check the public VOD chapter schema; the chapter adapter is independently implemented."
	},
	{
		name: "React",
		url: "https://github.com/facebook/react",
		license: "MIT",
		use: "Application rendering."
	},
	{
		name: "TanStack Router / Start",
		url: "https://github.com/TanStack/router",
		license: "MIT",
		use: "Routing and server functions."
	},
	{
		name: "Radix UI",
		url: "https://github.com/radix-ui/primitives",
		license: "MIT",
		use: "Accessible dialogs and interactive primitives."
	},
	{
		name: "Tailwind CSS",
		url: "https://github.com/tailwindlabs/tailwindcss",
		license: "MIT",
		use: "Responsive styling and design tokens."
	},
	{
		name: "Zustand",
		url: "https://github.com/pmndrs/zustand",
		license: "MIT",
		use: "Library state management."
	},
	{
		name: "Lucide",
		url: "https://github.com/lucide-icons/lucide",
		license: "ISC",
		use: "Interface icons."
	},
	{
		name: "Three.js",
		url: "https://github.com/mrdoob/three.js",
		license: "MIT",
		use: "3D print viewer, GLB import/export for edited copies, and existing VR surfaces."
	},
	{
		name: "uv",
		url: "https://github.com/astral-sh/uv",
		license: "MIT / Apache-2.0",
		use: "Project-local Python runtime installation for Stable Diffusion."
	},
	{
		name: "PyTorch",
		url: "https://github.com/pytorch/pytorch",
		license: "BSD-3-Clause",
		use: "Local CUDA inference runtime."
	},
	{
		name: "Stable Diffusion 1.5 checkpoint",
		url: "https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5",
		license: "CreativeML OpenRAIL-M",
		use: "Local image model; original model card and license apply."
	},
	{
		name: "Comfy-Org SD 1.5 archive",
		url: "https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive",
		license: "CreativeML OpenRAIL-M",
		use: "Verified half-precision SD 1.5 checkpoint distribution for the local NVIDIA setup."
	}
];
var missionStatus = (mission) => mission.done ? "complete" : mission.status ?? "planned";
var missionStatusLabel = {
	planned: "Planned",
	"in-progress": "In progress",
	blocked: "Blocked",
	complete: "Complete"
};
var missionStatusTone = {
	planned: "bg-bg/65 text-muted",
	"in-progress": "bg-accent/15 text-accent",
	blocked: "bg-danger/15 text-danger",
	complete: "bg-accent/10 text-accent"
};
function missionSteps(mission) {
	if (mission.brief) return mission.brief.steps;
	if (mission.id === "watch") return [
		"Keep host state authoritative and reject stale playback or queue messages.",
		"Run isolated desktop-host and mobile-guest browser checks for connection, chat, playback, seek, and leave.",
		"Confirm the same flows on separate home-network devices, including local-file drift and queue changes."
	];
	if (mission.id === "sprint-19") return [
		"Verify the local guest-window fallback and isolated browser sessions.",
		"Check desktop and mobile room layout, chat, playback, seek, and reconnect in a repeatable browser run.",
		"Repeat on physical home-network devices and record browser, network, drift, and queue results."
	];
	if (mission.id === "watch-room-cross-device") return [
		"Enter temporary TURN credentials on both devices and enable relay-only mode.",
		"Verify both peers report a connected relay candidate and exchange chat and playback commands.",
		"Repeat across separate networks and record the diagnostic result without credentials."
	];
	if (mission.id.startsWith("watch") || mission.id.startsWith("twitch")) return [
		"Capture the current provider or room state without replacing a healthy cached result.",
		"Exercise the focused path with a bounded request, retry, and recovery case.",
		"Record the limit and verification result before increasing any default budget."
	];
	if (mission.id.startsWith("youtube")) return [
		"Keep the first visible shelf interactive while this provider work is deferred.",
		"Verify a recent refresh, an older-item pull, and duplicate-safe merge behavior.",
		"Measure payload and render cost before raising the routine refresh budget."
	];
	if (mission.id.startsWith("speed") || mission.id.startsWith("smooth") || mission.id.startsWith("warp")) return [
		"Add a local measurement or bounded scheduler for the affected work.",
		"Check the large-library path on desktop and phone without console errors or overflow.",
		"Keep the result behind a repeatable release check so it cannot silently regress."
	];
	return [
		"Implement the smallest durable local change that preserves existing saved data.",
		"Verify the normal path plus an interrupted or restored-session path.",
		"Run the production build check and record the remaining external dependency, if any."
	];
}
var DEFAULT_MISSIONS = [
	{
		id: "index",
		title: "Durable media index",
		detail: "Catalog source health, cached metadata, persistent thumbnails, and fast search without blocking the first screen.",
		done: true
	},
	{
		id: "companion",
		title: "Desktop companion",
		detail: "Verify local files, watch selected folders, and launch approved desktop shortcuts through a local companion. Realhub and Stop Realhub desktop controls manage this installation; shutdown asks Companion to preserve checkpoints before an exact process-identity fallback. Saved libraries remain intact; external native session handoffs remain unverified.",
		done: true
	},
	{
		id: "watch",
		title: "Watch room reliability",
		detail: "Host-authoritative state, stale-command rejection, revisioned queue reconciliation, LAN diagnostics, and guest-access messaging are implemented. Isolated desktop-host/mobile-guest WebRTC, chat, play/pause/seek, reload reconciliation, resync, local-file matching, queue edits, and leave checks pass. Twitch status waits for playback. The empty-library guest catalog check now verifies host-only search, paging, permissions, queue priority/removal, playback and reconnect without sharing host paths. Physical-device drift remains.",
		done: false,
		status: "in-progress"
	},
	{
		id: "watch-room-state-integrity",
		title: "Watch Room state integrity",
		detail: "Done · Watch Room now keeps a compact local session ledger, rejects stale or out-of-order host state, gives queue changes monotonic revisions, and routes guest playback or queue changes through host confirmation.",
		done: true
	},
	{
		id: "watch-room-browser-compatibility",
		title: "Watch Room browser compatibility",
		detail: "Done · local room and session identifiers now fall back safely when a browser exposes Web Crypto without crypto.randomUUID, preventing the room from failing before it can join.",
		done: true
	},
	{
		id: "services",
		title: "Connected services",
		detail: "Keep Twitch, YouTube, Roku, Spotify, and photo imports independently cached and refreshable.",
		done: true
	},
	{
		id: "thumb-health",
		title: "Thumbnail health queue",
		detail: "Retry failed artwork, hide unavailable remote cards, and expose a small source diagnostic instead of blank previews.",
		done: true
	},
	{
		id: "windows-explorer",
		title: "Windows explorer bridge",
		detail: "Companion-backed folder health, change events, shortcut validation, and safe launch history for local libraries.",
		done: true
	},
	{
		id: "service-status",
		title: "Service refresh status",
		detail: "Show when each connected service last refreshed, preserve partial results, and allow focused retries without reloading the whole app.",
		done: true
	},
	{
		id: "vr-theater",
		title: "VR theater reliability",
		detail: "WebXR cinema surface for local playback, controller transport controls, and clear Meta Quest recovery guidance.",
		done: true
	},
	{
		id: "companion-onboarding",
		title: "Companion onboarding",
		detail: "One-screen startup checklist: run the companion, confirm Desktop approval, load shortcuts, verify a file, then launch one game safely.",
		done: true
	},
	{
		id: "large-library-views",
		title: "Large-library views",
		detail: "Progressively render grids and keep recommendations responsive with very large catalog views.",
		done: true
	},
	{
		id: "favorites-memory",
		title: "Favorites memory",
		detail: "Preserve favorites, shelves, and resume markers in the local catalog with export and recovery checks across sessions.",
		done: true
	},
	{
		id: "recovery-import",
		title: "History & stats recovery imports",
		detail: "History and Stats now expose a merge-safe Realhub library-pack import for exported activity, resume marks, follows, shelves, ratings, Adult marks, and saved links.",
		done: true
	},
	{
		id: "anime-library-desk",
		title: "Anime library desk",
		detail: "Done · a separate Anime desk groups saved #anime media into all, continue, series, and films/specials shelves. It can tag existing catalog cards without importing, proxying, or embedding third-party streams.",
		done: true
	},
	{
		id: "tag-search-upgrade",
		title: "Tag search everywhere",
		detail: "Done · the top bar and Adults controls accept human-readable partial tags, match saved creator/source/interest labels, and keep Adult results on the current desk.",
		done: true
	},
	{
		id: "theme-accessibility",
		title: "Theme & accessibility",
		detail: "Day/night palettes, focus styling, reduced-motion support, and per-section density preferences.",
		done: true
	},
	{
		id: "preview-recovery",
		title: "Local preview recovery",
		detail: "Resolve restored file handles in previews, hide failures, and log playback health without blocking the library.",
		done: true
	},
	{
		id: "youtube-quality",
		title: "YouTube channel quality",
		detail: "Per-channel retry controls, published-date ordering, duplicate suppression, and unavailable-card recovery are available in the YouTube desk.",
		done: true
	},
	{
		id: "youtube-focused-archive-capacity",
		title: "YouTube focused archive capacity",
		detail: "Done · a focused creator pull has a 100,000-item metadata ceiling and enough bounded continuation budget to stop at that ceiling or at the public archive end. Routine and bulk pulls stay smaller.",
		done: true
	},
	{
		id: "youtube-comment-response-recovery",
		title: "YouTube comment response recovery",
		detail: "Done · on-demand comment pulls accept both current entity payloads and the durable commentRenderer response shape, with initial-page continuation fallback.",
		done: true
	},
	{
		id: "twitch-quality",
		title: "Twitch live quality",
		detail: "Live-first ordering, per-channel timestamps, VOD/clip shelves, focused refresh, retry deadlines, and an additive archive cache are active.",
		done: true
	},
	{
		id: "x-quality",
		title: "X reading desk quality",
		detail: "Public profile/topic navigation, per-view load state, retry handling, and local reading-position timestamps are available without credentials.",
		done: true
	},
	{
		id: "startup-budget",
		title: "Startup performance budget",
		detail: "Catalog hydration, deferred search-index construction, lazy thumbnails, and bounded photo rendering protect the first usable shelf.",
		done: true
	},
	{
		id: "provider-import-recovery",
		title: "Provider import recovery",
		detail: "Provider refreshes retain successful channel rows, preserve prior cache on partial failures, and use RSS/channel-page plus public Twitch GraphQL recovery paths.",
		done: true
	},
	{
		id: "adult-source-recovery",
		title: "Adult source recovery",
		detail: "Done · Booru pulls use source-aware queries plus JSON, XML, and public-listing recovery so Rule34-style, Gelbooru, and Realbooru responses no longer collapse into empty source chips.",
		done: true
	},
	{
		id: "adult-provider-diverse-recommendations",
		title: "Adult provider-diverse recommendations",
		detail: "Done · personal Adult shelves rank by private signals, then apply creator and provider round-robin guards; videos, photos, and picks each have a full-width discovery rail.",
		done: true
	},
	{
		id: "watch-room-cross-device",
		title: "Watch Room cross-device relay",
		detail: "Temporary TURN credentials and relay-only mode are implemented. Candidate diagnostics now distinguish direct from TURN paths. A real TURN service and two devices on separate networks are still required to prove relay connectivity.",
		done: false,
		status: "blocked"
	},
	{
		id: "movie-private-tag-shelves",
		title: "Movie and private tag shelves",
		detail: "Movies have source, genre, and file-type rails; private shelves retain favorites, tags, history, and rating-aware sorting locally.",
		done: true
	},
	{
		id: "sprint-01",
		title: "Alert rules",
		detail: "Per-service alert switches and the notification activity center are active locally.",
		done: true
	},
	{
		id: "sprint-02",
		title: "Preference coverage",
		detail: "Shipped preferences have concrete local controls, with status copy explaining their effects.",
		done: true
	},
	{
		id: "sprint-03",
		title: "Ratings streaks",
		detail: "Done · choose a local 3, 5, or 10-title weekly goal on Home; distinct ratings drive a local streak counter and transparent rewards.",
		done: true
	},
	{
		id: "sprint-04",
		title: "Video rating import/export",
		detail: "Include local video ratings in backup and catalog export recovery.",
		done: true
	},
	{
		id: "sprint-05",
		title: "Photo rating queue",
		detail: "Make unrated-photo review resumable across sessions.",
		done: true
	},
	{
		id: "sprint-06",
		title: "Continue recovery",
		detail: "Resume marks are durable, throttled away from the video frame loop, and recovered by path when a permitted source reconnects.",
		done: true
	},
	{
		id: "sprint-07",
		title: "History timeline",
		detail: "Limitless activity history deduplicates start bursts while retaining provider, progress, and Watch Room recovery context.",
		done: true
	},
	{
		id: "sprint-08",
		title: "X topic desk",
		detail: "Add curated public topic views alongside saved X profiles.",
		done: true
	},
	{
		id: "sprint-09",
		title: "X read tracking",
		detail: "Public profile/topic views persist their local last-loaded position and show timeout, retry, and official-view diagnostics.",
		done: true
	},
	{
		id: "sprint-10",
		title: "Twitch discovery",
		detail: "Verify recommended public channels and separate discovery from follows.",
		done: true
	},
	{
		id: "sprint-11",
		title: "YouTube discovery",
		detail: "Build a separate creator discovery shelf with follow actions.",
		done: true
	},
	{
		id: "sprint-12",
		title: "Channel recency",
		detail: "Show channel freshness and focused refresh results.",
		done: true
	},
	{
		id: "sprint-13",
		title: "Remote dedupe",
		detail: "Suppress duplicate remote cards while retaining the newest valid metadata.",
		done: true
	},
	{
		id: "sprint-14",
		title: "Artwork retry budget",
		detail: "Local frame artwork has a bounded three-attempt retry budget, source rescan recovery, and per-card failure diagnostics.",
		done: true
	},
	{
		id: "sprint-15",
		title: "File type views",
		detail: "File-type rails now extend from Games into Movies, built from the cached catalog without rescanning sources.",
		done: true
	},
	{
		id: "sprint-16",
		title: "Tag review queue",
		detail: "Smart name/date/type and vision tags remain explicit, reviewable local labels before you rely on them for browsing.",
		done: true
	},
	{
		id: "sprint-17",
		title: "Fast filters",
		detail: "Deferred search indexing, progressive grids, source-scoped selectors, and cached metadata keep large catalog filters off the first paint.",
		done: true
	},
	{
		id: "sprint-18",
		title: "Offline resilience",
		detail: "Cached source health, unavailable-card hiding, recovery views, and source diagnostics distinguish a stale cache from an unavailable file.",
		done: true
	},
	{
		id: "sprint-19",
		title: "Watch room device matrix",
		detail: "The local guest-window fallback and isolated desktop/mobile browser sessions are covered; direct WebRTC, chat, playback requests, seek, resync after reload, local-file consent/match, queue add/remove, leave, and mobile layout pass. In the isolated check, host-to-guest play and pause arrived in roughly 70 ms. The production Edge desktop/phone matrix also passes late provider readiness, blocked autoplay, clock skew, drift correction, live buffering/reload and Twitch startup. Physical home-network iOS/Android devices remain unverified.",
		done: false,
		status: "in-progress"
	},
	{
		id: "sprint-20",
		title: "Accessibility audit",
		detail: "Shared controls use visible focus states, accessible labels, responsive targets, contrast tokens, and the persisted reduced-motion preference.",
		done: true
	},
	{
		id: "metadata-provenance",
		title: "Metadata provenance and locks",
		detail: "Adopt the open-library pattern: preserve manual tags, record the source of enrichment, and never let a provider overwrite a locked user choice.",
		done: true
	},
	{
		id: "media-inspection",
		title: "Companion media inspection",
		detail: "Use the local companion for optional ffprobe/embedded-tag extraction in bounded batches, with a preview before tags are saved.",
		done: true
	},
	{
		id: "vision-tagging",
		title: "Optional local vision tagging",
		detail: "Evaluate an on-device open model for photo/video scene suggestions, keeping media bytes local and requiring review before labels are applied.",
		done: true
	},
	{
		id: "photo-model-quality",
		title: "Open-source photo tagging quality",
		detail: "On-device vision suggestions are cached by stable file fingerprint and remain review-only as vision-* tags before joining shared taxonomy.",
		done: true
	},
	{
		id: "companion-cache-workers",
		title: "Companion cache workers",
		detail: "Bounded Companion folder-delta, metadata, and thumbnail-hint workers expose their file/time budget and leave the first screen responsive.",
		done: true
	},
	{
		id: "watch-room-local-queue",
		title: "Watch Room local queue handoff",
		detail: "Guests now match approved local files by name, size, and modified time without sending file bytes; the shared handoff queue and room controls synchronize on every device. Catalog room playback is recorded in history.",
		done: true
	},
	{
		id: "photo-super-resolution",
		title: "Local photo upscaler beta",
		detail: "A user-initiated model download is checksum-verified, originals remain untouched, and cache health is reported before any export capability is enabled.",
		done: true
	},
	{
		id: "cross-source-taste-map",
		title: "Cross-source taste map",
		detail: "Stars, creator ratings, liked tags, and shared provider topics now guide cross-source shelves while filename-only terms stay weak.",
		done: true
	},
	{
		id: "companion-delta-apply",
		title: "Companion delta application",
		detail: "New Companion folder-change hints now debounce into bounded refreshes of matching, already-approved browser folders—no reconnect or broad rescan required.",
		done: true
	},
	{
		id: "local-share-compatibility",
		title: "Local share compatibility matrix",
		detail: "The local-share panel now reports exactly how many connected guests matched the staged fingerprint before the host plays it.",
		done: true
	},
	{
		id: "upscaler-model-install",
		title: "Verified upscaler model install",
		detail: "A user-initiated HTTPS download requires a publisher SHA-256, stores only a verified browser-cache artifact with a version record, and offers one-click removal. Runtime/export remain disabled until compatible execution is proven.",
		done: true
	},
	{
		id: "stats-source-remediation",
		title: "Stats-driven source remediation",
		detail: "Stats now offers safe tag and source review queues plus an exportable remediation plan. It never renames, reconnects, or removes files automatically.",
		done: true
	},
	{
		id: "youtube-deep-pagination",
		title: "YouTube deep pagination",
		detail: "Done · focused creator pulls use a bounded 100,000-item public catalog ceiling, duplicate suppression, and a short server cache to avoid repeated provider work; routine and bulk windows remain smaller.",
		done: true
	},
	{
		id: "taste-signal-audit",
		title: "Taste-signal audit",
		detail: "Stats now separates topic coverage, multi-topic depth, cross-source bridges, and operational-label volume so ranking inputs can be inspected before their weight changes.",
		done: true
	},
	{
		id: "tag-noise-budget",
		title: "Tag noise budget",
		detail: "Date, provider, format, source, creator, and keyword labels remain searchable/exportable but are excluded from taste scoring.",
		done: true
	},
	{
		id: "creator-coverage-repair",
		title: "Creator coverage repair",
		detail: "Done · Settings repairs missing YouTube/Twitch creator names in bounded 48-card batches only from exact cached channel/source IDs, retains them across shallow refreshes, preserves locked tags, and visibly leaves conflicting matches for review.",
		done: true
	},
	{
		id: "metadata-tail-coverage",
		title: "Metadata tail coverage",
		detail: "Done · cached metadata enrichment now runs in bounded 48-title batches, reports tagged/waiting/locked coverage by source, preserves manual locks, and makes no provider request.",
		done: true
	},
	{
		id: "recommendation-diversity",
		title: "Recommendation diversity guardrails",
		detail: "Done · Home and provider discovery use deduplicated creator and provider round-robin selection, preserving highly rated favorites while preventing one creator or source from occupying a rail.",
		done: true
	},
	{
		id: "activity-journal",
		title: "Independent activity journal",
		detail: "Keep History, Continue marks, and local viewing counts in an IndexedDB activity record separate from broad preference storage.",
		done: true
	},
	{
		id: "shelf-explanations",
		title: "Explainable recommendation shelves",
		detail: "Done · recommendation rails now state their plain-language reason—ratings, saved creators, freshness, progress, or follow state—without exposing transport tags.",
		done: true
	},
	{
		id: "memory-pressure-observer",
		title: "Memory-pressure observer",
		detail: "Done · local Diagnostics reports mounted-card count, decoded artwork cache entries, active/queued decode work, hit/miss/eviction counts, and frame pressure so large shelves have an observable cause.",
		done: true
	},
	{
		id: "warp-01",
		title: "First-shelf trace",
		detail: "Done · local Diagnostics records launch-to-first-mounted-shelf time, title, and visible-card count. Deeper cache/index and thumbnail splits remain separate work.",
		done: true
	},
	{
		id: "warp-02",
		title: "Route-level code splitting",
		detail: "Done · Hub workspaces plus Adult controls, the video preview/player, and the local guide load on demand. The opening Home route no longer downloads those screens before it is usable.",
		done: true
	},
	{
		id: "warp-03",
		title: "Provider delta rendering",
		detail: "Done · routine provider refreshes keep unchanged cards at their original indexes and preserve their object identity; changed/new rows alone reach shelves, while shallow responses retain on-demand comments and verified creator names.",
		done: true
	},
	{
		id: "warp-04",
		title: "Thumbnail decode governor",
		detail: "Done · visible and near-view artwork uses bounded workers, pauses during input or hidden-tab time, and retains a small queue for responsive recovery.",
		done: true
	},
	{
		id: "warp-05",
		title: "Search worker index",
		detail: "Done · full-text tokenization runs in a dedicated worker, while the search box shows an honest warming state until its local index is ready.",
		done: true
	},
	{
		id: "warp-06",
		title: "Photo metadata stream",
		detail: "Done · local photo dimensions and saved dates stream in eight-item browser chunks, yield between batches, persist each result, and show completed/remaining work with a rolling estimate.",
		done: true
	},
	{
		id: "warp-07",
		title: "Warm route cache",
		detail: "Done · one adjacent Hub desk is warmed only after a paint frame and browser idle time; it yields to active input, hidden tabs, Save-Data, slow networks, and low-memory devices.",
		done: true
	},
	{
		id: "warp-08",
		title: "Virtual rail windows",
		detail: "Done · long horizontal shelves mount only a measured card window with spacers, while arrows, Home/End, and focus bridges keep keyboard travel continuous across unmounted cards.",
		done: true
	},
	{
		id: "warp-09",
		title: "Visible-card priorities",
		detail: "Done · a short foreground lease now protects ratings, playback, card opens, and visible artwork; deferred indexing, discovery, Adult ranking, facets, and speculative images resume only after the interaction window clears.",
		done: true
	},
	{
		id: "warp-10",
		title: "Idle tag batching",
		detail: "Done · each tag edit first writes a recoverable per-title journal, then coalesces the broad preference snapshot outside the input frame.",
		done: true
	},
	{
		id: "warp-11",
		title: "Artwork disk cache audit",
		detail: "Done · Settings audits Companion disk artwork by source with file sizes, oldest update, session hit/miss counts, and explicit partial-inventory or unavailable states.",
		done: true
	},
	{
		id: "warp-12",
		title: "Provider request coalescing",
		detail: "Done · matching in-flight YouTube and Twitch pulls share one provider request across tabs and focused controls.",
		done: true
	},
	{
		id: "warp-13",
		title: "Backoff-aware provider scheduler",
		detail: "Done · provider failures use bounded exponential backoff, show the exact retry time, and retain focused refresh as an override.",
		done: true
	},
	{
		id: "warp-14",
		title: "Twitch archive depth",
		detail: "Twitch now reserves archive checks in every mixed refresh, retains up to 640 recent VOD rows on routine checks and up to 8,000 on focused pulls, and reports sparse channels directly in the Live desk.",
		done: true
	},
	{
		id: "warp-15",
		title: "YouTube freshness ledger",
		detail: "Done · each provider channel records its last successful check, newest published item, and response count.",
		done: true
	},
	{
		id: "warp-16",
		title: "Worker budget adaptation",
		detail: "Done · thumbnail workers adapt to cores, memory class, visibility, and foreground input pressure.",
		done: true
	},
	{
		id: "warp-17",
		title: "Companion warmup contract",
		detail: "Done · warmup is bounded by a visible time/file budget and reports the exact stop reason.",
		done: true
	},
	{
		id: "warp-18",
		title: "Duplicate selector memoization",
		detail: "Done · source and provider selectors share a per-state memo across Home, Stats, and Search paths.",
		done: true
	},
	{
		id: "warp-19",
		title: "Feed image expiry repair",
		detail: "Done · a failed provider image schedules a one-creator refresh while healthy sibling cards remain cached.",
		done: true
	},
	{
		id: "warp-20",
		title: "Low-bandwidth artwork mode",
		detail: "Done · settings can defer provider artwork and retain text-first, fully actionable cards.",
		done: true
	},
	{
		id: "warp-21",
		title: "Catalog hydration checkpoints",
		detail: "Done · local scans append each bounded batch to the catalog cache; the next launch hydrates that checkpoint before any optional folder rescan.",
		done: true
	},
	{
		id: "warp-22",
		title: "History append path",
		detail: "History, Continue marks, and view counts persist through the independent IndexedDB activity record; evicted provider cards retain a recoverable saved-link entry.",
		done: true
	},
	{
		id: "warp-23",
		title: "Rating feedback latency",
		detail: "Done · star input updates locally, coalesces persistence outside the input frame, and reports queue/disk timing in Diagnostics.",
		done: true
	},
	{
		id: "warp-24",
		title: "Remote catalog partitioning",
		detail: "Done · refreshes merge by provider channel; partial Twitch archive responses retain earlier VODs while fresh rows update in place.",
		done: true
	},
	{
		id: "warp-25",
		title: "Tag taxonomy compaction",
		detail: "Done · provider enrichment removes legacy wrappers, whitespace variants, duplicates, and transport-only labels when tags enter the catalog.",
		done: true
	},
	{
		id: "warp-26",
		title: "Render budget dashboard",
		detail: "Done · local Diagnostics reports mounted cards, artwork cache entries, frame pressure, and rating persistence timing.",
		done: true
	},
	{
		id: "warp-27",
		title: "Near-view prefetch",
		detail: "Done · local artwork is requested at a small intersection margin, with bounded workers and no full-library thumbnail sweep.",
		done: true
	},
	{
		id: "warp-28",
		title: "Fast resume lookup",
		detail: "Done · recovery resolves History/Continue entries through a stable provider URL or local path index before falling back to a saved-link card.",
		done: true
	},
	{
		id: "warp-29",
		title: "Vision model benchmark",
		detail: "Compare CLIP with the optional SigLIP semantic model on a broader local sample; the result records preparation plus inference for a quality-focused default.",
		done: true
	},
	{
		id: "warp-30",
		title: "Performance regression gate",
		detail: "Done · the repeatable large-library browser benchmark records startup, scroll settle, mounted cards, overflow, and console errors.",
		done: true
	}
];
var ROADMAP_EXPANSION = [
	...[
		[
			"adult-thumbnail-coverage",
			"Adult preview & playback coverage",
			"Done · Redgifs now uses its durable official iframe in both preview and full player, while direct-media providers bind their known media URL instead of opening an empty player. Existing poster fallback scoring remains in place across Reddit, Redgifs, RedTube, and other adult providers."
		],
		[
			"print-file-viewer",
			"3D print file viewer",
			"Interactive three.js orbit viewer + transform editor for STL, OBJ, GLB/GLTF, and 3MF — lighting/camera presets, wireframe, grid, explode, fullscreen; sample models plus user-added IndexedDB bytes; dispose on close."
		],
		[
			"twitch-view-modes",
			"Twitch viewing modes",
			"Done · the official Twitch player switches between theater and side-details views. Offline channel placeholders stay out of playable shelves, while useful signals rank saved VODs."
		],
		[
			"games-shortcut-curation",
			"Games shortcut curation",
			"Done · Games keeps approved launchers only, enriches companion/folder icons, and stores artwork separately in the local game-icon cache so unrelated desktop helpers cannot enter recommendations."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"print-file-viewer",
			"adult-thumbnail-coverage",
			"twitch-view-modes",
			"games-shortcut-curation"
		].includes(id)
	})),
	...[
		[
			"history-01",
			"History integrity journal",
			"Add monotonic event IDs and an append-only local audit record."
		],
		[
			"history-02",
			"History replay recovery",
			"Reconcile IndexedDB activity events after an interrupted browser session."
		],
		[
			"history-03",
			"History source badges",
			"Show whether each activity came from a direct open, progress, or Watch Room."
		],
		[
			"history-04",
			"History retention controls",
			"Offer local retention windows and export before a user removes older events."
		],
		[
			"history-05",
			"History duplicate guard",
			"Collapse equivalent play bursts without hiding a separate viewing session."
		],
		[
			"history-06",
			"History timezone normalization",
			"Store epoch time and display a clear local-time conversion in every timeline."
		],
		[
			"history-07",
			"History orphan recovery",
			"Keep a saved provider URL or local fingerprint when the source card is evicted."
		],
		[
			"history-08",
			"History privacy review",
			"Expose what is stored locally and keep private/adult history behind the existing gate."
		],
		[
			"history-09",
			"History filter diagnostics",
			"Explain empty history results, source filters, and recovery-card availability."
		],
		[
			"history-10",
			"History restore benchmark",
			"Done · the repeatable isolated-history benchmark restores a 2,400-event IndexedDB snapshot plus append-only journal without duplicate events or lost source provenance."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: true
	})),
	...[
		[
			"continue-01",
			"Continue stable identity",
			"Key resume records by provider URL and local fingerprint before transient card IDs."
		],
		[
			"continue-02",
			"Continue duration validation",
			"Reject impossible duration and position values before they enter the resume shelf."
		],
		[
			"continue-03",
			"Continue provider reconciliation",
			"Refresh a provider card without losing its last trustworthy resume point."
		],
		[
			"continue-04",
			"Continue local handle recovery",
			"Reconnect an approved local file handle without rewriting watch progress."
		],
		[
			"continue-05",
			"Continue completion threshold",
			"Remove finished items using a transparent, source-aware completion rule."
		],
		[
			"continue-06",
			"Continue conflict resolution",
			"Choose the newest credible mark when two tabs report different positions."
		],
		[
			"continue-07",
			"Continue shelf explanation",
			"Show why an item is resumable and the timestamp of its last durable mark."
		],
		[
			"continue-08",
			"Continue offline handoff",
			"Queue a local mark safely when storage is unavailable, then replay once."
		],
		[
			"continue-09",
			"Continue bulk repair",
			"Offer a preview-only scan for stale or invalid resume records."
		],
		[
			"continue-10",
			"Continue recovery test",
			"Done · a repeatable browser check validates local, YouTube, Twitch, and Watch Room recovery cards, including provider records no longer in the active catalog."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: true
	})),
	...[
		[
			"follow-manager-01",
			"Bounded creator directory",
			"Done · YouTube and Twitch follows now use a searchable, sorted creator directory that mounts 48 channel bubbles at a time instead of expanding a thousand-channel desk."
		],
		[
			"follow-manager-02",
			"Creator bubble actions",
			"Done · each creator has a distinct provider-marked bubble and a focused control panel for creator favorite, 1–5 rating, health context, and safe manual unfollow."
		],
		[
			"follow-manager-03",
			"Follow collection actions",
			"Done · optional creator collections travel in the library pack. Bulk removal previews every affected creator and retains locally saved or watched catalog rows."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"follow-manager-01",
			"follow-manager-02",
			"follow-manager-03"
		].includes(id)
	})),
	...[
		[
			"youtube-upgrade-01",
			"Feed delta cursor",
			"Done · routine checks persist the newest Atom upload identity, return only feed entries ahead of it, and fall back to a bounded recent window when YouTube has aged the cursor out."
		],
		[
			"youtube-upgrade-02",
			"Channel cache budget",
			"Done · channel health now reports response size, cache age, and session hit rate. The server retains only a short feed or ≤2,000-item focused catalog cache, while routine refreshes read the feed slice only."
		],
		[
			"youtube-upgrade-03",
			"First-click trace",
			"Done · YouTube Pull health and Settings diagnostics show local timing from opening YouTube to mounted text-first latest-upload cards, with selector work, artwork, and overlapping provider work separated. No viewing identities are recorded."
		],
		[
			"youtube-upgrade-04",
			"Rail windowing",
			"Done · long YouTube rails mount a measured card window with accessible deferred-card counts, keyboard arrows/Home/End, and focus bridges. The 80,000-video desktop/mobile check passes."
		],
		[
			"youtube-upgrade-05",
			"Artwork priority",
			"Done · on-screen cards take the high-priority image lane, near-view cards use a cancellable low-priority lane, and non-primary offscreen rails defer mounting. Source changes invalidate queued speculative images; titles and actions remain usable while artwork loads or fails."
		],
		[
			"youtube-upgrade-06",
			"Creator ambiguity review",
			"Done · contradictory exact channel links and names/handles shared by distinct channel IDs open an identity review. Keep saved identities separate persists a choice that reopens when identity evidence changes; exact-link correction remains available. Ordinary display-name/handle differences are allowed, and ambiguous pending aliases survive automatic resolution. Desktop/touch Chrome and Edge reload checks cover the durable choice."
		],
		[
			"youtube-upgrade-07",
			"Published-date repair",
			"Done · exact RSS dates win over provider dates and survive shallow/live refreshes, compact cards and disk recovery. Unknown dates stay last without freshness boosts; legacy dates are labeled Saved date. Imports and live observations never invent publication dates."
		],
		[
			"youtube-upgrade-08",
			"Live/VOD split",
			"Done · saved-format controls separate uploads, Shorts and completed streams; current live and upcoming events have their own rows. Cooperative cached groups share cards. Only a successful live check ends a stream, and completed links remain saved with local feedback."
		],
		[
			"youtube-upgrade-09",
			"Deep-pull checkpoint",
			"Done · each creator keeps its catalog continuation and last-check state across reloads. Bounded page/item budgets resume older uploads, detect terminal pages, and stop when continuation data cannot advance."
		],
		[
			"youtube-upgrade-10",
			"Provider error taxonomy",
			"Classify YouTube failures as unavailable, rate-limited, malformed, or network/offline; show the next retry time and keep cached cards untouched."
		],
		[
			"youtube-upgrade-11",
			"Subscription import staging",
			"Validate, deduplicate, and preview a pasted subscription list before network work begins; report accepted, duplicate, and unresolved handles separately."
		],
		[
			"youtube-upgrade-12",
			"Channel health matrix",
			"Show each saved channel’s last successful check, newest known upload, response count, cache age, and retry state in one compact diagnostics view."
		],
		[
			"youtube-upgrade-13",
			"Recommendation diversity",
			"Cap repeated creators and topics across adjacent YouTube rails while preserving highly rated favorites and exposing the diversity rule in shelf copy."
		],
		[
			"youtube-upgrade-14",
			"Shelf explanations",
			"Attach short, human-readable reasons to recommendation rails—rating, creator affinity, freshness, or topic—without exposing internal transport tags."
		],
		[
			"youtube-upgrade-15",
			"Background refresh budget",
			"Reserve a small bounded concurrency and payload budget for automatic YouTube refreshes so provider work cannot delay interactions or Twitch checks."
		],
		[
			"youtube-upgrade-16",
			"Search source filter",
			"Use the existing search index to restrict results to YouTube before rendering suggestion cards, including creator and provider URL matches."
		],
		[
			"youtube-upgrade-17",
			"Offline cache audit",
			"Done · the on-demand YouTube cache audit reports channel/card coverage, saved poster references, actual image bytes on this device, oldest saved provider/artwork timestamps, catalog save time, and recoverable YouTube links. Reads yield, cancel on close/hidden, and make no network requests or success-ledger writes. Browser and Companion HTTP caches are explicitly unmeasured."
		],
		[
			"youtube-upgrade-18",
			"Mobile rail gesture",
			"Done · native browser touch swipes advance YouTube rails without opening cards or scrolling the page horizontally. Public touch cards have visible 44-pixel Save/Like/Together controls; keyboard focus stays visible while rail windows move. Isolated Chrome and Edge phone/desktop checks cover gestures, actions, preview boundaries and page overflow. Physical-device policy remains in the device matrix."
		],
		[
			"youtube-upgrade-19",
			"Refresh result diff",
			"Apply and display only changed channel/video rows after a refresh, preserving card identity, scroll position, ratings, and healthy artwork."
		],
		[
			"youtube-upgrade-20",
			"YouTube regression suite",
			"Done · actual-provider-path fixtures cover feeds, deep pages, cursors, duplicates, metadata recovery and live transitions. The 80,000-entry desktop/mobile gate checks dates, formats, previews, focus and input budgets on dev and production; a million-entry benchmark verifies cooperative shared indexes. Real-provider soaking remains separate."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"youtube-upgrade-01",
			"youtube-upgrade-02",
			"youtube-upgrade-03",
			"youtube-upgrade-04",
			"youtube-upgrade-05",
			"youtube-upgrade-06",
			"youtube-upgrade-07",
			"youtube-upgrade-08",
			"youtube-upgrade-09",
			"youtube-upgrade-10",
			"youtube-upgrade-11",
			"youtube-upgrade-12",
			"youtube-upgrade-13",
			"youtube-upgrade-14",
			"youtube-upgrade-15",
			"youtube-upgrade-16",
			"youtube-upgrade-17",
			"youtube-upgrade-18",
			"youtube-upgrade-19",
			"youtube-upgrade-20"
		].includes(id)
	})),
	...[
		[
			"twitch-upgrade-01",
			"Archive page checkpoint",
			"Done · reloads and library packs retain archive/clip positions and the last accepted VOD. Fresh mirrors beat stale disk lists; unreadable or non-advancing pages hold their safe checkpoint."
		],
		[
			"twitch-upgrade-02",
			"Focused pull queue",
			"Verified · the focused queue holds at most eight explicit creators, runs one selected 500/2,000-VOD and 0/50/250/500-clip batch per creator, and gives shallow live checks a turn before each batch. Duplicate jobs, paused queue cancellation, in-flight stop and global cancellation are covered. Waiting work lives outside the library root and releases on exit; accepted rows and saved positions remain durable."
		],
		[
			"twitch-upgrade-03",
			"VOD cursor diagnostics",
			"Done · Archive coverage shows accepted pages, distinct VODs, repeats, saved position, last VOD and stop reason, including first-page failures. Creator diagnostics load 30 at a time with Show 100 more controls."
		],
		[
			"twitch-upgrade-04",
			"Clip separation audit",
			"Identify clip-length media independently from full VODs using duration and provider shape; correct mislabeled cards without deleting user saves."
		],
		[
			"twitch-upgrade-05",
			"Live-state clock",
			"Record the exact successful live-state observation time, expire stale live labels, and distinguish a live estimate from a confirmed current stream."
		],
		[
			"twitch-upgrade-06",
			"Provider integrity fallback",
			"When Twitch requires an integrity challenge for deeper pages, retain accepted archive data, report the limit plainly, and avoid retry loops that waste provider budget."
		],
		[
			"twitch-upgrade-07",
			"Archive coverage report",
			"Show cached VOD count, oldest/newest known dates, sparse creators, completed historical pulls, and public-provider limits for every followed channel."
		],
		[
			"twitch-upgrade-08",
			"Channel retry budget",
			"Verified · archive and live failure budgets persist independently per creator, back off 15 seconds to five minutes, and survive reload/backup import. Partial page/clip failures also receive cooldowns; healthy live checks cannot erase archive failures. Background rotation skips only the cooling scope. Explicit creator retries remain available and reset only the successful scope."
		],
		[
			"twitch-upgrade-09",
			"VOD merge proof",
			"Done · provider and real-store regression tests preserve accepted pages, older VODs, favorites, ratings, history, progress and valid duration/artwork metadata through partial, empty and failed pulls."
		],
		[
			"twitch-upgrade-10",
			"Creator archive controls",
			"Verified · creator coverage shows the last accepted depth, result, exact saved position, actionable archive/live failures and recommended retry time. Choose VOD/clip budgets, queue up to eight sparse eligible creators, retry an individual creator, open its public channel, remove waiting jobs or stop after the current batch. Budgets are captured per job. Desktop/390px mobile controls and creator paging are verified."
		],
		[
			"twitch-upgrade-11",
			"Stream title delta",
			"Update a live card’s stream title and category only when the provider reports a newer observation, preventing stale title flashes."
		],
		[
			"twitch-upgrade-12",
			"Viewer freshness",
			"Show viewer counts with an observation timestamp and remove them from ranking once they become stale."
		],
		[
			"twitch-upgrade-13",
			"Local cache compaction",
			"Compact duplicate VOD rows by stable provider video ID while retaining the newest metadata and all local feedback references."
		],
		[
			"twitch-upgrade-14",
			"Guest-ready embeds",
			"Verify Twitch Watch Room embeds receive the correct parent host, preserve the selected VOD, and surface a direct-link fallback when the player is blocked."
		],
		[
			"twitch-upgrade-15",
			"VOD duration repair",
			"Recover missing or impossible duration values from accepted provider metadata and never infer a full VOD from a short clip duration."
		],
		[
			"twitch-upgrade-16",
			"Historical search filter",
			"Done · saved archive search filters title, exact creator, inclusive dates and VOD/clip type. Cancellable scans yield between slices and retain 24 results plus one lookahead; keyset pages avoid whole-catalog sorting and preserve preview return focus."
		],
		[
			"twitch-upgrade-17",
			"Mobile live rail",
			"Done · fresh live streams lead the first phone viewport; quick creator refresh is collapsible. Rail navigation follows actual scroll position, including within overscan. Coverage adds 100 creators in small painted batches and releases cards when closed. Desktop/390px production checks cover stale-live exclusion, artwork bounds, filters, paging and preview return."
		],
		[
			"twitch-upgrade-18",
			"Provider error taxonomy",
			"Verified · integrity challenges, public page limits, unavailable creators, unreadable responses, rate limits, network delays and response budgets have bounded diagnoses and recovery actions. First-page failures and partial results preserve saved videos and positions. Global live-query errors are rejected before cached streams can be retired. Deterministic actual API/store regressions and desktop/mobile creator controls pass."
		],
		[
			"twitch-upgrade-19",
			"Twitch device regression",
			"Done · repeatable isolated Chrome and Edge desktop/touch-phone checks exercise saved Twitch live-card handoff into Watch Room, live seek restrictions, VOD seeking, blocked playback recovery, device-only reload, clip classification fallback and official parent/URL parameters. Deterministic provider fixtures avoid claiming native media availability; physical devices and cross-network relay remain separate open milestones."
		],
		[
			"twitch-upgrade-20",
			"Twitch archive benchmark",
			"Done · the reproducible 384 MiB Node benchmark measures 20-page cursor walks, additive/repeat merges, serialized growth and bounded search on 100k/million-entry compact archives. The 30k Twitch desktop/phone gate measures browser storage growth, live first paint, scroll settle, input paint and mounted cards. Network throughput, transcripts, physical devices and long-session heap soak remain separate checks; default pull depth is unchanged."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"twitch-upgrade-01",
			"twitch-upgrade-03",
			"twitch-upgrade-09",
			"twitch-upgrade-16",
			"twitch-upgrade-17",
			"twitch-upgrade-20",
			"twitch-upgrade-02",
			"twitch-upgrade-04",
			"twitch-upgrade-05",
			"twitch-upgrade-06",
			"twitch-upgrade-07",
			"twitch-upgrade-08",
			"twitch-upgrade-10",
			"twitch-upgrade-11",
			"twitch-upgrade-12",
			"twitch-upgrade-13",
			"twitch-upgrade-14",
			"twitch-upgrade-15",
			"twitch-upgrade-18",
			"twitch-upgrade-19"
		].includes(id)
	})),
	...[
		[
			"speed-01",
			"First interaction budget",
			"Verified · local diagnostics use navigation time origin and separate first contentful paint, Home controls, preferences, provider/local disk reads, cooperative preparation, catalog readiness, first mounted shelf and its artwork. YouTube selector work and provider overlap retain their own trace. Startup filtering, indexing, merging and resume linking yield after 512 records or about four milliseconds, and rebase around foreground edits. Large saved-library desktop/phone launches, early navigation, synthetic million-entry preparation, listener cleanup and production rendering checked. Catalog restoration still takes seconds; physical-device and memory soak budgets remain open."
		],
		[
			"speed-02",
			"Provider payload budget",
			"Verified · YouTube, Twitch and Adult metadata reads count decompressed stream bytes, reject incomplete pages above 8 MiB and cancel stalled bodies after 15 seconds. Shared lanes retain bounded waiting work and release cancelled transfers. Warm YouTube/Twitch caches retain at most 250 rows per result, 1 MiB per entry and 4 MiB per provider; larger focused results are delivered whole without a second cached graph. Adult warm responses retain at most 12 MiB. Routine refresh, live, archive and import workers retain explicit concurrency and retry budgets; deep pull targets, pacing settings and manual force retries stay available. Settings diagnostics disclose these safeguards and export numeric limits. Oversize, cancellation, cooldown, accepted-page recovery, focused history, desktop/phone and production checks pass. Real-provider and long-session memory soaking remain open."
		],
		[
			"speed-03",
			"Render invalidation audit",
			"Verified · card reactions subscribe to their own title, including shared preview ratings; unmounted cards release their listeners. Unchanged search grids skip parent updates and retain one published order across watch, like and rating changes. Refresh ranking applies the latest feedback on demand; query, source, hidden, unavailable, privacy and tag changes invalidate old results immediately. Transient work cancels during viewers and on navigation/idle release, and covered grids stop automatic paging. Sidebar counts and covered shelves reuse playback snapshots; comments, clocks and live expiry update only their own surfaces. A million-row result survives 10,000 feedback changes without a scan or rerank. Populated desktop/phone search pagination, preview return, keyboard focus and provider navigation checked. Long-session and physical-device memory soak remain separate milestones."
		],
		[
			"speed-04",
			"Visible artwork priority",
			"Prioritize visible and near-view images, pause offscreen decoding during input, and resume through a bounded queue once the main thread is idle."
		],
		[
			"speed-05",
			"Input latency monitor",
			"Measure interaction-to-paint time for rating, search, queue, play/pause, and source navigation on a large local and provider catalog."
		],
		[
			"speed-06",
			"Idle enrichment queue",
			"Verified · cached repair, metadata-tail batches and smart tags share one cancelable queue. Input, scrolling, hidden tabs and viewers interrupt unfinished work. Sparse immutable tag updates share unchanged entries instead of enumerating or copying full ledgers; manual edits and provider pulls use the same indexed records. Completed rows save in 64-record transactions and recover in 256-row pages, preserving manual tags and categories. Pause/resume, million-entry no-copy tests, desktop/mobile controls, saved recovery and production rendering checked. Full exports, broad preference writes and memory soak remain separate budgets."
		],
		[
			"speed-07",
			"Route warmup policy",
			"Done · one likely Hub module warms after paint and idle time, with Home recommendations given priority. Pending warmup is canceled on navigation or a hidden tab; Save-Data, slow networks, low memory, and active input defer it."
		],
		[
			"speed-08",
			"Cache hit dashboard",
			"Verified · opt-in Settings snapshots report immutable catalog-selector reuse, bounded artwork memory, thumbnail disk recall, viewer-detail retention, and saved YouTube/Twitch provider samples. Ages and payload estimates are labeled by observation scope; missing sizes remain unknown. No media, keys, channel names or URLs enter the export. Captures run on demand instead of rerendering Settings every second; provider metadata survives follow and library-pack recovery. Desktop/phone 80,000-entry and production checks pass."
		],
		[
			"speed-09",
			"Mobile memory budget",
			"Verified · a populated 172,070-entry library with 99,999 YouTube videos runs phone navigation, bounded search, paging, preview, ratings and return under Low memory. The grid starts at 24 titles, retains a 36-card mount ceiling and mounted 12 cards after paging to 48; covered grids hold paging, artwork defers during input and focus returns to the opened title. The compact editor and mobile drawer dismiss correctly without horizontal overflow. Tag inference caps text, words and its 512-card cache; sparse repairs yield to input and wait during active searches/viewers. A 384 MiB Node benchmark covers 100k/million-entry metadata and bounded viewport windows. Desktop/phone development and production checks pass. Capability hints do not emulate CPU speed; physical-device and long-session browser heap soak remain open."
		],
		[
			"speed-10",
			"Performance release gate",
			"Verified · npm run check:performance creates isolated desktop/phone profiles with 80,000 compact entries, paused pulling and Text-first artwork. It gates Home readiness, source navigation, scroll settle, input-to-paint latency, mounted-card count, overflow, console errors, scorecard refresh and private export. Missing measurements fail. Synthetic media and offline Companion responses are explicit fixtures; real-provider throughput, long-session memory and physical devices remain separate checks. Development and production runs pass."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"speed-01",
			"speed-02",
			"speed-03",
			"speed-04",
			"speed-05",
			"speed-06",
			"speed-07",
			"speed-08",
			"speed-09",
			"speed-10"
		].includes(id)
	})),
	...[
		[
			"smooth-01",
			"Navigation transition budget",
			"Verified · source controls and a destination loading shell paint before catalog subscribers run. Rapid switches retain one latest destination; Home and tools can interrupt it immediately. YouTube filtering, stable date sorting, demo exclusion and creator indexing prepare in cancelable slices targeting four milliseconds and reuse exact immutable caches. Hidden preparation sleeps; viewers and unmount cancel it. Desktop/mobile navigation, preview/player return and million-entry cancellation tests checked. Broader render and slow-device audits remain separate."
		],
		[
			"smooth-02",
			"Long-list virtualization proof",
			"Verified · rails resolve only their visible card references, including End jumps; rendered card widths and gaps drive responsive windows. Grids retain bounded measured rows and mounted cards. Arrow/Home/End and bidirectional Tab entry reach unmounted titles; accessible item positions retain catalog totals. Preview return restores a stable grid's visible anchor and keyboard focus. Desktop/phone checks on a 100,000-video YouTube archive, million-entry window tests, 10,000-visit geometry benchmarks and production rendering checked. Physical-device memory soak and browser maximum scroll dimensions remain separate limits."
		],
		[
			"smooth-03",
			"Image decode pressure gauge",
			"Expose decoded-image count, pending decode work, and cache evictions in Diagnostics so memory pressure has an observable cause and recovery."
		],
		[
			"smooth-04",
			"Background-tab throttle",
			"Reduce polling, thumbnail work, and timer-driven reranks while the tab is hidden, then perform one bounded reconciliation when it returns."
		],
		[
			"smooth-05",
			"Search keystroke budget",
			"Done · suggestions debounce and token matching runs in a worker. Search filtering, ranking, sorting, and card resolution yield in cancelable slices outside render. Loading stays visible until matching and ranking both finish; changing input discards stale results. A compact query control opens an editor with Ctrl/Cmd+K or /. The editor collapses on submit, outside pointer, focus exit, Escape, selection, navigation, idle release or viewer open; it releases its catalog inputs and cancels pending drafts while closed. Active queries remain available to reopen or clear. Explicit tool-page searches open a visible result desk; provider and private tag scopes stay intact."
		],
		[
			"smooth-06",
			"Local persistence coalescing",
			"Batch preference and tag writes away from click handlers while journaling the latest operation immediately so a crash cannot lose a user action."
		],
		[
			"smooth-07",
			"Provider-card structural sharing",
			"Reuse unchanged provider card objects and artwork references across refreshes to prevent image reloads, animation resets, and avoidable React reconciliation."
		],
		[
			"smooth-08",
			"Cold-start source ordering",
			"Hydrate the saved local catalog and active source before optional folder verification, remote refresh, Companion warmup, or recommendation ranking begins."
		],
		[
			"smooth-09",
			"Timer consolidation",
			"Verified · recurring pulls, presence, clocks, discovery, diagnostics, photo status/slideshows and Watch Room updates share one lifecycle scheduler. Hidden/idle cosmetic work sleeps; visible idle YouTube archives and background room synchronization retain their policies. Slow requests never overlap or replay missed ticks. One idle deadline replaces activity polling; transport retries and input debounces keep their own deadlines. Desktop/mobile controls and production rendering checked."
		],
		[
			"smooth-10",
			"Slow-device profile",
			"Verified · Adaptive selects smaller budgets for limited device capabilities or Save Data; Low memory can be selected on any device. Artwork retains at most 72 records / 2 MiB, thumbnail work uses one worker, remote images use four slots, new photo scans use two workers, grids load 24 titles with a 36-card mount ceiling, and rails omit extra overscan. Individual settings are retained. Budget changes release cached blob URLs and wake held requests without restarting running network work. Repeated catalog pages and unchanged resume ledgers avoid full copies; large change batches stage only a small scratch map. A reproducible 384 MiB Node benchmark with two-core/two-GiB hints checks 100k/million-entry metadata and viewport windows; populated desktop/phone settings, search and preview paths checked. Capability hints do not emulate CPU speed, and physical-device/browser memory soak remains open."
		],
		[
			"smooth-11",
			"Accessibility performance audit",
			"Verified · deferred shelves mount immediately on keyboard focus and canceled release timers cannot unmount a focused card. Virtual grid and rail Home/End jumps stay bounded and preserve logical positions; page additions have a polite count announcement and keyboard instructions. One modal covers loading, preview and playback, with immediate cancel focus, contained Tab navigation, accessible titles, nested menu Escape handling and return to the opened card. Player shortcuts yield to controls and provider playback keys; local controls stay visible during keyboard focus. A populated saved catalog and 390px phone YouTube grid/preview/player handoffs pass, including artwork still deferred. Development and production desktop/phone render checks pass. Native local playback automation and physical screen-reader/device testing remain limited; long-session memory soak is tracked separately."
		],
		[
			"smooth-12",
			"Smoothness scorecard",
			"Verified · Settings diagnoses Home readiness, latest input paint, recent frame pressure, mounted cards and bounded cache use, with a practical next step that respects paused pulling. Missing/stale samples are shown explicitly. Opt-in frame monitoring follows browsing, stores at most 240 durations, ignores hidden time and releases its loop when shelves unmount or diagnostics turn off. Text-first restores at startup and skips image slots, decoding, Companion recall and timeout-driven creator repair. Automatic artwork repair honors Pause pulls. Tests plus populated desktop/phone and production checks pass."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"smooth-01",
			"smooth-02",
			"smooth-03",
			"smooth-04",
			"smooth-05",
			"smooth-06",
			"smooth-07",
			"smooth-08",
			"smooth-09",
			"smooth-10",
			"smooth-11",
			"smooth-12"
		].includes(id)
	})),
	{
		id: "recent-remote-cache-pages",
		title: "Paged remote catalog recovery",
		detail: "Done · saved provider cards restore in bounded 512-row IndexedDB pages instead of one cursor callback per card. Legacy snapshot rows remain readable; an 80,000-video desktop/mobile restore passes.",
		done: true
	},
	{
		id: "recent-watch-room-phone-sync",
		title: "Phone provider startup and sync",
		detail: "Done · YouTube retries its ready handshake and follows actual player observations. Guests can start or catch up on this device without pausing the room; first playback and returning from background request fresh host timing. Brief clock handshakes compensate for device clock skew. Normal heartbeats compare extrapolated clocks instead of triggering repeat seeks, decoder drift uses a cooldown, and host buffering holds the shared clock. Twitch VOD startup events use current state and catch up locally. Provider live latency, ads and physical mobile browser policies remain external limits.",
		done: true
	},
	{
		id: "recent-watch-room-lists",
		title: "Reusable Watch Together lists",
		detail: "Done · keep 12 named browser-local public watch lists, each with up to 48 videos. Save, preview links, rename, explicitly replace or remove with undo. Add a list as one duplicate-safe, capacity-aware queue batch without autoplay; guests follow host approval or review policy. List names and other saved lists stay private. Reload recovery, cross-tab updates, storage failures and malformed records preserve the live queue. Local files and personal catalog identifiers are excluded; named lists write only on explicit edits.",
		done: true
	},
	{
		id: "recent-watch-room-review",
		title: "Watch Together guest suggestion review",
		detail: "Done · optional host review keeps guest additions separate from the playing video and confirmed queue. Guests suggest public links or library videos, receive retry-safe submission receipts and see pending requests after reconnecting. Hosts approve to the end or next position as one undoable queue change, or dismiss with a targeted result. Canonical duplicate checks, 8 pending per connection and 24 per room, full-queue retention and host-enforced permissions keep the workflow bounded. Review preference persists locally; requests stay session-only and exclude local media. A focused Requests shortcut supports mobile and keyboard navigation. Existing direct editing remains the default.",
		done: true
	},
	{
		id: "recent-watch-room-playback-recovery",
		title: "Watch Together playback recovery",
		detail: "Done · sticky Player/Queue/Chat shortcuts expose the next title and focus the destination on touch and keyboard. A 12-title public session history lets connected guests request replay or queue again through existing host permissions and acknowledgements; local media stays out. Remote players and incoming local decoders can reload on just one device without clearing the queue or rebuilding peer connections. YouTube errors and blocked autoplay show explicit actions without automatically skipping the room video. Failed Twitch player script loads can be retried. Real provider availability, physical devices and separate-network TURN remain external checks.",
		done: true
	},
	{
		id: "recent-watch-queue-batch-tools",
		title: "Watch Together queue tools",
		detail: "Done · direct position moves work on touch and keyboard. Select visible/individual titles to prioritize, move to the end or remove as one host-confirmed, undoable batch. Concurrent additions survive; consumed selections cannot reappear. Public upcoming queue links copy, download and paste back without duplicates; local files and room invitations stay out. Clipboard failure leaves selectable links. Operations retain host permissions, bounded retries and current playback, with no new background polling or storage writes.",
		done: true
	},
	{
		id: "recent-watch-queue-recovery",
		title: "Watch Together queue and recovery",
		detail: "Done · one primary queue shows current/next titles, known runtime, paste validation and a device-only filter. Host undo restores the previous queue without interrupting playback. Public upcoming links save in a bounded browser draft; Resume last room and Restore saved queue recover after reload without autoplay. Local file data stays out of recovery. Host-enforced guest editing controls retain chat and timing. Guest selection/next requests retry with stable identities and acknowledgements; selection revisions reject old-title events. Paused completion callbacks cannot advance, unavailable heads are skipped, names update without reconnecting, and steady playback sends compact timing packets. Three-client desktop/mobile browser checks cover real local RTC media and recovery; physical-device and TURN checks remain separate.",
		done: true
	},
	{
		id: "recent-tag-enrichment",
		title: "YouTube video tags & description evidence",
		detail: "Verified · Settings pulls up to five watch pages sequentially; each video preview offers Pull video tags & description. Matching player metadata supplies creator keywords and full descriptions, with exact publication dates when available. Ranked suggestions label creator tags, hashtags, chapters, titles and descriptions; generic and promotional terms are filtered. Source-aware recommendation scoring gives extracted description words less weight while preserving explicit hearts. Compact evidence survives shallow refreshes and reloads; full descriptions stay on disk. Stop/navigation discard pending responses and prevent remaining requests. Public metadata can be unavailable on restricted/consent pages. Manual/unknown tags and locks stay protected, including edits made during saving. Cached repairs remain versioned, bounded, cooperative and network-free.",
		done: true
	},
	{
		id: "recent-resume-reconcile",
		title: "Sparse Continue recovery",
		detail: "Done · empty resume maps skip the catalog walk and watched cards resolve stable ID, provider URL, source URL, and path aliases without per-card Set allocations.",
		done: true
	},
	{
		id: "recent-youtube-sweep",
		title: "Fair YouTube archive schedule",
		detail: "Done · hourly background archive sweeps use a small rotating creator budget, recent and live checks have separate clocks, and manual pulls can walk deeper across every eligible creator or playlist. Cursor tests cover reloads and successive next-creator pulls.",
		done: true
	},
	{
		id: "recent-pull-ledger",
		title: "Cross-site pull outcomes",
		detail: "Done · active target and returned/new/failure counts appear during pulls; a bounded local result ledger feeds pull-success statistics and failure details in Stats.",
		done: true
	},
	{
		id: "recent-cold-home-readiness",
		title: "Cold Home readiness proof",
		detail: "Verified · lightweight Home mounts working destination controls before the saved catalog is ready. Home, whole-library restoration and Landing's first recommendation shelf have separate timings; returning Home does not mount recommendations or artwork. Fresh production navigation and reloads, a 172,070-entry saved development profile, and phone/desktop early navigation checked. The full Landing experience waits for usable saved rows. Large-library disk restore remains a measured delay; these checks do not claim physical-device cold storage or a long memory soak.",
		done: true
	},
	{
		id: "recent-saved-library-hydration",
		title: "Saved-library hydration integrity",
		detail: "Done · the first client snapshot now matches the server; saved pull results restore after mount. Populated desktop and phone profiles reload with the result and Mission plan intact and no hydration error.",
		done: true
	},
	{
		id: "recent-provider-soak",
		title: "Real-provider archive soak",
		detail: "Exercise large YouTube/Twitch follow lists under provider limits, confirm fair rotation and retry timing, and record catalog growth, memory pressure, and live-check latency without increasing automatic pull budgets.",
		done: false,
		status: "planned"
	},
	{
		id: "viewer-detail-isolation",
		title: "Viewer detail isolation",
		detail: "Comments update only the selected preview/player and persist one current video to disk. Closing comments performs no catalog scan, card copy, or browse notification; late responses from closed viewers are ignored.",
		done: true
	},
	{
		id: "viewer-detail-memory-budget",
		title: "Viewer detail memory budget",
		detail: "Detail reads coalesce across preview/player, reuse at most twelve records within a 512 KB estimated budget, and exclude oversized transcripts. Clearing the cache prevents old reads repopulating it; repeat-cycle tests and the Settings memory readout track retained details.",
		done: true
	},
	{
		id: "recent-search-result-budget",
		title: "Large-library search result budget",
		detail: "Done · filtering, taste scoring, full-result sorting, and card resolution run outside render in cancelable slices. Search skips covered browse shelves, scopes YouTube/Twitch results before scoring, keeps description/path matches, and counts each top tag once per video. A 100,000-match test and populated desktop/mobile interaction checks pass.",
		done: true
	}
];
var ALL_DEFAULT_MISSIONS = [
	...DEFAULT_MISSIONS,
	...ROADMAP_EXPANSION,
	...NEXT_LEVEL_MISSIONS
];
function MissionPlanSection() {
	const [missions, setMissions] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.mission-plan.v1") ?? "null");
			const revision = Number(localStorage.getItem("reelcase.mission-plan.revision") ?? "0");
			return mergeMissionPlan(Array.isArray(saved) ? saved : null, ALL_DEFAULT_MISSIONS, Number.isFinite(revision) ? revision : 0);
		} catch {
			return ALL_DEFAULT_MISSIONS;
		}
	});
	const [idea, setIdea] = (0, import_react.useState)("");
	const [showArchive, setShowArchive] = (0, import_react.useState)(false);
	const [startupSupported, setStartupSupported] = (0, import_react.useState)(false);
	const [companionCheck, setCompanionCheck] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.mission-plan.v1", JSON.stringify(missions));
			localStorage.setItem(MISSION_PLAN_REVISION_KEY, String(77));
		} catch {}
	}, [missions]);
	const completed = missions.filter((mission) => missionStatus(mission) === "complete").length;
	const activeMissions = missions.filter((mission) => missionStatus(mission) !== "complete");
	const archivedMissions = missions.filter((mission) => missionStatus(mission) === "complete");
	const [query, setQuery] = (0, import_react.useState)(""), [track, setTrack] = (0, import_react.useState)("all"), [priority, setPriority] = (0, import_react.useState)("all"), [statusFilter, setStatusFilter] = (0, import_react.useState)("all"), [page, setPage] = (0, import_react.useState)(0);
	const [briefNotice, setBriefNotice] = (0, import_react.useState)(""), [fallbackBrief, setFallbackBrief] = (0, import_react.useState)("");
	const needle = query.trim().toLowerCase();
	const filteredMissions = activeMissions.filter((mission) => (track === "all" || (track === "legacy" ? !mission.brief : mission.brief?.track === track)) && (priority === "all" || mission.brief?.priority === priority) && (statusFilter === "all" || missionStatus(mission) === statusFilter) && (!needle || [
		mission.id,
		mission.title,
		mission.detail,
		...mission.brief?.files ?? [],
		...mission.brief?.steps ?? [],
		...mission.brief?.acceptance ?? []
	].join(" ").toLowerCase().includes(needle)));
	const pageCount = Math.max(1, Math.ceil(filteredMissions.length / 20)), currentPage = Math.min(page, pageCount - 1), visibleMissions = filteredMissions.slice(currentPage * 20, (currentPage + 1) * 20);
	const copyBrief = async (mission) => {
		const text = formatMissionBrief(mission, missions);
		setFallbackBrief("");
		try {
			await navigator.clipboard.writeText(text);
			setBriefNotice("Copied " + mission.id + " with implementation steps, dependencies and acceptance checks.");
		} catch {
			setFallbackBrief(text);
			setBriefNotice("Clipboard access was unavailable. The full brief is ready to select and copy.");
		}
	};
	const exportBriefs = () => {
		const ids = new Set(NEXT_LEVEL_MISSIONS.map((m) => m.id)), text = formatNextLevelRoadmap(missions.filter((m) => ids.has(m.id))), url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" })), a = document.createElement("a");
		a.href = url;
		a.download = "realhub-100-model-briefs.md";
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 0);
		setBriefNotice("Downloaded 100 model briefs with their current saved statuses.");
	};
	const setMissionStatus = (id, status) => setMissions((items) => items.map((item) => item.id === id ? {
		...item,
		status,
		done: status === "complete"
	} : item));
	const exportMissions = () => downloadCsv([[
		"step",
		"title",
		"status",
		"detail",
		"id",
		"track",
		"priority",
		"dependencies",
		"entry_points",
		"implementation",
		"acceptance",
		"external_requirement"
	], ...missions.map((mission, index) => [
		index + 1,
		mission.title,
		missionStatus(mission),
		mission.detail,
		mission.id,
		mission.brief?.track ?? "",
		mission.brief?.priority ?? "",
		mission.brief?.dependsOn.join("; ") ?? "",
		mission.brief?.files.join("; ") ?? "",
		mission.brief?.steps.join(" | ") ?? "",
		mission.brief?.acceptance.join(" | ") ?? "",
		mission.brief?.external ?? ""
	])], `reelcase-mission-plan-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Mission plan",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-4" }),
		title: "Build a private media home that scales.",
		copy: "Realhub is moving toward a fast, local-first media hub: your files load from a durable catalog, your watch room works across your home network, and connected services remain optional and easy to control.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureReadinessPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Open-source credits" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "The projects behind Realhub’s components and local integrations. Native applications remain separate; integration does not imply every external service is running." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: REPOSITORY_CREDITS.map((repo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-lg border border-border bg-bg p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: repo.url,
								target: "_blank",
								rel: "noreferrer",
								className: "font-medium text-accent underline underline-offset-4",
								children: repo.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: repo.license
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6 text-muted",
								children: repo.use
							})
						]
					}, repo.url))
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Product mission"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl text-fg",
						children: "One calm control room for a very large library."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
						children: "Make a million-file media collection feel immediate: cache its catalog locally, keep original files private, surface useful recommendations, and let trusted people watch together without turning the app into a cloud upload service."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex items-end justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-2xl text-fg",
							children: [
								completed,
								" of ",
								missions.length,
								" milestones complete"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Every milestone includes implementation, browser verification, and a production build check."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-full bg-accent/15 px-3 py-1 text-sm text-accent",
							children: [missions.length ? Math.round(completed / missions.length * 100) : 0, "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 h-2 overflow-hidden rounded-full bg-bg/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-accent transition-all motion-reduce:transition-none",
							style: { width: `${missions.length ? completed / missions.length * 100 : 0}%` }
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				"aria-label": "Mission delivery queue",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Active delivery queue"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [activeMissions.length, " milestones still need implementation or verification. The 100 next-level briefs include specific entry points, dependencies and acceptance checks. Verified completions remain in the full plan."]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 rounded-lg border border-border bg-elevated p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "min-w-0 text-xs text-muted",
										children: ["Search milestones", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"aria-label": "Search milestones",
											value: query,
											onChange: (e) => {
												setQuery(e.target.value);
												setPage(0);
											},
											placeholder: "Title, ID, outcome or code path",
											className: "mt-1 min-h-11"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "min-w-0 text-xs text-muted",
										children: ["Workstream", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											"aria-label": "Milestone workstream",
											value: track,
											onChange: (e) => {
												setTrack(e.target.value);
												setPage(0);
											},
											className: "mt-1 min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "all",
													children: "All workstreams"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "legacy",
													children: "Earlier work"
												}),
												NEXT_LEVEL_TRACKS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: t,
													children: t
												}, t))
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-xs text-muted",
										children: ["Priority", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											"aria-label": "Milestone priority",
											value: priority,
											onChange: (e) => {
												setPriority(e.target.value);
												setPage(0);
											},
											className: "mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All priorities"
											}), [
												"P0",
												"P1",
												"P2"
											].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: p }, p))]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-xs text-muted",
										children: ["Status", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											"aria-label": "Milestone status filter",
											value: statusFilter,
											onChange: (e) => {
												setStatusFilter(e.target.value);
												setPage(0);
											},
											className: "mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "all",
													children: "All active statuses"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "planned",
													children: "Planned"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "in-progress",
													children: "In progress"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "blocked",
													children: "Blocked"
												})
											]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs leading-5 text-muted",
								children: "P0: foundational correctness and reliability · P1: core workflow quality · P2: capability and polish. Follow dependency order before priority. Verify the gap first; reuse work that already satisfies the checks."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										className: "min-h-11",
										onClick: exportBriefs,
										children: "Download 100 model briefs"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										className: "min-h-11",
										onClick: () => {
											setQuery("");
											setTrack("all");
											setPriority("all");
											setStatusFilter("all");
											setPage(0);
										},
										children: "Clear filters"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted",
										children: [
											filteredMissions.length,
											" matching active milestones · showing ",
											filteredMissions.length ? currentPage * 20 + 1 : 0,
											"–",
											Math.min((currentPage + 1) * 20, filteredMissions.length)
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "status",
								"aria-live": "polite",
								"aria-atomic": "true",
								className: briefNotice ? "mt-3 text-sm text-accent" : "sr-only",
								children: briefNotice
							}),
							fallbackBrief && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-3 block text-xs text-muted",
								children: ["Clipboard unavailable. Select and copy this model brief.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									"aria-label": "Model brief to copy",
									readOnly: true,
									value: fallbackBrief,
									className: "mt-2 h-56 w-full rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg",
									onFocus: (e) => e.currentTarget.select()
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						"data-mission-page": currentPage + 1,
						children: visibleMissions.map((mission, index) => {
							const status = missionStatus(mission), brief = mission.brief;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								"data-mission-id": mission.id,
								className: "flex flex-col gap-3 rounded-lg bg-elevated p-4 shadow-border sm:flex-row sm:gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex min-h-8 items-center justify-center rounded-sm bg-bg/65 px-2 text-xs font-medium text-muted",
											children: brief ? mission.id : "Step " + (currentPage * 20 + index + 1)
										}),
										status === "planned" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											className: "min-h-11",
											"aria-label": "Start " + mission.title,
											onClick: () => setMissionStatus(mission.id, "in-progress"),
											children: "Start"
										}),
										status === "in-progress" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											className: "min-h-11",
											"aria-label": "Mark " + mission.title + " complete",
											onClick: () => setMissionStatus(mission.id, "complete"),
											children: "Done"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "min-h-11",
											"aria-label": "Mark " + mission.title + " blocked",
											onClick: () => setMissionStatus(mission.id, "blocked"),
											children: "Block"
										})] }),
										status === "blocked" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											className: "min-h-11",
											"aria-label": "Resume " + mission.title,
											onClick: () => setMissionStatus(mission.id, "in-progress"),
											children: "Resume"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
													className: "text-sm font-medium text-fg",
													children: mission.title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "rounded-full px-2 py-1 text-xs font-medium " + missionStatusTone[status],
													children: missionStatusLabel[status]
												}),
												brief && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs text-accent",
													children: [
														brief.priority,
														" · ",
														brief.track
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm leading-6 text-muted",
											children: mission.detail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
											className: "mt-3 rounded-sm bg-bg/45 px-3 py-2 text-xs leading-6 text-muted",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
													className: "min-h-8 cursor-pointer font-medium text-fg",
													children: brief ? "Implementation brief" : "Break this down"
												}),
												brief && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-2 font-medium text-fg",
														children: "Start in"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: brief.files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
														className: "break-all font-mono",
														children: file
													}, file)) }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "mt-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-medium text-fg",
															children: "Dependencies: "
														}), brief.dependsOn.length ? brief.dependsOn.map((id) => {
															const dep = missions.find((m) => m.id === id);
															return id + " · " + (dep?.title ?? "Resolve prerequisite") + " (" + (dep ? missionStatusLabel[missionStatus(dep)] : "unknown") + ")";
														}).join("; ") : "None"]
													})
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-3 font-medium text-fg",
													children: "Implementation"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
													className: "mt-1 list-decimal space-y-2 pl-4",
													children: missionSteps(mission).map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: step }, step))
												}),
												brief && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-3 font-medium text-fg",
														children: "Acceptance checks"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
														className: "mt-1 list-disc space-y-2 pl-4",
														children: brief.acceptance.map((check) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: check }, check))
													}),
													brief.external && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "mt-3 rounded-md border border-border p-3",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium text-fg",
																children: "External requirement: "
															}),
															brief.external,
															" Keep this unverified until actual evidence is available."
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-3",
														children: "The copied brief includes the shared execution contract: preserve saved data and boundaries, keep work bounded, test failure/recovery, verify desktop/mobile changes, run relevant build/type checks and attach evidence before completion."
													})
												] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "secondary",
											size: "sm",
											className: "mt-3 min-h-11",
											"aria-label": "Copy model brief for " + mission.title,
											onClick: () => void copyBrief(mission),
											children: "Copy model brief"
										})
									]
								})]
							}, mission.id);
						})
					}),
					!visibleMissions.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-lg bg-elevated p-5 text-sm text-muted",
						children: "No active milestones match these filters. Completed work remains in the delivery archive below."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center justify-between gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								disabled: currentPage === 0,
								onClick: () => setPage(currentPage - 1),
								children: "Previous milestones"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									"Page ",
									currentPage + 1,
									" of ",
									pageCount
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								disabled: currentPage + 1 >= pageCount,
								onClick: () => setPage(currentPage + 1),
								children: "Next milestones"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-elevated/70 p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Delivery archive"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [archivedMissions.length, " completed milestones are retained for reference and export."]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setShowArchive((value) => !value),
						children: showArchive ? "Hide completed work" : "Show completed work"
					})]
				}), showArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-2",
					children: archivedMissions.map((mission) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex gap-3 rounded-sm bg-bg/45 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							"aria-label": `Restore ${mission.title} to planned work`,
							onClick: () => setMissionStatus(mission.id, "planned"),
							children: "Done"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium text-muted line-through",
								children: mission.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: mission.detail
							})]
						})]
					}, mission.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Companion onboarding"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "A safe five-minute desktop setup."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "1. Start Companion"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Double-click Start-Realhub-Companion.cmd in the main Realhub folder."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "2. Confirm Desktop"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Keep its window open, then run the check below."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "3. Load shortcuts"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Open Games and choose Load approved desktop shortcuts or Steam/Epic roots."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "4. Verify first"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Use a listed shortcut inside an approved root before launching it."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => void (async () => {
									try {
										const data = await companionHealth(true);
										if (!data?.ok) throw new Error("offline");
										setStartupSupported(negotiateCompanion(data).capabilities.includes("tray-autostart"));
										setCompanionCheck({
											ready: true,
											desktop: Boolean(data.desktopEnabled),
											detail: `v${data.version ?? "?"} · ${data.roots ?? 0} roots · badge ${data.trayBadge ?? 0}`
										});
										if ((data.trayBadge ?? 0) > 0) companionAckJobs();
									} catch {
										setStartupSupported(false);
										setCompanionCheck({
											ready: false,
											desktop: false,
											detail: "Companion not detected. Start it, leave the window open, then retry."
										});
									}
								})(),
								children: "Check Companion setup"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: !startupSupported,
								onClick: () => void companionSetAutostart(true).then((r) => setCompanionCheck({
									ready: Boolean(r.ok),
									desktop: companionCheck?.desktop ?? false,
									detail: r.ok ? "Windows auto-start enabled for Companion." : r.error || "Auto-start failed."
								})),
								children: "Enable Windows auto-start"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: !startupSupported,
								onClick: () => void companionSetAutostart(false).then((r) => setCompanionCheck({
									ready: companionCheck?.ready ?? false,
									desktop: companionCheck?.desktop ?? false,
									detail: r.ok ? "Windows auto-start removed." : r.error || "Could not clear auto-start."
								})),
								children: "Disable auto-start"
							})
						]
					}),
					companionCheck && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-3 text-sm ${companionCheck.ready && companionCheck.desktop ? "text-accent" : "text-danger"}`,
						children: companionCheck.ready ? `Ready · Desktop ${companionCheck.desktop ? "approved" : "not approved"} · ${companionCheck.detail}` : companionCheck.detail
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Startup controls require the advertised Windows capability after Check Companion setup. Other systems use their own service manager. Offline yt-dlp jobs can raise a Windows tray balloon when configured. Loopback + origin check only — Companion never accepts LAN clients."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-5" }),
						title: "Next: home network",
						copy: "Folder watch events, Roku discovery, stable room invitations, and stronger timeline recovery."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-5" }),
						title: "Then: media intelligence",
						copy: "Background metadata, thumbnail health, faster source search, and reviewable local tags."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }),
						title: "Later: optional assistants",
						copy: "Private recommendation controls, explainable picks, and only opt-in service connections."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: exportMissions,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export mission plan"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => setMissions(ALL_DEFAULT_MISSIONS),
						children: "Reset to the current delivery queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "self-center text-xs text-muted",
						children: "Exports the current status, or restores the complete delivery baseline."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-5 flex flex-col gap-2 sm:flex-row",
				onSubmit: (event) => {
					event.preventDefault();
					const title = idea.trim();
					if (!title) return;
					setMissions((items) => [...items, {
						id: createLocalId("mission-"),
						title,
						detail: "New idea — break this into implementation and verification steps.",
						done: false
					}]);
					setIdea("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: idea,
					onChange: (event) => setIdea(event.target.value),
					placeholder: "Add a larger change idea",
					"aria-label": "New mission idea"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Add to plan"
				})]
			})
		]
	});
}
//#endregion
export { MissionPlanSection };
