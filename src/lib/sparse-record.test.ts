import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeSparseRecord, encodeSparseRecord, patchSparseRecord, removeSparseRecordKeys, sparseRecordBuilder, sparseRecordEntries, sparseRecordScan, type EncodedSparseRecord } from './sparse-record.ts';
import { forEachCatalogEntry } from './catalog-work.ts';

test('sparse snapshots preserve reads, own properties, key order, special IDs and JSON/spread exports', () => {
  const symbol = Symbol('sidecar'), base = { a: ['old'], '12': ['twelve'], [symbol]: 'keep' } as Record<string | symbol, unknown>;
  Object.defineProperty(base, '__proto__', { value: ['original'], enumerable: true });
  const next = patchSparseRecord(base, [['a', ['new']], ['2', ['two']], ['constructor', null], ['z', undefined], ['__proto__', ['safe']]]);
  assert.deepEqual(next.a, ['new']); assert.equal(next.constructor, null); assert.equal(next.z, undefined);
  assert.deepEqual(next.__proto__, ['safe']); assert.equal(Reflect.get(next, symbol), 'keep');
  assert.equal(Object.hasOwn(next, 'z'), true); assert.equal('z' in next, true); assert.equal(Object.hasOwn(next, 'missing'), false);
  assert.deepEqual(Object.keys(next), ['2', '12', 'a', '__proto__', 'constructor', 'z']);
  assert.deepEqual(JSON.parse(JSON.stringify(next)), { '2': ['two'], '12': ['twelve'], a: ['new'], ['__proto__']: ['safe'], constructor: null });
  assert.deepEqual(Reflect.get({ ...next }, symbol), 'keep'); assert.deepEqual(base.a, ['old']);
  assert.throws(() => { next.a = 'mutation'; }, /immutable/);
  assert.throws(() => { delete next.a; }, /immutable/);
});

test('updates touch only requested keys, keep unchanged identity and seal their mutable builder', () => {
  let reads = 0;
  const original = ['keep'];
  const base = new Proxy({ existing: original }, { ownKeys() { throw Error('base enumerated'); }, get(target, key) { reads++; return Reflect.get(target, key); } });
  const first = patchSparseRecord(base, [['changed', ['new']]]);
  assert.equal(first.existing, original); assert.deepEqual(first.changed, ['new']);
  const second = patchSparseRecord(first, [['changed', first.changed]]); assert.equal(second, first);
  const builder = sparseRecordBuilder(first); builder.set('changed', ['again']);
  const third = builder.finish(); assert.deepEqual(first.changed, ['new']); assert.deepEqual(third.changed, ['again']);
  assert.throws(() => builder.set('bad', []), /finished/); assert.throws(() => builder.finish(), /finished/);
  assert.ok(reads < 10);
});

test('repeated batches share one base and a bounded tree rather than retaining previous snapshots', () => {
  const base = { base: 1 }; let record: Record<string, number> = base;
  let old: Record<string, number> | undefined;
  for (let pass = 0; pass < 100; pass++) {
    if (pass === 30) old = record;
    record = patchSparseRecord(record, Array.from({ length: 300 }, (_, i) => [`id:${i}`, pass] as const));
  }
  const encoded = encodeSparseRecord(record) as EncodedSparseRecord<number>; assert.equal(encoded.__reelcaseSparseRecord, 1);
  assert.equal(encoded.snapshot.base, base); assert.equal(record['id:299'], 99); assert.equal(old!['id:299'], 29);
  const json = JSON.stringify(encoded); assert.ok(json.length < 35_000, 'tree stores current overrides, not an update history');
  const restored = decodeSparseRecord<number>(structuredClone(encoded));
  assert.deepEqual({ ...restored }, { ...record });
  const after = patchSparseRecord(restored, [['id:0', 101]]); assert.equal(restored['id:0'], 99); assert.equal(after['id:0'], 101);
});

test('hash collisions and all branch positions survive persistence and later updates', () => {
  const entries = Array.from({ length: 10_000 }, (_, i) => [`key-${i}`, i] as const);
  // These distinct strings have the same FNV-1a 32-bit hash.
  const first = patchSparseRecord({}, [...entries, ['costarring', 10_001] as const, ['liquid', 10_002] as const]);
  const second = patchSparseRecord(first, [['liquid', 12_000], ['costarring', 13_000]]);
  assert.equal(first.liquid, 10_002); assert.equal(second.liquid, 12_000); assert.equal(second.costarring, 13_000);
  const decoded = decodeSparseRecord<number>(JSON.parse(JSON.stringify(encodeSparseRecord(second))));
  for (const [key, value] of entries) assert.equal(decoded[key], value);
  assert.equal(decoded.costarring, 13_000); assert.equal(decoded.liquid, 12_000);
  assert.equal(Object.keys(decoded).length, 10_002);
  const plain = { legacy: ['untouched'] }; assert.equal(decodeSparseRecord(plain), plain); assert.equal(encodeSparseRecord(plain), plain);
});

