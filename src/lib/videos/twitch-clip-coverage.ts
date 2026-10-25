import type { FollowedChannel, TwitchClipDiagnostics } from "./types";

const periods = ["CURRENT", "LAST_WEEK", "LAST_MONTH", "ALL_TIME"];
const stops = ["quota", "page-budget", "exhausted", "partial-error", "provider-hold"];
const count = (n: unknown): n is number =>
  typeof n === "number" && Number.isSafeInteger(n) && n >= 0 && n <= 100_000;
const clock = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n > 0 && n <= 8_640_000_000_000_000;
/** One bounded snapshot per creator, shared by reload and backup import. Older
 * snapshots remain readable without inventing their missing quota or reason. */
export function normalizeTwitchClipDiagnostics(raw: unknown): TwitchClipDiagnostics | undefined {
  if (!raw || typeof raw !== "object") return;
  const d = raw as TwitchClipDiagnostics;
  if (
    !clock(d.at) ||
    !["recent", "archive"].includes(d.mode) ||
    ![d.pages, d.received, d.accepted, d.duplicates].every(count) ||
    !Array.isArray(d.windows) ||
    d.windows.length > 4 ||
    new Set(d.windows.map((w) => w?.period)).size !== d.windows.length ||
    !d.windows.every(
      (w) =>
        w &&
        periods.includes(w.period) &&
        ["budget", "quota", "exhausted", "error"].includes(w.stop) &&
        [w.pages, w.received, w.accepted, w.duplicates].every(count),
    )
  )
    return;
  return {
    at: d.at,
    mode: d.mode,
    pages: d.pages,
    received: d.received,
    accepted: d.accepted,
    duplicates: d.duplicates,
    ...(count(d.requested) && d.requested <= 500 ? { requested: d.requested } : {}),
    ...(count(d.maxPages) && d.maxPages > 0 && d.maxPages <= 8 ? { maxPages: d.maxPages } : {}),
    ...(stops.includes(d.stopReason ?? "") ? { stopReason: d.stopReason } : {}),
    ...(typeof d.cacheHit === "boolean" ? { cacheHit: d.cacheHit } : {}),
    ...(clock(d.servedAt) ? { servedAt: d.servedAt } : {}),
    windows: d.windows.map((w) => ({
      period: w.period,
      pages: w.pages,
      received: w.received,
      accepted: w.accepted,
      duplicates: w.duplicates,
      stop: w.stop,
      ...(count(w.requested) && w.requested <= 2000 ? { requested: w.requested } : {}),
      ...(typeof w.error === "string" ? { error: w.error.slice(0, 240) } : {}),
    })),
  };
}
export function clipCoverageSummary(d: TwitchClipDiagnostics) {
  switch (d.stopReason) {
    case "quota":
      return {
        label: "Requested count reached",
        detail:
          "The unique clip target was filled. Some returned clips may already be saved in your library.",
      };
    case "page-budget":
      return {
        label: "Page budget reached",
        detail:
          "The bounded page allowance ended while more shelves or pages remained. Overlapping highlights can use pages without adding unique clips.",
      };
    case "exhausted":
      return {
        label: "Public shelves exhausted",
        detail:
          "The checked shelves reported no further pages. A sparse public highlight shelf does not prove this creator has no other clips.",
      };
    case "partial-error":
      return {
        label: "Partial window failure",
        detail:
          "A shelf failed; healthy windows continued within the same budget. Accepted clips and safe older positions were kept.",
      };
    case "provider-hold":
      return {
        label: "Provider wait or challenge",
        detail:
          "New window reads stopped after Twitch requested a wait or integrity check. Accepted clips and safe positions were kept.",
      };
    default:
      return {
        label: "Saved coverage · reason unrecorded",
        detail:
          "This older snapshot did not record the overall quota or stop reason. Window results below are the available evidence.",
      };
  }
}
export function clipWindowLabel(period: string) {
  return (
    (
      {
        CURRENT: "Current highlights",
        LAST_WEEK: "Past week",
        LAST_MONTH: "Past month",
        ALL_TIME: "All-time highlights",
      } as Record<string, string>
    )[period] ?? "Public shelf"
  );
}
export function clipWindowStop(stop: TwitchClipDiagnostics["windows"][number]["stop"]) {
  return {
    quota: "Window quota reached",
    budget: "Page budget or earlier quota · legacy snapshots may not distinguish them",
    exhausted: "No further public pages",
    error: "Window failed",
  }[stop];
}
/** No request, catalog scan or retry override is performed by diagnostics. */
export function clipCoverageAction(
  channel: FollowedChannel,
  mode: "recent" | "archive",
  now: number,
) {
  const retryAt =
    (mode === "recent" ? channel.twitchClipRecentRetry : channel.twitchClipRetry)?.retryAt ?? 0;
  if (retryAt > now)
    return {
      allowed: false,
      retryAt,
      reason: "Retry available after " + new Date(retryAt).toLocaleString(),
    };
  if (mode === "archive" && channel.twitchClipExhaustedAt)
    return {
      allowed: false,
      retryAt: 0,
      reason:
        "The saved older public shelf has no further pages. Refresh recent clips for new highlights.",
    };
  return {
    allowed: !channel.importNeedsReview,
    retryAt: 0,
    reason: channel.importNeedsReview ? "Resolve this creator before checking clips." : "",
  };
}
