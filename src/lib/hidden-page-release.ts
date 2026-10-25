/** One deadline while hidden, no polling. Returning before the deadline keeps
 * playback intact; a released third-party page requires explicit resumption. */
export function watchHiddenPage(release: () => void, graceMs = 60_000,
  runtime = { page: document, surface: window }) {
  let timer: number | undefined, released = false;
  const clear = () => { if (timer !== undefined) runtime.surface.clearTimeout(timer); timer = undefined; };
  const finish = () => { clear(); if (!released) { released = true; release(); } };
  const visibility = () => {
    clear();
    if (runtime.page.hidden && !released) timer = runtime.surface.setTimeout(finish, graceMs);
  };
  runtime.page.addEventListener('visibilitychange', visibility);
  runtime.surface.addEventListener('pagehide', finish);
  visibility();
  return () => { clear(); runtime.page.removeEventListener('visibilitychange', visibility); runtime.surface.removeEventListener('pagehide', finish); };
}
