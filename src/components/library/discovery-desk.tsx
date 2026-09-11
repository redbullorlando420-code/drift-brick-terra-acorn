import { useEffect, useMemo, useState } from "react";
import { Play, Shuffle, Radio, RefreshCw, Heart, ThumbsUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";
import { TitleRail } from "./browse";
import { VideoCard } from "./video-card";
import { getRatingStreakSnapshot, RATING_GOALS, setRatingWeeklyGoal, type RatingStreakSnapshot } from "@/lib/rating-streaks";

export function DiscoveryDesk({ videos }: { videos: LibraryVideo[] }) {
  const [seed, setSeed] = useState(1);
  const open = useLibrary((s) => s.openVideo);
  useEffect(() => {
    const rotate = () => setSeed((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    rotate();
    const timer = window.setInterval(rotate, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const picks = useMemo(() => {
    // Time-based rotation ensures a fresh mix even when the catalog itself is
    // unchanged. Demonstration media is excluded before scoring.
    let state = seed >>> 0;
    const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
    const currentChoices = videos.filter((video) => !video.remote?.live && !video.isSample);
    const candidatePool = currentChoices;
    // Keep only the best small candidate set while walking the catalog. The
    // old map + full-array sort made the Home welcome card do O(n log n) work.
    const chosen: Array<{ video: LibraryVideo; score: number }> = [];
    for (const video of candidatePool) {
      const classicFallback = video.collection === "classics" || /classic|noir/i.test(`${video.name} ${video.remote?.channelName ?? ""}`);
      const freshness = Math.max(1, Math.min(8, (video.addedAt - Date.now() + 31_536_000_000) / 3_942_000_000));
      const weight = (video.remote ? 7 : 2) + freshness + (classicFallback ? -6 : 0);
      const entry = { video, score: random() * Math.max(0.25, weight) };
      if (chosen.length < 12) { chosen.push(entry); continue; }
      let weakest = 0;
      for (let index = 1; index < chosen.length; index += 1) if (chosen[index].score < chosen[weakest].score) weakest = index;
      if (entry.score > chosen[weakest].score) chosen[weakest] = entry;
    }
    return chosen.map((entry) => entry.video);
  }, [videos, seed]);
  return <section className="mb-8 rounded-xl border border-border bg-surface p-5 sm:p-7">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">Your daily detour</p><h1 className="discovery-heading font-display">Something worth finding.</h1><p className="mt-3 text-sm text-muted">A fresh mix from your library. Follow your curiosity.</p></div><div className="flex flex-wrap gap-2"><Button disabled={!picks.length} onClick={() => open(picks[0].id)}><Play className="size-4"/>Surprise me</Button><Button variant="secondary" onClick={() => setSeed(Math.floor(Math.random() * 0xffffffff) || 1)}><Shuffle className="size-4"/>Shuffle picks</Button></div></div>
    {picks.length ? <TitleRail title="Random discoveries" videos={picks} variant="rail"/> : <p className="py-6 text-sm text-muted">Add videos or follow a channel to start discovering.</p>}
  </section>;
}

export function RatingStreakCard() {
  const [snapshot, setSnapshot] = useState<RatingStreakSnapshot>(() => getRatingStreakSnapshot());
  useEffect(() => {
    const refresh = () => setSnapshot(getRatingStreakSnapshot());
    window.addEventListener("reelcase:rating-streak-change", refresh);
    return () => window.removeEventListener("reelcase:rating-streak-change", refresh);
  }, []);
  const remaining = Math.max(0, snapshot.weeklyGoal - snapshot.thisWeek);
  return <section className="mb-8 rounded-xl border border-border bg-surface p-5 shadow-border sm:p-6" aria-label="Rating streak">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-accent uppercase"><Star className="size-4"/>Rating rhythm</p><h2 className="mt-2 font-display text-2xl text-fg">Small ratings, clearer shelves.</h2><p className="mt-1 text-sm text-muted">{remaining ? `${remaining} more distinct rating${remaining === 1 ? "" : "s"} unlocks this week’s local reward.` : "This week’s local reward is unlocked."}</p></div><div className="rounded-lg bg-elevated px-4 py-3 text-right"><p className="text-xs text-muted">Weekly streak</p><p className="mt-1 font-display text-2xl text-fg">{snapshot.weeklyStreak} week{snapshot.weeklyStreak === 1 ? "" : "s"}</p></div></div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-bg/70"><div className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out" style={{ width: `${Math.min(100, snapshot.thisWeek / snapshot.weeklyGoal * 100)}%` }}/></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted"><span>{snapshot.thisWeek} of {snapshot.weeklyGoal} rated this week</span><span>{snapshot.nextReward}</span></div>
    <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-muted">Weekly goal</span>{RATING_GOALS.map((goal) => <Button key={goal} size="sm" variant={snapshot.weeklyGoal === goal ? "default" : "secondary"} onClick={() => { setRatingWeeklyGoal(goal); setSnapshot(getRatingStreakSnapshot()); }}>{goal} ratings</Button>)}</div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3">{snapshot.rewards.map((reward) => <div key={reward.label} className="rounded-md bg-elevated px-3 py-2"><p className="text-sm font-medium text-fg">{reward.earned ? "Earned · " : "Next · "}{reward.label}</p><p className="mt-1 text-xs leading-5 text-muted">{reward.detail}</p></div>)}</div>
  </section>;
}

export function LiveDesk({ videos }: { videos: LibraryVideo[] }) {
  const favorites = useLibrary((s) => s.favorites);
  const likes = useLibrary((s) => s.likes);
  const refreshing = useLibrary((s) => s.refreshing);
  const checkedAt = useLibrary((s) => s.remoteCheckedAt);
  const refresh = useLibrary((s) => s.refreshFollows);
  const setSource = useLibrary((s) => s.setSource);
  const follows = useLibrary((s) => s.follows);
  const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("favorites");
  const [columns, setColumns] = useState(4);
  const [ready, setReady] = useState(false);
  const [adding, setAdding] = useState("");
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem("reelcase.live-desk") ?? "{}"); if (["all", "favorites", "likes"].includes(saved.filter)) setFilter(saved.filter); if (["favorites", "viewers", "name"].includes(saved.sort)) setSort(saved.sort); const count = Number(localStorage.getItem("reelcase.live-columns") ?? 4); if ([3, 4, 6].includes(count)) setColumns(count); } catch { /* defaults */ } setReady(true); }, []);
  useEffect(() => { if (!ready) return; try { localStorage.setItem("reelcase.live-desk", JSON.stringify({ filter, sort })); localStorage.setItem("reelcase.live-columns", String(columns)); } catch { /* session only */ } }, [filter, sort, columns, ready]);
  const visible = useMemo(() => videos.filter((v) => (filter === "all" || (filter === "favorites" ? favorites[v.id] : likes[v.id])) && `${v.name} ${v.remote?.channelName ?? ""}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : (sort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) : 0) || (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0)), [videos, filter, favorites, likes, sort, search]);
  const youtubeLiveCount = videos.filter((video) => video.remote?.kind === "youtube").length;
  const recommendedChannels = [
    { handle: "twitch", title: "Twitch" }, { handle: "eslcs", title: "ESL Counter-Strike" }, { handle: "gamesdonequick", title: "Games Done Quick" }, { handle: "otknetwork", title: "OTK Network" }, { handle: "criticalrole", title: "Critical Role" },
  ].filter((channel) => !follows.some((follow) => follow.kind === "twitch" && follow.handle.toLowerCase() === channel.handle));
  return <section>
    <header className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-7"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent"><Radio className="size-4"/>On air</p><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="discovery-heading font-display">Your live control room.</h1><p className="mt-3 text-sm text-muted">{videos.length} confirmed live stream{videos.length === 1 ? "" : "s"} · {youtubeLiveCount} from YouTube · scheduled “waiting to go live” channels stay out · {checkedAt ? `Checked ${new Date(checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Waiting for first refresh"}</p></div><Button variant="secondary" disabled={refreshing} onClick={() => void refresh()}><RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"}/>{refreshing ? "Refreshing…" : "Refresh streams"}</Button></div>
    <div className="mt-6 flex flex-wrap gap-2">{[["all", "All streams"], ["favorites", "Favorites"], ["likes", "Liked"]].map(([value, label]) => <Button key={value} size="sm" variant={filter === value ? "default" : "secondary"} onClick={() => setFilter(value)}>{value === "favorites" ? <Heart className="size-4"/> : value === "likes" ? <ThumbsUp className="size-4"/> : null}{label}</Button>)}</div>
    <div className="mt-4 flex flex-wrap gap-3"><Input className="min-w-0 flex-1" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a stream or creator" aria-label="Search live streams"/><select aria-label="Sort live streams" className="min-h-11 rounded-sm border border-border bg-elevated px-3 text-sm" value={sort} onChange={(event) => setSort(event.target.value)}><option value="favorites">Favorites first</option><option value="viewers">Most viewers</option><option value="name">Channel A–Z</option></select><select aria-label="Live card size" className="min-h-11 rounded-sm border border-border bg-elevated px-3 text-sm" value={columns} onChange={(event) => setColumns(Number(event.target.value))}><option value={3}>Large cards</option><option value={4}>Comfortable</option><option value={6}>Compact</option></select></div></header>
    {visible.length ? <div className={columns === 3 ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : columns === 6 ? "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"}>{visible.slice(0, 120).map((video, index) => <VideoCard key={video.id} video={video} variant="rail" index={index} className="w-full"/>)}</div> : <div className="rounded-xl border border-border p-8 text-center"><h2 className="font-display text-2xl">{videos.length ? "No streams match this view" : "A quiet moment on your channels"}</h2><p className="mt-2 text-sm text-muted">{videos.length ? "Try all streams or a different search." : "Browse saved Twitch videos while you wait for the next stream."}</p><Button className="mt-4" variant="secondary" onClick={() => { if (videos.length) { setFilter("all"); setSearch(""); } else setSource("twitch"); }}>{videos.length ? "Reset filters" : "Browse Twitch"}</Button></div>}
    <section className="mt-8 rounded-xl border border-border bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-widest text-accent">New live discovery</p><h2 className="mt-2 font-display text-2xl text-fg">Outside your followed channels.</h2><p className="mt-1 text-sm text-muted">These are public Twitch channels to explore separately from your saved feed. Following one adds it to Reelcase and immediately checks its current live status.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{recommendedChannels.map((channel) => <div key={channel.handle} className="rounded-lg bg-elevated p-4 shadow-border"><p className="font-medium text-fg">{channel.title}</p><p className="mt-1 text-xs text-muted">twitch.tv/{channel.handle}</p><Button size="sm" className="mt-3" disabled={adding === channel.handle} onClick={() => void (async () => { setAdding(channel.handle); try { await followRemoteQuery(channel.handle, "twitch"); } finally { setAdding(""); } })()}>{adding === channel.handle ? "Checking…" : "Follow & check live"}</Button></div>)}</div></section>
  </section>;
}
