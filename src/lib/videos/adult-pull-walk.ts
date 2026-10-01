/** A large user pull consists of bounded requests, never one huge response.
 * Collect once per provider so each page doesn't rebuild the entire library. */
export async function walkAdultPull<R extends {
  videos: { id: string }[]; nextPage: number | null; nextOffset: number;
}>(target: number, page: number, offset: number,
  request: (page: number, offset: number, limit: number) => Promise<R>,
  check: () => Promise<void>) {
  const rows = new Map<string, R['videos'][number]>();
  let latest: R | undefined, error: unknown;
  // A duplicate-heavy archive must not create an endless background walk.
  const maxRequests = Math.min(100, Math.max(8, Math.ceil(target / 100) * 2));
  for (let attempt = 0; attempt < maxRequests && rows.size < target; attempt++) {
    await check();
    let result: R;
    try { result = await request(page, offset, Math.min(400, target - rows.size)); }
    catch (failure) { if (!latest) throw failure; error = failure; break; }
    latest = result;
    for (const row of result.videos) rows.set(row.id, row);
    if (result.nextPage == null || (result.nextPage === page && result.nextOffset === offset)) break;
    page = result.nextPage; offset = result.nextOffset;
  }
  return { latest, videos: [...rows.values()], error };
}
