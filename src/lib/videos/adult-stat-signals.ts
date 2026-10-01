/** Descriptors and their generated taxonomy parents are the same evidence,
 * not two independent interests. Live-room transport labels aren't interests. */
export function adultConnectionTags(tags: readonly string[], live: boolean): string[] {
  const interests = new Set<string>();
  for (const raw of tags) {
    if (!raw.startsWith("fetish-")) continue;
    let descriptor = raw.slice(7).trim().toLowerCase();
    if (!descriptor || /(?:https?|www|\.com)/.test(descriptor)) continue;
    if (/^(?:live|cam|webcam|interactive|public-room|public-chat|free-chat|online)$/.test(descriptor) || (live && descriptor === "public")) continue;
    if (descriptor === "role-play") descriptor = "roleplay";
    if (descriptor === "verified-amateur") descriptor = "verified-amateurs";
    interests.add(`fetish-${descriptor}`);
  }
  return [...interests].sort().slice(0, 12);
}

/** Exact media identities only. Shared artwork, generic provider players and
 * query-driven room endpoints can otherwise connect thousands of distinct rows. */
export function adultMediaIdentity(raw: string): string | undefined {
  const redgifs = raw.match(/https?:\/\/(?:www\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9_-]+)/i)?.[1]
    ?? raw.match(/https?:\/\/thumbs\d*\.redgifs\.com\/([a-z0-9_-]+)-(?:mobile|poster|thumb)\.(?:jpe?g|webp)/i)?.[1];
  if (redgifs) return `redgifs:${redgifs.toLowerCase()}`;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.replace(/\/+$/, "");
    if (/\.(?:mp4|webm|m4v|m3u8|jpe?g|png|webp|gif)$/i.test(path)) return `media:${host}${path}`;
    // Recognized content endpoints have their ID in the path or query. Keep
    // case and identity-bearing query values; discard only tracking parameters.
    const id = url.searchParams.get("viewkey") || url.searchParams.get("video_id");
    if (id) return `item:${host}:${id}`;
    if (/\/(?:watch|videos?|embed|ifr|view_video)\/[^/]+/i.test(path) || /\/(?:hd-porn|photo|gallery)\/[^/]+/i.test(path) || /^\/(?:\d{4,}|[a-z0-9_-]{16,})\/?$/i.test(path)) return `item:${host}${path}`;
  } catch { /* Not a public URL. */ }
  return undefined;
}
