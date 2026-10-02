export const SESSION_IDLE_MS = 5 * 60_000;
let lastActivityAt = 0;
export type SessionPhase = "active" | "idle" | "hidden";
let phase: SessionPhase = "active";
const listeners = new Set<() => void>();
export function getSessionPhase() { return phase; }
export function subscribeSessionPhase(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function publish(next: SessionPhase) {
  if (next === phase) return;
  phase = next;
  for (const listener of listeners) listener();
}
/** Visible artwork remains painted during idle; speculative/hidden artwork
 * releases decoded surfaces until input or visibility returns. */
export function allowCardArtwork(current: SessionPhase, near: boolean, visible: boolean) {
  return near && current !== "hidden" && (current === "active" || visible);
}

export function sessionIsActive(lastInput: number, now: number, visible = true) {
  return visible && now - lastInput < SESSION_IDLE_MS;
}

/** Speculative refreshes stop after five minutes without input. Bounded
 * YouTube archive turns use visibility, pause, playback and entry-limit gates
 * instead, so an idle page can recover after a longer provider cooldown. */
export function allowAutomaticRefresh(now = Date.now()) {
  return typeof document !== "undefined" && sessionIsActive(lastActivityAt, now, !document.hidden);
}

export function trackSessionActivity(onIdle: () => void, onActive: () => void = () => {}) {
  lastActivityAt = Date.now();
  publish(document.hidden ? "hidden" : "active");
  let trimmed = false;
  const mark = () => { if (document.hidden) return; lastActivityAt = Date.now(); publish("active"); if (trimmed) onActive(); trimmed = false; };
  const check = () => {
    publish(document.hidden ? "hidden" : allowAutomaticRefresh() ? "active" : "idle");
    if (!allowAutomaticRefresh() && !trimmed) { trimmed = true; onIdle(); }
  };
  const visible = () => { if (document.hidden) check(); else mark(); };
  const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
  for (const event of events) window.addEventListener(event, mark, { passive: true });
  document.addEventListener("visibilitychange", visible);
  const timer = window.setInterval(check, 30_000);
  return () => {
    window.clearInterval(timer);
    for (const event of events) window.removeEventListener(event, mark);
    document.removeEventListener("visibilitychange", visible);
  };
}
