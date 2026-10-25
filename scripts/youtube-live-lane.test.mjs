import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {runPausablePull,cancelQueuedPulls,getPullQueueSnapshot,getPullCancellationRevision,setPullsPaused}=await import('../src/lib/pull-control.ts');
const {updatePullSettings}=await import('../src/lib/pull-settings.ts');
test('the real browser live lane starts beside an occupied archive lane and both obey one cancellation action',async()=>{
 updatePullSettings({requestGapMs:250,pauseWhileWatching:false});setPullsPaused(false);
 const starts=[];
 const stalled=name=>signal=>new Promise((resolve,reject)=>{starts.push(name);signal.addEventListener('abort',()=>reject(signal.reason),{once:true});});
 const archive=runPausablePull(stalled('archive')),queued=runPausablePull(stalled('queued archive'));
 const live=runPausablePull(stalled('live'),{live:true});
 const results=Promise.allSettled([archive,queued,live]);
 await new Promise(r=>setTimeout(r,10));assert.deepEqual(starts,['archive','live']);assert.equal(getPullQueueSnapshot().active,2);assert.equal(getPullQueueSnapshot().waiting,1);
 const revision=getPullCancellationRevision();cancelQueuedPulls();assert.equal(getPullCancellationRevision(),revision+1);
 assert((await results).every(result=>result.status==='rejected'));assert(!starts.includes('queued archive'));assert.equal(getPullQueueSnapshot().active,0);assert.equal(getPullQueueSnapshot().waiting,0);
});

test('a stalled YouTube live response cannot block Twitch or room pages; cancellation releases all provider lanes',async()=>{
 updatePullSettings({pauseWhileWatching:false});setPullsPaused(false);
 const starts=[];
 const stalled=signal=>new Promise((_,reject)=>{starts.push('youtube');signal.addEventListener('abort',()=>reject(signal.reason),{once:true});});
 const youtube=runPausablePull(stalled,{live:true,provider:'youtube'});
 const result=Promise.allSettled([youtube]);
 const twitch=await runPausablePull(async()=>{starts.push('twitch');return 'fresh';},{live:true,provider:'twitch'});
 const rooms=await runPausablePull(async()=>{starts.push('rooms');return 'page';},{live:true});
 assert.equal(twitch,'fresh');assert.equal(rooms,'page');assert.deepEqual(starts,['youtube','twitch','rooms']);
 cancelQueuedPulls();assert.equal((await result)[0].status,'rejected');
});
