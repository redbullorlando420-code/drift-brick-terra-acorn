export const PERFORMANCE_BUDGETS = Object.freeze({ startupMs: 3000, navigationMs: 2000, scrollSettleMs: 500, inputMs: 200, mountedCards: 256, overflowPixels: 0 });
export function performanceReleaseVerdict(sample, budgets = PERFORMANCE_BUDGETS) {
  const failures = [];
  for (const [key, limit] of Object.entries(budgets)) {
    if (!Number.isFinite(sample[key]) || sample[key] < 0) failures.push(`${key}: missing or invalid measurement`);
    else if (sample[key] > limit) failures.push(`${key}: ${sample[key]} exceeds ${limit}`);
  }
  if (!Array.isArray(sample.errors)) failures.push('console/page errors were not collected');
  else if (sample.errors.length) failures.push(`${sample.errors.length} console/page errors`);
  if (sample.catalogEntries !== 80_000) failures.push('80,000-entry fixture did not restore');
  if (!sample.scorecardVerified || !sample.exportVerified) failures.push('scorecard or private export was not verified');
  if (!sample.artworkIdleVerified) failures.push('Text-first artwork or paused repair pulling was not verified');
  if (!sample.providerBudgetsVerified) failures.push('Provider safeguards and their numeric export were not verified');
  if (!sample.youtubeFormatsVerified) failures.push('YouTube dates, format shelves and live/upcoming separation were not verified');
  return { ok: failures.length === 0, failures };
}
