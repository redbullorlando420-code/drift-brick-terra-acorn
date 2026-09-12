/**
 * Reddit-native signals for Adult tag ingest + ranking.
 * Subreddit, flair, title tokens, and comment fetish hits — not just tube keywords.
 */

import { adultFetishTags, adultTextFetishTags } from "./adult-sites";

const STOP = new Set([
  "the", "and", "for", "with", "this", "that", "from", "your", "have", "just",
  "like", "what", "when", "here", "some", "more", "they", "them", "then", "than",
  "into", "over", "under", "about", "after", "before", "would", "could", "should",
  "really", "very", "also", "been", "were", "will", "dont", "it's", "im", "ive",
  "you", "are", "was", "but", "not", "all", "any", "can", "out", "our", "how",
  "who", "why", "her", "his", "she", "him", "its", "one", "two", "new", "old",
  "get", "got", "has", "had", "did", "too", "via", "http", "https", "www",
  "reddit", "comment", "comments", "post", "deleted", "removed", "nsfw", "sfw",
]);

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

/** Flair / Atom category that is not a generic NSFW stamp. */
export function extractRedditFlair(entryXml: string, contentHtml = ""): string {
  const blob = `${entryXml}\n${contentHtml}`;
  const terms: string[] = [];
  for (const match of blob.matchAll(/<category[^>]+term="([^"]+)"/gi)) terms.push(decode(match[1]).trim());
  for (const match of blob.matchAll(/flair[^>]*>([^<]+)</gi)) terms.push(decode(match[1]).trim());
  for (const match of blob.matchAll(/link_flair_text["']?\s*[:=]\s*["']([^"']+)/gi)) terms.push(decode(match[1]).trim());
  return (
    terms.find((term) => {
      const clean = term.toLowerCase();
      return clean.length >= 2 && clean.length <= 48 && !/^(nsfw|adult|18\+|reddit|spoiler)$/i.test(clean);
    }) ?? ""
  );
}

export function redditTitleTokens(title: string, limit = 12): string[] {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && word.length <= 28 && !STOP.has(word) && !/^\d+$/.test(word));
  return [...new Set(words)].slice(0, limit);
}

export function redditSubTags(subreddit: string): string[] {
  const raw = subreddit.trim();
  if (!raw) return [];
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const words = raw.replace(/[_-]+/g, " ");
  const out = [`source-reddit-${slug}`, `sub-${slug}`];
  out.push(...adultTextFetishTags(words, 8));
  return out;
}

export function mineRedditCommentTags(blob: string, limit = 24): string[] {
  const fetish = adultTextFetishTags(blob, limit);
  const tokens = redditTitleTokens(blob, 8);
  const merged = [...fetish];
  const seen = new Set(fetish);
  for (const token of tokens) {
    if (seen.has(token)) continue;
    seen.add(token);
    merged.push(token);
    if (merged.length >= limit) break;
  }
  return merged;
}

/** Extra ingest tags for one Reddit card (sub, flair, title, media kind). */
export function redditIngestExtras(input: {
  subreddit?: string;
  title?: string;
  flair?: string;
  mediaKind?: string;
  extraText?: string;
}): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (tag: string | undefined) => {
    const clean = tag?.trim().toLowerCase();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    out.push(clean);
  };
  for (const tag of redditSubTags(input.subreddit ?? "")) push(tag);
  if (input.flair) {
    push(input.flair);
    for (const tag of adultFetishTags([input.flair], 6)) push(tag);
  }
  for (const token of redditTitleTokens(input.title ?? "", 10)) push(token);
  if (input.mediaKind === "image") push("reddit-photo");
  if (input.mediaKind === "video") push("reddit-video");
  for (const tag of adultTextFetishTags(`${input.title ?? ""} ${input.flair ?? ""} ${input.extraText ?? ""}`, 16)) {
    push(tag);
  }
  return out.slice(0, 36);
}
