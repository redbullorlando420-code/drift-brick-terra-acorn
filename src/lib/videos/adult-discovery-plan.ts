import { ADULT_PULL_PROVIDERS, type AdultPullProvider } from "./adult-providers.ts";
import { ADULT_ARCHIVE_ORDERS, type AdultArchiveCursorMap } from "./adult-archive-cursors.ts";

/** Separate sort lanes retain their own continuations. Provider-level recency
 * keeps an untouched lane from starving every other source. No extra timers. */
export function planAdultDiscovery(
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
    return [{ provider, order, at: Math.max(0, ...all.map((row) => row?.updatedAt ?? 0)) }];
  }).sort(
    (a, b) =>
      a.at - b.at ||
      ADULT_PULL_PROVIDERS.indexOf(a.provider) - ADULT_PULL_PROVIDERS.indexOf(b.provider),
  );
  const order = tasks[0]?.order;
  return order
    ? {
        order,
        providers: tasks
          .filter((task) => task.order === order)
          .slice(0, Math.max(1, Math.min(7, limit)))
          .map((task) => task.provider),
      }
    : undefined;
}
