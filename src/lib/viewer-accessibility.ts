/** Playback keys must never consume a control's native keyboard action. */
export function playerShortcutAllowed(input: {
  key: string; interactive: boolean; modified: boolean; prevented: boolean; provider: boolean;
}): boolean {
  if (input.prevented || input.modified || input.interactive || input.key === 'Escape') return false;
  return !input.provider || ['n', 'N', 'p', 'P'].includes(input.key);
}

/** A handoff stays inside the viewer; navigation or an existing restored focus wins. */
export function viewerReturnTarget<T>(input: {
  viewerOpen: boolean; sameScope: boolean; currentOutside: boolean;
  opener: T | null; replacement: T | null; fallback: T | null;
}): T | null {
  if (input.viewerOpen || input.currentOutside) return null;
  return input.sameScope ? input.opener ?? input.replacement ?? input.fallback : input.fallback;
}

/** One deferred unmount, canceled even if its callback has already been queued. */
export function createShelfRelease(schedule: (callback: () => void, delay: number) => () => void) {
  let stop: (() => void) | undefined;
  let generation = 0;
  const cancel = () => { generation++; stop?.(); stop = undefined; };
  return {
    cancel,
    defer(keep: () => boolean, release: () => void) {
      cancel();
      const version = generation;
      stop = schedule(() => {
        if (version !== generation) return;
        stop = undefined;
        if (!keep()) release();
      }, 900);
    },
  };
}
