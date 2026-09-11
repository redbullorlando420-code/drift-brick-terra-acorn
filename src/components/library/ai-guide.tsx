import { useMemo, useState } from "react";
import { Bot, RefreshCw, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { hasFreshViewerCount } from "@/lib/videos/types";

export function AiGuide() {
  const videos = useLibrary((s) => s.videos);
  const tags = useLibrary((s) => s.tags);
  const favorites = useLibrary((s) => s.favorites);
  const likes = useLibrary((s) => s.likes);
  const history = useLibrary((s) => s.history);
  const openPreview = useLibrary((s) => s.openPreview);
  const [recommendationSeed, setRecommendationSeed] = useState(() => Date.now());
  const [prompt, setPrompt] = useState("What should I watch tonight?");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const localPicks = useMemo(() => {
    const favoredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id]).flatMap((video) => tags[video.id] ?? []));
    const watched = new Set(history.map((entry) => entry.id));
    const rank = (id: string) => { let value = recommendationSeed >>> 0; for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 0x45d9f3b); return value >>> 0; };
    return [...videos].filter((video) => !watched.has(video.id)).map((video) => ({ video, score: (favorites[video.id] ? 3 : 0) + (likes[video.id] ? 2 : 0) + (tags[video.id] ?? []).filter((tag) => favoredTags.has(tag)).length, random: rank(video.id) })).sort((a, b) => {
      return b.score - a.score || a.random - b.random;
    }).slice(0, 12).map((row) => row.video);
  }, [favorites, history, likes, recommendationSeed, tags, videos]);
  const liveNow = useMemo(() => videos.filter((video) => video.remote?.kind === "twitch" && video.remote.live).sort((a, b) => (hasFreshViewerCount(b.remote) ? b.remote?.viewers ?? 0 : 0) - (hasFreshViewerCount(a.remote) ? a.remote?.viewers ?? 0 : 0)), [videos]);
  const localAnswer = () => {
    const asksForLive = /live|twitch|stream/i.test(prompt);
    if (asksForLive && liveNow.length) return `Live on your followed Twitch channels:\n${liveNow.slice(0, 4).map((video, index) => `${index + 1}. ${video.remote?.channelName ?? video.name}${hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()} viewers` : ""}`).join("\n")}\n\nLive status comes from the latest refresh in Reelcase. Open a card to watch it.`;
    return localPicks.length ? `Local recommendation${localPicks.length === 1 ? "" : "s"} for “${prompt}”:\n${localPicks.slice(0, 3).map((video, index) => `${index + 1}. ${video.name} — ${video.genre ?? "a library pick"}${(tags[video.id] ?? []).length ? ` · ${(tags[video.id] ?? []).slice(0, 2).join(", ")}` : ""}`).join("\n")}\n\nThe optional cloud guide is unavailable, so these picks were ranked privately from your library signals.` : "Add a few titles, tags, likes, or favorites and the local guide will start making picks.";
  };
  const ask = async () => { setBusy(true); setAnswer(""); await new Promise((resolve) => window.setTimeout(resolve, 120)); setAnswer(localAnswer()); setBusy(false); };
  return <section className="w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8"><p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase"><Sparkles className="size-4" />Library guide</p><h1 className="mt-3 font-display text-4xl text-fg sm:text-5xl">Useful answers from local signals.</h1><p className="mt-3 max-w-xl text-sm text-muted">This guide only uses saved favorites, likes, tags, viewing history, and the most recent Twitch refresh. It does not send your catalog or files to a cloud model.</p><div className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><div className="flex items-center justify-between gap-3"><div><p className="font-display text-2xl text-fg">Your current signals</p><p className="mt-1 text-xs text-muted">{history.length} history signals · {Object.keys(favorites).length} favorites · {Object.values(tags).flat().length} tags</p></div><Button size="sm" variant="secondary" onClick={() => setRecommendationSeed(Date.now())}><RefreshCw className="size-3.5"/>New recommendations</Button></div><div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{localPicks.map((video) => <button key={video.id} type="button" onClick={() => openPreview(video.id)} className="rounded-md bg-bg/45 px-3 py-3 text-left shadow-border hover:bg-bg"><p className="truncate text-sm font-medium text-fg">{video.name}</p><p className="mt-1 truncate text-xs text-muted">{video.remote?.channelName ?? video.genre ?? "Library pick"} · {(tags[video.id] ?? []).slice(0, 3).join(", ") || "Fresh discovery"}</p></button>)}</div></div><div className="mt-5 rounded-lg border border-border bg-elevated/60 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-fg">Twitch live check</p><p className="mt-1 text-xs text-muted">{liveNow.length ? `${liveNow.length} followed channel${liveNow.length === 1 ? "" : "s"} live in the latest refresh.` : "No followed channels are live in the latest refresh."}</p></div><span className="rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent">{liveNow.length} live</span></div>{liveNow.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{liveNow.map((video) => <Button key={video.id} size="sm" variant="secondary" onClick={() => openPreview(video.id)}>{video.remote?.channelName ?? video.name}{hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()}` : ""}</Button>)}</div>}</div><div className="mt-6 flex flex-col gap-2 sm:flex-row"><Input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void ask(); }} aria-label="Library guide question"/><Button disabled={busy || !prompt.trim()} onClick={() => void ask()}><Bot className="size-4" />{busy ? "Checking library…" : "Ask guide"}</Button></div>{answer && <div className="mt-5 rounded-lg bg-elevated p-5 text-sm leading-6 text-fg shadow-border whitespace-pre-wrap">{answer}</div>}<div className="mt-5 flex flex-wrap gap-2">{["Who is live on Twitch?", "Something funny", "A tech video", "What fits my favorites?", "Show a surprise based on my tags"].map((suggestion) => <Button key={suggestion} size="sm" variant="secondary" onClick={() => setPrompt(suggestion)}>{suggestion}</Button>)}</div></section>;
}
