/**
 * In-process TTL cache for Adult provider HTTP responses.
 * Keeps warm server isolates from re-hitting Eporner/RedTube/Reddit/Booru/etc.
 * on identical requests within the TTL window.
 */

type CacheEntry = {
  at: number;
  status: number;
  body: string;
  contentType: string;
};

const STORE = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 10 * 60_000;
const MAX_ENTRIES = 240;

export function adultPullCacheKey(parts: Record<string, string | number | boolean | null | undefined>) {
  return Object.keys(parts)
    .sort()
    .map((key) => `${key}=${String(parts[key] ?? "")}`)
    .join("&");
}

function prune(now: number) {
  if (STORE.size <= MAX_ENTRIES) return;
  const rows = [...STORE.entries()].sort((a, b) => a[1].at - b[1].at);
  const drop = rows.slice(0, Math.max(24, STORE.size - MAX_ENTRIES));
  for (const [key] of drop) STORE.delete(key);
  for (const [key, entry] of STORE) {
    if (now - entry.at > DEFAULT_TTL_MS * 3) STORE.delete(key);
  }
}

export async function cachedAdultFetch(
  url: string,
  init: RequestInit & { cacheTtlMs?: number; cacheKey?: string } = {},
): Promise<Response> {
  const ttl = init.cacheTtlMs ?? DEFAULT_TTL_MS;
  const { cacheTtlMs: _ttl, cacheKey, ...fetchInit } = init;
  const method = (fetchInit.method ?? "GET").toUpperCase();
  const key = cacheKey ?? `${method}:${url}`;
  const now = Date.now();
  if (method === "GET") {
    const hit = STORE.get(key);
    if (hit && now - hit.at <= ttl) {
      return new Response(hit.body, {
        status: hit.status,
        headers: { "content-type": hit.contentType || "application/json", "x-reelcase-cache": "HIT" },
      });
    }
  }
  const res = await fetch(url, { ...fetchInit, signal: fetchInit.signal ?? AbortSignal.timeout(20000) });
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  // Only cache successful readable bodies (JSON/XML/text).
  if (res.ok && method === "GET" && /json|xml|text|atom|rss/i.test(contentType)) {
    const body = await res.text();
    STORE.set(key, { at: now, status: res.status, body, contentType });
    prune(now);
    return new Response(body, {
      status: res.status,
      headers: { "content-type": contentType, "x-reelcase-cache": "MISS" },
    });
  }
  return res;
}

/** Client-side durable fingerprint so identical Adult pulls can skip a network round-trip. */
const CLIENT_KEY = "reelcase.adult-pull-fingerprints.v1";

export type AdultPullFingerprint = {
  at: number;
  query: string;
  order: string;
  page: number;
  providers: string;
  count: number;
};

export function readAdultPullFingerprints(): AdultPullFingerprint[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CLIENT_KEY) ?? "[]") as AdultPullFingerprint[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function rememberAdultPullFingerprint(entry: AdultPullFingerprint, ttlMs = 12 * 60_000) {
  if (typeof localStorage === "undefined") return;
  const now = Date.now();
  const next = [
    entry,
    ...readAdultPullFingerprints().filter((row) => now - row.at <= ttlMs * 4),
  ].slice(0, 80);
  try {
    localStorage.setItem(CLIENT_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function findFreshAdultPullFingerprint(
  query: string,
  order: string,
  page: number,
  providers: string,
  ttlMs = 12 * 60_000,
): AdultPullFingerprint | null {
  const now = Date.now();
  const q = query.trim().toLowerCase() || "all";
  return (
    readAdultPullFingerprints().find(
      (row) =>
        row.query === q &&
        row.order === order &&
        row.page === page &&
        row.providers === providers &&
        now - row.at <= ttlMs,
    ) ?? null
  );
}
