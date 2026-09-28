export const FOLLOW_COLLECTIONS_KEY = "reelcase.follow-collections.v1";
export const FOLLOW_COLLECTIONS_CHANGED = "reelcase:follow-collections-change";

export type CreatorCollection = { id: string; name: string; followIds: string[]; createdAt: number };

export function normalizeCreatorCollections(raw: unknown): CreatorCollection[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map<string, CreatorCollection>();
  for (const value of raw.slice(0, 200)) {
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    if (typeof row.id !== "string" || !row.id.trim() || typeof row.name !== "string" || !row.name.trim() || !Array.isArray(row.followIds)) continue;
    const followIds = [...new Set(row.followIds.filter((id): id is string => typeof id === "string" && Boolean(id.trim())).slice(0, 10_000))];
    if (!followIds.length) continue;
    byId.set(row.id, { id: row.id, name: row.name.trim().slice(0, 48), followIds, createdAt: typeof row.createdAt === "number" && Number.isFinite(row.createdAt) ? row.createdAt : 0 });
  }
  return [...byId.values()];
}

export function loadCreatorCollections(): CreatorCollection[] {
  if (typeof localStorage === "undefined") return [];
  try { return normalizeCreatorCollections(JSON.parse(localStorage.getItem(FOLLOW_COLLECTIONS_KEY) ?? "[]")); }
  catch { return []; }
}

export function saveCreatorCollections(collections: CreatorCollection[]): void {
  const normalized = normalizeCreatorCollections(collections);
  try {
    localStorage.setItem(FOLLOW_COLLECTIONS_KEY, JSON.stringify(normalized));
    if (typeof window !== "undefined") window.dispatchEvent(new Event(FOLLOW_COLLECTIONS_CHANGED));
  } catch { /* The caller's session state still works. */ }
}

/** Merge by stable collection ID so a recovery pack never erases newer local groups. */
export function mergeCreatorCollections(current: CreatorCollection[], incoming: CreatorCollection[]): CreatorCollection[] {
  const byId = new Map(normalizeCreatorCollections(current).map((row) => [row.id, row]));
  for (const row of normalizeCreatorCollections(incoming)) {
    const prior = byId.get(row.id);
    byId.set(row.id, prior ? { ...prior, followIds: [...new Set([...prior.followIds, ...row.followIds])] } : row);
  }
  return [...byId.values()];
}
