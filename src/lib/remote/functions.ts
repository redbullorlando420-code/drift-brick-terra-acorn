import { createServerFn } from "@tanstack/react-start";
import { runPausablePull } from "@/lib/pull-control";
import { getPullSettings } from '@/lib/pull-settings';
import {
  runFetchAdultComments,
  runFetchLiveRooms,
  runFetchTwitchFollowing,
  runFollowRemote,
  runImportChannels,
  runRefreshRemotes,
  runSearchAdultVideos,
  runSearchRedtubeStars,
  runBooruOriginal,
  runYoutubeCreatorProfiles,
} from "./api";

/**
 * Client-callable remote actions live apart from the provider implementation.
 * Keeping this module small gives TanStack Start stable server-function IDs
 * across dev-server dependency optimization and HMR updates.
 */
const input = (data: unknown) => data;

const followRemoteRequest = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runFollowRemote(data));

const refreshRemotesRequest = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runRefreshRemotes(data));

const importChannelsRequest = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runImportChannels(data));

export const fetchTwitchFollowing = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runFetchTwitchFollowing(data));

const searchAdultVideosRequest = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runSearchAdultVideos(data));

export const fetchAdultComments = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runFetchAdultComments(data));

export const searchRedtubeStars = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runSearchRedtubeStars(data));

export const resolveBooruOriginal = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runBooruOriginal(data));

export const youtubeCreatorProfiles = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runYoutubeCreatorProfiles(data));

export type { AdultComment } from "./api";
const pacedData = (data: unknown) => ({ ...(data && typeof data === 'object' ? data : {}), youtubeRequestGapMs: getPullSettings().youtubeRequestGapMs });
export const followRemote = (...args: Parameters<typeof followRemoteRequest>) => runPausablePull(signal => followRemoteRequest({ ...args[0], data: pacedData(args[0]?.data), signal }));
export const refreshRemotes = (...args: Parameters<typeof refreshRemotesRequest>) => {
  const data = args[0]?.data as { youtubeLiveOnly?: boolean; twitchLiveOnly?: boolean; youtubeBackground?: boolean; channels?: { kind?: string }[] } | undefined;
  const live = Boolean(data?.youtubeLiveOnly || data?.twitchLiveOnly);
  const provider = data?.youtubeLiveOnly && !data.twitchLiveOnly ? 'youtube' : data?.twitchLiveOnly && !data.youtubeLiveOnly ? 'twitch'
    : data?.channels?.every(channel => channel.kind === 'youtube') ? 'youtube' : data?.channels?.every(channel => channel.kind === 'twitch') ? 'twitch' : undefined;
  // Owners gate new automatic turns; an accepted status read must not hold a
  // provider lane indefinitely if bulk archives are paused during the response.
  return runPausablePull(signal => refreshRemotesRequest({ ...args[0], data: pacedData(args[0]?.data), signal }),
    { live, provider, ignorePause: live, automatic: data?.youtubeBackground, signal: args[0]?.signal });
};
export const importChannels = (...args: Parameters<typeof importChannelsRequest>) => runPausablePull(signal => importChannelsRequest({ ...args[0], data: pacedData(args[0]?.data), signal }));
export const searchAdultVideos = (...args: Parameters<typeof searchAdultVideosRequest>) => runPausablePull(signal => searchAdultVideosRequest({ ...args[0], signal }));

/** Selected-photo validation must continue while bulk pulling is paused. */
export const inspectRedditImage = createServerFn({ method: 'POST' })
  .validator((data: unknown) => typeof data === 'string' && data.length <= 2048 ? data : '')
  .handler(async ({ data }) => {
    const { inspectRedditImageUrl } = await import('./reddit-media-status');
    return inspectRedditImageUrl(data);
  });

const liveRoomsRequest = createServerFn({ method: 'POST' }).validator(input).handler(({ data }) => runFetchLiveRooms(data));
/** Room pages are demand-driven live reads, independent of archive pause. */
export const fetchLiveRooms = (options: Parameters<typeof liveRoomsRequest>[0]) => runPausablePull(signal => liveRoomsRequest({ ...options, signal: options?.signal ? AbortSignal.any([signal, options.signal]) : signal }), { live: true, ignorePause: true });
