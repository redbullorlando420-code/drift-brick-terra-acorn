import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { bytes } from "./hub-shared";
import { DeskDisclosure } from "./desk-disclosure";
import {
  PHOTO_DUPLICATE_KEY,
  PHOTO_REVIEW_LIMIT,
  hideReviewedPhotos,
  photoDuplicatePreferences,
  scanPhotoDuplicates,
  undoReviewedPhotos,
  type ReviewPhoto,
  type PhotoDuplicateDecisions,
} from "@/lib/photo-duplicates";

export function usePhotoDuplicateDecisions() {
  const [state, setState] = useState(() => photoDuplicatePreferences.read());
  const [error, setError] = useState(() => photoDuplicatePreferences.error());
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key === PHOTO_DUPLICATE_KEY) {
        setState(photoDuplicatePreferences.read());
        setError(photoDuplicatePreferences.error());
      }
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);
  return {
    state,
    error,
    save: (next: PhotoDuplicateDecisions) => {
      setState(photoDuplicatePreferences.write(next));
      setError("");
    },
  };
}
export function PhotoDuplicateReview(props: {
  visible: ReviewPhoto[];
  photos: ReviewPhoto[];
  selected: ReadonlySet<string>;
  decisions: ReturnType<typeof usePhotoDuplicateDecisions>;
}) {
  return (
    <DeskDisclosure
      title="Review photo duplicates"
      description="Compare originals and resized copies before hiding anything."
    >
      <DuplicateEditor {...props} />
    </DeskDisclosure>
  );
}
function DuplicateEditor({
  visible,
  photos,
  selected,
  decisions,
}: {
  visible: ReviewPhoto[];
  photos: ReviewPhoto[];
  selected: ReadonlySet<string>;
  decisions: ReturnType<typeof usePhotoDuplicateDecisions>;
}) {
  const [similar, setSimilar] = useState(false),
    [progress, setProgress] = useState(""),
    [running, setRunning] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof scanPhotoDuplicates>>>(),
    [picks, setPicks] = useState<Set<string>>(new Set());
  const [note, setNote] = useState(""),
    [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      request.current?.abort();
      request.current = null;
    },
    [],
  );
  const scan = async () => {
    const controller = new AbortController();
    request.current = controller;
    const targets = (
      selected.size
        ? photos.filter(
            (row) =>
              selected.has(row.id) && !row.hidden && !decisions.state.hidden.includes(row.id),
          )
        : visible.filter((row) => !row.hidden && !decisions.state.hidden.includes(row.id))
    ).slice(0, PHOTO_REVIEW_LIMIT);
    setRunning(true);
    setProgress("Starting local comparison…");
    setNote("");
    setError("");
    setResult(undefined);
    setPicks(new Set());
    try {
      const next = await scanPhotoDuplicates(targets, similar, controller.signal, (done, total) =>
        setProgress(`Compared ${done} of ${total}`),
      );
      if (request.current === controller) setResult(next);
    } catch {
      if (request.current === controller)
        setNote(
          controller.signal.aborted
            ? "Review cancelled. No photos changed."
            : "Comparison could not finish. No photos changed.",
        );
    } finally {
      if (request.current === controller) {
        request.current = null;
        setRunning(false);
        setProgress("");
      }
    }
  };
  const hide = () => {
    try {
      const ready = new Map(
        result?.groups.flatMap((group) =>
          group.rows.map((row) => [row.photo.id, row.photo.url] as const),
        ),
      );
      const current = new Map(
        photos.filter((row) => ready.has(row.id)).map((row) => [row.id, row]),
      );
      if (
        result?.groups.some((group) =>
          group.rows.every(
            ({ photo }) => picks.has(photo.id) || decisions.state.hidden.includes(photo.id),
          ),
        )
      )
        throw Error("Keep at least one photo visible in each reviewed group.");
      const next = hideReviewedPhotos(decisions.state, [...picks], (id) => {
        const photo = current.get(id);
        return !!photo && !photo.hidden && !photo.favorite && photo.url === ready.get(id);
      });
      decisions.save(next);
      setPicks(new Set());
      setResult(undefined);
      setError("");
      setNote(
        `Hid ${next.undo.length} reviewed photo${next.undo.length === 1 ? "" : "s"} from the normal gallery. Original files were kept.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "The duplicate decision could not be saved.");
    }
  };
  return (
    <section aria-label="Photo duplicate review" className="space-y-4">
      <p className="text-sm leading-6 text-muted">
        Compare up to 48 selected photos, or the first 48 shown. Exact matches have identical file
        bytes. Similar matches are suggestions, including resized variants. Favorites stay visible.
      </p>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={similar}
          disabled={running}
          onChange={(e) => setSimilar(e.target.checked)}
        />
        Also compare visual similarity
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          className="min-h-11"
          disabled={running || (!visible.length && !selected.size)}
          onClick={() => void scan()}
        >
          Scan for duplicates
        </Button>
        {running && (
          <Button variant="secondary" className="min-h-11" onClick={() => request.current?.abort()}>
            Cancel comparison
          </Button>
        )}
        {!!decisions.state.undo.length && (
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => {
              try {
                decisions.save(undoReviewedPhotos(decisions.state));
                setNote("Last duplicate hide undone.");
                setError("");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not undo the duplicate decision.");
              }
            }}
          >
            Undo last duplicate hide
          </Button>
        )}
      </div>
      {(progress || note) && (
        <p role="status" className="text-sm text-accent">
          {progress || note}
        </p>
      )}
      {(error || decisions.error) && (
        <p role="alert" className="text-sm text-danger">
          {error || decisions.error}
        </p>
      )}
      {result && (
        <div className="space-y-3">
          <p role="status" className="text-sm text-muted">
            {result.checked} compared · {result.groups.length} groups · {result.skipped} skipped
            {result.visualSkipped ? ` · visual check unavailable for ${result.visualSkipped}` : ""}
          </p>
          {result.groups.map((group, index) => (
            <section
              key={group.kind + ":" + group.rows[0]!.photo.id}
              aria-label={
                (group.kind === "exact" ? "Exact match group " : "Similar photo group ") +
                (index + 1)
              }
              className="rounded-lg border border-border bg-bg p-3"
            >
              <h3 className="font-medium">
                {group.kind === "exact"
                  ? "Exact match · identical bytes"
                  : "Similar composition · review required"}
              </h3>
              <ul className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.rows.map(({ photo, bytes: size }) => (
                  <li className="min-w-0 rounded-md border border-border p-2" key={photo.id}>
                    <img
                      src={photo.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-video w-full rounded-sm object-contain"
                    />
                    <p className="mt-2 break-words text-sm font-medium">{photo.name}</p>
                    <p className="break-words text-xs text-muted">
                      {photo.source}
                      {photo.album !== photo.source ? ` · ${photo.album}` : ""} · {bytes(size)}
                      {photo.width && photo.height ? ` · ${photo.width} × ${photo.height}` : ""}
                    </p>
                    {photo.favorite ? (
                      <p className="mt-2 text-xs text-accent">Favorite · kept visible</p>
                    ) : (
                      <label className="flex min-h-11 items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={picks.has(photo.id)}
                          onChange={(e) =>
                            setPicks((previous) => {
                              const next = new Set(previous);
                              if (e.target.checked) next.add(photo.id);
                              else next.delete(photo.id);
                              return next;
                            })
                          }
                        />
                        Hide {photo.name}
                      </label>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {!!result.groups.length && (
            <div className="flex flex-wrap gap-2">
              <Button
                className="min-h-11"
                disabled={!picks.size || !!decisions.error}
                onClick={hide}
              >
                Hide reviewed selection
              </Button>
              <Button
                className="min-h-11"
                variant="ghost"
                onClick={() => {
                  setResult(undefined);
                  setPicks(new Set());
                  setNote("Review discarded. No photos changed.");
                }}
              >
                Discard review
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
