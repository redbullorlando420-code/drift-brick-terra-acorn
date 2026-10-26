import type { LibraryVideo, VideoMetadataProvenance } from './types';
import { TOPIC_RULES } from './topic-rules.ts';
import { youtubeDescriptionTopics } from './youtube-text-tags.ts';

export { TOPICS } from './topic-taxonomy.ts';
import { baseCanonicalTopic } from './topic-taxonomy.ts';
import { reviewedTopic,getTopicAliasRevision,aliasTagsChanged } from './topic-aliases.ts';
export function canonicalTopic(tag:string):string|undefined { return baseCanonicalTopic(tag) ?? reviewedTopic(tag); }
export const isTopicTag = (tag: string) => Boolean(canonicalTopic(tag));

export type TopicEvidence = { topic: string; reason: string; saved: boolean };
const cache = new WeakMap<LibraryVideo, { tags: readonly string[]; aliasRevision: number; links: TopicEvidence[]; topics: string[] }>();
const legacyCache: typeof cache = new WeakMap();
const EMPTY: readonly string[] = [];
const rulesByTopic = new Map(TOPIC_RULES);
const titleEvidence=(video:LibraryVideo)=>video.remote?.kind==='youtube'?video.name.slice(0,500).replace(/#[\p{L}\p{N}_-]+/gu,''):video.name.slice(0,500);

/** Single-topic catalog scans avoid building every topic/evidence array and
 * never populate the resident per-card cache for unseen catalog entries. */
export function hasTopicForScan(video: LibraryVideo, topic: string, tags: readonly string[] = EMPTY): boolean {
  const previous = cache.get(video);
  if (previous?.tags === tags && !aliasTagsChanged(tags, previous.aliasRevision)) { previous.aliasRevision = getTopicAliasRevision(); return previous.topics.includes(topic); }
  if (tags.some(tag => canonicalTopic(tag) === topic)) return true;
  if (rulesByTopic.get(topic)?.test(`${titleEvidence(video)} ${video.genre ?? ''}`)) return true;
  return youtubeDescriptionTopics(video).some(link => link.topic === topic);
}

function resolve(video: LibraryVideo, tags: readonly string[] = EMPTY, retain = true, reviewed = true) {
  const activeCache = reviewed ? cache : legacyCache;
  const previous = activeCache.get(video);
  if (previous?.tags === tags && !aliasTagsChanged(tags, previous.aliasRevision)) { previous.aliasRevision = getTopicAliasRevision(); return previous; }
  const links = new Map<string, TopicEvidence>();
  for (const tag of tags) {
    const topic = reviewed ? canonicalTopic(tag) : baseCanonicalTopic(tag);
    if (topic) links.set(topic, { topic, reason: `Saved tag: ${tag}`, saved: true });
  }
  const text = `${titleEvidence(video)} ${video.genre ?? ''}`;
  for (const [topic, pattern] of TOPIC_RULES) {
    const match = text.match(pattern);
    if (match && !links.has(topic)) links.set(topic, { topic, reason: `Title/category: ${match[0]}`, saved: false });
  }
  if (video.remote?.kind === 'youtube') for (const link of youtubeDescriptionTopics(video)) {
    if (!links.has(link.topic)) links.set(link.topic, { ...link, saved: false });
  }
  const result = { tags, aliasRevision: getTopicAliasRevision(), links: [...links.values()], topics: [...links.keys()] };
  if (retain) activeCache.set(video, result);
  return result;
}
export const topicEvidence = (video: LibraryVideo, tags?: readonly string[], reviewed = true) => resolve(video, tags, true, reviewed).links;
/** Full-library aggregates reuse existing card evidence but never fill the
 * resident per-card cache with an object/array bundle for every catalog title. */
export const topicEvidenceForScan = (video: LibraryVideo, tags?: readonly string[]) => resolve(video, tags, false).links;
export const topicsForVideo = (video: LibraryVideo, tags?: readonly string[], reviewed = true) => resolve(video, tags, true, reviewed).topics;

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
