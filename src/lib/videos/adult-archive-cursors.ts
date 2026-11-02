import { profileLocalStorage as localStorage } from "../local-profile-storage.ts";
import { ADULT_PULL_PROVIDERS, type AdultPullProvider } from "./adult-providers.ts";

const KEY = "reelcase.adult-archive-cursors.v1";
export const ADULT_ARCHIVE_EVENT = "reelcase:adult-archive-progress";
export { ADULT_ARCHIVE_ORDERS } from "./adult-archive-model.ts";
export type { AdultArchiveCursor } from "./adult-archive-model.ts";
import {
  ADULT_ARCHIVE_ORDERS,
  archiveQuery,
  archiveLaneKey,
  readArchiveLedger,
  validArchiveCursor,
  type AdultArchiveCursor,
  type ArchiveLedger,
  type ArchiveCheckpoint,
} from "./adult-archive-model.ts";
import type { LibraryVideo } from "./types";
let durable: ArchiveLedger | undefined,
  hydrating: Promise<void> | undefined,
  stopRemote: (() => void) | undefined;
let resumeStatus: {
  phase: "idle" | "loading" | "ready" | "error";
  revision: number;
  error?: string;
} = { phase: "idle", revision: 0 };
const subscribers = new Set<() => void>();
export const adultArchiveResumeStatus = () => resumeStatus;
export const subscribeAdultArchiveResume = (listener: () => void) => {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
};
function notify(phase: typeof resumeStatus.phase, error?: string) {
  resumeStatus = { phase, revision: resumeStatus.revision + 1, error };
  for (const listener of subscribers) listener();
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADULT_ARCHIVE_EVENT));
}
function install(ledger: ArchiveLedger) {
  durable = readArchiveLedger(ledger);
  writeRaw({
    ...readLegacy(),
    ...Object.fromEntries(Object.entries(durable.positions).map(([key, row]) => [key, row.cursor])),
  });
  notify("ready");
}
export function hydrateAdultArchiveCursors(force = false): Promise<void> {
  if (hydrating) return hydrating;
  if (durable && !force) return Promise.resolve();
  if (resumeStatus.phase === "error" && !force) return Promise.reject(Error(resumeStatus.error));
  const legacy = readLegacy();
  notify("loading");
  hydrating = import("./persist")
    .then(async (api) => {
      const ledger = await api.restoreAdultArchiveLedger(legacy);
      install(ledger);
      if (!stopRemote && api.catalogWriter?.onCommit)
        stopRemote = api.catalogWriter.onCommit(() => {
          durable = undefined;
          notify("idle");
        });
    })
    .catch((error) => {
      notify(
        "error",
        error instanceof Error ? error.message : "Archive positions could not be restored.",
      );
      throw error;
    })
    .finally(() => {
      hydrating = undefined;
    });
  return hydrating;
}
export function prepareAdultArchiveCheckpoint(
  query: string,
  order: string,
  provider: AdultPullProvider,
  nextPage: number | null,
  offset = 0,
  stats: Pick<AdultArchiveCursor, "added" | "duplicates" | "received"> = {},
  acceptedIds: string[] = [],
): ArchiveCheckpoint {
  const current = loadAdultArchiveCursors(query, order)[provider],
    token = "archive:" + crypto.randomUUID(),
    now = Date.now();
  query = archiveQuery(query);
  const cursor: AdultArchiveCursor = {
    page: nextPage ?? 1,
    offset: nextPage === null ? 0 : offset,
    query,
    order,
    updatedAt: now,
    paging: 2,
    state: nextPage === null ? "exhausted" : "ready",
    ...(nextPage === null ? { retryAt: now + 30 * 60000 } : {}),
    ...stats,
    checkpointId: token,
  };
  return {
    version: 1,
    provider,
    query,
    order,
    before: current?.checkpointId ?? null,
    token,
    cursor,
    acceptedIds,
  };
}
export async function commitAdultArchiveWindow(
  videos: LibraryVideo[],
  checkpoint: ArchiveCheckpoint,
) {
  try {
    const api = await import("./persist");
    const ledger = await api.appendAdultArchiveWindow(videos, checkpoint);
    install(ledger);
    return loadAdultArchiveCursors(checkpoint.query, checkpoint.order);
  } catch (error) {
    durable = undefined;
    notify(
      "error",
      error instanceof Error ? error.message : "Archive checkpoint could not be saved.",
    );
    throw error;
  }
}
export async function saveAdultArchiveFailure(
  query: string,
  order: string,
  provider: AdultPullProvider,
) {
  const previous = loadAdultArchiveCursors(query, order)[provider],
    point = prepareAdultArchiveCheckpoint(
      query,
      order,
      provider,
      previous?.page ?? 1,
      previous?.offset ?? 0,
    );
  point.cursor = {
    ...point.cursor,
    ...previous,
    query: archiveQuery(query),
    order,
    state: "failed",
    updatedAt: Date.now(),
    retryAt: Date.now() + 5 * 60000,
    checkpointId: point.token,
  };
  return commitAdultArchiveWindow([], point);
}
import.meta.hot?.dispose(() => stopRemote?.());
export type AdultArchiveCursorMap = Partial<Record<AdultPullProvider, AdultArchiveCursor>>;

