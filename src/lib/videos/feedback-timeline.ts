import {
  normalizeRejections,
  rejectionKey,
  changeRejection,
  type RecommendationRejection,
} from "./recommendation-rejections.ts";
export const FEEDBACK_TIMELINE_LIMIT = 40;
export type ManualKind =
  "rating" | "creatorRating" | "creatorLike" | "creatorFavorite" | "tagLike" | "rejection";
type Value = number | boolean | RecommendationRejection | null;
export type FeedbackOperation = {
  id: string;
  kind: ManualKind;
  target: string;
  label: string;
  before: Value;
  after: Value;
  at: number;
  undoneAt?: number;
  heartBefore?: number | null;
  heartAfter?: number | null;
};
export type FeedbackTimeline = { version: 1; entries: FeedbackOperation[]; updatedAt?: number };
type ManualFields = {
  notes?: Record<string, string>;
  tagHeartHistory?: Record<string, number>;
  ratings: Record<string, number>;
  ratingHistory?: Record<string, { rating: number; updatedAt: number }>;
  creatorRatings: Record<string, number>;
  creatorLikes: Record<string, true>;
  creatorFavorites?: Record<string, true>;
  tagLikes: Record<string, true>;
  recommendationRejections?: unknown;
  manualTimeline?: FeedbackTimeline;
};
export function parseFeedbackTimeline(raw: unknown): FeedbackTimeline {
  if (raw === undefined) return { version: 1, entries: [] };
  const r = raw as FeedbackTimeline;
  if (
    !r ||
    r.version !== 1 ||
    !Array.isArray(r.entries) ||
    r.entries.length > 40 ||
    (r.updatedAt !== undefined && (!Number.isSafeInteger(r.updatedAt) || r.updatedAt < 0))
  )
    throw Error("Feedback history has an unsupported format. Existing choices were kept.");
  const ids = new Set<string>();
  const entries = r.entries.map((e) => {
    if (
      !e ||
      typeof e.id !== "string" ||
      e.id.length > 100 ||
      ids.has(e.id) ||
      ![
        "rating",
        "creatorRating",
        "creatorLike",
        "creatorFavorite",
        "tagLike",
        "rejection",
      ].includes(e.kind) ||
      typeof e.target !== "string" ||
      !e.target ||
      e.target.length > 520 ||
      typeof e.label !== "string" ||
      e.label.length > 160 ||
      !Number.isSafeInteger(e.at) ||
      e.at < 0 ||
      (e.undoneAt !== undefined && (!Number.isSafeInteger(e.undoneAt) || e.undoneAt < e.at))
    )
      throw Error("Invalid feedback history. Existing choices were kept.");
    const valid = (v: Value) =>
      e.kind === "rejection"
        ? v === null ||
          normalizeRejections({ version: 1, updatedAt: 0, entries: [v] }).entries.length === 1
        : e.kind === "rating" || e.kind === "creatorRating"
          ? Number.isInteger(v) && Number(v) >= 0 && Number(v) <= 5
          : typeof v === "boolean";
    if (!valid(e.before) || !valid(e.after)) throw Error("Invalid feedback history value.");
    for (const stamp of [e.heartBefore, e.heartAfter])
      if (stamp !== undefined && stamp !== null && (!Number.isSafeInteger(stamp) || stamp < 0))
        throw Error("Invalid tag heart history.");
    const cleanValue = (v: Value) =>
      e.kind === "rejection" && v !== null
        ? normalizeRejections({ version: 1, updatedAt: 0, entries: [v] }).entries[0]!
        : v;
    const before = cleanValue(e.before),
      after = cleanValue(e.after);
    if (
      e.kind === "rejection" &&
      [before, after].some(
        (v) => v !== null && rejectionKey(v as RecommendationRejection) !== e.target,
      )
    )
      throw Error("Rejection history target differs from its value.");
    ids.add(e.id);
    return {
      id: e.id,
      kind: e.kind,
      target: e.target,
      label: e.label,
      before,
      after,
      at: e.at,
      ...(e.undoneAt !== undefined ? { undoneAt: e.undoneAt } : {}),
      ...(e.heartBefore !== undefined ? { heartBefore: e.heartBefore } : {}),
      ...(e.heartAfter !== undefined ? { heartAfter: e.heartAfter } : {}),
    };
  });
  return { version: 1, entries, ...(r.updatedAt !== undefined ? { updatedAt: r.updatedAt } : {}) };
}
export function manualValue(f: ManualFields, kind: ManualKind, target: string): Value {
  if (kind === "rejection")
    return (
      normalizeRejections(f.recommendationRejections).entries.find(
        (e) => rejectionKey(e) === target,
      ) ?? null
    );
  const field = {
    rating: "ratings",
    creatorRating: "creatorRatings",
    creatorLike: "creatorLikes",
    creatorFavorite: "creatorFavorites",
    tagLike: "tagLikes",
  }[kind] as keyof ManualFields;
  return (
    (f[field] as Record<string, Value> | undefined)?.[target] ??
    (kind === "rating" || kind === "creatorRating" ? 0 : false)
  );
}
export function appendFeedbackOperation(f: ManualFields, op: FeedbackOperation): FeedbackTimeline {
  const old = parseFeedbackTimeline(f.manualTimeline);
  return parseFeedbackTimeline({
    version: 1,
    updatedAt: Math.max(op.at, old.updatedAt ?? 0),
    entries: [op, ...old.entries].slice(0, 40),
  });
}
export function undoFeedbackOperation<T extends ManualFields>(
  f: T,
  id: string,
  now = Date.now(),
): T {
  const history = parseFeedbackTimeline(f.manualTimeline),
    op = history.entries.find((e) => e.id === id);
  if (
    !op ||
    op.undoneAt !== undefined ||
    history.entries.find((e) => e.kind === op.kind && e.target === op.target)?.id !== id ||
    JSON.stringify(manualValue(f, op.kind, op.target)) !== JSON.stringify(op.after)
  )
    throw Error("A newer decision changed this choice. Undo was stopped.");
  const next = {
    ...f,
    manualTimeline: {
      version: 1 as const,
      updatedAt: Math.max(now, history.updatedAt ?? 0),
      entries: history.entries.map((e) =>
        e.id === id ? { ...e, undoneAt: Math.max(now, e.at) } : e,
      ),
    },
  };
  if (op.kind === "rejection") {
    let ledger = normalizeRejections(f.recommendationRejections);
    const current = ledger.entries.find((e) => rejectionKey(e) === op.target);
    if (current) ledger = changeRejection(ledger, current, true, now);
    if (op.before)
      ledger = changeRejection(ledger, op.before as RecommendationRejection, false, now);
    next.recommendationRejections = ledger;
  } else {
    const field = {
      rating: "ratings",
      creatorRating: "creatorRatings",
      creatorLike: "creatorLikes",
      creatorFavorite: "creatorFavorites",
      tagLike: "tagLikes",
    }[op.kind] as keyof ManualFields;
    (next as any)[field] = { ...(f as any)[field] };
    if (op.before === false) delete (next as any)[field][op.target];
    else (next as any)[field][op.target] = op.before;
    if (op.kind === "rating")
      next.ratingHistory = {
        ...f.ratingHistory,
        [op.target]: { rating: op.before as number, updatedAt: now },
      };
  }
  if (op.kind === "tagLike" && op.heartBefore !== undefined) {
    if ((f.tagHeartHistory?.[op.target] ?? null) !== op.heartAfter)
      throw Error("A newer heart history changed this choice. Undo was stopped.");
    next.tagHeartHistory = { ...f.tagHeartHistory };
    if (op.heartBefore === null) delete next.tagHeartHistory[op.target];
    else next.tagHeartHistory[op.target] = op.heartBefore;
  }
  return next;
}
/** Compare all manual fields, not watch-time observations or presentation state. */
export const manualFeedbackFingerprint = (f: ManualFields) =>
  JSON.stringify([
    f.notes ?? {},
    f.tagHeartHistory ?? {},
    f.ratings ?? {},
    f.ratingHistory ?? {},
    f.creatorRatings ?? {},
    f.creatorLikes ?? {},
    f.creatorFavorites ?? {},
    f.tagLikes ?? {},
    normalizeRejections(f.recommendationRejections),
    f.manualTimeline ?? { version: 1, entries: [] },
  ]);

export const manualTimelineClock = (raw: unknown) => {
  try {
    const h = parseFeedbackTimeline(raw);
    return Math.max(h.updatedAt ?? 0, ...h.entries.map((e) => e.undoneAt ?? e.at));
  } catch {
    return 0;
  }
};

export function mergeFeedbackWatch(a: Record<string, any> = {}, b: Record<string, any> = {}) {
  const out = { ...a };
  for (const [id, row] of Object.entries(b)) {
    const old = out[id] ?? {};
    out[id] = { ...old, ...row };
    for (const key of ["preview", "fullscreen", "previewEstimated", "fullscreenEstimated"])
      if (old[key] !== undefined || row[key] !== undefined)
        out[id][key] = Math.max(Number(old[key]) || 0, Number(row[key]) || 0);
  }
  return out;
}
