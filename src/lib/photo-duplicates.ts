import { fingerprintFile } from "./videos/file-fingerprint.ts";
import { reviewedPreferences } from "./reviewed-preferences.ts";

export const PHOTO_REVIEW_LIMIT = 48;
const ITEM_BYTES = 16 * 1024 ** 2,
  TOTAL_BYTES = 96 * 1024 ** 2;
export const PHOTO_DUPLICATE_KEY = "reelcase.photos.duplicate-review.v1";
export type ReviewPhoto = {
  id: string;
  name: string;
  album: string;
  source: string;
  url: string;
  favorite: boolean;
  hidden: boolean;
  file?: File;
  width?: number;
  height?: number;
};
export type VisualSignature = { rgb: number[]; luma: number[]; ratio: number; spread: number };
type Evidence = { photo: ReviewPhoto; digest: string; bytes: number; visual?: VisualSignature };
export type DuplicateGroup = { kind: "exact" | "similar"; rows: Evidence[] };

export function visualSignature(
  data: ArrayLike<number>,
  width: number,
  height: number,
): VisualSignature {
  const rgb: number[] = [],
    luma: number[] = [];
  for (let i = 0; i < 9 * 9; i++) {
    const at = i * 4,
      a = data[at + 3]! / 255;
    const r = data[at]! * a + 127 * (1 - a),
      g = data[at + 1]! * a + 127 * (1 - a),
      b = data[at + 2]! * a + 127 * (1 - a);
    rgb.push(r, g, b);
    luma.push(r * 0.2126 + g * 0.7152 + b * 0.0722);
  }
  const mean = luma.reduce((total, x) => total + x, 0) / luma.length;
  return {
    rgb,
    luma,
    ratio: width / height,
    spread: Math.sqrt(luma.reduce((total, x) => total + (x - mean) ** 2, 0) / luma.length),
  };
}
export function similarPhotos(a: VisualSignature, b: VisualSignature) {
  if (a.spread < 18 || b.spread < 18 || Math.abs(Math.log(a.ratio / b.ratio)) > 0.075) return false;
  let diff = 0,
    mismatch = 0;
  for (let i = 0; i < a.rgb.length; i++) diff += Math.abs(a.rgb[i]! - b.rgb[i]!);
  for (let y = 0; y < 9; y++)
    for (let x = 0; x < 8; x++) {
      const at = y * 9 + x,
        da = a.luma[at]! - a.luma[at + 1]!,
        db = b.luma[at]! - b.luma[at + 1]!;
      if (Math.abs(da) > 6 && Math.abs(db) > 6 && Math.sign(da) !== Math.sign(db)) mismatch++;
    }
  return diff / a.rgb.length <= 12 && mismatch <= 5;
}
export function groupPhotoEvidence(rows: readonly Evidence[]): DuplicateGroup[] {
  const exact = new Map<string, Evidence[]>();
  for (const row of rows) {
    const key = row.bytes + ":" + row.digest;
    const group = exact.get(key);
    if (group) group.push(row);
    else exact.set(key, [row]);
  }
  const groups: DuplicateGroup[] = [...exact.values()]
    .filter((items) => items.length > 1)
    .map((rows) => ({ kind: "exact", rows }));
  const similar: Evidence[][] = [];
  for (const set of exact.values()) {
    const row = set.find((item) => item.visual);
    if (!row?.visual) continue;
    const group = similar.find((items) =>
      items.every((item) => similarPhotos(item.visual!, row.visual!)),
    );
    if (group) group.push(row);
    else similar.push([row]);
  }
  return [
    ...groups,
    ...similar
      .filter((rows) => rows.length > 1)
      .map((rows) => ({ kind: "similar" as const, rows })),
  ];
}

