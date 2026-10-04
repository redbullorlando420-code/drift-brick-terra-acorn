import type { LibraryVideo, VideoMetadataProvenance } from './types';
import { TOPIC_RULES } from './topic-rules.ts';

export const YOUTUBE_TEXT_TAG_VERSION = 2;
export const YOUTUBE_TEXT_LIMITS = { title: 500, description: 8_000, lines: 96, words: 320, tags: 24 } as const;
const STOP = new Set(('a an and are as at be been but by can could did do does for from get got had has have how i if in into is it its just like make more my new of on one or our out over part that the their them then there these they this to too up us was we were what when where which who why will with would you your about after also being between channel click creator description here next official please really subscribe through today video videos watch youtube episode full older catalog item public vod views published upload uploads').split(' '));
// Promotional sentences are excluded before either keywords or interests are
// inferred. A title remains authoritative even when a description is all ads.
const PROMO = /\b(subscribe|sponsored|sponsor|affiliate|patreon|merch|discount|promo code|coupon|copyright|all rights reserved|music (?:used|provided)|follow (?:me|us|my|our|on)|support (?:me|us|my|our)|check out (?:my|our)|social (?:media|links)|buy (?:now|here)|business (?:inquiries|enquiries))\b/i;
const ENTITIES: ReadonlyArray<readonly [string, RegExp]> = [
  ['minecraft', /\bminecraft\b/i], ['elden-ring', /\belden ring\b/i], ['grand-theft-auto', /\b(?:grand theft auto|gta [v56])\b/i],
  ['world-of-warcraft', /\bworld of warcraft\b/i], ['stardew-valley', /\bstardew valley\b/i],
  ['machine-learning', /\bmachine learning\b/i], ['artificial-intelligence', /\bartificial intelligence\b/i],
  ['3d-printing', /\b3d print(?:ing|er)?\b/i], ['pc-build', /\bpc build\b/i], ['black-holes', /\bblack holes?\b/i],
  ['meal-prep', /\bmeal prep\b/i], ['street-food', /\bstreet food\b/i], ['true-crime', /\btrue crime\b/i],
  ['javascript', /\bjavascript\b/i], ['typescript', /\btypescript\b/i], ['python', /\bpython\b/i],
  ['blender', /\bblender\b/i], ['davinci-resolve', /\bdavinci resolve\b/i], ['photoshop', /\bphotoshop\b/i],
];
type TextTags = { tags: string[]; descriptionTopics: Array<{ topic: string; reason: string }> };
const EMPTY: TextTags = { tags: [], descriptionTopics: [] };
const cache = new Map<LibraryVideo, TextTags>();
const clean = (text: string) => text.normalize('NFKC').replace(/(?:https?:\/\/|www\.)\S+|\b\S+@\S+\.\S+\b/gi, ' ').replace(/<[^>]{0,200}>/g, ' ').replace(/&(?:amp|quot|lt|gt);/g, ' ');
function words(text: string) {
  const scored = new Map<string, number>();
  for (const word of (text.toLowerCase().match(/[\p{L}][\p{L}\p{N}]*(?:[-'][\p{L}\p{N}]+)*/gu) ?? []).slice(0, YOUTUBE_TEXT_LIMITS.words)) {
    if (word.length < 3 || word.length > 32 || STOP.has(word)) continue;
    scored.set(word, (scored.get(word) ?? 0) + 1);
  }
  return [...scored].sort((a, b) => b[1] - a[1]).map(([word]) => word.replaceAll("'", ''));
}

/** Bounded CPU-only inference; retains at most 512 compact results, never
 * descriptions or token arrays. A million-row catalog cannot grow this cache. */
export function youtubeTextTags(video: LibraryVideo): TextTags {
  if (video.remote?.kind !== 'youtube') return EMPTY;
  const previous = cache.get(video); if (previous) return previous;
  const title = clean(video.name.slice(0, YOUTUBE_TEXT_LIMITS.title));
  const lines = clean((video.description ?? video.tagline ?? '').slice(0, YOUTUBE_TEXT_LIMITS.description)).split(/\r?\n/).slice(0, YOUTUBE_TEXT_LIMITS.lines);
  const content: string[] = [], chapters: string[] = [];
  for (const line of lines) {
    if (PROMO.test(line)) continue;
    const chapter = line.match(/^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}\s*[-–—|:]?\s*(.+)/);
    if (chapter) chapters.push(chapter[1]!);
    content.push(chapter ? chapter[1]! : line);
  }
  const description = content.join('\n'), text = `${title}\n${description}`;
  const descriptionTopics: TextTags['descriptionTopics'] = [];
  for (const [topic, pattern] of TOPIC_RULES) {
    const match = description.match(pattern);
    if (match) descriptionTopics.push({ topic, reason: `Description/chapter: ${match[0]}` });
    if (descriptionTopics.length >= 8) break;
  }
  const tags: string[] = [], seen = new Set<string>();
  const add = (raw: string) => {
    const tag = raw.toLowerCase().replaceAll('_', '-');
    if (!tag || tag.length > 48 || STOP.has(tag) || seen.has(tag) || tags.length >= YOUTUBE_TEXT_LIMITS.tags) return;
    seen.add(tag); tags.push(tag);
  };
  for (const match of text.matchAll(/#([\p{L}][\p{L}\p{N}_-]{2,30})/gu)) { add(match[1]!); if (tags.length >= 6) break; }
  for (const [tag, pattern] of ENTITIES) if (pattern.test(text)) add(tag);
  // Chapter labels are deliberate content phrases, unlike arbitrary adjacent
  // words in a sponsor-heavy paragraph.
  for (const chapter of chapters.slice(0, 6)) {
    const tokens = words(chapter);
    if (tokens.length >= 2 && tokens.length <= 4) add(tokens.join('-'));
  }
  const titleWords = words(title), descriptionWords = words(description);
  for (let index = 0; index < Math.max(titleWords.length, descriptionWords.length) && tags.length < YOUTUBE_TEXT_LIMITS.tags; index++) {
    if (titleWords[index]) add(titleWords[index]!);
    if (descriptionWords[index]) add(descriptionWords[index]!);
  }
  const result = { tags, descriptionTopics };
  if (cache.size >= 512) cache.delete(cache.keys().next().value!);
  cache.set(video, result); return result;
}

/** Replace only tags attributed to this provider. Manual/unknown legacy tags
 * retain priority; locked rows are untouched. Existing oversized manual rows
 * survive intact rather than silently losing saved choices. */
export function refreshYoutubeTags(current: string[], inferred: string[], provenance?: VideoMetadataProvenance, limit = 32) {
  if (provenance?.lockedFields?.includes('tags')) return current;
  const protectedTags = current.filter(tag => provenance?.tags[tag] !== 'provider:youtube');
  const next = [...new Set([...protectedTags, ...inferred])].slice(0, Math.max(limit, protectedTags.length));
  return current.length === next.length && current.every((tag, index) => tag === next[index]) ? current : next;
}
