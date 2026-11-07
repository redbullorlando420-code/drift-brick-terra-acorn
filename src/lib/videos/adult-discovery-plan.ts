import { ADULT_PULL_PROVIDERS, type AdultPullProvider } from "./adult-providers.ts";
import { ADULT_ARCHIVE_ORDERS, type AdultArchiveCursorMap } from "./adult-archive-cursors.ts";
import { archiveYieldWeight } from "./archive-yield.ts";

/** Separate sort lanes retain their own continuations. Provider-level recency
 * keeps an untouched lane from starving every other source. No extra timers. */
export function explainAdultDiscovery(
  read: (order: string) => AdultArchiveCursorMap,
  now: number,
  limit = 2,
) {
  const lanes = new Map(ADULT_ARCHIVE_ORDERS.map((order) => [order, read(order)]));
  const tasks = ADULT_PULL_PROVIDERS.flatMap((provider) => {
    const orders =
      provider === "eporner" || provider === "redtube"
        ? ADULT_ARCHIVE_ORDERS
        : (["top-weekly"] as const);
    const all = ADULT_ARCHIVE_ORDERS.map((order) => lanes.get(order)?.[provider]);
    if (all.some((row) => row && row.state !== "exhausted" && (row.retryAt ?? 0) > now)) return [];
    const eligible = orders
      .filter((order) => (lanes.get(order)?.[provider]?.retryAt ?? 0) <= now)
      .sort(
        (a, b) =>
          (lanes.get(a)?.[provider]?.updatedAt ?? 0) - (lanes.get(b)?.[provider]?.updatedAt ?? 0),
      );
    const order = eligible[0];
    if (!order) return [];
    const observations = all
      .filter((row) => row?.yield)
      .sort((a, b) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0));
    const sample = observations[0]?.yield;
    const latest = all.filter(Boolean).sort((a, b) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0))[0];
    return [
      {
        provider,
        order,
        at: Math.max(0, ...all.map((row) => row?.updatedAt ?? 0)),
        weight: latest?.state === "failed" ? 0 : archiveYieldWeight(sample),
        sample,
      },
    ];
  }).sort(
    (a, b) =>
      a.at - b.at ||
      ADULT_PULL_PROVIDERS.indexOf(a.provider) - ADULT_PULL_PROVIDERS.indexOf(b.provider),
  );
  const order = tasks[0]?.order;
  if (!order) return { plan: undefined, tasks: [] };
  const exploration = tasks[0]!,
    max = Math.max(1, Math.min(7, limit));
  // The oldest eligible provider always has the first slot. Useful yield may
  // reorder only the remaining compatible slots; manual requests bypass this.
  const extras = tasks
    .slice(1)
    .filter((task) => task.order === order)
    .sort(
      (a, b) =>
        b.weight - a.weight ||
        a.at - b.at ||
        ADULT_PULL_PROVIDERS.indexOf(a.provider) - ADULT_PULL_PROVIDERS.indexOf(b.provider),
    );
  const selected = [exploration, ...extras.slice(0, max - 1)];
  return {
    plan: { order, providers: selected.map((task) => task.provider) },
    tasks: tasks.map((task) => ({
      ...task,
      selected: selected.includes(task),
      reason:
        task === exploration
          ? "Oldest eligible source · guaranteed exploration"
          : selected.includes(task)
            ? "Useful yield within existing turn"
            : "Waiting for a fair or productive slot",
    })),
  };
}
export const planAdultDiscovery = (
  read: (order: string) => AdultArchiveCursorMap,
  now: number,
  limit = 2,
) => explainAdultDiscovery(read, now, limit).plan;
