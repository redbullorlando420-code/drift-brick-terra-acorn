import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Ft as tagIsLiked, G as loadAdultArchiveCursors, Jt as Input, O as getHeartedTagHistory, Pt as tagHasHeartHistory, Rt as toggleTagLike, Vt as useLibrary, _t as selectAdultRemote, gt as searchRedtubeStars, ht as scheduleBackgroundWork, i as adultArchiveDepthLabel, j as getRating, qt as Button } from "./store-uZbLuJol.mjs";
import { M as fetishSearchQuery, S as adultSourceTag, i as ADULT_FEATURED_FETISH_TAGS, l as ADULT_SOURCE_OPTIONS, n as ADULT_CURATED_FETISH_TAGS, p as LIBRARY_LIMITS, r as ADULT_EMBED_LINKS, s as ADULT_MILESTONE_LINKS, t as ADULT_CATEGORY_HUB } from "./adult-pull-cache-CM6xh6_t.mjs";
import { t as useShallow } from "../_libs/zustand.mjs";
import { n as ADULT_REDDIT_SUBS } from "./adult-reddit-subs-bzu0GGaT.mjs";
import { a as countAdultBySource, l as rankAdultTags, t as ADULT_SOURCE_FILTERS } from "./adult-rank-Bn2wocg4.mjs";
import { D as RefreshCw, Et as ChevronDown, W as LoaderCircle, ht as ExternalLink, ut as Flag, w as Search, wt as ChevronRight } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/adult-panel-s4q3TF2o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ADULT_PROVIDER_ADAPTERS = [
	{
		id: "eporner",
		label: "Eporner",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"archive",
			"poster",
			"playback"
		]
	},
	{
		id: "redtube",
		label: "RedTube",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"archive",
			"poster",
			"playback"
		]
	},
	{
		id: "chaturbate",
		label: "Chaturbate",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"poster",
			"playback"
		]
	},
	{
		id: "myfreecams",
		label: "MyFreeCams",
		transport: "public-api",
		status: "active",
		capabilities: ["catalog", "poster"]
	},
	{
		id: "reddit",
		label: "Reddit",
		transport: "atom-rss",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"archive",
			"poster"
		]
	},
	{
		id: "booru",
		label: "Booru + Rule34 + Gelbooru + e621",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"poster"
		]
	},
	{
		id: "redgifs",
		label: "Redgifs",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"poster",
			"playback"
		]
	}
];
var ORDERS = [
	{
		id: "top-weekly",
		label: "Top this week"
	},
	{
		id: "most-popular",
		label: "Most popular"
	},
	{
		id: "latest",
		label: "Latest"
	},
	{
		id: "top-rated",
		label: "Top rated"
	}
];
var PROVIDER_CHOICES = [
	{
		id: "all",
		label: "All pull sources"
	},
	{
		id: ["eporner", "redtube"],
		label: "Videos (Eporner + RedTube)"
	},
	{
		id: ["chaturbate", "myfreecams"],
		label: "Live cams"
	},
	{
		id: ["chaturbate"],
		label: "Chaturbate only"
	},
	{
		id: ["myfreecams"],
		label: "MyFreeCams only"
	},
	{
		id: ["reddit"],
		label: "Reddit (18+)"
	},
	{
		id: ["booru"],
		label: "Booru photos (18+)"
	},
	{
		id: ["booru"],
		label: "Rule34 / Gelbooru pull (via Booru)"
	},
	{
		id: ["redgifs"],
		label: "Redgifs (official API)"
	},
	{
		id: ["eporner"],
		label: "Eporner only"
	},
	{
		id: ["redtube"],
		label: "RedTube only"
	}
];
var FETISH_EXPLORER_GROUPS = [
	{
		label: "Featured",
		tags: ADULT_FEATURED_FETISH_TAGS
	},
	{
		label: "Scenes & styles",
		tags: [
			"amateur",
			"anal",
			"bondage",
			"cosplay",
			"creampie",
			"double penetration",
			"feet",
			"gangbang",
			"pov",
			"role play",
			"threesome",
			"vr"
		]
	},
	{
		label: "People & regions",
		tags: [
			"asian",
			"bbw",
			"ebony",
			"japanese",
			"latina",
			"mature",
			"milf",
			"transgender",
			"verified amateurs"
		]
	},
	{
		label: "Formats & live",
		tags: [
			"animation",
			"hentai",
			"interactive",
			"live",
			"solo female",
			"virtual reality",
			"webcam"
		]
	},
	{
		label: "Kink & power",
		tags: [
			"bdsm",
			"cuckold",
			"femdom",
			"pegging",
			"roleplay",
			"strap on",
			"taboo"
		]
	}
];
var REDDIT_SOURCE_STORAGE_KEY = "reelcase.adult-reddit-sources.v1";
var FETISH_EXPLORER_TABS = [
	{
		id: "topics",
		label: "Browse topics",
		hint: "Choose an interest and pull it"
	},
	{
		id: "sources",
		label: "Pull sources",
		hint: "Set the provider mix"
	},
	{
		id: "reddit",
		label: "Reddit list",
		hint: "Review saved communities"
	},
	{
		id: "interests",
		label: "For you",
		hint: "Use hearts and ranked signals"
	}
];
function fetishTopicKey(tag) {
	return tag.trim().toLowerCase().replace(/^fetish-/, "").replace(/-/g, " ");
}
function fetishTagLabel(tag) {
	return fetishTopicKey(tag).replace(/\s+/g, " ");
}
function tagSearchTerms(value) {
	return value.trim().toLowerCase().replace(/^#/, "").replace(/^(?:fetish|genre|meta|creator|source|provider|sub)-/, "").replace(/[-_]+/g, " ").split(/\s+/).filter((term) => term.length > 0);
}
function tagMatchesSearch(tag, query) {
	const terms = tagSearchTerms(query);
	if (!terms.length) return true;
	const searchable = tag.toLowerCase().replace(/^(?:fetish|genre|meta|creator|source|provider|sub)-/, "").replace(/[-_]+/g, " ");
	return terms.every((term) => searchable.includes(term));
}
function pullSourceSelectionLabel(providers) {
	if (providers === "all") return "All available sources";
	return PROVIDER_CHOICES.find((choice) => JSON.stringify(choice.id) === JSON.stringify(providers))?.label ?? `${providers.length} selected sources`;
}
function readRedditSourceSettings() {
	try {
		const raw = JSON.parse(localStorage.getItem(REDDIT_SOURCE_STORAGE_KEY) ?? "[]");
		if (!Array.isArray(raw)) return [];
		const seen = /* @__PURE__ */ new Set();
		const settings = [];
		for (const item of raw.slice(0, 120)) {
			const row = item && typeof item === "object" ? item : {};
			const subreddit = String(row.subreddit ?? "").trim().replace(/^r\//i, "");
			if (!/^[a-z0-9_]{3,48}$/i.test(subreddit) || seen.has(subreddit.toLowerCase())) continue;
			seen.add(subreddit.toLowerCase());
			const priority = Number(row.priority);
			settings.push({
				subreddit,
				priority: priority >= 3 ? 3 : priority <= 1 ? 1 : 2,
				hidden: Boolean(row.hidden),
				favorite: Boolean(row.favorite)
			});
		}
		return settings;
	} catch {
		return [];
	}
}
/**
* A dedicated Adult interest browser. This intentionally owns only the topic
* selection and pull controls: source-list preferences remain shared with
* Adult discovery, while the main catalog stays free to render its rails.
*/
function AdultFetishExplorer({ onSelectedTag }) {
	const searchAdultFeed = useLibrary((s) => s.searchAdultFeed);
	const remoteBusy = useLibrary((s) => s.remoteBusy);
	const setSource = useLibrary((s) => s.setSource);
	const explorerAdultVideos = useLibrary(useShallow(selectAdultRemote));
	const explorerTags = useLibrary((s) => s.tags);
	const explorerFavorites = useLibrary((s) => s.favorites);
	const explorerLikes = useLibrary((s) => s.likes);
	const explorerCameCounts = useLibrary((s) => s.cameCounts);
	const explorerViewCounts = useLibrary((s) => s.viewCounts);
	const [providers, setProviders] = (0, import_react.useState)("all");
	const [order, setOrder] = (0, import_react.useState)("top-weekly");
	const [query, setQuery] = (0, import_react.useState)("");
	const [showAll, setShowAll] = (0, import_react.useState)(false);
	const [pullLimit, setPullLimit] = (0, import_react.useState)(LIBRARY_LIMITS.adultInteractiveVideosPerPull);
	const [activeTab, setActiveTab] = (0, import_react.useState)("topics");
	const [redditSourceRevision, setRedditSourceRevision] = (0, import_react.useState)(0);
	const [feedbackRevision, setFeedbackRevision] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		try {
			const saved = Number(localStorage.getItem("reelcase.adult-pull-limit") ?? LIBRARY_LIMITS.adultInteractiveVideosPerPull);
			setPullLimit([
				240,
				480,
				800
			].includes(saved) ? saved : LIBRARY_LIMITS.adultInteractiveVideosPerPull);
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		const refresh = () => setFeedbackRevision((revision) => revision + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	const redditSourceSettings = (0, import_react.useMemo)(() => readRedditSourceSettings(), [redditSourceRevision]);
	const savedRedditSources = (0, import_react.useMemo)(() => {
		const merged = /* @__PURE__ */ new Map();
		for (const subreddit of ADULT_REDDIT_SUBS) merged.set(subreddit.toLowerCase(), {
			subreddit,
			priority: 2
		});
		for (const source of redditSourceSettings) merged.set(source.subreddit.toLowerCase(), source);
		return [...merged.values()].filter((source) => !source.hidden).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.priority - a.priority || a.subreddit.localeCompare(b.subreddit));
	}, [redditSourceSettings]);
	const favoriteRedditSources = (0, import_react.useMemo)(() => savedRedditSources.filter((source) => source.favorite), [savedRedditSources]);
	const hiddenRedditSources = (0, import_react.useMemo)(() => redditSourceSettings.filter((source) => source.hidden), [redditSourceSettings]);
	const rankedInterests = (0, import_react.useMemo)(() => rankAdultTags(explorerAdultVideos, {
		tags: explorerTags,
		favorites: explorerFavorites,
		likes: explorerLikes,
		cameCounts: explorerCameCounts,
		viewCounts: explorerViewCounts,
		ratingOf: getRating,
		tagIsHearted: (tag) => tagIsLiked(tag) || tagIsLiked(fetishTopicKey(tag)),
		tagHasHeartHistory: (tag) => tagHasHeartHistory(tag) || tagHasHeartHistory(fetishTopicKey(tag))
	}, 48).filter((row) => row.tag.startsWith("fetish-") || ADULT_CURATED_FETISH_TAGS.includes(fetishTopicKey(row.tag))), [
		explorerAdultVideos,
		explorerCameCounts,
		explorerFavorites,
		explorerLikes,
		explorerTags,
		explorerViewCounts,
		feedbackRevision
	]);
	const historicInterestTags = (0, import_react.useMemo)(() => {
		const knownCuratedTags = new Set(ADULT_CURATED_FETISH_TAGS.map(fetishTopicKey));
		const rankedTags = new Set(rankedInterests.map((row) => fetishTopicKey(row.tag)));
		return getHeartedTagHistory().map(fetishTopicKey).filter((tag, index, all) => knownCuratedTags.has(tag) && !rankedTags.has(tag) && all.indexOf(tag) === index);
	}, [feedbackRevision, rankedInterests]);
	const matchingFetishes = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return ADULT_CURATED_FETISH_TAGS.filter((tag) => !needle || tag.includes(needle));
	}, [query]);
	const pullTopic = (topic) => {
		if (remoteBusy) return;
		const normalized = fetishSearchQuery(topic);
		const selectedTag = `fetish-${normalized.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`;
		const usesReddit = providers === "all" || providers.includes("reddit");
		onSelectedTag?.(selectedTag);
		searchAdultFeed(normalized, order, {
			page: 1,
			maxVideos: pullLimit,
			providers,
			...usesReddit && savedRedditSources.length ? { redditSources: savedRedditSources } : {}
		}).then((count) => toast.success(count ? `Loaded ${count.toLocaleString()} for #${topic}` : `No titles found for #${topic}`)).catch((error) => toast.error(error instanceof Error ? error.message : `Could not pull #${topic}.`));
	};
	const pullSavedRedditSources = () => {
		if (remoteBusy) return;
		if (!savedRedditSources.length) {
			toast.message("No active Reddit communities are saved yet.");
			return;
		}
		searchAdultFeed("all", order, {
			page: 1,
			maxVideos: pullLimit,
			providers: ["reddit"],
			redditSources: savedRedditSources
		}).then((count) => toast.success(count ? `Refreshed ${count.toLocaleString()} titles from your Reddit list` : "No new titles from your saved Reddit list")).catch((error) => toast.error(error instanceof Error ? error.message : "Could not refresh your saved Reddit list."));
	};
	const openRedditSourceManager = () => {
		try {
			localStorage.setItem("reelcase.adult-discovery-collapsed", "false");
		} catch {}
		setSource("adults");
	};
	const toggleInterestHeart = (tag) => {
		toggleTagLike(fetishTopicKey(tag));
		setFeedbackRevision((revision) => revision + 1);
	};
	const topics = query.trim() || showAll ? matchingFetishes : [];
	const usesReddit = providers === "all" || providers.includes("reddit");
	const heartedRankedInterests = rankedInterests.filter((row) => tagIsLiked(row.tag) || tagIsLiked(fetishTopicKey(row.tag)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-6 rounded-xl bg-elevated p-5 shadow-border",
		"aria-labelledby": "fetish-explorer-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Adult interests"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						id: "fetish-explorer-title",
						className: "mt-2 font-display text-3xl text-fg sm:text-4xl",
						children: "Fetish Explorer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
						children: "A dedicated Adult topic workspace, organized like Movie Topics. Browse what to pull, set the source mix, review your Reddit list, and keep the personal interests that should lead future recommendations."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setSource("adults"),
						children: "Open Adult browse"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setActiveTab("sources"),
						children: "Source mix"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg border border-border bg-bg/35 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Topic pull composer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted",
							children: [pullSourceSelectionLabel(providers), usesReddit ? ` · ${savedRedditSources.length} saved Reddit communities` : ""]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: PROVIDER_CHOICES.map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: JSON.stringify(providers) === JSON.stringify(choice.id) ? "default" : "secondary",
							onClick: () => setProviders(choice.id),
							children: choice.label
						}, choice.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-2 sm:flex-row sm:items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: query,
									onChange: (event) => setQuery(event.target.value),
									onKeyDown: (event) => {
										if (event.key === "Enter" && query.trim()) pullTopic(query);
									},
									placeholder: "Find a fetish, format, or custom topic",
									className: "pl-9",
									"aria-label": "Find a fetish to pull"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: ORDERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: order === item.id ? "default" : "secondary",
									onClick: () => setOrder(item.id),
									children: item.label
								}, item.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: remoteBusy || !query.trim(),
								onClick: () => pullTopic(query),
								children: remoteBusy ? "Pulling…" : "Pull this topic"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted",
						children: [
							providers === "all" ? "Every available provider is selected." : `${providers.length} provider${providers.length === 1 ? "" : "s"} selected.`,
							" Reddit uses ",
							savedRedditSources.length,
							" saved community",
							savedRedditSources.length === 1 ? "" : "ies",
							" when included."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "tablist",
				"aria-label": "Fetish Explorer sections",
				className: "mt-5 flex gap-1 overflow-x-auto border-b border-border pb-px",
				children: FETISH_EXPLORER_TABS.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					id: `fetish-explorer-tab-${tab.id}`,
					role: "tab",
					"aria-selected": activeTab === tab.id,
					"aria-controls": `fetish-explorer-panel-${tab.id}`,
					size: "sm",
					variant: activeTab === tab.id ? "default" : "ghost",
					className: "shrink-0",
					title: tab.hint,
					onClick: () => setActiveTab(tab.id),
					children: tab.label
				}, tab.id))
			}),
			activeTab === "topics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id: "fetish-explorer-panel-topics",
				role: "tabpanel",
				"aria-labelledby": "fetish-explorer-tab-topics",
				children: [!query.trim() && !showAll ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4",
					children: FETISH_EXPLORER_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-surface p-4 shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-fg",
							children: group.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-1.5",
							children: group.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "h-8 px-2 text-xs",
								variant: "secondary",
								disabled: remoteBusy,
								onClick: () => pullTopic(tag),
								children: ["#", tag]
							}, tag))
						})]
					}, group.label))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [topics.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: remoteBusy,
						onClick: () => pullTopic(tag),
						children: ["Pull #", tag]
					}, tag)), !topics.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No curated topic matches that search. You can still pull the exact text above."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					size: "sm",
					variant: "ghost",
					onClick: () => setShowAll((value) => !value),
					children: showAll ? "Show topic groups" : `Browse all ${ADULT_CURATED_FETISH_TAGS.length} topics`
				})]
			}),
			activeTab === "sources" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id: "fetish-explorer-panel-sources",
				role: "tabpanel",
				"aria-labelledby": "fetish-explorer-tab-sources",
				className: "mt-5 rounded-lg border border-border bg-bg/35 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Pull source plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-lg font-medium text-fg",
						children: "Use the same source mix for every topic pull"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-3xl text-sm leading-6 text-muted",
						children: "The composer above is always live. Pick a broad mix for variety, or isolate video, live, Reddit, photo, or one provider before returning to Browse topics."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-surface p-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Selected mix"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm font-medium text-fg",
									children: pullSourceSelectionLabel(providers)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-surface p-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Catalog pull size"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm font-medium text-fg",
									children: [
										"Up to ",
										pullLimit.toLocaleString(),
										" titles"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-surface p-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Reddit scope"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm font-medium text-fg",
									children: usesReddit ? `${savedRedditSources.length} saved communities` : "Not included"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => setActiveTab("topics"),
								children: "Choose a topic with this mix"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => setActiveTab("reddit"),
								children: "Review Reddit communities"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setSource("adults"),
								children: "Open full Adult discovery"
							})
						]
					})
				]
			}),
			activeTab === "reddit" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id: "fetish-explorer-panel-reddit",
				role: "tabpanel",
				"aria-labelledby": "fetish-explorer-tab-reddit",
				className: "mt-5 rounded-lg border border-border bg-bg/35 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Saved Reddit sources"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-lg font-medium text-fg",
								children: "Your community list feeds photo, GIF, video, and comments pulls"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-3xl text-sm leading-6 text-muted",
								children: "Favorites and high-priority communities lead a Reddit pull. Hidden communities remain stored so you can restore them later."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => setRedditSourceRevision((revision) => revision + 1),
								children: "Refresh saved list"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: openRedditSourceManager,
								children: "Manage list in Adult discovery"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-surface p-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Active"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-lg font-medium text-fg",
									children: savedRedditSources.length
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-surface p-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Favorites first"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-lg font-medium text-fg",
									children: favoriteRedditSources.length
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-surface p-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Stored but hidden"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-lg font-medium text-fg",
									children: hiddenRedditSources.length
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [savedRedditSources.slice(0, 18).map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-surface px-3 py-1.5 text-xs text-muted shadow-border",
							children: [
								source.favorite ? "★ " : "",
								"r/",
								source.subreddit,
								" · ",
								source.priority === 3 ? "high" : source.priority === 2 ? "normal" : "low"
							]
						}, source.subreddit)), !savedRedditSources.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No active saved communities yet. Add or restore them in Adult discovery."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: usesReddit ? "default" : "secondary",
								onClick: () => setProviders(["reddit"]),
								children: "Use Reddit for the next topic"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: remoteBusy || !savedRedditSources.length,
								onClick: pullSavedRedditSources,
								children: remoteBusy ? "Pulling…" : "Refresh active Reddit sources"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setActiveTab("topics"),
								children: "Choose a Reddit topic"
							})
						]
					})
				]
			}),
			activeTab === "interests" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id: "fetish-explorer-panel-interests",
				role: "tabpanel",
				"aria-labelledby": "fetish-explorer-tab-interests",
				className: "mt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-bg/35 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Personal signals"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-lg font-medium text-fg",
								children: "For you: hearted and steadily supported interests"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-3xl text-sm leading-6 text-muted",
								children: "A heart permanently records an interest in local history. Current hearts lead Adult recommendations; ranked topics also need repeat catalog support, so a single title cannot dominate this list."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md bg-surface p-3 shadow-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: "Hearted now"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-lg font-medium text-fg",
											children: heartedRankedInterests.length
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md bg-surface p-3 shadow-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: "Remembered interests"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-lg font-medium text-fg",
											children: historicInterestTags.length + heartedRankedInterests.length
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md bg-surface p-3 shadow-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: "Ranked catalog topics"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-lg font-medium text-fg",
											children: rankedInterests.length
										})]
									})
								]
							})
						]
					}),
					heartedRankedInterests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Hearted now"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: heartedRankedInterests.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex overflow-hidden rounded-md bg-surface shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: remoteBusy,
									onClick: () => pullTopic(fetishTagLabel(row.tag)),
									children: ["Pull #", fetishTagLabel(row.tag)]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									"aria-label": `Remove heart from ${fetishTagLabel(row.tag)}`,
									onClick: () => toggleInterestHeart(row.tag),
									children: "★"
								})]
							}, row.tag))
						})]
					}),
					historicInterestTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Kept in history"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "These were hearted before and stay available even if their current catalog count drops away."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: historicInterestTags.slice(0, 18).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex overflow-hidden rounded-md bg-surface shadow-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: remoteBusy,
										onClick: () => pullTopic(tag),
										children: ["Pull #", tag]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										"aria-label": `Heart ${tag} again`,
										onClick: () => toggleInterestHeart(tag),
										children: "♡"
									})]
								}, tag))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Ranked from Adult library"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Stabilized across repeat titles, ratings, saves, likes, views, and hearts."
							})]
						}), rankedInterests.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: rankedInterests.slice(0, 24).map((row) => {
								const hearted = tagIsLiked(row.tag) || tagIsLiked(fetishTopicKey(row.tag));
								const label = fetishTagLabel(row.tag);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex overflow-hidden rounded-md bg-surface shadow-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: hearted ? "default" : "secondary",
										disabled: remoteBusy,
										title: `score ${Math.round(row.score)} · ${row.count} catalog titles`,
										onClick: () => pullTopic(label),
										children: [
											hearted ? "★ " : "",
											"Pull #",
											label,
											" · ",
											row.count
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										"aria-label": `${hearted ? "Remove heart from" : "Heart"} ${label}`,
										onClick: () => toggleInterestHeart(row.tag),
										children: hearted ? "★" : "☆"
									})]
								}, row.tag);
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Pull a few topics or tag saved Adult titles to build a ranked interest view."
						})]
					})
				]
			})
		]
	});
}
function SiteCard({ name, href, copy, embeds, badge, sourceId, compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		target: "_blank",
		rel: "noreferrer",
		className: `group rounded-lg bg-surface shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover ${compact ? "p-2.5" : "p-4"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: compact ? "text-sm font-medium text-fg" : "font-display text-xl text-fg",
					children: name
				}), (embeds || badge) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-accent uppercase",
					children: badge ?? "Embeds"
				})]
			}),
			!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: copy
			}),
			sourceId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[10px] tracking-wide text-subtle uppercase",
				children: ["source tag · #", adultSourceTag(sourceId)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: `${compact ? "mt-1.5 text-xs" : "mt-3 text-sm"} inline-flex items-center gap-1.5 font-medium text-accent`,
				children: ["Open site ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
			})
		]
	});
}
function AdultPanel({ showMilestones = false, autoPull = true, sourceFilter = "all", tagFilter: tagFilterProp, onSourceFilter, onTagFilter }) {
	const searchAdultFeed = useLibrary((s) => s.searchAdultFeed);
	const remoteBusy = useLibrary((s) => s.remoteBusy);
	const importProgress = useLibrary((s) => s.importProgress);
	const adultPullStatus = useLibrary((s) => s.adultPullStatus);
	const setSource = useLibrary((s) => s.setSource);
	const tags = useLibrary((s) => s.tags);
	const adultVideos = useLibrary(useShallow(selectAdultRemote));
	const [query, setQuery] = (0, import_react.useState)("");
	const [order, setOrder] = (0, import_react.useState)("top-weekly");
	const [providers, setProviders] = (0, import_react.useState)("all");
	const [booted, setBooted] = (0, import_react.useState)(false);
	const [localTag, setLocalTag] = (0, import_react.useState)("all");
	const [facetQuery, setFacetQuery] = (0, import_react.useState)("");
	const deferredFacetQuery = (0, import_react.useDeferredValue)(facetQuery);
	const tagFilter = tagFilterProp ?? localTag;
	const setTagFilter = (tag) => {
		setLocalTag(tag);
		if (tag.startsWith("source-") || tag === "all") onSourceFilter?.(tag === "all" ? "all" : tag.replace(/^source-/, "").split("-")[0] ?? "all");
		onTagFilter?.(tag === "all" ? "All" : tag);
	};
	const [nextPage, setNextPage] = (0, import_react.useState)(2);
	const [starQuery, setStarQuery] = (0, import_react.useState)("");
	const [stars, setStars] = (0, import_react.useState)([]);
	const [starNote, setStarNote] = (0, import_react.useState)("");
	const [archiveLabel, setArchiveLabel] = (0, import_react.useState)("No saved archive depth yet — Pull catalog starts at page 1.");
	const [autoArchiveRounds, setAutoArchiveRounds] = (0, import_react.useState)(0);
	const [adultMaxVideos, setAdultMaxVideos] = (0, import_react.useState)(LIBRARY_LIMITS.adultInteractiveVideosPerPull);
	const [useCustomRedditSources, setUseCustomRedditSources] = (0, import_react.useState)(false);
	const [redditSources, setRedditSources] = (0, import_react.useState)([]);
	const [redditSourceInput, setRedditSourceInput] = (0, import_react.useState)("");
	const [redditSourceQuery, setRedditSourceQuery] = (0, import_react.useState)("");
	const [showAllRedditSources, setShowAllRedditSources] = (0, import_react.useState)(false);
	const [redditSourcesReady, setRedditSourcesReady] = (0, import_react.useState)(false);
	const [discoveryCollapsed, setDiscoveryCollapsed] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const load = () => {
			const saved = Number(localStorage.getItem("reelcase.adult-pull-limit") ?? LIBRARY_LIMITS.adultInteractiveVideosPerPull);
			setAdultMaxVideos([
				240,
				480,
				800
			].includes(saved) ? saved : LIBRARY_LIMITS.adultInteractiveVideosPerPull);
		};
		load();
		window.addEventListener("reelcase:adult-render-settings", load);
		return () => window.removeEventListener("reelcase:adult-render-settings", load);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = readRedditSourceSettings();
		setRedditSources(saved);
		setUseCustomRedditSources(true);
		setDiscoveryCollapsed(localStorage.getItem("reelcase.adult-discovery-collapsed") !== "false");
		setRedditSourcesReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!redditSourcesReady) return;
		try {
			localStorage.setItem(REDDIT_SOURCE_STORAGE_KEY, JSON.stringify(redditSources));
			localStorage.setItem(`${REDDIT_SOURCE_STORAGE_KEY}.enabled`, String(useCustomRedditSources));
		} catch {}
	}, [
		redditSources,
		redditSourcesReady,
		useCustomRedditSources
	]);
	(0, import_react.useEffect)(() => {
		if (!redditSourcesReady) return;
		try {
			localStorage.setItem("reelcase.adult-discovery-collapsed", String(discoveryCollapsed));
		} catch {}
	}, [discoveryCollapsed, redditSourcesReady]);
	const libraryRedditSources = (0, import_react.useMemo)(() => ADULT_REDDIT_SUBS.map((subreddit) => ({
		subreddit,
		priority: 2
	})), []);
	const selectedRedditSources = (0, import_react.useMemo)(() => {
		const merged = /* @__PURE__ */ new Map();
		for (const source of libraryRedditSources) merged.set(source.subreddit.toLowerCase(), source);
		for (const source of redditSources) merged.set(source.subreddit.toLowerCase(), source);
		return [...merged.values()].filter((source) => !source.hidden).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.priority - a.priority || a.subreddit.localeCompare(b.subreddit));
	}, [libraryRedditSources, redditSources]);
	const redditSourceRows = (0, import_react.useMemo)(() => {
		const overrides = new Map(redditSources.map((source) => [source.subreddit.toLowerCase(), source]));
		const all = new Map(libraryRedditSources.map((source) => [source.subreddit.toLowerCase(), source]));
		for (const source of redditSources) all.set(source.subreddit.toLowerCase(), {
			...all.get(source.subreddit.toLowerCase()) ?? source,
			...source
		});
		const needle = redditSourceQuery.trim().toLowerCase();
		return [...all.values()].filter((source) => !needle || source.subreddit.toLowerCase().includes(needle)).sort((a, b) => Number(b.favorite) - Number(a.favorite) || Number(a.hidden) - Number(b.hidden) || b.priority - a.priority || a.subreddit.localeCompare(b.subreddit)).map((source) => ({
			...source,
			isLibrary: libraryRedditSources.some((row) => row.subreddit.toLowerCase() === source.subreddit.toLowerCase()),
			hasOverride: overrides.has(source.subreddit.toLowerCase())
		}));
	}, [
		libraryRedditSources,
		redditSourceQuery,
		redditSources
	]);
	const redditPullOptions = (0, import_react.useMemo)(() => useCustomRedditSources && selectedRedditSources.length ? { redditSources: selectedRedditSources } : {}, [selectedRedditSources, useCustomRedditSources]);
	const sourceCounts = (0, import_react.useMemo)(() => countAdultBySource(adultVideos), [adultVideos]);
	const sourceFacets = (0, import_react.useMemo)(() => ADULT_SOURCE_FILTERS.filter((row) => row.id !== "all").map((row) => [row.id, sourceCounts[row.id] ?? 0]), [sourceCounts]);
	const [facetsReady, setFacetsReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setFacetsReady(false);
		let cancelled = false;
		const ready = () => {
			if (!cancelled) setFacetsReady(true);
		};
		const cancelSchedule = scheduleBackgroundWork(ready, {
			timeoutMs: 1200,
			fallbackDelayMs: 200
		});
		return () => {
			cancelled = true;
			cancelSchedule();
		};
	}, [adultVideos.length]);
	const creatorFacets = (0, import_react.useMemo)(() => {
		if (discoveryCollapsed || !facetsReady) return [];
		const counts = /* @__PURE__ */ new Map();
		for (const video of adultVideos) for (const tag of tags[video.id] ?? []) if (tag.startsWith("creator-")) counts.set(tag, (counts.get(tag) ?? 0) + 1);
		return [...counts.entries()].filter(([, count]) => count >= 1).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 16);
	}, [
		adultVideos,
		discoveryCollapsed,
		facetsReady,
		tags
	]);
	const fetishFacets = (0, import_react.useMemo)(() => {
		if (discoveryCollapsed || !facetsReady) return [];
		const counts = /* @__PURE__ */ new Map();
		for (const video of adultVideos) for (const tag of tags[video.id] ?? []) if (tag.startsWith("fetish-")) counts.set(tag, (counts.get(tag) ?? 0) + 1);
		return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 24);
	}, [
		adultVideos,
		discoveryCollapsed,
		facetsReady,
		tags
	]);
	const searchedTagFacets = (0, import_react.useMemo)(() => {
		if (!deferredFacetQuery.trim() || !facetsReady) return [];
		const counts = /* @__PURE__ */ new Map();
		for (const video of adultVideos) for (const tag of tags[video.id] ?? []) if (tagMatchesSearch(tag, deferredFacetQuery)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
		return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 30);
	}, [
		adultVideos,
		deferredFacetQuery,
		facetsReady,
		tags
	]);
	(0, import_react.useEffect)(() => {
		if (!autoPull || booted || !redditSourcesReady) return;
		setBooted(true);
		if (adultVideos.length >= LIBRARY_LIMITS.adultFastStartVideosPerPull) return;
		searchAdultFeed("all", "top-weekly", {
			providers: "all",
			maxVideos: adultMaxVideos,
			...redditPullOptions
		}).then((n) => {
			setNextPage(2);
			if (n) toast.success(`Loaded ${n.toLocaleString()} adult titles`);
		}).catch((err) => {
			toast.error(err instanceof Error ? err.message : "Could not load adult feed.");
		});
	}, [
		adultMaxVideos,
		autoPull,
		booted,
		adultVideos.length,
		redditPullOptions,
		redditSourcesReady,
		searchAdultFeed
	]);
	const refreshArchiveLabel = (q, ord) => {
		setArchiveLabel(adultArchiveDepthLabel(loadAdultArchiveCursors(q, ord)));
	};
	(0, import_react.useEffect)(() => {
		refreshArchiveLabel(query.trim() || "all", order);
	}, [
		query,
		order,
		adultVideos.length
	]);
	const runSearch = (append = false, resume = false) => {
		if (remoteBusy) {
			toast.message("A catalog pull is already running.");
			return;
		}
		const q = query.trim() || "all";
		const cursors = loadAdultArchiveCursors(q, order);
		const providerPages = resume ? Object.fromEntries(Object.entries(cursors).map(([provider, row]) => [provider, row.page])) : void 0;
		const page = append || resume ? resume ? 1 : nextPage : 1;
		searchAdultFeed(q, order, {
			page: resume ? 1 : page,
			maxVideos: adultMaxVideos,
			append: append || resume,
			providers,
			providerPages,
			...redditPullOptions
		}).then((n) => {
			setNextPage((resume ? Math.max(2, ...Object.values(cursors).map((c) => c.page)) : page) + 1);
			setTagFilter("all");
			refreshArchiveLabel(q, order);
			toast.success(n ? `${append || resume ? "Catalog now has" : "Loaded"} ${n.toLocaleString()} adult titles` : "No results");
		}).catch((err) => {
			toast.error(err instanceof Error ? err.message : "Search failed");
		});
	};
	const pullRedtubeCreator = (creator) => {
		const q = creator.trim();
		if (!q || remoteBusy) return;
		setProviders(["redtube"]);
		setQuery(q);
		searchAdultFeed(q, order, {
			providers: ["redtube"],
			maxVideos: LIBRARY_LIMITS.redtubeStarVideosPerPull
		}).then((n) => toast.success(n ? `Loaded ${n.toLocaleString()} for ${q}` : `No titles found for ${q}`)).catch((err) => toast.error(err instanceof Error ? err.message : `Could not pull ${q}.`));
	};
	const pullSavedRedditSources = () => {
		if (!selectedRedditSources.length || remoteBusy) return;
		setUseCustomRedditSources(true);
		setProviders(["reddit"]);
		searchAdultFeed("all", order, {
			page: 1,
			maxVideos: adultMaxVideos,
			providers: ["reddit"],
			redditSources: selectedRedditSources
		}).then((n) => toast.success(`Library Reddit list refreshed · ${n.toLocaleString()} catalog titles available`)).catch((err) => toast.error(err instanceof Error ? err.message : "Could not pull the library Reddit list."));
	};
	const pinRedditSource = () => {
		const subreddit = redditSourceInput.trim().replace(/^r\//i, "");
		if (!/^[a-z0-9_]{3,48}$/i.test(subreddit)) {
			toast.error("Enter a valid subreddit name.");
			return;
		}
		setRedditSources((current) => {
			if (current.find((row) => row.subreddit.toLowerCase() === subreddit.toLowerCase())) return current.map((row) => row.subreddit.toLowerCase() === subreddit.toLowerCase() ? {
				...row,
				hidden: false,
				favorite: true,
				priority: 3
			} : row);
			return [...current, {
				subreddit,
				priority: 2
			}];
		});
		setUseCustomRedditSources(true);
		setRedditSourceInput("");
	};
	(0, import_react.useEffect)(() => {
		if (!autoPull || !redditSourcesReady || remoteBusy || query.trim() || providers !== "all" || adultVideos.length >= LIBRARY_LIMITS.adultTargetCatalogVideos || autoArchiveRounds >= LIBRARY_LIMITS.adultAutoArchivePagesPerVisit) return;
		const timer = window.setTimeout(() => {
			setAutoArchiveRounds((rounds) => rounds + 1);
			runSearch(false, true);
		}, LIBRARY_LIMITS.adultAutoArchiveDelayMs);
		return () => window.clearTimeout(timer);
	}, [
		adultVideos.length,
		autoArchiveRounds,
		autoPull,
		order,
		providers,
		query,
		redditPullOptions,
		redditSourcesReady,
		remoteBusy
	]);
	const milestoneLinks = ADULT_MILESTONE_LINKS.filter((site) => site.href !== ADULT_CATEGORY_HUB.href);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6 flex flex-col gap-5",
		children: [showMilestones && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "rounded-xl bg-elevated shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Category hub"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg sm:text-3xl",
							children: "ThePornDude directory"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Collapse this section to keep the Adult catalog compact."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-muted",
						children: "Use ThePornDude as the main adult category map (tubes, cams, anime, games, niche lists). In-app playback comes from official public APIs below; other destinations stay as milestones with labeled source tags."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, {
							...ADULT_CATEGORY_HUB,
							badge: "Hub"
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "rounded-xl bg-elevated shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Adult sites"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg sm:text-3xl",
							children: "Embed-ready pull sources"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Collapse this section to focus on the catalog."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-muted",
						children: "Official public APIs: Eporner, RedTube, Chaturbate embeds, the MyFreeCams online list, Reddit public Atom RSS for curated 18+ subs, and Gelbooru-style booru JSON (Rule34 / Gelbooru / Realbooru / XBooru / TBIB / Hypnohub / e621). If one host errors, the others still fill the shelf."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: ADULT_EMBED_LINKS.map((site) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, { ...site }, site.name))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "rounded-xl bg-elevated shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Catalog milestones"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg",
							children: "Current reliability coverage"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Expand for the active work grouped by catalog area."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 border-t border-border px-5 pb-5 pt-4 sm:grid-cols-2 lg:grid-cols-3",
					children: [
						["Reddit media", "Saved community list, priority/favorite and hide controls, Atom pulls, Redgifs dual-source cards, and image recovery."],
						["Live rooms", "Chaturbate and MyFreeCams public room lists with live-only placement and provider diagnostics."],
						["Photos & tags", "Booru response-shape recovery, creator attribution, stable tag scoring, and permanent heart history."],
						["Catalog feedback", "Pull health explains loaded, empty, and failed providers; ratings rebuild the weekly streak from durable feedback."]
					].map(([title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md bg-surface p-3 shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-fg",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-5 text-muted",
							children: copy
						})]
					}, title))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "order-last rounded-xl bg-elevated shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Link-out destinations"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Optional directories grouped below the catalog · ",
							milestoneLinks.length,
							" sites."
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border px-4 pb-4 pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 flex size-9 items-center justify-center rounded-lg bg-surface text-accent shadow-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-2xl text-sm text-muted",
								children: "These sites do not expose a documented public discovery/embed API we can use without scraping or bypassing logins/paywalls. Realhub keeps them as milestones with source tags — open the official page in a new tab."
							}) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: ADULT_SOURCE_OPTIONS.filter((s) => !s.pull).slice(0, 36).map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: source.href,
								target: "_blank",
								rel: "noreferrer",
								className: "rounded-full bg-surface px-3 py-1 text-xs text-muted shadow-border hover:text-fg",
								children: [
									"#",
									adultSourceTag(source.id),
									" · ",
									source.label
								]
							}, source.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-5",
							children: [
								["cam", "Cams / interactive"],
								["vr", "VR"],
								["tube", "Tubes / aggregators / hubs"],
								["games", "Games"],
								["comic", "Comics"],
								["anime", "Anime / hentai"],
								["community", "Community / Reddit link-outs"],
								["directory", "Stores / directories"],
								["short", "Short-form"],
								["review", "Review / niche hubs"],
								["voyeur", "Live voyeur"],
								["blog", "Blogs"],
								["ai", "AI stories"],
								["extreme", "Extreme (18+)"],
								["download", "Downloads (link-out)"],
								["torrent", "Torrents (link-out)"],
								["feet", "Feet"],
								["cosplay", "Cosplay"],
								["celeb", "Celeb / film nudes"],
								["manhwa", "Manhwa"]
							].map(([group, label]) => {
								const sites = milestoneLinks.filter((site) => site.group === group);
								if (!sites.length) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
									children: sites.map((site, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, {
										...site,
										compact: true,
										badge: group === "cam" || group === "voyeur" ? "Cam/chat" : group === "download" || group === "torrent" ? "Link-out only" : group === "community" || group === "blog" ? "Link-out" : "Milestone"
									}, `${site.sourceId ?? site.name}-${site.href}-${index}`))
								})] }, group);
							})
						})
					]
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-xl bg-elevated p-5 shadow-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Remote pull"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg sm:text-3xl",
						children: "Adult discovery"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Saved source scope, provider health, tags, and catalog controls."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					"aria-expanded": !discoveryCollapsed,
					"aria-label": `${discoveryCollapsed ? "Expand" : "Minimize"} Adult discovery`,
					onClick: () => setDiscoveryCollapsed((collapsed) => !collapsed),
					children: [discoveryCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" }), discoveryCollapsed ? "Expand" : "Minimize"]
				})]
			}), !discoveryCollapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-2xl text-sm text-muted",
						children: [
							"Failover-friendly pulls via",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "https://www.eporner.com/api/v2/",
								target: "_blank",
								rel: "noreferrer",
								className: "text-accent hover:text-fg",
								children: "Eporner API v2"
							}),
							" ",
							"and",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "https://api.redtube.com/",
								target: "_blank",
								rel: "noreferrer",
								className: "text-accent hover:text-fg",
								children: "RedTube webmaster API"
							}),
							" ",
							"(up to ",
							LIBRARY_LIMITS.adultInteractiveVideosPerPull.toLocaleString(),
							" titles per pull). Every pulled item always gets a filterable ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-fg",
								children: "source-*"
							}),
							" tag, plus",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-fg",
								children: "creator-*"
							}),
							" when a username/channel/owner is known, API keywords, and curated fetish tokens mined from titles/descriptions. Cards open the same preview + in-app play window as YouTube and Twitch. Use I cummed to it on a card or in the player to keep a private local count that never leaves this browser."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: PROVIDER_CHOICES.map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: JSON.stringify(providers) === JSON.stringify(choice.id) ? "default" : "secondary",
							onClick: () => setProviders(choice.id),
							children: choice.label
						}, choice.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4 rounded-md border border-border bg-bg/35 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer text-xs font-medium text-fg",
								children: "Reddit photo sources · custom list and priority"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: [
									"The saved library list is active by default. Add a community below to pin it and set its priority; switch to curated rotation only when you want discovery to rotate evenly. Each imported Reddit photo and video receives both",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "mx-1 text-fg",
										children: "source-reddit-*"
									}),
									" and ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "text-fg",
										children: "sub-*"
									}),
									" tags for filtering."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: useCustomRedditSources ? "default" : "secondary",
										onClick: () => setUseCustomRedditSources((enabled) => !enabled),
										children: useCustomRedditSources ? "Use curated rotation" : "Use library source list"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: useCustomRedditSources ? `${selectedRedditSources.length} saved communities · priority overrides first` : "Curated rotation active"
									}),
									selectedRedditSources.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: remoteBusy,
										onClick: pullSavedRedditSources,
										children: remoteBusy ? "Pulling library list…" : `Pull my ${selectedRedditSources.length} sources`
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-col gap-2 sm:flex-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: redditSourceInput,
									onChange: (event) => setRedditSourceInput(event.target.value),
									onKeyDown: (event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											pinRedditSource();
										}
									},
									placeholder: "Pin a subreddit, e.g. ExampleSub",
									"aria-label": "Pin Reddit source"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: pinRedditSource,
									children: "Pin source"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-md border border-border bg-bg/35 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs font-medium text-fg",
											children: [
												"Saved library communities · ",
												selectedRedditSources.length,
												" active"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted",
											children: "Favorites pull first · hidden sources stay saved"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: redditSourceQuery,
										onChange: (event) => setRedditSourceQuery(event.target.value),
										placeholder: "Find a saved community…",
										className: "mt-2",
										"aria-label": "Find saved Reddit community"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 space-y-2",
										children: redditSourceRows.slice(0, showAllRedditSources || redditSourceQuery.trim() ? redditSourceRows.length : 18).map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-1.5 rounded bg-surface px-2 py-1.5 text-xs shadow-border",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: `mr-auto ${source.hidden ? "text-subtle line-through" : "text-fg"}`,
													children: [
														"r/",
														source.subreddit,
														source.isLibrary ? " · library" : " · custom"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													className: "h-6 px-1.5 text-[10px]",
													variant: source.favorite ? "default" : "ghost",
													onClick: () => setRedditSources((current) => {
														const row = current.find((item) => item.subreddit.toLowerCase() === source.subreddit.toLowerCase());
														return row ? current.map((item) => item === row ? {
															...item,
															favorite: !item.favorite,
															hidden: false,
															priority: !item.favorite ? 3 : item.priority
														} : item) : [...current, {
															subreddit: source.subreddit,
															priority: 3,
															favorite: true
														}];
													}),
													children: source.favorite ? "★ Favorite" : "☆ Favorite"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													className: "h-6 px-1.5 text-[10px]",
													variant: "ghost",
													onClick: () => setRedditSources((current) => {
														const row = current.find((item) => item.subreddit.toLowerCase() === source.subreddit.toLowerCase());
														return row ? current.map((item) => item === row ? {
															...item,
															hidden: !item.hidden
														} : item) : [...current, {
															subreddit: source.subreddit,
															priority: 2,
															hidden: true
														}];
													}),
													children: source.hidden ? "Show" : "Hide"
												}),
												[
													3,
													2,
													1
												].map((priority) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													className: "h-6 px-1.5 text-[10px]",
													variant: source.priority === priority ? "default" : "ghost",
													onClick: () => setRedditSources((current) => {
														const row = current.find((item) => item.subreddit.toLowerCase() === source.subreddit.toLowerCase());
														return row ? current.map((item) => item === row ? {
															...item,
															priority,
															hidden: false
														} : item) : [...current, {
															subreddit: source.subreddit,
															priority
														}];
													}),
													children: priority === 3 ? "High" : priority === 2 ? "Normal" : "Low"
												}, priority)),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													className: "h-6 px-1.5 text-[10px]",
													variant: "ghost",
													title: source.isLibrary ? "Clear saved preference and restore library defaults" : "Remove custom community",
													onClick: () => setRedditSources((current) => current.filter((item) => item.subreddit.toLowerCase() !== source.subreddit.toLowerCase())),
													children: source.isLibrary ? "Reset" : "Remove"
												})
											]
										}, source.subreddit))
									}),
									redditSourceRows.length > 18 && !redditSourceQuery.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "mt-2",
										onClick: () => setShowAllRedditSources((shown) => !shown),
										children: showAllRedditSources ? "Show fewer communities" : `Show all ${redditSourceRows.length} communities`
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-bg/35 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Topic pulls"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Choose a fetish and provider combination from the dedicated Explorer, then return here to browse its tagged results."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setSource("adult-fetishes"),
							children: "Open Fetish Explorer"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: query,
									onChange: (e) => setQuery(e.target.value),
									onKeyDown: (e) => {
										if (e.key === "Enter") runSearch(false);
									},
									placeholder: "Search adult feeds (empty = all)",
									className: "pl-9",
									"aria-label": "Search adult feed"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: ORDERS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: order === o.id ? "default" : "secondary",
									onClick: () => setOrder(o.id),
									children: o.label
								}, o.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => runSearch(false),
								disabled: remoteBusy,
								children: [remoteBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Pull catalog"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => runSearch(true),
								disabled: remoteBusy || !adultVideos.length,
								children: "Load more"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => runSearch(false, true),
								disabled: remoteBusy,
								title: "Resume each provider from its saved archive cursor",
								children: "Continue archive"
							})
						]
					}),
					autoPull && autoArchiveRounds > 0 && adultVideos.length < LIBRARY_LIMITS.adultTargetCatalogVideos && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: [
							"Background archive catch-up · ",
							autoArchiveRounds,
							"/",
							LIBRARY_LIMITS.adultAutoArchivePagesPerVisit,
							" saved cursor passes this visit · ",
							adultVideos.length.toLocaleString(),
							"/",
							LIBRARY_LIMITS.adultTargetCatalogVideos.toLocaleString(),
							" title target."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-3 rounded-md border border-border bg-bg/35 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer text-xs font-medium text-fg",
								children: "Provider adapter platform · active and planned sources"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: "Each adapter needs a documented public API, public feed, or permitted embed before it can enter the catalog. This keeps unsupported sites as safe link-outs until their source contract is implemented."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: ADULT_PROVIDER_ADAPTERS.map((adapter) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-xs bg-elevated px-2 py-1 text-xs text-muted",
									children: [
										adapter.label,
										" · ",
										adapter.status,
										" · ",
										adapter.capabilities.join(", ")
									]
								}, adapter.id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-md bg-bg/40 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "RedTube creator search"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: starQuery,
									onChange: (event) => setStarQuery(event.target.value),
									placeholder: "Star or creator name",
									className: "max-w-xs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: remoteBusy,
									onClick: () => {
										const q = starQuery.trim();
										if (!q) return;
										setProviders(["redtube"]);
										setQuery(q);
										(async () => {
											try {
												const result = await searchRedtubeStars({ data: {
													query: q,
													page: 1
												} });
												setStars(result.stars);
												setStarNote(result.note);
											} catch (err) {
												setStarNote(err instanceof Error ? err.message : "Star list unavailable.");
											}
										})();
										pullRedtubeCreator(q);
									},
									children: "Search creator"
								})]
							}),
							starNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: starNote
							}),
							stars.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: stars.map((star) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										setStarQuery(star.name);
										setProviders(["redtube"]);
										setQuery(star.name);
										pullRedtubeCreator(star.name);
									},
									children: star.name
								}, star.name))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted",
						children: [
							"Durable adult catalog: ",
							adultVideos.length.toLocaleString(),
							" titles · provider pages append to this library across reloads",
							importProgress ? ` · ${importProgress.label}` : ""
						]
					}),
					adultPullStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-md border border-border bg-bg/35 p-3",
						"aria-live": "polite",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Latest pull health"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: adultPullStatus.note
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: adultPullStatus.diagnostics.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									title: row.detail,
									className: `rounded-full px-2.5 py-1 text-xs ${row.status === "loaded" ? "bg-accent/15 text-accent" : row.status === "empty" ? "bg-surface text-muted" : "bg-destructive/15 text-destructive"}`,
									children: [
										row.provider,
										" · ",
										row.status === "loaded" ? `${row.titles} loaded` : row.status,
										" · ",
										row.detail
									]
								}, `${row.provider}:${row.status}:${row.detail}`))
							})
						]
					}),
					useCustomRedditSources && redditSources.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							"Reddit pull scope · ",
							selectedRedditSources.length,
							" saved communities · ",
							redditSources.length,
							" priority override",
							redditSources.length === 1 ? "" : "s",
							" · photos, animated GIFs, video posts, and live comment threads stay attached to each post."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-accent",
						children: archiveLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-md border border-border bg-bg/35 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								htmlFor: "adult-tag-search",
								children: "Find any saved Adult tag"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mt-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "adult-tag-search",
										value: facetQuery,
										onChange: (event) => setFacetQuery(event.target.value),
										placeholder: "Try a creator, source, or interest — e.g. role play",
										className: "pl-9 pr-16",
										"aria-describedby": "adult-tag-search-help"
									}),
									facetQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "absolute top-1/2 right-1 -translate-y-1/2",
										onClick: () => setFacetQuery(""),
										children: "Clear"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								id: "adult-tag-search-help",
								className: "mt-2 text-xs text-muted",
								children: "Searches every saved provider, creator, subreddit, and interest tag. Pick a match to filter this desk in place."
							}),
							facetQuery.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: searchedTagFacets.length ? `${searchedTagFacets.length} matching tag${searchedTagFacets.length === 1 ? "" : "s"}` : facetsReady ? "No saved tags match yet." : "Preparing saved tags…"
								}), searchedTagFacets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: searchedTagFacets.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: tagFilter === tag ? "default" : "secondary",
										onClick: () => setTagFilter(tag),
										children: [
											"#",
											tag,
											" · ",
											count
										]
									}, tag))
								})]
							})
						]
					}),
					sourceFacets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Source tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Every pull stamps source-* so you can filter by provider (and booru host / subreddit when present)."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: (tagFilterProp ? sourceFilter : tagFilter) === "all" ? "default" : "secondary",
									onClick: () => {
										setTagFilter("all");
										onSourceFilter?.("all");
									},
									children: ["All sources · ", adultVideos.length]
								}), sourceFacets.map(([id, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: (tagFilterProp ? sourceFilter : tagFilter) === id || tagFilter === `source-${id}` ? "default" : "secondary",
									onClick: () => {
										onSourceFilter?.(id);
										setTagFilter(`source-${id}`);
									},
									children: [
										id,
										" · ",
										count
									]
								}, id))]
							})
						]
					}),
					creatorFacets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Creator tags"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: creatorFacets.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: tagFilter === tag ? "default" : "secondary",
								onClick: () => setTagFilter(tag),
								children: [
									"#",
									tag,
									" · ",
									count
								]
							}, tag))
						})]
					}),
					fetishFacets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Interest tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: fetishFacets.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: tagFilter === tag ? "default" : "secondary",
									onClick: () => setTagFilter(tag),
									children: [
										"#",
										tag,
										" · ",
										count
									]
								}, tag))
							}),
							tagFilter.toLowerCase() !== "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-accent",
									children: ["Selected #", tagFilter]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: remoteBusy,
									onClick: () => {
										const q = fetishSearchQuery(tagFilter.replace(/^fetish-/, "").replace(/^source-/, "").replace(/-/g, " "));
										setQuery(q);
										searchAdultFeed(q, order, {
											page: 1,
											maxVideos: LIBRARY_LIMITS.adultInteractiveVideosPerPull,
											providers,
											...redditPullOptions
										}).then((n) => toast.success(`Loaded ${n.toLocaleString()} for #${tagFilter}`));
									},
									children: ["Search providers for #", tagFilter]
								})]
							})
						]
					})
				]
			})]
		})]
	});
}
//#endregion
export { AdultFetishExplorer, AdultPanel };
