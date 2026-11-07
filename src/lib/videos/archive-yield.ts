export type ArchiveYield = { version: 1; windows: number; score: number; recovery: number };
export function validArchiveYield(raw: unknown): raw is ArchiveYield {
  const row = raw as ArchiveYield;
  return (
    !!row &&
    row.version === 1 &&
    Object.keys(row).every((key) => ["version", "windows", "score", "recovery"].includes(key)) &&
    [row.windows, row.recovery].every((n) => Number.isInteger(n) && n >= 0 && n <= 8) &&
    row.recovery <= row.windows &&
    (row.windows > 0 || row.score === 0) &&
    Number.isInteger(row.score) &&
    row.score >= 0 &&
    row.score <= 1000
  );
}
/** Only the durable checkpoint transaction calls this. Retries of the same
 * token do not add samples, and a failure cannot earn a productive slot. */
export function nextArchiveYield(
  previous: ArchiveYield | undefined,
  cursor: { state?: string; received?: number; added?: number; duplicates?: number },
  accepted: number,
): ArchiveYield {
  const base = previous ?? { version: 1, windows: 0, score: 0, recovery: 0 };
  if (cursor.state === "failed") return { ...base, score: Math.floor(base.score / 2), recovery: 0 };
  const fresh = Math.min(accepted, cursor.added ?? 0),
    refresh = Math.max(0, accepted - fresh),
    total = Math.max(cursor.received ?? 0, fresh + (cursor.duplicates ?? 0), accepted, 1);
  const observed = Math.min(1000, Math.round(((fresh + refresh * 0.15) / total) * 1000));
  return {
    version: 1,
    windows: Math.min(8, base.windows + 1),
    score: base.windows ? Math.round((base.score * 3 + observed) / 4) : observed,
    recovery: Math.min(8, base.recovery + 1),
  };
}
export const archiveYieldWeight = (value: ArchiveYield | undefined) =>
  value ? (value.score * Math.min(4, value.recovery)) / 4 : 0;
