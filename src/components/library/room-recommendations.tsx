import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import type { LibraryVideo } from "@/lib/videos/types";

function poster(video: LibraryVideo) {
  if (video.remote?.kind === "youtube" && video.remote.videoId)
    return video.poster || `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg`;
  return video.poster;
}

function RoomRecommendationsView({ videos, youtubeVideos, currentId, visibleCount, pending, onSelect, onMix, onLoadMore }: {
  videos: LibraryVideo[];
  youtubeVideos: LibraryVideo[];
  currentId: string;
  visibleCount: number;
  pending: boolean;
  onSelect: (video: LibraryVideo) => void;
  onMix: () => void;
  onLoadMore: () => void;
}) {
  const [youtubeLimit, setYoutubeLimit] = useState(24);
  return <div>
    <div className="mt-2 flex flex-wrap gap-2">
      <Button size="sm" variant="ghost" onClick={onMix}><Shuffle className="size-3.5" /> Mix playable picks</Button>
      {videos.length > visibleCount && <Button size="sm" variant="ghost" onClick={onLoadMore}>Load 18 more playable videos</Button>}
    </div>
    {pending ? <p role="status" aria-live="polite" className="mt-3 text-xs text-muted">Preparing your playable videos in small background slices… You can keep using the room while they load.</p> : <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
      {videos.slice(0, visibleCount).map(video => {
        const image = poster(video);
        return <button key={video.id} type="button" onClick={() => onSelect(video)} className={`w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === currentId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`}>
          {image && <img src={image} alt="" loading="lazy" decoding="async" className="aspect-video w-full object-cover" onError={event => {
            const fallback = video.remote?.kind === "youtube" && video.remote.videoId ? `https://i.ytimg.com/vi/${video.remote.videoId}/mqdefault.jpg` : "";
            if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
            else event.currentTarget.style.display = "none";
          }} />}
          <span className="block truncate px-2 py-2 text-xs">{video.name}</span>
        </button>;
      })}
    </div>}
    {youtubeVideos.length > 0 && <section className="mt-4" aria-label="YouTube recommendations">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h3 className="text-sm font-semibold text-fg">More from YouTube</h3><p className="text-xs text-muted">{youtubeVideos.length} playable titles in your library</p></div>
        {youtubeVideos.length > youtubeLimit && <Button size="sm" variant="secondary" onClick={() => setYoutubeLimit(limit => Math.min(youtubeVideos.length, limit + 24))}>Show 24 more YouTube videos</Button>}
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-2">{youtubeVideos.slice(0, youtubeLimit).map(video => <button key={video.id} type="button" onClick={() => onSelect(video)} className={`w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === currentId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`}>
        <img src={poster(video) || `https://i.ytimg.com/vi/${video.remote?.videoId}/mqdefault.jpg`} alt="" loading="lazy" decoding="async" className="aspect-video w-full object-cover" onError={event => {
          const fallback = `https://i.ytimg.com/vi/${video.remote?.videoId}/mqdefault.jpg`;
          if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
          else event.currentTarget.style.display = "none";
        }} />
        <span className="block truncate px-2 py-2 text-xs">{video.name}</span>
      </button>)}</div>
    </section>}
  </div>;
}

export const RoomRecommendations = memo(RoomRecommendationsView);
