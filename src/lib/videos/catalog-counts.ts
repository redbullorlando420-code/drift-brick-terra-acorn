export type CatalogCounts = { publicCount: number; ytCount: number; twitchCount: number; liveCount: number; favCount: number; historyCount: number; adultCount: number };
export const emptyCatalogCounts = (): CatalogCounts => ({ publicCount: 0, ytCount: 0, twitchCount: 0, liveCount: 0, favCount: 0, historyCount: 0, adultCount: 0 });
// A packet carries numeric flags and history multiplicity, never video metadata.
export type CountRow = [flags: number, historyEvents: number];
export function addCountBatch(counts: CatalogCounts, rows: CountRow[]) {
  for (const [flags, events] of rows) {
    if (flags & 1) counts.publicCount++;
    if (flags & 2) counts.ytCount++;
    if (flags & 4) counts.twitchCount++;
    if (flags & 8) counts.liveCount++;
    if (flags & 16) counts.favCount++;
    if (flags & 32) counts.adultCount++;
    counts.historyCount += events;
  }
  return counts;
}
