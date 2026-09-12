/**
 * Session-scoped Adult thumb memory: failed-URL blacklist, known-good URLs,
 * and host success scores so rails do not re-hit the same dead CDN path.
 */

const MAX_FAILED = 800;
const MAX_GOOD = 600;
const MAX_BY_VIDEO = 400;

const failedUrls = new Set<string>();
const goodUrls = new Set<string>();
const goodByVideo = new Map<string, string>();
const hostFail = new Map<string, number>();
const hostOk = new Map<string, number>();

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function trimSet(set: Set<string>, max: number) {
  if (set.size <= max) return;
  const drop = set.size - max;
  let i = 0;
  for (const key of set) {
    set.delete(key);
    if (++i >= drop) break;
  }
}

/** Prefer hosts that historically serve RedTube/Eporner strips; demote flaky ones. */
const PREFERRED_HOSTS: Record<string, number> = {
  "ei-ph.rdtcdn.com": 8,
  "di-ph.rdtcdn.com": 5,
  "ei.rdtcdn.com": 4,
  "cdn.eporner.com": 6,
  "static-cdn-v4.eporner.com": 5,
  "woofcdn.com": 3,
};

export function markAdultThumbFailed(url: string) {
  if (!url) return;
  failedUrls.add(url);
  goodUrls.delete(url);
  trimSet(failedUrls, MAX_FAILED);
  const host = hostOf(url);
  if (host) hostFail.set(host, (hostFail.get(host) ?? 0) + 1);
}

export function markAdultThumbGood(url: string, videoId?: string) {
  if (!url || failedUrls.has(url)) return;
  goodUrls.add(url);
  trimSet(goodUrls, MAX_GOOD);
  const host = hostOf(url);
  if (host) hostOk.set(host, (hostOk.get(host) ?? 0) + 1);
  if (videoId) {
    goodByVideo.set(videoId, url);
    if (goodByVideo.size > MAX_BY_VIDEO) {
      const first = goodByVideo.keys().next().value;
      if (first) goodByVideo.delete(first);
    }
  }
}

export function isAdultThumbBlacklisted(url: string): boolean {
  return Boolean(url) && failedUrls.has(url);
}

export function recallSessionGoodThumb(videoId: string): string | undefined {
  return goodByVideo.get(videoId);
}

export function adultThumbHostScore(url: string): number {
  const host = hostOf(url);
  if (!host) return 0;
  const base = PREFERRED_HOSTS[host] ?? 1;
  const ok = hostOk.get(host) ?? 0;
  const fail = hostFail.get(host) ?? 0;
  // Soft demote hosts that fail more than they succeed this session.
  const session = ok - fail * 2;
  return base + Math.max(-6, Math.min(6, session));
}

/** Drop blacklisted URLs and prefer known-good / healthier hosts. */
export function filterAndRankAdultThumbs(urls: string[]): string[] {
  const seen = new Set<string>();
  const ranked: Array<{ url: string; score: number; idx: number }> = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!url || seen.has(url) || failedUrls.has(url)) continue;
    seen.add(url);
    let score = adultThumbHostScore(url) * 10 - i;
    if (goodUrls.has(url)) score += 100;
    ranked.push({ url, score, idx: i });
  }
  ranked.sort((a, b) => b.score - a.score || a.idx - b.idx);
  return ranked.map((row) => row.url);
}

/** Fire-and-forget warm of the first few candidates (visible rail priority). */
export function warmAdultThumbUrls(urls: string[], limit = 4) {
  if (typeof Image === "undefined") return;
  let n = 0;
  for (const url of urls) {
    if (!url || failedUrls.has(url)) continue;
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.src = url;
    if (++n >= limit) break;
  }
}
