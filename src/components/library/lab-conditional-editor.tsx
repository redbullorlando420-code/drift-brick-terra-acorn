import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_LAB_PLAN, parseLabPlan, readLabPlan, type LabPlan } from "@/lib/lab-conditional";
import { previewLabPlan, type LabState } from "@/lib/stream-signal-lab";
import { reviewedDocument } from "@/lib/reviewed-document";
import { useReviewedDocument } from "./use-reviewed-document";
export function LabConditionalEditor({
  owner,
  state,
  at,
  onObserve,
  onBallot,
}: {
  owner: string;
  state: LabState;
  at: () => number;
  onObserve: () => void;
  onBallot: (plan: LabPlan) => void;
}) {
  const document = useMemo(
      () =>
        reviewedDocument(
          "reelcase.signal.conditional-plan.v1:" + encodeURIComponent(owner),
          () => ({ version: 1 as const, plan: DEFAULT_LAB_PLAN }),
          (raw) => {
            const r = raw as { version: number; plan: unknown };
            if (!r || r.version !== 1)
              throw Error("Unsupported saved conditional plan. Existing data was kept.");
            return { version: 1 as const, plan: readLabPlan(r.plan) };
          },
        ),
      [owner],
    ),
    saved = useReviewedDocument(document);
  const [text, setText] = useState(JSON.stringify(DEFAULT_LAB_PLAN, null, 2)),
    [dirty, setDirty] = useState(false),
    [review, setReview] = useState<{
      text: string;
      state: string;
      plan: LabPlan;
      rows: ReturnType<typeof previewLabPlan>;
    } | null>(null),
    [ack, setAck] = useState(false),
    [error, setError] = useState(""),
    [note, setNote] = useState("");
  useEffect(() => {
    if (saved.ready && !dirty) setText(JSON.stringify(saved.data.plan, null, 2));
  }, [saved, dirty]);
  const fingerprint = JSON.stringify([
    state.health,
    state.energy,
    state.enemy,
    state.guarded,
    state.observedAt,
    state.window,
    state.status,
  ]);
  const valid = review?.text === text && review.state === fingerprint;
  return (
    <details data-conditional-editor className="signal-panel">
      <summary className="min-h-11 cursor-pointer content-center text-base font-semibold text-fg">
        Conditional sequence editor · simulator only
      </summary>
      <p className="mt-2 text-sm leading-6 text-muted">
        Review up to four moves with resource or guard preconditions, an observation freshness
        limit, a sequence timeout, and stop/skip behavior. These are simulated messages and
        resources; this editor has no Twitch, YouTube or installed-game connection.
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">
        Thresholds are 0–100; freshness is 100–30,000 ms; timeout is 1,000–120,000 ms from queueing.
        Missing or stale observations follow the selected policy. Timeout always cancels the rest of
        that sequence. Each executed move also checks current resources and records its simulated
        outcome as a fresh observation.
      </p>
      <label className="mt-3 block text-xs text-muted">
        Conditional plan JSON
        <textarea
          aria-label="Conditional simulator plan JSON"
          className="mt-2 block min-h-64 w-full rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg"
          value={text}
          maxLength={4096}
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
            setAck(false);
            setReview(null);
          }}
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={state.status === "stopped"}
          onClick={onObserve}
        >
          Observe simulator resources
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => {
            try {
              const plan = parseLabPlan(text);
              setReview({
                text,
                state: fingerprint,
                plan,
                rows: previewLabPlan(state, plan, at()),
              });
              setAck(false);
              setError("");
            } catch (e) {
              setError(String(e));
              setReview(null);
            }
          }}
        >
          Preview conditional sequence
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={!saved.ready || !!saved.error || !valid}
          onClick={() => {
            try {
              if (!review) return;
              document.write({ version: 1, plan: review.plan });
              setDirty(false);
              setNote(
                "Conditional plan saved in this local profile. No vote or move was submitted.",
              );
              setError("");
            } catch (e) {
              setError(String(e));
            }
          }}
        >
          Save reviewed simulator plan
        </Button>
        <Button
          variant="ghost"
          className="min-h-11"
          onClick={() => {
            document.reload();
            setDirty(false);
            setReview(null);
            setAck(false);
          }}
        >
          Reload saved simulator plan
        </Button>
      </div>
      {state.observedAt !== undefined && (
        <p className="mt-2 text-xs text-muted">
          Last simulated observation: {state.observedAt} ms on the replay clock. Preview and
          execution recheck its age.
        </p>
      )}
      {review && (
        <div className="mt-3 rounded-lg border border-border p-3">
          <p className="text-sm font-medium text-fg">
            Transitions if executed against this snapshot
          </p>
          <ol
            className="mt-2 space-y-2 text-xs text-muted"
            aria-label="Conditional sequence transitions"
          >
            {review.rows.map((r, i) => (
              <li key={i}>
                {i + 1}. {r.move} · health {r.health}, energy {r.energy}, opponent {r.opponent}
                <br />
                {r.note}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted">
            Current false conditions do not promise future success. A resource/window change
            invalidates this review. Runtime freshness and timeout checks still apply.
          </p>
          <label className="mt-2 flex min-h-11 items-center gap-2 text-xs text-fg">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />I
            reviewed the simulated transitions and interruption policy
          </label>
          <Button
            className="mt-2 min-h-11"
            disabled={!valid || !ack || state.status !== "voting"}
            onClick={() => {
              if (!review || !valid) return;
              onBallot(review.plan);
              setAck(false);
              setNote(
                "Reviewed conditional ballot submitted using the viewer and message ID above. It has not executed.",
              );
            }}
          >
            Submit reviewed conditional ballot
          </Button>
          {!valid && (
            <p className="mt-2 text-xs text-accent">
              The state changed. Preview the sequence again before submitting.
            </p>
          )}
        </div>
      )}
      {(error || saved.error) && (
        <p role="alert" className="mt-3 text-sm text-fg">
          {error || saved.error}
        </p>
      )}
      {note && (
        <p role="status" className="mt-3 text-xs text-muted">
          {note}
        </p>
      )}
    </details>
  );
}
