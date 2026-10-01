/// <reference lib="webworker" />

import { topicsForVideo } from "./topics";
import type { LibraryVideo } from "./types";
import { CompactPostings } from './compact-postings';
let generation = 0;
const byToken = new CompactPostings();
const idsByTag = new CompactPostings();
const documentIds: string[] = [];

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
    const seen = new Set<string>();
    for (const key of new Set([needle, bare, `fetish-${bare}`, `genre-${bare}`])) {
      idsByTag.forEach(key, id => { const key = documentIds[id]!; if (!seen.has(key)) { seen.add(key); exact.push(key); } });
    }
    if (exact.length) return exact;
  }
  let found: Uint8Array | null = null;
  for (const token of tokens(needle)) {
    const matches = new Uint8Array(documentIds.length);
    byToken.forEach(token, id => { matches[id] = 1; });
    for (const key of byToken.keys()) {
      if (key === token) continue;
      if (key.startsWith(token) || (token.length >= 4 && key.includes(token))) byToken.forEach(key, id => { matches[id] = 1; });
    }
    if (found) {
      for (let id = 0; id < found.length; id++) found[id] &= matches[id]!;
    } else found = matches;
  }
  const result = new Set<string>();
  if (found) for (let id = 0; id < found.length; id++) if (found[id]) result.add(documentIds[id]!);
  return [...result];
}

self.onmessage = ({ data }: MessageEvent<
  { type: "batch"; generation: number; reset: boolean; done: boolean; batch: Array<{ video: LibraryVideo; tags: string[]; category?: string }> } |
  { type: "continue"; generation: number } |
  { type: "search"; generation: number; requestId: number; query: string }
>) => {
  if (data.type === "continue") {
    generation = data.generation;
    return;
  }
  if (data.type === "batch") {
    if (data.reset) { byToken.clear(); idsByTag.clear(); documentIds.length = 0; generation = data.generation; }
    if (data.generation !== generation) return;
    for (const { video: v, tags, category } of data.batch) {
      const ordinal = documentIds.length;
      documentIds.push(v.id);
      for (const tag of new Set(tags.map((entry) => entry.toLowerCase()))) {
        idsByTag.add(tag, ordinal);
      }
      const text = [v.name, v.path, v.genre, v.tagline, v.collection, v.description, category, ...tags, ...topicsForVideo(v, tags), v.remote?.channelName, v.remote?.channelId, v.remote?.kind].filter(Boolean).join(" ");
      for (const token of new Set(tokens(text))) byToken.add(token, ordinal);
    }
    self.postMessage({ type: data.done ? "ready" : "next", generation });
    return;
  }
  if (data.generation === generation) self.postMessage({ type: "result", generation, requestId: data.requestId, ids: search(data.query) });
};
