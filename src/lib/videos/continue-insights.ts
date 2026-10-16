import { forEachCatalogEntry, forEachCatalogSlice } from '../catalog-work.ts';
import type { LibraryVideo, ResumeMark } from './types';
import { sparseRecordScan } from '../sparse-record.ts';

export async function buildContinueInsights(videos: readonly LibraryVideo[], progress: Record<string, ResumeMark>, resume: (video: LibraryVideo) => ResumeMark | undefined, now: number, turn: () => Promise<void>) {
  const result = { valid: 0, stale: 0, linked: 0 }, staleBefore = now - 180 * 86_400_000;
  function* marks() { for (const row of sparseRecordScan(progress)) yield row?.[1]; }
  await forEachCatalogEntry(marks(), mark => {
    if (!mark || !Number.isFinite(mark.t) || !Number.isFinite(mark.d) || mark.d <= 0.25 || mark.d > 30 * 86_400 || mark.t < 0 || mark.t > mark.d * 1.015) return;
    result.valid++;
    if (mark.at < staleBefore) result.stale++;
  }, turn);
  await forEachCatalogSlice(videos, video => { if (resume(video)) result.linked++; }, turn);
  return result;
}
