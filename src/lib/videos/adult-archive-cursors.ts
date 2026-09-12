import type { AdultPullProvider } from "./adult-sites";
import { ADULT_PULL_PROVIDERS } from "./adult-sites";

const KEY = "reelcase.adult-archive-cursors.v1";

export type AdultArchiveCursor = {
  page: number;
  query: string;
  order: string;
  updatedAt: number;
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
) {
  const raw = readRaw();
  const now = Date.now();
  for (const provider of ADULT_PULL_PROVIDERS) {
    const next = pages[provider];
    const key = slotKey(provider, query, order);
    if (next == null || next < 1) {
      delete raw[key];
      continue;
    }
    raw[key] = { page: next, query: query.trim().toLowerCase() || "all", order, updatedAt: now };
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

/** Summarize how deep the archive resume points go for UI copy. */
export function adultArchiveDepthLabel(cursors: AdultArchiveCursorMap): string {
  const rows = Object.entries(cursors) as Array<[AdultPullProvider, AdultArchiveCursor]>;
  if (!rows.length) return "No saved archive depth yet — Pull catalog starts at page 1.";
  const parts = rows
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([provider, row]) => `${provider}→p${row.page}`);
  return `Resume cursors · ${parts.join(" · ")}`;
}
