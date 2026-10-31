import { CompanionUpdatePanel } from './companion-update-panel';
import { companionSnapshot, type UpdateSnapshot } from '@/lib/companion-update';
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { companionHealth, companionFetch, type CompanionHealth } from "@/lib/companion";
import {
  COMPANION_FEATURES,
  negotiateCompanion,
  companionFeatureIssue,
  type CompanionFeature,
} from "@/lib/companion-protocol";
import type { YoutubeDownloadJob } from "@/lib/youtube-download";

type Recovery = {
  persistent: boolean;
  error?: string;
  retained: number;
  maxEntries: number;
  maxPending: number;
};
type Jobs = { ok: boolean; jobs: YoutubeDownloadJob[]; recovery: Recovery; error?: string };
const labels = {
  paused:"Paused · check destination",queued: "Queued",
  running: "Running",
  interrupted: "Interrupted",
  done: "Complete",
  error: "Failed",
  cancelled: "Cancelled",
};
const mainFeatures: CompanionFeature[] = [
  "platform-contract",
  "print-save-transaction",
  "file-health",
  "youtube-downloads",
  "thumb-disk-cache",
  "prints-bridge",
  "launch",
  "studio-models",
  "task-receipts",
];
export function CompanionRecoveryPanel() {
  const [checked, setChecked] = useState(false),
    [health, setHealth] = useState<CompanionHealth | null>(null),
    [jobs, setJobs] = useState<Jobs>(),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [page, setPage] = useState(0);
  const [snapshot,setSnapshot]=useState<UpdateSnapshot|null>(null);
  const alive = useRef(true),
    request = useRef<AbortController | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  const negotiation = negotiateCompanion(health),
    canRecover = negotiation.capabilities.includes("task-receipts") && negotiation.compatible;
  const readJobs = async (signal: AbortSignal) => {
    const response = await companionFetch("/tasks", { signal });
    const value = (await response.json()) as Jobs;
    if (!response.ok || !value.ok)
      throw Error(value.error || "Saved job receipts could not be read.");
    if (
      !Array.isArray(value.jobs) ||
      value.jobs
        .slice(0, 40)
        .some(
          (job) =>
            !job ||
            typeof job.id !== "string" ||
            typeof job.title !== "string" ||
            typeof job.detail !== "string" ||
            !Object.hasOwn(labels, job.status),
        )
    )
      throw Error(
        "Companion returned unreadable job receipts. Update it and check again; no job was changed.",
      );
    if (alive.current && !signal.aborted)
      setJobs({ ...value, jobs: Array.isArray(value.jobs) ? value.jobs.slice(0, 40) : [] });
    return value;
  };
  const check = async () => {
    if (busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setNotice("");
    setSnapshot(null);
    try {
      const value = await companionHealth(true);
      if (!alive.current) return;
      setChecked(true);
      setHealth(value);
      setJobs(undefined);
      const negotiated = negotiateCompanion(value);
      const receipts = negotiated.compatible && negotiated.capabilities.includes("task-receipts") ? await readJobs(controller.signal) : null;
      if(alive.current && !controller.signal.aborted)setSnapshot(companionSnapshot(value,receipts));
      if (alive.current)
        setNotice(
          negotiated.compatible
            ? "Capability check complete. Available features still require their approved folders and configured tools."
            : negotiated.reason || "Companion is unavailable.",
        );
    } catch (error) {
      if (alive.current && !controller.signal.aborted)
        setNotice(error instanceof Error ? error.message : "Companion check failed.");
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const act = async (job: YoutubeDownloadJob, action: "resume" | "cancel") => {
    if (busy || !canRecover) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setNotice("");
    try {
      const response = await companionFetch("/tasks/" + encodeURIComponent(job.id) + "/" + action, {
        method: "POST",
        body: "{}",
        signal: controller.signal,
      });
      const value = await response.json();
      if (!response.ok || !value.ok) throw Error(value.error || "Job recovery failed.");
      await readJobs(controller.signal);
      if (alive.current)
        setNotice(
          action === "resume"
            ? "Resume requested for the existing receipt. Partial files are retained; saved browser sign-in was not reused."
            : "Cancellation recorded. Existing files are retained.",
        );
    } catch (error) {
      if (alive.current && !controller.signal.aborted)
        setNotice(error instanceof Error ? error.message : "Job recovery failed.");
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const pages = Math.max(1, Math.ceil((jobs?.jobs.length ?? 0) / 10)),
    current = Math.min(page, pages - 1);
  return (
    <section
      aria-label="Companion capabilities and job recovery"
      className="mt-6 space-y-4 rounded-lg border border-border bg-elevated p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-fg">Companion & local jobs</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Check supported features before using native tools. Saved downloads stay stopped after a
            restart until you resume them. Your browser library works independently.
          </p>
        </div>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={busy}
          onClick={() => void check()}
        >
          {busy
            ? "Checking local service…"
            : checked
              ? "Refresh Companion status"
              : "Check Companion status"}
        </Button>
      </div>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-xs leading-5 text-accent"
      >
        {notice}
      </p>
      {checked && (
        <>
          <p className="text-sm text-fg">
            {negotiation.compatible
              ? `Companion v${negotiation.version} · ${negotiation.legacy ? "legacy feature negotiation" : "protocol 1"} · ${health?.roots ?? 0} approved roots`
              : "Local service unavailable or incompatible"}
          </p>
          {health?.platform?.schema===1&&<p className="text-xs leading-5 text-muted" role="note">{health.platform.note}</p>}
          <ul aria-label="Companion feature availability" className="grid gap-2 sm:grid-cols-2">
            {mainFeatures.map((feature) => {
              const issue = companionFeatureIssue(negotiation, feature);
              return (
                <li
                  key={feature}
                  data-companion-feature={feature}
                  data-feature-ready={!issue}
                  className="rounded-md border border-border bg-bg/45 p-3 text-xs leading-5"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong className="text-fg">{COMPANION_FEATURES[feature].label}</strong>
                    <span className="text-accent">{issue ? "Unavailable" : "Supported"}</span>
                  </div>
                  {issue && <p className="mt-1 text-muted">{issue}</p>}
                </li>
              );
            })}
          </ul>
          <p className="text-xs leading-5 text-muted">
            Supported describes the protocol, not permission or successful native execution.
            Checking status never installs tools, changes roots, starts downloads or launches an
            application.
          </p>
          <details className="rounded-md border border-border p-3">
            <summary className="min-h-11 cursor-pointer text-sm text-fg">
              All negotiated features
            </summary>
            <ul className="space-y-1 text-xs text-muted">
              {(Object.keys(COMPANION_FEATURES) as CompanionFeature[]).map((feature) => (
                <li key={feature}>
                  {COMPANION_FEATURES[feature].label} ·{" "}
                  {companionFeatureIssue(negotiation, feature) ? "unavailable" : "supported"}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
      <CompanionUpdatePanel current={snapshot} />
      {canRecover && jobs && (
        <div aria-label="Saved Companion jobs" className="space-y-3 border-t border-border pt-4">
          <h3 className="text-sm font-medium text-fg">Saved download receipts</h3>
          <p className="text-xs leading-5 text-muted">
            Up to 40 receipts, one running download and eight pending. Older finished receipts may
            be retired; files are not deleted. Status refresh is manual here.
          </p>
          {(!jobs.recovery?.persistent || jobs.recovery?.error) && (
            <p role="alert" className="text-xs leading-5 text-accent">
              {jobs.recovery?.error ||
                "A writable approved download folder is required for durable receipts. New downloads will not start without a saved receipt."}
            </p>
          )}
          <ol className="space-y-2">
            {jobs.jobs.slice(current * 10, current * 10 + 10).map((job) => (
              <li
                key={job.id}
                data-companion-job={job.id}
                className="rounded-md border border-border bg-bg/45 p-3"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="min-w-0 break-words text-sm font-medium text-fg">{job.title}</p>
                  <span className="text-xs text-accent">{labels[job.status] ?? "Unknown"}</span>
                </div>
                <p className="mt-1 break-words text-xs leading-5 text-muted">{job.detail}</p>
                <p className="mt-1 text-xs text-muted">
                  Attempt {job.attempt ?? 1} ·{" "}
                  {job.source === "offline" ? "Offline save" : "YouTube"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["interrupted", "error", "cancelled", "paused"].includes(job.status) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="min-h-11"
                      disabled={busy || !jobs.recovery?.persistent}
                      onClick={() => void act(job, "resume")}
                    >
                      Resume job
                    </Button>
                  )}
                  {["queued", "running", "interrupted", "paused"].includes(job.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11"
                      disabled={busy}
                      onClick={() => void act(job, "cancel")}
                    >
                      Cancel job
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {!jobs.jobs.length && (
            <p className="text-sm text-muted">
              No saved download receipts in the configured folder.
            </p>
          )}
          {pages > 1 && (
            <nav aria-label="Companion job pages" className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="min-h-11"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                Previous jobs
              </Button>
              <span className="text-xs text-muted">
                Page {current + 1} of {pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-11"
                disabled={current === pages - 1}
                onClick={() => setPage(current + 1)}
              >
                Next jobs
              </Button>
            </nav>
          )}
          <p className="text-xs leading-5 text-muted">
            Resume uses public access on this computer. For YouTube browser sign-in, use that
            video’s Download panel and explicitly enable sign-in for the new attempt. Interrupted
            model transfers, scans and image generation use their own tool controls; they are not
            silently resubmitted here.
          </p>
        </div>
      )}
    </section>
  );
}
