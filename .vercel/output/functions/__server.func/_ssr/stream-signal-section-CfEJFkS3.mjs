import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { A as Save, D as Settings2, F as Radio, Ft as ExternalLink, Jt as Check, K as OctagonX, Lt as Download, M as RotateCcw, O as Send, Ot as FlaskConical, R as Play, T as Shield, et as Megaphone, g as Swords, j as Route, l as Undo2, rn as ArrowRight, ut as Link2, xt as HeartPulse, zt as Copy } from "../_libs/lucide-react.mjs";
import { $ as Button, En as createLocalId, Jn as listWorkspaceDocuments, Q as Input, lr as saveWorkspaceDocuments, tr as readWorkspaceDocument } from "./library-app-BtCPS7Tj.mjs";
import { s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
import { t as useCurrentUserState } from "./use-current-user-BNDPe2yv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stream-signal-section-CfEJFkS3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SIGNAL_PLATFORMS = [
	"x",
	"facebook",
	"instagram",
	"tiktok"
];
var SIGNAL_SITES = {
	x: {
		name: "X",
		url: "https://x.com/"
	},
	facebook: {
		name: "Facebook",
		url: "https://www.facebook.com/"
	},
	instagram: {
		name: "Instagram",
		url: "https://www.instagram.com/"
	},
	tiktok: {
		name: "TikTok",
		url: "https://www.tiktok.com/"
	}
};
var DEFAULT_SIGNAL_PROFILE = {
	creator: "notyoda",
	twitch: "https://www.twitch.tv/notyoda",
	youtube: "https://www.youtube.com/@astronauta2706",
	title: "On the grid with notyoda",
	game: "iRacing Arcade",
	message: "Come hang out, cheer on the laps, and join the community."
};
var SIGNAL_LIMITS = {
	creator: 60,
	twitch: 256,
	youtube: 256,
	title: 140,
	game: 80,
	message: 600
};
function signalOwnerPrefix(owner) {
	if (!owner) throw Error("A current app user is required.");
	return `stream-signal:v1:${encodeURIComponent(owner)}:`;
}
function validateSignalProfile(profile) {
	const errors = {};
	for (const field of Object.keys(SIGNAL_LIMITS)) {
		if (profile[field].length > SIGNAL_LIMITS[field]) errors[field] = `Use ${SIGNAL_LIMITS[field]} characters or fewer.`;
		if (field !== "message" && !profile[field].trim()) errors[field] = "This field is required.";
	}
	for (const kind of ["twitch", "youtube"]) try {
		const u = new URL(profile[kind].trim());
		const validHost = kind === "twitch" ? /^(?:www\.)?twitch\.tv$/i.test(u.hostname) : /^(?:www\.)?youtube\.com$/i.test(u.hostname);
		const validPath = kind === "twitch" ? /^\/[a-zA-Z0-9_]{1,25}\/?$/.test(u.pathname) : /^\/(?:@[\p{L}\p{N}_.%\-]+|channel\/UC[\w-]{22}|(?:c|user)\/[\w.%\-]+)\/?$/u.test(u.pathname);
		if (u.protocol !== "https:" || !validHost || !validPath || u.username || u.password || u.port || u.search || u.hash) throw Error();
	} catch {
		errors[kind] = kind === "twitch" ? "Use an HTTPS Twitch channel URL, such as https://www.twitch.tv/notyoda." : "Use an HTTPS YouTube @handle or channel URL.";
	}
	return errors;
}
function normalizeSignalProfile(raw) {
	const row = raw && typeof raw === "object" ? raw : {};
	return Object.fromEntries(Object.keys(SIGNAL_LIMITS).map((key) => [key, typeof row[key] === "string" ? row[key].slice(0, SIGNAL_LIMITS[key]) : DEFAULT_SIGNAL_PROFILE[key]]));
}
var short = (text, limit) => [...text].length <= limit ? text : [...text].slice(0, limit - 1).join("") + "…";
function generateSignalPack(input, id, at = Date.now()) {
	if (Object.keys(validateSignalProfile(input)).length) throw Error("Correct the channel setup fields before generating a pack.");
	const profile = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value.trim()]));
	const links = `Twitch: ${profile.twitch}\nYouTube: ${profile.youtube}`;
	const xLinks = `${profile.twitch}\n${profile.youtube}`;
	if ([...xLinks].length > 210) throw Error("These channel URLs are too long for a short X post. Use shorter channel links.");
	const headline = short(`${profile.creator} is live · ${profile.game}! ${profile.title}`, 279 - [...xLinks].length);
	const common = `${profile.creator} is live!\n${profile.title}\nPlaying ${profile.game}\n\n${profile.message}\n\n${links}`;
	return {
		id,
		createdAt: at,
		updatedAt: at,
		profile,
		shared: {},
		drafts: {
			x: `${headline}\n${xLinks}`,
			facebook: common,
			instagram: `${common}\n\nJoin the stream. Add a Link sticker to your Story or use your profile link. #LiveStream`,
			tiktok: `${profile.creator} is live playing ${profile.game}!\n${profile.title}\n${profile.message}\n\n${links}\n\nFind the stream through my profile link, if available. #Gaming #LiveStream`
		}
	};
}
function readSignalPack(raw) {
	if (!raw || typeof raw !== "object") throw Error("This saved pack is damaged. Your other packs are still available.");
	const p = raw;
	if (typeof p.id !== "string" || !/^pack:\d{13}:\w[\w-]*$/.test(p.id) || !Number.isFinite(p.createdAt) || !p.drafts || !SIGNAL_PLATFORMS.every((key) => typeof p.drafts[key] === "string" && p.drafts[key].length <= 6e3)) throw Error("This saved pack is damaged.");
	return {
		...p,
		profile: normalizeSignalProfile(p.profile),
		shared: Object.fromEntries(SIGNAL_PLATFORMS.filter((key) => Number.isFinite(p.shared?.[key])).map((key) => [key, p.shared[key]]))
	};
}
function composeOnX(text) {
	return `https://x.com/intent/post?${new URLSearchParams({ text })}`;
}
function exportSignalPack(pack) {
	return `STREAM SIGNAL — ${pack.profile.creator}\n${pack.profile.title}\nGame: ${pack.profile.game}\nCreated: ${new Date(pack.createdAt).toISOString()}\n\n${SIGNAL_PLATFORMS.map((key) => `${SIGNAL_SITES[key].name.toUpperCase()}\nSite: ${SIGNAL_SITES[key].url}\nChecklist: ${pack.shared[key] ? "manually marked shared" : "not marked shared"}\n\n${pack.drafts[key]}`).join("\n\n--------------------\n\n")}\n\nSTREAM LINKS\nTwitch: ${pack.profile.twitch}\nYouTube: ${pack.profile.youtube}\n\nChecklist marks are manual notes, not platform publication receipts.\n`;
}
/** Only changed, small documents are written. Page-hide recovery mirrors the
* pending edits, never the full pack archive or the media library. */
function useStreamSignal(owner) {
	const prefix = signalOwnerPrefix(owner), recoveryKey = prefix + "pending";
	const [ready, setReady] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	const [profile, setProfile] = (0, import_react.useState)(DEFAULT_SIGNAL_PROFILE);
	const [pack, setPack] = (0, import_react.useState)(null);
	const [archive, setArchive] = (0, import_react.useState)([]), [older, setOlder] = (0, import_react.useState)(false);
	const [cursors, setCursors] = (0, import_react.useState)([]), [paging, setPaging] = (0, import_react.useState)(false);
	const [dirty, setDirty] = (0, import_react.useState)(false), [saving, setSaving] = (0, import_react.useState)(false);
	const pending = (0, import_react.useRef)(/* @__PURE__ */ new Map()), writing = (0, import_react.useRef)(null);
	const timer = (0, import_react.useRef)(void 0), alive = (0, import_react.useRef)(true);
	const pageTicket = (0, import_react.useRef)(0);
	const mirror = (0, import_react.useCallback)(() => {
		if (!pending.current.size) return;
		try {
			localStorage.setItem(recoveryKey, JSON.stringify([...pending.current].map(([key, value]) => ({
				key,
				value
			}))));
		} catch {}
	}, [recoveryKey]);
	const flush = (0, import_react.useCallback)(async () => {
		clearTimeout(timer.current);
		if (writing.current) return writing.current;
		if (!pending.current.size) return;
		if (alive.current) setSaving(true);
		const job = (async () => {
			while (pending.current.size) {
				const rows = [...pending.current].map(([key, value]) => ({
					key,
					value
				}));
				await saveWorkspaceDocuments(rows);
				for (const row of rows) if (pending.current.get(row.key) === row.value) pending.current.delete(row.key);
			}
			try {
				localStorage.removeItem(recoveryKey);
			} catch {}
			if (alive.current) {
				setDirty(false);
				setError("");
			}
		})();
		writing.current = job;
		try {
			await job;
		} catch (e) {
			mirror();
			if (alive.current) setError(`Could not save Stream Signal. Keep this tab open, export your pack, or retry Save. ${e instanceof Error ? e.message : ""}`);
			throw e;
		} finally {
			writing.current = null;
			if (alive.current) setSaving(false);
		}
	}, [recoveryKey, mirror]);
	const queue = (0, import_react.useCallback)((key, value) => {
		pending.current.set(key, value);
		setDirty(true);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			flush().catch(() => {});
		}, 450);
	}, [flush]);
	const readPage = (0, import_react.useCallback)(async (nextCursors) => {
		const ticket = ++pageTicket.current;
		setPaging(true);
		try {
			await flush();
			const rows = await listWorkspaceDocuments(prefix + "pack:", nextCursors.at(-1));
			const values = rows.slice(0, 8).map((row) => readSignalPack(row.value));
			if (!alive.current || ticket !== pageTicket.current) return;
			setArchive(values);
			setOlder(rows.length > 8);
			setCursors(nextCursors);
		} catch (e) {
			if (alive.current) setError(e instanceof Error ? e.message : "Could not load saved packs.");
		} finally {
			if (alive.current && ticket === pageTicket.current) setPaging(false);
		}
	}, [prefix, flush]);
	(0, import_react.useEffect)(() => {
		alive.current = true;
		(async () => {
			try {
				let recovery = null;
				try {
					recovery = localStorage.getItem(recoveryKey);
				} catch {}
				if (recovery) {
					try {
						const rows = JSON.parse(recovery);
						if (Array.isArray(rows)) {
							for (const row of rows) if (row?.key === prefix + "profile") pending.current.set(row.key, normalizeSignalProfile(row.value));
							else if (typeof row?.key === "string" && row.key.startsWith(prefix + "pack:")) {
								const saved = readSignalPack(row.value);
								if (row.key === prefix + saved.id) pending.current.set(row.key, saved);
							}
						}
					} catch {
						if (alive.current) setError("A recovery draft could not be read. Existing saved packs are available; the recovery record has been kept.");
					}
					await flush();
				}
				const savedProfile = await readWorkspaceDocument(prefix + "profile");
				const rows = await listWorkspaceDocuments(prefix + "pack:");
				const values = rows.slice(0, 8).map((row) => readSignalPack(row.value));
				if (!alive.current) return;
				setProfile(normalizeSignalProfile(savedProfile));
				setArchive(values);
				setOlder(rows.length > 8);
				setPack(values[0] ?? null);
				setReady(true);
			} catch (e) {
				if (alive.current) setError(`Could not load Stream Signal. ${e instanceof Error ? e.message : ""}`);
			}
		})();
		const hide = () => {
			mirror();
			flush().catch(() => {});
		};
		window.addEventListener("pagehide", hide);
		return () => {
			alive.current = false;
			pageTicket.current++;
			clearTimeout(timer.current);
			mirror();
			flush().catch(() => {});
			window.removeEventListener("pagehide", hide);
		};
	}, [
		prefix,
		recoveryKey,
		flush,
		mirror
	]);
	const updatePack = (next) => {
		setPack(next);
		setArchive((current) => current.map((row) => row.id === next.id ? next : row));
		queue(prefix + next.id, next);
	};
	return {
		ready,
		profile,
		pack,
		archive,
		older,
		cursors,
		paging,
		dirty,
		saving,
		error,
		flush,
		changeProfile(next) {
			setProfile(next);
			queue(prefix + "profile", next);
		},
		updatePack,
		async generate() {
			const next = generateSignalPack(profile, `pack:${Date.now()}:${createLocalId()}`);
			setPack(next);
			setArchive((current) => [next, ...current].slice(0, 8));
			queue(prefix + "profile", { ...profile });
			queue(prefix + next.id, next);
			await flush();
			await readPage([]);
		},
		async select(next) {
			try {
				await flush();
				setPack(next);
			} catch {}
		},
		olderPage() {
			if (archive.length) readPage([...cursors, prefix + archive[archive.length - 1].id]);
		},
		newerPage() {
			readPage(cursors.slice(0, -1));
		}
	};
}
function createLabState() {
	return {
		status: "idle",
		window: 0,
		deadline: null,
		ballots: {},
		seen: [],
		queue: [],
		health: 70,
		energy: 60,
		enemy: 100,
		guarded: false,
		log: ["SIMULATOR: no Twitch, YouTube, or game connection."]
	};
}
var note = (state, message) => ({
	...state,
	log: [...state.log.slice(-99), message]
});
function parseLabSequence(text) {
	const parts = text.trim().toLowerCase().replace(/^!/, "").split(/\s+then\s+|\s*->\s*|\s*→\s*/);
	return parts.length >= 1 && parts.length <= 4 && parts.every((part) => [
		"attack",
		"defend",
		"heal"
	].includes(part)) ? parts : null;
}
function startLabWindow(state, seconds, now) {
	if (state.status === "stopped") return note(state, "Stopped: reset the simulator to resume.");
	if (state.status === "voting") return state;
	if (!Number.isInteger(seconds) || seconds < 2 || seconds > 120) return note(state, "Choose a voting window from 2 to 120 seconds.");
	return note({
		...state,
		status: "voting",
		window: state.window + 1,
		deadline: now + seconds * 1e3,
		ballots: {}
	}, `Window ${state.window + 1} opened for ${seconds}s.`);
}
function closeLabWindow(state) {
	if (state.status !== "voting") return state;
	const counts = /* @__PURE__ */ new Map();
	for (const ballot of Object.values(state.ballots)) {
		const key = ballot.join(" then ");
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	const ordered = [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
	const next = {
		...state,
		status: "idle",
		deadline: null,
		ballots: {}
	};
	if (!ordered.length) return note(next, `Window ${state.window}: no valid ballots; no moves queued.`);
	const [winner, votes] = ordered[0], sequence = parseLabSequence(winner);
	if (next.queue.length + sequence.length > 12) return note(next, `Window ${state.window}: ${winner} won (${votes}); entire sequence rejected because queue capacity is 12.`);
	return note({
		...next,
		queue: [...next.queue, ...sequence.map((move) => ({
			move,
			sequence: state.window
		}))]
	}, `Window ${state.window}: ${winner} won (${votes} vote${votes === 1 ? "" : "s"}). Ties use alphabetical whole-sequence order.`);
}
function receiveLabBallot(state, viewerInput, messageId, text, now) {
	if (state.status !== "voting") return note(state, "No voting window is open. Message ignored.");
	if (now >= state.deadline) return note(closeLabWindow(state), "Late message ignored after the window deadline.");
	const viewer = viewerInput.normalize("NFKC").trim().toLowerCase();
	if (!/^[\p{L}\p{N}_-]{1,64}$/u.test(viewer) || !messageId.trim() || messageId.length > 128) return note(state, "Use a viewer name (letters, digits, _ or -) and a message ID.");
	if (state.seen.includes(messageId)) return note(state, `Duplicate message ${messageId} ignored.`);
	const seen = [...state.seen.slice(-511), messageId], sequence = parseLabSequence(text);
	if (!sequence) return note({
		...state,
		seen
	}, "Invalid command: use attack, defend or heal, with up to four moves joined by “then”. Previous valid ballot kept.");
	if (!Object.hasOwn(state.ballots, viewer) && Object.keys(state.ballots).length >= 200) return note({
		...state,
		seen
	}, "Viewer capacity reached; new viewer ignored.");
	const replaced = Object.hasOwn(state.ballots, viewer);
	return note({
		...state,
		seen,
		ballots: {
			...state.ballots,
			[viewer]: sequence
		}
	}, `${viewer}: ${sequence.join(" then ")}${replaced ? " (replaced earlier ballot)" : ""}.`);
}
function stepLabController(state) {
	if (state.status === "stopped" || !state.queue.length) return state;
	const [item, ...remaining] = state.queue, cost = {
		attack: 20,
		defend: 10,
		heal: 25
	}[item.move];
	const invalid = state.health <= 0 ? "player is down" : state.enemy <= 0 ? "opponent already defeated" : state.energy < cost ? "insufficient energy" : item.move === "heal" && state.health >= 100 ? "health already full" : "";
	if (invalid) return note({
		...state,
		queue: remaining.filter((row) => row.sequence !== item.sequence)
	}, `Interrupted ${item.move}: ${invalid}. Remaining moves in that sequence cleared.`);
	const next = {
		...state,
		queue: remaining,
		energy: state.energy - cost
	};
	if (item.move === "defend") next.guarded = true;
	if (item.move === "heal") next.health = Math.min(100, state.health + 30);
	if (item.move === "attack") {
		next.enemy = Math.max(0, state.enemy - 25);
		next.health = Math.max(0, state.health - (state.guarded ? 4 : 14));
		next.guarded = false;
	}
	return note(next, `Executed ${item.move}; checked fresh health, energy and opponent state. Energy ${next.energy}, health ${next.health}, opponent ${next.enemy}.`);
}
function stopLab(state) {
	return note({
		...state,
		status: "stopped",
		deadline: null,
		ballots: {},
		queue: []
	}, "EMERGENCY STOP: votes and all pending moves cleared. Reset required.");
}
function StreamSignalLab() {
	const [state, setState] = (0, import_react.useState)(createLabState), [seconds, setSeconds] = (0, import_react.useState)("15");
	const [viewer, setViewer] = (0, import_react.useState)("viewer_1"), [messageId, setMessageId] = (0, import_react.useState)(() => createLocalId("msg-"));
	const [command, setCommand] = (0, import_react.useState)("defend then attack then heal");
	(0, import_react.useEffect)(() => {
		if (state.status !== "voting" || !state.deadline) return;
		const timer = setTimeout(() => setState((current) => closeLabWindow(current)), Math.max(0, state.deadline - Date.now()));
		return () => clearTimeout(timer);
	}, [state.status, state.deadline]);
	const ballots = Object.entries(state.ballots);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		"data-signal-lab": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-bg/45 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "signal-badge",
						children: "Simulator · local messages only"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 text-2xl font-semibold text-fg",
						children: "Test the crowd. Keep the controls."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-6 text-muted",
						children: "A turn-based battle test for batched chat. This is not connected to Twitch, YouTube, iRacing Arcade, or a game controller. Nothing executes automatically."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "danger",
					onClick: () => setState(stopLab),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OctagonX, { className: "size-4" }), "Emergency stop"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "signal-panel space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold text-fg",
							children: "01 · Voting window"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-end gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "signal-label",
										children: "Window length (seconds)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"aria-label": "Voting window seconds",
										type: "number",
										min: 2,
										max: 120,
										step: 1,
										value: seconds,
										onChange: (e) => setSeconds(e.target.value),
										className: "w-32"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "signal-primary",
									disabled: state.status !== "idle" || !Number.isInteger(Number(seconds)) || +seconds < 2 || +seconds > 120,
									onClick: () => setState((s) => startLabWindow(s, Number(seconds), Date.now())),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Start voting window"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									disabled: state.status !== "voting",
									onClick: () => setState(closeLabWindow),
									children: "Close window now"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-muted",
							children: "Choose 2–120 seconds. Windows close automatically; moves wait for your execution click. Leaving the lab resets this simulation."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							role: "status",
							children: state.status === "voting" ? `Window ${state.window} accepting votes until ${new Date(state.deadline).toLocaleTimeString()}.` : state.status === "stopped" ? "Emergency stop is active. Reset to start again." : "Ready for a new voting window."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "space-y-3 border-t border-border pt-4",
							onSubmit: (e) => {
								e.preventDefault();
								setState((s) => receiveLabBallot(s, viewer, messageId, command, Date.now()));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "signal-label",
										children: "Simulated viewer"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"aria-label": "Simulated viewer",
										value: viewer,
										maxLength: 64,
										onChange: (e) => setViewer(e.target.value)
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "signal-label",
										children: "Message ID"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"aria-label": "Simulated message ID",
										value: messageId,
										maxLength: 128,
										onChange: (e) => setMessageId(e.target.value)
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "signal-label",
										children: "Whole command sequence"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"aria-label": "Simulated command sequence",
										value: command,
										maxLength: 160,
										onChange: (e) => setCommand(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "submit",
										disabled: state.status !== "voting",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), "Submit simulated ballot"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "secondary",
										onClick: () => setMessageId(createLocalId("msg-")),
										children: "New message ID"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-5 text-muted",
									children: "Reuse an ID to test duplicate detection. Use a new ID to change a viewer’s ballot. Commands: attack, defend, heal; up to four moves joined by “then”. Invalid messages leave the previous valid ballot intact."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-elevated/60 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-fg",
									children: [
										ballots.length,
										" active ballot",
										ballots.length === 1 ? "" : "s"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1 text-xs text-muted",
									"aria-label": "Current simulator ballots",
									children: ballots.slice(0, 8).map(([name, moves]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "break-words",
										children: [
											name,
											": ",
											moves.join(" → ")
										]
									}, name))
								}),
								ballots.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs text-muted",
									children: [
										"+",
										ballots.length - 8,
										" other voters"
									]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "signal-panel space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold text-fg",
							children: "02 · Local controller"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2",
							"aria-label": "Simulator resources",
							children: [
								[
									HeartPulse,
									"Health",
									state.health
								],
								[
									Shield,
									"Energy",
									state.energy
								],
								[
									Swords,
									"Opponent",
									state.enemy
								]
							].map(([Icon, label, value]) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md bg-elevated p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mb-2 size-4 text-accent" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: String(label)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-2xl font-semibold text-fg",
											children: String(value)
										})
									]
								}, String(label));
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Defense: ",
								state.guarded ? "guard raised" : "not guarded",
								" · Queue ",
								state.queue.length,
								"/",
								12
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "flex min-h-16 flex-wrap content-start gap-2 rounded-md bg-bg/60 p-3",
							"aria-label": "Pending simulator moves",
							children: [state.queue.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "signal-badge",
								children: [
									index + 1,
									". ",
									row.move
								]
							}, `${row.sequence}:${index}`)), !state.queue.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-sm text-muted",
								children: "No moves queued."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "signal-primary",
								disabled: !state.queue.length || state.status === "stopped",
								onClick: () => setState(stepLabController),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Execute next move"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => setState(createLabState()),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Reset simulator"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-muted",
							children: "Attack costs 20 energy; defend 10; heal 25. Every move checks current health, energy and opponent state. A failed condition interrupts the rest of that sequence. Reset restores resources."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-sm font-semibold text-fg",
								children: "Deterministic rules"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: "One latest valid ballot per normalized viewer, per window. Vote on whole sequences; moves are never mixed from separate ballots. Ties use alphabetical whole-sequence order. A full queue rejects the entire winning sequence. Limits: 200 voters, 512 recent message IDs, 12 pending moves, 100 log entries. Closing a window only queues moves."
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "signal-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 text-lg font-semibold text-fg",
					children: "Controller log"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "max-h-72 space-y-2 overflow-y-auto rounded-md bg-bg/70 p-4 font-mono text-xs leading-5 text-muted",
					"aria-label": "Simulator controller log",
					"aria-live": "polite",
					"aria-relevant": "additions",
					children: state.log.map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: entry }, `${index}:${entry}`))
				})]
			})
		]
	});
}
var SECTIONS = [
	[
		"announcements",
		"Announcements",
		Megaphone
	],
	[
		"lab",
		"Chat Plays Lab",
		FlaskConical
	],
	[
		"setup",
		"Channel Setup",
		Settings2
	],
	[
		"blueprint",
		"AI Blueprint",
		Route
	]
];
var area = "w-full rounded-md border border-border bg-bg px-3 py-3 text-sm leading-6 text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring";
var instructions = {
	x: "Compose on X fills a draft. Review it and post on X yourself.",
	facebook: "Personal account: copy the post, open Facebook, paste into a new post, choose your audience, and share yourself.",
	instagram: "Personal account: download the Story card, upload it in Instagram, then open Stickers → Link and paste a stream URL. A PNG has no clickable links. For a feed caption, add a stream link to your profile and point viewers there.",
	tiktok: "Copy this caption into your own clip or photo post. Add a stream URL through Edit profile → Links if your account offers it; link availability varies. Text in a caption is not a substitute for a clickable profile link."
};
function SiteLink({ href, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		target: "_blank",
		rel: "noopener noreferrer",
		className: "inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring",
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
	});
}
function download(blob, filename) {
	const url = URL.createObjectURL(blob), link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.append(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 3e4);
}
function StoryPreview({ pack }) {
	if (!pack) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "signal-story flex items-center justify-center p-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "mx-auto size-10" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xl font-semibold",
				children: "Your next live announcement"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm",
				children: "Generate a pack to preview its Story card."
			})
		] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "signal-story flex flex-col justify-between gap-5 p-6",
		"aria-label": "Announcement Story preview",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest",
					children: "STREAM SIGNAL"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 break-words text-3xl font-semibold",
					children: pack.profile.creator
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs font-semibold tracking-widest",
					children: "IS GOING LIVE"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md bg-signal-ink p-4 text-signal-paper",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-signal-action",
						children: "ON THE GRID"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 break-words text-xl font-semibold",
						children: pack.profile.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 break-words text-sm",
						children: pack.profile.game
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "line-clamp-3 text-sm",
				children: pack.profile.message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "break-all",
					children: pack.profile.twitch.replace("https://", "")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "break-all",
					children: pack.profile.youtube.replace("https://", "")
				})]
			})
		]
	});
}
var StreamSignalSection = (0, import_react.memo)(function StreamSignalSection() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "status",
		className: "p-6 text-muted",
		children: "Loading your Stream Signal workspace…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "signal-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold text-fg",
			children: "Stream Signal"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: "Sign in through this app to access your saved announcement workspace."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalWorkspace, {
		owner: user.id,
		localOnly: user.isDevFallback
	}, user.id);
});
function SignalWorkspace({ owner, localOnly }) {
	const workspace = useStreamSignal(owner);
	const { profile, pack } = workspace;
	const [section, setSection] = (0, import_react.useState)("announcements");
	const [errors, setErrors] = (0, import_react.useState)({});
	const [notice, setNotice] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false);
	const run = async (work) => {
		setNotice("");
		setBusy(true);
		try {
			await work();
		} catch (e) {
			setNotice(e instanceof Error ? e.message : "This action could not be completed.");
		} finally {
			setBusy(false);
		}
	};
	const validated = () => {
		const next = validateSignalProfile(profile);
		setErrors(next);
		if (Object.keys(next).length) {
			setNotice("Review the highlighted fields in Announcements and Channel Setup.");
			return false;
		}
		return true;
	};
	const field = (name, label, multiline = false) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "signal-label",
				children: label
			}),
			multiline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				"aria-label": label,
				value: profile[name],
				maxLength: SIGNAL_LIMITS[name],
				rows: 3,
				className: area,
				onChange: (e) => workspace.changeProfile({
					...profile,
					[name]: e.target.value
				}),
				"aria-invalid": !!errors[name],
				"aria-describedby": errors[name] ? `signal-${name}-error` : void 0
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				"aria-label": label,
				value: profile[name],
				maxLength: SIGNAL_LIMITS[name],
				onChange: (e) => workspace.changeProfile({
					...profile,
					[name]: e.target.value
				}),
				type: name === "twitch" || name === "youtube" ? "url" : "text",
				"aria-invalid": !!errors[name],
				"aria-describedby": errors[name] ? `signal-${name}-error` : void 0
			}),
			errors[name] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				id: `signal-${name}-error`,
				className: "mt-1 block text-xs text-danger",
				children: errors[name]
			})
		]
	}, name);
	const save = () => void run(async () => {
		if (!validated()) return;
		await workspace.flush();
		setNotice("Channel and stream details saved.");
	});
	const generate = () => void run(async () => {
		if (validated()) {
			await workspace.generate();
			setNotice("New pack generated. All four posts are drafts.");
		}
	});
	const png = () => void run(async () => {
		if (!pack) return;
		const { createSignalStoryCard } = await import("./stream-signal-card-B6VstulV.mjs");
		download(await createSignalStoryCard(pack), `stream-signal-story-${pack.createdAt}.png`);
		setNotice("1080 × 1920 Story PNG downloaded. Add the clickable Link sticker inside Instagram.");
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Creator toolkit",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }),
		title: "Stream Signal",
		copy: "Your go-live launchpad. One pack, four platforms, your voice.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "signal-badge",
						children: "Manual sharing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "signal-badge",
						children: "Live detection · Unconfigured"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto text-xs text-muted",
						role: "status",
						"data-signal-save-status": true,
						children: workspace.saving ? "Saving…" : workspace.dirty ? "Unsaved changes" : workspace.ready ? "Saved in this browser" : "Loading workspace…"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "tablist",
				"aria-label": "Stream Signal sections",
				className: "my-6 grid grid-cols-2 gap-2 rounded-lg border border-border bg-bg/45 p-2 lg:grid-cols-4",
				onKeyDown: (e) => {
					const index = SECTIONS.findIndex((row) => row[0] === section);
					const next = e.key === "ArrowRight" ? (index + 1) % 4 : e.key === "ArrowLeft" ? (index + 3) % 4 : e.key === "Home" ? 0 : e.key === "End" ? 3 : -1;
					if (next >= 0) {
						e.preventDefault();
						setSection(SECTIONS[next][0]);
						e.currentTarget.querySelectorAll("[role=\"tab\"]")[next]?.focus();
					}
				},
				children: SECTIONS.map(([key, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					role: "tab",
					id: `signal-tab-${key}`,
					"aria-selected": section === key,
					"aria-controls": `signal-panel-${key}`,
					tabIndex: section === key ? 0 : -1,
					variant: section === key ? "secondary" : "ghost",
					className: "w-full px-2 text-xs sm:text-sm",
					onClick: () => {
						setSection(key);
						setNotice("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
				}, key))
			}),
			workspace.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mb-5 rounded-md border border-danger/40 bg-danger/10 p-4 text-sm text-fg",
				children: [workspace.error, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "ml-2",
					variant: "secondary",
					disabled: workspace.saving,
					onClick: () => void run(async () => {
						if (!workspace.ready) {
							window.location.reload();
							return;
						}
						await workspace.flush();
					}),
					children: ["Retry ", workspace.ready ? "Save" : "load"]
				})]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mb-5 rounded-md bg-elevated p-4 text-sm text-fg",
				children: notice
			}),
			!workspace.ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "py-12 text-muted",
				children: "Opening your saved workspace…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "tabpanel",
				id: `signal-panel-${section}`,
				"aria-labelledby": `signal-tab-${section}`,
				tabIndex: 0,
				className: "min-w-0 outline-none",
				children: [
					section === "announcements" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid items-start gap-5 lg:grid-cols-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "signal-panel space-y-4 lg:col-span-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "signal-badge",
												children: "01 / Prepare"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-xl font-semibold text-fg",
												children: "Set the scene."
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted",
											children: [
												"Ready for your next stream, ",
												profile.creator || "creator",
												". Changes here apply to the next pack; previous packs keep their own details and edits."
											]
										}),
										field("title", "Stream title"),
										field("game", "Game or category"),
										field("message", "Community message", true),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-bg/65 p-3 text-sm text-muted",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "flex items-center gap-2 font-medium text-fg",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" }), "Your stream destinations"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-2 break-all",
													children: ["Twitch · ", profile.twitch]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 break-all",
													children: ["YouTube · ", profile.youtube]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													variant: "ghost",
													className: "mt-1 px-0",
													onClick: () => setSection("setup"),
													children: ["Edit channel setup", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												className: "signal-primary",
												disabled: busy || workspace.saving,
												onClick: generate,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-4" }), "Generate announcement pack"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "secondary",
												disabled: busy || workspace.saving,
												onClick: save,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "Save details"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs leading-5 text-muted",
											children: "Generation happens locally from your saved details. No AI service, social account, or auto-posting is connected. Copying and opening a site never changes the sharing checklist."
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
									className: "signal-panel",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-4 flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-sm font-semibold text-fg",
												children: "Story card"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: "1080 × 1920"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryPreview, { pack }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "secondary",
											className: "mt-4 w-full",
											disabled: !pack || busy,
											onClick: png,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download Story PNG"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-xs leading-5 text-muted",
											children: "Preview uses this pack’s saved stream details. Upload the PNG yourself, then add a Link sticker for a tappable stream URL."
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "signal-panel",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "02 / Your pack archive"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-1 text-lg font-semibold text-fg",
										children: "Pick up where you left off."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											disabled: !workspace.cursors.length || workspace.paging,
											onClick: workspace.newerPage,
											children: "Newer packs"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											disabled: !workspace.older || workspace.paging,
											onClick: workspace.olderPage,
											children: "Older packs"
										})]
									})]
								}), !workspace.archive.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-sm text-muted",
									children: "Your first generated pack will appear here. Old packs are kept until you remove this app’s browser data."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4",
									"aria-label": "Saved announcement packs",
									children: workspace.archive.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: `min-h-16 min-w-0 rounded-md border p-3 text-left ${row.id === pack?.id ? "border-accent bg-elevated text-fg" : "border-border text-muted hover:bg-elevated"}`,
										"aria-pressed": row.id === pack?.id,
										onClick: () => void workspace.select(row),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm font-medium",
											children: row.profile.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-1 block text-xs",
											children: [
												new Date(row.createdAt).toLocaleString(),
												" · ",
												Object.keys(row.shared).length,
												"/4 marked"
											]
										})]
									}, row.id))
								})]
							}),
							pack && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"aria-label": "Editable announcement pack",
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: "03 / Edit, copy, share"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-1 break-words text-2xl font-semibold text-fg",
											children: pack.profile.title
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "secondary",
											onClick: () => {
												download(new Blob([exportSignalPack(pack)], { type: "text/plain;charset=utf-8" }), `stream-signal-${pack.createdAt}.txt`);
												setNotice("Plain text pack downloaded, including all posts and all six destination links.");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export plain text"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Edits save after a short pause. “Mark shared” is your manual note that you posted; this app cannot confirm publication."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid items-start gap-4 xl:grid-cols-2",
										children: SIGNAL_PLATFORMS.map((key) => {
											const marked = pack.shared[key], draft = pack.drafts[key], missing = !draft.includes(pack.profile.twitch) || !draft.includes(pack.profile.youtube);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
												className: "signal-panel space-y-3",
												"data-signal-draft": key,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between gap-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
															className: "text-xl font-semibold text-fg",
															children: SIGNAL_SITES[key].name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "signal-badge",
															children: marked ? "Marked shared · manual" : "Draft · not marked shared"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
														"aria-label": `${SIGNAL_SITES[key].name} announcement draft`,
														rows: 8,
														maxLength: 6e3,
														className: area,
														value: draft,
														onChange: (e) => workspace.updatePack({
															...pack,
															updatedAt: Date.now(),
															drafts: {
																...pack.drafts,
																[key]: e.target.value
															}
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-xs text-muted",
														children: [
															[...draft].length.toLocaleString(),
															" characters",
															key === "x" ? " · keep it short; review the final limit in X" : ""
														]
													}),
													key === "x" && [...draft].length > 280 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-danger",
														children: "Long X draft: shorten this before posting. Your edit has been preserved."
													}),
													missing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-xs text-danger",
														children: ["This draft is missing a stream link. Both links remain in the text export.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															variant: "ghost",
															className: "h-11 px-1 text-xs",
															onClick: () => {
																const links = [!draft.includes(pack.profile.twitch) ? `Twitch: ${pack.profile.twitch}` : "", !draft.includes(pack.profile.youtube) ? `YouTube: ${pack.profile.youtube}` : ""].filter(Boolean);
																const next = `${draft}\n${links.join("\n")}`;
																if (next.length > 6e3) {
																	setNotice("Shorten this draft to make room for both stream links. Your current text has been preserved.");
																	return;
																}
																workspace.updatePack({
																	...pack,
																	updatedAt: Date.now(),
																	drafts: {
																		...pack.drafts,
																		[key]: next
																	}
																});
															},
															children: "Restore stream links"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex flex-wrap gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																variant: "secondary",
																onClick: () => void run(async () => {
																	try {
																		await navigator.clipboard.writeText(draft);
																		setNotice(`${SIGNAL_SITES[key].name} draft copied. Sharing status is unchanged.`);
																	} catch {
																		throw Error("Clipboard access is unavailable. Select the draft text and copy it manually. Sharing status is unchanged.");
																	}
																}),
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }),
																	"Copy ",
																	SIGNAL_SITES[key].name
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																variant: "secondary",
																disabled: workspace.saving,
																onClick: () => void run(async () => {
																	await workspace.flush();
																	setNotice(`${SIGNAL_SITES[key].name} draft saved.`);
																}),
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }),
																	"Save ",
																	SIGNAL_SITES[key].name
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLink, {
																href: SIGNAL_SITES[key].url,
																children: ["Open ", SIGNAL_SITES[key].name]
															})
														]
													}),
													key === "x" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														asChild: true,
														className: "signal-primary",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
															href: composeOnX(draft),
															target: "_blank",
															rel: "noopener noreferrer",
															children: ["Compose on X", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs leading-5 text-muted",
														children: instructions[key]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "border-t border-border pt-3",
														children: marked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mb-2 text-xs text-muted",
															children: [
																"Manually marked ",
																new Date(marked).toLocaleString(),
																". This is not a publication receipt."
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															variant: "ghost",
															onClick: () => {
																const shared = { ...pack.shared };
																delete shared[key];
																workspace.updatePack({
																	...pack,
																	updatedAt: Date.now(),
																	shared
																});
															},
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" }),
																"Undo ",
																SIGNAL_SITES[key].name,
																" shared mark"
															]
														})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															variant: "secondary",
															onClick: () => workspace.updatePack({
																...pack,
																updatedAt: Date.now(),
																shared: {
																	...pack.shared,
																	[key]: Date.now()
																}
															}),
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }),
																"Mark ",
																SIGNAL_SITES[key].name,
																" shared"
															]
														})
													})
												]
											}, `${pack.id}:${key}`);
										})
									})
								]
							})
						]
					}),
					section === "lab" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreamSignalLab, {}),
					section === "setup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid items-start gap-5 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "signal-panel space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-2xl font-semibold text-fg",
									children: "Make it yours."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "These defaults are ready for notyoda. Settings apply to new packs; existing drafts keep their original links."
								}),
								field("creator", "Creator name"),
								field("twitch", "Twitch channel URL"),
								field("youtube", "YouTube channel URL"),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "signal-primary",
									disabled: busy || workspace.saving,
									onClick: save,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "Save channel setup"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs leading-5 text-muted",
									children: [localOnly ? "This app has sign-in disabled. Your workspace is local to this browser profile; it does not sync across devices." : "Drafts are stored in this browser under your current app user. Switching users opens a separate workspace; there is no cloud sync.", " No passwords or social access tokens are requested."]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "signal-panel space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xl font-semibold text-fg",
									children: "Connection status"
								}),
								[
									["Twitch live detection", "Unconfigured"],
									["X / Facebook / Instagram / TikTok", "Manual sharing only"],
									["Twitch / YouTube chat", "Not connected"],
									["Local game adapter", "Not connected"]
								].map(([label, status]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md bg-bg/60 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: status
									})]
								}, label)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-6 text-muted",
									children: "Facebook and Instagram are personal accounts. Copy and share from their own apps. The website does not have permission to publish to them. Optional live detection needs an authenticated backend with server-held Twitch credentials, per-stream IDs, and a durable duplicate ledger. No polling is running."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										"Instagram ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLink, {
											href: "https://www.instagram.com/",
											children: "open app/site"
										}),
										" · TikTok ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLink, {
											href: "https://support.tiktok.com/en/getting-started/setting-up-your-profile/linking-another-social-media-account",
											children: "profile link help"
										})
									]
								})
							]
						})]
					}),
					section === "blueprint" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Blueprint, {})
				]
			})
		]
	});
}
function Blueprint() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "signal-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "signal-badge",
						children: "Future direction · not connected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mt-4 text-3xl font-semibold text-fg",
						children: [
							"Chat sets the strategy.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"A local controller drives."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-3xl text-sm leading-6 text-muted",
						children: "The goal is real-time chat-controlled iRacing Arcade. This website alone cannot observe or control the installed game. The battle simulator demonstrates vote batching, not a functioning racing AI."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [
					[
						"01 · Chat strategy",
						"Collect authenticated Twitch / YouTube chat in short voting windows. One latest valid vote per viewer selects a whole strategy, with deterministic ties and moderation.",
						"Push · Drive conservatively · Hold the racing line · Overtake when clear"
					],
					[
						"02 · Authenticated bridge",
						"A separate local game adapter would receive bounded, expiring strategy commands over an authenticated connection. Require explicit pairing, origin checks, sequence IDs and acknowledgements.",
						"No browser-to-game connection exists here. Never place game or social credentials in the browser."
					],
					[
						"03 · Fast local controller",
						"Read fresh game observations, then handle steering, braking, collision avoidance and reactions continuously. Chat decisions adjust goals; they do not become raw keyboard spam.",
						"Pause on stale telemetry, a disconnect, unsafe conditions, or emergency stop."
					]
				].map(([title, copy, detail]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "signal-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold text-fg",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-6 text-muted",
							children: copy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 border-t border-border pt-4 text-sm text-accent",
							children: detail
						})
					]
				}, title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "signal-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xl font-semibold text-fg",
						children: "A sequence needs a contract."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-6 text-muted",
						children: "“Overtake when clear, then hold the line” needs a fresh clearance observation before the pass, a time limit, an acknowledgement of each stage, and an interruption path if another car closes the gap. Recheck conditions before every action; a previous vote is never proof that the track is still clear."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Conditions: sufficient grip, track clearance, controller ready." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Freshness: timestamp observations and reject stale commands." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Timeouts: expire strategies and stop waiting for missing acknowledgements." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Interruption: stop and clear pending actions on danger or disconnection." })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 rounded-md bg-bg/60 p-3 text-sm text-fg",
						children: "Next milestone: a read-only local telemetry adapter, then a paired connection and a supervised controller test. No racing control is implemented in this website."
					})
				]
			})
		]
	});
}
//#endregion
export { StreamSignalSection };
