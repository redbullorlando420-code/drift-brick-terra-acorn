import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { F as RefreshCw, st as LoaderCircle, tn as Bot, y as Sparkles } from "../_libs/lucide-react.mjs";
import { bt as forEachCatalogSlice } from "./live-rooms-DInVyvi_.mjs";
import { G as bridgePolicy, K as bridgeText, Tr as publicVideoBoundary, U as bridgeFields, Ur as rejectionKey, W as bridgeKey, ka as videoBridgeSource, q as bridgeTopic, t as BRIDGE_SOURCES } from "./persist-D_pR3DU-.mjs";
import { $n as useLibrary, An as setRecommendationRejection, Et as measureInteraction, J as getRecommendationExposure, K as getRating, Kt as recommendationTopicIsLiked, P as getFeedbackSaveState, Y as getRecommendationRejections, _ as creatorIsFavorited, en as retryFeedbackSave, nt as hasFreshViewerCount } from "./store-0MIXEefC.mjs";
import { Bt as Input, Et as pauseTopicBridge, Ot as retryTopicBridgeSave, St as getTopicBridges, Tt as hydrateTopicBridges, Vt as Button, dt as useBrowseLibrary, gt as RecommendationExposureControl, ht as createSettledInput, kt as topicBridgeSaveStatus, mt as useSessionPhase, wt as hydrateGuidePreset, xt as getGuidePreset, yt as catalogTurn } from "./library-app-BzjSyqkW.mjs";
import { d as prepareGuide, i as RecommendationSessionControl, o as answerGuideQuery, p as useRecommendationSession, t as GuideOutputReport } from "./guide-picks-H-pVr5Jv.mjs";
import { a as subscribeReviewedPhotos, n as getReviewedPhotos, r as getServerReviewedPhotos } from "./reviewed-photo-bridges-_4_KV0tV.mjs";
import { t as RecommendationButton } from "./recommendation-button-SJ_hjWLs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-guide-DgNzBYbe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function auditTopicBridges(input, turn) {
	await turn();
	const known = new Set(input.folders.map((f) => f.id)), publicTitle = publicVideoBoundary(input.folders);
	const topics = /* @__PURE__ */ new Map();
	const sourceCounts = {
		local: 0,
		youtube: 0,
		twitch: 0,
		photo: 0
	};
	let publicTitles = 0, reviewedPhotos = 0;
	const add = (source, id, title, fields) => {
		sourceCounts[source]++;
		for (const entry of fields) {
			let group = topics.get(entry.topic);
			if (!group) {
				group = /* @__PURE__ */ new Map();
				topics.set(entry.topic, group);
			}
			const saved = group.get(source);
			if (saved) saved.count++;
			else group.set(source, {
				count: 1,
				sample: {
					source,
					id,
					title: bridgeText(title),
					field: entry.field,
					quote: entry.quote
				}
			});
		}
	};
	await forEachCatalogSlice(input.videos, (video) => {
		const source = videoBridgeSource(video);
		if (!source || video.isSample || !publicTitle(video) || input.hidden?.[video.id] || input.unavailable?.[video.id] || source === "local" && !known.has(video.folderId)) return;
		publicTitles++;
		add(source, video.id, video.name, bridgeFields(video, input.tags[video.id]));
	}, turn);
	await forEachCatalogSlice((input.photos ?? []).slice(0, 48), (photo) => {
		if (!photo.reviewed || !photo.direct || photo.hidden) return;
		reviewedPhotos++;
		const fields = /* @__PURE__ */ new Map();
		for (const tag of photo.tags.slice(0, 80)) {
			const topic = bridgeTopic(tag);
			if (topic && !fields.has(topic)) fields.set(topic, {
				topic,
				field: "saved tag",
				quote: bridgeText(tag)
			});
		}
		add("photo", photo.id, photo.name, [...fields.values()]);
	}, turn);
	await turn();
	const bridges = [];
	for (const [topic, groups] of topics) for (let i = 0; i < BRIDGE_SOURCES.length; i++) for (let j = i + 1; j < BRIDGE_SOURCES.length; j++) {
		const a = BRIDGE_SOURCES[i], b = BRIDGE_SOURCES[j], left = groups.get(a), right = groups.get(b);
		if (left && right) bridges.push({
			topic,
			a,
			b,
			counts: [left.count, right.count],
			samples: [left.sample, right.sample]
		});
	}
	bridges.sort((a, b) => a.topic.localeCompare(b.topic) || BRIDGE_SOURCES.indexOf(a.a) - BRIDGE_SOURCES.indexOf(b.a) || BRIDGE_SOURCES.indexOf(a.b) - BRIDGE_SOURCES.indexOf(b.b));
	return {
		bridges,
		publicTitles,
		reviewedPhotos,
		sourceCounts
	};
}
function TopicBridgeButton({ bridge }) {
	const [message, setMessage] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), key = bridgeKey(bridge), paused = getTopicBridges().entries.some((entry) => bridgeKey(entry) === key);
	const photo = bridge.a === "photo" || bridge.b === "photo", label = "#" + bridge.topic + " · " + bridge.a + " ↔ " + bridge.b;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				className: "min-h-11 max-w-full whitespace-normal",
				"aria-label": (paused ? "Undo bridge pause " : photo ? "Pause photo bridge " : "Pause Guide bridge ") + label,
				"aria-pressed": paused,
				onClick: () => {
					try {
						pauseTopicBridge({
							...bridge,
							at: Date.now()
						}, paused);
						setError("");
						setMessage(photo ? paused ? "Photo audit connection restored." : "Photo audit connection paused and excluded from active audit counts. It stays here for Undo." : paused ? "Bridge restored. Ask again or choose New recommendations to apply." : "Guide preference bridge paused. Ask again or choose New recommendations to apply. Tags and explicit search stay unchanged.");
					} catch (cause) {
						setError(cause instanceof Error ? cause.message : "Bridge choice could not be saved.");
					}
				},
				children: paused ? "Undo bridge pause" : photo ? "Pause photo bridge" : "Pause Guide bridge"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-xs leading-5 text-muted",
				children: message
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-xs text-fg",
				children: error
			})
		]
	});
}
function TopicBridgeAudit({ input }) {
	const photos = (0, import_react.useSyncExternalStore)(subscribeReviewedPhotos, getReviewedPhotos, getServerReviewedPhotos), scoped = (0, import_react.useMemo)(() => ({
		...input,
		photos
	}), [input, photos]);
	const [open, setOpen] = (0, import_react.useState)(() => photos.length > 0), [packet, setPacket] = (0, import_react.useState)(), [failed, setFailed] = (0, import_react.useState)(false), [revision, refresh] = (0, import_react.useState)(0), [query, setQuery] = (0, import_react.useState)(""), [page, setPage] = (0, import_react.useState)(0), [savedPage, setSavedPage] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const update = () => refresh((n) => n + 1);
		window.addEventListener("reelcase:bridge-change", update);
		window.addEventListener("reelcase:bridge-save", update);
		hydrateTopicBridges();
		return () => {
			window.removeEventListener("reelcase:bridge-change", update);
			window.removeEventListener("reelcase:bridge-save", update);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open || packet?.input === scoped) return;
		const controller = new AbortController();
		setFailed(false);
		auditTopicBridges(scoped, catalogTurn(controller.signal)).then((data) => {
			if (!controller.signal.aborted) setPacket({
				input: scoped,
				data
			});
		}).catch(() => {
			if (!controller.signal.aborted) setFailed(true);
		});
		return () => controller.abort();
	}, [scoped, open]);
	const data = packet?.input === scoped ? packet.data : void 0, ledger = getTopicBridges(), paused = bridgePolicy(ledger), rows = data?.bridges.filter((row) => (row.topic + " " + row.a + " " + row.b).includes(query.trim().toLowerCase())) ?? [], offset = Math.min(page * 8, Math.max(0, Math.ceil(rows.length / 8) - 1) * 8), savedOffset = Math.min(savedPage * 8, Math.max(0, Math.ceil(ledger.entries.length / 8) - 1) * 8);
	const exportAudit = () => {
		if (!data) return;
		const report = {
			version: 1,
			scope: "public topic coverage, not proof of personal preference",
			publicTitles: data.publicTitles,
			reviewedPhotos: data.reviewedPhotos,
			sources: data.sourceCounts,
			bridges: data.bridges.map(({ topic, a, b, counts }) => ({
				topic,
				a,
				b,
				counts,
				paused: paused(topic, a, b),
				scope: a === "photo" || b === "photo" ? "photo-audit" : "guide-preference"
			}))
		}, url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })), anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "reelcase-topic-bridge-audit.json";
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		open,
		"data-topic-bridge-audit": true,
		"data-bridge-revision": revision,
		className: "mt-4 rounded-lg border border-border bg-elevated/40 p-4",
		onToggle: (event) => setOpen(event.currentTarget.open),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer content-center text-sm font-medium text-fg",
				children: "Audit connections between sources"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Inspect shared content topics across local videos, YouTube, Twitch and explicitly reviewed photo metadata. Local filenames, photo filenames, creator fields, provider labels, dates and file formats do not supply a bridge."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Coverage is not a preference claim. Photo connections are audit-only and do not train Guide preferences. Guide preference boosts require a public favorite or like with a saved content topic on both sides. Pausing a source-pair topic removes that Guide boost after your next question or mix; same-source preferences, saved tags, explicit topic searches and other recommendation shelves remain available."
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				!data && !failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "mt-3 text-sm text-muted",
					children: "Checking public topic bridges…"
				}),
				failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-3 text-sm text-fg",
					children: "The audit could not finish. Close and reopen it to retry."
				}),
				data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-bridge-summary": true,
						className: "mt-3 text-xs text-muted",
						children: [
							data.publicTitles,
							" public video titles · ",
							data.reviewedPhotos,
							" reviewed photos · ",
							data.bridges.filter((row) => !paused(row.topic, row.a, row.b)).length,
							" active of ",
							data.bridges.length,
							" topic/source connections"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-3",
						"aria-label": "Filter topic bridges",
						maxLength: 80,
						placeholder: "Filter by topic or source",
						value: query,
						onChange: (event) => {
							setQuery(event.target.value);
							setPage(0);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-topic-bridges": true,
						className: "mt-3 grid items-start gap-3 lg:grid-cols-2",
						children: rows.slice(offset, offset + 8).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							"data-topic-bridge": bridgeKey(row),
							className: "min-w-0 rounded-lg border border-border bg-bg/45 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-medium text-fg",
									children: [
										"#",
										row.topic,
										" · ",
										row.a,
										" ↔ ",
										row.b
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted",
									children: [
										row.counts[0],
										" ",
										row.a,
										" · ",
										row.counts[1],
										" ",
										row.b,
										" · ",
										paused(row.topic, row.a, row.b) ? "Bridge paused" : row.a === "photo" || row.b === "photo" ? "Photo audit connection" : "Guide bridge available"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-3",
									children: row.samples.map((sample) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "min-w-0 text-xs leading-5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "break-words text-fg",
												children: [
													sample.source,
													": “",
													sample.title,
													"”"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "break-words text-muted",
												children: [
													sample.field,
													": “",
													sample.quote,
													"”"
												]
											}),
											sample.source !== "photo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												className: "mt-1 min-h-11",
												"aria-label": "Open bridge evidence " + sample.title,
												onClick: () => useLibrary.getState().openPreview(sample.id),
												children: "Open evidence title"
											})
										]
									}, sample.source))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicBridgeButton, { bridge: row })
							]
						}, bridgeKey(row)))
					}),
					!rows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "No supported public cross-source topic bridges match. Save a content topic on another public source, or review visible photos in Photos."
					}),
					rows.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								disabled: !offset,
								onClick: () => setPage(offset / 8 - 1),
								children: "Previous topic bridges"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "self-center text-xs text-muted",
								children: [
									offset + 1,
									"–",
									Math.min(offset + 8, rows.length),
									" of ",
									rows.length
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								disabled: offset + 8 >= rows.length,
								onClick: () => setPage(offset / 8 + 1),
								children: "Next topic bridges"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-3 min-h-11",
						onClick: exportAudit,
						children: "Export bridge audit"
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					"data-paused-topic-bridges": true,
					className: "mt-4 border-t border-border pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
							className: "min-h-11 cursor-pointer content-center text-sm font-medium text-fg",
							children: [
								"Paused topic bridges (",
								ledger.entries.length,
								"/256)"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 space-y-2",
							children: ledger.entries.slice(savedOffset, savedOffset + 8).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-bg/45 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-fg",
									children: [
										"#",
										row.topic,
										" · ",
										row.a,
										" ↔ ",
										row.b
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicBridgeButton, { bridge: row })]
							}, bridgeKey(row)))
						}),
						!ledger.entries.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "No bridge pauses saved."
						}),
						ledger.entries.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								disabled: !savedOffset,
								onClick: () => setSavedPage(savedOffset / 8 - 1),
								children: "Previous paused bridges"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								disabled: savedOffset + 8 >= ledger.entries.length,
								onClick: () => setSavedPage(savedOffset / 8 + 1),
								children: "Next paused bridges"
							})]
						})
					]
				})
			] }),
			topicBridgeSaveStatus() === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mt-3 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Bridge choices work for this session, but browser storage could not save them." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "mt-2 min-h-11",
					onClick: retryTopicBridgeSave,
					children: "Retry saving bridge choices"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "Photo review is optional and temporary: select visible photos chosen directly in Photos and confirm they are suitable for public connections. Imported source photos stay excluded. Returning to Photos or reloading clears the photo review. The audit never receives image bytes, paths or people labels. Bridge pauses are private to this browser library and included in its backup pack."
			})
		]
	});
}
function ReasonFeedback({ reason, video }) {
	const [message, setMessage] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), entry = getRecommendationRejections().entries.find((row) => rejectionKey(row) === rejectionKey(reason.feedback));
	const topic = reason.feedback.scope === "topic", creator = reason.feedback.scope === "creator", label = topic ? "topic " + reason.feedback.label : creator ? "this creator" : "this title";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "secondary",
				className: "min-h-11 max-w-full whitespace-normal",
				"aria-label": (entry ? "Undo " : "Reduce ") + label,
				"aria-pressed": Boolean(entry),
				onClick: () => {
					try {
						setRecommendationRejection(entry ?? {
							...reason.feedback,
							at: Date.now()
						}, Boolean(entry));
						setError("");
						const protectedTitle = useLibrary.getState().favorites[video.id] || creatorIsFavorited(video.remote?.channelName ?? ""), protectedTopic = topic && recommendationTopicIsLiked(reason.feedback.target);
						setMessage(entry ? "Choice undone. Ask again or refresh recommendations to apply." : protectedTitle ? "Choice recorded. A saved favorite protects this title; the reduction applies when that favorite is removed." : protectedTopic ? "Choice recorded. Your topic heart protects its matching rank reduction." : "Choice recorded. Ask again or refresh recommendations to apply.");
					} catch (cause) {
						setError(cause instanceof Error ? cause.message : "This choice could not be recorded.");
					}
				},
				children: [entry ? "Undo: " : "", topic ? "Less of #" + reason.feedback.label : creator ? "Less from this creator" : "Less of this title"]
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-xs leading-5 text-muted",
				children: message
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-xs leading-5 text-danger",
				children: error
			})
		]
	});
}
function GuideSuggestion({ video, explanation, query = false, onOpen }) {
	const seen = /* @__PURE__ */ new Set(), basis = explanation?.basis ?? "discovery";
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-xs font-medium text-accent",
			children: basis === "preference" ? "Saved preference" : basis === "query" ? "Field match" : basis === "live" ? "Live snapshot" : "Discovery"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-2 block break-words text-sm font-medium text-fg",
			children: video.name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mt-1 block truncate text-xs text-muted",
			children: [video.remote?.channelName ?? "Local title", video.genre ? " · " + video.genre : ""]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-2 block text-xs leading-5 text-muted",
			children: explanation?.reasons[0]?.text ?? "No prepared preference evidence. Refresh to inspect this title."
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		"data-guide-suggestion": video.id,
		"data-guide-basis": basis,
		className: "min-w-0 rounded-lg border border-border bg-bg/45 p-3",
		children: [
			query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-guide-match": video.id,
				className: "min-h-11 w-full text-left",
				onClick: () => onOpen(video.id),
				children: content
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecommendationButton, {
				video,
				type: "button",
				onClick: () => onOpen(video.id),
				className: "min-h-11 w-full text-left",
				children: content
			}),
			explanation?.notices.map((notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-guide-notice": true,
				className: "mt-3 text-xs leading-5 text-accent",
				children: notice
			}, notice)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				"data-guide-evidence": true,
				className: "mt-3 border-t border-border pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer content-center text-xs font-medium text-fg",
						children: "Why this pick?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Matched saved fields and feedback from this prepared snapshot. These reasons use local rules; no model wrote them."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-4",
						children: explanation?.reasons.slice(0, 4).map((reason) => {
							const key = rejectionKey(reason.feedback), showFeedback = !seen.has(key);
							seen.add(key);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								"data-guide-reason": reason.kind,
								className: "min-w-0 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "leading-5 text-fg",
										children: reason.text
									}),
									reason.quote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 break-words leading-5 text-muted",
										children: [
											reason.field,
											": “",
											reason.quote,
											"”"
										]
									}),
									reason.origin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 rounded-md bg-surface p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "break-words leading-5 text-muted",
											children: [
												"Evidence title: “",
												reason.origin.title,
												"” · saved tag “",
												reason.origin.tag,
												"” · ",
												reason.origin.signal === "favorite" ? "favorite" : "liked"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											className: "mt-1 min-h-11",
											"aria-label": "Open evidence title " + reason.origin.title,
											onClick: () => onOpen(reason.origin.id),
											children: "Open evidence title"
										})]
									}),
									reason.bridge && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 border-t border-border pt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-accent",
											children: [
												"Topic bridge: #",
												reason.bridge.topic,
												" · ",
												reason.bridge.a,
												" ↔ ",
												reason.bridge.b
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicBridgeButton, { bridge: reason.bridge })]
									}),
									showFeedback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReasonFeedback, {
										reason,
										video
									})
								]
							}, reason.id);
						})
					})
				]
			})
		]
	});
}
var LIVE_PAGE_SIZE = 24;
var SUGGESTIONS = [
	"Who is live on Twitch?",
	"Something funny",
	"A tech video",
	"What fits my favorites?",
	"Show a surprise based on my tags"
];
function AiGuide() {
	const session = useRecommendationSession();
	const videos = useBrowseLibrary((s) => s.videos), tags = useBrowseLibrary((s) => s.tags);
	const favorites = useBrowseLibrary((s) => s.favorites), likes = useBrowseLibrary((s) => s.likes);
	const history = useBrowseLibrary((s) => s.history);
	const folders = useBrowseLibrary((s) => s.folders), hidden = useBrowseLibrary((s) => s.hiddenVideos), unavailable = useBrowseLibrary((s) => s.unavailable), hideDemo = useBrowseLibrary((s) => s.hideDemo);
	const viewer = useLibrary((s) => Boolean(s.activeId || s.previewId)), phase = useSessionPhase();
	const [presetReady, setPresetReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		hydrateGuidePreset().then(() => setPresetReady(true));
	}, []);
	const [feedbackRevision, setFeedbackRevision] = (0, import_react.useState)(0), [feedbackUiRevision, setFeedbackUiRevision] = (0, import_react.useState)(0), [feedbackPending, setFeedbackPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const refresh = () => {
			setFeedbackPending(true);
			setFeedbackUiRevision((value) => value + 1);
		}, saved = () => setFeedbackUiRevision((value) => value + 1);
		window.addEventListener("reelcase:guide-preset-change", refresh);
		window.addEventListener("reelcase:rating-change", refresh);
		window.addEventListener("reelcase:bridge-change", refresh);
		window.addEventListener("reelcase:bridge-save", saved);
		window.addEventListener("reelcase:feedback-save", saved);
		return () => {
			window.removeEventListener("reelcase:guide-preset-change", refresh);
			window.removeEventListener("reelcase:rating-change", refresh);
			window.removeEventListener("reelcase:bridge-change", refresh);
			window.removeEventListener("reelcase:bridge-save", saved);
			window.removeEventListener("reelcase:feedback-save", saved);
		};
	}, []);
	const input = (0, import_react.useMemo)(() => ({
		weights: getGuidePreset().current,
		bridgeSuppressions: getTopicBridges(),
		session,
		videos,
		tags,
		favorites,
		likes,
		history,
		folders,
		hidden,
		unavailable,
		hideDemo,
		recommendationExposure: getRecommendationExposure(),
		ratingOf: getRating,
		recommendationRejections: getRecommendationRejections(),
		creatorIsFavorited,
		tagIsLiked: recommendationTopicIsLiked
	}), [
		videos,
		tags,
		favorites,
		likes,
		history,
		folders,
		hidden,
		unavailable,
		hideDemo,
		feedbackRevision,
		session,
		presetReady
	]);
	const bridgeInput = (0, import_react.useMemo)(() => ({
		videos,
		tags,
		folders,
		hidden,
		unavailable
	}), [
		videos,
		tags,
		folders,
		hidden,
		unavailable
	]);
	const [settled, setSettled] = (0, import_react.useState)(input), [seed, setSeed] = (0, import_react.useState)(() => Date.now());
	const [packet, setPacket] = (0, import_react.useState)();
	const [failed, setFailed] = (0, import_react.useState)(false);
	const settler = (0, import_react.useMemo)(() => createSettledInput(setSettled, {
		quietMs: 600,
		maxWaitMs: 4e3
	}), []);
	(0, import_react.useEffect)(() => {
		if (input !== settled) settler.push(input);
		else settler.cancel();
	}, [
		input,
		settled,
		settler
	]);
	(0, import_react.useEffect)(() => () => settler.cancel(), [settler]);
	(0, import_react.useEffect)(() => {
		if (!presetReady || settled !== input || phase !== "active" || viewer || packet?.input === settled && packet.seed === seed) return;
		const controller = new AbortController();
		setFailed(false);
		prepareGuide(settled, seed, Date.now(), catalogTurn(controller.signal)).then((data) => {
			if (!controller.signal.aborted) (0, import_react.startTransition)(() => setPacket({
				input: settled,
				seed,
				data
			}));
		}).catch(() => {
			if (!controller.signal.aborted) setFailed(true);
		});
		return () => controller.abort();
	}, [
		input,
		settled,
		seed,
		phase,
		viewer,
		presetReady
	]);
	const data = packet?.input === input ? packet.data : void 0;
	const pending = !failed && (packet?.input !== input || packet.seed !== seed);
	const mix = () => {
		setFeedbackPending(false);
		setFeedbackRevision((value) => value + 1);
		measureInteraction("navigation");
		settler.cancel();
		setSettled(input);
		setSeed((value) => value + 1);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-guide-catalog": true,
		"data-guide-pending": pending,
		className: "w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), "Library guide"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl text-fg sm:text-5xl",
				children: "Useful answers from local signals."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-muted",
				children: "Search eligible public titles, saved content tags and creator fields. Personal picks use visible favorites and likes; history skips recorded titles and does not prove a completed watch. All explanations use local rules, without model wording."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-guide-active-weights": true,
				className: "mt-3 text-xs text-muted",
				children: [
					"Prepared Guide weights: favorites ",
					input.weights.favorite,
					" · likes ",
					input.weights.like,
					" · shared topics ",
					input.weights.topic,
					". Experiment and roll back in Stats."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicBridgeAudit, { input: bridgeInput }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecommendationSessionControl, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecommendationExposureControl, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideQuestion, {
				input,
				seed,
				snapshot: data,
				feedbackRevision: feedbackUiRevision
			}),
			feedbackPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				"data-guide-feedback-pending": true,
				className: "mt-4 text-xs leading-5 text-muted",
				children: "Saved feedback changed. Ask again or use New recommendations to apply it; the current cards stay in place."
			}),
			getFeedbackSaveState() === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-xs text-muted",
				children: "Saving Guide feedback…"
			}),
			getFeedbackSaveState() === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mt-3 rounded-lg border border-border p-3 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Browser storage could not save your feedback. Choices work for this session." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "mt-2 min-h-11",
					onClick: retryFeedbackSave,
					children: "Retry saving Guide feedback"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl text-fg",
							children: "Your current signals"
						}), data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-guide-signals": true,
							className: "mt-1 text-xs text-muted",
							children: [
								data.publicCount,
								" eligible public titles · ",
								data.historyCount,
								" recorded history titles · ",
								data.favoriteCount,
								" favorites · ",
								data.likeCount,
								" likes · ",
								data.tagCount,
								" content tags"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "h-11 sm:h-9",
							onClick: mix,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "New recommendations"]
						})]
					}),
					pending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "status",
						className: "mt-3 flex items-center gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), data ? "Updating your recommendations…" : "Preparing your library signals…"]
					}),
					failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-3 text-sm text-muted",
						children: "Library signals could not be prepared. Try New recommendations again."
					}),
					data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideOutputReport, {
						distribution: data.distribution,
						shelf: "mix"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuidePicks, {
						data,
						feedbackRevision: feedbackUiRevision
					})] })
				]
			}),
			data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideLive, { live: data.live })
		]
	});
}
var GuidePicks = (0, import_react.memo)(function GuidePicks({ data, feedbackRevision }) {
	const openPreview = useLibrary((state) => state.openPreview);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-guide-mode": data.mode,
			className: "mt-3 text-xs leading-5 text-muted",
			children: data.mode === "empty" ? "No eligible public titles yet. Add a public source from your Library navigation." : data.mode === "discovery" ? "Discovery mix: no saved content preference matched these picks. Choose an available topic below or save a title you like." : "This mix separates saved preferences from discovery picks. Expand Why this pick? to inspect actual fields."
		}),
		data.affinityLimited && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted",
			children: "Interest evidence was sampled from a large tag vocabulary. A title or topic question still searches the complete public catalog."
		}),
		!data.picks.length && data.publicCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "No unrecorded recordings match this session. Try any length or all sources, reset the Guide session, or ask a topic question to include titles already in history."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			"data-guide-matching-recordings": true,
			className: "mt-3 text-xs text-muted",
			children: [data.candidateCount, " unrecorded recordings match this Guide session."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-guide-picks": true,
			"data-guide-feedback-revision": feedbackRevision,
			className: "mt-4 grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3",
			children: data.picks.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideSuggestion, {
				video,
				explanation: data.explanations?.[video.id],
				onOpen: openPreview
			}, video.id))
		})
	] });
});
var GuideLive = (0, import_react.memo)(function GuideLive({ live }) {
	const openPreview = useLibrary((s) => s.openPreview);
	const [page, setPage] = (0, import_react.useState)(0);
	const lastPage = Math.max(0, Math.ceil(live.length / LIVE_PAGE_SIZE) - 1), current = Math.min(page, lastPage);
	(0, import_react.useEffect)(() => setPage(0), [live]);
	const move = (page) => {
		measureInteraction("navigation");
		setPage(page);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-lg border border-border bg-elevated/60 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-fg",
					children: "Twitch live check"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: live.length ? `${live.length} followed channel${live.length === 1 ? "" : "s"} with fresh live observations in this snapshot.` : "No fresh Twitch live observations in this snapshot. Check the Live page for updates."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "shrink-0 rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent",
					children: [live.length, " live"]
				})]
			}),
			live.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-guide-live": true,
				className: "mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: live.slice(current * LIVE_PAGE_SIZE, (current + 1) * LIVE_PAGE_SIZE).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					className: "h-11 min-w-0 justify-start sm:h-9",
					onClick: () => openPreview(video.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate",
						children: [video.remote?.channelName ?? video.name, hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()}` : ""]
					})
				}, video.id))
			}),
			lastPage > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						className: "h-11 sm:h-9",
						disabled: current === 0,
						onClick: () => move(current - 1),
						children: "Previous live channels"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						"aria-live": "polite",
						children: [
							"Page ",
							current + 1,
							" of ",
							lastPage + 1
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						className: "h-11 sm:h-9",
						disabled: current === lastPage,
						onClick: () => move(current + 1),
						children: "Next live channels"
					})
				]
			})
		]
	});
});
function GuideQuestion({ input, seed, snapshot, feedbackRevision }) {
	const openPreview = useLibrary((state) => state.openPreview), setSource = useLibrary((state) => state.setSource), setQuery = useLibrary((state) => state.setQuery);
	const [prompt, setPrompt] = (0, import_react.useState)("What should I watch tonight?"), [packet, setPacket] = (0, import_react.useState)(), [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	const request = (0, import_react.useRef)(void 0), reply = packet?.input === input && packet.seed === seed ? packet.data : void 0;
	(0, import_react.useEffect)(() => {
		request.current?.abort();
		setPacket(void 0);
		setBusy(false);
		return () => request.current?.abort();
	}, [input, seed]);
	const ask = async (value = prompt) => {
		if (!value.trim()) return;
		request.current?.abort();
		const controller = new AbortController();
		request.current = controller;
		measureInteraction("search");
		setBusy(true);
		setPacket(void 0);
		setError("");
		try {
			const current = {
				...input,
				weights: getGuidePreset().current,
				bridgeSuppressions: getTopicBridges(),
				recommendationRejections: getRecommendationRejections(),
				recommendationExposure: getRecommendationExposure()
			}, result = await answerGuideQuery(current, value, seed, Date.now(), catalogTurn(controller.signal));
			if (!controller.signal.aborted) setPacket({
				input,
				seed,
				data: result
			});
		} catch {
			if (!controller.signal.aborted) setError("The library search could not finish. Try again.");
		} finally {
			if (!controller.signal.aborted) setBusy(false);
		}
	};
	const choose = (value) => {
		setPrompt(value);
		ask(value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex flex-col gap-2 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: prompt,
				maxLength: 500,
				onChange: (event) => {
					request.current?.abort();
					setBusy(false);
					setPacket(void 0);
					measureInteraction("search");
					setPrompt(event.target.value);
				},
				onKeyDown: (event) => {
					if (event.key === "Enter" && !event.nativeEvent.isComposing) ask();
				},
				"aria-label": "Library guide question"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "min-h-11",
				disabled: busy || !prompt.trim(),
				onClick: () => void ask(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), busy ? "Finding matches…" : "Ask guide"]
			})]
		}),
		busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "mt-4 text-sm text-muted",
			children: "Searching eligible public titles and saved fields…"
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "mt-4 text-sm text-muted",
			children: error
		}),
		reply && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-guide-answer": true,
			className: "mt-5 rounded-lg bg-elevated p-4 text-sm leading-6 text-fg shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					children: reply.text
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideOutputReport, {
					distribution: reply.distribution,
					shelf: "query"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-guide-feedback-revision": feedbackRevision,
					className: "mt-4 grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3",
					children: reply.picks.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideSuggestion, {
						video,
						explanation: reply.explanations[video.id],
						query: true,
						onOpen: openPreview
					}, video.id))
				})
			]
		}),
		snapshot && (snapshot.mode !== "personalized" || !snapshot.picks.length || reply && !reply.picks.length) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-guide-topic-chooser": true,
			className: "mt-5 rounded-lg border border-border p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-fg",
					children: snapshot.publicCount ? "Choose an available topic" : "Start with a public source"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: snapshot.publicCount ? "These topics come from eligible public titles and saved labels. Choosing one searches this session; it does not change your likes or tags." : "The Guide needs eligible public media before it can suggest titles. Private-only and hidden entries do not supply public preference evidence."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [snapshot.topics.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "min-h-11",
						"aria-label": "Explore Guide topic " + row.topic,
						onClick: () => choose(row.topic),
						children: [
							"#",
							row.topic,
							" · ",
							row.count
						]
					}, row.topic)), !snapshot.publicCount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						onClick: () => {
							setQuery("");
							setSource("youtube");
						},
						children: "Browse YouTube"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						onClick: () => {
							setQuery("");
							setSource("twitch");
						},
						children: "Browse Twitch"
					})] })]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 flex flex-wrap gap-2",
			children: SUGGESTIONS.map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				className: "min-h-11",
				onClick: () => choose(suggestion),
				children: suggestion
			}, suggestion))
		})
	] });
}
//#endregion
export { AiGuide };
