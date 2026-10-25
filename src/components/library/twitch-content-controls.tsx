import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TWITCH_CONTENT_OPTIONS,
  twitchContentReport,
  type TwitchContentFilter,
} from "@/lib/videos/twitch-content";
import type { LibraryVideo } from "@/lib/videos/types";
export function TwitchContentControls({
  value,
  onChange,
  videos,
  pending,
}: {
  value: TwitchContentFilter;
  onChange: (value: TwitchContentFilter) => void;
  videos: LibraryVideo[];
  pending: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const download = async () => {
    if (busy || pending) return;
    setBusy(true);
    setNotice("Preparing type report…");
    try {
      const blob = await twitchContentReport(videos),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "realhub-twitch-types.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Downloaded the selected catalog with Twitch types and source evidence.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not export Twitch types.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      aria-label="Twitch content types"
      className="mb-4 rounded-lg border border-border bg-surface p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-xs text-muted">
          Content type
          <select
            aria-label="Twitch content type"
            value={value}
            onChange={(e) => onChange(e.target.value as TwitchContentFilter)}
            className="mt-1 block min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
          >
            {TWITCH_CONTENT_OPTIONS.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={busy || pending || !videos.length}
          onClick={() => void download()}
        >
          {busy ? "Preparing report…" : "Export type report"}
        </Button>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Filters the full catalog below, including saved/topic selections. Past broadcasts,
        highlights and uploads use matching Twitch shelf evidence. Unknown subtype means that
        evidence is not saved yet; a normal archive pull can fill it in. Duration and titles do not
        decide the type.
      </p>
      {notice && (
        <p role="status" className="mt-2 text-xs leading-5 text-accent">
          {notice}
        </p>
      )}
    </section>
  );
}
