import { VideoCard } from "./video-card";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";

const PAGE = 96;
const RAIL_CAP = 24;

export function ContinueRail({ videos }: { videos: LibraryVideo[] }) {
  if (!videos.length) return null;
  const shown = videos.slice(0, RAIL_CAP);
  return (
    <section className="mb-8">
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
    <section className="mb-8">
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
    <section className="mb-8">
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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sourceKey = `${videos.length}:${videos[0]?.id ?? ""}:${videos[videos.length - 1]?.id ?? ""}`;

  useEffect(() => {
    setLimit(PAGE);
  }, [sourceKey]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || limit >= videos.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLimit((value) => Math.min(videos.length, value + PAGE));
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [limit, videos.length]);

  const visible = videos.slice(0, limit);
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

  if (view === "list") {
    return (
      <>
        <div className="flex flex-col gap-1">
          {visible.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              variant="list"
              index={i}
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
              onClick={() => setLimit((value) => Math.min(videos.length, value + PAGE))}
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
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            variant="grid"
            index={i}
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
            onClick={() => setLimit((value) => Math.min(videos.length, value + PAGE))}
          >
            Show more · {videos.length - limit} remaining
          </Button>
        </>
      )}
    </>
  );
}
