import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { yieldCatalogTask } from "../catalog-work";
export type ConflictChoice = "current" | "imported" | "safe";
export type PackConflict = {
  id: string;
  file: string;
  field: string;
  key: string;
  current: unknown;
  incoming: unknown;
  safe?: unknown;
};
export type ConflictReview = { version: 1; fingerprint: string; conflicts: PackConflict[] };
export const CONFLICT_LIMIT = 20000;
const obj = (v: unknown): Record<string, any> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, any>) : {};
const stable = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(stable)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, stable((v as Record<string, unknown>)[k])]),
        )
      : v;
const same = (a: unknown, b: unknown) => JSON.stringify(stable(a)) === JSON.stringify(stable(b));
const keyFor = (file: string, field: string, key: string) => JSON.stringify([file, field, key]);
const manualFields: Record<string, string[]> = {
  "marks/ratings.json": [
    "ratings",
    "notes",
    "creatorRatings",
    "creatorLikes",
    "creatorFavorites",
    "watchTime",
  ],
  "resume/resume.json": ["progress", "resumeProgress"],
  "photos/likes.json": ["meta"],
};
const metadata = "marks/metadata.json";
const bundle = (row: Record<string, any>, key: string) =>
  Object.fromEntries(
    ["tags", "metadataProvenance", "categories"]
      .filter((f) => Object.hasOwn(obj(row[f]), key))
      .map((f) => [f, row[f][key]]),
  );
