import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { recommendationTuning, type RecommendationTuning } from "@/lib/recommendation-tuning";
import { useReviewedDocument } from "./use-reviewed-document";
import { getFeedbackTimeline, undoManualFeedback } from "@/lib/media-feedback";
export function useGuideContinuity() {
  return useReviewedDocument(recommendationTuning);
}
export function GuideContinuityControl({
  showSuppressed,
  onReview,
}: {
  showSuppressed: boolean;
  onReview: () => void;
}) {
  const state = useGuideContinuity(),
    [slots, setSlots] = useState<RecommendationTuning["explorationSlots"]>(
      state.data.explorationSlots,
    ),
    [hours, setHours] = useState<RecommendationTuning["cooldownHours"]>(state.data.cooldownHours),
    [message, setMessage] = useState("");
  useEffect(() => {
    setSlots(state.data.explorationSlots);
    setHours(state.data.cooldownHours);
  }, [state.data]);
  return (
    <details
      data-guide-continuity
      className="mt-4 rounded-lg border border-border bg-elevated/40 p-4"
    >
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg">
        New creators and repeat cooldown
      </summary>
      <p className="mt-2 text-sm leading-6 text-muted">
        Reserve up to two of twelve Guide picks for confirmed followed creators with fresh
        publications and no recorded watch or explicit feedback. Display names alone do not qualify.
        Existing source, length and diversity choices still apply.
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">
        After two recorded recommendation exposures, unsaved titles can rest for the selected
        cooldown. Favorites, likes, creator favorites and four/five-star titles remain reachable.
        Explicit Guide title/topic queries always search through the cooldown. Other shelves retain
        their existing exposure scoring.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <label className="text-xs text-muted">
          Exploration slots
          <select
            aria-label="New creator exploration slots"
            value={slots}
            onChange={(e) => setSlots(Number(e.target.value) as typeof slots)}
            className="ml-2 min-h-11 rounded-md border border-border bg-bg px-2 text-fg"
          >
            {[0, 1, 2].map((n) => (
              <option key={n} value={n}>
                {n} of 12
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Repeat cooldown
          <select
            aria-label="Guide repeat cooldown"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value) as typeof hours)}
            className="ml-2 min-h-11 rounded-md border border-border bg-bg px-2 text-fg"
          >
            {[0, 6, 24, 72].map((n) => (
              <option key={n} value={n}>
                {n ? n + " hours" : "Off"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={!state.ready || !!state.error}
          onClick={() => {
            try {
              recommendationTuning.write({
                version: 1,
                explorationSlots: slots,
                cooldownHours: hours,
              });
              setMessage("Tuning saved to this profile. The Guide is refreshing these choices.");
            } catch (e) {
              setMessage(String(e));
            }
          }}
        >
          Save recommendation tuning
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => {
            recommendationTuning.reload();
            setMessage("Saved tuning reloaded.");
          }}
        >
          Reload recommendation tuning
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          aria-pressed={showSuppressed}
          onClick={onReview}
        >
          {showSuppressed ? "Return to regular picks" : "Show cooled-down picks"}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-fg">
          {state.error}
        </p>
      )}
      <p role="status" className="mt-2 text-xs text-muted">
        {message}
      </p>
      <p className="mt-2 text-xs text-muted">
        Cooldown review is temporary and does not record new recommendation exposures. Clearing
        recent exposure keeps ratings and playback history. Settings stay in this local profile; no
        provider requests are made.
      </p>
    </details>
  );
}
export function FeedbackTimelineControl() {
  const [, refresh] = useState(0),
    [page, setPage] = useState(0),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    const update = () => refresh((n) => n + 1);
    window.addEventListener("reelcase:rating-change", update);
    window.addEventListener("reelcase:feedback-save", update);
    return () => {
      window.removeEventListener("reelcase:rating-change", update);
      window.removeEventListener("reelcase:feedback-save", update);
    };
  }, []);
  let history: ReturnType<typeof getFeedbackTimeline> = { version: 1, entries: [] },
    error = "";
  try {
    history = getFeedbackTimeline();
  } catch (e) {
    error = String(e);
  }
  const currentPage = Math.min(page, Math.max(0, Math.ceil(history.entries.length / 8) - 1));
  return (
    <details
      data-feedback-timeline
      className="mt-4 rounded-lg border border-border bg-elevated/40 p-4"
    >
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg">
        Feedback undo history · {history.entries.length}/40
      </summary>
      <p className="mt-2 text-sm leading-6 text-muted">
        Recent star ratings, creator ratings/hearts/favorites, tag hearts and “less of this”
        choices. Automatic watch time and exposure are separate. Undo checks for newer decisions and
        commits before changing your active choices.
      </p>
      {error && <p role="alert">{error}</p>}
      {!history.entries.length && (
        <p className="mt-2 text-sm text-muted">
          No recent manual feedback edits. Older ratings remain unchanged; new edits will appear
          here.
        </p>
      )}
      <ul className="mt-3 space-y-2">
        {history.entries.slice(currentPage * 8, (currentPage + 1) * 8).map((op) => {
          const superseded =
            history.entries.find((e) => e.kind === op.kind && e.target === op.target)?.id !== op.id;
          return (
            <li
              key={op.id}
              data-feedback-operation={op.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-bg/50 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm text-fg">{op.label}</p>
                <p className="text-xs text-muted">
                  {op.kind} · {new Date(op.at).toLocaleString()} ·{" "}
                  {op.undoneAt !== undefined
                    ? "Undone"
                    : superseded
                      ? "Newer decision exists"
                      : "Can review undo"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {typeof op.before === "object"
                    ? op.before
                      ? "Less of this"
                      : "No rejection"
                    : String(op.before)}{" "}
                  →{" "}
                  {typeof op.after === "object"
                    ? op.after
                      ? "Less of this"
                      : "No rejection"
                    : String(op.after)}
                </p>
              </div>
              <Button
                className="min-h-11"
                variant="secondary"
                disabled={busy || superseded || op.undoneAt !== undefined}
                aria-label={"Undo feedback " + op.label}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await undoManualFeedback(op.id);
                    setMessage(
                      "Feedback edit undone and saved. Current cards stay still until the next mix.",
                    );
                    refresh((n) => n + 1);
                  } catch (e) {
                    setMessage(
                      e instanceof Error
                        ? e.message
                        : "Could not save undo. Active choices were kept.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Undo edit
              </Button>
            </li>
          );
        })}
      </ul>
      {history.entries.length > 8 && (
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={!currentPage}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous feedback edits
          </Button>
          <span className="text-xs text-muted">
            {currentPage + 1}/{Math.ceil(history.entries.length / 8)}
          </span>
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={(currentPage + 1) * 8 >= history.entries.length}
            onClick={() => setPage(currentPage + 1)}
          >
            Next feedback edits
          </Button>
        </div>
      )}
      <p role="status" className="mt-3 text-sm text-muted">
        {message}
      </p>
      <p className="mt-2 text-xs text-muted">
        Up to forty edits survive reload in this profile’s feedback ledger. An import starts a new
        timeline; existing pack exports keep their rating/rejection format. Undo history is not
        imported from packs. If another tab changed feedback, reload the app before undoing.
      </p>
    </details>
  );
}
