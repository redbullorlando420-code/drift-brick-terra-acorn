import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {ADULT_PROVIDER_ADAPTERS,adultAdapter,canPullAdult,adultSelectionCapabilities,adultEmbedUrl}=await import('../src/lib/videos/adult-provider-adapters.ts');
const {ADULT_PULL_PROVIDERS,adultFolderIds}=await import('../src/lib/videos/adult-providers.ts');
const {adultRows,validateAdultAtom,adultPublication,measureAdultQuality,redactedAdultQuality,retainAdultRefreshEvidence}=await import('../src/lib/remote/adult-quality.ts');
const {EMPTY_PROVIDER_VIEWING,parseProviderViewing,chooseProviderView,forgetProviderView,newestProviderViewing,safeProviderUrl,officialAdultUrl}=await import('../src/lib/videos/provider-viewing.ts');
const {runSearchAdultVideos}=await import('../src/lib/remote/api.ts');
const {walkAdultPull}=await import('../src/lib/videos/adult-pull-walk.ts');
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/adult-contracts.json',import.meta.url),'utf8'));
let clock=Date.now(),serial=0;
async function mock(work,{bad,empty,partial=false}={}){const fetch=globalThis.fetch,now=Date.now;clock+=4*60_000;Date.now=()=>clock;let calls=[];
 globalThis.fetch=async(input)=>{const url=String(input);calls.push(url);const u=new URL(url),host=u.hostname;let provider=host.includes('eporner')?'eporner':host.includes('redtube')?'redtube':host.includes('chaturbate')?'chaturbate':host.includes('myfreecams')?'myfreecams':host.includes('reddit')?'reddit':host.includes('redgifs')?'redgifs':'booru';
  if(host==='api.redgifs.com'&&u.pathname.includes('/auth/'))return Response.json({token:'fixture-temporary-public-token'});
  if(host==='app.myfreecams.com')return new Response('<html><head></head><body>Public fixture</body></html>',{headers:{'content-type':'text/html'}});
  if(bad===provider||partial&&provider==='redtube'&&u.searchParams.get('page')==='2')return new Response('<html>Unsupported fixture challenge</html>',{headers:{'content-type':'text/html'}});
  if(empty===provider){if(provider==='myfreecams')return new Response('[]',{headers:{'content-type':'text/plain'}});if(provider==='reddit')return new Response('<feed></feed>',{headers:{'content-type':'application/atom+xml'}});return Response.json(provider==='eporner'?{videos:[],total_pages:1,total_count:0}:provider==='redtube'?{videos:[],count:0}:provider==='chaturbate'?{results:[],count:0}:provider==='redgifs'?{gifs:[]}:host==='e621.net'?{posts:[]}:[]);}
  if(provider==='myfreecams')return new Response(fixtures.myfreecams,{headers:{'content-type':'text/plain'}});
  if(provider==='reddit')return new Response(fixtures.reddit,{headers:{'content-type':'application/atom+xml'}});
  if(provider==='booru')return Response.json(host==='e621.net'?fixtures.e621:fixtures.booru);
  const data=structuredClone(fixtures[provider]);if(partial&&provider==='redtube')data.count=10000;return Response.json(data);
 };try{return await work(calls);}finally{globalThis.fetch=fetch;Date.now=now;}}
const request=(providers,patch={})=>runSearchAdultVideos({query:'fixture-'+(++serial),providers,maxVideos:100,redditSources:[{subreddit:'fixture',priority:2}],...patch});

