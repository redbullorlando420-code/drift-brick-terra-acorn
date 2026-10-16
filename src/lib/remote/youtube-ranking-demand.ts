type Snapshot<T> = { inputs: T; seed: number };
type Page<T> = Snapshot<T> & { videos: readonly unknown[]; total: number };
export type YoutubePageDemand<T> = Snapshot<T> & { offset: number };

/** Finished shelves outlive the worker that produced them. A viewer return
 * needs no catalog rebuild unless its inputs changed or another page is wanted.
 * A pending page belongs to one exact ranking, never to a replacement filter. */
export function youtubeRankingDemand<T>(inputs: T, seed: number, deep: boolean,
  shelf: Snapshot<T> | undefined, page: Page<T> | undefined, demand?: YoutubePageDemand<T>) {
  const same = (snapshot: Snapshot<T> | undefined) => Boolean(snapshot && snapshot.inputs === inputs && snapshot.seed === seed);
  const next = deep && same(page) && same(demand) && demand!.offset === page!.videos.length && demand!.offset < page!.total;
  return {
    build: !same(shelf) || deep && !same(page) || Boolean(next),
    pageOffset: deep ? next ? demand!.offset : 0 : undefined,
  };
}
