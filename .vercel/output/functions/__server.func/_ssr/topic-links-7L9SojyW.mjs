import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Jt as Check, P as RefreshCw, l as Undo2 } from "../_libs/lucide-react.mjs";
import { Yt as sortCatalogRows, lt as isAdultPullKind, nt as forEachCatalogSlice, tt as forEachCatalogEntry } from "./live-rooms-CNGwnMZr.mjs";
import { $ as Button, $t as retryTopicAliasSave, Dt as getRating, Gn as getTopicAliases, H as useSessionPhase, In as canonicalTopic, It as hydrateTopicAliases, Kn as hasTopicForScan, Mn as TOPICS, Mt as getWatchTime, Nn as aliasLabel, O as openTopic, P as useBrowseLibrary, Pn as baseCanonicalTopic, Q as Input, Sn as useLibrary, U as createSettledInput, bn as topicAliasSaveStatus, c as VirtualVideoGrid, dr as topicEvidence, en as reviewTopicAlias, er as ratingPreference, fr as topicEvidenceForScan, gn as tagIsLiked, m as catalogTurn, mr as validAliasLabel, sr as reviewedTopic, wn as watchTimeScore, yn as toggleTagLike } from "./library-app-BtCPS7Tj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/topic-links-7L9SojyW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function distance(a, b) {
	if (Math.abs(a.length - b.length) > 2) return 3;
	let prior = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		const row = [i];
		for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1] + 1, prior[j] + 1, prior[j - 1] + Number(a[i - 1] !== b[j - 1]));
		prior = row;
	}
	return prior[b.length];
}
function suggestAliasTopic(alias) {
	if (alias.length <= 3) return { ambiguous: true };
	const choices = [...TOPICS].map((topic) => ({
		topic,
		distance: distance(alias, topic)
	})).filter((row) => row.distance <= (alias.length >= 8 ? 2 : 1)).sort((a, b) => a.distance - b.distance || a.topic.localeCompare(b.topic));
	if (!choices.length) return void 0;
	const tied = choices.length > 1 && choices[0].distance === choices[1].distance;
	return {
		suggested: tied ? void 0 : choices[0].topic,
		ambiguous: tied
	};
}
/** Bounded taxonomy review; samples contain public display titles only. No descriptions/paths or private evidence. */
async function inspectAliasCandidates(input, ledger, turn, requested) {
	const privateFolders = new Set(input.folders.filter((row) => row.adult).map((row) => row.id)), known = new Set(input.folders.map((row) => row.id)), approved = new Set(ledger.entries.map((row) => row.alias));
	const candidates = /* @__PURE__ */ new Map(), memo = /* @__PURE__ */ new Map();
	const exact = requested ? aliasLabel(requested) : void 0;
	let examined = 0, truncated = false;
	await forEachCatalogSlice(input.videos, (video) => {
		if (privateFolders.has(video.folderId) || isAdultPullKind(video.remote?.kind) || video.remote && !["youtube", "twitch"].includes(video.remote.kind) || input.hiddenVideos[video.id] || input.unavailable[video.id] || video.isSample || !known.has(video.folderId) && !video.remote) return;
		const labels = new Set((input.tags[video.id] ?? []).slice(0, 128).map(aliasLabel));
		for (const alias of labels) {
			if (exact && alias !== exact || approved.has(alias) || baseCanonicalTopic(alias) || !validAliasLabel(alias)) continue;
			let suggestion = memo.get(alias);
			if (!memo.has(alias)) {
				if (memo.size >= 4096) {
					truncated = true;
					continue;
				}
				suggestion = suggestAliasTopic(alias);
				memo.set(alias, suggestion);
				examined++;
			}
			if (!exact && !suggestion) continue;
			let row = candidates.get(alias);
			if (!row) {
				if (candidates.size >= 256) {
					truncated = true;
					continue;
				}
				row = {
					count: 0,
					sources: /* @__PURE__ */ new Set(),
					samples: [],
					...suggestion,
					ambiguous: suggestion?.ambiguous ?? true
				};
				candidates.set(alias, row);
			}
			row.count++;
			row.sources.add(video.remote?.kind ?? "local");
			if (row.samples.length < 3) row.samples.push(video.name.slice(0, 180));
		}
	}, turn, 256);
	return {
		candidates: [...candidates].map(([alias, row]) => ({
			alias,
			...row,
			sources: [...row.sources]
		})).sort((a, b) => b.count - a.count || a.alias.localeCompare(b.alias)).slice(0, 128),
		examined,
		truncated
	};
}
function TopicAliasReview({ input }) {
	const [open, setOpen] = (0, import_react.useState)(false), [revision, refresh] = (0, import_react.useState)(0), [query, setQuery] = (0, import_react.useState)(""), [lookup, setLookup] = (0, import_react.useState)(""), [page, setPage] = (0, import_react.useState)(0), [savedPage, setSavedPage] = (0, import_react.useState)(0);
	const [packet, setPacket] = (0, import_react.useState)(), [selected, setSelected] = (0, import_react.useState)(), [target, setTarget] = (0, import_react.useState)(""), [ack, setAck] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), [message, setMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const update = () => refresh((value) => value + 1);
		window.addEventListener("reelcase:topic-alias-change", update);
		window.addEventListener("reelcase:topic-alias-save", update);
		hydrateTopicAliases();
		return () => {
			window.removeEventListener("reelcase:topic-alias-change", update);
			window.removeEventListener("reelcase:topic-alias-save", update);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		setSelected(void 0);
		setAck(false);
		if (!open) return;
		const controller = new AbortController();
		setError("");
		inspectAliasCandidates(input, getTopicAliases(), catalogTurn(controller.signal), lookup || void 0).then((data) => {
			if (!controller.signal.aborted) setPacket({
				input,
				lookup,
				revision,
				...data
			});
		}).catch(() => {
			if (!controller.signal.aborted) setError("Alias evidence could not be prepared. Try reviewing again.");
		});
		return () => controller.abort();
	}, [
		input,
		open,
		lookup,
		revision
	]);
	const ready = packet?.input === input && packet.lookup === lookup && packet.revision === revision, rows = ready ? packet.candidates : [], offset = Math.min(page * 8, Math.max(0, Math.ceil(rows.length / 8) - 1) * 8), ledger = getTopicAliases(), savedOffset = Math.min(savedPage * 8, Math.max(0, Math.ceil(ledger.entries.length / 8) - 1) * 8);
	const undo = (entry) => {
		try {
			reviewTopicAlias(entry, true);
			setMessage("Alias undone. Topic connections and ranking use the original labels again.");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not undo this alias.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-alias-review": true,
		className: "mt-5 rounded-lg border border-border bg-bg/40 p-4",
		onToggle: (event) => setOpen(event.currentTarget.open),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer content-center font-medium text-fg",
				children: "Review topic spelling and aliases"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Connect a saved label to a topic after reviewing its public titles and sources. Labels, manual locks, ratings and provider metadata stay as saved. No suggestion is applied automatically."
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-2 sm:flex-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Alias label to inspect",
							maxLength: 64,
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Inspect a saved label, such as scince"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							className: "min-h-11",
							disabled: !validAliasLabel(query),
							onClick: () => {
								setLookup(aliasLabel(query));
								setPage(0);
							},
							children: "Inspect label"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => {
								setQuery("");
								setLookup("");
								setPage(0);
								refresh((value) => value + 1);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Review suggestions"]
						})
					]
				}),
				!ready && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "mt-3 text-sm text-muted",
					children: "Checking public saved labels…"
				}),
				ready && !rows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: lookup ? "No unreviewed public titles use that saved label." : "No likely spelling aliases or short ambiguous labels were found. Inspect another saved label to review it explicitly."
				}),
				ready && packet.truncated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted",
					children: "Suggestions are sampled from a bounded label vocabulary. Inspect an exact label to check it across the public catalog."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					"data-alias-candidates": true,
					className: "mt-3 space-y-2",
					children: rows.slice(offset, offset + 8).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-md bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "break-words text-sm font-medium text-fg",
								children: [row.alias, row.suggested ? " → " + row.suggested : ""]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									row.count,
									" public titles · ",
									row.sources.join(" + "),
									row.ambiguous ? " · ambiguous: choose a topic explicitly" : ""
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							className: "min-h-11",
							"aria-label": "Review alias " + row.alias,
							onClick: () => {
								setSelected(row);
								setTarget(row.suggested ?? "");
								setAck(false);
								setMessage("");
							},
							children: "Review"
						})]
					}, row.alias))
				}),
				rows.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: !offset,
							onClick: () => setPage(offset / 8 - 1),
							children: "Previous alias suggestions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted",
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
							children: "Next alias suggestions"
						})
					]
				}),
				selected && ready && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": "Alias approval preview",
					className: "mt-4 rounded-md border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium text-fg",
							children: [
								"Review “",
								selected.alias,
								"”"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								selected.count,
								" public titles from ",
								selected.sources.length,
								" source types use this label. These examples support your review:"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 list-disc space-y-1 pl-5 text-sm text-fg",
							children: selected.samples.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: name }, index))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 block text-sm text-muted",
							children: ["Connect to topic", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Alias target topic",
								value: target,
								onChange: (event) => {
									setTarget(event.target.value);
									setAck(false);
								},
								className: "mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Choose a topic"
								}), [...TOPICS].sort().map((topic) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: topic,
									children: topic
								}, topic))]
							})]
						}),
						selected.ambiguous && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 flex min-h-11 items-center gap-3 text-sm text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: ack,
								onChange: (event) => setAck(event.target.checked)
							}), "I reviewed this ambiguous label and intend this connection."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs leading-5 text-muted",
							children: "This creates a reversible local interpretation for topic search and public recommendations. It does not combine creators, rewrite any tag, or hide the original spelling."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							className: "mt-3 min-h-11",
							disabled: !target || selected.ambiguous && !ack,
							onClick: () => {
								try {
									reviewTopicAlias({
										alias: selected.alias,
										topic: target,
										at: Date.now(),
										method: selected.suggested === target && !selected.ambiguous ? "spelling-review" : "manual-review",
										titleCount: selected.count,
										sources: selected.sources
									});
									setSelected(void 0);
									setMessage("Alias approved. Search, topics and public recommendations now use this reviewed connection.");
								} catch (cause) {
									setError(cause instanceof Error ? cause.message : "Could not approve this alias.");
								}
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), "Approve alias"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					"data-saved-aliases": true,
					className: "mt-4 border-t border-border pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
							className: "min-h-11 cursor-pointer content-center text-sm font-medium text-fg",
							children: [
								"Reviewed aliases (",
								ledger.entries.length,
								"/128)"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-2",
							children: ledger.entries.slice(savedOffset, savedOffset + 8).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "break-words text-sm text-fg",
										children: [
											entry.alias,
											" → ",
											entry.topic
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted",
										children: [
											entry.method === "spelling-review" ? "Spelling review" : "Explicit manual review",
											" · ",
											entry.titleCount,
											" public titles at approval · ",
											entry.sources.join(" + "),
											" · ",
											new Date(entry.at).toLocaleDateString()
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "min-h-11",
									"aria-label": "Undo alias " + entry.alias,
									onClick: () => undo(entry),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" }), "Undo"]
								})]
							}, entry.alias))
						}),
						!ledger.entries.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "No reviewed aliases yet."
						}),
						ledger.entries.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								disabled: !savedOffset,
								onClick: () => setSavedPage(savedOffset / 8 - 1),
								children: "Previous reviewed aliases"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								disabled: savedOffset + 8 >= ledger.entries.length,
								onClick: () => setSavedPage(savedOffset / 8 + 1),
								children: "Next reviewed aliases"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "mt-3 text-sm text-muted",
					children: message
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-3 text-sm text-fg",
					children: error
				}),
				topicAliasSaveStatus() === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "alert",
					className: "mt-3 text-sm text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Aliases work for this session, but browser storage could not save them." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-2 min-h-11",
						onClick: retryTopicAliasSave,
						children: "Retry saving aliases"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs leading-5 text-muted",
					children: "Private to this browser library and included in its backup pack. Built-in taxonomy labels cannot be reassigned. Private/adult titles are excluded from review evidence."
				})
			] })
		]
	});
}
var slots = /* @__PURE__ */ new WeakMap();
function same(a, b) {
	return a.tags === b.tags && a.folders === b.folders && a.hiddenVideos === b.hiddenVideos && a.unavailable === b.unavailable && a.hideDemo === b.hideDemo;
}
function publicTopicTitle(input) {
	const privateIds = new Set(input.folders.filter((row) => row.adult).map((row) => row.id)), known = new Set(input.folders.map((row) => row.id));
	return (video) => !privateIds.has(video.folderId) && !isAdultPullKind(video.remote?.kind) && !input.hiddenVideos[video.id] && !input.unavailable[video.id] && !(input.hideDemo && video.isSample) && Boolean(known.has(video.folderId) || video.remote || video.isSample);
}
async function build(input, turn) {
	const allowed = publicTopicTitle(input), eligible = [], topics = /* @__PURE__ */ new Map(), linked = new Uint8Array(input.videos.length), saved = new Uint8Array(input.videos.length), aliases = getTopicAliases();
	await forEachCatalogSlice(input.videos, (video, index) => {
		if (!allowed(video)) return;
		eligible.push(index);
		for (const link of topicEvidenceForScan(video, input.tags[video.id])) {
			let row = topics.get(link.topic);
			if (!row) {
				row = {
					all: [],
					saved: []
				};
				topics.set(link.topic, row);
			}
			row.all.push(index);
			linked[index]++;
			if (link.saved) {
				row.saved.push(index);
				saved[index]++;
			}
		}
	}, turn, 256);
	return {
		eligible: Uint32Array.from(eligible),
		topics: new Map([...topics].map(([topic, row]) => [topic, {
			all: Uint32Array.from(row.all),
			saved: Uint32Array.from(row.saved)
		}])),
		linked,
		saved,
		aliases,
		patchedTopics: [],
		baseBuilds: 1
	};
}
async function patch(index, input, turn) {
	const next = getTopicAliases(), oldMap = new Map(index.aliases.entries.map((row) => [row.alias, row.topic])), newMap = new Map(next.entries.map((row) => [row.alias, row.topic]));
	const affected = /* @__PURE__ */ new Set();
	for (const key of /* @__PURE__ */ new Set([...oldMap.keys(), ...newMap.keys()])) {
		if (oldMap.get(key) === newMap.get(key)) continue;
		const old = oldMap.get(key), current = newMap.get(key);
		if (old) affected.add(old);
		if (current) affected.add(current);
	}
	if (!affected.size) {
		index.aliases = next;
		index.patchedTopics = [];
		return index;
	}
	const replacements = new Map([...affected].map((topic) => [topic, {
		all: [],
		saved: []
	}])), linked = index.linked.slice(), saved = index.saved.slice();
	for (const topic of affected) {
		const prior = index.topics.get(topic);
		if (prior) {
			await forEachCatalogSlice(prior.all, (ordinal) => {
				linked[ordinal]--;
			}, turn);
			await forEachCatalogSlice(prior.saved, (ordinal) => {
				saved[ordinal]--;
			}, turn);
		}
	}
	await forEachCatalogSlice(index.eligible, (ordinal) => {
		const video = input.videos[ordinal], tags = input.tags[video.id] ?? [];
		for (const [topic, row] of replacements) {
			if (!hasTopicForScan(video, topic, tags)) continue;
			row.all.push(ordinal);
			linked[ordinal]++;
			if (tags.some((tag) => canonicalTopic(tag) === topic)) {
				row.saved.push(ordinal);
				saved[ordinal]++;
			}
		}
	}, turn, 256);
	await turn();
	if (getTopicAliases() !== next) return patch(index, input, turn);
	const topics = new Map(index.topics);
	for (const [topic, row] of replacements) if (row.all.length) topics.set(topic, {
		all: Uint32Array.from(row.all),
		saved: Uint32Array.from(row.saved)
	});
	else topics.delete(topic);
	index.topics = topics;
	index.linked = linked;
	index.saved = saved;
	index.aliases = next;
	index.patchedTopics = [...affected];
	return index;
}
/** Reuse all unrelated topic arrays on alias approval/Undo. Catalog/visibility edits still rebuild safely. */
async function topicPostings(input, turn, recovered = false) {
	let slot = slots.get(input.videos);
	if (!slot || !same(slot.input, input)) {
		slot = {
			input,
			pending: build(input, turn),
			owner: turn
		};
		slots.set(input.videos, slot);
	}
	try {
		const observed = slot.pending, index = await observed;
		await turn();
		if (slot.pending !== observed) return topicPostings(input, turn, recovered);
		if (index.aliases === getTopicAliases()) return index;
		const pending = patch(index, input, turn);
		slot.pending = pending;
		slot.owner = turn;
		return await pending;
	} catch (error) {
		if (slots.get(input.videos) === slot) slots.delete(input.videos);
		if (slot.owner !== turn && !recovered) {
			await turn();
			return topicPostings(input, turn, true);
		}
		throw error;
	}
}
var normalize = (text) => text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[-_#]+/g, " ");
/** Only small aggregates survive the scan; no second catalog of row/topic objects. */
async function summarizeTopicCatalog(input, taste, turn) {
	const postings = await topicPostings(input, turn), counts = /* @__PURE__ */ new Map();
	const sources = /* @__PURE__ */ new Map(), genres = /* @__PURE__ */ new Set();
	let total = 0, saved = 0, linked = 0;
	await forEachCatalogSlice(postings.eligible, (ordinal) => {
		const video = input.videos[ordinal];
		total++;
		const source = sources.get(video.folderId) ?? {
			total: 0,
			linked: 0
		};
		source.total++;
		source.linked += Number(postings.linked[ordinal] > 0);
		sources.set(video.folderId, source);
		if (postings.linked[ordinal]) linked++;
		if (postings.saved[ordinal]) saved++;
		if (video.genre) genres.add(video.genre);
	}, turn, 256);
	for (const [topic, posting] of postings.topics) {
		let ratingTotal = 0;
		const providers = /* @__PURE__ */ new Set();
		await forEachCatalogSlice(posting.all, (ordinal) => {
			const video = input.videos[ordinal];
			ratingTotal += taste.score(video.id);
			providers.add(video.remote?.kind ?? "local");
		}, turn, 256);
		counts.set(topic, {
			count: posting.all.length,
			providers,
			ratingTotal,
			saved: posting.saved.length
		});
	}
	const gaps = [];
	await forEachCatalogEntry(sources, ([id, source]) => {
		gaps.push({
			id,
			...source
		});
		gaps.sort((a, b) => b.total - b.linked - (a.total - a.linked));
		if (gaps.length > 8) gaps.pop();
	}, turn);
	const genreRows = [];
	await forEachCatalogEntry(genres, (genre) => {
		genreRows.push(genre);
	}, turn);
	const sortedGenres = await sortCatalogRows(genreRows, (a, b) => a.localeCompare(b), turn);
	await turn();
	return {
		total,
		saved,
		linked,
		gaps,
		genres: sortedGenres,
		counts: [...counts].sort((a, b) => Number(taste.liked(b[0])) - Number(taste.liked(a[0])) || b[1].ratingTotal / b[1].count - a[1].ratingTotal / a[1].count || b[1].count - a[1].count || a[0].localeCompare(b[0]))
	};
}
/** Preserve catalog order and complete results; only the visible grid mounts cards. */
async function selectTopicCatalog(input, selected, genre, provider, taste, turn, filters = {}) {
	const postings = await topicPostings(input, turn), videos = [];
	const terms = normalize((filters.text ?? "").trim().slice(0, 200)).split(/\s+/).filter(Boolean).slice(0, 12);
	const related = /* @__PURE__ */ new Map();
	await forEachCatalogSlice(selected ? postings.topics.get(selected)?.all ?? /* @__PURE__ */ new Uint32Array() : postings.eligible, (ordinal) => {
		const video = input.videos[ordinal];
		if (genre && video.genre !== genre || provider !== "all" && (video.remote?.kind ?? "local") !== provider) return;
		const links = selected || filters.evidence && filters.evidence !== "all" ? topicEvidenceForScan(video, input.tags[video.id]) : [];
		if (selected && !links.some((link) => link.topic === selected)) return;
		const relevant = selected ? links.filter((link) => link.topic === selected) : links;
		if (filters.evidence === "saved" && !relevant.some((link) => link.saved) || filters.evidence === "inferred" && (!relevant.length || relevant.some((link) => link.saved))) return;
		if (terms.length) {
			const text = normalize(`${video.name.slice(0, 1e3)} ${video.genre ?? ""} ${video.remote?.channelName ?? ""} ${(input.tags[video.id] ?? []).slice(0, 80).join(" ")} ${(input.tags[video.id] ?? []).slice(0, 80).map((tag) => reviewedTopic(tag) ?? "").join(" ")}`);
			if (!terms.every((term) => text.includes(term))) return;
		}
		videos.push(video);
		if (!selected) return;
		const score = taste.score(video.id);
		for (const { topic } of links) if (topic !== selected) {
			const entry = related.get(topic) ?? {
				shared: 0,
				ratingTotal: 0
			};
			entry.shared++;
			entry.ratingTotal += score;
			related.set(topic, entry);
		}
	}, turn, 256);
	await turn();
	return {
		videos: filters.sort && filters.sort !== "catalog" ? await sortCatalogRows(videos, (a, b) => filters.sort === "title" ? a.name.localeCompare(b.name) : filters.sort === "taste" ? taste.score(b.id) - taste.score(a.id) || b.addedAt - a.addedAt : b.addedAt - a.addedAt, turn) : videos,
		related: [...related].sort((a, b) => b[1].ratingTotal / b[1].shared - a[1].ratingTotal / a[1].shared || b[1].shared - a[1].shared || a[0].localeCompare(b[0])).slice(0, 12)
	};
}
/** Saved/inferred counts were accumulated once, so export is independent of library size. */
function topicConnectionsCsv(summary) {
	return [[
		"topic",
		"public_titles",
		"taste_score_points",
		"taste_total",
		"providers",
		"saved_tag_titles",
		"inferred_only_titles"
	], ...summary.counts.map(([topic, data]) => [
		topic,
		data.count,
		Math.round(data.ratingTotal / data.count * 1e3),
		data.ratingTotal.toFixed(1),
		[...data.providers].join(" + "),
		data.saved,
		data.count - data.saved
	])].map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
}
var taste = {
	liked: tagIsLiked,
	score: (id) => {
		const rating = getRating(id);
		return ratingPreference(rating) + (rating === 1 ? 0 : watchTimeScore(getWatchTime(id)) / 12);
	}
};
var EMPTY_SELECTION = {
	videos: [],
	related: []
};
var EMPTY_SUMMARY = {
	total: 0,
	linked: 0,
	saved: 0,
	counts: [],
	genres: [],
	gaps: []
};
function useTopicCatalog(input, revision, selected, genre, provider, explorer, filters) {
	const phase = useSessionPhase(), viewer = useLibrary((state) => Boolean(state.activeId || state.previewId));
	const [settled, setSettled] = (0, import_react.useState)({
		input,
		revision
	});
	const coalescer = (0, import_react.useMemo)(() => createSettledInput(setSettled, {
		quietMs: 600,
		maxWaitMs: 4e3
	}), []);
	(0, import_react.useEffect)(() => {
		if (settled.input !== input || settled.revision !== revision) coalescer.push({
			input,
			revision
		});
	}, [
		input,
		revision,
		coalescer
	]);
	(0, import_react.useEffect)(() => () => coalescer.cancel(), [coalescer]);
	const [summary, setSummary] = (0, import_react.useState)();
	const [selection, setSelection] = (0, import_react.useState)();
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (phase !== "active" || viewer || summary?.input === settled.input && summary.revision === settled.revision) return;
		const controller = new AbortController();
		setFailed(false);
		summarizeTopicCatalog(settled.input, taste, catalogTurn(controller.signal)).then((data) => {
			if (!controller.signal.aborted) (0, import_react.startTransition)(() => setSummary({
				...settled,
				data
			}));
		}).catch(() => {
			if (!controller.signal.aborted) setFailed(true);
		});
		return () => controller.abort();
	}, [
		settled,
		phase,
		viewer
	]);
	(0, import_react.useEffect)(() => {
		if (!explorer || phase !== "active" || viewer || summary?.input !== settled.input || summary.revision !== settled.revision) return;
		if (selection?.input === settled.input && selection.revision === settled.revision && selection.selected === selected && selection.genre === genre && selection.provider === provider && selection.filters === filters) return;
		const controller = new AbortController();
		setFailed(false);
		selectTopicCatalog(settled.input, selected, genre, provider, taste, catalogTurn(controller.signal), filters).then((data) => {
			if (!controller.signal.aborted) (0, import_react.startTransition)(() => setSelection({
				...settled,
				selected,
				genre,
				provider,
				filters,
				data
			}));
		}).catch(() => {
			if (!controller.signal.aborted) setFailed(true);
		});
		return () => controller.abort();
	}, [
		settled,
		summary,
		selected,
		genre,
		provider,
		explorer,
		phase,
		viewer,
		filters
	]);
	const summaryReady = summary?.input === input && summary.revision === revision;
	const selectionReady = selection?.input === input && selection.revision === revision && selection.selected === selected && selection.genre === genre && selection.provider === provider && selection.filters === filters;
	const sameVisibility = (previous) => previous.folders === input.folders && previous.unavailable === input.unavailable && previous.hiddenVideos === input.hiddenVideos && previous.hideDemo === input.hideDemo;
	const matchesReady = Boolean(selection && sameVisibility(selection.input) && selection.selected === selected && selection.genre === genre && selection.provider === provider && selection.filters === filters);
	return {
		summary: summary && sameVisibility(summary.input) ? summary.data : EMPTY_SUMMARY,
		selection: matchesReady ? selection.data : EMPTY_SELECTION,
		matchesReady,
		pending: !failed && (!summaryReady || explorer && !selectionReady),
		failed,
		ready: summaryReady
	};
}
function TopicLinks({ explorer = false }) {
	const videos = useBrowseLibrary((s) => s.videos), tags = useBrowseLibrary((s) => s.tags);
	const folders = useBrowseLibrary((s) => s.folders), unavailable = useBrowseLibrary((s) => s.unavailable);
	const hiddenVideos = useBrowseLibrary((s) => s.hiddenVideos), hideDemo = useBrowseLibrary((s) => s.hideDemo);
	const query = useLibrary((s) => s.query);
	const [provider, setProvider] = (0, import_react.useState)("all"), [genrePage, setGenrePage] = (0, import_react.useState)(0);
	const [genresOpen, setGenresOpen] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)(""), [settledText, setSettledText] = (0, import_react.useState)(""), [topicSearch, setTopicSearch] = (0, import_react.useState)("");
	const [order, setOrder] = (0, import_react.useState)("catalog"), [evidence, setEvidence] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => setSettledText(text), 180);
		return () => clearTimeout(timer);
	}, [text]);
	const [favoriteRevision, setFavoriteRevision] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const refresh = () => setFavoriteRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	const selected = explorer ? canonicalTopic(query) : void 0;
	const selectedGenre = explorer && query.startsWith("genre:") ? query.slice(6) : void 0;
	const filters = (0, import_react.useMemo)(() => ({
		text: [!selected && !selectedGenre ? query : "", settledText].filter(Boolean).join(" "),
		sort: order,
		evidence
	}), [
		query,
		selected,
		selectedGenre,
		settledText,
		order,
		evidence
	]);
	const input = (0, import_react.useMemo)(() => ({
		videos,
		tags,
		folders,
		unavailable,
		hiddenVideos,
		hideDemo
	}), [
		videos,
		tags,
		folders,
		unavailable,
		hiddenVideos,
		hideDemo
	]);
	const { summary: index, selection, pending, failed, ready, matchesReady } = useTopicCatalog(input, favoriteRevision, selected, selectedGenre, provider, explorer, filters);
	const { videos: matching, related } = selection, genres = index.genres;
	const genreOffset = Math.min(genrePage * 48, Math.max(0, Math.ceil(genres.length / 48) - 1) * 48);
	const choose = (topic) => {
		setText("");
		setSettledText("");
		openTopic(topic);
	};
	const caption = (0, import_react.useCallback)((video) => selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-xs text-muted",
		children: topicEvidence(video, tags[video.id]).find((link) => link.topic === selected)?.reason
	}) : null, [selected, tags]);
	const exportLinks = () => {
		const url = URL.createObjectURL(new Blob([topicConnectionsCsv(index)], { type: "text/csv;charset=utf-8" }));
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `reelcase-topic-links-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	const selectedScore = selected ? index.counts.find(([topic]) => topic === selected)?.[1] : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-topic-catalog": true,
		"data-topic-pending": pending,
		"aria-busy": pending,
		className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
				children: "Connected topics"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-2xl text-fg",
				children: selected || selectedGenre ? `Explore ${selected ?? selectedGenre}` : "Follow an idea across your library."
			}),
			pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-sm text-muted",
				children: "Updating topic connections…"
			}),
			failed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mt-2 flex flex-wrap items-center gap-2 text-sm text-muted",
				children: ["Topic connections could not finish.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => setFavoriteRevision((value) => value + 1),
					children: "Retry topic connections"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					index.linked.toLocaleString(),
					" of ",
					index.total.toLocaleString(),
					" public titles linked · ",
					index.saved.toLocaleString(),
					" with saved topics · ",
					(index.linked - index.saved).toLocaleString(),
					" connected by title or category evidence. Saved tags are unchanged."
				]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-bg/45 px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm text-fg",
						children: ["#", selected]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: tagIsLiked(selected) ? "default" : "secondary",
						onClick: () => toggleTagLike(selected),
						children: tagIsLiked(selected) ? "★ Favorite topic" : "☆ Favorite topic"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Favorite topics stay at the start of Topics and Stats."
					}),
					selectedScore && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						children: [
							"taste score ",
							Math.round(selectedScore.ratingTotal / selectedScore.count * 1e3).toLocaleString(),
							" points from ",
							selectedScore.count.toLocaleString(),
							" linked titles"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicAliasReview, { input }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-4 max-w-xl",
				value: topicSearch,
				maxLength: 120,
				onChange: (event) => setTopicSearch(event.target.value),
				"aria-label": "Find a topic",
				placeholder: "Find a topic, such as science or gaming"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: index.counts.filter(([topic]) => topic.includes(topicSearch.trim().toLowerCase().replace(/^#/, ""))).map(([topic, data]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: selected === topic ? "default" : "secondary",
					onClick: () => choose(topic),
					title: [...data.providers].join(" + "),
					children: [
						tagIsLiked(topic) ? "★ " : "",
						"#",
						topic,
						" · ",
						data.count.toLocaleString(),
						" · score ",
						Math.round(data.ratingTotal / data.count * 1e3).toLocaleString(),
						data.providers.size > 1 ? " · ↔" : ""
					]
				}, topic))
			}),
			!pending && !failed && !index.counts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "No supported topics yet. Add descriptive titles or saved topic tags to connect your media."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				size: "sm",
				variant: "secondary",
				disabled: !ready,
				onClick: exportLinks,
				children: "Export topic connections"
			}),
			explorer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "min-w-0 flex-1 basis-64",
							maxLength: 200,
							value: text,
							onChange: (event) => setText(event.target.value),
							placeholder: "Search these titles, saved tags or creators",
							"aria-label": "Search Topic Explorer titles"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Sort Topic Explorer",
							value: order,
							onChange: (event) => setOrder(event.target.value),
							className: "min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "catalog",
									children: "Library order"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "newest",
									children: "Newest added"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "title",
									children: "Title A–Z"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "taste",
									children: "Your taste"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Topic evidence filter",
							value: evidence,
							onChange: (event) => setEvidence(event.target.value),
							className: "min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All topic evidence"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "saved",
									children: "Saved tags only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "inferred",
									children: "Inferred topics only"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "Filters combine with the selected topic and source. The result cards show why each title is connected."
				}),
				genres.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mt-4 text-sm text-muted",
					onToggle: (event) => setGenresOpen(event.currentTarget.open),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "cursor-pointer",
						children: ["Media genres and Twitch categories · ", genres.length]
					}), genresOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: genres.slice(genreOffset, genreOffset + 48).map((genre) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: selectedGenre === genre ? "default" : "secondary",
							onClick: () => choose(`genre:${genre}`),
							children: genre
						}, genre))
					}), genres.length > 48 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: genreOffset === 0,
								onClick: () => setGenrePage(Math.max(0, genreOffset / 48 - 1)),
								children: "Previous categories"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									genreOffset + 1,
									"–",
									Math.min(genreOffset + 48, genres.length),
									" of ",
									genres.length
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: genreOffset + 48 >= genres.length,
								onClick: () => setGenrePage(genreOffset / 48 + 1),
								children: "Next 48 categories"
							})
						]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => {
							setProvider("all");
							setText("");
							setSettledText("");
							setEvidence("all");
							useLibrary.getState().setQuery("");
						},
						children: "All topics"
					}), [
						"all",
						"local",
						"youtube",
						"twitch"
					].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: provider === kind ? "default" : "secondary",
						onClick: () => setProvider(kind),
						children: kind === "all" ? "All sources" : kind
					}, kind))]
				}),
				related.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Related through titles in this view"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: related.map(([topic, data]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => choose(topic),
							children: [
								"#",
								topic,
								" · ",
								data.shared,
								" shared · score ",
								Math.round(data.ratingTotal / data.shared * 1e3).toLocaleString()
							]
						}, topic))
					})]
				}),
				matchesReady && !failed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					"data-topic-matches": matching.length,
					className: "mt-4 text-sm text-muted",
					children: [
						matching.length.toLocaleString(),
						" matching ",
						matching.length === 1 ? "title" : "titles"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualVideoGrid, {
						videos: matching,
						variant: "grid",
						pageSize: 48,
						caption
					}, `${selected ?? ""}:${selectedGenre ?? ""}:${provider}:${settledText}:${order}:${evidence}`)
				})] })
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-medium text-fg",
						children: "Where topic coverage needs work"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Public sources ranked by titles without a supported topic. Counts refresh with your catalog."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 space-y-2",
						children: index.gaps.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap justify-between gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "text-fg hover:text-accent",
								onClick: () => {
									useLibrary.getState().setQuery("");
									useLibrary.getState().setSource(s.id);
								},
								children: folders.find((f) => f.id === s.id)?.name ?? "Unavailable source"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [
									s.total - s.linked,
									" unlinked · ",
									Math.round(s.linked / s.total * 100),
									"% connected"
								]
							})]
						}, s.id))
					})
				]
			})
		]
	});
}
//#endregion
export { TopicLinks as t };
