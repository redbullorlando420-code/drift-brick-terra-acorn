/**
 * Adult / RedTube webmaster thumbs are inconsistently shaped:
 * string URL, { src }, or a thumbs[] array. Recent rows often ship a
 * shared placeholder at /videos//original/ that 410s. Pick usable
 * per-video CDN URLs, expand host/frame/size fallbacks, and skip junk.
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

function thumbSizeRank(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  const size = String((value as { size?: unknown }).size ?? "").toLowerCase();
  if (size === "big" || size === "large" || size === "640x360") return 3;
  if (size === "medium" || size === "320x180") return 2;
  if (size === "small" || size === "tiny") return 1;
  return 0;
}

export function isUsableAdultThumb(url: string): boolean {
  if (!url || !/^https:\/\//i.test(url)) return false;
  // Official API placeholder used when the per-video path is missing.
  if (/\/videos\/\/original\//i.test(url)) return false;
  if (/\/videos\/original\//i.test(url) && !/\/videos\/\d{4}\/\d{2}\//i.test(url)) return false;
  // Empty or obviously broken CDN markers.
  if (/\/null\/|\/undefined\/|\/NaN\//i.test(url)) return false;
  // Missing date segment or empty id folder (…/videos/2024/01//…).
  if (/\/videos\/\d{4}\/\d{2}\/\//i.test(url)) return false;
  // Generic site logo / default tile often returned when a title has no art.
  if (/\/(?:default|no[_-]?thumb|placeholder|missing)[_-]?(?:thumb)?\.(?:jpg|jpeg|png|webp)/i.test(url)) return false;
  return true;
}

/** Short host/size fallbacks for tube posters — keep primary URL first, avoid long speculative chains. */
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

  const hostSwap = (host: string) => url.replace(/https:\/\/[a-z0-9.-]+\//i, `https://${host}/`);
  if (/rdtcdn\.com|phncdn\.com|rtcdn\.com/i.test(url)) {
    // Only the two mirrors that historically serve the same strip.
    for (const host of ["ei-ph.rdtcdn.com", "di-ph.rdtcdn.com"]) {
      push(hostSwap(host));
    }
    // One nearby frame + one size folder — enough for onError without serializing rails.
    const frameMatch = url.match(/^(.*?)(\d+)(\.(?:jpg|jpeg|webp|png))(?:\?.*)?$/i);
    if (frameMatch) {
      const base = frameMatch[1];
      const n = Number(frameMatch[2]);
      const ext = frameMatch[3];
      if (Number.isFinite(n)) {
        for (const delta of [1, -1]) {
          const next = n + delta;
          if (next < 0 || next > 20) continue;
          push(`${base}${next}${ext}`);
        }
      }
    }
    push(url.replace(/\/original\//i, "/320x180/"));
    push(url.replace(/\/\d+x\d+\//i, "/320x180/"));
    push(url.replace(/\?.*$/, ""));
  }

  if (/eporner\.com|woofcdn|cdn\.eporner/i.test(url)) {
    push(url.replace(/\/\d+x\d+\//i, "/320x180/"));
    push(url.replace(/\/\d+x\d+\//i, "/640x360/"));
  }

  return out.slice(0, 6);
}

export function collectRedtubeThumbCandidates(row: {
  default_thumb?: unknown;
  thumb?: unknown;
  thumbs?: unknown;
  video_id?: unknown;
}): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw: unknown) => {
    const url = asUrl(raw);
    if (!url || seen.has(url) || !isUsableAdultThumb(url)) return;
    seen.add(url);
    out.push(url);
  };

  // API primary first — default_thumb / thumb usually work; speculative thumbs[] later.
  push(row.default_thumb);
  push(row.thumb);
  if (Array.isArray(row.thumbs)) {
    const ranked = [...row.thumbs].sort((a, b) => thumbSizeRank(b) - thumbSizeRank(a));
    for (const item of ranked) {
      if (thumbSizeRank(item) >= 3) push(item);
    }
    const mid = ranked[Math.min(8, Math.max(0, ranked.length - 1))];
    push(mid);
    for (const item of ranked.slice(0, 4)) push(item);
  }

  // Last-resort reconstruction when the API only returned the empty placeholder.
  const id = String(row.video_id ?? "").trim();
  if (!out.length && /^\d{5,}$/.test(id)) {
    // Common webmaster strip layout; hosts are expanded below.
    push(`https://ei-ph.rdtcdn.com/videos/${id.slice(0, 4)}/${id.slice(4, 6)}/${id}/${id}_320x180.jpg`);
    push(`https://ei-ph.rdtcdn.com/videos/${id.slice(0, 6)}/${id}/original/${id}.jpg`);
  }

  return out;
}

export function pickRedtubeThumb(row: {
  default_thumb?: unknown;
  thumb?: unknown;
  thumbs?: unknown;
  video_id?: unknown;
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
    // Keep hover preview on the same primary (avoid speculative CDN twin blanks).
    previewUrl: unique[0],
    thumbFallbacks: unique.slice(0, 6),
  };
}

/** Ordered poster candidates for any adult (or remote) library card. */
export function adultThumbCandidatesForVideo(video: LibraryVideo): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const pushExact = (raw?: string) => {
    if (!raw || seen.has(raw) || !isUsableAdultThumb(raw)) return;
    seen.add(raw);
    out.push(raw);
  };
  const pushExpanded = (raw?: string) => {
    if (!raw) return;
    for (const url of expandAdultThumbFallbacks(raw)) {
      if (seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
  };
  // Prefer exact API poster/preview before any speculative CDN expansion.
  pushExact(video.poster);
  pushExact(video.remote?.previewUrl);
  for (const url of video.remote?.thumbFallbacks ?? []) pushExact(url);
  pushExpanded(video.poster);
  pushExpanded(video.remote?.previewUrl);
  // Rebuild RedTube only when no usable API thumbs were stored.
  if (!out.length && video.remote?.kind === "redtube" && video.remote.videoId) {
    for (const url of collectRedtubeThumbCandidates({ video_id: video.remote.videoId })) {
      pushExpanded(url);
    }
  }
  return out.slice(0, 8);
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
