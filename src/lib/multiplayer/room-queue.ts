export const ROOM_QUEUE_LIMIT = 48;
export type RoomQueueAction = { kind: "add" | "remove" | "move" | "next" | "up" | "down"; id: string; before?: string };
export function normalizeRoomQueue(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter(
          (id): id is string => typeof id === "string" && id.trim().length > 0 && id.length <= 600,
        )
        .map((id) => id.trim()),
    ),
  ].slice(0, ROOM_QUEUE_LIMIT);
}

export function distinctRoomQueue(
  ids: readonly string[],
  mediaKey: (id: string) => string | undefined,
  currentKey?: string,
): string[] {
  const seen = new Set(currentKey ? [currentKey] : []);
  return normalizeRoomQueue(ids).filter((id) => {
    const key = mediaKey(id);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export function parseRoomQueueAction(value: unknown): RoomQueueAction | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<RoomQueueAction>;
  if (
    !["add", "remove", "move", "next", "up", "down"].includes(item.kind ?? "") ||
    typeof item.id !== "string" ||
    !item.id.trim() ||
    item.id.length > 600
  )
    return null;
  if (item.before !== undefined && (typeof item.before !== "string" || item.before.length > 600))
    return null;
  return { kind: item.kind!, id: item.id.trim(), before: item.before?.trim() || undefined };
}
/** Apply a single intention to the latest host order. Concurrent guest edits
 * cannot overwrite unrelated additions with an older whole-queue snapshot. */
export function applyRoomQueueAction(
  current: readonly string[],
  action: RoomQueueAction,
): string[] {
  const rows = normalizeRoomQueue(current);
  if (action.kind === "remove") return rows.filter((id) => id !== action.id);
  if (action.kind === "up" || action.kind === "down") {
    const index = rows.indexOf(action.id);
    const destination = index + (action.kind === "up" ? -1 : 1);
    if (index < 0 || destination < 0 || destination >= rows.length) return rows;
    [rows[index], rows[destination]] = [rows[destination]!, rows[index]!];
    return rows;
  }
  if (action.kind === "next") {
    if (!rows.includes(action.id) && rows.length >= ROOM_QUEUE_LIMIT) return rows;
    return [action.id, ...rows.filter(id => id !== action.id)];
  }
  if (action.kind === "move" && !rows.includes(action.id)) return rows;
  if (action.kind === "add" && rows.includes(action.id)) return rows;
  if (action.kind === "add" && rows.length >= ROOM_QUEUE_LIMIT) return rows;
  if (action.before === action.id) return rows;
  const next = rows.filter((id) => id !== action.id);
  const position = action.before ? next.indexOf(action.before) : -1;
  next.splice(position < 0 ? next.length : position, 0, action.id);
  return next;
}

/** Shuffle the host's current bounded order, preserving every title once. */
export function shuffleRoomQueue(current: readonly string[], random = Math.random): string[] {
  const rows = normalizeRoomQueue(current);
  const original = [...rows];
  for (let i = rows.length - 1; i > 0; i--) {
    const draw = random();
    const j = Math.floor(Math.max(0, Math.min(0.999999999999, Number.isFinite(draw) ? draw : 0)) * (i + 1));
    [rows[i], rows[j]] = [rows[j]!, rows[i]!];
  }
  if (rows.length > 1 && rows.every((id, i) => id === original[i])) rows.push(rows.shift()!);
  return rows;
}
