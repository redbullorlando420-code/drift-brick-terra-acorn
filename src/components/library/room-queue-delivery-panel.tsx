import type { IntentView } from "@/lib/multiplayer/room-delivery";
import type { OutboxSnapshot } from "@/lib/multiplayer/room-outbox";
const labels = {
  waiting: "Waiting for host",
  checking: "Checking receipt",
  offline: "Waiting for connection",
  applied: "Applied",
  superseded: "Superseded",
  rejected: "Rejected",
  expired: "Expired",
};
const action = (type: string) =>
  type === "video-request"
    ? "Select video"
    : type === "next-request"
      ? "Play next"
      : type === "queue-suggest"
        ? "Suggest videos"
        : type === "queue-batch"
          ? "Add links"
          : type === "queue-shuffle"
            ? "Shuffle queue"
            : type === "queue-edit"
              ? "Edit selected titles"
              : "Edit queue";
export function RoomQueueDeliveryPanel({
  rows,
  transport,
  guest,
  epoch,
  basis,
}: {
  rows: IntentView[];
  transport: OutboxSnapshot;
  guest: boolean;
  epoch: string;
  basis: { queueRevision: number; selectionRevision: number };
}) {
  return (
    <details
      aria-label="Queue delivery status"
      data-room-delivery-epoch={epoch}
      data-room-queue-revision={basis.queueRevision}
      data-room-selection-revision={basis.selectionRevision}
      className="mb-3 rounded-lg border border-border bg-surface p-3"
    >
      <summary className="min-h-11 cursor-pointer text-sm font-medium text-fg">
        Queue delivery ·{" "}
        {rows.some((row) => ["waiting", "checking", "offline"].includes(row.status))
          ? "Checking edits"
          : transport.blocked
            ? "Pacing transfer"
            : "Up to date"}
      </summary>
      <p className="mt-2 text-xs leading-5 text-muted">
        Controls and chat have priority over library result pages.{" "}
        {transport.blocked
          ? "Waiting for transport space; catalog work is paced separately."
          : "No application messages waiting to send."}{" "}
        {Math.ceil(transport.queuedBytes / 1024)} KB waiting ·{" "}
        {Math.ceil(transport.nativeBytes / 1024)} KB in the browser transport.
      </p>
      {guest && (
        <p className="mt-2 text-xs leading-5 text-muted">
          After a lost confirmation, this device checks the host’s receipt before retrying. An edit
          is repeated only once and only while the confirmed queue and selected video still match.
          Unconfirmed edits expire after 45 seconds. Draft text is separate from the shared queue.
        </p>
      )}
      {guest && (
        <ol
          aria-label="Recent queue edit receipts"
          className="mt-3 max-h-72 space-y-2 overflow-y-auto"
        >
          {rows.slice(0, 24).map((row) => (
            <li
              key={row.id}
              data-queue-intent-status={row.status}
              className="rounded-md bg-bg/50 p-2 text-xs text-muted"
            >
              <span className="font-medium text-fg">
                {action(row.action)} · {labels[row.status]}
              </span>
              <span className="mt-1 block">
                Queue revision {row.revision} · {new Date(row.at).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ol>
      )}
      {guest && !rows.length && (
        <p className="mt-2 text-xs text-muted">
          Confirmed and pending edits from this room session will appear here.
        </p>
      )}
    </details>
  );
}
