import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Cpu,
  Heart,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Tag,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatBytes, formatTime } from "@/lib/utils";
import { useLibrary } from "@/lib/videos/store";
import { useThumbs } from "@/lib/videos/thumbs";
import { resolvePlayUrl } from "@/lib/videos/sources";
import { isLikelyPlayable } from "@/lib/videos/types";
import { attachFrameCallback, probeHardwareDecode, type HwInfo } from "@/lib/videos/hw";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const EMPTY_TAGS: string[] = [];

function twitchEmbed(base: string) {
  if (typeof window === "undefined") return base;
  const hosts = new Set([
    window.location.hostname,
    window.location.hostname.replace(/^www\./, ""),
    "grok.com",
    "www.grok.com",
    "x.com",
    "localhost",
    "127.0.0.1",
  ]);
  const qs = [...hosts].map((h) => `parent=${encodeURIComponent(h)}`).join("&");
  return `${base}${base.includes("?") ? "&" : "?"}${qs}`;
}

export function Player({ playlist }: { playlist: string[] }) {
  const activeId = useLibrary((s) => s.activeId);
  const video = useLibrary((s) => s.videos.find((v) => v.id === s.activeId));
  const closePlayer = useLibrary((s) => s.closePlayer);
  const playRelative = useLibrary((s) => s.playRelative);
  const markProgress = useLibrary((s) => s.markProgress);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const toggleLike = useLibrary((s) => s.toggleLike);
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  const setVideoCategory = useLibrary((s) => s.setVideoCategory);
  const hardwareAccel = useLibrary((s) => s.hardwareAccel);
  const setHardwareAccel = useLibrary((s) => s.setHardwareAccel);
  const fav = useLibrary((s) => (s.activeId ? Boolean(s.favorites[s.activeId]) : false));
  const liked = useLibrary((s) => (s.activeId ? Boolean(s.likes[s.activeId]) : false));
  const tags = useLibrary((s) => (s.activeId ? (s.tags[s.activeId] ?? EMPTY_TAGS) : EMPTY_TAGS));
  const category = useLibrary((s) => (s.activeId ? (s.categories[s.activeId] ?? "") : ""));
  const saved = useLibrary((s) => (s.activeId ? s.progress[s.activeId] : undefined));

  const wrapRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number>(0);
  const [src, setSrc] = useState<string | null>(null);
  const [srcError, setSrcError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [chrome, setChrome] = useState(true);
  const [fs, setFs] = useState(false);
  const [scrub, setScrub] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hw, setHw] = useState<HwInfo | null>(null);
  const capturedDur = useThumbs((s) => (video ? s.durations[video.id] : undefined));
  const scrubbing = useRef(false);

  useEffect(() => {
    if (!video) {
      setSrc(null);
      return;
    }
    if (video.remote) {
      setSrc(null);
      setSrcError(null);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setSrcError(null);
    setLoadError(null);
    setPlaying(false);
    setCurrent(0);
    setHw(null);
    void resolvePlayUrl(video)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch((err: unknown) => {
        if (!cancelled) setSrcError(err instanceof Error ? err.message : "Could not open file");
      });
    void probeHardwareDecode(video.mime).then((info) => {
      if (!cancelled) setHw(info);
    });
    return () => {
      cancelled = true;
    };
  }, [video]);

  const reveal = useCallback(() => {
    setChrome(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (mediaRef.current && !mediaRef.current.paused) setChrome(false);
    }, 2400);
  }, []);

  useEffect(() => {
    reveal();
    return () => window.clearTimeout(hideTimer.current);
  }, [activeId, reveal]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !src) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onMeta = () => {
      setDuration(el.duration || 0);
      const resume = saved;
      if (resume && resume.t > 1 && resume.d > 0 && resume.t / resume.d < 0.95) {
        el.currentTime = resume.t;
        setCurrent(resume.t);
      }
    };
    const onEnd = () => {
      if (video && el.duration) markProgress(video.id, el.duration, el.duration);
      playRelative(1, playlist);
    };
    const onErr = () => {
      setLoadError(
        isLikelyPlayable(video?.extension ?? "")
          ? "This file could not be decoded."
          : `${(video?.extension ?? "this").toUpperCase()} often needs a desktop player.`,
      );
    };
    const stopFrames = attachFrameCallback(el, (t) => {
      if (scrubbing.current) return;
      setCurrent(t);
      if (video && el.duration) markProgress(video.id, t, el.duration);
    });
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    el.addEventListener("error", onErr);
    void el.play().catch(() => {});
    return () => {
      stopFrames();
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("error", onErr);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, video?.id]);

  useEffect(() => {
    const el = mediaRef.current;
    if (el) el.playbackRate = speed;
  }, [speed, src]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted, src]);

  useEffect(() => {
    const onFs = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlay = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const el = mediaRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + delta));
  }, []);

  const toggleFs = useCallback(async () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await wrap.requestFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          break;
        case "Escape":
          if (document.fullscreenElement) void document.exitFullscreen();
          else closePlayer();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(e.shiftKey ? -30 : -10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(e.shiftKey ? 30 : 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.05));
          setMuted(false);
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.05));
          break;
        case "f":
        case "F":
          e.preventDefault();
          void toggleFs();
          break;
        case "m":
        case "M":
          setMuted((m) => !m);
          break;
        case "n":
        case "N":
          playRelative(1, playlist);
          break;
        case "p":
        case "P":
          playRelative(-1, playlist);
          break;
        default:
          break;
      }
      reveal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seekBy, toggleFs, closePlayer, playRelative, playlist, reveal]);

  if (!video) return null;
  const remote = video.remote;
  const embedSrc = remote
    ? remote.kind === "twitch"
      ? twitchEmbed(remote.embedUrl ?? "")
      : remote.embedUrl
        ? `${remote.embedUrl}${remote.embedUrl.includes("?") ? "&" : "?"}autoplay=1&rel=0&modestbranding=1`
        : null
    : null;

  const shown = scrub ?? current;
  const dur = duration || capturedDur || video.duration || 0;
  const i = playlist.indexOf(video.id);
  const hwLabel =
    hardwareAccel && hw?.powerEfficient ? "GPU decode" : hardwareAccel ? "Hardware on" : "Software";

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-50 flex flex-col bg-bg"
      onMouseMove={reveal}
      onTouchStart={reveal}
    >
      {embedSrc ? (
        <iframe
          title={video.name}
          src={embedSrc}
          className="absolute inset-0 size-full border-0 bg-bg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <video
          ref={mediaRef}
          src={src ?? undefined}
          className={cn(
            "absolute inset-0 size-full object-contain bg-bg",
            hardwareAccel && "hw-video",
          )}
          playsInline
          onClick={togglePlay}
          onDoubleClick={() => void toggleFs()}
        />
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-linear-to-t from-bg via-transparent to-bg/50 transition-opacity duration-200 ease-[var(--ease-out)]",
          chrome ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={cn(
          "relative z-10 flex items-center justify-between gap-3 px-4 py-3 transition-[opacity,transform] duration-200 ease-[var(--ease-smooth-out)] sm:px-6",
          chrome ? "opacity-100" : "pointer-events-none opacity-0 -translate-y-1",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Back to library" onClick={closePlayer}>
            {fs ? <X className="size-5" /> : <ChevronLeft className="size-5" />}
          </Button>
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl leading-tight text-fg sm:text-2xl">
              {video.name.replace(/\.[^/.]+$/, "")}
            </h2>
            <p className="truncate text-xs text-muted">
              {remote ? (
                [
                  remote.live ? "Live" : remote.kind === "youtube" ? "YouTube" : "Twitch",
                  remote.channelName,
                  remote.viewers ? `${remote.viewers.toLocaleString()} watching` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              ) : (
                <>
                  {video.path}
                  <span className="text-subtle"> · </span>
                  {video.extension.toUpperCase()}
                  <span className="text-subtle"> · </span>
                  {formatBytes(video.size)}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1 hidden items-center gap-1 rounded-full bg-elevated px-2 py-1 text-xs text-muted shadow-border sm:inline-flex">
            <Cpu className="size-3" />
            {hwLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            onClick={() => toggleFavorite(video.id)}
          >
            <Heart className={cn("size-4", fav && "fill-accent text-accent")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={liked ? "Remove like" : "Like"}
            onClick={() => toggleLike(video.id)}
          >
            <ThumbsUp className={cn("size-4", liked && "fill-accent text-accent")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Edit tags and category">
                <Tag className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-3">
              <MetadataEditor
                videoId={video.id}
                initialTags={tags}
                initialCategory={category}
                onSave={(nextTags, nextCategory) => {
                  setVideoTags(video.id, nextTags);
                  setVideoCategory(video.id, nextCategory);
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={closePlayer}>
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {(srcError || loadError) && (
        <div className="relative z-10 mx-auto mt-auto mb-auto max-w-md rounded-xl bg-surface px-6 py-5 text-center shadow-border">
          <p className="font-display text-xl text-fg">Can’t play this file</p>
          <p className="mt-2 text-sm text-muted">{srcError || loadError}</p>
        </div>
      )}

      {!remote && (
        <div
          className={cn(
            "relative z-10 mt-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-200 ease-[var(--ease-smooth-out)] sm:px-6",
            chrome ? "opacity-100" : "pointer-events-none opacity-0 translate-y-1",
          )}
        >
          <Slider
            min={0}
            max={Math.max(dur, 0.01)}
            step={0.05}
            value={[shown]}
            onValueChange={(v) => {
              scrubbing.current = true;
              setScrub(v[0] ?? 0);
            }}
            onValueCommit={(v) => {
              const t = v[0] ?? 0;
              const el = mediaRef.current;
              if (el) el.currentTime = t;
              setCurrent(t);
              setScrub(null);
              scrubbing.current = false;
            }}
            aria-label="Seek"
          />
          <div className="mt-3 flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous"
              disabled={i <= 0}
              onClick={() => playRelative(-1, playlist)}
            >
              <SkipBack className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label={playing ? "Pause" : "Play"}
              onClick={togglePlay}
            >
              {playing ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="ml-0.5 size-4 fill-current" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next"
              disabled={i < 0 || i >= playlist.length - 1}
              onClick={() => playRelative(1, playlist)}
            >
              <SkipForward className="size-4" />
            </Button>
            <span className="ml-1 min-w-20 font-mono text-xs tabular-nums text-muted">
              {formatTime(shown)}
              <span className="text-subtle"> / </span>
              {formatTime(dur)}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={muted ? "Unmute" : "Mute"}
                onClick={() => setMuted((m) => !m)}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </Button>
              <div className="hidden w-24 sm:block">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[muted ? 0 : volume]}
                  onValueChange={(v) => {
                    setVolume(v[0] ?? 0);
                    setMuted((v[0] ?? 0) === 0);
                  }}
                  aria-label="Volume"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="tabular-nums">
                    {speed === 1 ? "1×" : `${speed}×`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {SPEEDS.map((s) => (
                    <DropdownMenuItem key={s} onSelect={() => setSpeed(s)}>
                      {s === speed ? "· " : "  "}
                      {s}×
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onSelect={() => setHardwareAccel(!hardwareAccel)}>
                    {hardwareAccel ? "· " : "  "}
                    Hardware accel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Picture in picture"
                onClick={() => {
                  const el = mediaRef.current;
                  if (el && document.pictureInPictureEnabled) {
                    void el.requestPictureInPicture().catch(() => {});
                  }
                }}
              >
                <PictureInPicture2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={fs ? "Exit fullscreen" : "Fullscreen"}
                onClick={() => void toggleFs()}
              >
                {fs ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </Button>
            </div>
          </div>
          <p className="mt-2 hidden text-center text-xs text-subtle sm:block">
            Space play · ← → 10s · F full · M mute · N / P next · Esc close
          </p>
        </div>
      )}
      {remote && (
        <div className="relative z-10 mt-auto flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
          {remote.watchUrl && (
            <a
              href={remote.watchUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted hover:text-fg"
            >
              Open on {remote.kind === "youtube" ? "YouTube" : "Twitch"}
            </a>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Fullscreen"
            onClick={() => void toggleFs()}
          >
            {fs ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}

function MetadataEditor({
  videoId,
  initialTags,
  initialCategory,
  onSave,
}: {
  videoId: string;
  initialTags: string[];
  initialCategory: string;
  onSave: (tags: string[], category: string) => void;
}) {
  const [tags, setTags] = useState(initialTags.join(", "));
  const [category, setCategory] = useState(initialCategory);
  const [rating, setRating] = useState(0);
  useEffect(() => {
    setTags(initialTags.join(", "));
    setCategory(initialCategory);
    try {
      setRating(Number(localStorage.getItem(`reelcase.rating.${videoId}`) ?? 0));
    } catch {
      setRating(0);
    }
  }, [videoId, initialCategory, initialTags]);
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-fg">Local metadata</p>
        <p className="mt-1 text-xs text-muted">Saved only in this browser.</p>
      </div>
      <label className="block text-xs text-muted">
        Category
        <Input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Movie, tutorial, stream…"
          className="mt-1"
        />
      </label>
      <label className="block text-xs text-muted">
        Tags
        <Input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="noir, favorites, watch later"
          className="mt-1"
        />
      </label>
      <div>
        <p className="text-xs text-muted">Your rating</p>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRating(value);
                localStorage.setItem(`reelcase.rating.${videoId}`, String(value));
              }}
              className={cn(
                "flex size-8 items-center justify-center rounded-sm text-sm shadow-border",
                value <= rating ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <Button size="sm" className="w-full" onClick={() => onSave(tags.split(","), category)}>
        Save metadata
      </Button>
    </div>
  );
}
