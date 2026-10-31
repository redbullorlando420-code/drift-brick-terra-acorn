export type YoutubeFeedGap = {
    anchor: string;
    detectedAt: number;
    status: 'detected' | 'partial' | 'unresolved' | 'resolved';
    recovered: number;
    cursor?: string;
    checkedAt?: number;
    error?: string;
};
const identity = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{11}$/.test(v);
export function normalizeYoutubeFeedGap(raw: unknown): YoutubeFeedGap | undefined {
    const v = raw as YoutubeFeedGap;
    if (!v || !identity(v.anchor) || !Number.isFinite(v.detectedAt) || v.detectedAt <= 0 || !['detected', 'partial', 'unresolved', 'resolved'].includes(v.status) || !Number.isSafeInteger(v.recovered) || v.recovered < 0 || v.recovered > 1000000)
        return;
    return { anchor: v.anchor, detectedAt: v.detectedAt, status: v.status, recovered: v.recovered, ...(typeof v.cursor === 'string' && v.cursor.length <= 16384 ? { cursor: v.cursor } : {}), ...(Number.isFinite(v.checkedAt) && v.checkedAt! > 0 ? { checkedAt: v.checkedAt } : {}), ...(typeof v.error === 'string' ? { error: v.error.slice(0, 240) } : {}) };
}
/** Missing from a full RSS window means a possible gap, never a deletion. */
export function detectYoutubeFeedGap(ids: readonly string[], anchor?: string, now = Date.now()): YoutubeFeedGap | undefined {
    return identity(anchor) && ids.length >= 15 && !ids.includes(anchor) ? { anchor, detectedAt: now, status: 'detected', recovered: 0 } : undefined;
}
export function advanceYoutubeFeedGap(gap: YoutubeFeedGap, ids: readonly string[], cursor: string | null, complete: boolean, error?: string, now = Date.now()): YoutubeFeedGap {
    const found = ids.includes(gap.anchor);
    return { ...gap, status: found ? 'resolved' : error ? 'partial' : complete ? 'unresolved' : 'partial', checkedAt: now, recovered: Math.min(1000000, gap.recovered + new Set(ids.slice(0, found ? ids.indexOf(gap.anchor) : ids.length)).size), cursor: found || complete ? undefined : cursor ?? gap.cursor, error: error?.slice(0, 240) };
}
