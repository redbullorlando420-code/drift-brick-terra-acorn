import { discoveryPicks, DISCOVERY_SAMPLE_LIMIT } from '../src/lib/videos/discovery-picks.ts';

// The previous Landing algorithm filtered every record before stride sampling.
function priorPicks(videos, seed, now) {
  let state = seed >>> 0;
  const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
  const pool = videos.filter(video => !video.remote?.live && !video.isSample);
  const stride = pool.length > 2_400 ? Math.ceil(pool.length / 2_400) : 1;
  const chosen = [];
  for (let i = 0; i < pool.length; i += stride) {
    const video = pool[i];
    const classic = video.collection === 'classics' || /classic|noir/i.test(`${video.name} ${video.remote?.channelName ?? ''}`);
    const freshness = Math.max(1, Math.min(8, (video.addedAt - now + 31_536_000_000) / 3_942_000_000));
    const entry = { video, score: random() * Math.max(0.25, (video.remote ? 7 : 2) + freshness - (classic ? 6 : 0)) };
    if (chosen.length < 12) { chosen.push(entry); continue; }
    let weakest = 0;
    for (let j = 1; j < chosen.length; j++) if (chosen[j].score < chosen[weakest].score) weakest = j;
    if (entry.score > chosen[weakest].score) chosen[weakest] = entry;
  }
  return chosen.map(item => item.video);
}
const median = values => Number(values.sort((a, b) => a - b)[Math.floor(values.length / 2)].toFixed(2));
const results = [];
for (const count of [100_000, 1_000_000]) {
  const rows = Array.from({ length: count }, (_, i) => ({ id: String(i), name: `Library video ${i}`, addedAt: 1_000,
    remote: { kind: 'youtube', channelName: `Creator ${i % 2000}` } }));
  const previous = [], current = [];
  for (let i = 0; i < 8; i++) {
    let start = performance.now(); priorPicks(rows, 100 + i, 1_000); previous.push(performance.now() - start);
    start = performance.now(); discoveryPicks(rows, 100 + i, 1_000); current.push(performance.now() - start);
  }
  results.push({ entries: count, previousMedianMs: median(previous.slice(2)), currentMedianMs: median(current.slice(2)),
    previousRowsChecked: count + Math.min(count, DISCOVERY_SAMPLE_LIMIT), currentRowsChecked: Math.min(count, DISCOVERY_SAMPLE_LIMIT), picks: 12 });
}
console.log(JSON.stringify({ kind: 'Landing discovery CPU benchmark; excludes rendering/network', results }, null, 2));
