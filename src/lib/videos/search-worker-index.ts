import type { LibraryVideo } from "./types";

// Keep tokenization and topic inference off the UI thread. Transfer one small
// batch at a time; the acknowledgement provides backpressure during imports.
let worker: Worker | null = null;
let sequence = 0;
let generation = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let source: { videos: LibraryVideo[]; tags: Record<string, string[]>; categories: Record<string, string> } | undefined;
let offset = 0;
const pending = new Map<number, { query: string; resolve: (ids: string[] | null) => void }>();
type SearchWorkerStatus = "idle" | "building" | "ready" | "failed";
let status: SearchWorkerStatus = "idle";
const listeners = new Set<(status: SearchWorkerStatus) => void>();
function setStatus(next: SearchWorkerStatus) { status = next; listeners.forEach((listener) => listener(status)); }
function fail() {
  clearTimeout(timer);
  clearTimeout(idleTimer);
  worker?.terminate(); worker = null; source = undefined;
  setStatus("failed");
  for (const request of pending.values()) request.resolve(null);
  pending.clear();
}
function releaseWhenIdle() {
  clearTimeout(idleTimer);
  if (pending.size || status !== "ready") return;
  idleTimer = setTimeout(() => {
    if (pending.size || status !== "ready") return;
    worker?.terminate();
    worker = null;
    source = undefined;
    setStatus("idle");
  }, 60_000);
}
function watch() { clearTimeout(timer); timer = setTimeout(fail, 15_000); }
function sendBatch() {
  if (!source || !worker) return;
  const { videos, tags, categories } = source;
  const batch = videos.slice(offset, offset + 128).map((v) => ({
    video: { id: v.id, name: v.name, path: v.path, genre: v.genre, tagline: v.tagline, collection: v.collection, description: v.description,
      remote: v.remote && { channelName: v.remote.channelName, channelId: v.remote.channelId, kind: v.remote.kind } },
    tags: tags[v.id] ?? [], category: categories[v.id],
  }));
  const reset = offset === 0;
  offset += batch.length;
  watch();
  worker.postMessage({ type: "batch", generation, reset, done: offset >= videos.length, batch });
}
function instance() {
  if (!worker) {
    worker = new Worker(new URL("./search.worker.ts", import.meta.url), { type: "module" });
    worker.onerror = fail;
    worker.onmessageerror = fail;
    worker.onmessage = ({ data }) => {
      if (data.generation !== generation) return;
      if (data.type === "next") { clearTimeout(timer); timer = setTimeout(sendBatch, 0); return; }
      if (data.type === "ready") {
        clearTimeout(timer); setStatus("ready");
        for (const [requestId, request] of pending) worker?.postMessage({ type: "search", generation, requestId, query: request.query });
        if (pending.size) watch();
        else releaseWhenIdle();
        return;
      }
      pending.get(data.requestId)?.resolve(data.ids);
      pending.delete(data.requestId);
      if (!pending.size) { clearTimeout(timer); releaseWhenIdle(); }
    };
  }
  return worker;
}
export const searchWorkerIndex = {
  sync(videos: LibraryVideo[], tags: Record<string, string[]>, categories: Record<string, string>) {
    clearTimeout(idleTimer);
    if (source?.videos === videos && source.tags === tags && source.categories === categories) return;
    source = { videos, tags, categories }; offset = 0; generation++;
    clearTimeout(timer); setStatus("building");
    try { instance(); timer = setTimeout(sendBatch, 0); } catch { fail(); }
  },
  search(query: string): Promise<string[] | null> {
    clearTimeout(idleTimer);
    if (status === "failed" || status === "idle") return Promise.resolve(null);
    return new Promise((resolve) => {
      const requestId = ++sequence;
      pending.set(requestId, { query, resolve });
      if (status === "ready") { worker?.postMessage({ type: "search", generation, requestId, query }); watch(); }
    });
  },
  getStatus() { return status; },
  subscribe(listener: (next: SearchWorkerStatus) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
};
