import { VideoCard } from "./video-card";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";

export function ContinueRail({ videos }: { videos: LibraryVideo[] }) {
  if (!videos.length) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-xl text-fg">Continue watching</h2>
      <div className="rail-scroll flex gap-4 overflow-x-auto pb-2">
        {videos.map((video, i) => (
          <VideoCard key={video.id} video={video} variant="rail" index={i} />
        ))}
      </div>
    </section>
  );
}

export function FavoritesRail({ videos }: { videos: LibraryVideo[] }) {
  if (!videos.length) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-xl text-fg">Favorites</h2>
      <div className="rail-scroll flex gap-4 overflow-x-auto pb-2">
        {videos.map((video, i) => (
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
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-xl text-fg">History</h2>
      <div className="rail-scroll flex gap-4 overflow-x-auto pb-2">
        {videos.map((video, i) => (
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
  if (view === "list") {
    return (
      <div className="flex flex-col gap-1">
        {videos.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            variant="list"
            index={i}
            playedAt={playedAt?.[video.id]}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {videos.map((video, i) => (
        <VideoCard
          key={video.id}
          video={video}
          variant="grid"
          index={i}
          playedAt={playedAt?.[video.id]}
        />
      ))}
    </div>
  );
}
