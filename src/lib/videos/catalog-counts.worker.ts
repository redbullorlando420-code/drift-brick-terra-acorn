import { addCountBatch, emptyCatalogCounts, type CountRow } from "./catalog-counts";
let counts = emptyCatalogCounts();
self.onmessage = ({ data }: MessageEvent<{ reset: boolean; done: boolean; rows: CountRow[] }>) => {
  if (data.reset) counts = emptyCatalogCounts();
  addCountBatch(counts, data.rows);
  self.postMessage(data.done ? { type: "done", counts } : { type: "next" });
};
