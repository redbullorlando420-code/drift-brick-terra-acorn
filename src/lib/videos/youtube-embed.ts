/** Recover old watch/short links and malformed embed metadata without throwing
 * during player render. A saved provider ID is the strongest recovery source. */
export function youtubeEmbedUrl(base: string, savedId?: string, origin?: string): string | null {
  const valid = (value?: string | null) => value && /^[A-Za-z0-9_-]{11}$/.test(value) ? value : undefined;
  let id = valid(savedId);
  let start = 0;
  try {
    const source = new URL(base, "https://www.youtube.com");
    const host = source.hostname.toLowerCase().replace(/^www\./, "");
    if (["youtube.com", "m.youtube.com", "youtube-nocookie.com", "youtu.be"].includes(host)) {
      const parts = source.pathname.split("/").filter(Boolean);
      id ??= valid(host === "youtu.be" ? parts[0] : source.searchParams.get("v") || (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : undefined));
      const seconds = Number(source.searchParams.get("start"));
      if (Number.isFinite(seconds) && seconds > 0) start = Math.floor(seconds);
    }
  } catch { /* A valid saved ID still recovers a damaged URL. */ }
  if (!id) return null;
  const url = new URL(`https://www.youtube.com/embed/${id}`);
  for (const [key, value] of Object.entries({ autoplay: "1", rel: "0", playsinline: "1", controls: "1" })) url.searchParams.set(key, value);
  if (start) url.searchParams.set("start", String(start));
  if (origin) url.searchParams.set("origin", origin);
  return url.toString();
}
