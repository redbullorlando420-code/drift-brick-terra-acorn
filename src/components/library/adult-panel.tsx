import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Flag, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import { ADULT_CATEGORY_HUB, ADULT_EMBED_LINKS, ADULT_MILESTONE_LINKS } from "@/lib/videos/adult-sites";
import { selectEporner, useLibrary } from "@/lib/videos/store";

const ORDERS: { id: string; label: string }[] = [
  { id: "top-weekly", label: "Top this week" },
  { id: "most-popular", label: "Most popular" },
  { id: "latest", label: "Latest" },
  { id: "top-rated", label: "Top rated" },
];

function SiteCard({
  name,
  href,
  copy,
  embeds,
  badge,
}: {
  name: string;
  href: string;
  copy: string;
  embeds?: boolean;
  badge?: string;
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
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        Open site <ExternalLink className="size-3.5" />
      </span>
    </a>
  );
}

export function AdultPanel() {
  const searchAdultFeed = useLibrary((s) => s.searchAdultFeed);
  const remoteBusy = useLibrary((s) => s.remoteBusy);
  const importProgress = useLibrary((s) => s.importProgress);
  const tags = useLibrary((s) => s.tags);
  const epornerVideos = useLibrary(useShallow(selectEporner));
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("top-weekly");
  const [booted, setBooted] = useState(false);
  const [tagFilter, setTagFilter] = useState("all");
  const [nextPage, setNextPage] = useState(2);

  const tagFacets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const video of epornerVideos) {
      for (const tag of tags[video.id] ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 36);
  }, [epornerVideos, tags]);

  useEffect(() => {
    if (booted) return;
    setBooted(true);
    if (epornerVideos.length >= 200) return;
    void searchAdultFeed("all", "top-weekly")
      .then((n) => {
        setNextPage(1 + Math.ceil(Math.max(n, 1) / LIBRARY_LIMITS.epornerPageSize));
        if (n) toast.success(`Loaded ${n.toLocaleString()} Eporner titles`);
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not load adult feed.");
      });
  }, [booted, epornerVideos.length, searchAdultFeed]);

  const runSearch = (append = false) => {
    const q = query.trim() || "all";
    const page = append ? nextPage : 1;
    void searchAdultFeed(q, order, {
      page,
      maxVideos: LIBRARY_LIMITS.epornerVideosPerPull,
      append,
    })
      .then((n) => {
        setNextPage(page + LIBRARY_LIMITS.epornerPagesPerPull);
        setTagFilter("all");
        toast.success(
          n
            ? `${append ? "Catalog now has" : "Loaded"} ${n.toLocaleString()} Eporner titles`
            : "No results",
        );
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Search failed");
      });
  };

  return (
    <div className="mb-6 space-y-5">
      <section className="rounded-xl bg-elevated p-5 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Category hub</p>
        <h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">ThePornDude directory</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Use ThePornDude as the main adult category map (tubes, cams, anime, games, niche lists).
          In-app playback still comes from Eporner below; other destinations stay as milestones.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SiteCard {...ADULT_CATEGORY_HUB} badge="Hub" />
        </div>
      </section>

      <section className="rounded-xl bg-elevated p-5 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult sites</p>
        <h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">Embed-ready sources</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Only sources with an official public API or iframe embed path appear here. Eporner powers
          a YouTube/Twitch-scale in-app catalog below; everything else is tracked under Adult
          milestones as a link-out.
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
              These sites do not expose a public discovery/embed API we can use without scraping or
              bypassing logins/paywalls. Reelcase keeps them as milestones — open the official page
              in a new tab.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ADULT_MILESTONE_LINKS.filter((site) => site.href !== ADULT_CATEGORY_HUB.href).map((site) => (
            <SiteCard
              key={site.name}
              {...site}
              badge={site.group === "cam" ? "Cam/chat" : "Milestone"}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-elevated p-5 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Remote pull</p>
        <h2 className="mt-2 font-display text-2xl text-fg sm:text-3xl">Eporner discovery</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Paginated pulls via{" "}
          <a
            href="https://www.eporner.com/api/v2/"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:text-fg"
          >
            Eporner API v2
          </a>{" "}
          (up to {LIBRARY_LIMITS.epornerVideosPerPull.toLocaleString()} titles per pull,{" "}
          {LIBRARY_LIMITS.epornerPageSize.toLocaleString()} per page). Provider keywords become local
          tags for browse/filter. Cards open the same preview + in-app play window as YouTube and
          Twitch.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch(false);
              }}
              placeholder="Search Eporner (empty = all)"
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
            disabled={remoteBusy || !epornerVideos.length}
          >
            Load more
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Cached Eporner titles: {epornerVideos.length.toLocaleString()}
          {importProgress ? ` · ${importProgress.label}` : ""}
        </p>
        {tagFacets.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Provider tags
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={tagFilter === "all" ? "default" : "secondary"}
                onClick={() => setTagFilter("all")}
              >
                All tags · {epornerVideos.length}
              </Button>
              {tagFacets.map(([tag, count]) => (
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
                    setQuery(tagFilter);
                    void searchAdultFeed(tagFilter, order, {
                      page: 1,
                      maxVideos: LIBRARY_LIMITS.epornerVideosPerPull,
                    }).then((n) => toast.success(`Loaded ${n.toLocaleString()} for #${tagFilter}`));
                  }}
                >
                  Search Eporner for #{tagFilter}
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
