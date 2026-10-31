import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { companionFetch, companionHealth } from "@/lib/companion";
import { DiagnosticExportPreview } from "./diagnostic-export-preview";
import { downloadDiagnostic } from "@/lib/diagnostic-export";
type RootRow = {
  id: string;
  path: string;
  state: "approved" | "revoked" | "identity-changed" | "policy-unreadable";
  revision: number;
  enabled: boolean;
};
type Access = {
  generation: number;
  active: number;
  pending: number;
  persistent: boolean;
  roots: RootRow[];
};
function parse(value: unknown): Access {
  const v = value as Access & { ok?: boolean };
  if (
    !v ||
    v.ok !== true ||
    !Number.isSafeInteger(v.generation) ||
    !Number.isSafeInteger(v.active) ||
    !Number.isSafeInteger(v.pending) ||
    typeof v.persistent !== "boolean" ||
    !Array.isArray(v.roots) ||
    v.roots.length > 64 ||
    v.roots.some(
      (r) =>
        !r ||
        !/^\w{24}$/.test(r.id) ||
        typeof r.path !== "string" ||
        r.path.length > 32768 ||
        !Number.isSafeInteger(r.revision) ||
        !["approved", "revoked", "identity-changed", "policy-unreadable"].includes(r.state) ||
        typeof r.enabled !== "boolean",
    )
  )
    throw Error("Folder access response was unreadable. No approval was changed.");
  return v;
}
export function RootAccessPanel() {
  const [access, setAccess] = useState<Access>(),
    [selected, setSelected] = useState<RootRow>(),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const request = useRef<AbortController | null>(null),
    latch = useRef(false);
  useEffect(() => () => request.current?.abort(), []);
  const run = async (path: string, body?: object) => {
    if (latch.current) return;
    latch.current = true;
    setBusy(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await companionFetch(path, {
          signal: controller.signal,
          ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
        }),
        data = await response.json();
      controller.signal.throwIfAborted();
      if (!response.ok || !data.ok)
        throw Error(data.error || "Folder access could not be checked.");
      setAccess(parse(data));
      setSelected(undefined);
      setNotice(
        body
          ? "Folder access updated. Affected queued work stopped; partial files and personal library records are retained."
          : "Current configured folders reviewed. No scan or permission change was requested.",
      );
      if (body) void companionHealth(true);
    } catch (error) {
      if (!controller.signal.aborted)
        setNotice(
          error instanceof Error ? error.message : "Folder access failed. Refresh before retrying.",
        );
    } finally {
      latch.current = false;
      setBusy(false);
      request.current = null;
    }
  };
  return (
    <section
      aria-label="Companion folder access"
      className="mt-4 space-y-3 rounded-lg border border-border bg-elevated p-5"
    >
      <h2 className="font-display text-2xl text-fg">Companion folder access</h2>
      <p className="text-sm leading-6 text-muted">
        Review only folders already configured on this computer. Access is pinned to the folder’s
        filesystem identity. Adding a new folder requires local Companion setup; this screen never
        grants access to arbitrary paths.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={busy} onClick={() => void run("/roots/status")}>
          Review approved folders
        </Button>
        {access && (
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() =>
              downloadDiagnostic("root-access", access, "realhub-folder-access-diagnostic.json")
            }
          >
            Export folder status diagnostic
          </Button>
        )}
      </div>
      <p role="status" className="break-words text-sm text-accent">
        {notice}
      </p>
      {access && (
        <>
          <p className="text-sm text-muted">
            {access.active} approved · generation {access.generation} · {access.pending} active
            access checks. Status refreshes only when requested.
          </p>
          {!access.persistent && (
            <p role="alert" className="text-sm text-accent">
              The local approval policy could not be saved or read. Access stays blocked where
              revoked; repair Companion configuration before restoring access.
            </p>
          )}
          <ul className="space-y-3">
            {access.roots.map((row, i) => (
              <li key={row.id} className="rounded-md bg-bg/45 p-3">
                <p className="text-sm font-medium text-fg">
                  Configured folder {i + 1} ·{" "}
                  {row.state === "approved"
                    ? "Approved"
                    : row.state === "identity-changed"
                      ? "Folder identity changed"
                      : row.state === "policy-unreadable"
                        ? "Policy unavailable"
                        : "Revoked"}
                </p>
                <p className="mt-1 break-all text-xs leading-5 text-muted">{row.path}</p>
                <Button
                  variant="secondary"
                  className="mt-2 min-h-11"
                  disabled={busy || row.state === "identity-changed" || !access.persistent}
                  onClick={() => setSelected(row)}
                >
                  {row.enabled ? "Revoke folder access" : "Restore configured access"}
                </Button>
                {row.state === "identity-changed" && (
                  <p className="mt-2 text-xs leading-5 text-muted">
                    A renamed, replaced or retargeted folder cannot inherit approval. Review it in
                    local Companion setup and restart before choosing access again.
                  </p>
                )}
              </li>
            ))}
          </ul>
          {!access.roots.length && (
            <p className="text-sm text-muted">
              No configured folders are available. Existing library bookmarks remain usable;
              configure approved folders locally to use native files.
            </p>
          )}
          <DiagnosticExportPreview kind="root-access" data={access} />
        </>
      )}
      {selected && (
        <div
          role="region"
          aria-label="Folder access consequence review"
          className="space-y-3 rounded-md border border-accent/30 p-4"
        >
          <h3 className="font-medium text-fg">
            {selected.enabled
              ? "Revoke this configured folder?"
              : "Restore access to this configured folder?"}
          </h3>
          <p className="break-all text-xs text-muted">{selected.path}</p>
          <p className="text-sm leading-6 text-muted">
            {selected.enabled
              ? "Queued downloads are stopped, active downloads are asked to stop, ongoing file streams close, and delayed artwork writes are denied. Partial files, bookmarks, ratings and original media remain."
              : "Only this originally configured folder with its pinned identity becomes available again. Interrupted jobs stay stopped until you explicitly resume them. No scan, download or launch starts automatically."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={busy}
              onClick={() =>
                void run("/roots/change", {
                  id: selected.id,
                  revision: selected.revision,
                  enabled: !selected.enabled,
                })
              }
            >
              {selected.enabled ? "Confirm revoke access" : "Confirm restore access"}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => setSelected(undefined)}>
              Cancel access change
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
