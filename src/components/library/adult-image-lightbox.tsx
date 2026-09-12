import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adultRemoteLabel } from "@/lib/videos/adult-sites";
import type { LibraryVideo } from "@/lib/videos/types";

/** In-app full-bleed image viewer for booru / photo-kind adult pulls. */
export function AdultImageLightbox({
  video,
  tags = [],
}: {
  video: LibraryVideo;
  tags?: string[];
}) {
  const remote = video.remote;
  const src =
    video.src ||
    remote?.embedUrl ||
    remote?.previewUrl ||
    video.poster ||
    "";
  const sourceTags = tags.filter((tag) => tag.startsWith("source-")).slice(0, 4);
  const creatorTags = tags.filter((tag) => tag.startsWith("creator-")).slice(0, 4);

  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6">
        {src ? (
          <img
            src={src}
            alt={video.name}
            className="max-h-full max-w-full object-contain"
            decoding="async"
          />
        ) : (
          <p className="text-sm text-muted">No image available for this title.</p>
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-bg via-bg/80 to-transparent px-4 pb-20 pt-16 sm:px-6">
        <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-2">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
            {adultRemoteLabel(remote?.kind)} photo viewer
          </p>
          <p className="truncate text-sm text-fg">{video.name}</p>
          {(sourceTags.length > 0 || creatorTags.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {[...sourceTags, ...creatorTags].map((tag) => (
                <span key={tag} className="rounded-full bg-elevated px-2 py-0.5 text-[11px] text-muted shadow-border">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {remote?.watchUrl && (
            <div>
              <a href={remote.watchUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary">
                  Open post page <ExternalLink className="size-3.5" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
