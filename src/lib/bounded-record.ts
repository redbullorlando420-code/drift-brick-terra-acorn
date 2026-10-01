/** Keep the newest small cache entries within both count and byte budgets. */
export function boundedRecord<T>(record: Record<string, T>, maxEntries: number, maxWeight = Infinity, weight: (value: T) => number = () => 1) {
  const keys = Object.keys(record);
  const kept: Record<string, T> = {};
  let total = 0;
  let count = 0;
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    const size = weight(record[key]);
    if (count >= maxEntries || size > maxWeight - total) continue;
    kept[key] = record[key];
    total += size;
    count++;
  }
  if (count === keys.length) return record;
  // Preserve insertion/LRU order when returning a pruned record.
  return Object.fromEntries(Object.entries(kept).reverse());
}
