import { Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./video-card";
import { cn } from "@/lib/utils";
import { titleOf, type LibraryVideo } from "@/lib/videos/types";
import { useLibrary } from "@/lib/videos/store";
import { useThumbs } from "@/lib/videos/thumbs";
import { useEffect } from "react";

export function Billboard({ video }: { video: LibraryVideo }) {
  const thumb = useThumbs((s) => s.byId[video.id]);
  const request = useThumbs((s) => s.request);
  const openVideo = useLibrary((s) => s.openVideo);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
  const art = thumb || video.poster;

  useEffect(() => {
    request(video);
  }, [request, video]);

  return (
    <section className="relative mb-8 overflow-hidden rounded-xl bg-elevated shadow-border">
      <div className="relative aspect-video max-h-[min(72vh,560px)] w-full min-h-64">
        {art ? (
          <img src={art} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-elevated" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-bg/10" />
        <div className="absolute inset-0 bg-linear-to-r from-bg/80 via-bg/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-5 py-5 sm:max-w-xl sm:px-8 sm:py-8">
          {video.genre || video.year ? (
            <p className="text-xs font-medium tracking-wide text-accent uppercase">
              {video.genre ?? "Featured"}
              {video.year ? ` · ${video.year}` : ""}
            </p>
          ) : (
            <p className="text-xs font-medium tracking-wide text-accent uppercase">Featured</p>
          )}
          <h2 className="font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl">
            {titleOf(video)}
          </h2>
          {video.tagline && (
            <p className="max-w-md text-sm text-muted sm:text-base">{video.tagline}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            <Button onClick={() => openVideo(video.id)}>
              <Play className="size-4 fill-current" />
              Play
            </Button>
            <Button variant="secondary" onClick={() => toggleFavorite(video.id)}>
              <Heart className={cn("size-4", fav && "fill-accent text-accent")} />
              {fav ? "In My List" : "My List"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TitleRail({
  title,
  videos,
  variant = "poster",
  playedAt,
}: {
  title: string;
  videos: LibraryVideo[];
  variant?: "poster" | "rail";
  playedAt?: Record<string, number>;
}) {
  if (!videos.length) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-xl text-fg sm:text-2xl">{title}</h2>
      <div className="rail-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4">
        {videos.map((video, i) => (
          <div
            key={video.id}
            className={cn(variant === "poster" && "w-32 shrink-0 sm:w-36 md:w-40", variant === "rail" && "shrink-0")}
          >
            <VideoCard
              video={video}
              variant={variant}
              index={i}
              playedAt={playedAt?.[video.id]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function PosterGrid({ videos }: { videos: LibraryVideo[] }) {
  if (!videos.length) return null;
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
      {videos.map((video, i) => (
        <VideoCard key={video.id} video={video} variant="poster" index={i} className="w-full" />
      ))}
    </div>
  );
}
