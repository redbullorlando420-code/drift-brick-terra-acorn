import { Button } from "@/components/ui/button";
import type { LibraryVideo } from "@/lib/videos/types";
import {
  cleanYoutubePublishedLabel,
  youtubeDateSource,
  youtubePublicationPrecision,
  youtubePublicationTime,
} from "@/lib/videos/youtube-metadata";
const dayFormat = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const instantFormat = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});
export function YoutubePublicationEvidence({ video }: { video: LibraryVideo }) {
  const precision = youtubePublicationPrecision(video),
    at = youtubePublicationTime(video),
    source = youtubeDateSource(video),
    label = cleanYoutubePublishedLabel(video.remote?.publishedLabel);
  const sources = {
    rss: "YouTube RSS feed",
    provider: "YouTube listing metadata",
    watch: "Matching YouTube watch page",
    unknown: precision === "relative" ? "YouTube listing label" : "No exact publication evidence",
    legacy: "Legacy metadata",
  };
  const observed = video.remote?.publishedLabelAt,
    hasObserved =
      typeof observed === "number" &&
      Number.isFinite(observed) &&
      observed > 0 &&
      observed <= 8.64e15;
  const exportEvidence = () => {
    const report = {
      version: 1,
      videoId: video.remote?.videoId,
      precision,
      source: precision === "relative" ? "provider-label" : source,
      ...(at
        ? {
            date: new Date(at).toISOString().slice(0, 10),
            ...(precision === "instant" ? { timestamp: new Date(at).toISOString() } : {}),
          }
        : {}),
      ...(precision === "relative"
        ? { label, ...(hasObserved ? { labelObservedAt: new Date(observed!).toISOString() } : {}) }
        : {}),
    };
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "youtube-publication-" + video.remote?.videoId + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section
      aria-label="YouTube publication evidence"
      className="space-y-2 rounded-md border border-border bg-bg/40 p-3"
    >
      <p className="text-sm font-medium text-fg">
        {precision === "instant"
          ? "Exact publication time"
          : precision === "day"
            ? "Publication calendar date"
            : precision === "relative"
              ? "Approximate publication label"
              : "Publication date unknown"}
      </p>
      {at > 0 && (
        <p className="text-sm text-fg">
          {precision === "instant"
            ? instantFormat.format(at) + " UTC"
            : dayFormat.format(at) + " · day precision, time unavailable"}
        </p>
      )}
      {precision === "relative" && (
        <p className="break-words text-sm text-fg">
          YouTube reported “{label}”
          {hasObserved ? " · observed " + dayFormat.format(observed!) : ""}. The exact date is
          unknown.
        </p>
      )}
      <p className="text-xs leading-5 text-muted">
        Source: {sources[source]}.{" "}
        {precision === "unknown"
          ? "A saved or downloaded date is not used as publication evidence."
          : precision === "relative"
            ? "This saved label is not converted into an exact timestamp."
            : "Calendar dates display in UTC so changing devices cannot shift the day."}
      </p>
      <p className="text-xs leading-5 text-muted">
        Publication order uses exact timestamps or the start of a known UTC day. Equal publication values use stable video-ID ties; relative and unknown dates stay at the end. A day-only date
        does not establish a time within that day.
      </p>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="min-h-11"
        disabled={!/^[\w-]{11}$/.test(video.remote?.videoId ?? "")}
        onClick={exportEvidence}
      >
        Export date evidence
      </Button>
    </section>
  );
}
