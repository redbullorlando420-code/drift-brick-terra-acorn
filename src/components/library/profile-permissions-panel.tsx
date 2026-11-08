import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { forgetCurrentDirectoryGrant, useLibrary } from "@/lib/videos/store";
import { rememberDirHandle } from "@/lib/videos/sources";
import { onDirectoryGrantForgotten } from "@/lib/directory-grant-notice";
import type { DirectoryGrantRecord } from "@/lib/videos/persist";
import { BrowserPermissionControl } from "./capability-permissions";
import { ConsequenceAction } from "./consequence-action";

const PAGE = 12;
type Evidence = PermissionState | "unavailable";
const labels: Record<Evidence, string> = {
  granted: "Read access granted",
  denied: "Permission needed · denied",
  prompt: "Permission needed",
  unavailable: "Browser permission status unavailable",
};
type DirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission?: (input: { mode: "read" }) => Promise<PermissionState>;
  requestPermission?: (input: { mode: "read" }) => Promise<PermissionState>;
};
const basename = (name: string) => name.split(/[\\/]/).at(-1)?.slice(0, 150) || "Saved folder";

export function ProfilePermissionsPanel() {
  const [rows, setRows] = useState<DirectoryGrantRecord[]>(),
    [hidden, setHidden] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0),
    [checking, setChecking] = useState(false),
    [busy, setBusy] = useState("");
  const [states, setStates] = useState<Record<string, Evidence>>({}),
    [status, setStatus] = useState(""),
    [error, setError] = useState("");
  const loadRevision = useRef(0),
    latch = useRef(false);
  const refresh = async () => {
    const request = ++loadRevision.current;
    setChecking(true);
    setError("");
    try {
      const { loadDirectoryGrantRecords, loadHiddenSources } = await import("@/lib/videos/persist");
      const [records, visibility] = await Promise.all([
        loadDirectoryGrantRecords(),
        loadHiddenSources(),
      ]);
      if (request !== loadRevision.current) return;
      setRows(records);
      setHidden(new Set(visibility.hidden.map((row) => row.id)));
      setPage((p) => Math.min(p, Math.max(0, Math.ceil(records.length / PAGE) - 1)));
    } catch {
      if (request === loadRevision.current)
        setError("Saved directory grants could not be read. No access was changed.");
    } finally {
      if (request === loadRevision.current) setChecking(false);
    }
  };
  useEffect(() => {
    void refresh();
    const off = onDirectoryGrantForgotten(() => void refresh());
    return () => {
      loadRevision.current++;
      off();
    };
  }, []);
  useEffect(() => {
    if (!rows) return;
    let live = true;
    setStates({});
    void Promise.all(
      rows.slice(page * PAGE, (page + 1) * PAGE).flatMap((row) => {
        if (!("handle" in row)) return [];
        const handle = row.handle as DirectoryHandle;
        return [
          (async (): Promise<[string, Evidence]> => {
            try {
              const state = await handle.queryPermission?.({ mode: "read" });
              return [row.id, state && Object.hasOwn(labels, state) ? state : "unavailable"];
            } catch {
              return [row.id, "unavailable"];
            }
          })(),
        ];
      }),
    ).then((next) => {
      if (live) setStates(Object.fromEntries(next));
    });
    return () => {
      live = false;
    };
  }, [rows, page]);
  const reauthorize = async (row: DirectoryGrantRecord) => {
    if (!("handle" in row) || hidden.has(row.id) || latch.current) return;
    const handle = row.handle as DirectoryHandle;
    latch.current = true;
    setBusy(row.id);
    setError("");
    setStatus("");
    try {
      // Call the already reviewed handle from the click, before any await.
      const permission = await handle.requestPermission?.({ mode: "read" });
      const { readDirectoryGrant } = await import("@/lib/videos/persist");
      const latest = await readDirectoryGrant(row.id);
      if (!latest || !("handle" in latest))
        throw Error("Folder access changed. Refresh this inventory.");
      if (permission === "granted") {
        rememberDirHandle(row.id, latest.handle);
        useLibrary.setState((s) => ({
          folders: s.folders.map((folder) =>
            folder.id === row.id ? { ...folder, needsPermission: false } : folder,
          ),
        }));
        setStatus("Folder read access renewed. No scan was started.");
      } else
        setStatus(
          "Permission was not granted. Saved source records and bookmarks are still available.",
        );
      setStates((s) => ({
        ...s,
        [row.id]: permission && Object.hasOwn(labels, permission) ? permission : "unavailable",
      }));
    } catch {
      setStatus("Permission could not be renewed. Saved source records and bookmarks were kept.");
      void refresh();
    } finally {
      latch.current = false;
      setBusy("");
    }
  };
  return (
    <section aria-label="Profile permission inventory" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">Saved browser folders</h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            Read access for the current profile. Checking access does not ask for new permission or
            scan files.
          </p>
        </div>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={checking || !!busy}
          onClick={() => void refresh()}
        >
          Refresh folder access
        </Button>
      </div>
      {checking && (
        <p role="status" className="text-xs text-muted">
          Checking saved folder access…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {status && (
        <p role="status" className="text-sm text-accent">
          {status}
        </p>
      )}
      {rows?.length === 0 && (
        <p className="text-sm text-muted">No saved browser folder grants in this profile.</p>
      )}
      <ul className="space-y-2">
        {rows?.slice(page * PAGE, (page + 1) * PAGE).map((row) => {
          const state = states[row.id],
            isHidden = hidden.has(row.id);
          return (
            <li key={row.id} className="rounded-lg border border-border bg-bg p-3">
              <p className="break-words text-sm font-medium">{basename(row.name)}</p>
              <p className="mt-1 text-xs text-muted">
                {"handle" in row
                  ? state
                    ? labels[state]
                    : "Checking browser status…"
                  : "Folder access forgotten"}
                {isHidden ? " · hidden source" : ""}
              </p>
              {"handle" in row ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {!isHidden && (
                    <Button
                      variant="secondary"
                      className="min-h-11"
                      disabled={
                        checking ||
                        !!busy ||
                        state === "granted" ||
                        typeof (row.handle as DirectoryHandle).requestPermission !== "function"
                      }
                      onClick={() => void reauthorize(row)}
                    >
                      Renew read access
                    </Button>
                  )}
                  <ConsequenceAction
                    label="Forget folder access"
                    title={"Forget access to " + basename(row.name) + "?"}
                    confirm="Forget saved access"
                    disabled={checking || !!busy}
                    onConfirm={async () => {
                      await forgetCurrentDirectoryGrant(row.id);
                      setStatus(
                        "Saved handle forgotten for this profile. The catalog and original files were kept.",
                      );
                    }}
                  >
                    <p>
                      This profile will stop opening or rescanning files through this handle. It
                      cannot start a new Watch Room share from it. An already open stream in another
                      tab may continue.
                    </p>
                    <p>
                      Catalog rows, bookmarks and original files stay in place. Other profiles and
                      Companion roots are unchanged.
                    </p>
                  </ConsequenceAction>
                </div>
              ) : (
                <p className="mt-2 text-xs leading-5 text-muted">
                  Add the folder again or use file identity review to reconnect saved titles.
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {!!rows && rows.length > PAGE && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={!page}
            onClick={() => setPage(page - 1)}
          >
            Previous folders
          </Button>
          <span>
            Page {page + 1} of {Math.ceil(rows.length / PAGE)}
          </span>
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={(page + 1) * PAGE >= rows.length}
            onClick={() => setPage(page + 1)}
          >
            Next folders
          </Button>
        </div>
      )}
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-sm font-medium">Optional permissions for this profile</h3>
        <BrowserPermissionControl scope="local-vision" />
        <BrowserPermissionControl scope="draft-composer" />
      </div>
      <div className="rounded-lg border border-border bg-bg p-3">
        <h3 className="text-sm font-medium">Companion device access</h3>
        <p className="mt-1 text-xs leading-5 text-muted">
          Approved native roots and Companion permissions apply to this computer and its approved
          app origins. This inventory never changes them.
        </p>
        <Button
          variant="ghost"
          className="mt-2 min-h-11"
          onClick={() => {
            const library = useLibrary.getState();
            library.setQuery("");
            library.setSource("settings");
          }}
        >
          Open device settings
        </Button>
      </div>
    </section>
  );
}