test('registry inventories all seven existing adapters with distinct search, media, paging and player support',()=>{
 assert.deepEqual(ADULT_PROVIDER_ADAPTERS.map(r=>r.id),ADULT_PULL_PROVIDERS);assert(ADULT_PULL_PROVIDERS.every(canPullAdult));assert.equal(canPullAdult('pornhub'),false);assert.equal(canPullAdult('camsoda'),false);assert.equal(adultAdapter('myfreecams').player,'external');assert.equal(adultAdapter('myfreecams').pageView,true);assert.equal(adultAdapter('booru').player,'image');assert.equal(adultSelectionCapabilities(['myfreecams','chaturbate']).archive,false);assert.equal(adultSelectionCapabilities(['reddit']).query,'feed-filter');assert.equal(adultSelectionCapabilities(['redgifs']).order,false);assert.equal(adultSelectionCapabilities(['redtube']).order,true);
});
test('embed capabilities allow only implemented HTTPS provider paths; MFC and images cannot become iframe players',()=>{
 assert(adultEmbedUrl('eporner','https://www.eporner.com/embed/fixture1/'));assert(adultEmbedUrl('redtube','https://embed.redtube.com/?id=100001'));assert(adultEmbedUrl('chaturbate','https://chaturbate.com/embed/fixture_public/'));assert(adultEmbedUrl('redgifs','https://www.redgifs.com/ifr/fixtureclip'));assert(adultEmbedUrl('reddit','https://www.redditmedia.com/mediaembed/fixture1'));assert(adultEmbedUrl('reddit','https://www.redditmedia.com/r/fixture/comments/fixture1/?ref=share'));
 for(const [kind,url]of [['myfreecams','https://app.myfreecams.com/fixture'],['booru','https://rule34.xxx/'],['eporner','https://evil.example/embed/fixture1'],['redgifs','javascript:alert(1)'],['redtube','https://user:secret@embed.redtube.com/?id=1'],['redtube','https://embed.redtube.com.evil.example/?id=1']])assert.equal(adultEmbedUrl(kind,url),undefined);
 const row=adultAdapter('redgifs'),old=row.player;try{row.player='external';assert.equal(adultEmbedUrl('redgifs','https://www.redgifs.com/ifr/fixtureclip'),undefined);assert(adultFolderIds([]).has('redgifs:discover'));}finally{row.player=old;}
});
test('unreadable envelopes and malformed identities fail; genuine empty containers remain distinguishable',()=>{
 for(const raw of [null,{},false,{error:'private error'},'<html/>',{videos:{}},{videos:[{}]},{videos:[null]}])assert.throws(()=>adultRows('eporner',raw,['videos'],['id']));assert.deepEqual(adultRows('eporner',{videos:[]},['videos'],['id']),[]);assert.equal(adultRows('redgifs',{data:{gifs:[{id:'fixture'}]}},['data.gifs'],['id']).length,1);assert.throws(()=>adultRows('eporner',{videos:[{id:'x'}]},['videos'],['id'],['title','embed']));
 validateAdultAtom('<feed></feed>');for(const xml of ['<html/>','<feed><entry></entry></feed>','<feed><entry><id>x</id><title>x</title></feed>'])assert.throws(()=>validateAdultAtom(xml));
});
test('all seven adapters execute redacted fixtures with real conversion, cursor and completeness diagnostics',async()=>{
 for(const provider of ADULT_PULL_PROVIDERS)await mock(async()=>{const r=await request([provider],{query:'all'});assert(r.videos.length>0,provider);assert(r.videos.every(v=>v.remote.kind===provider),provider);const d=r.providerDiagnostics.find(d=>d.provider===provider&&d.status==='loaded');assert(d.quality);assert(d.quality.pages>=1);assert.equal(r.partial,false);assert(r.videos.every(v=>v.remote.live||v.addedAt===0),provider+' never invents a publication timestamp');});
});
test('malformed tube/short/image/feed payloads cannot confirm empty/exhausted catalogs',async()=>{
 for(const provider of ['eporner','redtube','redgifs','booru','reddit'])await mock(async()=>{await assert.rejects(()=>request([provider],{query:'all'}),/failed|unreadable|incomplete|Unexpected|unsupported/i);},{bad:provider});
});
test('valid empty results remain empty without unnecessary fallback requests',async()=>{
 for(const provider of ['eporner','redtube','redgifs','reddit','booru'])await mock(async calls=>{const r=await request([provider],{query:'all'});assert.equal(r.videos.length,0,provider);assert.equal(r.partial,false);assert.equal(r.providerDiagnostics[0].status,'empty');if(['eporner','redgifs'].includes(provider))assert(calls.length<=2,provider+' does not expand a valid empty search into fallbacks');},{empty:provider});
});
test('a failing provider leaves healthy siblings intact and unknown sources cannot widen a request',async()=>{
 await mock(async calls=>{const r=await request(['eporner','redtube']);assert(r.videos.some(v=>v.remote.kind==='redtube'));assert.equal(r.providerNextPages.eporner,undefined);assert.equal(r.providerDiagnostics.find(d=>d.provider==='eporner').status,'failed');assert.equal(r.partial,true);const count=calls.length;await assert.rejects(()=>request(['pornhub']),/supported/);assert.equal(calls.length,count);},{bad:'eporner'});
});
test('later malformed archive pages retain accepted rows and retry the unconsumed page exactly once per walk',async()=>{
 await mock(async()=>{const r=await request(['redtube'],{maxVideos:100});assert.equal(r.videos.length,1);assert.equal(r.providerNextPages.redtube,2);assert.equal(r.partial,true);assert(r.providerDiagnostics.some(d=>d.status==='failed'));let calls=0;const walked=await walkAdultPull(100,1,0,async()=>{calls++;return {...r,nextPage:r.providerNextPages.redtube,nextOffset:0};},async()=>{});assert.equal(calls,1);assert.equal(walked.videos.length,1);assert(walked.error);assert.equal(walked.latest.nextPage,2);},{partial:true});
});
test('publication values reject absent, invalid and future dates and preserve only evidenced prior dates',()=>{
 const now=Date.UTC(2026,9,26);for(const v of [undefined,null,'','not-a-date','2099-01-01',Infinity])assert.equal(adultPublication(v,now),0);assert.equal(adultPublication('2025-01-02',now),Date.UTC(2025,0,2));assert.equal(adultPublication(1700000000,now),1700000000000);
 const previous={id:'eporner:a',name:'old',addedAt:Date.UTC(2025,0,2),poster:'saved-poster',genre:'manual',remote:{kind:'eporner',publishedPrecision:'instant'}},incoming={...previous,addedAt:0,poster:undefined,genre:'new',remote:{...previous.remote,publishedPrecision:'unknown'}},out=retainAdultRefreshEvidence(previous,incoming,{lockedFields:['category']});assert.equal(out.addedAt,previous.addedAt);assert.equal(out.poster,previous.poster);assert.equal(out.genre,'manual');assert.equal(incoming.addedAt,0);assert.equal(retainAdultRefreshEvidence({...previous,remote:{kind:'eporner'}},incoming).addedAt,0);
});
test('completeness counters and report exports stay aggregate and bounded without private payloads',()=>{
 const row={id:'secret-id',name:'secret-title',addedAt:0,remote:{kind:'eporner',publishedPrecision:'unknown'}},q=measureAdultQuality([row,row,{...row,id:'other',poster:'p'}]);assert.equal(q.received,3);assert.equal(q.duplicates,1);assert.equal(q.missingDate,2);assert.equal(q.missingArtwork,1);const report=redactedAdultQuality([{provider:'eporner',status:'loaded',quality:{...q,secret:'secret-token'},detail:'secret-url'}]);const text=JSON.stringify(report);assert(!/secret-(?:id|title|token|url)|"query"|password|cookies/i.test(text));assert.equal(report.providers[0].quality.duplicates,1);assert.equal(report.providers[0].rates.duplicates,1/3);assert.equal(report.providers[0].rates.missingDate,1);assert.equal(redactedAdultQuality(Array(100).fill({provider:'eporner',status:'loaded',quality:q})).providers.length,64);
});
test('remembered official URLs strip tracking/secrets and reject arbitrary schemes, credentials, hosts and unsupported modes',()=>{
 assert.equal(safeProviderUrl('redtube','https://www.redtube.com/100001?token=secret#test'),'https://www.redtube.com/100001');assert.equal(safeProviderUrl('booru','https://rule34.xxx/index.php?page=post&s=view&id=1&api_key=secret'),'https://rule34.xxx/index.php?page=post&s=view&id=1');assert.equal(safeProviderUrl('myfreecams','https://www.myfreecams.com/#fixture_public'),'https://app.myfreecams.com/fixture_public');
 for(const v of ['javascript:alert(1)','http://www.redtube.com/1','https://evil.example/1','https://secret@www.redtube.com/1','https://www.redtube.com:444/1'])assert.equal(safeProviderUrl('redtube',v),undefined);assert.equal(officialAdultUrl({kind:'myfreecams',videoId:'fixture_public',watchUrl:'javascript:alert(1)'}),'https://app.myfreecams.com/fixture_public');assert.throws(()=>chooseProviderView(EMPTY_PROVIDER_VIEWING,'booru','embedded','https://rule34.xxx/'),/Invalid provider/);
});
test('viewing preferences persist only seven allowlisted choices; forgetting has a monotonic deletion boundary',()=>{
 let l=chooseProviderView(EMPTY_PROVIDER_VIEWING,'redtube','website','https://www.redtube.com/100001',100);l=chooseProviderView(l,'myfreecams','embedded','https://app.myfreecams.com/fixture_public',101);const parsed=parseProviderViewing({...l,cookies:'secret',choices:{...l.choices,redtube:{...l.choices.redtube,password:'secret'}}});assert(!JSON.stringify(parsed).includes('secret'));assert.equal(parsed.choices.redtube.url,l.choices.redtube.url);assert.equal(chooseProviderView(l,'redtube','website','https://www.redtube.com/100001'),l);const clear=forgetProviderView(l,'redtube',1);assert(!clear.choices.redtube);assert(clear.updatedAt>l.updatedAt);assert.equal(newestProviderViewing(clear,l).updatedAt,clear.updatedAt);
 for(const patch of [{version:2},{choices:[]},{choices:{unknown:{mode:'website',url:'https://evil.example/',at:1}}},{choices:{redtube:{mode:'website',url:'https://www.redtube.com/1',at:NaN}}}])assert.throws(()=>parseProviderViewing({...l,...patch}));
});
