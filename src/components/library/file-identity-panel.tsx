import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAdultVideo, useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";
import {
  fileIdentitySnapshot,
  subscribeFileIdentities,
  hydrateFileIdentities,
  recordFileIdentity,
} from "@/lib/videos/persist";
import { resolveLocalFile } from "@/lib/videos/sources";
import {
  fingerprintFile,
  sameFileFingerprint,
  type FileFingerprint,
} from "@/lib/videos/file-fingerprint";
import { yieldCatalogTask } from "@/lib/catalog-work";

export function FileIdentityReview({
  video,
  onComplete,
}: {
  video: LibraryVideo;
  onComplete?: () => void;
}) {
  const ledger = useSyncExternalStore(
      subscribeFileIdentities,
      fileIdentitySnapshot,
      fileIdentitySnapshot,
    ),
    record = ledger.fingerprints[video.id];
  const folders = useLibrary((s) => s.folders),
    unlocked = useLibrary((s) => s.adultsUnlocked),
    apply = useLibrary((s) => s.applyLocalIdentityMove);
  const privateSource = record?.private || isAdultVideo(video, folders),
    [query, setQuery] = useState(""),
    [candidates, setCandidates] = useState<LibraryVideo[]>([]),
    [target, setTarget] = useState<LibraryVideo>(),
    [proof, setProof] = useState<FileFingerprint>(),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const work = useRef<AbortController | undefined>(undefined),
    alive = useRef(true),
    verifiedFile = useRef<File | undefined>(undefined);
  const [committing, setCommitting] = useState(false);
  useEffect(() => {
    alive.current = true;
    void hydrateFileIdentities().catch((e) =>
      setError(e instanceof Error ? e.message : "Identity records could not load."),
    );
    return () => {
      alive.current = false;
      work.current?.abort();
    };
  }, []);
  const run = async (task: (signal: AbortSignal) => Promise<void>) => {
    work.current?.abort();
    const controller = new AbortController();
    work.current = controller;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await task(controller.signal);
    } catch (e) {
      if (alive.current) setError(e instanceof Error ? e.message : "Identity review failed.");
    } finally {
      if (alive.current && work.current === controller) {
        setBusy(false);
        setCommitting(false);
      }
    }
  };
  const progress = (done: number, total: number) => {
    if (alive.current)
      setMessage(
        "Reading selected file locally · " + Math.round((done / Math.max(1, total)) * 100) + "%",
      );
  };
  if (privateSource && !unlocked)
    return <p className="mt-4 text-sm text-muted">Unlock private media to review this identity.</p>;
  return (
    <section
      aria-label={"File identity review for " + video.name}
      className="mt-4 space-y-3 rounded-lg border border-border bg-bg p-4"
    >
      <h3 className="font-medium">Verified file identity</h3>
      <p className="text-xs leading-5 text-muted">
        Record a complete SHA-256 fingerprint while the original file is readable. After moving it,
        add its destination to your library and verify both contents. Matching names or sizes never
        link files automatically. This changes metadata; it does not move or copy media files.
      </p>
      <p className="break-words text-xs text-muted">
        Original · {video.name}
        {record
          ? " · Recorded " + record.proof.digest.slice(0, 16) + "…"
          : " · No fingerprint recorded"}
      </p>
      <Button
        variant="secondary"
        className="min-h-11 max-w-full whitespace-normal"
        disabled={busy}
        onClick={() =>
          void run(async (signal) => {
            if (useLibrary.getState().scanning)
              throw Error("Wait for the source scan to finish before recording its identity.");
            const file = await resolveLocalFile(video);
            const fingerprint = await fingerprintFile(file, signal, progress);
            signal.throwIfAborted();
            setCommitting(true);
            await recordFileIdentity(video, fingerprint, !!privateSource);
            setProof(undefined);
            setAck(false);
            setMessage("Original fingerprint recorded. No files or saved marks changed.");
          })
        }
      >
        Record original fingerprint
      </Button>
      {record && (
        <>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <Input
              disabled={busy}
              aria-label="Find a moved file in the library"
              placeholder="Search destination filename or path"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCandidates([]);
                setTarget(undefined);
                setProof(undefined);
                setAck(false);
              }}
            />
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={busy || !query.trim()}
              onClick={() =>
                void run(async (signal) => {
                  const state = useLibrary.getState(),
                    rows: LibraryVideo[] = [];
                  const words = query.trim().toLowerCase();
                  for (let i = 0; i < state.videos.length && rows.length < 20; i++) {
                    signal.throwIfAborted();
                    const candidate = state.videos[i]!;
                    if (
                      !candidate.remote &&
                      !candidate.isSample &&
                      !candidate.localIdentity &&
                      candidate.id !== video.id &&
                      isAdultVideo(candidate, state.folders) === !!privateSource &&
                      (candidate.name + " " + candidate.path).toLowerCase().includes(words)
                    )
                      rows.push(candidate);
                    if (i % 128 === 0) await yieldCatalogTask();
                  }
                  setCandidates(rows);
                  setMessage(
                    rows.length
                      ? "Choose one destination to inspect. Nothing has been linked."
                      : "No eligible destination found. Add its source folder first, then search again.",
                  );
                })
              }
            >
              Find destinations
            </Button>
          </div>
          {candidates.map((candidate) => (
            <Button
              key={candidate.id}
              variant={target?.id === candidate.id ? "default" : "secondary"}
              className="min-h-11 w-full justify-start whitespace-normal break-words text-left"
              disabled={busy}
              aria-label={"Choose destination " + candidate.name}
              onClick={() => {
                setTarget(candidate);
                setProof(undefined);
                setAck(false);
                setMessage("Destination selected. Verify its full contents before applying.");
              }}
            >
              {candidate.name} · {candidate.size.toLocaleString()} bytes
            </Button>
          ))}
          {target && (
            <div className="space-y-3 rounded-md border border-border p-3">
              <p className="break-words text-xs text-muted">Destination · {target.path}</p>
              <Button
                variant="secondary"
                className="min-h-11"
                disabled={busy}
                onClick={() =>
                  void run(async (signal) => {
                    const file = await resolveLocalFile(target);
                    if (file.size !== target.size)
                      throw Error(
                        "The destination size changed. Rescan its source before verifying.",
                      );
                    const fingerprint = await fingerprintFile(file, signal, progress);
                    signal.throwIfAborted();
                    if (!sameFileFingerprint(record.proof, fingerprint))
                      throw Error(
                        "These files have different complete fingerprints. Nothing was linked; saved marks remain on the original identity.",
                      );
                    verifiedFile.current = file;
                    setProof(fingerprint);
                    setAck(false);
                    setMessage("Complete fingerprints match. Review the mapping before applying.");
                  })
                }
              >
                Verify destination contents
              </Button>
              {proof && (
                <>
                  <label className="flex min-h-11 items-start gap-3 text-xs leading-5">
                    <input
                      type="checkbox"
                      className="mt-1"
                      aria-label="I reviewed this verified file move"
                      checked={ack}
                      onChange={(e) => setAck(e.target.checked)}
                    />
                    Keep the original media ID and its saved marks at this verified location. An
                    already rated, watched, saved or manually tagged destination will be rejected
                    for separate conflict review. Close playback or room sessions for these files
                    first.
                  </label>
                  <Button
                    className="min-h-11 max-w-full whitespace-normal"
                    disabled={busy || !ack}
                    onClick={() =>
                      void run(async (signal) => {
                        signal.throwIfAborted();
                        const file = verifiedFile.current;
                        if (!file) throw Error("Verify the selected file again.");
                        const currentProof = await fingerprintFile(file, signal, progress);
                        signal.throwIfAborted();
                        setCommitting(true);
                        await apply(video.id, target, currentProof, ledger.revision, file);
                        if (alive.current) {
                          setMessage(
                            "Verified location applied. Original ratings, history, resume and reviews retain their ID.",
                          );
                          onComplete?.();
                        }
                      })
                    }
                  >
                    Apply verified file move
                  </Button>
                </>
              )}
            </div>
          )}
        </>
      )}
      {busy && !committing && (
        <Button variant="secondary" className="min-h-11" onClick={() => work.current?.abort()}>
          Cancel file inspection
        </Button>
      )}
      {message && (
        <p role="status" className="text-xs leading-5 text-accent">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs leading-5 text-danger">
          {error}
        </p>
      )}
    </section>
  );
}

