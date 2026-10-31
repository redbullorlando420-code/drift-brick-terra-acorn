import { useState } from "react";
import { ArrowRight, RefreshCw, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import type { SourceId } from "@/lib/videos/types";
import {
  featureReadiness,
  type ReadinessSnapshot,
  type ReadinessProbe,
} from "@/lib/feature-readiness";

export function FeatureReadinessPanel() {
  const hydrated = useLibrary((s) => s.hydrated),
    videos = useLibrary((s) => s.videos.length),
    go = useLibrary((s) => s.setSource);
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [snapshot, setSnapshot] = useState<ReadinessSnapshot | null>(null),
    [error, setError] = useState("");
  const check = async () => {
    setBusy(true);
    setError("");
    try {
      const { companionHealth } = await import("@/lib/companion"),
        { localTool } = await import("@/lib/local-tools");
      const health = await companionHealth(true),
        probes: ReadinessSnapshot["probes"] = {};
      if (health?.negotiation?.compatible) {
        const capabilities = health.negotiation.capabilities;
        await Promise.allSettled(
          (
            [
              ["downloads", "/youtube/downloads", "youtube-downloads"],
              ["a1111", "/studio/status", "studio-models"],
              ["qwen", "/studio/qwen/status", "studio-models"],
              ["remote", "/remote/status", "remote-launch-safeguards"],
            ] as const
          ).map(async ([id, path, cap]) => {
            if (!capabilities.includes(cap)) return;
            try {
              const value = await localTool<Record<string, unknown>>(path);
              probes[id] = { ok: true, value } satisfies ReadinessProbe;
            } catch {
              probes[id] = { ok: false };
            }
          }),
        );
      }
      setSnapshot({ health, probes, checkedAt: Date.now() });
    } catch {
      setError(
        "The check could not finish. Previous observations remain visible; no setup was changed.",
      );
    } finally {
      setBusy(false);
    }
  };
  const rows = featureReadiness({ hydrated, videos, snapshot });
  return (
    <section
      aria-label="Feature readiness"
      className="my-6 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-fg">Feature readiness</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            App implementation, local setup and real-world verification are separate. Milestone
            checkmarks do not connect an integration.
          </p>
        </div>
        <Button
          variant="secondary"
          className="min-h-11"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide readiness" : "Review readiness"}
        </Button>
      </div>
      {open && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-bg p-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-fg">
              <Power className="size-4" />
              Desktop server controls
            </h3>
            <p className="mt-2 text-xs leading-5 text-muted">
              Use Realhub on your desktop to launch the server and Companion. Stop Realhub shuts
              down this installation and keeps saved libraries. Active work is interrupted; save
              edits first. Closing a browser tab leaves the services running.
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">
              The stop shortcut requests Companion cleanup and verifies exact process identities
              before its fallback. Separately started native apps or handed-off RustDesk sessions
              may stay open.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={busy}
              onClick={() => void check()}
            >
              <RefreshCw className="size-4" />
              {busy ? "Checking local setup…" : "Check local readiness"}
            </Button>
            <p role="status" className="text-xs text-muted">
              {snapshot
                ? "Snapshot at " +
                  new Date(snapshot.checkedAt).toLocaleTimeString() +
                  ". Check again after changing setup."
                : "No local services checked yet."}
            </p>
          </div>
          <p className="text-xs leading-5 text-muted">
            A check reads local status only. It does not start engines, scan folders, download
            models, connect accounts or join rooms. Configuration ready means a prerequisite is
            available; native actions remain unverified here.
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {rows.map((row) => (
              <article
                key={row.id}
                data-readiness={row.id}
                className="min-w-0 rounded-lg border border-border bg-bg p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-fg">{row.title}</h3>
                  <span className="rounded border border-border px-2 py-1 text-xs text-muted">
                    App implemented
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-fg" data-configuration={row.state}>
                  {row.configuration}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">{row.evidence}</p>
                <p className="mt-2 text-xs leading-5 text-muted">{row.next}</p>
                <Button
                  variant="secondary"
                  className="mt-3 min-h-11"
                  onClick={() => {
                    go(row.target as SourceId);
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                >
                  Open {row.title}
                  <ArrowRight className="size-4" />
                </Button>
              </article>
            ))}
          </div>
          <a
            className="inline-flex min-h-11 items-center text-sm text-accent underline"
            href="/feature-readiness-evidence.json"
            target="_blank"
            rel="noreferrer"
          >
            Read implementation verification evidence
          </a>
          <p className="text-xs leading-5 text-muted">
            Evidence describes controlled checks of app behavior. Missing native or account evidence
            remains unverified. This inventory does not store private probe results or change
            milestone statuses.
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
