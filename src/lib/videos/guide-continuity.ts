import type { GuideInput } from "./guide-picks.ts";
import { normalizeExposure, exposureKey } from "./recommendation-exposure.ts";
import {
  normalizeRejections,
  creatorRejectionTarget,
  titleRejectionTarget,
} from "./recommendation-rejections.ts";
import { searchDateEvidence } from "./search-dates.ts";
import { normalizeGuideDiversity, publicationAge, diversityCreator } from "./guide-diversity.ts";
import { canonicalTopic, topicEvidenceForScan } from "./topics.ts";
import { createBoundedPicks } from "./bounded-picks.ts";
import type { FollowedChannel, LibraryVideo } from "./types.ts";
export function confirmedFollowKey(
  r: Pick<FollowedChannel, "kind" | "channelId" | "importNeedsReview">,
) {
  if (r.importNeedsReview) return;
  const id = r.channelId;
  if (
    (r.kind === "youtube" && /^UC[\w-]{22}$/.test(id ?? "")) ||
    (r.kind === "twitch" && /^\d{1,24}$/.test(id ?? ""))
  )
    return r.kind + ":" + id;
}
const videoKey = (v: LibraryVideo) =>
  v.remote &&
  confirmedFollowKey({
    kind: v.remote.kind as "youtube" | "twitch",
    channelId: v.remote.channelId,
  });
export function createGuideContinuity(input: GuideInput, now: number) {
  const hours = input.continuity?.cooldownHours ?? 0,
    slots = input.continuity?.explorationSlots ?? 0;
  const exposures = new Map(
    normalizeExposure(input.recommendationExposure, now).entries.map((e) => [e.key, e]),
  );
  const follows = new Set(
      (input.follows ?? [])
        .slice(0, 4096)
        .map(confirmedFollowKey)
        .filter((k): k is string => !!k),
    ),
    retired = new Set<string>();
  const rejections = normalizeRejections(input.recommendationRejections).entries;
  const titleRejections = new Set(
      rejections.filter((e) => e.scope === "title").map((e) => e.target),
    ),
    creatorRejections = new Set(
      rejections.filter((e) => e.scope === "creator").map((e) => e.target),
    ),
    topicRejections = new Set(rejections.filter((e) => e.scope === "topic").map((e) => e.target));
  const rejected = (v: LibraryVideo) =>
    titleRejections.has(titleRejectionTarget(v)) ||
    creatorRejections.has(creatorRejectionTarget(v) ?? "") ||
    (topicRejections.size > 0 &&
      topicEvidenceForScan(v, input.tags[v.id]).some((t) =>
        topicRejections.has(canonicalTopic(t.topic) ?? ""),
      ));
  const protectedTitle = (v: LibraryVideo) =>
    !!(
      input.favorites[v.id] ||
      input.likes[v.id] ||
      input.creatorIsFavorited?.(v.remote?.channelName ?? "") ||
      (input.ratingOf?.(v.id) ?? 0) >= 4
    );
  const cooling = (v: LibraryVideo) => {
    const e = exposures.get(exposureKey(v));
    return (
      hours > 0 &&
      !protectedTitle(v) &&
      !!e &&
      e.count >= 2 &&
      e.at <= now &&
      now - e.at < hours * 3600000
    );
  };
  const pool = new Map<
    string,
    {
      video: LibraryVideo;
      score: number;
      rank: number;
      index: number;
      penalty: number;
      exposure: number;
    }
  >();
  let limited = false;
  return {
    cooling,
    observe(v: LibraryVideo, watched: boolean) {
      const key = videoKey(v);
      if (
        key &&
        follows.has(key) &&
        (watched ||
          !!input.favorites[v.id] ||
          !!input.likes[v.id] ||
          (input.ratingOf?.(v.id) ?? 0) > 0 ||
          input.creatorHasFeedback?.(v.remote?.channelName ?? "") ||
          rejected(v))
      )
        retired.add(key);
    },
    add(row: {
      video: LibraryVideo;
      score: number;
      rank: number;
      index: number;
      penalty: number;
      exposure: number;
    }) {
      if (!slots || input.showSuppressed || row.penalty > 0 || row.exposure > 0) return;
      const v = row.video,
        key = videoKey(v),
        date = searchDateEvidence(v, "published");
      if (
        !key ||
        !follows.has(key) ||
        retired.has(key) ||
        !date ||
        !["instant", "day"].includes(date.precision) ||
        date.start > now ||
        date.start < now - 30 * 86400000 ||
        rejected(v)
      )
        return;
      const old = pool.get(key);
      if (!old && pool.size >= 64) {
        limited = true;
        return;
      }
      if (!old || row.score > old.score || (row.score === old.score && row.rank < old.rank))
        pool.set(key, row);
    },
    finish<
      R extends {
        video: LibraryVideo;
        score: number;
        rank: number;
        index: number;
        penalty: number;
        exposure: number;
      },
    >(rows: R[]) {
      const selected = [...rows],
        explored = new Set<string>(),
        chosenCreators = new Set<string>(),
        best = createBoundedPicks<typeof pool extends Map<string, infer T> ? T : never>(
          64,
          (a, b) => b.score - a.score || a.rank - b.rank || a.index - b.index,
        );
      for (const row of pool.values()) best.add(row);
      const config = normalizeGuideDiversity(input.diversity);
      for (const row of best.finish()) {
        if (explored.size >= slots) break;
        const key = videoKey(row.video)!;
        if (chosenCreators.has(key)) continue;
        let index = selected.findIndex((r) => r.video.id === row.video.id);
        if (index < 0 && selected.some((r) => exposureKey(r.video) === exposureKey(row.video)))
          continue;
        if (index < 0) {
          for (let i = selected.length - 1; i >= 0; i--) {
            const before = selected[i]!;
            if (protectedTitle(before.video) || before.score > row.score + 24) continue;
            if (
              input.session?.sources === "balanced" &&
              before.video.remote?.kind !== row.video.remote?.kind
            )
              continue;
            const trial = selected.map((r, n) => (n === i ? row : r)),
              sources = (r: typeof trial) =>
                new Set(r.map((x) => x.video.remote?.kind ?? "local")).size;
            if (sources(trial) < Math.min(config.minSources, sources(selected))) continue;
            if (
              config.olderSlots &&
              trial.filter((r) => publicationAge(r.video, now) === "older").length <
                Math.min(
                  config.olderSlots,
                  selected.filter((r) => publicationAge(r.video, now) === "older").length,
                )
            )
              continue;
            if (config.creatorPercent < 100) {
              const counts = new Map<string, number>();
              for (const r of trial) {
                const k = diversityCreator(r.video);
                if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
              }
              if (
                [...counts.values()].some(
                  (c) => c > Math.floor((trial.length * config.creatorPercent) / 100),
                )
              )
                continue;
            }
            index = i;
            break;
          }
          if (index < 0 && selected.length < 12) index = selected.length;
          if (index < 0) continue;
          selected[index] = row as R;
        }
        explored.add(row.video.id);
        chosenCreators.add(key);
      }
      return { rows: selected, explored, limited };
    },
  };
}
