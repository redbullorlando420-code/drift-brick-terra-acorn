import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Glasses, Play, Star, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { getRating, setRating as saveRating } from "@/lib/media-feedback";
import { resolvePlayUrl } from "@/lib/videos/sources";

const EMPTY_TAGS: string[] = [];

export function PreVideo() {
  const previewId = useLibrary((s) => s.previewId);
  const videos = useLibrary((s) => s.videos);
  const openVideo = useLibrary((s) => s.openVideo);
  const closePreview = useLibrary((s) => s.closePreview);
  const setSource = useLibrary((s) => s.setSource);
  const setQuery = useLibrary((s) => s.setQuery);
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  const setVideoCategory = useLibrary((s) => s.setVideoCategory);
  const tags = useLibrary((s) => (previewId ? (s.tags[previewId] ?? EMPTY_TAGS) : EMPTY_TAGS));
  const category = useLibrary((s) => (previewId ? (s.categories[previewId] ?? "") : ""));
  const [editing, setEditing] = useState(false);
  const [tagText, setTagText] = useState("");
  const [categoryText, setCategoryText] = useState("");
  const [vrAvailable, setVrAvailable] = useState(false);
  const [rating, setRating] = useState(0);
  const [localPreviewSrc, setLocalPreviewSrc] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const markUnavailable = useLibrary((s) => s.markUnavailable);
  const video = videos.find((item) => item.id === previewId);
  useEffect(() => { if (!previewId) return; setRating(getRating(previewId)); }, [previewId]);
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
  const related = useMemo(
    () =>
      video
        ? videos
            .filter(
              (item) =>
                item.id !== video.id &&
                (item.folderId === video.folderId || item.genre === video.genre),
            )
            .slice(0, 8)
        : [],
    [video, videos],
  );
  const recommended = useMemo(() => video ? videos.filter((item) => item.id !== video.id && !related.some((relatedItem) => relatedItem.id === item.id)).sort((a, b) => Number(b.genre === video.genre) - Number(a.genre === video.genre) || b.addedAt - a.addedAt).slice(0, 6) : [], [related, video, videos]);
  if (!video) return null;
  const embed = video.remote?.embedUrl
    ? video.remote.kind === "twitch"
      ? `${video.remote.embedUrl}${video.remote.embedUrl.includes("?") ? "&" : "?"}parent=${encodeURIComponent(window.location.hostname)}`
      : (() => { const url = new URL(video.remote.embedUrl, "https://www.youtube.com"); url.protocol = "https:"; url.hostname = "www.youtube.com"; url.searchParams.set("autoplay", "1"); url.searchParams.set("rel", "0"); url.searchParams.set("modestbranding", "1"); url.searchParams.set("playsinline", "1"); url.searchParams.set("origin", window.location.origin); return url.toString(); })()
    : null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg/98 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={closePreview}>
            <ArrowLeft className="size-4" /> Browse
          </Button>
          <Button variant="ghost" size="icon" aria-label="Close preview" onClick={closePreview}>
            <X className="size-5" />
          </Button>
        </div>
        <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.7fr)]">
          <div>
            <div className="overflow-hidden rounded-lg bg-elevated shadow-border">
              {embed ? (
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
            </div>
          </div>
          <aside className="rounded-lg bg-elevated p-5 shadow-border">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Details</p>
            <p className="mt-3 text-sm text-fg">
              {video.year ?? "New"} · {video.genre ?? "Uncategorized"}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.length ? (
                tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    title={`Show videos tagged ${tag}`}
                    onClick={() => {
                      setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : "all");
                      setQuery(tag);
                      closePreview();
                    }}
                    className="rounded-xs bg-bg/50 px-2 py-1 text-xs text-muted transition-colors hover:bg-accent/15 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    #{tag}
                  </button>
                ))
              ) : (
                <span className="text-xs text-subtle">No keywords yet</span>
              )}
            </div>
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
                    onClick={() => { saveRating(video.id, value); setRating(value); }}
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
                    <img src={item.poster} alt="" className="aspect-video w-full object-cover" />
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
              {recommended.map((item) => <button key={item.id} type="button" onClick={() => useLibrary.getState().openPreview(item.id)} className="overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface">{item.poster ? <img src={item.poster} alt="" className="aspect-video w-full object-cover" /> : <span className="block aspect-video bg-bg" />}<span className="block truncate px-3 py-2 text-sm text-fg">{item.name}</span></button>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
