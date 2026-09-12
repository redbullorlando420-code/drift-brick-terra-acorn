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

function SiteCard({
  name,
  href,
  copy,
  embeds,
  badge,
  sourceId,
}: {
  name: string;
  href: string;
  copy: string;
  embeds?: boolean;
  badge?: string;
  sourceId?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group rounded-lg bg-surface p-4 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-xl text-fg">{name}</p>
        {(embeds || badge) && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-accent uppercase">
            {badge ?? "Embeds"}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">{copy}</p>
      {sourceId && (
        <p className="mt-2 text-[10px] tracking-wide text-subtle uppercase">
          source tag · #{adultSourceTag(sourceId)}
        </p>
      )}
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        Open site <ExternalLink className="size-3.5" />
      </span>
    </a>
  );
}

export function AdultPanel({
  showMilestones = false,
  autoPull = true,
}: {
  /** Link-out hub + milestone catalogs — deferred behind Adults deep shelves. */
  showMilestones?: boolean;
  /** Soft first pull when the cache is thin; explore can disable for render-only. */
  autoPull?: boolean;
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
  const [tagFilter, setTagFilter] = useState("all");
  const [nextPage, setNextPage] = useState(2);
  const [showAllFetishes, setShowAllFetishes] = useState(false);
  const [archiveLabel, setArchiveLabel] = useState("No saved archive depth yet — Pull catalog starts at page 1.");

  const sourceFacets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const video of adultVideos) {
      for (const tag of tags[video.id] ?? []) {
        if (tag.startsWith("source-")) counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [adultVideos, tags]);

  const creatorFacets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const video of adultVideos) {
      for (const tag of tags[video.id] ?? []) {
        if (tag.startsWith("creator-")) counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 36);
  }, [adultVideos, tags]);

  const fetishFacets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const video of adultVideos) {
      for (const tag of tags[video.id] ?? []) {
        if (tag.startsWith("source-") || tag.startsWith("provider-") || tag.startsWith("format-") || tag.startsWith("genre-") || tag.startsWith("creator-")) {
          continue;
        }
        if (tag.startsWith("fetish-") || tag.length >= 3) {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 48);
  }, [adultVideos, tags]);

  useEffect(() => {
    if (!autoPull || booted) return;
    setBooted(true);
    // Cached IndexedDB shelves already paint on fast-start; only top up a thin cache.
    if (adultVideos.length >= LIBRARY_LIMITS.adultFastStartVideosPerPull) return;
    void searchAdultFeed("all", "top-weekly", {
      providers: "all",
      maxVideos: LIBRARY_LIMITS.adultFastStartVideosPerPull,
    })
      .then((n) => {
        setNextPage(2);
        if (n) toast.success(`Loaded ${n.toLocaleString()} adult titles`);
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not load adult feed.");
      });
  }, [autoPull, booted, adultVideos.length, searchAdultFeed]);

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
      maxVideos: LIBRARY_LIMITS.epornerVideosPerPull,
      append: append || resume,
      providers,
      providerPages,
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

  const milestoneLinks = ADULT_MILESTONE_LINKS.filter((site) => site.href !== ADULT_CATEGORY_HUB.href);

  return (
    <div className="mb-6 space-y-5">
      {showMilestones && (
        <>
      <section className="rounded-xl bg-elevated p-5 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Category hub</p>
        <h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">ThePornDude directory</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Use ThePornDude as the main adult category map (tubes, cams, anime, games, niche lists).
          In-app playback comes from official public APIs below; other destinations stay as milestones
          with labeled source tags.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SiteCard {...ADULT_CATEGORY_HUB} badge="Hub" />
        </div>
      </section>

      <section className="rounded-xl bg-elevated p-5 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult sites</p>
        <h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">Embed-ready pull sources</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Official public APIs: Eporner, RedTube, Chaturbate embeds, CamSoda room pages, the MyFreeCams online list,
          Reddit public Atom RSS for curated 18+ subs, and Gelbooru-style booru JSON (XBooru / TBIB / Hypnohub). If one source errors, the others still fill the shelf.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ADULT_EMBED_LINKS.map((site) => (
            <SiteCard key={site.name} {...site} />
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-elevated p-5 shadow-border">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-9 items-center justify-center rounded-lg bg-surface text-accent shadow-border">
            <Flag className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Adult milestones
            </p>
            <h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">
              Link-out destinations
            </h2>
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
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sites.map((site) => (
                    <SiteCard
                      key={`${site.sourceId ?? site.name}-${site.href}`}
                      {...site}
                      badge={group === "cam" || group === "voyeur" ? "Cam/chat" : group === "download" || group === "torrent" ? "Link-out only" : group === "community" || group === "blog" ? "Link-out" : "Milestone"}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
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
          (up to {LIBRARY_LIMITS.epornerVideosPerPull.toLocaleString()} titles per pull). Every pulled
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
                  void searchAdultFeed(q, order, {
                    page: 1,
                    maxVideos: LIBRARY_LIMITS.epornerVideosPerPull,
                    providers,
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
                    void searchAdultFeed(q, order, {
                      page: 1,
                      maxVideos: LIBRARY_LIMITS.epornerVideosPerPull,
                      providers,
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
        <p className="mt-3 text-xs text-muted">
          Cached adult titles: {adultVideos.length.toLocaleString()}
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
                variant={tagFilter === "all" ? "default" : "secondary"}
                onClick={() => setTagFilter("all")}
              >
                All sources · {adultVideos.length}
              </Button>
              {sourceFacets.map(([tag, count]) => (
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
              Fetish / keyword tags
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
            {tagFilter !== "all" && (
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
                      maxVideos: LIBRARY_LIMITS.epornerVideosPerPull,
                      providers,
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
