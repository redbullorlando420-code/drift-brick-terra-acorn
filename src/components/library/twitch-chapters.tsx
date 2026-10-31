import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchTwitchChapters } from "@/lib/remote/functions";
import {
  readTwitchChapterReport,
  twitchVodChapterId,
  twitchChapterUrl,
  type TwitchChapterReport,
} from "@/lib/remote/twitch-chapters";
import type { LibraryVideo } from "@/lib/videos/types";
const selected = new Map<string, TwitchChapterReport>();
export function TwitchChapters({
  video,
  onNavigate,
}: {
  video: LibraryVideo;
  onNavigate: (seconds: number) => void;
}) {
  const id = twitchVodChapterId(video);
  return id ? <ChapterPanel key={id} id={id} onNavigate={onNavigate} /> : null;
}
function ChapterPanel({ id, onNavigate }: { id: string; onNavigate: (seconds: number) => void }) {
  const [open, setOpen] = useState(false),
    [result, setResult] = useState<TwitchChapterReport | null>(() => {
      const saved = selected.get(id);
      return saved && Date.now() - saved.checkedAt < 600000 ? saved : null;
    }),
    [busy, setBusy] = useState(false),
    [page, setPage] = useState(0),
    [notice, setNotice] = useState("");
  const request = useRef<AbortController | null>(null),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  const load = async () => {
    if (busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setNotice("");
    try {
      const raw = await fetchTwitchChapters({
        data: { videoId: id },
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(18000)]),
      });
      if (!alive.current || controller.signal.aborted) return;
      const report = readTwitchChapterReport(id, raw);
      if (report.state !== "unavailable") {
        selected.delete(id);
        selected.set(id, report);
        while (selected.size > 4) selected.delete(selected.keys().next().value!);
        setPage(0);
      }
      setResult((previous) =>
        report.state === "unavailable" && previous?.state === "ready" ? previous : report,
      );
      setNotice(report.note);
    } catch {
      if (alive.current && !controller.signal.aborted)
        setNotice(
          "Chapters could not be loaded. Keep watching or use the official Twitch link; retry is manual.",
        );
    } finally {
      if (alive.current && !controller.signal.aborted) setBusy(false);
    }
  };
  const toggle = () => {
    if (open) {
      request.current?.abort();
      setBusy(false);
      setOpen(false);
    } else {
      setOpen(true);
      if (!result) void load();
    }
  };
  const pages = Math.max(1, Math.ceil((result?.chapters.length ?? 0) / 12));
  return (
    <section
      aria-label="Twitch VOD chapters"
      className="mt-4 rounded-lg border border-border bg-elevated/55 p-4 text-sm"
    >
      <Button variant="secondary" className="min-h-11" aria-expanded={open} onClick={toggle}>
        {open ? "Hide VOD chapters" : "Show VOD chapters"}
      </Button>
      <p className="mt-2 text-xs leading-5 text-muted">
        Loads public game/chapter markers only when requested. Clips and live streams have no VOD
        chapter controls.
      </p>
      {open && (
        <div className="mt-3 space-y-3">
          <p role="status" aria-live="polite" className="text-xs leading-5 text-muted">
            {busy ? "Loading public VOD chapters…" : notice || result?.note}
          </p>
          {result?.state === "ready" && (
            <>
              <ol className="space-y-2">
                {result.chapters.slice(page * 12, page * 12 + 12).map((chapter) => (
                  <li
                    key={chapter.start}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
                  >
                    <Button
                      variant="ghost"
                      className="min-h-11 h-auto max-w-full whitespace-normal text-left"
                      onClick={() => {
                        onNavigate(chapter.start);
                        setNotice(
                          "Requested this chapter in the official embedded player. Twitch may require a tap or account access; use Open on Twitch if playback is unavailable.",
                        );
                      }}
                    >
                      {Math.floor(chapter.start / 60)}:
                      {String(Math.floor(chapter.start) % 60).padStart(2, "0")} · {chapter.label}
                    </Button>
                    <a
                      className="inline-flex min-h-11 items-center text-xs text-accent underline"
                      href={twitchChapterUrl(id, chapter.start)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on Twitch
                    </a>
                  </li>
                ))}
              </ol>
              {pages > 1 && (
                <nav aria-label="Chapter pages" className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous chapters
                  </Button>
                  <span className="text-xs text-muted">
                    Page {page + 1} of {pages}
                  </span>
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    disabled={page + 1 >= pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next chapters
                  </Button>
                </nav>
              )}
            </>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              className="min-h-11"
              disabled={busy}
              onClick={() => void load()}
            >
              Retry chapter load
            </Button>
            <a
              href={twitchChapterUrl(id, 0)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center text-xs text-accent underline"
            >
              Open full VOD on Twitch
            </a>
          </div>
          <p className="text-xs leading-5 text-muted">
            Timestamp navigation reloads this device’s official player using Twitch’s VOD start
            time. It does not change saved progress or a Watch Together room.
          </p>
        </div>
      )}
    </section>
  );
}
