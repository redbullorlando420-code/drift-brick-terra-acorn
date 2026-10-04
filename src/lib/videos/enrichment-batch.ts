import { sparseRecordBuilder } from '../sparse-record.ts';
import type { CachedTagPatch } from './tag-patches';
import type { VideoMetadataProvenance } from './types';

export type EnrichmentLedgers = { tags: Record<string, string[]>; metadataProvenance: Record<string, VideoMetadataProvenance> };
export type EnrichmentRow = { id: string; tags: string[]; provenance: VideoMetadataProvenance };
/** Copy only touched hash branches. Recheck the ledgers after every task and
 * before publishing; no enumeration or materialization of the base record. */
export async function prepareEnrichmentBatch(get: () => EnrichmentLedgers, patches: ReadonlyMap<string, CachedTagPatch>, turn: () => Promise<void>) {
  const base = get(), rows: EnrichmentRow[] = [];
  for (const [id, patch] of patches) {
    if (base.tags[id] !== patch.beforeTags || base.metadataProvenance[id] !== patch.beforeProvenance
      || base.metadataProvenance[id]?.lockedFields?.includes('tags')) continue;
    rows.push({ id, tags: patch.tags, provenance: patch.provenance });
  }
  if (!rows.length) return { base, next: base, rows };
  const checkedTurn = async () => {
    await turn(); const latest = get();
    if (latest.tags !== base.tags || latest.metadataProvenance !== base.metadataProvenance)
      throw new DOMException('Metadata changed during preparation', 'AbortError');
  };
  await checkedTurn();
  const tags = sparseRecordBuilder(base.tags), metadataProvenance = sparseRecordBuilder(base.metadataProvenance);
  let visited = 0, started = performance.now();
  for (const row of rows) {
    tags.set(row.id, row.tags); metadataProvenance.set(row.id, row.provenance);
    if (++visited >= 64 || performance.now() - started >= 4) { await checkedTurn(); visited = 0; started = performance.now(); }
  }
  return { base, next: { tags: tags.finish(), metadataProvenance: metadataProvenance.finish() }, rows };
}

/** Older snapshots may resolve after a completed enrichment batch. Its small
 * durable row wins only over older unlocked metadata; manual journals apply last. */
export function recoveredEnrichmentRow(ledgers: EnrichmentLedgers, row: EnrichmentRow): EnrichmentRow | undefined {
  const existing = ledgers.metadataProvenance[row.id];
  if (existing?.lockedFields?.includes('tags') || (existing?.updatedAt ?? 0) > (row.provenance.updatedAt ?? 0)) return;
  if (existing?.updatedAt === row.provenance.updatedAt && ledgers.tags[row.id]
    && (ledgers.tags[row.id].length !== row.tags.length || ledgers.tags[row.id].some((tag, index) => tag !== row.tags[index]))) return;
  return { ...row, provenance: { ...row.provenance, ...existing,
    ...((row.provenance.youtubeTextTagVersion || existing?.youtubeTextTagVersion) ? {
      youtubeTextTagVersion: Math.max(row.provenance.youtubeTextTagVersion ?? 0, existing?.youtubeTextTagVersion ?? 0),
    } : {}),
    tags: Object.fromEntries(row.tags.map(tag => [tag, existing?.tags[tag] ?? row.provenance.tags[tag]])),
    updatedAt: row.provenance.updatedAt } };
}
/** Legacy small mutable scratch records, used by import/recovery callers. */
export function restoreEnrichmentRow(ledgers: EnrichmentLedgers, row: EnrichmentRow) {
  const restored = recoveredEnrichmentRow(ledgers, row);
  if (!restored) return;
  Object.defineProperty(ledgers.tags, row.id, { value: restored.tags, enumerable: true, writable: true, configurable: true });
  Object.defineProperty(ledgers.metadataProvenance, row.id, { value: restored.provenance, enumerable: true, writable: true, configurable: true });
}
