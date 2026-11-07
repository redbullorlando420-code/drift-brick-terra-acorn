import type { LibraryVideo } from "./types";
import { normalizeExposure, exposureKey, type ExposureLedger } from "./recommendation-exposure.ts";
export const NOVELTY_CREATOR_LIMIT = 4096;
export function noveltyCreator(video: LibraryVideo) {
  const r = video.remote;
  if (!r || !["youtube", "twitch"].includes(r.kind)) return undefined;
  const key = r.channelId?.trim() || r.channelName?.trim().normalize("NFC").toLowerCase();
  return key ? r.kind + ":" + key.slice(0, 160) : undefined;
}
/** Only eligible public history and actual exposure observations supply evidence.
 * The builder stores compact creator keys and up to the existing exposure cap. */
export function createNoveltyEvidence(exposure: ExposureLedger | undefined, now: number) {
  const candidates = new Map(
    normalizeExposure(exposure, now).entries.map((row) => [row.key, row.count]),
  );
  const creators = new Set<string>(),
    shown = new Map<string, number>();
  let history = 0,
    limited = false;
  return {
    observe(video: LibraryVideo, recorded: boolean) {
      if (recorded) {
        history++;
        const key = noveltyCreator(video);
        if (key) {
          if (creators.has(key) || creators.size < NOVELTY_CREATOR_LIMIT) creators.add(key);
          else limited = true;
        }
      }
      const count = candidates.get(exposureKey(video));
      if (count !== undefined) shown.set(exposureKey(video), count);
    },
    inspect(video: LibraryVideo, level: number) {
      const creator = noveltyCreator(video),
        count = shown.get(exposureKey(video));
      const evidence =
        count !== undefined
          ? "shown recommendation"
          : creator && creators.has(creator)
            ? "creator in recorded history"
            : creator && creators.size && !limited
              ? "creator absent from recorded history"
              : undefined;
      const familiarity =
        count !== undefined
          ? Math.min(1, count / 3)
          : evidence === "creator in recorded history"
            ? 1
            : evidence
              ? 0
              : undefined;
      return {
        evidence,
        familiarity,
        adjustment:
          familiarity === undefined || !Number.isInteger(level) || Math.abs(level) > 2
            ? 0
            : (level / 2) * (1 - 2 * familiarity),
      };
    },
    summary() {
      return {
        history,
        creators: creators.size,
        exposed: shown.size,
        limited,
        available: Boolean(creators.size || shown.size),
      };
    },
    markLimited() {
      limited = true;
    },
  };
}
export type NoveltyEvidence = ReturnType<typeof createNoveltyEvidence>;
export function noveltyNotice(model: NoveltyEvidence, video: LibraryVideo, level: number) {
  const row = model.inspect(video, level);
  return row.evidence
    ? `Novelty balance ${row.adjustment >= 0 ? "+" : ""}${row.adjustment.toFixed(2)}: ${row.evidence}. Exposure means shown, and history means recorded activity, not a completed watch.`
    : "No eligible familiarity evidence for this title; novelty adjustment is neutral.";
}
export function noveltySummary(
  model: NoveltyEvidence,
  picks: readonly LibraryVideo[],
  level: number,
) {
  const known = picks
    .map((video) => model.inspect(video, level).familiarity)
    .filter((n): n is number => n !== undefined);
  return {
    ...model.summary(),
    level,
    selectedKnown: known.length,
    meanFamiliarity: known.length ? known.reduce((sum, n) => sum + n, 0) / known.length : null,
  };
}
