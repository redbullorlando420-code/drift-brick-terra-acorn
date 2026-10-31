export function spotifyShortcut(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.hostname !== "open.spotify.com" ||
      url.port ||
      url.username ||
      url.password
    )
      return;
    const path = url.pathname.match(
      /^\/(?:intl-[a-z]{2}\/)?(playlist|album|artist)\/([a-zA-Z0-9]{22})\/?$/,
    );
    if (path) return `https://open.spotify.com/${path[1]}/${path[2]}`;
  } catch {
    /* invalid URL */
  }
}

export const SPOTIFY_SHORTCUTS_KEY = "reelcase.spotify.shortcuts.v2";
export type SpotifyShortcuts = { version: 2; selected: string; imports: string[] };
export function readSpotifyShortcuts(
  value: unknown,
  legacyImports: unknown,
  legacySelected: unknown,
): SpotifyShortcuts {
  const current =
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as { version?: unknown }).version === 2
      ? (value as { selected?: unknown; imports?: unknown })
      : undefined;
  const selected = spotifyShortcut(current ? current.selected : legacySelected) ?? "";
  const rows = current ? current.imports : legacyImports;
  const imports = [
    ...new Set(
      [selected, ...(Array.isArray(rows) ? rows.map(spotifyShortcut) : [])].filter(
        (row): row is string => !!row,
      ),
    ),
  ].slice(0, 50);
  return { version: 2, selected, imports };
}

export type TrackedPackage = {
  id: string;
  title: string;
  carrier: string;
  tracking: string;
  status: "Ordered" | "Shipped" | "Out for delivery" | "Delivered";
};
export function readTrackedPackages(value: unknown): TrackedPackage[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.filter((row): row is TrackedPackage => {
    if (
      !row ||
      typeof row !== "object" ||
      Array.isArray(row) ||
      !["id", "title", "carrier", "tracking"].every((key) => typeof row[key] === "string") ||
      !row.id ||
      !row.title.trim() ||
      ids.has(row.id) ||
      !["Ordered", "Shipped", "Out for delivery", "Delivered"].includes(row.status)
    )
      return false;
    ids.add(row.id);
    return true;
  });
}
