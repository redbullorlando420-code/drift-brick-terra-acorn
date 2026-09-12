import { topicEvidence } from '@/lib/videos/topics';
import { openTopic } from '@/lib/videos/topic-navigation';
import { startTransition, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Glasses, Heart, Play, Star, Tag, ThumbsUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { creatorIsLiked, getCreatorRating, getRating, setCreatorRating, setRating as saveRating, tagIsLiked, toggleCreatorLike, toggleTagLike } from "@/lib/media-feedback";
import { resolvePlayUrl } from "@/lib/videos/sources";
import { isAdultImageKind, isAdultPullKind } from "@/lib/videos/adult-sites";

const EMPTY_TAGS: string[] = [];
function previewShuffle(id: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
  return value >>> 0;
}
function isExcludedPreviewCandidate(video: { isSample?: boolean; name: string; remote?: { channelName?: string }; tagline?: string }) {
  return Boolean(video.isSample) || /\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`);
}

export function PreVideo() {
  const previewId = useLibrary((s) => s.previewId);
  const videos = useLibrary((s) => s.videos);
  const allTags = useLibrary((s) => s.tags);
  const unavailable = useLibrary((s) => s.unavailable);
  const openVideo = useLibrary((s) => s.openVideo);
  const closePreview = useLibrary((s) => s.closePreview);
  const setSource = useLibrary((s) => s.setSource);
  const setQuery = useLibrary((s) => s.setQuery);
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  const setVideoCategory = useLibrary((s) => s.setVideoCategory);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const recordPlay = useLibrary((s) => s.recordPlay);
  const markProgress = useLibrary((s) => s.markProgress);
  const toggleLike = useLibrary((s) => s.toggleLike);
  const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
  const favorite = useLibrary((s) => (previewId ? Boolean(s.favorites[previewId]) : false));
  const liked = useLibrary((s) => (previewId ? Boolean(s.likes[previewId]) : false));
  const tags = useLibrary((s) => (previewId ? (s.tags[previewId] ?? EMPTY_TAGS) : EMPTY_TAGS));
  const category = useLibrary((s) => (previewId ? (s.categories[previewId] ?? "") : ""));
  const [editing, setEditing] = useState(false);
  const [tagText, setTagText] = useState("");
  const [categoryText, setCategoryText] = useState("");
  const [vrAvailable, setVrAvailable] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingRevision, setRatingRevision] = useState(0);
  const [creatorRevision, setCreatorRevision] = useState(0);
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [tagRevision, setTagRevision] = useState(0);
  const [recommendationSeed, setRecommendationSeed] = useState(() => Date.now() >>> 0);
  const [localPreviewSrc, setLocalPreviewSrc] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [shelfReady, setShelfReady] = useState(false);
  const markUnavailable = useLibrary((s) => s.markUnavailable);
  const video = videos.find((item) => item.id === previewId);
  useEffect(() => {
    if (video) recordPlay(video.id, "open");
  }, [recordPlay, video?.id]);
  useEffect(() => {
    if (!video?.remote) return;
    // Provider iframes do not expose a playback clock. Count time only after
    // this full preview has remained open for a real watch interval; clicking
    // a thumbnail alone never creates a Continue entry.
    const openedAt = Date.now();
    const durationHint = Math.max(video.duration ?? 0, 120);
    const savePreviewWatch = () => {
      const watched = (Date.now() - openedAt) / 1_000;
      if (watched >= 8) markProgress(video.id, Math.min(watched, durationHint * 0.94), durationHint);
    };
    const timer = window.setInterval(savePreviewWatch, 5_000);
    return () => { savePreviewWatch(); window.clearInterval(timer); };
  }, [markProgress, video?.id, video?.remote]);
  const creator = video?.remote?.channelName?.trim() ?? "";
  const creatorKeyword = creator.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const tagScores = useMemo(() => {
    const scores = new Map<string, { total: number; count: number }>();
    for (const item of videos) for (const rawTag of allTags[item.id] ?? EMPTY_TAGS) {
      const tag = rawTag.replace(/^(?:keyword-|creator-)/i, "");
      const entry = scores.get(tag) ?? { total: 0, count: 0 };
      entry.total += getRating(item.id); entry.count += 1; scores.set(tag, entry);
    }
    return scores;
  }, [allTags, ratingRevision, videos]);
  const allVisibleTags = (creatorKeyword && !tags.includes(creatorKeyword) ? [creatorKeyword, ...tags] : tags).map((tag) => tag.replace(/^(?:keyword-|creator-)/i, ""));
  // Provider pulls can retain hundreds of useful description words. Render a
  // generous first window so an expanded archive never makes the preview slow.
  const visibleTags = allVisibleTags.slice(0, 80);
  const creatorRating = creator ? getCreatorRating(creator) : 0;
  const creatorLiked = creator ? creatorIsLiked(creator) : false;
  useEffect(() => { if (!previewId) return; setRating(getRating(previewId)); }, [previewId]);
  useEffect(() => {
    const refresh = () => setRatingRevision((value) => value + 1);
    window.addEventListener("reelcase:rating-change", refresh);
    return () => window.removeEventListener("reelcase:rating-change", refresh);
  }, []);
  useEffect(() => {
    // Render the player and controls first. Large related shelves score the
    // catalog after the overlay is already interactive instead of delaying a
    // YouTube or Twitch click.
    setShelfReady(false);
    const timer = window.setTimeout(() => setShelfReady(true), 140);
    return () => window.clearTimeout(timer);
  }, [previewId]);
  useEffect(() => {
    // Rotate tie-breaks while a preview stays open. The taste signals remain
    // dominant, but a shelf does not become a permanently fixed six titles.
    const timer = window.setInterval(() => setRecommendationSeed(Date.now() >>> 0), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!video || video.remote || video.src) { setLocalPreviewSrc(null); setPreviewError(""); return; }
    let cancelled = false;
    setLocalPreviewSrc(null); setPreviewError("");
    void resolvePlayUrl(video).then((src) => { if (!cancelled) setLocalPreviewSrc(src); }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "This local file is no longer available.";
      if (!cancelled) { setPreviewError(message); markUnavailable(video.id, message); }
    });
    return () => { cancelled = true; };
  }, [markUnavailable, video]);
  useEffect(() => {
    const xr = (
      navigator as Navigator & { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } }
    ).xr;
    if (xr)
      void xr
        .isSessionSupported("immersive-vr")
        .then(setVrAvailable)
        .catch(() => setVrAvailable(false));
  }, []);
  const related = useMemo(() => {
    if (!video || !shelfReady) return [];
    const sourceTags = new Set(tags);
    const creatorName = video.remote?.channelName?.trim().toLowerCase();
    const sourceKind = video.remote?.kind;
    return videos.filter((item) => item.id !== video.id && !isExcludedPreviewCandidate(item) && !unavailable[item.id]).map((item) => {
      const itemTags = allTags[item.id] ?? EMPTY_TAGS;
      const sharedTopics = itemTags.filter((tag) => sourceTags.has(tag)).length;
      const sameCreator = Boolean(creatorName && item.remote?.channelName?.trim().toLowerCase() === creatorName);
      const liveToVod = Boolean(video.remote?.live && !item.remote?.live && sameCreator);
      const score = Number(sameCreator) * 14
        + Number(liveToVod) * 8
        + Number(item.folderId === video.folderId) * 5
        + Number(item.genre === video.genre) * 4
        + Number(item.remote?.kind === sourceKind) * 2
        + sharedTopics * 3
        + itemTags.filter((tag) => tagIsLiked(tag)).length * 2
        + getRating(item.id) * 1.5
        + getCreatorRating(item.remote?.channelName ?? "") * 2
        + Number(creatorIsLiked(item.remote?.channelName ?? "")) * 3;
      return { item, score, random: previewShuffle(`${video.id}:${item.id}:${recommendationSeed}`, recommendationSeed) };
    }).filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.random - b.random).slice(0, 8).map((row) => row.item);
  }, [allTags, creatorRevision, recommendationSeed, shelfReady, tags, unavailable, video, videos]);
  const recommended = useMemo(() => {
    if (!video || !shelfReady) return [];
    const sourceTags = new Set(tags);
    const sourceKind = video.remote?.kind;
    const seed = (recommendationSeed + 17) >>> 0;
    const highlyRatedTags = new Set(videos.flatMap((item) => {
      const itemTags = allTags[item.id] ?? EMPTY_TAGS;
      return getRating(item.id) >= 4 ? itemTags : itemTags.filter((tag) => tagIsLiked(tag));
    }));
    const relatedIds = new Set(related.map((relatedItem) => relatedItem.id));
    return videos.filter((item) => item.id !== video.id && !isExcludedPreviewCandidate(item) && !unavailable[item.id] && !relatedIds.has(item.id)).map((item) => {
      const itemTags = allTags[item.id] ?? EMPTY_TAGS;
      const sharedTopics = itemTags.filter((tag) => sourceTags.has(tag)).length;
      const score = Number(item.genre === video.genre) * 3
        + Number(item.remote?.kind === sourceKind) * 1.5
        + sharedTopics * 3
        + getRating(item.id) * 2
        + getCreatorRating(item.remote?.channelName ?? "") * 2
        + Number(creatorIsLiked(item.remote?.channelName ?? "")) * 3
        + itemTags.filter((tag) => highlyRatedTags.has(tag)).length * 3
        + itemTags.filter((tag) => tagIsLiked(tag)).length * 2;
      return { item, score, random: previewShuffle(`${video.id}:${item.id}:${seed}`, seed) };
    }).sort((a, b) => b.score - a.score || a.random - b.random).slice(0, 6).map((row) => row.item);
  }, [allTags, creatorRevision, recommendationSeed, related, shelfReady, tagRevision, tags, unavailable, video, videos]);
  if (!video) return null;
  const adultImage = Boolean(video.remote && isAdultImageKind(video.remote.kind, video.mime, video.extension));
  const imageSrc = adultImage
    ? (video.src || video.remote?.embedUrl || video.remote?.previewUrl || video.poster || null)
    : null;
  const embed = adultImage
    ? null
    : video.remote?.embedUrl
      ? video.remote.kind === "twitch"
        ? `${video.remote.embedUrl}${video.remote.embedUrl.includes("?") ? "&" : "?"}parent=${encodeURIComponent(window.location.hostname)}`
        : video.remote.kind === "youtube"
          ? (() => { const url = new URL(video.remote.embedUrl, "https://www.youtube.com"); url.protocol = "https:"; url.hostname = "www.youtube.com"; url.searchParams.set("autoplay", "1"); url.searchParams.set("rel", "0"); url.searchParams.set("modestbranding", "1"); url.searchParams.set("playsinline", "1"); url.searchParams.set("origin", window.location.origin); return url.toString(); })()
          : video.remote.embedUrl
      : null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg/98 px-4 py-5 sm:px-8 sm:py-8">
      <div className={video.remote ? "w-full max-w-none" : "mx-auto max-w-6xl"}>
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={closePreview}>
            <ArrowLeft className="size-4" /> Browse
          </Button>
          <Button variant="ghost" size="icon" aria-label="Close preview" onClick={closePreview}>
            <X className="size-5" />
          </Button>
        </div>
        <div className={video.remote?.kind === "twitch" ? "mt-5 grid gap-7" : video.remote?.kind === "youtube" ? "mt-5 grid gap-7 xl:grid-cols-[minmax(0,2.35fr)_minmax(20rem,0.65fr)]" : "mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.7fr)]"}>
          <div>
            <div className="overflow-hidden rounded-lg bg-elevated shadow-border">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={video.name}
                  className="aspect-video w-full bg-bg object-contain"
                  decoding="async"
                />
              ) : embed ? (
                <iframe
                  title={`${video.name} preview`}
                  src={embed}
                  className="aspect-video w-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (video.src || localPreviewSrc) ? (
                <video
                  src={video.src ?? localPreviewSrc ?? undefined}
                  poster={video.poster}
                  className="aspect-video w-full bg-bg object-contain"
                  muted
                  autoPlay
                  preload="metadata"
                  playsInline
                  controls
                  onTimeUpdate={(event) => {
                    const element = event.currentTarget;
                    if (Number.isFinite(element.duration) && element.duration > 0) markProgress(video.id, element.currentTime, element.duration);
                  }}
                />
              ) : previewError ? (
                <div className="flex aspect-video items-center justify-center bg-bg px-6 text-center text-sm text-muted">{previewError}</div>
              ) : (
                <img src={video.poster} alt="" className="aspect-video w-full object-cover" />
              )}
            </div>
            <p className="mt-4 text-xs font-medium tracking-[0.14em] text-accent uppercase">
              {video.remote?.kind ?? video.genre ?? "Library"}
            </p>
            <h1 className="mt-2 font-display text-4xl leading-none text-fg sm:text-5xl">
              {video.name.replace(/\.[^/.]+$/, "")}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              {video.tagline ?? "Preview this title, tune its metadata, then start watching."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => openVideo(video.id)}>
                <Play className="size-4 fill-current" /> Watch now
              </Button>
              {video.remote?.watchUrl && (
                <a
                  href={video.remote.watchUrl}
                  onClick={() => recordPlay(video.id)}
                  className="inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border"
                >
                  Open official player <ExternalLink className="ml-2 size-4" />
                </a>
              )}
              <Button
                variant="secondary"
                title={
                  vrAvailable
                    ? "Use Meta Quest Browser to enter VR"
                    : "VR is available on a Meta Quest or other WebXR browser"
                }
                onClick={() => openVideo(video.id)}
              >
                <Glasses className="size-4" /> Open VR cinema
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing((value) => !value);
                  setTagText(tags.join(", "));
                  setCategoryText(category);
                }}
              >
                <Tag className="size-4" /> Edit tags
              </Button>
              <Button variant={favorite ? "default" : "secondary"} onClick={() => toggleFavorite(video.id)}><Heart className={favorite ? "size-4 fill-current" : "size-4"} />{favorite ? "Saved" : "Save"}</Button>
              <Button variant={liked ? "default" : "secondary"} onClick={() => toggleLike(video.id)}><ThumbsUp className={liked ? "size-4 fill-current" : "size-4"} />{liked ? "Liked" : "Like"}</Button>
            </div>
            {creator && <div className="mt-4 rounded-lg border border-border bg-elevated/55 p-4"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Creator taste</p><div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : isAdultPullKind(video.remote?.kind) ? "adults" : "youtube"); setQuery(creator); closePreview(); }} className="font-medium text-fg hover:text-accent">{creator}</button><Button size="sm" variant={creatorLiked ? "default" : "secondary"} onClick={() => { toggleCreatorLike(creator); setCreatorRevision((value) => value + 1); }}><ThumbsUp className={creatorLiked ? "size-3.5 fill-current" : "size-3.5"}/>{creatorLiked ? "Creator liked" : "Like creator"}</Button>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => { setCreatorRating(creator, value); setCreatorRevision((revision) => revision + 1); }} className={`flex size-8 items-center justify-center rounded-sm text-xs shadow-border ${value <= creatorRating ? "bg-accent text-accent-fg" : "bg-bg/50 text-accent"}`} aria-label={`Rate creator ${creator} ${value} stars`}>{value}</button>)}</div><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={creatorLoading || !video.remote} onClick={() => void (async () => { if (!video.remote) return; setCreatorLoading(true); try { if (video.remote.kind === "youtube" || video.remote.kind === "twitch") await followRemoteQuery(creator, video.remote.kind); setCreatorRevision((value) => value + 1); } finally { setCreatorLoading(false); } })()}>{creatorLoading ? "Pulling older videos…" : "Pull older creator videos"}</Button></div><p className="mt-2 text-xs text-muted">Creator likes, ratings, and the older-video pull boost this creator and shared tags across related recommendations.</p></div>}
          </div>
          <aside className="rounded-lg bg-elevated p-5 shadow-border">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Details</p>
            <div className="mt-3 flex flex-wrap gap-2">{topicEvidence(video, tags).map((link) => <Button key={link.topic} size="sm" variant="secondary" title={link.reason} onClick={() => { openTopic(link.topic); closePreview(); }}>#{link.topic} ↔</Button>)}</div>
            <p className="mt-2 text-xs text-muted">Topic links explore all public sources. Hover a topic for its evidence.</p>
            <p className="mt-3 text-sm text-fg">
              {video.year ?? "New"} · {video.genre ?? "Uncategorized"}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {visibleTags.length ? (
                visibleTags.map((tag) => (
                  <span key={tag} className="inline-flex overflow-hidden rounded-xs bg-bg/50 text-xs text-muted">
                    <button type="button" title={`Show videos tagged ${tag} · score ${Math.round(((tagScores.get(tag)?.total ?? 0) / Math.max(1, tagScores.get(tag)?.count ?? 1)) * 1000).toLocaleString()}`} onClick={() => { setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : "all"); setQuery(tag); closePreview(); }} className="px-2 py-1 transition-colors hover:bg-accent/15 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">#{tag} <span className="text-accent">· {Math.round(((tagScores.get(tag)?.total ?? 0) / Math.max(1, tagScores.get(tag)?.count ?? 1)) * 1000).toLocaleString()}</span></button>
                    <button type="button" title={tagIsLiked(tag) ? `Unlike tag ${tag}` : `Like tag ${tag}`} aria-label={tagIsLiked(tag) ? `Unlike tag ${tag}` : `Like tag ${tag}`} onClick={() => { toggleTagLike(tag); setTagRevision((value) => value + 1); }} className={`border-l border-border px-1.5 transition-colors hover:bg-accent/15 ${tagIsLiked(tag) ? "text-accent" : "text-subtle"}`}><Heart className={tagIsLiked(tag) ? "size-3 fill-current" : "size-3"}/></button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-subtle">No keywords yet</span>
              )}
            </div>{allVisibleTags.length > visibleTags.length && <p className="mt-2 text-xs text-muted">Showing {visibleTags.length} of {allVisibleTags.length} saved provider tags. Search the source to use the rest.</p>}
            {editing && (
              <div className="mt-5 space-y-3 border-t border-border pt-4">
                <label className="block text-xs text-muted">
                  IPTC/XMP-style keywords
                  <Input
                    value={tagText}
                    onChange={(event) => setTagText(event.target.value)}
                    className="mt-1"
                    placeholder="science, repair, funny"
                  />
                </label>
                <label className="block text-xs text-muted">
                  Collection / category
                  <Input
                    value={categoryText}
                    onChange={(event) => setCategoryText(event.target.value)}
                    className="mt-1"
                    placeholder="Tech, comedy, open film"
                  />
                </label>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setVideoTags(video.id, tagText.split(","));
                    setVideoCategory(video.id, categoryText);
                    setEditing(false);
                  }}
                >
                  Save metadata
                </Button>
              </div>
            )}
            <div className="mt-5 border-t border-border pt-4">
              <p className="flex items-center gap-2 text-sm text-fg">
                <Star className="size-4 text-accent" /> Your rating
              </p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setRating(value); startTransition(() => saveRating(video.id, value)); }}
                    className={`flex size-9 items-center justify-center rounded-sm text-sm shadow-border ${value <= rating ? "bg-accent text-accent-fg" : "bg-bg/50 text-accent"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
        {related.length > 0 && (
          <section className="mt-9">
            <h2 className="font-display text-2xl text-fg">More from this shelf</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {related.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => useLibrary.getState().openPreview(item.id)}
                  className="overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface"
                >
                  {item.poster ? (
                    <img src={item.poster} alt="" loading="lazy" className="aspect-video w-full object-cover" onError={(event) => { const fallback = item.remote?.kind === "youtube" && item.remote.videoId ? `https://i.ytimg.com/vi/${item.remote.videoId}/mqdefault.jpg` : ""; if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback; else event.currentTarget.style.display = "none"; }} />
                  ) : (
                    <span className="block aspect-video bg-bg" />
                  )}
                  <span className="block truncate px-3 py-2 text-sm text-fg">{item.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        {recommended.length > 0 && (
          <section className="mt-9">
            <h2 className="font-display text-2xl text-fg">More to try next</h2>
            <p className="mt-1 text-sm text-muted">A fresh mix based on this title’s genre and what was added recently.</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {recommended.map((item) => <button key={item.id} type="button" onClick={() => useLibrary.getState().openPreview(item.id)} className="overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface">{item.poster ? <img src={item.poster} alt="" loading="lazy" className="aspect-video w-full object-cover" onError={(event) => { const fallback = item.remote?.kind === "youtube" && item.remote.videoId ? `https://i.ytimg.com/vi/${item.remote.videoId}/mqdefault.jpg` : ""; if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback; else event.currentTarget.style.display = "none"; }} /> : <span className="block aspect-video bg-bg" />}<span className="block truncate px-3 py-2 text-sm text-fg">{item.name}</span></button>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
