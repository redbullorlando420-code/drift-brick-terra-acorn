import { decodeSparseRecord, encodeSparseRecord, patchSparseRecord, type EncodedSparseRecord } from '../sparse-record.ts';
import type { ResumeMark } from './types.ts';

type ActivityRecords = { progress?: Record<string, ResumeMark>; resumeProgress?: Record<string, ResumeMark>;
  viewCounts?: Record<string, number>; cameCounts?: Record<string, number> };
type SparseActivity = { progress?: EncodedSparseRecord<ResumeMark>; resumeProgress?: EncodedSparseRecord<ResumeMark>;
  viewCounts?: EncodedSparseRecord<number>; cameCounts?: EncodedSparseRecord<number> };
export type StoredActivity<T> = T & { sparseActivityRecords?: SparseActivity };
const fields = ['progress', 'resumeProgress', 'viewCounts', 'cameCounts'] as const;
const recent = new WeakMap<object, string[]>();
const MIRROR_LIMIT = 200;

/** One watch update copies only touched trie branches. Keep a bounded list of
 * recently touched keys for the emergency localStorage mirror, too. */
export function patchActivityRecord<T>(source: Record<string, T>, entries: readonly (readonly [string, T])[]) {
  const result = patchSparseRecord(source, entries);
  if (result === source) return source;
  const touched = new Set(entries.map(([key]) => key));
  recent.set(result, [...(recent.get(source) ?? []).filter(key => !touched.has(key)), ...touched].slice(-MIRROR_LIMIT));
  return result;
}

/** Mirrors stay small; full activity remains in IndexedDB. Explicit imports
 * and legacy plain records take the full-key path only outside hot updates. */
export function recentActivityRecord<T>(source: Record<string, T>) {
  let keys = recent.get(source);
  if (!keys) { keys = Object.keys(source).slice(-MIRROR_LIMIT); recent.set(source, keys); }
  return Object.fromEntries(keys.map(key => [key, source[key]])) as Record<string, T>;
}

/** An emergency mirror can be newer than a failed IndexedDB write. Compare
 * timestamps so recovery also preserves backward seeks and completed videos. */
export function mergeResumeRecords(base: Record<string, ResumeMark>, mirror: Record<string, ResumeMark>) {
  return patchActivityRecord(base, Object.entries(mirror).filter(([key, mark]) => !base[key] || mark.at > base[key].at));
}

/** Full startup recovery is an explicit boundary. Preferences, activity
 * snapshots and dedicated stores may finish in different orders. */
export function recoverResumeRecords(...records: Array<Record<string, ResumeMark> | undefined>) {
  const result: Record<string, ResumeMark> = {};
  for (const record of records) if (record) for (const key of Object.keys(record)) {
    const mark = record[key];
    if (mark && (!result[key] || mark.at > result[key].at)) result[key] = mark;
  }
  return result;
}
export function recoverActivityCounts(...records: Array<Record<string, number> | undefined>) {
  const result: Record<string, number> = {};
  for (const record of records) if (record) for (const key of Object.keys(record)) result[key] = Math.max(result[key] ?? 0, record[key] ?? 0);
  return result;
}

/** Proxies cannot be structured cloned. Preserve the plain baseline for old
 * readers and attach its immutable tree for new readers without enumerating. */
export function encodeActivityRecords<T extends ActivityRecords>(value: T): StoredActivity<T> {
  const result = { ...value } as StoredActivity<T>;
  const sparse: SparseActivity = {};
  for (const field of fields) {
    const record = value[field];
    if (!record) continue;
    const encoded = encodeSparseRecord(record as Record<string, unknown>);
    if (encoded === record) continue;
    const tree = encoded as EncodedSparseRecord<unknown>;
    (result as ActivityRecords)[field] = tree.snapshot.base as Record<string, ResumeMark> & Record<string, number>;
    (sparse as Record<string, unknown>)[field] = tree;
  }
  if (Object.keys(sparse).length) result.sparseActivityRecords = sparse;
  return result;
}

export function decodeActivityRecords<T extends ActivityRecords>(value: StoredActivity<T>): T {
  const { sparseActivityRecords, ...rest } = value;
  const result = rest as T;
  for (const field of fields) if (sparseActivityRecords?.[field])
    (result as ActivityRecords)[field] = decodeSparseRecord(sparseActivityRecords[field]) as Record<string, ResumeMark> & Record<string, number>;
  return result;
}
