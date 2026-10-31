import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { catalogWriter } from "@/lib/videos/persist";
import { rebaseSharedCatalog } from "@/lib/videos/store";
import { Button } from "@/components/ui/button";

/** Event-driven; idle tabs do not poll. Only generation/revision notices cross
 * the channel, and existing paged readers fetch the current records. */
export function CatalogWriterStatus() {
  const state = useSyncExternalStore(
    catalogWriter.subscribe,
    catalogWriter.getSnapshot,
    catalogWriter.getSnapshot,
  );
  const [note, setNote] = useState(""),
    [refreshing, setRefreshing] = useState(false),
    needed = useRef(false),
    busy = useRef(false),
    seen = useRef(0),
    seenRevision = useRef(0);
  const refresh = async () => {
    if (busy.current || catalogWriter.current()) return;
    busy.current = true;
    setRefreshing(true);
    try {
      const result = await rebaseSharedCatalog();
      needed.current = false;
      setNote(
        result?.deferredLocal
          ? "Catalog changes loaded. Reload to include newly imported local files with their saved privacy settings."
          : "Catalog changes from another tab loaded.",
      );
    } catch (e) {
      setNote(
        e instanceof Error ? e.message : "Another tab changed this catalog; refresh when ready.",
      );
    } finally {
      busy.current = false;
      setRefreshing(false);
    }
  };
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    let alive = true,
      timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      needed.current = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (alive && needed.current) void refreshRef.current();
      }, 250);
    };
    const stop = catalogWriter.onCommit((notice) => {
      seen.current = Math.max(seen.current, notice.generation);
      seenRevision.current = Math.max(seenRevision.current, notice.revision);
      schedule();
    });
    const idle = catalogWriter.subscribe(() => {
      if (needed.current && !catalogWriter.current()) schedule();
    });
    const inspect = () => {
      if (document.visibilityState === "hidden") return;
      void catalogWriter
        .inspect()
        .then((row) => {
          if (!alive || !row) return;
          if (
            row.owner !== catalogWriter.owner &&
            (row.revision > seenRevision.current || (row.dirty && row.generation > seen.current)) &&
            (row.expiresAt === 0 || row.expiresAt <= Date.now())
          )
            schedule();
          if (
            row.owner === catalogWriter.owner ||
            row.expiresAt === 0 ||
            row.expiresAt <= Date.now()
          ) {
            seen.current = Math.max(seen.current, row.generation);
            seenRevision.current = Math.max(seenRevision.current, row.revision);
          }
        })
        .catch((e) => {
          if (alive)
            setNote(e instanceof Error ? e.message : "Could not review cross-tab updates.");
        });
    };
    window.addEventListener("focus", inspect);
    document.addEventListener("visibilitychange", inspect);
    inspect();
    return () => {
      alive = false;
      clearTimeout(timer);
      stop();
      idle();
      window.removeEventListener("focus", inspect);
      document.removeEventListener("visibilitychange", inspect);
    };
  }, []);
  if (!note && (state.phase === "idle" || state.phase === "owned") && !refreshing) return null;
  return (
    <aside
      className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center rounded-lg border border-border bg-elevated p-3 text-sm"
      aria-label="Catalog writer status"
    >
      <p role="status" className="min-w-0 flex-1 break-words">
        {refreshing
          ? "Loading committed catalog changes…"
          : state.phase === "busy" || state.phase === "error"
            ? state.message
            : state.phase === "owned"
              ? "This tab is updating the catalog. Other tabs must wait for its write lease."
              : note}
      </p>
      <Button
        variant="ghost"
        disabled={refreshing || state.phase === "owned"}
        onClick={() => void refresh()}
      >
        Refresh shared catalog
      </Button>
      {note && state.phase === "idle" && (
        <Button variant="ghost" onClick={() => setNote("")}>
          Dismiss catalog update
        </Button>
      )}
    </aside>
  );
}
