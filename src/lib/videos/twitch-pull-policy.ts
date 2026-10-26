import type { FollowedChannel } from "./types";
export type TwitchPullPolicy = {
  version: 1;
  clips: boolean;
  vods: boolean;
  priority: "low" | "normal" | "high";
};
export const DEFAULT_TWITCH_PULL_POLICY: Readonly<TwitchPullPolicy> = Object.freeze({
  version: 1,
  clips: true,
  vods: true,
  priority: "normal",
});
/** Missing/invalid legacy settings use the existing all-content, normal-priority behavior. No eager migration writes. */
export function normalizeTwitchPullPolicy(raw: unknown): TwitchPullPolicy | undefined {
  if (!raw || typeof raw !== "object") return;
  const r = raw as Record<string, unknown>;
  if (
    r.version !== 1 ||
    typeof r.clips !== "boolean" ||
    typeof r.vods !== "boolean" ||
    !["low", "normal", "high"].includes(r.priority as string)
  )
    return;
  return {
    version: 1,
    clips: r.clips,
    vods: r.vods,
    priority: r.priority as TwitchPullPolicy["priority"],
  };
}
export function twitchPullPolicy(
  channel: Pick<FollowedChannel, "twitchPullPolicy">,
): Readonly<TwitchPullPolicy> {
  const p = channel.twitchPullPolicy;
  return p?.version === 1 &&
    typeof p.clips === "boolean" &&
    typeof p.vods === "boolean" &&
    ["low", "normal", "high"].includes(p.priority)
    ? p
    : DEFAULT_TWITCH_PULL_POLICY;
}
export function twitchPolicyAllows(channel: FollowedChannel, scope: "recent" | "archive" | "live") {
  if (channel.kind !== "twitch" || scope === "live") return true;
  const p = twitchPullPolicy(channel);
  return scope === "archive" ? p.vods : p.clips || p.vods;
}
/** Provider responses never author user choices, including late copies of old settings. */
export function retainTwitchPullPolicy(
  previous: FollowedChannel | undefined,
  incoming: FollowedChannel,
): FollowedChannel {
  if (
    !previous ||
    previous.kind !== "twitch" ||
    incoming.kind !== "twitch" ||
    incoming.twitchPullPolicy === previous.twitchPullPolicy
  )
    return incoming;
  return { ...incoming, twitchPullPolicy: previous.twitchPullPolicy };
}
export function twitchPullPolicySummary(channels: FollowedChannel[]) {
  let creators = 0,
    clipsSkipped = 0,
    vodsSkipped = 0,
    contentSkipped = 0;
  for (const c of channels)
    if (c.kind === "twitch") {
      creators++;
      const p = twitchPullPolicy(c);
      if (!p.clips) clipsSkipped++;
      if (!p.vods) vodsSkipped++;
      if (!p.clips && !p.vods) contentSkipped++;
    }
  return { creators, clipsSkipped, vodsSkipped, contentSkipped };
}
