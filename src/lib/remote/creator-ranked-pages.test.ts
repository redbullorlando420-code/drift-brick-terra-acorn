import test from 'node:test';
import assert from 'node:assert/strict';
import { createCreatorRankedPages, RANKED_PREFIX_LIMIT, type CreatorRankedRow } from './creator-ranked-pages.ts';

const rows = (count: number): CreatorRankedRow<{ id: string }>[] => Array.from({ length: count }, (_, i) => ({
  video: { id: String(i) }, creator: i < count * .8 ? 'dominant' : `rare-${i % 37}`, score: i % 9, publishedAt: i % 23,
}));
function reference<T extends { id: string }>(input: CreatorRankedRow<T>[], shuffle: (id: string) => number) {
  const compare = (a: CreatorRankedRow<T>, b: CreatorRankedRow<T>) => b.score - a.score || shuffle(a.video.id) - shuffle(b.video.id) || b.publishedAt - a.publishedAt;
  const groups = new Map<string, CreatorRankedRow<T>[]>();
  for (const row of input) { const group = groups.get(row.creator) ?? []; group.push(row); groups.set(row.creator, group); }
  for (const group of groups.values()) group.sort(compare);
  const creators = [...groups.keys()].sort((a, b) => compare(groups.get(a)![0], groups.get(b)![0]) || a.localeCompare(b));
  const result: T[] = [];
  for (let round = 0; result.length < input.length; round++) for (const creator of creators) {
    const row = groups.get(creator)![round]; if (row) result.push(row.video);
  }
  return result;
}
test('compact pages match complete fair ranking through growing, overlapping and out-of-order requests', () => {
  const input = rows(10_000), page = createCreatorRankedPages(input);
  for (const shuffle of [(id: string) => +id, (id: string) => -Number(id) / 3, () => 0]) {
    const expected = reference(input, shuffle);
    for (const [offset, limit] of [[0, 48], [96, 96], [0, 192], [384, 96], [5000, 96], [0, 10_000], [9980, 96], [0, 48]]) {
      assert.deepEqual(page(shuffle, offset, limit), expected.slice(offset, offset + limit));
    }
  }
});
test('a 100k catalog hashes each candidate once per mix; nearby pages perform no catalog comparisons', () => {
  let reads = 0, hashes = 0;
  const input = rows(100_000).map(row => ({ ...row, get score() { reads++; return row.score; } }));
  const page = createCreatorRankedPages(input), shuffle = (id: string) => { hashes++; return +id; };
  const first = page(shuffle, 0, 48);
  assert.equal(hashes, 100_000);
  reads = 0;
  const deep = page(shuffle, 0, 96), next = page(shuffle, 96, 96);
  assert.equal(reads, 0); assert.equal(hashes, 100_000);
  assert.deepEqual(deep.slice(0, 48), first); assert.equal(new Set([...deep, ...next]).size, 192);
  page(shuffle, 384, 96); assert.equal(hashes, 100_000);
  page(id => { hashes++; return -Number(id); }, 0, 48); assert.equal(hashes, 200_000);
});
test('oversized requests do not expand the retained prefix or destroy a smaller cached prefix', () => {
  let reads = 0;
  const input = rows(8000).map(row => ({ ...row, get score() { reads++; return row.score; } }));
  const page = createCreatorRankedPages(input), shuffle = (id: string) => +id;
  const prefix = page(shuffle, 0, 96);
  assert.equal(page(shuffle, RANKED_PREFIX_LIMIT, 96).length, 96);
  reads = 0;
  assert.deepEqual(page(shuffle, 0, 96), prefix); assert.equal(reads, 0);
  page(shuffle, RANKED_PREFIX_LIMIT, 96); assert.ok(reads > 0, 'an oversized page was not retained');
});
test('empty and exhausted catalogs, equal ties and short creators preserve deterministic order', () => {
  assert.deepEqual(createCreatorRankedPages([])(undefined, 0, 96), []);
  const input = rows(2), page = createCreatorRankedPages(input);
  assert.deepEqual(page(undefined, 2, 96), []); assert.deepEqual(page(undefined, 0, 0), []);
  assert.deepEqual(page(undefined, 0, 96), reference(input, () => 0));
});
