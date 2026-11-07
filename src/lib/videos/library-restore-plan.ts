import { isTopicAliasLedger } from "./topic-aliases";
import { isBridgeLedger } from "./topic-bridges";
import { isGuidePreset } from "./guide-preset";
import { isExposureLedger } from "./recommendation-exposure";
import { parseFilmLedger } from "./film-review";
import { parseAnimeReviews } from "./anime-review";
import { parseProviderViewing } from "./provider-viewing";
import { mergeFollowRecovery } from "./follow-checkpoints";
import type { RestoreSnapshot, RestoreRow } from "./restore-snapshot";
import { RESTORE_MIRRORS } from "./restore-snapshot";
import { yieldCatalogTask } from "../catalog-work";
import { dedupeFollows } from "./follow-identity";
import { separateTwitchIdentity, retainTwitchSourceIdentity } from "./twitch-channel-identity";
import { mergeCreatorCollections } from "./follow-collections";
import { mergeMediaHealth, parseMediaHealth } from "./media-health";
import type { FollowedChannel } from "./types";
const obj = (v: unknown): Record<string, any> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, any>) : {};
const sidecars: Record<string, string> = {
  "marks/topic-aliases.json": "topic-aliases",
  "marks/topic-bridges.json": "topic-bridges",
  "marks/guide-preset.json": "guide-preset",
  "marks/film-reviews.json": "film-reviews",
  "marks/anime-reviews.json": "anime-reviews",
  "marks/provider-viewing.json": "provider-viewing",
  "marks/recommendation-exposure.json": "recommendation-exposure",
};
/** A side-effect-free plan. No live hooks, provider requests, storage writes or module caches are changed. */
export async function planLibraryRestore(
  base: RestoreSnapshot,
  current: ReadonlyMap<string, unknown>,
  incoming: ReadonlyMap<string, unknown>,
  mode: "merge" | "replace-follows",
  now = Date.now(),
  signal?: AbortSignal,
): Promise<RestoreSnapshot> {
  signal?.throwIfAborted();
  let work = 0;
  const clone = async (value: any, depth = 0): Promise<any> => {
    if (depth > 64) throw Error("Restore metadata is nested too deeply.");
    if (++work % 256 === 0) {
      signal?.throwIfAborted();
      await yieldCatalogTask();
    }
    if (Array.isArray(value)) {
      const out = [];
      for (const v of value) out.push(await clone(v, depth + 1));
      return out;
    }
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(value)) out[k] = await clone(value[k], depth + 1);
      return out;
    }
    return value;
  };
  const before = new Map(
      base.rows.filter((r) => r.store === "activity").map((r) => [r.key, r.value]),
    ),
    files = new Map<string, any>();
  const validators: Record<string, (raw: unknown) => unknown> = {
    "topic-aliases": (r) => {
      if (!isTopicAliasLedger(r)) throw Error("Unsupported topic alias ledger.");
    },
    "topic-bridges": (r) => {
      if (!isBridgeLedger(r)) throw Error("Unsupported topic bridge ledger.");
    },
    "guide-preset": (r) => {
      if (!isGuidePreset(r)) throw Error("Unsupported Guide preset.");
    },
    "recommendation-exposure": (r) => {
      if (!isExposureLedger(r)) throw Error("Unsupported exposure ledger.");
    },
    "film-reviews": parseFilmLedger,
    "anime-reviews": parseAnimeReviews,
    "provider-viewing": parseProviderViewing,
    "media-health:v1": parseMediaHealth,
  };
  for (const [key, validate] of Object.entries(validators))
    if (before.has(key)) validate(before.get(key));
  if (obj(before.get("feedback")).version > 5)
    throw Error("Unsupported feedback version. Existing personal data was retained.");
  for (const [file, value] of current) files.set(file, await clone(value));
  const get = (file: string) => obj(files.get(file)),
    patch = (file: string, field: string, values: unknown) => {
      const row = get(file);
      row[field] = { ...obj(row[field]), ...obj(values) };
      files.set(file, row);
    };
  for (const [file, value] of incoming) {
    const imported = await clone(value),
      row = obj(imported),
      old = get(file);
    if (file === "marks/ratings.json" && row.ratingHistory) {
      row.ratings = {
        ...Object.fromEntries(
          Object.entries(obj(row.ratingHistory)).map(([key, v]) => [key, obj(v).rating]),
        ),
        ...obj(row.ratings),
      };
    }
    if (file === "follows/youtube.json" || file === "follows/twitch.json") continue;
    if (file === "history/history.json") {
      const entries = new Map<string, any>();
      for (const e of [...(old.entries ?? []), ...(row.entries ?? [])])
        entries.set(e.eventId ?? JSON.stringify([e.id, e.at, e.source ?? "open"]), e);
      files.set(file, { entries: [...entries.values()].sort((a, b) => b.at - a.at) });
    } else if (file === "links/links.json") {
      const links = new Map<string, any>();
      for (const link of [...(old.links ?? []), ...(row.links ?? [])])
        links.set(link.url.toLowerCase(), link);
      files.set(file, { links: [...links.values()] });
    } else if (file === "marks/shelves.json")
      files.set(file, {
        favorites: [...new Set([...(old.favorites ?? []), ...(row.favorites ?? [])])],
        likes: [...new Set([...(old.likes ?? []), ...(row.likes ?? [])])],
      });
    else if (file === "marks/view-counts.json" || file === "marks/came-counts.json") {
      const counts = { ...old };
      for (const [key, v] of Object.entries(row))
        counts[key] = Math.max(counts[key] ?? 0, Number(v));
      files.set(file, counts);
    } else if (file === "follows/collections.json")
      files.set(file, {
        collections: mergeCreatorCollections(old.collections ?? [], row.collections ?? []),
      });
    else if (file === "photos/sources.json") {
      const sources = new Map(
        [...(old.sources ?? []), ...(row.sources ?? [])].map((s) => [s.id, s]),
      );
      files.set(file, { sources: [...sources.values()] });
    } else if (file === "photos/likes.json")
      files.set(file, {
        meta: { ...obj(old.meta), ...obj(row.meta) },
        likes: [...new Set([...(old.likes ?? []), ...(row.likes ?? [])])],
      });
    else if (
      file === "marks/metadata.json" ||
      file === "marks/ratings.json" ||
      file === "marks/tag-hearts.json" ||
      file === "resume/resume.json"
    ) {
      for (const [field, values] of Object.entries(row)) {
        if (field === "exportedAt" || field === "version") continue;
        patch(file, field, values);
      }
    } else if (file === "marks/media-health.json") {
      files.set(
        file,
        mergeMediaHealth(
          parseMediaHealth(before.get("media-health:v1")),
          parseMediaHealth(imported),
        ),
      );
    } else if (sidecars[file])
      files.set(file, { ...row, updatedAt: Math.max(now, (old.updatedAt ?? 0) + 1) });
    else if (file === "marks/recommendation-rejections.json")
      files.set(file, {
        ...row,
        updatedAt: Math.max(
          now,
          (obj(get("marks/ratings.json").recommendationRejections).updatedAt ?? 0) + 1,
        ),
      });
  }
  const followed: FollowedChannel[] = ["follows/youtube.json", "follows/twitch.json"].flatMap(
    (f) => get(f).channels ?? [],
  );
  const added: FollowedChannel[] = ["follows/youtube.json", "follows/twitch.json"]
    .flatMap((f) => obj(incoming.get(f)).channels ?? [])
    .map((row) => {
      const owner =
        row.kind === "twitch" && row.channelId
          ? followed.find((c) => c.kind === "twitch" && c.channelId === row.channelId)
          : undefined;
      return owner ? retainTwitchSourceIdentity(owner, row) : separateTwitchIdentity(followed, row);
    });
  const hasFollows = incoming.has("follows/youtube.json") || incoming.has("follows/twitch.json");
  const follows = dedupeFollows(
    mode === "replace-follows" && hasFollows
      ? added
      : mergeFollowRecovery({ channels: added, savedAt: 0 }, { channels: followed, savedAt: 0 }),
  );
  const existingPrefs = obj(before.get("preferences")),
    {
      sparseMetadataRecords: omitMeta,
      sparseActivityRecords: omitActivity,
      ...preferences
    } = existingPrefs;
  void omitMeta;
  void omitActivity;
  const originalMetadata = obj(current.get("marks/metadata.json"));
  const metadata = get("marks/metadata.json"),
    importedMeta = obj(incoming.get("marks/metadata.json"));
  for (const id of new Set(
    ["tags", "metadataProvenance", "categories"].flatMap((f) => Object.keys(obj(importedMeta[f]))),
  )) {
    const prior = obj(obj(metadata.metadataProvenance)[id]),
      original = obj(obj(originalMetadata.metadataProvenance)[id]);
    metadata.metadataProvenance ??= {};
    metadata.metadataProvenance[id] = {
      ...prior,
      tags: obj(prior.tags),
      lockedFields: [...new Set([...(original.lockedFields ?? []), ...(prior.lockedFields ?? [])])],
      updatedAt: Math.max(now, (prior.updatedAt ?? 0) + 1),
      manualTagsAt: Math.max(now, (prior.manualTagsAt ?? 0) + 1),
      manualCategoryAt: Math.max(now, (prior.manualCategoryAt ?? 0) + 1),
    };
  }
  const history = get("history/history.json").entries ?? [],
    resume = get("resume/resume.json"),
    shelves = get("marks/shelves.json"),
    viewCounts = get("marks/view-counts.json"),
    cameCounts = get("marks/came-counts.json");
  Object.assign(preferences, {
    follows,
    history,
    progress: resume.progress ?? {},
    resumeProgress: resume.resumeProgress ?? {},
    favorites: shelves.favorites ?? [],
    likes: shelves.likes ?? [],
    viewCounts,
    cameCounts,
    tags: metadata.tags ?? {},
    metadataProvenance: metadata.metadataProvenance ?? {},
    categories: metadata.categories ?? {},
  });
  const ratings = get("marks/ratings.json"),
    hearts = get("marks/tag-hearts.json"),
    oldFeedback = obj(before.get("feedback"));
  const feedback = {
    ...oldFeedback,
    ...ratings,
    ...hearts,
    manualTimeline: { version: 1, entries: [], updatedAt: now },
    recommendationRejections:
      files.get("marks/recommendation-rejections.json") ??
      ratings.recommendationRejections ??
      oldFeedback.recommendationRejections,
    savedAt: now,
  };
  const photoMeta = get("photos/likes.json").meta ?? {},
    photoLikes = new Set<string>(get("photos/likes.json").likes ?? []);
  for (const [id, value] of Object.entries(photoMeta)) if (obj(value).favorite) photoLikes.add(id);
  for (const id of photoLikes) photoMeta[id] = { ...obj(photoMeta[id]), favorite: true };
  const docs: Record<string, unknown> = {
    ...Object.fromEntries([...before].filter(([key]) => !key.includes(":"))),
    preferences,
    primary: {
      history,
      progress: preferences.progress,
      resumeProgress: preferences.resumeProgress,
      viewCounts,
      cameCounts,
      savedAt: now,
    },
    follows: { channels: follows, savedAt: now },
    history: { entries: history, savedAt: now },
    resume: {
      progress: preferences.progress,
      resumeProgress: preferences.resumeProgress,
      savedAt: now,
    },
    marks: { viewCounts, cameCounts, savedAt: now },
    shelves: { favorites: preferences.favorites, likes: preferences.likes, savedAt: now },
    links: { links: get("links/links.json").links ?? [], savedAt: now },
    feedback,
    photos: {
      sources: get("photos/sources.json").sources ?? [],
      meta: photoMeta,
      likes: [...photoLikes],
      savedAt: now,
    },
  };
  for (const [file, key] of Object.entries(sidecars))
    if (files.has(file)) docs[key] = files.get(file);
  if (files.has("marks/media-health.json"))
    docs["media-health:v1"] = files.get("marks/media-health.json");
  // The complete preference/activity checkpoint subsumes old deltas; rollback retains their original rows.
  const rows: RestoreRow[] = Object.entries(docs).map(([key, value]) => ({
    store: "activity",
    key,
    value,
  }));
  const mirrors: RestoreSnapshot["mirrors"] = Object.fromEntries(
    RESTORE_MIRRORS.map((k) => [k, null]),
  );
  const mirror = (key: string, value: unknown) => (mirrors[key] = JSON.stringify(value));
  mirror("reelcase.follows.v1", docs.follows);
  mirror("reelcase.history.v1", { entries: history.slice(0, 120), savedAt: now });
  mirror("reelcase.resume.v1", {
    progress: {},
    resumeProgress: Object.fromEntries(Object.entries(preferences.resumeProgress).slice(-200)),
    savedAt: now,
  });
  mirror("reelcase.marks.v1", {
    viewCounts: Object.fromEntries(Object.entries(viewCounts).slice(-200)),
    cameCounts: Object.fromEntries(Object.entries(cameCounts).slice(-200)),
    savedAt: now,
  });
  mirror("reelcase.shelves.v1", docs.shelves);
  mirror("reelcase.links.v1", {
    links: get("links/links.json").links?.slice(0, 200) ?? [],
    savedAt: now,
  });
  // Full metadata stays in IDB. Keep these emergency mirrors within the browser's existing bounds.
  // Ratings and large review ledgers hydrate from the activated IDB snapshot before the app mounts.
  mirror("reelcase.photos.v1", {
    ...obj(docs.photos),
    meta: Object.fromEntries(Object.entries(photoMeta).slice(0, 2000)),
    likes: [...photoLikes].slice(0, 2000),
  });
  mirror("reelcase.photo-meta.v1", Object.fromEntries(Object.entries(photoMeta).slice(0, 2000)));
  mirror("reelcase.follow-collections.v1", get("follows/collections.json").collections ?? []);
  // Sidecar mirrors stay absent; bootstrap hydrates their authoritative IDB records.
  const mirrorBytes = Object.values(mirrors).reduce((sum, v) => sum + (v?.length ?? 0) * 2, 0);
  if (mirrorBytes > 2 * 1024 ** 2)
    throw Error("Restore emergency mirrors exceed 2 MiB. Nothing was activated.");
  signal?.throwIfAborted();
  return { version: 1, rows, mirrors };
}