export async function scanPhotoDuplicates(
  photos: readonly ReviewPhoto[],
  perceptual: boolean,
  signal: AbortSignal,
  progress: (done: number, total: number) => void,
) {
  const sample = photos.slice(0, PHOTO_REVIEW_LIMIT),
    rows: Evidence[] = [];
  let skipped = 0,
    bytes = 0,
    visualSkipped = 0;
  for (const [index, photo] of sample.entries()) {
    signal.throwIfAborted();
    try {
      const file = photo.file;
      if (!file?.size || file.size > ITEM_BYTES || bytes + file.size > TOTAL_BYTES)
        throw Error("File outside review budget.");
      bytes += file.size;
      const fingerprint = await fingerprintFile(file, signal);
      const row: Evidence = { photo, bytes: file.size, digest: fingerprint.digest };
      if (perceptual)
        try {
          if (!photo.width || !photo.height || photo.width * photo.height > 32_000_000)
            throw Error("Dimensions unavailable or too large for similarity.");
          const bitmap = await createImageBitmap(file, {
            resizeWidth: 9,
            resizeHeight: 9,
            resizeQuality: "high",
          });
          try {
            signal.throwIfAborted();
            const canvas = document.createElement("canvas");
            canvas.width = 9;
            canvas.height = 9;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            if (!context) throw Error("Image comparison unavailable.");
            context.drawImage(bitmap, 0, 0);
            row.visual = visualSignature(
              context.getImageData(0, 0, 9, 9).data,
              photo.width,
              photo.height,
            );
          } finally {
            bitmap.close();
          }
        } catch {
          signal.throwIfAborted();
          visualSkipped++;
        }
      rows.push(row);
    } catch {
      signal.throwIfAborted();
      skipped++;
    }
    progress(index + 1, sample.length);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  return { groups: groupPhotoEvidence(rows), checked: rows.length, skipped, visualSkipped };
}

export type PhotoDuplicateDecisions = { version: 1; hidden: string[]; undo: string[] };
export const emptyPhotoDecisions = (): PhotoDuplicateDecisions => ({
  version: 1,
  hidden: [],
  undo: [],
});
export function readPhotoDuplicateDecisions(raw: unknown): PhotoDuplicateDecisions {
  const r = raw as PhotoDuplicateDecisions;
  const valid = (list: unknown, limit: number): list is string[] =>
    Array.isArray(list) &&
    list.length <= limit &&
    new Set(list).size === list.length &&
    list.every((id) => typeof id === "string" && id.length > 0 && id.length <= 2048);
  if (
    !r ||
    r.version !== 1 ||
    !valid(r.hidden, 256) ||
    !valid(r.undo, PHOTO_REVIEW_LIMIT) ||
    r.undo.some((id) => !r.hidden.includes(id))
  )
    throw Error("Duplicate decisions are unreadable. Saved decisions were kept.");
  return { version: 1, hidden: [...r.hidden], undo: [...r.undo] };
}
export function hideReviewedPhotos(
  previous: PhotoDuplicateDecisions,
  ids: string[],
  isEligible: (id: string) => boolean,
) {
  const undo = [...new Set(ids)].filter((id) => !previous.hidden.includes(id));
  if (!undo.length || undo.length > PHOTO_REVIEW_LIMIT || undo.some((id) => !isEligible(id)))
    throw Error("Photo selection changed. Review it again.");
  return readPhotoDuplicateDecisions({ version: 1, hidden: [...previous.hidden, ...undo], undo });
}
export function undoReviewedPhotos(previous: PhotoDuplicateDecisions) {
  const undo = new Set(previous.undo);
  return readPhotoDuplicateDecisions({
    version: 1,
    hidden: previous.hidden.filter((id) => !undo.has(id)),
    undo: [],
  });
}
export function restoreReviewedPhoto(previous: PhotoDuplicateDecisions, id: string) {
  return readPhotoDuplicateDecisions({
    version: 1,
    hidden: previous.hidden.filter((key) => key !== id),
    undo: previous.undo.filter((key) => key !== id),
  });
}
export const photoDuplicatePreferences = reviewedPreferences(
  PHOTO_DUPLICATE_KEY,
  emptyPhotoDecisions,
  readPhotoDuplicateDecisions,
);
