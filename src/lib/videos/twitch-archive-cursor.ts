export type TwitchArchiveStage = "ARCHIVE" | "HIGHLIGHT" | "UPLOAD";
export type TwitchArchiveCursor = { stage: TwitchArchiveStage; after: string | null };

const stages: TwitchArchiveStage[] = ["ARCHIVE", "HIGHLIGHT", "UPLOAD"];

/** Keep the persisted provider cursor small and reject malformed saved values. */
export function decodeTwitchArchiveCursor(raw?: string): TwitchArchiveCursor {
  if (!raw || raw.length > 16_384) return { stage: "ARCHIVE", after: null };
  try {
    const value = JSON.parse(raw) as { v?: unknown; stage?: unknown; after?: unknown };
    if (value.v !== 1 || !stages.includes(value.stage as TwitchArchiveStage)) return { stage: "ARCHIVE", after: null };
    if (value.after !== null && (typeof value.after !== "string" || value.after.length > 4096)) return { stage: "ARCHIVE", after: null };
    return { stage: value.stage as TwitchArchiveStage, after: value.after as string | null };
  } catch {
    return { stage: "ARCHIVE", after: null };
  }
}

export function encodeTwitchArchiveCursor(cursor?: TwitchArchiveCursor | null): string | undefined {
  return cursor ? JSON.stringify({ v: 1, stage: cursor.stage, after: cursor.after }) : undefined;
}

/** Advance only after a valid page has been read. A terminal page moves to the
 * next public shelf; the final shelf marks the channel exhausted. */
export function advanceTwitchArchiveCursor(
  cursor: TwitchArchiveCursor,
  hasNextPage: boolean,
  endCursor: string | null,
): TwitchArchiveCursor | null {
  if (hasNextPage && endCursor && endCursor !== cursor.after) return { ...cursor, after: endCursor };
  if (hasNextPage) return cursor;
  const next = stages[stages.indexOf(cursor.stage) + 1];
  return next ? { stage: next, after: null } : null;
}
