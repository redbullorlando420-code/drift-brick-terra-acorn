/** Small metadata records only; files and print blobs stay in their own stores. */
export type LocalItem = {
  name: string;
  path: string;
  size: number;
  addedAt: number;
  launchUrl?: string;
  iconData?: string;
  id?: string;
  sampleSrc?: string;
};

export type HubStore = { prints: LocalItem[]; games: LocalItem[] };

function localItem(value: unknown): value is LocalItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.name === "string" &&
    !!row.name.trim() &&
    typeof row.path === "string" &&
    !!row.path.trim() &&
    typeof row.size === "number" &&
    Number.isFinite(row.size) &&
    row.size >= 0 &&
    typeof row.addedAt === "number" &&
    Number.isFinite(row.addedAt) &&
    row.addedAt >= 0 &&
    ["launchUrl", "iconData", "id", "sampleSrc"].every(
      (key) => row[key] === undefined || typeof row[key] === "string",
    )
  );
}

/** Read defensively without rewriting or discarding the original saved record. */
export function readHubStore(value: unknown, fallback: HubStore): HubStore {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const row = value as Record<string, unknown>;
  return {
    prints: Array.isArray(row.prints) ? row.prints.filter(localItem) : fallback.prints,
    games: Array.isArray(row.games) ? row.games.filter(localItem) : fallback.games,
  };
}
