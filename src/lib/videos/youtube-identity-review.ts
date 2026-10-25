import { canonicalFollowHandle, confirmedYoutubeChannelId } from './follow-identity.ts';
import type { FollowedChannel } from './types';

export type YoutubeIdentityReview = { fingerprint: string; reasons: string[]; relatedIds: string[]; reviewed: boolean };
const exactId = (value: string) => /^(?:yt:)?(UC[\w-]{22})$/.exec(value)?.[1]
  ?? /^https?:\/\/(?:www\.)?youtube\.com\/channel\/(UC[\w-]{22})(?:[/?#]|$)/i.exec(value)?.[1];
const identity = confirmedYoutubeChannelId;
/** A display name need not resemble a handle. Only contradictory exact IDs,
 * or an alias/name shared by distinct confirmed channels, need a decision. */
export function youtubeIdentityReviews(follows: readonly FollowedChannel[]): Map<string, YoutubeIdentityReview> {
  const rows = follows.filter(row => row.kind === 'youtube' && !row.id.startsWith('ytpl:'));
  const groups = new Map<string, FollowedChannel[]>(), evidence = new Map<string, string[]>();
  const related = new Map<string, Set<string>>();
  const add = (row: FollowedChannel, reason: string, members: FollowedChannel[]) => {
    const reasons = evidence.get(row.id) ?? []; if (!reasons.includes(reason)) reasons.push(reason); evidence.set(row.id, reasons);
    const ids = related.get(row.id) ?? new Set<string>(); for (const member of members) ids.add(member.id); related.set(row.id, ids);
  };
  for (const row of rows) {
    const channel = identity(row);
    for (const [label, raw] of [['Saved handle', row.handle], ['Imported link', row.importQuery ?? '']] as const) {
      const supplied = exactId(raw);
      if (channel && supplied && channel !== supplied) add(row, label + ' points to a different channel ID.', [row]);
    }
    const aliases = new Set([row.handle, row.importQuery, row.title].filter(Boolean).map(value => canonicalFollowHandle('youtube', value!)).filter(Boolean));
    for (const key of aliases) { const members = groups.get(key) ?? []; members.push(row); groups.set(key, members); }
  }
  for (const members of groups.values()) {
    if (new Set(members.map(identity).filter(Boolean)).size < 2) continue;
    for (const row of members) add(row, 'A saved name or handle matches multiple confirmed channels.', members);
  }
  const byId = new Map(rows.map(row => [row.id, row])), result = new Map<string, YoutubeIdentityReview>();
  for (const row of rows) {
    const reasons = evidence.get(row.id); if (!reasons) continue;
    const ids = [...related.get(row.id)!].sort();
    // Stable, bounded change token; no credentials or catalog content retained.
    let hash = 2166136261;
    for (const id of ids) { const member = byId.get(id)!; const value = JSON.stringify([member.id, member.channelId, member.handle, member.title, member.importQuery]);
      for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619); }
    const fingerprint = 'v1:' + (hash >>> 0).toString(16) + ':' + ids.length;
    result.set(row.id, { fingerprint, reasons, relatedIds: ids.filter(id => id !== row.id).slice(0, 8), reviewed: row.identityReview?.fingerprint === fingerprint });
  }
  return result;
}
