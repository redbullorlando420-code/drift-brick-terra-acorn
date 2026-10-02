import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
registerHooks({ resolve(s,c,n) { if(s.startsWith('@/')) return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c); try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e} } });
const { runRefreshRemotes, runFollowRemote, runImportChannels } = await import('../src/lib/remote/api.ts');
const { acceptYoutubeResponse, youtubeRetryAt, setYoutubeRequestGap } = await import('../src/lib/remote/youtube-transport.ts');
setYoutubeRequestGap(250);
const id = 'UCAbCdEf1234567890123456';
const channel = { id:`yt:${id}`,channelId:id,handle:'TestCreator',title:'Test Creator',kind:'youtube' };
const row = number => ({videoRenderer:{videoId:`test${String(number).padStart(7,'0')}`,title:{simpleText:`Video ${number}`}}});
const next = token => ({continuationItemRenderer:{continuationEndpoint:{continuationCommand:{token}}}});
const page = (rows, token) => ({contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,title:'Videos',content:{richGridRenderer:{contents:[...rows,...(token?[next(token)]:[])]}}}}]}},metadata:{channelMetadataRenderer:{externalId:id,title:'Test Creator'}}});
const html = data => `<title>Test Creator - YouTube</title><script>var ytInitialData=${JSON.stringify(data)};</script><script>ytcfg.set({"INNERTUBE_API_KEY":"test","INNERTUBE_CLIENT_VERSION":"test"});</script>`;
const originalFetch = globalThis.fetch, originalNow = Date.now;
let clock = originalNow(); Date.now=()=>clock;
const response = (value,status=200) => new Response(typeof value==='string'?value:JSON.stringify(value),{status});
test('archive pages finish, expired tokens recover, and rate limits preserve accepted rows', async () => {
  let tokens=[];
  globalThis.fetch=async (url,init)=> {
    if(String(url).includes('/feeds/')) return response('<feed><title>Test Creator</title></feed>');
    if(String(url).includes('/streams')) return response(html(page([],null)));
    if(init?.method==='POST') {const token=JSON.parse(init.body).continuation;if(!token)return response(page(Array.from({length:30},(_,i)=>row(i)), 'fresh'));tokens.push(token);if(token==='expired')return response('expired',400);return response({onResponseReceivedActions:[{appendContinuationItemsAction:{continuationItems:[row(30)]}}]});}
    return response(html(page(Array.from({length:30},(_,i)=>row(i)), 'fresh')));
  };
  let result = await runRefreshRemotes({channels:[channel],youtubeCatalog:true,youtubeVideoLimit:30});
  assert.equal(result.videos.length,30); assert.equal(result.channels[0].catalogCursor,'fresh');
  result = await runRefreshRemotes({channels:[{...channel,catalogCursor:'expired'}],youtubeCatalog:true,youtubeVideoLimit:100});
  assert.equal(result.videos.length,31);assert.deepEqual(tokens,['expired','fresh']);assert(result.channels[0].catalogExhaustedAt);
  globalThis.fetch=async (url,init)=> {
    if(init?.method==='POST')return JSON.parse(init.body).browseId ? response(page(Array.from({length:30},(_,i)=>row(i)), 'older')) : response('too many requests',429);
    if(String(url).includes('/feeds/'))return response('<feed><title>Test Creator</title></feed>');
    return response(html(page(Array.from({length:30},(_,i)=>row(i)), 'older')));
  };
  result = await runRefreshRemotes({channels:[channel],youtubeCatalog:true,youtubeVideoLimit:100});
  assert.equal(result.videos.length,30);assert.equal(result.channels[0].catalogCursor,'older');assert(result.providerRetryAt>clock);assert.equal(result.channels[0].lastProviderFailure.kind,'rate-limited');
  let requests=0;globalThis.fetch=async()=>{requests++;throw new Error('should not request');};
  result = await runRefreshRemotes({channels:[channel],youtubeCatalog:true});
  assert.equal(requests,0);assert.equal(result.channels[0].lastProviderFailure.kind,'rate-limited');assert.equal(result.videos.length,0);
  await assert.rejects(runFollowRemote({query:'@DifferentCreator',kind:'youtube'}),/429/);assert.equal(requests,0);
  const imported = await runImportChannels({ items: [{ query: '@DifferentCreator', kind: 'youtube' }] });
  assert.equal(imported.failed, 1);
  assert.match(imported.failedReasons['@DifferentCreator'], /429/);
  assert.equal(imported.providerRetryAt, result.providerRetryAt);
  assert.equal(requests, 0, 'imports do not retry requests while the provider is cooling down');
  clock+=6*60_000;
  assert.equal(youtubeRetryAt(),undefined);
  assert.throws(()=>acceptYoutubeResponse(new Response('',{status:429,headers:{'retry-after':'1200'}}),clock),/429/);
  assert.equal(youtubeRetryAt(clock),clock+1200_000);
  globalThis.fetch=originalFetch;Date.now=originalNow;
});
import { exactYoutubeChannel } from '../src/lib/remote/youtube-channel-search.ts';
test('display-name resolution requires a unique exact channel, without importing a recommendation',()=> {
  const html = rows => `<script>var ytInitialData=${JSON.stringify({contents:rows})};</script>`;
  const result = (title,channelId) => ({channelRenderer:{title:{simpleText:title},channelId}});
  assert.equal(exactYoutubeChannel(html([result('Test Creator',id),result('Test Creator Fan Clips','UC0000000000000000000000')]),'Test Creator'),id);
  assert.equal(exactYoutubeChannel(html([result('Test Creator',id),result('Test Creator','UC0000000000000000000000')]),'Test Creator'),null);
  assert.equal(exactYoutubeChannel(html([result('Unrelated creator',id)]),'Test Creator'),null);
});
