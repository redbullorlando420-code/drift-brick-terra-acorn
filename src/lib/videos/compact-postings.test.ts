import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CompactPostings } from './compact-postings.ts';

test('one million document references use packed 32-bit storage and retain every ordinal', () => {
  const index = new CompactPostings();
  for (let i = 0; i < 1_000_000; i++) index.add('youtube', i);
  let ordinal = 0;
  index.forEach('youtube', value => { assert.equal(value, ordinal++); });
  assert.equal(ordinal, 1_000_000);
  assert.deepEqual(index.snapshot(), { terms: 1, references: 1_000_000, packedBytes: 4_194_304 });
});
test('rare terms, duplicate appends, and resets do not allocate a Set per term', () => {
  const index = new CompactPostings();
  index.add('rare', 0); index.add('rare', 0); index.add('rare', 3); index.add('rare', 3); index.add('other', 2);
  const found: number[] = []; index.forEach('rare', id => found.push(id));
  assert.deepEqual(found, [0, 3]);
  assert.deepEqual(index.snapshot(), { terms: 2, references: 3, packedBytes: 16 });
  index.clear(); assert.deepEqual([...index.keys()], []);
});
