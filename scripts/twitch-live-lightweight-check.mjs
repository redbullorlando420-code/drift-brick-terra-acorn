import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {readTwitchLiveBatch} from '../src/lib/remote/twitch-live-batch.ts';
let active=0,peak=0,requests=0,maximumChannels=0;
const started=performance.now(),rows=Array.from({length:2000},(_,i)=>'checker_'+i);
const result=await readTwitchLiveBatch(rows,async(query,variables)=>{
 assert(!/\b(?:videos|clips|comments)\s*\(/.test(query),'live requests cannot walk archives');
 requests++;maximumChannels=Math.max(maximumChannels,Object.keys(variables).length);peak=Math.max(peak,++active);
 await new Promise(resolve=>setTimeout(resolve,3));active--;
 return{data:Object.fromEntries(Object.entries(variables).map(([key,login])=>['c'+key.slice(1),{id:login,displayName:login,stream:null}]))};
});
assert.equal(result.size,2000);assert.equal(requests,167);assert.equal(maximumChannels,12);assert.equal(peak,2);assert([...result.values()].every(row=>row.user&&!row.error));
const report={channels:rows.length,upstreamRequests:requests,maxChannelsPerRequest:maximumChannels,peakTransfers:peak,elapsedMs:Math.round(performance.now()-started),limitation:'Injected public-metadata boundary; no real Twitch requests. Demonstrates bounded batching and parallelism, not production network speed. The real-store 2,000-follow test separately verifies 43 client jobs and zero video rewrites for offline results.'};
writeFileSync('screenshots/twitch-live-lightweight.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
