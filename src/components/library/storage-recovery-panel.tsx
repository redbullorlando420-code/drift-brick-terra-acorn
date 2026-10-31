import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Database, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { catalogRecoverySnapshot, subscribeCatalogRecovery } from "@/lib/videos/catalog-mutations";
import type { ArtworkCleanupPreview } from "@/lib/videos/storage-recovery";
const size = (value: number | undefined) =>
  value === undefined
    ? "Unavailable"
    : value < 1024
      ? value + " B"
      : value < 1024 ** 2
        ? (value / 1024).toFixed(1) + " KiB"
        : (value / 1024 ** 2).toFixed(1) + " MiB";
export function StorageRecoveryPanel() {
  const status = useSyncExternalStore(
      subscribeCatalogRecovery,
      catalogRecoverySnapshot,
      catalogRecoverySnapshot,
    ),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(""),
    [preview, setPreview] = useState<ArtworkCleanupPreview | null>(null),
    [note, setNote] = useState(""),
    [error, setError] = useState("");
  const owned = useRef<string | undefined>(undefined),
    abort = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      abort.current?.abort();
      const id = owned.current;
      if (id) void import("@/lib/videos/persist").then((module) => module.cancelStorageCleanup(id));
    },
    [],
  );
  const cancel = async () => {
    const { cancelStorageCleanup } = await import("@/lib/videos/persist");
    cancelStorageCleanup(owned.current);
    owned.current = undefined;
    setPreview(null);
    setNote("Preview cancelled. No cache or personal records were removed.");
  };
  const inspect = async () => {
    setBusy("preview");
    setError("");
    setNote("");
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    try {
      const { previewStorageCleanup, cancelStorageCleanup } = await import("@/lib/videos/persist");
      const result = await previewStorageCleanup(controller.signal);
      if (controller.signal.aborted) {
        cancelStorageCleanup(result.id);
        return;
      }
      owned.current = result.id;
      setPreview(result);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(cause instanceof Error ? cause.message : "Storage measurements are unavailable.");
    } finally {
      if (!controller.signal.aborted) setBusy("");
    }
  };
  const clear = async () => {
    if (!preview) return;
    setBusy("clear");
    setError("");
    try {
      const { confirmStorageCleanup } = await import("@/lib/videos/persist");
      const result = await confirmStorageCleanup(preview.id);
      setNote(
        result.removed +
          " artwork cache entries removed · approximately " +
          size(result.estimatedBytes) +
          " of stored artwork payload. " +
          result.skipped +
          " changed or missing entries skipped. This is not a measurement of freed disk space.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Artwork cleanup failed. Saved personal data was kept.",
      );
    } finally {
      owned.current = undefined;
      setPreview(null);
      setBusy("");
    }
  };
  const retry = async () => {
    setBusy("retry");
    setError("");
    setNote("");
    try {
      const { retryLibraryPersistence } = await import("@/lib/videos/store");
      await retryLibraryPersistence();
      setNote(
        "Pending catalog operations and library preferences were saved. No provider request or download was started.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Save retry failed. Pending records remain available for review.",
      );
    } finally {
      setBusy("");
    }
  };
  return (
    <section
      aria-label="Storage and save recovery"
      className="my-6 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-fg">
            <Database className="size-5" />
            Storage and save recovery
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Recover interrupted catalog saves and review disposable artwork before clearing
            anything.
          </p>
        </div>
        <Button
          variant="secondary"
          className="min-h-11"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide storage recovery" : "Review storage recovery"}
        </Button>
      </div>
      <p role="status" className="mt-3 text-xs leading-5 text-muted">
        {status.phase === "error"
          ? status.error
          : status.phase === "working"
            ? "Saving or recovering bounded catalog operations…"
            : "Catalog recovery ready."}{" "}
        {status.recovered > 0 ? status.recovered + " operations applied this visit." : ""}
      </p>
      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-xs leading-5 text-muted">
            Ratings, history, tags, locks, categories, follows, drafts, approved folders, catalog
            rows and pending recovery records are protected. Only the selected browser artwork cache
            entries can be cleared. Offline artwork can disappear until its source is available
            again; native caches and original media are untouched.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={!!busy}
              onClick={() => void inspect()}
            >
              {busy === "preview" ? "Measuring…" : "Preview artwork cleanup"}
            </Button>
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={!!busy}
              onClick={() => void retry()}
            >
              <RefreshCw className="size-4" />
              {busy === "retry" ? "Retrying saves…" : "Retry pending saves"}
            </Button>
          </div>
          <p className="text-xs leading-5 text-muted">
            Preview is read-only and limited to 256 cache entries. Cancellation removes nothing.
            Retry waits for initial recovery, then replays pending operations and saves library
            preferences and currently visible remote cards in batches. A local import stopped before
            acceptance may need to be repeated.
          </p>
          {preview && (
            <div
              className="rounded-lg border border-border bg-bg p-4"
              aria-label="Artwork cleanup preview"
            >
              <h3 className="text-sm font-medium text-fg">
                {preview.count} artwork cache entries selected
              </h3>
              <p className="mt-2 text-xs leading-5 text-muted">
                Estimated selected payload: {size(preview.estimatedBytes)}. Browser origin usage:{" "}
                {size(preview.inventory.usage)} · quota estimate: {size(preview.inventory.quota)}.
                Estimates do not measure exact disk allocation.
              </p>
              <ul className="mt-3 space-y-2 text-xs text-muted">
                {preview.inventory.stores.map((row) => (
                  <li key={row.name}>
                    {row.name}: {row.count.toLocaleString()} records ·{" "}
                    {row.disposable
                      ? "selected artwork may be cleared"
                      : "protected; byte size unavailable"}
                  </li>
                ))}
                <li>
                  Browser preferences and drafts:{" "}
                  {preview.inventory.localKeys === undefined
                    ? "count unavailable"
                    : preview.inventory.localKeys + " keys"}{" "}
                  · protected; byte size unavailable
                </li>
              </ul>
              <p className="mt-3 text-xs leading-5 text-muted">
                Preview expires after five minutes. Changed artwork is skipped. Normal browsing can
                refill this disposable cache.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  className="min-h-11"
                  disabled={!!busy || !preview.count}
                  onClick={() => void clear()}
                >
                  <Trash2 className="size-4" />
                  {busy === "clear" ? "Clearing artwork…" : "Clear previewed artwork"}
                </Button>
                <Button
                  variant="secondary"
                  className="min-h-11"
                  disabled={!!busy}
                  onClick={() => void cancel()}
                >
                  Cancel cleanup preview
                </Button>
              </div>
            </div>
          )}
          <a
            href="/catalog-recovery-notes.txt"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-sm text-accent underline"
          >
            Read recovery boundaries
          </a>
        </div>
      )}
      {note && (
        <p role="status" className="mt-3 text-xs leading-5 text-muted">
          {note}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs leading-5 text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
