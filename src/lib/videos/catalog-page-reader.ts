export type CatalogPage<K, T> = { keys: K[]; rows: T[] };
export type CatalogReadOptions<K, T> = {
  signal?: AbortSignal;
  after?: K;
  pageSize?: number;
  beforeRead?: () => Promise<void>;
  accept: (rows: T[], last: K) => Promise<void>;
  progress?: (checkpoint: { after: K; read: number; pending: number }) => void;
};
/** Consumer acknowledgement is the cursor: no subsequent read before acceptance.
 * On cancellation the caller resumes at the last acknowledged key, never a
 * partially accepted page. At most one page is retained outside the consumer. */
export async function consumeCatalogPages<K, T>(
  read: (after: K | undefined, limit: number) => Promise<CatalogPage<K, T>>,
  options: CatalogReadOptions<K, T>,
) {
  const size = options.pageSize ?? 512;
  if (!Number.isInteger(size) || size < 1 || size > 512)
    throw Error("Catalog page size must be between 1 and 512.");
  let after = options.after,
    count = 0;
  for (;;) {
    options.signal?.throwIfAborted();
    await options.beforeRead?.();
    options.signal?.throwIfAborted();
    const page = await read(after, size);
    options.signal?.throwIfAborted();
    if (page.rows.length !== page.keys.length || page.rows.length > size)
      throw Error("Invalid catalog page.");
    if (!page.keys.length) return { after, read: count };
    const last = page.keys.at(-1)!;
    if (after !== undefined && Object.is(last, after))
      throw Error("Catalog cursor did not advance.");
    options.progress?.({ after: last, read: count, pending: 1 });
    await options.accept(page.rows, last);
    after = last;
    count += page.rows.length;
    options.progress?.({ after: last, read: count, pending: 0 });
    options.signal?.throwIfAborted();
    if (page.keys.length < size) return { after, read: count };
  }
}
