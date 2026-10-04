import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeSparseRecord, encodeSparseRecord, patchSparseRecord, sparseRecordBuilder, type EncodedSparseRecord } from './sparse-record.ts';

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
