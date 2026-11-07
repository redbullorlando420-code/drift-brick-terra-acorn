import type { SortKey, ViewMode } from "./videos/types";
import { profileLocalStorage } from "./local-profile-storage.ts";
import { forEachCatalogSlice, yieldCatalogTask } from "./catalog-work.ts";

export const BROWSE_BOOKMARKS_KEY = "reelcase.browse-bookmarks.v1";
export const BROWSE_TASK_LIMIT = 32;
export type BrowseAnchor = { ids: string[]; top: number; grid: number };
export type BrowseTask = {
  source: string;
  query: string;
  sort: SortKey;
  view: ViewMode;
  private: boolean;
  scroll: number;
  anchor?: BrowseAnchor;
  detail?: string;
  options: Record<string, string | boolean | number>;
};
export type BrowseBookmark = { id: string; task: BrowseTask };
export type BrowseBookmarks = { version: 1; entries: BrowseBookmark[] };
const sorts = ["name", "added", "size", "duration", "recent", "type", "folder", "path"];
const text = (value: unknown, max: number) =>
  typeof value === "string" && value.length <= max && !/[\u0000-\u001f]/.test(value);
const finite = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
// Only primitive desk controls. No card arrays, titles, URLs or fetched details.
export const BROWSE_OPTION_RULES: Record<
  string,
  readonly (string | boolean)[] | "text" | "number"
> = {
  youtubeTagFilter: "text",
  youtubeTagsExpanded: [true, false],
  youtubeExploreVisible: [true, false],
  youtubeDeepVisible: [true, false],
  youtubeHealthVisible: [true, false],
  twitchExploreVisible: [true, false],
  twitchCatalogVisible: [true, false],
  twitchCoverageVisible: [true, false],
  twitchArchiveSearchVisible: [true, false],
  twitchSort: ["mix", "live", "viewers", "name"],
  twitchContentFilter: ["all", "past-broadcast", "highlight", "upload", "clip", "live", "unknown"],
  twitchFilter: ["all", "favorites", "likes"],
  twitchTagFilter: "text",
  twitchClipOrder: ["shuffle", "newest", "views"],
  twitchClipCreator: "text",
  twitchMixSeed: "number",
  twitchClipSeed: "number",
  adultTag: "text",
  adultSource: "text",
  adultView: ["all", "videos", "live", "photos"],
  adultArtworkOnly: [true, false],
  adultDeepVisible: [true, false],
  adultSort: ["recent", "name", "favorites", "tagged", "played", "ranked"],
  adultRailSeed: "number",
  historyWindow: ["all", "day", "week"],
  historySource: ["all", "open", "progress", "watch-room"],
  savedFilter: ["all", "hearts", "likes"],
};
export function validateBrowseTask(raw: unknown): BrowseTask {
  const task = raw as BrowseTask;
  const invalid = () => {
    throw Error("Unsupported saved place. Existing data was kept.");
  };
  if (
    !task ||
    Object.keys(task).some(
      (key) =>
        ![
          "source",
          "query",
          "sort",
          "view",
          "private",
          "scroll",
          "anchor",
          "detail",
          "options",
        ].includes(key),
    ) ||
    !text(task.source, 160) ||
    !task.source ||
    !text(task.query, 4096) ||
    !sorts.includes(task.sort) ||
    !["grid", "list"].includes(task.view) ||
    typeof task.private !== "boolean" ||
    !finite(task.scroll, 0, 100_000_000) ||
    !task.options ||
    typeof task.options !== "object" ||
    Array.isArray(task.options)
  )
    return invalid();
  if (task.detail !== undefined && (!text(task.detail, 512) || !task.detail)) return invalid();
  const options: BrowseTask["options"] = {};
  for (const [key, value] of Object.entries(task.options)) {
    const rule = BROWSE_OPTION_RULES[key];
    if (
      !rule ||
      (rule === "text"
        ? !text(value, 160)
        : rule === "number"
          ? !finite(value, 0, Number.MAX_SAFE_INTEGER)
          : !rule.includes(value as string | boolean))
    )
      return invalid();
    options[key] = value;
  }
  if (task.anchor) {
    const a = task.anchor;
    if (
      Object.keys(a).some((key) => !["ids", "top", "grid"].includes(key)) ||
      !Array.isArray(a.ids) ||
      !a.ids.length ||
      a.ids.length > 4 ||
      a.ids.some((id) => !text(id, 512) || !id) ||
      new Set(a.ids).size !== a.ids.length ||
      !finite(a.top, -10000, 10000) ||
      !Number.isInteger(a.grid) ||
      !finite(a.grid, 0, 128)
    )
      return invalid();
  }
  return {
    source: task.source,
    query: task.query,
    sort: task.sort,
    view: task.view,
    private: task.private,
    scroll: task.scroll,
    options,
    ...(task.detail ? { detail: task.detail } : {}),
    ...(task.anchor ? { anchor: { ...task.anchor, ids: [...task.anchor.ids] } } : {}),
  };
}
export function browseRouteKey(task: BrowseTask) {
  return JSON.stringify([task.source, task.query, task.sort, task.view, task.detail ?? ""]);
}

