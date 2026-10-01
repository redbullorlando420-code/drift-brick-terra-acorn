import { appendPreviewRows, createPreviewCatalog, rankPreviewCatalog, type PreviewRanking, type PreviewRow } from "./preview-ranking.ts";

export type PreviewWorkerRequest =
  | { type: "reset"; generation: number; hearted: string[] }
  | { type: "append"; generation: number; rows: PreviewRow[] }
  | { type: "ready"; generation: number }
  | { type: "rank"; generation: number; requestId: number; id: string; seed: number };
export type PreviewWorkerResult = { generation: number; requestId: number; id: string; result: PreviewRanking };

/** A partial catalog cannot rank. A fast preview switch replaces the pending
 * target, and obsolete catalog chunks/results are discarded by generation. */
export function createPreviewRankingProcessor(emit: (result: PreviewWorkerResult) => void) {
  let generation = -1;
  let catalog = createPreviewCatalog([]);
  let ready = false;
  let pending: Extract<PreviewWorkerRequest, { type: "rank" }> | undefined;
  const rank = () => {
    if (!ready || !pending) return;
    const request = pending;
    pending = undefined;
    const result = rankPreviewCatalog(catalog, request.id, request.seed);
    const target = catalog.byId.get(request.id);
    const keys = new Set(target?.tags.map(tag => tag.replace(/^(?:keyword-|creator-)/i, "")));
    if (target?.creator) keys.add(target.creator.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    // The preview displays this title's tag scores. Keep the complete taste
    // ledger in the worker instead of cloning every catalog keyword per click.
    const tagScores: PreviewRanking["tagScores"] = Object.create(null);
    for (const key of keys) if (catalog.tagScores[key]) tagScores[key] = catalog.tagScores[key];
    emit({ generation, requestId: request.requestId, id: request.id, result: { ...result, tagScores } });
  };
  return (message: PreviewWorkerRequest) => {
    if (message.type === "reset") {
      if (message.generation <= generation) return;
      generation = message.generation;
      catalog = createPreviewCatalog(message.hearted);
      ready = false;
      pending = undefined;
    } else if (message.generation === generation) {
      if (message.type === "append" && !ready) appendPreviewRows(catalog, message.rows);
      if (message.type === "ready") { ready = true; rank(); }
      if (message.type === "rank") { pending = message; rank(); }
    }
  };
}
