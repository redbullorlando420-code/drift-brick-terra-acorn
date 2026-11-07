import { createBoundedPicks } from "./bounded-picks.ts";
import {
  createSessionPicks,
  recommendationSource,
  type RecommendationSession,
} from "./recommendation-session.ts";
import { searchDateEvidence } from "./search-dates.ts";
import type { LibraryVideo } from "./types";
export type GuideDiversity = {
  creatorPercent: 100 | 75 | 50;
  minSources: 1 | 2 | 3;
  olderSlots: 0 | 2;
};
export const DEFAULT_GUIDE_DIVERSITY: GuideDiversity = Object.freeze({
  creatorPercent: 100,
  minSources: 1,
  olderSlots: 0,
});
export const DIVERSITY_CREATOR_LIMIT = 64,
  DIVERSITY_OUTPUT_LIMIT = 12;
export function normalizeGuideDiversity(raw?: Partial<GuideDiversity>): GuideDiversity {
  return {
    creatorPercent: [50, 75, 100].includes(raw?.creatorPercent ?? 0) ? raw!.creatorPercent! : 100,
    minSources: [1, 2, 3].includes(raw?.minSources ?? 0) ? raw!.minSources! : 1,
    olderSlots: raw?.olderSlots === 2 ? 2 : 0,
  };
}
export const diversityEnabled = (c: GuideDiversity) =>
  c.creatorPercent < 100 || c.minSources > 1 || c.olderSlots > 0;
export function diversityCreator(v: LibraryVideo) {
  const r = v.remote;
  if (!r || !["youtube", "twitch"].includes(r.kind)) return;
  const key = r.channelId?.trim() || r.channelName?.trim().normalize("NFKC").toLowerCase();
  return key ? r.kind + ":" + key.slice(0, 500) : undefined;
}
export function publicationAge(v: LibraryVideo, now: number) {
  const e = searchDateEvidence(v, "published"),
    cut = now - 365 * 86400000;
  return !e || e.end > now
    ? "unknown"
    : e.end <= cut
      ? "older"
      : e.start > cut
        ? "recent"
        : "unknown";
}
export type DiversityResult = {
  config: GuideDiversity;
  shown: number;
  creatorCap: number;
  unknownCreators: number;
  sources: number;
  older: number;
  availableAge: { older: number; recent: number; unknown: number };
  selectedAge: { older: number; recent: number; unknown: number };
  pooled: number;
  poolLimited: boolean;
  met: boolean;
  notices: string[];
};
/** A bounded post-eligibility selector. Defaults delegate directly to the existing ranking.
 * At most 64 creator pools, one unknown pool, four source pools and one age pool × 12 rows.
 * Repair never admits explicit rank reductions or changes balanced-source quotas. */
