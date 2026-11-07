import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  browseTaskSnapshot,
  subscribeBrowseTasks,
  browseBack,
  browseForward,
  captureBrowseTask,
  openBrowseTask,
} from "@/lib/browse-task-session";
import {
  createBrowseBookmarkStore,
  type BrowseBookmarks,
  type BrowseTask,
} from "@/lib/browse-tasks";
import { navigationSourceLabel } from "@/lib/library-navigation";
import { useLibrary } from "@/lib/videos/store";

export function BrowseTaskControls() {
  const state = useSyncExternalStore(subscribeBrowseTasks, browseTaskSnapshot, browseTaskSnapshot);
  const [place, setPlace] = useState<BrowseTask>();
  return (
    <div
      className="flex items-center gap-1"
      aria-label="Browse navigation"
      data-browse-restoring={Boolean(state.restore)}
    >
      <Button
        variant="ghost"
        className="size-11 p-0"
        aria-label="Back to previous browse task"
        title="Back · Alt+Left"
        disabled={!state.ready || !state.back}
        onClick={browseBack}
      >
        <ArrowLeft className="size-4" />
      </Button>
      <Button
        variant="ghost"
        className="size-11 p-0"
        aria-label="Forward to next browse task"
        title="Forward · Alt+Right"
        disabled={!state.ready || !state.forward}
        onClick={browseForward}
      >
        <ArrowRight className="size-4" />
      </Button>
      <Button
        variant="secondary"
        className="size-11 p-0"
        aria-label="Saved places"
        disabled={!state.ready}
        onClick={() => setPlace(captureBrowseTask())}
      >
        <MapPin className="size-4" />
      </Button>
      {place && <SavedPlaces place={place} onClose={() => setPlace(undefined)} />}
    </div>
  );
}
function SavedPlaces({ place, onClose }: { place: BrowseTask; onClose(): void }) {
  const opening = useRef(false);
  const owner = useMemo(() => createBrowseBookmarkStore(), []);
  const [initial] = useState(() => {
    try {
      return { data: owner.load(), error: "" };
    } catch (e) {
      return {
        data: { version: 1 as const, entries: [] },
        error: e instanceof Error ? e.message : String(e),
      };
    }
  });
  const [data, setData] = useState<BrowseBookmarks>(initial.data);
  const [error, setError] = useState(initial.error);
  const [note, setNote] = useState("");
  const unlocked = useLibrary((s) => s.adultsUnlocked),
    folders = useLibrary((s) => s.folders);
  const privateScope = place.private && unlocked;
  const attempt = (work: () => void) => {
    try {
      work();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saved places unavailable.");
    }
  };
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full max-w-xl overflow-y-auto p-5 [&>button:last-child]:size-11"
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          if (opening.current) event.preventDefault();
        }}
      >
        <SheetTitle className="pr-12">Saved places</SheetTitle>
        <p className="text-sm leading-6 text-muted">
          Save your search, desk controls and visible title’s position in this profile. Back and
          forward keep up to 32 tasks for this app session. Saved places survive reloads.
        </p>
        <Button
          className="mt-4 min-h-11"
          disabled={Boolean(error) || data.entries.length >= 24 || (place.private && !unlocked)}
          onClick={() =>
            attempt(() => {
              setData(
                owner.save({
                  version: 1,
                  entries: [...data.entries, { id: crypto.randomUUID(), task: place }],
                }),
              );
              setNote("Place saved. No media was copied.");
            })
          }
        >
          <MapPin className="size-4" />
          Save this place
        </Button>
        <p className="mt-3 text-xs leading-5 text-muted">
          Up to 24 places. Titles are resolved from current visible media when opened; old title
          text is never stored here. Missing titles leave the search available. Opening a place
          never starts playback.
        </p>
        <section aria-label="Saved browse places" className="mt-5 space-y-3">
          {data.entries
            .filter((row) => row.task.private === privateScope)
            .map((row, index) => (
              <div
                key={row.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-fg">
                    Place {index + 1} ·{" "}
                    {row.task.private
                      ? "Private library"
                      : folders.some((folder) => folder.id === row.task.source && folder.adult)
                        ? "Library"
                        : navigationSourceLabel(row.task.source, folders)}
                  </p>
                  <p className="text-xs text-muted">
                    {row.task.anchor ? "Title position and browse task" : "Browse task"} ·{" "}
                    {row.task.view}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="min-h-11"
                  aria-label={`Open saved place ${index + 1}`}
                  onClick={() =>
                    attempt(() => {
                      openBrowseTask(row.task);
                      opening.current = true;
                      onClose();
                    })
                  }
                >
                  Open
                </Button>
                <Button
                  variant="ghost"
                  className="size-11 shrink-0 p-0"
                  aria-label={`Remove saved place ${index + 1}`}
                  disabled={Boolean(error)}
                  onClick={() =>
                    attempt(() => {
                      setData(
                        owner.save({
                          version: 1,
                          entries: data.entries.filter((item) => item.id !== row.id),
                        }),
                      );
                      setNote("Place removed. Your saved media is unchanged.");
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          {!data.entries.some((row) => row.task.private === privateScope) && (
            <p className="text-sm text-muted">No saved places available in this scope.</p>
          )}
        </section>
        <p role="status" className="mt-4 text-sm text-muted">
          {note}
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}
        <Button
          variant="secondary"
          className="mt-4 min-h-11"
          onClick={() =>
            attempt(() => {
              setData(owner.load());
              setNote("Saved places reloaded.");
            })
          }
        >
          Reload saved places
        </Button>
      </SheetContent>
    </Sheet>
  );
}
export function BrowseTaskNotice() {
  const state = useSyncExternalStore(subscribeBrowseTasks, browseTaskSnapshot, browseTaskSnapshot);
  return state.message ? (
    <p
      role="status"
      className="mb-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted"
    >
      {state.message}
    </p>
  ) : null;
}
