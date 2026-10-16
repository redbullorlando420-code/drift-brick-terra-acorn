/** Multiple foreground jobs share a pause without one cleanup releasing
 * another job's hold. The last release wakes optional background work. */
export function createWorkHold(changed: (held: boolean) => void) {
  let count = 0;
  return {
    held: () => count > 0,
    acquire() {
      if (++count === 1) changed(true);
      let released = false;
      return () => {
        if (released) return;
        released = true;
        if (--count === 0) changed(false);
      };
    },
  };
}
