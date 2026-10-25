import type { LibraryVideo, VideoMetadataProvenance } from './types';
import { TOPIC_RULES } from './topic-rules.ts';

export const YOUTUBE_TEXT_TAG_VERSION = 3;
export const YOUTUBE_TEXT_LIMITS = { title: 500, description: 16_000, lines: 128, words: 480, tags: 28 } as const;
const STOP = new Set(('a an and are as at be been but by can could did do does for from get got had has have how i if in into is it its just like make more my new of on one or our out over part that the their them then there these they this to too up us was we were what when where which who why will with would you your about after also being between channel click creator description here next official please really subscribe through today video videos watch youtube episode full older catalog item public vod views published upload uploads').split(' '));
// Promotional sentences are excluded before either keywords or interests are
// inferred. A title remains authoritative even when a description is all ads.
const PROMO = /\b(subscribe|sponsored|sponsor|affiliate|patreon|merch|discount|promo code|coupon|copyright|all rights reserved|music (?:used|provided)|follow (?:me|us|my|our|on)|support (?:me|us|my|our)|check out (?:my|our)|social (?:media|links)|buy (?:now|here)|business (?:inquiries|enquiries))\b/i;
for (const word of 'best amazing awesome incredible welcome thanks thank enjoy link links discord instagram twitter facebook tiktok twitch com www intro introduction outro timestamps chapters timestamp follow daily weekly latest shorts short viral trending fyp foryou subscribe subscribers'.split(' ')) STOP.add(word);
const ENTITIES: ReadonlyArray<readonly [string, RegExp]> = [
  ['minecraft', /\bminecraft\b/i], ['elden-ring', /\belden ring\b/i], ['grand-theft-auto', /\b(?:grand theft auto|gta [v56])\b/i],
  ['world-of-warcraft', /\bworld of warcraft\b/i], ['stardew-valley', /\bstardew valley\b/i],
  ['machine-learning', /\bmachine learning\b/i], ['artificial-intelligence', /\bartificial intelligence\b/i],
  ['3d-printing', /\b3d print(?:ing|er)?\b/i], ['pc-build', /\bpc build\b/i], ['black-holes', /\bblack holes?\b/i],
  ['meal-prep', /\bmeal prep\b/i], ['street-food', /\bstreet food\b/i], ['true-crime', /\btrue crime\b/i],
  ['javascript', /\bjavascript\b/i], ['typescript', /\btypescript\b/i], ['python', /\bpython\b/i],
  ['blender', /\bblender\b/i], ['davinci-resolve', /\bdavinci resolve\b/i], ['photoshop', /\bphotoshop\b/i],
  ['iracing-arcade', /\biracing arcade\b/i], ['sim-racing', /\bsim(?:ulator)? racing\b/i],
];
export type YoutubeTagSource = 'video-tag' | 'hashtag' | 'chapter' | 'title' | 'description';
const SOURCE_PRIORITY: Record<YoutubeTagSource, number> = { 'video-tag': 5, hashtag: 4, chapter: 3, title: 2, description: 1 };
const PHRASE_ALIASES = new Map(ENTITIES.filter(([tag]) => tag.includes('-')).map(([tag]) => [tag.replaceAll('-', ''), tag]));
type TextTags = { tags: string[]; sources: Record<string, YoutubeTagSource>; descriptionTopics: Array<{ topic: string; reason: string }> };
const EMPTY: TextTags = { tags: [], sources: {}, descriptionTopics: [] };
const cache = new Map<LibraryVideo, TextTags>();
const clean = (text: string) => text.normalize('NFKC').replace(/(?:https?:\/\/|www\.)\S+|\b\S+@\S+\.\S+\b/gi, ' ').replace(/<[^>]{0,200}>/g, ' ').replace(/&(?:amp|quot|lt|gt);/g, ' ');
export function normalizeYoutubeTag(text: string) {
  let value = clean(text.slice(0, 100)).toLowerCase().trim().replace(/^#/, '').replace(/c\+\+/g, 'cplusplus').replace(/c#/g, 'csharp')
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
  value = PHRASE_ALIASES.get(value.replaceAll('-', '')) ?? value;
  if (!value || value.length > 64 || PROMO.test(value.replaceAll('-', ' '))) return '';
  const tokens = value.split('-');
  return tokens.some(token => token.length >= 2 && !STOP.has(token)) && !tokens.every(token => STOP.has(token) || /^\d+$/.test(token)) ? value : '';
}
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
  const summary = video.remote.youtubeTagSummary;
  // Browse rows retain only compact, ranked evidence. Never reread a full
  // description from disk per card just to rank or filter a large library.
  if (video.description === undefined && summary?.version === YOUTUBE_TEXT_TAG_VERSION) {
    const result = { tags: Object.keys(summary.sources), sources: summary.sources, descriptionTopics: summary.topics };
    if (cache.size >= 512) cache.delete(cache.keys().next().value!);
    cache.set(video, result); return result;
  }
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
  const keywords = (video.remote.youtubeKeywords ?? []).slice(0, 40).map(normalizeYoutubeTag).filter(Boolean);
  const descriptionTopics: TextTags['descriptionTopics'] = [];
  for (const [topic, pattern] of TOPIC_RULES) {
    const match = description.match(pattern), keyword = keywords.find(tag => pattern.test(tag.replaceAll('-', ' ')));
    if (match || keyword) descriptionTopics.push({ topic, reason: match ? `Description/chapter: ${match[0]}` : `Video tag: ${keyword}` });
    if (descriptionTopics.length >= 8) break;
  }
  const candidates = new Map<string, { source: YoutubeTagSource; score: number; order: number }>();
  const add = (raw: string, source: YoutubeTagSource, score: number) => {
    const tag = normalizeYoutubeTag(raw);
    if (!tag) return;
    const before = candidates.get(tag);
    if (!before) candidates.set(tag, { source, score, order: candidates.size });
    else candidates.set(tag, { source: SOURCE_PRIORITY[source] > SOURCE_PRIORITY[before.source] ? source : before.source, score: Math.max(score, before.score), order: before.order });
  };
  const normalizedTitle = `-${title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-')}-`;
  const normalizedDescription = `-${description.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-')}-`;
  const keywordScore = (tag: string) => normalizedTitle.includes(`-${tag}-`) ? 110 : normalizedDescription.includes(`-${tag}-`) ? 99 : 90;
  for (const tag of [...new Set(keywords)].sort((a, b) => keywordScore(b) - keywordScore(a)).slice(0, 16)) add(tag, 'video-tag', keywordScore(tag));
  let hashtags = 0;
  for (const match of text.matchAll(/#([\p{L}][\p{L}\p{N}_-]{2,48})/gu)) { add(match[1]!, 'hashtag', 100); if (++hashtags >= 12) break; }
  for (const [tag, pattern] of ENTITIES) if (pattern.test(text)) add(tag, pattern.test(title) ? 'title' : 'description', 95);
  // Chapter labels are deliberate content phrases, unlike arbitrary adjacent
  // words in a sponsor-heavy paragraph.
  for (const chapter of chapters.slice(0, 6)) {
    const tokens = (chapter.toLowerCase().match(/[\p{L}][\p{L}\p{N}-]*/gu) ?? []).filter(word => !STOP.has(word));
    if (tokens.length >= 2 && tokens.length <= 5) add(tokens.join('-'), 'chapter', 94);
  }
  const titleWords = words(title);
  for (const word of titleWords.slice(0, 12)) add(word, 'title', 75);
  const descriptionWords = words(description);
  const counts = new Map<string, number>();
  for (const word of (description.toLowerCase().match(/[\p{L}][\p{L}\p{N}]*(?:[-'][\p{L}\p{N}]+)*/gu) ?? []).slice(0, YOUTUBE_TEXT_LIMITS.words)) counts.set(word, (counts.get(word) ?? 0) + 1);
  const openingWords = new Set(words(description.slice(0, 600)).slice(0, 12));
  for (const word of descriptionWords) {
    const repeated = (counts.get(word) ?? 0) >= 2;
    if (repeated || openingWords.has(word)) add(word, 'description', repeated ? 55 : 40);
  }
  // Stable source priority prevents a keyword dump from displacing title,
  // chapter and hashtag evidence; a phrase appears only once.
  const phrases = [...candidates].filter(([tag, row]) => tag.includes('-') && row.score >= 90).map(([tag]) => new Set(tag.split('-')));
  const ranked = [...candidates].filter(([tag, row]) => row.score >= 80 || !phrases.some(tokens => tokens.has(tag)))
    .sort((a, b) => b[1].score - a[1].score || a[1].order - b[1].order).slice(0, YOUTUBE_TEXT_LIMITS.tags);
  const tags = ranked.map(([tag]) => tag), sources = Object.fromEntries(ranked.map(([tag, row]) => [tag, row.source]));
  const result = { tags, sources, descriptionTopics };
  if (cache.size >= 512) cache.delete(cache.keys().next().value!);
  cache.set(video, result); return result;
}

/** Weak extracted words should not teach as much as deliberate creator tags
 * or chapters. Explicit hearts are applied separately and retain full weight. */
export function youtubeTagWeight(video: LibraryVideo, tag: string) {
  const source = video.remote?.youtubeTagSummary?.sources[tag];
  return source === 'description' ? 0.35 : source === 'title' ? 0.8 : 1;
}

/** Topic scans need no keyword objects or title tokenization for sparse rows.
 * Compact checked cards return their persisted topic array without allocation. */
export function youtubeDescriptionTopics(video: LibraryVideo): TextTags['descriptionTopics'] {
  const remote = video.remote;
  if (remote?.kind !== 'youtube') return EMPTY.descriptionTopics;
  if (video.description === undefined && remote.youtubeTagSummary?.version === YOUTUBE_TEXT_TAG_VERSION) return remote.youtubeTagSummary.topics;
  if (!video.description && !video.tagline && !remote.youtubeKeywords?.length) return EMPTY.descriptionTopics;
  return youtubeTextTags(video).descriptionTopics;
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
