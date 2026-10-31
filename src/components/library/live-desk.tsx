import { YoutubeUpcoming } from './youtube-upcoming';
import { forEachCatalogSlice, yieldCatalogTask } from '@/lib/catalog-work';
import { useLiveRoomPage } from './use-live-room-page';
import { rememberVideo } from '@/lib/videos/video-lookup';
import { TwitchLiveCheckStatus } from './twitch-live-check-status';
import { useEffect, useMemo, useState } from "react";
import { Radio, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";
import { filterLiveRows, liveDeskRows, liveResultPage, LIVE_SOURCES } from "@/lib/videos/live-desk";
import { VideoCard } from "./video-card";
import { verifiedYoutubeSource, youtubeFollowHealth } from '@/lib/videos/follow-import';
import { YoutubeLiveCheckStatus } from './youtube-live-check-status';

export function LiveDesk({ videos, adultLiveVideos = [], staleYoutubeVideos = [], staleTwitchVideos = [], staleTwitchCount = 0, staleYoutubeCount = 0 }: {
  videos: LibraryVideo[]; adultLiveVideos?: LibraryVideo[]; staleYoutubeVideos?: LibraryVideo[]; staleTwitchVideos?: LibraryVideo[]; staleTwitchCount?: number; staleYoutubeCount?: number;
}) {
  const favorites = useLibrary(s => s.favorites);
  const likes = useLibrary(s => s.likes);
  const follows = useLibrary(s => s.follows);
  const twitchChecking = useLibrary(s => s.twitchLiveProgress?.status === 'running');
  const youtubeChecking = useLibrary(s => s.youtubeLiveProgress?.status === 'running');
  const refresh = useLibrary(s => s.refreshFollows);
  const follow = useLibrary(s => s.followRemoteQuery);
  const [adding, setAdding] = useState("");
  const setSource = useLibrary(s => s.setSource);
  const status = useLibrary(s => s.remoteRefreshStatus);
  const activity = useLibrary(s => s.pullActivity);
  const checkLive = (kind?: 'twitch' | 'youtube') => kind
    ? refresh(kind, { liveSweep: true, twitchLiveOnly: kind === 'twitch', youtubeLiveOnly: kind === 'youtube' })
    : Promise.all([refresh('twitch', { liveSweep: true, twitchLiveOnly: true }), refresh('youtube', { liveSweep: true, youtubeLiveOnly: true })]);
  const [source, setSourceFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("favorites");
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState(4);

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

  const unlocked = useLibrary(state => state.adultsUnlocked);
  const hidden = useLibrary(state => state.hiddenVideos), unavailable = useLibrary(state => state.unavailable);
  const catalog = useLibrary(state => state.videos);
  const tags = useLibrary(state => state.tags), showHiddenAdult = useLibrary(state => state.showHiddenAdult);
  const [cachedRooms, setCachedRooms] = useState<LibraryVideo[]>([]);
  const chaturbate = useLiveRoomPage('chaturbate', ready && unlocked && (source === 'all' || source === 'chaturbate'));
  const myfreecams = useLiveRoomPage('myfreecams', ready && unlocked && (source === 'all' || source === 'myfreecams'));
  useEffect(() => {
    if (!unlocked || !['all', 'chaturbate', 'myfreecams'].includes(source) || chaturbate.page && myfreecams.page && !chaturbate.error && !myfreecams.error) return;
    let stopped = false; const found: LibraryVideo[] = [], counts = { chaturbate: 0, myfreecams: 0 };
    void forEachCatalogSlice(catalog, video => {
      const kind = video.remote?.kind;
      if ((kind === 'chaturbate' || kind === 'myfreecams') && video.remote?.live && counts[kind] < 24) { counts[kind]++; found.push(video); }
    }, async () => { await yieldCatalogTask(); if (stopped) throw new Error('obsolete live fallback'); }).then(() => { if (!stopped) setCachedRooms(found); }).catch(() => {});
    return () => { stopped = true; };
  }, [catalog, unlocked, source, Boolean(chaturbate.page), Boolean(myfreecams.page), Boolean(chaturbate.error), Boolean(myfreecams.error)]);
  const roomVideos = useMemo(() => unlocked ? [chaturbate, myfreecams].flatMap((listing, index) => {
    const provider = index === 0 ? 'chaturbate' : 'myfreecams';
    const fallback = [...new Map([...adultLiveVideos, ...cachedRooms].filter(video => video.remote?.kind === provider).map(video => [video.id, video])).values()].slice(0, 24);
    const items = listing.page && (listing.page.videos.length || !listing.error && !listing.stale) ? listing.page.videos : fallback;
    return items.filter(video => !hidden[video.id] && !unavailable[video.id] && (showHiddenAdult || !(tags[video.id] ?? []).includes('hidden'))).map(video => !listing.page || listing.stale || listing.error
      ? { ...video, remote: { ...video.remote!, liveUnconfirmed: true } } : video);
  }) : [], [unlocked, chaturbate.page, chaturbate.error, chaturbate.stale, myfreecams.page, myfreecams.error, myfreecams.stale, adultLiveVideos, cachedRooms, hidden, unavailable, tags, showHiddenAdult]);
  useEffect(() => { for (const video of roomVideos) rememberVideo(catalog, video); }, [catalog, roomVideos]);
  const rows = useMemo(() => liveDeskRows(videos, roomVideos), [videos, roomVideos]);
  const counts = useMemo(() => Object.fromEntries(LIVE_SOURCES.map(s => [s.id, (s.id === 'chaturbate' ? chaturbate.page?.total : s.id === 'myfreecams' ? myfreecams.page?.total : undefined) ?? rows.filter(v => v.remote?.kind === s.id).length])), [rows, chaturbate.page, myfreecams.page]);
  const visible = useMemo(() => filterLiveRows(rows, { source, filter, sort, search, favorites, likes }), [rows, source, filter, sort, search, favorites, likes]);
  const recentlyLiveYoutube = useMemo(() => filterLiveRows(staleYoutubeVideos.map(video => ({
    ...video,
    tagline: "Last seen live · waiting for a fresh YouTube check",
    remote: video.remote ? { ...video.remote, live: true, liveUnconfirmed: true } : video.remote,
  })), { source, filter, sort, search, favorites, likes }), [staleYoutubeVideos, source, filter, sort, search, favorites, likes]);
  const recentlyLiveTwitch = useMemo(() => filterLiveRows(staleTwitchVideos.map(video => ({ ...video,
    tagline: 'Live status needs a fresh check · not confirmed offline', remote: video.remote ? { ...video.remote, live: true, liveUnconfirmed:true } : video.remote,
  })), { source, filter, sort, search, favorites, likes }), [staleTwitchVideos, source, filter, sort, search, favorites, likes]);
  const liveChecking = source === 'youtube' ? youtubeChecking : source === 'twitch' ? twitchChecking : youtubeChecking || twitchChecking;
  const roomSource = source === 'chaturbate' ? chaturbate : source === 'myfreecams' ? myfreecams : null;
  const twitchFollows = follows.filter(f => f.kind === "twitch");
  const youtubeFollows = follows.filter(f => verifiedYoutubeSource(f) && !f.id.startsWith("ytpl:"));
  const youtubeHealth = youtubeFollowHealth(follows);
  const youtubeFailures = youtubeFollows.filter(f => f.lastLiveFailure);
  const lastYoutubeLiveCheck = Math.max(0, ...youtubeFollows.map(f => f.liveCheckedAt ?? 0));
  const twitchFailures = twitchFollows.filter(f => f.lastLiveFailure);
  const lastTwitchLiveCheck = Math.max(0, ...twitchFollows.map(f => f.liveCheckedAt ?? 0));
  const sources = LIVE_SOURCES.filter(s => source === "all" || source === s.id);
  const grid = columns === 3 ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : columns === 6 ? "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";
  const reset = () => { setSourceFilter("all"); setFilter("all"); setSearch(""); };

  return <section aria-label="Live streams">
    <header className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-7">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent"><Radio className="size-4"/>On air</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-3xl text-fg sm:text-4xl">Live, by source.</h1><p className="mt-2 text-sm text-muted">{rows.length.toLocaleString()} loaded stream results. Twitch and YouTube use your follows; Adult directories load their own pages.</p></div>
        <Button variant="secondary" disabled={roomSource ? roomSource.busy : liveChecking} onClick={() => void (roomSource ? roomSource.refresh() : checkLive(source === 'youtube' || source === 'twitch' ? source : undefined))}><RefreshCw className={(roomSource ? roomSource.busy : liveChecking) ? "size-4 animate-spin" : "size-4"}/>{roomSource ? roomSource.busy ? "Checking rooms…" : "Refresh room directory" : liveChecking ? "Checking channels…" : source === "twitch" ? "Refresh Twitch live" : source === "youtube" ? "Check YouTube live" : "Refresh Twitch & YouTube"}</Button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter live by source">
        {[{ id: "all", label: "All sources" }, ...LIVE_SOURCES].map(s => <Button key={s.id} className="min-h-11" variant={source === s.id ? "default" : "secondary"} aria-pressed={source === s.id} onClick={() => setSourceFilter(s.id)}>{s.label} · {s.id === "all" ? rows.length : counts[s.id]}</Button>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter live by saved status">{[["all", "All streams"], ["favorites", "Favorites"], ["likes", "Liked"]].map(([id, label]) => <Button key={id} className="min-h-11" variant={filter === id ? "default" : "ghost"} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</Button>)}</div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Input className="min-w-0 basis-full sm:flex-1 sm:basis-auto" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a loaded stream or creator" aria-label="Search live streams"/>
        <select aria-label="Sort live streams" className="min-h-11 max-w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg" value={sort} onChange={e => setSort(e.target.value)}><option value="favorites">Favorites first</option><option value="viewers">Most viewers</option><option value="name">Channel A–Z</option></select>
        <select aria-label="Live card size" className="min-h-11 max-w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg" value={columns} onChange={e => setColumns(Number(e.target.value))}><option value={3}>Large cards</option><option value={4}>Comfortable</option><option value={6}>Compact</option></select>
      </div>
      <p role="status" className="mt-4 text-sm text-muted">{visible.length.toLocaleString()} matching streams{status ? ` · Last channel batch: ${status.refreshed}/${status.checked} checked successfully${status.failed ? `, ${status.failed} unavailable` : ""}` : ""}</p>
      <p className="mt-2 text-xs leading-5 text-muted">YouTube uses concurrent viewers when provided; missing or old counts sort after current counts. Streams have a 10-minute hold before leaving the live list. Search filters saved Twitch/YouTube streams and the current Adult directory pages. Next/Previous changes pages without growing the grid. Refresh checks eligible followed channels without downloading archives. Automatic checks keep known streams fresh while discovering broadcasts on other followed channels. Provider cooldowns keep their retry time.</p>
      {activity && /live check/i.test(activity.action) && <p role="status" aria-live="polite" className="mt-3 text-sm text-accent">Checking live channels · {activity.done.toLocaleString()} / {activity.total.toLocaleString()} · {activity.received.toLocaleString()} broadcasts found{activity.failed ? ` · ${activity.failed} unavailable` : ''}</p>}
    </header>

    {(source === "all" || source === "twitch") && <aside className="mb-6 rounded-lg border border-border bg-elevated p-4" aria-label="Twitch live status">
      <p className="text-sm font-medium text-fg">Twitch · {counts.twitch} live · {twitchFollows.length} followed</p>
      <p className="mt-1 text-sm text-muted">{!twitchFollows.length ? "No Twitch channels are saved in this library. Add channels from the Twitch desk to see them here." : staleTwitchCount ? `${staleTwitchCount} cached stream${staleTwitchCount === 1 ? " needs" : "s need"} a fresh check. Older observations are held out of the live grid.` : counts.twitch ? "Showing recently confirmed streams from your followed channels." : "No followed Twitch channel is currently confirmed live. Refresh checks every eligible followed channel."}{lastTwitchLiveCheck ? ` Last Twitch check ${new Date(lastTwitchLiveCheck).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.` : ""}</p>
      {twitchFailures.length > 0 && <p className="mt-2 text-sm text-muted">{twitchFailures.length} live check{twitchFailures.length === 1 ? "" : "s"} failed. {twitchFailures[0].lastLiveFailure?.recovery}</p>}
      <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" disabled={twitchChecking || !twitchFollows.length} onClick={() => void checkLive("twitch")}>Check Twitch live now</Button><Button variant="ghost" onClick={() => setSource("twitch")}>Manage Twitch channels</Button></div>
    </aside>}

    {(source === "all" || source === "youtube") && <aside className="mb-6 rounded-lg border border-border bg-elevated p-4" aria-label="YouTube live status">
      <p className="text-sm font-medium text-fg">YouTube · {counts.youtube} live · {youtubeFollows.length.toLocaleString()} verified creators</p>
      {(youtubeHealth.pending > 0 || youtubeHealth.review > 0) && <p className="mt-1 text-xs text-muted">{youtubeHealth.pending.toLocaleString()} names awaiting channel verification · {youtubeHealth.review.toLocaleString()} legacy fragments held for review.</p>}
      <p className="mt-1 text-sm text-muted">{!youtubeFollows.length ? "Follow YouTube creators to check their current broadcasts here." : staleYoutubeCount ? `${staleYoutubeCount} saved stream${staleYoutubeCount === 1 ? " needs" : "s need"} confirmation. YouTube streams remain on the live list for 10 minutes while checks recover. Known-live creators get priority while other channels rotate.` : counts.youtube ? "Streams stay here for 10 minutes after a missing broadcast while rechecks continue. A fresh live observation resets that hold." : "No followed creator is currently confirmed live. YouTube checks continue in rotating batches."}{lastYoutubeLiveCheck ? ` Last creator check ${new Date(lastYoutubeLiveCheck).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.` : ""}</p>
      {youtubeFailures.length > 0 && <p className="mt-2 text-sm text-muted">{youtubeFailures.length} live check{youtubeFailures.length === 1 ? "" : "s"} failed. {youtubeFailures[0].lastLiveFailure?.recovery}</p>}
      <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" disabled={youtubeChecking || !youtubeFollows.length} onClick={() => void checkLive("youtube")}>Check YouTube live now</Button><Button variant="ghost" onClick={() => setSource("youtube")}>Manage YouTube creators</Button></div>
    </aside>}

    {(source === 'all' || source === 'twitch') && <TwitchLiveCheckStatus action={false} />}
    {(source === 'all' || source === 'youtube') && <YoutubeLiveCheckStatus action={false} />}
    {!unlocked && (source === 'all' || source === 'chaturbate' || source === 'myfreecams') && <p className="mb-5 text-sm text-muted">Adult rooms are locked. <Button variant="ghost" onClick={() => setSource('adults')}>Open Adults</Button></p>}

    {!visible.length && !recentlyLiveYoutube.length && !recentlyLiveTwitch.length && <div className="mb-6 rounded-lg border border-border p-6"><h2 className="font-display text-2xl text-fg">No streams match this view</h2><p className="mt-2 text-sm text-muted">Try a different source, clear your search, or check your saved channels.</p><Button className="mt-4" variant="secondary" onClick={reset}>Reset live filters</Button></div>}
    {sources.map(s => {
      const items = visible.filter(v => v.remote?.kind === s.id);
      const adult = s.id === 'chaturbate' || s.id === 'myfreecams';
      if (adult && !unlocked || !adult && !items.length) return null;
      const listing = s.id === 'chaturbate' ? chaturbate : myfreecams;
      return <section key={s.id} className="mb-8" aria-label={s.label + ' live streams'}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl text-fg">{s.label} <span className="text-base text-muted">{adult ? listing.page ? listing.page.total.toLocaleString() + ' in directory · 18+' : 'public rooms · 18+' : items.length.toLocaleString() + ' live'}</span></h2>
          {adult && <Button variant="secondary" disabled={listing.busy} onClick={() => void listing.refresh()}>{listing.busy ? 'Loading rooms…' : 'Refresh ' + s.label + ' rooms'}</Button>}
        </div>
        {adult ? <>
          <p className="mb-3 text-xs text-muted">{listing.page ? 'Directory checked ' + new Date(listing.page.checkedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '. Public room availability may change between pages.' : 'Loading this source directly; no Adult archive pull is required.'}</p>
          {listing.error && <p role="status" className="mb-3 rounded-md border border-border p-3 text-sm text-accent">{listing.error} {listing.page ? 'Previous rooms are kept as unconfirmed.' : 'Use Refresh to retry this source.'}</p>}
          {listing.retryAt && listing.retryAt > Date.now() && <p className="mb-3 text-xs text-muted">Retry after {new Date(listing.retryAt).toLocaleTimeString()}.</p>}
          {listing.busy && <p role="status" className="mb-3 text-sm text-muted">Loading {s.label} directory page…</p>}
          <div className={grid}>{items.map((video, index) => <LiveRoomCard key={video.id} video={video} index={index} />)}</div>
          {!items.length && !listing.busy && <p className="py-4 text-sm text-muted">{listing.page?.videos.length ? 'No rooms on this page match your filters. Try the next page or clear your search.' : listing.error ? 'This directory is currently unavailable.' : 'No public rooms returned on this page.'}</p>}
          <nav aria-label={s.label + ' directory pages'} className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="secondary" disabled={listing.busy || listing.index === 0} onClick={() => void listing.previous()}>Previous {s.label} page</Button>
            <span className="text-sm text-muted">Page {listing.index + 1}{listing.page ? ' · ' + items.length + ' shown' : ''}</span>
            <Button variant="secondary" disabled={listing.busy || listing.page?.nextOffset == null} onClick={() => void listing.next()}>Next {s.label} page</Button>
          </nav>
        </> : <LivePageGrid key={s.id + ':' + filter + ':' + search + ':' + sort} items={items} label={s.label} grid={grid} />}
      </section>;
    })}
    {(source==='all'||source==='youtube')&&<YoutubeUpcoming/>}
    {recentlyLiveYoutube.length > 0 && (source === "all" || source === "youtube") && <section className="mb-8" aria-label="Recently live YouTube streams awaiting confirmation">
      <div className="mb-3"><h2 className="font-display text-2xl text-fg">Recently live on YouTube <span className="text-base text-muted">{recentlyLiveYoutube.length.toLocaleString()} awaiting confirmation</span></h2><p className="mt-1 text-sm text-muted">These broadcasts were live at the last successful check. They are kept visible here without being counted as currently live until YouTube confirms them again.</p></div>
      <LivePageGrid key={filter + search + sort} items={recentlyLiveYoutube} label="Unconfirmed YouTube" grid={grid} />
    </section>}
    {recentlyLiveTwitch.length > 0 && (source === 'all' || source === 'twitch') && <section className="mb-8" aria-label="Twitch streams awaiting a fresh check">
      <h2 className="font-display text-2xl text-fg">Live status needs checking <span className="text-base text-muted">{recentlyLiveTwitch.length.toLocaleString()} Twitch channels</span></h2>
      <p className="mb-3 mt-1 text-sm text-muted">These channels may still be live. An old check does not mean their stream ended. Refresh Twitch live to confirm them; their channel links remain usable.</p>
      <LivePageGrid key={filter + search + sort} items={recentlyLiveTwitch} label="Unconfirmed Twitch" grid={grid} />
    </section>}
    {(source === "all" || source === "twitch") && <details className="mt-6 rounded-lg border border-border bg-surface p-5"><summary className="cursor-pointer font-medium text-fg">Discover more Twitch channels</summary><p className="mt-2 text-sm text-muted">Following a channel adds it to your saved feed and checks its current status.</p><div className="mt-4 flex flex-wrap gap-2">{["twitch", "eslcs", "gamesdonequick", "otknetwork", "criticalrole"].filter(handle => !twitchFollows.some(f => f.handle.toLowerCase() === handle)).map(handle => <Button key={handle} variant="secondary" disabled={Boolean(adding)} onClick={() => void (async () => { setAdding(handle); try { await follow(handle, "twitch"); } finally { setAdding(""); } })()}>{adding === handle ? "Checking…" : `Follow ${handle}`}</Button>)}</div></details>}
  </section>;
}

function LivePageGrid({ items, label, grid }: { items: LibraryVideo[]; label: string; grid: string }) {
  const [requested, setPage] = useState(0), page = liveResultPage(items, requested);
  return <><div className={grid}>{page.rows.map((video, index) => <VideoCard key={video.id} video={video} variant="rail" index={index} className="w-full" />)}</div>
    {page.pages > 1 && <nav aria-label={label + ' result pages'} className="mt-4 flex flex-wrap items-center gap-3"><Button variant="secondary" disabled={page.page === 0} onClick={() => setPage(page.page - 1)}>Previous {label} page</Button><span className="text-sm text-muted">Page {page.page + 1} of {page.pages} · {page.total.toLocaleString()} results</span><Button variant="secondary" disabled={page.page + 1 === page.pages} onClick={() => setPage(page.page + 1)}>Next {label} page</Button></nav>}
  </>;
}
function LiveRoomCard({ video, index }: { video: LibraryVideo; index: number }) {
  const marked = useLibrary(state => Boolean(state.favorites[video.id] || state.likes[video.id] || state.activeId === video.id));
  const [retained, setRetained] = useState(false), [error, setError] = useState('');
  useEffect(() => { if (!marked || retained) return; setRetained(true); void useLibrary.getState().retainLiveRoom(video).then(ok => { if (!ok) setError('Your mark is saved; the room could not be added at the current library limit.'); }).catch(() => setError('Your mark is saved; the room descriptor could not be stored.')); }, [marked, retained, video]);
  return <div><VideoCard video={video} variant="rail" index={index} className="w-full" />{error && <p role="status" className="mt-2 text-xs text-muted">{error}</p>}</div>;
}
