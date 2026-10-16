/// <reference lib="webworker" />
import { calculateLibraryStats, type StatsInput } from './library-stats';

const input: StatsInput = { videos: [], folders: [], tags: {}, favorites: {}, likes: {}, unavailable: {}, history: [], cameCounts: {}, progress: {}, resumeProgress: {}, viewCounts: {}, pullHistory: [], ratings: {}, tagLikes: {}, watchTime: {} };
self.onmessage = ({ data }: MessageEvent<{ field: keyof StatsInput; rows: unknown[] } | { done: true }>) => {
  if ('done' in data) {
    try { self.postMessage({ data: calculateLibraryStats(input) }); }
    catch { self.postMessage({ error: true }); }
    return;
  }
  const target = input[data.field];
  if (Array.isArray(target)) (target as unknown[]).push(...data.rows);
  else for (const [key, value] of data.rows as Array<[string, unknown]>) Object.defineProperty(target, key, { value, configurable: true, writable: true, enumerable: true });
  self.postMessage({ next: true });
};
