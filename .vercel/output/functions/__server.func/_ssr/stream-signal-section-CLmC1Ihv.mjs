import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { At as FlaskConical, Ct as HeartPulse, E as Shield, I as Radio, Lt as ExternalLink, M as Route, N as RotateCcw, O as Settings2, Vt as Copy, Xt as Check, an as ArrowRight, dt as Link2, g as Swords, j as Save, k as Send, l as Undo2, q as OctagonX, tt as Megaphone, z as Play, zt as Download } from "../_libs/lucide-react.mjs";
import { Dt as Input, I as useCurrentUserState, Ot as Button, bi as saveWorkspaceDocuments, ci as readWorkspaceDocument, qr as listWorkspaceDocuments, tr as createLocalId } from "./library-app-CrsCDQmv.mjs";
import { s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stream-signal-section-CLmC1Ihv.js
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
var LAB_REPLAY_BYTES = 1048576;
var integer = (v, min, max) => Number.isSafeInteger(v) && v >= min && v <= max;
var record = (v) => {
	if (!v || typeof v !== "object" || Array.isArray(v)) throw Error("Replay requires a JSON object.");
	return v;
};
function fields(v, keys) {
	if (Object.keys(v).some((key) => !keys.includes(key))) throw Error("Unknown replay fields are not supported.");
}
function normalizeLabEvent(value) {
	const e = record(value);
	if (!integer(e.at, 0, 864e5)) throw Error("Event time must be an integer offset within one day.");
	if (e.type === "start") {
		fields(e, [
			"type",
			"at",
			"seconds"
		]);
		if (!integer(e.seconds, 2, 120)) throw Error("Voting windows must be 2–120 seconds.");
		return {
			type: "start",
			at: e.at,
			seconds: e.seconds
		};
	}
	if (e.type === "ballot") {
		fields(e, [
			"type",
			"at",
			"viewer",
			"id",
			"text"
		]);
		if (typeof e.viewer !== "string" || e.viewer.length > 64 || !/^[\p{L}\p{N}_-]{1,64}$/u.test(e.viewer.normalize("NFKC").trim().toLowerCase()) || typeof e.id !== "string" || !e.id.trim() || e.id.length > 128 || typeof e.text !== "string" || e.text.length > 160) throw Error("Invalid simulated viewer, message ID or command size.");
		return {
			type: "ballot",
			at: e.at,
			viewer: e.viewer.normalize("NFKC").trim().toLowerCase(),
			id: e.id.trim(),
			text: e.text.trim().toLowerCase()
		};
	}
	if (e.type === "close" || e.type === "step" || e.type === "stop") {
		fields(e, ["type", "at"]);
		return {
			type: e.type,
			at: e.at
		};
	}
	throw Error("Unknown simulator event type.");
}
/** A non-security regression checksum, never an authentication signature. */
function labChecksum(state) {
	const text = JSON.stringify({
		...state,
		ballots: Object.fromEntries(Object.entries(state.ballots).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0))
	});
	let a = 2166136261, b = 2246822519;
	for (let i = 0; i < text.length; i++) {
		a = Math.imul(a ^ text.charCodeAt(i), 16777619);
		b = Math.imul(b ^ text.charCodeAt(i), 3266489917);
	}
	return (a >>> 0).toString(16).padStart(8, "0") + (b >>> 0).toString(16).padStart(8, "0");
}
function reduce(state, event) {
	switch (event.type) {
		case "start": return startLabWindow(state, event.seconds, event.at);
		case "ballot": return receiveLabBallot(state, event.viewer, event.id, event.text, event.at);
		case "close": return closeLabWindow(state);
		case "step": return stepLabController(state);
		case "stop": return stopLab(state);
	}
}
function createLabRun(seed = 1, seconds = 15) {
	if (!integer(seed, 0, 4294967295) || !integer(seconds, 2, 120)) throw Error("Use an integer seed from 0–4294967295 and a 2–120 second window.");
	return {
		trace: {
			version: 1,
			simulator: "battle-v1",
			config: {
				seed,
				seconds
			},
			events: []
		},
		state: createLabState()
	};
}
function recordLabEvent(run, raw) {
	const event = normalizeLabEvent(raw), last = run.trace.events.at(-1)?.event.at ?? 0;
	if (event.at < last) throw Error("Out-of-order events are rejected.");
	if (event.type === "stop" && run.state.status === "stopped") return run;
	if (run.trace.events.length >= (event.type === "stop" ? 512 : 511)) throw Error("Recording is full. Export or save it, then reset. One final emergency-stop slot is reserved.");
	const state = reduce(run.state, event);
	return {
		state,
		trace: {
			...run.trace,
			events: [...run.trace.events, {
				event,
				checksum: labChecksum(state)
			}]
		}
	};
}
/** Stop remains usable after the bounded recording clock expires. It never
* depends on an input message or on the browser's wall clock remaining valid. */
function stopLabRecording(run, at) {
	const last = run.trace.events.at(-1)?.event.at ?? 0;
	return recordLabEvent(run, {
		type: "stop",
		at: Math.max(last, Math.min(864e5, Number.isFinite(at) ? Math.max(0, Math.round(at)) : last))
	});
}
function readLabTrace(raw) {
	const trace = record(raw);
	fields(trace, [
		"version",
		"simulator",
		"config",
		"events"
	]);
	if (trace.version !== 1 || trace.simulator !== "battle-v1" || !Array.isArray(trace.events) || trace.events.length > 512) throw Error("Unsupported replay version, simulator or event count.");
	const config = record(trace.config);
	fields(config, ["seed", "seconds"]);
	const run = createLabRun(config.seed, config.seconds);
	let at = 0;
	const events = trace.events.map((rawRow) => {
		const row = record(rawRow);
		fields(row, ["event", "checksum"]);
		const event = normalizeLabEvent(row.event);
		if (event.at < at || typeof row.checksum !== "string" || !/^[a-f0-9]{16}$/.test(row.checksum)) throw Error("Replay has out-of-order events or an invalid checkpoint.");
		at = event.at;
		return {
			event,
			checksum: row.checksum
		};
	});
	return {
		...run.trace,
		events
	};
}
function parseLabTrace(text) {
	if (text.length > 1048576 || new TextEncoder().encode(text).length > 1048576) throw Error("Replay files are limited to 1 MiB.");
	return readLabTrace(JSON.parse(text));
}
function exportLabTrace(trace) {
	const text = JSON.stringify(readLabTrace(trace), null, 2);
	if (new TextEncoder().encode(text).length > 1048576) throw Error("Replay is too large to export.");
	return text;
}
function createLabPlayback(raw) {
	const trace = readLabTrace(raw);
	return {
		trace,
		state: createLabState(),
		index: 0,
		status: trace.events.length ? "ready" : "complete"
	};
}
function advanceLabPlayback(playback, count = 1) {
	if (playback.status !== "ready") return playback;
	if (!integer(count, 1, 512)) throw Error("Invalid replay step count.");
	let next = playback;
	for (let i = 0; i < count && next.index < next.trace.events.length; i++) {
		const row = next.trace.events[next.index], state = reduce(next.state, row.event), actual = labChecksum(state);
		if (actual !== row.checksum) return {
			...next,
			state,
			status: "diverged",
			divergence: {
				index: next.index + 1,
				expected: row.checksum,
				actual
			}
		};
		next = {
			...next,
			state,
			index: next.index + 1
		};
	}
	return {
		...next,
		status: next.index === next.trace.events.length ? "complete" : "ready"
	};
}
function stopLabPlayback(playback) {
	return {
		...playback,
		state: stopLab(playback.state),
		status: "stopped"
	};
}
function sampleLabBallots(seed, window) {
	let n = (seed ^ Math.imul(window, 2654435761)) >>> 0;
	const commands = [
		"attack then heal",
		"defend then attack then heal",
		"defend",
		"heal"
	];
	return Array.from({ length: 4 }, (_, i) => {
		n = Math.imul(n, 1664525) + 1013904223 >>> 0;
		return {
			viewer: "sample_" + (i + 1),
			id: "sample-" + window + "-" + i,
			text: commands[(n >>> 16) % commands.length]
		};
	});
}
function StreamSignalReplay({ owner, run, stopToken }) {
	const [source, setSource] = (0, import_react.useState)(""), [playback, setPlayback] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false);
	const alive = (0, import_react.useRef)(true), request = (0, import_react.useRef)(0), key = signalOwnerPrefix(owner) + "lab-replay";
	(0, import_react.useEffect)(() => {
		alive.current = true;
		return () => {
			alive.current = false;
			request.current++;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (stopToken) {
			request.current++;
			setPlayback((current) => current ? stopLabPlayback(current) : null);
		}
	}, [stopToken]);
	const saved = async (write) => {
		const ticket = ++request.current;
		setBusy(true);
		setNotice("");
		try {
			if (write) {
				const trace = readLabTrace(run.trace);
				await saveWorkspaceDocuments([{
					key,
					value: trace
				}]);
				if (alive.current) setNotice("Replay saved for the current app user. It replaces only this user’s previous saved lab replay.");
			} else {
				const raw = await readWorkspaceDocument(key);
				if (!raw) throw Error("No replay is saved for this user yet.");
				const text = exportLabTrace(readLabTrace(raw));
				if (alive.current && ticket === request.current) {
					setSource(text);
					setPlayback(createLabPlayback(parseLabTrace(text)));
					setNotice("Saved replay loaded for review. The current battle is unchanged.");
				}
			}
		} catch (e) {
			if (alive.current) setNotice(e instanceof Error ? e.message : "Replay storage failed. Export the recording or retry.");
		} finally {
			if (alive.current) setBusy(false);
		}
	};
	const download = () => {
		try {
			const url = URL.createObjectURL(new Blob([exportLabTrace(run.trace)], { type: "application/json" })), link = document.createElement("a");
			link.href = url;
			link.download = "stream-signal-battle-replay.json";
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1e3);
			setNotice("Replay exported. It contains only simulated names, messages and checkpoints; review it before sharing.");
		} catch (e) {
			setNotice(String(e));
		}
	};
	const load = (text) => {
		request.current++;
		try {
			const trace = parseLabTrace(text);
			setSource(text);
			setPlayback(createLabPlayback(trace));
			setNotice("Replay validated. Step through it or verify all checkpoints; the current battle is unchanged.");
		} catch (e) {
			setNotice(e instanceof Error ? e.message : "Invalid replay.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "signal-panel space-y-4",
		"aria-label": "Deterministic simulator replay",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xl font-semibold text-fg",
				children: "Record it. Replay the same decisions."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: [
					"Seed ",
					run.trace.config.seed,
					" · ",
					run.trace.events.length,
					"/",
					512,
					" events. Relative event times and a checkpoint after every action reproduce ballots, ties, queue order and resource checks. Checkpoints detect regression differences; they are not security signatures."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: download,
						children: "Export current replay"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: busy,
						onClick: () => void saved(true),
						children: "Save current replay"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: busy,
						onClick: () => void saved(false),
						children: "Load saved replay"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => load(exportLabTrace(run.trace)),
						children: "Review current recording"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "signal-label",
					children: "Replay JSON"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					"aria-label": "Replay JSON",
					rows: 5,
					maxLength: LAB_REPLAY_BYTES,
					value: source,
					onChange: (e) => {
						request.current++;
						setSource(e.target.value);
					},
					className: "w-full rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => load(source),
					children: "Validate replay"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm text-muted",
					children: ["Import replay file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						"aria-label": "Import replay file",
						type: "file",
						accept: "application/json,.json",
						className: "mt-2 block max-w-full text-xs",
						onChange: (e) => {
							const file = e.target.files?.[0];
							e.target.value = "";
							if (!file) return;
							if (file.size > 1048576) {
								setNotice("Replay file exceeds 1 MiB.");
								return;
							}
							const ticket = ++request.current;
							file.text().then((text) => {
								if (alive.current && ticket === request.current) load(text);
							}).catch(() => {
								if (alive.current) setNotice("Could not read this replay file.");
							});
						}
					})]
				})]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "rounded-md bg-bg/60 p-3 text-sm text-fg",
				children: notice
			}),
			playback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-md border border-border bg-bg/60 p-4",
				"data-lab-playback": playback.status,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						role: "status",
						children: [
							"Replay ",
							playback.status,
							" · ",
							playback.index,
							"/",
							playback.trace.events.length,
							" checkpoints verified"
						]
					}),
					playback.divergence && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "alert",
						className: "break-all text-sm text-danger",
						children: [
							"Divergence at event ",
							playback.divergence.index,
							": expected ",
							playback.divergence.expected,
							", got ",
							playback.divergence.actual,
							". Verification stopped here."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Replay resources: health ",
							playback.state.health,
							", energy ",
							playback.state.energy,
							", opponent ",
							playback.state.enemy,
							". Votes ",
							Object.keys(playback.state.ballots).length,
							" · pending moves ",
							playback.state.queue.length,
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: playback.status !== "ready",
								onClick: () => setPlayback((current) => current ? advanceLabPlayback(current) : null),
								children: "Replay next event"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: playback.status !== "ready",
								onClick: () => setPlayback((current) => current ? advanceLabPlayback(current, 512) : null),
								children: "Verify remaining events"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								onClick: () => {
									request.current++;
									setPlayback((current) => current ? stopLabPlayback(current) : null);
								},
								children: "Emergency stop replay"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setPlayback(createLabPlayback(playback.trace)),
								children: "Restart replay review"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						"aria-label": "Replay controller log",
						className: "max-h-52 space-y-1 overflow-auto font-mono text-xs leading-5 text-muted",
						children: playback.state.log.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, index))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: "At most 512 events and one saved replay per app user; one event slot is reserved for emergency stop. Recording fills visibly instead of dropping its beginning. Leaving the lab resets the current battle; only an explicit Save keeps a replay. Simulated input is never connected chat or installed-game control."
			})
		]
	});
}
function StreamSignalLab({ owner }) {
	const [recording, setRecording] = (0, import_react.useState)(() => ({
		run: createLabRun(),
		error: ""
	})), [seconds, setSeconds] = (0, import_react.useState)("15"), [seed, setSeed] = (0, import_react.useState)("1"), [stopToken, setStopToken] = (0, import_react.useState)(0);
	const epoch = (0, import_react.useRef)(performance.now()), state = recording.run.state;
	const at = () => Math.max(recording.run.trace.events.at(-1)?.event.at ?? 0, Math.round(performance.now() - epoch.current));
	const act = (event) => setRecording((current) => {
		try {
			return {
				run: recordLabEvent(current.run, event),
				error: ""
			};
		} catch (e) {
			return {
				...current,
				error: e instanceof Error ? e.message : "Event rejected."
			};
		}
	});
	const reset = () => {
		try {
			const run = createLabRun(Number(seed), Number(seconds));
			epoch.current = performance.now();
			setRecording({
				run,
				error: ""
			});
		} catch (e) {
			setRecording((current) => ({
				...current,
				error: String(e)
			}));
		}
	};
	const [viewer, setViewer] = (0, import_react.useState)("viewer_1"), [messageId, setMessageId] = (0, import_react.useState)(() => createLocalId("msg-"));
	const [command, setCommand] = (0, import_react.useState)("defend then attack then heal");
	(0, import_react.useEffect)(() => {
		if (state.status !== "voting" || !state.deadline) return;
		const timer = setTimeout(() => act({
			type: "close",
			at: Math.max(state.deadline, Math.round(performance.now() - epoch.current))
		}), Math.max(0, state.deadline - at()));
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
					onClick: () => {
						const time = at();
						setRecording((current) => ({
							run: stopLabRecording(current.run, time),
							error: ""
						}));
						setStopToken((n) => n + 1);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OctagonX, { className: "size-4" }), "Emergency stop"]
				})]
			}),
			recording.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "rounded-md bg-elevated p-3 text-sm text-danger",
				children: recording.error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "signal-label",
					children: "Sample seed (used after reset)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"aria-label": "Simulator sample seed",
					type: "number",
					min: 0,
					max: 4294967295,
					value: seed,
					onChange: (e) => setSeed(e.target.value),
					className: "w-44"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					disabled: state.status !== "voting",
					onClick: () => {
						const time = at();
						for (const sample of sampleLabBallots(recording.run.trace.config.seed, state.window)) act({
							type: "ballot",
							at: time,
							...sample
						});
					},
					children: "Add seeded sample votes"
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
									onClick: () => act({
										type: "start",
										seconds: Number(seconds),
										at: at()
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Start voting window"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									disabled: state.status !== "voting",
									onClick: () => act({
										type: "close",
										at: at()
									}),
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
							children: state.status === "voting" ? `Window ${state.window} accepting votes. It closes automatically at its recorded deadline.` : state.status === "stopped" ? "Emergency stop is active. Reset to start again." : "Ready for a new voting window."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "space-y-3 border-t border-border pt-4",
							onSubmit: (e) => {
								e.preventDefault();
								act({
									type: "ballot",
									viewer,
									id: messageId,
									text: command,
									at: at()
								});
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
								onClick: () => act({
									type: "step",
									at: at()
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Execute next move"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: reset,
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreamSignalReplay, {
				owner,
				run: recording.run,
				stopToken
			})
		]
	});
}
function SignalStoryExport({ pack }) {
	const [prepared, setPrepared] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	const generation = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		generation.current++;
		setPrepared(null);
		setBusy(false);
		setError("");
		return () => {
			generation.current++;
		};
	}, [pack?.id, pack?.profile]);
	(0, import_react.useEffect)(() => () => {
		if (prepared) URL.revokeObjectURL(prepared.url);
	}, [prepared]);
	const prepare = async () => {
		if (!pack) return;
		const ticket = ++generation.current;
		setBusy(true);
		setError("");
		try {
			const { prepareSignalStoryCard } = await import("./stream-signal-card-BX-ws176.mjs");
			const next = await prepareSignalStoryCard(pack);
			if (ticket === generation.current) setPrepared({
				...next,
				url: URL.createObjectURL(next.blob)
			});
		} catch (e) {
			if (ticket === generation.current) setError(e instanceof Error ? e.message : "The card could not be prepared. Try again.");
		} finally {
			if (ticket === generation.current) setBusy(false);
		}
	};
	const caption = () => {
		if (!prepared || !pack) return;
		const url = URL.createObjectURL(new Blob([prepared.caption], { type: "text/plain;charset=utf-8" })), link = document.createElement("a");
		link.href = url;
		link.download = `stream-signal-caption-${pack.createdAt}.txt`;
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 space-y-3",
		"data-story-export": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "w-full",
				disabled: !pack || busy,
				onClick: () => void prepare(),
				children: busy ? "Measuring card…" : prepared ? "Refresh export preview" : "Review Story export"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error
			}),
			prepared && pack && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Story export review",
				className: "space-y-3 rounded-md border border-border bg-bg/60 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Measured export · 1080 × 1920"
					}),
					prepared.layout.warnings.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						role: "alert",
						className: "space-y-2 text-sm text-danger",
						children: prepared.layout.warnings.map((warning) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warning }, warning))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "All announcement text fits the card’s safe regions."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: prepared.url,
						alt: `Story announcement: ${pack.profile.creator} is going live. ${pack.profile.title}. ${pack.profile.game}. Full text and stream links are available in the caption below.`,
						className: "mx-auto h-auto w-full max-w-xs rounded-md",
						width: 1080,
						height: 1920
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "signal-primary w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: prepared.url,
							download: `stream-signal-story-${pack.createdAt}.png`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), prepared.layout.warnings.length ? "Download shortened Story PNG" : "Download Story PNG"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "w-full",
						onClick: caption,
						children: "Download full caption / alt text"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "signal-label",
							children: "Full Story caption and text alternative"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							readOnly: true,
							"aria-label": "Full Story caption and text alternative",
							value: prepared.caption,
							rows: 6,
							className: "w-full rounded-md border border-border bg-bg p-3 text-sm text-fg"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "text-xs text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer py-2",
								children: "Text fit and contrast"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "space-y-2",
								children: [prepared.layout.fields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									field.label,
									": ",
									field.lines.length,
									" line(s), ",
									field.size,
									"px · ",
									field.shortened ? "shortened; see full caption" : "full text"
								] }, field.key)), prepared.layout.contrast.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									row.label,
									": ",
									row.ratio.toFixed(2),
									":1"
								] }, row.label))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2",
								children: "Text remains inside the card’s safe regions. Leave room in Instagram for a Link sticker; the PNG itself has no clickable links."
							})
						]
					})
				]
			})
		]
	});
}
var RACING_STRATEGIES = [
	"push",
	"conserve",
	"hold-line",
	"overtake-clear"
];
var num = (v, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(v) && v >= min && v <= max;
var id = (v) => typeof v === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(v);
var obj = (v) => {
	if (!v || typeof v !== "object" || Array.isArray(v)) throw Error("Expected a message object.");
	return v;
};
function keys(v, allowed) {
	if (Object.keys(v).some((key) => !allowed.includes(key))) throw Error("Unknown contract fields are rejected.");
}
var log = (state, message) => ({
	...state,
	log: [...state.log.slice(-39), message]
});
function createRacingContract(session = "offline_demo") {
	if (!id(session)) throw Error("Invalid session identity.");
	return {
		session,
		observation: null,
		lastIntentSeq: 0,
		ids: [],
		queue: [],
		active: null,
		lastNow: 0,
		stopped: false,
		log: ["OFFLINE SIMULATOR: no authenticated transport or game connection."]
	};
}
function trustFailure(state, trust, now) {
	if (!num(now) || !trust || trust.authenticated !== true || trust.paired !== true) return "Transport is unauthenticated or unpaired.";
	if (!id(trust.session) || trust.session !== state.session) return "Pairing session does not match.";
	if (!num(trust.expiresAt) || now >= trust.expiresAt) return "Pairing has expired.";
	try {
		const origin = new URL(trust.origin), approved = new URL(trust.approvedOrigin);
		if (!["http:", "https:"].includes(origin.protocol) || origin.origin !== trust.origin || approved.origin !== trust.approvedOrigin || origin.origin !== approved.origin || origin.username || origin.password) return "Origin is not explicitly approved.";
	} catch {
		return "Origin is not explicitly approved.";
	}
	return "";
}
function emergencyStopRacing(state, reason = "Local emergency stop") {
	return log({
		...state,
		queue: [],
		active: null,
		observation: null,
		stopped: true
	}, reason + ": all strategies cleared; a fresh supervised session is required.");
}
function maintainRacingContract(state, trust, now) {
	if (state.stopped) return state;
	if (!num(now) || now < state.lastNow) return emergencyStopRacing(state, "Clock moved backwards or became invalid");
	state = {
		...state,
		lastNow: now
	};
	const denied = trustFailure(state, trust, now);
	const expired = state.active && now >= state.active.deadline || state.queue.some((work) => now >= work.expiresAt);
	return denied || expired ? emergencyStopRacing(state, denied || "Intent or acknowledgement timeout") : state;
}
function conditionFailure(observation, step, now) {
	if (!observation || observation.at > now || now - observation.at > 1e3) return "A fresh observation is required.";
	if (!observation.ready || observation.danger) return "Controller is not ready or danger is present.";
	if ((step.strategy === "push" || step.strategy === "overtake-clear" || step.requires.includes("grip")) && observation.grip !== "good") return "Current grip is insufficient.";
	if ((step.strategy === "overtake-clear" || step.requires.includes("clear")) && !observation.clear) return "Current clearance is not verified.";
	return "";
}
function readStep(raw) {
	const s = obj(raw);
	keys(s, [
		"strategy",
		"timeoutMs",
		"requires"
	]);
	if (!RACING_STRATEGIES.includes(s.strategy) || !num(s.timeoutMs, 100, 5e3) || !Array.isArray(s.requires) || s.requires.length > 3 || s.requires.some((v) => ![
		"ready",
		"clear",
		"grip"
	].includes(v)) || new Set(s.requires).size !== s.requires.length) throw Error("Unsupported strategy, condition or step timeout.");
	return {
		strategy: s.strategy,
		timeoutMs: s.timeoutMs,
		requires: [...s.requires]
	};
}
function acceptRacingMessage(previous, raw, trust, now) {
	let state = maintainRacingContract(previous, trust, now);
	const rejected = (reason) => ({
		state: log(state, "Rejected: " + reason),
		accepted: false,
		reason
	});
	const denied = trustFailure(state, trust, now);
	if (denied) return rejected(denied);
	if (state.stopped) return rejected("Emergency stop is latched. Start a fresh supervised session.");
	try {
		const m = obj(raw);
		if (JSON.stringify(m).length > 8192) throw Error("Message exceeds the 8 KiB contract limit.");
		if (m.version !== 1 || m.session !== state.session) throw Error("Unsupported version or session.");
		if (m.type === "observation") {
			keys(m, [
				"version",
				"session",
				"type",
				"seq",
				"at",
				"ready",
				"clear",
				"grip",
				"danger"
			]);
			if (!num(m.seq, 1) || m.seq <= (state.observation?.seq ?? 0) || !num(m.at) || m.at > now || now - m.at > 1e3 || state.observation && m.at < state.observation.at || typeof m.ready !== "boolean" || typeof m.clear !== "boolean" || !["good", "low"].includes(m.grip) || typeof m.danger !== "boolean") throw Error("Observation is invalid, stale or out of order.");
			const observation = {
				seq: m.seq,
				at: m.at,
				ready: m.ready,
				clear: m.clear,
				grip: m.grip,
				danger: m.danger
			};
			state = observation.danger || !observation.ready ? emergencyStopRacing(state, "Unsafe observation") : log({
				...state,
				observation
			}, "Fresh observation " + observation.seq + " accepted.");
		} else if (m.type === "intent") {
			keys(m, [
				"version",
				"session",
				"type",
				"id",
				"seq",
				"sentAt",
				"expiresAt",
				"observationSeq",
				"steps"
			]);
			if (!id(m.id) || !num(m.seq, 1) || m.seq <= state.lastIntentSeq || state.ids.includes(m.id) || !num(m.sentAt) || m.sentAt > now || now - m.sentAt > 1e3 || !num(m.expiresAt) || m.expiresAt <= now || m.expiresAt > m.sentAt + 5e3 || !state.observation || m.observationSeq !== state.observation.seq || !Array.isArray(m.steps) || m.steps.length < 1 || m.steps.length > 4) throw Error("Intent identity, lifetime, observation or sequence is invalid.");
			if (state.queue.length + (state.active ? 1 : 0) >= 4) throw Error("Bounded strategy queue is full.");
			const steps = m.steps.map(readStep), failure = conditionFailure(state.observation, steps[0], now);
			if (failure) throw Error(failure);
			const work = {
				id: m.id,
				seq: m.seq,
				expiresAt: m.expiresAt,
				steps,
				index: 0,
				lastObservationSeq: 0
			};
			state = log({
				...state,
				queue: [...state.queue, work],
				ids: [...state.ids.slice(-127), work.id],
				lastIntentSeq: work.seq
			}, "Strategic sequence queued; no game input executed.");
		} else if (m.type === "ack") {
			keys(m, [
				"version",
				"session",
				"type",
				"intentId",
				"step",
				"observationSeq",
				"outcome"
			]);
			const active = state.active;
			if (!active || m.intentId !== active.work.id || m.step !== active.work.index || m.observationSeq !== state.observation?.seq || !["completed", "interrupted"].includes(m.outcome)) throw Error("Acknowledgement does not match the active step and fresh observation.");
			const failure = conditionFailure(state.observation, active.work.steps[active.work.index], now);
			if (failure || m.outcome === "interrupted") state = emergencyStopRacing(state, failure || "Controller interrupted the sequence");
			else {
				const work = {
					...active.work,
					index: active.work.index + 1,
					lastObservationSeq: active.observationSeq
				};
				state = log({
					...state,
					active: null,
					queue: work.index < work.steps.length ? [work, ...state.queue] : state.queue
				}, "Step acknowledged; remaining strategy waits for a new local dispatch check.");
			}
		} else if (m.type === "stop") {
			keys(m, [
				"version",
				"session",
				"type"
			]);
			state = emergencyStopRacing(state);
		} else throw Error("Unknown contract message type.");
		return {
			state,
			accepted: true,
			reason: "Accepted by the offline contract validator."
		};
	} catch (e) {
		return rejected(e instanceof Error ? e.message : "Malformed message.");
	}
}
function dispatchRacingStep(previous, trust, now) {
	let state = maintainRacingContract(previous, trust, now);
	if (state.stopped || state.active || !state.queue.length) return {
		state,
		dispatch: null
	};
	const [work, ...remaining] = state.queue, step = work.steps[work.index], failure = conditionFailure(state.observation, step, now);
	if (failure || work.index > 0 && state.observation.seq <= work.lastObservationSeq) return {
		state: emergencyStopRacing(state, failure || "A new observation is required before the next sequence step"),
		dispatch: null
	};
	const deadline = Math.min(now + step.timeoutMs, work.expiresAt, trust.expiresAt);
	state = log({
		...state,
		queue: remaining,
		active: {
			work,
			deadline,
			observationSeq: state.observation.seq
		}
	}, "OFFLINE dispatch: " + step.strategy + "; waiting for acknowledgement.");
	return {
		state,
		dispatch: {
			intentId: work.id,
			step: work.index,
			strategy: step.strategy,
			observationSeq: state.observation.seq,
			expiresAt: deadline
		}
	};
}
function offlineRacingExample() {
	const now = 1e4, session = "offline_demo";
	return {
		label: "OFFLINE EXAMPLE — trust flags are fixtures, not authentication",
		now,
		trust: {
			authenticated: true,
			paired: true,
			session,
			origin: "http://127.0.0.1:8080",
			approvedOrigin: "http://127.0.0.1:8080",
			expiresAt: 7e4
		},
		observation: {
			version: 1,
			session,
			type: "observation",
			seq: 1,
			at: now,
			ready: true,
			clear: true,
			grip: "good",
			danger: false
		},
		intent: {
			version: 1,
			session,
			type: "intent",
			id: "strategy_1",
			seq: 1,
			sentAt: now,
			expiresAt: 15e3,
			observationSeq: 1,
			steps: [{
				strategy: "overtake-clear",
				timeoutMs: 1e3,
				requires: [
					"ready",
					"clear",
					"grip"
				]
			}, {
				strategy: "hold-line",
				timeoutMs: 1e3,
				requires: ["ready"]
			}]
		}
	};
}
var example = offlineRacingExample();
function initial() {
	return {
		state: acceptRacingMessage(createRacingContract(), example.observation, example.trust, example.now).state,
		trust: { ...example.trust },
		now: example.now,
		message: "Fresh simulated observation loaded. No transport is connected."
	};
}
function RacingContractLab() {
	const [simulation, setSimulation] = (0, import_react.useState)(initial), [input, setInput] = (0, import_react.useState)(JSON.stringify(example.intent, null, 2)), [clear, setClear] = (0, import_react.useState)(true);
	const { state, trust, now } = simulation;
	const receive = (raw) => setSimulation((current) => {
		const result = acceptRacingMessage(current.state, raw, current.trust, current.now);
		return {
			...current,
			state: result.state,
			message: (result.accepted ? "Accepted: " : "Rejected: ") + result.reason
		};
	});
	const exportExample = () => {
		const url = URL.createObjectURL(new Blob([JSON.stringify(example, null, 2)], { type: "application/json" })), link = document.createElement("a");
		link.href = url;
		link.download = "offline-racing-contract-v1.json";
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "signal-panel space-y-4",
		"aria-label": "Offline racing contract validator",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "signal-badge",
					children: "Offline contract v1 · no game connection"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-3 text-2xl font-semibold text-fg",
					children: "Test the adapter boundary."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-6 text-muted",
					children: "These fixture flags simulate a trusted local transport. Editing JSON cannot authenticate a real adapter. A separate local service must verify pairing, exact origin, session expiry and credentials before it supplies that trust. Continuous steering and braking belong to that local controller."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-4 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						"aria-label": "Simulated authenticated pairing",
						checked: trust.authenticated,
						onChange: (e) => {
							const authenticated = e.target.checked;
							setSimulation((current) => {
								const trust = {
									...current.trust,
									authenticated
								};
								return {
									...current,
									trust,
									state: maintainRacingContract(current.state, trust, current.now),
									message: authenticated ? "Fixture trust restored; reset the offline session to clear a latched stop." : "Fixture authentication revoked. Pending strategies were cleared."
								};
							});
						}
					}), "Simulated authenticated pairing"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						"aria-label": "Simulated track clearance",
						checked: clear,
						onChange: (e) => setClear(e.target.checked)
					}), "Track clear in next observation"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "signal-label",
					children: "Offline message JSON"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					"aria-label": "Offline racing message JSON",
					value: input,
					onChange: (e) => setInput(e.target.value),
					maxLength: 8192,
					rows: 9,
					className: "w-full rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							try {
								receive(JSON.parse(input));
							} catch {
								setSimulation((current) => ({
									...current,
									message: "Rejected: enter a valid JSON message. Current state was kept."
								}));
							}
						},
						children: "Validate offline message"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => receive({
							...example.observation,
							at: now,
							seq: (state.observation?.seq ?? 1) + 1,
							clear
						}),
						children: "Send fresh simulated observation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: exportExample,
						children: "Export contract example"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "rounded-md bg-bg/60 p-3 text-sm text-fg",
				children: simulation.message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border p-4",
				"data-racing-contract": state.stopped ? "stopped" : "ready",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-fg",
					children: [
						"Fixture clock: ",
						now,
						"ms · Queue ",
						state.queue.length,
						"/4 · ",
						state.active ? `Awaiting acknowledgement for ${state.active.work.steps[state.active.work.index].strategy}` : "No active step",
						" · ",
						state.stopped ? "Stop latched" : "Offline validator ready"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: state.stopped || !!state.active || !state.queue.length,
							onClick: () => setSimulation((current) => {
								const result = dispatchRacingStep(current.state, current.trust, current.now);
								return {
									...current,
									state: result.state,
									message: result.dispatch ? `Offline dispatch checked: ${result.dispatch.strategy}. No game input was sent.` : "Dispatch denied. Inspect the controller log."
								};
							}),
							children: "Simulate local dispatch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: !state.active || state.stopped,
							onClick: () => receive({
								version: 1,
								session: state.session,
								type: "ack",
								intentId: state.active.work.id,
								step: state.active.work.index,
								observationSeq: state.observation?.seq,
								outcome: "completed"
							}),
							children: "Simulate acknowledgement"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setSimulation((current) => {
								const now = current.now + 2e3;
								return {
									...current,
									now,
									state: maintainRacingContract(current.state, current.trust, now),
									message: "Clock advanced by 2 seconds. Dispatch rechecks freshness; missing acknowledgements expire."
								};
							}),
							children: "Advance fixture clock 2s"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => setSimulation((current) => ({
								...current,
								state: emergencyStopRacing(current.state),
								message: "Offline emergency stop: votes/intents and active work cleared. Reset required."
							})),
							children: "Stop offline adapter"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								setSimulation(initial());
								setInput(JSON.stringify(example.intent, null, 2));
								setClear(true);
							},
							children: "Reset offline fixture"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				"aria-label": "Offline racing controller log",
				className: "max-h-60 space-y-2 overflow-auto rounded-md bg-bg/60 p-4 font-mono text-xs leading-5 text-muted",
				children: state.log.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, index))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: "Four queued/active strategic sequences maximum; one to four steps each. Observations expire after 1 second. Intents last at most 5 seconds; acknowledgements have a 100–5000ms step timeout. Every dispatch checks current readiness, danger, grip and required clearance. Unknown commands, versions, sessions and fields fail closed. Stop, pairing loss and timeouts clear pending work."
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
		className: "signal-story flex flex-col justify-between gap-4 overflow-hidden p-6",
		"aria-label": "Announcement Story preview",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest",
					children: "STREAM SIGNAL"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 line-clamp-2 break-words text-3xl font-semibold",
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
						className: "mt-3 line-clamp-3 break-words text-xl font-semibold",
						children: pack.profile.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 line-clamp-2 break-words text-sm",
						children: pack.profile.game
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "line-clamp-2 text-sm",
				children: pack.profile.message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 break-all",
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
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalStoryExport, { pack }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-xs leading-5 text-muted",
											children: "This layout sketch may shorten text. Review the measured export before downloading. Upload the PNG yourself, then add a Link sticker for a tappable stream URL."
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
					section === "lab" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreamSignalLab, { owner }),
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RacingContractLab, {}),
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
export { StreamSignalSection, validateSignalProfile as t };
