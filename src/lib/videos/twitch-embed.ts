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
  parentHost: string | readonly string[],
): string | null {
  const parents = [...new Set((typeof parentHost === 'string' ? [parentHost] : parentHost).map(normalizeTwitchParent).filter((host): host is string => Boolean(host)))];
  if (!parents.length) return null;
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
      if (host !== "twitch.tv") continue;
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
  url.protocol = "https:"; url.port = ""; url.username = ""; url.password = "";
  url.searchParams.delete("parent");
  for (const parent of parents) url.searchParams.append("parent", parent);
  url.searchParams.set("autoplay", "true");
  return url.toString();
}

/** A parent is the actual embedding hostname, never a room host supplied by a peer. */
export function normalizeTwitchParent(value: string): string | undefined {
  if (!value || /[\s/\\?#@]/.test(value)) return;
  try { const url = new URL('https://' + value); if (url.port || url.hostname !== url.host) return; return url.hostname.toLowerCase(); } catch { return; }
}
export function twitchEmbedContext(protocol: string, hostname: string, ancestorOrigins: readonly string[] = []) {
  const own = normalizeTwitchParent(hostname), parents = own ? [own] : [];
  for (const origin of ancestorOrigins.slice(0, 12)) {
    try { const url = new URL(origin); if (!['http:', 'https:'].includes(url.protocol)) continue; const host = normalizeTwitchParent(url.hostname); if (host && !parents.includes(host)) parents.push(host); } catch { /* Invalid ancestor metadata is ignored. */ }
  }
  const loopback = Boolean(own && /^(?:localhost|.*\.localhost|127(?:\.\d{1,3}){3}|\[::1\])$/i.test(own));
  return { parents, blocked: !own ? 'parent' as const : protocol !== 'https:' && !(protocol === 'http:' && loopback) ? 'https' as const : undefined };
}
export function currentTwitchEmbedContext() {
  if (typeof window === 'undefined') return twitchEmbedContext('', '');
  const ancestors = Array.from(window.location.ancestorOrigins ?? []);
  if (!ancestors.length && window.self !== window.top && document.referrer) { try { ancestors.push(new URL(document.referrer).origin); } catch { /* No usable referrer. */ } }
  return twitchEmbedContext(window.location.protocol, window.location.hostname, ancestors);
}
