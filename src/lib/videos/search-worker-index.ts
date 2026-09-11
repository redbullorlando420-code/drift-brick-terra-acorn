import type { LibraryVideo } from "./types";
import { topicsForVideo } from "./topics";
let worker: Worker | null = null;
let sequence = 0;
const pending = new Map<number, (ids: string[]) => void>();
type SearchWorkerStatus = "idle" | "building" | "ready";
let status: SearchWorkerStatus = "idle";
const listeners = new Set<(status: SearchWorkerStatus) => void>();
function setStatus(next: SearchWorkerStatus) { status = next; listeners.forEach((listener) => listener(status)); }
function instance() {
  if (!worker) {
    worker = new Worker(new URL("./search.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }: MessageEvent<{ type: "result"; requestId: number; ids: string[] } | { type: "ready" }>) => {
      if (data.type === "ready") { setStatus("ready"); return; }
      pending.get(data.requestId)?.(data.ids);
    };
  }
  return worker;
}
export const searchWorkerIndex = {
  sync(videos: LibraryVideo[], tags: Record<string, string[]>, categories: Record<string, string>) {
    const documents = videos.map((v) => ({ id: v.id, text: [v.name, v.path, v.genre, v.tagline, v.collection, v.description, categories[v.id], ...(tags[v.id] ?? []), ...topicsForVideo(v, tags[v.id]), v.remote?.channelName, v.remote?.channelId, v.remote?.kind].filter(Boolean).join(" ") }));
    setStatus("building");
    instance().postMessage({ type: "sync", documents });
  },
  search(query: string) { return new Promise<string[]>((resolve) => { const requestId = ++sequence; pending.set(requestId, (ids) => { pending.delete(requestId); resolve(ids); }); instance().postMessage({ type: "search", requestId, query }); }); },
  getStatus() { return status; },
  subscribe(listener: (next: SearchWorkerStatus) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
};
