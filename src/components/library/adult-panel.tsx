import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Flag, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import {
  getHeartedTagHistory,
  getRating,
  tagHasHeartHistory,
  tagIsLiked,
  toggleTagLike,
} from "@/lib/media-feedback";
import {
  adultArchiveDepthLabel,
  loadAdultArchiveCursors,
} from "@/lib/videos/adult-archive-cursors";
import {
  ADULT_CATEGORY_HUB,
  ADULT_CURATED_FETISH_TAGS,
  ADULT_EMBED_LINKS,
  ADULT_FEATURED_FETISH_TAGS,
  ADULT_MILESTONE_LINKS,
  ADULT_REDDIT_SUBS,
  ADULT_SOURCE_OPTIONS,
  adultSourceTag,
  fetishSearchQuery,
  type AdultPullProvider,
} from "@/lib/videos/adult-sites";
import { ADULT_SOURCE_FILTERS, countAdultBySource } from "@/lib/videos/adult-filter";
import { ADULT_PROVIDER_ADAPTERS } from "@/lib/videos/adult-provider-adapters";
import { rankAdultTags } from "@/lib/videos/adult-rank";
import { selectAdultRemote, useLibrary } from "@/lib/videos/store";

const ORDERS: { id: string; label: string }[] = [
  { id: "top-weekly", label: "Top this week" },
  { id: "most-popular", label: "Most popular" },
  { id: "latest", label: "Latest" },
  { id: "top-rated", label: "Top rated" },
];

const PROVIDER_CHOICES: { id: AdultPullProvider[] | "all"; label: string }[] = [
  { id: "all", label: "All pull sources" },
  { id: ["eporner", "redtube"], label: "Videos (Eporner + RedTube)" },
  { id: ["chaturbate", "myfreecams"], label: "Live cams" },
  { id: ["chaturbate"], label: "Chaturbate only" },
  { id: ["myfreecams"], label: "MyFreeCams only" },
  { id: ["reddit"], label: "Reddit (18+)" },
  { id: ["booru"], label: "Booru photos (18+)" },
  { id: ["redgifs"], label: "Redgifs (needs API key)" },
  { id: ["eporner"], label: "Eporner only" },
  { id: ["redtube"], label: "RedTube only" },
];

const FETISH_EXPLORER_GROUPS: Array<{ label: string; tags: readonly string[] }> = [
  { label: "Featured", tags: ADULT_FEATURED_FETISH_TAGS },
  { label: "Scenes & styles", tags: ["amateur", "anal", "bondage", "cosplay", "creampie", "double penetration", "feet", "gangbang", "pov", "role play", "threesome", "vr"] },
  { label: "People & regions", tags: ["asian", "bbw", "ebony", "japanese", "latina", "mature", "milf", "transgender", "verified amateurs"] },
  { label: "Formats & live", tags: ["animation", "hentai", "interactive", "live", "solo female", "virtual reality", "webcam"] },
  { label: "Kink & power", tags: ["bdsm", "cuckold", "femdom", "pegging", "roleplay", "strap on", "taboo"] },
];

type RedditSourceSetting = { subreddit: string; priority: 1 | 2 | 3; hidden?: boolean; favorite?: boolean };
const REDDIT_SOURCE_STORAGE_KEY = "reelcase.adult-reddit-sources.v1";
type FetishExplorerTab = "topics" | "sources" | "reddit" | "interests";

const FETISH_EXPLORER_TABS: Array<{ id: FetishExplorerTab; label: string; hint: string }> = [
  { id: "topics", label: "Browse topics", hint: "Choose an interest and pull it" },
  { id: "sources", label: "Pull sources", hint: "Set the provider mix" },
  { id: "reddit", label: "Reddit list", hint: "Review saved communities" },
  { id: "interests", label: "For you", hint: "Use hearts and ranked signals" },
];

function fetishTopicKey(tag: string): string {
  return tag.trim().toLowerCase().replace(/^fetish-/, "").replace(/-/g, " ");
}

function fetishTagLabel(tag: string): string {
  return fetishTopicKey(tag).replace(/\s+/g, " ");
}

function pullSourceSelectionLabel(providers: AdultPullProvider[] | "all"): string {
  if (providers === "all") return "All available sources";
  const exact = PROVIDER_CHOICES.find((choice) => JSON.stringify(choice.id) === JSON.stringify(providers));
  return exact?.label ?? `${providers.length} selected sources`;
}

