type RenderBudgetSnapshot = {
  mountedCards: number;
  longFrames: number;
  lastFrameMs: number;
  worstFrameMs: number;
  startedAt: number;
};

let mountedCards = 0;
let longFrames = 0;
let lastFrameMs = 0;
let worstFrameMs = 0;
let previousFrame = 0;
let frameLoopRunning = false;
let monitoringEnabled = false;
let monitoringGeneration = 0;
const startedAt = Date.now();

function observeFrames() {
  if (!monitoringEnabled || mountedCards === 0 || frameLoopRunning || typeof window === "undefined") return;
  frameLoopRunning = true;
  const generation = monitoringGeneration;
  const frame = (now: number) => {
    if (generation !== monitoringGeneration) return;
    if (previousFrame) {
      lastFrameMs = Math.round(now - previousFrame);
      worstFrameMs = Math.max(worstFrameMs, lastFrameMs);
      if (lastFrameMs > 34) longFrames += 1;
    }
    previousFrame = now;
    if (monitoringEnabled && mountedCards > 0) window.requestAnimationFrame(frame);
    else frameLoopRunning = false;
  };
  window.requestAnimationFrame(frame);
}

/** Lightweight, local-only telemetry for the diagnostics panel. */
export function registerMountedCard() {
  mountedCards += 1;
  observeFrames();
  return () => { mountedCards = Math.max(0, mountedCards - 1); };
}

/** Frame sampling is opt-in so a mounted catalog never keeps a 60Hz loop alive. */
export function setRenderBudgetMonitoring(enabled: boolean) {
  monitoringEnabled = enabled;
  if (!enabled) {
    // Invalidate any queued callback so toggling diagnostics cannot duplicate loops.
    monitoringGeneration += 1;
    frameLoopRunning = false;
    previousFrame = 0;
    return;
  }
  observeFrames();
}

export function getRenderBudgetSnapshot(): RenderBudgetSnapshot {
  return { mountedCards, longFrames, lastFrameMs, worstFrameMs, startedAt };
}
