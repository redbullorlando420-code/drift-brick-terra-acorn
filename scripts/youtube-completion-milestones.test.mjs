import { registerHooks } from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
registerHooks({ resolve(s,c,n) { try { return n(s,c); } catch(e) { if (s.startsWith('.') && !/\.[a-z]+$/i.test(s)) return n(s+'.ts',c); throw e; } } });
const { youtubeIdentityReviews } = await import('../src/lib/videos/youtube-identity-review.ts');
const { mergeResolvedFollow, dedupeFollows } = await import('../src/lib/videos/follow-identity.ts');
const { prepareOfflineCacheAudit, youtubeRecoveryUrl } = await import('../src/lib/videos/offline-cache-audit.ts');
const a='UC'+'a'.repeat(22), b='UC'+'b'.repeat(22);
const follow=(id,patch={})=>({id:'yt:'+id,channelId:id,kind:'youtube',handle:'@'+id,title:'Creator '+id,...patch});
const tick=async()=>{};
test('shared names or handles flag distinct confirmed channels without guessing from ordinary display names',()=>{
 const rows=[follow(a,{title:'Same name',handle:'@one'}),follow(b,{title:'Same name',handle:'@two'})];
 const review=youtubeIdentityReviews(rows);assert.equal(review.size,2);assert.deepEqual(review.get(rows[0].id).relatedIds,[rows[1].id]);assert(!review.get(rows[0].id).reviewed);
 assert.equal(youtubeIdentityReviews([follow(a,{title:'A different public display name',handle:'@realhandle'})]).size,0);
 assert.equal(youtubeIdentityReviews([rows[0],{...rows[0],id:'ytpl:playlist'}]).size,0);
 assert.equal(dedupeFollows(rows).length,2);
});
test('contradictory exact imported or handle IDs require review; corrected stable source IDs are allowed',()=>{
 assert.equal(youtubeIdentityReviews([follow(a,{handle:'https://www.youtube.com/channel/'+b})]).size,1);
 assert.equal(youtubeIdentityReviews([follow(a,{importQuery:b})]).size,1);
 assert.equal(youtubeIdentityReviews([follow(a,{channelId:b,handle:'@new',title:'New name',importQuery:'https://www.youtube.com/channel/'+b})]).size,0);
});
test('review survives reordering and refresh clocks, but changed identity evidence reopens it',()=>{
 const rows=[follow(a,{handle:'@same'}),follow(b,{handle:'@same'})],first=youtubeIdentityReviews(rows).get(rows[0].id);
 const saved={...rows[0],identityReview:{fingerprint:first.fingerprint,at:10},lastCheckedAt:20};
 assert(youtubeIdentityReviews([rows[1],saved]).get(saved.id).reviewed);
 assert(!youtubeIdentityReviews([saved,{...rows[1],title:'Renamed'}]).get(saved.id).reviewed);
 assert.equal(rows[0].identityReview,undefined);
});
test('automatic alias resolution preserves an ambiguous pending creator rather than silently merging it',()=>{
 const pending={id:'yt:pending:same',kind:'youtube',handle:'@same',title:'same'};
 const rows=[follow(a,{handle:'@same'}),pending],resolved=follow(b,{handle:'@same'});
 assert.equal(mergeResolvedFollow(rows,resolved).length,3);
 assert.equal(mergeResolvedFollow([pending],resolved).length,1);
});
test('offline audit distinguishes saved references from bytes, provider observations from storage dates, and public recovery links',async()=>{
 const now=Date.UTC(2026,9,22),rows=[follow(a,{lastCheckedAt:now-86400000,lastProviderFailure:{message:'Failed'}}),follow(b)];
 const video=(id,extra={})=>({id,folderId:rows[0].id,name:id,addedAt:1,poster:'https://images.invalid/'+id,remote:{kind:'youtube',channelId:a},...extra});
 const storage={artwork:new Map([['one',{at:now-2*86400000,bytes:1024}],['adult',{at:1,bytes:9000}]]),savedAt:now-60000,links:[{id:'old',url:'https://youtu.be/old12345678',title:'Saved old video'},{id:'dupe',url:'https://youtu.be/old12345678'},{id:'private',url:'https://private.invalid/watch'},{id:'bad',url:'javascript:alert(1)'}]};
 const audit=await prepareOfflineCacheAudit([video('one'),video('two'),video('adult',{remote:{kind:'redtube'}})],rows,storage,now,tick);
 assert.equal(audit.coveredChannels,1);assert.equal(audit.channels,2);assert.equal(audit.cachedVideos,2);assert.equal(audit.posters,2);assert.equal(audit.offlineArtwork,1);assert.equal(audit.artworkBytes,1024);assert.equal(audit.oldestArtworkAt,now-2*86400000);assert.equal(audit.oldestObservationAt,rows[0].lastCheckedAt);assert.equal(audit.failedChannels,1);assert.equal(audit.recoverableLinks,1);assert.equal(audit.catalogSavedAt,now-60000);assert.equal(rows[0].lastProviderFailure.message,'Failed');
 for(const url of ['https://youtube.com.evil.invalid/watch','https://youtube.com@evil.invalid/','http://youtube.com/watch','file:///youtube.com','javascript:alert(1)'])assert.equal(youtubeRecoveryUrl(url),undefined);
});
test('offline audit is bounded, cooperative and cancellable without mutating the catalog or evidence',async()=>{
 const videos=Array.from({length:10000},(_,i)=>({id:String(i),folderId:'x',addedAt:Date.now(),remote:{kind:'youtube'}}));let turns=0;
 await assert.rejects(prepareOfflineCacheAudit(videos,[],{artwork:new Map(),links:[]},Date.now(),async()=>{if(++turns===3)throw Error('Cancelled');}),/Cancelled/);assert.equal(videos.length,10000);
 const links=Array.from({length:100},(_,i)=>({id:String(i),url:'https://youtu.be/'+String(i).padStart(11,'0')}));
 const audit=await prepareOfflineCacheAudit([],[],{artwork:new Map(),links},Date.now(),tick);assert.equal(audit.recoverableLinks,100);assert.equal(audit.recoveryPreview.length,12);assert.equal(audit.oldestObservationAt,undefined);
});

test('legacy follows whose confirmed channel IDs live only in source keys never collapse by a shared alias',()=>{
 const rows=[follow(a,{channelId:undefined,handle:'@shared'}),follow(b,{channelId:undefined,handle:'@shared'})];
 assert.equal(dedupeFollows(rows).length,2);assert.equal(youtubeIdentityReviews(rows).size,2);
 assert.equal(mergeResolvedFollow([rows[0]],rows[1]).length,2);
});