function readRedditSourceSettings(): RedditSourceSetting[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(REDDIT_SOURCE_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const settings: RedditSourceSetting[] = [];
    for (const item of raw.slice(0, 120)) {
      const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
      const subreddit = String(row.subreddit ?? "").trim().replace(/^r\//i, "");
      if (!/^[a-z0-9_]{3,48}$/i.test(subreddit) || seen.has(subreddit.toLowerCase())) continue;
      seen.add(subreddit.toLowerCase());
      const priority = Number(row.priority);
      settings.push({ subreddit, priority: priority >= 3 ? 3 : priority <= 1 ? 1 : 2, hidden: Boolean(row.hidden), favorite: Boolean(row.favorite) });
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
export function AdultFetishExplorer({
  onSelectedTag,
}: {
  onSelectedTag?: (tag: string) => void;
}) {
  const searchAdultFeed = useLibrary((s) => s.searchAdultFeed);
  const remoteBusy = useLibrary((s) => s.remoteBusy);
  const setSource = useLibrary((s) => s.setSource);
  const explorerAdultVideos = useLibrary(useShallow(selectAdultRemote));
  const explorerTags = useLibrary((s) => s.tags);
  const explorerFavorites = useLibrary((s) => s.favorites);
  const explorerLikes = useLibrary((s) => s.likes);
  const explorerCameCounts = useLibrary((s) => s.cameCounts);
  const explorerViewCounts = useLibrary((s) => s.viewCounts);
  const [providers, setProviders] = useState<AdultPullProvider[] | "all">("all");
  const [order, setOrder] = useState("top-weekly");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [pullLimit, setPullLimit] = useState<number>(LIBRARY_LIMITS.adultInteractiveVideosPerPull);
  const [activeTab, setActiveTab] = useState<FetishExplorerTab>("topics");
  const [redditSourceRevision, setRedditSourceRevision] = useState(0);
  const [feedbackRevision, setFeedbackRevision] = useState(0);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("reelcase.adult-pull-limit") ?? LIBRARY_LIMITS.adultInteractiveVideosPerPull);
      setPullLimit([240, 480, 800, 1200].includes(saved) ? saved : LIBRARY_LIMITS.adultInteractiveVideosPerPull);
    } catch {
      // The default remains suitable for this visit when preferences are unavailable.
    }
  }, []);

  useEffect(() => {
    const refresh = () => setFeedbackRevision((revision) => revision + 1);
    window.addEventListener("reelcase:rating-change", refresh);
    return () => window.removeEventListener("reelcase:rating-change", refresh);
  }, []);

  const redditSourceSettings = useMemo(() => readRedditSourceSettings(), [redditSourceRevision]);
  const savedRedditSources = useMemo(() => {
    const merged = new Map<string, RedditSourceSetting>();
    for (const subreddit of ADULT_REDDIT_SUBS) merged.set(subreddit.toLowerCase(), { subreddit, priority: 2 });
    for (const source of redditSourceSettings) merged.set(source.subreddit.toLowerCase(), source);
    return [...merged.values()]
      .filter((source) => !source.hidden)
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.priority - a.priority || a.subreddit.localeCompare(b.subreddit));
  }, [redditSourceSettings]);
  const favoriteRedditSources = useMemo(() => savedRedditSources.filter((source) => source.favorite), [savedRedditSources]);
  const hiddenRedditSources = useMemo(() => redditSourceSettings.filter((source) => source.hidden), [redditSourceSettings]);
  const rankedInterests = useMemo(() => rankAdultTags(explorerAdultVideos, {
    tags: explorerTags,
    favorites: explorerFavorites,
    likes: explorerLikes,
    cameCounts: explorerCameCounts,
    viewCounts: explorerViewCounts,
    ratingOf: getRating,
    tagIsHearted: (tag) => tagIsLiked(tag) || tagIsLiked(fetishTopicKey(tag)),
    tagHasHeartHistory: (tag) => tagHasHeartHistory(tag) || tagHasHeartHistory(fetishTopicKey(tag)),
  }, 48).filter((row) => row.tag.startsWith("fetish-") || ADULT_CURATED_FETISH_TAGS.includes(fetishTopicKey(row.tag))), [explorerAdultVideos, explorerCameCounts, explorerFavorites, explorerLikes, explorerTags, explorerViewCounts, feedbackRevision]);
  const historicInterestTags = useMemo(() => {
    const knownCuratedTags = new Set(ADULT_CURATED_FETISH_TAGS.map(fetishTopicKey));
    const rankedTags = new Set(rankedInterests.map((row) => fetishTopicKey(row.tag)));
    return getHeartedTagHistory()
      .map(fetishTopicKey)
      .filter((tag, index, all) => knownCuratedTags.has(tag) && !rankedTags.has(tag) && all.indexOf(tag) === index);
  }, [feedbackRevision, rankedInterests]);
  const matchingFetishes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ADULT_CURATED_FETISH_TAGS.filter((tag) => !needle || tag.includes(needle));
  }, [query]);
  const pullTopic = (topic: string) => {
    if (remoteBusy) return;
    const normalized = fetishSearchQuery(topic);
    const selectedTag = `fetish-${normalized.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`;
    const usesReddit = providers === "all" || providers.includes("reddit");
    onSelectedTag?.(selectedTag);
    void searchAdultFeed(normalized, order, {
      page: 1,
      maxVideos: pullLimit,
      providers,
      ...(usesReddit && savedRedditSources.length ? { redditSources: savedRedditSources } : {}),
    })
      .then((count) => toast.success(count ? `Loaded ${count.toLocaleString()} for #${topic}` : `No titles found for #${topic}`))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : `Could not pull #${topic}.`));
  };
  const pullSavedRedditSources = () => {
    if (remoteBusy) return;
    if (!savedRedditSources.length) {
      toast.message("No active Reddit communities are saved yet.");
      return;
    }
    void searchAdultFeed("all", order, {
      page: 1,
      maxVideos: pullLimit,
      providers: ["reddit"],
      redditSources: savedRedditSources,
    })
      .then((count) => toast.success(count ? `Refreshed ${count.toLocaleString()} titles from your Reddit list` : "No new titles from your saved Reddit list"))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not refresh your saved Reddit list."));
  };
  const openRedditSourceManager = () => {
    try {
      localStorage.setItem("reelcase.adult-discovery-collapsed", "false");
    } catch {
      // The destination still opens, even when this session cannot save the view preference.
    }
    setSource("adults");
  };
  const toggleInterestHeart = (tag: string) => {
    toggleTagLike(fetishTopicKey(tag));
    setFeedbackRevision((revision) => revision + 1);
  };

  const topics = query.trim() || showAll ? matchingFetishes : [];
  const usesReddit = providers === "all" || providers.includes("reddit");
  const heartedRankedInterests = rankedInterests.filter((row) => tagIsLiked(row.tag) || tagIsLiked(fetishTopicKey(row.tag)));
  return (
    <section className="mb-6 rounded-xl bg-elevated p-5 shadow-border" aria-labelledby="fetish-explorer-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult interests</p>
          <h1 id="fetish-explorer-title" className="mt-2 font-display text-3xl text-fg sm:text-4xl">Fetish Explorer</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">A dedicated Adult topic workspace, organized like Movie Topics. Browse what to pull, set the source mix, review your Reddit list, and keep the personal interests that should lead future recommendations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setSource("adults")}>Open Adult browse</Button>
          <Button size="sm" variant="secondary" onClick={() => setActiveTab("sources")}>Source mix</Button>
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-border bg-bg/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Topic pull composer</p><span className="text-xs text-muted">{pullSourceSelectionLabel(providers)}{usesReddit ? ` · ${savedRedditSources.length} saved Reddit communities` : ""}</span></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROVIDER_CHOICES.map((choice) => <Button key={choice.label} size="sm" variant={JSON.stringify(providers) === JSON.stringify(choice.id) ? "default" : "secondary"} onClick={() => setProviders(choice.id)}>{choice.label}</Button>)}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"/><Input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && query.trim()) pullTopic(query); }} placeholder="Find a fetish, format, or custom topic" className="pl-9" aria-label="Find a fetish to pull"/></div>
          <div className="flex flex-wrap gap-2">{ORDERS.map((item) => <Button key={item.id} size="sm" variant={order === item.id ? "default" : "secondary"} onClick={() => setOrder(item.id)}>{item.label}</Button>)}</div>
          <Button disabled={remoteBusy || !query.trim()} onClick={() => pullTopic(query)}>{remoteBusy ? "Pulling…" : "Pull this topic"}</Button>
        </div>
        <p className="mt-3 text-xs text-muted">{providers === "all" ? "Every available provider is selected." : `${providers.length} provider${providers.length === 1 ? "" : "s"} selected.`} Reddit uses {savedRedditSources.length} saved community{savedRedditSources.length === 1 ? "" : "ies"} when included.</p>
      </div>
      <div role="tablist" aria-label="Fetish Explorer sections" className="mt-5 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {FETISH_EXPLORER_TABS.map((tab) => (
          <Button
            key={tab.id}
            id={`fetish-explorer-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`fetish-explorer-panel-${tab.id}`}
            size="sm"
            variant={activeTab === tab.id ? "default" : "ghost"}
            className="shrink-0"
            title={tab.hint}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {activeTab === "topics" && <div id="fetish-explorer-panel-topics" role="tabpanel" aria-labelledby="fetish-explorer-tab-topics">
      {!query.trim() && !showAll ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {FETISH_EXPLORER_GROUPS.map((group) => <div key={group.label} className="rounded-lg border border-border bg-surface p-4 shadow-border"><p className="text-sm font-medium text-fg">{group.label}</p><div className="mt-3 flex flex-wrap gap-1.5">{group.tags.map((tag) => <Button key={tag} size="sm" className="h-8 px-2 text-xs" variant="secondary" disabled={remoteBusy} onClick={() => pullTopic(tag)}>#{tag}</Button>)}</div></div>)}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {topics.map((tag) => <Button key={tag} size="sm" variant="secondary" disabled={remoteBusy} onClick={() => pullTopic(tag)}>Pull #{tag}</Button>)}
          {!topics.length && <p className="text-sm text-muted">No curated topic matches that search. You can still pull the exact text above.</p>}
        </div>
      )}
      <Button className="mt-4" size="sm" variant="ghost" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show topic groups" : `Browse all ${ADULT_CURATED_FETISH_TAGS.length} topics`}</Button>
      </div>}
      {activeTab === "sources" && (
        <div id="fetish-explorer-panel-sources" role="tabpanel" aria-labelledby="fetish-explorer-tab-sources" className="mt-5 rounded-lg border border-border bg-bg/35 p-4">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Pull source plan</p>
          <h2 className="mt-1 text-lg font-medium text-fg">Use the same source mix for every topic pull</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">The composer above is always live. Pick a broad mix for variety, or isolate video, live, Reddit, photo, or one provider before returning to Browse topics.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-surface p-3 shadow-border"><p className="text-xs text-muted">Selected mix</p><p className="mt-1 text-sm font-medium text-fg">{pullSourceSelectionLabel(providers)}</p></div>
            <div className="rounded-md bg-surface p-3 shadow-border"><p className="text-xs text-muted">Catalog pull size</p><p className="mt-1 text-sm font-medium text-fg">Up to {pullLimit.toLocaleString()} titles</p></div>
            <div className="rounded-md bg-surface p-3 shadow-border"><p className="text-xs text-muted">Reddit scope</p><p className="mt-1 text-sm font-medium text-fg">{usesReddit ? `${savedRedditSources.length} saved communities` : "Not included"}</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setActiveTab("topics")}>Choose a topic with this mix</Button>
            <Button size="sm" variant="secondary" onClick={() => setActiveTab("reddit")}>Review Reddit communities</Button>
            <Button size="sm" variant="ghost" onClick={() => setSource("adults")}>Open full Adult discovery</Button>
          </div>
        </div>
      )}
      {activeTab === "reddit" && (
        <div id="fetish-explorer-panel-reddit" role="tabpanel" aria-labelledby="fetish-explorer-tab-reddit" className="mt-5 rounded-lg border border-border bg-bg/35 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Saved Reddit sources</p>
              <h2 className="mt-1 text-lg font-medium text-fg">Your community list feeds photo, GIF, video, and comments pulls</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">Favorites and high-priority communities lead a Reddit pull. Hidden communities remain stored so you can restore them later.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setRedditSourceRevision((revision) => revision + 1)}>Refresh saved list</Button>
              <Button size="sm" variant="secondary" onClick={openRedditSourceManager}>Manage list in Adult discovery</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-surface p-3 shadow-border"><p className="text-xs text-muted">Active</p><p className="mt-1 text-lg font-medium text-fg">{savedRedditSources.length}</p></div>
            <div className="rounded-md bg-surface p-3 shadow-border"><p className="text-xs text-muted">Favorites first</p><p className="mt-1 text-lg font-medium text-fg">{favoriteRedditSources.length}</p></div>
            <div className="rounded-md bg-surface p-3 shadow-border"><p className="text-xs text-muted">Stored but hidden</p><p className="mt-1 text-lg font-medium text-fg">{hiddenRedditSources.length}</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {savedRedditSources.slice(0, 18).map((source) => <span key={source.subreddit} className="rounded-full bg-surface px-3 py-1.5 text-xs text-muted shadow-border">{source.favorite ? "★ " : ""}r/{source.subreddit} · {source.priority === 3 ? "high" : source.priority === 2 ? "normal" : "low"}</span>)}
            {!savedRedditSources.length && <p className="text-sm text-muted">No active saved communities yet. Add or restore them in Adult discovery.</p>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant={usesReddit ? "default" : "secondary"} onClick={() => setProviders(["reddit"])}>Use Reddit for the next topic</Button>
            <Button size="sm" variant="secondary" disabled={remoteBusy || !savedRedditSources.length} onClick={pullSavedRedditSources}>{remoteBusy ? "Pulling…" : "Refresh active Reddit sources"}</Button>
            <Button size="sm" variant="ghost" onClick={() => setActiveTab("topics")}>Choose a Reddit topic</Button>
          </div>
        </div>
      )}
      {activeTab === "interests" && (
        <div id="fetish-explorer-panel-interests" role="tabpanel" aria-labelledby="fetish-explorer-tab-interests" className="mt-5">
          <div className="rounded-lg border border-border bg-bg/35 p-4">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Personal signals</p>
            <h2 className="mt-1 text-lg font-medium text-fg">For you: hearted and steadily supported interests</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">A heart permanently records an interest in local history. Current hearts lead Adult recommendations; ranked topics also need repeat catalog support, so a single title cannot dominate this list.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-surface p-3 shadow-border"><p className="text-xs text-muted">Hearted now</p><p className="mt-1 text-lg font-medium text-fg">{heartedRankedInterests.length}</p></div>
              <div className="rounded-md bg-surface p-3 shadow-border"><p className="text-xs text-muted">Remembered interests</p><p className="mt-1 text-lg font-medium text-fg">{historicInterestTags.length + heartedRankedInterests.length}</p></div>
              <div className="rounded-md bg-surface p-3 shadow-border"><p className="text-xs text-muted">Ranked catalog topics</p><p className="mt-1 text-lg font-medium text-fg">{rankedInterests.length}</p></div>
            </div>
          </div>
          {heartedRankedInterests.length > 0 && <div className="mt-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Hearted now</p><div className="mt-2 flex flex-wrap gap-2">{heartedRankedInterests.map((row) => <div key={row.tag} className="flex overflow-hidden rounded-md bg-surface shadow-border"><Button size="sm" variant="secondary" disabled={remoteBusy} onClick={() => pullTopic(fetishTagLabel(row.tag))}>Pull #{fetishTagLabel(row.tag)}</Button><Button size="sm" variant="ghost" aria-label={`Remove heart from ${fetishTagLabel(row.tag)}`} onClick={() => toggleInterestHeart(row.tag)}>★</Button></div>)}</div></div>}
          {historicInterestTags.length > 0 && <div className="mt-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Kept in history</p><p className="mt-1 text-xs text-muted">These were hearted before and stay available even if their current catalog count drops away.</p><div className="mt-2 flex flex-wrap gap-2">{historicInterestTags.slice(0, 18).map((tag) => <div key={tag} className="flex overflow-hidden rounded-md bg-surface shadow-border"><Button size="sm" variant="secondary" disabled={remoteBusy} onClick={() => pullTopic(tag)}>Pull #{tag}</Button><Button size="sm" variant="ghost" aria-label={`Heart ${tag} again`} onClick={() => toggleInterestHeart(tag)}>♡</Button></div>)}</div></div>}
          <div className="mt-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Ranked from Adult library</p><p className="text-xs text-muted">Stabilized across repeat titles, ratings, saves, likes, views, and hearts.</p></div>{rankedInterests.length ? <div className="mt-2 flex flex-wrap gap-2">{rankedInterests.slice(0, 24).map((row) => { const hearted = tagIsLiked(row.tag) || tagIsLiked(fetishTopicKey(row.tag)); const label = fetishTagLabel(row.tag); return <div key={row.tag} className="flex overflow-hidden rounded-md bg-surface shadow-border"><Button size="sm" variant={hearted ? "default" : "secondary"} disabled={remoteBusy} title={`score ${Math.round(row.score)} · ${row.count} catalog titles`} onClick={() => pullTopic(label)}>{hearted ? "★ " : ""}Pull #{label} · {row.count}</Button><Button size="sm" variant="ghost" aria-label={`${hearted ? "Remove heart from" : "Heart"} ${label}`} onClick={() => toggleInterestHeart(row.tag)}>{hearted ? "★" : "☆"}</Button></div>; })}</div> : <p className="mt-2 text-sm text-muted">Pull a few topics or tag saved Adult titles to build a ranked interest view.</p>}</div>
        </div>
      )}
    </section>
  );
}

function SiteCard({
  name,
  href,
  copy,
  embeds,
  badge,
  sourceId,
  compact = false,
}: {
  name: string;
  href: string;
  copy: string;
  embeds?: boolean;
  badge?: string;
  sourceId?: string;
  compact?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group rounded-lg bg-surface shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover ${compact ? "p-2.5" : "p-4"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={compact ? "text-sm font-medium text-fg" : "font-display text-xl text-fg"}>{name}</p>
        {(embeds || badge) && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-accent uppercase">
            {badge ?? "Embeds"}
          </span>
        )}
      </div>
      {!compact && <p className="mt-1 text-xs text-muted">{copy}</p>}
      {sourceId && (
        <p className="mt-2 text-[10px] tracking-wide text-subtle uppercase">
          source tag · #{adultSourceTag(sourceId)}
        </p>
      )}
      <span className={`${compact ? "mt-1.5 text-xs" : "mt-3 text-sm"} inline-flex items-center gap-1.5 font-medium text-accent`}>
        Open site <ExternalLink className="size-3.5" />
      </span>
    </a>
  );
}

export function AdultPanel({
  showMilestones = false,
  autoPull = true,
  sourceFilter = "all",
  tagFilter: tagFilterProp,
  onSourceFilter,
  onTagFilter,
}: {
  /** Link-out hub + milestone catalogs — deferred behind Adults deep shelves. */
  showMilestones?: boolean;
  /** Soft first pull when the cache is thin; explore can disable for render-only. */
  autoPull?: boolean;
  sourceFilter?: string;
  tagFilter?: string;
  onSourceFilter?: (source: string) => void;
  onTagFilter?: (tag: string) => void;
}) {
  const searchAdultFeed = useLibrary((s) => s.searchAdultFeed);
  const remoteBusy = useLibrary((s) => s.remoteBusy);
  const importProgress = useLibrary((s) => s.importProgress);
  const adultPullStatus = useLibrary((s) => s.adultPullStatus);
  const setSource = useLibrary((s) => s.setSource);
  const tags = useLibrary((s) => s.tags);
  const adultVideos = useLibrary(useShallow(selectAdultRemote));
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("top-weekly");
  const [providers, setProviders] = useState<AdultPullProvider[] | "all">("all");
  const [booted, setBooted] = useState(false);
  const [localTag, setLocalTag] = useState("all");
  const tagFilter = tagFilterProp ?? localTag;
  const setTagFilter = (tag: string) => {
    setLocalTag(tag);
    if (tag.startsWith("source-") || tag === "all") onSourceFilter?.(tag === "all" ? "all" : tag.replace(/^source-/, "").split("-")[0] ?? "all");
    onTagFilter?.(tag === "all" ? "All" : tag);
  };
  const [nextPage, setNextPage] = useState(2);
  const [starQuery, setStarQuery] = useState("");
  const [stars, setStars] = useState<Array<{ name: string; thumb?: string; url?: string }>>([]);
  const [starNote, setStarNote] = useState("");
  const [archiveLabel, setArchiveLabel] = useState("No saved archive depth yet — Pull catalog starts at page 1.");
  const [autoArchiveRounds, setAutoArchiveRounds] = useState(0);
  const [adultMaxVideos, setAdultMaxVideos] = useState<number>(LIBRARY_LIMITS.adultInteractiveVideosPerPull);
  const [useCustomRedditSources, setUseCustomRedditSources] = useState(false);
  const [redditSources, setRedditSources] = useState<RedditSourceSetting[]>([]);
  const [redditSourceInput, setRedditSourceInput] = useState("");
  const [redditSourceQuery, setRedditSourceQuery] = useState("");
  const [showAllRedditSources, setShowAllRedditSources] = useState(false);
  const [redditSourcesReady, setRedditSourcesReady] = useState(false);
  // Discovery is intentionally compact at startup. The background catalog
  // refresh still runs, and an explicit expansion remains remembered.
  const [discoveryCollapsed, setDiscoveryCollapsed] = useState(true);

  useEffect(() => {
    const load = () => {
      const saved = Number(localStorage.getItem("reelcase.adult-pull-limit") ?? LIBRARY_LIMITS.adultInteractiveVideosPerPull);
      setAdultMaxVideos([240, 480, 800, 1200].includes(saved) ? saved : LIBRARY_LIMITS.adultInteractiveVideosPerPull);
    };
    load();
    window.addEventListener("reelcase:adult-render-settings", load);
    return () => window.removeEventListener("reelcase:adult-render-settings", load);
  }, []);

  useEffect(() => {
    const saved = readRedditSourceSettings();
    setRedditSources(saved);
    // The library already carries the prior saved subreddit catalog. It is the
    // default scope; manual rows below only pin a community and override its
    // priority. This avoids an empty separate preference silently falling back
    // to the generic rotation.
    setUseCustomRedditSources(true);
    setDiscoveryCollapsed(localStorage.getItem("reelcase.adult-discovery-collapsed") !== "false");
    setRedditSourcesReady(true);
  }, []);

  useEffect(() => {
    if (!redditSourcesReady) return;
    try {
      localStorage.setItem(REDDIT_SOURCE_STORAGE_KEY, JSON.stringify(redditSources));
      localStorage.setItem(`${REDDIT_SOURCE_STORAGE_KEY}.enabled`, String(useCustomRedditSources));
    } catch {
      // Source choices remain usable for this session if local storage is full.
    }
  }, [redditSources, redditSourcesReady, useCustomRedditSources]);

  useEffect(() => {
    if (!redditSourcesReady) return;
    try {
      localStorage.setItem("reelcase.adult-discovery-collapsed", String(discoveryCollapsed));
    } catch {
      // The section still collapses for the current visit if storage is full.
    }
  }, [discoveryCollapsed, redditSourcesReady]);

  const libraryRedditSources = useMemo<RedditSourceSetting[]>(
    () => ADULT_REDDIT_SUBS.map((subreddit) => ({ subreddit, priority: 2 })),
    [],
  );
  const selectedRedditSources = useMemo(() => {
    const merged = new Map<string, RedditSourceSetting>();
    for (const source of libraryRedditSources) merged.set(source.subreddit.toLowerCase(), source);
    for (const source of redditSources) merged.set(source.subreddit.toLowerCase(), source);
    return [...merged.values()]
      .filter((source) => !source.hidden)
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.priority - a.priority || a.subreddit.localeCompare(b.subreddit));
  }, [libraryRedditSources, redditSources]);
  const redditSourceRows = useMemo(() => {
    const overrides = new Map(redditSources.map((source) => [source.subreddit.toLowerCase(), source]));
    const all = new Map(libraryRedditSources.map((source) => [source.subreddit.toLowerCase(), source]));
    for (const source of redditSources) all.set(source.subreddit.toLowerCase(), { ...(all.get(source.subreddit.toLowerCase()) ?? source), ...source });
    const needle = redditSourceQuery.trim().toLowerCase();
    return [...all.values()]
      .filter((source) => !needle || source.subreddit.toLowerCase().includes(needle))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || Number(a.hidden) - Number(b.hidden) || b.priority - a.priority || a.subreddit.localeCompare(b.subreddit))
      .map((source) => ({ ...source, isLibrary: libraryRedditSources.some((row) => row.subreddit.toLowerCase() === source.subreddit.toLowerCase()), hasOverride: overrides.has(source.subreddit.toLowerCase()) }));
  }, [libraryRedditSources, redditSourceQuery, redditSources]);

  const redditPullOptions = useMemo(
    () => useCustomRedditSources && selectedRedditSources.length ? { redditSources: selectedRedditSources } : {},
    [selectedRedditSources, useCustomRedditSources],
  );

  const sourceCounts = useMemo(() => countAdultBySource(adultVideos), [adultVideos]);
  const sourceFacets = useMemo(
    () => ADULT_SOURCE_FILTERS.filter((row) => row.id !== "all").map((row) => [row.id, sourceCounts[row.id] ?? 0] as const),
    [sourceCounts],
  );

  const [facetsReady, setFacetsReady] = useState(false);
  useEffect(() => {
    setFacetsReady(false);
    let cancelled = false;
    const ready = () => { if (!cancelled) setFacetsReady(true); };
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(ready, { timeout: 1_200 });
      return () => { cancelled = true; window.cancelIdleCallback(id); };
    }
    const id = window.setTimeout(ready, 200);
    return () => { cancelled = true; window.clearTimeout(id); };
  }, [adultVideos.length]);

  // Creator / interest chip walks over the full archive — idle until first paint settles.
  const creatorFacets = useMemo(() => {
    if (discoveryCollapsed || !facetsReady) return [] as Array<readonly [string, number]>;
    const counts = new Map<string, number>();
    for (const video of adultVideos) {
      for (const tag of tags[video.id] ?? []) {
        if (tag.startsWith("creator-")) counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    // One-off usernames are metadata, not useful organization. Keep only
    // recurring creators and a compact control strip.
    return [...counts.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12);
  }, [adultVideos, discoveryCollapsed, facetsReady, tags]);

  const fetishFacets = useMemo(() => {
    if (discoveryCollapsed || !facetsReady) return [] as Array<readonly [string, number]>;
    const counts = new Map<string, number>();
    for (const video of adultVideos) {
      for (const tag of tags[video.id] ?? []) {
        // Provider metadata can contain hundreds of raw keywords. Source and
        // creator filters are above; this shelf stays a compact set of the
        // curated, stable interest labels.
        if (tag.startsWith("fetish-")) {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 24);
  }, [adultVideos, discoveryCollapsed, facetsReady, tags]);

  useEffect(() => {
    if (!autoPull || booted || !redditSourcesReady) return;
    setBooted(true);
    // Cached IndexedDB shelves already paint on fast-start; only top up a thin cache.
    if (adultVideos.length >= LIBRARY_LIMITS.adultFastStartVideosPerPull) return;
    void searchAdultFeed("all", "top-weekly", {
      providers: "all",
      maxVideos: adultMaxVideos,
      ...redditPullOptions,
    })
      .then((n) => {
        setNextPage(2);
        if (n) toast.success(`Loaded ${n.toLocaleString()} adult titles`);
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not load adult feed.");
      });
  }, [adultMaxVideos, autoPull, booted, adultVideos.length, redditPullOptions, redditSourcesReady, searchAdultFeed]);

  const refreshArchiveLabel = (q: string, ord: string) => {
    setArchiveLabel(adultArchiveDepthLabel(loadAdultArchiveCursors(q, ord)));
  };

  useEffect(() => {
    refreshArchiveLabel(query.trim() || "all", order);
  }, [query, order, adultVideos.length]);

  const runSearch = (append = false, resume = false) => {
    if (remoteBusy) {
      toast.message("A catalog pull is already running.");
      return;
    }
    const q = query.trim() || "all";
    const cursors = loadAdultArchiveCursors(q, order);
    const providerPages = resume
      ? Object.fromEntries(
          Object.entries(cursors).map(([provider, row]) => [provider, row.page]),
        ) as Partial<Record<AdultPullProvider, number>>
      : undefined;
    const page = append || resume ? (resume ? 1 : nextPage) : 1;
    void searchAdultFeed(q, order, {
      page: resume ? 1 : page,
      maxVideos: adultMaxVideos,
      append: append || resume,
      providers,
      providerPages,
      ...redditPullOptions,
    })
      .then((n) => {
        setNextPage((resume ? Math.max(2, ...Object.values(cursors).map((c) => c.page)) : page) + 1);
        setTagFilter("all");
        refreshArchiveLabel(q, order);
        toast.success(
          n
            ? `${append || resume ? "Catalog now has" : "Loaded"} ${n.toLocaleString()} adult titles`
            : "No results",
        );
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Search failed");
      });
  };

  const pullRedtubeCreator = (creator: string) => {
    const q = creator.trim();
    if (!q || remoteBusy) return;
    setProviders(["redtube"]);
    setQuery(q);
    void searchAdultFeed(q, order, {
      providers: ["redtube"],
      maxVideos: LIBRARY_LIMITS.redtubeStarVideosPerPull,
    })
      .then((n) => toast.success(n ? `Loaded ${n.toLocaleString()} for ${q}` : `No titles found for ${q}`))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : `Could not pull ${q}.`));
  };

  const pullSavedRedditSources = () => {
    if (!selectedRedditSources.length || remoteBusy) return;
    setUseCustomRedditSources(true);
    setProviders(["reddit"]);
    void searchAdultFeed("all", order, {
      page: 1,
      maxVideos: adultMaxVideos,
      providers: ["reddit"],
      redditSources: selectedRedditSources,
    })
      .then((n) => toast.success(`Library Reddit list refreshed · ${n.toLocaleString()} catalog titles available`))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not pull the library Reddit list."));
  };

  const pinRedditSource = () => {
    const subreddit = redditSourceInput.trim().replace(/^r\//i, "");
    if (!/^[a-z0-9_]{3,48}$/i.test(subreddit)) {
      toast.error("Enter a valid subreddit name.");
      return;
    }
    setRedditSources((current) => {
      const existing = current.find((row) => row.subreddit.toLowerCase() === subreddit.toLowerCase());
      if (existing) return current.map((row) => row.subreddit.toLowerCase() === subreddit.toLowerCase() ? { ...row, hidden: false, favorite: true, priority: 3 } : row);
      return [...current, { subreddit, priority: 2 }];
    });
    setUseCustomRedditSources(true);
    setRedditSourceInput("");
  };

  // After the interactive first pull is usable, quietly advance a few saved
  // provider cursors. This imports more variety without turning first paint
  // into a long blocking crawl or repeatedly hammering an unavailable source.
  useEffect(() => {
    if (
      !autoPull
      || !redditSourcesReady
      || remoteBusy
      || query.trim()
      || providers !== "all"
      || adultVideos.length >= LIBRARY_LIMITS.adultTargetCatalogVideos
      || autoArchiveRounds >= LIBRARY_LIMITS.adultAutoArchivePagesPerVisit
    ) return;
    const timer = window.setTimeout(() => {
      setAutoArchiveRounds((rounds) => rounds + 1);
      runSearch(false, true);
    }, LIBRARY_LIMITS.adultAutoArchiveDelayMs);
    return () => window.clearTimeout(timer);
  }, [adultVideos.length, autoArchiveRounds, autoPull, order, providers, query, redditPullOptions, redditSourcesReady, remoteBusy]);

  const milestoneLinks = ADULT_MILESTONE_LINKS.filter((site) => site.href !== ADULT_CATEGORY_HUB.href);

  return (
    <div className="mb-6 flex flex-col gap-5">
      {showMilestones && (
        <>
      <details className="rounded-xl bg-elevated shadow-border">
        <summary className="cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Category hub</p><h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">ThePornDude directory</h2><p className="mt-2 text-xs text-muted">Collapse this section to keep the Adult catalog compact.</p></summary>
        <div className="px-5 pb-5">
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Use ThePornDude as the main adult category map (tubes, cams, anime, games, niche lists).
          In-app playback comes from official public APIs below; other destinations stay as milestones
          with labeled source tags.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SiteCard {...ADULT_CATEGORY_HUB} badge="Hub" />
        </div>
        </div>
      </details>

      <details className="rounded-xl bg-elevated shadow-border">
        <summary className="cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult sites</p><h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">Embed-ready pull sources</h2><p className="mt-2 text-xs text-muted">Collapse this section to focus on the catalog.</p></summary>
        <div className="px-5 pb-5">
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Official public APIs: Eporner, RedTube, Chaturbate embeds, the MyFreeCams online list,
          Reddit public Atom RSS for curated 18+ subs, and Gelbooru-style booru JSON (XBooru / TBIB / Hypnohub). If one source errors, the others still fill the shelf.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ADULT_EMBED_LINKS.map((site) => (
            <SiteCard key={site.name} {...site} />
          ))}
        </div>
        </div>
      </details>

      <details className="rounded-xl bg-elevated shadow-border">
        <summary className="cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Catalog milestones</p><h2 className="mt-2 font-display text-2xl text-fg">Current reliability coverage</h2><p className="mt-2 text-xs text-muted">Expand for the active work grouped by catalog area.</p></summary>
        <div className="grid gap-3 border-t border-border px-5 pb-5 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {[['Reddit media', 'Saved community list, priority/favorite and hide controls, Atom pulls, Redgifs dual-source cards, and image recovery.'], ['Live rooms', 'Chaturbate and MyFreeCams public room lists with live-only placement and provider diagnostics.'], ['Photos & tags', 'Booru response-shape recovery, creator attribution, stable tag scoring, and permanent heart history.'], ['Catalog feedback', 'Pull health explains loaded, empty, and failed providers; ratings rebuild the weekly streak from durable feedback.']].map(([title, copy]) => <div key={title} className="rounded-md bg-surface p-3 shadow-border"><p className="text-sm font-medium text-fg">{title}</p><p className="mt-1 text-xs leading-5 text-muted">{copy}</p></div>)}
        </div>
      </details>

      <details className="order-last rounded-xl bg-elevated shadow-border">
        <summary className="cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Link-out destinations</p><p className="mt-1 text-sm text-muted">Optional directories grouped below the catalog · {milestoneLinks.length} sites.</p></summary>
        <div className="border-t border-border px-4 pb-4 pt-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-9 items-center justify-center rounded-lg bg-surface text-accent shadow-border">
            <Flag className="size-4" />
          </span>
          <div>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              These sites do not expose a documented public discovery/embed API we can use without
              scraping or bypassing logins/paywalls. Reelcase keeps them as milestones with source
              tags — open the official page in a new tab.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {ADULT_SOURCE_OPTIONS.filter((s) => !s.pull).slice(0, 36).map((source) => (
            <a
              key={source.id}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-surface px-3 py-1 text-xs text-muted shadow-border hover:text-fg"
            >
              #{adultSourceTag(source.id)} · {source.label}
            </a>
          ))}
        </div>
        <div className="mt-4 space-y-5">
          {(
            [
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
              ["manhwa", "Manhwa"],
            ] as const
          ).map(([group, label]) => {
            const sites = milestoneLinks.filter((site) => site.group === group);
            if (!sites.length) return null;
            return (
              <div key={group}>
                <p className="mb-2 text-xs font-medium tracking-[0.14em] text-accent uppercase">{label}</p>
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {sites.map((site, index) => (
                    <SiteCard
                      key={`${site.sourceId ?? site.name}-${site.href}-${index}`}
                      {...site}
                      compact
                      badge={group === "cam" || group === "voyeur" ? "Cam/chat" : group === "download" || group === "torrent" ? "Link-out only" : group === "community" || group === "blog" ? "Link-out" : "Milestone"}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </details>
        </>
      )}

      <section className="rounded-xl bg-elevated p-5 shadow-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Remote pull</p>
            <h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">Adult discovery</h2>
            <p className="mt-1 text-xs text-muted">Saved source scope, provider health, tags, and catalog controls.</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            aria-expanded={!discoveryCollapsed}
            aria-label={`${discoveryCollapsed ? "Expand" : "Minimize"} Adult discovery`}
            onClick={() => setDiscoveryCollapsed((collapsed) => !collapsed)}
          >
            {discoveryCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
            {discoveryCollapsed ? "Expand" : "Minimize"}
          </Button>
        </div>
        {!discoveryCollapsed && (
          <div className="mt-4">
        <p className="max-w-2xl text-sm text-muted">
          Failover-friendly pulls via{" "}
          <a
            href="https://www.eporner.com/api/v2/"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:text-fg"
          >
            Eporner API v2
          </a>{" "}
          and{" "}
          <a
            href="https://api.redtube.com/"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:text-fg"
          >
            RedTube webmaster API
          </a>{" "}
          (up to {LIBRARY_LIMITS.adultInteractiveVideosPerPull.toLocaleString()} titles per pull). Every pulled
          item always gets a filterable <code className="text-fg">source-*</code> tag, plus{" "}
          <code className="text-fg">creator-*</code> when a username/channel/owner is known, API
          keywords, and curated fetish tokens mined from titles/descriptions. Cards open the same
          preview + in-app play window as YouTube and Twitch. Use I cummed to it on a card or in the
          player to keep a private local count that never leaves this browser.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PROVIDER_CHOICES.map((choice) => (
            <Button
              key={choice.label}
              size="sm"
              variant={JSON.stringify(providers) === JSON.stringify(choice.id) ? "default" : "secondary"}
              onClick={() => setProviders(choice.id)}
            >
              {choice.label}
            </Button>
          ))}
        </div>

        <details className="mt-4 rounded-md border border-border bg-bg/35 p-3">
          <summary className="cursor-pointer text-xs font-medium text-fg">Reddit photo sources · custom list and priority</summary>
          <p className="mt-2 text-xs leading-5 text-muted">
            The saved library list is active by default. Add a community below to pin it and set its priority; switch to curated rotation only when you want discovery to rotate evenly. Each imported Reddit photo and video receives both
            <code className="mx-1 text-fg">source-reddit-*</code> and <code className="text-fg">sub-*</code> tags for filtering.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={useCustomRedditSources ? "default" : "secondary"}
              onClick={() => setUseCustomRedditSources((enabled) => !enabled)}
            >
              {useCustomRedditSources ? "Use curated rotation" : "Use library source list"}
            </Button>
            <span className="text-xs text-muted">
              {useCustomRedditSources ? `${selectedRedditSources.length} saved communities · priority overrides first` : "Curated rotation active"}
            </span>
            {selectedRedditSources.length > 0 && (
              <Button size="sm" variant="secondary" disabled={remoteBusy} onClick={pullSavedRedditSources}>
                {remoteBusy ? "Pulling library list…" : `Pull my ${selectedRedditSources.length} sources`}
              </Button>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={redditSourceInput}
              onChange={(event) => setRedditSourceInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  pinRedditSource();
                }
              }}
              placeholder="Pin a subreddit, e.g. ExampleSub"
              aria-label="Pin Reddit source"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={pinRedditSource}
            >
              Pin source
            </Button>
          </div>
          <div className="mt-3 rounded-md border border-border bg-bg/35 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium text-fg">Saved library communities · {selectedRedditSources.length} active</p><span className="text-xs text-muted">Favorites pull first · hidden sources stay saved</span></div>
            <Input value={redditSourceQuery} onChange={(event) => setRedditSourceQuery(event.target.value)} placeholder="Find a saved community…" className="mt-2" aria-label="Find saved Reddit community" />
            <div className="mt-2 space-y-2">
              {redditSourceRows.slice(0, showAllRedditSources || redditSourceQuery.trim() ? redditSourceRows.length : 18).map((source) => (
                <div key={source.subreddit} className="flex flex-wrap items-center gap-1.5 rounded bg-surface px-2 py-1.5 text-xs shadow-border">
                  <span className={`mr-auto ${source.hidden ? "text-subtle line-through" : "text-fg"}`}>r/{source.subreddit}{source.isLibrary ? " · library" : " · custom"}</span>
                  <Button size="sm" className="h-6 px-1.5 text-[10px]" variant={source.favorite ? "default" : "ghost"} onClick={() => setRedditSources((current) => { const row = current.find((item) => item.subreddit.toLowerCase() === source.subreddit.toLowerCase()); return row ? current.map((item) => item === row ? { ...item, favorite: !item.favorite, hidden: false, priority: !item.favorite ? 3 : item.priority } : item) : [...current, { subreddit: source.subreddit, priority: 3, favorite: true }]; })}>{source.favorite ? "★ Favorite" : "☆ Favorite"}</Button>
                  <Button size="sm" className="h-6 px-1.5 text-[10px]" variant="ghost" onClick={() => setRedditSources((current) => { const row = current.find((item) => item.subreddit.toLowerCase() === source.subreddit.toLowerCase()); return row ? current.map((item) => item === row ? { ...item, hidden: !item.hidden } : item) : [...current, { subreddit: source.subreddit, priority: 2, hidden: true }]; })}>{source.hidden ? "Show" : "Hide"}</Button>
                  {([3, 2, 1] as const).map((priority) => <Button key={priority} size="sm" className="h-6 px-1.5 text-[10px]" variant={source.priority === priority ? "default" : "ghost"} onClick={() => setRedditSources((current) => { const row = current.find((item) => item.subreddit.toLowerCase() === source.subreddit.toLowerCase()); return row ? current.map((item) => item === row ? { ...item, priority, hidden: false } : item) : [...current, { subreddit: source.subreddit, priority }]; })}>{priority === 3 ? "High" : priority === 2 ? "Normal" : "Low"}</Button>)}
                  <Button size="sm" className="h-6 px-1.5 text-[10px]" variant="ghost" title={source.isLibrary ? "Clear saved preference and restore library defaults" : "Remove custom community"} onClick={() => setRedditSources((current) => current.filter((item) => item.subreddit.toLowerCase() !== source.subreddit.toLowerCase()))}>{source.isLibrary ? "Reset" : "Remove"}</Button>
                </div>
              ))}
            </div>
            {redditSourceRows.length > 18 && !redditSourceQuery.trim() && <Button size="sm" variant="secondary" className="mt-2" onClick={() => setShowAllRedditSources((shown) => !shown)}>{showAllRedditSources ? "Show fewer communities" : `Show all ${redditSourceRows.length} communities`}</Button>}
          </div>
        </details>

        <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-bg/35 p-4">
          <div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Topic pulls</p><p className="mt-1 text-sm text-muted">Choose a fetish and provider combination from the dedicated Explorer, then return here to browse its tagged results.</p></div>
          <Button size="sm" variant="secondary" onClick={() => setSource("adult-fetishes")}>Open Fetish Explorer</Button>
        </section>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch(false);
              }}
              placeholder="Search adult feeds (empty = all)"
              className="pl-9"
              aria-label="Search adult feed"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {ORDERS.map((o) => (
              <Button
                key={o.id}
                size="sm"
                variant={order === o.id ? "default" : "secondary"}
                onClick={() => setOrder(o.id)}
              >
                {o.label}
              </Button>
            ))}
          </div>
          <Button onClick={() => runSearch(false)} disabled={remoteBusy}>
            {remoteBusy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Pull catalog
          </Button>
          <Button
            variant="secondary"
            onClick={() => runSearch(true)}
            disabled={remoteBusy || !adultVideos.length}
          >
            Load more
          </Button>
          <Button
            variant="secondary"
            onClick={() => runSearch(false, true)}
            disabled={remoteBusy}
            title="Resume each provider from its saved archive cursor"
          >
            Continue archive
          </Button>
        </div>
        {autoPull && autoArchiveRounds > 0 && adultVideos.length < LIBRARY_LIMITS.adultTargetCatalogVideos && (
          <p className="mt-2 text-xs text-muted">Background archive catch-up · {autoArchiveRounds}/{LIBRARY_LIMITS.adultAutoArchivePagesPerVisit} saved cursor passes this visit · {adultVideos.length.toLocaleString()}/{LIBRARY_LIMITS.adultTargetCatalogVideos.toLocaleString()} title target.</p>
        )}
        <details className="mt-3 rounded-md border border-border bg-bg/35 p-3">
          <summary className="cursor-pointer text-xs font-medium text-fg">Provider adapter platform · active and planned sources</summary>
          <p className="mt-2 text-xs leading-5 text-muted">Each adapter needs a documented public API, public feed, or permitted embed before it can enter the catalog. This keeps unsupported sites as safe link-outs until their source contract is implemented.</p>
          <div className="mt-3 flex flex-wrap gap-2">{ADULT_PROVIDER_ADAPTERS.map((adapter) => <span key={adapter.id} className="rounded-xs bg-elevated px-2 py-1 text-xs text-muted">{adapter.label} · {adapter.status} · {adapter.capabilities.join(", ")}</span>)}</div>
        </details>
        <div className="mt-4 rounded-md bg-bg/40 p-3">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">RedTube creator search</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Input
              value={starQuery}
              onChange={(event) => setStarQuery(event.target.value)}
              placeholder="Star or creator name"
              className="max-w-xs"
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={remoteBusy}
              onClick={() => {
                const q = starQuery.trim();
                if (!q) return;
                setProviders(["redtube"]);
                setQuery(q);
                void (async () => {
                  try {
                    const { searchRedtubeStars } = await import("@/lib/remote/api");
                    const result = await searchRedtubeStars({ data: { query: q, page: 1 } });
                    setStars(result.stars);
                    setStarNote(result.note);
                  } catch (err) {
                    setStarNote(err instanceof Error ? err.message : "Star list unavailable.");
                  }
                })();
                pullRedtubeCreator(q);
              }}
            >
              Search creator
            </Button>
          </div>
          {starNote && <p className="mt-2 text-xs text-muted">{starNote}</p>}
          {stars.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {stars.map((star) => (
                <Button
                  key={star.name}
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setStarQuery(star.name);
                    setProviders(["redtube"]);
                    setQuery(star.name);
                    pullRedtubeCreator(star.name);
                  }}
                >
                  {star.name}
                </Button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          Durable adult catalog: {adultVideos.length.toLocaleString()} titles · provider pages append to this library across reloads
          {importProgress ? ` · ${importProgress.label}` : ""}
        </p>
        {adultPullStatus && (
          <div className="mt-3 rounded-md border border-border bg-bg/35 p-3" aria-live="polite">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Latest pull health</p>
            <p className="mt-1 text-xs text-muted">{adultPullStatus.note}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {adultPullStatus.diagnostics.map((row) => (
                <span
                  key={`${row.provider}:${row.status}:${row.detail}`}
                  title={row.detail}
                  className={`rounded-full px-2.5 py-1 text-xs ${row.status === "loaded" ? "bg-accent/15 text-accent" : row.status === "empty" ? "bg-surface text-muted" : "bg-destructive/15 text-destructive"}`}
                >
                  {row.provider} · {row.status === "loaded" ? `${row.titles} loaded` : row.status} · {row.detail}
                </span>
              ))}
            </div>
          </div>
        )}
        {useCustomRedditSources && redditSources.length > 0 && (
          <p className="mt-1 text-xs text-muted">
            Reddit pull scope · {selectedRedditSources.length} saved communities · {redditSources.length} priority override{redditSources.length === 1 ? "" : "s"} · photos, animated GIFs, video posts, and live comment threads stay attached to each post.
          </p>
        )}
        <p className="mt-1 text-xs text-accent">{archiveLabel}</p>
        {sourceFacets.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Source tags</p>
            <p className="mt-1 text-xs text-muted">Every pull stamps source-* so you can filter by provider (and booru host / subreddit when present).</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={(tagFilterProp ? sourceFilter : tagFilter) === "all" ? "default" : "secondary"}
                onClick={() => { setTagFilter("all"); onSourceFilter?.("all"); }}
              >
                All sources · {adultVideos.length}
              </Button>
              {sourceFacets.map(([id, count]) => (
                <Button
                  key={id}
                  size="sm"
                  variant={(tagFilterProp ? sourceFilter : tagFilter) === id || tagFilter === `source-${id}` ? "default" : "secondary"}
                  onClick={() => { onSourceFilter?.(id); setTagFilter(`source-${id}`); }}
                >
                  {id} · {count}
                </Button>
              ))}
            </div>
          </div>
        )}
        {creatorFacets.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Creator tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {creatorFacets.map(([tag, count]) => (
                <Button
                  key={tag}
                  size="sm"
                  variant={tagFilter === tag ? "default" : "secondary"}
                  onClick={() => setTagFilter(tag)}
                >
                  #{tag} · {count}
                </Button>
              ))}
            </div>
          </div>
        )}
        {fetishFacets.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Interest tags
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fetishFacets.map(([tag, count]) => (
                <Button
                  key={tag}
                  size="sm"
                  variant={tagFilter === tag ? "default" : "secondary"}
                  onClick={() => setTagFilter(tag)}
                >
                  #{tag} · {count}
                </Button>
              ))}
            </div>
            {tagFilter.toLowerCase() !== "all" && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-xs text-accent">Selected #{tagFilter}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={remoteBusy}
                  onClick={() => {
                    const q = fetishSearchQuery(tagFilter.replace(/^fetish-/, "").replace(/^source-/, "").replace(/-/g, " "));
                    setQuery(q);
                    void searchAdultFeed(q, order, {
                      page: 1,
                      maxVideos: LIBRARY_LIMITS.adultInteractiveVideosPerPull,
                      providers,
                      ...redditPullOptions,
                    }).then((n) => toast.success(`Loaded ${n.toLocaleString()} for #${tagFilter}`));
                  }}
                >
                  Search providers for #{tagFilter}
                </Button>
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </section>
    </div>
  );
}
