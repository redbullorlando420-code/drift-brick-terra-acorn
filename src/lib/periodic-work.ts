import { createPeriodicScheduler, type PeriodicTask } from './periodic-scheduler.ts';
import { getSessionPhase, subscribeSessionPhase } from './session-activity.ts';
import { getInteractionPriorityDelay } from './interaction-budget.ts';

let suspended = false;
const scheduler = createPeriodicScheduler({
  now: Date.now,
  phase: () => document.hidden ? 'hidden' : getSessionPhase(),
  inputDelay: getInteractionPriorityDelay,
  available: () => !suspended,
  setTimer: (work, delay) => window.setTimeout(work, Math.min(2_147_483_647, delay)),
  clearTimer: timer => window.clearTimeout(timer as number),
});
let owners = 0;
let unsubscribe: (() => void) | undefined;
const wake = () => scheduler.wake();
const hide = () => { suspended = true; wake(); };
const show = () => { suspended = false; wake(); };

/** Browser lifecycle wiring exists only while recurring work has an owner. */
export function registerPeriodicTask(task: PeriodicTask) {
  if (typeof window === 'undefined') return { cancel() {}, wake() {} };
  if (owners === 0) suspended = false;
  const handle = scheduler.register(task);
  if (owners++ === 0) {
    suspended = false;
    unsubscribe = subscribeSessionPhase(wake);
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', show);
  }
  let cancelled = false;
  return {
    wake: handle.wake,
    cancel() {
      if (cancelled) return;
      cancelled = true; handle.cancel();
      if (--owners === 0) {
        unsubscribe?.(); unsubscribe = undefined;
        document.removeEventListener('visibilitychange', wake);
        window.removeEventListener('online', wake);
        window.removeEventListener('pagehide', hide);
        window.removeEventListener('pageshow', show);
      }
    },
  };
}
export const wakePeriodicTasks = wake;
export const getPeriodicWorkSnapshot = () => scheduler.snapshot();
