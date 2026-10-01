import { VideoCard } from "./video-card";
import { VirtualVideoGrid } from "./virtual-video-grid";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";

/** Initial / incremental page size — catalog stays full in memory/IDB; only this many cards mount. */
const PAGE = 36;
const RAIL_CAP = 18;

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

export function VideoGrid({ videos, playedAt }: { videos: LibraryVideo[]; playedAt?: Record<string, number> }) {
  const view = useLibrary(s => s.view);
  if (!videos.length) return <div className="rounded-xl bg-surface px-6 py-16 text-center shadow-border">
    <p className="font-display text-2xl text-fg">No videos here</p>
    <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Try another source, clear search, or add a folder from this computer.</p>
  </div>;
  return <VirtualVideoGrid videos={videos} playedAt={playedAt} variant={view === "list" ? "list" : "grid"} pageSize={PAGE} automatic />;
}
