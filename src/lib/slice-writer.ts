/** Independent durable slices must not all be rewritten by a playback tick.
 * Inputs are immutable references; a failed synchronous enqueue stays dirty. */
export class SliceWriter {
  private saved = new Map<string, readonly unknown[]>();
  write(key: string, inputs: readonly unknown[], save: () => void) {
    const previous = this.saved.get(key);
    if (previous && previous.length === inputs.length && inputs.every((value, index) => Object.is(value, previous[index]))) return false;
    save();
    this.saved.set(key, inputs);
    return true;
  }
}
