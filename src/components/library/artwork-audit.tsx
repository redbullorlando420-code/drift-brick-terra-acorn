import { useState } from "react";
import { Button } from "@/components/ui/button";
import { companionArtworkAudit, type ArtworkAudit } from "@/lib/companion";

export function ArtworkAuditPanel() {
  const [report, setReport] = useState<ArtworkAudit>();
  const [busy, setBusy] = useState(false);
  return <section className="rounded-lg bg-elevated p-5 shadow-border">
    <h2 className="font-display text-2xl text-fg">Artwork disk cache</h2>
    <p className="mt-2 text-sm leading-6 text-muted">Inspect disk usage by source before changing retention. This reads cache file sizes without loading the images.</p>
    <Button className="mt-4" variant="secondary" disabled={busy} onClick={() => void (async () => { setBusy(true); try { setReport(await companionArtworkAudit()); } finally { setBusy(false); } })()}>{busy ? "Inspecting cache…" : "Audit artwork cache"}</Button>
    {report && <div className="mt-4 text-sm" role="status">{!report.ok ? <p className="text-muted">{report.error}</p> : <>
      <p className="text-muted">Disk reads measured since {new Date(report.startedAt!).toLocaleString()}. “No reads” means no hit-rate sample yet. Source groups use cache ID prefixes; unrecognized entries remain local or unknown.</p>
      {report.truncated && <p className="mt-2 text-accent">Partial inventory: the scan reached its time or entry budget. Sizes below are lower bounds.</p>}
      {Boolean(report.skipped) && <p className="mt-2 text-muted">{report.skipped} entries could not be inspected.</p>}
      <div className="mt-3 space-y-3">{report.sources?.length ? report.sources.map(row => <div key={row.source} className="rounded-md bg-bg/50 p-3"><p className="font-medium text-fg">{row.source}</p><p className="mt-1 tabular-nums text-muted">{row.files.toLocaleString()} files · {(row.bytes / 1_048_576).toFixed(2)} MiB · {row.hits + row.misses ? `${Math.round(100 * row.hits / (row.hits + row.misses))}% hits (${row.hits} hit / ${row.misses} miss)` : "No reads"}</p>{row.oldestAt !== null && <p className="mt-1 text-xs text-muted">Oldest file updated {new Date(row.oldestAt).toLocaleDateString()}</p>}</div>) : <p className="text-muted">The cache is empty and has no recorded reads.</p>}</div>
    </>}</div>}
  </section>;
}
