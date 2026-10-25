import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){try{return next(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return next(s+'.ts',c);throw e;}}});
const {normalizeRecentPull,recentPullSuccess,recentPullFailure,selectRecentPullChannels,recentPullReady}=await import('../src/lib/videos/recent-pull.ts');
test('recent upload rotation covers 2,000 creators independently of live and archive clocks and survives reload',()=>{
 let rows=Array.from({length:2000},(_,i)=>({id:'yt:'+String(i).padStart(4,'0'),channelId:'UC'+i,kind:'youtube',lastCheckedAt:999999,catalogCheckedAt:999999,liveCheckedAt:999999}));
 const seen=new Set();
 for(let turn=0;turn<100;turn++){const batch=selectRecentPullChannels(rows,'youtube',1000+turn,20);assert.equal(batch.length,20);for(const c of batch){assert(!seen.has(c.id));seen.add(c.id);c.recentPull=recentPullSuccess(c,{lastCheckedAt:1000+turn},1000+turn);}rows=JSON.parse(JSON.stringify(rows));}
 assert.equal(seen.size,2000);
});
test('cached success cannot rewind a watermark or clear a newer failed check',()=>{
 const c={recentPull:{attemptedAt:300,checkedAt:100,failures:1,newestVideoId:'new',failure:{at:300,kind:'network-offline',message:'offline'}}};
 const state=recentPullSuccess(c,{cache:{at:200},newestVideoId:'old'},400);
 assert.equal(state.newestVideoId,'new');assert.equal(state.failure.at,300);assert.equal(state.attemptedAt,400);
 const fresh=recentPullSuccess({recentPull:state},{cache:{at:500},newestVideoId:'latest'},500);
 assert.equal(fresh.failure,undefined);assert.equal(fresh.checkedAt,500);assert.equal(fresh.newestVideoId,'latest');
});
test('per-creator retry is bounded, honors Retry-After and does not block healthy creators',()=>{
 const failed=recentPullFailure({}, {kind:'network-offline',at:1000,message:'offline',recovery:''},1000);
 assert.equal(failed.retryAt,16000);assert.equal(recentPullReady({recentPull:failed},15999),false);assert(recentPullReady({recentPull:failed},16000));
 let c={recentPull:failed};for(let i=0;i<20;i++)c={recentPull:recentPullFailure(c,{kind:'network-offline',at:1000,message:'offline',recovery:''},1000)};
 assert.equal(c.recentPull.retryAt,601000);assert.equal(c.recentPull.failures,8);
 assert.equal(recentPullFailure({}, {kind:'rate-limited',at:1000,retryAt:900000,message:'wait',recovery:''},1000).retryAt,900000);
 assert(recentPullReady({lastProviderFailure:{kind:'rate-limited',retryAt:900000,cooldownScope:'catalog'}},1000));
 assert.equal(recentPullReady({lastProviderFailure:{kind:'rate-limited',retryAt:900000,cooldownScope:'all'}},1000),false);
});
test('saved recent state validates and bounds external messages',()=>{
 assert.equal(normalizeRecentPull({attemptedAt:NaN,failures:0}),undefined);
 assert.equal(normalizeRecentPull({attemptedAt:1,failures:90}),undefined);
 const state=normalizeRecentPull(JSON.parse(JSON.stringify({attemptedAt:1,checkedAt:1,failures:1,failure:{at:1,kind:'unavailable',message:'x'.repeat(900),recovery:'x'.repeat(900)}})));
 assert.equal(state.failure.message.length,240);assert.equal(state.failure.recovery.length,500);
});
