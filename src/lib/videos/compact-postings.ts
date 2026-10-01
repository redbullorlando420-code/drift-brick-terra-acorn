/** Append-only document references: singleton numbers for rare terms, packed
 * 32-bit pages for common terms. No per-document string/Set nodes. */
type Posting = number | { values: Uint32Array; length: number };
export class CompactPostings {
  private terms = new Map<string, Posting>();
  add(term: string, id: number) {
    const entry = this.terms.get(term);
    if (entry === undefined) { this.terms.set(term, id); return; }
    if (typeof entry === 'number') {
      if (entry === id) return;
      this.terms.set(term, { values: new Uint32Array([entry, id]), length: 2 }); return;
    }
    if (entry.values[entry.length - 1] === id) return;
    if (entry.length === entry.values.length) {
      const values = new Uint32Array(entry.length * 2); values.set(entry.values); entry.values = values;
    }
    entry.values[entry.length++] = id;
  }
  forEach(term: string, visit: (id: number) => void) {
    const entry = this.terms.get(term);
    if (typeof entry === 'number') visit(entry);
    else if (entry) for (let i = 0; i < entry.length; i++) visit(entry.values[i]!);
  }
  keys() { return this.terms.keys(); }
  clear() { this.terms.clear(); }
  snapshot() {
    let references = 0, packedBytes = 0;
    for (const entry of this.terms.values()) {
      references += typeof entry === 'number' ? 1 : entry.length;
      packedBytes += typeof entry === 'number' ? 8 : entry.values.byteLength;
    }
    return { terms: this.terms.size, references, packedBytes };
  }
}
