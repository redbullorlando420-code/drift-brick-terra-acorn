import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as RefreshCw, D as Pause, G as Images, H as Lightbulb, I as Maximize2, N as MessageCircle, O as PackageSearch, S as Rocket, T as Play, W as Laptop, Z as Gamepad2, _ as Shuffle, b as Settings2, ct as Clapperboard, dt as ChevronLeft, f as Star, ht as Bot, it as Download, j as MonitorPlay, k as Music2, m as Smartphone, mt as Box, n as X, ot as Copy, pt as ChartColumn, q as ImagePlus, r as Wifi, rt as ExternalLink, s as Users, ut as ChevronRight, v as ShoppingBag, w as Radio, x as Search, y as ShieldCheck } from "../_libs/lucide-react.mjs";
import { C as topicsForVideo, S as topicEvidence, T as measureInteraction, _ as resumeForVideo, a as Input, b as canonicalTopic, c as getRenderBudgetSnapshot, d as getRating, f as tagIsLiked, g as Button, h as useThumbs, i as getFirstShelfTrace, l as exportFeedback, m as getThumbDiagnostics, n as getNetworkDeviceId, o as openTopic, p as toggleTagLike, r as listNetworkDevices, s as VideoCard, u as getFeedbackDiagnostics, v as useLibrary, w as getInteractionBudgetSnapshot, x as isTopicTag, y as useSourceAssets } from "./routes-Ry6ahRqg.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hub-sections-D4nTPE5m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TopicLinks({ explorer = false }) {
	const videos = useLibrary((s) => s.videos);
	const tags = useLibrary((s) => s.tags);
	const folders = useLibrary((s) => s.folders);
	const unavailable = useLibrary((s) => s.unavailable);
	const hideDemo = useLibrary((s) => s.hideDemo);
	const query = useLibrary((s) => s.query);
	const [provider, setProvider] = (0, import_react.useState)("all");
	const [limit, setLimit] = (0, import_react.useState)(48);
	const [favoriteRevision, setFavoriteRevision] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const refresh = () => setFavoriteRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	const selected = explorer ? canonicalTopic(query) : void 0;
	const selectedGenre = explorer && query.startsWith("genre:") ? query.slice(6) : void 0;
	const index = (0, import_react.useMemo)(() => {
		const hidden = new Set(folders.filter((f) => f.adult).map((f) => f.id));
		const known = new Set(folders.map((f) => f.id));
		const rows = videos.filter((v) => !hidden.has(v.folderId) && !unavailable[v.id] && !(hideDemo && v.isSample) && (known.has(v.folderId) || v.remote || v.isSample)).map((video) => ({
			video,
			topics: topicsForVideo(video, tags[video.id]),
			provider: video.remote?.kind ?? "local"
		}));
		const counts = /* @__PURE__ */ new Map();
		const sources = /* @__PURE__ */ new Map();
		let saved = 0, linked = 0;
		for (const row of rows) {
			const source = sources.get(row.video.folderId) ?? {
				total: 0,
				linked: 0
			};
			source.total++;
			source.linked += Number(row.topics.length > 0);
			sources.set(row.video.folderId, source);
			if (row.topics.length) linked++;
			if (topicEvidence(row.video, tags[row.video.id]).some((link) => link.saved)) saved++;
			for (const topic of row.topics) {
				const entry = counts.get(topic) ?? {
					count: 0,
					providers: /* @__PURE__ */ new Set(),
					ratingTotal: 0
				};
				entry.count++;
				entry.ratingTotal += getRating(row.video.id);
				entry.providers.add(row.provider);
				counts.set(topic, entry);
			}
		}
		return {
			rows,
			saved,
			linked,
			counts: [...counts].sort((a, b) => Number(tagIsLiked(b[0])) - Number(tagIsLiked(a[0])) || b[1].ratingTotal / b[1].count - a[1].ratingTotal / a[1].count || b[1].count - a[1].count || a[0].localeCompare(b[0])),
			gaps: [...sources].map(([id, s]) => ({
				id,
				...s
			})).sort((a, b) => b.total - b.linked - (a.total - a.linked)).slice(0, 8)
		};
	}, [
		videos,
		tags,
		folders,
		unavailable,
		hideDemo,
		favoriteRevision
	]);
	const genres = (0, import_react.useMemo)(() => [...new Set(index.rows.map((r) => r.video.genre).filter((g) => Boolean(g)))].sort(), [index]);
	const matching = (0, import_react.useMemo)(() => index.rows.filter((row) => (!selected || row.topics.includes(selected)) && (!selectedGenre || row.video.genre === selectedGenre) && (provider === "all" || provider === row.provider)), [
		index,
		selected,
		selectedGenre,
		provider
	]);
	const related = (0, import_react.useMemo)(() => {
		const counts = /* @__PURE__ */ new Map();
		if (selected) {
			for (const row of matching) for (const topic of row.topics) if (topic !== selected) {
				const entry = counts.get(topic) ?? {
					shared: 0,
					ratingTotal: 0
				};
				entry.shared++;
				entry.ratingTotal += getRating(row.video.id);
				counts.set(topic, entry);
			}
		}
		return [...counts].sort((a, b) => b[1].ratingTotal / b[1].shared - a[1].ratingTotal / a[1].shared || b[1].shared - a[1].shared || a[0].localeCompare(b[0])).slice(0, 12);
	}, [matching, selected]);
	const choose = (topic) => {
		setLimit(48);
		setProvider("all");
		openTopic(topic);
	};
	const exportLinks = () => {
		const body = [[
			"topic",
			"public_titles",
			"rating_score_0_to_5000",
			"ratings_total",
			"providers",
			"saved_tag_titles",
			"inferred_only_titles"
		], ...index.counts.map(([topic, data]) => {
			const saved = index.rows.filter((r) => topicEvidence(r.video, tags[r.video.id]).some((link) => link.topic === topic && link.saved)).length;
			return [
				topic,
				data.count,
				String(Math.round(data.ratingTotal / data.count * 1e3)),
				data.ratingTotal.toFixed(1),
				[...data.providers].join(" + "),
				saved,
				data.count - saved
			];
		})].map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
		const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `reelcase-topic-links-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	const selectedScore = selected ? index.counts.find(([topic]) => topic === selected)?.[1] : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					index.linked.toLocaleString(),
					" of ",
					index.rows.length.toLocaleString(),
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
						onClick: () => {
							toggleTagLike(selected);
							setFavoriteRevision((value) => value + 1);
						},
						children: tagIsLiked(selected) ? "★ Favorite topic" : "☆ Favorite topic"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Favorite topics stay at the start of Topics and Stats."
					}),
					selectedScore && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						children: [
							"score ",
							Math.round(selectedScore.ratingTotal / selectedScore.count * 1e3).toLocaleString(),
							"/5,000 from ",
							selectedScore.count.toLocaleString(),
							" linked titles"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: index.counts.map(([topic, data]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
			!index.counts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "No supported topics yet. Add descriptive titles or saved topic tags to connect your media."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				size: "sm",
				variant: "secondary",
				onClick: exportLinks,
				children: "Export topic connections"
			}),
			explorer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				genres.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mt-4 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "cursor-pointer",
						children: ["Media genres and Twitch categories · ", genres.length]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: genres.map((genre) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: selectedGenre === genre ? "default" : "secondary",
							onClick: () => choose(`genre:${genre}`),
							children: genre
						}, genre))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => {
							useLibrary.getState().setQuery("");
							setLimit(48);
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
						onClick: () => {
							setProvider(kind);
							setLimit(48);
						},
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm text-muted",
					children: [
						matching.length.toLocaleString(),
						" matching ",
						matching.length === 1 ? "title" : "titles"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
					children: matching.slice(0, limit).map(({ video }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
						video,
						variant: "grid",
						index: i
					}), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: topicEvidence(video, tags[video.id]).find((link) => link.topic === selected)?.reason
					})] }, video.id))
				}),
				matching.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					variant: "secondary",
					onClick: () => setLimit((n) => n + 48),
					children: "Show 48 more"
				})
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
var FAST_POLL_MS = 400;
var IDLE_POLL_MS = 2e3;
var PING_INTERVAL_MS = 2e3;
var STALL_MS = 1e4;
var MAX_RECOVERY_ATTEMPTS = 3;
var SIGNAL_RETRY_DELAYS_MS = [250, 750];
function defaultIceServers() {
	return [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
}
var P2PRoom = class {
	opts;
	peers = /* @__PURE__ */ new Map();
	/** Per-remote-peer signal delivery chains (order-preserving). */
	signalQueues = /* @__PURE__ */ new Map();
	cursor = 0;
	pollTimer = null;
	pingTimer = null;
	closed = false;
	everPolled = false;
	lastPeersFingerprint = "";
	lastRosterCount = -1;
	/** Same-origin tabs get a zero-config reliable fallback while WebRTC negotiates. */
	localRelay = null;
	debug(event) {
		this.opts.onDebug?.(`${(/* @__PURE__ */ new Date()).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		})} · ${event}`);
	}
	constructor(opts) {
		this.opts = opts;
	}
	/**
	* The first poll IS the join: it registers this peer and returns the
	* roster. A failed first poll (cold DB, offline tab) must not strand the
	* room: the loop and timers start regardless and the next poll retries.
	*/
	async join() {
		if (typeof BroadcastChannel !== "undefined") {
			this.localRelay = new BroadcastChannel(`reelcase-watch:${this.opts.room}`);
			this.localRelay.onmessage = (event) => {
				const message = event.data;
				if (!message || message.from === this.opts.selfId || message.to && message.to !== this.opts.selfId) return;
				this.debug("Local tab relay delivered a room message");
				this.opts.onMessage?.(message.from ?? "local-guest", message.data, "reliable");
			};
			this.debug("Local tab relay ready");
			this.opts.onConnected?.();
		}
		try {
			await this.pollOnce();
			this.debug("Signaling registered");
		} catch {
			this.debug("Signaling retry scheduled");
		}
		if (this.closed) return;
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
		this.pingTimer = setInterval(() => {
			this.pingAll();
			this.watchdog();
		}, PING_INTERVAL_MS);
	}
	close() {
		this.closed = true;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		if (this.pingTimer) clearInterval(this.pingTimer);
		this.localRelay?.close();
		this.localRelay = null;
		for (const slot of this.peers.values()) slot.pc.close();
		this.peers.clear();
		fetch("/api/rtc", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				op: "leave",
				room: this.opts.room,
				peer: this.opts.selfId
			}),
			keepalive: true
		}).catch(() => {});
	}
	/** Send on the unreliable game-state channel (drops stale packets). */
	broadcast(data) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		for (const slot of this.peers.values()) if (slot.state?.readyState === "open") slot.state.send(wire);
	}
	/** Send reliably (ordered) to one peer, or to all when peerId is omitted. */
	send(data, peerId) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		const targets = peerId ? [this.peers.get(peerId)] : [...this.peers.values()];
		let delivered = false;
		for (const slot of targets) {
			if (slot?.reliable?.readyState === "open") delivered = true;
			if (slot?.reliable?.readyState === "open") slot.reliable.send(wire);
		}
		if (!delivered) this.localRelay?.postMessage({
			from: this.opts.selfId,
			to: peerId,
			data
		});
	}
	peerList() {
		return [...this.peers.values()].map((s) => ({ ...s.info }));
	}
	schedulePoll(delay) {
		if (this.closed) return;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = setTimeout(() => void this.poll(), delay);
	}
	anyPairConnecting() {
		for (const s of this.peers.values()) {
			if (s.terminal) continue;
			if (s.info.connectionState !== "connected") return true;
		}
		return false;
	}
	async pollOnce() {
		const params = new URLSearchParams({
			room: this.opts.room,
			peer: this.opts.selfId,
			name: this.opts.name ?? "",
			since: String(this.cursor)
		});
		const res = await fetch(`/api/rtc?${params}`);
		if (this.closed) return;
		if (!res.ok) throw new Error(`signaling poll failed: ${res.status}`);
		const body = await res.json();
		if (this.closed) return;
		if (!this.everPolled) {
			this.everPolled = true;
			this.opts.onConnected?.();
		}
		this.reconcileRoster(body.peers);
		const otherPeers = Math.max(0, body.peers.length - 1);
		if (otherPeers !== this.lastRosterCount) {
			this.lastRosterCount = otherPeers;
			this.debug(`Roster visible: ${otherPeers} other peer${otherPeers === 1 ? "" : "s"}`);
		}
		const roster = new Set(body.peers.map((p) => p.id));
		for (const sig of body.signals) {
			this.cursor = Math.max(this.cursor, sig.id);
			await this.onSignal(sig.from, sig.kind, sig.payload, roster);
			if (this.closed) return;
		}
	}
	async poll() {
		if (this.closed) return;
		try {
			await this.pollOnce();
		} catch {}
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
	}
	reconcileRoster(peers) {
		const alive = new Set(peers.map((p) => p.id));
		for (const p of peers) {
			if (p.id === this.opts.selfId) continue;
			const existing = this.peers.get(p.id);
			if (existing) existing.info.name = p.name;
			else this.connectTo(p.id, p.name, this.opts.selfId > p.id);
		}
		for (const [id, slot] of this.peers) if (!alive.has(id)) {
			slot.pc.close();
			this.peers.delete(id);
		}
		this.emitPeers();
	}
	connectTo(peerId, name, initiator) {
		if (this.closed) return null;
		const pc = new RTCPeerConnection({ iceServers: this.opts.iceServers ?? defaultIceServers() });
		const slot = {
			pc,
			makingOffer: false,
			ignoreOffer: false,
			pendingCandidates: [],
			lastProgressAt: Date.now(),
			recoveryAttempts: 0,
			info: {
				id: peerId,
				name,
				connectionState: pc.connectionState,
				candidateType: null,
				rttMs: null
			}
		};
		this.peers.set(peerId, slot);
		pc.onicecandidate = (e) => {
			if (e.candidate) this.sendSignal(peerId, "ice", e.candidate.toJSON());
		};
		pc.onconnectionstatechange = () => {
			slot.info.connectionState = pc.connectionState;
			if (pc.connectionState === "connecting" || pc.connectionState === "connected") slot.lastProgressAt = Date.now();
			if (pc.connectionState === "connected") {
				slot.recoveryAttempts = 0;
				slot.terminal = false;
				this.readCandidateType(slot);
			}
			this.emitPeers();
			if (pc.connectionState === "failed") pc.restartIce();
			if (pc.connectionState === "failed" || pc.connectionState === "disconnected") this.schedulePoll(FAST_POLL_MS);
		};
		pc.onnegotiationneeded = async () => {
			try {
				slot.makingOffer = true;
				await pc.setLocalDescription();
				await this.sendSignal(peerId, "offer", pc.localDescription.toJSON());
			} catch {} finally {
				slot.makingOffer = false;
			}
		};
		pc.ondatachannel = (e) => this.attachChannel(slot, e.channel);
		if (initiator) {
			this.debug(`Negotiating direct channel with ${name || "guest"}`);
			this.attachChannel(slot, pc.createDataChannel("state", {
				ordered: false,
				maxRetransmits: 0
			}));
			this.attachChannel(slot, pc.createDataChannel("reliable", { ordered: true }));
		}
		return slot;
	}
	attachChannel(slot, channel) {
		if (channel.label === "state") slot.state = channel;
		else slot.reliable = channel;
		channel.onopen = () => {
			slot.lastProgressAt = Date.now();
			this.debug(`Direct ${channel.label} channel open with ${slot.info.name || "guest"}`);
		};
		channel.onmessage = (e) => {
			let msg;
			try {
				msg = JSON.parse(e.data);
			} catch {
				return;
			}
			if (msg.t === "ping") {
				if (slot.state?.readyState === "open") slot.state.send(JSON.stringify({ t: "pong" }));
			} else if (msg.t === "pong") {
				if (slot.pingSentAt) {
					slot.info.rttMs = Math.round(performance.now() - slot.pingSentAt);
					slot.pingSentAt = void 0;
					this.emitPeers();
				}
			} else this.opts.onMessage?.(slot.info.id, msg.d, channel.label === "state" ? "state" : "reliable");
		};
	}
	/** Apply buffered ICE candidates once a remote description is in place. */
	async flushPendingCandidates(slot) {
		while (slot.pendingCandidates.length > 0) {
			const candidate = slot.pendingCandidates.shift();
			try {
				await slot.pc.addIceCandidate(candidate);
			} catch (err) {
				if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
			}
			if (this.closed) return;
		}
	}
	async onSignal(from, kind, payload, roster) {
		if (this.closed) return;
		let slot = this.peers.get(from);
		if (!slot) {
			if (!roster.has(from)) return;
			const created = this.connectTo(from, "", false);
			if (!created) return;
			slot = created;
		}
		const polite = this.opts.selfId < from;
		try {
			if (kind === "offer" || kind === "answer") {
				const description = payload;
				const collision = kind === "offer" && (slot.makingOffer || slot.pc.signalingState !== "stable");
				slot.ignoreOffer = !polite && collision;
				if (slot.ignoreOffer) return;
				try {
					await slot.pc.setRemoteDescription(description);
				} catch (err) {
					if (kind !== "offer" || slot.recreatedForOffer) throw err;
					const attempts = slot.recoveryAttempts;
					const name = slot.info.name;
					slot.pc.close();
					this.peers.delete(from);
					const fresh = this.connectTo(from, name, false);
					if (!fresh) return;
					fresh.recoveryAttempts = attempts;
					fresh.recreatedForOffer = true;
					slot = fresh;
					await slot.pc.setRemoteDescription(description);
				}
				if (this.closed) return;
				await this.flushPendingCandidates(slot);
				if (this.closed) return;
				if (kind === "offer") {
					await slot.pc.setLocalDescription();
					if (this.closed) return;
					await this.sendSignal(from, "answer", slot.pc.localDescription.toJSON());
				}
			} else if (kind === "ice") {
				const candidate = payload;
				if (!slot.pc.remoteDescription) {
					slot.pendingCandidates.push(candidate);
					return;
				}
				try {
					await slot.pc.addIceCandidate(candidate);
				} catch (err) {
					if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
				}
			}
		} catch {}
	}
	/**
	* Signals are serialized per remote peer (a candidate must never overtake
	* its SDP into the DB) and retried on failure with short backoff.
	*/
	sendSignal(to, kind, payload) {
		const next = (this.signalQueues.get(to) ?? Promise.resolve()).then(() => this.postSignal(to, kind, payload));
		this.signalQueues.set(to, next.catch(() => {}));
		return next;
	}
	async postSignal(to, kind, payload) {
		for (let attempt = 0;; attempt++) {
			if (this.closed) return;
			try {
				const res = await fetch("/api/rtc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						op: "signal",
						room: this.opts.room,
						from: this.opts.selfId,
						to,
						kind,
						payload
					})
				});
				if (res.ok) return;
				throw new Error(`signal POST failed: ${res.status}`);
			} catch (err) {
				if (attempt >= SIGNAL_RETRY_DELAYS_MS.length) {
					console.warn(`[p2p] signal ${kind} to ${to} failed after retries`, err);
					this.debug(`Could not deliver ${kind} signal`);
					return;
				}
				await new Promise((r) => setTimeout(r, SIGNAL_RETRY_DELAYS_MS[attempt]));
			}
		}
	}
	pingAll() {
		const wire = JSON.stringify({ t: "ping" });
		for (const slot of this.peers.values()) {
			if (slot.state?.readyState !== "open") continue;
			const stale = slot.pingSentAt !== void 0 && performance.now() - slot.pingSentAt > 2 * PING_INTERVAL_MS;
			if (slot.pingSentAt === void 0 || stale) {
				slot.pingSentAt = performance.now();
				slot.state.send(wire);
			}
		}
	}
	/**
	* Stuck-pair recovery, piggybacked on the ping interval. A pair that has
	* made no progress for STALL_MS gets rebuilt by the dialer with a FRESH
	* RTCPeerConnection (new DTLS identity — fixes the suspend/resume
	* fingerprint wedge). After MAX_RECOVERY_ATTEMPTS the pair is terminal:
	* visible to the app as its last connectionState, ignored by fast-poll.
	*/
	watchdog() {
		if (this.closed) return;
		const now = Date.now();
		for (const [peerId, slot] of this.peers) {
			const live = slot.pc.connectionState;
			if (live !== slot.info.connectionState) {
				slot.info.connectionState = live;
				if (live === "connecting" || live === "connected") slot.lastProgressAt = now;
				this.emitPeers();
			}
			if (slot.terminal || live === "connected") continue;
			if (now - slot.lastProgressAt <= STALL_MS) continue;
			if (slot.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
				slot.terminal = true;
				this.emitPeers();
				continue;
			}
			slot.recoveryAttempts += 1;
			slot.lastProgressAt = now;
			if (this.opts.selfId > peerId) {
				const { name } = slot.info;
				const attempts = slot.recoveryAttempts;
				slot.pc.close();
				this.peers.delete(peerId);
				const fresh = this.connectTo(peerId, name, true);
				if (fresh) fresh.recoveryAttempts = attempts;
				this.schedulePoll(FAST_POLL_MS);
			}
		}
	}
	async readCandidateType(slot) {
		try {
			const stats = await slot.pc.getStats();
			let selected;
			stats.forEach((s) => {
				if (s.type === "candidate-pair" && s.nominated) selected = s;
			});
			const localId = selected?.localCandidateId;
			if (localId) {
				const local = stats.get(localId);
				slot.info.candidateType = local?.candidateType ?? null;
				this.emitPeers();
			}
		} catch {}
	}
	emitPeers() {
		const list = this.peerList();
		const fingerprint = JSON.stringify(list.map((p) => [
			p.id,
			p.name,
			p.connectionState,
			p.candidateType,
			p.rttMs
		]));
		if (fingerprint === this.lastPeersFingerprint) return;
		this.lastPeersFingerprint = fingerprint;
		this.opts.onPeersChanged?.(list);
	}
};
function useP2PRoom(room, name) {
	const [selfId] = (0, import_react.useState)(() => `p-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`);
	const [peers, setPeers] = (0, import_react.useState)([]);
	const [joined, setJoined] = (0, import_react.useState)(false);
	const [events, setEvents] = (0, import_react.useState)([]);
	const ref = (0, import_react.useRef)(null);
	const listeners = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (!room.trim()) {
			setJoined(false);
			setPeers([]);
			setEvents([]);
			ref.current = null;
			return;
		}
		setEvents(["Preparing room connection…"]);
		const p2p = new P2PRoom({
			room,
			selfId,
			name,
			onPeersChanged: setPeers,
			onConnected: () => setJoined(true),
			onDebug: (event) => setEvents((items) => [event, ...items].slice(0, 16)),
			onMessage: (from, data) => listeners.current.forEach((fn) => fn(from, data))
		});
		ref.current = p2p;
		p2p.join();
		return () => {
			ref.current = null;
			p2p.close();
		};
	}, [
		room,
		selfId,
		name
	]);
	return {
		selfId,
		peers,
		joined,
		events,
		send: (0, import_react.useCallback)((data, peer) => ref.current?.send(data, peer), []),
		onMessage: (0, import_react.useCallback)((fn) => {
			listeners.current.add(fn);
			return () => {
				listeners.current.delete(fn);
			};
		}, [])
	};
}
var VISION_MODELS = {
	semantic: {
		name: "CLIP open-vocabulary",
		purpose: "Accurate review tags",
		model: "Xenova/clip-vit-base-patch32",
		revision: "d15189d7028b43f1d3e65039190477f6af591c2a"
	},
	semanticPlus: {
		name: "SigLIP semantic+",
		purpose: "Stronger semantic photo review",
		model: "Xenova/siglip-base-patch16-224",
		revision: "4649052"
	},
	semanticPro: {
		name: "SigLIP large+",
		purpose: "Highest-detail browser semantic review",
		model: "Xenova/siglip-large-patch16-256"
	}
};
var SEMANTIC_TOPICS = [
	"a person",
	"a portrait",
	"a selfie",
	"a group of people",
	"a baby",
	"a child",
	"a pet",
	"a dog",
	"a cat",
	"a bird",
	"a horse",
	"wildlife",
	"food",
	"a meal",
	"dessert",
	"a drink",
	"a restaurant",
	"a kitchen",
	"a recipe",
	"travel",
	"a vacation",
	"a hotel",
	"an airport",
	"a beach",
	"an ocean",
	"a lake",
	"a mountain",
	"a forest",
	"a sunset",
	"a sunrise",
	"a landscape",
	"nature",
	"a garden",
	"a flower",
	"a tree",
	"a vehicle",
	"a car",
	"a truck",
	"a motorcycle",
	"a bicycle",
	"a boat",
	"an airplane",
	"a train",
	"a building",
	"a house",
	"an apartment",
	"a city",
	"a street",
	"architecture",
	"a landmark",
	"a bridge",
	"a pool",
	"a party",
	"a wedding",
	"a birthday",
	"a concert",
	"a festival",
	"a sport",
	"a game",
	"fitness",
	"a team",
	"a trophy",
	"a stage",
	"a crowd",
	"a document",
	"a receipt",
	"an invoice",
	"a form",
	"a book",
	"a screen",
	"a screenshot",
	"a computer",
	"a phone",
	"a television",
	"a video game",
	"a chart",
	"a map",
	"a product",
	"clothing",
	"shoes",
	"jewelry",
	"furniture",
	"a toy",
	"art",
	"a drawing",
	"a painting",
	"a meme",
	"an indoor scene",
	"an outdoor scene",
	"night",
	"low light",
	"snow",
	"rain",
	"autumn",
	"spring",
	"summer",
	"winter",
	"black and white photo",
	"close-up photo"
];
var classifiers = /* @__PURE__ */ new Map();
function cleanLabel(label) {
	return label.toLowerCase().split(",")[0].replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function device() {
	return typeof navigator !== "undefined" && "gpu" in navigator ? "webgpu" : "wasm";
}
async function classifierFor(model, onStatus) {
	let classifier = classifiers.get(model);
	if (!classifier) {
		classifier = (async () => {
			const { pipeline } = await import("../_libs/@huggingface/transformers+[...].mjs").then((n) => n.t);
			const definition = VISION_MODELS[model];
			const task = "zero-shot-image-classification";
			const options = {
				progress_callback: onStatus,
				..."revision" in definition ? { revision: definition.revision } : {}
			};
			try {
				return await pipeline(task, definition.model, {
					device: device(),
					...options
				});
			} catch (error) {
				if (device() !== "webgpu") throw error;
				onStatus?.({ status: "WebGPU unavailable; retrying locally with WASM" });
				return pipeline(task, definition.model, {
					device: "wasm",
					...options
				});
			}
		})();
		classifiers.set(model, classifier);
	}
	try {
		return await classifier;
	} catch (error) {
		classifiers.delete(model);
		throw error;
	}
}
/**
* Optional, user-initiated image classification. The model executes in the
* browser (WebGPU when available, otherwise WASM); photo bytes stay local.
* The model download is cached by the browser for later passes.
*/
async function classifyImagesLocally(urls, onProgress, model = "semanticPro", onModelStatus) {
	const classifier = await classifierFor(model, onModelStatus);
	const results = Array.from({ length: urls.length }, () => []);
	let cursor = 0;
	let completed = 0;
	const workers = Array.from({ length: Math.min(1, urls.length) }, async () => {
		while (true) {
			const index = cursor++;
			if (index >= urls.length) return;
			const labels = await classifier(urls[index], SEMANTIC_TOPICS);
			const seen = /* @__PURE__ */ new Set();
			results[index] = labels.map((item) => ({
				label: cleanLabel(item.label),
				score: item.score
			})).filter((item) => item.score >= .018 && item.label.length >= 3 && !seen.has(item.label) && Boolean(seen.add(item.label))).slice(0, 5);
			completed += 1;
			onProgress?.(completed, urls.length);
		}
	});
	await Promise.all(workers);
	return results;
}
/** Measures preparation and inference on the same local sample; it never changes defaults. */
async function benchmarkVisionModelsLocally(urls, onProgress, onModelStatus) {
	const run = async (model) => {
		const started = performance.now();
		onModelStatus?.(model, { status: `Preparing ${VISION_MODELS[model].name}` });
		return {
			model,
			labels: await classifyImagesLocally(urls, (done, total) => onProgress?.(model, done, total), model, (status) => onModelStatus?.(model, status)),
			elapsedMs: performance.now() - started
		};
	};
	return {
		sampleSize: urls.length,
		semantic: await run("semantic"),
		semanticPro: await run("semanticPro")
	};
}
var LOCAL_UPSCALER = {
	name: "Swin2SR x2 beta",
	model: "Xenova/swin2SR-classical-sr-x2-64",
	revision: "93dfc9089abda257351d3a58d5771e2c1ff69442",
	sha256: "49ffa7b96532edb9553c74be11b623dafa26db1645611096a208449451a960df",
	artifactUrl: "https://huggingface.co/Xenova/swin2SR-classical-sr-x2-64/resolve/93dfc9089abda257351d3a58d5771e2c1ff69442/onnx/model_q4f16.onnx",
	shippedArtifactUrl: "/models/swin2sr-x2-q4f16.onnx"
};
var widgetScript;
function loadWidgets() {
	return widgetScript ??= new Promise((resolve, reject) => {
		const existing = window.twttr;
		if (existing?.widgets) {
			resolve(existing);
			return;
		}
		const script = document.createElement("script");
		script.src = "https://platform.twitter.com/widgets.js";
		script.async = true;
		const timeout = window.setTimeout(() => {
			script.remove();
			reject(/* @__PURE__ */ new Error("X did not respond"));
		}, 12e3);
		script.onload = () => {
			clearTimeout(timeout);
			const api = window.twttr;
			api?.widgets ? resolve(api) : reject(/* @__PURE__ */ new Error("X unavailable"));
		};
		script.onerror = () => {
			clearTimeout(timeout);
			script.remove();
			reject(/* @__PURE__ */ new Error("X unavailable"));
		};
		document.head.append(script);
	}).catch((error) => {
		widgetScript = void 0;
		throw error;
	});
}
function XTimeline({ account, topic }) {
	const container = (0, import_react.useRef)(null);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const [status, setStatus] = (0, import_react.useState)("Loading public posts…");
	const deskKey = `reelcase.x-desk.${topic ? `topic:${topic.query}` : `account:${account ?? "public"}`}`;
	const [lastReadAt, setLastReadAt] = (0, import_react.useState)(() => typeof window === "undefined" ? 0 : Number(localStorage.getItem(deskKey) ?? 0));
	(0, import_react.useEffect)(() => {
		const element = container.current;
		if (!element) return;
		let cancelled = false;
		setStatus("Loading public posts…");
		element.replaceChildren();
		const link = document.createElement("a");
		link.className = "twitter-timeline";
		link.href = topic ? `https://twitter.com/search?q=${encodeURIComponent(topic.query)}&src=typed_query&f=live` : `https://twitter.com/${account}`;
		link.dataset.height = "640";
		link.dataset.theme = document.documentElement.dataset.theme === "day" ? "light" : "dark";
		link.dataset.dnt = "true";
		link.textContent = topic ? `Public posts about ${topic.label}` : `Public posts by @${account}`;
		element.append(link);
		const timeout = window.setTimeout(() => {
			if (!cancelled) setStatus("X hasn’t supplied a timeline. Open the profile to view posts, or retry.");
		}, 15e3);
		const observer = new MutationObserver(() => {
			const frame = element.querySelector("iframe");
			if (frame) frame.addEventListener("load", () => {
				if (!cancelled) {
					clearTimeout(timeout);
					const now = Date.now();
					localStorage.setItem(deskKey, String(now));
					setLastReadAt(now);
					setStatus("Public timeline supplied by X. If posts are unavailable, open the profile.");
				}
			}, { once: true });
		});
		observer.observe(element, {
			childList: true,
			subtree: true
		});
		loadWidgets().then((api) => {
			if (!cancelled) return api.widgets.load(element);
		}).catch(() => {
			if (!cancelled) {
				clearTimeout(timeout);
				setStatus("X is unavailable here. Your saved accounts are still ready to open.");
			}
		});
		return () => {
			cancelled = true;
			clearTimeout(timeout);
			observer.disconnect();
			element.replaceChildren();
		};
	}, [
		account,
		attempt,
		deskKey,
		topic
	]);
	const destination = topic ? `https://x.com/search?q=${encodeURIComponent(topic.query)}&src=typed_query&f=live` : `https://x.com/${account}`;
	const title = topic ? topic.label : `@${account}`;
	const unavailable = /hasn’t supplied|unavailable/i.test(status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-5 rounded-lg border border-border bg-elevated p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setAttempt((value) => value + 1),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Retry"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "inline-flex min-h-11 items-center gap-2 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg",
						href: destination,
						target: "_blank",
						rel: "noopener noreferrer",
						children: [topic ? "Open topic" : "Open profile", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "my-4 text-sm text-muted",
				children: status
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-subtle",
				children: lastReadAt ? `Reading position saved locally · last loaded ${new Date(lastReadAt).toLocaleString()}` : "No public timeline has loaded in this browser yet."
			}),
			unavailable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid gap-3 rounded-md bg-bg/45 p-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm font-medium text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-accent" }), "Public-reader fallback"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: "X did not permit an embedded timeline in this browser. Reelcase does not invent posts or store credentials."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: destination,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg",
						children: ["Open official view", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: topic ? `https://www.google.com/search?q=site%3Ax.com+${encodeURIComponent(topic.query)}` : `https://www.google.com/search?q=site%3Ax.com%2F${encodeURIComponent(account ?? "")}`,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "inline-flex min-h-10 items-center rounded-sm bg-surface px-3 text-sm text-fg shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 size-4" }), "Search public posts"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: container,
				className: "min-h-24 overflow-hidden"
			})
		]
	});
}
var HUB_KEY = "reelcase.hub.v1";
function gameKind(item) {
	if (item.launchUrl) return "web-ready";
	if (/\.url$/i.test(item.name)) return "web-needs-target";
	if (/\.lnk$/i.test(item.name)) return "desktop-shortcut";
	if (/\.appref-ms$/i.test(item.name)) return "desktop-app";
	return "desktop-executable";
}
function isWebGame(item) {
	return gameKind(item).startsWith("web-");
}
function isGameHelper(item) {
	const value = `${item.name} ${item.path}`.toLowerCase();
	return /(?:uninstall|setup|installer|updater|crashpad|helper|redistributable|vcredist|python|node_modules|\\\\lib\\\\|\/lib\/)/.test(value);
}
function gameBadge(item) {
	if (item.launchUrl?.startsWith("steam:")) return "STEAM";
	if (item.launchUrl?.startsWith("epic:") || item.launchUrl?.startsWith("com.epicgames")) return "EPIC";
	if (gameKind(item) === "web-needs-target") return "LINK?";
	if (gameKind(item) === "web-ready") return "WEB";
	if (/\.appref-ms$/i.test(item.name)) return "APP";
	if (/\.lnk$/i.test(item.name)) return "LINK";
	return "GAME";
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
	"alerts-desktop-notifications": "Active: asks the browser for permission, then mirrors enabled Reelcase alerts as desktop notifications.",
	"playback-autoplay-next-video": "Active: starts the next library title when a local video ends.",
	"playback-start-muted": "Active: local video playback starts muted until you raise the player volume.",
	"display-day-mode": "Active: uses the light palette throughout this browser.",
	"display-compact-live-cards": "Active: renders six compact live cards per wide row to reduce scrolling and image work.",
	"performance-use-cached-sources-first": "Active: opens the saved catalog before asking folders or the Companion for fresh file details.",
	"performance-low-memory-grids": "Active: keeps only a smaller card batch mounted in large grids, reducing image decode pressure.",
	"performance-small-home-shelves": "Active: draws shorter Home rails first; use Show more inside a rail when you want depth.",
	"privacy-reduce-motion": "Active: reduces animation and scrolling motion across Reelcase.",
	"privacy-hide-demo-media": "Active: hides bundled demonstration titles from your library shelves."
};
var PREFERENCES = Object.entries(PREFERENCE_GROUPS).flatMap(([group, labels]) => labels.map((label) => ({
	key: `${group}-${label}`.toLowerCase().replaceAll(" ", "-"),
	group,
	label,
	detail: ACTIVE_PREFERENCE_DETAILS[`${group}-${label}`.toLowerCase().replaceAll(" ", "-")],
	implemented: true
})));
function readHub() {
	const samples = [
		{
			name: "Calibration cube.stl",
			path: "Reelcase samples/Calibration cube.stl",
			size: 182400,
			addedAt: 1
		},
		{
			name: "Cable clip.3mf",
			path: "Reelcase samples/Cable clip.3mf",
			size: 94100,
			addedAt: 2
		},
		{
			name: "OpenSCAD phone stand.stl",
			path: "Open-source examples/OpenSCAD phone stand.stl",
			size: 512400,
			addedAt: 4
		},
		{
			name: "Gridfinity bin.3mf",
			path: "Open-source examples/Gridfinity bin.3mf",
			size: 784200,
			addedAt: 5
		},
		{
			name: "Benchy calibration.stl",
			path: "Open-source examples/Benchy calibration.stl",
			size: 643100,
			addedAt: 6
		},
		{
			name: "Parametric drawer label.stl",
			path: "Open-source examples/Parametric drawer label.stl",
			size: 229100,
			addedAt: 7
		},
		{
			name: "Tool tray.gcode",
			path: "Reelcase samples/Tool tray.gcode",
			size: 1248e3,
			addedAt: 3
		}
	];
	try {
		const raw = localStorage.getItem(HUB_KEY);
		if (!raw) return {
			prints: samples,
			games: []
		};
		return JSON.parse(raw);
	} catch {
		return {
			prints: samples,
			games: []
		};
	}
}
function writeHub(next) {
	localStorage.setItem(HUB_KEY, JSON.stringify(next));
}
function filesToItems(files, gamesOnly = false) {
	return [...files].filter((file) => !gamesOnly || /\.(exe|lnk|url|appref-ms)$/i.test(file.name)).filter((file) => !/^(uninstall|setup|crashreporter)/i.test(file.name)).map((file) => ({
		name: file.name,
		path: file.webkitRelativePath || file.name,
		size: file.size,
		addedAt: Date.now()
	}));
}
function bytes(value) {
	if (value <= 0) return "0 B";
	return value < 1048576 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;
}
function watchRoomEmbed(video) {
	const base = video.remote?.embedUrl;
	if (!base) return "";
	const url = new URL(base);
	if (video.remote?.kind === "twitch") {
		url.searchParams.set("parent", window.location.hostname);
		url.searchParams.set("autoplay", "false");
	} else {
		url.searchParams.set("autoplay", "0");
		url.searchParams.set("rel", "0");
		url.searchParams.set("playsinline", "1");
		url.searchParams.set("controls", "1");
		url.searchParams.set("origin", window.location.origin);
		if (video.remote?.kind === "youtube") url.searchParams.set("enablejsapi", "1");
	}
	return url.toString();
}
function watchRoomPoster(video) {
	if (video.remote?.kind === "youtube" && video.remote.videoId) return video.poster || `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg`;
	return video.poster;
}
function roomShuffleRank(id, seed) {
	let value = seed >>> 0;
	for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 73244475);
	return value >>> 0;
}
function localRoomFingerprint(file) {
	return `${file.name.normalize("NFKC").toLowerCase()}::${file.size}::${file.lastModified}`;
}
var twitchEmbedLoader;
function loadTwitchEmbed() {
	return twitchEmbedLoader ??= new Promise((resolve, reject) => {
		const ready = window.Twitch;
		if (ready?.Player) {
			resolve(ready);
			return;
		}
		const script = document.createElement("script");
		script.src = "https://player.twitch.tv/js/embed/v1.js";
		script.async = true;
		script.onload = () => {
			const api = window.Twitch;
			if (api?.Player) resolve(api);
			else reject(/* @__PURE__ */ new Error("Twitch player API unavailable"));
		};
		script.onerror = () => reject(/* @__PURE__ */ new Error("Twitch player script failed to load"));
		document.head.append(script);
	});
}
function downloadCsv(rows, filename) {
	const quote = (value) => `"${String(value).replaceAll("\"", "\"\"")}"`;
	const body = rows.map((row) => row.map(quote).join(",")).join("\n");
	const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
function GenreSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "Topic explorer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Explore ideas across sources.",
		copy: "Follow useful topics across local media, YouTube and Twitch. Each connection shows its saved tag or title evidence.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicLinks, { explorer: true })
	});
}
function StatsSection() {
	const videos = useLibrary((s) => s.videos);
	const folders = useLibrary((s) => s.folders);
	const tags = useLibrary((s) => s.tags);
	const favorites = useLibrary((s) => s.favorites);
	const history = useLibrary((s) => s.history);
	const unavailable = useLibrary((s) => s.unavailable);
	const progress = useLibrary((s) => s.progress);
	const resumeProgress = useLibrary((s) => s.resumeProgress);
	const viewCounts = useLibrary((s) => s.viewCounts);
	const [showAllSources, setShowAllSources] = (0, import_react.useState)(false);
	const [remediationView, setRemediationView] = (0, import_react.useState)("");
	const [favoriteRevision, setFavoriteRevision] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const refresh = () => setFavoriteRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	const summary = (0, import_react.useMemo)(() => {
		const byFolder = /* @__PURE__ */ new Map();
		const byGenre = /* @__PURE__ */ new Map();
		const byTag = /* @__PURE__ */ new Map();
		const topicRatings = /* @__PURE__ */ new Map();
		let totalBytes = 0;
		let localTitles = 0;
		let remoteTitles = 0;
		let untaggedTitles = 0;
		let freshRemoteTitles = 0;
		let thumbReady = 0;
		let youtubeTitles = 0;
		let twitchTitles = 0;
		let liveTitles = 0;
		let knownDuration = 0;
		let durationTitles = 0;
		let resumedTitles = 0;
		let totalViews = 0;
		let metadataTaggedTitles = 0;
		let creatorTaggedTitles = 0;
		let descriptionTaggedTitles = 0;
		let multiTopicTitles = 0;
		let operationalTagAssignments = 0;
		const topicSources = /* @__PURE__ */ new Map();
		for (const video of videos) {
			totalBytes += video.size;
			if (video.remote) remoteTitles += 1;
			else localTitles += 1;
			if (video.poster) thumbReady += 1;
			if (video.remote?.kind === "youtube") youtubeTitles += 1;
			if (video.remote?.kind === "twitch") twitchTitles += 1;
			if (video.remote?.live) liveTitles += 1;
			if ((video.duration ?? 0) > 0) {
				knownDuration += video.duration ?? 0;
				durationTitles += 1;
			}
			if (resumeForVideo({
				progress,
				resumeProgress
			}, video)?.t) resumedTitles += 1;
			totalViews += viewCounts[video.id] ?? 0;
			const videoTags = tags[video.id] ?? [];
			const usefulTopics = new Set(videoTags.map(canonicalTopic).filter((tag) => Boolean(tag)));
			if (videoTags.length) metadataTaggedTitles += 1;
			if (Boolean(video.remote?.channelName?.trim())) creatorTaggedTitles += 1;
			if (video.description?.trim()) descriptionTaggedTitles += 1;
			if (!videoTags.some(isTopicTag)) untaggedTitles += 1;
			for (const topic of usefulTopics) {
				byTag.set(topic, (byTag.get(topic) ?? 0) + 1);
				const rating = topicRatings.get(topic) ?? {
					total: 0,
					newest: 0
				};
				rating.total += getRating(video.id);
				rating.newest = Math.max(rating.newest, video.addedAt);
				topicRatings.set(topic, rating);
				const sources = topicSources.get(topic) ?? /* @__PURE__ */ new Set();
				sources.add(video.remote?.kind ?? "local");
				topicSources.set(topic, sources);
			}
			if (usefulTopics.size >= 2) multiTopicTitles += 1;
			if (video.remote && Date.now() - video.addedAt < 6048e5) freshRemoteTitles += 1;
			const folder = byFolder.get(video.folderId) ?? {
				videos: 0,
				bytes: 0
			};
			folder.videos += 1;
			folder.bytes += video.size;
			byFolder.set(video.folderId, folder);
			if (video.genre?.trim()) byGenre.set(video.genre, (byGenre.get(video.genre) ?? 0) + 1);
			for (const tag of videoTags) {
				const clean = tag.trim().toLowerCase();
				if (/^(?:year-|month-|day-|type-|provider-|format-|source-|keyword-|creator-|https?$)/.test(clean)) operationalTagAssignments += 1;
			}
		}
		const tagAssignments = [...byTag.values()].reduce((sum, count) => sum + count, 0);
		const bridgeTopics = [...topicSources.values()].filter((sources) => sources.size >= 2).length;
		const topicRows = [...byTag.entries()].filter(([, count]) => count >= 2).sort((a, b) => {
			const aRating = (topicRatings.get(a[0])?.total ?? 0) / a[1];
			const bRating = (topicRatings.get(b[0])?.total ?? 0) / b[1];
			return Number(tagIsLiked(b[0])) - Number(tagIsLiked(a[0])) || bRating - aRating || (topicRatings.get(b[0])?.newest ?? 0) - (topicRatings.get(a[0])?.newest ?? 0) || b[1] - a[1] || a[0].localeCompare(b[0]);
		});
		const ratedTopicRows = topicRows.filter(([topic, count]) => (topicRatings.get(topic)?.total ?? 0) / count > 0);
		return {
			totalBytes,
			byFolder,
			localTitles,
			remoteTitles,
			untaggedTitles,
			metadataTaggedTitles,
			creatorTaggedTitles,
			descriptionTaggedTitles,
			multiTopicTitles,
			operationalTagAssignments,
			bridgeTopics,
			freshRemoteTitles,
			thumbReady,
			youtubeTitles,
			twitchTitles,
			liveTitles,
			knownDuration,
			durationTitles,
			resumedTitles,
			totalViews,
			genreRows: [...byGenre.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
			topicRows,
			topicRatings,
			topTags: (ratedTopicRows.length ? ratedTopicRows : topicRows).slice(0, 14),
			tagAssignments,
			tagDensity: tagAssignments / Math.max(videos.length, 1),
			remoteShare: remoteTitles / Math.max(videos.length, 1)
		};
	}, [
		favoriteRevision,
		progress,
		resumeProgress,
		tags,
		videos,
		viewCounts
	]);
	const folderRows = (0, import_react.useMemo)(() => folders.filter((folder) => folder.kind !== "demo").map((folder) => ({
		folder,
		...summary.byFolder.get(folder.id) ?? {
			videos: 0,
			bytes: 0
		}
	})).sort((a, b) => b.bytes - a.bytes || b.videos - a.videos || a.folder.name.localeCompare(b.folder.name)), [folders, summary.byFolder]);
	const favoriteHealth = (0, import_react.useMemo)(() => {
		const videoIds = new Set(videos.map((video) => video.id));
		const saved = Object.keys(favorites);
		return {
			saved: saved.length,
			resolved: saved.filter((id) => videoIds.has(id)).length,
			missing: saved.filter((id) => !videoIds.has(id)).length
		};
	}, [favorites, videos]);
	const sourceHealth = (0, import_react.useMemo)(() => {
		const names = /* @__PURE__ */ new Map();
		for (const { folder } of folderRows) names.set(folder.name.trim().toLowerCase(), (names.get(folder.name.trim().toLowerCase()) ?? 0) + 1);
		const duplicateNames = [...names.entries()].filter(([, count]) => count > 1).map(([name, count]) => ({
			name,
			count
		}));
		const largest = folderRows[0];
		return {
			duplicateNames,
			largest,
			concentration: largest ? Math.round(largest.bytes / Math.max(summary.totalBytes, 1) * 100) : 0
		};
	}, [folderRows, summary.totalBytes]);
	const visibleFolderRows = showAllSources ? folderRows : folderRows.slice(0, 80);
	const exportStats = () => {
		const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const feedback = exportFeedback();
		downloadCsv([
			["metric", "value"],
			["catalog_titles", videos.length],
			["topic_tags_per_title", summary.tagDensity.toFixed(3)],
			["remote_catalog_percent", Math.round(summary.remoteShare * 100)],
			["local_storage_bytes_per_local_title", Math.round(summary.totalBytes / Math.max(summary.localTitles, 1))],
			["local_storage_bytes", summary.totalBytes],
			["topic_tag_assignments", summary.tagAssignments],
			["favorites", Object.keys(favorites).length],
			["local_titles", summary.localTitles],
			["remote_titles", summary.remoteTitles],
			["untagged_titles", summary.untaggedTitles],
			["fresh_remote_titles_7d", summary.freshRemoteTitles],
			["youtube_titles", summary.youtubeTitles],
			["twitch_titles", summary.twitchTitles],
			["live_titles", summary.liveTitles],
			["poster_ready_titles", summary.thumbReady],
			["unavailable_titles", Object.keys(unavailable).length],
			["history_events", history.length],
			["topic_tag_coverage_percent", Math.round((videos.length - summary.untaggedTitles) / Math.max(videos.length, 1) * 100)],
			["largest_source_percent", sourceHealth.concentration],
			["duplicate_source_names", sourceHealth.duplicateNames.length],
			["metadata_tagged_titles", summary.metadataTaggedTitles],
			["metadata_tag_coverage_percent", Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)],
			["creator_tagged_titles", summary.creatorTaggedTitles],
			["titles_with_description", summary.descriptionTaggedTitles],
			["multi_topic_titles", summary.multiTopicTitles],
			["cross_source_bridge_topics", summary.bridgeTopics],
			["operational_tag_assignments", summary.operationalTagAssignments],
			["useful_topic_share_percent", Math.round((videos.length - summary.untaggedTitles) / Math.max(videos.length, 1) * 100)],
			["favorites_saved", favoriteHealth.saved],
			["favorites_resolved", favoriteHealth.resolved],
			["favorites_waiting_for_source", favoriteHealth.missing],
			["video_ratings_saved", Object.keys(feedback.ratings).length],
			["creator_ratings_saved", Object.keys(feedback.creatorRatings).length],
			["creator_likes_saved", Object.keys(feedback.creatorLikes).length],
			["notes_saved", Object.keys(feedback.notes).length],
			["known_duration_titles", summary.durationTitles],
			["known_duration_hours", Math.round(summary.knownDuration / 3600)],
			["resume_marks", summary.resumedTitles],
			["local_view_events", summary.totalViews],
			...summary.genreRows.map(([name, count]) => [`genre:${name}`, count]),
			...summary.topTags.map(([name, count]) => [`topic_tag:${name}`, count]),
			...sourceHealth.duplicateNames.map(({ name, count }) => [`duplicate_source:${name}`, count])
		], `reelcase-library-insights-${stamp}.csv`);
	};
	const exportSources = () => downloadCsv([[
		"source",
		"kind",
		"mapped_titles",
		"local_storage_bytes",
		"last_checked"
	], ...folderRows.map(({ folder, videos: mapped, bytes: mappedBytes }) => [
		folder.name,
		folder.kind,
		mapped,
		mappedBytes,
		folder.lastCheckedAt ? new Date(folder.lastCheckedAt).toISOString() : ""
	])], `reelcase-source-map-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	const exportRemediation = () => downloadCsv([
		[
			"queue",
			"priority",
			"title_or_source",
			"reason",
			"suggested_safe_action"
		],
		...videos.filter((video) => !(tags[video.id] ?? []).some(isTopicTag)).slice(0, 500).map((video, index) => [
			"topic-coverage",
			index + 1,
			video.name,
			"No useful topic tag",
			"Review in preview or apply explainable smart tags"
		]),
		...sourceHealth.duplicateNames.flatMap(({ name, count }) => [[
			"source-hygiene",
			1,
			name,
			`${count} identical source labels`,
			"Open source map and rename only after review"
		]]),
		...sourceHealth.largest ? [[
			"storage-concentration",
			1,
			sourceHealth.largest.folder.name,
			`${sourceHealth.concentration}% of mapped local bytes`,
			"Review source contents; no files are changed automatically"
		]] : []
	], `reelcase-remediation-plan-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Library intelligence",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }),
		title: "Know what your library needs next.",
		copy: "These local-only counts help identify coverage gaps, oversized source folders, and the tags that are driving discovery.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicLinks, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: exportStats,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download insight CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: exportSources,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download source-map CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: exportRemediation,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download remediation CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "self-center text-xs text-muted",
						children: "Exports only local catalog metadata, useful for improving sorting and discovery rules."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Catalog titles",
						value: videos.length.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local storage mapped",
						value: bytes(summary.totalBytes)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved topic assignments",
						value: summary.tagAssignments.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Favorites",
						value: Object.keys(favorites).length.toLocaleString()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local / remote",
						value: `${summary.localTitles.toLocaleString()} / ${summary.remoteTitles.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Remote catalog share",
						value: `${Math.round(summary.remoteShare * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "New provider items · 7d",
						value: summary.freshRemoteTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Needs useful topic",
						value: `${summary.untaggedTitles.toLocaleString()} titles`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved topic coverage",
						value: `${Math.round((videos.length - summary.untaggedTitles) / Math.max(videos.length, 1) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Topic tags per title",
						value: summary.tagDensity.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cross-source topic bridges",
						value: summary.bridgeTopics.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Multi-topic titles",
						value: summary.multiTopicTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Operational labels",
						value: summary.operationalTagAssignments.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Any metadata coverage",
						value: `${Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Creator / description coverage",
						value: `${summary.creatorTaggedTitles.toLocaleString()} / ${summary.descriptionTaggedTitles.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "YouTube / Twitch",
						value: `${summary.youtubeTitles.toLocaleString()} / ${summary.twitchTitles.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Known runtime",
						value: `${Math.round(summary.knownDuration / 3600).toLocaleString()} hours`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Resume marks",
						value: summary.resumedTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local view events",
						value: summary.totalViews.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Live right now",
						value: summary.liveTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Artwork coverage",
						value: `${Math.round(summary.thumbReady / Math.max(videos.length, 1) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "History events",
						value: history.length.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Unavailable cards",
						value: Object.keys(unavailable).length.toLocaleString()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-surface p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Fast paths from your library"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Use the small, useful slice first."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-3xl text-sm leading-6 text-muted",
						children: "Topic, Continue, and source views now reuse saved metadata and mount cards progressively. Favorite topics lead every topic list so the first results match what you actually want to browse."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Favorite topics"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: summary.topicRows.filter(([topic]) => tagIsLiked(topic)).length
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Pinned ahead of large catalog scans."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Ready to resume"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: summary.resumedTitles.toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Stable resume records survive catalog refreshes."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-3",
										size: "sm",
										variant: "secondary",
										onClick: () => useLibrary.getState().setSource("continue"),
										children: "Open Continue"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Metadata-first catalog"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: [Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100), "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Existing metadata is used before slower title-only inference."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-3",
										size: "sm",
										variant: "secondary",
										onClick: () => useLibrary.getState().setSource("genres"),
										children: "Open Topics"
									})
								]
							})
						]
					}),
					summary.topicRows.filter(([topic]) => tagIsLiked(topic)).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: summary.topicRows.filter(([topic]) => tagIsLiked(topic)).slice(0, 12).map(([topic, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => openTopic(topic),
							children: [
								"★ #",
								topic,
								" · ",
								count.toLocaleString()
							]
						}, topic))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-5 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-72 rounded-lg bg-elevated p-5 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "Provider mix"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "85%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: [
								{
									name: "Local",
									titles: summary.localTitles
								},
								{
									name: "YouTube",
									titles: summary.youtubeTitles
								},
								{
									name: "Twitch",
									titles: summary.twitchTitles
								}
							],
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									stroke: "currentColor",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "currentColor",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "titles",
									fill: "var(--color-accent)",
									radius: 4
								})
							]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-72 rounded-lg bg-elevated p-5 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Most useful topics"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Only topics with a saved rating appear here. Score is scaled to 5,000."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "80%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								layout: "vertical",
								margin: { left: 16 },
								data: summary.topTags.map(([name, titles]) => ({
									name,
									titles,
									score: Math.round((summary.topicRatings.get(name)?.total ?? 0) / titles * 1e3)
								})).filter((topic) => topic.score > 0).slice(0, 8),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										type: "number",
										stroke: "currentColor",
										fontSize: 12
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										type: "category",
										dataKey: "name",
										width: 150,
										stroke: "currentColor",
										fontSize: 10
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "score",
										fill: "var(--color-accent)",
										radius: 4
									})
								]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Tagging backlog"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: summary.untaggedTitles.toLocaleString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "titles still need a useful topic tag. Prioritize these before adding more discovery rules."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								variant: "secondary",
								onClick: () => setRemediationView(remediationView === "topics" ? "" : "topics"),
								children: "Review safe queue"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Storage concentration"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: [sourceHealth.concentration, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									"of mapped local bytes sit in ",
									sourceHealth.largest?.folder.name ?? "the largest source",
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								variant: "secondary",
								onClick: () => setRemediationView(remediationView === "sources" ? "" : "sources"),
								children: "Review source queue"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Source hygiene"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: sourceHealth.duplicateNames.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "duplicate source labels can make refresh results harder to interpret."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								variant: "secondary",
								onClick: () => setRemediationView(remediationView === "sources" ? "" : "sources"),
								children: "Review duplicates"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Favorite recovery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: [
									favoriteHealth.resolved,
									" / ",
									favoriteHealth.saved
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: favoriteHealth.missing ? `${favoriteHealth.missing} saved favorites are waiting for their source to return.` : "Every saved favorite resolves in the current catalog."
							})
						]
					})
				]
			}),
			remediationView === "topics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Safe tag review queue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "These are review candidates only—nothing is tagged or deleted by opening this queue."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => useLibrary.getState().setSource("settings"),
						children: "Open smart-tag tools"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-2",
					children: videos.filter((video) => !(tags[video.id] ?? []).some(isTopicTag)).slice(0, 12).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg",
						onClick: () => useLibrary.getState().openPreview(video.id),
						children: [video.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-xs text-muted",
							children: "· no useful topic yet"
						})]
					}, video.id))
				})]
			}),
			remediationView === "sources" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Safe source review queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Review signals only. Reelcase will not rename, reconnect, or remove a folder from this page."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [sourceHealth.largest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg",
							onClick: () => useLibrary.getState().setSource(sourceHealth.largest.folder.id),
							children: [
								"Largest source · ",
								sourceHealth.largest.folder.name,
								" · ",
								bytes(sourceHealth.largest.bytes)
							]
						}), sourceHealth.duplicateNames.map(({ name, count }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-sm bg-bg/45 px-3 py-2 text-sm text-fg",
							children: [
								"Duplicate label · ",
								name,
								" · ",
								count,
								" sources"
							]
						}, name))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-5 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-elevated p-5 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Genre distribution"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Bars compare genres with the most common genre in this list."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-3",
							children: summary.genreRows.slice(0, 18).map(([genre, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistributionRow, {
								label: genre,
								value: count,
								total: summary.genreRows[0]?.[1] ?? 1
							}, genre)) || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Genres will appear as media is tagged."
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-elevated p-5 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Most useful tags"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Bars compare useful topics with the leading topic, not the full catalog."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-3",
							children: summary.topTags.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "block w-full text-left",
								onClick: () => openTopic(tag),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistributionRow, {
									label: `#${tag}`,
									value: count,
									total: summary.topTags[0]?.[1] ?? 1
								})
							}, tag)) || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Tags will appear as media is indexed."
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "Source mapping & storage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Only local files contribute bytes; remote providers report catalog counts but not source storage."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: visibleFolderRows.map(({ folder, videos: mapped, bytes: folderBytes }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3 rounded-sm bg-bg/45 px-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 truncate text-sm text-fg",
								children: folder.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									mapped.toLocaleString(),
									" mapped · ",
									folderBytes ? bytes(folderBytes) : folder.kind === "youtube" || folder.kind === "twitch" ? "remote catalog" : "no local media yet"
								]
							})]
						}, folder.id))
					}),
					folderRows.length > visibleFolderRows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						size: "sm",
						className: "mt-4",
						onClick: () => setShowAllSources(true),
						children: [
							"Show all ",
							folderRows.length.toLocaleString(),
							" sources"
						]
					})
				]
			})
		]
	});
}
function LanConnectionSection() {
	const [origin, setOrigin] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [companion, setCompanion] = (0, import_react.useState)("checking");
	const [devices, setDevices] = (0, import_react.useState)([]);
	const [mapStatus, setMapStatus] = (0, import_react.useState)("Checking devices…");
	const ownDeviceId = (0, import_react.useMemo)(() => getNetworkDeviceId(), []);
	const refreshDeviceMap = async () => {
		try {
			const result = await listNetworkDevices();
			setDevices(result.devices);
			setMapStatus(result.devices.length ? `${result.devices.length} active device${result.devices.length === 1 ? "" : "s"}` : "Waiting for another device to open Reelcase");
		} catch {
			setMapStatus("Device map is temporarily unavailable");
		}
	};
	(0, import_react.useEffect)(() => {
		const current = window.location;
		const loopback = current.hostname === "localhost" || current.hostname === "127.0.0.1" || current.hostname === "::1";
		setOrigin(loopback ? "" : current.origin);
		fetch("http://127.0.0.1:43123/health").then((response) => setCompanion(response.ok ? "ready" : "offline")).catch(() => setCompanion("offline"));
		refreshDeviceMap();
		const timer = window.setInterval(() => void refreshDeviceMap(), 1e4);
		return () => window.clearInterval(timer);
	}, []);
	const copyAddress = async () => {
		if (!origin) return;
		try {
			await navigator.clipboard.writeText(origin);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	};
	const visibleDevices = devices.slice(0, 12);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Home network",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }),
		title: "Bring another screen into Reelcase.",
		copy: "Share one address, watch the device map appear, then start a room when everyone is connected.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-elevated p-5 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Share this address"
					}), origin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 break-all font-mono text-sm text-fg",
							children: origin
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => void copyAddress(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Address copied" : "Copy address"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => useLibrary.getState().setSource("watch-room"),
								children: "Open Watch Room"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs leading-5 text-muted",
							children: "On another computer, phone, or TV browser: join the same normal home Wi‑Fi, open this exact address, and leave Reelcase open. It will appear in the map below within about 25 seconds."
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fg",
						children: "Open Reelcase through the Ethernet address before sharing."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "This local-only address cannot be reached by another device. Use the Connection guide from the shared Ethernet address, then copy the address it shows."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Local companion"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl text-fg",
							children: companion === "ready" ? "Ready on this computer" : companion === "checking" ? "Checking…" : "Not detected"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "The companion speeds up local folders on this computer. Other devices can join the Reelcase page and Watch Rooms, but do not receive its local files."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Available device map"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg",
							children: mapStatus
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Devices appear only after they open Reelcase. The map stores a short-lived browser label, never network addresses or files."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => void refreshDeviceMap(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Refresh map"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-3 md:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.25fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border bg-bg/45 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-5 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: "Reelcase host"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: origin || "Local preview"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs leading-5 text-muted",
							children: "This computer shares the app address and coordinates the active-device map."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
						children: [visibleDevices.map((device) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-bg/45 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [device.kind === "mobile" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Laptop, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "min-w-0 truncate text-sm font-medium text-fg",
										children: device.id === ownDeviceId ? "This device" : device.label
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted",
									children: device.id === ownDeviceId ? device.label : "Connected to Reelcase"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-accent",
									children: "Active now"
								})
							]
						}, device.id)), !visibleDevices.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-md border border-dashed border-border p-3 text-sm text-muted sm:col-span-2 xl:col-span-3",
							children: "Waiting for a device to open the shared address."
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Four steps to connect"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-4 grid gap-4 md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "1. Use the Ethernet address."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Use the address shown above for normal home Wi‑Fi and Ethernet. The NordLynx address is for VPN peers."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "2. Keep guests off isolated Wi‑Fi."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Guest Wi‑Fi often blocks device-to-device traffic. Join the normal household network instead."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "3. Look for the device map."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"A guest that opens Reelcase shows up here automatically. Refresh the map if it has just joined."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "4. Start or join a Watch Room."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"After the guest is visible, open Watch Room and use the same invitation or room code."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs leading-5 text-subtle",
						children: "If the shared page does not open, allow Reelcase through the host computer’s private-network firewall and confirm the guest is on the same normal home network."
					})
				]
			})
		]
	});
}
function FindPhoneSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "Device recovery",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }),
		title: "Find your phone.",
		copy: "Open your device maker’s official locator. Reelcase does not collect location data or keep a copy of your account credentials.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "https://www.google.com/android/find/",
				target: "_blank",
				rel: "noopener noreferrer",
				className: "rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Android"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Find My Device"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Open Google’s official Android device locator in a secure new tab."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "https://www.icloud.com/find/",
				target: "_blank",
				rel: "noopener noreferrer",
				className: "rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "iPhone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Find My"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Open Apple’s official device locator in a secure new tab."
					})
				]
			})]
		})
	});
}
function DistributionRow({ label, value, total }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate text-fg",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: value
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 h-2 overflow-hidden rounded-full bg-bg/70",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full bg-accent",
			style: { width: `${Math.max(3, Math.round(value / Math.max(total, 1) * 100))}%` }
		})
	})] });
}
function SettingsSection() {
	const [hub, setHub] = (0, import_react.useState)({
		prints: [],
		games: []
	});
	const [preferences, setPreferences] = (0, import_react.useState)({});
	const [preferenceGroup, setPreferenceGroup] = (0, import_react.useState)("Playback");
	const [zoom, setZoom] = (0, import_react.useState)(100);
	const [railLimit, setRailLimit] = (0, import_react.useState)(8);
	const [gridPageSize, setGridPageSize] = (0, import_react.useState)(48);
	const [thumbnailWorkers, setThumbnailWorkers] = (0, import_react.useState)(0);
	const [textFirstArtwork, setTextFirstArtwork] = (0, import_react.useState)(false);
	const [photoWorkers, setPhotoWorkers] = (0, import_react.useState)(0);
	const [defaultVolume, setDefaultVolume] = (0, import_react.useState)(85);
	const [startMuted, setStartMuted] = (0, import_react.useState)(false);
	const [videoVisionBusy, setVideoVisionBusy] = (0, import_react.useState)(false);
	const [videoVisionNote, setVideoVisionNote] = (0, import_react.useState)("");
	const [twitchRefreshSeconds, setTwitchRefreshSeconds] = (0, import_react.useState)(30);
	const [liveDensity, setLiveDensity] = (0, import_react.useState)(4);
	const [sourceCacheFirst, setSourceCacheFirst] = (0, import_react.useState)(true);
	const [debugEnabled, setDebugEnabled] = (0, import_react.useState)(false);
	const [theme, setTheme] = (0, import_react.useState)("night");
	const [debugReport, setDebugReport] = (0, import_react.useState)("");
	const [, refreshDebug] = (0, import_react.useState)(0);
	const refreshFollows = useLibrary((s) => s.refreshFollows);
	const folders = useLibrary((s) => s.folders);
	const videos = useLibrary((s) => s.videos);
	const tags = useLibrary((s) => s.tags);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
	const unavailableVideoCount = useLibrary((s) => Object.keys(s.unavailable).length);
	const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
	const smartTagStatus = (0, import_react.useMemo)(() => {
		const local = videos.filter((video) => !video.remote);
		const tagged = local.filter((video) => (tags[video.id] ?? []).some((tag) => /^(?:year-|month-|type-|source-)/.test(tag))).length;
		return {
			local: local.length,
			tagged,
			waiting: Math.max(0, local.length - tagged)
		};
	}, [tags, videos]);
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
		const saved = Number(localStorage.getItem("reelcase.grid-page-size") ?? "48");
		setGridPageSize([
			24,
			48,
			96,
			144
		].includes(saved) ? saved : 48);
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
		const textFirst = localStorage.getItem("reelcase.artwork-mode") === "text";
		setTextFirstArtwork(textFirst);
		document.documentElement.dataset.artworkMode = textFirst ? "text" : "images";
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
		if (!debugEnabled) return;
		const timer = window.setInterval(() => refreshDebug((value) => value + 1), 1e3);
		return () => window.clearInterval(timer);
	}, [debugEnabled]);
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
			note: "Reelcase library metadata only. Original local files and browser permission handles are never exported.",
			library: {
				folders: state.folders,
				videos: state.videos,
				favorites: Object.keys(state.favorites),
				likes: Object.keys(state.likes),
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
		const candidates = videos.filter((video) => !video.remote && !(tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).slice(0, 12);
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
			ready.forEach((video, index) => setVideoTags(video.id, [...useLibrary.getState().tags[video.id] ?? [], ...labels[index].map((item) => `vision-${item.label}`)]));
			const report = ready.slice(0, 3).map((video, index) => `${video.name}: ${labels[index].map((item) => `${item.label} ${Math.round(item.score * 100)}%`).join(", ") || "no confident label"}`).join(" · ");
			setVideoVisionNote(`Tagged ${ready.length} local video frame${ready.length === 1 ? "" : "s"} · ${report}`);
		} catch {
			setVideoVisionNote("The local vision model could not start. File data stayed on this device; filename tags are still available.");
		} finally {
			setVideoVisionBusy(false);
		}
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
		copy: "Your Reelcase library stays in this browser. Export a portable metadata backup whenever you need it.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Video entries",
						value: useLibrary((s) => s.videos.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Followed channels",
						value: useLibrary((s) => s.follows.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved hub items",
						value: hub.prints.length + hub.games.length
					})
				]
			}),
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
						disabled: !smartTagStatus.local,
						onClick: () => {
							const changed = useLibrary.getState().autoTagLibrary();
							setServiceNote(changed ? `Smart-tag run finished · ${changed} catalog item${changed === 1 ? "" : "s"} updated.` : "Smart tags are already current for every loaded catalog item.");
						},
						children: [" ", smartTagStatus.waiting ? "Apply smart tags to remaining files" : "Recheck smart-tag coverage"]
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
						children: "Tag local videos from a cached frame."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: "Uses the same on-device image model as Photos on one cached local thumbnail per video. It runs only when you start it, uses a bounded 12-video batch, and keeps frames and labels on this device."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-accent",
						children: [
							videos.filter((video) => !video.remote && (tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).length.toLocaleString(),
							" processed · ",
							videos.filter((video) => !video.remote && !(tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).length.toLocaleString(),
							" waiting · ready when local frame artwork is cached"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						size: "sm",
						variant: "secondary",
						disabled: videoVisionBusy || !videos.some((video) => !video.remote),
						onClick: () => void tagLocalVideoFrames(),
						children: videoVisionBusy ? videoVisionNote || "Preparing local frames…" : "Prepare and tag next 12 local videos"
					}),
					videoVisionNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-accent",
						children: ["Latest output · ", videoVisionNote]
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
									const result = await refreshFollows();
									setServiceNote(`Refreshed channel cache · ${result.newVideos.length} new items.`);
								}
							},
							{
								name: "Twitch",
								detail: "Live + VOD cache",
								checked: remoteCheckedAt,
								action: async () => {
									const result = await refreshFollows();
									setServiceNote(`Refreshed Twitch status · ${result.wentLive.length} channels live.`);
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
										setServiceNote("Roku refresh needs the local Reelcase Companion running.");
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
						children: "The controls that change how Reelcase runs and fits your screen."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
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
											" In the main Reelcase folder, double-click ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-fg",
												children: "Start-Reelcase-Companion.cmd"
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
										if (!next) setDebugReport("");
									},
									children: debugEnabled ? "Disable diagnostics" : "Enable diagnostics"
								}),
								debugEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											useLibrary.getState().videos.length,
											" catalog entries · ",
											useLibrary.getState().folders.length,
											" sources · ",
											navigator.onLine ? "browser online" : "browser offline"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											useLibrary.getState().folders.filter((folder) => folder.health === "healthy").length,
											" healthy · ",
											useLibrary.getState().folders.filter((folder) => folder.health === "cached").length,
											" cache-first · ",
											useLibrary.getState().folders.filter((folder) => folder.health === "permission-needed" || folder.health === "unavailable").length,
											" need attention"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (() => {
											const budget = getRenderBudgetSnapshot();
											const feedback = getFeedbackDiagnostics();
											const thumbs = useThumbs.getState();
											const artwork = getThumbDiagnostics();
											return `${budget.mountedCards} mounted cards · ${Object.keys(thumbs.byId).length} artwork cache entries · ${artwork.active} decoding / ${artwork.queued} queued · artwork ${artwork.hits} hit / ${artwork.misses} miss${artwork.evictions ? ` / ${artwork.evictions} evicted` : ""} · ${budget.lastFrameMs}ms last frame${budget.longFrames ? ` · ${budget.longFrames} long frames (worst ${budget.worstFrameMs}ms)` : ""} · rating queue ${feedback.lastRatingQueueMs}ms / disk ${feedback.lastPersistMs}ms${feedback.pendingWrites ? " pending" : ""}`;
										})() }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (() => {
											const first = getFirstShelfTrace();
											return first.elapsedMs ? `First shelf · ${first.elapsedMs}ms · ${first.title} · ${first.cards} visible cards` : "First shelf · waiting for the first visible rail";
										})() }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (() => {
											const interaction = getInteractionBudgetSnapshot();
											return `Input to next paint · navigation ${interaction.navigation.lastMs}ms (worst ${interaction.navigation.worstMs}ms) · search ${interaction.search.lastMs}ms · rating ${interaction.rating.lastMs}ms`;
										})() }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "mt-2",
											onClick: () => void (async () => {
												try {
													const data = await (await fetch("http://127.0.0.1:43123/health")).json();
													setDebugReport(`Companion v${data.version ?? "?"} · ${data.roots ?? 0} approved roots · Desktop ${data.desktopEnabled ? "ready" : "not available"}`);
												} catch {
													setDebugReport("Companion is not running or is unavailable to this browser.");
												}
											})(),
											children: "Check companion"
										}),
										debugReport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-accent",
											children: debugReport
										})
									]
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
									children: "App zoom"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Scale the entire library interface for this browser. Your choice is remembered everywhere in Reelcase."
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
									children: "Choose the palette that is easiest on your eyes. It applies to every Reelcase page and stays on this device."
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
									children: "Grid memory budget"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets how many poster cards are mounted at once before a Next page control. Use 24 for the smoothest experience with very large YouTube and Twitch libraries."
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
									onClick: () => {
										const next = !textFirstArtwork;
										setTextFirstArtwork(next);
										localStorage.setItem("reelcase.artwork-mode", next ? "text" : "images");
										document.documentElement.dataset.artworkMode = next ? "text" : "images";
									},
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
									children: "Checks a rotating batch while this tab is visible. Every mixed pass reserves Twitch archive channels, keeps earlier VODs when a provider response is partial, and updates live state separately. Thirty seconds is the default."
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
							title: "How Reelcase works",
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
							children: "Every switch below works now, changes Reelcase immediately, and is saved in this browser. Future ideas belong in the Mission plan—not in this control panel."
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
function PrintsSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalCatalog, {
		kind: "prints",
		eyebrow: "Maker shelf",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-4" }),
		title: "3D prints",
		copy: "Keep a lightweight catalog of print-ready files. Add STL, OBJ, 3MF, or G-code files to track what is ready for the printer.",
		accept: ".stl,.obj,.3mf,.gcode",
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
				name: "Printables",
				href: "https://www.printables.com/",
				copy: "Browse community-shared printable models."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
				name: "OpenSCAD",
				href: "https://openscad.org/",
				copy: "Build and customize open parametric models."
			})]
		})
	});
}
function SpotifySection() {
	const [saved, setSaved] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return "";
		try {
			return localStorage.getItem("reelcase.spotify.playlist") ?? "";
		} catch {
			return "";
		}
	});
	const [playlistUrl, setPlaylistUrl] = (0, import_react.useState)(saved);
	const [imports, setImports] = (0, import_react.useState)(() => {
		try {
			const savedImports = JSON.parse(localStorage.getItem("reelcase.spotify.imports.v1") ?? "[]");
			return Array.isArray(savedImports) ? savedImports.filter((item) => typeof item === "string") : [];
		} catch {
			return [];
		}
	});
	const importSpotifyLink = () => {
		const value = playlistUrl.trim();
		if (!/^https:\/\/open\.spotify\.com\/(playlist|album|artist)\//i.test(value)) return;
		const next = [value, ...imports.filter((item) => item !== value)].slice(0, 50);
		setImports(next);
		setSaved(value);
		localStorage.setItem("reelcase.spotify.imports.v1", JSON.stringify(next));
		localStorage.setItem("reelcase.spotify.playlist", value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Music companion",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4" }),
		title: "Spotify, beside your library.",
		copy: "Keep music separate from video playback. Connect through Spotify’s official player or save a playlist link locally for your next listening session.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Open Spotify"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Account sign-in and playback remain on Spotify’s official site or app. Reelcase does not collect your Spotify password or tokens."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "https://open.spotify.com/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							children: ["Open Spotify ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Save a playlist shortcut"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: playlistUrl,
							onChange: (event) => setPlaylistUrl(event.target.value),
							placeholder: "https://open.spotify.com/playlist/...",
							"aria-label": "Spotify playlist link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !playlistUrl.includes("spotify.com"),
							onClick: importSpotifyLink,
							children: "Import link"
						})]
					}),
					saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "mt-3 inline-flex text-sm text-accent hover:text-fg",
						href: saved,
						target: "_blank",
						rel: "noreferrer",
						children: ["Open saved playlist ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-4" })]
					})
				]
			}),
			imports.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Imported Spotify shortcuts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Playlist, album, and artist links are stored locally for quick return. Spotify account data remains in Spotify."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: imports.slice(0, 12).map((url) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: url,
							target: "_blank",
							rel: "noreferrer",
							className: "max-w-full truncate rounded-sm bg-bg/45 px-3 py-2 text-xs text-fg shadow-border",
							children: url.replace("https://open.spotify.com/", "Spotify · ")
						}, url))
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
				children: "Paste only the OAuth Client ID—never a secret. Google’s popup authorizes this browser session, then Reelcase can read permitted YouTube metadata and available creator tags."
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
var PHOTO_FILE_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i;
var photoSourceWarmth = /* @__PURE__ */ new Map();
var PHOTO_BACKGROUND_REFRESH_MS = 18e5;
var cachedPhotoMetadata = null;
function photoMetadata() {
	if (cachedPhotoMetadata) return cachedPhotoMetadata;
	try {
		cachedPhotoMetadata = JSON.parse(localStorage.getItem("reelcase.photo-meta.v1") ?? "{}");
	} catch {
		cachedPhotoMetadata = {};
	}
	return cachedPhotoMetadata;
}
function PhotosSection() {
	const scannedPhotoSources = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const photoUrls = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const knownPhotoIds = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const discoverySeen = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const metadataWriteTimer = (0, import_react.useRef)(null);
	const [ratingFilter, setRatingFilter] = (0, import_react.useState)("all");
	const [ratingQueuePhotoId, setRatingQueuePhotoId] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.rating-queue") ?? "";
		} catch {
			return "";
		}
	});
	const [photos, setPhotos] = (0, import_react.useState)([]);
	const [selectedPerson, setSelectedPerson] = (0, import_react.useState)("All photos");
	const [selectedAlbum, setSelectedAlbum] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.source-filter") || "All albums";
		} catch {
			return "All albums";
		}
	});
	const [selectedTag, setSelectedTag] = (0, import_react.useState)("All tags");
	const [selectedPhotoIds, setSelectedPhotoIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [photoSearch, setPhotoSearch] = (0, import_react.useState)("");
	const [discoveryFilter, setDiscoveryFilter] = (0, import_react.useState)("all");
	const [favoritesOnly, setFavoritesOnly] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.favorites-only") === "true";
		} catch {
			return false;
		}
	});
	const [photoSort, setPhotoSort] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.sort") || "newest";
		} catch {
			return "newest";
		}
	});
	const [showLocations, setShowLocations] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.show-locations") === "true";
		} catch {
			return false;
		}
	});
	const [photoFolders, setPhotoFolders] = (0, import_react.useState)([]);
	const [slideshow, setSlideshow] = (0, import_react.useState)(false);
	const [fullScreenSlide, setFullScreenSlide] = (0, import_react.useState)(false);
	const [slideSeconds, setSlideSeconds] = (0, import_react.useState)(() => {
		try {
			const value = Number(localStorage.getItem("reelcase.photos.slide-seconds") ?? "5");
			return [
				3,
				5,
				10,
				20,
				30
			].includes(value) ? value : 5;
		} catch {
			return 5;
		}
	});
	const [slideIndex, setSlideIndex] = (0, import_react.useState)(0);
	const [helperNote, setHelperNote] = (0, import_react.useState)("");
	const [focusedPhotoId, setFocusedPhotoId] = (0, import_react.useState)(null);
	const [photoViewerLoading, setPhotoViewerLoading] = (0, import_react.useState)(false);
	const [photoSourceLoading, setPhotoSourceLoading] = (0, import_react.useState)(false);
	const [photoScanTotal, setPhotoScanTotal] = (0, import_react.useState)(0);
	const [photoScanDone, setPhotoScanDone] = (0, import_react.useState)(0);
	const [photoScanStartedAt, setPhotoScanStartedAt] = (0, import_react.useState)(0);
	const [photoScanEstimatedPhotos, setPhotoScanEstimatedPhotos] = (0, import_react.useState)(0);
	const [photoScanFoundPhotos, setPhotoScanFoundPhotos] = (0, import_react.useState)(0);
	const [photoScanAverageMs, setPhotoScanAverageMs] = (0, import_react.useState)(0);
	const [photoMetadataProgress, setPhotoMetadataProgress] = (0, import_react.useState)({
		total: 0,
		done: 0,
		startedAt: 0,
		running: false
	});
	const [photoLimit, setPhotoLimit] = (0, import_react.useState)(80);
	const [visionBusy, setVisionBusy] = (0, import_react.useState)(false);
	const [visionProgress, setVisionProgress] = (0, import_react.useState)("");
	const [visionReport, setVisionReport] = (0, import_react.useState)([]);
	const [visionModel, setVisionModel] = (0, import_react.useState)("semanticPro");
	const [visionReviewOpen, setVisionReviewOpen] = (0, import_react.useState)(true);
	const [visionBenchmark, setVisionBenchmark] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.photo-vision-benchmark.v1") ?? "null");
			return saved?.semantic && saved.semanticPro ? saved : null;
		} catch {
			return null;
		}
	});
	const [visionBenchmarkPhotos, setVisionBenchmarkPhotos] = (0, import_react.useState)([]);
	const [visionBenchmarkBusy, setVisionBenchmarkBusy] = (0, import_react.useState)(false);
	const [visionBenchmarkProgress, setVisionBenchmarkProgress] = (0, import_react.useState)("");
	const [visionBenchmarkError, setVisionBenchmarkError] = (0, import_react.useState)("");
	const [upscalerHealth, setUpscalerHealth] = (0, import_react.useState)({
		state: "checking",
		detail: "Checking local model cache…"
	});
	const [upscalerUrl, setUpscalerUrl] = (0, import_react.useState)(LOCAL_UPSCALER.artifactUrl);
	const [upscalerChecksum, setUpscalerChecksum] = (0, import_react.useState)(LOCAL_UPSCALER.sha256);
	const [upscalerInstalling, setUpscalerInstalling] = (0, import_react.useState)(false);
	const [upscalePreview, setUpscalePreview] = (0, import_react.useState)("");
	const [upscaleBusy, setUpscaleBusy] = (0, import_react.useState)(false);
	const [upscaleStatus, setUpscaleStatus] = (0, import_react.useState)("");
	const [companionCache, setCompanionCache] = (0, import_react.useState)(null);
	const [companionDeltaNote, setCompanionDeltaNote] = (0, import_react.useState)("");
	const appliedCompanionChanges = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const companionDeltaTimer = (0, import_react.useRef)(null);
	const [photoCacheNotice, setPhotoCacheNotice] = (0, import_react.useState)("Preparing cached photo index…");
	const libraryFolders = useLibrary((s) => s.folders);
	const sourcePhotos = useSourceAssets((s) => s.photos);
	const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
	const sourceFolders = (0, import_react.useMemo)(() => libraryFolders.filter((folder) => folder.kind === "directory" || folder.kind === "files"), [libraryFolders]);
	const sourceFolderIds = (0, import_react.useMemo)(() => sourceFolders.map((folder) => folder.id).sort().join("|"), [sourceFolders]);
	const checkUpscalerHealth = async () => {
		try {
			const raw = localStorage.getItem("reelcase.photo-upscaler.model.v1");
			const cache = "caches" in window ? await caches.open("reelcase-local-models-v1") : null;
			const manifest = cache ? await cache.match("/reelcase-local-models/upscaler.manifest.json") : null;
			const model = raw ? JSON.parse(raw) : manifest ? await manifest.json() : null;
			if (model?.name && model.verifiedAt) {
				if (!(cache && model.cacheKey ? await cache.match(model.cacheKey) : null)) throw new Error("Cached model artifact is unavailable");
				setUpscalerHealth({
					state: "ready",
					detail: `${model.name}${model.version ? ` · ${model.version}` : ""} verified ${new Date(model.verifiedAt).toLocaleDateString()} · ${bytes(model.bytes ?? 0)} cached locally. Ready for local preview runs; originals remain untouched.`
				});
			} else if ((await fetch(LOCAL_UPSCALER.shippedArtifactUrl, { method: "HEAD" })).ok) setUpscalerHealth({
				state: "ready",
				detail: "Swin2SR x2 beta is bundled and SHA-256 verified. It is ready for local preview runs; originals remain untouched."
			});
			else setUpscalerHealth({
				state: "missing",
				detail: "No verified local super-resolution model is installed. Upscaling is disabled, so no photo is ever mislabeled as enhanced."
			});
		} catch {
			setUpscalerHealth({
				state: "missing",
				detail: "The local model record could not be verified. Upscaling remains disabled and originals are safe."
			});
		}
	};
	(0, import_react.useEffect)(() => {
		checkUpscalerHealth();
	}, []);
	const installUpscalerModel = async () => {
		const url = upscalerUrl.trim();
		const expected = upscalerChecksum.trim().toLowerCase().replace(/^sha256:/, "");
		if (!/^https:\/\//i.test(url) || !/^[a-f0-9]{64}$/.test(expected)) {
			setUpscalerHealth({
				state: "missing",
				detail: "Enter an HTTPS model URL and the publisher’s exact 64-character SHA-256 checksum. Reelcase will not install an unverifiable model."
			});
			return;
		}
		setUpscalerInstalling(true);
		setUpscalerHealth({
			state: "checking",
			detail: "Downloading the model after your explicit request and verifying its SHA-256…"
		});
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(12e4) });
			if (!response.ok) throw new Error(`Download returned ${response.status}`);
			const blob = await response.blob();
			if (!blob.size || blob.size > 786432e3) throw new Error("Model size is outside the safe local cache budget");
			const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))).map((part) => part.toString(16).padStart(2, "0")).join("");
			if (digest !== expected) throw new Error("Checksum mismatch — the model was not stored");
			const cacheKey = "/reelcase-local-models/upscaler.onnx";
			const cache = await caches.open("reelcase-local-models-v1");
			await cache.put(cacheKey, new Response(blob, { headers: { "content-type": blob.type || "application/octet-stream" } }));
			const model = {
				name: new URL(url).pathname.split("/").pop() || "local-upscaler.onnx",
				version: "user-verified",
				verifiedAt: Date.now(),
				cacheKey,
				bytes: blob.size,
				sha256: digest,
				url
			};
			await cache.put("/reelcase-local-models/upscaler.manifest.json", new Response(JSON.stringify(model), { headers: { "content-type": "application/json" } }));
			try {
				localStorage.setItem("reelcase.photo-upscaler.model.v1", JSON.stringify(model));
			} catch {}
			await checkUpscalerHealth();
		} catch (error) {
			setUpscalerHealth({
				state: "missing",
				detail: `${error instanceof Error ? error.message : "Model install failed"}. No model was enabled and originals were not changed.`
			});
		} finally {
			setUpscalerInstalling(false);
		}
	};
	const removeUpscalerModel = async () => {
		try {
			const cache = await caches.open("reelcase-local-models-v1");
			await cache.delete("/reelcase-local-models/upscaler.onnx");
			await cache.delete("/reelcase-local-models/upscaler.manifest.json");
			localStorage.removeItem("reelcase.photo-upscaler.model.v1");
		} finally {
			await checkUpscalerHealth();
		}
	};
	(0, import_react.useEffect)(() => {
		let alive = true;
		const read = async () => {
			try {
				const data = await (await fetch("http://127.0.0.1:43123/cache-status")).json();
				if (!alive || !data.worker) return;
				setCompanionCache({
					state: data.worker.state ?? "ready",
					photos: Number(data.worker.photos) || 0,
					videos: Number(data.worker.videos) || 0,
					scannedAt: Number(data.worker.scannedAt) || 0,
					truncated: Boolean(data.worker.truncated)
				});
				const fresh = (data.recentChanges ?? []).filter((change) => Number(change.at) > 0 && !appliedCompanionChanges.current.has(Number(change.at)));
				if (!appliedCompanionChanges.current.size) {
					fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
					return;
				}
				fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
				if (appliedCompanionChanges.current.size > 240) appliedCompanionChanges.current = new Set([...appliedCompanionChanges.current].slice(-120));
				const changedIds = new Set(sourceFolders.filter((folder) => fresh.some((change) => {
					const path = String(change.path ?? "").replaceAll("\\", "/").toLowerCase();
					return path === folder.name.toLowerCase() || path.startsWith(`${folder.name.toLowerCase()}/`);
				})).map((folder) => folder.id));
				if (changedIds.size && !companionDeltaTimer.current) companionDeltaTimer.current = window.setTimeout(() => {
					companionDeltaTimer.current = null;
					Promise.all([...changedIds].slice(0, 3).map((id) => refreshSourcePhotos(id))).then((counts) => {
						if (alive) setCompanionDeltaNote(`Companion applied ${changedIds.size} folder change${changedIds.size === 1 ? "" : "s"} · ${counts.reduce((sum, count) => sum + count, 0).toLocaleString()} cached photos checked.`);
					});
				}, 1500);
			} catch {
				if (alive) setCompanionCache(null);
			}
		};
		read();
		const timer = window.setInterval(() => void read(), 3e4);
		return () => {
			alive = false;
			window.clearInterval(timer);
			if (companionDeltaTimer.current) window.clearTimeout(companionDeltaTimer.current);
		};
	}, [refreshSourcePhotos, sourceFolderIds]);
	const addPhotos = (files, folderName = "Unsorted", paths, urls) => {
		if (!files) return;
		const remembered = photoMetadata();
		const next = Array.from(files).filter((file) => file.type.startsWith("image/") || PHOTO_FILE_RE.test(file.name)).slice(0, 600).map((file, index) => {
			const path = paths?.[index] || file.webkitRelativePath || `${folderName}/${file.name}`;
			const id = `${path}-${file.lastModified}`;
			if (knownPhotoIds.current.has(id)) return null;
			const url = urls?.[index] ?? URL.createObjectURL(file);
			if (!urls?.[index]) photoUrls.current.add(url);
			return {
				id,
				name: file.name,
				path,
				url,
				people: remembered[id]?.people ?? [],
				tags: remembered[id]?.tags ?? [],
				album: remembered[id]?.album ?? paths?.[index]?.split("/")[0] ?? folderName,
				favorite: remembered[id]?.favorite ?? false,
				rating: remembered[id]?.rating ?? 0,
				addedAt: file.lastModified,
				width: remembered[id]?.width,
				height: remembered[id]?.height,
				vision: remembered[id]?.vision ?? [],
				visionModel: remembered[id]?.visionModel,
				file
			};
		}).filter((photo) => photo !== null);
		if (!next.length) return;
		for (const photo of next) knownPhotoIds.current.add(photo.id);
		setPhotos((current) => current.length ? [...current, ...next] : next);
	};
	(0, import_react.useEffect)(() => {
		if (sourcePhotos.length) {
			const remembered = photoMetadata();
			const metadataKey = (asset) => `${asset.path}-${asset.file.lastModified}`;
			const hot = sourcePhotos.filter((asset) => (remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite);
			const remaining = sourcePhotos.filter((asset) => !((remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite));
			const prioritized = [...hot, ...remaining].slice(0, 600);
			addPhotos(prioritized.map((asset) => asset.file), "Source import", prioritized.map((asset) => asset.path), prioritized.map((asset) => asset.url));
			setPhotoCacheNotice(`Cached index ready · ${sourcePhotos.length.toLocaleString()} source photos available`);
		}
	}, [sourcePhotos]);
	(0, import_react.useEffect)(() => () => {
		for (const url of photoUrls.current) URL.revokeObjectURL(url);
		photoUrls.current.clear();
	}, []);
	(0, import_react.useEffect)(() => {
		if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
		metadataWriteTimer.current = setTimeout(() => {
			try {
				cachedPhotoMetadata = {
					...photoMetadata(),
					...Object.fromEntries(photos.map(({ id, path, people, tags, album, favorite, rating, width, height, vision, visionModel }) => [id, {
						path,
						people,
						tags,
						album,
						favorite,
						rating,
						width,
						height,
						vision,
						visionModel
					}]))
				};
				localStorage.setItem("reelcase.photo-meta.v1", JSON.stringify(cachedPhotoMetadata));
			} catch {}
		}, 650);
		return () => {
			if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
		};
	}, [photos]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const waiting = photos.filter((photo) => photo.file && (!photo.width || !photo.height));
		if (!waiting.length) return;
		setPhotoMetadataProgress({
			total: waiting.length,
			done: 0,
			startedAt: performance.now(),
			running: true
		});
		(async () => {
			for (let start = 0; start < waiting.length && !cancelled; start += 8) {
				const chunk = waiting.slice(start, start + 8);
				const dimensions = await Promise.all(chunk.map(async (photo) => {
					try {
						const bitmap = await createImageBitmap(photo.file);
						const result = {
							id: photo.id,
							width: bitmap.width,
							height: bitmap.height
						};
						bitmap.close();
						return result;
					} catch {
						return {
							id: photo.id,
							width: 0,
							height: 0
						};
					}
				}));
				if (cancelled) return;
				const byId = new Map(dimensions.filter((item) => item.width > 0 && item.height > 0).map((item) => [item.id, item]));
				setPhotos((items) => items.map((photo) => {
					const next = byId.get(photo.id);
					return next ? {
						...photo,
						width: next.width,
						height: next.height
					} : photo;
				}));
				setPhotoMetadataProgress((current) => ({
					...current,
					done: Math.min(current.total, start + chunk.length)
				}));
				await new Promise((resolve) => window.setTimeout(resolve, 0));
			}
			if (!cancelled) setPhotoMetadataProgress((current) => ({
				...current,
				running: false
			}));
		})();
		return () => {
			cancelled = true;
		};
	}, [photos.length]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.sort", photoSort);
		} catch {}
	}, [photoSort]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.favorites-only", String(favoritesOnly));
		} catch {}
	}, [favoritesOnly]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.rating-queue", ratingQueuePhotoId);
		} catch {}
	}, [ratingQueuePhotoId]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.show-locations", String(showLocations));
		} catch {}
	}, [showLocations]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.slide-seconds", String(slideSeconds));
		} catch {}
	}, [slideSeconds]);
	(0, import_react.useEffect)(() => {
		const onFullscreen = () => setFullScreenSlide(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", onFullscreen);
		return () => document.removeEventListener("fullscreenchange", onFullscreen);
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			await new Promise((resolve) => {
				const idle = window.requestIdleCallback;
				if (idle) idle(() => resolve(), { timeout: 450 });
				else window.setTimeout(resolve, 120);
			});
			if (cancelled) return;
			const toScan = sourceFolders.filter((folder) => !scannedPhotoSources.current.has(folder.id) && Date.now() - (photoSourceWarmth.get(folder.id) ?? 0) >= PHOTO_BACKGROUND_REFRESH_MS);
			if (toScan.length) {
				setPhotoSourceLoading(true);
				setPhotoScanTotal(toScan.length);
				setPhotoScanDone(0);
				setPhotoScanStartedAt(Date.now());
				setPhotoScanEstimatedPhotos(toScan.reduce((sum, folder) => sum + (folder.photoCount ?? 0), 0));
				setPhotoScanFoundPhotos(0);
				setPhotoScanAverageMs(0);
			}
			let cursor = 0;
			const adaptiveWorkers = Math.min(12, Math.max(2, Math.floor((navigator.hardwareConcurrency || 4) / 2)));
			const configuredWorkers = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0");
			const workerCount = Math.min(toScan.length, [
				2,
				4,
				6,
				8,
				12
			].includes(configuredWorkers) ? configuredWorkers : adaptiveWorkers);
			const workers = Array.from({ length: workerCount }, async () => {
				while (!cancelled) {
					const folder = toScan[cursor++];
					if (!folder) return;
					scannedPhotoSources.current.add(folder.id);
					const started = performance.now();
					const found = await refreshSourcePhotos(folder.id);
					const elapsed = performance.now() - started;
					photoSourceWarmth.set(folder.id, Date.now());
					if (!cancelled) {
						setPhotoScanDone((done) => done + 1);
						setPhotoScanFoundPhotos((total) => total + found);
						setPhotoScanAverageMs((mean) => mean ? mean * .65 + elapsed * .35 : elapsed);
					}
				}
			});
			await Promise.all(workers);
			if (!cancelled) setPhotoSourceLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [refreshSourcePhotos, sourceFolderIds]);
	const photoScanEta = photoSourceLoading && photoScanDone >= 2 && photoScanTotal > photoScanDone && photoScanAverageMs > 0 ? Math.max(1, Math.ceil(photoScanAverageMs * (photoScanTotal - photoScanDone) / 1e3)) : 0;
	const photoMetadataEta = photoMetadataProgress.running && photoMetadataProgress.done > 0 && photoMetadataProgress.done < photoMetadataProgress.total ? Math.max(1, Math.ceil((performance.now() - photoMetadataProgress.startedAt) / photoMetadataProgress.done * (photoMetadataProgress.total - photoMetadataProgress.done) / 1e3)) : 0;
	const addPhotoFolder = (files) => {
		if (!files?.length) return;
		const first = [...files].find((file) => file.webkitRelativePath)?.webkitRelativePath.split("/")[0] ?? "Photo folder";
		setPhotoFolders((folders) => folders.includes(first) ? folders : [...folders, first]);
		addPhotos(files, first);
	};
	const people = (0, import_react.useMemo)(() => [...new Set(photos.flatMap((photo) => photo.people))], [photos]);
	const albums = (0, import_react.useMemo)(() => [...new Set(photos.map((photo) => photo.album))], [photos]);
	const photoTags = (0, import_react.useMemo)(() => [...new Set(photos.flatMap((photo) => photo.tags))].sort(), [photos]);
	const visionProcessed = (0, import_react.useMemo)(() => photos.filter((photo) => photo.tags.includes("auto-tagged")).length, [photos]);
	const visionPending = Math.max(0, photos.length - visionProcessed);
	const visionReviewedPhotos = (0, import_react.useMemo)(() => photos.filter((photo) => photo.tags.includes("auto-tagged")).sort((a, b) => b.addedAt - a.addedAt), [photos]);
	const visible = (0, import_react.useMemo)(() => photos.filter((photo) => (selectedPerson === "All photos" || photo.people.includes(selectedPerson)) && (selectedAlbum === "All albums" || photo.album === selectedAlbum) && (selectedTag === "All tags" || photo.tags.includes(selectedTag)) && (!favoritesOnly || photo.favorite) && (ratingFilter === "all" || (ratingFilter === "unrated" ? !photo.rating : photo.rating >= Number(ratingFilter))) && (discoveryFilter === "all" || (discoveryFilter === "screenshots" ? /screenshot|screen[_ -]?shot/i.test(photo.name) : discoveryFilter === "camera" ? /^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) : /download|image|copy|edited/i.test(photo.name))) && `${photo.name} ${photo.path} ${photo.people.join(" ")} ${photo.tags.join(" ")} ${photo.album}`.toLowerCase().includes(photoSearch.toLowerCase())).sort((a, b) => {
		if (photoSort === "name") return a.name.localeCompare(b.name);
		if (photoSort === "rating") return b.rating - a.rating || b.addedAt - a.addedAt;
		if (photoSort === "favorite") return Number(b.favorite) - Number(a.favorite) || b.addedAt - a.addedAt;
		if (photoSort === "auto-tags") return b.tags.length - a.tags.length || b.addedAt - a.addedAt;
		return b.addedAt - a.addedAt;
	}), [
		discoveryFilter,
		favoritesOnly,
		photoSearch,
		photoSort,
		photos,
		ratingFilter,
		selectedAlbum,
		selectedPerson,
		selectedTag
	]);
	const renderedPhotos = visible.slice(0, photoLimit);
	(0, import_react.useEffect)(() => setPhotoLimit(80), [
		photoSearch,
		selectedPerson,
		selectedAlbum,
		selectedTag,
		favoritesOnly,
		photoSort,
		discoveryFilter,
		ratingFilter
	]);
	(0, import_react.useEffect)(() => {
		if (!slideshow || !visible.length) return;
		const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % visible.length), slideSeconds * 1e3);
		return () => window.clearInterval(timer);
	}, [
		slideshow,
		slideSeconds,
		visible.length
	]);
	const featuredPhoto = visible[slideIndex % Math.max(visible.length, 1)];
	const focusedIndex = visible.findIndex((photo) => photo.id === focusedPhotoId);
	const focusedPhoto = focusedIndex >= 0 ? visible[focusedIndex] : photos.find((photo) => photo.id === focusedPhotoId);
	const moveFocus = (direction) => {
		if (!visible.length) return;
		const nextIndex = focusedIndex < 0 ? 0 : (focusedIndex + direction + visible.length) % visible.length;
		setFocusedPhotoId(visible[nextIndex].id);
	};
	const pickFreshDiscovery = () => {
		const unseen = visible.filter((photo) => !discoverySeen.current.has(photo.id));
		const pool = unseen.length ? unseen : visible;
		if (!unseen.length) discoverySeen.current.clear();
		const pick = pool[Math.floor(Math.random() * pool.length)];
		if (!pick) return;
		discoverySeen.current.add(pick.id);
		setSlideIndex(visible.findIndex((photo) => photo.id === pick.id));
		setPhotoViewerLoading(true);
		setFocusedPhotoId(pick.id);
	};
	const suggestPeopleFromNames = () => {
		let labeled = 0;
		setPhotos((items) => items.map((photo) => {
			if (photo.people.length) return photo;
			const candidate = photo.name.replace(/\.[^.]+$/, "").split(/[._\-\d]+/).map((word) => word.trim()).filter((word) => /^[A-Za-z]{3,20}$/.test(word)).find((word) => !/^(img|image|photo|picture|screenshot|copy|edited|final)$/i.test(word));
			if (!candidate) return photo;
			labeled += 1;
			return {
				...photo,
				people: [candidate[0].toUpperCase() + candidate.slice(1).toLowerCase()]
			};
		}));
		setHelperNote(labeled ? `Added ${labeled} suggested label${labeled === 1 ? "" : "s"} from file names. Review each label before relying on it.` : "No clear names were found in unlabeled file names.");
	};
	const autoTagPhotos = () => {
		let changed = 0;
		setPhotos((items) => items.map((photo) => {
			const text = `${photo.name} ${photo.path}`.toLowerCase();
			const extension = photo.name.split(".").pop()?.toLowerCase();
			const album = photo.album.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
			const suggestions = [
				/screenshot|screen[_ -]?shot/.test(text) ? "screenshot" : "",
				/^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) ? "camera" : "",
				/download|image|copy|edited/.test(text) ? "downloaded" : "",
				/vacation|travel|trip|beach|mountain/.test(text) ? "travel" : "",
				/birthday|wedding|party|event/.test(text) ? "event" : "",
				/pet|dog|cat/.test(text) ? "pets" : "",
				/receipt|invoice|document|scan/.test(text) ? "document" : "",
				/food|meal|restaurant|recipe/.test(text) ? "food" : "",
				/selfie|portrait|face/.test(text) ? "portrait" : "",
				extension ? `type-${extension}` : "",
				album && album !== "unsorted" && album !== "source-import" ? `album-${album}` : "",
				photo.favorite ? "favorite" : "",
				photo.rating >= 4 ? "highly-rated" : "",
				`year-${new Date(photo.addedAt).getFullYear()}`,
				`month-${new Date(photo.addedAt).toLocaleString("en-US", { month: "long" }).toLowerCase()}`
			].filter(Boolean);
			const tags = [.../* @__PURE__ */ new Set([...photo.tags, ...suggestions])];
			if (tags.length === photo.tags.length) return photo;
			changed += 1;
			return {
				...photo,
				tags
			};
		}));
		setHelperNote(changed ? `Added local filename-based auto tags to ${changed} photo${changed === 1 ? "" : "s"}. You can edit any tag on its card.` : "Everything already has the available local auto tags.");
	};
	const applyVisionTags = (batch, labels) => {
		const byId = new Map(batch.map((photo, index) => [photo.id, labels[index] ?? []]));
		setPhotos((items) => items.map((photo) => {
			const report = byId.get(photo.id);
			if (!report) return photo;
			const additions = [
				"auto-tagged",
				`auto-tag-${visionModel}-v2`,
				...report.map((item) => `vision-${item.label}`)
			];
			return {
				...photo,
				tags: [.../* @__PURE__ */ new Set([...photo.tags, ...additions])],
				vision: report,
				visionModel
			};
		}));
		setVisionReport((current) => [...batch.map((photo, index) => ({
			id: photo.id,
			name: photo.name,
			labels: labels[index] ?? []
		})), ...current.filter((row) => !byId.has(row.id))].slice(0, 48));
	};
	const runVisionQueue = async (candidates, allPhotos) => {
		if (!candidates.length) {
			setHelperNote("Every loaded photo already has a local vision pass. Add more photos or edit tags to review them.");
			return;
		}
		setVisionBusy(true);
		setVisionReviewOpen(true);
		setVisionReport([]);
		setVisionProgress(`Preparing ${VISION_MODELS[visionModel].name} for ${candidates.length.toLocaleString()} photos…`);
		try {
			for (let start = 0; start < candidates.length; start += 12) {
				const batch = candidates.slice(start, start + 12);
				const labels = await classifyImagesLocally(batch.map((photo) => photo.url), (done, total) => setVisionProgress(`${VISION_MODELS[visionModel].name} · ${start + done}/${candidates.length} photos`), visionModel, (status) => {
					const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
					setVisionProgress(`${VISION_MODELS[visionModel].name} · ${status.status ?? status.file ?? "loading"}${transfer} · ${start}/${candidates.length} complete`);
				});
				applyVisionTags(batch, labels);
				await new Promise((resolve) => window.setTimeout(resolve, 0));
			}
			setHelperNote(`${VISION_MODELS[visionModel].name} reviewed ${candidates.length.toLocaleString()} photo${candidates.length === 1 ? "" : "s"}${allPhotos ? " in the full queued library" : ""}. Labels and confidence scores are ready for review.`);
		} catch (error) {
			setHelperNote(`${VISION_MODELS[visionModel].name} stopped after saving every completed checkpoint: ${error instanceof Error ? error.message : "unknown error"}. Retry continues with the remaining photos.`);
		} finally {
			setVisionBusy(false);
			setVisionProgress("");
		}
	};
	const autoTagPhotosWithVision = async () => runVisionQueue(photos.filter((photo) => !photo.tags.includes("auto-tagged")).slice(0, 48), false);
	const autoTagAllPhotosWithVision = async () => runVisionQueue(photos.filter((photo) => !photo.tags.includes("auto-tagged")), true);
	const autoTagOnePhoto = async (photo) => {
		setVisionBusy(true);
		setVisionProgress(`Preparing ${VISION_MODELS[visionModel].name} for ${photo.name}…`);
		try {
			const [labels] = await classifyImagesLocally([photo.url], (done, total) => setVisionProgress(`${VISION_MODELS[visionModel].name} · ${done}/${total}`), visionModel, (status) => {
				const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
				setVisionProgress(`${VISION_MODELS[visionModel].name} · ${status.status ?? status.file ?? "loading"}${transfer}`);
			});
			applyVisionTags([photo], [labels ?? []]);
			setVisionReviewOpen(true);
			setSelectedTag("auto-tagged");
			setHelperNote(`${VISION_MODELS[visionModel].name} reviewed ${photo.name}. The photo is now in the Auto-tagged review filter with its new visible tags.`);
		} catch (error) {
			setHelperNote(`${VISION_MODELS[visionModel].name} could not tag ${photo.name}: ${error instanceof Error ? error.message : "unknown error"}.`);
		} finally {
			setVisionBusy(false);
			setVisionProgress("");
		}
	};
	const runVisionBenchmark = async () => {
		const sample = photos.filter((photo) => Boolean(photo.url)).slice(0, 24);
		if (!sample.length) {
			setHelperNote("Add photos first. The benchmark only uses photos already loaded in this browser.");
			return;
		}
		setVisionBenchmarkBusy(true);
		setVisionBenchmarkError("");
		setVisionBenchmarkProgress(`Preparing a ${sample.length}-photo local comparison…`);
		try {
			const benchmark = await benchmarkVisionModelsLocally(sample.map((photo) => photo.url), (model, done, total) => setVisionBenchmarkProgress(`${VISION_MODELS[model].name} · ${done}/${total}`), (model, status) => {
				const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
				setVisionBenchmarkProgress(`${VISION_MODELS[model].name} · ${status.status ?? status.file ?? "loading"}${transfer}`);
			});
			setVisionBenchmark(benchmark);
			setVisionBenchmarkPhotos(sample.map((photo, index) => ({
				id: photo.id,
				name: photo.name,
				url: photo.url,
				clip: benchmark.semantic.labels[index] ?? [],
				siglip: benchmark.semanticPro.labels[index] ?? []
			})));
			try {
				localStorage.setItem("reelcase.photo-vision-benchmark.v1", JSON.stringify(benchmark));
			} catch {}
			setHelperNote(`Vision comparison completed on ${sample.length} local photos. SigLIP large+ is ready for the highest-detail browser review tags.`);
		} catch (error) {
			const message = `${error instanceof Error ? error.message : "The semantic model could not start"}. No tags or defaults were changed.`;
			setVisionBenchmarkError(message);
			setHelperNote(message);
		} finally {
			setVisionBenchmarkBusy(false);
			setVisionBenchmarkProgress("");
		}
	};
	const downloadPhoto = (photo) => {
		const link = document.createElement("a");
		link.href = photo.url;
		link.download = photo.name;
		link.click();
	};
	const applyTagToSelected = (tag) => {
		const clean = tag.trim().toLowerCase();
		if (!clean || !selectedPhotoIds.size) return;
		setPhotos((items) => items.map((photo) => selectedPhotoIds.has(photo.id) ? {
			...photo,
			tags: [.../* @__PURE__ */ new Set([...photo.tags, clean])]
		} : photo));
		setHelperNote(`Added “${clean}” to ${selectedPhotoIds.size} selected photo${selectedPhotoIds.size === 1 ? "" : "s"}.`);
	};
	const startFullScreenSlideshow = async () => {
		const first = visible[slideIndex % Math.max(visible.length, 1)];
		if (!first) return;
		setFocusedPhotoId(first.id);
		setSlideshow(true);
		try {
			await document.documentElement.requestFullscreen?.();
		} catch {
			setHelperNote("Full-screen mode was blocked by this browser. The full-window viewer is still open.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Photo viewer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-4" }),
		title: "Your photos. Your favorites.",
		copy: "Add photos from this device, then group them by people yourself. Nothing uploads from this browser. Google Photos remains a separate, opt-in destination.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-2 text-sm font-medium",
						children: "Rating quest"
					}),
					[
						["all", "All ratings"],
						["unrated", "Needs a rating"],
						["3", "3+ stars"],
						["4", "4+ stars"],
						["5", "5 stars"]
					].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: ratingFilter === value ? "default" : "secondary",
						onClick: () => setRatingFilter(value),
						children: label
					}, value)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !photos.some((photo) => !photo.rating),
						onClick: () => {
							const choices = photos.filter((photo) => !photo.rating);
							const pick = choices[(choices.findIndex((photo) => photo.id === ratingQueuePhotoId) + 1 + choices.length) % choices.length];
							if (pick) {
								setRatingQueuePhotoId(pick.id);
								setFocusedPhotoId(pick.id);
							}
						},
						children: ratingQueuePhotoId ? "Continue rating queue" : "Rate a surprise photo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						children: [
							photos.filter((photo) => photo.rating > 0).length,
							" of ",
							photos.length,
							" rated"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "Your local photo selection"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Photo folders become albums here; people labels are local notes, ready to map to XMP/IPTC subject metadata later."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "sr-only",
							type: "file",
							accept: "image/*",
							multiple: true,
							onChange: (event) => addPhotos(event.target.files)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							children: "Add photos"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "sr-only",
							type: "file",
							multiple: true,
							webkitdirectory: "",
							directory: "",
							onChange: (event) => addPhotoFolder(event.target.files)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Add photo folder"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://photos.google.com/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Open Google Photos"
						}),
						photoSearch.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `https://photos.google.com/search/${encodeURIComponent(photoSearch.trim())}`,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Search Google Photos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.google.com/android/find/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Find my phone"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-3 rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedPerson === "All photos" ? "default" : "secondary",
								onClick: () => setSelectedPerson("All photos"),
								children: "All photos"
							}),
							people.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedPerson === name ? "default" : "secondary",
								onClick: () => setSelectedPerson(name),
								children: name
							}, name)),
							albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-bg/45 px-2 py-1 text-xs text-muted",
								children: album
							}, album))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 border-t border-border pt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "self-center text-xs text-muted",
								children: "Albums"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedAlbum === "All albums" ? "default" : "secondary",
								onClick: () => {
									setSelectedAlbum("All albums");
									localStorage.removeItem("reelcase.photos.source-filter");
								},
								children: "All albums"
							}),
							albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedAlbum === album ? "default" : "secondary",
								onClick: () => {
									setSelectedAlbum(album);
									localStorage.setItem("reelcase.photos.source-filter", album);
								},
								children: album
							}, album))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "self-center text-xs text-muted",
								children: "Tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedTag === "All tags" ? "default" : "secondary",
								onClick: () => setSelectedTag("All tags"),
								children: "All tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: selectedTag === "auto-tagged" ? "default" : "secondary",
								disabled: !visionProcessed,
								onClick: () => setSelectedTag("auto-tagged"),
								children: ["Auto-tagged · ", visionProcessed]
							}),
							photoTags.filter((tag) => tag !== "auto-tagged").slice(0, 16).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: selectedTag === tag ? "default" : "secondary",
								onClick: () => setSelectedTag(tag),
								children: ["#", tag]
							}, tag))
						]
					}),
					selectedPhotoIds.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 rounded-sm bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-medium text-fg",
								children: [selectedPhotoIds.size, " selected"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => applyTagToSelected("favorite-set"),
								children: "Tag set"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									photos.filter((photo) => selectedPhotoIds.has(photo.id)).forEach(downloadPhoto);
								},
								children: "Download selected"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setSelectedPhotoIds(/* @__PURE__ */ new Set()),
								children: "Clear selection"
							})
						]
					}),
					photoFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["Sources · ", photoFolders.join(" · ")]
					}),
					sourceFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["Video sources available for photo folders · ", sourceFolders.map((folder) => folder.name).slice(0, 8).join(" · ")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: photoSearch,
								onChange: (event) => setPhotoSearch(event.target.value),
								placeholder: "Search names, people, albums, or file locations",
								"aria-label": "Search photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: favoritesOnly ? "default" : "secondary",
								onClick: () => setFavoritesOnly((value) => !value),
								children: "Favorites"
							}),
							[
								"newest",
								"name",
								"rating",
								"favorite",
								"auto-tags"
							].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: photoSort === sort ? "default" : "secondary",
								onClick: () => setPhotoSort(sort),
								children: sort === "newest" ? "Newest" : sort === "name" ? "A–Z" : sort === "rating" ? "Top rated" : sort === "favorite" ? "Favorites first" : "Auto tags"
							}, sort)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: showLocations ? "default" : "secondary",
								onClick: () => setShowLocations((value) => !value),
								children: showLocations ? "Hide locations" : "Show locations"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: slideshow ? "default" : "secondary",
								onClick: () => setSlideshow((value) => !value),
								children: slideshow ? "Stop auto-change" : "Auto-change photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: fullScreenSlide ? "default" : "secondary",
								disabled: !visible.length,
								onClick: () => void startFullScreenSlideshow(),
								children: fullScreenSlide ? "Full screen active" : "Full-screen slideshow"
							}),
							slideshow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: slideSeconds,
								onChange: (event) => setSlideSeconds(Number(event.target.value)),
								"aria-label": "Photo slideshow interval",
								className: "h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
								children: [
									3,
									5,
									10,
									20,
									30
								].map((seconds) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: seconds,
									children: [
										"Every ",
										seconds,
										"s"
									]
								}, seconds))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !visible.length,
								onClick: pickFreshDiscovery,
								children: "Fresh discovery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length,
								onClick: suggestPeopleFromNames,
								children: "Suggest people labels"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length,
								onClick: autoTagPhotos,
								children: "Auto tag photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length || visionBusy,
								onClick: () => void autoTagPhotosWithVision(),
								children: visionBusy ? visionProgress || "Starting local vision…" : "Local vision tags · 48"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "self-center text-xs text-muted",
							children: "Local discovery"
						}), [
							"all",
							"screenshots",
							"camera",
							"downloads"
						].map((filter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: discoveryFilter === filter ? "default" : "secondary",
							onClick: () => setDiscoveryFilter(filter),
							children: filter === "all" ? "All" : filter === "camera" ? "Camera names" : filter[0].toUpperCase() + filter.slice(1)
						}, filter))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-md border border-border bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Local vision"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-fg",
									children: [
										visionProcessed.toLocaleString(),
										" processed · ",
										visionPending.toLocaleString(),
										" waiting · SigLIP large+ is the current quality-first default"
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: visionBusy || !visionPending,
										onClick: () => void autoTagPhotosWithVision(),
										children: visionBusy ? visionProgress || "Starting model…" : `Process next ${Math.min(48, visionPending)}`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										disabled: visionBusy || !visionPending,
										onClick: () => void autoTagAllPhotosWithVision(),
										children: visionBusy ? "Queue running…" : `Process all ${visionPending.toLocaleString()}`
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: "Tagging model"
								}), [
									"semanticPro",
									"semanticPlus",
									"semantic"
								].map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: visionModel === model ? "default" : "ghost",
									disabled: visionBusy,
									onClick: () => setVisionModel(model),
									children: VISION_MODELS[model].name
								}, model))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: [VISION_MODELS[visionModel].purpose, ". Labels stay on this device and are review-only. SigLIP large+ is selected for the most detailed browser-side photo tags; smaller SigLIP and CLIP remain available for comparison."]
							}),
							visionReport.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 divide-y divide-border rounded-sm border border-border bg-elevated",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "px-3 py-2 text-xs font-medium text-fg",
									children: "Latest local results"
								}), visionReport.slice(0, 8).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2 px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 truncate text-xs text-fg",
										children: row.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex flex-wrap gap-1",
										children: row.labels.length ? row.labels.slice(0, 3).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "rounded-xs bg-bg/60 px-2 py-1 text-xs text-accent",
											children: [
												item.label,
												" · ",
												Math.round(item.score * 100),
												"%"
											]
										}, item.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted",
											children: "No confident label"
										})
									})]
								}, row.id))]
							}),
							visionReviewedPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs font-medium text-fg",
											children: ["Tagged photo review · ", visionReviewedPhotos.length]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted",
											children: "Every completed photo is here, including low-confidence results. Filter the gallery with #auto-tagged or its model-version tag."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => setVisionReviewOpen((open) => !open),
											children: visionReviewOpen ? "Hide review" : `Review ${visionReviewedPhotos.length}`
										})]
									}),
									visionReviewOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
										children: visionReviewedPhotos.slice(0, 24).map((photo) => {
											const labels = photo.vision?.length ? photo.vision : photo.tags.filter((tag) => tag.startsWith("vision-")).map((tag) => ({
												label: tag.slice(7),
												score: 0
											}));
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "overflow-hidden rounded-xs bg-bg/55 text-left",
												onClick: () => {
													setPhotoViewerLoading(true);
													setFocusedPhotoId(photo.id);
												},
												"aria-label": `Review tags for ${photo.name}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: photo.url,
													alt: "",
													loading: "lazy",
													decoding: "async",
													className: "aspect-square w-full object-cover"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block p-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block truncate text-xs font-medium text-fg",
														children: photo.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "mt-1 flex flex-wrap gap-1",
														children: labels.length ? labels.slice(0, 3).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
															children: [label.label, label.score ? ` · ${Math.round(label.score * 100)}%` : ""]
														}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[11px] text-muted",
															children: "No confident label — review image"
														})
													})]
												})]
											}, photo.id);
										})
									}),
									visionReviewOpen && visionReviewedPhotos.length > 24 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs text-muted",
										children: [
											"Showing 24 of ",
											visionReviewedPhotos.length.toLocaleString(),
											" tagged photos. Use photo tags or search to narrow the gallery."
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-start justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium text-fg",
											children: "Vision model benchmark"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 max-w-2xl text-xs leading-5 text-muted",
											children: "Compare the pinned CLIP baseline with SigLIP large+ on the same 24 local photos. The first large-model run downloads its optional local model; later runs reuse the browser cache."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											disabled: visionBenchmarkBusy || !photos.length,
											onClick: () => void runVisionBenchmark(),
											children: visionBenchmarkBusy ? "Comparing…" : "Run local comparison"
										})]
									}),
									visionBenchmarkBusy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 flex items-center gap-2 text-xs text-accent",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 animate-spin" }), visionBenchmarkProgress || "Preparing local models…"]
									}),
									visionBenchmarkError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 rounded-xs bg-bg/50 px-3 py-2 text-xs text-muted",
										children: ["Benchmark stopped · ", visionBenchmarkError]
									}),
									visionBenchmark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-2 sm:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xs bg-bg/50 p-3 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium text-fg",
												children: VISION_MODELS.semantic.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-muted",
												children: [
													visionBenchmark.semantic.elapsedMs.toFixed(0),
													" ms · ",
													visionBenchmark.semantic.labels.flat().length,
													" labels · ",
													visionBenchmark.sampleSize,
													" photos"
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xs bg-bg/50 p-3 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium text-fg",
												children: VISION_MODELS.semanticPro.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-muted",
												children: [
													visionBenchmark.semanticPro.elapsedMs.toFixed(0),
													" ms · ",
													visionBenchmark.semanticPro.labels.flat().length,
													" labels · ",
													visionBenchmark.sampleSize,
													" photos"
												]
											})]
										})]
									}),
									visionBenchmarkPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
										className: "mt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium text-fg",
												children: "Photo-by-photo tag review"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-muted",
												children: "CLIP and SigLIP large+ results on the same image"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
											children: visionBenchmarkPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
												className: "overflow-hidden rounded-xs border border-border bg-bg/50",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: photo.url,
													alt: photo.name,
													loading: "lazy",
													decoding: "async",
													className: "aspect-video w-full object-cover"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "truncate text-xs font-medium text-fg",
														children: photo.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mt-2 grid gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-[11px] font-medium text-muted",
															children: "CLIP"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mt-1 flex flex-wrap gap-1",
															children: photo.clip.length ? photo.clip.slice(0, 4).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
																children: [
																	label.label,
																	" · ",
																	Math.round(label.score * 100),
																	"%"
																]
															}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[11px] text-subtle",
																children: "No confident label"
															})
														})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-[11px] font-medium text-muted",
															children: "SigLIP large+"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mt-1 flex flex-wrap gap-1",
															children: photo.siglip.length ? photo.siglip.slice(0, 4).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
																children: [
																	label.label,
																	" · ",
																	Math.round(label.score * 100),
																	"%"
																]
															}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[11px] text-subtle",
																children: "No confident label"
															})
														})] })]
													})]
												})]
											}, photo.id))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-[11px] leading-4 text-subtle",
										children: "The CLIP baseline is pinned to a verified revision. Results include model preparation and inference so the comparison reflects the actual browser experience."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "cursor-pointer text-xs font-medium text-fg",
									children: ["Upscaler beta · ", upscalerHealth.state === "ready" ? "verified artifact" : "not installed"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-xs leading-5 ${upscalerHealth.state === "ready" ? "text-accent" : "text-muted"}`,
											children: upscalerHealth.detail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => void checkUpscalerHealth(),
												children: "Check"
											}), upscalerHealth.state === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => void removeUpscalerModel(),
												children: "Remove"
											})]
										}),
										upscalerHealth.state !== "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)_auto]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: upscalerUrl,
													onChange: (event) => setUpscalerUrl(event.target.value),
													placeholder: "HTTPS model URL",
													"aria-label": "Upscaler model URL"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: upscalerChecksum,
													onChange: (event) => setUpscalerChecksum(event.target.value),
													placeholder: "Publisher SHA-256",
													"aria-label": "Upscaler model SHA-256 checksum"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													disabled: upscalerInstalling,
													onClick: () => void installUpscalerModel(),
													children: upscalerInstalling ? "Verifying…" : "Download + verify"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[11px] leading-4 text-subtle",
											children: "The verified beta artifact is bundled for local preview. Originals and exports remain untouched until you explicitly save a reviewed result."
										})
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Private local discovery uses file-name patterns plus an optional on-device open-source image classifier. It analyzes up to 48 queued photos at a time; photo bytes stay in this browser. A 900-photo warm URL cache and small rendered batches keep scrolling responsive while folders continue to stream."
					}),
					companionCache && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs leading-5 text-subtle",
						children: [
							"Companion cache worker · ",
							companionCache.state,
							" · ",
							companionCache.photos.toLocaleString(),
							" photo metadata hints · ",
							companionCache.videos.toLocaleString(),
							" video metadata hints",
							companionCache.truncated ? " · bounded pass reached its safe limit" : "",
							companionCache.scannedAt ? ` · checked ${new Date(companionCache.scannedAt).toLocaleTimeString([], {
								hour: "numeric",
								minute: "2-digit"
							})}` : "",
							". Media files remain on this computer."
						]
					}),
					companionDeltaNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-accent",
						children: companionDeltaNote
					}),
					(helperNote || photoSourceLoading || photoMetadataProgress.running || photoCacheNotice) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-xs text-accent",
						children: [(photoSourceLoading || photoMetadataProgress.running) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 animate-spin" }), photoSourceLoading ? `Loading cached photo sources · ${photoScanDone}/${photoScanTotal} folders · ${photoScanFoundPhotos.toLocaleString()} found${photoScanEstimatedPhotos ? ` of about ${photoScanEstimatedPhotos.toLocaleString()}` : ""}${photoScanEta ? ` · about ${photoScanEta}s remaining` : " · estimating time remaining…"}` : photoMetadataProgress.running ? `Reading photo dimensions and dates · ${photoMetadataProgress.done}/${photoMetadataProgress.total} complete${photoMetadataEta ? ` · about ${photoMetadataEta}s remaining` : " · estimating time remaining…"}` : helperNote || photoCacheNotice]
					})
				]
			}),
			!photos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "mx-auto size-7 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl text-fg",
						children: "Start with a few favorites"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Add photos here to make private people sections without connecting an account."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 overflow-hidden rounded-lg bg-elevated shadow-border",
					children: featuredPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-0 sm:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.5fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: featuredPhoto.url,
							alt: featuredPhoto.name,
							decoding: "async",
							className: "aspect-video size-full object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col justify-center p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Now showing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-display text-3xl text-fg",
									children: featuredPhoto.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm text-muted",
									children: [
										featuredPhoto.album,
										" · ",
										featuredPhoto.rating || 0,
										"/5 rating"
									]
								}),
								showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									title: featuredPhoto.path,
									className: "mt-2 truncate text-xs text-muted",
									children: featuredPhoto.path
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
						children: renderedPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden rounded-md bg-elevated shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "absolute z-10 m-2 flex size-7 items-center justify-center rounded-sm bg-bg/75 text-fg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: selectedPhotoIds.has(photo.id),
										onChange: () => setSelectedPhotoIds((current) => {
											const next = new Set(current);
											if (next.has(photo.id)) next.delete(photo.id);
											else next.add(photo.id);
											return next;
										}),
										"aria-label": `Select ${photo.name}`
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "group relative block w-full",
									onClick: () => {
										setPhotoViewerLoading(true);
										setFocusedPhotoId(photo.id);
									},
									"aria-label": `Open ${photo.name} full screen`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: photo.url,
										alt: photo.name,
										loading: "lazy",
										decoding: "async",
										className: "aspect-square w-full object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute inset-0 flex items-center justify-center bg-bg/45 opacity-0 transition-opacity group-hover:opacity-100",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-6 text-fg" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "min-w-0 flex-1 truncate text-sm text-fg",
													children: photo.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: photo.favorite ? "default" : "secondary",
													onClick: () => setPhotos((items) => items.map((item) => item.id === photo.id ? {
														...item,
														favorite: !item.favorite
													} : item)),
													children: "♥"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													"aria-label": `Download ${photo.name}`,
													onClick: () => downloadPhoto(photo),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" })
												})
											]
										}),
										showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											title: photo.path,
											className: "mt-1 truncate text-xs text-muted",
											children: photo.path
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoStars, {
											name: photo.name,
											rating: photo.rating,
											onChange: (rating) => setPhotos((items) => items.map((item) => item.id === photo.id ? {
												...item,
												rating
											} : item))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-2 h-9",
											placeholder: "People: Alex, Sam",
											value: photo.people.join(", "),
											onChange: (event) => {
												const names = event.target.value.split(",").map((value) => value.trim()).filter(Boolean);
												setPhotos((items) => items.map((item) => item.id === photo.id ? {
													...item,
													people: names
												} : item));
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-2 h-9",
											placeholder: "Tags: travel, pets, event",
											value: photo.tags.join(", "),
											onChange: (event) => {
												const tags = event.target.value.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).slice(0, 20);
												setPhotos((items) => items.map((item) => item.id === photo.id ? {
													...item,
													tags: [...new Set(tags)]
												} : item));
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-2 h-9",
											placeholder: "Album, e.g. Summer 2026",
											value: photo.album,
											onChange: (event) => setPhotos((items) => items.map((item) => item.id === photo.id ? {
												...item,
												album: event.target.value || "Unsorted"
											} : item))
										})
									]
								})
							]
						}, photo.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between gap-3 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Showing ",
							Math.min(renderedPhotos.length, visible.length),
							" of ",
							visible.length,
							" matching photos"
						] }), renderedPhotos.length < visible.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setPhotoLimit((limit) => limit + 80),
							children: "Show 80 more"
						})]
					})]
				}),
				focusedPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-label": `Viewing ${focusedPhoto.name}`,
					className: "fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 p-4",
					onClick: () => setFocusedPhotoId(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex h-full w-full max-w-7xl flex-col gap-3",
						onClick: (event) => event.stopPropagation(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate font-medium",
											children: focusedPhoto.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted",
											children: [
												Math.max(1, focusedIndex + 1),
												" of ",
												visible.length || photos.length,
												" · ",
												focusedPhoto.album
											]
										}),
										showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											title: focusedPhoto.path,
											className: "truncate text-xs text-muted",
											children: focusedPhoto.path
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setFocusedPhotoId(null),
									children: "Close"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: focusedPhoto.favorite ? "default" : "secondary",
										onClick: () => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
											...item,
											favorite: !item.favorite
										} : item)),
										children: focusedPhoto.favorite ? "♥ Favorite" : "♡ Favorite"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: visionBusy,
										onClick: () => void autoTagOnePhoto(focusedPhoto),
										children: visionBusy ? visionProgress || "Tagging…" : "Run auto tags"
									}),
									focusedPhoto.tags.length ? focusedPhoto.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-xs bg-elevated px-2 py-1 text-xs text-muted",
										children: ["#", tag]
									}, tag)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "No tags yet"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoStars, {
								name: focusedPhoto.name,
								rating: focusedPhoto.rating,
								onChange: (rating) => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
									...item,
									rating
								} : item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-h-0 flex-1",
								children: [
									photoViewerLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg/70 text-sm text-fg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-7 animate-spin text-accent" }), "Loading full-resolution photo…"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: focusedPhoto.url,
										alt: focusedPhoto.name,
										className: "max-h-full w-full object-contain",
										decoding: "async",
										onLoad: () => setPhotoViewerLoading(false),
										onError: () => setPhotoViewerLoading(false)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "absolute top-1/2 left-2 -translate-y-1/2",
										onClick: () => {
											setPhotoViewerLoading(true);
											moveFocus(-1);
										},
										"aria-label": "Previous photo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "absolute top-1/2 right-2 -translate-y-1/2",
										onClick: () => {
											setPhotoViewerLoading(true);
											moveFocus(1);
										},
										"aria-label": "Next photo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
									})
								]
							})
						]
					})
				})
			] })
		]
	});
}
function missionSteps(mission) {
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
		detail: "Verify local files, watch selected folders, and launch approved desktop shortcuts through a local companion.",
		done: true
	},
	{
		id: "watch",
		title: "Watch room reliability",
		detail: "LAN diagnostics, timeline reconciliation, queue controls, and guest-access messaging are implemented; real cross-device matrix validation remains in progress.",
		done: false
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
		id: "watch-room-cross-device",
		title: "Watch Room cross-device relay",
		detail: "Verify the signaling relay across separate devices and add a TURN-backed recovery route for networks that block direct peer negotiation.",
		done: false
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
		detail: "In progress · choose a local 3, 5, or 10-title weekly goal on Home; distinct ratings drive a streak counter and transparent rewards. Creator and longer-term reward paths remain next.",
		done: false
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
		detail: "Validate host and guest paths across browsers and home-network devices.",
		done: false
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
		done: false
	},
	{
		id: "media-inspection",
		title: "Companion media inspection",
		detail: "Use the local companion for optional ffprobe/embedded-tag extraction in bounded batches, with a preview before tags are saved.",
		done: false
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
		detail: "Creator pulls now use a bounded 2,880-item deep public catalog window, duplicate suppression, and a short server cache to avoid repeated provider work.",
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
		detail: "Backfill missing creator identity from public provider metadata and flag ambiguous matches for review.",
		done: false
	},
	{
		id: "metadata-tail-coverage",
		title: "Metadata tail coverage",
		detail: "Run bounded enrichment batches over the remaining untagged catalog and report coverage by source before applying recommendations.",
		done: false
	},
	{
		id: "recommendation-diversity",
		title: "Recommendation diversity guardrails",
		detail: "Done · Home and provider discovery use deduplicated creator round-robin selection, preserving highly rated favorites while preventing one creator from occupying a rail.",
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
		detail: "In progress · local Diagnostics now records launch-to-first-mounted-shelf time, title, and visible-card count. Cache/index and thumbnail-work splits remain next.",
		done: false
	},
	{
		id: "warp-02",
		title: "Route-level code splitting",
		detail: "Photo, Stats, Watch Room, Settings, and other hub workspaces now load only when opened, keeping media browsing out of their first-load cost.",
		done: true
	},
	{
		id: "warp-03",
		title: "Provider delta rendering",
		detail: "Apply only changed provider rows after a refresh instead of rebuilding every shelf.",
		done: false
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
		detail: "Prefetch the next likely hub only after the current view becomes idle.",
		done: false
	},
	{
		id: "warp-08",
		title: "Virtual rail windows",
		detail: "Render only card windows in long horizontal shelves while preserving keyboard navigation.",
		done: false
	},
	{
		id: "warp-09",
		title: "Visible-card priorities",
		detail: "Give ratings, playback, and visible-card actions a higher scheduling priority than background enrichment.",
		done: false
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
		detail: "Measure cache hit rate and size by source before expanding thumbnail retention.",
		done: false
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
			"Measure large-history hydration and replay before changing the default journal path."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: id !== "history-10"
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
			"Exercise local, YouTube, Twitch, and Watch Room resume paths in one repeatable check."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: id !== "continue-10"
	})),
	...[
		[
			"youtube-upgrade-01",
			"Feed delta cursor",
			"Persist the newest trustworthy upload identity per channel, request only newer feed entries during routine refresh, and fall back to a bounded recent window if the cursor is missing."
		],
		[
			"youtube-upgrade-02",
			"Channel cache budget",
			"Track response size, age, and cache-hit rate per channel; retain a short deep-catalog cache while returning only the requested shallow slice to routine refreshes."
		],
		[
			"youtube-upgrade-03",
			"First-click trace",
			"Record time from choosing YouTube to its first usable latest-upload rail, split into catalog selector, image work, and provider work without collecting viewing data."
		],
		[
			"youtube-upgrade-04",
			"Rail windowing",
			"Keep keyboard and touch navigation intact while mounting only the visible window of long YouTube rails, including an accessible count of deferred cards."
		],
		[
			"youtube-upgrade-05",
			"Artwork priority",
			"Queue visible and near-view thumbnails before offscreen cards, cancel obsolete image work on source changes, and preserve text-first cards when artwork is unavailable."
		],
		[
			"youtube-upgrade-06",
			"Creator ambiguity review",
			"Flag channels whose handle, display name, and channel ID disagree; show a review choice rather than silently merging one creator into another."
		],
		[
			"youtube-upgrade-07",
			"Published-date repair",
			"Prefer RSS published timestamps, retain the provider-provided date source, and label archive rows with unknown dates instead of sorting them as new uploads."
		],
		[
			"youtube-upgrade-08",
			"Live/VOD split",
			"Separate current live cards, completed streams, Shorts, and ordinary uploads in selectors so a live event cannot displace historical VODs or recommendations."
		],
		[
			"youtube-upgrade-09",
			"Deep-pull checkpoint",
			"Make deep historical pulls resumable per channel with a visible item/page budget and a saved checkpoint; pause safely when provider data stops advancing."
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
			"Report cached channel and artwork coverage, oldest cache age, and recoverable saved links; never call a stale cache a successful provider refresh."
		],
		[
			"youtube-upgrade-18",
			"Mobile rail gesture",
			"Validate horizontal rail scrolling, focus visibility, and card action targets on a phone viewport without accidental page scroll or gesture conflicts."
		],
		[
			"youtube-upgrade-19",
			"Refresh result diff",
			"Apply and display only changed channel/video rows after a refresh, preserving card identity, scroll position, ratings, and healthy artwork."
		],
		[
			"youtube-upgrade-20",
			"YouTube regression suite",
			"Add repeatable checks for first-click load, shallow refresh, deep pull, duplicate handling, cached recovery, and mobile rail rendering."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"youtube-upgrade-11",
			"youtube-upgrade-12",
			"youtube-upgrade-13",
			"youtube-upgrade-14",
			"youtube-upgrade-15",
			"youtube-upgrade-19"
		].includes(id)
	})),
	...[
		[
			"twitch-upgrade-01",
			"Archive page checkpoint",
			"Persist the last accepted archive cursor and VOD ID for each creator; resume a focused historical pull only when Twitch returns a forward-moving public page."
		],
		[
			"twitch-upgrade-02",
			"Focused pull queue",
			"Let users queue a small number of explicit archive pulls, run them serially within a visible budget, and never let them starve live-state refreshes."
		],
		[
			"twitch-upgrade-03",
			"VOD cursor diagnostics",
			"Show page count, accepted cursor, duplicate count, provider challenge state, and stop reason for each historical VOD pull."
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
			"Apply per-channel exponential backoff to failed public pulls while preserving a focused user retry that does not reset healthy channels."
		],
		[
			"twitch-upgrade-09",
			"VOD merge proof",
			"Test that a partial or empty refresh can never erase older VODs, favorites, ratings, history, or valid local archive metadata."
		],
		[
			"twitch-upgrade-10",
			"Creator archive controls",
			"Provide per-creator archive actions with clear depth, last result, and cooldown information instead of one opaque global refresh."
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
			"Add a source-scoped historical VOD search that can target creator, date range, title, and clip/VOD state without scanning every shelf."
		],
		[
			"twitch-upgrade-17",
			"Mobile live rail",
			"Validate live-first ordering and archive controls at phone width, with compact cards and no accidental load of every archived thumbnail."
		],
		[
			"twitch-upgrade-18",
			"Provider error taxonomy",
			"Classify Twitch failures—including public-page limit, integrity challenge, unavailable creator, and network delay—and show the safest recovery action."
		],
		[
			"twitch-upgrade-19",
			"Twitch device regression",
			"Exercise live, VOD, clip, blocked-embed, and Watch Room handoff behavior across supported browser/device paths before release."
		],
		[
			"twitch-upgrade-20",
			"Twitch archive benchmark",
			"Measure a large archive’s cursor work, merge time, storage growth, first paint, and scrolling before increasing any default depth budget."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
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
			"twitch-upgrade-15"
		].includes(id)
	})),
	...[
		[
			"speed-01",
			"First interaction budget",
			"Measure cached and cold launch-to-first-interactive-shelf time, separately reporting catalog hydration, selector work, thumbnail work, and any provider request."
		],
		[
			"speed-02",
			"Provider payload budget",
			"Set explicit row, byte, concurrency, and retry budgets for routine provider work; reserve historical pulls for visible user actions."
		],
		[
			"speed-03",
			"Render invalidation audit",
			"Trace state changes that rebuild unrelated rails or grids, then stabilize selectors and props so a rating, like, or clock tick updates only affected cards."
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
			"Run optional tag, metadata, and cache work in short cancelable idle slices; persist each completed batch so tab sleep never loses progress."
		],
		[
			"speed-07",
			"Route warmup policy",
			"Warm only the next likely route after the current page is visibly settled, cancel speculative work on navigation, and never fetch a hub just because it exists."
		],
		[
			"speed-08",
			"Cache hit dashboard",
			"Report catalog, provider, artwork, and thumbnail-cache hit/miss counts with age and size, while retaining metadata only and no media bytes."
		],
		[
			"speed-09",
			"Mobile memory budget",
			"Exercise scrolling, search, artwork deferment, and card actions in a phone viewport under a small worker/cache budget with no horizontal overflow."
		],
		[
			"speed-10",
			"Performance release gate",
			"Require repeatable startup, scroll-settle, mounted-card, input-latency, and console-error checks before a shelf or provider feature is marked complete."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: ["speed-04", "speed-05"].includes(id)
	})),
	...[
		[
			"smooth-01",
			"Navigation transition budget",
			"Keep source switches responsive by rendering the destination shell first and scheduling expensive derived rails in a transition after controls become interactive."
		],
		[
			"smooth-02",
			"Long-list virtualization proof",
			"Benchmark and verify virtual windows for grids and horizontal rails at provider-library scale, including keyboard focus, screen-reader counts, and scroll restoration."
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
			"Debounce suggestions, move full-catalog token work off the input frame, and show a truthful warming state while the search index catches up."
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
			"Audit periodic provider, Watch Room, clock, and visibility timers; share intervals where possible and stop them when their owning surface unmounts."
		],
		[
			"smooth-10",
			"Slow-device profile",
			"Add a reproducible constrained-core/memory benchmark profile and use it to choose safe default worker, cache, and rail-window budgets."
		],
		[
			"smooth-11",
			"Accessibility performance audit",
			"Verify deferred and virtualized cards retain focus order, announce loading state, and never make a keyboard action wait for offscreen artwork."
		],
		[
			"smooth-12",
			"Smoothness scorecard",
			"Publish a local diagnostics scorecard with first interaction, frame pressure, cache health, visible-card count, and the next safest remediation."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"smooth-03",
			"smooth-04",
			"smooth-05",
			"smooth-06",
			"smooth-07",
			"smooth-08"
		].includes(id)
	}))
];
var ALL_DEFAULT_MISSIONS = [...DEFAULT_MISSIONS, ...ROADMAP_EXPANSION];
function MissionPlanSection() {
	const [missions, setMissions] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.mission-plan.v1") ?? "null");
			return Array.isArray(saved) ? [...saved.map((item) => {
				const current = ALL_DEFAULT_MISSIONS.find((mission) => mission.id === item.id);
				return current ? {
					...item,
					title: current.title,
					detail: current.detail,
					done: item.done || current.done
				} : item;
			}), ...ALL_DEFAULT_MISSIONS.filter((mission) => !saved.some((item) => item.id === mission.id))] : ALL_DEFAULT_MISSIONS;
		} catch {
			return ALL_DEFAULT_MISSIONS;
		}
	});
	const [idea, setIdea] = (0, import_react.useState)("");
	const [showArchive, setShowArchive] = (0, import_react.useState)(false);
	const [companionCheck, setCompanionCheck] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.mission-plan.v1", JSON.stringify(missions));
		} catch {}
	}, [missions]);
	const completed = missions.filter((mission) => mission.done).length;
	const activeMissions = missions.filter((mission) => !mission.done);
	const archivedMissions = missions.filter((mission) => mission.done);
	const exportMissions = () => downloadCsv([[
		"step",
		"title",
		"status",
		"detail"
	], ...missions.map((mission, index) => [
		index + 1,
		mission.title,
		mission.done ? "complete" : "in-progress",
		mission.detail
	])], `reelcase-mission-plan-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Mission plan",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-4" }),
		title: "Build a private media home that scales.",
		copy: "Reelcase is moving toward a fast, local-first media hub: your files load from a durable catalog, your watch room works across your home network, and connected services remain optional and easy to control.",
		children: [
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
							className: "h-full bg-accent transition-all",
							style: { width: `${missions.length ? completed / missions.length * 100 : 0}%` }
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex items-center justify-between gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Active delivery queue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							activeMissions.length,
							" milestone",
							activeMissions.length === 1 ? "" : "s",
							" still need implementation or verification."
						]
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: activeMissions.map((mission, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex gap-4 rounded-lg bg-elevated p-4 shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							"aria-label": `Mark ${mission.title} complete`,
							onClick: () => setMissions((items) => items.map((item) => item.id === mission.id ? {
								...item,
								done: true
							} : item)),
							children: `Step ${index + 1}`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-medium text-fg",
									children: mission.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: mission.detail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
									className: "mt-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
										className: "cursor-pointer font-medium text-fg",
										children: "Break this down"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
										className: "mt-2 list-decimal space-y-1 pl-4",
										children: missionSteps(mission).map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: step }, step))
									})]
								})
							]
						})]
					}, mission.id))
				})]
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
							"aria-label": `Restore ${mission.title} to active work`,
							onClick: () => setMissions((items) => items.map((item) => item.id === mission.id ? {
								...item,
								done: false
							} : item)),
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
									"Double-click Start-Reelcase-Companion.cmd in the main Reelcase folder."
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
									"Open Games and choose Load approved desktop shortcuts."
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						variant: "secondary",
						onClick: () => void (async () => {
							try {
								const data = await (await fetch("http://127.0.0.1:43123/health")).json();
								setCompanionCheck({
									ready: true,
									desktop: Boolean(data.desktopEnabled),
									detail: `${data.roots ?? 0} approved root(s)`
								});
							} catch {
								setCompanionCheck({
									ready: false,
									desktop: false,
									detail: "Companion not detected. Start it, leave the window open, then retry."
								});
							}
						})(),
						children: "Check Companion setup"
					}),
					companionCheck && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-3 text-sm ${companionCheck.ready && companionCheck.desktop ? "text-accent" : "text-danger"}`,
						children: companionCheck.ready ? `Ready · Desktop ${companionCheck.desktop ? "approved" : "not approved"} · ${companionCheck.detail}` : companionCheck.detail
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
						onClick: () => setMissions(DEFAULT_MISSIONS),
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
						id: crypto.randomUUID(),
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
function GamesSection() {
	const [games, setGames] = (0, import_react.useState)([]);
	const [filter, setFilter] = (0, import_react.useState)("");
	const [removeGame, setRemoveGame] = (0, import_react.useState)(null);
	const [launchNotice, setLaunchNotice] = (0, import_react.useState)("");
	const [shortcutView, setShortcutView] = (0, import_react.useState)("all");
	const [fileType, setFileType] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("name");
	const [companionLoading, setCompanionLoading] = (0, import_react.useState)(false);
	const sourceShortcuts = useSourceAssets((s) => s.shortcuts);
	(0, import_react.useEffect)(() => {
		const saved = readHub().games;
		setGames(saved);
	}, []);
	const saveGames = (next) => {
		setGames(next);
		writeHub({
			...readHub(),
			games: next
		});
	};
	const add = async (files, allowWebShortcut = false) => {
		if (!files) return;
		const source = Array.from(files).filter((file) => allowWebShortcut ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name) : /\.(exe|lnk|url|appref-ms)$/i.test(file.name));
		const next = await Promise.all(source.map(async (file) => {
			let launchUrl;
			if (/\.url$/i.test(file.name)) launchUrl = (await file.text()).match(/^URL\s*=\s*((?:https?|steam|epic|com\.epicgames\.launcher|xbox):\S+)/im)?.[1];
			return {
				name: file.name,
				path: file.webkitRelativePath || file.name,
				size: file.size,
				addedAt: Date.now(),
				launchUrl
			};
		}));
		setGames((current) => {
			const merged = [...current, ...next.filter((item) => !current.some((game) => game.path === item.path))];
			writeHub({
				...readHub(),
				games: merged
			});
			return merged;
		});
	};
	(0, import_react.useEffect)(() => {
		if (sourceShortcuts.length) add(sourceShortcuts, true);
	}, [sourceShortcuts]);
	const launchDesktop = async (game) => {
		try {
			const result = await (await fetch("http://127.0.0.1:43123/launch", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ path: game.path })
			})).json();
			setLaunchNotice(result.ok ? `Launching ${game.name} through the local companion.` : result.error ?? "The companion could not launch this item.");
		} catch {
			setLaunchNotice("Desktop launch needs the Reelcase Companion running and this shortcut inside one of its approved Windows folders.");
		}
	};
	const loadApprovedShortcuts = async () => {
		setCompanionLoading(true);
		try {
			const result = await (await fetch("http://127.0.0.1:43123/shortcuts?limit=300")).json();
			if (!result.ok) throw new Error(result.error ?? "The companion could not read approved shortcuts.");
			const next = (result.shortcuts ?? []).map((item) => ({
				...item,
				size: 0,
				addedAt: Date.now()
			}));
			setGames((current) => {
				const incoming = new Map(next.map((item) => [item.path, item]));
				const merged = [...current.map((game) => {
					const refreshed = incoming.get(game.path);
					return refreshed ? {
						...game,
						...refreshed,
						iconData: game.iconData
					} : game;
				}), ...next.filter((item) => !current.some((game) => game.path === item.path))];
				writeHub({
					...readHub(),
					games: merged
				});
				return merged;
			});
			setLaunchNotice(next.length ? `Added ${next.length} approved desktop shortcuts. They can launch through the companion.` : "No approved desktop shortcuts were found. Add a shortcut to Desktop or another approved companion folder.");
		} catch {
			setLaunchNotice("Companion connection unavailable. Start the local Reelcase Companion, then try again.");
		} finally {
			setCompanionLoading(false);
		}
	};
	const gameTypes = [...new Set(games.map((game) => (game.name.match(/\.([^.]+)$/)?.[1] ?? "other").toLowerCase()))].sort();
	const visible = games.filter((game) => game.name.toLowerCase().includes(filter.toLowerCase()) && (shortcutView === "all" || (shortcutView === "ready" ? gameKind(game) === "web-ready" : shortcutView === "unknown" ? gameKind(game) === "web-needs-target" : !isWebGame(game))) && (fileType === "all" || game.name.toLowerCase().endsWith(`.${fileType}`))).filter((game) => shortcutView === "all" || !isGameHelper(game)).sort((a, b) => sort === "newest" ? b.addedAt - a.addedAt : sort === "type" ? a.name.split(".").pop().localeCompare(b.name.split(".").pop()) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Desktop game shelf",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "size-4" }),
		title: "A clearer game drawer.",
		copy: "Choose a dedicated games folder, add custom cover icons, and explicitly import web game shortcuts. Every card has a launch control: web shortcuts open directly; desktop launchers are clearly marked because browsers cannot start an .exe by themselves.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3 sm:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "sr-only",
						type: "file",
						multiple: true,
						accept: ".url",
						onChange: (event) => void add(event.target.files, true)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
						children: "Add web game shortcut"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: companionLoading,
						onClick: () => void loadApprovedShortcuts(),
						children: companionLoading ? "Reading approved shortcuts…" : "Load approved desktop shortcuts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "sr-only",
						type: "file",
						multiple: true,
						webkitdirectory: "",
						directory: "",
						onChange: (event) => void add(event.target.files)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-4 text-sm text-fg shadow-border",
						children: "Choose game folder"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: filter,
						onChange: (event) => setFilter(event.target.value),
						placeholder: "Filter your games",
						"aria-label": "Filter games"
					}),
					[
						"all",
						"ready",
						"desktop",
						"unknown"
					].map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: shortcutView === view ? "default" : "secondary",
						onClick: () => setShortcutView(view),
						children: view === "all" ? "All (helpers hidden)" : view === "ready" ? "Web ready" : view === "desktop" ? "Desktop" : "Unknown URL"
					}, view))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "File type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: fileType === "all" ? "default" : "secondary",
						onClick: () => setFileType("all"),
						children: "All types"
					}),
					gameTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: fileType === type ? "default" : "secondary",
						onClick: () => setFileType(type),
						children: [".", type]
					}, type)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs text-muted",
						children: "Sort"
					}),
					[
						"name",
						"newest",
						"type"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: sort === value ? "default" : "secondary",
						onClick: () => setSort(value),
						children: value === "name" ? "A–Z" : value === "newest" ? "Recently added" : "File type"
					}, value))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between gap-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					visible.length,
					" shown · ",
					games.filter((game) => gameKind(game) === "web-needs-target").length,
					" web shortcuts need a readable target"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => downloadCsv([[
						"name",
						"path",
						"kind",
						"extension",
						"launch_ready",
						"helper",
						"added_at"
					], ...games.map((game) => [
						game.name,
						game.path,
						gameKind(game),
						game.name.split(".").pop() ?? "",
						Boolean(game.launchUrl),
						isGameHelper(game),
						new Date(game.addedAt).toISOString()
					])], `reelcase-games-debug-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), " Export game debug CSV"]
				})]
			}),
			visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: visible.map((game) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 rounded-lg bg-elevated p-4 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent/10 text-center text-[10px] font-bold tracking-[0.08em] text-accent",
						children: game.iconData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: game.iconData,
							alt: "",
							className: "size-full object-cover"
						}) : gameBadge(game)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-base font-medium text-fg",
								children: game.name.replace(/\.(exe|lnk|url|appref-ms)$/i, "")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 truncate text-xs text-muted",
								children: gameKind(game) === "web-ready" ? "Web launcher ready" : gameKind(game) === "web-needs-target" ? "Shortcut target is unknown here — open it through the Companion or refresh its target" : game.path
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => {
											if (game.launchUrl) {
												const link = document.createElement("a");
												link.href = game.launchUrl;
												link.target = game.launchUrl.startsWith("http") ? "_self" : "_blank";
												document.body.appendChild(link);
												link.click();
												link.remove();
												return;
											}
											if (gameKind(game) === "web-needs-target") {
												launchDesktop(game);
												return;
											}
											launchDesktop(game);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-3" }), gameKind(game) === "web-needs-target" ? "Open .url shortcut" : isWebGame(game) ? "Open web game" : "Launch desktop game"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "inline-flex cursor-pointer items-center text-xs text-muted hover:text-fg",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "mr-1 size-3" }),
											" Set icon",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "sr-only",
												type: "file",
												accept: "image/*",
												onChange: (event) => {
													const file = event.target.files?.[0];
													if (!file) return;
													const reader = new FileReader();
													reader.onload = () => saveGames(games.map((item) => item.path === game.path ? {
														...item,
														iconData: String(reader.result)
													} : item));
													reader.readAsDataURL(file);
												}
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										target: "_blank",
										rel: "noreferrer",
										href: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name.replace(/\..*$/, ""))}`,
										className: "inline-flex text-xs text-muted hover:text-fg",
										children: ["Store page ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-3" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-xs text-muted hover:text-danger",
										onClick: () => removeGame === game.path ? (saveGames(games.filter((item) => item.path !== game.path)), setRemoveGame(null)) : setRemoveGame(game.path),
										children: removeGame === game.path ? "Confirm remove" : "Remove"
									})
								]
							})
						]
					})]
				}, game.path))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "mx-auto size-7 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl text-fg",
						children: "Build your launch list"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Add `.url` shortcuts to launch their approved web destination, or catalog desktop launchers and choose a custom cover icon."
					})
				]
			}),
			launchNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 rounded-md bg-elevated px-3 py-2 text-xs leading-5 text-muted shadow-border",
				children: launchNotice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
					name: "Nexus Mods",
					href: "https://www.nexusmods.com/",
					copy: "Browse mod pages and collections."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
					name: "Vortex",
					href: "https://www.nexusmods.com/about/vortex/",
					copy: "Open the official mod manager page."
				})]
			})
		]
	});
}
var PRIVATE_SHORTCUTS_KEY = "reelcase.private-web-shortcuts.v1";
function PrivateWebShortcuts() {
	const [links, setLinks] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(PRIVATE_SHORTCUTS_KEY) ?? "[]");
			return Array.isArray(saved) ? saved.filter((item) => typeof item?.name === "string" && typeof item?.url === "string") : [];
		} catch {
			return [];
		}
	});
	const [name, setName] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const save = (next) => {
		setLinks(next);
		localStorage.setItem(PRIVATE_SHORTCUTS_KEY, JSON.stringify(next));
	};
	const add = () => {
		try {
			const parsed = new URL(url);
			if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported");
			save([...links, {
				id: crypto.randomUUID(),
				name: name.trim() || parsed.hostname,
				url: parsed.toString()
			}]);
			setName("");
			setUrl("");
		} catch {
			setUrl("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-6 rounded-xl bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
				children: "Private web shortcuts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-2xl text-fg",
				children: "Your saved destinations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: "Add only links you trust. These are saved only in this browser and open when you press Launch."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Name",
						"aria-label": "Shortcut name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: url,
						onChange: (event) => setUrl(event.target.value),
						placeholder: "https://…",
						"aria-label": "Shortcut URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !url.trim(),
						onClick: add,
						children: "Save shortcut"
					})
				]
			}),
			links.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-2",
				children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-md bg-bg/45 p-3 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium text-fg",
								children: link.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: link.url
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => window.location.assign(link.url),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-3" }), "Launch"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => save(links.filter((item) => item.id !== link.id)),
							children: "Remove"
						})
					]
				}, link.id))
			})
		]
	});
}
function LocalCatalog({ kind, eyebrow, icon, title, copy, accept, directory, footer }) {
	const [hub, setHub] = (0, import_react.useState)({
		prints: [],
		games: []
	});
	(0, import_react.useEffect)(() => setHub(readHub()), []);
	const items = hub[kind];
	const change = (files) => {
		if (!files?.length) return;
		const next = {
			...hub,
			[kind]: filesToItems(files, kind === "games")
		};
		setHub(next);
		writeHub(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow,
		icon,
		title,
		copy,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated/40 px-5 text-center transition-[background-color,border-color] duration-150 hover:border-fg/30 hover:bg-elevated",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-7 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-3 text-sm font-medium text-fg",
						children: directory ? "Choose Desktop games folder" : "Add print files"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-xs text-muted",
						children: directory ? "Keeps only game launchers and shortcuts; folders and support files stay out." : "STL, OBJ, 3MF, and G-code are supported."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						multiple: true,
						accept,
						className: "sr-only",
						...directory ? {
							webkitdirectory: "",
							directory: ""
						} : {},
						onChange: (event) => change(event.target.files)
					})
				]
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 overflow-hidden rounded-lg shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						children: [
							items.length,
							" saved ",
							kind === "prints" ? "print files" : "games"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: "Stored as names only"
					})]
				}), items.slice(0, 80).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-fg",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: item.path
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "shrink-0 font-mono text-xs text-subtle",
						children: bytes(item.size)
					})]
				}, `${item.path}:${item.addedAt}`))]
			}),
			footer
		]
	});
}
function ShopSection() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [packages, setPackages] = (0, import_react.useState)([]);
	const [packageTitle, setPackageTitle] = (0, import_react.useState)("");
	const [carrier, setCarrier] = (0, import_react.useState)("USPS");
	const [tracking, setTracking] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		try {
			setPackages(JSON.parse(localStorage.getItem("reelcase.package-tracking.v1") ?? "[]"));
		} catch {
			setPackages([]);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.package-tracking.v1", JSON.stringify(packages));
		} catch {}
	}, [packages]);
	const encoded = encodeURIComponent(query.trim());
	const stores = (0, import_react.useMemo)(() => [
		{
			name: "Amazon",
			href: `https://www.amazon.com/s?k=${encoded}`,
			detail: "Search Amazon"
		},
		{
			name: "Walmart",
			href: `https://www.walmart.com/search?q=${encoded}`,
			detail: "Search Walmart"
		},
		{
			name: "eBay",
			href: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
			detail: "Search eBay"
		},
		{
			name: "Etsy",
			href: `https://www.etsy.com/search?q=${encoded}`,
			detail: "Search handmade & niche shops"
		},
		{
			name: "Diipoo",
			href: `https://diipoo.com/?s=${encoded}`,
			detail: "Search Diipoo deals"
		}
	], [encoded]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Shopping shortcuts",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" }),
		title: "Find gear for your setup",
		copy: "Search major retailers from one clean starting point. Listings, prices, checkout, and account activity stay on the retailer’s site.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Search film gear, printer parts, controllers…",
						className: "pl-9"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: stores.map((store) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: store.href,
					target: "_blank",
					rel: "noreferrer",
					className: "group rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl text-fg",
							children: store.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: query.trim() ? `${store.detail} for “${query.trim()}”` : store.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent",
							children: ["Open search ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
						})
					]
				}, store.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 font-display text-2xl text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5 text-accent" }), "Package tracking"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "A private local list for orders you are expecting. Tracking opens the carrier lookup in a new page; no retailer account is connected."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-2 sm:grid-cols-[1.2fr_.8fr_1fr_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: packageTitle,
								onChange: (event) => setPackageTitle(event.target.value),
								placeholder: "Package or order name",
								"aria-label": "Package name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: carrier,
								onChange: (event) => setCarrier(event.target.value),
								placeholder: "Carrier",
								"aria-label": "Carrier"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: tracking,
								onChange: (event) => setTracking(event.target.value),
								placeholder: "Tracking number (optional)",
								"aria-label": "Tracking number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									if (!packageTitle.trim()) return;
									setPackages((items) => [{
										id: crypto.randomUUID(),
										title: packageTitle.trim(),
										carrier: carrier.trim() || "Carrier",
										tracking: tracking.trim(),
										status: "Ordered"
									}, ...items]);
									setPackageTitle("");
									setTracking("");
								},
								children: "Add package"
							})
						]
					}),
					packages.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: packages.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 rounded-md bg-bg/45 px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-36 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: item.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [item.carrier, item.tracking ? ` · ${item.tracking}` : ""]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: item.status,
									onChange: (event) => setPackages((items) => items.map((entry) => entry.id === item.id ? {
										...entry,
										status: event.target.value
									} : entry)),
									className: "h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Ordered" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Shipped" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Out for delivery" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Delivered" })
									]
								}),
								item.tracking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: `https://www.17track.net/en/track?nums=${encodeURIComponent(item.tracking)}`,
									target: "_blank",
									rel: "noreferrer",
									className: "rounded-sm bg-accent px-3 py-2 text-xs font-medium text-accent-fg",
									children: "Track"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setPackages((items) => items.filter((entry) => entry.id !== item.id)),
									children: "Remove"
								})
							]
						}, item.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "No packages yet. Add an order to keep its delivery status beside your shopping shortcuts."
					})
				]
			})
		]
	});
}
function StreamingSection() {
	const [ratingQuery, setRatingQuery] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Movie streaming",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Streaming destinations",
		copy: "Keep watch sources separate from shopping. These official services and public collections open in their own sites.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "External rating search"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Look up a title on the source you trust. Searches open on the official site; Reelcase does not copy ratings into your local catalog."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ratingQuery,
						onChange: (event) => setRatingQuery(event.target.value),
						placeholder: "Search an anime, movie, or series",
						"aria-label": "External rating search"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							{
								label: "AniList",
								url: "https://anilist.co/search/anime?search="
							},
							{
								label: "AniDB",
								url: "https://anidb.net/anime/?adb.search="
							},
							{
								label: "Rotten Tomatoes",
								url: "https://www.rottentomatoes.com/search?search="
							}
						].map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `${source.url}${encodeURIComponent(ratingQuery.trim())}`,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-3 text-sm text-fg shadow-border",
							children: [source.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-3.5" })]
						}, source.label))
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				{
					name: "Netflix",
					href: "https://www.netflix.com/",
					copy: "Movies & series"
				},
				{
					name: "Hulu",
					href: "https://www.hulu.com/",
					copy: "TV & films"
				},
				{
					name: "Crunchyroll",
					href: "https://www.crunchyroll.com/",
					copy: "Anime streaming"
				},
				{
					name: "Kick",
					href: "https://kick.com/",
					copy: "Live streaming"
				},
				{
					name: "Vimeo",
					href: "https://vimeo.com/",
					copy: "Creator video"
				},
				{
					name: "Nebula",
					href: "https://nebula.tv/",
					copy: "Independent creators"
				},
				{
					name: "Plex",
					href: "https://www.plex.tv/",
					copy: "Personal media & streaming"
				},
				{
					name: "Internet Archive",
					href: "https://archive.org/details/feature_films",
					copy: "Open & public-domain films"
				},
				{
					name: "Old Time Movies",
					href: "https://archive.org/details/moviesandfilms",
					copy: "Classic and public-domain cinema"
				},
				{
					name: "Library of Congress",
					href: "https://www.loc.gov/film-and-videos/",
					copy: "Historic films and moving images"
				},
				{
					name: "Open Culture",
					href: "https://www.openculture.com/freemoviesonline",
					copy: "Free film collections and courses"
				},
				{
					name: "AniList",
					href: "https://anilist.co/",
					copy: "Anime discovery & ratings"
				},
				{
					name: "AniDB",
					href: "https://anidb.net/",
					copy: "Anime database"
				},
				{
					name: "Rotten Tomatoes",
					href: "https://www.rottentomatoes.com/",
					copy: "Critic & audience ratings"
				}
			].map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, { ...service }, service.name))
		})]
	});
}
function SocialSection() {
	const [accounts, setAccounts] = (0, import_react.useState)([]);
	const [handle, setHandle] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [lastRead, setLastRead] = (0, import_react.useState)({});
	const [topic, setTopic] = (0, import_react.useState)(null);
	const defaultTopics = (0, import_react.useMemo)(() => [
		{
			label: "Movies & TV",
			query: "movies OR tv"
		},
		{
			label: "Anime",
			query: "anime"
		},
		{
			label: "Gaming",
			query: "gaming"
		},
		{
			label: "Live creators",
			query: "twitch streamer"
		}
	], []);
	(0, import_react.useEffect)(() => {
		try {
			const raw = JSON.parse(localStorage.getItem("reelcase.x-accounts") ?? "[]");
			const saved = Array.isArray(raw) ? raw.filter((value) => typeof value === "string" && /^[A-Za-z0-9_]{1,15}$/.test(value)) : [];
			setAccounts(saved);
			const last = localStorage.getItem("reelcase.x-active") ?? "";
			setActive(saved.includes(last) ? last : saved[0] ?? "");
			if (!saved.length) setTopic(defaultTopics[0]);
			const reads = JSON.parse(localStorage.getItem("reelcase.x-last-read") ?? "{}");
			if (reads && typeof reads === "object") setLastRead(reads);
		} catch {}
	}, []);
	const choose = (account) => {
		const at = Date.now();
		setTopic(null);
		setActive(account);
		setLastRead((current) => {
			const next = {
				...current,
				[account]: at
			};
			try {
				localStorage.setItem("reelcase.x-last-read", JSON.stringify(next));
			} catch {}
			return next;
		});
		try {
			localStorage.setItem("reelcase.x-active", account);
		} catch {}
	};
	const save = (next) => {
		setAccounts(next);
		try {
			localStorage.setItem("reelcase.x-accounts", JSON.stringify(next));
		} catch {
			setError("Storage is full. Account changes will last for this session only.");
		}
	};
	const add = () => {
		const value = handle.trim().replace(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "").toLowerCase();
		if (!/^[a-z0-9_]{1,15}$/.test(value)) {
			setError("Enter a valid X handle or profile URL (up to 15 letters, numbers or underscores).");
			return;
		}
		if (accounts.length >= 50 && !accounts.includes(value)) {
			setError("Your shelf holds 50 accounts. Remove one before adding another.");
			return;
		}
		setError("");
		save([.../* @__PURE__ */ new Set([...accounts, value])]);
		choose(value);
		setHandle("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Social desk",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }),
		title: "Keep your people close.",
		copy: "Save X profiles, switch between public timelines, and pick up where you left off. Public timelines render inside Reelcase through X’s official widget; private posts and account likes stay on X.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				onSubmit: (event) => {
					event.preventDefault();
					add();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: handle,
					onChange: (event) => setHandle(event.target.value),
					placeholder: "@handle or X profile URL",
					"aria-label": "X account handle"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: !handle.trim(),
					children: "Add account"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-4",
				value: search,
				onChange: (event) => setSearch(event.target.value),
				placeholder: "Find a saved account",
				"aria-label": "Search saved X accounts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Public topic views"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Explore these X searches separately from your saved people. X supplies the public timeline; open the topic if it is unavailable."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: defaultTopics.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: topic?.label === item.label ? "default" : "secondary",
							onClick: () => {
								setTopic(item);
								setActive("");
							},
							children: item.label
						}, item.label))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
				children: accounts.filter((account) => account.toLowerCase().includes(search.toLowerCase())).map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-lg border p-2 " + (active === account ? "border-accent bg-elevated" : "border-border bg-surface"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": active === account,
						onClick: () => choose(account),
						className: "min-w-0 flex-1 p-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-lg font-semibold",
							children: ["@", account]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: lastRead[account] ? `Read ${new Date(lastRead[account]).toLocaleDateString()}` : "Public profile"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Remove @" + account,
						onClick: () => {
							const next = accounts.filter((value) => value !== account);
							save(next);
							if (active === account) choose(next[0] ?? "");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}, account))
			}),
			!accounts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 rounded-lg border border-border p-5 text-sm text-muted",
				children: "Showing the default public topic view below. Add a profile to create a personal reading shelf; if X blocks embedded posts, the Open topic/profile button is the reliable fallback."
			}),
			(active || topic) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XTimeline, {
				account: active || void 0,
				topic: topic ?? void 0
			}, topic ? `topic:${topic.label}` : active)
		]
	});
}
function WatchRoomSection() {
	const [roomCode, setRoomCode] = (0, import_react.useState)(() => `RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
	const [roomInput, setRoomInput] = (0, import_react.useState)("");
	const [recentLocalRoom, setRecentLocalRoom] = (0, import_react.useState)(() => localStorage.getItem("reelcase.watch-room.last-host") ?? "");
	const [name, setName] = (0, import_react.useState)(() => localStorage.getItem("reelcase.profile-name") || "Host");
	const [activeRoom, setActiveRoom] = (0, import_react.useState)(null);
	const [joinedAsGuest, setJoinedAsGuest] = (0, import_react.useState)(false);
	const [guestAccess, setGuestAccess] = (0, import_react.useState)(false);
	const [localVideo, setLocalVideo] = (0, import_react.useState)(null);
	const [localShare, setLocalShare] = (0, import_react.useState)(null);
	const [pendingLocalShare, setPendingLocalShare] = (0, import_react.useState)(null);
	const [localQueue, setLocalQueue] = (0, import_react.useState)([]);
	const [localShareMatches, setLocalShareMatches] = (0, import_react.useState)({});
	const [rokuAddress, setRokuAddress] = (0, import_react.useState)("");
	const [rokuReady, setRokuReady] = (0, import_react.useState)(false);
	const [rokuDevices, setRokuDevices] = (0, import_react.useState)([]);
	const [rokuNotice, setRokuNotice] = (0, import_react.useState)("");
	const [queue, setQueue] = (0, import_react.useState)([]);
	const [stageSize, setStageSize] = (0, import_react.useState)("compact");
	const [playback, setPlayback] = (0, import_react.useState)({
		playing: false,
		position: 0
	});
	const [timelineEvidence, setTimelineEvidence] = (0, import_react.useState)({
		source: "local",
		at: Date.now()
	});
	const [chat, setChat] = (0, import_react.useState)([]);
	const [message, setMessage] = (0, import_react.useState)("");
	const [partyPrompt, setPartyPrompt] = (0, import_react.useState)("Pick the next vibe");
	const [partyVotes, setPartyVotes] = (0, import_react.useState)({
		Comedy: 0,
		Action: 0,
		Surprise: 0
	});
	const [friendName, setFriendName] = (0, import_react.useState)("");
	const [friendCode, setFriendCode] = (0, import_react.useState)("");
	const [inviteNotice, setInviteNotice] = (0, import_react.useState)("");
	const [pulseStatus, setPulseStatus] = (0, import_react.useState)("No direct transport test yet.");
	const [friends, setFriends] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.lan-friends.v1") ?? "[]");
			return Array.isArray(saved) ? saved.slice(0, 16) : [];
		} catch {
			return [];
		}
	});
	const videos = useLibrary((s) => s.videos);
	const favorites = useLibrary((s) => s.favorites);
	const history = useLibrary((s) => s.history);
	const recordPlay = useLibrary((s) => s.recordPlay);
	(0, import_react.useEffect)(() => {
		localStorage.setItem("reelcase.profile-name", name.trim() || "Host");
	}, [name]);
	const [sharedVideoId, setSharedVideoId] = (0, import_react.useState)(() => {
		const pending = localStorage.getItem("reelcase.watch-room.pending-video");
		return (pending ? videos.find((video) => video.id === pending && Boolean(video.src || video.remote?.embedUrl)) : void 0)?.id ?? videos.find((video) => Boolean(video.src || video.remote?.embedUrl))?.id ?? "";
	});
	const sharedVideo = videos.find((video) => video.id === sharedVideoId);
	const roomClockCeiling = Math.max(60, Math.min(sharedVideo?.duration && sharedVideo.duration > 0 ? sharedVideo.duration + 30 : 43200, 43200));
	const clampRoomClock = (seconds) => Math.max(0, Math.min(roomClockCeiling, Number.isFinite(seconds) ? seconds : 0));
	const localShareIsMatched = !sharedVideoId.startsWith("local:") || localShare?.fingerprint === sharedVideoId.slice(6);
	const roomVideoRef = (0, import_react.useRef)(null);
	const remoteFrameRef = (0, import_react.useRef)(null);
	const twitchPlayerHostRef = (0, import_react.useRef)(null);
	const twitchPlayerRef = (0, import_react.useRef)(null);
	const [remoteFrameReady, setRemoteFrameReady] = (0, import_react.useState)(0);
	const [remoteSeekNonce, setRemoteSeekNonce] = (0, import_react.useState)(0);
	const lastYoutubeSeekNonce = (0, import_react.useRef)(0);
	const lastTwitchSeekNonce = (0, import_react.useRef)(0);
	const suppressRemotePlayerEchoUntil = (0, import_react.useRef)(0);
	const [twitchPlayerStatus, setTwitchPlayerStatus] = (0, import_react.useState)("Waiting for Twitch player…");
	const [twitchPlayerReady, setTwitchPlayerReady] = (0, import_react.useState)(0);
	const [candidateSeed, setCandidateSeed] = (0, import_react.useState)(() => Date.now());
	const [roomPickLimit, setRoomPickLimit] = (0, import_react.useState)(18);
	const youtubePlaybackStartedAt = (0, import_react.useRef)(null);
	const [localVideoUrl, setLocalVideoUrl] = (0, import_react.useState)("");
	const lastRoomTick = (0, import_react.useRef)(0);
	const lastRoomHistoryId = (0, import_react.useRef)("");
	const lastRoomPosition = (0, import_react.useRef)(0);
	const applyingRemotePlaybackUntil = (0, import_react.useRef)(0);
	const p2p = useP2PRoom(activeRoom ?? "", name.trim() || "Guest");
	(0, import_react.useEffect)(() => {
		if (!localVideo) {
			setLocalVideoUrl("");
			return;
		}
		const url = URL.createObjectURL(localVideo);
		setLocalVideoUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [localVideo]);
	(0, import_react.useEffect)(() => {
		localStorage.removeItem("reelcase.watch-room.pending-video");
	}, []);
	const roomCandidates = (0, import_react.useMemo)(() => {
		const played = new Set(history.map((entry) => entry.id));
		return videos.filter((video) => !video.isSample && !/\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`) && !useLibrary.getState().unavailable[video.id] && Boolean(video.remote?.embedUrl || video.src)).map((video) => {
			return {
				video,
				rank: roomShuffleRank(`${video.id}:${candidateSeed}`, candidateSeed) / 4294967295 + (favorites[video.id] ? .18 : 0) - (played.has(video.id) ? .32 : 0)
			};
		}).sort((a, b) => b.rank - a.rank).map(({ video }) => video);
	}, [
		candidateSeed,
		favorites,
		history,
		videos
	]);
	const localQueueCandidates = (0, import_react.useMemo)(() => roomCandidates.filter((video) => !video.remote && video.id !== sharedVideoId && !queue.includes(video.id)).slice(0, 18), [
		queue,
		roomCandidates,
		sharedVideoId
	]);
	const queueRecommendations = (0, import_react.useMemo)(() => {
		const alreadyShown = new Set(roomCandidates.slice(0, roomPickLimit).map((video) => video.id));
		const queued = new Set(queue);
		const unseen = roomCandidates.filter((video) => video.id !== sharedVideoId && !queued.has(video.id) && !alreadyShown.has(video.id)).sort((a, b) => roomShuffleRank(`${a.id}:queue`, candidateSeed + 17) - roomShuffleRank(`${b.id}:queue`, candidateSeed + 17));
		return (unseen.length ? unseen : roomCandidates.filter((video) => video.id !== sharedVideoId && !queued.has(video.id))).slice(0, 12);
	}, [
		candidateSeed,
		queue,
		roomCandidates,
		roomPickLimit,
		sharedVideoId
	]);
	(0, import_react.useEffect)(() => {
		const rotate = () => setCandidateSeed(Date.now());
		const timer = window.setInterval(rotate, 3e4);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const invitedRoom = (params.get("room") ?? "").trim().toUpperCase();
		if (!/^RC[A-Z0-9]{4,12}$/.test(invitedRoom)) return;
		setRoomInput(invitedRoom);
		if (params.get("theater") === "1") {
			setJoinedAsGuest(true);
			setStageSize("cinema");
			setActiveRoom(invitedRoom);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!p2p.peers.length) return;
		p2p.send({
			type: "room-state",
			playing: playback.playing,
			position: playback.position,
			videoId: sharedVideoId,
			queue,
			localQueue
		});
	}, [
		localQueue,
		p2p.peers.length,
		playback.playing,
		playback.position,
		queue,
		sharedVideoId
	]);
	(0, import_react.useEffect)(() => {
		if (joinedAsGuest && p2p.joined) p2p.send({ type: "resync-request" });
	}, [
		joinedAsGuest,
		p2p.joined,
		p2p.send
	]);
	(0, import_react.useEffect)(() => p2p.onMessage((from, raw) => {
		const data = raw;
		if (data.type === "chat" && data.text) setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
		if (data.type === "room-pulse") p2p.send({
			type: "room-pulse-ack",
			sentAt: data.sentAt
		}, from);
		if (data.type === "room-pulse-ack" && data.sentAt) setPulseStatus(`Direct transport confirmed · ${Math.max(0, Date.now() - data.sentAt)}ms round trip.`);
		if (data.type === "share-ready" && data.name && data.fingerprint) {
			const share = {
				name: data.name,
				fingerprint: data.fingerprint,
				size: Number(data.size) || 0,
				modified: Number(data.modified) || 0
			};
			setPendingLocalShare(share);
			setInviteNotice(`${data.name} is waiting for a permitted local match. Select the same file on this device; Reelcase compares name, size, and modified time without sending file contents.`);
		}
		if (data.type === "share-matched" && data.name && data.fingerprint) {
			setLocalShareMatches((matches) => ({
				...matches,
				[from]: {
					name: data.name,
					fingerprint: data.fingerprint,
					at: Date.now()
				}
			}));
			setInviteNotice(`${data.name} was matched by a guest. The approved local copy can now follow the room timeline.`);
		}
		if (data.type === "sync") {
			if (data.videoId && sharedVideoId && data.videoId !== sharedVideoId) return;
			const nextPosition = (Number(data.position) || 0) + (data.playing && data.sentAt ? Math.max(0, (Date.now() - data.sentAt) / 1e3) : 0);
			const safePosition = clampRoomClock(!data.seek && nextPosition < lastRoomPosition.current ? lastRoomPosition.current : nextPosition);
			lastRoomPosition.current = safePosition;
			applyingRemotePlaybackUntil.current = Date.now() + 900;
			setTimelineEvidence({
				source: "remote",
				at: Date.now()
			});
			if (data.seek) setRemoteSeekNonce((value) => value + 1);
			setPlayback({
				playing: Boolean(data.playing),
				position: safePosition
			});
		}
		if (data.type === "video" && data.videoId) setSharedVideoId(data.videoId);
		if (data.type === "queue" && Array.isArray(data.queue)) setQueue(data.queue);
		if (data.type === "local-queue" && Array.isArray(data.localQueue)) setLocalQueue(data.localQueue.slice(0, 24));
		if (data.type === "party-vote" && data.name) setPartyVotes((votes) => ({
			...votes,
			[data.name]: Number(data.position) || 0
		}));
		if (data.type === "room-state") {
			const videoChanged = Boolean(data.videoId && data.videoId !== sharedVideoId);
			if (data.videoId) setSharedVideoId(data.videoId);
			if (Array.isArray(data.queue)) setQueue(data.queue);
			if (Array.isArray(data.localQueue)) setLocalQueue(data.localQueue.slice(0, 24));
			const nextPosition = (Number(data.position) || 0) + (data.playing && data.sentAt ? Math.max(0, (Date.now() - data.sentAt) / 1e3) : 0);
			const safePosition = clampRoomClock(!videoChanged && nextPosition + .75 < lastRoomPosition.current ? lastRoomPosition.current : nextPosition);
			lastRoomPosition.current = safePosition;
			applyingRemotePlaybackUntil.current = Date.now() + 900;
			setTimelineEvidence({
				source: "remote",
				at: Date.now()
			});
			setPlayback({
				playing: Boolean(data.playing),
				position: safePosition
			});
		}
		if (data.type === "resync-request" && !joinedAsGuest) {
			const position = roomVideoRef.current?.currentTime ?? playback.position;
			p2p.send({
				type: "room-state",
				playing: !roomVideoRef.current?.paused && playback.playing,
				position,
				videoId: sharedVideoId,
				queue,
				localQueue,
				sentAt: Date.now()
			}, from);
		}
	}), [
		joinedAsGuest,
		localQueue,
		p2p.onMessage,
		p2p.send,
		playback.playing,
		playback.position,
		queue,
		roomClockCeiling,
		sharedVideoId
	]);
	const sync = (next, seek = false) => {
		if (!seek && Date.now() < applyingRemotePlaybackUntil.current) return;
		const isYoutube = sharedVideo?.remote?.kind === "youtube";
		const isTwitch = sharedVideo?.remote?.kind === "twitch";
		const elapsed = (isYoutube || isTwitch) && playback.playing && youtubePlaybackStartedAt.current ? Math.max(0, (Date.now() - youtubePlaybackStartedAt.current) / 1e3) : 0;
		const playerPosition = isTwitch ? twitchPlayerRef.current?.getCurrentTime() : void 0;
		const hasTwitchPosition = typeof playerPosition === "number" && Number.isFinite(playerPosition) && playerPosition > .25;
		const providerFallback = lastRoomPosition.current > .25 && next.position <= .25 && !seek;
		const providerClock = Math.max(lastRoomPosition.current, playback.position + elapsed);
		const position = !seek && (isYoutube || isTwitch) && !next.playing ? Math.max(providerClock, next.position) : isTwitch ? hasTwitchPosition ? playerPosition : providerFallback ? providerClock : Math.max(providerClock, next.position) : providerFallback ? providerClock : isYoutube ? Math.max(providerClock, next.position) : next.position;
		const resolved = {
			...next,
			position: clampRoomClock(position)
		};
		lastRoomPosition.current = resolved.position;
		youtubePlaybackStartedAt.current = resolved.playing ? Date.now() - resolved.position * 1e3 : null;
		setTimelineEvidence({
			source: sharedVideo?.remote ? "estimated" : "local",
			at: Date.now()
		});
		setPlayback(resolved);
		if (resolved.playing && sharedVideoId && !sharedVideoId.startsWith("local:") && lastRoomHistoryId.current !== sharedVideoId) {
			lastRoomHistoryId.current = sharedVideoId;
			recordPlay(sharedVideoId, "watch-room");
		}
		if (seek) setRemoteSeekNonce((value) => value + 1);
		p2p.send({
			type: "sync",
			...resolved,
			videoId: sharedVideoId,
			seek,
			sentAt: Date.now()
		});
	};
	(0, import_react.useEffect)(() => {
		const provider = sharedVideo?.remote?.kind;
		if (!provider || !playback.playing || !youtubePlaybackStartedAt.current) return;
		const timer = window.setInterval(() => {
			const twitchTime = provider === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : void 0;
			const actual = typeof twitchTime === "number" && twitchTime > .25 ? twitchTime : void 0;
			const estimated = clampRoomClock(actual ?? Math.max(lastRoomPosition.current, (Date.now() - youtubePlaybackStartedAt.current) / 1e3));
			if (estimated <= lastRoomPosition.current + .2) return;
			lastRoomPosition.current = estimated;
			setPlayback((current) => current.playing ? {
				...current,
				position: estimated
			} : current);
			setTimelineEvidence({
				source: actual === void 0 ? "estimated" : "local",
				at: Date.now()
			});
			if (!joinedAsGuest) p2p.send({
				type: "sync",
				playing: true,
				position: estimated,
				videoId: sharedVideoId,
				seek: false,
				sentAt: Date.now()
			});
		}, 1e3);
		return () => window.clearInterval(timer);
	}, [
		joinedAsGuest,
		p2p.send,
		playback.playing,
		sharedVideo?.id,
		sharedVideo?.remote?.kind
	]);
	const resync = () => {
		if (joinedAsGuest) {
			p2p.send({ type: "resync-request" });
			setInviteNotice("Requested the host’s current room state.");
			return;
		}
		const localPosition = roomVideoRef.current?.currentTime;
		const twitchPosition = sharedVideo?.remote?.kind === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : void 0;
		const position = typeof localPosition === "number" && localPosition > .25 ? localPosition : typeof twitchPosition === "number" && twitchPosition > .25 ? twitchPosition : playback.position;
		const playing = roomVideoRef.current ? !roomVideoRef.current.paused : playback.playing;
		sync({
			playing,
			position
		});
		p2p.send({
			type: "room-state",
			playing,
			position,
			videoId: sharedVideoId,
			queue,
			localQueue,
			sentAt: Date.now()
		});
		setInviteNotice("Sent the current video and timeline to every guest.");
	};
	const copyInvite = async () => {
		const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}&theater=1`;
		try {
			await navigator.clipboard.writeText(link);
			setInviteNotice("Theater invitation link copied.");
		} catch {
			setInviteNotice(`Share this theater link: ${link}`);
		}
	};
	(0, import_react.useEffect)(() => {
		const media = roomVideoRef.current;
		if (!media || sharedVideo?.remote) return;
		const driftLimit = playback.playing ? .65 : .1;
		if (Math.abs(media.currentTime - playback.position) > driftLimit) media.currentTime = playback.position;
		if (playback.playing && media.paused) media.play().catch(() => {});
		if (!playback.playing && !media.paused) media.pause();
	}, [playback, sharedVideo]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "youtube" || !remoteFrameReady) return;
		const frame = remoteFrameRef.current?.contentWindow;
		if (!frame) return;
		const target = new URL(watchRoomEmbed(sharedVideo)).origin;
		if (remoteSeekNonce !== lastYoutubeSeekNonce.current) {
			lastYoutubeSeekNonce.current = remoteSeekNonce;
			if (remoteSeekNonce) frame.postMessage(JSON.stringify({
				event: "command",
				func: "seekTo",
				args: [playback.position, true]
			}), target);
		}
		frame.postMessage(JSON.stringify({
			event: "command",
			func: playback.playing ? "playVideo" : "pauseVideo",
			args: []
		}), target);
	}, [
		playback,
		remoteFrameReady,
		remoteSeekNonce,
		sharedVideo
	]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "twitch") {
			twitchPlayerRef.current = null;
			return;
		}
		const host = twitchPlayerHostRef.current;
		if (!host) return;
		let cancelled = false;
		const hostId = `reelcase-twitch-${p2p.selfId}`;
		host.id = hostId;
		host.replaceChildren();
		setTwitchPlayerStatus("Loading Twitch interactive player…");
		loadTwitchEmbed().then((api) => {
			if (cancelled) return;
			const live = Boolean(sharedVideo.remote?.live);
			const rawVideo = sharedVideo.remote?.videoId ?? "";
			const video = rawVideo ? rawVideo.startsWith("v") ? rawVideo : `v${rawVideo}` : void 0;
			const player = new api.Player(hostId, {
				width: "100%",
				height: "100%",
				parent: [window.location.hostname],
				autoplay: false,
				muted: false,
				...live ? { channel: sharedVideo.remote?.watchUrl?.split("/").pop() } : { video }
			});
			twitchPlayerRef.current = player;
			const events = player.constructor;
			player.addEventListener(events.READY ?? "ready", () => {
				if (!cancelled) {
					setTwitchPlayerStatus("Twitch player ready. Use room controls to start.");
					setTwitchPlayerReady(Date.now());
				}
			});
			player.addEventListener(events.PLAY ?? "play", () => {
				const position = player.getCurrentTime();
				if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) sync({
					playing: true,
					position: position > .25 ? position : playback.position
				});
			});
			player.addEventListener(events.PAUSE ?? "pause", () => {
				const position = player.getCurrentTime();
				if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) sync({
					playing: false,
					position: position > .25 ? position : playback.position
				});
			});
			player.addEventListener(events.SEEK ?? "seek", () => {
				if (!cancelled && !live) sync({
					playing: true,
					position: player.getCurrentTime() || playback.position
				}, true);
			});
		}).catch(() => {
			if (!cancelled) setTwitchPlayerStatus("Twitch interactive player could not load. Open Twitch directly below.");
		});
		return () => {
			cancelled = true;
			twitchPlayerRef.current = null;
			host.replaceChildren();
		};
	}, [p2p.selfId, sharedVideo?.id]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "twitch") return;
		const player = twitchPlayerRef.current;
		if (!player) return;
		if (remoteSeekNonce !== lastTwitchSeekNonce.current) {
			lastTwitchSeekNonce.current = remoteSeekNonce;
			if (remoteSeekNonce && !sharedVideo.remote.live) player.seek(playback.position);
		}
		suppressRemotePlayerEchoUntil.current = Date.now() + 750;
		if (playback.playing) player.play();
		else player.pause();
	}, [
		playback,
		remoteSeekNonce,
		sharedVideo,
		twitchPlayerReady
	]);
	const toggleRoomPlayback = () => {
		const playing = !playback.playing;
		const player = twitchPlayerRef.current;
		if (sharedVideo?.remote?.kind === "twitch" && (!player || !twitchPlayerReady)) {
			setInviteNotice("Twitch is still preparing its player. Wait for “Twitch player ready,” then press Play.");
			return;
		}
		if (sharedVideo?.remote?.kind === "twitch" && player) {
			if (playing) {
				player.setMuted?.(false);
				player.play();
				setTwitchPlayerStatus("Starting Twitch from the room control…");
			} else player.pause();
		}
		sync({
			...playback,
			playing
		});
	};
	const chooseVideo = (video) => {
		setLocalVideo(null);
		setLocalShare(null);
		setLocalShareMatches({});
		setSharedVideoId(video.id);
		setPlayback({
			playing: false,
			position: 0
		});
		lastRoomPosition.current = 0;
		lastRoomHistoryId.current = "";
		recordPlay(video.id, "watch-room");
		p2p.send({
			type: "video",
			videoId: video.id
		});
		p2p.send({
			type: "sync",
			playing: false,
			position: 0,
			seek: true
		});
	};
	const updateQueue = (next) => {
		measureInteraction("queue");
		setQueue(next);
		p2p.send({
			type: "queue",
			queue: next
		});
	};
	const updateLocalQueue = (next) => {
		const bounded = next.slice(0, 24);
		setLocalQueue(bounded);
		p2p.send({
			type: "local-queue",
			localQueue: bounded
		});
	};
	const stageLocalShare = (share) => {
		if (!localShare || localShare.fingerprint !== share.fingerprint || !localVideo) {
			setPendingLocalShare(share);
			setInviteNotice(`Choose ${share.name} on this device before staging it. File contents are never transferred.`);
			return;
		}
		setSharedVideoId(`local:${share.fingerprint}`);
		setPlayback({
			playing: false,
			position: 0
		});
		lastRoomPosition.current = 0;
		p2p.send({
			type: "video",
			videoId: `local:${share.fingerprint}`
		});
		p2p.send({
			type: "sync",
			playing: false,
			position: 0,
			videoId: `local:${share.fingerprint}`,
			seek: true,
			sentAt: Date.now()
		});
		setInviteNotice(`${share.name} is staged. Guests with a verified local match can play it in sync.`);
	};
	const selectLocalVideo = (file) => {
		if (!file) return;
		const share = {
			name: file.name,
			fingerprint: localRoomFingerprint(file),
			size: file.size,
			modified: file.lastModified
		};
		if (joinedAsGuest && pendingLocalShare && pendingLocalShare.fingerprint !== share.fingerprint) {
			setInviteNotice(`That file does not match ${pendingLocalShare.name}. Select the same permitted copy (name, size, and modified time must agree).`);
			return;
		}
		setLocalVideo(file);
		setLocalShare(share);
		if (joinedAsGuest && pendingLocalShare) {
			setSharedVideoId(`local:${share.fingerprint}`);
			setPendingLocalShare(null);
			p2p.send({
				type: "share-matched",
				name: share.name,
				fingerprint: share.fingerprint
			});
			setInviteNotice(`${share.name} matched locally. Waiting for the host to stage or play it.`);
			return;
		}
		setSharedVideoId(`local:${share.fingerprint}`);
		setLocalShareMatches({});
		setPlayback({
			playing: false,
			position: 0
		});
		lastRoomPosition.current = 0;
		p2p.send({
			type: "share-ready",
			...share
		});
		p2p.send({
			type: "video",
			videoId: `local:${share.fingerprint}`
		});
		setInviteNotice("Local video is staged by a privacy-preserving fingerprint. Guests choose their own permitted matching copy; no file bytes leave this computer.");
	};
	const queueVideo = (video) => {
		if (video.id !== sharedVideoId && !queue.includes(video.id)) updateQueue([...queue, video.id]);
	};
	const queueImmediately = (video) => {
		if (video.id === sharedVideoId) return;
		updateQueue([video.id, ...queue.filter((id) => id !== video.id)]);
		setInviteNotice(`${video.name} will play next for everyone in the room.`);
	};
	const playNext = () => {
		const nextId = queue[0];
		if (!nextId) return;
		const next = videos.find((video) => video.id === nextId);
		updateQueue(queue.slice(1));
		if (next) chooseVideo(next);
	};
	const playQueuedNow = (id) => {
		const video = videos.find((item) => item.id === id);
		if (!video) return;
		updateQueue(queue.filter((item) => item !== id));
		chooseVideo(video);
	};
	const send = () => {
		const text = message.trim();
		if (!text) return;
		setChat((rows) => [...rows, `You: ${text}`].slice(-50));
		p2p.send({
			type: "chat",
			text,
			name: name.trim() || "Guest"
		});
		setMessage("");
	};
	if (!activeRoom) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "LAN watch room",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
		title: "Watch together, on your terms.",
		copy: "Create a private room code or join one on the same network. Peers connect directly; names, chat, and playback commands stay in the room.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Create a room"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-3xl tracking-[0.16em] text-fg",
						children: roomCode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Share this code only with people you want in your watch room."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "mt-3 w-full",
						onClick: () => void copyInvite(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), " Copy theater invitation link"]
					}),
					inviteNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 break-all text-xs text-accent",
						children: inviteNotice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-5 w-full",
						onClick: () => {
							setJoinedAsGuest(false);
							localStorage.setItem("reelcase.watch-room.last-host", roomCode);
							setRecentLocalRoom(roomCode);
							setActiveRoom(roomCode);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }), " Start room"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs leading-5 text-subtle",
						children: [
							"Testing on one computer? Start the room first, then use ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-fg",
								children: "Open local guest window"
							}),
							" inside the room. A second browser window is a separate peer; a single tab cannot chat with itself."
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Join a theater"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Guests enter a focused theater view first; controls and chat stay available beside the screen."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-3",
						value: roomInput,
						onChange: (event) => setRoomInput(event.target.value.toUpperCase()),
						placeholder: "Enter room code",
						"aria-label": "Watch room code"
					}),
					recentLocalRoom && recentLocalRoom !== roomInput && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						className: "mt-2",
						onClick: () => {
							setRoomInput(recentLocalRoom);
							setInviteNotice(`Using this browser’s active host room: ${recentLocalRoom}.`);
						},
						children: ["Join local host · ", recentLocalRoom]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-2",
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Your display name",
						"aria-label": "Your display name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-3 w-full",
						disabled: !roomInput.trim(),
						onClick: () => {
							setJoinedAsGuest(true);
							setStageSize("cinema");
							setActiveRoom(roomInput.trim());
						},
						children: "Join theater"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Local friends"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-5 text-muted",
								children: "Save a trusted friend name and their current room code for one-tap joining on this network."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-2 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: friendName,
									onChange: (event) => setFriendName(event.target.value),
									placeholder: "Friend name",
									"aria-label": "Friend name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: friendCode,
									onChange: (event) => setFriendCode(event.target.value.toUpperCase()),
									placeholder: "Room code",
									"aria-label": "Friend room code"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								className: "mt-2",
								disabled: !friendName.trim() || !friendCode.trim(),
								onClick: () => {
									const next = [{
										name: friendName.trim(),
										code: friendCode.trim()
									}, ...friends.filter((friend) => friend.code !== friendCode.trim())].slice(0, 16);
									setFriends(next);
									localStorage.setItem("reelcase.lan-friends.v1", JSON.stringify(next));
									setFriendName("");
									setFriendCode("");
								},
								children: "Save friend"
							}),
							friends.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: friends.map((friend) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										setRoomInput(friend.code);
										setName(friend.name);
									},
									children: [
										friend.name,
										" · ",
										friend.code
									]
								}, `${friend.name}-${friend.code}`))
							})
						]
					})
				]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Connected watch room",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
		title: joinedAsGuest ? `Theater · ${activeRoom}` : `Room ${activeRoom}`,
		copy: joinedAsGuest ? "Guest theater view. The host's current video, queue, and timeline arrive as the connection settles." : "Direct peer connection for your selected guests. Playback events are synchronized across connected devices.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Synchronized playback"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: `size-3 ${p2p.joined ? "text-accent" : "text-subtle"}` }), p2p.joined ? "Signaling online" : "Connecting…"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								const invite = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`;
								const opened = window.open(invite, "reelcase-local-guest", "noopener,width=1200,height=820");
								setInviteNotice(opened ? "Opened a separate local guest window. Give it a moment to appear in Guests." : "Your browser blocked the guest window. Allow pop-ups, then try again.");
							},
							children: "Open local guest window"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void navigator.clipboard?.writeText(JSON.stringify({
								room: activeRoom,
								invitation: `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`,
								self: p2p.selfId,
								signaling: p2p.joined,
								peers: p2p.peers,
								transportTest: pulseStatus,
								events: p2p.events,
								capturedAt: (/* @__PURE__ */ new Date()).toISOString()
							}, null, 2)).then(() => setInviteNotice("Connection diagnostic copied."), () => setInviteNotice("Could not copy the diagnostic.")),
							children: "Copy connection diagnostic"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-sm bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium text-fg",
									children: "Connection signals"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [
										p2p.peers.filter((peer) => peer.connectionState === "connected").length,
										"/",
										p2p.peers.length,
										" direct"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 max-h-28 space-y-1 overflow-y-auto font-mono text-[11px] leading-4 text-muted",
								children: p2p.events.map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: event }, `${event}-${index}`))
							}),
							!p2p.peers.length && p2p.joined && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-accent",
								children: [
									"Signaling is healthy, but no peer is in ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeRoom }),
									". The other window must join this exact code—not create its own. Use Open local guest window or copy this room link."
								]
							}),
							p2p.peers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 space-y-1 text-xs text-muted",
								children: p2p.peers.map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-fg",
										children: peer.name || "Guest"
									}),
									" · ",
									peer.connectionState,
									" · ",
									peer.candidateType ?? "path pending",
									" · ",
									peer.rttMs == null ? "RTT pending" : `${peer.rttMs}ms`,
									" · ",
									peer.id.slice(-6)
								] }, peer.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: !p2p.peers.some((peer) => peer.connectionState === "connected"),
									onClick: () => {
										setPulseStatus("Sending direct transport test…");
										p2p.send({
											type: "room-pulse",
											sentAt: Date.now()
										});
									},
									children: "Test chat transport"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: pulseStatus
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl text-fg",
						children: playback.playing ? "Playing together" : "Paused together"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Timeline ",
							Math.floor(playback.position / 60),
							":",
							String(Math.floor(playback.position % 60)).padStart(2, "0"),
							" · ",
							timelineEvidence.source === "remote" ? "host-confirmed" : timelineEvidence.source === "local" ? "local player" : "provider estimate",
							" · checked ",
							new Date(timelineEvidence.at).toLocaleTimeString([], {
								hour: "numeric",
								minute: "2-digit",
								second: "2-digit"
							}),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: toggleRoomPlayback,
								children: [playback.playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playback.playing ? "Pause" : "Play"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => sync({
									...playback,
									position: Math.max(0, playback.position - 15)
								}, true),
								children: "−15 sec"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => sync({
									...playback,
									position: playback.position + 15
								}, true),
								children: "+15 sec"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: resync,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }),
									" ",
									joinedAsGuest ? "Request resync" : "Resync guests"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								disabled: !queue.length,
								onClick: playNext,
								children: ["Play next ", queue.length ? `(${queue.length})` : ""]
							})
						]
					}),
					inviteNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-accent",
						children: inviteNotice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stage size" }), [
							"compact",
							"theater",
							"cinema"
						].map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: stageSize === size ? "default" : "secondary",
							onClick: () => setStageSize(size),
							children: size
						}, size))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `mt-3 mx-auto w-full max-w-full overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "lg:max-w-2xl" : stageSize === "theater" ? "lg:max-w-6xl" : ""}`,
						children: localVideoUrl && localShareIsMatched ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: roomVideoRef,
							className: "aspect-video w-full bg-bg",
							src: localVideoUrl,
							controls: true,
							onEnded: playNext,
							onPlay: () => sync({
								playing: true,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onPause: () => sync({
								playing: false,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onSeeked: () => sync({
								playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
								position: roomVideoRef.current?.currentTime ?? 0
							})
						}) : sharedVideo?.remote?.kind === "twitch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative aspect-video w-full bg-bg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								ref: twitchPlayerHostRef,
								className: "absolute inset-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "absolute bottom-2 left-2 rounded-sm bg-bg/80 px-2 py-1 text-xs text-muted",
								children: twitchPlayerStatus
							})]
						}) : sharedVideo?.remote?.embedUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							ref: remoteFrameRef,
							title: sharedVideo.name,
							src: watchRoomEmbed(sharedVideo),
							className: "aspect-video w-full border-0",
							allow: "autoplay; encrypted-media; picture-in-picture",
							allowFullScreen: true,
							onLoad: () => setRemoteFrameReady(Date.now())
						}) : sharedVideo?.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: roomVideoRef,
							className: "aspect-video w-full bg-bg",
							src: sharedVideo.src,
							controls: true,
							onEnded: playNext,
							onPlay: () => sync({
								playing: true,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onPause: () => sync({
								playing: false,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onSeeked: () => sync({
								playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onTimeUpdate: () => {
								const media = roomVideoRef.current;
								if (!media || media.paused || Date.now() - lastRoomTick.current < 900) return;
								lastRoomTick.current = Date.now();
								sync({
									playing: true,
									position: media.currentTime
								});
							}
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex aspect-video items-center justify-center px-6 text-center text-sm text-muted",
							children: sharedVideoId.startsWith("local:") ? "This local handoff is waiting for a matching permitted file on this device." : "Choose a starter movie or an online video to show it to the room."
						})
					}),
					sharedVideo?.remote?.kind === "youtube" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-subtle",
						children: "YouTube room controls retain the last trusted clock on pause, then resume from that same point. Use the room controls so every guest receives the same command."
					}) : sharedVideo?.remote?.kind === "twitch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-fg",
							children: "Twitch currently needs one manual Play press in each viewer’s embed."
						}), " Browser media rules prevent Reelcase from forcing a guest stream to start. Selection, queue, chat, and the preserved pause clock still sync through the room controls."] }), sharedVideo.remote.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: sharedVideo.remote.watchUrl,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-8 items-center rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1 size-3" }), "Open Twitch directly"]
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted",
						children: "Recommended from your playable library — saved titles get a small lift while unplayed playable videos rotate to the front. Ready local files can be added to the queue below without taking over the stage."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => {
								setCandidateSeed(Date.now());
								setRoomPickLimit(18);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3.5" }), " Mix playable picks"]
						}), roomCandidates.length > roomPickLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setRoomPickLimit((limit) => Math.min(roomCandidates.length, limit + 18)),
							children: "Load 18 more playable videos"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-2 overflow-x-auto pb-2",
						children: roomCandidates.slice(0, roomPickLimit).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => chooseVideo(video),
							className: `w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === sharedVideoId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`,
							children: [watchRoomPoster(video) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: watchRoomPoster(video),
								alt: "",
								className: "aspect-video w-full object-cover",
								onError: (event) => {
									const fallback = video.remote?.kind === "youtube" && video.remote.videoId ? `https://i.ytimg.com/vi/${video.remote.videoId}/mqdefault.jpg` : "";
									if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
									else event.currentTarget.style.display = "none";
								}
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate px-2 py-2 text-xs",
								children: video.name
							})]
						}, video.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-md bg-bg/45 p-3 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: "Up next queue"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: "Hosts can order the room playlist"
								})]
							}),
							queue.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 space-y-2",
								children: queue.map((id, index) => {
									const video = videos.find((item) => item.id === id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3 rounded-sm bg-elevated p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 items-center gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent",
													children: index + 1
												}),
												video && watchRoomPoster(video) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: watchRoomPoster(video),
													alt: "",
													className: "aspect-video w-16 shrink-0 rounded-sm object-cover"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex aspect-video w-16 shrink-0 items-center justify-center rounded-sm bg-bg/60 text-xs text-muted",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block truncate text-sm text-fg",
														children: video?.name ?? "Unavailable title"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block truncate text-xs text-muted",
														children: video?.remote?.channelName ?? (video?.remote ? "Remote video" : "Local file")
													})]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													onClick: () => playQueuedNow(id),
													children: "Play now"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													disabled: index === 0,
													onClick: () => {
														const next = [...queue];
														[next[index - 1], next[index]] = [next[index], next[index - 1]];
														updateQueue(next);
													},
													children: "↑"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													onClick: () => updateQueue(queue.filter((item) => item !== id)),
													children: "Remove"
												})
											]
										})]
									}, id);
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Choose “Add next” below to build the shared queue."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex gap-2 overflow-x-auto pb-1",
								children: roomCandidates.filter((video) => video.id !== sharedVideoId).slice(0, 12).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex shrink-0 overflow-hidden rounded-sm shadow-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => queueImmediately(video),
										children: "Play next"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										disabled: queue.includes(video.id),
										onClick: () => queueVideo(video),
										children: ["+ queue · ", video.name]
									})]
								}, video.id))
							}),
							queueRecommendations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-t border-border pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-fg",
										children: "More queue ideas"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "Different from the theater picks above"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex gap-2 overflow-x-auto pb-1",
									children: queueRecommendations.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex shrink-0 overflow-hidden rounded-sm shadow-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => queueImmediately(video),
											children: "Play next"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => queueVideo(video),
											children: ["+ queue · ", video.name]
										})]
									}, video.id))
								})]
							}),
							localQueueCandidates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-t border-border pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-fg",
										children: "Ready local files"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "Add to queue without opening now"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex gap-2 overflow-x-auto pb-1",
									children: localQueueCandidates.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => queueVideo(video),
										children: ["+ queue · ", video.name]
									}, video.id))
								})]
							}),
							localQueue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-t border-border pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-fg",
										children: "Approved local handoffs"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "Shared manifest · files stay on each device"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 space-y-2",
									children: localQueue.map((share) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-2 rounded-sm bg-elevated px-3 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 truncate text-xs text-fg",
											children: [
												share.name,
												" · ",
												bytes(share.size)
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => stageLocalShare(share),
												children: "Stage"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => updateLocalQueue(localQueue.filter((item) => item.fingerprint !== share.fingerprint)),
												children: "Remove"
											})]
										})]
									}, share.fingerprint))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-md bg-bg/45 p-4 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: "Share local video"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Choose a file only when every guest has permission to view it. Guests confirm access before you start sharing."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-3 block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "sr-only",
									type: "file",
									accept: "video/*",
									onChange: (event) => {
										const file = event.target.files?.[0] ?? null;
										selectLocalVideo(file);
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border",
									children: localVideo ? localVideo.name : "Choose local video"
								})]
							}),
							localShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-subtle",
								children: [
									"Fingerprint match: name + ",
									bytes(localShare.size),
									" + modified ",
									new Date(localShare.modified).toLocaleDateString(),
									". This is shared as metadata only."
								]
							}),
							localShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									"Compatibility matrix · ",
									Object.values(localShareMatches).filter((match) => match.fingerprint === localShare.fingerprint).length,
									"/",
									p2p.peers.length,
									" guests matched this exact file",
									p2p.peers.length ? ". Stage or play only when the expected guests are ready." : ". Connect a guest to verify the handoff."
								]
							}),
							pendingLocalShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-accent",
								children: [
									"Guest match requested: ",
									pendingLocalShare.name,
									" · ",
									bytes(pendingLocalShare.size),
									". Choose the matching permitted copy above."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-3 flex items-start gap-2 text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: guestAccess,
									onChange: (event) => setGuestAccess(event.target.checked)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I confirm guests have access to this video and may receive this direct share." })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "mt-3",
								disabled: !localVideo || !guestAccess || !p2p.peers.length,
								onClick: () => {
									if (!localShare) return;
									setLocalShareMatches({});
									p2p.send({
										type: "share-ready",
										...localShare
									});
									p2p.send({
										type: "video",
										videoId: `local:${localShare.fingerprint}`
									});
									setInviteNotice("Local-share request sent with a match fingerprint. Guests must choose their permitted local copy before playback can align.");
								},
								children: "Send sharing request"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								className: "mt-3 ml-2",
								disabled: !localShare,
								onClick: () => {
									if (!localShare) return;
									if (!localQueue.some((item) => item.fingerprint === localShare.fingerprint)) updateLocalQueue([...localQueue, localShare]);
									setInviteNotice("Added this local file to the shared handoff queue. Guests see only its match metadata.");
								},
								children: "Add to local queue"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-md bg-bg/45 p-4 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: "Watch-party mini games"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Start a lightweight shared vote while the room is paused. Votes are sent to connected guests."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-3",
								value: partyPrompt,
								onChange: (event) => setPartyPrompt(event.target.value),
								"aria-label": "Party vote question"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: Object.keys(partyVotes).map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										const next = (partyVotes[choice] ?? 0) + 1;
										setPartyVotes((votes) => ({
											...votes,
											[choice]: next
										}));
										p2p.send({
											type: "party-vote",
											name: choice,
											position: next
										});
									},
									children: [
										choice,
										" · ",
										partyVotes[choice] ?? 0
									]
								}, choice))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs text-accent",
								children: ["Now voting: ", partyPrompt]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-md bg-bg/45 p-4 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm font-medium text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4 text-accent" }), "Roku handoff"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
								className: "mt-2 space-y-1 text-xs text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-2 text-accent",
										children: "1."
									}), "On Roku, open Settings → Network → About and copy its IP address."] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-2 text-accent",
										children: "2."
									}), "Enter it below to save this TV as a trusted handoff target."] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-2 text-accent",
										children: "3."
									}), "Launch the channel and copy the room invitation to your Roku browser or companion app."] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-col gap-2 sm:flex-row",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: rokuAddress,
										onChange: (event) => {
											setRokuAddress(event.target.value);
											setRokuReady(false);
										},
										placeholder: "Roku IP address, e.g. 192.168.1.24",
										"aria-label": "Roku IP address"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										disabled: !rokuAddress.trim(),
										onClick: () => {
											setRokuReady(true);
											localStorage.setItem("reelcase.roku", rokuAddress.trim());
										},
										children: "Save & pair TV"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										onClick: () => void (async () => {
											try {
												const devices = (await (await fetch("http://127.0.0.1:43123/roku/discover")).json()).devices ?? [];
												setRokuDevices(devices);
												setRokuNotice(devices.length ? `${devices.length} Roku device${devices.length === 1 ? "" : "s"} found on this network.` : "No Roku devices responded. You can still pair one by its IP address.");
											} catch {
												setRokuNotice("Roku discovery needs the local Reelcase Companion running on this Windows computer.");
											}
										})(),
										children: "Discover TVs"
									})
								]
							}),
							rokuNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: rokuNotice
							}),
							rokuDevices.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: rokuDevices.map((device) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										setRokuAddress(device.address);
										setRokuReady(true);
										localStorage.setItem("reelcase.roku", device.address);
									},
									children: device.address
								}, device.address))
							}),
							rokuReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-sm bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-accent",
									children: ["Step 3 ready · ", rokuAddress]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => {
											const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}`;
											window.open(`http://${rokuAddress}:8060/launch/837`, "_blank", "noopener");
											navigator.clipboard?.writeText(url).catch(() => {});
										},
										children: "Launch & copy room link"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => {
											setRokuReady(false);
											localStorage.removeItem("reelcase.roku");
										},
										children: "Forget TV"
									})]
								})]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-sm font-medium text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 text-accent" }), " Room chat"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 max-h-48 space-y-2 overflow-y-auto text-sm text-muted",
						children: chat.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-sm bg-bg/45 px-3 py-2",
							children: row
						}, `${row}-${index}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: message,
							onChange: (event) => setMessage(event.target.value),
							onKeyDown: (event) => {
								if (event.key === "Enter") send();
							},
							placeholder: "Say something",
							"aria-label": "Room chat message"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: send,
							children: "Send"
						})]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-lg bg-elevated p-4 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "Guests & connection status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
						children: ["You · ", p2p.joined ? "ready" : "joining"]
					}), p2p.peers.length ? p2p.peers.map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
						children: [
							peer.name || "Guest",
							" · ",
							peer.connectionState,
							peer.rttMs ? ` · ${peer.rttMs}ms` : ""
						]
					}, peer.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-subtle",
						children: "Waiting for guests to join with the room code."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (event) => setName(event.target.value),
						"aria-label": "Display name",
						className: "max-w-56"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							setActiveRoom(null);
							setRoomCode(`RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
						},
						children: "Leave room"
					})]
				})
			]
		})]
	});
}
function HubShell({ eyebrow, icon, title, copy, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
				children: [
					icon,
					" ",
					eyebrow
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base",
				children: copy
			}),
			children
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated px-4 py-4 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-2xl tabular-nums text-fg",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: label
		})]
	});
}
function ServiceLink({ name, href, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		className: "rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl text-fg",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: copy
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent",
				children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
			})
		]
	});
}
function InfoCard({ icon, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: copy
			})
		]
	});
}
function PhotoStars({ name, rating, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex flex-wrap items-center gap-1",
		role: "group",
		"aria-label": "Rating for " + name,
		children: [[
			1,
			2,
			3,
			4,
			5
		].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "inline-flex size-11 items-center justify-center rounded-sm hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent",
			"aria-label": "Rate " + name + " " + value + " stars",
			"aria-pressed": rating === value,
			onClick: () => onChange(value),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-5 " + (value <= rating ? "fill-accent text-accent" : "text-muted") })
		}, value)), rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "min-h-11 px-2 text-xs text-muted",
			"aria-label": "Clear rating for " + name,
			onClick: () => onChange(0),
			children: "Clear"
		})]
	});
}
//#endregion
export { FindPhoneSection, GamesSection, GenreSection, LanConnectionSection, MissionPlanSection, PhotosSection, PrintsSection, PrivateWebShortcuts, SettingsSection, ShopSection, SocialSection, SpotifySection, StatsSection, StreamingSection, WatchRoomSection };
