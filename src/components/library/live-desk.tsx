import { useEffect, useMemo, useState } from "react";
import { Radio, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";
import { filterLiveRows, liveDeskRows, LIVE_SOURCES } from "@/lib/videos/live-desk";
import { VideoCard } from "./video-card";

export function LiveDesk({ videos, adultLiveVideos = [], staleTwitchCount = 0 }: {
  videos: LibraryVideo[]; adultLiveVideos?: LibraryVideo[]; staleTwitchCount?: number;
}) {
  const favorites = useLibrary(s => s.favorites);
  const likes = useLibrary(s => s.likes);
  const follows = useLibrary(s => s.follows);
  const refreshing = useLibrary(s => s.refreshing || s.remoteBusy);
  const refresh = useLibrary(s => s.refreshFollows);
  const follow = useLibrary(s => s.followRemoteQuery);
  const [adding, setAdding] = useState("");
  const setSource = useLibrary(s => s.setSource);
  const status = useLibrary(s => s.remoteRefreshStatus);
  const [source, setSourceFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("favorites");
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState(4);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("reelcase.live-desk") ?? "{}");
      if (["all", ...LIVE_SOURCES.map(s => s.id)].includes(saved.source)) setSourceFilter(saved.source);
      if (["all", "favorites", "likes"].includes(saved.filter)) setFilter(saved.filter);
      if (["favorites", "viewers", "name"].includes(saved.sort)) setSort(saved.sort);
      const count = Number(localStorage.getItem("reelcase.live-columns"));
      if ([3, 4, 6].includes(count)) setColumns(count);
    } catch { /* Keep defaults when saved preferences are unavailable. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("reelcase.live-desk", JSON.stringify({ source, filter, sort }));
      localStorage.setItem("reelcase.live-columns", String(columns));
    } catch { /* Session-only preferences. */ }
  }, [ready, source, filter, sort, columns]);
  useEffect(() => setLimits({}), [source, filter, search, sort]);
  const rows = useMemo(() => liveDeskRows(videos, adultLiveVideos), [videos, adultLiveVideos]);
  const counts = useMemo(() => Object.fromEntries(LIVE_SOURCES.map(s => [s.id, rows.filter(v => v.remote?.kind === s.id).length])), [rows]);
  const visible = useMemo(() => filterLiveRows(rows, { source, filter, sort, search, favorites, likes }), [rows, source, filter, sort, search, favorites, likes]);
  const twitchFollows = follows.filter(f => f.kind === "twitch");
  const twitchFailures = twitchFollows.filter(f => f.lastProviderFailure);
  const sources = LIVE_SOURCES.filter(s => source === "all" || source === s.id);
  const grid = columns === 3 ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : columns === 6 ? "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";
  const reset = () => { setSourceFilter("all"); setFilter("all"); setSearch(""); };

  return <section aria-label="Live streams">
    <header className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-7">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent"><Radio className="size-4"/>On air</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-3xl text-fg sm:text-4xl">Live, by source.</h1><p className="mt-2 text-sm text-muted">{rows.length.toLocaleString()} live streams in your library. Twitch and YouTube come first; Adult rooms have their own sections.</p></div>
        <Button variant="secondary" disabled={refreshing} onClick={() => void refresh(source === "twitch" || source === "youtube" ? source : undefined)}><RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"}/>{refreshing ? "Checking channels…" : source === "twitch" ? "Refresh Twitch" : source === "youtube" ? "Refresh YouTube" : "Refresh Twitch & YouTube"}</Button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter live by source">
        {[{ id: "all", label: "All sources" }, ...LIVE_SOURCES].map(s => <Button key={s.id} className="min-h-11" variant={source === s.id ? "default" : "secondary"} aria-pressed={source === s.id} onClick={() => setSourceFilter(s.id)}>{s.label} · {s.id === "all" ? rows.length : counts[s.id]}</Button>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter live by saved status">{[["all", "All streams"], ["favorites", "Favorites"], ["likes", "Liked"]].map(([id, label]) => <Button key={id} className="min-h-11" variant={filter === id ? "default" : "ghost"} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</Button>)}</div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Input className="min-w-0 basis-full sm:flex-1 sm:basis-auto" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a stream or creator" aria-label="Search live streams"/>
        <select aria-label="Sort live streams" className="min-h-11 max-w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg" value={sort} onChange={e => setSort(e.target.value)}><option value="favorites">Favorites first</option><option value="viewers">Most viewers</option><option value="name">Channel A–Z</option></select>
        <select aria-label="Live card size" className="min-h-11 max-w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg" value={columns} onChange={e => setColumns(Number(e.target.value))}><option value={3}>Large cards</option><option value={4}>Comfortable</option><option value={6}>Compact</option></select>
      </div>
      <p role="status" className="mt-4 text-sm text-muted">{visible.length.toLocaleString()} matching streams{status ? ` · Last channel batch: ${status.refreshed}/${status.checked} checked successfully${status.failed ? `, ${status.failed} unavailable` : ""}` : ""}</p>
    </header>

    {(source === "all" || source === "twitch") && <aside className="mb-6 rounded-lg border border-border bg-elevated p-4" aria-label="Twitch live status">
      <p className="text-sm font-medium text-fg">Twitch · {counts.twitch} live · {twitchFollows.length} followed</p>
      <p className="mt-1 text-sm text-muted">{!twitchFollows.length ? "No Twitch channels are saved in this library. Add channels from the Twitch desk to see them here." : staleTwitchCount ? `${staleTwitchCount} cached stream${staleTwitchCount === 1 ? " needs" : "s need"} a fresh check. Older observations are held out of the live grid.` : counts.twitch ? "Showing recently confirmed streams from your followed channels." : "No followed Twitch channel is currently confirmed live. Refresh to check the next batch."}</p>
      {twitchFailures.length > 0 && <p className="mt-2 text-sm text-muted">{twitchFailures.length} channel check{twitchFailures.length === 1 ? "" : "s"} failed. {twitchFailures[0].lastProviderFailure?.recovery}</p>}
      <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" disabled={refreshing || !twitchFollows.length} onClick={() => void refresh("twitch")}>Check Twitch channels</Button><Button variant="ghost" onClick={() => setSource("twitch")}>Manage Twitch channels</Button></div>
    </aside>}

    {!visible.length && <div className="mb-6 rounded-lg border border-border p-6"><h2 className="font-display text-2xl text-fg">No streams match this view</h2><p className="mt-2 text-sm text-muted">Try a different source, clear your search, or check your saved channels.</p><Button className="mt-4" variant="secondary" onClick={reset}>Reset live filters</Button></div>}
    {sources.map(s => {
      const items = visible.filter(v => v.remote?.kind === s.id);
      if (!items.length) return null;
      const limit = limits[s.id] ?? 24;
      const adult = s.id === "chaturbate" || s.id === "myfreecams";
      return <section key={s.id} className="mb-8" aria-label={`${s.label} live streams`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl text-fg">{s.label} <span className="text-base text-muted">{items.length.toLocaleString()} live{adult ? " · 18+" : ""}</span></h2>{adult && <Button variant="ghost" onClick={() => setSource("adults")}>Manage Adult sources</Button>}</div>
        <div className={grid}>{items.slice(0, limit).map((video, index) => <VideoCard key={video.id} video={video} variant="rail" index={index} className="w-full"/>)}</div>
        {items.length > limit && <Button className="mt-4" variant="secondary" onClick={() => setLimits(previous => ({ ...previous, [s.id]: limit + 24 }))}>Show more {s.label} · {items.length - limit} remaining</Button>}
      </section>;
    })}
    {(source === "all" || source === "twitch") && <details className="mt-6 rounded-lg border border-border bg-surface p-5"><summary className="cursor-pointer font-medium text-fg">Discover more Twitch channels</summary><p className="mt-2 text-sm text-muted">Following a channel adds it to your saved feed and checks its current status.</p><div className="mt-4 flex flex-wrap gap-2">{["twitch", "eslcs", "gamesdonequick", "otknetwork", "criticalrole"].filter(handle => !twitchFollows.some(f => f.handle.toLowerCase() === handle)).map(handle => <Button key={handle} variant="secondary" disabled={Boolean(adding)} onClick={() => void (async () => { setAdding(handle); try { await follow(handle, "twitch"); } finally { setAdding(""); } })()}>{adding === handle ? "Checking…" : `Follow ${handle}`}</Button>)}</div></details>}
  </section>;
}
