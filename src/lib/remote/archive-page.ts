/** Resume within a fixed provider page when the user's batch limit is smaller
 * than that page. Advancing immediately would silently skip archive entries. */
export function archivePageWindow<T>(rows: readonly T[], page: number, offset: number, budget: number, nextPage: number | null) {
  const start = Math.max(0, Math.min(rows.length, Math.floor(offset)));
  const end = Math.min(rows.length, start + Math.max(0, Math.floor(budget)));
  return { rows: rows.slice(start, end), nextPage: end < rows.length ? page : nextPage, nextOffset: end < rows.length ? end : 0 };
}
