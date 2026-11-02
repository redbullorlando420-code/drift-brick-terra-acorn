import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { loadHiddenSources, showHiddenSource } from "@/lib/videos/persist";
import { useLibrary } from "@/lib/videos/store";
import type { SourceVisibility } from "@/lib/videos/source-visibility";
export function HiddenSourcesPanel() {
  const [data, setData] = useState<SourceVisibility>(),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [showPrivate, setShowPrivate] = useState(false);
  const unlocked = useLibrary((s) => s.adultsUnlocked);
  useEffect(() => {
    let alive = true;
    void loadHiddenSources().then(
      (v) => {
        if (alive) setData(v);
      },
      (e) => {
        if (alive) setError(e instanceof Error ? e.message : "Hidden sources could not load.");
      },
    );
    return () => {
      alive = false;
    };
  }, []);
  return (
    <section
      aria-label="Hidden source recovery"
      className="mt-5 space-y-3 rounded-lg border border-border bg-elevated p-5"
    >
      <h2 className="font-display text-2xl">Hidden sources</h2>
      <p className="text-sm leading-6 text-muted">
        Hiding a source keeps its catalog, folder connection, ratings, tags, favorites, history and
        resume marks. Restore it here with no expiry. Native files are never deleted. Browser
        permission may need renewing.
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {data?.hidden.length === 0 && <p className="text-sm text-muted">No hidden local sources.</p>}
      {unlocked && data?.hidden.some((row) => row.folder.adult) && (
        <Button className="min-h-11" variant="secondary" onClick={() => setShowPrivate((v) => !v)}>
          {showPrivate ? "Hide private sources" : "Show private sources"}
        </Button>
      )}
      {data?.hidden.map((row) => (
        <div
          key={row.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-bg p-3"
        >
          <span className="break-words text-sm">
            {row.folder.adult && (!unlocked || !showPrivate) ? "Private source" : row.folder.name}
          </span>
          <Button
            className="min-h-11"
            variant="secondary"
            disabled={!!busy || (row.folder.adult && (!unlocked || !showPrivate))}
            onClick={() => {
              setBusy(row.id);
              setError("");
              void showHiddenSource(row.id).then(
                () => location.reload(),
                (e) => {
                  setError(e instanceof Error ? e.message : "Source recovery failed.");
                  setBusy("");
                },
              );
            }}
          >
            Restore source
          </Button>
        </div>
      ))}
    </section>
  );
}
