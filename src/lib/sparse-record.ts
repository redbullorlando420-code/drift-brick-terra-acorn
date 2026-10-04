/** Immutable sparse catalog updates. A new snapshot shares its original record
 * and an indexed patch tree, never the previous snapshot. Lookups traverse at
 * most seven hash branches; updating a title never enumerates the base record.
 * Enumeration/export remain explicit full-record operations. */
type Leaf<T> = { key: string; hash: number; value: T; order: number };
type Branch<T> = { bitmap: number; children: Node<T>[] };
type Collision<T> = { hash: number; entries: Leaf<T>[] };
type Node<T> = Leaf<T> | Branch<T> | Collision<T>;
type Snapshot<T> = { base: Record<string, T>; root?: Node<T>; order: number };
export type EncodedSparseRecord<T> = { __reelcaseSparseRecord: 1; snapshot: Snapshot<T> };
const snapshots = new WeakMap<object, Snapshot<unknown>>();

function hashKey(key: string) {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
  return hash >>> 0;
}
function popcount(bits: number) {
  bits -= (bits >>> 1) & 0x55555555;
  bits = (bits & 0x33333333) + ((bits >>> 2) & 0x33333333);
  return (((bits + (bits >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}
function lookup<T>(node: Node<T> | undefined, key: string, hash: number): Leaf<T> | undefined {
  for (let shift = 0; node; shift += 5) {
    if ('key' in node) return node.key === key ? node : undefined;
    if ('entries' in node) return node.entries.find(entry => entry.key === key);
    const bit = 1 << ((hash >>> shift) & 31);
    if (!(node.bitmap & bit)) return;
    node = node.children[popcount(node.bitmap & (bit - 1))];
  }
}
function insert<T>(node: Node<T> | undefined, leaf: Leaf<T>, shift: number, owned: WeakSet<object>): Node<T> {
  if (!node) return leaf;
  if ('key' in node && node.key === leaf.key) return leaf;
  if (!('children' in node)) {
    if (node.hash === leaf.hash) {
      const entries = 'entries' in node ? node.entries.slice() : [node];
      const index = entries.findIndex(entry => entry.key === leaf.key);
      if (index < 0) entries.push(leaf); else entries[index] = leaf;
      return { hash: leaf.hash, entries };
    }
    const oldBit = 1 << ((node.hash >>> shift) & 31), newBit = 1 << ((leaf.hash >>> shift) & 31);
    const branch = { bitmap: oldBit | newBit, children: oldBit === newBit
      ? [insert(node, leaf, shift + 5, owned)]
      : ((node.hash >>> shift) & 31) < ((leaf.hash >>> shift) & 31) ? [node, leaf] : [leaf, node] };
    owned.add(branch); return branch;
  }
  const branch = owned.has(node) ? node : { bitmap: node.bitmap, children: node.children.slice() };
  owned.add(branch);
  const bit = 1 << ((leaf.hash >>> shift) & 31), index = popcount(branch.bitmap & (bit - 1));
  if (branch.bitmap & bit) branch.children[index] = insert(branch.children[index], leaf, shift + 5, owned);
  else { branch.bitmap |= bit; branch.children.splice(index, 0, leaf); }
  return branch;
}
function* leaves<T>(node?: Node<T>): Generator<Leaf<T>> {
  if (!node) return;
  if ('key' in node) yield node;
  else if ('entries' in node) yield* node.entries;
  else for (const child of node.children) yield* leaves(child);
}
function snapshotOf<T>(source: Record<string, T>): Snapshot<T> {
  return snapshots.get(source) as Snapshot<T> | undefined ?? { base: source, order: 0 };
}
function recordFor<T>(snapshot: Snapshot<T>): Record<string, T> {
  const own = (key: string) => lookup(snapshot.root, key, hashKey(key));
  const proxy = new Proxy({} as Record<string, T>, {
    get: (_target, key) => { const patch = typeof key === 'string' ? own(key) : undefined;
      return patch ? patch.value : Reflect.get(snapshot.base, key); },
    has: (_target, key) => typeof key === 'string' && Boolean(own(key)) || Reflect.has(snapshot.base, key),
    getOwnPropertyDescriptor: (_target, key) => {
      const patch = typeof key === 'string' ? own(key) : undefined;
      const original = Reflect.getOwnPropertyDescriptor(snapshot.base, key);
      return patch ? { value: patch.value, enumerable: true, writable: false, configurable: true }
        : original ? { ...original, configurable: true } : undefined;
    },
    ownKeys: () => {
      const keys = Reflect.ownKeys(snapshot.base), added = [...leaves(snapshot.root)]
        .filter(leaf => !Object.hasOwn(snapshot.base, leaf.key)).sort((a, b) => a.order - b.order);
      const strings = keys.filter((key): key is string => typeof key === 'string').concat(added.map(leaf => leaf.key));
      const integer = (key: string) => String(Number(key) >>> 0) === key && key !== '4294967295';
      return [...strings.filter(integer).sort((a, b) => Number(a) - Number(b)), ...strings.filter(key => !integer(key)),
        ...keys.filter((key): key is symbol => typeof key === 'symbol')];
    },
    set: () => { throw new TypeError('Catalog snapshots are immutable; use a sparse patch'); },
    defineProperty: () => { throw new TypeError('Catalog snapshots are immutable; use a sparse patch'); },
    deleteProperty: () => { throw new TypeError('Catalog snapshots are immutable; copy before removal'); },
    preventExtensions: () => false,
    setPrototypeOf: () => false,
  });
  snapshots.set(proxy, snapshot as Snapshot<unknown>); return proxy;
}
/** A builder owns only nodes copied for this batch. finish seals the builder;
 * subsequent batches share untouched branches without a chain of old records. */
export function sparseRecordBuilder<T>(source: Record<string, T>) {
  const original = snapshotOf(source), owned = new WeakSet<object>();
  let root = original.root, order = original.order, changed = false, sealed = false;
  return {
    get(key: string): T | undefined { const patch = lookup(root, key, hashKey(key));
      return patch ? patch.value : original.base[key]; },
    set(key: string, value: T) {
      if (sealed) throw new TypeError('Sparse patch already finished');
      const hash = hashKey(key), previous = lookup(root, key, hash);
      if (previous ? Object.is(previous.value, value) : Object.hasOwn(original.base, key) && Object.is(original.base[key], value)) return;
      root = insert(root, { key, hash, value, order: previous?.order ?? order++ }, 0, owned); changed = true;
    },
    finish() {
      if (sealed) throw new TypeError('Sparse patch already finished');
      sealed = true;
      return changed ? recordFor({ base: original.base, root, order }) : source;
    },
  };
}
export function patchSparseRecord<T>(source: Record<string, T>, entries: Iterable<readonly [string, T]>) {
  const builder = sparseRecordBuilder(source);
  for (const [key, value] of entries) builder.set(key, value);
  return builder.finish();
}
/** IndexedDB cannot clone a Proxy. Persist the plain base/tree representation;
 * decoding restores indexed lookup without materializing or copying all keys. */
export function encodeSparseRecord<T>(record: Record<string, T>): Record<string, T> | EncodedSparseRecord<T> {
  const snapshot = snapshots.get(record) as Snapshot<T> | undefined;
  return snapshot ? { __reelcaseSparseRecord: 1, snapshot } : record;
}
export function decodeSparseRecord<T>(stored: unknown): Record<string, T> {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  const encoded = stored as Partial<EncodedSparseRecord<T>>;
  if (encoded.__reelcaseSparseRecord === 1 && encoded.snapshot?.base && typeof encoded.snapshot.base === 'object'
    && typeof encoded.snapshot.order === 'number') return recordFor(encoded.snapshot);
  return stored as Record<string, T>;
}
