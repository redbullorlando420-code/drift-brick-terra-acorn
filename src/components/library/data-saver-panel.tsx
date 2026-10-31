import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  dataSaverActive,
  getDataSaverMode,
  setDataSaverMode,
  subscribeDataSaver,
} from "@/lib/data-saver";
import { transferAccountingSnapshot } from "@/lib/transfer-accounting";
const labels = {
  metadata: "App metadata",
  artwork: "Artwork",
  companion: "Companion browser requests",
  embed: "Embedded players",
  media: "Direct media",
};
const bytes = (value: number) =>
  value < 1024
    ? `${value} B`
    : value < 1048576
      ? `${(value / 1024).toFixed(1)} KiB`
      : `${(value / 1048576).toFixed(2)} MiB`;
export function DataSaverPanel() {
  const mode = useSyncExternalStore(
    subscribeDataSaver,
    getDataSaverMode,
    () => "adaptive" as const,
  );
  const active = useSyncExternalStore(subscribeDataSaver, dataSaverActive, () => false);
  const [snapshot, setSnapshot] = useState(transferAccountingSnapshot);
  return (
    <section
      className="min-w-0 rounded-lg bg-elevated p-5 shadow-border sm:col-span-2"
      aria-label="Save Data and transfers"
      data-data-saver
    >
      <h2 className="font-display text-2xl text-fg">Save Data and transfers</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Pause nearby artwork and speculative preview, player and desk code loading. Visible artwork,
        chosen playback, manual pulls and room timing remain available. Started transfers may
        finish; this never starts a model download.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Data usage mode">
        <Button
          className="min-h-11"
          variant={mode === "adaptive" ? "default" : "secondary"}
          aria-pressed={mode === "adaptive"}
          onClick={() => setDataSaverMode("adaptive")}
        >
          Follow device
        </Button>
        <Button
          className="min-h-11"
          variant={mode === "save-data" ? "default" : "secondary"}
          aria-pressed={mode === "save-data"}
          onClick={() => setDataSaverMode("save-data")}
        >
          Save Data
        </Button>
      </div>
      <p className="mt-3 text-sm text-accent" role="status">
        {active ? "Optional prefetch paused" : "Optional prefetch allowed"}
        {active && mode === "adaptive" ? " · device Save Data is enabled" : ""}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-medium text-fg">Observed this page session</h3>
        <Button
          className="min-h-11"
          variant="outline"
          onClick={() => setSnapshot(transferAccountingSnapshot())}
        >
          Refresh transfer summary
        </Button>
      </div>
      {!snapshot.supported && (
        <p className="mt-2 text-sm text-muted">
          Resource timing is unavailable or has no observer. Transfer totals are unmeasured.
        </p>
      )}
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {snapshot.classes.map((row) => (
          <div key={row.kind} className="min-w-0 rounded-md bg-bg/45 p-3">
            <dt className="text-sm font-medium text-fg">{labels[row.kind]}</dt>
            <dd className="mt-1 text-xs leading-5 text-muted">
              {row.requests} observed ·{" "}
              {row.measuredRequests ? bytes(row.transferBytes) : "Bytes unmeasured"} across{" "}
              {row.measuredRequests} measured · {row.unmeasuredRequests} unmeasured
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs leading-5 text-muted">
        Observed browser transfers only, including exposed headers. App metadata counts the browser
        response, not upstream provider traffic. Cross-origin sizes may be hidden. Embedded
        player/media internals and native Companion downloads are unmeasured, even when no request
        appears here. Zero measured bytes does not mean zero use. No saved-bytes estimate, URLs,
        titles or cookies are recorded. Counts refresh on demand; no polling.
      </p>
    </section>
  );
}
