export type PreviewRow = { id: string; folderId: string; genre?: string; kind?: string; creator: string; tags: string[]; rating: number; creatorRating: number; creatorLiked: boolean; live: boolean; eligible: boolean; adult?: boolean; favorite?: boolean; liked?: boolean; creatorFavorite?: boolean; marks?: number; watch?: number; plays?: number };
import { interestMultiplier, rankingTags, confidenceAdjustedPreference, normalizeRating, ratingAdjustedScore, ratingPreference as preference, RATING_STAR_WEIGHTS } from './ranking-core.ts';
export type PreviewRanking = { related: string[]; recommended: string[]; tagScores: Record<string, { total: number; count: number }> };
export type PreviewCatalog = {
  byId: Map<string, PreviewRow>;
  publicRows: PreviewRow[];
  adultRows: PreviewRow[];
  tagScores: PreviewRanking["tagScores"];
  liked: Set<string>;
  prepared: Map<string, { tags: string[]; hearts: number; tastes: number; bonus: number; multiplier: number }>;
  compiled: boolean;
};
function shuffle(id: string, seed: number) { let n = seed >>> 0; for (const c of id) n = Math.imul(n ^ c.charCodeAt(0), 0x45d9f3b); return n >>> 0; }
function top(rows: Array<{ id: string; score: number; random: number }>, row: { id: string; score: number; random: number }, limit: number) {
  const at = rows.findIndex(old => row.score > old.score || (row.score === old.score && row.random < old.random));
  rows.splice(at < 0 ? rows.length : at, 0, row);
  if (rows.length > limit) rows.pop();
}
export function createPreviewCatalog(hearted: string[]): PreviewCatalog {
  return { byId: new Map(), publicRows: [], adultRows: [], tagScores: Object.create(null), liked: new Set(hearted.map(tag => tag.trim().toLowerCase())), prepared: new Map(), compiled: false };
}

/** Compile shared taste evidence once. Hidden and other-scope titles still
 * contribute ratings/tags, but never enter the candidate ranking loops. */
export function appendPreviewRows(catalog: PreviewCatalog, rows: PreviewRow[]) {
  for (const row of rows) {
    if (catalog.byId.has(row.id)) continue;
    catalog.compiled = false;
    catalog.byId.set(row.id, row);
    const tags = rankingTags(row.tags);
    catalog.prepared.set(row.id, { tags, hearts: Math.min(3, tags.filter(tag => catalog.liked.has(tag)).length), tastes: 0, multiplier: 1,
      bonus: (row.favorite ? 6 : 0) + (row.liked ? 4 : 0) + Math.min(6, Math.max(0, row.watch ?? 0) / 2)
        + Math.min(6, Math.log2(1 + Math.max(0, row.marks ?? 0)) * 2) });
    if (row.eligible) (row.adult ? catalog.adultRows : catalog.publicRows).push(row);
    for (const tag of new Set(row.tags.map(raw => raw.replace(/^(?:keyword-|creator-)/i, '').trim().toLowerCase()))) {
      const entry = catalog.tagScores[tag] ??= { total: 0, count: 0 };
      const evidence = normalizeRating(row.rating) === 1 ? -3 : Math.max(preference(row.rating), row.favorite ? 3 : 0, row.liked ? 2 : 0)
        + Math.min(2, Math.max(0, row.watch ?? 0) / 6) + Math.min(2, Math.log2(1 + Math.max(0, row.marks ?? 0)));
      if (normalizeRating(row.rating) > 0 || evidence) { entry.total += evidence; entry.count++; }
    }
  }
}

export function rankPreviewCatalog(catalog: PreviewCatalog, id: string, seed: number): PreviewRanking {
  const { tagScores } = catalog;
  const target = catalog.byId.get(id);
  if (!target) return { related: [], recommended: [], tagScores };
  const rows = target.adult ? catalog.adultRows : catalog.publicRows;
  if (!catalog.compiled) {
    for (const [id, prepared] of catalog.prepared) {
      prepared.tastes = Math.min(4, prepared.tags.reduce((sum, tag) => {
        const evidence = tagScores[tag];
        return sum + (evidence ? Math.max(0, confidenceAdjustedPreference(evidence.total, evidence.count)) : 0);
      }, 0));
      prepared.multiplier = interestMultiplier({ ...catalog.byId.get(id)!, topics: prepared.tastes * 3, tagHearts: prepared.hearts });
    }
    catalog.compiled = true;
  }
  const sourceTags = new Set(catalog.prepared.get(id)?.tags);
  const related: Array<{ id: string; score: number; random: number }> = [], recommended: typeof related = [];
  // One candidate pass serves both shelves. Tags and feedback are prepared once per catalog.
  for (const row of rows) {
    if (row.id === id || !row.eligible || normalizeRating(row.rating) === 1) continue;
    const d = catalog.prepared.get(row.id)!;
    let shared = 0; for (const tag of d.tags) if (sourceTags.has(tag)) shared++;
    shared = Math.min(4, shared);
    const sameCreator = Boolean(target.creator && target.creator === row.creator);
    const sameGenre = Boolean(target.genre) && target.genre === row.genre;
    const sameKind = Boolean(target.kind) && target.kind === row.kind;
    const score = (base: number) => {
      const value = ratingAdjustedScore(base + d.bonus, row.rating, RATING_STAR_WEIGHTS.preview)
        + preference(row.creatorRating) * 2 + Number(row.creatorLiked) * 3 + Number(Boolean(row.creatorFavorite)) * 4;
      return value >= 0 ? value * d.multiplier : value / d.multiplier;
    };
    const relatedScore = score(Number(sameCreator) * 14 + Number(target.live && !row.live && sameCreator) * 8 + Number(target.folderId === row.folderId) * 5
      + Number(sameGenre) * 4 + Number(sameKind) * (target.adult ? 5 : 2) + shared * (target.adult ? 6 : 3) + d.hearts * 2);
    if (relatedScore > 0 && (related.length < 8 || relatedScore >= related[7].score)) top(related, { id: row.id, score: relatedScore, random: shuffle(`${id}:${row.id}:${seed}`, seed) }, 8);
    const recScore = score(Number(sameGenre) * 3 + Number(sameKind) * (target.adult ? 4 : 1.5) + shared * (target.adult ? 6 : 3) + d.tastes * 3 + d.hearts * 2);
    if (recommended.length < 14 || recScore >= recommended[13].score) top(recommended, { id: row.id, score: recScore, random: shuffle(`${id}:${row.id}:${(seed + 17) >>> 0}`, (seed + 17) >>> 0) }, 14);
  }
  const excluded = new Set(related.map(row => row.id));

  return { related: related.map(row => row.id), recommended: recommended.filter(row => !excluded.has(row.id)).slice(0, 6).map(row => row.id), tagScores };
}

export function rankPreview(rows: PreviewRow[], id: string, seed: number, hearted: string[]): PreviewRanking {
  const catalog = createPreviewCatalog(hearted);
  appendPreviewRows(catalog, rows);
  return rankPreviewCatalog(catalog, id, seed);
}
