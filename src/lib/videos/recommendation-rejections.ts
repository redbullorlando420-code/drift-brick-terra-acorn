import type { LibraryVideo } from './types';
import { canonicalTopic, topicEvidenceForScan } from './topics.ts';

export const REJECTION_LIMIT = 512;
export type RejectionScope = 'title' | 'creator' | 'topic';
export type RecommendationRejection = { scope: RejectionScope; target: string; label: string; at: number };
export type RejectionLedger = { version: 1; updatedAt: number; entries: RecommendationRejection[] };
export const EMPTY_REJECTIONS: RejectionLedger = { version: 1, updatedAt: 0, entries: [] };
export const rejectionKey = (entry: Pick<RecommendationRejection, 'scope' | 'target'>) => entry.scope + ':' + entry.target;
export function titleRejectionTarget(video: LibraryVideo) {
  return video.remote?.videoId ? video.remote.kind + ':' + video.remote.videoId : 'local:' + video.id;
}
export function creatorRejectionTarget(video: LibraryVideo): string | undefined {
  if (!video.remote) return video.folderId ? 'local:' + video.folderId : undefined;
  const creator = video.remote.channelId || video.remote.channelName?.trim().toLowerCase();
  return creator ? video.remote.kind + ':' + creator : undefined;
}
export function isRejectionLedger(raw: unknown): raw is RejectionLedger {
  const value = raw as Partial<RejectionLedger> | undefined;
  return Boolean(value && value.version === 1 && Number.isSafeInteger(value.updatedAt) && value.updatedAt! >= 0 && Array.isArray(value.entries));
}
export function normalizeRejections(raw: unknown): RejectionLedger {
  const value = raw as Partial<RejectionLedger> | undefined;
  if (!isRejectionLedger(value)) return EMPTY_REJECTIONS;
  const entries = new Map<string, RecommendationRejection>();
  // A feedback import cannot grow work or memory without bound.
  for (const row of value.entries.slice(0, REJECTION_LIMIT * 2)) {
    if (!row || !['title', 'creator', 'topic'].includes(row.scope) || typeof row.target !== 'string' || !row.target.trim() || row.target.length > 500 || typeof row.label !== 'string' || !Number.isSafeInteger(row.at) || row.at < 0) continue;
    if (row.scope === 'topic' && canonicalTopic(row.target) !== row.target) continue;
    const key = rejectionKey(row), old = entries.get(key);
    if (!old || row.at >= old.at) entries.set(key, { scope: row.scope, target: row.target, label: row.label.slice(0, 160), at: row.at });
  }
  return { version: 1, updatedAt: value.updatedAt!, entries: [...entries.values()].sort((a,b) => b.at-a.at || rejectionKey(a).localeCompare(rejectionKey(b))).slice(0, REJECTION_LIMIT) };
}
/** Whole-ledger timestamps retain removals too, so an older mirror cannot resurrect Undo. */
export function newestRejections(a: unknown, b: unknown): RejectionLedger {
  const left = normalizeRejections(a), right = normalizeRejections(b);
  return right.updatedAt >= left.updatedAt ? right : left;
}
export function changeRejection(ledger: RejectionLedger, entry: RecommendationRejection, remove = false, now = Date.now()): RejectionLedger {
  const key = rejectionKey(entry), present = ledger.entries.some(row => rejectionKey(row) === key);
  if (remove && !present || !remove && present) return ledger;
  if (!remove && ledger.entries.length >= REJECTION_LIMIT) throw new Error('The 512-choice limit is reached. Undo an existing choice before adding another.');
  return normalizeRejections({ version: 1, updatedAt: Math.max(now, ledger.updatedAt + 1), entries: remove ? ledger.entries.filter(row => rejectionKey(row) !== key) : [{ ...entry, at: now }, ...ledger.entries] });
}
export type RejectionProtection = { favorite?: boolean; creatorFavorite?: boolean; tagIsLiked?: (topic: string) => boolean };
/** Soft, bounded ranking evidence only. Title rejections never train creator/topic affinity. */
export function createRejectionPenalty(raw?: RejectionLedger) {
  const ledger = normalizeRejections(raw), titles = new Set<string>(), creators = new Set<string>(), topics = new Set<string>();
  for (const row of ledger.entries) (row.scope === 'title' ? titles : row.scope === 'creator' ? creators : topics).add(row.target);
  if (!ledger.entries.length) return (_video: LibraryVideo, _tags?: readonly string[], _protection?: RejectionProtection) => 0;
  return (video: LibraryVideo, tags?: readonly string[], protection: RejectionProtection = {}) => {
    if (protection.favorite || protection.creatorFavorite) return 0;
    let penalty = titles.has(titleRejectionTarget(video)) ? 40 : 0;
    const creator = creatorRejectionTarget(video);
    if (creator && creators.has(creator)) penalty += 24;
    if (topics.size && topicEvidenceForScan(video, tags).some(link => topics.has(link.topic) && !protection.tagIsLiked?.(link.topic))) penalty += 16;
    return Math.min(64, penalty);
  };
}
