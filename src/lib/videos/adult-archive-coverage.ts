import { ADULT_ARCHIVE_ORDERS, type AdultArchiveCursor } from "./adult-archive-model.ts";
import type { AdultPullProvider } from "./adult-providers.ts";
export const archiveOrdersFor = (provider: AdultPullProvider, saved:readonly string[]=[]) =>
  provider === "eporner" || provider === "redtube"
    ? ADULT_ARCHIVE_ORDERS
    : [...new Set(['top-weekly',...saved.filter(order=>(ADULT_ARCHIVE_ORDERS as readonly string[]).includes(order))])];
export const archiveOrderLabel = (order: string) =>
  ({
    latest: "Latest",
    "most-popular": "Most popular",
    "top-rated": "Top rated",
    "top-monthly": "Top this month",
    "top-weekly": "Top this week",
  })[order] ?? order;
export function archiveCoverageState(
  cursor: AdultArchiveCursor | undefined,
  now: number,
  providerRetryAt = 0,
) {
  const retryAt = Math.max(cursor?.retryAt ?? 0, providerRetryAt);
  if (!cursor)
    return {
      label: providerRetryAt > now ? "Provider cooling down" : "Not checked",
      canContinue: providerRetryAt <= now,
      retryAt,
    };
  if (cursor.state === "failed")
    return {
      label: retryAt > now ? "Failed · waiting to retry" : "Failed · ready to retry",
      canContinue: retryAt <= now,
      retryAt,
    };
  if (cursor.state === "exhausted")
    return {
      label:
        retryAt > now ? "Listing complete · recheck later" : "Listing complete · ready to recheck",
      canContinue: retryAt <= now,
      retryAt,
    };
  return {
    label:
      retryAt > now
        ? "Provider cooling down"
        : cursor.rewound
          ? "Stable paging restart"
          : "Ready to continue",
    canContinue: retryAt <= now,
    retryAt,
  };
}
