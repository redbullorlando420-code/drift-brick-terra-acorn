/** UI and workers share the original star meanings: 1 = dislike, 2 = neutral,
 * 3–5 = increasingly positive. Unrated is neutral, never a zero multiplier. */
export function normalizeRating(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(5, Math.round(value))) : 0;
}
export function ratingPreference(value: number) {
  const rating = normalizeRating(value);
  return rating === 1 ? -3 : rating >= 3 ? rating - 2 : 0;
}
export const RATING_MULTIPLIERS = [1, 0.2, 1, 1.2, 1.5, 1.9] as const;
export const RATING_STAR_WEIGHTS = { personal: 12, youtube: 6, preview: 2 } as const;
export const ratingMultiplier = (rating: number) => RATING_MULTIPLIERS[normalizeRating(rating)]!;
const clamp = (value: number | undefined, maximum: number) =>
  Math.max(0, Math.min(maximum, Number.isFinite(value) ? value! : 0));
const affinity = (value: number | undefined, maximum: number) =>
  Math.max(-maximum, Math.min(maximum, Number.isFinite(value) ? value! : 0));
/** Multiplying a negative novelty penalty made higher ratings rank worse.
 * Multiply positive evidence and divide negative evidence before star points. */
export function ratingAdjustedScore(
  base: number,
  rating: number,
  ratingWeight: number = RATING_STAR_WEIGHTS.personal,
) {
  const finite = Number.isFinite(base) ? base : 0,
    multiplier = ratingMultiplier(rating);
  return (
    (finite >= 0 ? finite * multiplier : finite / multiplier) +
    ratingPreference(rating) * clamp(ratingWeight, 100)
  );
}
export const PERSONAL_RANK_WEIGHTS = {
  baseline: 10,
  favorite: 12,
  like: 6,
  watch: 12,
  plays: 6,
  marks: 12,
  topics: 12,
  creatorAffinity: 8,
  creatorLike: 6,
  creatorFavorite: 8,
  freshness: 3,
  rating: RATING_STAR_WEIGHTS.personal,
} as const;
export type PersonalRankSignals = {
  rating: number;
  favorite?: boolean;
  liked?: boolean;
  watch?: number;
  plays?: number;
  marks?: number;
  topics?: number;
  creatorAffinity?: number;
  creatorLiked?: boolean;
  creatorFavorite?: boolean;
  tagHearts?: number;
  creatorRating?: number;
  freshness?: number;
};
export function personalRankBreakdown(s: PersonalRankSignals) {
  const w = PERSONAL_RANK_WEIGHTS;
  const parts = {
    baseline: w.baseline,
    favorite: s.favorite ? w.favorite : 0,
    like: s.liked ? w.like : 0,
    watch: clamp(s.watch, w.watch),
    plays: clamp(Math.log2(1 + clamp(s.plays, 1_000_000)) * 1.5, w.plays),
    marks: clamp(Math.log2(1 + clamp(s.marks, 1_000_000)) * 4, w.marks),
    topics: affinity(s.topics, w.topics),
    creatorAffinity: affinity(s.creatorAffinity, w.creatorAffinity),
    creatorLike: s.creatorLiked ? w.creatorLike : 0,
    creatorFavorite: s.creatorFavorite ? w.creatorFavorite : 0,
    freshness: clamp(s.freshness, 1) * w.freshness,
  };
  const base = Object.values(parts).reduce((sum, value) => sum + value, 0);
  const creator = ratingPreference(s.creatorRating ?? 0) * 3;
  return {
    parts,
    base,
    multiplier: ratingMultiplier(s.rating),
    ratingPoints: ratingPreference(s.rating) * w.rating,
    creatorPoints: creator,
    interestMultiplier: interestMultiplier(s),
    score: applyInterestMultipliers(ratingAdjustedScore(base, s.rating, w.rating) + creator, s),
  };
}
/** Hot catalog path avoids allocating a breakdown object for every title. */
export function personalRankScore(s: PersonalRankSignals) {
  const w = PERSONAL_RANK_WEIGHTS;
  const base =
    w.baseline +
    (s.favorite ? w.favorite : 0) +
    (s.liked ? w.like : 0) +
    clamp(s.watch, w.watch) +
    clamp(Math.log2(1 + clamp(s.plays, 1_000_000)) * 1.5, w.plays) +
    clamp(Math.log2(1 + clamp(s.marks, 1_000_000)) * 4, w.marks) +
    affinity(s.topics, w.topics) +
    affinity(s.creatorAffinity, w.creatorAffinity) +
    (s.creatorLiked ? w.creatorLike : 0) +
    (s.creatorFavorite ? w.creatorFavorite : 0) +
    clamp(s.freshness, 1) * w.freshness;
  return applyInterestMultipliers(ratingAdjustedScore(base, s.rating, w.rating) + ratingPreference(s.creatorRating ?? 0) * 3, s);
}
/** Unrated catalog volume is coverage, not preference evidence. */
export function confidenceAdjustedPreference(total: number, evidenceCount: number) {
  return Number.isFinite(total) ? total / (clamp(evidenceCount, Number.MAX_SAFE_INTEGER) + 3) : 0;
}
export const topicPreferenceScore = (total: number, evidenceCount: number, hearted: boolean) =>
  confidenceAdjustedPreference(total, evidenceCount) * 10 + (hearted ? 12 : 0);

/** Independent, bounded preference families. Catalog keyword volume cannot create votes. */
export const INTEREST_MULTIPLIERS = { liked: 1.35, favorite: 1.55, topics: 1.25, tagHearts: 1.25,
  creatorLiked: 1.2, creatorFavorite: 1.4, marks: 1.3, watch: 1.25, maximum: 3 } as const;
export function interestMultiplier(s: Omit<PersonalRankSignals, 'rating'>) {
  const w = INTEREST_MULTIPLIERS;
  const marks = clamp(Math.log2(1 + clamp(s.marks, 1_000_000)) * 4, 12) / 12;
  return Math.min(w.maximum,
    (s.liked ? w.liked : 1) * (s.favorite ? w.favorite : 1)
    * (1 + (w.topics - 1) * clamp(s.topics, 12) / 12)
    * (1 + (w.tagHearts - 1) * clamp(s.tagHearts, 3) / 3)
    * (s.creatorLiked ? w.creatorLiked : 1) * (s.creatorFavorite ? w.creatorFavorite : 1)
    * (1 + (w.marks - 1) * marks) * (1 + (w.watch - 1) * clamp(s.watch, 12) / 12));
}
export function applyInterestMultipliers(score: number, signals: Omit<PersonalRankSignals, 'rating'>) {
  const multiplier = interestMultiplier(signals);
  return score >= 0 ? score * multiplier : score / multiplier;
}

const preparedTags = new WeakMap<readonly string[], string[]>();
/** Reuse immutable tag arrays; mechanical provider/creator labels are facets, not interests. */
export function rankingTags(tags: readonly string[]): string[] {
  const saved = preparedTags.get(tags); if (saved) return saved;
  const distinct = new Set<string>();
  for (const raw of tags) {
    if (/^(?:source|creator|provider|format|auto|sub)-/i.test(raw)) continue;
    const clean = raw.replace(/^keyword-/i, '').trim().toLowerCase();
    if (clean.length < 3 || /^(?:https?:|www\.)/.test(clean)) continue;
    distinct.add(clean); if (distinct.size >= 64) break;
  }
  const result = [...distinct]; preparedTags.set(tags, result); return result;
}
