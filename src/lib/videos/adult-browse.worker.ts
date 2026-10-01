import { buildAdultBrowseModel, createAdultBrowseCache, type AdultBrowseCache, type AdultBrowseData, type AdultBrowseParams, type AdultBrowseSignals } from "./adult-browse-model";

type Request =
  | { type: 'catalog-start' }
  | { type: 'catalog-chunk'; list: 'videos' | 'personalVideos' | 'deepVideos'; videos: AdultBrowseData['videos']; tags: AdultBrowseData['tags'] }
  | { type: "catalog"; videos: AdultBrowseData["videos"]; personalVideos: AdultBrowseData["videos"]; deepVideos: AdultBrowseData["videos"]; tags: AdultBrowseData["tags"] }
  | { type: "signals"; signals: AdultBrowseSignals }
  | { type: "browse"; requestId: number; params: AdultBrowseParams };
let catalog: Omit<AdultBrowseData, "signals"> | undefined;
let signals: AdultBrowseSignals | undefined;
let cache: AdultBrowseCache = createAdultBrowseCache();
self.onmessage = ({ data }: MessageEvent<Request>) => {
  if (data.type === 'catalog-start') { catalog = { videos: [], personalVideos: [], deepVideos: [], tags: {} }; cache = createAdultBrowseCache(); return; }
  if (data.type === 'catalog-chunk') {
    if (!catalog) return;
    for (const video of data.videos) catalog[data.list].push(video);
    Object.assign(catalog.tags, data.tags); cache = createAdultBrowseCache(); return;
  }
  if (data.type === "catalog") { catalog = data; cache = createAdultBrowseCache(); return; }
  if (data.type === "signals") {
    signals = data.signals;
    cache.ranked.clear(); cache.tagRanks.clear(); cache.metaTagRanks.clear(); cache.deepRankedIds = undefined;
    return;
  }
  try {
    if (!catalog || !signals) throw new Error("Catalog is not ready");
    const result = buildAdultBrowseModel({ ...catalog, signals }, data.params, cache);
    self.postMessage({ requestId: data.requestId, result });
  } catch {
    self.postMessage({ requestId: data.requestId, error: true });
  }
};
