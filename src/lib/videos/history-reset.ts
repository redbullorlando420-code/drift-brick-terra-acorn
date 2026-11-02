import type { RestoreSnapshot } from "./restore-snapshot";
/** History only; view counters, resume positions and ratings are untouched. */
export function withoutWatchHistory(base: RestoreSnapshot, at = Date.now()): RestoreSnapshot {
  return {
    ...base,
    rows: base.rows
      .filter((row) => row.store !== "activity-journal")
      .map((row) => {
        if (row.store !== "activity") return row;
        if (row.key === "history") return { ...row, value: { entries: [], savedAt: at } };
        if (
          (row.key === "preferences" || row.key === "primary") &&
          row.value &&
          typeof row.value === "object"
        )
          return { ...row, value: { ...row.value, history: [] } };
        return row;
      }),
    mirrors: {
      ...base.mirrors,
      "reelcase.history.v1": JSON.stringify({ entries: [], savedAt: at }),
      "reelcase.history-pending.v1": null,
      ...Object.fromEntries(
        ["reelcase.prefs.v1", "reelcase.prefs.v2", "reelcase.prefs.v3", "reelcase.prefs.v4"].map(
          (key) => [key, null],
        ),
      ),
    },
  };
}
