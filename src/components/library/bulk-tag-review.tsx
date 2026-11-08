import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { currentProfileId } from "@/lib/local-profile-storage";
import { patchSparseRecord } from "@/lib/sparse-record";
import {
  BULK_TAG_BATCH,
  BULK_TAG_LIMIT,
  changeBulkTags,
  normalizeBulkTag,
  sameTags,
  tagSnapshot,
  validBulkTag,
  validBulkTarget,
  type BulkMode,
  type BulkTagReceipt,
  type BulkTagScope,
  type BulkTagTarget,
} from "@/lib/videos/bulk-tags";
import { commitBulkTags, readBulkTagUndo } from "@/lib/videos/persist";
import { publicVideoBoundary } from "@/lib/videos/public-visibility";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo, VideoMetadataProvenance } from "@/lib/videos/types";
import { lookupVideos } from "@/lib/videos/video-lookup";
import { DeskDisclosure } from "./desk-disclosure";
import { useProfileCheckpoint } from "./use-profile-checkpoint";

const PAGE = 8;
const identity = (video: LibraryVideo) =>
  (video.remote?.kind ?? "local") + ":" + video.folderId + ":" + video.id;
function lookup(ids: string[]) {
  const state = useLibrary.getState(),
    allows = publicVideoBoundary(state.folders);
  const found = new Map<
    string,
    { identity: string; tags: string[]; provenance?: VideoMetadataProvenance; category?: string }
  >();
  lookupVideos(state.videos, ids).forEach((video) => {
    if (
      video &&
      !video.isSample &&
      allows(video) &&
      !state.hiddenVideos[video.id] &&
      !state.unavailable[video.id]
    ) {
      found.set(video.id, {
        identity: identity(video),
        tags: state.tags[video.id] ?? [],
        provenance: state.metadataProvenance[video.id],
        category: state.categories[video.id],
      });
    }
  });
  return found;
}
function publish(edits: Awaited<ReturnType<typeof commitBulkTags>>["edits"]) {
  if (!edits.length) return;
  useLibrary.setState((state) => {
    const accepted = edits.filter((edit) => {
      const current = state.metadataProvenance[edit.id];
      return (
        !current?.lockedFields?.includes("tags") &&
        (current?.manualTagsAt ?? 0) < edit.at &&
        ((current?.updatedAt ?? 0) < edit.at ||
          current?.updatedAt === current?.manualCategoryAt ||
          sameTags(state.tags[edit.id] ?? [], edit.tags))
      );
    });
    if (!accepted.length) return state;
    return {
      tags: patchSparseRecord(
        state.tags,
        accepted.map((edit) => [edit.id, edit.tags]),
      ),
      metadataProvenance: patchSparseRecord(
        state.metadataProvenance,
        accepted.map((edit) => {
          const current = state.metadataProvenance[edit.id];
          const next = {
            ...edit.provenance,
            updatedAt: Math.max(edit.at, current?.updatedAt ?? 0),
          };
          if ((current?.manualCategoryAt ?? 0) > (next.manualCategoryAt ?? 0)) {
            next.manualCategoryAt = current?.manualCategoryAt;
            next.category = current?.category;
            if (current?.lockedFields?.includes("category"))
              next.lockedFields = [...new Set([...(next.lockedFields ?? []), "category" as const])];
          }
          return [edit.id, next];
        }),
      ),
    };
  });
}
type ReviewProps = {
  results: readonly LibraryVideo[];
  revision: number;
  query: string;
  ready: boolean;
};
export function BulkTagReview(props: ReviewProps) {
  return (
    <DeskDisclosure
      title="Bulk edit video tags"
      description="Review selected search results, apply in small batches, and undo saved changes."
    >
      <BulkEditor {...props} />
    </DeskDisclosure>
  );
}
type Preview = { scope: BulkTagScope; query: string; targets: BulkTagTarget[]; skipped: number };
function BulkEditor({ results, revision, query, ready }: ReviewProps) {
  const [mode, setMode] = useState<BulkMode>("add"),
    [input, setInput] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set()),
    [page, setPage] = useState(0);
  const [preview, setPreview] = useState<Preview>(),
    [receipt, setReceipt] = useState<BulkTagReceipt>();
  const [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [confirmKeep, setConfirmKeep] = useState(false);
  const [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const working = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let disposed = false;
    void readBulkTagUndo()
      .then((value) => {
        if (!disposed) {
          setReceipt(value);
          setLoaded(true);
        }
      })
      .catch((error) => {
        if (!disposed)
          setError(error instanceof Error ? error.message : "Could not load saved undo.");
      });
    return () => {
      disposed = true;
      mounted.current = false;
      working.current?.abort();
    };
  }, []);
  useProfileCheckpoint(() =>
    working.current
      ? {
          label: "Bulk tag editing",
          state: "wait",
          detail:
            "Wait for the saved batch to finish, or cancel the remaining batches before switching.",
        }
      : undefined,
  );
  useEffect(() => {
    setSelected(new Set());
    setPage(0);
    setPreview(undefined);
  }, [query, revision]);
  const options = results.slice(0, BULK_TAG_LIMIT).filter((row) => !row.isSample);
  const tag = normalizeBulkTag(input);
  const prepare = () => {
    if (!ready || !validBulkTag(tag) || receipt || working.current) return;
    const candidates = options.filter((row) => selected.has(row.id)),
      current = lookup(candidates.map((row) => row.id));
    const targets = candidates.flatMap((video) => {
      const row = current.get(video.id);
      if (
        !row ||
        row.provenance?.lockedFields?.includes("tags") ||
        !changeBulkTags(row.tags, mode, tag)
      )
        return [];
      const target = {
        id: video.id,
        title: video.name.slice(0, 300),
        identity: row.identity,
        before: tagSnapshot(row.tags, row.provenance),
      };
      return validBulkTarget(target) ? [target] : [];
    });
    setError("");
    setMessage("");
    if (!targets.length) {
      setError(
        "No selected title needs this change. Locked or unavailable titles were left unchanged.",
      );
      return;
    }
    setPreview({
      scope: {
        id: crypto.randomUUID(),
        profileId: currentProfileId(),
        collectionRevision: revision,
        mode,
        tag,
        total: targets.length,
      },
      query,
      targets,
      skipped: candidates.length - targets.length,
    });
  };
  const perform = async (kind: "apply" | "undo" | "forget") => {
    if (working.current || !loaded) return;
    const plan = preview,
      prior = receipt;
    if (
      kind === "apply"
        ? !plan ||
          !ready ||
          plan.query !== query ||
          plan.scope.collectionRevision !== revision ||
          !!prior
        : !prior
    )
      return;
    const controller = new AbortController();
    working.current = controller;
    setBusy(true);
    setError("");
    setConfirmKeep(false);
    const scope = kind === "apply" ? plan!.scope : prior!;
    const total = kind === "apply" ? plan!.targets.length : prior!.entries.length;
    let current = prior,
      reviewed = 0,
      changed = 0,
      skipped = 0;
    const summary = () =>
      `${changed} of ${total} ${total === 1 ? "title" : "titles"} ${kind === "undo" ? "restored" : "updated"}${skipped ? ` · ${skipped} skipped because they changed or became unavailable` : ""}.`;
    setMessage(kind === "forget" ? "Clearing the undo record…" : summary());
    try {
      // A receipt is small and can open before saved local and remote titles.
      // Missing rows are only meaningful after the existing restore settles.
      if (kind === "undo") await useLibrary.getState().restoreFolders();
      do {
        controller.signal.throwIfAborted();
        const request =
          kind === "apply"
            ? ({
                kind,
                scope,
                revision: current?.revision ?? 0,
                targets: plan!.targets.slice(reviewed, reviewed + BULK_TAG_BATCH),
              } as const)
            : ({ kind, scope, revision: current?.revision ?? 0 } as const);
        const result = await commitBulkTags(request, lookup, controller.signal);
        current = result.receipt;
        publish(result.edits);
        reviewed += result.edits.length + result.skipped;
        changed += result.edits.length;
        skipped += result.skipped;
        if (mounted.current) {
          setReceipt(current);
          setMessage(kind === "forget" ? "Changes kept. The undo record was cleared." : summary());
        }
        if (kind === "forget" || reviewed >= total) break;
        // Give rendering and the Cancel button a turn between atomic writes.
        await new Promise<void>((resolve) => setTimeout(resolve, 120));
      } while (!controller.signal.aborted);
      if (controller.signal.aborted && mounted.current)
        setMessage("Stopped after the last saved batch. " + summary());
    } catch (e) {
      if (mounted.current) {
        if (controller.signal.aborted)
          setMessage("Stopped after the last saved batch. " + summary());
        else {
          setError(
            "A batch could not be saved. Earlier saved batches can still be undone. " +
              (e instanceof Error ? e.message : ""),
          );
          void readBulkTagUndo()
            .then((value) => {
              if (mounted.current && working.current === null) setReceipt(value);
            })
            .catch(() => {});
        }
      }
    } finally {
      working.current = null;
      if (mounted.current) {
        setBusy(false);
        setPreview(undefined);
        setSelected(new Set());
      }
    }
  };
  return (
    <section aria-label="Bulk tag editing" className="space-y-4">
      <p className="text-sm leading-6 text-muted">
        Choose from the first 48 saved results. Each batch changes one tag on up to six titles.
        Individually locked tags are left alone.
      </p>
      {error && (
        <p role="alert" className="break-words text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-accent">
          {message}
        </p>
      )}
      {busy && (
        <Button variant="secondary" className="min-h-11" onClick={() => working.current?.abort()}>
          Cancel remaining batches
        </Button>
      )}
      {receipt && !busy && (
        <div className="space-y-2 rounded-lg border border-border bg-bg p-3">
          <p className="break-words text-sm">
            <strong>{receipt.entries.length} saved {receipt.entries.length === 1 ? "change" : "changes"} can be undone</strong> ·{" "}
            {receipt.mode === "add" ? "Added" : "Removed"} <strong>{receipt.tag}</strong>
          </p>
          <p className="text-xs leading-5 text-muted">
          Undo changes only this tag and skips titles with newer manual tag edits.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-11" onClick={() => void perform("undo")}>
              Undo saved batches
            </Button>
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => setConfirmKeep(!confirmKeep)}
            >
              Keep changes
            </Button>
            {confirmKeep && (
              <Button
                variant="secondary"
                className="min-h-11"
                onClick={() => void perform("forget")}
              >
                Confirm clear undo record
              </Button>
            )}
          </div>
        </div>
      )}
      {!busy &&
        !receipt &&
        loaded &&
        (preview ? (
          <div className="space-y-3 rounded-lg border border-border bg-bg p-3">
            <h3 className="break-words text-sm font-medium">
              {mode === "add" ? "Add" : "Remove"} “{preview.scope.tag}”{" "}
              {mode === "add" ? "to" : "from"} {preview.targets.length} selected titles
            </h3>
            {!!preview.skipped && (
              <p className="text-xs text-muted">
                {preview.skipped} skipped · already up to date, locked or unavailable.
              </p>
            )}
            <ol
              className="max-h-52 list-decimal space-y-1 overflow-y-auto ps-6 text-sm"
              aria-label="Reviewed titles"
            >
              {preview.targets.map((target) => (
                <li key={target.id} className="break-words">
                  {target.title}
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2">
              <Button className="min-h-11" disabled={!ready} onClick={() => void perform("apply")}>
                Apply reviewed batches
              </Button>
              <Button
                variant="secondary"
                className="min-h-11"
                onClick={() => setPreview(undefined)}
              >
                Back to selection
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <label className="grid gap-1 text-sm">
                Change
                <select
                aria-label="Change"
                  className="min-h-11 rounded-md border border-border bg-bg px-3"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as BulkMode)}
                >
                  <option value="add">Add tag</option>
                  <option value="remove">Remove tag</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Tag
                <input
                  className="min-h-11 min-w-0 rounded-md border border-border bg-bg px-3"
                  placeholder="e.g. racing"
                  maxLength={96}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </label>
            </div>
            {!!input && !validBulkTag(tag) && (
              <p className="text-xs text-muted">
                Use 1–64 letters, numbers, hyphens or underscores. Spaces become hyphens.
              </p>
            )}
            {!ready ? (
              <p className="text-sm text-muted">Wait for search results to finish.</p>
            ) : !options.length ? (
              <p className="text-sm text-muted">
                No saved titles are available to edit in these results.
              </p>
            ) : (
              <>
                <fieldset className="grid gap-1">
                  <legend className="mb-1 text-sm font-medium">
                    Choose titles ({selected.size} selected)
                  </legend>
                  {options.slice(page * PAGE, (page + 1) * PAGE).map((video) => (
                    <label
                      key={video.id}
                      className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-bg px-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="shrink-0"
                        checked={selected.has(video.id)}
                        onChange={(e) =>
                          setSelected((previous) => {
                            const next = new Set(previous);
                            if (e.target.checked) next.add(video.id);
                            else next.delete(video.id);
                            return next;
                          })
                        }
                      />
                      <span className="min-w-0 break-words">
                        {video.name}{" "}
                        <span className="text-xs text-muted">
                          · {video.remote?.kind ?? "Local"}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    className="min-h-11"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous titles
                  </Button>
                  <span className="text-xs text-muted">
                    {page + 1} / {Math.ceil(options.length / PAGE)}
                  </span>
                  <Button
                    variant="secondary"
                    className="min-h-11"
                    disabled={(page + 1) * PAGE >= options.length}
                    onClick={() => setPage(page + 1)}
                  >
                    Next titles
                  </Button>
                  <Button
                    className="min-h-11"
                    disabled={!selected.size || !validBulkTag(tag)}
                    onClick={prepare}
                  >
                    Review selected tag changes
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
    </section>
  );
}
