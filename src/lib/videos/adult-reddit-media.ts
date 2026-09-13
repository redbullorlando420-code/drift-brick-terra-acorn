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
  /** Stable direct posters for media-hosted Redgifs posts. */
  thumbFallbacks?: string[];
};

function decode(value: string) {
  let decoded = value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#32;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  // Atom HTML is commonly entity-escaped twice (`&amp;amp;`) in preview URLs.
  for (let pass = 0; pass < 2 && /&(?:amp|quot|lt|gt|#\d+|#x[\da-f]+);/i.test(decoded); pass += 1) {
    decoded = decoded.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  }
  return decoded;
}

function upgradePreview(url: string): string {
  let next = url.replace(/&amp;/g, "&");
  if (/preview\.redd\.it|external-preview\.redd\.it/i.test(next)) {
    // Preserve Reddit's signed crop token while replacing only the cheap
    // display dimensions. Multiple `width` parameters made some CDN edges
    // return a tiny placeholder instead of the actual post preview.
    next = next.replace(/([?&])(?:width|height)=\d+&?/ig, "$1").replace(/[?&]$/, "");
    const join = next.includes("?") ? "&" : "?";
    next = `${next}${join}width=960&auto=webp`;
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

function redgifsSlugFromUrl(raw: string): string | undefined {
  const watch = raw.match(/https?:\/\/(?:www\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9_-]+)/i)?.[1];
  if (watch) return watch;
  const thumb = raw.match(/https?:\/\/thumbs\d*\.redgifs\.com\/([a-z0-9_-]+)-(?:mobile|poster|thumb)\.(?:jpe?g|webp)/i)?.[1];
  if (thumb) return thumb;
  return raw.match(/https?:\/\/(?:i|media)\.redgifs\.com\/([a-z0-9_-]+)(?:[._-]|$)/i)?.[1];
}

function redgifsThumbFallbacks(urls: string[]): { thumbs: string[]; watch?: string } {
  const out: string[] = [];
  const seen = new Set<string>();
  let watch: string | undefined;
  for (const raw of urls) {
    const slug = redgifsSlugFromUrl(raw);
    if (!slug) continue;
    watch ??= `https://www.redgifs.com/watch/${slug}`;
    for (const candidate of [
      `https://thumbs2.redgifs.com/${slug}-mobile.jpg`,
      `https://thumbs2.redgifs.com/${slug}-poster.jpg`,
      `https://thumbs2.redgifs.com/${slug}-thumb.jpg`,
      `https://thumbs1.redgifs.com/${slug}-mobile.jpg`,
      `https://thumbs1.redgifs.com/${slug}-poster.jpg`,
    ]) {
      if (!seen.has(candidate)) {
        seen.add(candidate);
        out.push(candidate);
      }
    }
  }
  return { thumbs: out, watch };
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
  // Reddit changes feed markup frequently. Capture normal post links, lazy
  // image attributes, source tags, and quoted URLs instead of depending on
  // the old literal "[link]" anchor shape.
  for (const match of blob.matchAll(/<(?:a|img|source|video)[^>]+(?:href|src|data-url|data-lazy-src|data-preview-url)="(https?:[^"]+)"/gi)) push(match[1]);
  for (const match of blob.matchAll(/https?:\\\/\\\/(?:i|preview|external-preview)\\\.redd\\\.it\\\/[^\s"'<]+/gi)) push(match[0].replace(/\\\//g, "/"));
  for (const match of blob.matchAll(/https?:\/\/(?:i|preview|external-preview)\.redd\.it\/[^\s"'<]+/gi)) push(match[0]);
  for (const match of blob.matchAll(/https?:\/\/(?:i\.)?imgur\.com\/[^\s"'<]+/gi)) push(match[0]);
  for (const match of blob.matchAll(/https?:\/\/(?:www\.)?redgifs\.com\/[^\s"'<]+/gi)) push(match[0]);
  for (const match of blob.matchAll(/https?:\/\/v\.redd\.it\/[^\s"'<]+/gi)) push(match[0]);
  for (const match of blob.matchAll(/https?:\/\/(?:i\.)?redd\.it\/[^\s"'<]+/gi)) push(match[0]);
  for (const match of blob.matchAll(/https?:\/\/[^\s"'<]+\.(?:jpe?g|png|gif|webp|mp4|webm)(?:\?[^\s"'<]*)?/gi)) push(match[0]);
  return found;
}

export function extractRedditMedia(entryXml: string, contentHtml: string): RedditMedia {
  const urls = collectUrls(entryXml, contentHtml);
  const images = urls.filter((url) => isImageHost(url) && !isJunkLink(url)).map(upgradePreview);
  const videos = urls.filter((url) => isVideoHost(url) && !isJunkLink(url));
  const pages = urls.filter((url) => /reddit\.com\/gallery\//i.test(url) || /reddit\.com\/r\/[^/]+\/comments\//i.test(url));
  const redgifs = redgifsThumbFallbacks([...urls, ...videos]);
  const redgifsThumbs = redgifs.thumbs;

  const poster = images.find((url) => /i\.redd\.it/i.test(url))
    ?? images.find((url) => /preview\.redd\.it/i.test(url))
    ?? images.find((url) => /i\.imgur\.com/i.test(url))
    ?? images[0];

  if (videos.length) {
    return {
      kind: "video",
      poster,
      src: videos.find((url) => /\.(mp4|webm|gifv)(\?|$)/i.test(url)),
      watch: videos[0] ?? redgifs.watch,
      thumbFallbacks: [poster, ...redgifsThumbs].filter((url): url is string => Boolean(url)),
    };
  }
  if (poster) {
    return {
      kind: "image",
      poster,
      src: /i\.redd\.it|i\.imgur\.com|\.(jpe?g|png|gif|webp)(\?|$)/i.test(poster) ? poster : poster,
      watch: pages[0] ?? redgifs.watch,
      thumbFallbacks: [poster, ...redgifsThumbs].filter((url): url is string => Boolean(url)),
    };
  }
  // A Redgifs thumbnail or direct CDN asset can arrive without the linked
  // watch page in Atom. Rebuild its canonical page so the card gets dual
  // Reddit + Redgifs attribution, an iframe fallback, and stable posters.
  if (redgifs.watch) return { kind: "video", watch: redgifs.watch, thumbFallbacks: redgifsThumbs };
  return { kind: "page", watch: pages[0] };
}

export function shouldKeepRedditEntry(media: RedditMedia, title: string): boolean {
  if (media.kind === "image" || media.kind === "video") return true;
  if (/welcome|faq|sidebar|chatters|on cam/i.test(title)) return false;
  return false;
}
