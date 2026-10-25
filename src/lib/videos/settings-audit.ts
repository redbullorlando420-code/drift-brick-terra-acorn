import { forEachCatalogSlice, forEachCatalogEntry } from '../catalog-work.ts';
import { sparseRecordScan } from '../sparse-record.ts';
import { prepareCreatorCoverageResolver } from './creator-coverage.ts';
import type { FollowedChannel, LibraryVideo, VideoMetadataProvenance } from './types';

export function emptySettingsAudit() {
  return { smartTagStatus: { local: 0, tagged: 0, waiting: 0 },
    metadataTailCoverage: [] as Array<{ source: string; total: number; tagged: number; waiting: number; locked: number }>,
    creatorCoverage: { total: 0, present: 0, repairable: 0, unresolved: 0, ambiguous: [] as Array<{ id: string; name: string; candidates: string[] }> },
    companionInspectionCandidates: [] as LibraryVideo[],
    vision: { processed: 0, waiting: 0, eligible: false }, hiddenTitles: [] as Array<{ id: string; name: string }> };
}
export type SettingsAuditInput = { videos: LibraryVideo[]; tags: Record<string, string[]>;
  metadata: Record<string, VideoMetadataProvenance>; follows: FollowedChannel[]; hidden: Record<string, boolean> };

/** One indexed pass. Hidden-key export also yields rather than enumerating
 * a complete sparse record synchronously at the end of the audit. */
export async function prepareSettingsAudit(input: SettingsAuditInput, turn: () => Promise<void>) {
  const resolve = await prepareCreatorCoverageResolver(input.follows, turn);
  const audit = emptySettingsAudit(), coverage = new Map<string, typeof audit.metadataTailCoverage[number]>();
  const hiddenNames = new Map<string, string>();
  await forEachCatalogSlice(input.videos, video => {
    const rowTags = input.tags[video.id] ?? [], locked = input.metadata[video.id]?.lockedFields?.includes('tags');
    if (input.hidden[video.id]) hiddenNames.set(video.id, video.name);
    const source = video.remote?.kind ?? 'local';
    const row = coverage.get(source) ?? { source, total: 0, tagged: 0, waiting: 0, locked: 0 };
    row.total++; if (rowTags.length) row.tagged++; else if (locked) row.locked++; else row.waiting++;
    coverage.set(source, row);
    if (!video.remote) {
      audit.smartTagStatus.local++;
      if (rowTags.some(tag => /^(?:year-|month-|type-|source-)/.test(tag))) audit.smartTagStatus.tagged++;
      if (rowTags.some(tag => tag.startsWith('vision-'))) audit.vision.processed++; else audit.vision.waiting++;
      if (!locked) audit.vision.eligible = true;
      if (audit.companionInspectionCandidates.length < 12 && /^(?:[a-z]:[\\/]|\\\\[^\\]+\\[^\\]+[\\/]|\/)/i.test(video.path)) audit.companionInspectionCandidates.push(video);
    } else if (video.remote.kind === 'youtube' || video.remote.kind === 'twitch') {
      audit.creatorCoverage.total++;
      const resolution = resolve(video);
      if (resolution.status === 'present') audit.creatorCoverage.present++;
      else if (resolution.status === 'resolved') audit.creatorCoverage.repairable++;
      else if (resolution.status === 'unresolved') audit.creatorCoverage.unresolved++;
      else if (resolution.status === 'ambiguous' && audit.creatorCoverage.ambiguous.length < 48)
        audit.creatorCoverage.ambiguous.push({ id: video.id, name: video.name, candidates: resolution.candidates });
    }
  }, turn);
  audit.smartTagStatus.waiting = audit.smartTagStatus.local - audit.smartTagStatus.tagged;
  audit.metadataTailCoverage = [...coverage.values()].sort((a, b) => b.waiting - a.waiting || b.total - a.total || a.source.localeCompare(b.source));
  await forEachCatalogEntry(sparseRecordScan(input.hidden), row => {
    if (row) audit.hiddenTitles.push({ id: row[0], name: hiddenNames.get(row[0]) ?? row[0] });
  }, turn);
  await turn();
  return audit;
}
