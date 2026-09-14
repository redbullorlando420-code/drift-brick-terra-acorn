import { createServerFn } from "@tanstack/react-start";
import {
  runFetchAdultComments,
  runFetchTwitchFollowing,
  runFollowRemote,
  runImportChannels,
  runRefreshRemotes,
  runSearchAdultVideos,
  runSearchRedtubeStars,
} from "./api";

/**
 * Client-callable remote actions live apart from the provider implementation.
 * Keeping this module small gives TanStack Start stable server-function IDs
 * across dev-server dependency optimization and HMR updates.
 */
const input = (data: unknown) => data;

export const followRemote = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runFollowRemote(data));

export const refreshRemotes = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runRefreshRemotes(data));

export const importChannels = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runImportChannels(data));

export const fetchTwitchFollowing = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runFetchTwitchFollowing(data));

export const searchAdultVideos = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runSearchAdultVideos(data));

export const fetchAdultComments = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runFetchAdultComments(data));

export const searchRedtubeStars = createServerFn({ method: "POST" })
  .validator(input)
  .handler(({ data }) => runSearchRedtubeStars(data));

export type { AdultComment } from "./api";
