import { reviewedDocument } from "./reviewed-document.ts";
export type RecommendationTuning = {
  version: 1;
  explorationSlots: 0 | 1 | 2;
  cooldownHours: 0 | 6 | 24 | 72;
};
export const defaultRecommendationTuning = (): RecommendationTuning => ({
  version: 1,
  explorationSlots: 1,
  cooldownHours: 24,
});
export function parseRecommendationTuning(raw: unknown): RecommendationTuning {
  const r = raw as RecommendationTuning;
  if (
    !r ||
    r.version !== 1 ||
    Object.keys(r).some((k) => !["version", "explorationSlots", "cooldownHours"].includes(k)) ||
    ![0, 1, 2].includes(r.explorationSlots) ||
    ![0, 6, 24, 72].includes(r.cooldownHours)
  )
    throw Error("Unsupported recommendation tuning. Saved settings were kept.");
  return { ...r };
}
export const recommendationTuning = reviewedDocument(
  "reelcase.recommendation-tuning.v1",
  defaultRecommendationTuning,
  parseRecommendationTuning,
);