export function FileIdentityPanel() {
  const ledger = useSyncExternalStore(
      subscribeFileIdentities,
      fileIdentitySnapshot,
      fileIdentitySnapshot,
    ),
    unlocked = useLibrary((s) => s.adultsUnlocked),
    undo = useLibrary((s) => s.undoLocalIdentityMove);
  const [selected, setSelected] = useState<LibraryVideo>(),
    [limit, setLimit] = useState(12),
    [moveLimit, setMoveLimit] = useState(12),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    void hydrateFileIdentities().catch((e) =>
      setError(e instanceof Error ? e.message : "Identity records could not load."),
    );
  }, []);
  const records = Object.values(ledger.fingerprints);
  return (
    <section
      aria-label="File identity history"
      className="mt-5 space-y-3 rounded-lg border border-border bg-elevated p-5"
    >
      <h2 className="font-display text-2xl">File identities & moves</h2>
      <p className="text-sm leading-6 text-muted">
        Open a local title’s preview to record its identity before moving it. Reopen its recorded
        identity here even when the old location is unavailable. Each approved move keeps the
        original ID; Undo changes the location back and retains subsequent saved marks.
      </p>
      <p className="text-xs text-muted">
        {records.length} recorded identities · {ledger.moves.filter((row) => row.active).length}{" "}
        active moves · {ledger.moves.length}/128 move history records. Content inspection runs only
        on request or when rescanning an approved alias location; unrelated files are not hashed. A
        first playback after reload may need to reverify a moved file.
      </p>
      {records.slice(0, limit).map((record) => (
        <div
          key={record.video.id}
          className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md bg-bg p-3"
        >
          <p className="min-w-0 flex-1 break-words text-sm">
            {record.private && !unlocked ? "Private recorded identity" : record.video.name}
          </p>
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={record.private && !unlocked}
            aria-label={
              record.private && !unlocked
                ? "Review private recorded identity"
                : "Review recorded identity " + record.video.name
            }
            onClick={() => setSelected(record.video)}
          >
            Review identity
          </Button>
        </div>
      ))}
      {records.length > limit && (
        <Button variant="secondary" className="min-h-11" onClick={() => setLimit((n) => n + 12)}>
          Show 12 more recorded identities
        </Button>
      )}
      {selected && (
        <>
          <FileIdentityReview
            key={selected.id}
            video={selected}
            onComplete={() => setSelected(undefined)}
          />
          <Button variant="ghost" className="min-h-11" onClick={() => setSelected(undefined)}>
            Close identity review
          </Button>
        </>
      )}
      {ledger.moves.slice(0, moveLimit).map((move) => (
        <div
          key={move.id}
          className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
        >
          <div className="min-w-0 flex-1">
            <p className="break-words text-sm">
              {move.private && !unlocked ? "Private file move" : move.after.name}
            </p>
            <p className="mt-1 text-xs text-muted">
              {move.active
                ? "Active verified location"
                : move.undoneAt
                  ? "Undone"
                  : "Superseded by a later move"}{" "}
              · {new Date(move.at).toLocaleDateString()}
            </p>
          </div>
          {move.active && (
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={!!busy || (move.private && !unlocked)}
              aria-label={
                move.private && !unlocked
                  ? "Undo private file move"
                  : "Undo file move for " + move.after.name
              }
              onClick={() => {
                setBusy(move.id);
                setError("");
                void undo(move.id, ledger.revision)
                  .then(() =>
                    setMessage(
                      "Previous location restored. Saved marks were kept; reconnect its source if the file is unavailable.",
                    ),
                  )
                  .catch((e) =>
                    setError(
                      e instanceof Error ? e.message : "Undo failed. Previous mapping was kept.",
                    ),
                  )
                  .finally(() => setBusy(""));
              }}
            >
              Undo file move
            </Button>
          )}
        </div>
      ))}
      {ledger.moves.length > moveLimit && (
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => setMoveLimit((n) => n + 12)}
        >
          Show 12 more file moves
        </Button>
      )}
      {message && (
        <p role="status" className="text-sm text-accent">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
