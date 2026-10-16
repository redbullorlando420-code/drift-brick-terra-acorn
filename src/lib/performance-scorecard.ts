export type Health = 'healthy' | 'watch' | 'attention' | 'unmeasured';
export type PerformanceCheck = { id: string; label: string; health: Health; detail: string };
export type ScorecardInput = {
  now: number; homeReadyMs?: number;
  interactions: Record<string, { count: number; lastMs: number; at: number }>;
  frames: { sampledFrames: number; recentLongFrames: number; recentWorstFrameMs: number; sampledAt: number; lastActiveCards: number; mountedCards: number };
  artwork: { bytes: number; byteLimit: number; entries: number; entryLimit: number };
  viewer: { estimatedBytes: number; maxBytes: number };
  diskErrors: number; lowMemory: boolean; pullsPaused?: boolean;
};
const timingHealth = (ms: number, good: number, bad: number): Health => ms <= good ? 'healthy' : ms <= bad ? 'watch' : 'attention';
export function buildPerformanceScorecard(input: ScorecardInput) {
  const recentInputs = Object.values(input.interactions).filter(row => row.count > 0 && input.now - row.at <= 60_000 && row.at <= input.now);
  const inputMs = recentInputs.length ? Math.max(...recentInputs.map(row => row.lastMs)) : undefined;
  const framesFresh = input.frames.sampledFrames >= 30 && input.now - input.frames.sampledAt <= 60_000;
  const frameRatio = framesFresh ? input.frames.recentLongFrames / input.frames.sampledFrames : undefined;
  const memoryRatio = Math.max(input.artwork.bytes / Math.max(1, input.artwork.byteLimit), input.artwork.entries / Math.max(1, input.artwork.entryLimit), input.viewer.estimatedBytes / Math.max(1, input.viewer.maxBytes));
  const cards = Math.max(input.frames.mountedCards, input.frames.lastActiveCards);
  const cardLimit = input.lowMemory ? 96 : 256;
  const checks: PerformanceCheck[] = [
    { id: 'startup', label: 'Home controls', health: input.homeReadyMs === undefined ? 'unmeasured' : timingHealth(input.homeReadyMs, 3000, 5000), detail: input.homeReadyMs === undefined ? 'Startup has not reported readiness.' : `${input.homeReadyMs} ms from page load; catalog hydration is separate.` },
    { id: 'input', label: 'Input to next paint', health: inputMs === undefined ? 'unmeasured' : timingHealth(inputMs, 100, 200), detail: inputMs === undefined ? 'Navigate, search, or rate a title, then refresh within a minute.' : `${inputMs} ms slowest latest interaction in the last minute.` },
    { id: 'frames', label: 'Frame pressure', health: frameRatio === undefined ? 'unmeasured' : timingHealth(frameRatio, .05, .15), detail: frameRatio === undefined ? 'Browse a shelf with diagnostics enabled, then return within a minute.' : `${Math.round(frameRatio * 100)}% of ${input.frames.sampledFrames} recent visible frames exceeded 34 ms; worst ${input.frames.recentWorstFrameMs} ms.` },
    { id: 'memory', label: 'Bounded media caches', health: memoryRatio > 1 ? 'attention' : memoryRatio >= .85 ? 'watch' : 'healthy', detail: `${Math.round(memoryRatio * 100)}% of the busiest artwork or viewer cache budget. This is not total browser RAM.` },
    { id: 'cards', label: 'Mounted cards', health: cards === 0 ? 'unmeasured' : cards > cardLimit ? 'attention' : 'healthy', detail: `${input.frames.mountedCards} now · ${input.frames.lastActiveCards} last sampled on a shelf · ${cardLimit} whole-page review budget.` },
    { id: 'storage', label: 'Thumbnail disk reads', health: input.diskErrors ? 'watch' : 'healthy', detail: `${input.diskErrors} read errors since this page loaded. Cache misses are normal.` },
  ];
  const measured = checks.filter(row => row.health !== 'unmeasured');
  const health: Health = measured.some(row => row.health === 'attention') ? 'attention' : measured.some(row => row.health === 'watch') ? 'watch' : checks.some(row => row.health === 'unmeasured') ? 'unmeasured' : 'healthy';
  const failing = (id: string) => checks.some(row => row.id === id && (row.health === 'watch' || row.health === 'attention'));
  const next = failing('memory') ? (input.lowMemory ? 'Keep Low-memory mode on; close unused previews and retest after browsing.' : 'Try Low-memory mode in Settings, then browse the same shelf again.')
    : failing('input') ? (input.pullsPaused ? 'Pulling is paused. Repeat the slow click or search and refresh; try Low-memory mode if input remains slow.' : 'Pause pulling, repeat the slow click or search, and refresh to compare the latest input time.')
    : failing('frames') || failing('cards') ? 'Try Text-first artwork and a smaller grid page size, then scroll the same shelf again.'
    : failing('storage') ? 'Check browser storage availability; repeated disk failures can cause artwork to be fetched again.'
    : failing('startup') ? 'Compare a fresh Home load with pulling paused; capture the startup phases below.'
    : health === 'unmeasured' ? 'Browse and search with diagnostics enabled, then return here and refresh. Missing measurements do not pass a check.'
    : 'No immediate change suggested by these samples. Long sessions and real-provider pulls still need separate verification.';
  return { health, checks, next };
}
