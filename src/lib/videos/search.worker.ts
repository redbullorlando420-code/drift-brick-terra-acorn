/// <reference lib="webworker" />

type SearchDocument = { id: string; text: string };
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
self.onmessage = ({ data }: MessageEvent<{ type: "sync"; documents: SearchDocument[] } | { type: "search"; requestId: number; query: string }>) => {
  if (data.type === "sync") {
    byToken.clear();
    for (const doc of data.documents) for (const token of new Set(tokens(doc.text))) (byToken.get(token) ?? byToken.set(token, new Set()).get(token)!).add(doc.id);
    self.postMessage({ type: "ready" });
    return;
  }
  self.postMessage({ type: "result", requestId: data.requestId, ids: search(data.query) });
};
