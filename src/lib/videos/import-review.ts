import { canonicalFollowHandle } from "./follow-identity.ts";
import type { FollowKind } from "./types";
export type ImportChoice = "include" | "skip" | "failed";
export type ImportReviewState = {
  version: 1;
  choices: Record<string, ImportChoice>;
  failures: Record<string, string>;
  filter: string;
  status: "all" | "ready" | "held" | "excluded" | "saved" | "failed";
  focusKey?: string;
};
export const emptyImportReview = (): ImportReviewState => ({
  version: 1,
  choices: {},
  failures: {},
  filter: "",
  status: "all",
});
export function cleanImportReview(
  value: unknown,
  activeKeys?: ReadonlySet<string>,
): ImportReviewState | undefined {
  if (!value || typeof value !== "object" || (value as ImportReviewState).version !== 1) return;
  const v = value as ImportReviewState,
    result = emptyImportReview();
  let choiceBytes = 0;
  for (const [key, choice] of Object.entries(v.choices ?? {})
    .filter(([key]) => !activeKeys || activeKeys.has(key))
    .slice(0, 10000))
    if (
      key.length <= 1000 &&
      (choice === "include" || choice === "skip" || choice === "failed") &&
      (choiceBytes += key.length * 2 + 16) <= 2097152
    )
      Object.defineProperty(result.choices, key, {
        value: choice,
        enumerable: true,
        writable: true,
        configurable: true,
      });
  for (const [key, reason] of Object.entries(v.failures ?? {}).slice(-128))
    if (key.length <= 1000 && typeof reason === "string")
      Object.defineProperty(result.failures, key, {
        value: reason.slice(0, 300),
        enumerable: true,
        writable: true,
        configurable: true,
      });
  result.filter = typeof v.filter === "string" ? v.filter.slice(0, 200) : "";
  if (["all", "ready", "held", "excluded", "saved", "failed"].includes(v.status))
    result.status = v.status;
  if (typeof v.focusKey === "string" && v.focusKey.length <= 1000) result.focusKey = v.focusKey;
  return result;
}
export function importReviewRow(
  kind: FollowKind,
  query: string,
  state: ImportReviewState,
  resolved: ReadonlySet<string>,
) {
  const key = canonicalFollowHandle(kind, query),
    saved = resolved.has(key);
  const exact =
    kind === "twitch" || /^(?:@|https?:\/\/|(?:www\.)?youtube\.com\/|UC[\w-]{22}$)/i.test(query);
  const choice = Object.hasOwn(state.choices, key) ? state.choices[key] : undefined,
    reason =
      Object.hasOwn(state.failures, key) && typeof state.failures[key] === "string"
        ? state.failures[key]
        : undefined;
  const included = !saved && (choice === "include" || choice === "failed" || (!choice && exact));
  const status: Exclude<ImportReviewState["status"], "all"> = saved
    ? "saved"
    : choice === "skip"
      ? "excluded"
      : reason || choice === "failed"
        ? "failed"
        : included
          ? "ready"
          : "held";
  return { key, query, included, status, reason };
}
export function reviewedImportBatch(
  kind: FollowKind,
  queries: readonly string[],
  state: ImportReviewState,
  resolved: ReadonlySet<string>,
  failed = false,
) {
  const rows: Array<{ query: string; kind: FollowKind }> = [];
  for (const query of queries) {
    const row = importReviewRow(kind, query, state, resolved);
    if (row.included && row.status === (failed ? "failed" : "ready")) rows.push({ query, kind });
    if (rows.length === 50) break;
  }
  return rows;
}
export function importReviewWindow(length: number, scrollTop: number, height = 448) {
  const rowHeight = 112,
    first = Math.max(0, Math.floor(scrollTop / rowHeight) - 3);
  const start = Math.min(first, Math.max(0, length - 1));
  return { start, end: Math.min(length, start + Math.ceil(height / rowHeight) + 6), rowHeight };
}
