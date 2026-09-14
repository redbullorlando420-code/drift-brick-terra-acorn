import { buildAdultBrowseModel, type AdultBrowseData, type AdultBrowseParams, type AdultBrowseSignals } from "./adult-browse-model";

type Request =
  | { type: "catalog"; videos: AdultBrowseData["videos"]; personalVideos: AdultBrowseData["videos"]; deepVideos: AdultBrowseData["videos"]; tags: AdultBrowseData["tags"] }
  | { type: "signals"; signals: AdultBrowseSignals }
  | { type: "browse"; requestId: number; params: AdultBrowseParams };
let catalog: Omit<AdultBrowseData, "signals"> | undefined;
let signals: AdultBrowseSignals | undefined;
self.onmessage = ({ data }: MessageEvent<Request>) => {
  if (data.type === "catalog") { catalog = data; return; }
  if (data.type === "signals") { signals = data.signals; return; }
  try {
    if (!catalog || !signals) throw new Error("Catalog is not ready");
    const result = buildAdultBrowseModel({ ...catalog, signals }, data.params);
    self.postMessage({ requestId: data.requestId, result });
  } catch {
    self.postMessage({ requestId: data.requestId, error: true });
  }
};
