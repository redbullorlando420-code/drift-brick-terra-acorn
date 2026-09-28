/** A Gelbooru-style post page can show a resized sample while linking the original. */
export function booruPostImageUrls(html: string): { original?: string; sample?: string } {
  const anchor = [...html.matchAll(/<a\b([^>]*)>\s*(?:Original image|Click here to view the original image)\s*<\/a>/gi)]
    .map((match) => match[1]?.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2])
    .find(Boolean);
  const imageTag = html.match(/<img\b(?=[^>]*\bid\s*=\s*["']image["'])[^>]*>/i)?.[0];
  const sample = imageTag?.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
  return { original: anchor?.replaceAll("&amp;", "&"), sample: sample?.replaceAll("&amp;", "&") };
}
