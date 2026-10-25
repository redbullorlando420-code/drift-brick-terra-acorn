import { decodeTwitchClipCursor, encodeTwitchClipCursor } from "../videos/twitch-clip-cursor";
import type { TwitchClipDiagnostics } from "../videos/types";
export type TwitchClipNode = {
  id?: string;
  slug?: string;
  title?: string;
  viewCount?: number;
  durationSeconds?: number;
  createdAt?: string;
  thumbnailURL?: string;
  game?: { name?: string };
};
export type TwitchClipConnection = {
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  edges?: Array<{ cursor?: string | null; node?: TwitchClipNode }>;
};
export async function walkTwitchClips(options: {
  limit: number;
  maxPages: number;
  cursor?: string;
  variety?: boolean;
  recentOnly?: boolean;
  read: (
    period: string | null,
    first: number,
    after?: string,
  ) => Promise<TwitchClipConnection | undefined>;
  gap: () => Promise<void>;
  now?: () => number;
}) {
  const now = options.now ?? Date.now,
    limit = Math.max(0, Math.min(500, Math.floor(options.limit))),
    maxPages = Math.max(1, Math.min(8, Math.floor(options.maxPages)));
  const clips: TwitchClipNode[] = [],
    seen = new Set<string>(),
    errors: string[] = [];
  const periods = options.variety
    ? options.recentOnly
      ? [null, "LAST_WEEK", "LAST_MONTH"]
      : [null, "LAST_WEEK", "LAST_MONTH", "ALL_TIME"]
    : ["ALL_TIME"];
  let cursor = decodeTwitchClipCursor(options.cursor),
    exhaustedAt: number | undefined,
    requests = 0;
  const diagnostics: TwitchClipDiagnostics = {
    at: now(),
    mode: options.variety ? "recent" : "archive",
    requested: limit,
    maxPages,
    pages: 0,
    received: 0,
    accepted: 0,
    duplicates: 0,
    windows: [],
  };
  let providerHold = false;
  const resume = new Map<string | null, { after: string; positions: Set<string> }>();
  const visits = [...periods];
  for (const [index, period] of visits.entries()) {
    if (clips.length >= limit || providerHold || requests >= maxPages) break;
    const backfill = index >= periods.length;
    const window = diagnostics.windows.find((w) => w.period === (period ?? "CURRENT")) ?? {
      period: period ?? "CURRENT",
      pages: 0,
      received: 0,
      accepted: 0,
      duplicates: 0,
      requested: 0,
      stop: "budget" as "budget" | "quota" | "exhausted" | "error",
      error: undefined as string | undefined,
    };
    if (!diagnostics.windows.includes(window)) diagnostics.windows.push(window);
    let after = backfill ? resume.get(period)?.after : options.variety ? undefined : cursor?.after,
      accepted = 0;
    const target =
      options.variety && !backfill
        ? Math.ceil((limit - clips.length) / (periods.length - index))
        : limit;
    window.requested = (window.requested ?? 0) + Math.min(target, limit - clips.length);
    const positions = backfill
      ? resume.get(period)!.positions
      : new Set<string>(after ? [after] : []);
    const pageBudget = Math.max(1, maxPages - requests - Math.max(0, periods.length - index - 1));
    for (
      let page = 0;
      page < pageBudget && requests < maxPages && clips.length < limit && accepted < target;
      page++
    ) {
      try {
        if (requests++) await options.gap();
        window.pages++;
        diagnostics.pages++;
        const connection = await options.read(
          period,
          Math.min(100, limit - clips.length, target - accepted),
          after,
        );
        if (
          !connection ||
          typeof connection.pageInfo?.hasNextPage !== "boolean" ||
          !Array.isArray(connection.edges)
        )
          throw Error("Twitch returned a malformed clip page; the saved position was kept.");
        window.received += connection.edges.length;
        diagnostics.received += connection.edges.length;
        let malformed = false;
        for (const edge of connection.edges) {
          const node = edge.node,
            key = node?.slug || node?.id;
          if (!key) {
            malformed = true;
            continue;
          }
          if (seen.has(key)) {
            window.duplicates++;
            diagnostics.duplicates++;
            continue;
          }
          if (clips.length >= limit || accepted >= target) {
            malformed = true;
            break;
          }
          seen.add(key);
          clips.push(node!);
          accepted++;
          window.accepted++;
          diagnostics.accepted++;
        }
        if (malformed)
          throw Error(
            "Twitch returned an incomplete clip page; accepted clips were kept and the page will be retried.",
          );
        const next = connection.pageInfo.endCursor || connection.edges.at(-1)?.cursor;
        if (!connection.pageInfo.hasNextPage) {
          window.stop = "exhausted";
          resume.delete(period);
          if (!options.variety) {
            cursor = undefined;
            exhaustedAt = now();
          }
          break;
        }
        if (!connection.edges.length || !next || positions.has(next))
          throw Error("Twitch clip cursor stopped advancing; the saved position was kept.");
        positions.add(next);
        after = next;
        resume.set(period, { after: next, positions });
        if (!options.variety) cursor = { after: next };
      } catch (error) {
        window.stop = "error";
        resume.delete(period);
        window.error = (error instanceof Error ? error.message : String(error)).slice(0, 240);
        errors.push(window.period + ": " + window.error);
        providerHold = /\b429\b|rate.?limit|integrity|challenge|retry.after/i.test(window.error);
        break;
      }
    }
    if (window.stop !== "error" && window.stop !== "exhausted")
      window.stop = accepted >= target || clips.length >= limit ? "quota" : "budget";
    if (
      options.variety &&
      index === periods.length - 1 &&
      clips.length < limit &&
      requests < maxPages &&
      !providerHold
    )
      visits.push(...resume.keys());
  }
  diagnostics.stopReason = providerHold ? "provider-hold" : errors.length ? "partial-error" : clips.length >= limit ? "quota" : requests >= maxPages && (resume.size > 0 || diagnostics.windows.length < periods.length || diagnostics.windows.some(w => w.stop === "budget")) ? "page-budget" : "exhausted";
  return {
    clips,
    diagnostics,
    ...(!options.variety ? { cursor: encodeTwitchClipCursor(cursor), exhaustedAt } : {}),
    ...(errors.length ? { error: errors.join("; ").slice(0, 240) } : {}),
  };
}
