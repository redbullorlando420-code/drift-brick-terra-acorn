import type { FollowedChannel, LibraryVideo } from "./types";

export type TwitchAlias = {
  version: 1;
  userId: string;
  from: string;
  to: string;
  checkedAt: number;
};
const login = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9_]{1,25}$/.test(v);
export const twitchUserId = (v: unknown): v is string =>
  typeof v === "string" && /^\d{1,40}$/.test(v);
export function validTwitchAlias(raw: unknown): raw is TwitchAlias {
  const r = raw as TwitchAlias;
  return (
    !!r &&
    r.version === 1 &&
    twitchUserId(r.userId) &&
    login(r.from) &&
    login(r.to) &&
    r.from !== r.to &&
    Number.isSafeInteger(r.checkedAt) &&
    r.checkedAt > 0
  );
}
export function assertTwitchContinuity(
  previous: FollowedChannel,
  incoming: { channelId?: string },
) {
  if (twitchUserId(previous.channelId) && incoming.channelId !== previous.channelId)
    throw Error(
      "Twitch identity changed for this login. Saved media and settings were kept. Review this creator’s current login before pulling again.",
    );
}
/** Canonical IDs are never login-renamed: title signals and old source references stay intact. */
export function applyTwitchAlias(channel: FollowedChannel, evidence: TwitchAlias): FollowedChannel {
  if (
    channel.kind !== "twitch" ||
    !validTwitchAlias(evidence) ||
    channel.channelId !== evidence.userId ||
    channel.handle.toLowerCase() !== evidence.from ||
    Date.now() - evidence.checkedAt > 5 * 60_000 ||
    evidence.checkedAt > Date.now() + 5000
  )
    throw Error("The Twitch identity review expired or the creator changed. Check again.");
  if ((channel.twitchAliasRevision ?? 0) >= Number.MAX_SAFE_INTEGER)
    throw Error("Twitch identity revision exhausted. Existing identity was retained.");
  const aliases = [...new Set([...(channel.twitchAliases ?? []), evidence.from])].filter(
    (v) => v !== evidence.to,
  );
  if (aliases.length > 16)
    throw Error("This creator has reached its 16 saved aliases. Existing aliases were retained.");
  return {
    ...channel,
    handle: evidence.to,
    twitchCreatorKey: channel.twitchCreatorKey ?? channel.title.trim().toLowerCase(),
    twitchAliases: aliases,
    twitchAliasRevision: (channel.twitchAliasRevision ?? 0) + 1,
    importQuery: evidence.to,
    lastProviderFailure: undefined,
    lastLiveFailure: undefined,
    lastClipFailure: undefined,
    twitchLiveRetry: undefined,
    twitchArchiveRetry: undefined,
    twitchClipRetry: undefined,
    twitchClipRecentRetry: undefined,
    recentPull: undefined,
  };
}
/** Recycled names receive a separate source key. Proven distinct users never dedupe by login. */
export function separateTwitchIdentity(
  rows: FollowedChannel[],
  incoming: FollowedChannel,
): FollowedChannel {
  if (incoming.kind !== "twitch" || !twitchUserId(incoming.channelId)) return incoming;
  const collision = rows.find(
    (r) =>
      r.kind === "twitch" &&
      r.id === incoming.id &&
      twitchUserId(r.channelId) &&
      r.channelId !== incoming.channelId,
  );
  return collision
    ? {
        ...incoming,
        id: "tw:user:" + incoming.channelId,
        twitchCreatorKey: "twitch-user:" + incoming.channelId,
        twitchPullPolicy: undefined,
      }
    : incoming;
}
/** Public metadata can refresh; the reviewed source key/login and personal policy belong to the saved identity. */
export function retainTwitchSourceIdentity(
  owner: FollowedChannel,
  incoming: FollowedChannel,
): FollowedChannel {
  assertTwitchContinuity(owner, incoming);
  return {
    ...incoming,
    id: owner.id,
    handle: owner.handle,
    twitchAliases: owner.twitchAliases,
    twitchAliasRevision: owner.twitchAliasRevision,
    twitchCreatorKey: owner.twitchCreatorKey,
    twitchPullPolicy: owner.twitchPullPolicy,
  };
}
/** A late request started before an alias review cannot put the old login back. */
export function twitchObservationCurrent(current: FollowedChannel, incoming: FollowedChannel) {
  return (
    current.kind !== "twitch" ||
    incoming.kind !== "twitch" ||
    (!(
      twitchUserId(current.channelId) &&
      twitchUserId(incoming.channelId) &&
      current.channelId !== incoming.channelId
    ) &&
      (incoming.twitchAliasRevision ?? 0) >= (current.twitchAliasRevision ?? 0))
  );
}
export function bindTwitchSource(video: LibraryVideo, channel: FollowedChannel): LibraryVideo {
  if (video.remote?.kind !== "twitch") return video;
  const live = video.extension === "live";
  return {
    ...video,
    folderId: channel.id,
    ...(live ? { id: channel.id + (video.remote.live ? ":live" : ":channel") } : {}),
    remote: {
      ...video.remote,
      twitchCreatorKey: channel.twitchCreatorKey,
      channelId: channel.channelId,
      sourceIds: [...new Set([...(video.remote.sourceIds ?? []), channel.id])],
    },
  };
}

export function parseTwitchAliasResponse(
  raw: unknown,
  userId: string,
  from: string,
): TwitchAlias | undefined {
  const r = raw as { errors?: unknown[]; data?: { user?: { id?: unknown; login?: unknown } } };
  if (r?.errors?.length || !r?.data || !Object.hasOwn(r.data, "user"))
    throw Error("Twitch identity response was incomplete. No alias was changed.");
  const user = r.data.user;
  if (!user) throw Error("The saved Twitch user could not be resolved. No alias was changed.");
  if (user.id !== userId || !login(user.login))
    throw Error("Twitch returned mismatched identity evidence.");
  return user.login === from
    ? undefined
    : { version: 1, userId, from, to: user.login, checkedAt: Date.now() };
}

export const twitchCreatorSignal = (channel: FollowedChannel) =>
  channel.kind === "twitch"
    ? (channel.twitchCreatorKey ?? channel.title.trim().toLowerCase())
    : channel.title.trim().toLowerCase();
export const videoCreatorSignal = (video: LibraryVideo) =>
  video.remote?.kind === "twitch"
    ? (video.remote.twitchCreatorKey ?? video.remote.channelName ?? "")
    : (video.remote?.channelName ?? "");
