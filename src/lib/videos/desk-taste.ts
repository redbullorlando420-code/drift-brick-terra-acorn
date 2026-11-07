import {
  DEFAULT_GUIDE_WEIGHTS,
  guideWeights,
  isGuideWeights,
  type GuideWeights,
} from "./guide-preset.ts";
export const DESK_TASTE_KEY = "reelcase.desk-taste.v1";
export const TASTE_DESKS = ["guide", "youtube", "twitch", "movies"] as const;
export type TasteDesk = (typeof TASTE_DESKS)[number];
export type DeskTaste = { weights: GuideWeights; novelty: number };
export type DeskTasteLedger = { version: 1; desks: Partial<Record<TasteDesk, DeskTaste>> };
export const emptyDeskTaste = (): DeskTasteLedger => ({ version: 1, desks: {} });
export function validateDeskTaste(raw: unknown): DeskTaste {
  const r = raw as DeskTaste;
  if (
    !r ||
    Object.keys(r).some((key) => !["weights", "novelty"].includes(key)) ||
    !isGuideWeights(r.weights) ||
    Object.keys(r.weights).some((key) => !["favorite", "like", "topic"].includes(key)) ||
    !Number.isInteger(r.novelty) ||
    r.novelty < -2 ||
    r.novelty > 2
  )
    throw Error("Unsupported desk tuning. Existing choices were kept.");
  return Object.freeze({ weights: guideWeights(r.weights), novelty: r.novelty });
}
export function readDeskTaste(raw: string | null): DeskTasteLedger {
  if (raw === null) return emptyDeskTaste();
  if (raw.length > 8192)
    throw Error("Desk tuning exceeds the supported size. Existing choices were kept.");
  const r = JSON.parse(raw) as DeskTasteLedger;
  if (
    !r ||
    r.version !== 1 ||
    Object.keys(r).some((key) => !["version", "desks"].includes(key)) ||
    !r.desks ||
    typeof r.desks !== "object" ||
    Array.isArray(r.desks) ||
    Object.keys(r.desks).some((key) => !TASTE_DESKS.includes(key as TasteDesk))
  )
    throw Error("Unsupported desk preferences. Existing choices were kept.");
  return {
    version: 1,
    desks: Object.fromEntries(
      Object.entries(r.desks).map(([key, value]) => [key, validateDeskTaste(value)]),
    ),
  };
}
export function resolveDeskTaste(
  saved: DeskTasteLedger,
  temporary: Partial<Record<TasteDesk, DeskTaste>>,
  desk: TasteDesk,
  shared = DEFAULT_GUIDE_WEIGHTS,
) {
  const choice = temporary[desk] ?? saved.desks[desk];
  return {
    ...(choice ?? { weights: guideWeights(shared), novelty: 0 }),
    origin: temporary[desk]
      ? ("temporary desk mix" as const)
      : saved.desks[desk]
        ? ("saved desk overlay" as const)
        : ("shared Guide preset" as const),
  };
}
export const sameDeskTaste = (a: DeskTaste, b: DeskTaste) =>
  a.novelty === b.novelty &&
  a.weights.favorite === b.weights.favorite &&
  a.weights.like === b.weights.like &&
  a.weights.topic === b.weights.topic;
