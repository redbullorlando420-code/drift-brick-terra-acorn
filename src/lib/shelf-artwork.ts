/** Observe only one mounted rail. Release load listeners as well as the
 * observer and deadline when its owner leaves or artwork resolves. */
export function watchShelfArtwork(rail: HTMLElement, finish: (loaded: boolean) => void) {
  const pending = new Map<HTMLImageElement, () => void>();
  let stopped = false;
  const cleanup = () => {
    stopped = true; observer.disconnect(); clearTimeout(timeout);
    for (const [image, loaded] of pending) image.removeEventListener('load', loaded);
    pending.clear();
  };
  const resolve = (loaded: boolean) => { if (!stopped) { cleanup(); finish(loaded); } };
  const watch = () => {
    for (const image of rail.querySelectorAll<HTMLImageElement>('img')) {
      if (image.complete && image.naturalWidth > 0) { resolve(true); return; }
      if (pending.has(image)) continue;
      const loaded = () => resolve(true);
      pending.set(image, loaded); image.addEventListener('load', loaded, { once: true });
    }
    // A virtual window may change while artwork is pending. Do not retain
    // detached cards until the deadline.
    for (const [image, loaded] of pending) if (!rail.contains(image)) { image.removeEventListener('load', loaded); pending.delete(image); }
  };
  const observer = new MutationObserver(watch);
  const timeout = setTimeout(() => resolve(false), 5_000);
  observer.observe(rail, { childList: true, subtree: true });
  watch();
  return cleanup;
}
