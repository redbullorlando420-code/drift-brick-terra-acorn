export type BatchStatus = {
  id: string;
  phase: "idle" | "running" | "waiting" | "complete";
  label: string;
  total?: number;
  outcome?: string;
};
export type StatusAnnouncement = { key: string; text: string };
/** Running counters deliberately do not participate in the semantic key. No timer or log. */
export function batchStatusAnnouncement(status: BatchStatus): StatusAnnouncement {
  const label = status.label.slice(0, 80);
  if (status.phase === "idle") return { key: "", text: "" };
  const text =
    status.phase === "running"
      ? `${label} started${status.total ? ` for ${Math.max(0, Math.floor(status.total))} creators` : ""}. Detailed progress is available below.`
      : (
          status.outcome || `${label} ${status.phase === "waiting" ? "waiting" : "finished"}.`
        ).slice(0, 600);
  return { key: `${status.id.slice(0, 100)}:${status.phase}`, text };
}
export function retainStatusAnnouncement(
  previous: StatusAnnouncement,
  incoming: StatusAnnouncement,
): StatusAnnouncement {
  if (!incoming.key || incoming.key === previous.key) return previous;
  return incoming;
}
