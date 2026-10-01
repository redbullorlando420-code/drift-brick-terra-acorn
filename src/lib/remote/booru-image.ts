/** A Gelbooru-style post page can show a resized sample while linking the original. */
export function booruPostImageUrls(html: string): { original?: string; sample?: string } {
  const attribute = (markup: string, name: string) => markup.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
  const anchor = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
    .filter(match => /(?:original (?:image|file)|view (?:the )?original|download)/i.test(match[2]!.replace(/<[^>]*>/g, ' ')) || /\bdownload(?:\s|=|$)/i.test(match[1]!))
    .map((match) => attribute(match[1]!, 'href'))
    .find(Boolean);
  const imageTag = html.match(/<img\b(?=[^>]*\bid\s*=\s*["']image["'])[^>]*>/i)?.[0];
  const sample = imageTag?.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
  const file = html.match(/\bdata-(?:file-url|original(?:-url)?)\s*=\s*(["'])(.*?)\1/i)?.[2];
  const fullImage = sample && !/(?:thumb(?:nail)?s?|samples?|resized|\/preview\/)/i.test(sample) ? sample : undefined;
  return { original: (file || anchor || fullImage)?.replaceAll("&amp;", "&"), sample: sample?.replaceAll("&amp;", "&") };
}
