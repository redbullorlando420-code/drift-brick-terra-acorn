import type { RemoteRef } from "@/lib/videos/types";

function twitchVodEmbedId(value: string): string {
  const clean = value.trim();
  if (!clean) return "";
  // Twitch catalog/GQL returns a bare numeric ID, while its embed endpoint
  // explicitly requires a VOD value such as "v40464143".
  return /^\d+$/.test(clean) ? `v${clean}` : clean;
}

/**
 * Build Twitch's documented embed route from current catalog metadata. Older
 * history cards can retain a normal twitch.tv watch URL, which Twitch refuses
 * to frame. This converts those records to player/clips endpoints and sends
 * precisely the page host required by Twitch's parent check.
 */
export function twitchEmbedUrl(
  remote: Pick<RemoteRef, "embedUrl" | "watchUrl" | "videoId">,
  parentHost: string,
): string | null {
  const parent = parentHost.trim().toLowerCase();
  if (!parent) return null;
  const candidates = [remote.embedUrl, remote.watchUrl].filter((value): value is string => Boolean(value?.trim()));
  let url: URL | undefined;

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "player.twitch.tv" || host === "clips.twitch.tv") {
        url = parsed;
        if (host === "player.twitch.tv") {
          const video = url.searchParams.get("video");
          if (video) url.searchParams.set("video", twitchVodEmbedId(video));
        }
        break;
      }
      if (!host.endsWith("twitch.tv")) continue;
      const videoId = parsed.pathname.match(/\/videos\/([0-9]+)/i)?.[1];
      const clip = parsed.pathname.match(/\/clip\/([^/?#]+)/i)?.[1];
      const channel = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId) url = new URL(`https://player.twitch.tv/?video=${encodeURIComponent(twitchVodEmbedId(videoId))}`);
      else if (clip) url = new URL(`https://clips.twitch.tv/embed?clip=${encodeURIComponent(clip)}`);
      else if (channel) url = new URL(`https://player.twitch.tv/?channel=${encodeURIComponent(channel)}`);
      if (url) break;
    } catch {
      // Try the next provider field; malformed cached history must not crash
      // the player overlay.
    }
  }

  if (!url && remote.videoId) {
    url = /^\d+$/.test(remote.videoId)
      ? new URL(`https://player.twitch.tv/?video=${encodeURIComponent(twitchVodEmbedId(remote.videoId))}`)
      : new URL(`https://clips.twitch.tv/embed?clip=${encodeURIComponent(remote.videoId)}`);
  }
  if (!url) return null;
  url.searchParams.delete("parent");
  url.searchParams.set("parent", parent);
  url.searchParams.set("autoplay", "true");
  return url.toString();
}
