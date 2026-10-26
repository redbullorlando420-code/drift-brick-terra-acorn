import { getTopicAliases,EMPTY_TOPIC_ALIASES,type TopicAliasLedger } from './topic-aliases.ts';
import { yieldCatalogTask } from '../catalog-work';
import type { LibraryVideo } from "./types";

// Keep tokenization and topic inference off the UI thread. Transfer one small
// batch at a time; the acknowledgement provides backpressure during imports.
export type SearchMatches = { ids: string[]; positions: Uint32Array; videos: LibraryVideo[] };
let worker: Worker | null = null;
let sequence = 0;
let generation = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let source: { videos: LibraryVideo[]; tags: Record<string, string[]>; categories: Record<string, string> } | undefined;
let offset = 0;
const pending = new Map<number, { query: string; topicAliases: TopicAliasLedger; resolve: (ids: SearchMatches | null) => void; cleanup: () => void }>();
type SearchWorkerStatus = "idle" | "building" | "ready" | "failed";
let status: SearchWorkerStatus = "idle";
let lastFailure="";
const listeners = new Set<(status: SearchWorkerStatus) => void>();
function setStatus(next: SearchWorkerStatus) { status = next; listeners.forEach((listener) => listener(status)); }
function fail(reason="Search worker stopped", owner=worker, expected=generation) {
  if(owner!==worker||expected!==generation)return;
  generation++;lastFailure=reason;offset=0;
  clearTimeout(timer);
  clearTimeout(idleTimer);
  idleTimer = undefined;
  worker?.terminate(); worker = null; source = undefined;
  setStatus("failed");
  for (const request of pending.values()) { request.cleanup(); request.resolve(null); }
  pending.clear();
}
function releaseWhenIdle() {
  if (pending.size || status !== "ready" || idleTimer !== undefined) return;
  idleTimer = setTimeout(() => {
    idleTimer = undefined;
    if (pending.size || status !== "ready") return;
    worker?.terminate();
    worker = null;
    source = undefined;
    setStatus("idle");
  }, 60_000);
}
function release() {
  clearTimeout(timer);
  clearTimeout(idleTimer);
  idleTimer = undefined;
  worker?.terminate();
  worker = null;
  source = undefined;
  generation++;
  for (const request of pending.values()) { request.cleanup(); request.resolve(null); }
  pending.clear();
  setStatus("idle");
}
function watch() { clearTimeout(timer);if(!worker)return;const owner=worker,expected=generation;timer = setTimeout(()=>fail("Search worker timed out",owner,expected), 15_000); }
function post(message:unknown){try{worker?.postMessage(message);}catch{fail("Search worker could not receive its next packet");}}
function ready() {
  clearTimeout(timer); setStatus('ready');
  for (const [requestId, request] of pending) post({ type: 'search', generation, requestId, query: request.query, topicAliases: request.topicAliases });
  if (pending.size) watch(); else releaseWhenIdle();
}
function queueBatch() { const expected = generation; void yieldCatalogTask().then(() => { if (generation === expected && source && worker) sendBatch(); }).catch(()=>{if(generation===expected)fail("Search preparation failed");}); }
function sendBatch() {
  if (!source || !worker) return;
  const { videos, tags, categories } = source;
  const batch = [], started = performance.now();
  let characters = 0;
  const reset = offset === 0;
  // Backpressure still permits only one packet in flight. Dense metadata stops
  // the packet early; compact catalogs avoid hundreds of needless round trips.
  while (offset < videos.length && batch.length < 512) {
    const v = videos[offset++]!, videoTags = tags[v.id] ?? [];
    batch.push({
    video: { id: v.id, name: v.name, path: v.path, genre: v.genre, tagline: v.tagline, collection: v.collection, description: v.description,
      remote: v.remote && { channelName: v.remote.channelName, channelId: v.remote.channelId, kind: v.remote.kind } },
    tags: videoTags, category: categories[v.id],
    });
    characters += v.id.length + v.name.length + v.path.length + (v.genre?.length ?? 0)
      + (v.tagline?.length ?? 0) + (v.collection?.length ?? 0) + (v.description?.length ?? 0)
      + (categories[v.id]?.length ?? 0) + (v.remote?.channelName?.length ?? 0) + (v.remote?.channelId?.length ?? 0);
    for (const tag of videoTags) characters += tag.length;
    if (characters >= 65_536 || performance.now() - started >= 2) break;
  }
  watch();
  post({ type: "batch", generation, reset, done: offset >= videos.length, batch });
}
function instance() {
  if (!worker) {
    worker = new Worker(new URL("./search.worker.ts", import.meta.url), { type: "module" });
    const owner=worker;
    worker.onerror = event=>{event.preventDefault();if(worker===owner)fail("Search worker stopped",owner);};
    worker.onmessageerror = ()=>{if(worker===owner)fail("Search worker returned an unreadable message",owner);};
    worker.onmessage = ({ data }) => {
      if (worker!==owner||data?.generation !== generation) return;
      if (data.type === "next") { clearTimeout(timer); queueBatch(); return; }
      if (data.type === "ready") {
        ready();
        return;
      }
      if(data.type!=="result"||!Array.isArray(data.ids)||!(data.positions instanceof Uint32Array)||data.ids.length!==data.positions.length||data.ids.length>(source?.videos.length??0)){fail("Search worker returned an invalid result",owner);return;}
      const request = pending.get(data.requestId);
      request?.cleanup(); request?.resolve(source ? { ids: data.ids, positions: data.positions, videos: source.videos } : null);
      pending.delete(data.requestId);
      if (!pending.size) { clearTimeout(timer); releaseWhenIdle(); }
    };
  }
  return worker;
}
export const searchWorkerIndex = {
  release,
  retire() { if (!pending.size && status === 'building') release(); else releaseWhenIdle(); },
  async search(query: string, signal?: AbortSignal): Promise<string[] | null> { return (await this.searchMatches(query, signal))?.ids ?? null; },
  retry(videos:LibraryVideo[],tags:Record<string,string[]>,categories:Record<string,string>){if(status!=="failed")return;setStatus("idle");this.sync(videos,tags,categories);},
  diagnostics(){return {status,generation,pending:pending.size,packed:offset,workers:worker?1:0,lastFailure};},
  sync(videos: LibraryVideo[], tags: Record<string, string[]>, categories: Record<string, string>) {
    if(status==="failed")return;
    clearTimeout(idleTimer);
    idleTimer = undefined;
    if (source?.videos === videos && source.tags === tags && source.categories === categories) return;
    const previous = source;
    const mayReuseIndex = status === "ready"
      && previous != null
      && tags === previous.tags
      && categories === previous.categories
      && videos.length >= previous.videos.length;
    for(const request of pending.values()){request.cleanup();request.resolve(null);}pending.clear();
    source = { videos, tags, categories }; offset = 0; generation++;lastFailure="";
    clearTimeout(timer); setStatus("building");
    if (mayReuseIndex) {
      const expected = generation;
      void (async () => {
        // Do not read a million references on a click/effect stack. A newer
        // snapshot or release cancels this comparison before its next slice.
        let checked = 0;
        while (checked < previous.videos.length) {
          await yieldCatalogTask();
          if (generation !== expected || !worker) return;
          const started = performance.now(), end = Math.min(previous.videos.length, checked + 2048);
          while (checked < end) {
            if (previous.videos[checked] !== videos[checked]) { queueBatch(); return; }
            checked++;
            if (performance.now() - started >= 2) break;
          }
        }
        if (generation !== expected || !worker) return;
        post({ type: 'continue', generation });
        offset = previous.videos.length;
        if (offset === videos.length) ready(); else queueBatch();
      })().catch(() => { if (generation === expected) fail(); });
      return;
    }
    try { instance();watch();queueBatch(); } catch { fail("Search worker could not start"); }
  },
  searchMatches(query: string, signal?: AbortSignal, reviewed = true): Promise<SearchMatches | null> {
    clearTimeout(idleTimer);
    idleTimer = undefined;
    if (signal?.aborted || status === "failed" || status === "idle") return Promise.resolve(null);
    return new Promise((resolve) => {
      const requestId = ++sequence;
      const cancel = () => {
        pending.delete(requestId);
        signal?.removeEventListener('abort', cancel);
        resolve(null);
        if (!pending.size && status === 'ready') { clearTimeout(timer); releaseWhenIdle(); }
      };
      if(pending.size>=8){const oldest=pending.entries().next().value;if(oldest){pending.delete(oldest[0]);oldest[1].cleanup();oldest[1].resolve(null);}}
      pending.set(requestId, { query, topicAliases: reviewed ? getTopicAliases() : EMPTY_TOPIC_ALIASES, resolve, cleanup: () => { signal?.removeEventListener('abort', cancel); } });
      signal?.addEventListener('abort', cancel, { once: true });
      if (status === "ready") { post({ type: "search", generation, requestId, query, topicAliases: reviewed ? getTopicAliases() : EMPTY_TOPIC_ALIASES }); watch(); }
    });
  },
  getStatus() { return status; },
  subscribe(listener: (next: SearchWorkerStatus) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
};
