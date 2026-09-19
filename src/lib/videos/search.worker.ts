/// <reference lib="webworker" />

import { topicsForVideo } from "./topics";
import type { LibraryVideo } from "./types";
let generation = 0;
const byToken = new Map<string, Set<string>>();
const tagsById = new Map<string, string[]>();

function tokens(text: string) {
  const out: string[] = [];
  const lower = text.toLowerCase();
  let start = -1;
  for (let i = 0; i <= lower.length; i++) {
    const ch = lower.charCodeAt(i);
    const isWord = i < lower.length && ((ch >= 48 && ch <= 57) || (ch >= 97 && ch <= 122) || ch === 95 || ch === 45);
    if (isWord) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      if (i - start >= 1) {
        const token = lower.slice(start, i);
        out.push(token);
        if (token.includes("-") || token.includes("_")) {
          for (const part of token.split(/[-_]+/)) if (part) out.push(part);
        }
      }
      start = -1;
    }
  }
  return out;
}

function search(query: string) {
  const needle = query.trim().toLowerCase().replace(/^#/, "");
  if (!needle) return [] as string[];
  if (needle.includes("-") || /^(?:fetish|genre|meta|creator|sub|source)-/.test(needle)) {
    const exact: string[] = [];
    const bare = needle.replace(/^(?:fetish|genre|meta|creator|sub|source)-/, "");
    for (const [id, list] of tagsById) {
      for (const tag of list) {
        const t = tag.toLowerCase();
        if (t === needle || t === bare || t === `fetish-${bare}` || t === `genre-${bare}`) {
          exact.push(id);
          break;
        }
      }
    }
    if (exact.length) return exact;
  }
  let found: Set<string> | null = null;
  for (const token of tokens(needle)) {
    const matches = new Set<string>();
    const direct = byToken.get(token);
    if (direct) for (const id of direct) matches.add(id);
    for (const [key, ids] of byToken) {
      if (key === token) continue;
      if (key.startsWith(token) || (token.length >= 4 && key.includes(token))) for (const id of ids) matches.add(id);
    }
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
    if (data.reset) { byToken.clear(); tagsById.clear(); generation = data.generation; }
    if (data.generation !== generation) return;
    for (const { video: v, tags, category } of data.batch) {
      tagsById.set(v.id, tags);
      const text = [v.name, v.path, v.genre, v.tagline, v.collection, v.description, category, ...tags, ...topicsForVideo(v, tags), v.remote?.channelName, v.remote?.channelId, v.remote?.kind].filter(Boolean).join(" ");
      for (const token of new Set(tokens(text))) (byToken.get(token) ?? byToken.set(token, new Set()).get(token)!).add(v.id);
    }
    self.postMessage({ type: data.done ? "ready" : "next", generation });
    return;
  }
  if (data.generation === generation) self.postMessage({ type: "result", generation, requestId: data.requestId, ids: search(data.query) });
};
