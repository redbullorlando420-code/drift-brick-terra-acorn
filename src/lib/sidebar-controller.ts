// The v1 default was auto-collapse. Start v2 open and pinned so existing v1
// preferences cannot immediately put the sidebar back into the old behavior.
export const SIDEBAR_PINNED_KEY = 'reelcase.sidebar.pinned.v2';
type Snapshot = { open: boolean; pinned: boolean };
/** A single retract timer, independent of catalog/store updates. */
export function createSidebarController(schedule: (work: () => void, delay: number) => () => void) {
  let snapshot: Snapshot = { open: true, pinned: true };
  let pointer = false, focus = false, generation = 0;
  let cancel: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const stop = () => { generation++; cancel?.(); cancel = undefined; };
  const publish = (open: boolean, pinned = snapshot.pinned) => {
    if (snapshot.open === open && snapshot.pinned === pinned) return;
    snapshot = { open, pinned }; listeners.forEach(listener => listener());
  };
  const retract = () => {
    stop();
    if (!snapshot.open || snapshot.pinned || pointer || focus) return;
    const ticket = generation;
    cancel = schedule(() => {
      if (ticket !== generation || pointer || focus || snapshot.pinned) return;
      cancel = undefined; publish(false);
    }, 180);
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    toggle: () => { stop(); const open = !snapshot.open; publish(open, open); },
    pin: (pinned: boolean) => { stop(); publish(pinned || snapshot.open, pinned); if (!pinned) retract(); },
    pointer: (inside: boolean) => { pointer = inside; if (inside) stop(); else retract(); },
    focus: (inside: boolean) => { focus = inside; if (inside) stop(); else retract(); },
    dismiss: () => { stop(); if (!snapshot.pinned) publish(false); },
    dispose: () => { stop(); pointer = focus = false; },
  };
}
