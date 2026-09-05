import { useMemo, useState } from "react";
import { Bot, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askRecommendations } from "@/lib/recommendations";
import { useLibrary } from "@/lib/videos/store";

export function AiGuide() {
  const videos = useLibrary((s) => s.videos);
  const tags = useLibrary((s) => s.tags);
  const favorites = useLibrary((s) => s.favorites);
  const likes = useLibrary((s) => s.likes);
  const history = useLibrary((s) => s.history);
  const openPreview = useLibrary((s) => s.openPreview);
  const [prompt, setPrompt] = useState("What should I watch tonight?");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const localPicks = useMemo(() => {
    const favoredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id]).flatMap((video) => tags[video.id] ?? []));
    const watched = new Set(history.map((entry) => entry.id));
    return [...videos].filter((video) => !watched.has(video.id)).sort((a, b) => {
      const aScore = (favorites[a.id] ? 3 : 0) + (likes[a.id] ? 2 : 0) + (tags[a.id] ?? []).filter((tag) => favoredTags.has(tag)).length;
      const bScore = (favorites[b.id] ? 3 : 0) + (likes[b.id] ? 2 : 0) + (tags[b.id] ?? []).filter((tag) => favoredTags.has(tag)).length;
      return bScore - aScore || b.addedAt - a.addedAt;
    }).slice(0, 6);
  }, [favorites, history, likes, tags, videos]);
  const localAnswer = () => localPicks.length ? `Local recommendation${localPicks.length === 1 ? "" : "s"} for “${prompt}”:\n${localPicks.slice(0, 3).map((video, index) => `${index + 1}. ${video.name} — ${video.genre ?? "a library pick"}${(tags[video.id] ?? []).length ? ` · ${(tags[video.id] ?? []).slice(0, 2).join(", ")}` : ""}`).join("\n")}\n\nThe optional cloud guide is unavailable, so these picks were ranked privately from your library signals.` : "Add a few titles, tags, likes, or favorites and the local guide will start making picks.";
  const ask = async () => { setBusy(true); setAnswer(""); try { const catalog = videos.slice(0, 80).map((video) => `${video.name} | ${video.genre ?? ""} | ${(tags[video.id] ?? []).join(", ")} | ${favorites[video.id] ? "favorite" : ""} ${likes[video.id] ? "liked" : ""}`).join("\n"); const result = await askRecommendations({ data: { prompt, catalog } }); setAnswer(result.ok ? result.text : localAnswer()); } catch { setAnswer(localAnswer()); } finally { setBusy(false); } };
  return <section className="mx-auto max-w-3xl rounded-xl bg-surface p-5 shadow-border sm:p-8"><p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase"><Sparkles className="size-4" />Personal AI guide</p><h1 className="mt-3 font-display text-4xl text-fg sm:text-5xl">Ask your library.</h1><p className="mt-3 max-w-xl text-sm text-muted">Automatic local picks learn from favorites, likes, tags, and history without sending video files anywhere. The optional guide receives only a compact title, genre, and tag list when you ask it.</p><div className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><div className="flex items-center justify-between gap-3"><div><p className="font-display text-2xl text-fg">For you, locally</p><p className="mt-1 text-xs text-muted">{history.length} history signals · {Object.keys(favorites).length} favorites · {Object.values(tags).flat().length} tags</p></div><WandSparkles className="size-5 text-accent"/></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{localPicks.map((video) => <button key={video.id} type="button" onClick={() => openPreview(video.id)} className="rounded-md bg-bg/45 px-3 py-3 text-left shadow-border hover:bg-bg"><p className="truncate text-sm font-medium text-fg">{video.name}</p><p className="mt-1 truncate text-xs text-muted">{video.genre ?? "Library pick"} · {(tags[video.id] ?? []).slice(0, 3).join(", ") || "Fresh discovery"}</p></button>)}</div></div><div className="mt-6 flex flex-col gap-2 sm:flex-row"><Input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void ask(); }} aria-label="Recommendation question"/><Button disabled={busy || !prompt.trim()} onClick={() => void ask()}><Bot className="size-4" />{busy ? "Thinking…" : "Ask guide"}</Button></div>{answer && <div className="mt-5 rounded-lg bg-elevated p-5 text-sm leading-6 text-fg shadow-border whitespace-pre-wrap">{answer}</div>}<div className="mt-5 flex flex-wrap gap-2">{["A short open film", "Something funny", "A tech video", "What fits my favorites?", "Show a surprise based on my tags"].map((suggestion) => <Button key={suggestion} size="sm" variant="secondary" onClick={() => setPrompt(suggestion)}>{suggestion}</Button>)}</div></section>;
}
