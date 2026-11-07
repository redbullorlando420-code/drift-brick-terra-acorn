import { profileLocalStorage } from "./local-profile-storage.ts";
import { validateSearchQuery, type SearchQuery } from "./videos/search-query.ts";
export const SEARCH_WORKSPACES_KEY = "reelcase.search-workspaces.v1";
export type SearchWorkspace = {
  id: string;
  name: string;
  scope: "public" | "private";
  query: SearchQuery;
};
export type SearchWorkspaces = { version: 1; entries: SearchWorkspace[] };
const empty = (): SearchWorkspaces => ({ version: 1, entries: [] });
export function readSearchWorkspaces(raw: string | null): SearchWorkspaces {
  if (raw === null) return empty();
  if (raw.length > 96000)
    throw Error("Saved searches exceed the supported size. Existing data was kept.");
  const value = JSON.parse(raw) as SearchWorkspaces;
  if (
    !value ||
    value.version !== 1 ||
    Object.keys(value).some((key) => !["version", "entries"].includes(key)) ||
    !Array.isArray(value.entries) ||
    value.entries.length > 32
  )
    throw Error("Unsupported saved searches. Existing data was kept.");
  const ids = new Set<string>();
  return {
    version: 1,
    entries: value.entries.map((row) => {
      if (
        !row ||
        typeof row.id !== "string" ||
        !/^[a-zA-Z0-9-]{1,80}$/.test(row.id) ||
        ids.has(row.id) ||
        typeof row.name !== "string" ||
        !row.name.trim() ||
        row.name.length > 80 ||
        /[\u0000-\u001f]/.test(row.name) ||
        !["public", "private"].includes(row.scope) ||
        Object.keys(row).some((key) => !["id", "name", "scope", "query"].includes(key))
      )
        throw Error("Invalid saved search. Existing data was kept.");
      ids.add(row.id);
      return {
        id: row.id,
        name: row.name.trim(),
        scope: row.scope,
        query: validateSearchQuery(row.query),
      };
    }),
  };
}
/** No autosave: edits are written only by explicit controls. Read-before-write
 * rejects another tab's change instead of overwriting its saved searches. */
export function createSearchWorkspaceStore(
  storage: Pick<Storage, "getItem" | "setItem"> = profileLocalStorage,
) {
  let baseline: string | null = null;
  return {
    load() {
      const raw = storage.getItem(SEARCH_WORKSPACES_KEY);
      const value = readSearchWorkspaces(raw);
      baseline = raw;
      return value;
    },
    save(value: SearchWorkspaces) {
      const raw = JSON.stringify(value),
        clean = readSearchWorkspaces(raw);
      if (storage.getItem(SEARCH_WORKSPACES_KEY) !== baseline)
        throw Error("Saved searches changed in another tab. Reload saved searches before editing.");
      storage.setItem(SEARCH_WORKSPACES_KEY, JSON.stringify(clean));
      baseline = JSON.stringify(clean);
      return clean;
    },
  };
}
export function reorderWorkspace(
  value: SearchWorkspaces,
  id: string,
  direction: -1 | 1,
): SearchWorkspaces {
  const entries = value.entries.slice(), index = entries.findIndex((row) => row.id === id);
  if (index < 0) return value;
  let other = index + direction;
  while (other >= 0 && other < entries.length && entries[other]!.scope !== entries[index]!.scope) other += direction;
  if (other < 0 || other >= entries.length) return value;
  [entries[index], entries[other]] = [entries[other]!, entries[index]!];
  return { version: 1, entries };
}
