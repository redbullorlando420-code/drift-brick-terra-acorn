/**
 * Adult / RedTube webmaster thumbs are inconsistently shaped:
 * string URL, { src }, or a thumbs[] array. Recent rows often ship a
 * shared placeholder at /videos//original/ that 410s. Pick usable
 * per-video CDN URLs, expand host/frame fallbacks, and skip junk.
 */

import type { LibraryVideo } from "./types";

function asUrl(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "src" in value) {
    const src = (value as { src?: unknown }).src;
    if (typeof src === "string") return src.trim();
  }
  return "";
}

export function isUsableAdultThumb(url: string): boolean {
  if (!url || !/^https:\/\//i.test(url)) return false;
  // Official API placeholder used when the per-video path is missing.
  if (/\/videos\/\/original\//i.test(url)) return false;
  if (/\/videos\/original\//i.test(url) && !/\/videos\/\d{4}\/\d{2}\//i.test(url)) return false;
  // Empty or obviously broken CDN markers.
  if (/\/null\/|\/undefined\//i.test(url)) return false;
  return true;
}

/** Alternate CDN hosts / frame numbers for tube posters that sometimes 410. */
export function expandAdultThumbFallbacks(url: string): string[] {
  if (!isUsableAdultThumb(url)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (candidate: string) => {
    if (!candidate || seen.has(candidate) || !isUsableAdultThumb(candidate)) return;
    seen.add(candidate);
    out.push(candidate);
  };
  push(url);

  // RedTube / Tube CDN host swarm — ei-ph and di-ph both serve many posters.
  const hostSwap = (host: string) => url.replace(/https:\/\/[a-z0-9.-]+\//i, `https://${host}/`);
  if (/rdtcdn\.com|phncdn\.com/i.test(url)) {
    for (const host of ["ei-ph.rdtcdn.com", "di-ph.rdtcdn.com", "ci-ph.rdtcdn.com"]) {
      push(hostSwap(host));
    }
    // Nearby strip frames (…1.jpg …16.jpg) when a specific frame is gone.
    const frameMatch = url.match(/^(.*?)(\d+)(\.(?:jpg|jpeg|webp|png))(?:\?.*)?$/i);
    if (frameMatch) {
      const base = frameMatch[1];
      const n = Number(frameMatch[2]);
      const ext = frameMatch[3];
      if (Number.isFinite(n)) {
        for (const delta of [1, -1, 2, 8, 0]) {
          const next = n + delta;
          if (next < 0 || next > 20) continue;
          push(`${base}${next}${ext}`);
        }
      }
    }
  }

  // Eporner / static CDN path variants.
  if (/eporner\.com|woofcdn|cdn\.eporner/i.test(url)) {
    push(url.replace(/\/\d+x\d+\//i, "/320x180/"));
    push(url.replace(/\/\d+x\d+\//i, "/640x360/"));
  }

  return out;
}

export function collectRedtubeThumbCandidates(row: {
  default_thumb?: unknown;
  thumb?: unknown;
  thumbs?: unknown;
}): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw: unknown) => {
    const url = asUrl(raw);
    if (!url || seen.has(url) || !isUsableAdultThumb(url)) return;
    seen.add(url);
    out.push(url);
  };
  push(row.default_thumb);
  push(row.thumb);
  if (Array.isArray(row.thumbs)) {
    // Mid-strip frames are usually more distinctive than frame 1.
    const thumbs = row.thumbs;
    const mid = thumbs[Math.min(8, Math.max(0, thumbs.length - 1))];
    push(mid);
    for (const item of thumbs) push(item);
  }
  return out;
}

export function pickRedtubeThumb(row: {
  default_thumb?: unknown;
  thumb?: unknown;
  thumbs?: unknown;
}): { poster?: string; previewUrl?: string; thumbFallbacks?: string[] } {
  const urls = collectRedtubeThumbCandidates(row);
  if (!urls.length) return {};
  const expanded = urls.flatMap((url) => expandAdultThumbFallbacks(url));
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const url of expanded) {
    if (seen.has(url)) continue;
    seen.add(url);
    unique.push(url);
  }
  return {
    poster: unique[0],
    previewUrl: unique[1] ?? unique[0],
    thumbFallbacks: unique.slice(0, 12),
  };
}

/** Ordered poster candidates for any adult (or remote) library card. */
export function adultThumbCandidatesForVideo(video: LibraryVideo): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw?: string) => {
    if (!raw) return;
    for (const url of expandAdultThumbFallbacks(raw)) {
      if (seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
  };
  push(video.poster);
  push(video.remote?.previewUrl);
  for (const url of video.remote?.thumbFallbacks ?? []) push(url);
  return out;
}

export function redtubeStarNames(stars: unknown): string[] {
  if (!Array.isArray(stars)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const row of stars) {
    let name = "";
    if (typeof row === "string") name = row;
    else if (row && typeof row === "object") {
      const rec = row as Record<string, unknown>;
      if (typeof rec.star_name === "string") name = rec.star_name;
      else if (typeof rec.star === "string") name = rec.star;
      else if (rec.star && typeof rec.star === "object") {
        const inner = rec.star as Record<string, unknown>;
        if (typeof inner.star_name === "string") name = inner.star_name;
        else if (typeof inner.star === "string") name = inner.star;
      }
    }
    const clean = name.trim();
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}
