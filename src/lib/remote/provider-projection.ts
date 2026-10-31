import { ProviderBudgetError } from "../provider-budgets.ts";
const text = (value: unknown, maximum: number) =>
  typeof value === "string" ? value.slice(0, maximum) : undefined;
const number = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;
const label = (value: any, maximum: number) => {
  const content =
    typeof value?.simpleText === "string"
      ? value.simpleText
      : Array.isArray(value?.runs)
        ? value.runs
            .slice(0, 64)
            .map((run: any) => text(run?.text, maximum) ?? "")
            .join("")
        : undefined;
  return content === undefined ? undefined : { simpleText: content.slice(0, maximum) };
};
/** Retained archive rows own only fields used by the catalog adapter, never
 * provider command menus, tracking trees, comments or recommended shelves. */
export function projectYoutubeRenderer(row: any) {
  if (typeof row.videoId === "string" && row.videoId.length > 128)
    throw new ProviderBudgetError(
      "graph",
      "YouTube metadata identity exceeded its graph budget; the page was not accepted.",
    );
  return {
    videoId: text(row.videoId, 128),
    youtubeType: ["upload", "short", "replay", "live", "upcoming"].includes(row.youtubeType)
      ? row.youtubeType
      : undefined,
    title: label(row.title, 2048),
    descriptionSnippet: label(row.descriptionSnippet, 16384),
    shortBylineText: label(row.shortBylineText, 512),
    viewCountText: label(row.viewCountText, 128),
    publishedTimeText: label(row.publishedTimeText, 128),
    lengthText: label(row.lengthText, 64),
    publishedAt: text(row.publishedAt, 128),
    publishDate: text(row.publishDate, 128),
    uploadDate: text(row.uploadDate, 128),
    isLive: row.isLive === true,
    isLiveContent: row.isLiveContent === true,
    upcomingEventData: row.upcomingEventData
      ? { startTime: text(row.upcomingEventData.startTime, 32) }
      : undefined,
    thumbnail: {
      thumbnails: Array.isArray(row.thumbnail?.thumbnails)
        ? row.thumbnail.thumbnails.slice(-4).map((thumb: any) => ({ url: text(thumb?.url, 4096) }))
        : [],
    },
    thumbnailOverlays: Array.isArray(row.thumbnailOverlays)
      ? row.thumbnailOverlays.slice(0, 8).map((overlay: any) => ({
          thumbnailOverlayTimeStatusRenderer: {
            style: text(overlay.thumbnailOverlayTimeStatusRenderer?.style, 100),
            text: label(overlay.thumbnailOverlayTimeStatusRenderer?.text, 128),
          },
        }))
      : [],
    badges: Array.isArray(row.badges)
      ? row.badges.slice(0, 8).map((badge: any) => ({
          metadataBadgeRenderer: { style: text(badge.metadataBadgeRenderer?.style, 100) },
        }))
      : [],
    navigationEndpoint: row.navigationEndpoint
      ? {
          reelWatchEndpoint: row.navigationEndpoint.reelWatchEndpoint ? {} : undefined,
          commandMetadata: {
            webCommandMetadata: {
              url: text(row.navigationEndpoint.commandMetadata?.webCommandMetadata?.url, 4096),
            },
          },
        }
      : undefined,
  };
}
export function projectTwitchArchiveUser(user: any) {
  const identity = (v: unknown, limit: number) => {
    if (typeof v === "string" && v.length > limit)
      throw new ProviderBudgetError(
        "graph",
        "Twitch metadata identity/cursor exceeded its graph budget; the page was not accepted.",
      );
  };
  identity(user.id, 128);
  identity(user.videos?.pageInfo?.endCursor, 16384);
  if (Array.isArray(user.videos?.edges))
    for (const edge of user.videos.edges) {
      identity(edge?.cursor, 16384);
      identity(edge?.node?.id, 128);
    }
  const node = (v: any) =>
    v
      ? {
          id: text(v.id, 128),
          title: text(v.title, 2048),
          description: text(v.description, 65536),
          lengthSeconds: number(v.lengthSeconds),
          viewCount: number(v.viewCount),
          previewThumbnailURL: text(v.previewThumbnailURL, 4096),
          publishedAt: text(v.publishedAt, 128),
          game: v.game ? { name: text(v.game.name, 256) } : undefined,
        }
      : undefined;
  return {
    id: text(user.id, 128),
    displayName: text(user.displayName, 256),
    profileImageURL: text(user.profileImageURL, 4096),
    stream: user.stream
      ? {
          title: text(user.stream.title, 2048),
          viewersCount: number(user.stream.viewersCount),
          previewImageURL: text(user.stream.previewImageURL, 4096),
          game: user.stream.game ? { name: text(user.stream.game.name, 256) } : undefined,
        }
      : user.stream === null
        ? null
        : undefined,
    videos: user.videos
      ? {
          providerError:
            typeof user.videos.providerError === "string"
              ? user.videos.providerError.slice(0, 240)
              : Boolean(user.videos.providerError),
          pageInfo: user.videos.pageInfo
            ? {
                hasNextPage:
                  typeof user.videos.pageInfo.hasNextPage === "boolean"
                    ? user.videos.pageInfo.hasNextPage
                    : undefined,
                endCursor: text(user.videos.pageInfo.endCursor, 16384),
              }
            : undefined,
          edges: Array.isArray(user.videos.edges)
            ? user.videos.edges.map((edge: any) => ({
                cursor: text(edge.cursor, 16384),
                node: node(edge.node),
              }))
            : user.videos.edges,
        }
      : undefined,
  };
}
