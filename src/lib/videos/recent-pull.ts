import type { FollowedChannel, ProviderFailure, RecentPullState } from "./types";
const positive = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;
export function normalizeRecentPull(raw: unknown): RecentPullState | undefined {
  if (!raw || typeof raw !== "object") return;
  const row = raw as RecentPullState;
  if (
    !positive(row.attemptedAt) ||
    !Number.isInteger(row.failures) ||
    row.failures < 0 ||
    row.failures > 8
  )
    return;
  const failure =
    row.failure &&
    positive(row.failure.at) &&
    typeof row.failure.message === "string" &&
    typeof row.failure.kind === "string"
      ? {
          ...row.failure,
          message: row.failure.message.slice(0, 240),
          recovery:
            typeof row.failure.recovery === "string" ? row.failure.recovery.slice(0, 500) : "",
        }
      : undefined;
  return {
    attemptedAt: row.attemptedAt,
    failures: row.failures,
    ...(positive(row.checkedAt) ? { checkedAt: row.checkedAt } : {}),
    ...(positive(row.retryAt) ? { retryAt: row.retryAt } : {}),
    ...(failure ? { failure } : {}),
    ...(typeof row.newestVideoId === "string" && row.newestVideoId.length <= 128
      ? { newestVideoId: row.newestVideoId }
      : {}),
  };
}
export function recentPullFailure(
  channel: Pick<FollowedChannel, "recentPull">,
  failure: ProviderFailure,
  now = Date.now(),
): RecentPullState {
  const previous = normalizeRecentPull(channel.recentPull),
    failures = Math.min(8, (previous?.failures ?? 0) + 1);
  const base =
    failure.kind === "unavailable"
      ? 15 * 60_000
      : failure.kind === "rate-limited" || failure.kind === "integrity-challenge"
        ? 5 * 60_000
        : failure.kind === "response-budget"
          ? 60_000
          : 15_000;
  const retryAt = Math.max(
    failure.retryAt ?? 0,
    now +
      Math.min(
        failure.kind === "unavailable" ? 60 * 60_000 : 10 * 60_000,
        base * 2 ** (failures - 1),
      ),
  );
  return { ...previous, attemptedAt: now, failures, retryAt, failure: { ...failure, retryAt } };
}
export function recentPullSuccess(
  channel: Pick<FollowedChannel, "recentPull">,
  observation: Partial<FollowedChannel>,
  now = Date.now(),
): RecentPullState {
  const previous = normalizeRecentPull(channel.recentPull),
    raw = observation.cache?.at ?? observation.lastCheckedAt ?? now;
  const checkedAt = positive(raw) && raw <= now ? raw : now;
  // A warm old response must not rewind a newer watermark or clear a newer failure.
  if (previous && checkedAt < Math.max(previous.checkedAt ?? 0, previous.failure?.at ?? 0))
    return { ...previous, attemptedAt: now };
  return {
    attemptedAt: now,
    checkedAt,
    failures: 0,
    ...(observation.newestVideoId || previous?.newestVideoId
      ? { newestVideoId: observation.newestVideoId || previous?.newestVideoId }
      : {}),
  };
}
export function recentPullReady(
  channel: {
    recentPull?: Pick<RecentPullState, "retryAt">;
    lastProviderFailure?: { kind?: string; cooldownScope?: string; retryAt?: number };
  },
  now = Date.now(),
) {
  if ((channel.recentPull?.retryAt ?? 0) > now) return false;
  const legacy = channel.lastProviderFailure;
  return !(
    legacy?.kind === "rate-limited" &&
    ["all", "feed"].includes(legacy.cooldownScope ?? "") &&
    (legacy.retryAt ?? 0) > now
  );
}
export function selectRecentPullChannels<T extends FollowedChannel>(
  channels: readonly T[],
  kind: "youtube" | "twitch",
  now: number,
  limit: number,
): T[] {
  return channels
    .filter(
      (channel) =>
        channel.kind === kind &&
        !channel.importNeedsReview &&
        !channel.id.startsWith("ytpl:") &&
        (kind !== "youtube" || channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id)) &&
        recentPullReady(channel, now),
    )
    .sort(
      (a, b) =>
        (a.recentPull?.attemptedAt ?? 0) - (b.recentPull?.attemptedAt ?? 0) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, Math.max(0, Math.floor(limit)));
}
