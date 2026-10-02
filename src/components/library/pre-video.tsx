import { usePreviewRanking } from "./use-preview-ranking";
import { confidenceAdjustedPreference } from '@/lib/videos/ranking-core';
import { PullPauseButton } from "./pull-pause-button";
import { allowAutomaticRefresh } from "@/lib/session-activity";
import { warmVideoPlayer } from "./video-overlay-loader";
import { youtubeEmbedUrl } from "@/lib/videos/youtube-embed";
import { topicEvidence } from '@/lib/videos/topics';
import { openTopic } from '@/lib/videos/topic-navigation';
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, Glasses, Heart, Play, Star, Tag, ThumbsUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { creatorIsFavorited, toggleCreatorFavorite, creatorIsLiked, getCreatorRating, getRating, recordWatchTime, setCreatorRating, setRating as saveRating, tagIsLiked, toggleCreatorLike, toggleTagLike } from "@/lib/media-feedback";
import { resolvePlayUrl } from "@/lib/videos/sources";
import { twitchEmbedUrl } from "@/lib/videos/twitch-embed";
import { isAdultImageKind, isAdultPullKind } from "@/lib/videos/adult-sites";
import { AdultComments, supportsRemoteComments } from "@/components/library/adult-comments";
import { lookupVideo, lookupVideos } from "@/lib/videos/video-lookup";
import { useVideoDetails } from './use-video-details';
import { useRedditMedia } from './use-reddit-media';
import { useBooruOriginal } from './use-booru-original';

