import test from 'node:test';
import assert from 'node:assert/strict';
import { selectDueLiveRefreshChannels } from '../src/lib/videos/live-refresh-selection.ts';
for (const kind of ['youtube', 'twitch']) test(kind + ' keeps 52 known streams fresh while discovering all 2,000 creators as time advances', () => {
 const started = 1_000_000, batchSize = kind === 'youtube' ? 8 : 48;
 const rows = Array.from({length:2000}, (_,i) => ({ id: kind === 'youtube' ? 'yt:UC'+String(i).padStart(22,'0') : 'tw:creator'+i, channelId:'UC'+String(i).padStart(22,'0'), kind, handle:'creator'+i, title:'Creator '+i, live:i<52, liveCheckedAt:i<52 ? started-55_000 : undefined }));
 const seen = new Set(); let now=started, worst=0;
 for(let turn=0; turn<1000 && seen.size<2000; turn++) {
  const batch=selectDueLiveRefreshChannels(rows,kind,batchSize,60_000,300_000,now);
  assert(batch.length<=batchSize);
  for(const channel of batch) { seen.add(channel.id); channel.liveCheckedAt=now; }
  now += 1000;
  for(const channel of rows.slice(0,52)) worst=Math.max(worst,now-channel.liveCheckedAt);
 }
 assert.equal(seen.size,2000);assert(worst<120_000, 'known streams must be rechecked before a two-minute live label expires: '+worst);
 assert(now-started<600_000,'discovery must reach the tail while known streams keep becoming due');
});
