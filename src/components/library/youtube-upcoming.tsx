import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";

export function YoutubeUpcoming() {
  const follows = useLibrary((s) => s.follows),
    refresh = useLibrary((s) => s.refreshFollows);
  const checking = useLibrary((s) => s.youtubeLiveProgress?.status === "running");
  const [page, setPage] = useState(0),
    [error, setError] = useState("");
  const rows = useMemo(() => {
    const seen = new Set<string>();
    return follows
      .filter((c) => c.kind === "youtube")
      .flatMap((channel) =>
        (channel.youtubeEvents ?? [])
          .filter((e) => (e.state === "upcoming" || e.state === "uncertain") && !e.wasLiveAt)
          .flatMap((event) => {
            if (seen.has(event.id)) return [];
            seen.add(event.id);
            return [{ channel, event }];
          }),
      )
      .sort(
        (a, b) =>
          (a.event.scheduledAt ?? Infinity) - (b.event.scheduledAt ?? Infinity) ||
          a.event.id.localeCompare(b.event.id),
      );
  }, [follows]);
  if (!rows.length) return null;
  const start = Math.min(page * 12, Math.max(0, Math.ceil(rows.length / 12) - 1) * 12);
  return (
    <section
      aria-label="Upcoming YouTube broadcasts"
      className="mb-6 rounded-lg border border-border bg-elevated p-4 sm:p-5"
    >
      <h2 className="font-display text-2xl text-fg">
        Coming up on YouTube{" "}
        <span className="text-sm text-muted">
          {rows.length.toLocaleString()} scheduled or awaiting an update
        </span>
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Scheduled times come from YouTube. Passing the start time does not confirm a live stream.
        Near-start checks share the existing discovery budget; other creators keep their turns.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.slice(start, start + 12).map(({ channel, event }) => (
          <article
            key={event.id}
            data-youtube-event={event.id}
            className="min-w-0 rounded-md border border-border bg-bg/50 p-3"
          >
            <p className="text-xs font-medium text-accent">
              {event.state === "uncertain" || (channel.lastLiveFailure?.at ?? 0) >= event.observedAt
                ? "Awaiting confirmation"
                : "Scheduled"}{" "}
              · {channel.title}
            </p>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-fg">{event.title}</p>
            <p className="mt-2 text-xs text-muted">
              {event.scheduledAt
                ? new Date(event.scheduledAt).toLocaleString()
                : "Start time unavailable"}
            </p>
            {event.previousScheduledAt && (
              <p className="mt-1 text-xs text-muted">
                Time changed from {new Date(event.previousScheduledAt).toLocaleString()}
              </p>
            )}
            {channel.lastLiveFailure && (channel.lastLiveFailure.at ?? 0) >= event.observedAt && (
              <p className="mt-1 text-xs text-muted">
                Last check failed. The saved schedule is retained.
              </p>
            )}
            <p className="mt-1 text-xs text-muted">
              Observed {new Date(event.observedAt).toLocaleString()}
              {event.state === "uncertain" ? " · not currently confirmed in the listing" : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-accent underline"
                target="_blank"
                rel="noreferrer"
                href={"https://www.youtube.com/watch?v=" + event.id}
              >
                Open event
              </a>
              <Button
                variant="secondary"
                className="min-h-11"
                disabled={checking}
                onClick={() =>
                  void (async () => {
                    setError("");
                    try {
                      await refresh("youtube", {
                        youtubeLiveOnly: true,
                        channelIds: [channel.id],
                        liveSweep: true,
                      });
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Could not check this event.");
                    }
                  })()
                }
              >
                Check creator
              </Button>
            </div>
          </article>
        ))}
      </div>
      {rows.length > 12 && (
        <nav
          aria-label="Upcoming event pages"
          className="mt-4 flex items-center justify-between gap-2"
        >
          <Button variant="ghost" disabled={!start} onClick={() => setPage(start / 12 - 1)}>
            Previous events
          </Button>
          <span className="text-xs text-muted">
            {start + 1}–{Math.min(start + 12, rows.length)} of {rows.length}
          </span>
          <Button
            variant="ghost"
            disabled={start + 12 >= rows.length}
            onClick={() => setPage(start / 12 + 1)}
          >
            Next events
          </Button>
        </nav>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-muted">
          {error}
        </p>
      )}
    </section>
  );
}
