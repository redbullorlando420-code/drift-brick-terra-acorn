import { aliasLabel,aliasSearchTerms,normalizeTopicAliases,EMPTY_TOPIC_ALIASES,type TopicAliasLedger } from './topic-aliases.ts';
/// <reference lib="webworker" />

import { topicsForVideo } from "./topics";
import type { LibraryVideo } from "./types";
import { createSearchTokenQuery } from "./search-token-query";
import { CompactPostings } from "./compact-postings";
let generation = 0;
const byToken = new CompactPostings();
const idsByTag = new CompactPostings();
const documentIds: string[] = [];
let activeAliases=EMPTY_TOPIC_ALIASES;
const tokenQuery = createSearchTokenQuery(byToken, () => documentIds.length, 2*1024*1024,24,(token,visit)=>{for(const key of aliasSearchTerms(token,activeAliases)){idsByTag.forEach(key,visit);if(key===activeAliases.entries.find(row=>row.alias===aliasLabel(token))?.topic)byToken.forEach(key,visit);}});

function tokens(text: string) {
  const out: string[] = [];
  const lower = text.toLowerCase();
  let start = -1;
  for (let i = 0; i <= lower.length; i++) {
    const ch = lower.charCodeAt(i);
    const isWord =
      i < lower.length &&
      ((ch >= 48 && ch <= 57) || (ch >= 97 && ch <= 122) || ch === 95 || ch === 45);
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
  if (!needle) return [] as number[];
  if ((needle.includes("-") || /^(?:fetish|genre|meta|creator|sub|source)-/.test(needle)) && !aliasSearchTerms(needle,activeAliases).length) {
    const exact: number[] = [];
    const bare = needle.replace(/^(?:fetish|genre|meta|creator|sub|source)-/, "");
    const seen = new Set<string>();
    for (const key of new Set([needle, bare, `fetish-${bare}`, `genre-${bare}`])) {
      idsByTag.forEach(key, (id) => {
        const key = documentIds[id]!;
        if (!seen.has(key)) {
          seen.add(key);
          exact.push(id);
        }
      });
    }
    if (exact.length) return exact.sort((a, b) => a - b);
  }
  const wanted = activeAliases.entries.some(row=>row.alias===aliasLabel(needle)) ? [aliasLabel(needle)] : tokens(needle);
  const found = tokenQuery.search(wanted);
  const result: number[] = [],
    seen = new Set<string>();
  for (const id of found)
    if (!seen.has(documentIds[id]!)) {
      seen.add(documentIds[id]!);
      result.push(id);
    }
  return result;
}

self.onmessage = ({
  data,
}: MessageEvent<
  | {
      type: "batch";
      generation: number;
      reset: boolean;
      done: boolean;
      batch: Array<{ video: LibraryVideo; tags: string[]; category?: string }>;
    }
  | { type: "continue"; generation: number }
  | { type: "search"; generation: number; requestId: number; query: string; topicAliases?: TopicAliasLedger }
>) => {
  if (data.type === "continue") {
    generation = data.generation;
    tokenQuery.clear();
    return;
  }
  if (data.type === "batch") {
    if (data.reset) {
      tokenQuery.clear();
      byToken.clear();
      idsByTag.clear();
      documentIds.length = 0;
      generation = data.generation;
    }
    if (data.generation !== generation) return;
    if (data.batch.length) tokenQuery.clear();
    for (const { video: v, tags, category } of data.batch) {
      const ordinal = documentIds.length;
      documentIds.push(v.id);
      for (const tag of new Set(tags.map((entry) => entry.toLowerCase()))) {
        idsByTag.add(tag, ordinal);
      }
      const text = [
        v.name,
        v.path,
        v.genre,
        v.tagline,
        v.collection,
        v.description,
        category,
        ...tags,
        ...topicsForVideo(v, tags, false),
        v.remote?.channelName,
        v.remote?.channelId,
        v.remote?.kind,
      ]
        .filter(Boolean)
        .join(" ");
      for (const token of new Set(tokens(text))) byToken.add(token, ordinal);
    }
    self.postMessage({ type: data.done ? "ready" : "next", generation });
    return;
  }
  if (data.generation === generation) {
    const nextAliases = normalizeTopicAliases(data.topicAliases); if (JSON.stringify(nextAliases) !== JSON.stringify(activeAliases)) { activeAliases = nextAliases; tokenQuery.clear(); }
    const positions = Uint32Array.from(search(data.query));
    self.postMessage(
      {
        type: "result",
        generation,
        requestId: data.requestId,
        ids: Array.from(positions, (position) => documentIds[position]!),
        positions,
      },
      [positions.buffer],
    );
  }
};