export function createGuideDiversity<R>(
  compare: (a: R, b: R) => number,
  videoOf: (r: R) => LibraryVideo,
  tuning: RecommendationSession,
  raw: Partial<GuideDiversity> | undefined,
  now: number,
) {
  const config = normalizeGuideDiversity(raw),
    active = diversityEnabled(config),
    base = createSessionPicks<R>(12, compare, videoOf, tuning),
    creators = new Map<string, ReturnType<typeof createBoundedPicks<R>>>(),
    sources = new Map<string, ReturnType<typeof createBoundedPicks<R>>>(),
    older = createBoundedPicks<R>(12, compare),
    unknown = createBoundedPicks<R>(12, compare),
    age = { older: 0, recent: 0, unknown: 0 };
  let limited = false;
  let report: DiversityResult | undefined;
  return {
    active,
    add(row: R) {
      base.add(row);
      if (!active) return;
      const v = videoOf(row),
        key = diversityCreator(v),
        source = recommendationSource(v),
        period = publicationAge(v, now);
      age[period]++;
      if (period === "older") older.add(row);
      if (!key) unknown.add(row);
      else {
        let pool = creators.get(key);
        if (!pool && creators.size < DIVERSITY_CREATOR_LIMIT) {
          pool = createBoundedPicks<R>(12, compare);
          creators.set(key, pool);
        }
        if (pool) pool.add(row);
        else limited = true;
      }
      // Public visibility currently admits local, YouTube and Twitch. Keep an explicit fallback bucket.
      const sourceKey = ["local", "youtube", "twitch"].includes(source) ? source : "other";
      let pool = sources.get(sourceKey);
      if (!pool) {
        pool = createBoundedPicks<R>(12, compare);
        sources.set(sourceKey, pool);
      }
      pool.add(row);
    },
    async finish(turn: () => Promise<void> = async () => {}) {
      if (active) await turn();
      const selected = base.finish();
      if (!active) return selected;
      const pool = [
          ...new Map(
            [
              ...selected,
              ...[...creators.values(), ...sources.values(), unknown, older].flatMap((p) =>
                p.finish(),
              ),
            ].map((row) => [videoOf(row).id, row]),
          ).values(),
        ].sort(compare),
        n = selected.length,
        cap = Math.floor((n * config.creatorPercent) / 100);
      const metadata = new Map(
        pool.map((row) => {
          const v = videoOf(row);
          return [
            v.id,
            {
              creator: diversityCreator(v),
              source: recommendationSource(v),
              age: publicationAge(v, now),
            },
          ] as const;
        }),
      );
      const measure = (rows: R[]) => {
        const counts = new Map<string, number>();
        let missing = 0,
          old = 0;
        const providers = new Set<string>();
        for (const row of rows) {
          const info = metadata.get(videoOf(row).id)!,
            key = info.creator;
          if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
          else missing++;
          providers.add(info.source);
          if (info.age === "older") old++;
        }
        const excess =
          config.creatorPercent < 100
            ? [...counts.values()].reduce((sum, c) => sum + Math.max(0, c - cap), missing)
            : 0;
        return {
          excess,
          missing,
          old,
          providers: providers.size,
          cost:
            excess +
            Math.max(0, config.minSources - providers.size) +
            Math.max(0, config.olderSlots - old),
        };
      };
      let state = measure(selected);
      // A strictly decreasing integer cost limits repairs to <= 16 cooperative iterations.
      for (let step = 0; step < 16 && state.cost; step++) {
        const ids = new Set(selected.map((row) => videoOf(row).id));
        let choice: { at: number; row: R; cost: number } | undefined;
        let visited = 0,
          started = performance.now();
        for (const row of pool) {
          if (++visited >= 32 || performance.now() - started >= 4) {
            await turn();
            visited = 0;
            started = performance.now();
          }
          if (ids.has(videoOf(row).id)) continue;
          for (let at = selected.length - 1; at >= 0; at--) {
            if (
              tuning.sources === "balanced" &&
              recommendationSource(videoOf(row)) !== recommendationSource(videoOf(selected[at]!))
            )
              continue;
            const trial = selected.slice();
            trial[at] = row;
            const cost = measure(trial).cost;
            if (cost < state.cost && (!choice || cost < choice.cost)) choice = { at, row, cost };
          }
        }
        if (!choice) break;
        selected[choice.at] = choice.row;
        state = measure(selected);
      }
      selected.sort(compare);
      const selectedAge = { older: 0, recent: 0, unknown: 0 };
      for (const row of selected) selectedAge[publicationAge(videoOf(row), now)]++;
      const notices: string[] = [];
      if (!n) notices.push("No eligible output can establish these diversity floors.");
      if (config.creatorPercent < 100 && state.missing)
        notices.push(
          "Missing creator credits leave the creator cap unverified; local folders are not creator identities.",
        );
      if (state.providers < config.minSources)
        notices.push(
          "The requested source floor could not be met by eligible candidates in the bounded shortlist and current session.",
        );
      if (state.old < config.olderSlots)
        notices.push(
          "Too few compatible recordings with confirmed publication at least 365 days ago could fill the requested age floor. Unknown dates are not treated as old.",
        );
      if (state.excess && config.creatorPercent < 100 && !state.missing)
        notices.push(
          "The creator cap could not be met together with the other floors and source policy in this bounded shortlist.",
        );
      if (limited)
        notices.push(
          "Creator alternatives were retained for at most 64 identities. The shortlist cannot prove global feasibility.",
        );
      if (n && state.cost === 0)
        notices.push(
          "This output meets the selected diversity floors within its eligible shortlist.",
        );
      report = {
        config,
        shown: n,
        creatorCap: cap,
        unknownCreators: state.missing,
        sources: state.providers,
        older: state.old,
        availableAge: age,
        selectedAge,
        pooled: pool.length,
        poolLimited: limited,
        met: n > 0 && state.cost === 0,
        notices,
      };
      return selected;
    },
    getReport: () => report,
  };
}
