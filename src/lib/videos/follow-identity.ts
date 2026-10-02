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

/** Provider refreshes can resolve an old handle to a channel ID or rename it.
 * Both identities must be unique; the newest supplied row retains precedence. */
export function dedupeFollows(rows: FollowedChannel[]): FollowedChannel[] {
  const ids = new Set<string>(), handles = new Set<string>(), channels = new Set<string>();
  const unique: FollowedChannel[] = [];
  for (const row of rows) {
    const id = `${row.kind}:${row.id}`;
    const handle = canonicalFollowHandle(row.kind, row.handle || row.id);
    const key = `${row.kind}:${handle}`;
    const channel = row.kind === "youtube" && !row.id.startsWith("ytpl:") && row.channelId ? row.channelId : "";
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
  return [resolved, ...rows.filter(row => {
    if (row.kind !== resolved.kind) return true;
    if (row.id === resolved.id) return false;
    if (row.kind === 'youtube' && row.channelId && !resolved.channelId) return true;
    if (row.channelId && resolved.channelId) return row.channelId !== resolved.channelId;
    return ![row.handle, row.importQuery].filter(Boolean).some(value => keys.has(canonicalFollowHandle(row.kind, value!)));
  })];
}
