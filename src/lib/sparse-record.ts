/** Immutable sparse catalog updates. A new snapshot shares its original record
 * and an indexed patch tree, never the previous snapshot. Lookups traverse at
 * most seven hash branches; updating a title never enumerates the base record.
 * Enumeration/export remain explicit full-record operations. */
type Leaf<T> = { key: string; hash: number; value: T; order: number; deleted?: true; reinserted?: true };
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
function removeNode<T>(node: Node<T> | undefined, key: string, hash: number, shift: number, owned: WeakSet<object>): Node<T> | undefined {
  if (!node) return;
  if ('key' in node) return node.key === key ? undefined : node;
  if ('entries' in node) {
    const entries = node.entries.filter(entry => entry.key !== key);
    return entries.length === node.entries.length ? node : entries.length === 1 ? entries[0] : entries.length ? { hash: node.hash, entries } : undefined;
  }
  const bit = 1 << ((hash >>> shift) & 31);
  if (!(node.bitmap & bit)) return node;
  const index = popcount(node.bitmap & (bit - 1)), previous = node.children[index];
  const child = removeNode(previous, key, hash, shift + 5, owned);
  if (child === previous) return node;
  const branch = owned.has(node) ? node : { bitmap: node.bitmap, children: node.children.slice() };
  owned.add(branch);
  if (child) branch.children[index] = child;
  else { branch.children.splice(index, 1); branch.bitmap &= ~bit; }
  if (!branch.children.length) return;
  // A nested branch needs its hash depth; only leaves/collisions can collapse.
  return branch.children.length === 1 && !('children' in branch.children[0]!) ? branch.children[0] : branch;
}
function snapshotOf<T>(source: Record<string, T>): Snapshot<T> {
  return snapshots.get(source) as Snapshot<T> | undefined ?? { base: source, order: 0 };
}
function recordFor<T>(snapshot: Snapshot<T>): Record<string, T> {
  const own = (key: string) => lookup(snapshot.root, key, hashKey(key));
  const proxy = new Proxy({} as Record<string, T>, {
    get: (_target, key) => { const patch = typeof key === 'string' ? own(key) : undefined;
      return patch ? patch.deleted ? undefined : patch.value : Reflect.get(snapshot.base, key); },
    has: (_target, key) => { const patch = typeof key === 'string' ? own(key) : undefined;
      return patch ? !patch.deleted : Reflect.has(snapshot.base, key); },
    getOwnPropertyDescriptor: (_target, key) => {
      const patch = typeof key === 'string' ? own(key) : undefined;
      const original = Reflect.getOwnPropertyDescriptor(snapshot.base, key);
      return patch ? patch.deleted ? undefined : { value: patch.value, enumerable: true, writable: false, configurable: true }
        : original ? { ...original, configurable: true } : undefined;
    },
    ownKeys: () => {
      const patches = [...leaves(snapshot.root)], excluded = new Set(patches.filter(leaf => leaf.deleted || leaf.reinserted).map(leaf => leaf.key));
      const baseKeys = Reflect.ownKeys(snapshot.base);
      const keys = excluded.size ? baseKeys.filter(key => typeof key !== 'string' || !excluded.has(key)) : baseKeys;
      const added = patches
        .filter(leaf => !leaf.deleted && (leaf.reinserted || !Object.hasOwn(snapshot.base, leaf.key))).sort((a, b) => a.order - b.order);
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
      return patch ? patch.deleted ? undefined : patch.value : original.base[key]; },
    set(key: string, value: T) {
      if (sealed) throw new TypeError('Sparse patch already finished');
      const hash = hashKey(key), previous = lookup(root, key, hash);
      if (previous ? !previous.deleted && Object.is(previous.value, value) : Object.hasOwn(original.base, key) && Object.is(original.base[key], value)) return;
      root = insert(root, { key, hash, value, order: previous?.deleted ? order++ : previous?.order ?? order++,
        ...(previous?.deleted || previous?.reinserted ? { reinserted: true as const } : {}) }, 0, owned); changed = true;
    },
    remove(key: string) {
      if (sealed) throw new TypeError('Sparse patch already finished');
      const hash = hashKey(key), previous = lookup(root, key, hash);
      if (previous ? previous.deleted : !Object.hasOwn(original.base, key)) return;
      root = Object.hasOwn(original.base, key)
        ? insert(root, { key, hash, value: undefined as T, order: previous?.order ?? order++, deleted: true }, 0, owned)
        : removeNode(root, key, hash, 0, owned);
      changed = true;
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
/** Removed keys disappear from lookup, own keys, spread and JSON. A tombstone
 * distinguishes deletion from an explicitly stored undefined value. */
export function removeSparseRecordKeys<T>(source: Record<string, T>, keys: Iterable<string>) {
  const builder = sparseRecordBuilder(source);
  for (const key of keys) builder.remove(key);
  return builder.finish();
}
/** Incremental, unordered own enumerable string entries for background scans.
 * Going through the Proxy's ownKeys trap materializes and sorts every patch
 * before the first yield. Walk the immutable base and tree directly instead;
 * callers can yield/cancel between entries without a catalog-sized key array.
 * Ordered JSON/spread exports still use the standard object interface. */
export function* sparseRecordScan<T>(record: Record<string, T>, readValues = true): Generator<[string, T] | undefined> {
  const snapshot = snapshots.get(record) as Snapshot<T> | undefined;
  const base = snapshot?.base ?? record;
  for (const key in base) {
    if (!Object.hasOwn(base, key)) { yield undefined; continue; }
    const patch = lookup(snapshot?.root, key, hashKey(key));
    if (patch?.deleted || patch?.reinserted) { yield undefined; continue; }
    yield [key, readValues ? patch ? patch.value : base[key]! : undefined as T];
  }
  for (const patch of leaves(snapshot?.root)) {
    if (!patch.deleted && (patch.reinserted || !Object.prototype.propertyIsEnumerable.call(base, patch.key)))
      yield [patch.key, patch.value];
    else yield undefined;
  }
}
/** Scan steps include tombstones/overrides so cooperative callers can yield
 * even when most entries were removed. Entries alone have no ordering contract. */
export function* sparseRecordEntries<T>(record: Record<string, T>): Generator<[string, T]> {
  for (const row of sparseRecordScan(record)) if (row) yield row;
}
/** Ordered consumers can scan the base and cooperatively sort only relevant
 * appended entries by their insertion ordinal, instead of exporting all keys. */
export function sparseRecordOrderedParts<T>(record: Record<string, T>) {
  const snapshot = snapshots.get(record) as Snapshot<T> | undefined, base = snapshot?.base ?? record;
  function* existing(): Generator<[string, T] | undefined> {
    for (const key in base) {
      if (!Object.hasOwn(base, key)) { yield undefined; continue; }
      const patch = lookup(snapshot?.root, key, hashKey(key));
      if (patch?.deleted || patch?.reinserted) { yield undefined; continue; }
      yield [key, patch ? patch.value : base[key]!];
    }
  }
  function* appended(): Generator<[string, T, number] | undefined> {
    for (const patch of leaves(snapshot?.root)) {
      if (!patch.deleted && (patch.reinserted || !Object.prototype.propertyIsEnumerable.call(base, patch.key)))
        yield [patch.key, patch.value, patch.order];
      else yield undefined;
    }
  }
  return { existing: existing(), appended: appended() };
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
