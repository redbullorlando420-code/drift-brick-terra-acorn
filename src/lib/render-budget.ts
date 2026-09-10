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
const startedAt = Date.now();

function observeFrames() {
  if (frameLoopRunning || typeof window === "undefined") return;
  frameLoopRunning = true;
  const frame = (now: number) => {
    if (previousFrame) {
      lastFrameMs = Math.round(now - previousFrame);
      worstFrameMs = Math.max(worstFrameMs, lastFrameMs);
      if (lastFrameMs > 34) longFrames += 1;
    }
    previousFrame = now;
    if (mountedCards > 0) window.requestAnimationFrame(frame);
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

export function getRenderBudgetSnapshot(): RenderBudgetSnapshot {
  return { mountedCards, longFrames, lastFrameMs, worstFrameMs, startedAt };
}
