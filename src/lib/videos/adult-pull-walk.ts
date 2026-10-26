/** A large user pull consists of bounded requests, never one huge response.
 * Collect once per provider so each page doesn't rebuild the entire library. */
export async function walkAdultPull<R extends {
  videos: { id: string }[]; nextPage: number | null; nextOffset: number; partial?:boolean;
}>(target: number, page: number, offset: number,
  request: (page: number, offset: number, limit: number) => Promise<R>,
  check: () => Promise<void>, options: { known?: ReadonlySet<string>; refreshLimit?: number; maxRequests?: number; maxMs?: number } = {}) {
  const rows = new Map<string, R['videos'][number]>();
  const updates = new Map<string, R['videos'][number]>();
  const refreshLimit = Math.max(0, Math.min(400, options.refreshLimit ?? 0));
  let latest: R | undefined, error: unknown;
  const visited = new Set<string>(), started = Date.now();
  let requests = 0, duplicates = 0;
  // A duplicate-heavy archive must not create an endless background walk.
  const maxRequests = Math.min(100, options.maxRequests ?? Math.max(8, Math.ceil(target / 100) * 2));
  for (let attempt = 0; attempt < maxRequests && rows.size < target; attempt++) {
    const cursor = `${page}:${offset}`;
    if (visited.has(cursor) || requests > 0 && Date.now() - started >= (options.maxMs ?? Infinity)) break;
    visited.add(cursor);
    await check();
    let result: R;
    try { requests++; result = await request(page, offset, Math.min(400, target - rows.size)); }
    catch (failure) { if (!latest) throw failure; error = failure; break; }
    latest = result;
    for (const row of result.videos) {
      if (options.known?.has(row.id)) {
        duplicates++;
        if (updates.has(row.id) || updates.size < refreshLimit) updates.set(row.id,row);
        continue;
      }
      if (rows.has(row.id)) { duplicates++; continue; }
      if (rows.size < target) rows.set(row.id, row);
    }
    if(result.partial){error=new Error('Provider returned a partial page; accepted rows were kept and the unconsumed cursor needs retry.');break;}
    if (result.nextPage == null || (result.nextPage === page && result.nextOffset === offset)) break;
    page = result.nextPage; offset = result.nextOffset;
  }
  return { latest, videos: [...rows.values(), ...updates.values()], newCount: rows.size, refreshedCount: updates.size, error, requests, duplicates };
}
