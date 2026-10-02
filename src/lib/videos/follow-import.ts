import type { FollowKind, FollowedChannel, LibraryVideo } from './types';
import { canonicalFollowHandle } from './follow-identity.ts';
export type ImportCandidate = { query: string; kind: FollowKind };
/** CSV/newline boundaries preserve display names, including quoted commas.
 * Whitespace lists remain supported when every item is an explicit URL/@handle. */
export function parseFollowImport(value: string, kind: FollowKind): ImportCandidate[] {
  const fields: string[] = [], rows: string[][] = []; let field = '', quoted = false, row: string[] = [];
  const flush = () => { fields.push(field); row.push(field); field = ''; };
  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (char === '"' && (quoted || !field.trim())) {
      if (quoted && value[index + 1] === '"') { field += '"'; index++; }
      else quoted = !quoted;
    } else if (!quoted && /[,;\n\r\t]/.test(char)) { flush(); if (char === '\n' || char === '\r') { if (row.some(Boolean)) rows.push(row); row = []; } }
    else field += char;
  }
  flush(); if (row.some(Boolean)) rows.push(row);
  const header = rows[0]?.map(value => value.trim().replace(/^\uFEFF/, '').toLowerCase()) ?? [];
  const urlColumn = header.indexOf('channel url'), idColumn = header.indexOf('channel id');
  const table = kind === 'youtube' && (urlColumn >= 0 || idColumn >= 0);
  const entries = table ? rows.slice(1).map(row => row[urlColumn] || row[idColumn] || '') : fields;
  const queries = entries.flatMap(raw => {
    const text = raw.trim().replace(/^\uFEFF/, '').replaceAll('\\_', '_');
    const words = text.split(/\s+/).filter(Boolean);
    return kind === 'twitch' || words.length > 1 && words.every(word => /^(?:@|https?:\/\/|(?:www\.)?(?:youtube\.com|youtu\.be)\/)/i.test(word)) ? words : [text];
  }).filter(Boolean);
  const seen = new Set<string>();
  return queries.filter(query => { const key = canonicalFollowHandle(kind, query); if (seen.has(key)) return false; seen.add(key); return true; }).map(query => ({ query, kind }));
}
/** Repair only recognizable legacy whitespace fragments. Never remove follows
 * or cached media; unresolved fragments stay available for manual review. */
export function repairYoutubeImport(saved: string[], draft: string) {
  const intended = parseFollowImport(draft, 'youtube').map(row => row.query);
  const legacy = new Set(draft.split(/[\s,]+/).map(word => word.trim().replaceAll('\\_', '_').replace(/^["'([{<]+|["')\]}>.;:]+$/g, '')).filter(Boolean));
  const intendedKeys = new Set(intended.map(query => canonicalFollowHandle('youtube', query)));
  const fragments = new Set([...legacy].filter(query => !intendedKeys.has(canonicalFollowHandle('youtube', query))).map(query => canonicalFollowHandle('youtube', query)));
  if (!intended.length || !fragments.size) return { queries: saved, fragments };
  return { queries: [...new Set([...intended, ...saved.filter(query => !legacy.has(query) || intendedKeys.has(canonicalFollowHandle('youtube', query)))])], fragments };
}
export function importedFollowStub(query: string, kind: FollowKind): FollowedChannel {
  return { id: `${kind === 'youtube' ? 'yt:pending' : 'tw'}:${encodeURIComponent(canonicalFollowHandle(kind, query))}`, kind, handle: query, title: query };
}
export const verifiedYoutubeSource = (channel: FollowedChannel) => channel.kind === 'youtube' && !channel.importNeedsReview && Boolean(channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id) || channel.id.startsWith('ytpl:'));
export function youtubeFollowHealth(follows: FollowedChannel[]) {
  const rows = follows.filter(channel => channel.kind === 'youtube');
  const review = rows.filter(channel => channel.importNeedsReview).length;
  const verified = rows.filter(verifiedYoutubeSource).length;
  return { saved: rows.length, verified, review, pending: rows.length - verified - review, following: rows.length - review };
}
/** Old imports retained their synthetic word ID even after resolving an
 * unrelated real channel. Quarantine that evidence without deleting media. */
export function reviewYoutubeImport(follows: FollowedChannel[], draft: string): FollowedChannel[] {
  const { fragments } = repairYoutubeImport([], draft);
  const intended = new Set(parseFollowImport(draft, 'youtube').map(row => canonicalFollowHandle('youtube', row.query)));
  return follows.map(channel => {
    if (channel.kind !== 'youtube' || channel.importNeedsReview) return channel;
    if (channel.channelId && channel.importQuery && /^(?:@|https?:\/\/)/i.test(channel.importQuery)) return channel;
    const legacyId = channel.id.replace(/^yt:/, '');
    const legacyWord = fragments.has(legacyId) && !/^UC[\w-]{20,}$/.test(legacyId);
    const importedFragment = Boolean(channel.importQuery && fragments.has(canonicalFollowHandle('youtube', channel.importQuery)));
    const unresolvedFragment = !channel.channelId && fragments.has(canonicalFollowHandle('youtube', channel.handle));
    const intendedMatch = [channel.importQuery, channel.handle, channel.title].some(value => value && intended.has(canonicalFollowHandle('youtube', value)));
    return !intendedMatch && (legacyWord || importedFragment || unresolvedFragment) ? { ...channel, importNeedsReview: true } : channel;
  });
}
export function bindYoutubeCorrection<T extends { channel: FollowedChannel; videos: LibraryVideo[] }>(result: T, source: FollowedChannel, query: string): T {
  return { ...result, channel: { ...result.channel, id: source.id, importQuery: query, importNeedsReview: undefined }, videos: result.videos.map(video => ({ ...video, folderId: source.id })) };
}
/** Unique verified display names can identify saved creators too. Do not
 * create a second unresolved stub just because their public handle differs. */
export function resolvedFollowQueries(follows: FollowedChannel[], kind: FollowKind): Set<string> {
  const keys = new Set<string>(), titles = new Map<string, number>();
  for (const channel of follows) {
    if (channel.kind !== kind || channel.importNeedsReview || !(kind === 'twitch' ? channel.lastCheckedAt : verifiedYoutubeSource(channel))) continue;
    keys.add(canonicalFollowHandle(kind, channel.handle));
    if (channel.importQuery) keys.add(canonicalFollowHandle(kind, channel.importQuery));
    const title = canonicalFollowHandle(kind, channel.title);
    if (title) titles.set(title, (titles.get(title) ?? 0) + 1);
  }
  if (kind === 'youtube') for (const [title, count] of titles) if (count === 1) keys.add(title);
  return keys;
}
