const WINDOW_SIZE = 240;
const frames = new Float64Array(WINDOW_SIZE);
let mountedCards = 0, lastActiveCards = 0, longFrames = 0, lastFrameMs = 0, worstFrameMs = 0;
let previousFrame: number | undefined, frameLoopRunning = false, monitoringEnabled = false;
let generation = 0, frameId: number | undefined, sampledFrames = 0, sampledAt = 0;
let stopVisibility: (() => void) | undefined;
const startedAt = Date.now();
const visible = () => typeof document === 'undefined' || !document.hidden;
function stopLoop() {
  generation++;
  if (frameId !== undefined && typeof window !== 'undefined') window.cancelAnimationFrame?.(frameId);
  frameId = undefined; frameLoopRunning = false; previousFrame = undefined;
}
function observeFrames() {
  if (!monitoringEnabled || !mountedCards || !visible() || frameLoopRunning || typeof window === 'undefined') return;
  frameLoopRunning = true;
  const current = generation;
  const frame = (now: number) => {
    if (current !== generation) return;
    if (!monitoringEnabled || !mountedCards || !visible()) { stopLoop(); return; }
    lastActiveCards = mountedCards;
    if (previousFrame !== undefined) {
      lastFrameMs = Math.max(0, Math.round(now - previousFrame));
      worstFrameMs = Math.max(worstFrameMs, lastFrameMs);
      if (lastFrameMs > 34) longFrames++;
      frames[sampledFrames++ % WINDOW_SIZE] = lastFrameMs;
      sampledAt = Date.now();
    }
    previousFrame = now;
    frameId = window.requestAnimationFrame(frame);
  };
  frameId = window.requestAnimationFrame(frame);
}
/** Fixed-size, local-only samples. Hidden tabs and unmounted shelves stop work. */
export function registerMountedCard() {
  mountedCards++;
  observeFrames();
  let released = false;
  return () => {
    if (released) return;
    released = true; mountedCards = Math.max(0, mountedCards - 1);
    if (!mountedCards) stopLoop();
  };
}
export function setRenderBudgetMonitoring(enabled: boolean) {
  monitoringEnabled = enabled;
  if (!enabled) { stopLoop(); stopVisibility?.(); stopVisibility = undefined; return; }
  if (!stopVisibility && typeof document !== 'undefined') {
    const onVisibility = () => { stopLoop(); observeFrames(); };
    document.addEventListener('visibilitychange', onVisibility);
    stopVisibility = () => document.removeEventListener('visibilitychange', onVisibility);
  }
  observeFrames();
}
export function getRenderBudgetSnapshot() {
  const count = Math.min(WINDOW_SIZE, sampledFrames);
  let recentLongFrames = 0, recentWorstFrameMs = 0;
  for (let index = 0; index < count; index++) {
    if (frames[index] > 34) recentLongFrames++;
    recentWorstFrameMs = Math.max(recentWorstFrameMs, frames[index]);
  }
  return { mountedCards, lastActiveCards, longFrames, lastFrameMs, worstFrameMs, startedAt,
    sampledFrames: count, totalSampledFrames: sampledFrames, recentLongFrames, recentWorstFrameMs, sampledAt, monitoring: monitoringEnabled };
}
