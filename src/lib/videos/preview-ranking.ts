export type PreviewRow = { exposurePenalty?: number; rejectionPenalty?: number; id: string; folderId: string; genre?: string; kind?: string; creator: string; tags: string[]; rating: number; creatorRating: number; creatorLiked: boolean; live: boolean; eligible: boolean; adult?: boolean; favorite?: boolean; liked?: boolean; creatorFavorite?: boolean; marks?: number; watch?: number; plays?: number; identity?: string; creatorId?: string; titleTokens?: string[]; format?: string; publishedAt?: number };
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
  identities: Set<string>;
};
function shuffle(id: string, seed: number) { let n = seed >>> 0; for (const c of id) n = Math.imul(n ^ c.charCodeAt(0), 0x45d9f3b); return n >>> 0; }
function top(rows: Array<{ id: string; score: number; random: number }>, row: { id: string; score: number; random: number }, limit: number) {
  const at = rows.findIndex(old => row.score > old.score || (row.score === old.score && row.random < old.random));
  rows.splice(at < 0 ? rows.length : at, 0, row);
  if (rows.length > limit) rows.pop();
}
export function createPreviewCatalog(hearted: string[]): PreviewCatalog {
  return { byId: new Map(), publicRows: [], adultRows: [], tagScores: Object.create(null), liked: new Set(hearted.map(tag => tag.trim().toLowerCase())), prepared: new Map(), compiled: false, identities: new Set() };
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
    const identity = row.identity ?? row.id;
    if (row.eligible && !catalog.identities.has(identity)) { (row.adult ? catalog.adultRows : catalog.publicRows).push(row); catalog.identities.add(identity); }
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
  const sourceTags = new Set(catalog.prepared.get(id)?.tags), titleWords = new Set(target.titleTokens ?? []);
  type Pick = { id: string; score: number; random: number };
  const related: Pick[] = [], scored: Array<{ row: PreviewRow; next: Pick }> = [];
  const creatorKey = (row: PreviewRow) => row.creatorId || row.creator || row.id;
  for (const row of rows) {
    if (row.id === id || (row.identity ?? row.id) === (target.identity ?? target.id) || !row.eligible || normalizeRating(row.rating) === 1) continue;
    // YouTube preview shelves stay within YouTube; local and Adult scopes keep
    // their existing independent candidate sets.
    if (target.kind === 'youtube' && (row.kind !== 'youtube' || row.live || row.format === 'upcoming')) continue;
    const d = catalog.prepared.get(row.id)!;
    let shared = 0; for (const tag of d.tags) if (sourceTags.has(tag)) shared++;
    shared = Math.min(4, shared);
    const words = Math.min(3, (row.titleTokens ?? []).filter(word => titleWords.has(word)).length);
    const sameCreator = Boolean(target.creatorId || target.creator) && creatorKey(target) === creatorKey(row);
    const sameGenre = Boolean(target.genre) && target.genre === row.genre;
    const sameKind = Boolean(target.kind) && target.kind === row.kind;
    const sameFolder = Boolean(target.folderId) && target.folderId === row.folderId;
    const score = (base: number) => {
      const value = ratingAdjustedScore(base + d.bonus, row.rating, RATING_STAR_WEIGHTS.preview)
        + preference(row.creatorRating) * 2 + Number(row.creatorLiked) * 3 + Number(Boolean(row.creatorFavorite)) * 4;
      return (value >= 0 ? value * d.multiplier : value / d.multiplier) - (row.adult ? 0 : Math.max(0, Math.min(64, row.rejectionPenalty ?? 0)) + Math.max(0, Math.min(18, row.exposurePenalty ?? 0)));
    };
    const relatedScore = score(Number(sameCreator)*14 + Number(target.live && sameCreator)*8 + Number(sameFolder)*5
      + Number(sameGenre)*4 + Number(sameKind)*(target.adult?5:2) + shared*(target.adult?6:3) + words*3 + d.hearts*2);
    // A provider alone is not a relationship. Keep matching creators, shelf
    // sources, topics and meaningful title terms ahead of arbitrary uploads.
    if (relatedScore > 0 && (sameCreator || sameFolder || sameGenre || shared || words))
      top(related,{id:row.id,score:relatedScore,random:shuffle(id+':'+row.id,seed)},8);
    const novelty = Math.min(6, Math.log2(1+Math.max(0,row.plays??0))*2);
    const format = target.format && target.format === row.format ? 2 : 0;
    const nextScore = score(Number(sameGenre)*3 + Number(sameKind)*(target.adult?4:1.5) + shared*(target.adult?6:3)
      + words*3 + d.tastes*3 + d.hearts*2 + format) - novelty;
    scored.push({row,next:{id:row.id,score:nextScore,random:shuffle(id+':'+row.id,(seed+17)>>>0)}});
  }
  const excluded = new Set(related.map(row=>row.id)), pool: Pick[] = [];
  // Fill after excluding the first shelf, so overlap cannot empty the next
  // shelf. A creator may contribute only six candidates to the bounded pool.
  const byCreator = new Map<string,Pick[]>();
  for(const {row,next} of scored){
    if(excluded.has(row.id))continue;
    const key=creatorKey(row), group=byCreator.get(key)??[];
    top(group,next,6);byCreator.set(key,group);
  }
  for(const group of byCreator.values())for(const next of group)top(pool,next,128);
  const recommended: string[] = [], counts=new Map<string,number>();
  for(const maxPerCreator of [2,6])for(const pick of pool){
    if(recommended.length===6)break;
    if(recommended.includes(pick.id))continue;
    const key=creatorKey(catalog.byId.get(pick.id)!);
    if((counts.get(key)??0)>=maxPerCreator)continue;
    counts.set(key,(counts.get(key)??0)+1);recommended.push(pick.id);
  }
  return { related: related.map(row=>row.id), recommended, tagScores };
}

export function rankPreview(rows: PreviewRow[], id: string, seed: number, hearted: string[]): PreviewRanking {
  const catalog = createPreviewCatalog(hearted);
  appendPreviewRows(catalog, rows);
  return rankPreviewCatalog(catalog, id, seed);
}
