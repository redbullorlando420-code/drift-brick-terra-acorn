import { VideoCard } from "./video-card";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";

/** Initial / incremental page size — catalog stays full in memory/IDB; only this many cards mount. */
const PAGE = 36;
/** Hard ceiling for simultaneously mounted cards in the infinite grid. */
const MOUNT_CAP = 108;
const RAIL_CAP = 18;
const ROW_ESTIMATE = 280;

export function ContinueRail({ videos }: { videos: LibraryVideo[] }) {
  if (!videos.length) return null;
  const shown = videos.slice(0, RAIL_CAP);
  return (
    <section className="mb-8 media-shelf">
      <h2 className="mb-3 font-display text-xl text-fg">Continue watching</h2>
      <div className="rail-scroll flex gap-4 overflow-x-auto pb-2">
        {shown.map((video, i) => (
          <VideoCard key={video.id} video={video} variant="rail" index={i} />
        ))}
      </div>
    </section>
  );
}

export function FavoritesRail({ videos }: { videos: LibraryVideo[] }) {
  if (!videos.length) return null;
  const shown = videos.slice(0, RAIL_CAP);
  return (
    <section className="mb-8 media-shelf">
      <h2 className="mb-3 font-display text-xl text-fg">Favorites</h2>
      <div className="rail-scroll flex gap-4 overflow-x-auto pb-2">
        {shown.map((video, i) => (
          <VideoCard key={video.id} video={video} variant="rail" index={i} />
        ))}
      </div>
    </section>
  );
}

export function HistoryRail({
  videos,
  playedAt,
}: {
  videos: LibraryVideo[];
  playedAt: Record<string, number>;
}) {
  if (!videos.length) return null;
  const shown = videos.slice(0, RAIL_CAP);
  return (
    <section className="mb-8 media-shelf">
      <h2 className="mb-3 font-display text-xl text-fg">History</h2>
      <div className="rail-scroll flex gap-4 overflow-x-auto pb-2">
        {shown.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            variant="rail"
            index={i}
            playedAt={playedAt[video.id]}
          />
        ))}
      </div>
    </section>
  );
}

export function VideoGrid({
  videos,
  playedAt,
}: {
  videos: LibraryVideo[];
  playedAt?: Record<string, number>;
}) {
  const view = useLibrary((s) => s.view);
  const [limit, setLimit] = useState(PAGE);
  const [windowStart, setWindowStart] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const sourceKey = `${videos.length}:${videos[0]?.id ?? ""}:${videos[videos.length - 1]?.id ?? ""}`;

  useEffect(() => {
    setLimit(PAGE);
    setWindowStart(0);
  }, [sourceKey]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || limit >= videos.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLimit((value) => {
            const next = Math.min(videos.length, value + PAGE);
            queueMicrotask(() => setWindowStart((start) => Math.max(start, Math.max(0, next - MOUNT_CAP))));
            return next;
          });
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [limit, videos.length]);

  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el || windowStart <= 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setWindowStart((start) => Math.max(0, start - PAGE));
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [windowStart]);

  if (!videos.length) {
    return (
      <div className="rounded-xl bg-surface px-6 py-16 text-center shadow-border">
        <p className="font-display text-2xl text-fg">No videos here</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Try another source, clear search, or add a folder from this computer.
        </p>
      </div>
    );
  }

  const more = limit < videos.length;
  const start = Math.min(windowStart, Math.max(0, limit - 1));
  const visible = videos.slice(start, limit);
  // Approximate reserved height for unmounted lead cards so scroll-back restores
  // without a hard jump. Prefer a slight over-estimate on narrow grids.
  const leadPx = view === "list" ? start * 72 : Math.ceil(start / 2) * ROW_ESTIMATE;

  if (view === "list") {
    return (
      <>
        {leadPx > 0 && <div ref={topSentinelRef} aria-hidden="true" style={{ height: leadPx }} />}
        <div className="flex flex-col gap-1">
          {visible.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              variant="list"
              index={start + i}
              playedAt={playedAt?.[video.id]}
            />
          ))}
        </div>
        {more && (
          <>
            <div ref={sentinelRef} className="h-8" aria-hidden />
            <Button
              variant="secondary"
              className="mt-5 w-full"
              onClick={() => {
                const next = Math.min(videos.length, limit + PAGE);
                setLimit(next);
                setWindowStart((s) => Math.max(s, Math.max(0, next - MOUNT_CAP)));
              }}
            >
              Show more · {videos.length - limit} remaining
            </Button>
          </>
        )}
      </>
    );
  }

  return (
    <>
      {leadPx > 0 && <div ref={topSentinelRef} aria-hidden="true" style={{ height: leadPx }} />}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            variant="grid"
            index={start + i}
            playedAt={playedAt?.[video.id]}
          />
        ))}
      </div>
      {more && (
        <>
          <div ref={sentinelRef} className="h-8" aria-hidden />
          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => {
              const next = Math.min(videos.length, limit + PAGE);
              setLimit(next);
              setWindowStart((s) => Math.max(s, Math.max(0, next - MOUNT_CAP)));
            }}
          >
            Show more · {videos.length - limit} remaining
          </Button>
        </>
      )}
    </>
  );
}