test('sparse removals preserve old snapshots, erase keys from exports and restore insertion order on re-add', () => {
  const base = { a: 1, b: 2, c: 3, '12': 12, ['__proto__']: 4 };
  const updated = patchSparseRecord(base, [['added', 5], ['present-undefined', undefined]]);
  const removed = removeSparseRecordKeys(updated, ['a', 'added', '__proto__', '12', 'missing']);
  assert.equal(removed.a, undefined); assert.equal('a' in removed, false); assert.equal(Object.hasOwn(removed, 'a'), false);
  assert.equal(Object.hasOwn(removed, 'present-undefined'), true);
  assert.deepEqual(Object.keys(removed), ['b', 'c', 'present-undefined']);
  assert.deepEqual(JSON.parse(JSON.stringify(removed)), { b: 2, c: 3 });
  assert.equal(updated.a, 1); assert.equal(updated.added, 5); assert.equal(base.a, 1);
  assert.equal(removeSparseRecordKeys(removed, ['a', 'missing']), removed);
  const again = patchSparseRecord(removed, [['a', 8], ['12', 20], ['added', 9]]);
  assert.deepEqual(Object.keys(again), ['12', 'b', 'c', 'present-undefined', 'a', 'added']);
  const restored = decodeSparseRecord(structuredClone(encodeSparseRecord(again)));
  assert.deepEqual({ ...restored }, { ...again });
  assert.equal(restored.__proto__, undefined);
});

test('removing keys never enumerates the baseline; repeated toggles retain one current tree', () => {
  const base = new Proxy({ saved: true }, { ownKeys() { throw Error('Whole shelf enumerated'); } });
  let current: Record<string, boolean> = base;
  for (let i = 0; i < 1000; i++) {
    current = removeSparseRecordKeys(current, ['saved']); assert.equal(current.saved, undefined);
    current = patchSparseRecord(current, [['saved', true]]); assert.equal(current.saved, true);
  }
  const encoded = encodeSparseRecord(current) as EncodedSparseRecord<boolean>;
  assert.equal(encoded.snapshot.base, base); assert.ok(JSON.stringify(encoded.snapshot.root).length < 150);
  const builder = sparseRecordBuilder(current); builder.remove('saved'); builder.finish();
  assert.throws(() => builder.remove('saved'), /finished/);
});

test('temporary additions release their tree nodes on removal, including collisions and nested branches', () => {
  const entries: Array<readonly [string, number]> = Array.from({ length: 10000 }, (_, i) => [`temporary:${i}`, i] as const);
  entries.push(['costarring', 1], ['liquid', 2]);
  const before = patchSparseRecord({}, entries);
  const half = removeSparseRecordKeys(before, entries.filter((_, i) => i % 2 === 0).map(([key]) => key));
  for (let i = 0; i < entries.length; i++) assert.equal(half[entries[i]![0]], i % 2 ? entries[i]![1] : undefined);
  const empty = removeSparseRecordKeys(half, entries.map(([key]) => key));
  assert.deepEqual(Object.keys(empty), []); assert.equal((encodeSparseRecord(empty) as EncodedSparseRecord<number>).snapshot.root, undefined);
  assert.equal(before.liquid, 2); assert.equal(before.costarring, 1);
  let current: Record<string, number> = {};
  for (let i = 0; i < 5000; i++) current = removeSparseRecordKeys(patchSparseRecord(current, [[`temp:${i}`, i]]), [`temp:${i}`]);
  assert.equal((encodeSparseRecord(current) as EncodedSparseRecord<number>).snapshot.root, undefined);
});

test('incremental scans match enumerable values across removals, re-additions, collisions and special keys', () => {
  const base = Object.assign(Object.create({ inherited: 42 }), { a: 1, b: 2, '12': 12, ['__proto__']: 4 });
  Object.defineProperty(base, 'hidden', { value: 9, enumerable: false });
  const patched = patchSparseRecord<number | undefined>(base, [['a', 8], ['added', 5], ['present-undefined', undefined], ['hidden', 10], ['costarring', 11], ['liquid', 12]]);
  const removed = removeSparseRecordKeys(patched, ['a', 'b', '__proto__', 'costarring']);
  const restored = patchSparseRecord(removed, [['a', 20], ['__proto__', 25]]);
  for (const record of [base, patched, removed, restored, decodeSparseRecord(structuredClone(encodeSparseRecord(restored)))]) {
    const entries = [...sparseRecordEntries(record)];
    assert.equal(new Set(entries.map(([key]) => key)).size, entries.length);
    assert.deepEqual(new Map(entries), new Map(Object.entries(record)));
    assert.ok(!entries.some(([key]) => key === 'inherited'));
  }
  assert.equal(patched.a, 8); assert.equal(restored.a, 20);
});

test('a large sparse scan visits only the requested prefix before cancellation', () => {
  const record = patchSparseRecord({}, Array.from({ length: 100_000 }, (_, i) => [`video:${i}`, i] as const));
  // Throw on the export/sort trap: background iteration must use the tree.
  const arraySort = Array.prototype.sort;
  Array.prototype.sort = function() { throw Error('whole-record sort'); };
  try {
    const iterator = sparseRecordEntries(record);
    for (let i = 0; i < 256; i++) assert.equal(iterator.next().done, false);
    iterator.return(undefined);
    assert.equal(iterator.next().done, true);
  } finally { Array.prototype.sort = arraySort; }
  assert.equal([...sparseRecordEntries(record)].length, 100_000);
});

test('cooperative scans yield and cancel through deleted base entries', async () => {
  const base = Object.fromEntries(Array.from({ length: 20_000 }, (_, i) => [`id:${i}`, i]));
  const removed = removeSparseRecordKeys(base, Object.keys(base));
  let steps = 0, turns = 0, returned = 0;
  function* scan() { for (const row of sparseRecordScan(removed)) { steps++; yield row; } }
  const work = forEachCatalogEntry(scan(), row => { if (row) returned++; }, async () => {
    if (++turns === 3) throw Error('cancelled');
  });
  assert.equal(steps, 0);
  await assert.rejects(work, /cancelled/);
  assert.ok(steps > 0 && steps <= 1024); assert.equal(returned, 0);
});