/** Session-only bounded back/forward stack. The caller checkpoints the leaving
 * task just once per transition; scrolling never writes browser storage. */
export function createBrowseHistory(initial: BrowseTask) {
  let entries = [validateBrowseTask(initial)],
    index = 0;
  return {
    current: () => entries[index]!,
    state: () => ({ back: index > 0, forward: index + 1 < entries.length, length: entries.length }),
    checkpoint(task: BrowseTask) {
      entries[index] = validateBrowseTask(task);
    },
    push(task: BrowseTask) {
      const clean = validateBrowseTask(task);
      if (browseRouteKey(clean) === browseRouteKey(entries[index]!)) {
        entries[index] = clean;
        return;
      }
      entries = [...entries.slice(0, index + 1), clean].slice(-BROWSE_TASK_LIMIT);
      index = entries.length - 1;
    },
    move(direction: -1 | 1) {
      const target = index + direction;
      if (target < 0 || target >= entries.length) return undefined;
      index = target;
      return entries[index];
    },
    clearPrivate() {
      const current = entries[index]!;
      const before = entries.slice(0, index).filter((task) => !task.private).length;
      entries = entries.filter((task) => !task.private);
      if (current.private)
        entries.splice(before, 0, {
          source: "home",
          query: "",
          sort: "name",
          view: "grid",
          private: false,
          scroll: 0,
          options: {},
        });
      index = Math.min(before, entries.length - 1);
    },
  };
}
export function readBrowseBookmarks(raw: string | null): BrowseBookmarks {
  if (raw === null) return { version: 1, entries: [] };
  if (raw.length > 160_000)
    throw Error("Saved places exceed the supported size. Existing data was kept.");
  const value = JSON.parse(raw) as BrowseBookmarks;
  if (
    !value ||
    value.version !== 1 ||
    Object.keys(value).some((key) => !["version", "entries"].includes(key)) ||
    !Array.isArray(value.entries) ||
    value.entries.length > 24
  )
    throw Error("Unsupported saved places. Existing data was kept.");
  const ids = new Set<string>();
  return {
    version: 1,
    entries: value.entries.map((row) => {
      if (
        !row ||
        Object.keys(row).some((key) => !["id", "task"].includes(key)) ||
        typeof row.id !== "string" ||
        !/^[a-zA-Z0-9-]{1,80}$/.test(row.id) ||
        ids.has(row.id)
      )
        throw Error("Invalid saved place. Existing data was kept.");
      ids.add(row.id);
      return { id: row.id, task: validateBrowseTask(row.task) };
    }),
  };
}
export function createBrowseBookmarkStore(
  storage: Pick<Storage, "getItem" | "setItem"> = profileLocalStorage,
) {
  let baseline: string | null = null;
  return {
    load() {
      const raw = storage.getItem(BROWSE_BOOKMARKS_KEY),
        value = readBrowseBookmarks(raw);
      baseline = raw;
      return value;
    },
    save(value: BrowseBookmarks) {
      const clean = readBrowseBookmarks(JSON.stringify(value));
      if (storage.getItem(BROWSE_BOOKMARKS_KEY) !== baseline)
        throw Error("Saved places changed in another tab. Reload before editing.");
      const raw = JSON.stringify(clean);
      storage.setItem(BROWSE_BOOKMARKS_KEY, raw);
      baseline = raw;
      return clean;
    },
  };
}

/** Resolve only within the caller's current eligible result slice. All IDs are
 * canonicalized using the verified identity ledger, never a title/path guess. */
export async function resolveBrowseAnchor(
  anchor: BrowseAnchor,
  rows: readonly { id: string }[],
  canonical: (id: string) => string = (id) => id,
  turn = yieldCatalogTask,
) {
  const wanted = anchor.ids.map(canonical);
  const found = new Map<string, number>();
  await forEachCatalogSlice(
    rows,
    (row, index) => {
      const key = canonical(row.id);
      if (wanted.includes(key) && !found.has(key)) found.set(key, index);
    },
    turn,
  );
  for (let rank = 0; rank < wanted.length; rank++) {
    const index = found.get(wanted[rank]!);
    if (index !== undefined) return { index, exact: rank === 0 };
  }
  return undefined;
}
