export type TwitchClipCursor = { after: string };

/** Clip cursors are small provider state, not a durable copy of clip rows. */
export function decodeTwitchClipCursor(raw?: string): TwitchClipCursor | undefined {
  if (!raw || raw.length > 8_192) return undefined;
  try {
    const value = JSON.parse(raw) as { v?: unknown; after?: unknown };
    if (value.v !== 1 || typeof value.after !== 'string' || !value.after || value.after.length > 4_096) return undefined;
    return { after: value.after };
  } catch {
    return undefined;
  }
}

export function encodeTwitchClipCursor(cursor?: TwitchClipCursor | null): string | undefined {
  return cursor ? JSON.stringify({ v: 1, after: cursor.after }) : undefined;
}

/** Only publish a cursor when Twitch confirmed another distinct page. */
export function advanceTwitchClipCursor(hasNextPage: boolean, endCursor: string | null, previous?: TwitchClipCursor): TwitchClipCursor | undefined {
  if (!hasNextPage || !endCursor || endCursor === previous?.after) return undefined;
  return { after: endCursor };
}
