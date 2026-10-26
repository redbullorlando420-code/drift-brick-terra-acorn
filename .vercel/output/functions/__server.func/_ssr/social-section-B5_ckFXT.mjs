import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { A as Search, D as ShieldCheck, F as RefreshCw, Lt as ExternalLink, n as X } from "../_libs/lucide-react.mjs";
import { Dt as Input, Ot as Button } from "./library-app-CrsCDQmv.mjs";
import { s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/social-section-B5_ckFXT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	const [phase, setPhase] = (0, import_react.useState)("loading");
	const [status, setStatus] = (0, import_react.useState)("Loading public posts…");
	const deskKey = `reelcase.x-desk.${topic ? `topic:${topic.query}` : `account:${account ?? "public"}`}`;
	const [lastReadAt, setLastReadAt] = (0, import_react.useState)(() => typeof window === "undefined" ? 0 : Number(localStorage.getItem(deskKey) ?? 0));
	(0, import_react.useEffect)(() => {
		const element = container.current;
		if (!element) return;
		let cancelled = false;
		setPhase("loading");
		setStatus("Loading public posts…");
		element.replaceChildren();
		const timelineUrl = topic ? `https://twitter.com/search?q=${encodeURIComponent(topic.query)}&src=typed_query&f=live` : `https://twitter.com/${account}`;
		const timeout = window.setTimeout(() => {
			if (!cancelled) {
				setPhase("unavailable");
				setStatus("X hasn’t supplied a timeline. Open the profile to view posts, or retry.");
			}
		}, 15e3);
		const observer = new MutationObserver(() => {
			const frame = element.querySelector("iframe");
			if (frame) frame.addEventListener("load", () => {
				if (!cancelled) {
					clearTimeout(timeout);
					const now = Date.now();
					localStorage.setItem(deskKey, String(now));
					setLastReadAt(now);
					setPhase("ready");
					setStatus("X embed loaded. If posts are blank, open the profile.");
				}
			}, { once: true });
		});
		observer.observe(element, {
			childList: true,
			subtree: true
		});
		loadWidgets().then(async (api) => {
			if (cancelled) return;
			const options = {
				height: 640,
				theme: document.documentElement.dataset.theme === "day" ? "light" : "dark",
				dnt: true,
				chrome: "noheader nofooter"
			};
			if (api.widgets.createTimeline) {
				await api.widgets.createTimeline(topic ? {
					sourceType: "url",
					url: timelineUrl
				} : {
					sourceType: "profile",
					screenName: account ?? ""
				}, element, options);
				return;
			}
			const link = document.createElement("a");
			link.className = "twitter-timeline";
			link.href = timelineUrl;
			link.dataset.height = "640";
			link.dataset.theme = options.theme;
			link.dataset.dnt = "true";
			link.textContent = topic ? `Public posts about ${topic.label}` : `Public posts by @${account}`;
			element.append(link);
			return api.widgets.load(element);
		}).catch(() => {
			if (!cancelled) {
				clearTimeout(timeout);
				setPhase("unavailable");
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
	const unavailable = phase === "unavailable";
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
				children: lastReadAt ? `Embed last loaded ${new Date(lastReadAt).toLocaleString()}` : "No public timeline has loaded in this browser yet."
			}),
			unavailable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid gap-3 rounded-md bg-bg/45 p-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm font-medium text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-accent" }), "Public-reader fallback"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: "The official X embed did not load in this browser. Realhub does not invent posts or store credentials."
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
/** Curated public X handles for one-time Adults / Social seeding (18+). */
var X_ADULT_SEED_HANDLES = [
	"ThePornDude",
	"Brazzers",
	"Pornhub",
	"MiaMalkova",
	"soogsx",
	"Amouranth",
	"KittyxKum",
	"RileyReid",
	"EsperanzaGomez",
	"SophieRainx",
	"AngelaWhite",
	"puppiwi",
	"belle_delphine",
	"Abella_Danger",
	"Vladislava_",
	"RealityPornKing",
	"EmarrB",
	"BaybeKimchi",
	"BrittanyaRazavi",
	"BishoujoMom",
	"TheLisaAnn",
	"BambiDoe",
	"miakhalifa",
	"TeannaTrump",
	"AndiiPoops",
	"GiselleMontesX",
	"Playboy",
	"PurpleBitch1",
	"SashaGrey",
	"JennaLynnMeowri",
	"AlinaRoseASMR",
	"WaifuMia"
].map((h) => h.replace(/^@/, "").toLowerCase()).filter((h) => /^[a-z0-9_]{1,15}$/.test(h));
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
			let saved = Array.isArray(raw) ? raw.filter((value) => typeof value === "string" && /^[A-Za-z0-9_]{1,15}$/.test(value)) : [];
			const seededFlag = localStorage.getItem("reelcase.x-adult-seeded") === "1";
			if (!saved.length && !seededFlag) {
				saved = [...new Set(X_ADULT_SEED_HANDLES)].slice(0, 50);
				localStorage.setItem("reelcase.x-accounts", JSON.stringify(saved));
				localStorage.setItem("reelcase.x-adult-seeded", "1");
			} else if (!seededFlag) localStorage.setItem("reelcase.x-adult-seeded", "1");
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
		copy: "Save X profiles, switch between public timelines, and pick up where you left off. Public timelines render inside Realhub through X’s official widget; private posts and account likes stay on X.",
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
//#endregion
export { SocialSection };
