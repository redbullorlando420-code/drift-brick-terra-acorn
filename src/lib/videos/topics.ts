import type { LibraryVideo } from './types';

export const TOPICS = new Set(['gaming', 'technology', 'news-commentary', 'music', 'film', 'anime', 'food', 'travel', 'fitness', 'learning', 'comedy', 'relaxing', 'talk', 'commentary', 'creative', 'nature', 'business', 'style', 'motors', 'horror', 'maker', 'sports', 'science', 'relationships', 'wellbeing', 'skills', 'hardware', 'legal']);
const aliases: Record<string, string> = { tech: 'technology', coding: 'technology', programming: 'technology', cooking: 'food', recipes: 'food', automotive: 'motors', cars: 'motors', diy: 'maker', education: 'learning', meditation: 'wellbeing', football: 'sports', podcast: 'talk' };
export function canonicalTopic(tag: string): string | undefined {
  const clean = tag.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-');
  return TOPICS.has(clean) ? clean : aliases[clean];
}
export const isTopicTag = (tag: string) => Boolean(canonicalTopic(tag));

// Only specific title/category evidence. Descriptions, paths, creator names and
// generic genres must not turn promotional boilerplate into viewer interests.
const rules: Array<[string, RegExp]> = [
  ['gaming', /\b(gaming|gameplay|playthrough|speedrun|walkthrough|minecraft|fortnite|valorant|counter.strike|grand theft auto|gta [v56]|call of duty|cod zombies|elden ring|roblox|league of legends)\b/i],
  ['technology', /\b(software|programming|coding|artificial intelligence|machine learning|linux|javascript)\b/i],
  ['hardware', /\b(pc build|graphics card|gpu|cpu|keyboard|smartphone|iphone|computer hardware)\b/i],
  ['motors', /\b(dash.?cam|tesla.?cam|car repair|motorcycle|automotive|formula (one|1)|nascar)\b/i],
  ['legal', /\b(police chase|body.?cam|courtroom|lawsuit|trial verdict)\b/i],
  ['food', /\b(cooking|recipe|baking|restaurant|street food|chef)\b/i],
  ['travel', /\b(travel|vacation|bali|backpacking|road trip|walking tour)\b/i],
  ['music', /\b(music|concert|song|album|guitar|piano|dj set|karaoke)\b/i],
  ['film', /\b(movie|cinema|film review|movie trailer)\b/i],
  ['anime', /\b(anime|manga)\b/i],
  ['fitness', /\b(workout|weightlifting|fitness|pilates|yoga)\b/i],
  ['sports', /\b(football|soccer|basketball|baseball|tennis|olympics|esports)\b/i],
  ['science', /\b(physics|chemistry|astronomy|biology|space telescope|scientific)\b/i],
  ['maker', /\b(woodworking|diy|3d printing|restoration|soldering)\b/i],
  ['creative', /\b(painting|drawing|photography|sculpture|animation tutorial)\b/i],
  ['learning', /\b(tutorial|lesson|lecture|course|how to)\b/i],
  ['talk', /\b(podcast|interview|just chatting)\b/i],
  ['comedy', /\b(comedy|stand.up|sketch comedy)\b/i],
  ['nature', /\b(wildlife|birdwatching|rainforest|coral reef)\b/i],
  ['wellbeing', /\b(meditation|mental health|mindfulness)\b/i],
  ['business', /\b(entrepreneur|small business|startup funding|investing)\b/i],
  ['news-commentary', /\b(election|political|breaking news)\b/i],
];
export type TopicEvidence = { topic: string; reason: string; saved: boolean };
const cache = new WeakMap<LibraryVideo, { tags: readonly string[]; links: TopicEvidence[]; topics: string[] }>();
const EMPTY: readonly string[] = [];
function resolve(video: LibraryVideo, tags: readonly string[] = EMPTY) {
  const previous = cache.get(video);
  if (previous?.tags === tags) return previous;
  const links = new Map<string, TopicEvidence>();
  for (const tag of tags) {
    const topic = canonicalTopic(tag);
    if (topic) links.set(topic, { topic, reason: `Saved tag: ${tag}`, saved: true });
  }
  const text = `${video.name.slice(0, 500)} ${video.genre ?? ''}`;
  for (const [topic, pattern] of rules) {
    const match = text.match(pattern);
    if (match && !links.has(topic)) links.set(topic, { topic, reason: `Title/category: ${match[0]}`, saved: false });
  }
  const result = { tags, links: [...links.values()], topics: [...links.keys()] };
  cache.set(video, result);
  return result;
}
export const topicEvidence = (video: LibraryVideo, tags?: readonly string[]) => resolve(video, tags).links;
export const topicsForVideo = (video: LibraryVideo, tags?: readonly string[]) => resolve(video, tags).topics;
