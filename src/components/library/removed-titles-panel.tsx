import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import {
  catalogDeletionSnapshot,
  subscribeCatalogDeletions,
  hydrateCatalogDeletions,
} from "@/lib/videos/persist";
export function RemovedTitlesPanel() {
  const ledger = useSyncExternalStore(
    subscribeCatalogDeletions,
    catalogDeletionSnapshot,
    catalogDeletionSnapshot,
  );
  const unlocked = useLibrary((state) => state.adultsUnlocked),
    restore = useLibrary((state) => state.restoreRemovedVideo);
  const [limit, setLimit] = useState(12),
    [busy, setBusy] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    void hydrateCatalogDeletions().catch((e) =>
      setError(e instanceof Error ? e.message : "Removal recovery could not load."),
    );
  }, []);
  return (
    <section
      aria-label="Removed titles recovery"
      className="mt-5 space-y-3 rounded-lg border border-border bg-elevated p-5"
    >
      <h2 className="font-display text-2xl">Removed titles</h2>
      <p className="text-sm leading-6 text-muted">
        Manual removals stay excluded from later pulls, backup media merges, and catalog recovery.
        Saved tags, ratings, history and resume marks are retained separately. Automatic cleanup
        retirement uses its existing review workflow.
      </p>
      <p className="text-xs text-muted">
        {ledger.entries.length} removal records · up to 1,024 retained. Nothing expires or silently
        returns. Local files may need permission or reattachment after restoring their metadata.
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-accent">
          {message}
        </p>
      )}
      {!ledger.entries.length && <p className="text-sm text-muted">No manually removed titles.</p>}
      {ledger.entries.slice(0, limit).map((item) => (
        <div
          key={item.id}
          className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-md bg-bg p-3"
          data-removed-title={item.private && !unlocked ? undefined : item.id}
        >
          <div className="min-w-0 flex-1">
            <p className="break-words text-sm">
              {item.private && !unlocked ? "Private removed title" : item.video.name}
            </p>
            <p className="mt-1 text-xs text-muted">
              Manually removed · {new Date(item.at).toLocaleDateString()}
              {item.private && !unlocked ? " · Unlock private media to review." : ""}
            </p>
          </div>
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={!!busy || (item.private && !unlocked)}
            aria-label={
              item.private && !unlocked
                ? "Restore private removed title"
                : "Restore removed " + item.video.name
            }
            onClick={() => {
              setBusy(item.id);
              setError("");
              setMessage("");
              void restore(item.id)
                .then(() =>
                  setMessage(
                    "Chosen title restored. Other removal records and saved feedback were kept.",
                  ),
                )
                .catch((e) =>
                  setError(
                    e instanceof Error ? e.message : "Restore failed; removal record was kept.",
                  ),
                )
                .finally(() => setBusy(""));
            }}
          >
            {busy === item.id ? "Restoring…" : "Restore title"}
          </Button>
        </div>
      ))}
      {ledger.entries.length > limit && (
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => setLimit((value) => Math.min(1024, value + 12))}
        >
          Show 12 more removed titles
        </Button>
      )}
    </section>
  );
}
