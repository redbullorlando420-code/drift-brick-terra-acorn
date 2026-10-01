import type { FollowKind, FollowedChannel } from "./types";

export function canonicalFollowHandle(kind: FollowKind, raw: string): string {
  if (kind === "youtube") {
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
  const match = value.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:@|channel\/)?([^/?#]+)/i);
  return (match?.[1] ?? value).replace(/^@/, "").replace(/[^a-z0-9_-]/g, "");
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
    if (ids.has(id) || (handle && handles.has(key)) || (channel && channels.has(channel))) continue;
    ids.add(id);
    if (handle) handles.add(key);
    if (channel) channels.add(channel);
    unique.push(row);
  }
  return unique.length === rows.length ? rows : unique;
}
