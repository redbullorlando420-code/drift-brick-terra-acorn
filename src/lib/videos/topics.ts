import type { LibraryVideo, VideoMetadataProvenance } from './types';
import { TOPIC_RULES } from './topic-rules.ts';
import { youtubeDescriptionTopics } from './youtube-text-tags.ts';

export const TOPICS = new Set(['racing', 'gaming', 'technology', 'news-commentary', 'music', 'film', 'anime', 'food', 'travel', 'fitness', 'learning', 'comedy', 'relaxing', 'talk', 'commentary', 'creative', 'nature', 'business', 'style', 'motors', 'horror', 'maker', 'sports', 'science', 'relationships', 'wellbeing', 'skills', 'hardware', 'legal', 'animation', 'documentary', 'history', 'true-crime', 'photography', 'art', 'design', 'family', 'animals', 'lifestyle', 'beauty', 'fashion', 'home', 'outdoors', 'space', 'environment', 'politics', 'finance']);
const aliases: Record<string, string> = { funny:'comedy', laughs:'comedy', racing:'racing', simracing:'racing', tech: 'technology', coding: 'technology', programming: 'technology', cooking: 'food', recipes: 'food', automotive: 'motors', cars: 'motors', diy: 'maker', education: 'learning', meditation: 'wellbeing', football: 'sports', podcast: 'talk', photos: 'photography', photo: 'photography', artworks: 'art', documentaries: 'documentary', truecrime: 'true-crime', pets: 'animals', makeup: 'beauty', skincare: 'beauty', investing: 'finance', money: 'finance', hiking: 'outdoors' };
export function canonicalTopic(tag: string): string | undefined {
  const clean = tag.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-');
  return TOPICS.has(clean) ? clean : aliases[clean];
}
export const isTopicTag = (tag: string) => Boolean(canonicalTopic(tag));

export type TopicEvidence = { topic: string; reason: string; saved: boolean };
const cache = new WeakMap<LibraryVideo, { tags: readonly string[]; links: TopicEvidence[]; topics: string[] }>();
const EMPTY: readonly string[] = [];
const rulesByTopic = new Map(TOPIC_RULES);

/** Single-topic catalog scans avoid building every topic/evidence array and
 * never populate the resident per-card cache for unseen catalog entries. */
export function hasTopicForScan(video: LibraryVideo, topic: string, tags: readonly string[] = EMPTY): boolean {
  const previous = cache.get(video);
  if (previous?.tags === tags) return previous.topics.includes(topic);
  if (tags.some(tag => canonicalTopic(tag) === topic)) return true;
  if (rulesByTopic.get(topic)?.test(`${video.name.slice(0, 500)} ${video.genre ?? ''}`)) return true;
  return youtubeDescriptionTopics(video).some(link => link.topic === topic);
}

function resolve(video: LibraryVideo, tags: readonly string[] = EMPTY, retain = true) {
  const previous = cache.get(video);
  if (previous?.tags === tags) return previous;
  const links = new Map<string, TopicEvidence>();
  for (const tag of tags) {
    const topic = canonicalTopic(tag);
    if (topic) links.set(topic, { topic, reason: `Saved tag: ${tag}`, saved: true });
  }
  const text = `${video.name.slice(0, 500)} ${video.genre ?? ''}`;
  for (const [topic, pattern] of TOPIC_RULES) {
    const match = text.match(pattern);
    if (match && !links.has(topic)) links.set(topic, { topic, reason: `Title/category: ${match[0]}`, saved: false });
  }
  if (video.remote?.kind === 'youtube') for (const link of youtubeDescriptionTopics(video)) {
    if (!links.has(link.topic)) links.set(link.topic, { ...link, saved: false });
  }
  const result = { tags, links: [...links.values()], topics: [...links.keys()] };
  if (retain) cache.set(video, result);
  return result;
}
export const topicEvidence = (video: LibraryVideo, tags?: readonly string[]) => resolve(video, tags).links;
/** Full-library aggregates reuse existing card evidence but never fill the
 * resident per-card cache with an object/array bundle for every catalog title. */
export const topicEvidenceForScan = (video: LibraryVideo, tags?: readonly string[]) => resolve(video, tags, false).links;
export const topicsForVideo = (video: LibraryVideo, tags?: readonly string[]) => resolve(video, tags).topics;

/** Refresh only explicitly provider-authored interests. Unknown legacy tags,
 * manual choices, and locked fields remain the owner's saved decisions. */
export function reconcileProviderTopicTags(video: LibraryVideo, tags: string[], provenance?: VideoMetadataProvenance): string[] {
  const kind = video.remote?.kind;
  if ((kind !== 'youtube' && kind !== 'twitch') || provenance?.lockedFields?.includes('tags')) return tags;
  const evidence = new Set(topicsForVideo(video));
  const unsupported = (tag: string) => {
    const topic = canonicalTopic(tag);
    return Boolean(topic && provenance?.tags[tag] === `provider:${kind}` && !evidence.has(topic));
  };
  return tags.some(unsupported) ? tags.filter(tag => !unsupported(tag)) : tags;
}
