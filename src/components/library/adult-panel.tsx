import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Flag, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
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
  ADULT_SOURCE_OPTIONS,
  adultSourceTag,
  fetishSearchQuery,
  type AdultPullProvider,
} from "@/lib/videos/adult-sites";
import { ADULT_SOURCE_FILTERS, countAdultBySource } from "@/lib/videos/adult-filter";
import { ADULT_PROVIDER_ADAPTERS } from "@/lib/videos/adult-provider-adapters";
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
  { id: ["chaturbate", "camsoda", "myfreecams"], label: "Live cams" },
  { id: ["chaturbate"], label: "Chaturbate only" },
  { id: ["camsoda"], label: "CamSoda only" },
  { id: ["myfreecams"], label: "MyFreeCams only" },
  { id: ["reddit"], label: "Reddit (18+)" },
  { id: ["booru"], label: "Booru photos (18+)" },
  { id: ["redgifs"], label: "Redgifs (needs API key)" },
  { id: ["eporner"], label: "Eporner only" },
  { id: ["redtube"], label: "RedTube only" },
];

type RedditSourceSetting = { subreddit: string; priority: 1 | 2 | 3 };
const REDDIT_SOURCE_STORAGE_KEY = "reelcase.adult-reddit-sources.v1";

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
      settings.push({ subreddit, priority: priority >= 3 ? 3 : priority <= 1 ? 1 : 2 });
    }
    return settings;
  } catch {
    return [];
  }
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
  const [showAllFetishes, setShowAllFetishes] = useState(false);
  const [starQuery, setStarQuery] = useState("");
  const [stars, setStars] = useState<Array<{ name: string; thumb?: string; url?: string }>>([]);
  const [starNote, setStarNote] = useState("");
  const [archiveLabel, setArchiveLabel] = useState("No saved archive depth yet — Pull catalog starts at page 1.");
  const [autoArchiveRounds, setAutoArchiveRounds] = useState(0);
  const [adultMaxVideos, setAdultMaxVideos] = useState<number>(LIBRARY_LIMITS.adultInteractiveVideosPerPull);
  const [useCustomRedditSources, setUseCustomRedditSources] = useState(false);
  const [redditSources, setRedditSources] = useState<RedditSourceSetting[]>([]);
  const [redditSourceInput, setRedditSourceInput] = useState("");

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
    setUseCustomRedditSources(localStorage.getItem(`${REDDIT_SOURCE_STORAGE_KEY}.enabled`) === "true" && saved.length > 0);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(REDDIT_SOURCE_STORAGE_KEY, JSON.stringify(redditSources));
      localStorage.setItem(`${REDDIT_SOURCE_STORAGE_KEY}.enabled`, String(useCustomRedditSources));
    } catch {
      // Source choices remain usable for this session if local storage is full.
    }
  }, [redditSources, useCustomRedditSources]);

  const redditPullOptions = useMemo(
    () => useCustomRedditSources && redditSources.length ? { redditSources } : {},
    [redditSources, useCustomRedditSources],
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
    if (!facetsReady) return [] as Array<readonly [string, number]>;
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
  }, [adultVideos, facetsReady, tags]);

  const fetishFacets = useMemo(() => {
    if (!facetsReady) return [] as Array<readonly [string, number]>;
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
  }, [adultVideos, facetsReady, tags]);

  useEffect(() => {
    if (!autoPull || booted) return;
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
  }, [adultMaxVideos, autoPull, booted, adultVideos.length, redditPullOptions, searchAdultFeed]);

  const refreshArchiveLabel = (q: string, ord: string) => {
    setArchiveLabel(adultArchiveDepthLabel(loadAdultArchiveCursors(q, ord)));
  };

  useEffect(() => {
    refreshArchiveLabel(query.trim() || "all", order);
  }, [query, order, adultVideos.length]);

  const runSearch = (append = false, resume = false) => {
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

  // After the interactive first pull is usable, quietly advance a few saved
  // provider cursors. This imports more variety without turning first paint
  // into a long blocking crawl or repeatedly hammering an unavailable source.
  useEffect(() => {
    if (
      !autoPull
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
  }, [adultVideos.length, autoArchiveRounds, autoPull, order, providers, query, redditPullOptions, remoteBusy]);

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
          Official public APIs: Eporner, RedTube, Chaturbate embeds, CamSoda room pages, the MyFreeCams online list,
          Reddit public Atom RSS for curated 18+ subs, and Gelbooru-style booru JSON (XBooru / TBIB / Hypnohub). If one source errors, the others still fill the shelf.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ADULT_EMBED_LINKS.map((site) => (
            <SiteCard key={site.name} {...site} />
          ))}
        </div>
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
                  {sites.map((site) => (
                    <SiteCard
                      key={`${site.sourceId ?? site.name}-${site.href}`}
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
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Remote pull</p>
        <h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">Adult discovery</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
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
            Use the curated rotation, or switch to your own communities. Each imported Reddit photo and video receives both
            <code className="mx-1 text-fg">source-reddit-*</code> and <code className="text-fg">sub-*</code> tags for filtering.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={useCustomRedditSources ? "default" : "secondary"}
              onClick={() => setUseCustomRedditSources((enabled) => !enabled)}
              disabled={!redditSources.length}
            >
              {useCustomRedditSources ? "Using my source list" : "Use my source list"}
            </Button>
            <span className="text-xs text-muted">
              {useCustomRedditSources ? `${redditSources.length} selected communities` : "Curated rotation active"}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={redditSourceInput}
              onChange={(event) => setRedditSourceInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  const subreddit = redditSourceInput.trim().replace(/^r\//i, "");
                  if (!/^[a-z0-9_]{3,48}$/i.test(subreddit)) return toast.error("Enter a valid subreddit name.");
                  setRedditSources((current) => current.some((row) => row.subreddit.toLowerCase() === subreddit.toLowerCase()) ? current : [...current, { subreddit, priority: 2 }]);
                  setUseCustomRedditSources(true);
                  setRedditSourceInput("");
                }
              }}
              placeholder="Add subreddit, e.g. ExampleSub"
              aria-label="Add Reddit source"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const subreddit = redditSourceInput.trim().replace(/^r\//i, "");
                if (!/^[a-z0-9_]{3,48}$/i.test(subreddit)) return toast.error("Enter a valid subreddit name.");
                setRedditSources((current) => current.some((row) => row.subreddit.toLowerCase() === subreddit.toLowerCase()) ? current : [...current, { subreddit, priority: 2 }]);
                setUseCustomRedditSources(true);
                setRedditSourceInput("");
              }}
            >
              Add source
            </Button>
          </div>
          {redditSources.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {redditSources.slice().sort((a, b) => b.priority - a.priority || a.subreddit.localeCompare(b.subreddit)).map((source) => (
                <div key={source.subreddit} className="flex items-center gap-1 rounded-full bg-surface py-1 pl-3 pr-1 text-xs text-muted shadow-border">
                  <span>r/{source.subreddit}</span>
                  {([3, 2, 1] as const).map((priority) => (
                    <Button
                      key={priority}
                      size="sm"
                      className="h-6 px-1.5 text-[10px]"
                      variant={source.priority === priority ? "default" : "ghost"}
                      onClick={() => setRedditSources((current) => current.map((row) => row.subreddit === source.subreddit ? { ...row, priority } : row))}
                    >
                      {priority === 3 ? "High" : priority === 2 ? "Normal" : "Low"}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    className="h-6 px-1.5 text-[10px]"
                    variant="ghost"
                    onClick={() => setRedditSources((current) => current.filter((row) => row.subreddit !== source.subreddit))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </details>

        <div className="mt-4">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Featured fetish pulls</p>
          <p className="mt-1 text-xs text-muted">
            Clicking a chip searches official APIs for that keyword (DP expands to double penetration) and stamps fetish tags on ingested titles.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ADULT_FEATURED_FETISH_TAGS.map((tag) => (
              <Button
                key={tag}
                size="sm"
                variant="default"
                disabled={remoteBusy}
                onClick={() => {
                  const q = fetishSearchQuery(tag);
                  setQuery(q);
                  setTagFilter(`fetish-${q.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`);
                  void searchAdultFeed(q, order, {
                    page: 1,
                    maxVideos: adultMaxVideos,
                    providers,
                    ...redditPullOptions,
                  }).then((n) => toast.success(`Loaded ${n.toLocaleString()} for #${tag}`));
                }}
              >
                #{tag}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Full fetish catalog</p>
            <Button size="sm" variant="secondary" onClick={() => setShowAllFetishes((v) => !v)}>
              {showAllFetishes ? "Hide extra chips" : `Show all ${ADULT_CURATED_FETISH_TAGS.length} chips`}
            </Button>
          </div>
          {showAllFetishes && (
            <div className="mt-2 flex flex-wrap gap-2">
              {ADULT_CURATED_FETISH_TAGS.filter((tag) => !(ADULT_FEATURED_FETISH_TAGS as readonly string[]).includes(tag)).map((tag) => (
                <Button
                  key={tag}
                  size="sm"
                  variant="secondary"
                  disabled={remoteBusy}
                  onClick={() => {
                    const q = fetishSearchQuery(tag);
                    setQuery(q);
                    setTagFilter(`fetish-${q.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`);
                  void searchAdultFeed(q, order, {
                    page: 1,
                    maxVideos: adultMaxVideos,
                    providers,
                    ...redditPullOptions,
                    }).then((n) => toast.success(`Loaded ${n.toLocaleString()} for #${tag}`));
                  }}
                >
                  #{tag}
                </Button>
              ))}
            </div>
          )}
        </div>

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
                void searchAdultFeed(q, order, {
                  providers: ["redtube"],
                  maxVideos: LIBRARY_LIMITS.redtubeStarVideosPerPull,
                }).then((n) => toast.success(`Loaded ${n.toLocaleString()} for ${q}`));
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
                    void searchAdultFeed(star.name, order, {
                      providers: ["redtube"],
                      maxVideos: LIBRARY_LIMITS.redtubeStarVideosPerPull,
                    }).then((n) => toast.success(`Loaded ${n.toLocaleString()} for ${star.name}`));
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
      </section>
    </div>
  );
}
