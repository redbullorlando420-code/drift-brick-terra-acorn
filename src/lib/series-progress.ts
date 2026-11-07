import { reviewedDocument } from "./reviewed-document.ts";
import {
  nextAnimeEpisode,
  type AnimeSeriesReview,
  type AnimeEpisodeMap,
  type AnimeSlot,
  type AnimeNextChoice,
} from "./videos/anime-review.ts";
export type SeriesTracking = { resetAt?: number; decisions: Record<string, boolean> };
export type SeriesProgress = {
  version: 1;
  series: Record<string, SeriesTracking>;
  undo?: { id: string; before: SeriesTracking | null };
};
export const emptySeriesProgress = (): SeriesProgress => ({ version: 1, series: {} });
const validId = (s: string) => /^anime:[a-z0-9-]{1,80}$/i.test(s),
  validSlot = (s: string) =>
    /^(?:absolute|season:\d{1,3}):(?:episode|special|ova):\d{1,5}$/.test(s);
function tracking(r: SeriesTracking): SeriesTracking {
  if (
    !r ||
    Object.keys(r).some((k) => !["resetAt", "decisions"].includes(k)) ||
    !r.decisions ||
    Array.isArray(r.decisions) ||
    typeof r.decisions !== "object" ||
    Object.keys(r.decisions).length > 200 ||
    Object.entries(r.decisions).some(([k, v]) => !validSlot(k) || typeof v !== "boolean") ||
    (r.resetAt !== undefined && (!Number.isSafeInteger(r.resetAt) || r.resetAt < 0))
  )
    throw Error("Invalid series tracking decisions.");
  return {
    decisions: { ...r.decisions },
    ...(r.resetAt !== undefined ? { resetAt: r.resetAt } : {}),
  };
}
export function parseSeriesProgress(raw: unknown): SeriesProgress {
  const r = raw as SeriesProgress;
  if (
    !r ||
    r.version !== 1 ||
    Object.keys(r).some((k) => !["version", "series", "undo"].includes(k)) ||
    !r.series ||
    Array.isArray(r.series) ||
    typeof r.series !== "object" ||
    Object.keys(r.series).length > 64 ||
    Object.keys(r.series).some((k) => !validId(k))
  )
    throw Error("Unsupported series progress settings. Existing decisions were kept.");
  const series = Object.fromEntries(Object.entries(r.series).map(([k, v]) => [k, tracking(v)]));
  if (Object.values(series).reduce((n, s) => n + Object.keys(s.decisions).length, 0) > 512)
    throw Error("Keep at most 512 episode decisions across 64 series.");
  const undo = r.undo;
  if (undo && (!validId(undo.id) || (undo.before !== null && !undo.before)))
    throw Error("Invalid series progress undo.");
  return {
    version: 1,
    series,
    ...(undo
      ? { undo: { id: undo.id, before: undo.before === null ? null : tracking(undo.before) } }
      : {}),
  };
}
export function changeSeriesProgress(
  state: SeriesProgress,
  id: string,
  change:
    { kind: "reset"; at: number } | { kind: "decision"; slot: string; value: boolean | undefined },
  known: readonly string[],
) {
  if (!validId(id)) throw Error("Review the series identity first.");
  const old = state.series[id],
    before = old ?? null;
  let next: SeriesTracking;
  if (change.kind === "reset") {
    if (!Number.isSafeInteger(change.at) || change.at < 0) throw Error("Invalid reset time.");
    next = { resetAt: change.at, decisions: {} };
  } else {
    if (!known.includes(change.slot) || !validSlot(change.slot))
      throw Error("Only an existing reviewed episode can be corrected.");
    const decisions = { ...old?.decisions };
    if (change.value === undefined) delete decisions[change.slot];
    else decisions[change.slot] = change.value;
    next = { ...old, decisions };
  }
  return parseSeriesProgress({
    ...state,
    series: { ...state.series, [id]: next },
    undo: { id, before },
  });
}
export function undoSeriesProgress(state: SeriesProgress) {
  if (!state.undo) return state;
  const { id, before } = state.undo,
    series = { ...state.series },
    previous = series[id] ?? null;
  if (before) series[id] = before;
  else delete series[id];
  return parseSeriesProgress({ version: 1, series, undo: { id, before: previous } });
}
export function slotProgress(slot: AnimeSlot, series: AnimeSeriesReview, tracked?: SeriesTracking) {
  const decision = tracked?.decisions[slot.key];
  if (decision !== undefined) return { complete: decision, origin: "owner decision" as const };
  const complete = slot.versions.some((v) => {
    const p = v.resume;
    return (
      p &&
      Number.isFinite(p.t) &&
      Number.isFinite(p.d) &&
      Number.isFinite(p.at) &&
      p.d > 0 &&
      p.t >= 2 &&
      p.at > (tracked?.resetAt ?? -1) &&
      p.t / p.d >= series.policy.threshold
    );
  });
  return { complete: Boolean(complete), origin: "playback evidence" as const };
}
export function summarizeSeriesProgress(
  series: AnimeSeriesReview,
  map: AnimeEpisodeMap,
  tracked?: SeriesTracking,
) {
  const slots = map.numbered.filter((s) => s.numbering === series.policy.numbering),
    lanes = map.lanes.filter((l) => l.numbering === series.policy.numbering);
  return {
    known: slots.length,
    complete: slots.filter((s) => slotProgress(s, series, tracked).complete).length,
    missing: lanes.reduce((n, l) => n + l.slots.filter((s) => !s.versions.length).length, 0),
    uncertain: lanes.some((l) => l.unverified),
    unavailable: slots.filter((s) => !s.versions.some((v) => v.available)).length,
    otherNumbering: map.numbered.length - slots.length,
    unresolved: map.unresolved.length,
    specials: map.specials.length,
  };
}
export function nextTrackedAnimeEpisode(
  series: AnimeSeriesReview,
  map: AnimeEpisodeMap,
  tracked?: SeriesTracking,
): AnimeNextChoice {
  if (!tracked) return nextAnimeEpisode(series, map);
  const slots = [...map.numbered, ...(series.policy.specials ? map.specials : [])].filter(
    (s) => s.numbering === series.policy.numbering,
  );
  for (const slot of slots) {
    if (slotProgress(slot, series, tracked).complete) continue;
    const available = slot.versions.filter((v) => v.available),
      version = available.find((v) => v.review.preferred) ?? available[0];
    if (version)
      return {
        slot,
        version,
        resume: false,
        skip: 0,
        reason:
          "First incomplete available episode under your series tracking decisions. Source playback positions are retained; opening a title does not erase its resume mark.",
      };
  }
  return {
    resume: false,
    skip: 0,
    reason:
      "No incomplete available reviewed episode remains in this numbering lane. Missing or unresolved entries are not marked watched.",
  };
}
export const seriesProgress = reviewedDocument(
  "reelcase.series-progress.v1",
  emptySeriesProgress,
  parseSeriesProgress,
);
