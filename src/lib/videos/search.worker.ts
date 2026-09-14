/// <reference lib="webworker" />

import { topicsForVideo } from "./topics";
import type { LibraryVideo } from "./types";
let generation = 0;
const byToken = new Map<string, Set<string>>();

function tokens(text: string) { return text.toLowerCase().split(/[^a-z0-9_]+/).filter(Boolean); }
function search(query: string) {
  let found: Set<string> | null = null;
  for (const token of tokens(query)) {
    const matches = new Set<string>();
    for (const [key, ids] of byToken) if (key.startsWith(token) || (token.length >= 4 && key.includes(token))) for (const id of ids) matches.add(id);
    if (found) {
      const intersection = new Set<string>();
      for (const id of found) if (matches.has(id)) intersection.add(id);
      found = intersection;
    } else found = matches;
  }
  return [...(found ?? [])];
}
self.onmessage = ({ data }: MessageEvent<
  { type: "batch"; generation: number; reset: boolean; done: boolean; batch: Array<{ video: LibraryVideo; tags: string[]; category?: string }> } |
  { type: "search"; generation: number; requestId: number; query: string }
>) => {
  if (data.type === "batch") {
    if (data.reset) { byToken.clear(); generation = data.generation; }
    if (data.generation !== generation) return;
    for (const { video: v, tags, category } of data.batch) {
      const text = [v.name, v.path, v.genre, v.tagline, v.collection, v.description, category, ...tags, ...topicsForVideo(v, tags), v.remote?.channelName, v.remote?.channelId, v.remote?.kind].filter(Boolean).join(" ");
      for (const token of new Set(tokens(text))) (byToken.get(token) ?? byToken.set(token, new Set()).get(token)!).add(v.id);
    }
    self.postMessage({ type: data.done ? "ready" : "next", generation });
    return;
  }
  if (data.generation === generation) self.postMessage({ type: "result", generation, requestId: data.requestId, ids: search(data.query) });
};
