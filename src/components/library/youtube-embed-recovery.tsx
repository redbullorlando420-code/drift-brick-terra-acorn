import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, Download } from "lucide-react";
import {
  exportYoutubeEmbedEvidence,
  youtubeEmbedIssue,
  type YoutubeEmbedEvidence,
} from "@/lib/multiplayer/room-youtube-diagnostics";
export const YoutubeEmbedRecovery = memo(function YoutubeEmbedRecovery({
  videoId,
  rows,
  notice,
  onReload,
  onClearEarlier,
}: {
  videoId: string;
  rows: YoutubeEmbedEvidence[];
  notice: string;
  onReload: () => void;
  onClearEarlier: () => void;
}) {
  const [exportNotice, setExportNotice] = useState(""),
    [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const current = rows.find((row) => row.videoId === videoId),
    event = current?.events.at(-1),
    issue = current && youtubeEmbedIssue(current.phase, event?.code);
  const download = () => {
    try {
      const url = URL.createObjectURL(
          new Blob([exportYoutubeEmbedEvidence(rows, Date.now())], { type: "application/json" }),
        ),
        link = document.createElement("a");
      link.href = url;
      link.download = "youtube-player-diagnostics.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportNotice(
        "Diagnostics downloaded. Room access, names, local files and account data are excluded.",
      );
    } catch (error) {
      setExportNotice(
        error instanceof Error ? error.message : "Could not export player diagnostics.",
      );
    }
  };
  return (
    <section
      aria-label="Player recovery"
      className="mt-3 space-y-3 rounded-md border border-border bg-bg/45 p-3"
    >
      <div aria-live="polite" aria-atomic="true">
        {issue ? (
          <>
            <h3 className="text-sm font-medium text-fg">{issue.title}</h3>
            <p className="mt-1 text-xs leading-5 text-accent">{issue.detail}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{issue.action}</p>
            {event?.phase === "error" && (
              <p className="mt-2 text-xs text-muted">
                Observed YouTube player code {event.code}. This is not a channel-wide availability
                check.
              </p>
            )}
          </>
        ) : (
          <p className="text-xs leading-5 text-muted">
            {current?.phase === "loading"
              ? "Waiting for this device’s YouTube player."
              : "No current YouTube player failure reported."}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" className="min-h-11" onClick={onReload}>
          <RefreshCw className="size-3" />
          Reload this player
        </Button>
        <a
          href={"https://www.youtube.com/watch?v=" + encodeURIComponent(videoId)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs text-accent hover:bg-elevated"
        >
          <ExternalLink className="size-3" />
          Open on YouTube
        </a>
      </div>
      <p className="text-xs leading-5 text-muted">
        Affects this device. Use Play next to change the room video. Watching outside the app does
        not synchronize playback; chat and the queue stay available here.
      </p>
      {notice && notice !== issue?.detail && (
        <p role="status" className="text-xs leading-5 text-accent">
          {notice}
        </p>
      )}
      <details
        className="border-t border-border pt-2"
        onToggle={(event) => setDiagnosticsOpen(event.currentTarget.open)}
      >
        <summary className="min-h-11 cursor-pointer py-2 text-xs font-medium text-fg">
          Player diagnostics · {rows.length} / 12 titles
        </summary>
        {diagnosticsOpen && (
          <div>
            <p className="mt-2 text-xs leading-5 text-muted">
              This browser’s current room visit only. Up to six recent transitions per title;
              repeated player clocks are not recorded. Reports stay in memory for this visit; a file
              is downloaded only when you choose.
            </p>
            <ol
              aria-label="YouTube player evidence"
              className="mt-3 max-h-72 space-y-3 overflow-y-auto"
            >
              {[...rows].reverse().map((row) => (
                <li key={row.videoId} className="break-words text-xs text-muted">
                  <p className="font-medium text-fg">
                    {row.videoId === videoId ? "Current title · " : ""}
                    {row.videoId} · {row.phase} · {row.loads} player load
                    {row.loads === 1 ? "" : "s"}
                  </p>
                  <ol className="mt-1 space-y-1">
                    {row.events.map((item, index) => (
                      <li key={index}>
                        {new Date(item.at).toISOString()} · {item.phase}
                        {item.code !== undefined ? " · YouTube code " + item.code : ""}
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="min-h-11"
                disabled={!rows.length}
                onClick={download}
              >
                <Download className="size-3" />
                Download player diagnostics
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="min-h-11"
                disabled={rows.every((row) => row.videoId === videoId)}
                onClick={onClearEarlier}
              >
                Clear earlier title diagnostics
              </Button>
            </div>
            <a
              href="https://developers.google.com/youtube/iframe_api_reference#onError"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex min-h-11 items-center text-xs text-accent underline"
            >
              YouTube’s documented player errors
            </a>
            {exportNotice && (
              <p role="status" className="mt-2 text-xs leading-5 text-accent">
                {exportNotice}
              </p>
            )}
          </div>
        )}
      </details>
    </section>
  );
});
