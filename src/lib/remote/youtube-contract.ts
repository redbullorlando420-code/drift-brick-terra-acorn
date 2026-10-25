/** Small metadata contracts. Errors contain a surface/reason, never raw provider payloads. */
export class YoutubeContractError extends Error {
  surface: "feed" | "catalog" | "live";
  reason: string;
  constructor(surface: "feed" | "catalog" | "live", reason: string) {
    super(
      "YouTube " +
        surface +
        " response is malformed or unsupported (" +
        reason +
        "); the previous observation and saved position were kept.",
    );
    this.name = "YoutubeContractError";
    this.surface = surface;
    this.reason = reason;
  }
}
const object = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === "object" && !Array.isArray(v);
export function validateYoutubeFeed(xml: string, channelId?: string) {
  if (!/<feed\b[^>]*>[\s\S]*<\/feed\s*>/i.test(xml))
    throw new YoutubeContractError("feed", "missing-feed-root");
  const opens = xml.match(/<entry\b[^>]*>/gi) ?? [],
    entries = [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry\s*>/gi)];
  if (opens.length !== entries.length) throw new YoutubeContractError("feed", "incomplete-entry");
  for (const [, entry] of entries) {
    if (!/<yt:videoId>\s*[A-Za-z0-9_-]{11}\s*<\/yt:videoId>/i.test(entry))
      throw new YoutubeContractError("feed", "missing-video-identity");
  }
  const owners = [...xml.matchAll(/<yt:channelId>\s*([^<]+)\s*<\/yt:channelId>/gi)].map((m) =>
    m[1].trim(),
  );
  if (channelId && owners.some((owner) => owner !== channelId && owner !== channelId.replace(/^UC/, "")))
    throw new YoutubeContractError("feed", "creator-mismatch");
  return { count: entries.length };
}
/** Distinguish a recognized empty container from unknown renderers or broken identities. */
export function validateYoutubeItems(items: unknown[], surface: "catalog" | "live" = "catalog") {
  if (items.length > 1) {
    for (const item of items) validateYoutubeItems([item], surface);
    return;
  }
  const stack: unknown[] = [items];
  let recognized = items.length === 0;
  while (stack.length) {
    const current = stack.pop();
    if (Array.isArray(current)) {
      for (const v of current) stack.push(v);
      continue;
    }
    if (!object(current)) continue;
    for (const key of [
      "videoRenderer",
      "gridVideoRenderer",
      "playlistVideoRenderer",
      "reelItemRenderer",
    ]) {
      if (current[key] !== undefined) {
        recognized = true;
        if (!object(current[key]) || !/^[A-Za-z0-9_-]{11}$/.test(current[key].videoId ?? ""))
          throw new YoutubeContractError(surface, "missing-video-identity");
      }
    }
    if (current.lockupViewModel) {
      const lockup = current.lockupViewModel;
      if (lockup.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" || lockup.contentType === undefined) {
        recognized = true;
        if (!/^[A-Za-z0-9_-]{11}$/.test(lockup.contentId ?? ""))
          throw new YoutubeContractError(surface, "missing-lockup-identity");
      }
    }
    if (current.shortsLockupViewModel) {
      recognized = true;
      if (
        !/^[A-Za-z0-9_-]{11}$/.test(
          current.shortsLockupViewModel.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId ?? "",
        )
      )
        throw new YoutubeContractError(surface, "missing-short-identity");
    }
    if (
      current.continuationItemRenderer !== undefined ||
      current.nextContinuationData !== undefined ||
      current.reloadContinuationData !== undefined ||
      current.continuationCommand !== undefined
    ) {
      recognized = true;
      const token =
        current.continuationCommand?.token ??
        current.continuationCommand?.innertubeCommand?.continuationCommand?.token ??
        current.nextContinuationData?.continuation ??
        current.reloadContinuationData?.continuation ??
        current.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
      if (typeof token !== "string" || !token.trim() || token.length > 16384)
        throw new YoutubeContractError(surface, "unreadable-continuation");
    }
    for (const [key, field] of [
      ["richGridRenderer", "contents"],
      ["gridRenderer", "items"],
      ["itemSectionRenderer", "contents"],
      ["sectionListRenderer", "contents"],
    ] as const)
      if (
        object(current[key]) &&
        Array.isArray(current[key][field]) &&
        current[key][field].length === 0
      )
        recognized = true;
    if (current.messageRenderer !== undefined) {
      recognized = true;
      const value=current.messageRenderer?.text;
      const text=typeof value==='string'?value:value?.simpleText??value?.runs?.map((r:any)=>r.text??'').join('')??'';
      if (!object(current.messageRenderer) || typeof text!=='string' || !/no (?:videos|streams|content|results)|does(?:n.t| not) have any (?:content|videos)|playlist is empty|has no (?:videos|streams|content)/i.test(text))
        throw new YoutubeContractError(surface, "unrecognized-empty-message");
    }
    for (const value of Object.values(current))
      if (value && typeof value === "object") stack.push(value);
  }
  if (!recognized) throw new YoutubeContractError(surface, "unknown-renderer-shape");
}
export function validateYoutubeLiveContent(content: unknown) {
  if (!object(content)) throw new YoutubeContractError("live", "missing-selected-content");
  const stack: unknown[] = [content];
  let boundary = false;
  while (stack.length) {
    const node = stack.pop();
    if (!object(node)) continue;
    for (const [key, field] of [
      ["richGridRenderer", "contents"],
      ["gridRenderer", "items"],
      ["itemSectionRenderer", "contents"],
      ["sectionListRenderer", "contents"],
      ["playlistVideoListRenderer", "contents"],
    ] as const) {
      if (node[key] !== undefined) {
        if (!object(node[key]) || !Array.isArray(node[key][field]))
          throw new YoutubeContractError("live", "incomplete-" + key);
        boundary = true;
        validateYoutubeItems(node[key][field], "live");
      }
    }
    if (
      node.messageRenderer ||
      node.videoRenderer ||
      node.gridVideoRenderer ||
      node.lockupViewModel
    ) {
      boundary = true;
      validateYoutubeItems([node], "live");
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) stack.push(...value);
      else if (object(value)) stack.push(value);
    }
  }
  if (!boundary) throw new YoutubeContractError("live", "unknown-content-boundary");
}
