import {diagnosticText} from '@/lib/diagnostic-export';
import {DiagnosticExportPreview} from './diagnostic-export-preview';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  compareCompanionUpdate,
  readUpdateSnapshot,
  updateSnapshotKey,
  type UpdateSnapshot,
} from "@/lib/companion-update";

export function CompanionUpdatePanel({ current }: { current: UpdateSnapshot | null }) {
  const { user } = useCurrentUserState();
  return user ? (
    <UpdateChecklist key={user.id} owner={user.id} current={current} />
  ) : (
    <p className="text-sm text-muted">Sign in to save an update baseline for your workspace.</p>
  );
}
function UpdateChecklist({ current, owner }: { current: UpdateSnapshot | null; owner: string }) {
  const key = updateSnapshotKey(owner);
  const [initial] = useState(() => {
    try {
      const text = localStorage.getItem(key);
      if (text && text.length > 32000) throw Error("Saved update baseline is too large.");
      return { baseline: text ? readUpdateSnapshot(JSON.parse(text)) : null, error: "" };
    } catch (error) {
      return {
        baseline: null,
        error: error instanceof Error ? error.message : "Saved baseline is unreadable.",
      };
    }
  });
  const [baseline, setBaseline] = useState(initial.baseline),
    [notice, setNotice] = useState(initial.error);
  const save = () => {
    if (!current?.compatible) return;
    try {
      localStorage.setItem(key, JSON.stringify(current));
      setBaseline(current);
      setNotice(
        "Before-update summary saved for this workspace. Keep a separate private copy of the previous service and configuration.",
      );
    } catch {
      setNotice(
        "The baseline could not be saved. The previous baseline is retained; export the redacted report before updating.",
      );
    }
  };
  const exportReport = () => {
    if (!current) return;
    const report = {
      schema: 1,
      kind: "reelcase-companion-update",
      baseline,
      current,
      comparison: baseline ? compareCompanionUpdate(baseline, current) : [],
      rollback:
        "Reference only. Keep the previous service files and private configuration backup separately; this report cannot restore or restart a service.",
    };
    const url = URL.createObjectURL(
      new Blob([diagnosticText('companion-update',report)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "realhub-companion-update.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      "Redacted report exported. It contains status summaries and counts, without configuration fingerprints, local paths or session data.",
    );
  };
  return (
    <section
      aria-label="Companion update checklist"
      className="space-y-3 rounded-lg border border-border bg-bg/45 p-4"
    >
      <h3 className="font-medium text-fg">Before & after an update</h3>
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
        <li>Refresh Companion status, review active jobs, then save a before-update snapshot.</li>
        <li>
          Keep the previous service files and private configuration separately. Finish or cancel
          active downloads before manually updating and restarting only Companion.
        </li>
        <li>Refresh status again and review the comparison before using native tools.</li>
      </ol>
      <p className="text-xs leading-5 text-muted">
        These checks never install tools, change approvals, modify firewall rules or restart
        processes. A configuration reference identifies a settings snapshot; it is not a
        configuration backup.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={!current?.compatible}
          onClick={save}
        >
          Save before-update snapshot
        </Button>
        <Button variant="ghost" className="min-h-11" disabled={!current} onClick={exportReport}>
          Export redacted update report
        </Button>
      </div>
      <DiagnosticExportPreview kind="companion-update" data={{schema:1,baseline,current}}/>
      <p role="status" aria-live="polite" className="break-words text-xs leading-5 text-accent">
        {notice}
      </p>
      {baseline && (
        <p className="text-xs leading-5 text-muted">
          Saved baseline: Companion v{baseline.version} ·{" "}
          {new Date(baseline.checkedAt).toLocaleString()} · configuration{" "}
          {baseline.configurationRef?.slice(0, 12) ?? "unverified"}. Replacing it requires the Save
          action above.
        </p>
      )}
      {current ? (
        <div
          data-update-compatible={current.compatible}
          className="space-y-2 text-xs leading-5 text-muted"
        >
          <p>
            Latest check: {new Date(current.checkedAt).toLocaleString()} · approved roots:{" "}
            {current.roots ?? "unknown"} · yt-dlp: {current.tools.ytDlp ?? "unverified"} ·
            youtube-dl: {current.tools.youtubeDl ?? "unverified"}.
          </p>
          <p>
            Download receipts:{" "}
            {current.jobs
              ? `${current.jobs.running} running · ${current.jobs.queued} queued · ${current.jobs.interrupted} interrupted · ${current.jobs.paused??0} paused · ${current.jobs.done} complete · ${current.jobs.cancelled} cancelled · ${current.jobs.error} failed`
              : "unverified"}
            .
          </p>
          <ul aria-label="Update comparison" className="list-disc space-y-1 pl-5">
            {(baseline
              ? compareCompanionUpdate(baseline, current)
              : [
                  "Save a before-update snapshot to compare capabilities, approvals, configured tools and download receipts.",
                ]
            ).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-muted">
          Use Check Companion status above to create a current report. Opening Settings does not
          check or save automatically.
        </p>
      )}
    </section>
  );
}