function safeMerge(file: string, field: string, a: any, b: any): unknown {
  if (
    file === "resume/resume.json" &&
    Number.isFinite(a?.at) &&
    Number.isFinite(b?.at) &&
    a.at !== b.at
  )
    return a.at > b.at ? a : b;
  if (field === "watchTime")
    return {
      ...a,
      ...b,
      ...Object.fromEntries(
        ["preview", "fullscreen", "previewEstimated", "fullscreenEstimated"]
          .filter((k) => a[k] !== undefined || b[k] !== undefined)
          .map((k) => [k, Math.max(a[k] ?? 0, b[k] ?? 0)]),
      ),
    };
  if (file === metadata) {
    if (a.categories !== undefined && b.categories !== undefined && a.categories !== b.categories)
      return;
    const ap = obj(a.metadataProvenance),
      bp = obj(b.metadataProvenance);
    const tags = [...new Set([...(a.tags ?? []), ...(b.tags ?? [])])];
    return {
      ...b,
      ...a,
      tags,
      metadataProvenance: {
        ...bp,
        ...ap,
        tags: { ...obj(bp.tags), ...obj(ap.tags) },
        lockedFields: [...new Set([...(ap.lockedFields ?? []), ...(bp.lockedFields ?? [])])],
      },
    };
  }
}
/** All differing manual values require an explicit choice. No default silently prefers a backup. */
export async function reviewPackConflicts(
  incoming: ReadonlyMap<string, unknown>,
  current: ReadonlyMap<string, unknown>,
  signal?: AbortSignal,
): Promise<ConflictReview> {
  const conflicts: PackConflict[] = [],
    hash = sha256.create(),
    encoder = new TextEncoder();
  let work = 0;
  const tick = async () => {
    if (++work % 128 === 0) {
      signal?.throwIfAborted();
      await yieldCatalogTask();
    }
  };
  const add = (file: string, field: string, key: string, a: unknown, b: unknown) => {
    if (a === undefined || same(a, b)) return;
    if (conflicts.length >= CONFLICT_LIMIT)
      throw Error("More than 20,000 differing fields. Split the backup before reviewing it.");
    const safe = safeMerge(file, field, a, b);
    conflicts.push({
      id: keyFor(file, field, key),
      file,
      field,
      key,
      current: a,
      incoming: b,
      ...(safe !== undefined ? { safe } : {}),
    });
  };
  // A one-title import must not hash a 200k-title library or invalidate choices
  // when an unrelated creator's live status changes in the background.
  const affectedCurrent = new Map<string, unknown>();
  for (const [file, value] of incoming) {
    const before = obj(current.get(file)),
      after = obj(value),
      selected: Record<string, unknown> = {};
    if (file === metadata) {
      const ids = new Set(
        ["tags", "metadataProvenance", "categories"].flatMap((f) => Object.keys(obj(after[f]))),
      );
      for (const field of ["tags", "metadataProvenance", "categories"]) {
        const entries: Record<string, unknown> = {};
        for (const key of ids) {
          entries[key] = obj(before[field])[key] ?? null;
          await tick();
        }
        selected[field] = entries;
      }
    } else if (manualFields[file]) {
      for (const field of manualFields[file]) {
        const keys = field==='ratings'?[...new Set([...Object.keys(obj(after.ratings)),...Object.keys(obj(after.ratingHistory))])]:Object.keys(obj(after[field])),
          entries: Record<string, unknown> = {};
        for (const key of keys) {
          entries[key] = obj(before[field])[key] ?? null;
          await tick();
        }
        selected[field] = entries;
      }
      if (file === "marks/ratings.json")
        selected.ratingHistory = Object.fromEntries(
          [...new Set([...Object.keys(obj(after.ratings)),...Object.keys(obj(after.ratingHistory))])].map((key) => [
            key,
            obj(before.ratingHistory)[key] ?? null,
          ]),
        );
    } else if (file.startsWith("follows/")) {
      selected.channels = (before.channels ?? []).map((c: any) => ({
        id: c.id,
        channelId: c.channelId,
        handle: c.handle,
        twitchAliasRevision: c.twitchAliasRevision,
        twitchPullPolicy: c.twitchPullPolicy,
      }));
    } else if (
      file.startsWith("marks/") &&
      file !== "marks/shelves.json" &&
      !file.includes("counts")
    ) {
      // Feature-ledger policies remain authoritative; their bounded full state
      // is included when the corresponding ledger is actually being imported.
      affectedCurrent.set(file, before);
      continue;
    }
    affectedCurrent.set(file, selected);
  }
  for (const [label, files] of [
    ["current", affectedCurrent],
    ["incoming", incoming],
  ] as const) {
    for (const [file, value] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
      const row = obj(value);
      hash.update(encoder.encode(JSON.stringify([label, file])));
      for (const field of Object.keys(row).sort()) {
        const data = row[field];
        if (data && typeof data === "object")
          for (const key of Object.keys(data).sort()) {
            hash.update(encoder.encode(JSON.stringify([field, key, stable(data[key])])));
            await tick();
          }
        else {
          hash.update(encoder.encode(JSON.stringify([field, stable(data)])));
          await tick();
        }
      }
    }
  }
  for (const [file, value] of incoming) {
    const before = obj(current.get(file)),
      after = obj(value);
    if (file === metadata) {
      const ids = new Set(
        ["tags", "metadataProvenance", "categories"].flatMap((f) => Object.keys(obj(after[f]))),
      );
      for (const key of ids) {
        const a = bundle(before, key),
          b = bundle(after, key);
        if (Object.keys(a).length) add(file, "metadata", key, a, b);
        await tick();
      }
    } else
      for (const field of manualFields[file] ?? []) {
        const values=field==='ratings'?{...Object.fromEntries(Object.entries(obj(after.ratingHistory)).map(([key,v])=>[key,obj(v).rating])),...obj(after.ratings)}:obj(after[field]);
        for (const [key, b] of Object.entries(values)) {
          const a = field==='ratings'?(obj(before.ratings)[key]??obj(obj(before.ratingHistory)[key]).rating):obj(before[field])[key];
          if (field === "ratings")
            add(
              file,
              field,
              key,
              a === undefined
                ? undefined
                : {
                    rating: a,
                    history: obj(before.ratingHistory)[key] ?? { rating: a, updatedAt: 0 },
                  },
              { rating: b, history: obj(after.ratingHistory)[key] ?? { rating: b, updatedAt: 0 } },
            );
          else add(file, field, key, a, b);
          await tick();
        }
      }
  }
  signal?.throwIfAborted();
  return { version: 1, fingerprint: bytesToHex(hash.digest()), conflicts };
}
export function resolvePackConflicts(
  files: ReadonlyMap<string, unknown>,
  review: ConflictReview,
  choices: Record<string, ConflictChoice>,
): Map<string, unknown> {
  const result = new Map(files),
    copies = new Map<string, Record<string, any>>(),
    fieldCopies = new Set<string>();
  for (const conflict of review.conflicts) {
    const choice = choices[conflict.id];
    if (!["current", "imported", "safe"].includes(choice))
      throw Error("Choose how to handle every differing saved field before applying.");
    if (choice === "safe" && conflict.safe === undefined)
      throw Error("This field has no safe automatic merge. Choose current or imported.");
    const value =
      choice === "current"
        ? conflict.current
        : choice === "imported"
          ? conflict.incoming
          : conflict.safe;
    let row = copies.get(conflict.file);
    if (!row) {
      row = { ...obj(result.get(conflict.file)) };
      copies.set(conflict.file, row);
      result.set(conflict.file, row);
    }
    const put = (field: string, v: unknown) => {
      const fieldKey = conflict.file + "|" + field;
      if (!fieldCopies.has(fieldKey)) {
        row![field] = { ...obj(row![field]) };
        fieldCopies.add(fieldKey);
      }
      if (v === undefined) delete row![field][conflict.key];
      else row![field][conflict.key] = v;
    };
    if (conflict.file === metadata)
      for (const field of ["tags", "metadataProvenance", "categories"])
        put(field, obj(value)[field]);
    else if (conflict.field === "ratings") {
      put("ratings", obj(value).rating);
      put("ratingHistory", obj(value).history);
    } else put(conflict.field, value);
  }
  return result;
}
