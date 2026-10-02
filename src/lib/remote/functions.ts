import { createServerFn } from "@tanstack/react-start";
import { runPausablePull } from "@/lib/pull-control";
import {
  runFetchAdultComments,
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
export const followRemote = (...args: Parameters<typeof followRemoteRequest>) => runPausablePull(signal => followRemoteRequest({ ...args[0], signal }));
export const refreshRemotes = (...args: Parameters<typeof refreshRemotesRequest>) => runPausablePull(signal => refreshRemotesRequest({ ...args[0], signal }));
export const importChannels = (...args: Parameters<typeof importChannelsRequest>) => runPausablePull(signal => importChannelsRequest({ ...args[0], signal }));
export const searchAdultVideos = (...args: Parameters<typeof searchAdultVideosRequest>) => runPausablePull(signal => searchAdultVideosRequest({ ...args[0], signal }));

/** Selected-photo validation must continue while bulk pulling is paused. */
export const inspectRedditImage = createServerFn({ method: 'POST' })
  .validator((data: unknown) => typeof data === 'string' && data.length <= 2048 ? data : '')
  .handler(async ({ data }) => {
    const { inspectRedditImageUrl } = await import('./reddit-media-status');
    return inspectRedditImageUrl(data);
  });
