export type PreviewRow = { id: string; folderId: string; genre?: string; kind?: string; creator: string; tags: string[]; rating: number; creatorRating: number; creatorLiked: boolean; live: boolean; eligible: boolean; adult?: boolean };
export type PreviewRanking = { related: string[]; recommended: string[]; tagScores: Record<string, { total: number; count: number }> };
export type PreviewCatalog = {
  byId: Map<string, PreviewRow>;
  publicRows: PreviewRow[];
  adultRows: PreviewRow[];
  tagScores: PreviewRanking["tagScores"];
  liked: Set<string>;
  preferred: Set<string>;
};
const preference = (r: number) => r === 1 ? -3 : r >= 3 ? Math.min(3, r - 2) : 0;
function shuffle(id: string, seed: number) { let n = seed >>> 0; for (const c of id) n = Math.imul(n ^ c.charCodeAt(0), 0x45d9f3b); return n >>> 0; }
function top(rows: Array<{ id: string; score: number; random: number }>, row: { id: string; score: number; random: number }, limit: number) {
  const at = rows.findIndex(old => row.score > old.score || (row.score === old.score && row.random < old.random));
  rows.splice(at < 0 ? rows.length : at, 0, row);
  if (rows.length > limit) rows.pop();
}
export function createPreviewCatalog(hearted: string[]): PreviewCatalog {
  return { byId: new Map(), publicRows: [], adultRows: [], tagScores: Object.create(null), liked: new Set(hearted), preferred: new Set(hearted) };
}

/** Compile shared taste evidence once. Hidden and other-scope titles still
 * contribute ratings/tags, but never enter the candidate ranking loops. */
export function appendPreviewRows(catalog: PreviewCatalog, rows: PreviewRow[]) {
  for (const row of rows) {
    catalog.byId.set(row.id, row);
    if (row.eligible) (row.adult ? catalog.adultRows : catalog.publicRows).push(row);
    for (const raw of row.tags) {
      const tag = raw.replace(/^(?:keyword-|creator-)/i, "");
      const entry = catalog.tagScores[tag] ??= { total: 0, count: 0 };
      entry.total += preference(row.rating); entry.count++;
      if (row.rating >= 4) catalog.preferred.add(raw);
    }
  }
}

export function rankPreviewCatalog(catalog: PreviewCatalog, id: string, seed: number): PreviewRanking {
  const { tagScores, liked, preferred } = catalog;
  const target = catalog.byId.get(id);
  if (!target) return { related: [], recommended: [], tagScores };
  const rows = target.adult ? catalog.adultRows : catalog.publicRows;
  const sourceTags = new Set(target.tags), related: Array<{ id: string; score: number; random: number }> = [];
  const details = (row: PreviewRow) => {
    let shared = 0, hearts = 0, tastes = 0;
    for (const tag of row.tags) { if (sourceTags.has(tag)) shared++; if (liked.has(tag)) hearts++; if (preferred.has(tag)) tastes++; }
    return { shared, hearts, tastes };
  };
  for (const row of rows) {
    if (row.id === id || !row.eligible) continue;
    const d = details(row), sameCreator = Boolean(target.creator && target.creator === row.creator);
    const score = Number(sameCreator) * 14 + Number(target.live && !row.live && sameCreator) * 8 + Number(target.folderId === row.folderId) * 5
      + Number(target.genre === row.genre) * 4 + Number(target.kind === row.kind) * (target.adult ? 5 : 2) + d.shared * (target.adult ? 6 : 3) + d.hearts * 2
      + preference(row.rating) * 1.5 + preference(row.creatorRating) * 2 + Number(row.creatorLiked) * 3;
    if (score > 0 && (related.length < 8 || score >= related[7].score)) top(related, { id: row.id, score, random: shuffle(`${id}:${row.id}:${seed}`, seed) }, 8);
  }
  const excluded = new Set(related.map(row => row.id)), recommended: typeof related = [];
  for (const row of rows) {
    if (row.id === id || !row.eligible || excluded.has(row.id)) continue;
    const d = details(row), nextSeed = (seed + 17) >>> 0;
    const score = Number(target.genre === row.genre) * 3 + Number(target.kind === row.kind) * (target.adult ? 4 : 1.5) + d.shared * (target.adult ? 6 : 3)
      + preference(row.rating) * 2 + preference(row.creatorRating) * 2 + Number(row.creatorLiked) * 3 + d.tastes * 3 + d.hearts * 2;
    if (recommended.length < 6 || score >= recommended[5].score) top(recommended, { id: row.id, score, random: shuffle(`${id}:${row.id}:${nextSeed}`, nextSeed) }, 6);
  }
  return { related: related.map(row => row.id), recommended: recommended.map(row => row.id), tagScores };
}

export function rankPreview(rows: PreviewRow[], id: string, seed: number, hearted: string[]): PreviewRanking {
  const catalog = createPreviewCatalog(hearted);
  appendPreviewRows(catalog, rows);
  return rankPreviewCatalog(catalog, id, seed);
}
