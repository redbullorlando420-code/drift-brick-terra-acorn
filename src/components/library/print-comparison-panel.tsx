import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  changePrintComparison,
  comparePrintEdits,
  printComparisonSnapshot,
  type PrintEditState,
} from "@/lib/print-edit-state";
type Snapshot = ReturnType<typeof printComparisonSnapshot>;
export function PrintComparisonPanel({
  modelKey,
  edit,
  ready,
  preview,
  onPreview,
  onChanged,
  saveWorking,
}: {
  modelKey: string;
  edit: PrintEditState;
  ready: boolean;
  preview: boolean;
  onPreview: (v: boolean, baseline?: PrintEditState) => void;
  onChanged: (edit: PrintEditState) => void;
  saveWorking: () => boolean;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | undefined>(() => {
      try {
        return printComparisonSnapshot(modelKey);
      } catch {
        return undefined;
      }
    }),
    [error, setError] = useState(""),
    [action, setAction] = useState<"capture" | "revert" | "undo" | null>(null),
    [ack, setAck] = useState(false),
    [message, setMessage] = useState("");
  const baseline = snapshot?.baseline ?? edit,
    differences = comparePrintEdits(edit, baseline);
  const review = (type: "capture" | "revert" | "undo") => {
    try {
      if (!saveWorking())
        throw Error(
          "The working draft could not be saved. Existing comparison and source file were kept.",
        );
      const current = printComparisonSnapshot(modelKey);
      setSnapshot({ ...current, baseline: current.captured ? current.baseline : baseline });
      setAction(type);
      setAck(false);
      setError("");
    } catch (e) {
      setError(String(e));
    }
  };
  const apply = () => {
    try {
      if (!snapshot || !action) return;
      const current = printComparisonSnapshot(modelKey);
      if (JSON.stringify(current.working) !== JSON.stringify(edit))
        throw Error("Working edits changed after review. Review the action again.");
      const next = changePrintComparison(modelKey, snapshot.token, action, snapshot.baseline);
      setSnapshot(next);
      onPreview(false);
      onChanged(next.working);
      setAction(null);
      setAck(false);
      setError("");
      setMessage(
        "Comparison change saved to this profile. The source model file was not rewritten.",
      );
    } catch (e) {
      setError(String(e));
      setAck(false);
    }
  };
  return (
    <details data-print-comparison className="rounded-lg border border-border p-3">
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg">
        Compare and revert workspace
      </summary>
      <p className="mt-2 text-xs leading-5 text-muted">
        Compare with{" "}
        {snapshot?.captured
          ? "your captured baseline"
          : "the workspace saved when this viewer opened"}
        . Model edits and viewer-only settings are listed separately. A baseline preview never saves
        or exports geometry.
      </p>
      <p className="mt-2 text-xs text-fg">{differences.length} changed fields</p>
      <ul aria-label="Print edit differences" className="mt-2 space-y-2">
        {differences.map((d) => (
          <li key={d.field} className="break-words text-xs text-muted">
            {d.field} · {d.kind === "view" ? "view only" : "model"}: {String(d.before)} →{" "}
            {String(d.after)}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={!ready || !snapshot}
          aria-pressed={preview}
          onClick={() => onPreview(!preview, baseline)}
        >
          {preview ? "Show working model" : "Preview comparison baseline"}
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={!ready}
          onClick={() => review("capture")}
        >
          Review new baseline
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={!ready || !differences.length}
          onClick={() => review("revert")}
        >
          Review revert to baseline
        </Button>
        {snapshot?.undo && (
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={!ready}
            onClick={() => review("undo")}
          >
            Review undo comparison change
          </Button>
        )}
        <Button
          variant="ghost"
          className="min-h-11"
          onClick={() => {
            try {
              setSnapshot(printComparisonSnapshot(modelKey));
              setAction(null);
              setError("");
              onPreview(false);
            } catch (e) {
              setError(String(e));
            }
          }}
        >
          Reload comparison
        </Button>
      </div>
      {preview && (
        <p role="status" className="mt-2 text-xs text-accent">
          Showing the baseline. Your working edits are retained; editing a control returns to the
          working model.
        </p>
      )}
      {action && (
        <div className="mt-3 space-y-2 rounded-md bg-bg p-3">
          <p className="text-sm text-fg">
            {action === "capture"
              ? "Replace the comparison baseline with this workspace?"
              : action === "revert"
                ? "Revert working edits to the reviewed baseline?"
                : "Restore the preceding working edit and baseline?"}
          </p>
          <p className="text-xs leading-5 text-muted">
            This writes only the browser workspace. One preceding comparison change remains
            recoverable; undo consumes that recovery slot. Native file saves and their receipts are
            separate.
          </p>
          <label className="flex min-h-11 items-center gap-2 text-xs text-fg">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />I
            reviewed this workspace comparison change
          </label>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-11" disabled={!ack} onClick={apply}>
              Apply reviewed comparison
            </Button>
            <Button variant="ghost" className="min-h-11" onClick={() => setAction(null)}>
              Cancel comparison review
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-fg">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-2 text-xs text-muted">
          {message}
        </p>
      )}
    </details>
  );
}
