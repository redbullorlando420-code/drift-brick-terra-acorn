import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $t as Bot, I as Radio, K as PackageSearch, O as Settings2, Wt as Clapperboard, c as Upload, ft as Lightbulb, zt as Download } from "../_libs/lucide-react.mjs";
import { U as aggregateProviderCache, fn as sparseRecordScan, ft as forEachCatalogEntry, pt as forEachCatalogSlice } from "./live-rooms-Wov1xeIQ.mjs";
import { c as companionExportLibraryPack, d as companionImportLibraryPack, f as companionInspectMedia, o as companionArtworkAudit, u as companionHealth, y as getCompanionMemorySnapshot } from "./companion-C8xPNDAD.mjs";
import { $ as useSessionPhase, $t as getPullQueueSnapshot, B as useTextFirstArtwork, Bn as subscribePullSettings, C as getRenderBudgetSnapshot, Dt as Input, Fn as setPullsPaused, Gt as getFirstShelfTrace, Hn as subscribeYoutubeTrace, Ht as getFeedbackDiagnostics, J as hydrateAnimeReviews, Kr as linksFromHistoryAndResume, N as searchWorkerIndex, Ot as Button, P as setTextFirstArtwork, Pn as setPerformanceMode, Pt as cancelQueuedPulls, R as usePerformanceProfile, Rn as subscribePullControl, Rr as getPersistenceMemorySnapshot, Rt as exportFeedback, S as getPeriodicWorkSnapshot, T as importLibraryPackZip, Tr as cleanupPolicy, V as useThumbs, Vn as subscribeStartupTrace, W as hydrateFilmReviews, Xn as useLibrary, Xt as getPerformanceMode, Yn as updatePullSettings, Yr as loadDurablePhotosSync, Zn as viewerDetails, Zt as getPerformanceProfile, _n as prepareCreatorCoverageResolver, an as getStartupTraceRevision, cn as getYoutubeTraceRevision, di as remoteEntryCounts, dn as idleEnrichment, dt as hydrateGuidePreset, en as getPullSettings, er as useSourceAssets, h as buildLibraryPackFiles, in as getSourceMemorySnapshot, kt as DEFAULT_PULL_SETTINGS, ot as catalogTurn, p as applyLibraryPackFiles, qt as getInteractionBudgetSnapshot, sn as getYoutubeFirstClickTrace, sr as CLEANUP_GROUPS, v as downloadLibraryPackZip, vn as pullsPaused, w as getThumbDiagnostics, wr as cleanupLabel, xr as cacheMetrics, xt as hydrateProviderViewing, zn as subscribePullQueue } from "./library-app-CrsCDQmv.mjs";
import { c as InfoCard, p as readHub, s as HubShell, u as Stat } from "./hub-shared-CSaQ1YXN.mjs";
import { t as PROVIDER_BUDGETS } from "./provider-budgets-BFeaFj2c.mjs";
import { r as classifyImagesLocally } from "./local-vision-DyOHjYy5.mjs";
import { t as YoutubeTagsControl } from "./youtube-tags-control-B14w4QlW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-section-Ctjt-VM_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function emptySettingsAudit() {
	return {
		smartTagStatus: {
			local: 0,
			tagged: 0,
			waiting: 0
		},
		metadataTailCoverage: [],
		creatorCoverage: {
			total: 0,
			present: 0,
			repairable: 0,
			unresolved: 0,
			ambiguous: []
		},
		companionInspectionCandidates: [],
		vision: {
			processed: 0,
			waiting: 0,
			eligible: false
		},
		hiddenTitles: []
	};
}
/** One indexed pass. Hidden-key export also yields rather than enumerating
* a complete sparse record synchronously at the end of the audit. */
async function prepareSettingsAudit(input, turn) {
	const resolve = await prepareCreatorCoverageResolver(input.follows, turn);
	const audit = emptySettingsAudit(), coverage = /* @__PURE__ */ new Map();
	const hiddenNames = /* @__PURE__ */ new Map();
	await forEachCatalogSlice(input.videos, (video) => {
		const rowTags = input.tags[video.id] ?? [], locked = input.metadata[video.id]?.lockedFields?.includes("tags");
		if (input.hidden[video.id]) hiddenNames.set(video.id, video.name);
		const source = video.remote?.kind ?? "local";
		const row = coverage.get(source) ?? {
			source,
			total: 0,
			tagged: 0,
			waiting: 0,
			locked: 0
		};
		row.total++;
		if (rowTags.length) row.tagged++;
		else if (locked) row.locked++;
		else row.waiting++;
		coverage.set(source, row);
		if (!video.remote) {
			audit.smartTagStatus.local++;
			if (rowTags.some((tag) => /^(?:year-|month-|type-|source-)/.test(tag))) audit.smartTagStatus.tagged++;
			if (rowTags.some((tag) => tag.startsWith("vision-"))) audit.vision.processed++;
			else audit.vision.waiting++;
			if (!locked) audit.vision.eligible = true;
			if (audit.companionInspectionCandidates.length < 12 && /^(?:[a-z]:[\\/]|\\\\[^\\]+\\[^\\]+[\\/]|\/)/i.test(video.path)) audit.companionInspectionCandidates.push(video);
		} else if (video.remote.kind === "youtube" || video.remote.kind === "twitch") {
			audit.creatorCoverage.total++;
			const resolution = resolve(video);
			if (resolution.status === "present") audit.creatorCoverage.present++;
			else if (resolution.status === "resolved") audit.creatorCoverage.repairable++;
			else if (resolution.status === "unresolved") audit.creatorCoverage.unresolved++;
			else if (resolution.status === "ambiguous" && audit.creatorCoverage.ambiguous.length < 48) audit.creatorCoverage.ambiguous.push({
				id: video.id,
				name: video.name,
				candidates: resolution.candidates
			});
		}
	}, turn);
	audit.smartTagStatus.waiting = audit.smartTagStatus.local - audit.smartTagStatus.tagged;
	audit.metadataTailCoverage = [...coverage.values()].sort((a, b) => b.waiting - a.waiting || b.total - a.total || a.source.localeCompare(b.source));
	await forEachCatalogEntry(sparseRecordScan(input.hidden), (row) => {
		if (row) audit.hiddenTitles.push({
			id: row[0],
			name: hiddenNames.get(row[0]) ?? row[0]
		});
	}, turn);
	await turn();
	return audit;
}
var EMPTY = emptySettingsAudit();
/** Settings paints first. Obsolete snapshots and covered/hidden desks stop
* preparing diagnostics until the user returns to an active, visible desk. */
function useSettingsAudit(videos, tags, metadata, follows, hidden) {
	const phase = useSessionPhase(), viewer = useLibrary((state) => Boolean(state.activeId || state.previewId));
	const scope = (0, import_react.useMemo)(() => ({
		videos,
		tags,
		metadata,
		follows,
		hidden
	}), [
		videos,
		tags,
		metadata,
		follows,
		hidden
	]);
	const [completed, setCompleted] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (phase !== "active" || viewer || completed?.scope === scope) return;
		const controller = new AbortController();
		prepareSettingsAudit(scope, catalogTurn(controller.signal)).then((audit) => {
			if (!controller.signal.aborted) (0, import_react.startTransition)(() => setCompleted({
				scope,
				audit
			}));
		}).catch(() => {});
		return () => controller.abort();
	}, [
		scope,
		phase,
		viewer
	]);
	return {
		...completed?.audit ?? EMPTY,
		ready: completed?.scope === scope
	};
}
/** A small queue readout subscribes independently of catalog diagnostics. */
function EnrichmentStatus() {
	const queue = (0, import_react.useSyncExternalStore)(idleEnrichment.subscribe, idleEnrichment.getSnapshot, idleEnrichment.getSnapshot);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Background metadata work",
		className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "Background metadata work"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-2xl text-fg",
					children: "Enrichment yields to you."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => idleEnrichment.setPaused(!queue.paused),
						children: queue.paused ? "Resume enrichment" : "Pause enrichment"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: queue.jobs.some((job) => job.id === "cached-tags"),
						onClick: () => useLibrary.getState().repairCachedMetadata(),
						children: "Recheck cached tags"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-sm leading-6 text-muted",
				children: "Cached tag repair and smart tags share one queue. Each completed batch saves locally. Input, scrolling, a hidden tab, an active search, and an open preview or player interrupt unfinished work. Clear search or close the viewer to resume."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 text-xs leading-5 text-accent",
				role: "status",
				children: queue.error ? `Save failed · ${queue.error} Retry the metadata action to continue.` : queue.paused ? "Enrichment paused. Completed batches are saved." : !queue.jobs.length ? "No metadata work queued." : queue.state === "waiting" ? "Waiting for the library to be available." : "Working in short idle slices."
			}),
			queue.jobs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2 text-xs text-muted",
				children: queue.jobs.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-fg",
						children: job.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: job.progress.total ? `${job.progress.scanned.toLocaleString()} / ${job.progress.total.toLocaleString()} checked · ${job.progress.changed.toLocaleString()} changed · ${job.progress.batches.toLocaleString()} saved batches` : "Queued · awaiting first slice" })]
				}, job.id))
			}),
			queue.completed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted",
				children: [
					"Last completed · ",
					queue.completed.label,
					" · ",
					queue.completed.progress.scanned.toLocaleString(),
					" checked · ",
					queue.completed.progress.changed.toLocaleString(),
					" changed · ",
					queue.completed.progress.batches.toLocaleString(),
					" saved batches"
				]
			})
		]
	});
}
function ArtworkAuditPanel() {
	const [report, setReport] = (0, import_react.useState)();
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-fg",
				children: "Artwork disk cache"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Inspect disk usage by source before changing retention. This reads cache file sizes without loading the images."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				variant: "secondary",
				disabled: busy,
				onClick: () => void (async () => {
					setBusy(true);
					try {
						setReport(await companionArtworkAudit());
					} finally {
						setBusy(false);
					}
				})(),
				children: busy ? "Inspecting cache…" : "Audit artwork cache"
			}),
			report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 text-sm",
				role: "status",
				children: !report.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: report.error
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							"Disk reads measured since ",
							new Date(report.startedAt).toLocaleString(),
							". “No reads” means no hit-rate sample yet. Source groups use cache ID prefixes; unrecognized entries remain local or unknown."
						]
					}),
					report.truncated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-accent",
						children: "Partial inventory: the scan reached its time or entry budget. Sizes below are lower bounds."
					}),
					Boolean(report.skipped) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-muted",
						children: [report.skipped, " entries could not be inspected."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 space-y-3",
						children: report.sources?.length ? report.sources.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-bg/50 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-fg",
									children: row.source
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 tabular-nums text-muted",
									children: [
										row.files.toLocaleString(),
										" files · ",
										(row.bytes / 1048576).toFixed(2),
										" MiB · ",
										row.hits + row.misses ? `${Math.round(100 * row.hits / (row.hits + row.misses))}% hits (${row.hits} hit / ${row.misses} miss)` : "No reads"
									]
								}),
								row.oldestAt !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted",
									children: ["Oldest file updated ", new Date(row.oldestAt).toLocaleDateString()]
								})
							]
						}, row.source)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: "The cache is empty and has no recorded reads."
						})
					})
				] })
			})
		]
	});
}
var entryFields = [
	[
		"remoteMaxEntries",
		"All remote entries",
		"total"
	],
	[
		"youtubeMaxEntries",
		"YouTube",
		"youtube"
	],
	[
		"twitchMaxEntries",
		"Twitch",
		"twitch"
	],
	[
		"adultMaxEntries",
		"Adults (including booru and live)",
		"adult"
	],
	[
		"otherMaxEntries",
		"Other remote providers",
		"other"
	]
];
var fields = [
	[
		"requestGapMs",
		"Minimum gap between pull jobs (ms)",
		250,
		6e4,
		250
	],
	[
		"youtubeRequestGapMs",
		"YouTube gap between archive requests (ms)",
		0,
		6e4,
		10
	],
	[
		"concurrentRequests",
		"Concurrent catalog requests",
		1,
		3,
		1
	],
	[
		"youtubeBatchVideos",
		"YouTube entries per creator batch (target)",
		30,
		500,
		10
	],
	[
		"youtubeSourcesPerSweep",
		"YouTube sources per archive sweep",
		1,
		1024,
		1
	],
	[
		"youtubeIntervalSeconds",
		"YouTube automatic sweep interval (seconds)",
		60,
		3600,
		30
	],
	[
		"adultBatchVideos",
		"Adult entries per pull, across selected providers",
		20,
		1e4,
		100
	],
	[
		"adultIntervalSeconds",
		"Adult automatic pull interval (seconds)",
		30,
		3600,
		30
	],
	[
		"adultCatalogTarget",
		"Adult automatic catalog target",
		1e3,
		1e6,
		1e3
	]
];
function PullSettingsPanel() {
	const settings = (0, import_react.useSyncExternalStore)(subscribePullSettings, getPullSettings, () => DEFAULT_PULL_SETTINGS);
	const queue = (0, import_react.useSyncExternalStore)(subscribePullQueue, getPullQueueSnapshot, getPullQueueSnapshot);
	const paused = (0, import_react.useSyncExternalStore)(subscribePullControl, pullsPaused, () => false);
	const processing = useLibrary((state) => state.remoteBusy || state.refreshing);
	(0, import_react.useEffect)(() => {
		try {
			if (sessionStorage.getItem("reelcase.settings-section") !== "youtube-cleanup") return;
			sessionStorage.removeItem("reelcase.settings-section");
			const frame = requestAnimationFrame(() => document.querySelector("[data-youtube-cleanup]")?.scrollIntoView({ block: "start" }));
			return () => cancelAnimationFrame(frame);
		} catch {}
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-xl border border-border bg-elevated p-5 shadow-border",
		"aria-labelledby": "pull-settings-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
				children: "Pull management"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "pull-settings-title",
				className: "mt-2 font-display text-2xl text-fg",
				children: "Control the pace of your catalog."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
				children: "Larger pulls walk saved archive pages through small requests. YouTube archive page pacing is separate from the gap between pull jobs and defaults to 80ms. Set it to zero for no added wait between completed requests, or raise it when you want slower pulling. Live checks use their own 80ms pacing and up to eight concurrent metadata reads; the archive delay does not slow them. Adult pulls default to 2,000 entries and can target up to 10,000. Provider availability and duplicate results can reduce the number of new entries."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setPullsPaused(!paused),
						children: paused ? "Resume pulling" : "Pause pulling"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: !processing && !queue.active && !queue.waiting,
						onClick: cancelQueuedPulls,
						children: "Cancel current pull queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						role: "status",
						children: [
							queue.active,
							" active · ",
							queue.waiting,
							" queued",
							queue.held ? " · waiting for browsing to settle" : processing && !queue.active && !queue.waiting ? " · preparing catalog batch" : ""
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntryLimitSettings, { settings }),
			CLEANUP_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeCleanupSettings, {
				settings,
				group
			}, group)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: fields.map(([key, label, min, max, step]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs leading-5 text-muted",
					htmlFor: `pull-${key}`,
					children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `pull-${key}`,
						className: "mt-2 min-h-11",
						type: "number",
						min,
						max,
						step,
						defaultValue: String(settings[key]),
						onBlur: (event) => {
							if (event.target.value.trim()) updatePullSettings({ [key]: Number(event.target.value) });
						},
						onKeyDown: (event) => {
							if (event.key === "Enter") event.currentTarget.blur();
						}
					}, `${key}:${settings[key]}`)]
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => updatePullSettings({ adultBatchVideos: 2e3 }),
						children: "Adult pulls: 2,000"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => updatePullSettings({ adultBatchVideos: 1e4 }),
						children: "Adult pulls: 10,000"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.automaticPulls,
							onChange: (event) => updatePullSettings({ automaticPulls: event.target.checked })
						}), "Automatic catalog pulls"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.pauseWhileWatching,
							onChange: (event) => updatePullSettings({ pauseWhileWatching: event.target.checked })
						}), "Hold catalog pulls while a preview or player is open"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "YouTube finishes a provider page before saving its next cursor, so a batch may round up by one page. Adult limits cover all selected providers. Hidden tabs hold catalog work. Cancel stops later batches and discards outstanding responses; a provider request already sent may finish. Preview recommendations use at most 4,096 entries, with descriptions and comments loaded for the selected video."
			})
		]
	});
}
function EntryLimitSettings({ settings }) {
	const videos = useLibrary((state) => state.videos);
	const [usage, setUsage] = (0, import_react.useState)(null);
	const [saved, setSaved] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let active = true;
		remoteEntryCounts(videos).then((counts) => {
			if (active) setUsage({
				videos,
				counts
			});
		});
		return () => {
			active = false;
		};
	}, [videos]);
	const counts = usage?.videos === videos ? usage.counts : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 border-y border-border py-5",
		"aria-labelledby": "entry-limits-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				id: "entry-limits-title",
				className: "text-lg font-medium text-fg",
				children: "Saved entry limits"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
				children: "New entries stay within the source and combined caps. YouTube, Twitch and Adults replace small batches of eligible old entries. Successful pulls recover lowered caps gradually and keep rejected pages queued. Zero holds new entries for that source. Protected videos and local files stay."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 flex min-h-11 items-center gap-2 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.sharedCapCleanup,
					onChange: (event) => updatePullSettings({ sharedCapCleanup: event.target.checked })
				}), "Allow shared-cap replacement across enabled sources"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-3xl text-xs leading-5 text-muted",
				children: "When the combined cap blocks a pull, another enabled cache can donate eligible slots using its own remaining replacement budget. This never bypasses the incoming source's cap or deletes entries from a source with cleanup switched off."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: entryFields.map(([key, label, group]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					htmlFor: `pull-${key}`,
					className: "min-w-0 text-xs leading-5 text-muted",
					children: [
						label,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: `pull-${key}`,
							className: "mt-2 min-h-11",
							type: "number",
							min: 0,
							max: 1e6,
							step: 1e3,
							defaultValue: settings[key],
							onBlur: (event) => {
								if (!event.target.value.trim() || !Number.isFinite(Number(event.target.value))) return;
								updatePullSettings({ [key]: Number(event.target.value) });
								setSaved(`${label} limit saved.`);
							},
							onKeyDown: (event) => {
								if (event.key === "Enter") event.currentTarget.blur();
							}
						}, `${key}:${settings[key]}`),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block",
							children: counts ? `${counts[group].toLocaleString()} stored / ${settings[key].toLocaleString()} max${counts[group] >= settings[key] ? settings.remoteMaxEntries > 0 && CLEANUP_GROUPS.some((source) => (group === source || group === "total") && settings[`${source}MaxEntries`] > 0 && cleanupPolicy(settings, source).enabled) ? " · eligible old entries can be replaced" : " · new entries held" : ""}` : "Counting stored entries..."
						})
					]
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "Includes saved, hidden, and live remote entries. Local files are excluded. Limits control catalog growth, rather than a fixed number of memory bytes."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 min-h-5 text-xs text-accent",
				role: "status",
				children: saved
			})
		]
	});
}
function YoutubeCleanupSettings({ settings, group }) {
	const cleanup = useLibrary((s) => s.cleanupRemoteCache), journal = useLibrary((s) => s.youtubeCleanup);
	const note = useLibrary((s) => s.cleanupNotes[group] ?? ""), processing = useLibrary((s) => s.remoteBusy || s.refreshing);
	const [error, setError] = (0, import_react.useState)("");
	const label = cleanupLabel(group), policy = cleanupPolicy(settings, group);
	const stats = journal.groups?.[group];
	const earlierCount = Math.max(0, journal.removedCount - CLEANUP_GROUPS.reduce((sum, source) => sum + (journal.groups?.[source]?.removedCount ?? 0), 0));
	const batchKey = `${group}CleanupBatch`, ageKey = `${group}CleanupMinAgeDays`;
	const run = async () => {
		setError("");
		try {
			await cleanup(group);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Cleanup could not be completed.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		[`data-${group}-cleanup`]: "",
		className: "mt-5 scroll-mt-6 rounded-lg border border-border bg-bg/40 p-4",
		"aria-labelledby": `${group}-cleanup-title`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				id: `${group}-cleanup-title`,
				className: "text-lg font-medium text-fg",
				children: [label, " cache cleanup"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
				children: "At the cap, replace unrated and 1–2-star videos, oldest first within each group. Likes, favorites, 3–5-star ratings, live/upcoming and open videos stay. Keeps watch history, saved links, archive positions, custom metadata and a video from each source."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 flex min-h-11 items-center gap-2 text-sm text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: policy.enabled,
						onChange: (event) => updatePullSettings({ [`${group}AutoCleanup`]: event.target.checked })
					}),
					"Automatically make room for new ",
					label,
					" pulls"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs leading-5 text-muted",
					htmlFor: `pull-${batchKey}`,
					children: ["Maximum entries replaced per pull", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `pull-${batchKey}`,
						className: "mt-2",
						type: "number",
						min: 1,
						max: 1e3,
						defaultValue: policy.batch,
						onBlur: (event) => {
							if (event.target.value.trim()) updatePullSettings({ [batchKey]: Number(event.target.value) });
						},
						onKeyDown: (event) => {
							if (event.key === "Enter") event.currentTarget.blur();
						}
					}, policy.batch)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs leading-5 text-muted",
					htmlFor: `pull-${ageKey}`,
					children: [
						"Minimum ",
						group === "youtube" ? "publication" : "entry",
						" age (days)",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: `pull-${ageKey}`,
							className: "mt-2",
							type: "number",
							min: 0,
							max: 3650,
							defaultValue: policy.minAgeDays,
							onBlur: (event) => {
								if (event.target.value.trim()) updatePullSettings({ [ageKey]: Number(event.target.value) });
							},
							onKeyDown: (event) => {
								if (event.key === "Enter") event.currentTarget.blur();
							}
						}, policy.minAgeDays)
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "Automatic cleanup runs only after new entries arrive. Failed or duplicate-only pulls remove nothing. Unknown dates stay. This source's budget covers the entire pull, including any slots donated to another enabled source. Partially accepted pages keep their resume position. If too few entries qualify, pulls hold at the cap. An age of 0 allows recent unrated and low-rated entries to rotate; saved-video protections still apply."
			}),
			group === "adult" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Automatic Adult discovery also rotates at its catalog target, even when the source entry limit is higher. Manual pulls use the full source limit."
			}),
			group !== "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Entry age uses the provider's publication date when available, otherwise the date the entry was cached."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					className: "h-auto min-h-11 max-w-full whitespace-normal py-2",
					disabled: processing,
					onClick: () => void run(),
					children: [
						"Free up to ",
						policy.batch.toLocaleString(),
						" ",
						label,
						" slots now"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted",
					children: [
						(stats?.removedCount ?? 0).toLocaleString(),
						" entries removed",
						stats?.lastAt ? ` · last cleanup: ${new Date(stats.lastAt).toLocaleString()}` : ""
					]
				})]
			}),
			earlierCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted",
				children: [
					"Earlier shared cleanup history: ",
					earlierCount.toLocaleString(),
					" removals. New cleanups are counted separately for each source."
				]
			}),
			(error || note) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: error ? "alert" : "status",
				className: "mt-3 text-sm leading-6 text-muted",
				children: error || note
			})
		]
	});
}
var timingHealth = (ms, good, bad) => ms <= good ? "healthy" : ms <= bad ? "watch" : "attention";
function buildPerformanceScorecard(input) {
	const recentInputs = Object.values(input.interactions).filter((row) => row.count > 0 && input.now - row.at <= 6e4 && row.at <= input.now);
	const inputMs = recentInputs.length ? Math.max(...recentInputs.map((row) => row.lastMs)) : void 0;
	const frameRatio = input.frames.sampledFrames >= 30 && input.now - input.frames.sampledAt <= 6e4 ? input.frames.recentLongFrames / input.frames.sampledFrames : void 0;
	const memoryRatio = Math.max(input.artwork.bytes / Math.max(1, input.artwork.byteLimit), input.artwork.entries / Math.max(1, input.artwork.entryLimit), input.viewer.estimatedBytes / Math.max(1, input.viewer.maxBytes));
	const cards = Math.max(input.frames.mountedCards, input.frames.lastActiveCards);
	const cardLimit = input.lowMemory ? 96 : 256;
	const checks = [
		{
			id: "startup",
			label: "Home controls",
			health: input.homeReadyMs === void 0 ? "unmeasured" : timingHealth(input.homeReadyMs, 3e3, 5e3),
			detail: input.homeReadyMs === void 0 ? "Startup has not reported readiness." : `${input.homeReadyMs} ms from page load; catalog hydration is separate.`
		},
		{
			id: "input",
			label: "Input to next paint",
			health: inputMs === void 0 ? "unmeasured" : timingHealth(inputMs, 100, 200),
			detail: inputMs === void 0 ? "Navigate, search, or rate a title, then refresh within a minute." : `${inputMs} ms slowest latest interaction in the last minute.`
		},
		{
			id: "frames",
			label: "Frame pressure",
			health: frameRatio === void 0 ? "unmeasured" : timingHealth(frameRatio, .05, .15),
			detail: frameRatio === void 0 ? "Browse a shelf with diagnostics enabled, then return within a minute." : `${Math.round(frameRatio * 100)}% of ${input.frames.sampledFrames} recent visible frames exceeded 34 ms; worst ${input.frames.recentWorstFrameMs} ms.`
		},
		{
			id: "memory",
			label: "Bounded media caches",
			health: memoryRatio > 1 ? "attention" : memoryRatio >= .85 ? "watch" : "healthy",
			detail: `${Math.round(memoryRatio * 100)}% of the busiest artwork or viewer cache budget. This is not total browser RAM.`
		},
		{
			id: "cards",
			label: "Mounted cards",
			health: cards === 0 ? "unmeasured" : cards > cardLimit ? "attention" : "healthy",
			detail: `${input.frames.mountedCards} now · ${input.frames.lastActiveCards} last sampled on a shelf · ${cardLimit} whole-page review budget.`
		},
		{
			id: "storage",
			label: "Thumbnail disk reads",
			health: input.diskErrors ? "watch" : "healthy",
			detail: `${input.diskErrors} read errors since this page loaded. Cache misses are normal.`
		}
	];
	const measured = checks.filter((row) => row.health !== "unmeasured");
	const health = measured.some((row) => row.health === "attention") ? "attention" : measured.some((row) => row.health === "watch") ? "watch" : checks.some((row) => row.health === "unmeasured") ? "unmeasured" : "healthy";
	const failing = (id) => checks.some((row) => row.id === id && (row.health === "watch" || row.health === "attention"));
	return {
		health,
		checks,
		next: failing("memory") ? input.lowMemory ? "Keep Low-memory mode on; close unused previews and retest after browsing." : "Try Low-memory mode in Settings, then browse the same shelf again." : failing("input") ? input.pullsPaused ? "Pulling is paused. Repeat the slow click or search and refresh; try Low-memory mode if input remains slow." : "Pause pulling, repeat the slow click or search, and refresh to compare the latest input time." : failing("frames") || failing("cards") ? "Try Text-first artwork and a smaller grid page size, then scroll the same shelf again." : failing("storage") ? "Check browser storage availability; repeated disk failures can cause artwork to be fetched again." : failing("startup") ? "Compare a fresh Home load with pulling paused; capture the startup phases below." : health === "unmeasured" ? "Browse and search with diagnostics enabled, then return here and refresh. Missing measurements do not pass a check." : "No immediate change suggested by these samples. Long sessions and real-provider pulls still need separate verification."
	};
}
var phases = [
	["preferences", "Saved preferences"],
	["remoteRead", "Provider catalog from disk"],
	["remotePrepare", "Provider catalog preparation"],
	["localRead", "Local catalog from disk"],
	["localPrepare", "Local catalog preparation"]
];
function StartupStatus() {
	(0, import_react.useSyncExternalStore)(subscribeStartupTrace, getStartupTraceRevision, () => 0);
	const trace = getFirstShelfTrace();
	const duration = (ms) => ms === void 0 ? "pending" : `${ms.toLocaleString()} ms`;
	const firstPaint = typeof performance === "undefined" ? void 0 : performance.getEntriesByName("first-contentful-paint")[0]?.startTime;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Startup timing",
		className: "mt-3 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium text-fg",
				children: "Startup timing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"First contentful paint · ",
				duration(firstPaint === void 0 ? void 0 : Math.round(firstPaint)),
				" from navigation"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Home controls ready · ",
				duration(trace.homeReadyMs),
				" from navigation"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Saved catalogs ready · ",
				duration(trace.catalogReadyMs),
				" from navigation"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-2 grid gap-1",
				children: phases.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-between gap-x-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						"data-startup-phase": id,
						children: [
							duration(trace.phases[id]?.elapsedMs),
							trace.phases[id]?.rows !== void 0 ? ` · ${trace.phases[id].rows.toLocaleString()} rows` : "",
							trace.phases[id]?.failed ? " · storage unavailable" : ""
						]
					})]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2",
				children: [
					"First usable shelf · ",
					duration(trace.elapsedMs),
					" from navigation",
					trace.route ? ` · ${duration(trace.routeElapsedMs)} after opening ${trace.route}` : "",
					trace.cards ? ` · ${trace.cards} mounted cards` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"First shelf artwork · ",
				trace.artwork,
				trace.artworkWaitMs === void 0 ? "" : ` · ${duration(trace.artworkWaitMs)} after text was ready`
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-subtle",
				children: "Home opens independently of catalog restoration. Landing page prepares its full recommendations on demand. Preparation yields after at most 512 records or about 4 ms; this is a work budget, not a guaranteed frame time. Disk and preparation durations include time yielded to input; YouTube selector, artwork and provider overlap appear below."
			})
		]
	});
}
var labels = {
	healthy: "Within budget",
	watch: "Worth checking",
	attention: "Needs attention",
	unmeasured: "More samples needed"
};
var bytes = (n) => `${(n / 1048576).toFixed(2)} MiB`;
var age = (n) => n === void 0 ? "No sample" : n < 6e4 ? `${Math.floor(n / 1e3)}s` : n < 36e5 ? `${Math.floor(n / 6e4)}m` : `${Math.floor(n / 36e5)}h`;
var rate = (hits, misses) => hits + misses ? `${Math.round(hits / (hits + misses) * 100)}% hit · ${hits.toLocaleString()} hits / ${misses.toLocaleString()} misses` : "No requests observed";
function capture() {
	const now = Date.now(), catalog = useLibrary.getState(), counters = cacheMetrics.snapshot();
	const snapshot = {
		version: 1,
		capturedAt: now,
		catalogEntries: catalog.videos.length,
		sourceCount: catalog.folders.length,
		lowMemory: getPerformanceProfile().lowMemory,
		pullsPaused: pullsPaused(),
		frames: getRenderBudgetSnapshot(),
		interactions: getInteractionBudgetSnapshot(),
		search: searchWorkerIndex.diagnostics(),
		startup: getFirstShelfTrace(),
		artwork: getThumbDiagnostics(),
		viewer: viewerDetails.diagnostics(),
		counters,
		providers: aggregateProviderCache(catalog.follows, now),
		providerBudgets: PROVIDER_BUDGETS,
		writes: getPersistenceMemorySnapshot(),
		recurring: getPeriodicWorkSnapshot(),
		sources: getSourceMemorySnapshot(),
		feedback: getFeedbackDiagnostics(),
		companion: getCompanionMemorySnapshot()
	};
	return {
		...snapshot,
		scorecard: buildPerformanceScorecard({
			...snapshot,
			now,
			homeReadyMs: snapshot.startup.homeReadyMs,
			diskErrors: counters["thumbnail-disk"].errors
		})
	};
}
function PerformanceScorecard() {
	const [snapshot, setSnapshot] = (0, import_react.useState)(capture);
	const { scorecard, artwork, viewer, frames, counters, recurring, writes } = snapshot;
	const exportSnapshot = () => {
		const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "reelcase-performance-scorecard.json";
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-5 min-w-0 border-t border-white/10 pt-5",
		"aria-label": "Performance scorecard",
		"data-performance-scorecard": true,
		"data-health": scorecard.health,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold text-fg",
					children: "Performance scorecard"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-accent",
					role: "status",
					children: labels[scorecard.health]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						onClick: () => setSnapshot(capture()),
						children: "Refresh scorecard"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "min-h-11",
						onClick: exportSnapshot,
						children: "Export measurements"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: [
					"Captured ",
					new Date(snapshot.capturedAt).toLocaleTimeString(),
					" · ",
					snapshot.catalogEntries.toLocaleString(),
					" entries · ",
					snapshot.lowMemory ? "Low-memory" : "Adaptive",
					" mode · pulling ",
					snapshot.pullsPaused ? "paused" : "enabled",
					". Refresh on demand; no catalog scan or automatic Settings refresh. Samples stay on this device."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3",
				children: scorecard.checks.map((check) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 rounded-md bg-bg/45 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-medium text-fg",
							children: check.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-xs ${check.health === "attention" || check.health === "watch" ? "text-accent" : "text-muted"}`,
							children: labels[check.health]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: check.detail
					})]
				}, check.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 rounded-md border border-accent/20 p-3 text-sm leading-6 text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Next step: " }), scorecard.next]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-6 font-semibold text-fg",
				children: "Cache health"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Catalog selectors",
						detail: rate(counters["catalog-selectors"].hits, counters["catalog-selectors"].misses),
						note: `Immutable-input reuse since page load · last lookup ${age(counters["catalog-selectors"].lastAccessAt === void 0 ? void 0 : snapshot.capturedAt - counters["catalog-selectors"].lastAccessAt)} ago. Results share catalog references; heap size is not measured.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Artwork memory",
						detail: rate(artwork.hits, artwork.misses),
						note: `${artwork.entries} / ${artwork.entryLimit} entries · ${bytes(artwork.bytes)} / ${bytes(artwork.byteLimit)} · ${artwork.evictions} evictions · ${artwork.active} decoding / ${artwork.queued} queued. Session reuse includes disk recall.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Search worker",
						detail: `${snapshot.search.status} · ${snapshot.search.workers} workers · ${snapshot.search.pending} pending`,
						note: snapshot.search.lastFailure || "One generation-owned index. Failures release its catalog; explicit retry or cooperative search keeps browsing available."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Artwork decode lifecycle",
						detail: `${artwork.decodes.active} native / ${artwork.decodes.queued} queued · current limit ${artwork.decodes.limit}`,
						note: `${artwork.decodes.cancelled} cancelled callers · ${artwork.decodes.closedLate} obsolete bitmaps closed · peak ${artwork.decodes.peak} · ${artwork.admission.active}/${artwork.admission.max} admitted images. Native calls cannot be aborted; their slots remain counted until they settle. No image paths or buffers are recorded.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Thumbnail disk recall",
						detail: rate(counters["thumbnail-disk"].hits, counters["thumbnail-disk"].misses),
						note: `${counters["thumbnail-disk"].errors} errors · last recalled item ${counters["thumbnail-disk"].lastEntryBytes === void 0 ? "unmeasured" : bytes(counters["thumbnail-disk"].lastEntryBytes)} · oldest observed item ${age(counters["thumbnail-disk"].oldestObservedEntryAt === void 0 ? void 0 : snapshot.capturedAt - counters["thumbnail-disk"].oldestObservedEntryAt)}. Observed reads only; no full disk inventory.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Viewer details",
						detail: `${viewer.entries} / ${viewer.maxEntries} entries · ${bytes(viewer.estimatedBytes)} / ${bytes(viewer.maxBytes)} estimated`,
						note: `${viewer.pending} disk reads · ${viewer.activeTranscripts} active transcript. Details leave memory when their bounded cache evicts them.`
					}),
					snapshot.providers.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: `${provider.kind === "youtube" ? "YouTube" : "Twitch"} provider snapshots`,
						detail: rate(provider.hits, provider.misses),
						note: `${provider.samples} saved creator samples · ${provider.uncached} unretained responses · ${provider.entries.toLocaleString()} retained entries in snapshots · ${provider.sizedSamples ? `${bytes(provider.estimatedBytes)} estimated across ${provider.sizedSamples} sized samples` : "size unavailable until the next provider response"} · oldest sample ${age(provider.oldestAgeMs)}.`
					}, provider.kind))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-subtle",
				children: "Provider rows are the latest saved observations per creator, which may be stale or evicted. Counters reset with the server cache; totals are not the current server inventory. Payload estimates exclude object overhead. Exports contain counts and timings, without media, titles, channel names, or URLs."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-4 rounded-md border border-border p-3",
				"aria-label": "Provider metadata safeguards",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer py-3 text-sm font-medium text-fg",
						children: "Provider metadata safeguards"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: [
							"Each upstream metadata page has an ",
							bytes(PROVIDER_BUDGETS.responseBytes),
							" response ceiling and a ",
							PROVIDER_BUDGETS.bodyTimeoutMs / 1e3,
							"s body-read deadline. Oversized or interrupted pages hold their saved position; accepted pages stay available. Archive totals can keep growing through complete pages. Your pulling rates and entry limits remain in Pull settings."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid gap-3 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
								title: "YouTube transfers",
								detail: `${PROVIDER_BUDGETS.youtubeTransfers} active · ${PROVIDER_BUDGETS.queuedRequests} waiting maximum`,
								note: `User-selected pacing and explicit retry apply. Warm cache: ${bytes(PROVIDER_BUDGETS.youtubeCacheBytes)} estimated total; up to ${PROVIDER_BUDGETS.warmCacheRows} rows per entry.`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
								title: "Twitch transfers",
								detail: `${PROVIDER_BUDGETS.twitchTransfers} active · ${PROVIDER_BUDGETS.queuedRequests} waiting maximum`,
								note: `Whole transfers share the lane across jobs. Warm cache: ${bytes(PROVIDER_BUDGETS.twitchCacheBytes)} estimated total; deep results above ${PROVIDER_BUDGETS.warmCacheRows} rows go to the durable library without a second server graph.`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
								title: "Adult transfers",
								detail: `${PROVIDER_BUDGETS.adultTransfers} active · ${PROVIDER_BUDGETS.queuedRequests} waiting maximum`,
								note: `Readable response cache: ${bytes(PROVIDER_BUDGETS.adultCacheBytes)} estimated total. Response bytes are checked before decoding and caching.`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs leading-5 text-subtle",
						children: [
							"Recent refresh jobs use up to ",
							PROVIDER_BUDGETS.refreshWorkers,
							" workers; live checks use ",
							PROVIDER_BUDGETS.liveWorkers,
							"; YouTube archive batches use ",
							PROVIDER_BUDGETS.archiveWorkers,
							". Imports use ",
							PROVIDER_BUDGETS.importWorkers,
							" workers and at most ",
							PROVIDER_BUDGETS.importAttempts,
							" attempts per source, with no immediate repeat of an oversized response. These are metadata safeguards; playback and media downloads keep their own paths. Cache sizes estimate retained payload, excluding JavaScript object overhead."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-xs leading-5 text-muted",
				"aria-label": "Recurring work",
				children: [
					"Recurring work · ",
					recurring.tasks,
					" tasks · ",
					recurring.timerCount,
					" shared timer · ",
					recurring.running,
					" running · ",
					recurring.paused,
					" paused. Storage · ",
					writes.artwork.pending,
					" artwork writes (",
					bytes(writes.artwork.pendingWeight),
					") · ",
					writes.activity.pending,
					" activity snapshots · ",
					snapshot.sources.objectUrls,
					" temporary media URLs. Frame sampling ",
					frames.monitoring ? "enabled" : "disabled",
					"; retains at most 240 durations while visible shelves are mounted."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartupStatus, {})
		]
	});
}
function CacheRow({ title, detail, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 rounded-md bg-bg/45 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-sm font-medium text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-1 text-xs leading-5 text-accent",
				children: detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: note
			})
		]
	});
}
var PREFERENCE_GROUPS = {
	Alerts: [
		"Go-live alerts",
		"New Twitch VOD alerts",
		"New YouTube upload alerts",
		"Desktop notifications"
	],
	Playback: ["Autoplay next video", "Start muted"],
	Display: ["Day mode", "Compact live cards"],
	Performance: [
		"Use cached sources first",
		"Low-memory grids",
		"Small Home shelves"
	],
	Privacy: ["Reduce motion", "Hide demo media"]
};
var ACTIVE_PREFERENCE_DETAILS = {
	"alerts-go-live-alerts": "Active: adds an in-app notice when a tracked Twitch channel goes live after a refresh.",
	"alerts-new-twitch-vod-alerts": "Active: adds an in-app notice when a tracked Twitch channel has a newly discovered VOD or clip.",
	"alerts-new-youtube-upload-alerts": "Active: adds an in-app notice when a tracked YouTube channel has a newly discovered upload.",
	"alerts-desktop-notifications": "Active: asks the browser for permission, then mirrors enabled Realhub alerts as desktop notifications.",
	"playback-autoplay-next-video": "Active: starts the next library title when a local video ends.",
	"playback-start-muted": "Active: local video playback starts muted until you raise the player volume.",
	"display-day-mode": "Active: uses the light palette throughout this browser.",
	"display-compact-live-cards": "Active: renders six compact live cards per wide row to reduce scrolling and image work.",
	"performance-use-cached-sources-first": "Active: opens the saved catalog before asking folders or the Companion for fresh file details.",
	"performance-low-memory-grids": "Active: keeps only a smaller card batch mounted in large grids, reducing image decode pressure.",
	"performance-small-home-shelves": "Active: draws shorter Home rails first; use Show more inside a rail when you want depth.",
	"privacy-reduce-motion": "Active: reduces animation and scrolling motion across Realhub.",
	"privacy-hide-demo-media": "Active: hides bundled demonstration titles from your library shelves."
};
var PREFERENCES = Object.entries(PREFERENCE_GROUPS).flatMap(([group, labels]) => labels.map((label) => ({
	key: `${group}-${label}`.toLowerCase().replaceAll(" ", "-"),
	group,
	label,
	detail: ACTIVE_PREFERENCE_DETAILS[`${group}-${label}`.toLowerCase().replaceAll(" ", "-")],
	implemented: true
})));
function companionTagPart(value) {
	return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}
function companionSuggestions(inspection) {
	const tags = inspection.tags;
	const videoStream = inspection.streams?.find((stream) => stream.type === "video");
	const year = tags?.date?.match(/(?:19|20)\d{2}/)?.[0];
	return [...new Set([
		tags?.genre ? `genre-${companionTagPart(tags.genre)}` : "",
		tags?.artist ? `artist-${companionTagPart(tags.artist)}` : "",
		tags?.album ? `album-${companionTagPart(tags.album)}` : "",
		year ? `year-${year}` : "",
		videoStream?.codec ? `codec-${companionTagPart(videoStream.codec)}` : "",
		videoStream?.width && videoStream.height ? `resolution-${videoStream.width}x${videoStream.height}` : ""
	].filter(Boolean))].slice(0, 6);
}
function companionTechnicalSummary(inspection) {
	const streams = inspection.streams?.map((stream) => [stream.codec, stream.width && stream.height ? `${stream.width}×${stream.height}` : ""].filter(Boolean).join(" · ")).filter(Boolean) ?? [];
	return [Number.isFinite(inspection.duration) && inspection.duration && inspection.duration > 0 ? `${Math.round(inspection.duration)} sec` : "duration unavailable", ...streams].join(" · ");
}
function metadataSourceLabel(source) {
	if (source === "local") return "Local files";
	return source.split("-").map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part).join(" ");
}
function YoutubeFirstClickDiagnostic() {
	(0, import_react.useSyncExternalStore)(subscribeYoutubeTrace, getYoutubeTraceRevision, () => 0);
	const trace = getYoutubeFirstClickTrace();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium text-fg",
				children: "YouTube first-click trace"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: !trace ? "Open YouTube to record a local timing sample." : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				trace.railReadyMs === void 0 ? "Waiting for the first available upload" : `${trace.railReadyMs}ms to ${trace.railCards} text-first cards`,
				` · selector ${trace.selectorMs ?? "…"}ms work / ${trace.selectorReadyMs ?? "…"}ms ready · ${trace.catalogRows ?? 0} cached rows`,
				` · artwork ${trace.artwork === "pending" ? "pending" : trace.artwork === "loaded" ? `${trace.artworkWaitMs ?? 0}ms after cards` : "deferred or unavailable"}`,
				` · provider ${trace.provider === "idle" ? "not needed" : `${trace.providerOverlapMs}ms overlap (${trace.provider})`}`
			] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-subtle",
				children: "Local timings only; cached cards do not wait for artwork or a provider request."
			})
		]
	});
}
function SettingsSection() {
	const performanceBudget = usePerformanceProfile();
	const [performanceMode, setPerformanceModeChoice] = (0, import_react.useState)("adaptive");
	(0, import_react.useEffect)(() => setPerformanceModeChoice(getPerformanceMode()), [performanceBudget]);
	const [hub, setHub] = (0, import_react.useState)({
		prints: [],
		games: []
	});
	const [preferences, setPreferences] = (0, import_react.useState)({});
	const [preferenceGroup, setPreferenceGroup] = (0, import_react.useState)("Playback");
	const [zoom, setZoom] = (0, import_react.useState)(100);
	const [railLimit, setRailLimit] = (0, import_react.useState)(8);
	const [adultRailLimit, setAdultRailLimit] = (0, import_react.useState)(48);
	const [gridPageSize, setGridPageSize] = (0, import_react.useState)(24);
	const [thumbnailWorkers, setThumbnailWorkers] = (0, import_react.useState)(0);
	const textFirstArtwork = useTextFirstArtwork();
	const [photoWorkers, setPhotoWorkers] = (0, import_react.useState)(0);
	const [defaultVolume, setDefaultVolume] = (0, import_react.useState)(85);
	const [startMuted, setStartMuted] = (0, import_react.useState)(false);
	const [videoVisionBusy, setVideoVisionBusy] = (0, import_react.useState)(false);
	const [videoVisionNote, setVideoVisionNote] = (0, import_react.useState)("");
	const [videoVisionRows, setVideoVisionRows] = (0, import_react.useState)([]);
	const [selectedVideoVision, setSelectedVideoVision] = (0, import_react.useState)({});
	const [companionInspectionBusy, setCompanionInspectionBusy] = (0, import_react.useState)(false);
	const [companionInspectionNote, setCompanionInspectionNote] = (0, import_react.useState)("");
	const [companionInspectionRows, setCompanionInspectionRows] = (0, import_react.useState)([]);
	const [selectedCompanionInspections, setSelectedCompanionInspections] = (0, import_react.useState)({});
	const [metadataTailNote, setMetadataTailNote] = (0, import_react.useState)("");
	const [metadataTailBusy, setMetadataTailBusy] = (0, import_react.useState)(false);
	const [smartTagsBusy, setSmartTagsBusy] = (0, import_react.useState)(false);
	const [creatorCoverageNote, setCreatorCoverageNote] = (0, import_react.useState)("");
	const [creatorCoverageBusy, setCreatorCoverageBusy] = (0, import_react.useState)(false);
	const [twitchRefreshSeconds, setTwitchRefreshSeconds] = (0, import_react.useState)(30);
	const [liveDensity, setLiveDensity] = (0, import_react.useState)(4);
	const [sourceCacheFirst, setSourceCacheFirst] = (0, import_react.useState)(true);
	const [debugEnabled, setDebugEnabled] = (0, import_react.useState)(false);
	const [theme, setTheme] = (0, import_react.useState)("night");
	const [debugReport, setDebugReport] = (0, import_react.useState)("");
	const refreshFollows = useLibrary((s) => s.refreshFollows);
	const folders = useLibrary((s) => s.folders);
	const videos = useLibrary((s) => s.videos);
	const tags = useLibrary((s) => s.tags);
	const metadataProvenance = useLibrary((s) => s.metadataProvenance);
	const applyReviewedTags = useLibrary((s) => s.applyReviewedTags);
	const applyCompanionTags = useLibrary((s) => s.applyCompanionTags);
	const enrichMetadataTail = useLibrary((s) => s.enrichMetadataTail);
	const repairCachedMetadata = useLibrary((s) => s.repairCachedMetadata);
	const repairCreatorCoverage = useLibrary((s) => s.repairCreatorCoverage);
	const openPreview = useLibrary((s) => s.openPreview);
	const follows = useLibrary((s) => s.follows);
	const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
	const unavailable = useLibrary((s) => s.unavailable);
	const unavailableVideoCount = (0, import_react.useMemo)(() => Object.keys(unavailable).length, [unavailable]);
	const hiddenVideos = useLibrary((s) => s.hiddenVideos);
	const unhideVideo = useLibrary((s) => s.unhideVideo);
	const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
	const { smartTagStatus, metadataTailCoverage, creatorCoverage, companionInspectionCandidates, vision, hiddenTitles, ready: auditReady } = useSettingsAudit(videos, tags, metadataProvenance, follows, hiddenVideos);
	const metadataTailWaiting = metadataTailCoverage.reduce((total, row) => total + row.waiting, 0);
	const runMetadataTail = async () => {
		setMetadataTailBusy(true);
		setMetadataTailNote("Queued · you can keep browsing while this batch is prepared and saved.");
		try {
			const result = await enrichMetadataTail();
			if (!result.processed) {
				setMetadataTailNote("Metadata coverage is current for every unlocked catalog title. Locked tags were left untouched.");
				return;
			}
			const sourceSummary = result.sources.filter((row) => row.processed).map((row) => `${metadataSourceLabel(row.source)} ${row.changed}/${row.processed}`).join(" · ");
			setMetadataTailNote(`Saved ${result.processed} cached title${result.processed === 1 ? "" : "s"}; ${result.changed} gained safe metadata tags${result.remaining ? ` · ${result.remaining.toLocaleString()} cached titles remain to check` : " · scan complete"}${sourceSummary ? ` · ${sourceSummary}` : ""}.`);
		} catch {
			setMetadataTailNote("This batch could not finish saving. Completed batches are retained; retry to continue.");
		} finally {
			setMetadataTailBusy(false);
		}
	};
	const runSmartTags = async () => {
		setSmartTagsBusy(true);
		setServiceNote("Smart tags queued · completed batches save as you browse.");
		try {
			const changed = await useLibrary.getState().autoTagLibrary();
			setServiceNote(changed ? `Smart-tag run saved · ${changed.toLocaleString()} catalog items updated.` : "Smart tags are already current for every loaded catalog item.");
		} catch {
			setServiceNote("Smart tags could not finish saving. Retry to continue from saved results.");
		} finally {
			setSmartTagsBusy(false);
		}
	};
	const runCreatorCoverageRepair = async () => {
		setCreatorCoverageBusy(true);
		setCreatorCoverageNote("Queued · you can keep browsing while exact creator matches are prepared and saved.");
		try {
			const result = await repairCreatorCoverage();
			if (!result.processed) {
				setCreatorCoverageNote(creatorCoverage.ambiguous.length ? "No uniquely matched cards remain. Ambiguous exact-ID matches stay below for review and were not changed." : "Creator coverage is current for every card with one exact saved provider match.");
				return;
			}
			setCreatorCoverageNote(`Repaired ${result.repaired} creator ${result.repaired === 1 ? "identity" : "identities"} from exact saved provider IDs${result.tagged ? ` · ${result.tagged} unlocked card${result.tagged === 1 ? "" : "s"} also gained its creator tag` : " · locked tag choices were left unchanged"}${result.remaining ? ` · ${result.remaining} remain in the queue` : " · queue complete"}.`);
		} catch {
			setCreatorCoverageNote("Creator names could not be saved. No repair was applied; retry when storage is available.");
		} finally {
			setCreatorCoverageBusy(false);
		}
	};
	const [serviceNote, setServiceNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => setHub(readHub()), []);
	(0, import_react.useEffect)(() => {
		try {
			const next = { ...JSON.parse(localStorage.getItem("reelcase.settings.v2") ?? "{}") };
			setPreferences(next);
			localStorage.setItem("reelcase.settings.v2", JSON.stringify(next));
		} catch {
			setPreferences({});
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const rail = Number(localStorage.getItem("reelcase.adult-rail-limit") ?? "48");
		setAdultRailLimit([
			16,
			24,
			48,
			72
		].includes(rail) ? rail : 48);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.ui-zoom") ?? "100");
		const value = [
			80,
			90,
			100,
			110,
			125
		].includes(saved) ? saved : 100;
		setZoom(value);
		document.documentElement.style.fontSize = `${value}%`;
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.home-rail-limit") ?? "8");
		setRailLimit([
			8,
			16,
			32,
			48
		].includes(saved) ? saved : 8);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.grid-page-size") ?? "24");
		setGridPageSize([
			24,
			48,
			96,
			144
		].includes(saved) ? saved : 24);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0");
		setThumbnailWorkers([
			1,
			2,
			3,
			4
		].includes(saved) ? saved : 0);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0");
		setPhotoWorkers([
			2,
			4,
			6,
			8,
			12
		].includes(saved) ? saved : 0);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.player-volume") ?? "85");
		setDefaultVolume([
			25,
			50,
			70,
			85,
			100
		].includes(saved) ? saved : 85);
		setStartMuted(localStorage.getItem("reelcase.player-start-muted") === "true");
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30");
		setTwitchRefreshSeconds([
			15,
			30,
			60,
			120,
			300
		].includes(saved) ? saved : 30);
	}, []);
	(0, import_react.useEffect)(() => setSourceCacheFirst(localStorage.getItem("reelcase.source-cache-first") !== "false"), []);
	(0, import_react.useEffect)(() => {
		try {
			setDebugEnabled(localStorage.getItem("reelcase.debug-panel") === "true");
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			const saved = localStorage.getItem("reelcase.theme") === "day" ? "day" : "night";
			setTheme(saved);
			document.documentElement.dataset.theme = saved;
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => setLiveDensity([
		3,
		4,
		6
	].includes(Number(localStorage.getItem("reelcase.live-columns") ?? "4")) ? Number(localStorage.getItem("reelcase.live-columns")) : 4), []);
	const setGlobalZoom = (value) => {
		setZoom(value);
		localStorage.setItem("reelcase.ui-zoom", String(value));
		document.documentElement.style.fontSize = `${value}%`;
	};
	const setColorTheme = (value) => {
		setTheme(value);
		localStorage.setItem("reelcase.theme", value);
		document.documentElement.dataset.theme = value;
	};
	const togglePreference = (key) => {
		const enabled = !preferences[key];
		const next = {
			...preferences,
			[key]: enabled
		};
		setPreferences(next);
		localStorage.setItem("reelcase.settings.v2", JSON.stringify(next));
		if (key === "privacy-reduce-motion") document.documentElement.toggleAttribute("data-reduce-motion", enabled);
		if (key === "privacy-hide-demo-media") useLibrary.getState().setHideDemo(enabled);
		if (key === "playback-start-muted") localStorage.setItem("reelcase.player-start-muted", String(enabled));
		if (key === "display-day-mode") setColorTheme(enabled ? "day" : "night");
		if (key === "display-compact-live-cards") {
			localStorage.setItem("reelcase.live-columns", enabled ? "6" : "4");
			setLiveDensity(enabled ? 6 : 4);
		}
		if (key === "performance-use-cached-sources-first") {
			localStorage.setItem("reelcase.source-cache-first", String(enabled));
			setSourceCacheFirst(enabled);
		}
		if (key === "performance-low-memory-grids") {
			localStorage.setItem("reelcase.grid-page-size", enabled ? "24" : "48");
			setGridPageSize(enabled ? 24 : 48);
		}
		if (key === "performance-small-home-shelves") {
			localStorage.setItem("reelcase.home-rail-limit", enabled ? "8" : "16");
			setRailLimit(enabled ? 8 : 16);
		}
		if (key === "alerts-desktop-notifications" && enabled) {
			if (!("Notification" in window)) {
				setServiceNote("This browser does not support desktop notifications.");
				return;
			}
			Notification.requestPermission().then((permission) => {
				if (permission !== "granted") {
					setPreferences((current) => ({
						...current,
						[key]: false
					}));
					localStorage.setItem("reelcase.settings.v2", JSON.stringify({
						...next,
						[key]: false
					}));
					setServiceNote("Desktop notifications were not granted. In-app alerts remain available.");
				} else {
					useLibrary.getState().setNotifyPush(true);
					setServiceNote("Desktop notifications are enabled for the alerts you keep switched on.");
				}
			});
		}
	};
	const exportLocal = () => {
		const state = useLibrary.getState();
		const payload = {
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			note: "Realhub library metadata only. Original local files and browser permission handles are never exported.",
			library: {
				folders: state.folders,
				videos: state.videos,
				favorites: Object.keys(state.favorites),
				likes: Object.keys(state.likes),
				photoSources: state.folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
					id: f.id,
					name: f.name,
					kind: f.kind,
					...f.photoCount != null ? { photoCount: f.photoCount } : {},
					...f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}
				})),
				photoMeta: loadDurablePhotosSync()?.meta,
				photoLikes: loadDurablePhotosSync()?.likes,
				tags: state.tags,
				categories: state.categories,
				progress: state.progress,
				history: state.history,
				feedback: exportFeedback(),
				follows: state.follows,
				notices: state.notices,
				sourceCompanions: {
					photoNames: useSourceAssets.getState().photos.map((asset) => asset.path),
					shortcutNames: useSourceAssets.getState().shortcuts.map((file) => file.name)
				}
			},
			hub
		};
		const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = `reelcase-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};
	const tagLocalVideoFrames = async () => {
		const candidates = videos.filter((video) => !video.remote && !metadataProvenance[video.id]?.lockedFields?.includes("tags") && !(tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).slice(0, 12);
		if (!candidates.length) {
			setVideoVisionNote("No eligible local video frames are ready. Open a few local cards first so their cached frame artwork can warm.");
			return;
		}
		setVideoVisionBusy(true);
		setVideoVisionNote(`Warming local video frames · 0/${candidates.length}`);
		for (const video of candidates) useThumbs.getState().request(video);
		await new Promise((resolve) => window.setTimeout(resolve, 1200));
		const thumbs = useThumbs.getState().byId;
		const ready = candidates.filter((video) => Boolean(thumbs[video.id]));
		if (!ready.length) {
			setVideoVisionBusy(false);
			setVideoVisionNote("Frames are still warming. Try again in a moment; this beta never uploads local video.");
			return;
		}
		try {
			const labels = await classifyImagesLocally(ready.map((video) => thumbs[video.id]), (done, total) => setVideoVisionNote(`Classifying local video frames · ${done}/${total}`));
			const rows = ready.map((video, index) => ({
				videoId: video.id,
				name: video.name,
				labels: labels[index] ?? [],
				suggestions: (labels[index] ?? []).map((item) => `vision-${item.label}`)
			}));
			setVideoVisionRows(rows);
			setSelectedVideoVision(Object.fromEntries(rows.flatMap((row) => row.suggestions.map((tag) => [`${row.videoId}:${tag}`, true]))));
			const suggested = rows.filter((row) => row.suggestions.length > 0).length;
			setVideoVisionNote(`${suggested} local frame result${suggested === 1 ? "" : "s"} ready for review. Nothing is saved until you apply the selected labels.`);
		} catch {
			setVideoVisionNote("The local vision model could not start. File data stayed on this device; filename tags are still available.");
		} finally {
			setVideoVisionBusy(false);
		}
	};
	const applyVideoVision = () => {
		let changedFiles = 0;
		let addedTags = 0;
		for (const row of videoVisionRows) {
			const selectedTags = row.suggestions.filter((tag) => selectedVideoVision[`${row.videoId}:${tag}`]);
			if (!selectedTags.length) continue;
			const added = applyReviewedTags(row.videoId, selectedTags, "local-vision");
			if (added) {
				changedFiles += 1;
				addedTags += added;
			}
		}
		setSelectedVideoVision({});
		setVideoVisionNote(changedFiles ? `Saved ${addedTags} reviewed vision tag${addedTags === 1 ? "" : "s"} on ${changedFiles} video${changedFiles === 1 ? "" : "s"}. Manual tag locks and existing tags were preserved.` : "No new labels were saved. They may already exist, or the selected videos now have manual tag locks.");
	};
	const inspectWithCompanion = async () => {
		if (!companionInspectionCandidates.length) {
			setCompanionInspectionNote("No catalog entries have an approved full filesystem path yet. Browser-picked files keep opaque handles by design.");
			return;
		}
		setCompanionInspectionBusy(true);
		setCompanionInspectionNote(`Inspecting ${companionInspectionCandidates.length} local file${companionInspectionCandidates.length === 1 ? "" : "s"}…`);
		const result = await companionInspectMedia(companionInspectionCandidates.map((video) => video.path));
		const byPath = new Map(companionInspectionCandidates.map((video) => [video.path, video]));
		const rows = result.entries.flatMap((inspection) => {
			const video = byPath.get(inspection.requested);
			return video ? [{
				videoId: video.id,
				name: video.name,
				inspection,
				suggestions: companionSuggestions(inspection)
			}] : [];
		});
		setCompanionInspectionRows(rows);
		setSelectedCompanionInspections(Object.fromEntries(rows.filter((row) => row.inspection.inspected && row.suggestions.length > 0).map((row) => [row.videoId, true])));
		const inspected = rows.filter((row) => row.inspection.inspected).length;
		const unavailable = rows.length - inspected;
		setCompanionInspectionNote(result.ok ? `${inspected} metadata result${inspected === 1 ? "" : "s"} ready for review${unavailable ? ` · ${unavailable} could not be inspected` : ""}. Nothing is saved until you apply selected suggestions.` : result.error ?? "Companion inspection could not start.");
		setCompanionInspectionBusy(false);
	};
	const applyCompanionInspection = () => {
		const selected = companionInspectionRows.filter((row) => selectedCompanionInspections[row.videoId]);
		let changedFiles = 0;
		let addedTags = 0;
		for (const row of selected) {
			const added = applyCompanionTags(row.videoId, row.suggestions);
			if (added) {
				changedFiles += 1;
				addedTags += added;
			}
		}
		setSelectedCompanionInspections({});
		setCompanionInspectionNote(changedFiles ? `Saved ${addedTags} reviewed Companion tag${addedTags === 1 ? "" : "s"} on ${changedFiles} file${changedFiles === 1 ? "" : "s"}. Manual tag locks and existing tags were preserved.` : "No new suggestions were saved. They may already exist, or the selected files have manual tag locks.");
	};
	const downloadExport = (body, filename, type) => {
		const url = URL.createObjectURL(new Blob([body], { type }));
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	};
	const exportChannels = () => {
		const follows = useLibrary.getState().follows.map((channel) => ({
			service: channel.kind,
			channel: channel.title,
			handle: channel.handle,
			channelId: channel.channelId ?? "",
			live: Boolean(channel.live)
		}));
		downloadExport(JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			channels: follows
		}, null, 2), `reelcase-channels-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, "application/json");
	};
	const exportCatalogCsv = () => {
		const state = useLibrary.getState();
		const quote = (value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
		const rows = [[
			"title",
			"source",
			"format",
			"tags",
			"category",
			"favorite",
			"added"
		], ...state.videos.map((video) => [
			video.name,
			state.folders.find((folder) => folder.id === video.folderId)?.name ?? video.remote?.channelName ?? "",
			video.extension,
			(state.tags[video.id] ?? []).join(" | "),
			state.categories[video.id] ?? "",
			Boolean(state.favorites[video.id]),
			new Date(video.addedAt).toISOString()
		])];
		downloadExport(rows.map((row) => row.map(quote).join(",")).join("\n"), `reelcase-catalog-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, "text/csv");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Library control",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" }),
		title: "Settings & local export",
		copy: "Your Realhub library stays in this browser. Export a portable metadata backup whenever you need it.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullSettingsPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrichmentStatus, {}),
			!auditReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				role: "status",
				children: "Updating catalog diagnostics in the background… Pull and performance controls are ready."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Video entries",
						value: useLibrary((s) => s.videos.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved sources · all networks",
						value: useLibrary((s) => s.follows.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved hub items",
						value: hub.prints.length + hub.games.length
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				hidden: !auditReady,
				children: [
					unavailableVideoCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-lg border border-danger/40 bg-elevated p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium text-fg",
							children: [
								"Playback health queue · ",
								unavailableVideoCount,
								" hidden"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-5 text-muted",
							children: "These catalog entries were hidden after a browser file-permission or decode failure. Reconnect the source folder from the playback message to rebuild its live file handles."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4 rounded-lg border border-border bg-elevated p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
								className: "cursor-pointer text-sm font-medium text-fg",
								children: ["Hidden titles · ", hiddenTitles.length]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Hidden videos and image cards stay out of recommendations, search, and Watch Room. Your ratings and history remain saved."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 max-h-64 space-y-2 overflow-y-auto",
								children: hiddenTitles.length ? hiddenTitles.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 rounded-md bg-bg/50 px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 truncate text-sm text-fg",
										children: item.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => unhideVideo(item.id),
										children: "Restore"
									})]
								}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Nothing hidden yet."
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Smart local tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Tag by name, date, and file type."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm text-muted",
								children: "Adds private, explainable tags such as year-2026, month-september, type-mp4, and meaningful words from the filename. Existing manual tags are preserved; nothing is uploaded."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs text-accent",
								children: [
									smartTagStatus.tagged.toLocaleString(),
									" of ",
									smartTagStatus.local.toLocaleString(),
									" local files ready · ",
									smartTagStatus.waiting ? `${smartTagStatus.waiting.toLocaleString()} can still be enriched` : "coverage is current"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "mt-4",
								size: "sm",
								variant: "secondary",
								disabled: !smartTagStatus.local || smartTagsBusy,
								onClick: runSmartTags,
								children: [" ", smartTagsBusy ? "Smart tags queued…" : smartTagStatus.waiting ? "Apply smart tags to remaining files" : "Recheck smart-tag coverage"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-label": "YouTube tag enrichment",
						className: "rounded-lg border border-border bg-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-widest text-accent uppercase",
								children: "YouTube video tags & descriptions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6 text-muted",
								children: "Pull creator-supplied video tags and full descriptions directly from YouTube, five videos at a time. Hashtags, chapter phrases and relevant keywords improve search and recommendations. Public metadata may be unavailable for restricted videos. No sign-in or video download is needed for public metadata."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeTagsControl, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-5 text-muted",
									children: "Already saved metadata upgrades in idle batches. Recheck cached tags uses no network requests. Manual edits and locks stay protected; repair waits while search or a viewer is active."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-3",
									size: "sm",
									variant: "secondary",
									onClick: () => {
										repairCachedMetadata();
										setServiceNote("YouTube tag repair queued. Follow Cached provider tags below; pause or resume background work while you browse.");
									},
									children: "Improve YouTube tags"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Metadata tail coverage"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Finish cached catalog metadata in small batches."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
								children: "Uses already-cached provider titles, descriptions, channels, and local filenames. One pass scans in idle slices and saves at most 48 unlocked, untagged titles; it does not make a network request, inspect a media file, or replace a manual tag choice."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
								children: metadataTailCoverage.length ? metadataTailCoverage.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-sm bg-bg/45 p-3 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-fg",
										children: metadataSourceLabel(row.source)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-muted",
										children: [
											row.tagged.toLocaleString(),
											" tagged · ",
											row.waiting.toLocaleString(),
											" waiting · ",
											row.locked ? `${row.locked.toLocaleString()} locked` : "no locked gaps"
										]
									})]
								}, row.source)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Add a local folder or provider channel to measure coverage."
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: !auditReady || !metadataTailWaiting || metadataTailBusy,
									onClick: runMetadataTail,
									children: metadataTailBusy ? "Batch queued…" : metadataTailWaiting ? `Enrich next ${Math.min(48, metadataTailWaiting)}` : "Coverage current"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-accent",
									children: [
										metadataTailWaiting.toLocaleString(),
										" unlocked title",
										metadataTailWaiting === 1 ? "" : "s",
										" waiting"
									]
								})]
							}),
							metadataTailNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs leading-5 text-accent",
								role: "status",
								children: ["Latest batch · ", metadataTailNote]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"data-creator-coverage": true,
						"data-creator-coverage-pending": !auditReady,
						"aria-busy": !auditReady || creatorCoverageBusy,
						className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Creator coverage repair"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Recover only exact creator identities."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
								children: "Matches a missing YouTube or Twitch display name only when the cached card and one of your saved follows share the exact public channel ID or saved source ID. It never guesses from titles, filenames, or loose handles; no provider request is made."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-bg/45 p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-fg",
											children: "Tracked cards"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [creatorCoverage.total.toLocaleString(), " YouTube/Twitch"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-bg/45 p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-fg",
											children: "Already named"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [creatorCoverage.present.toLocaleString(), " verified names"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-bg/45 p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-fg",
											children: "Exact repairs"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [creatorCoverage.repairable.toLocaleString(), " safe matches"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-bg/45 p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-fg",
											children: "Needs evidence"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [
												creatorCoverage.unresolved.toLocaleString(),
												" unmatched · ",
												creatorCoverage.ambiguous.length.toLocaleString(),
												" ambiguous"
											]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: creatorCoverageBusy || !auditReady || !creatorCoverage.repairable,
									onClick: () => void runCreatorCoverageRepair(),
									children: creatorCoverageBusy ? "Saving creator names…" : creatorCoverage.repairable ? `Repair next ${Math.min(48, creatorCoverage.repairable)}` : "Coverage current"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-accent",
									children: [
										creatorCoverage.repairable.toLocaleString(),
										" exact match",
										creatorCoverage.repairable === 1 ? "" : "es",
										" waiting"
									]
								})]
							}),
							creatorCoverageNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs leading-5 text-accent",
								role: "status",
								children: ["Latest repair · ", creatorCoverageNote]
							}),
							creatorCoverage.ambiguous.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-md border border-warning/35 bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: "Ambiguous exact-ID matches need review"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-5 text-muted",
										children: "These cards match more than one saved display name. Nothing was written; open a card to inspect its provider details before changing follow data."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid gap-2",
										children: creatorCoverage.ambiguous.slice(0, 12).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-3 rounded-sm bg-elevated p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "min-w-0 flex-1 truncate text-xs text-fg",
												children: [row.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-muted",
													children: [" · ", row.candidates.join(" / ")]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => openPreview(row.id),
												children: "Review card"
											})]
										}, row.id))
									}),
									creatorCoverage.ambiguous.length > 12 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs text-muted",
										children: [
											"Showing 12 of ",
											creatorCoverage.ambiguous.length.toLocaleString(),
											" ambiguous cards."
										]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Optional Companion inspection"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Review embedded local media tags."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
								children: "The local Companion reads technical details and a small embedded-tag set with ffprobe. It accepts only files inside its approved roots, processes at most 12 files, and never uploads media bytes or saves a suggestion automatically."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs text-accent",
								children: [
									companionInspectionCandidates.length,
									" eligible full-path file",
									companionInspectionCandidates.length === 1 ? "" : "s",
									" in the next bounded batch · browser-picked opaque file handles stay private and are skipped"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								size: "sm",
								variant: "secondary",
								disabled: companionInspectionBusy || !companionInspectionCandidates.length,
								onClick: () => void inspectWithCompanion(),
								children: companionInspectionBusy ? "Inspecting local metadata…" : "Inspect up to 12 local files"
							}),
							companionInspectionNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs leading-5 text-accent",
								children: ["Latest inspection · ", companionInspectionNote]
							}),
							companionInspectionRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-md border border-border bg-bg/45 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: "Review suggestions before saving"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Embedded titles and comments stay preview-only; only the checked, compact search tags below can be saved."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										disabled: !companionInspectionRows.some((row) => selectedCompanionInspections[row.videoId]),
										onClick: applyCompanionInspection,
										children: "Apply selected suggestions"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid gap-2",
									children: companionInspectionRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex gap-3 rounded-md border border-border bg-elevated p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "mt-1 size-4 accent-accent",
											type: "checkbox",
											checked: Boolean(selectedCompanionInspections[row.videoId]),
											disabled: !row.inspection.inspected || !row.suggestions.length,
											onChange: (event) => setSelectedCompanionInspections((current) => ({
												...current,
												[row.videoId]: event.target.checked
											}))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block truncate text-sm font-medium text-fg",
												children: row.name
											}), row.inspection.inspected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-1 block text-xs text-muted",
												children: [
													row.inspection.tags?.title ? `Embedded title · ${row.inspection.tags.title}` : "No embedded title",
													" · ",
													companionTechnicalSummary(row.inspection),
													row.inspection.tags?.comment ? " · embedded comment present" : ""
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2 block text-xs text-accent",
												children: row.suggestions.length ? row.suggestions.map((tag) => `#${tag}`).join(" · ") : "No safe search-tag suggestion"
											})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-1 block text-xs text-danger",
												children: ["Not inspected · ", row.inspection.reason ?? "No readable metadata"]
											})]
										})]
									}, row.videoId))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Beta · local video vision"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Review local video labels from a cached frame."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm text-muted",
								children: "Uses the same on-device image model as Photos on one cached local thumbnail per video. It runs only when you start it, uses a bounded 12-video batch, and keeps frames and labels on this device until you explicitly apply the labels you want."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs text-accent",
								children: [
									vision.processed.toLocaleString(),
									" processed · ",
									vision.waiting.toLocaleString(),
									" waiting · ready when local frame artwork is cached"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								size: "sm",
								variant: "secondary",
								disabled: videoVisionBusy || !auditReady || !vision.eligible,
								onClick: () => void tagLocalVideoFrames(),
								children: videoVisionBusy ? videoVisionNote || "Preparing local frames…" : "Prepare next 12 local video frames"
							}),
							videoVisionNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs leading-5 text-accent",
								children: ["Latest output · ", videoVisionNote]
							}),
							videoVisionRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-md border border-border bg-bg/45 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: "Review vision labels before saving"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Each result is local-only. Check only the labels you want to add; unselected labels are discarded when this review changes."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										disabled: !videoVisionRows.some((row) => row.suggestions.some((tag) => selectedVideoVision[`${row.videoId}:${tag}`])),
										onClick: applyVideoVision,
										children: "Apply selected labels"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid gap-2",
									children: videoVisionRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md border border-border bg-elevated p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium text-fg",
											children: row.name
										}), row.labels.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 flex flex-wrap gap-2",
											children: row.labels.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-2 rounded-sm bg-bg/55 px-2 py-1 text-xs text-fg",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "size-3.5 accent-accent",
													type: "checkbox",
													checked: Boolean(selectedVideoVision[`${row.videoId}:vision-${item.label}`]),
													onChange: (event) => setSelectedVideoVision((current) => ({
														...current,
														[`${row.videoId}:vision-${item.label}`]: event.target.checked
													}))
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													"#",
													`vision-${item.label}`,
													" · ",
													Math.round(item.score * 100),
													"%"
												] })]
											}, `${row.videoId}:${item.label}`))
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-xs text-muted",
											children: "No confident local label suggested."
										})]
									}, row.videoId))
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-4 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-fg",
					children: "Export local metadata"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Downloads your catalog, favorites, likes, tags, watch history, follows, notifications, print list, and game list. Your original media and any browser file permissions remain private on this device."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: exportLocal,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Full backup"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: exportCatalogCsv,
							children: "Catalog CSV"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: exportChannels,
							children: "YouTube + Twitch"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Library pack · local folder"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Export / import follows, history, links & marks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: [
							"Downloads a zip that matches ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-fg",
								children: "public/import-templates/"
							}),
							": follows, watch history, creator collections, saved video URLs, continue-watching pointers, favorites/likes, Photos sources & likes, Adult marks, ratings & tag hearts, and stats. Import merges into durable IndexedDB stores and does not wipe unrelated data unless you confirm replace-follows."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: async () => {
									await Promise.all([
										hydrateGuidePreset(),
										hydrateFilmReviews(),
										hydrateAnimeReviews(),
										hydrateProviderViewing()
									]);
									const state = useLibrary.getState();
									downloadLibraryPackZip({
										follows: state.follows,
										history: state.history,
										links: linksFromHistoryAndResume(state.history, state.resumeProgress),
										favorites: Object.keys(state.favorites),
										likes: Object.keys(state.likes),
										viewCounts: state.viewCounts,
										cameCounts: state.cameCounts,
										progress: state.progress,
										resumeProgress: state.resumeProgress,
										adultVideos: state.videos,
										folders: state.folders,
										tags: state.tags,
										photoSources: state.folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
											id: f.id,
											name: f.name,
											kind: f.kind,
											...f.photoCount != null ? { photoCount: f.photoCount } : {},
											...f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}
										})),
										photoMeta: loadDurablePhotosSync()?.meta,
										photoLikes: loadDurablePhotosSync()?.likes
									});
									setServiceNote("Library pack zip downloaded. Unzip to edit offline, or keep as backup.");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Export library pack"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => {
									const input = document.createElement("input");
									input.type = "file";
									input.accept = ".zip,.json,.csv,application/zip,application/json,text/csv";
									input.onchange = () => {
										const file = input.files?.[0];
										if (!file) return;
										if (!window.confirm("Import this library pack into Realhub?\n\nData merges into durable local stores. Unrelated data is kept.")) {
											setServiceNote("Import cancelled.");
											return;
										}
										const mode = window.confirm("Also REPLACE all YouTube/Twitch follows with the file?\n\nOK = replace follows\nCancel = merge follows (recommended)") ? "replace-follows" : "merge";
										importLibraryPackZip(file, {
											getFollows: () => useLibrary.getState().follows,
											setFollows: (follows) => useLibrary.setState({ follows }),
											getHistory: () => useLibrary.getState().history,
											setHistory: (history) => useLibrary.setState({ history }),
											getViewCounts: () => useLibrary.getState().viewCounts,
											getCameCounts: () => useLibrary.getState().cameCounts,
											setMarks: (viewCounts, cameCounts) => useLibrary.setState({
												viewCounts,
												cameCounts
											}),
											getFavorites: () => Object.keys(useLibrary.getState().favorites),
											getLikes: () => Object.keys(useLibrary.getState().likes),
											setShelves: (favorites, likes) => useLibrary.setState({
												favorites: Object.fromEntries(favorites.map((id) => [id, true])),
												likes: Object.fromEntries(likes.map((id) => [id, true]))
											}),
											getPhotoSources: () => useLibrary.getState().folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
												id: f.id,
												name: f.name,
												kind: f.kind,
												photoCount: f.photoCount,
												lastCheckedAt: f.lastCheckedAt
											})),
											setPhotoSources: (sources) => useLibrary.setState((s) => {
												let folders = s.folders;
												for (const source of sources) if (folders.some((f) => f.id === source.id)) folders = folders.map((f) => f.id === source.id ? {
													...f,
													name: source.name,
													kind: source.kind,
													photoCount: source.photoCount ?? f.photoCount,
													lastCheckedAt: source.lastCheckedAt ?? f.lastCheckedAt
												} : f);
												else folders = [...folders, {
													id: source.id,
													name: source.name,
													kind: source.kind,
													videoCount: 0,
													photoCount: source.photoCount ?? 0,
													lastCheckedAt: source.lastCheckedAt,
													needsPermission: true,
													health: "permission-needed"
												}];
												return { folders };
											}),
											getProgress: () => useLibrary.getState().progress,
											getResumeProgress: () => useLibrary.getState().resumeProgress,
											setResume: (progress, resumeProgress) => useLibrary.setState({
												progress,
												resumeProgress
											}),
											getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
											setLinks: () => {}
										}, mode).then((result) => {
											setServiceNote(`Pack import · +${result.followsAdded} follows · +${result.collectionsMerged} creator collections · +${result.historyMerged} history · +${result.linksMerged} links${result.photosMerged ? ` · photos ${result.photosMerged}` : ""}${result.feedbackMerged ? " · ratings/hearts merged" : ""}${result.warnings.length ? ` · ${result.warnings[0]}` : ""}`);
										}).catch((error) => {
											setServiceNote(error instanceof Error ? error.message : "Library pack import failed.");
										});
									};
									input.click();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " Import library pack"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: async () => {
									await Promise.all([
										hydrateGuidePreset(),
										hydrateFilmReviews(),
										hydrateAnimeReviews(),
										hydrateProviderViewing()
									]);
									const state = useLibrary.getState();
									const files = buildLibraryPackFiles({
										follows: state.follows,
										history: state.history,
										links: linksFromHistoryAndResume(state.history, state.resumeProgress),
										favorites: Object.keys(state.favorites),
										likes: Object.keys(state.likes),
										viewCounts: state.viewCounts,
										cameCounts: state.cameCounts,
										progress: state.progress,
										resumeProgress: state.resumeProgress,
										adultVideos: state.videos,
										folders: state.folders,
										tags: state.tags,
										photoSources: state.folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
											id: f.id,
											name: f.name,
											kind: f.kind,
											...f.photoCount != null ? { photoCount: f.photoCount } : {},
											...f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}
										})),
										photoMeta: loadDurablePhotosSync()?.meta,
										photoLikes: loadDurablePhotosSync()?.likes
									});
									companionExportLibraryPack(files).then((result) => {
										setServiceNote(result.ok ? `Wrote library pack to companion folder · ${result.written?.length ?? 0} files${result.root ? ` · ${result.root}` : ""}` : result.error || "Companion pack export failed.");
									});
								},
								children: "Save pack to companion folder"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									companionImportLibraryPack().then((pack) => {
										if (!pack.ok || !pack.files || !Object.keys(pack.files).length) {
											setServiceNote(pack.error || "No library pack files in the companion folder.");
											return;
										}
										if (!window.confirm("Import the companion-folder library pack into Realhub?\n\nData merges into durable local stores.")) {
											setServiceNote("Companion import cancelled.");
											return;
										}
										const mode = window.confirm("Also REPLACE all YouTube/Twitch follows with the folder pack?\n\nOK = replace follows\nCancel = merge follows (recommended)") ? "replace-follows" : "merge";
										try {
											const result = applyLibraryPackFiles(pack.files, {
												getFollows: () => useLibrary.getState().follows,
												setFollows: (follows) => useLibrary.setState({ follows }),
												getHistory: () => useLibrary.getState().history,
												setHistory: (history) => useLibrary.setState({ history }),
												getViewCounts: () => useLibrary.getState().viewCounts,
												getCameCounts: () => useLibrary.getState().cameCounts,
												setMarks: (viewCounts, cameCounts) => useLibrary.setState({
													viewCounts,
													cameCounts
												}),
												getFavorites: () => Object.keys(useLibrary.getState().favorites),
												getLikes: () => Object.keys(useLibrary.getState().likes),
												setShelves: (favorites, likes) => useLibrary.setState({
													favorites: Object.fromEntries(favorites.map((id) => [id, true])),
													likes: Object.fromEntries(likes.map((id) => [id, true]))
												}),
												getPhotoSources: () => useLibrary.getState().folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
													id: f.id,
													name: f.name,
													kind: f.kind,
													photoCount: f.photoCount,
													lastCheckedAt: f.lastCheckedAt
												})),
												setPhotoSources: (sources) => useLibrary.setState((s) => {
													let folders = s.folders;
													for (const source of sources) if (folders.some((f) => f.id === source.id)) folders = folders.map((f) => f.id === source.id ? {
														...f,
														name: source.name,
														kind: source.kind,
														photoCount: source.photoCount ?? f.photoCount,
														lastCheckedAt: source.lastCheckedAt ?? f.lastCheckedAt
													} : f);
													else folders = [...folders, {
														id: source.id,
														name: source.name,
														kind: source.kind,
														videoCount: 0,
														photoCount: source.photoCount ?? 0,
														lastCheckedAt: source.lastCheckedAt,
														needsPermission: true,
														health: "permission-needed"
													}];
													return { folders };
												}),
												getProgress: () => useLibrary.getState().progress,
												getResumeProgress: () => useLibrary.getState().resumeProgress,
												setResume: (progress, resumeProgress) => useLibrary.setState({
													progress,
													resumeProgress
												}),
												getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
												setLinks: () => {}
											}, mode);
											setServiceNote(`Companion pack import · +${result.followsAdded} follows · +${result.historyMerged} history · +${result.linksMerged} links${result.photosMerged ? ` · photos ${result.photosMerged}` : ""}`);
										} catch (error) {
											setServiceNote(error instanceof Error ? error.message : "Companion pack import failed.");
										}
									});
								},
								children: "Load pack from companion folder"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "inline-flex h-8 items-center rounded-md bg-bg/45 px-3 text-xs text-muted shadow-border hover:text-fg",
								href: "/import-templates/README.md",
								target: "_blank",
								rel: "noreferrer",
								children: "Open templates"
							})
						]
					}),
					serviceNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-accent",
						children: serviceNote
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Connected services"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Independent caches, on your schedule."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Twitch and YouTube refresh together from your saved follows. Photo imports, Roku discovery, and Spotify remain independently local and refresh only when you ask."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5",
						children: [
							{
								name: "YouTube",
								detail: "Saved channels",
								checked: remoteCheckedAt,
								action: async () => {
									const result = await refreshFollows("youtube", { catalog: true });
									const status = useLibrary.getState().remoteRefreshStatus;
									setServiceNote(status?.failed === status?.checked ? "YouTube refresh failed. Check channel health." : `Refreshed YouTube catalog · ${result.newVideos.length} videos added from ${status?.refreshed ?? 0} channels.`);
								}
							},
							{
								name: "Twitch",
								detail: "Live + VOD cache",
								checked: remoteCheckedAt,
								action: async () => {
									const result = await refreshFollows("twitch");
									setServiceNote(`Refreshed Twitch catalog · ${result.newVideos.length} new videos from ${result.pull?.done ?? 0} channels.`);
								}
							},
							{
								name: "Photos",
								detail: `${folders.filter((folder) => folder.photoCount).length} source folders`,
								checked: Math.max(0, ...folders.map((folder) => folder.lastCheckedAt ?? 0)),
								action: async () => {
									const sources = folders.filter((folder) => folder.photoCount && (folder.kind === "directory" || folder.kind === "files"));
									const counts = await Promise.all(sources.map((folder) => refreshSourcePhotos(folder.id)));
									setServiceNote(`Refreshed local photo sources · ${counts.reduce((sum, count) => sum + count, 0)} photos found.`);
								}
							},
							{
								name: "Roku",
								detail: "Companion-assisted",
								checked: 0,
								action: async () => {
									try {
										const data = await (await fetch("http://127.0.0.1:43123/roku/discover")).json();
										setServiceNote(`Roku refresh complete · ${(data.devices ?? []).length} device(s) found.`);
									} catch {
										setServiceNote("Roku refresh needs the local Realhub Companion running.");
									}
								}
							},
							{
								name: "Spotify",
								detail: "Saved music shortcuts",
								checked: 0,
								action: async () => {
									setServiceNote("Spotify shortcuts are local and ready. Open Spotify from its library section to refresh provider content.");
								}
							}
						].map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-bg/45 p-3 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: service.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: service.detail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-subtle",
									children: service.checked ? `Last refreshed ${new Date(service.checked).toLocaleTimeString([], {
										hour: "numeric",
										minute: "2-digit"
									})}` : "Not refreshed this session"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "mt-3",
									onClick: () => void service.action(),
									children: "Refresh"
								})
							]
						}, service.name))
					}),
					serviceNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-accent",
						children: serviceNote
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Device & performance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "The controls that change how Realhub runs and fits your screen."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `rounded-lg bg-elevated p-5 shadow-border ${debugEnabled ? "sm:col-span-2 xl:col-span-4" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Diagnostics"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Keep a local, opt-in status panel for source, cache, and companion troubleshooting. It is off by default and sends nothing away."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
									className: "mt-3 space-y-1 text-xs leading-5 text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-accent",
												children: "1."
											}),
											" In the main Realhub folder, double-click ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-fg",
												children: "Start-Realhub-Companion.cmd"
											}),
											"."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-accent",
											children: "2."
										}), " Leave the small Companion window open until it says it is listening."] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-accent",
											children: "3."
										}), " Enable diagnostics, select Check companion, then open Games to load approved shortcuts."] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-5 text-subtle",
									children: "The companion is optional. It only runs on this computer and is needed for desktop shortcut launching, source checks, and TV discovery—not for browsing your media library."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: debugEnabled ? "default" : "secondary",
									className: "mt-4",
									onClick: () => {
										const next = !debugEnabled;
										setDebugEnabled(next);
										localStorage.setItem("reelcase.debug-panel", String(next));
										window.dispatchEvent(new Event("reelcase:diagnostics-settings"));
										if (!next) setDebugReport("");
									},
									children: debugEnabled ? "Disable diagnostics" : "Enable diagnostics"
								}),
								debugEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceScorecard, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "mt-2",
										onClick: () => void (async () => {
											try {
												const data = await companionHealth(true);
												if (!data?.ok) throw new Error("offline");
												setDebugReport(`Companion v${data.version ?? "?"} · ${data.roots ?? 0} approved roots · Desktop ${data.desktopEnabled ? "ready" : "not available"}`);
											} catch {
												setDebugReport("Companion is not running or is unavailable to this browser.");
											}
										})(),
										children: "Check companion"
									}), debugReport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-accent",
										children: debugReport
									})]
								})] }),
								debugEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeFirstClickDiagnostic, {})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "App zoom"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Scale the entire library interface for this browser. Your choice is remembered everywhere in Realhub."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										80,
										90,
										100,
										110,
										125
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: zoom === value ? "default" : "secondary",
										onClick: () => setGlobalZoom(value),
										children: [value, "%"]
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Day & night"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Choose the palette that is easiest on your eyes. It applies to every Realhub page and stays on this device."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: theme === "night" ? "default" : "secondary",
										onClick: () => setColorTheme("night"),
										children: "Night mode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: theme === "day" ? "default" : "secondary",
										onClick: () => setColorTheme("day"),
										children: "Day mode"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Live layout"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Choose a larger card layout or fit more live channels on screen. This changes the Live page without adding heavier media loads."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										3,
										4,
										6
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: liveDensity === value ? "default" : "secondary",
										onClick: () => {
											setLiveDensity(value);
											localStorage.setItem("reelcase.live-columns", String(value));
										},
										children: value === 3 ? "Large · 3 columns" : `${value} columns`
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Home performance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Choose how many cards each Home rail mounts. Lower counts keep huge folders smooth; the complete catalog remains searchable."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										8,
										16,
										32,
										48
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: railLimit === value ? "default" : "secondary",
										onClick: () => {
											setRailLimit(value);
											localStorage.setItem("reelcase.home-rail-limit", String(value));
											window.dispatchEvent(new Event("reelcase:render-settings"));
										},
										children: [value, " per shelf"]
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: sourceCacheFirst ? "default" : "secondary",
									className: "mt-3",
									onClick: () => {
										const next = !sourceCacheFirst;
										setSourceCacheFirst(next);
										localStorage.setItem("reelcase.source-cache-first", String(next));
									},
									children: sourceCacheFirst ? "Use cached sources first" : "Rescan sources on launch"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-subtle",
									children: "Cached source catalogs load immediately. Use a source refresh when you want to check the disk again."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Adult performance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Tune Adult rails and one catalog request separately. Smaller choices reduce decoding and keep filtering responsive."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-xs text-muted",
									children: "Cards per Adult rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: [
										16,
										24,
										48,
										72
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: adultRailLimit === value ? "default" : "secondary",
										onClick: () => {
											setAdultRailLimit(value);
											localStorage.setItem("reelcase.adult-rail-limit", String(value));
											window.dispatchEvent(new Event("reelcase:adult-render-settings"));
										},
										children: [value, " cards"]
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-xs text-muted",
									children: "Batch limits and automatic pacing are in Pull management above."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border sm:col-span-2",
							"data-performance-profile": true,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Performance profile"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Low memory keeps less artwork in RAM and starts less background work. Adaptive applies these limits automatically on smaller devices or with Save Data enabled."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									role: "group",
									"aria-label": "Performance profile",
									children: [["adaptive", "Adaptive"], ["low-memory", "Low memory"]].map(([mode, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										"aria-pressed": performanceMode === mode,
										variant: performanceMode === mode ? "default" : "secondary",
										onClick: () => {
											setPerformanceModeChoice(mode);
											setPerformanceMode(mode);
										},
										children: label
									}, mode))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 text-sm text-fg",
									role: "status",
									"aria-label": "Effective performance limits",
									children: [
										performanceBudget.lowMemory ? "Low memory active" : "Standard budgets active",
										performanceBudget.reason === "device" ? " · device capability or Save Data" : "",
										" · ",
										performanceBudget.artworkBytes / 1048576,
										" MiB artwork cache · up to ",
										performanceBudget.thumbnailWorkers,
										" thumbnail ",
										performanceBudget.thumbnailWorkers === 1 ? "worker" : "workers",
										" · ",
										performanceBudget.imageRequests,
										" image requests · ",
										performanceBudget.gridMountCap,
										" mounted cards per grid"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs leading-5 text-muted",
									children: [performanceBudget.lowMemory ? "Grids load 24 titles at a time, rails keep visible cards, and new photo scans use up to 2 workers. These ceilings apply over the individual settings below. " : "", "Artwork evicted from RAM can reopen from disk. Your video catalog and saved worker choices stay intact. Running requests finish within their previous budget."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Grid memory budget"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets the poster grid page size. Only a window of those cards stays mounted. Low memory caps pages at 24; your selection returns when standard budgets are active."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										24,
										48,
										96,
										144
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: gridPageSize === value ? "default" : "secondary",
										onClick: () => {
											setGridPageSize(value);
											localStorage.setItem("reelcase.grid-page-size", String(value));
											window.dispatchEvent(new Event("reelcase:render-settings"));
										},
										children: [value, " cards"]
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Artwork worker budget"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Controls concurrent local thumbnail extraction. Adaptive uses device cores, available memory, and foreground input pressure."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										[0, "Adaptive"],
										[1, "Text-first · 1"],
										[2, "Gentle · 2"],
										[3, "Balanced · 3"],
										[4, "Fast · 4"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: thumbnailWorkers === value ? "default" : "secondary",
										onClick: () => {
											setThumbnailWorkers(value);
											localStorage.setItem("reelcase.thumbnail-workers", String(value));
										},
										children: label
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: textFirstArtwork ? "default" : "secondary",
									className: "mt-4",
									onClick: () => setTextFirstArtwork(!textFirstArtwork),
									children: [" ", textFirstArtwork ? "Text-first provider rows on" : "Use text-first provider rows"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Photo scan workers"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets background folder workers for cached photo metadata. Adaptive protects browsing; use Fast when you want a newly added photo source ready sooner."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										[0, "Adaptive"],
										[2, "Gentle · 2"],
										[4, "Balanced · 4"],
										[6, "Fast · 6"],
										[8, "Max · 8"],
										[12, "Turbo · 12"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: photoWorkers === value ? "default" : "secondary",
										onClick: () => {
											setPhotoWorkers(value);
											localStorage.setItem("reelcase.photo-scan-workers", String(value));
										},
										children: label
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Player sound"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets the starting volume for local video and whether a newly opened player starts muted. Provider embeds keep their own service-level audio controls."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										25,
										50,
										70,
										85,
										100
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: defaultVolume === value ? "default" : "secondary",
										onClick: () => {
											setDefaultVolume(value);
											localStorage.setItem("reelcase.player-volume", String(value));
										},
										children: [value, "%"]
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-3",
									size: "sm",
									variant: startMuted ? "default" : "secondary",
									onClick: () => {
										const next = !startMuted;
										setStartMuted(next);
										localStorage.setItem("reelcase.player-start-muted", String(next));
									},
									children: startMuted ? "Start muted" : "Start with sound"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Twitch live & archive refresh"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Checks 12 rotating channels while this tab is visible, adding up to 100 recent VODs and 24 clips sampled across recent and older time ranges. Focused pulls continue through deeper VOD and clip history with saved cursors. Earlier items stay saved if a provider response is partial. Thirty seconds is the default."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										[15, "15 sec"],
										[30, "30 sec"],
										[60, "1 min"],
										[120, "2 min"],
										[300, "5 min"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: twitchRefreshSeconds === value ? "default" : "secondary",
										onClick: () => {
											setTwitchRefreshSeconds(value);
											localStorage.setItem("reelcase.twitch-refresh-seconds", String(value));
											window.dispatchEvent(new Event("reelcase:refresh-settings"));
										},
										children: label
									}, value))
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtworkAuditPanel, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Connections, privacy & guides"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Optional services and explanations stay separate from everyday library preferences."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-5" }),
							title: "Local edit workspace",
							copy: "The player has reliable native playback and metadata tools today. A non-destructive OpenShot-style timeline requires a dedicated browser media engine; keep it local-first and never upload media by default."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }),
							title: "AI recommendations, later",
							copy: "Your tags, likes, categories, history, and export file are the future recommendation signal. Add a server endpoint and explicit consent screen before any assistant can read it."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }),
							title: "AI tools directory",
							copy: "Prepare future connectors for recommendations, metadata cleanup, captioning, and watch-list suggestions. Keep every connection opt-in and scoped to only the library data you select."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" }),
							title: "Privacy defaults",
							copy: "Local cataloging, tags, ratings, and history stay on this device. Export is metadata-only; no source videos, print files, game files, or browser permissions are included."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" }),
							title: "How Realhub works",
							copy: "Folders and files are cataloged locally; channel follows use their public pages; Watch Room sends direct peer events; and external services open only when you choose them. See PROJECT_GUIDE.md and LAN_WATCH_ROOM.md in the repository for the complete maintainer guide."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlexaLightControl, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleYouTubeConnection, {})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Working preferences"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Every switch below works now, changes Realhub immediately, and is saved in this browser. Future ideas belong in the Mission plan—not in this control panel."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [Object.values(preferences).filter(Boolean).length, " enabled"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: Object.keys(PREFERENCE_GROUPS).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: preferenceGroup === group ? "default" : "secondary",
							onClick: () => setPreferenceGroup(group),
							children: [
								group,
								" · ",
								PREFERENCE_GROUPS[group].length
							]
						}, group))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: PREFERENCES.filter((item) => item.group === preferenceGroup).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !item.implemented,
							onClick: () => togglePreference(item.key),
							className: "flex min-h-16 items-center justify-between gap-4 rounded-md bg-bg/45 px-4 text-left shadow-border disabled:cursor-not-allowed disabled:opacity-60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium text-fg",
								children: item.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: item.detail
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `flex h-6 w-11 items-center rounded-full p-0.5 transition-[background-color] duration-150 ${item.implemented && preferences[item.key] ? "bg-accent justify-end" : "bg-surface justify-start"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-5 rounded-full ${item.implemented && preferences[item.key] ? "bg-accent-fg" : "bg-muted"}` })
							})]
						}, item.key))
					})
				]
			})
		]
	});
}
function AlexaLightControl() {
	const [scene, setScene] = (0, import_react.useState)("Movie night");
	const [saved, setSaved] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: "Alexa light scenes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Set a preferred scene locally, then ask Alexa to run that scene. Direct device control needs an authorized Alexa Smart Home skill, which is not connected here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					"Movie night",
					"Bright",
					"Warm",
					"Pause lights"
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: scene === item ? "default" : "secondary",
					onClick: () => setScene(item),
					children: item
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "mt-3",
				onClick: () => {
					localStorage.setItem("reelcase.alexa.scene", scene);
					setSaved(true);
				},
				children: "Save preferred scene"
			}),
			saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-accent",
				children: [
					"Saved. Say “Alexa, ",
					scene,
					".” after creating that scene in the Alexa app."
				]
			})
		]
	});
}
function GoogleYouTubeConnection() {
	const [clientId, setClientId] = (0, import_react.useState)("");
	const [token, setToken] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("Not connected");
	const videos = useLibrary((s) => s.videos);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	(0, import_react.useEffect)(() => {
		setClientId(localStorage.getItem("reelcase.google.client-id") ?? "");
		setToken(sessionStorage.getItem("reelcase.google.youtube-token") ?? "");
	}, []);
	const connect = () => {
		const id = clientId.trim();
		if (!id.endsWith(".apps.googleusercontent.com")) {
			setStatus("Enter the Google OAuth Client ID ending in .apps.googleusercontent.com.");
			return;
		}
		localStorage.setItem("reelcase.google.client-id", id);
		setStatus("Opening Google authorization…");
		const start = () => {
			const client = window.google?.accounts?.oauth2?.initTokenClient({
				client_id: id,
				scope: "https://www.googleapis.com/auth/youtube.readonly",
				callback: (response) => {
					if (response.access_token) {
						sessionStorage.setItem("reelcase.google.youtube-token", response.access_token);
						setToken(response.access_token);
						setStatus("Google connected for this browser session.");
					} else setStatus(`Google authorization failed${response.error ? `: ${response.error}` : "."}`);
				}
			});
			if (!client) {
				setStatus("Google authorization library did not load. Check the authorized JavaScript origin.");
				return;
			}
			client.requestAccessToken({ prompt: "consent" });
		};
		const existing = document.querySelector("script[data-reelcase-google=\"true\"]");
		if (existing && window.google) start();
		else {
			const script = existing ?? document.createElement("script");
			script.src = "https://accounts.google.com/gsi/client";
			script.async = true;
			script.dataset.reelcaseGoogle = "true";
			script.onload = start;
			script.onerror = () => setStatus("Google authorization library could not load.");
			if (!existing) document.head.appendChild(script);
		}
	};
	const importTags = async () => {
		if (!token) return;
		const items = videos.filter((video) => video.remote?.kind === "youtube" && video.remote.videoId).slice(0, 50);
		if (!items.length) {
			setStatus("No YouTube videos are available to enrich yet.");
			return;
		}
		setStatus("Importing available YouTube metadata…");
		try {
			const ids = items.map((video) => video.remote.videoId).join(",");
			const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(ids)}`, { headers: { Authorization: `Bearer ${token}` } });
			if (!response.ok) throw new Error("Google did not allow the metadata request.");
			const body = await response.json();
			const byId = new Map((body.items ?? []).map((item) => [item.id, item.snippet]));
			let changed = 0;
			for (const video of items) {
				const snippet = byId.get(video.remote.videoId);
				const imported = [...new Set([
					"youtube",
					snippet?.channelTitle ?? video.remote?.channelName ?? "",
					...snippet?.tags ?? []
				].map((tag) => tag.trim()).filter(Boolean))].slice(0, 30);
				if (imported.length) {
					setVideoTags(video.id, imported);
					changed += 1;
				}
			}
			setStatus(`Imported available tags for ${changed} YouTube title${changed === 1 ? "" : "s"}.`);
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "Could not import YouTube metadata.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: "Google & YouTube access"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Paste only the OAuth Client ID—never a secret. Google’s popup authorizes this browser session, then Realhub can read permitted YouTube metadata and available creator tags."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-3 list-decimal space-y-1 pl-5 text-xs leading-5 text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "In Google Cloud, create a project and enable YouTube Data API v3." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Create an OAuth Client ID for a Web application; do not create or paste a client secret." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Add this exact Authorized JavaScript origin:",
						" ",
						typeof window === "undefined" ? "your app origin" : window.location.origin,
						"."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Paste the Client ID here, select Connect Google, approve read-only YouTube access, then choose Import YouTube tags." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-3",
				value: clientId,
				onChange: (event) => setClientId(event.target.value),
				placeholder: "Google OAuth Client ID",
				"aria-label": "Google OAuth Client ID"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: connect,
						children: "Connect Google"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !token,
						onClick: () => void importTags(),
						children: "Import YouTube tags"
					}),
					token && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => {
							sessionStorage.removeItem("reelcase.google.youtube-token");
							setToken("");
							setStatus("Disconnected from this browser session.");
						},
						children: "Disconnect"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-accent",
				children: status
			})
		]
	});
}
//#endregion
export { SettingsSection };