function readLegacy(): Record<string, AdultArchiveCursor> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw || raw.length > 2 * 1024 * 1024) return {};
    const parsed = JSON.parse(raw) as Record<string, AdultArchiveCursor>;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? Object.fromEntries(
          Object.entries(parsed).flatMap(([key, raw]) => {
            const parts = key.split("::"),
              provider = parts.shift(),
              order = parts.pop(),
              query = parts.join("::");
            if (
              !provider ||
              !order ||
              !ADULT_PULL_PROVIDERS.includes(provider as AdultPullProvider) ||
              !raw ||
              typeof raw !== "object"
            )
              return [];
            const row = { ...raw, query: raw.query ?? query, order: raw.order ?? order };
            return validArchiveCursor(row) && key === archiveLaneKey(provider, row.query, row.order)
              ? [[key, row]]
              : [];
          }),
        )
      : {};
  } catch {
    return {};
  }
}

function readRaw(): Record<string, AdultArchiveCursor> {
  return durable
    ? Object.fromEntries(Object.entries(durable.positions).map(([key, row]) => [key, row.cursor]))
    : readLegacy();
}

function writeRaw(map: Record<string, AdultArchiveCursor>) {
  try {
    const text = JSON.stringify(map);
    if (localStorage.getItem(KEY) === text) return;
    localStorage.setItem(KEY, text);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(ADULT_ARCHIVE_EVENT));
  } catch {
    /* quota — cursors are best-effort */
  }
}

function slotKey(provider: AdultPullProvider, query: string, order: string) {
  return `${provider}::${query.trim().toLowerCase() || "all"}::${order}`;
}

/** Load next-page cursors for the active query/order across providers. */
export function loadAdultArchiveCursors(query: string, order: string): AdultArchiveCursorMap {
  const raw = readRaw();
  const out: AdultArchiveCursorMap = {};
  for (const provider of ADULT_PULL_PROVIDERS) {
    const row = raw[slotKey(provider, query, order)];
    if (row && Number.isSafeInteger(row.page) && row.page >= 1 && row.page <= 100000) {
      const offset =
        Number.isSafeInteger(row.offset) && row.offset! >= 0 && row.offset! <= 10000
          ? row.offset
          : 0;
      // Legacy all-query cursors alternated sorts on successive page numbers.
      // Revisit those positions once with stable paging; retained titles dedupe.
      const rewind =
        query.trim().toLowerCase() === "all" &&
        (provider === "eporner" || provider === "redtube") &&
        row.paging !== 2;
      out[provider] = { ...row, offset, ...(rewind ? { page: 1, offset: 0, rewound: true } : {}) };
    }
  }
  return out;
}

/** Persist the next page each provider should resume from. */
export function saveAdultArchiveCursors(
  query: string,
  order: string,
  pages: Partial<Record<AdultPullProvider, number | null>>,
  offsets: Partial<Record<AdultPullProvider, number>> = {},
  stats: Partial<
    Record<AdultPullProvider, Pick<AdultArchiveCursor, "added" | "duplicates" | "received">>
  > = {},
) {
  const raw = readRaw();
  const now = Date.now();
  for (const provider of ADULT_PULL_PROVIDERS) {
    if (!Object.prototype.hasOwnProperty.call(pages, provider)) continue;
    const next = pages[provider];
    const key = slotKey(provider, query, order);
    if (next == null || next < 1) {
      // Exhausted archives restart at their newest page after cooldown, so new
      // uploads can be found. Retrying an error keeps the accepted cursor below.
      raw[key] = {
        page: 1,
        offset: 0,
        query,
        order,
        paging: 2,
        state: "exhausted",
        ...stats[provider],
        retryAt: now + 30 * 60_000,
        updatedAt: now,
      };
      continue;
    }
    raw[key] = {
      page: next,
      offset: offsets[provider] ?? 0,
      query: query.trim().toLowerCase() || "all",
      order,
      paging: 2,
      state: "ready",
      ...stats[provider],
      updatedAt: now,
    };
  }
  writeRaw(raw);
  // Continue this accepted walk even if the best-effort browser mirror is
  // unavailable. A later reload can safely replay/dedupe the older checkpoint.
  return Object.fromEntries(
    ADULT_PULL_PROVIDERS.flatMap((provider) => {
      if (!Object.prototype.hasOwnProperty.call(pages, provider)) return [];
      const row = raw[slotKey(provider, query, order)];
      return row ? [[provider, row]] : [];
    }),
  ) as AdultArchiveCursorMap;
}

export function clearAdultArchiveCursors(query?: string, order?: string) {
  if (!query) {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  const raw = readRaw();
  const needle = `::${query.trim().toLowerCase() || "all"}::${order ?? ""}`;
  for (const key of Object.keys(raw)) {
    if (
      key.includes(needle) ||
      (!order && key.includes(`::${query.trim().toLowerCase() || "all"}::`))
    ) {
      delete raw[key];
    }
  }
  writeRaw(raw);
}
export function recordAdultArchiveFailure(
  query: string,
  order: string,
  provider: AdultPullProvider,
) {
  const raw = readRaw(),
    key = slotKey(provider, query, order),
    now = Date.now();
  raw[key] = {
    ...(raw[key] ?? { page: 1, query, order }),
    state: "failed",
    updatedAt: now,
    retryAt: now + 5 * 60_000,
  };
  writeRaw(raw);
}

/** Summarize how deep the archive resume points go for UI copy. */
export function adultArchiveDepthLabel(cursors: AdultArchiveCursorMap): string {
  const rows = Object.entries(cursors) as Array<[AdultPullProvider, AdultArchiveCursor]>;
  if (!rows.length) return "No saved archive depth yet — Pull catalog starts at page 1.";
  const parts = rows
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(
      ([provider, row]) =>
        `${provider}→p${row.page}${row.offset ? `+${row.offset}` : ""}${row.rewound ? " (stable paging restart)" : row.state === "exhausted" ? " (listing complete)" : row.state === "failed" ? " (retry held)" : ""}`,
    );
  return `Resume cursors · ${parts.join(" · ")}`;
}
