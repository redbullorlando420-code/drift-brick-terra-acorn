import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {walkTwitchClips}=await import('../src/lib/remote/twitch-clips.ts');
const {selectClipRefreshCreators}=await import('../src/lib/videos/twitch-clip-refresh.ts');
const {normalizeFollowCheckpoints}=await import('../src/lib/videos/follow-checkpoints.ts');
const {twitchRetryPatch}=await import('../src/lib/videos/twitch-retry.ts');
const page=(ids,next)=>({edges:ids.map(id=>({node:{slug:id,title:id}})),pageInfo:{hasNextPage:!!next,endCursor:next}});
const base={limit:12,maxPages:8,gap:async()=>{},now:()=>1000};
test('overlapping windows walk distinct pages until the unique quota is filled',async()=>{
 const calls=[];const result=await walkTwitchClips({...base,variety:true,recentOnly:true,limit:6,read:async(period,first,after)=>{calls.push({period,first,after});if(period===null)return page(['a','b']);if(period==='LAST_WEEK')return after?page(['c','d']):page(['a','b'],'weekly-next');return page(['e','f']);}});
 assert.deepEqual(result.clips.map(c=>c.slug),['a','b','c','d','e','f']);assert.equal(result.diagnostics.duplicates,2);assert.equal(result.diagnostics.pages,4);assert.equal(result.error,undefined);assert.equal(calls[2].after,'weekly-next');assert(calls.every(c=>c.first<=100));
});
test('one failed recent window retains accepted clips and permits other windows; rate holds stop new windows',async()=>{
 let calls=[];const result=await walkTwitchClips({...base,variety:true,recentOnly:true,read:async period=>{calls.push(period);if(period==='LAST_WEEK')throw Error('service error');return page([String(period)]);}});
 assert.deepEqual(calls,[null,'LAST_WEEK','LAST_MONTH']);assert.equal(result.clips.length,2);assert.match(result.error,/LAST_WEEK: service error/);assert.equal(result.diagnostics.pages,3);assert.equal(result.diagnostics.windows[1].stop,'error');
 calls=[];const held=await walkTwitchClips({...base,variety:true,recentOnly:true,read:async period=>{calls.push(period);throw Error('Twitch HTTP 429');}});assert.equal(calls.length,1);assert.equal(held.clips.length,0);
});
test('partial archive pages preserve accepted rows and the last complete continuation',async()=>{
 let calls=0;const result=await walkTwitchClips({...base,cursor:JSON.stringify({v:1,after:'before'}),read:async(_p,_n,after)=>{assert.equal(after,calls?'safe':'before');if(calls++)throw Error('offline');return page(['a','b'],'safe');}});
 assert.equal(result.clips.length,2);assert.equal(JSON.parse(result.cursor).after,'safe');assert.equal(result.exhaustedAt,undefined);assert(result.error);
});
test('malformed rows do not advance an archive position or declare exhaustion',async()=>{
 const result=await walkTwitchClips({...base,cursor:JSON.stringify({v:1,after:'before'}),read:async()=>({edges:[{node:{slug:'valid'}},{node:{title:'missing identity'}}],pageInfo:{hasNextPage:false}})});
 assert.equal(result.clips.length,1);assert.equal(JSON.parse(result.cursor).after,'before');assert.equal(result.exhaustedAt,undefined);assert.match(result.error,/incomplete/);
});
test('cursor cycles and duplicate-only pages terminate without false exhaustion',async()=>{
 let count=0;const result=await walkTwitchClips({...base,read:async()=>page(['same'],++count===1?'one':count===2?'two':'one')});
 assert.equal(count,3);assert.equal(result.clips.length,1);assert.equal(result.diagnostics.duplicates,2);assert.equal(JSON.parse(result.cursor).after,'two');assert.match(result.error,/stopped advancing/);
});
test('one global eight-page budget covers all windows and reserves discovery for later windows',async()=>{
 let count=0;const periods=new Set();const result=await walkTwitchClips({...base,limit:500,variety:true,recentOnly:true,read:async period=>{periods.add(period);return page(['duplicate'],'next-'+ ++count);}});
 assert.equal(count,8);assert.equal(periods.size,3);assert.equal(result.diagnostics.pages,8);assert.equal(result.clips.length,1);
});
test('complete archive clears its cursor while exact limits retain a confirmed next position',async()=>{
 const complete=await walkTwitchClips({...base,cursor:JSON.stringify({v:1,after:'before'}),read:async()=>page(['a'])});assert.equal(complete.cursor,undefined);assert.equal(complete.exhaustedAt,1000);
 const limited=await walkTwitchClips({...base,limit:2,read:async()=>page(['a','b'],'next')});assert.equal(JSON.parse(limited.cursor).after,'next');assert.equal(limited.exhaustedAt,undefined);assert.equal(limited.error,undefined);
});
test('100-creator batches rotate all 600 creators after reload, including failed attempts',()=>{
 let rows=Array.from({length:600},(_,i)=>({id:'tw:'+String(i).padStart(3,'0'),kind:'twitch',title:'Creator '+i,handle:'creator'+i}));const seen=new Set();
 for(let turn=0;turn<6;turn++){const selected=selectClipRefreshCreators(rows,'recent',1000+turn,100);assert.equal(selected.length,100);for(const c of selected){assert(!seen.has(c.id));seen.add(c.id);c.twitchClipRecentAttemptedAt=1000+turn;}rows=JSON.parse(JSON.stringify(rows));}
 assert.equal(seen.size,600);
});
test('recent and older retry scopes survive recovery independently and honor advertised deadlines',()=>{
 const recent=twitchRetryPatch({},'clips-recent',{kind:'rate-limited',message:'wait',at:1,retryAt:900000,recovery:''},1000);
 assert.equal(recent.twitchClipRecentRetry.retryAt,900000);assert.equal(recent.twitchClipRetry,undefined);
 const row={id:'tw:a',kind:'twitch',...recent,twitchClipArchiveAttemptedAt:50};
 assert.equal(selectClipRefreshCreators([row],'recent',2000).length,0);assert.equal(selectClipRefreshCreators([row],'archive',2000).length,1);
 const saved=normalizeFollowCheckpoints(JSON.parse(JSON.stringify(row)));assert.equal(saved.twitchClipRecentRetry.retryAt,900000);assert.equal(saved.twitchClipArchiveAttemptedAt,50);
 const patch=twitchRetryPatch(row,'clips',undefined,2000);assert.equal(patch.twitchClipRecentRetry,undefined);assert.equal({...row,...patch}.twitchClipRecentRetry.retryAt,900000);
});
test('clip diagnostic normalization bounds messages and rejects malformed snapshots',async()=>{
 const result=await walkTwitchClips({...base,read:async()=>{throw Error('x'.repeat(999));}});
 const saved=normalizeFollowCheckpoints({twitchClipDiagnostics:result.diagnostics});assert.equal(saved.twitchClipDiagnostics.windows[0].error.length,240);
 assert.equal(normalizeFollowCheckpoints({twitchClipDiagnostics:{...result.diagnostics,windows:[{}]}}).twitchClipDiagnostics,undefined);
});
test('actual clip API returns game metadata, preserves unknown dates and keeps recent success separate from older clock',async()=>{
 const {runFollowRemote}=await import('../src/lib/remote/api.ts');const original=globalThis.fetch;globalThis.fetch=async(_url,init)=>{const p=JSON.parse(init.body);if(!p.query.includes('clips('))return Response.json({data:{user:{id:'1',displayName:'Creator'}}});assert(p.query.includes('game{name}'));return Response.json({data:{user:{clips:page(['single'])}}});};
 try{globalThis.fetch=async(_url,init)=>{const p=JSON.parse(init.body);if(!p.query.includes('clips('))return Response.json({data:{user:{id:'1',displayName:'Creator'}}});assert(p.query.includes('game{name}'));return Response.json({data:{user:{clips:{edges:[{node:{slug:'unique-game-'+(p.query.match(/period:(\w+)/)?.[1]??'current'),game:{name:'iRacing'},viewCount:0,durationSeconds:30}}],pageInfo:{hasNextPage:false}}}}});};const r=await runFollowRemote({query:'clip_game_fixture',kind:'twitch',twitchClipMode:'recent',clipLimit:6});assert(r.videos.every(v=>v.genre==='iRacing'&&v.addedAt===0&&v.remote.views===0));assert(r.channel.twitchClipDiagnostics);assert(r.channel.twitchClipRecentCheckedAt);assert.equal(r.channel.twitchClipCheckedAt,undefined);}finally{globalThis.fetch=original;}
});

test('empty later windows donate unused quota back to a healthy earlier continuation',async()=>{
 const calls=[];const r=await walkTwitchClips({...base,limit:6,variety:true,recentOnly:true,read:async(period,first,after)=>{calls.push({period,first,after});if(period!==null)return page([]);return after?page(['c','d','e','f']):page(['a','b'],'resume-current');}});
 assert.equal(r.clips.length,6);assert.equal(calls.length,4);assert.equal(calls.at(-1).after,'resume-current');assert.equal(calls.at(-1).first,4);assert.equal(r.diagnostics.windows.length,3);assert.equal(r.diagnostics.windows[0].accepted,6);
});