const EMPTY_TAGS: string[] = [];
export function PreVideo() {
  useEffect(() => { const timer = window.setTimeout(warmVideoPlayer, 100); return () => window.clearTimeout(timer); }, []);
  const previewId = useLibrary((s) => s.previewId);
  const videos = useLibrary((s) => s.videos);
  const folders = useLibrary((s) => s.folders);
  const allTags = useLibrary((s) => s.tags);
  const unavailable = useLibrary((s) => s.unavailable);
  const hiddenVideos = useLibrary((s) => s.hiddenVideos);
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
  const metadataProvenance = useLibrary((s) => (previewId ? s.metadataProvenance[previewId] : undefined));
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
  const previewWatchTick = useRef(0);
  const previewWatchPending = useRef(0);
  const markUnavailable = useLibrary((s) => s.markUnavailable);
  const video = useVideoDetails(lookupVideo(videos, previewId));
  const booruImage = useBooruOriginal(video);
  const redditRemoved = useRedditMedia(video);
  const flushPreviewWatch = () => {
    if (previewId && previewWatchPending.current > 0) recordWatchTime(previewId, "preview", previewWatchPending.current);
    previewWatchPending.current = 0;
    previewWatchTick.current = 0;
  };
  useEffect(() => () => { if (previewId && previewWatchPending.current > 0) recordWatchTime(previewId, "preview", previewWatchPending.current); previewWatchPending.current = 0; previewWatchTick.current = 0; }, [previewId]);
  const adultFolderIds = useMemo(() => new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id)), [folders]);
  const previewIsAdult = Boolean(video && (isAdultPullKind(video.remote?.kind) || adultFolderIds.has(video.folderId)));
  useEffect(() => {
    if (!video) return;
    const timer = window.setTimeout(() => recordPlay(video.id, "open"), 800);
    return () => window.clearTimeout(timer);
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
    const timer = window.setInterval(() => {
      savePreviewWatch();
      if ((Date.now() - openedAt) >= 8_000 && document.visibilityState === "visible" && document.hasFocus()) recordWatchTime(video.id, "previewEstimated", 5);
    }, 5_000);
    return () => { savePreviewWatch(); window.clearInterval(timer); };
  }, [markProgress, video?.id, video?.remote]);
  const creator = video?.remote?.channelName?.trim() ?? "";
  const creatorKeyword = creator.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  // Provider and derived creator tags can normalize to the same display
  // label. De-duplicate after normalization so React keys stay stable and a
  // tag is never rendered twice in the preview.
  const allVisibleTags = [...new Set(
    (creatorKeyword && !tags.includes(creatorKeyword) ? [creatorKeyword, ...tags] : tags)
      .map((tag) => tag.replace(/^(?:keyword-|creator-)/i, "")),
  )];
  // Provider pulls can retain hundreds of useful description words. Render a
  // generous first window so an expanded archive never makes the preview slow.
  const visibleTags = allVisibleTags.slice(0, 80);
  const tagsLocked = Boolean(metadataProvenance?.lockedFields?.includes("tags"));
  const tagSourceSummary = [...new Set(Object.values(metadataProvenance?.tags ?? {}))]
    .map((source) => source === "manual" ? "your edit" : source === "local-name" ? "local filename" : source === "companion-inspection" ? "Companion inspection" : source === "local-vision" ? "local vision" : source === "legacy" ? "saved library" : source.replace(/^provider:/, "provider · "))
    .join(", ");
  const creatorRating = creator ? getCreatorRating(creator) : 0;
  const creatorFavorite = creator ? creatorIsFavorited(creator) : false;
  const creatorLiked = creator ? creatorIsLiked(creator) : false;
  useEffect(() => { if (!previewId) return; setRating(getRating(previewId)); }, [previewId]);
  useEffect(() => {
    const refresh = () => setRatingRevision((value) => value + 1);
    window.addEventListener("reelcase:rating-change", refresh);
    return () => window.removeEventListener("reelcase:rating-change", refresh);
  }, []);
  useEffect(() => {
    // Rotate tie-breaks while a preview stays open. The taste signals remain
    // dominant, but a shelf does not become a permanently fixed six titles.
    const timer = window.setInterval(() => { if (allowAutomaticRefresh()) setRecommendationSeed(Date.now() >>> 0); }, 60_000);
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
  const ranked = usePreviewRanking(video, videos, allTags, adultFolderIds, unavailable, hiddenVideos, recommendationSeed, `${ratingRevision}:${creatorRevision}:${tagRevision}`);
  const rankedVideos = useMemo(() => {
    const items = lookupVideos(videos, [...ranked.related, ...ranked.recommended]);
    const visible = (item: typeof video): item is NonNullable<typeof video> => Boolean(item && !unavailable[item.id] && !hiddenVideos[item.id]
      && (isAdultPullKind(item.remote?.kind) || adultFolderIds.has(item.folderId)) === previewIsAdult);
    return { related: items.slice(0, ranked.related.length).filter(visible), recommended: items.slice(ranked.related.length).filter(visible) };
  }, [ranked, videos, unavailable, hiddenVideos, adultFolderIds, previewIsAdult]);
  const { related, recommended } = rankedVideos;
  const tagScores = useMemo(() => new Map(Object.entries(ranked.tagScores)), [ranked]);
  const tagEvidence = (tag: string) => tagScores.get(tag.trim().toLowerCase());
  const tagPreference = (tag: string) => {
    const row = tagEvidence(tag);
    const score = confidenceAdjustedPreference(row?.total ?? 0, row?.count ?? 0);
    return `${score > 0 ? '+' : ''}${score.toFixed(2)}`;
  };
  if (!video) return null;
  const adultImage = Boolean(video.remote && isAdultImageKind(video.remote.kind, video.mime, video.extension));
  const myFreeCamsRoom = video.remote?.kind === "myfreecams";
  // Redgifs CDN file links can be short-lived or reject a browser request
  // without the session context. The official iframe is the durable player
  // path (and is the same path used for Redgifs attached to Reddit posts).
  // Keep direct media for the other adult providers, where it is the best
  // available playback route.
  const redgifsEmbed = video.remote?.kind === "redgifs" && Boolean(video.remote.embedUrl);
  const directAdultMedia = Boolean(
    video.remote
      && isAdultPullKind(video.remote.kind)
      && video.src
      && /\.(?:mp4|webm|gifv)(?:\?|$)/i.test(video.src)
      && !redgifsEmbed,
  );
  const imageSrc = adultImage
    ? (booruImage.original || video.src || video.remote?.embedUrl || video.remote?.previewUrl || video.poster || null)
    : null;
  const embed = adultImage
    ? null
    : video.remote && !myFreeCamsRoom && (video.remote.embedUrl || video.remote.kind === "youtube") && !directAdultMedia
      ? video.remote.kind === "twitch"
        ? twitchEmbedUrl(video.remote, window.location.hostname)
        : video.remote.kind === "youtube"
          ? youtubeEmbedUrl(video.remote.embedUrl ?? video.src ?? video.remote.watchUrl ?? "", video.remote.videoId, window.location.origin)
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
        <div className={video.remote?.kind === "twitch" ? "mt-5 grid min-w-0 grid-cols-1 gap-7" : video.remote?.kind === "youtube" ? "mt-5 grid min-w-0 grid-cols-1 gap-7 xl:grid-cols-[minmax(0,2.35fr)_minmax(20rem,0.65fr)]" : "mt-5 grid min-w-0 grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.7fr)]"}>
          <div className="min-w-0">
            <div className="overflow-hidden rounded-lg bg-elevated shadow-border">
              {redditRemoved ? <p role="status" className="flex aspect-video items-center justify-center p-6 text-sm text-muted">Removed by Reddit · hidden from photo recommendations.</p> : imageSrc ? (
                <img
                  src={imageSrc}
                  alt={video.name}
                  className="aspect-video w-full bg-bg object-contain"
                  decoding="async"
                  referrerPolicy={video.remote?.channelId === 'rule34' ? 'strict-origin-when-cross-origin' : 'no-referrer'}
                  onError={() => { if (booruImage.original) booruImage.failed(); }}
                />
              ) : embed ? (
                <iframe
                  title={`${video.name} preview`}
                  src={embed}
                  className="aspect-video w-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : myFreeCamsRoom ? (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
                  <p className="text-sm text-muted">This is a confirmed MyFreeCams live room. MyFreeCams does not provide a permitted in-app player.</p>
                  {video.remote?.watchUrl && <a href={video.remote.watchUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">Open MyFreeCams live <ExternalLink className="ml-2 size-4" /></a>}
                </div>
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
                    if (!element.paused && !element.seeking && document.visibilityState === "visible") {
                      const now = performance.now();
                      if (previewWatchTick.current) previewWatchPending.current += Math.min(1, Math.max(0, (now - previewWatchTick.current) / 1000));
                      previewWatchTick.current = now;
                      if (previewWatchPending.current >= 4) flushPreviewWatch();
                    } else previewWatchTick.current = 0;
                    if (Number.isFinite(element.duration) && element.duration > 0) markProgress(video.id, element.currentTime, element.duration);
                  }}
                  onPause={flushPreviewWatch}
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
            <h1 className="mt-2 break-words font-display text-4xl leading-none text-fg sm:text-5xl">
              {video.name.replace(/\.[^/.]+$/, "")}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted [overflow-wrap:anywhere]">
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
            <PullPauseButton />
            {video.remote && supportsRemoteComments(video.remote.kind) && (
              <div className="mt-4">
                <AdultComments key={video.id} video={video} />
              </div>
            )}
{creator && <div className="mt-4 rounded-lg border border-border bg-elevated/55 p-4"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Creator taste</p><div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : isAdultPullKind(video.remote?.kind) ? "adults" : "youtube"); setQuery(creator); closePreview(); }} className="font-medium text-fg hover:text-accent">{creator}</button><Button size="sm" variant={creatorLiked ? "default" : "secondary"} onClick={() => { toggleCreatorLike(creator); setCreatorRevision((value) => value + 1); }}><ThumbsUp className={creatorLiked ? "size-3.5 fill-current" : "size-3.5"}/>{creatorLiked ? "Creator liked" : "Like creator"}</Button><Button size="sm" variant={creatorFavorite ? "default" : "secondary"} aria-pressed={creatorFavorite} onClick={() => { toggleCreatorFavorite(creator); setCreatorRevision(value => value + 1); }}><Heart className={creatorFavorite ? "size-3.5 fill-current" : "size-3.5"}/>{creatorFavorite ? "Creator favorite" : "Favorite creator"}</Button>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => { setCreatorRating(creator, value); setCreatorRevision((revision) => revision + 1); }} className={`flex size-8 items-center justify-center rounded-sm text-xs shadow-border ${value <= creatorRating ? "bg-accent text-accent-fg" : "bg-bg/50 text-accent"}`} aria-label={`Rate creator ${creator} ${value} stars`}>{value}</button>)}</div><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={creatorLoading || !video.remote} onClick={() => void (async () => { if (!video.remote) return; setCreatorLoading(true); try { if (video.remote.kind === "youtube" || video.remote.kind === "twitch") await followRemoteQuery(creator, video.remote.kind); setCreatorRevision((value) => value + 1); } finally { setCreatorLoading(false); } })()}>{creatorLoading ? "Pulling older videos…" : "Pull older creator videos"}</Button></div><p className="mt-2 text-xs text-muted">Creator likes, favorites and ratings boost related recommendations. Watch time and private marks add bounded interest. Pulling older videos expands coverage.</p></div>}
          </div>
          <aside className="min-w-0 rounded-lg bg-elevated p-5 shadow-border">
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
                    <button type="button" title={`Show videos tagged ${tag} · confidence-adjusted preference ${tagPreference(tag)} · ${tagEvidence(tag)?.count ?? 0} rated videos`} onClick={() => {
                      if (previewIsAdult) {
                        // Stay on Adults and filter in-place — never jump to Search/Home via setQuery.
                        setQuery("");
                        setSource("adults");
                        window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag } }));
                        closePreview();
                        return;
                      }
                      setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : "all");
                      setQuery(tag);
                      closePreview();
                    }} className="px-2 py-1 transition-colors hover:bg-accent/15 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">#{tag} <span className="text-accent">· {tagPreference(tag)}</span></button>
                    <button type="button" title={tagIsLiked(tag) ? `Unlike tag ${tag}` : `Like tag ${tag}`} aria-label={tagIsLiked(tag) ? `Unlike tag ${tag}` : `Like tag ${tag}`} onClick={() => { toggleTagLike(tag); setTagRevision((value) => value + 1); }} className={`border-l border-border px-1.5 transition-colors hover:bg-accent/15 ${tagIsLiked(tag) ? "text-accent" : "text-subtle"}`}><Heart className={tagIsLiked(tag) ? "size-3 fill-current" : "size-3"}/></button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-subtle">No keywords yet</span>
              )}
            </div>{allVisibleTags.length > visibleTags.length && <p className="mt-2 text-xs text-muted">Showing {visibleTags.length} of {allVisibleTags.length} saved provider tags. Search the source to use the rest.</p>}
            <p className="mt-2 text-xs text-muted">{tagsLocked ? "Manual tags are locked; provider refreshes cannot replace them." : tagSourceSummary ? `Tag sources: ${tagSourceSummary}.` : "Tags are waiting for a local or provider metadata source."}</p>
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
                <p className="text-xs leading-5 text-muted">Saving tags locks this field to your choices. Provider refreshes can still update the card itself, but they cannot replace these tags or your category.</p>
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
            <h2 className="font-display text-2xl text-fg">{previewIsAdult ? "More Adult picks from this shelf" : "More from this shelf"}</h2>
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
            <h2 className="font-display text-2xl text-fg">{previewIsAdult ? "More Adult picks to try next" : "More to try next"}</h2>
            <p className="mt-1 text-sm text-muted">{previewIsAdult ? "A fresh Adult-only mix based on this title’s tags, creator, source, and your saved Adult interests." : "A fresh mix based on this title’s genre and what was added recently."}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {recommended.map((item) => <button key={item.id} type="button" onClick={() => useLibrary.getState().openPreview(item.id)} className="overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface">{item.poster ? <img src={item.poster} alt="" loading="lazy" className="aspect-video w-full object-cover" onError={(event) => { const fallback = item.remote?.kind === "youtube" && item.remote.videoId ? `https://i.ytimg.com/vi/${item.remote.videoId}/mqdefault.jpg` : ""; if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback; else event.currentTarget.style.display = "none"; }} /> : <span className="block aspect-video bg-bg" />}<span className="block truncate px-3 py-2 text-sm text-fg">{item.name}</span></button>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
