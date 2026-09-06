import { useEffect, useMemo, useState } from "react";
import { Play, Shuffle, Radio, RefreshCw, Heart, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";
import { TitleRail } from "./browse";
import { VideoCard } from "./video-card";

export function DiscoveryDesk({ videos }: { videos: LibraryVideo[] }) {
  const [seed, setSeed] = useState(1);
  const open = useLibrary((s) => s.openVideo);
  useEffect(() => setSeed(Math.floor(Math.random() * 0xffffffff)), []);
  const picks = useMemo(() => {
    // Reservoir sampling uses bounded space even for million-entry catalogs.
    let state = seed >>> 0;
    const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
    const chosen: LibraryVideo[] = [];
    let seen = 0;
    for (const video of videos) {
      if (video.remote?.live) continue;
      seen++;
      if (chosen.length < 12) chosen.push(video);
      else { const index = Math.floor(random() * seen); if (index < 12) chosen[index] = video; }
    }
    for (let i = chosen.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [chosen[i], chosen[j]] = [chosen[j], chosen[i]]; }
    return chosen;
  }, [videos, seed]);
  return <section className="mb-8 rounded-xl border border-border bg-surface p-5 sm:p-7">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">Your daily detour</p><h1 className="discovery-heading font-display">Something worth finding.</h1><p className="mt-3 text-sm text-muted">A fresh mix from your library. Follow your curiosity.</p></div><div className="flex flex-wrap gap-2"><Button disabled={!picks.length} onClick={() => open(picks[0].id)}><Play className="size-4"/>Surprise me</Button><Button variant="secondary" onClick={() => setSeed(Math.floor(Math.random() * 0xffffffff) || 1)}><Shuffle className="size-4"/>Shuffle picks</Button></div></div>
    {picks.length ? <TitleRail title="Random discoveries" videos={picks} variant="rail"/> : <p className="py-6 text-sm text-muted">Add videos or follow a channel to start discovering.</p>}
  </section>;
}

export function LiveDesk({ videos }: { videos: LibraryVideo[] }) {
  const favorites = useLibrary((s) => s.favorites);
  const likes = useLibrary((s) => s.likes);
  const refreshing = useLibrary((s) => s.refreshing);
  const checkedAt = useLibrary((s) => s.remoteCheckedAt);
  const refresh = useLibrary((s) => s.refreshFollows);
  const setSource = useLibrary((s) => s.setSource);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("favorites");
  const [columns, setColumns] = useState(4);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem("reelcase.live-desk") ?? "{}"); if (["all", "favorites", "likes"].includes(saved.filter)) setFilter(saved.filter); if (["favorites", "viewers", "name"].includes(saved.sort)) setSort(saved.sort); const count = Number(localStorage.getItem("reelcase.live-columns") ?? 4); if ([3, 4, 6].includes(count)) setColumns(count); } catch { /* defaults */ } setReady(true); }, []);
  useEffect(() => { if (!ready) return; try { localStorage.setItem("reelcase.live-desk", JSON.stringify({ filter, sort })); localStorage.setItem("reelcase.live-columns", String(columns)); } catch { /* session only */ } }, [filter, sort, columns, ready]);
  const visible = useMemo(() => videos.filter((v) => (filter === "all" || (filter === "favorites" ? favorites[v.id] : likes[v.id])) && `${v.name} ${v.remote?.channelName ?? ""}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : (sort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) : 0) || (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0)), [videos, filter, favorites, likes, sort, search]);
  return <section>
    <header className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-7"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent"><Radio className="size-4"/>On air</p><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="discovery-heading font-display">Your live control room.</h1><p className="mt-3 text-sm text-muted">{videos.length} streams in the latest check · {checkedAt ? `Checked ${new Date(checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Waiting for first refresh"}</p></div><Button variant="secondary" disabled={refreshing} onClick={() => void refresh()}><RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"}/>{refreshing ? "Refreshing…" : "Refresh streams"}</Button></div>
    <div className="mt-6 flex flex-wrap gap-2">{[["all", "All streams"], ["favorites", "Favorites"], ["likes", "Liked"]].map(([value, label]) => <Button key={value} size="sm" variant={filter === value ? "default" : "secondary"} onClick={() => setFilter(value)}>{value === "favorites" ? <Heart className="size-4"/> : value === "likes" ? <ThumbsUp className="size-4"/> : null}{label}</Button>)}</div>
    <div className="mt-4 flex flex-wrap gap-3"><Input className="min-w-0 flex-1" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a stream or creator" aria-label="Search live streams"/><select aria-label="Sort live streams" className="min-h-11 rounded-sm border border-border bg-elevated px-3 text-sm" value={sort} onChange={(event) => setSort(event.target.value)}><option value="favorites">Favorites first</option><option value="viewers">Most viewers</option><option value="name">Channel A–Z</option></select><select aria-label="Live card size" className="min-h-11 rounded-sm border border-border bg-elevated px-3 text-sm" value={columns} onChange={(event) => setColumns(Number(event.target.value))}><option value={3}>Large cards</option><option value={4}>Comfortable</option><option value={6}>Compact</option></select></div></header>
    {visible.length ? <div className={columns === 3 ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : columns === 6 ? "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"}>{visible.slice(0, 120).map((video, index) => <VideoCard key={video.id} video={video} variant="rail" index={index} className="w-full"/>)}</div> : <div className="rounded-xl border border-border p-8 text-center"><h2 className="font-display text-2xl">{videos.length ? "No streams match this view" : "A quiet moment on your channels"}</h2><p className="mt-2 text-sm text-muted">{videos.length ? "Try all streams or a different search." : "Browse saved Twitch videos while you wait for the next stream."}</p><Button className="mt-4" variant="secondary" onClick={() => { if (videos.length) { setFilter("all"); setSearch(""); } else setSource("twitch"); }}>{videos.length ? "Reset filters" : "Browse Twitch"}</Button></div>}
  </section>;
}
