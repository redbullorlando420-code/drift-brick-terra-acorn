import { retainTwitchPullPolicy } from './twitch-pull-policy.ts';
import type { FollowKind, FollowedChannel } from "./types";

export function canonicalFollowHandle(kind: FollowKind, raw: string): string {
  const original = raw.trim().replaceAll('\\_', '_');
  if (kind === "youtube") {
    const channelId = original.match(/^(?:yt:)?(UC[A-Za-z0-9_-]{22})$/)?.[1] ?? original.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})(?:[/?#]|$)/i)?.[1];
    if (channelId) return `channel:${channelId}`;
    try {
      const url = new URL(raw.trim());
      const playlist = url.searchParams.get("list");
      if (/(^|\.)youtube\.com$/i.test(url.hostname) && playlist && /^[a-z0-9_-]{10,80}$/i.test(playlist)) return `playlist:${playlist}`;
    } catch { /* A channel handle is not necessarily a URL. */ }
  }
  const value = raw.trim().replaceAll("\\_", "_").toLowerCase();
  if (kind === "twitch") {
    const match = value.match(/(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([^/?#]+)/i);
    return (match?.[1] ?? value.replace(/^tw:/, "")).replace(/^@/, "").replace(/[^a-z0-9_]/g, "");
  }
  const match = value.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@|c\/|user\/)?([^/?#]+)/i);
  return (match?.[1] ?? value).normalize('NFKC').replace(/^@/, "").replace(/\s+/g, ' ');
}

/** Legacy follows may retain their exact provider ID only in the source key. */
export function confirmedYoutubeChannelId(row: FollowedChannel): string | undefined {
  if (row.kind !== 'youtube' || row.id.startsWith('ytpl:')) return;
  return row.channelId || /^yt:(UC[\w-]{22})$/.exec(row.id)?.[1];
}

/** Provider refreshes can resolve an old handle to a channel ID or rename it.
 * Both identities must be unique; the newest supplied row retains precedence. */
export function dedupeFollows(rows: FollowedChannel[]): FollowedChannel[] {
  const ids = new Set<string>(), handles = new Set<string>(), channels = new Set<string>();
  const unique: FollowedChannel[] = [];
  for (const row of rows) {
    const id = `${row.kind}:${row.id}`;
    const handle = canonicalFollowHandle(row.kind, row.handle || row.id);
    const key = `${row.kind}:${handle}`;
    const channel = confirmedYoutubeChannelId(row) ?? "";
    // Confirmed distinct channel IDs take precedence over display-name/handle
    // collisions. Only unverified aliases may collapse by their query.
    const handleKey = channel ? `${key}:${channel}` : key;
    if (ids.has(id) || (handle && handles.has(handleKey)) || (channel && channels.has(channel))) continue;
    ids.add(id);
    if (handle) handles.add(handleKey);
    if (channel) channels.add(channel);
    unique.push(row);
  }
  return unique.length === rows.length ? rows : unique;
}

/** Resolution replaces its pending query, while confirmed provider identities
 * remain authoritative even when two channels share a display name. */
export function mergeResolvedFollow(rows: FollowedChannel[], resolved: FollowedChannel): FollowedChannel[] {
  const keys = new Set([resolved.handle, resolved.importQuery].filter(Boolean).map(value => canonicalFollowHandle(resolved.kind, value!)));
  const ambiguous = new Set<string>();
  const resolvedChannel = resolved.kind === 'youtube' ? confirmedYoutubeChannelId(resolved) : resolved.channelId;
  if (resolved.kind === 'youtube' && resolvedChannel) for (const key of keys) {
    const channels = new Set([resolvedChannel]);
    for (const row of rows) if (confirmedYoutubeChannelId(row) && [row.handle, row.importQuery, row.title].some(value => value && canonicalFollowHandle('youtube', value) === key)) channels.add(confirmedYoutubeChannelId(row)!);
    if (channels.size > 1) ambiguous.add(key);
  }
  const owner=rows.find(row=>row.kind===resolved.kind && (row.id===resolved.id || row.channelId && row.channelId===resolved.channelId || !row.channelId && keys.has(canonicalFollowHandle(row.kind,row.handle))));
  resolved=retainTwitchPullPolicy(owner,resolved);
  return [resolved, ...rows.filter(row => {
    if (row.kind !== resolved.kind) return true;
    if (row.id === resolved.id) return false;
    const channel = row.kind === 'youtube' ? confirmedYoutubeChannelId(row) : row.channelId;
    if (row.kind === 'youtube' && channel && !resolvedChannel) return true;
    if (channel && resolvedChannel) return channel !== resolvedChannel;
    if (row.kind === 'youtube' && !channel && [row.handle, row.importQuery].some(value => value && ambiguous.has(canonicalFollowHandle('youtube', value)))) return true;
    return ![row.handle, row.importQuery].filter(Boolean).some(value => keys.has(canonicalFollowHandle(row.kind, value!)));
  })];
}
