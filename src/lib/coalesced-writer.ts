/** One active batch and one latest value per key, instead of retaining a
 * promise chain containing every obsolete full snapshot. Cache-only users
 * can also cap pending entries/bytes; durable user data uses no eviction. */
export class CoalescedWriter<K, V> {
  private pending = new Map<K, V>();
  private running?: Promise<void>;
  private pendingWeight = 0;
  private persist: (rows: Array<[K, V]>) => Promise<void>;
  private options: {
    batchSize?: number; maxPending?: number; maxWeight?: number; weight?: (value: V) => number;
  };
  constructor(persist: (rows: Array<[K, V]>) => Promise<void>, options: CoalescedWriter<K, V>["options"] = {}) {
    this.persist = persist;
    this.options = options;
  }

  write(key: K, value: V): Promise<void> {
    const weight = this.options.weight ?? (() => 1);
    if (weight(value) > (this.options.maxWeight ?? Infinity)) return this.idle();
    if (this.pending.has(key)) this.pendingWeight -= weight(this.pending.get(key)!);
    this.pending.delete(key);
    this.pending.set(key, value);
    this.pendingWeight += weight(value);
    while (this.pending.size > (this.options.maxPending ?? Infinity) || this.pendingWeight > (this.options.maxWeight ?? Infinity)) {
      const oldest = this.pending.entries().next().value;
      if (!oldest) break;
      this.pending.delete(oldest[0]);
      this.pendingWeight -= weight(oldest[1]);
    }
    if (!this.running) {
      this.running = Promise.resolve().then(async () => {
        let failure: unknown;
        let failed = false;
        try {
          while (this.pending.size) {
            const rows: Array<[K, V]> = [];
            for (const [id, item] of this.pending) {
              rows.push([id, item]);
              this.pending.delete(id);
              this.pendingWeight -= weight(item);
              if (rows.length >= (this.options.batchSize ?? 64)) break;
            }
            // A failed older batch must not discard a newer user snapshot
            // already queued behind it. Attempt each pending batch once.
            try { await this.persist(rows); }
            catch (error) { if (!failed) failure = error; failed = true; }
          }
          if (failed) throw failure;
        } finally {
          this.pending.clear();
          this.pendingWeight = 0;
          this.running = undefined;
        }
      });
    }
    return this.running;
  }

  idle() { return this.running ?? Promise.resolve(); }
  snapshot() { return { pending: this.pending.size, pendingWeight: this.pendingWeight, writing: Boolean(this.running) }; }
}
