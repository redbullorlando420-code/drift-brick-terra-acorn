/**
 * Reddit Atom/RSS media extraction.
 * The feed's [link] is often a gallery, redgifs, or v.redd.it page — not a
 * direct file. Pull every preview / i.redd.it / imgur / redgifs / v.redd.it
 * URL out of the entry so Adult cards show real photos and video posters.
 */

export type RedditMediaKind = "image" | "video" | "page";

export type RedditMedia = {
  kind: RedditMediaKind;
  /** Best still for the card (full-size when we can upgrade a preview). */
  poster?: string;
  /** Direct image or playable gif when available. */
  src?: string;
  /** Watch / embed page for redgifs, v.redd.it, galleries. */
  watch?: string;
};

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#32;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function upgradePreview(url: string): string {
  let next = url.replace(/&amp;/g, "&");
  if (/preview\.redd\.it|external-preview\.redd\.it/i.test(next)) {
    next = next.replace(/[?&]width=\d+/ig, "").replace(/[?&]height=\d+/ig, "");
    const join = next.includes("?") ? "&" : "?";
    next = `${next}${join}width=640&auto=webp`;
  }
  return next;
}

function isImageHost(url: string): boolean {
  return (
    /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url)
    || /(?:^|\/\/)(?:i\.redd\.it|preview\.redd\.it|external-preview\.redd\.it|i\.imgur\.com|i\.redgifs\.com|thumbs\d*\.redgifs\.com|media\.redgifs\.com|i\.ibb\.co|pbs\.twimg\.com)\//i.test(url)
  );
}

function isVideoHost(url: string): boolean {
  return /(?:^|\/\/)(?:v\.redd\.it|www\.redgifs\.com|redgifs\.com|gfycat\.com|i\.redgifs\.com|media\.redgifs\.com)\//i.test(url)
    || /\.(mp4|webm|gifv)(\?|$)/i.test(url);
}

function isJunkLink(url: string): boolean {
  return /icanhazchat|reddithelp\.com|redditstatic\.com|\/faq|sidebar rules|welcome\?gonewild/i.test(url);
}

function collectUrls(entryXml: string, contentHtml: string): string[] {
  const blob = `${entryXml}\n${contentHtml}`;
  const found: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const url = decode(raw).trim();
    if (!url.startsWith("http")) return;
    if (seen.has(url)) return;
    seen.add(url);
    found.push(url);
  };
  for (const match of blob.matchAll(/<media:thumbnail[^>]+url="([^"]+)"/gi)) push(match[1]);
  for (const match of blob.matchAll(/<media:content[^>]+url="([^"]+)"/gi)) push(match[1]);
  for (const match of blob.matchAll(/<img[^>]+src="([^"]+)"/gi)) push(match[1]);
  for (const match of blob.matchAll(/<a href="(https?:[^"]+)">\s*\[link\]/gi)) push(match[1]);
  for (const match of blob.matchAll(/https?:\/\/(?:i|preview|external-preview)\.redd\.it\/[^\s"'<]+/gi)) push(match[0]);
  for (const match of blob.matchAll(/https?:\/\/(?:i\.)?imgur\.com\/[^\s"'<]+/gi)) push(match[0]);
  for (const match of blob.matchAll(/https?:\/\/(?:www\.)?redgifs\.com\/[^\s"'<]+/gi)) push(match[0]);
  for (const match of blob.matchAll(/https?:\/\/v\.redd\.it\/[^\s"'<]+/gi)) push(match[0]);
  return found;
}

export function extractRedditMedia(entryXml: string, contentHtml: string): RedditMedia {
  const urls = collectUrls(entryXml, contentHtml);
  const images = urls.filter((url) => isImageHost(url) && !isJunkLink(url)).map(upgradePreview);
  const videos = urls.filter((url) => isVideoHost(url) && !isJunkLink(url));
  const pages = urls.filter((url) => /reddit\.com\/gallery\//i.test(url) || /reddit\.com\/r\/[^/]+\/comments\//i.test(url));

  const poster = images.find((url) => /i\.redd\.it/i.test(url))
    ?? images.find((url) => /preview\.redd\.it/i.test(url))
    ?? images.find((url) => /i\.imgur\.com/i.test(url))
    ?? images[0];

  if (videos.length) {
    return {
      kind: "video",
      poster,
      src: videos.find((url) => /\.(mp4|webm|gifv)(\?|$)/i.test(url)),
      watch: videos[0],
    };
  }
  if (poster) {
    return {
      kind: "image",
      poster,
      src: /i\.redd\.it|i\.imgur\.com|\.(jpe?g|png|gif|webp)(\?|$)/i.test(poster) ? poster : poster,
      watch: pages[0],
    };
  }
  return { kind: "page", watch: pages[0] };
}

export function shouldKeepRedditEntry(media: RedditMedia, title: string): boolean {
  if (media.kind === "image" || media.kind === "video") return true;
  if (/welcome|faq|sidebar|chatters|on cam/i.test(title)) return false;
  return false;
}
