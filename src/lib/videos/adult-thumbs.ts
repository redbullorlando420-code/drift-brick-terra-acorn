/**
 * RedTube webmaster thumbs are inconsistently shaped:
 * string URL, { src }, or a thumbs[] array. Recent rows often ship a
 * shared placeholder at /videos//original/ that 404s. Pick the first
 * usable per-video CDN URL and skip the broken placeholders.
 */

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
  return true;
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
}): { poster?: string; previewUrl?: string } {
  const urls = collectRedtubeThumbCandidates(row);
  if (!urls.length) return {};
  return { poster: urls[0], previewUrl: urls[1] ?? urls[0] };
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
