import type { LibraryVideo } from './types';

export const DISCOVERY_SAMPLE_LIMIT = 2_400;

/** Sample across the entire catalog before scoring. Work and retained memory
 * stay bounded even at a million entries; a new seed changes each bucket's
 * offset rather than repeatedly favoring the same stride/creator. */
export function discoveryPicks(videos: readonly LibraryVideo[], seed: number, now = Date.now()) {
  let state = (seed >>> 0) || 1;
  const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
  const samples = Math.min(videos.length, DISCOVERY_SAMPLE_LIMIT);
  const chosen: Array<{ video: LibraryVideo; score: number }> = [];
  for (let bucket = 0; bucket < samples; bucket++) {
    const start = Math.floor(bucket * videos.length / samples);
    const end = Math.floor((bucket + 1) * videos.length / samples);
    const index = start + Math.floor(random() * (end - start));
    const video = videos[index]!;
    if (video.isSample || video.remote?.live) continue;
    const classic = video.collection === 'classics' || /classic|noir/i.test(`${video.name} ${video.remote?.channelName ?? ''}`);
    const freshness = Math.max(1, Math.min(8, (video.addedAt - now + 31_536_000_000) / 3_942_000_000));
    const score = random() * Math.max(0.25, (video.remote ? 7 : 2) + freshness - (classic ? 6 : 0));
    if (chosen.some(item => item.video.id === video.id)) continue;
    if (chosen.length < 12) { chosen.push({ video, score }); continue; }
    let weakest = 0;
    for (let i = 1; i < chosen.length; i++) if (chosen[i]!.score < chosen[weakest]!.score) weakest = i;
    if (score > chosen[weakest]!.score) chosen[weakest] = { video, score };
  }
  return chosen.map(item => item.video);
}
