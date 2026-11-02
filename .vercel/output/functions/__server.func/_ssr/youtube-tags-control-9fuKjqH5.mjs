import { o as __toESM } from "../_runtime.mjs";
import { I as forEachCatalogSlice, Tt as twitchIdentity, c as adultFolderIds, zt as yieldCatalogTask } from "./twitch-retry-D5SsgGzE.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BBe1bZ7q.mjs";
import { An as isCatalogDeleted, Ci as recordFileIdentity, Cn as hydrateFileIdentities, Go as youtubeTextTags, Lt as confidenceBand, Mo as videoIsPrivate, Uo as youtubeTagEvidence, Wo as youtubeTagTitleHash, _o as subscribeFileIdentities, an as forgetMediaObservation, do as sourcesInMask, en as fileIdentitySnapshot, fr as mediaBasis, hr as mediaStatusLabel, in as fingerprintFile, pr as mediaHealthSnapshot, vo as subscribeMediaHealth, wn as hydrateMediaHealth, ya as sameFileFingerprint } from "./persist-BLKyjE-q.mjs";
import { C as fetchYoutubeVideoMetadata, _t as Input } from "./library-app-CdyqOeNr.mjs";
import { b as resolveLocalFile } from "./scan-BggpJjjz.mjs";
import { o as youtubeDownloadTarget } from "./youtube-download-CKPVbpaB.mjs";
import { Et as youtubeTagConfidenceReport, T as isAdultVideo, yt as useLibrary } from "./store-tNfphKUZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/youtube-tags-control-9fuKjqH5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function collectRecoveryGroups(videos, folders, unavailable, ledger, all, signal, query = "", unlocked = false) {
	const groups = /* @__PURE__ */ new Map(), seen = /* @__PURE__ */ new Set(), byFolder = new Map(folders.map((f) => [f.id, f])), privateIds = adultFolderIds(folders);
	const add = (video) => {
		const row = ledger.entries[video.id], folder = byFolder.get(video.folderId);
		if (video.isSample || video.remote && video.remote.kind !== "twitch" || !row && !unavailable[video.id] && !(!video.remote && folder?.needsPermission)) return;
		const privateSource = videoIsPrivate(privateIds, video) || row?.private === true;
		if (query.trim() && (privateSource && !unlocked || !video.name.toLowerCase().includes(query.trim().toLowerCase()))) return;
		if (!all && row && (row.status === "available" || row.choice !== "review")) return;
		if (row) seen.add(video.id);
		const remote = !!video.remote, id = remote ? "twitch" : video.folderId, sourcePrivate = privateSource;
		let group = groups.get(id);
		if (!group) {
			group = {
				id,
				name: remote ? "Twitch videos & clips" : folder?.name ?? "Disconnected local source",
				private: sourcePrivate,
				remote,
				count: 0,
				videos: []
			};
			groups.set(id, group);
		}
		group.private ||= sourcePrivate;
		group.count++;
		const at = (v) => ledger.entries[v.id]?.at ?? 0;
		let index = 0;
		while (index < group.videos.length && (at(group.videos[index]) < at(video) || at(group.videos[index]) === at(video) && group.videos[index].id.localeCompare(video.id) <= 0)) index++;
		if (index < 20) {
			group.videos.splice(index, 0, video);
			if (group.videos.length > 20) group.videos.pop();
		}
	};
	await forEachCatalogSlice(videos, (video) => {
		signal.throwIfAborted();
		add(video);
	}, yieldCatalogTask);
	for (const row of Object.values(ledger.entries)) {
		signal.throwIfAborted();
		if (!seen.has(row.video.id)) add(row.video);
	}
	return [...groups.values()];
}
function FileIdentityReview({ video, onComplete }) {
	const ledger = (0, import_react.useSyncExternalStore)(subscribeFileIdentities, fileIdentitySnapshot, fileIdentitySnapshot), record = ledger.fingerprints[video.id];
	const folders = useLibrary((s) => s.folders), unlocked = useLibrary((s) => s.adultsUnlocked), apply = useLibrary((s) => s.applyLocalIdentityMove);
	const privateSource = record?.private || isAdultVideo(video, folders), [query, setQuery] = (0, import_react.useState)(""), [candidates, setCandidates] = (0, import_react.useState)([]), [target, setTarget] = (0, import_react.useState)(), [proof, setProof] = (0, import_react.useState)(), [ack, setAck] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(false), [message, setMessage] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	const work = (0, import_react.useRef)(void 0), alive = (0, import_react.useRef)(true), verifiedFile = (0, import_react.useRef)(void 0);
	const [committing, setCommitting] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		alive.current = true;
		hydrateFileIdentities().catch((e) => setError(e instanceof Error ? e.message : "Identity records could not load."));
		return () => {
			alive.current = false;
			work.current?.abort();
		};
	}, []);
	const run = async (task) => {
		work.current?.abort();
		const controller = new AbortController();
		work.current = controller;
		setBusy(true);
		setError("");
		setMessage("");
		try {
			await task(controller.signal);
		} catch (e) {
			if (alive.current) setError(e instanceof Error ? e.message : "Identity review failed.");
		} finally {
			if (alive.current && work.current === controller) {
				setBusy(false);
				setCommitting(false);
			}
		}
	};
	const progress = (done, total) => {
		if (alive.current) setMessage("Reading selected file locally · " + Math.round(done / Math.max(1, total) * 100) + "%");
	};
	if (privateSource && !unlocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-sm text-muted",
		children: "Unlock private media to review this identity."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "File identity review for " + video.name,
		className: "mt-4 space-y-3 rounded-lg border border-border bg-bg p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-medium",
				children: "Verified file identity"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: "Record a complete SHA-256 fingerprint while the original file is readable. After moving it, add its destination to your library and verify both contents. Matching names or sizes never link files automatically. This changes metadata; it does not move or copy media files."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "break-words text-xs text-muted",
				children: [
					"Original · ",
					video.name,
					record ? " · Recorded " + record.proof.digest.slice(0, 16) + "…" : " · No fingerprint recorded"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11 max-w-full whitespace-normal",
				disabled: busy,
				onClick: () => void run(async (signal) => {
					if (useLibrary.getState().scanning) throw Error("Wait for the source scan to finish before recording its identity.");
					const file = await resolveLocalFile(video);
					const fingerprint = await fingerprintFile(file, signal, progress);
					signal.throwIfAborted();
					setCommitting(true);
					await recordFileIdentity(video, fingerprint, !!privateSource);
					setProof(void 0);
					setAck(false);
					setMessage("Original fingerprint recorded. No files or saved marks changed.");
				}),
				children: "Record original fingerprint"
			}),
			record && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						disabled: busy,
						"aria-label": "Find a moved file in the library",
						placeholder: "Search destination filename or path",
						value: query,
						onChange: (e) => {
							setQuery(e.target.value);
							setCandidates([]);
							setTarget(void 0);
							setProof(void 0);
							setAck(false);
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						disabled: busy || !query.trim(),
						onClick: () => void run(async (signal) => {
							const state = useLibrary.getState(), rows = [];
							const words = query.trim().toLowerCase();
							for (let i = 0; i < state.videos.length && rows.length < 20; i++) {
								signal.throwIfAborted();
								const candidate = state.videos[i];
								if (!candidate.remote && !candidate.isSample && !candidate.localIdentity && candidate.id !== video.id && isAdultVideo(candidate, state.folders) === !!privateSource && (candidate.name + " " + candidate.path).toLowerCase().includes(words)) rows.push(candidate);
								if (i % 128 === 0) await yieldCatalogTask();
							}
							setCandidates(rows);
							setMessage(rows.length ? "Choose one destination to inspect. Nothing has been linked." : "No eligible destination found. Add its source folder first, then search again.");
						}),
						children: "Find destinations"
					})]
				}),
				candidates.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: target?.id === candidate.id ? "default" : "secondary",
					className: "min-h-11 w-full justify-start whitespace-normal break-words text-left",
					disabled: busy,
					"aria-label": "Choose destination " + candidate.name,
					onClick: () => {
						setTarget(candidate);
						setProof(void 0);
						setAck(false);
						setMessage("Destination selected. Verify its full contents before applying.");
					},
					children: [
						candidate.name,
						" · ",
						candidate.size.toLocaleString(),
						" bytes"
					]
				}, candidate.id)),
				target && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 rounded-md border border-border p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-words text-xs text-muted",
							children: ["Destination · ", target.path]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: busy,
							onClick: () => void run(async (signal) => {
								const file = await resolveLocalFile(target);
								if (file.size !== target.size) throw Error("The destination size changed. Rescan its source before verifying.");
								const fingerprint = await fingerprintFile(file, signal, progress);
								signal.throwIfAborted();
								if (!sameFileFingerprint(record.proof, fingerprint)) throw Error("These files have different complete fingerprints. Nothing was linked; saved marks remain on the original identity.");
								verifiedFile.current = file;
								setProof(fingerprint);
								setAck(false);
								setMessage("Complete fingerprints match. Review the mapping before applying.");
							}),
							children: "Verify destination contents"
						}),
						proof && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-start gap-3 text-xs leading-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "mt-1",
								"aria-label": "I reviewed this verified file move",
								checked: ack,
								onChange: (e) => setAck(e.target.checked)
							}), "Keep the original media ID and its saved marks at this verified location. An already rated, watched, saved or manually tagged destination will be rejected for separate conflict review. Close playback or room sessions for these files first."]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "min-h-11 max-w-full whitespace-normal",
							disabled: busy || !ack,
							onClick: () => void run(async (signal) => {
								signal.throwIfAborted();
								const file = verifiedFile.current;
								if (!file) throw Error("Verify the selected file again.");
								const currentProof = await fingerprintFile(file, signal, progress);
								signal.throwIfAborted();
								setCommitting(true);
								await apply(video.id, target, currentProof, ledger.revision, file);
								if (alive.current) {
									setMessage("Verified location applied. Original ratings, history, resume and reviews retain their ID.");
									onComplete?.();
								}
							}),
							children: "Apply verified file move"
						})] })
					]
				})
			] }),
			busy && !committing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11",
				onClick: () => work.current?.abort(),
				children: "Cancel file inspection"
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-xs leading-5 text-accent",
				children: message
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-xs leading-5 text-danger",
				children: error
			})
		]
	});
}
function FileIdentityPanel() {
	const ledger = (0, import_react.useSyncExternalStore)(subscribeFileIdentities, fileIdentitySnapshot, fileIdentitySnapshot), unlocked = useLibrary((s) => s.adultsUnlocked), undo = useLibrary((s) => s.undoLocalIdentityMove);
	const [selected, setSelected] = (0, import_react.useState)(), [limit, setLimit] = (0, import_react.useState)(12), [moveLimit, setMoveLimit] = (0, import_react.useState)(12), [error, setError] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(""), [message, setMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		hydrateFileIdentities().catch((e) => setError(e instanceof Error ? e.message : "Identity records could not load."));
	}, []);
	const records = Object.values(ledger.fingerprints);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "File identity history",
		className: "mt-5 space-y-3 rounded-lg border border-border bg-elevated p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "File identities & moves"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: "Open a local title’s preview to record its identity before moving it. Reopen its recorded identity here even when the old location is unavailable. Each approved move keeps the original ID; Undo changes the location back and retains subsequent saved marks."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					records.length,
					" recorded identities · ",
					ledger.moves.filter((row) => row.active).length,
					" ",
					"active moves · ",
					ledger.moves.length,
					"/128 move history records. Content inspection runs only on request or when rescanning an approved alias location; unrelated files are not hashed. A first playback after reload may need to reverify a moved file."
				]
			}),
			records.slice(0, limit).map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md bg-bg p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "min-w-0 flex-1 break-words text-sm",
					children: record.private && !unlocked ? "Private recorded identity" : record.video.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: record.private && !unlocked,
					"aria-label": record.private && !unlocked ? "Review private recorded identity" : "Review recorded identity " + record.video.name,
					onClick: () => setSelected(record.video),
					children: "Review identity"
				})]
			}, record.video.id)),
			records.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11",
				onClick: () => setLimit((n) => n + 12),
				children: "Show 12 more recorded identities"
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIdentityReview, {
				video: selected,
				onComplete: () => setSelected(void 0)
			}, selected.id), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "min-h-11",
				onClick: () => setSelected(void 0),
				children: "Close identity review"
			})] }),
			ledger.moves.slice(0, moveLimit).map((move) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-words text-sm",
						children: move.private && !unlocked ? "Private file move" : move.after.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							move.active ? "Active verified location" : move.undoneAt ? "Undone" : "Superseded by a later move",
							" ",
							"· ",
							new Date(move.at).toLocaleDateString()
						]
					})]
				}), move.active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: !!busy || move.private && !unlocked,
					"aria-label": move.private && !unlocked ? "Undo private file move" : "Undo file move for " + move.after.name,
					onClick: () => {
						setBusy(move.id);
						setError("");
						undo(move.id, ledger.revision).then(() => setMessage("Previous location restored. Saved marks were kept; reconnect its source if the file is unavailable.")).catch((e) => setError(e instanceof Error ? e.message : "Undo failed. Previous mapping was kept.")).finally(() => setBusy(""));
					},
					children: "Undo file move"
				})]
			}, move.id)),
			ledger.moves.length > moveLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11",
				onClick: () => setMoveLimit((n) => n + 12),
				children: "Show 12 more file moves"
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-sm text-accent",
				children: message
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error
			})
		]
	});
}
function MediaHealthActions({ video }) {
	const ledger = (0, import_react.useSyncExternalStore)(subscribeMediaHealth, mediaHealthSnapshot, mediaHealthSnapshot), check = useLibrary((s) => s.checkMediaHealth), folders = useLibrary((s) => s.folders), unlocked = useLibrary((s) => s.adultsUnlocked);
	const [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), work = (0, import_react.useRef)(void 0), alive = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		alive.current = true;
		hydrateMediaHealth().catch((e) => setError(e instanceof Error ? e.message : "Recovery could not load."));
		return () => {
			alive.current = false;
			work.current?.abort();
		};
	}, []);
	if (video.isSample || !mediaBasis(video)) return null;
	if (isAdultVideo(video, folders) && !unlocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs text-muted",
		children: "Unlock private media to review availability."
	});
	const row = ledger.entries[video.id];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Selected media availability",
		className: "mt-4 space-y-2 rounded-md border border-border p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					row ? mediaStatusLabel(row.status) : "Availability has not been checked.",
					" ",
					row?.lastConfirmed && row.status !== row.lastConfirmed ? "Previous verified observation kept." : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: video.remote ? "Checks only this public Twitch VOD or clip. An embed error does not prove expiry, deletion or access rights." : "Checks only this selected file and its granted source. No file is deleted or moved."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11",
				disabled: busy,
				onClick: () => {
					const controller = new AbortController();
					work.current = controller;
					setBusy(true);
					setError("");
					check(video, controller.signal).catch((e) => {
						if (alive.current) setError(e instanceof Error ? e.message : "Check failed.");
					}).finally(() => {
						if (alive.current) setBusy(false);
					});
				},
				children: busy ? "Checking selected title…" : "Check selected title availability"
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "min-h-11",
				onClick: () => work.current?.abort(),
				children: "Cancel availability check"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-xs text-danger",
				children: error
			})
		]
	});
}
function MediaRecoveryPanel() {
	const ledger = (0, import_react.useSyncExternalStore)(subscribeMediaHealth, mediaHealthSnapshot, mediaHealthSnapshot), unlocked = useLibrary((s) => s.adultsUnlocked), check = useLibrary((s) => s.checkMediaHealth), choose = useLibrary((s) => s.chooseMediaRecovery), remove = useLibrary((s) => s.removeVideo), reconnect = useLibrary((s) => s.reconnectMediaSource), rescan = useLibrary((s) => s.restoreOne), addFolder = useLibrary((s) => s.addFolder);
	const [query, setQuery] = (0, import_react.useState)(""), [open, setOpen] = (0, import_react.useState)(false), [groups, setGroups] = (0, import_react.useState)([]), [all, setAll] = (0, import_react.useState)(false), [limit, setLimit] = (0, import_react.useState)(12), [busy, setBusy] = (0, import_react.useState)(""), [cancelable, setCancelable] = (0, import_react.useState)(false), [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), [selected, setSelected] = (0, import_react.useState)(), [confirm, setConfirm] = (0, import_react.useState)(), [forget, setForget] = (0, import_react.useState)();
	const work = (0, import_react.useRef)(void 0), alive = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		alive.current = true;
		hydrateMediaHealth().catch((e) => setError(e instanceof Error ? e.message : "Recovery records could not load."));
		return () => {
			alive.current = false;
			work.current?.abort();
		};
	}, []);
	const refresh = async (signal, includeAll = all) => {
		await hydrateMediaHealth();
		signal.throwIfAborted();
		const state = useLibrary.getState(), next = await collectRecoveryGroups(state.videos, state.folders, state.unavailable, mediaHealthSnapshot(), includeAll, signal, query, state.adultsUnlocked);
		signal.throwIfAborted();
		if (alive.current) setGroups(next.map((group) => ({
			...group,
			videos: group.videos.filter((video) => !isCatalogDeleted(video))
		})).filter((group) => group.videos.length));
	};
	const run = (label, canCancel, task) => {
		if (busy) return;
		const controller = new AbortController();
		work.current = controller;
		setBusy(label);
		setCancelable(canCancel);
		setError("");
		setNote("");
		task(controller.signal).catch((e) => {
			if (alive.current) setError(e instanceof Error ? e.message : "Recovery failed. Existing bookmarks were kept.");
		}).finally(() => {
			if (alive.current) {
				setBusy("");
				setCancelable(false);
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Media recovery",
		className: "mt-5 space-y-3 rounded-lg border border-border bg-elevated p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Media recovery"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: "Review unavailable Twitch videos and disconnected local sources without losing bookmarks, ratings, notes or resume. Checks start only from these controls. A missing drive or a temporary error never proves deletion."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [Object.keys(ledger.entries).length, "/1,024 recovery records. Source groups retain at most 20 visible candidates each; refresh after repairing a batch to find the next entries. Saved recovery choices travel with library backups."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: !!busy,
					onClick: () => {
						setOpen(true);
						run("Preparing review", true, (signal) => refresh(signal));
					},
					children: open ? "Refresh affected media" : "Review affected media"
				}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: !!busy,
					onClick: () => {
						const next = !all;
						setAll(next);
						run("Preparing review", true, (signal) => refresh(signal, next));
					},
					children: all ? "Show unresolved only" : "Include checked bookmarks"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "min-h-11",
					disabled: !!busy,
					onClick: () => {
						setOpen(false);
						setGroups([]);
						setSelected(void 0);
					},
					children: "Close media review"
				})] })]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"aria-label": "Find an affected title",
					value: query,
					disabled: !!busy,
					placeholder: "Search affected title names",
					onChange: (e) => setQuery(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: !!busy,
					onClick: () => run("Finding affected titles", true, (signal) => refresh(signal)),
					children: "Find affected titles"
				})]
			}),
			open && !busy && !groups.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No affected media in this view. Open a title preview to check an individual Twitch item or local file."
			}),
			open && groups.slice(0, limit).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": group.private && !unlocked ? "Private source recovery" : "Recovery source " + group.name,
				className: "space-y-3 rounded-md border border-border bg-bg p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "break-words font-medium",
					children: [
						group.private && !unlocked ? "Private source" : group.name,
						" · ",
						group.count,
						" affected"
					]
				}), group.private && !unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Unlock private media to review this source."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "min-h-11 max-w-full whitespace-normal",
						disabled: !!busy,
						onClick: () => run("Checking selected source entries", true, async (signal) => {
							let done = 0;
							for (const video of group.videos) {
								signal.throwIfAborted();
								if (isCatalogDeleted(video)) continue;
								await check(video, signal);
								done++;
								if (alive.current) setNote("Checked " + done + " / " + group.videos.length + " selected entries. Earlier results stay saved if cancelled.");
							}
							await refresh(signal);
						}),
						children: [
							"Check next ",
							group.videos.length,
							" ",
							group.videos.length === 1 ? "entry" : "entries"
						]
					}), !group.remote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						disabled: !!busy,
						onClick: () => run("Reconnecting source", false, async () => {
							await reconnect(group.id);
							setNote("Folder access granted. Check the selected entries or explicitly rescan this folder.");
						}),
						children: "Reconnect permission"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						disabled: !!busy,
						onClick: () => run("Rescanning selected source", false, async (signal) => {
							await rescan(group.id);
							await refresh(signal);
							setNote("Selected folder rescanned. Missing bookmarks and all saved marks were retained.");
						}),
						children: "Rescan this folder"
					})] })]
				}), group.videos.map((video) => {
					const row = ledger.entries[video.id], identity = video.remote ? twitchIdentity(video.remote, video.extension) : void 0, url = identity?.kind === "vod" ? "https://www.twitch.tv/videos/" + identity.value : identity?.kind === "clip" ? "https://clips.twitch.tv/" + identity.value : void 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "space-y-2 rounded-md bg-elevated p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "break-words text-sm font-medium",
								children: video.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs leading-5 text-muted",
								children: [
									row ? mediaStatusLabel(row.status) : "Source access or legacy playback error needs checking.",
									row?.at ? " · " + new Date(row.at).toLocaleString() : "",
									row?.lastConfirmed && row.status !== row.lastConfirmed ? " · Previous verified observation kept." : "",
									" ",
									row?.choice === "hidden" ? "Hidden by your recovery choice." : row?.choice === "bookmark" ? "Kept as a bookmark." : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										className: "min-h-11",
										disabled: !!busy,
										onClick: () => run("Checking selected title", true, async (signal) => {
											await check(video, signal);
											setNote("Selected title checked. No visibility choice changed.");
										}),
										children: "Check this title"
									}),
									url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: url,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "inline-flex min-h-11 items-center text-xs text-accent",
										children: "Open official Twitch page"
									}),
									!video.remote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										className: "min-h-11",
										disabled: !!busy,
										onClick: () => setSelected(video),
										children: "Review verified identity"
									}),
									row && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "secondary",
											className: "min-h-11",
											disabled: !!busy,
											onClick: () => run("Saving bookmark choice", false, async () => {
												await choose(video.id, "bookmark");
												setNote("Bookmark retained. Saved feedback is unchanged; playback availability is separate.");
											}),
											children: "Keep bookmark"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "secondary",
											className: "min-h-11",
											disabled: !!busy,
											onClick: () => run("Saving hidden choice", false, async () => {
												await choose(video.id, "hidden");
												setNote("Hidden from browsing. Keep bookmark reverses this choice; no source media was deleted.");
											}),
											children: "Hide from browsing"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											className: "min-h-11",
											disabled: !!busy,
											onClick: () => setConfirm(video),
											children: "Remove saved title"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											className: "min-h-11",
											disabled: !!busy,
											onClick: () => setForget(video),
											children: "Forget check record"
										})
									] })
								]
							})
						]
					}, video.id);
				})] })]
			}, group.id)),
			open && groups.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11",
				onClick: () => setLimit((n) => n + 12),
				children: "Show 12 more source groups"
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIdentityReview, {
				video: selected,
				onComplete: () => setSelected(void 0)
			}, selected.id), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: !!busy,
					onClick: () => run("Adding destination source", false, () => addFolder()),
					children: "Add destination folder"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "min-h-11",
					onClick: () => setSelected(void 0),
					children: "Close identity repair"
				})]
			})] }),
			confirm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "group",
				"aria-label": "Confirm recovery removal",
				className: "space-y-3 rounded-md border border-border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "break-words text-sm",
						children: [
							"Remove",
							" ",
							isAdultVideo(confirm, useLibrary.getState().folders) && !unlocked ? "this private title" : confirm.name,
							" ",
							"from the saved catalog? Its source file is untouched. Ratings, notes, history and resume stay saved. Restore this one title in Settings → Removed titles; recovery records do not expire automatically."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						disabled: !!busy,
						onClick: () => setConfirm(void 0),
						children: "Cancel removal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11",
						disabled: !!busy || isAdultVideo(confirm, useLibrary.getState().folders) && !unlocked,
						onClick: () => run("Removing selected title", false, async (signal) => {
							await remove(confirm.id);
							if (!isCatalogDeleted(confirm)) throw Error("Removal was not saved. Existing title was kept.");
							setConfirm(void 0);
							await refresh(signal);
							setNote("Title removed. Restore it individually from Removed titles; saved marks were kept.");
						}),
						children: "Confirm remove saved title"
					})
				]
			}),
			forget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "group",
				"aria-label": "Confirm forget recovery record",
				className: "space-y-3 rounded-md border border-border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "Forget this selected availability check and its recovery-choice timestamp? The title, source media, ratings, notes, history and resume stay unchanged. Current hidden state stays unchanged. Export a backup first to retain this diagnostic; a forgotten check has no automatic Undo."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						disabled: !!busy,
						onClick: () => setForget(void 0),
						children: "Keep check record"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11",
						disabled: !!busy || isAdultVideo(forget, useLibrary.getState().folders) && !unlocked,
						onClick: () => run("Forgetting selected check", false, async (signal) => {
							await forgetMediaObservation(forget.id);
							setForget(void 0);
							await refresh(signal);
							setNote("Selected check record forgotten. Saved media and personal marks were kept.");
						}),
						children: "Confirm forget check record"
					})
				]
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "text-sm text-muted",
				children: [busy, "…"]
			}),
			busy && cancelable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11",
				onClick: () => work.current?.abort(),
				children: "Cancel remaining checks"
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-sm text-accent",
				children: note
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error
			})
		]
	});
}
var labels = {
	"video-tag": "Creator video tag",
	hashtag: "Hashtag",
	chapter: "Chapter phrase",
	title: "Title",
	description: "Description prose"
};
function YoutubeTagSuggestions({ video }) {
	const tags = useLibrary((state) => state.tags[video.id]), provenance = useLibrary((state) => state.metadataProvenance[video.id]);
	const [open, setOpen] = (0, import_react.useState)(false), [page, setPage] = (0, import_react.useState)(0), [selected, select] = (0, import_react.useState)([]), [expanded, expand] = (0, import_react.useState)(""), [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	const evidence = (0, import_react.useMemo)(() => youtubeTextTags(video), [video]);
	const base = (0, import_react.useMemo)(() => ({
		tags,
		provenance,
		summary: video.remote?.youtubeTagSummary,
		checkedAt: video.remote?.youtubeTagsCheckedAt
	}), [
		tags,
		provenance,
		video.remote?.youtubeTagSummary,
		video.remote?.youtubeTagsCheckedAt
	]);
	(0, import_react.useEffect)(() => {
		select([]);
		expand("");
		setPage(0);
	}, [base, video.id]);
	(0, import_react.useEffect)(() => {
		setNote("");
		setError("");
	}, [video.id]);
	const locked = Boolean(provenance?.lockedFields?.includes("tags")), fresh = Boolean(base.checkedAt && base.summary?.version === 4 && base.summary.scores && base.summary.signals && base.summary.titleHash === youtubeTagTitleHash(video.name));
	const rows = (0, import_react.useMemo)(() => evidence.tags.map((tag, index) => ({
		tag,
		score: evidence.scores[index] ?? 0,
		signals: evidence.signals[index] ?? 0
	})).sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag)), [evidence]);
	const offset = Math.min(page * 8, Math.max(0, Math.ceil(rows.length / 8) - 1) * 8), reviews = (tags ?? []).slice(0, 32).flatMap((tag) => provenance?.youtubeReviews?.[tag] ? [[tag, provenance.youtubeReviews[tag]]] : []).sort((a, b) => b[1].at - a[1].at);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-tag-confidence": true,
		className: "rounded-lg border border-border px-3",
		onToggle: (event) => setOpen(event.currentTarget.open),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
			className: "min-h-11 cursor-pointer py-3 text-sm font-medium",
			children: ["Recommended tags · ", rows.length]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 pb-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "Evidence scores describe field agreement, not probabilities. High: 80–100; medium: 50–79; low: 0–49. Only high-confidence tags join automatic enrichment. Medium and low suggestions need your review; repeated words and hashtags alone cannot raise confidence."
				}),
				!fresh && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "Pull this video’s tags and description to prepare current, reviewable evidence. Older saved labels stay visible."
				}),
				locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs leading-5 text-muted",
					children: "Your tag field is locked. Suggestions remain visible; use Edit tags to make your own changes."
				}),
				!rows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No supported tag suggestions from the available metadata."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					"aria-label": "Recommended YouTube tags",
					className: "grid gap-2 sm:grid-cols-2",
					children: rows.slice(offset, offset + 8).map((row) => {
						const source = provenance?.tags[row.tag], protectedTag = source === "manual" || source === "youtube-review" || tags?.includes(row.tag) && !source, isSaved = tags?.includes(row.tag);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							"data-confidence": confidenceBand(row.score),
							className: "min-w-0 rounded-md bg-bg p-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										"aria-label": "Select suggested tag " + row.tag,
										disabled: locked || !fresh || protectedTag,
										checked: selected.includes(row.tag),
										onChange: (event) => select((current) => event.target.checked ? [...current, row.tag] : current.filter((tag) => tag !== row.tag))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 break-words font-medium",
										children: ["#", row.tag]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "leading-5 text-accent",
									children: [
										confidenceBand(row.score),
										" confidence · ",
										row.score,
										"/100"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 leading-5 text-muted",
									children: sourcesInMask(row.signals).map((source) => labels[source]).join(" + ") || "No current confidence evidence"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-muted",
									children: source === "youtube-review" ? "Accepted by you" : source === "manual" ? "Your manual tag" : isSaved ? "Saved provider tag" : row.score >= 80 ? "Eligible for automatic enrichment" : "Review only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									className: "mt-2 min-h-11",
									"aria-expanded": expanded === row.tag,
									onClick: () => expand((current) => current === row.tag ? "" : row.tag),
									children: ["Evidence for ", row.tag]
								}),
								expanded === row.tag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1 space-y-2 text-muted",
									children: youtubeTagEvidence(video, row.tag).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: labels[item.source]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 break-words leading-5",
										children: item.excerpt
									})] }, item.source))
								})
							]
						}, row.tag);
					})
				}),
				rows.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: !offset,
							onClick: () => {
								setPage(offset / 8 - 1);
								expand("");
							},
							children: "Previous tag suggestions"
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
							onClick: () => {
								setPage(offset / 8 + 1);
								expand("");
							},
							children: "Next tag suggestions"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							onClick: () => {
								try {
									const url = URL.createObjectURL(new Blob([JSON.stringify(youtubeTagConfidenceReport(video, provenance), null, 2)], { type: "application/json" })), anchor = document.createElement("a");
									anchor.href = url;
									anchor.download = "youtube-tag-evidence-" + (video.remote?.videoId ?? "video") + ".json";
									anchor.click();
									setTimeout(() => URL.revokeObjectURL(url), 1e3);
								} catch {
									setError("Evidence export could not be prepared. Try again.");
								}
							},
							children: "Export tag evidence"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "min-h-11",
							disabled: !selected.length || locked || !fresh,
							onClick: () => {
								try {
									const count = useLibrary.getState().acceptYoutubeTagSuggestions(video.id, selected, base);
									select([]);
									setError("");
									setNote(count + " reviewed tag" + (count === 1 ? "" : "s") + " accepted with confidence provenance. Existing manual choices are preserved.");
								} catch (cause) {
									select([]);
									setError(cause instanceof Error ? cause.message : "Tags could not be accepted.");
								}
							},
							children: ["Accept selected tags", selected.length ? " · " + selected.length : ""]
						}),
						selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							onClick: () => select([]),
							children: "Clear tag selection"
						})
					]
				}),
				note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs leading-5 text-muted",
					children: note
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-xs leading-5 text-danger",
					children: error
				}),
				reviews.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					"data-accepted-tag-evidence": true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
							className: "min-h-11 cursor-pointer content-center text-xs font-medium",
							children: ["Accepted tag evidence · ", reviews.length]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2 text-xs text-muted",
							children: reviews.slice(0, 8).map(([tag, review]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "break-words leading-5",
								children: [
									"#",
									tag,
									" · ",
									review.score,
									"/100 at acceptance · ",
									sourcesInMask(review.signals).map((source) => labels[source]).join(" + "),
									" · ",
									new Date(review.at).toLocaleDateString()
								]
							}, tag))
						}),
						reviews.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Showing the eight latest accepted tags. Accepted evidence stays with your saved tag provenance."
						})
					]
				})
			]
		})]
	});
}
function YoutubeTagsControl({ video }) {
	const [busy, setBusy] = (0, import_react.useState)(false), [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const generation = (0, import_react.useRef)(0), running = (0, import_react.useRef)(false);
	const retryIds = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		generation.current++;
		running.current = false;
		retryIds.current.clear();
		setBusy(false);
		setResults([]);
		setError("");
		setNote("");
		return () => {
			generation.current++;
			running.current = false;
		};
	}, [video?.id]);
	if (video && video.remote?.kind !== "youtube") return null;
	const run = async () => {
		if (running.current) return;
		running.current = true;
		setBusy(true);
		setError("");
		setResults([]);
		const revision = ++generation.current, current = () => generation.current === revision;
		const targets = [];
		let visited = 0;
		for (const row of video ? [video] : useLibrary.getState().videos) {
			if (++visited % 512 === 0) {
				await yieldCatalogTask();
				if (!current()) return;
			}
			if (row.remote?.kind !== "youtube" || row.remote.live || row.remote.youtubeType === "upcoming") continue;
			if (!video && row.remote.youtubeTagsCheckedAt && !retryIds.current.has(row.id)) continue;
			if (youtubeDownloadTarget(row)) targets.push(row);
			if (targets.length === 5) break;
		}
		const report = [];
		try {
			if (!targets.length) {
				setNote("Every eligible saved video has been checked. Open a video to refresh its tags. Live and upcoming streams are skipped.");
				return;
			}
			for (const [index, row] of targets.entries()) {
				if (!current()) break;
				setNote(`Pulling video ${index + 1} of ${targets.length}: ${row.name}`);
				try {
					const metadata = await fetchYoutubeVideoMetadata({ data: { id: youtubeDownloadTarget(row).videoId } });
					if (!current()) break;
					const saved = await useLibrary.getState().setYoutubeMetadata(row.id, metadata);
					retryIds.current.delete(row.id);
					report.push({
						id: row.id,
						title: row.name,
						detail: `${metadata.keywords?.length ?? 0} creator tags · ${saved.tags} suggestions prepared${saved.locked ? " · your tag lock kept; suggestions available in the preview" : " · only high-confidence enrichment saved"}${metadata.description ? " · full description checked" : ""}`
					});
				} catch (cause) {
					if (!current()) break;
					retryIds.current.add(row.id);
					const message = cause instanceof Error ? cause.message : "YouTube metadata is unavailable.";
					report.push({
						id: row.id,
						title: row.name,
						detail: message,
						failed: true
					});
					setError(`${message} Remaining videos were not requested. Try again when YouTube is available.`);
					break;
				}
				if (current()) setResults([...report]);
			}
			if (current()) {
				setResults(report);
				setNote(`${report.filter((row) => !row.failed).length} video${report.filter((row) => !row.failed).length === 1 ? "" : "s"} saved. Manual tags and locked fields stay protected.`);
			}
		} finally {
			if (current()) {
				running.current = false;
				setBusy(false);
			}
		}
	};
	const stream = Boolean(video?.remote?.live || video?.remote?.youtubeType === "upcoming");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: busy || stream,
					onClick: () => void run(),
					children: busy ? "Pulling YouTube tags…" : video ? "Pull video tags & description" : "Pull tags for next 5 videos"
				}), busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "min-h-11",
					onClick: () => {
						generation.current++;
						running.current = false;
						setBusy(false);
						setNote("Stopped. Completed saves were kept. A save already underway may finish; remaining videos will not be requested.");
					},
					children: "Stop tag pull"
				})]
			}),
			stream && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Pull tags after this stream ends."
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "break-words text-xs leading-5 text-muted",
				children: note
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "break-words text-xs leading-5 text-danger",
				children: error
			}),
			results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				"aria-label": "YouTube tag pull results",
				className: "divide-y divide-border rounded-lg border border-border px-3",
				children: results.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-words text-xs font-medium",
						children: row.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-1 break-words text-xs leading-5 ${row.failed ? "text-danger" : "text-muted"}`,
						children: row.detail
					})]
				}, row.id))
			}),
			video?.remote?.youtubeTagsCheckedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"Video metadata checked ",
					new Date(video.remote.youtubeTagsCheckedAt).toLocaleString(),
					" · ",
					video.remote.youtubeKeywords?.length ?? 0,
					" creator tags"
				]
			}),
			video && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeTagSuggestions, { video })
		]
	});
}
//#endregion
export { YoutubeTagsControl as a, MediaRecoveryPanel as i, FileIdentityReview as n, MediaHealthActions as r, FileIdentityPanel as t };
