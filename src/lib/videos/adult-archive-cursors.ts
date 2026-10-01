import { ADULT_PULL_PROVIDERS, type AdultPullProvider } from './adult-providers.ts';

const KEY = "reelcase.adult-archive-cursors.v1";

export type AdultArchiveCursor = {
  page: number;
  query: string;
  order: string;
  updatedAt: number;
  offset?: number;
  retryAt?: number;
};

export type AdultArchiveCursorMap = Partial<Record<AdultPullProvider, AdultArchiveCursor>>;

function readRaw(): Record<string, AdultArchiveCursor> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AdultArchiveCursor>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRaw(map: Record<string, AdultArchiveCursor>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
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
    if (row && typeof row.page === "number" && row.page >= 1) {
      out[provider] = row;
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
) {
  const raw = readRaw();
  const now = Date.now();
  for (const provider of ADULT_PULL_PROVIDERS) {
    if (!Object.prototype.hasOwnProperty.call(pages, provider)) continue;
    const next = pages[provider];
    const key = slotKey(provider, query, order);
    if (next == null || next < 1) {
      // Keep the last successful resume point. Empty/live windows are revisited
      // after a cooldown instead of restarting every automatic tick.
      raw[key] = { ...(raw[key] ?? { page: 1, query, order }), retryAt: now + 30 * 60_000, updatedAt: now };
      continue;
    }
    raw[key] = { page: next, offset: offsets[provider] ?? 0, query: query.trim().toLowerCase() || "all", order, updatedAt: now };
  }
  writeRaw(raw);
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
    if (key.includes(needle) || (!order && key.includes(`::${query.trim().toLowerCase() || "all"}::`))) {
      delete raw[key];
    }
  }
  writeRaw(raw);
}
export function recordAdultArchiveFailure(query: string, order: string, provider: AdultPullProvider) {
  const raw = readRaw(), key = slotKey(provider, query, order), now = Date.now();
  raw[key] = { ...(raw[key] ?? { page: 1, query, order }), updatedAt: now, retryAt: now + 5 * 60_000 };
  writeRaw(raw);
}

/** Summarize how deep the archive resume points go for UI copy. */
export function adultArchiveDepthLabel(cursors: AdultArchiveCursorMap): string {
  const rows = Object.entries(cursors) as Array<[AdultPullProvider, AdultArchiveCursor]>;
  if (!rows.length) return "No saved archive depth yet — Pull catalog starts at page 1.";
  const parts = rows
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([provider, row]) => `${provider}→p${row.page}${row.offset ? `+${row.offset}` : ''}`);
  return `Resume cursors · ${parts.join(" · ")}`;
}
