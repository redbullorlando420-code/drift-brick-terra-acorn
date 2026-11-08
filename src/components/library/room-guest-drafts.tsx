import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  guestDrafts,
  stageGuestDraft,
  claimGuestDrafts,
  draftIdentity,
} from "@/lib/multiplayer/room-guest-drafts";
import {
  describeRoomMedia,
  parseRoomLinks,
  resolveRoomMedia,
  type RoomMediaDescriptor,
} from "@/lib/multiplayer/room-media";
import type { LibraryVideo } from "@/lib/videos/types";
import type { RoomSearchEvidence } from "@/lib/multiplayer/room-search-evidence";
export type GuestDraftAPI = {
  stage: (video: LibraryVideo, evidence: RoomSearchEvidence) => void;
};
export const RoomGuestDrafts = forwardRef<
  GuestDraftAPI,
  {
    room: string;
    connected: boolean;
    catalogRevision?: number;
    canSubmit: boolean;
    pending: boolean;
    onSubmit: (media: RoomMediaDescriptor[], evidence?: RoomSearchEvidence[]) => boolean;
  }
>(function RoomGuestDrafts(
  { room, connected, catalogRevision, canSubmit, pending, onSubmit },
  ref,
) {
  const [state, setState] = useState(() => guestDrafts.read()),
    [ids, setIds] = useState<string[]>([]),
    [link, setLink] = useState(""),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [retryReviewed, setRetryReviewed] = useState(false),
    latch = useRef(false);
  const save = (next: typeof state) => {
    const saved = guestDrafts.write(next);
    setState(saved);
    return saved;
  };
  const attempt = (fn: () => void) => {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Draft could not be changed.");
    }
  };
  const stage = (video: LibraryVideo, evidence: RoomSearchEvidence) =>
    attempt(() => {
      if (!video.remote)
        throw Error(
          "Local files cannot be persisted in a suggestion draft. Use the host’s local-share controls.",
        );
      const media = describeRoomMedia(video);
      if (!media) throw Error("This provider link is not shareable.");
      save(
        stageGuestDraft(guestDrafts.get(), room, {
          media,
          origin: evidence.source,
          catalogRevision: evidence.source === "host" ? evidence.revision : undefined,
          status: "draft",
        }),
      );
      setNote("Saved on this device only. Nothing was sent to the host.");
    });
  useImperativeHandle(ref, () => ({ stage }));
  const submit = () =>
    attempt(() => {
      if (latch.current || pending) return;
      if (!canSubmit)
        throw Error(
          "The host has not enabled guest queue suggestions/edits. Drafts are unchanged.",
        );
      latch.current = true;
      try {
        const before = guestDrafts.get(),
          claimed = claimGuestDrafts(before, room, ids, catalogRevision, connected);
        save(claimed);
        const rows = claimed.rows.filter((r) => ids.includes(draftIdentity(r)));
        const sent = onSubmit(rows.map(r=>r.media), rows.map((r):RoomSearchEvidence=>r.origin==="host"
          ? {source:"host",revision:r.catalogRevision!} : {source:r.origin}));
        if (!sent) {
          save(before);
          setNote("No delivery was queued. Your unsent drafts remain here.");
        } else {
          setIds([]);
          setNote(
            "Submitted to the existing delivery queue, not accepted by the host. Check delivery receipts below. No automatic draft resubmission occurs after reload.",
          );
        }
      } finally {
        latch.current = false;
      }
    });
  return (
    <details data-guest-drafts className="my-4 rounded-lg border border-border bg-surface p-4">
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium">
        My suggestion drafts · {state.rows.length}/16
      </summary>
      <p className="mt-2 text-sm leading-6 text-muted">
        Collect public links offline, reorder or preview, then deliberately send up to eight. Drafts
        are separate from the host queue. Submitted rows stay locked until you explicitly review
        delivery and retry.
      </p>
      {state.room && state.room !== room && state.rows.length > 0 && (
        <p className="mt-2 text-sm text-accent">
          This saved draft belongs to a different room. Return to that room or explicitly clear this
          draft before starting another.
        </p>
      )}
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          attempt(() => {
            const parsed = parseRoomLinks(link.trim().split(/\s+/).join("\n"));
            if (!parsed.videos.length || parsed.invalid || parsed.truncated)
              throw Error("Paste supported YouTube/Twitch links only, within the draft limit.");
            let next = guestDrafts.get();
            for (const video of parsed.videos)
              next = stageGuestDraft(next, room, {
                media: describeRoomMedia(video)!,
                origin: "public",
                status: "draft",
              });
            save(next);
            setLink("");
            setNote("Links staged locally; no host queue changed.");
          });
        }}
      >
        <textarea
          aria-label="Links for my suggestion draft"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          maxLength={8000}
          rows={3}
          placeholder="Paste YouTube or Twitch links, one per line"
          className="min-h-24 w-full min-w-0 resize-y rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus-visible:outline-2 focus-visible:outline-accent"
        />
        <Button type="submit">Stage draft links</Button>
      </form>
      <ul
        aria-label="My unsent and submitted suggestions"
        className="mt-3 max-h-128 space-y-3 overflow-y-auto overscroll-contain"
      >
        {state.room === room &&
          state.rows.map((row, index) => {
            const id = draftIdentity(row),
              video = resolveRoomMedia(row.media)!.video!;
            return (
              <li data-guest-draft-id={id} key={id} className="rounded-lg border border-border p-3">
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={ids.includes(id)}
                    onChange={(e) =>
                      setIds((previous) =>
                        e.target.checked ? [...previous, id] : previous.filter((k) => k !== id),
                      )
                    }
                  />
                  <span className="break-words">
                    {row.media.name} ·{" "}
                    {row.status === "draft" ? "Unsent draft" : "Submitted; receipt required"}
                  </span>
                </label>
                <p className="text-xs text-muted">
                  {row.origin === "host"
                    ? "Host-shared result · sharing revision " +
                      (row.catalogRevision ?? "unverified")
                    : row.origin === "library" ? "Saved in my library" : "Public provider link"}
                  {row.origin === "host" && row.catalogRevision !== catalogRevision
                    ? " · revalidation needed"
                    : ""}
                </p>
                <details className="mt-2">
                  <summary className="min-h-11 cursor-pointer content-center text-xs">
                    Preview draft metadata
                  </summary>
                  <p className="break-words text-xs text-muted">
                    {video.remote?.channelName ?? "Creator unavailable"} · {video.remote?.kind} ·{" "}
                    {row.media.name}
                  </p>
                  <a
                    href={row.media.watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center text-xs text-accent"
                  >
                    Open provider preview
                  </a>
                  <p className="text-xs text-muted">
                    Opening a link does not stage room playback or mark the host suggestion
                    accepted.
                  </p>
                </details>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={index === 0 || row.status !== "draft"}
                    onClick={() =>
                      attempt(() => {
                        const rows = state.rows.slice();
                        [rows[index - 1], rows[index]] = [rows[index]!, rows[index - 1]!];
                        save({ ...state, rows });
                      })
                    }
                  >
                    Move draft up
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={index === state.rows.length - 1 || row.status !== "draft"}
                    onClick={() =>
                      attempt(() => {
                        const rows = state.rows.slice();
                        [rows[index], rows[index + 1]] = [rows[index + 1]!, rows[index]!];
                        save({ ...state, rows });
                      })
                    }
                  >
                    Move draft down
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      attempt(() => {
                        save({ ...state, rows: state.rows.filter((r) => draftIdentity(r) !== id) });
                        setIds((v) => v.filter((k) => k !== id));
                      })
                    }
                  >
                    Remove draft
                  </Button>
                </div>
              </li>
            );
          })}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          disabled={
            !ids.length ||
            ids.length > 8 ||
            !connected ||
            !canSubmit ||
            pending ||
            state.rows.some((r) => ids.includes(draftIdentity(r)) && r.status !== "draft")
          }
          onClick={submit}
        >
          Submit selected drafts
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setState(guestDrafts.read());
            setIds([]);
            setError(guestDrafts.error());
          }}
        >
          Reload my drafts
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            attempt(() => {
              save({ version: 1, room, rows: [] });
              setIds([]);
              setNote("Local draft queue cleared; host queue and receipts were not changed.");
            })
          }
        >
          Clear local draft queue
        </Button>
      </div>
      <label className="mt-3 flex min-h-11 items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={retryReviewed}
          onChange={(e) => setRetryReviewed(e.target.checked)}
        />
        I checked delivery receipts; resending submitted rows may repeat a suggestion.
      </label>
      <Button
        variant="secondary"
        disabled={!retryReviewed || !ids.length}
        onClick={() =>
          attempt(() => {
            save({
              ...state,
              rows: state.rows.map((r) =>
                ids.includes(draftIdentity(r)) ? { ...r, status: "draft" } : r,
              ),
            });
            setRetryReviewed(false);
            setIds([]);
            setNote(
              "Selected rows returned to drafts by explicit review. Submit is still a separate action.",
            );
          })
        }
      >
        Return reviewed selection to drafts
      </Button>
      <p role="status" className="mt-2 text-xs text-muted">
        {note}
      </p>
      {(error || guestDrafts.error()) && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error || guestDrafts.error()}
        </p>
      )}
    </details>
  );
});
