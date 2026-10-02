import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
registerHooks({ resolve(s,c,n) { if(s.startsWith('@/')) return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c); try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e} } });
const { resolveYoutubeCreator } = await import('../src/lib/remote/youtube-resolve.ts');
const { browseYoutubeLives } = await import('../src/lib/remote/youtube-live-browse.ts');
const { runImportChannels } = await import('../src/lib/remote/api.ts');
const { setYoutubeRequestGap } = await import('../src/lib/remote/youtube-transport.ts');
setYoutubeRequestGap(0);
const original = globalThis.fetch, id = 'UCAbCdEf1234567890123456';
test('display names resolve through exact search, never guessed @handles; ambiguous names stay pending', async () => {
  const requests = [];
  globalThis.fetch = async (url,init) => { requests.push([String(url),JSON.parse(init.body)]); return Response.json({ contents: { channelRenderer: { channelId:id,title:{simpleText:'Name With Spaces'} } } }); };
  try {
    assert.equal(await resolveYoutubeCreator('Name With Spaces'),id);
    assert(requests[0][0].includes('/search?')); assert.equal(requests[0][1].query, 'Name With Spaces');
    await assert.rejects(resolveYoutubeCreator('NameWithSpaces'), /unique exact/);
    globalThis.fetch = async () => Response.json({contents:[{channelRenderer:{channelId:id,title:{simpleText:'Shared'}}},{channelRenderer:{channelId:'UCabcdef1234567890123456',title:{simpleText:'Shared'}}}]});
    await assert.rejects(resolveYoutubeCreator('Shared'), /unique exact/);
  } finally { globalThis.fetch = original; }
});
test('an exact real channel remains verified when its public uploads are unavailable', async () => {
  globalThis.fetch = async (url,init) => {
    if (String(url).includes('/search?')) return Response.json({contents:{channelRenderer:{channelId:id,title:{simpleText:'No uploads creator'}}}});
    if (String(url).includes('/feeds/')) return new Response('',{status:404});
    return Response.json({alerts:[{alertRenderer:{type:'ERROR',text:{simpleText:'No public uploads'}}}]});
  };
  try {
    const result = await runImportChannels({items:[{kind:'youtube',query:'No uploads creator'}],youtubeRequestGapMs:0});
    assert.equal(result.ok[0].channel.channelId,id); assert.equal(result.ok[0].channel.importQuery,'No uploads creator');
    assert.equal(result.ok[0].videos.length,0); assert.match(result.ok[0].channel.lastProviderFailure.message,/No public uploads/);
  } finally {globalThis.fetch=original;}
});
test('explicit handles require a channel endpoint and preserve channel ID case', async () => {
  globalThis.fetch = async (url,init) => { assert(String(url).includes('/navigation/resolve_url')); assert.equal(JSON.parse(init.body).url,'https://www.youtube.com/@Exact'); return Response.json({endpoint:{browseEndpoint:{browseId:id}}}); };
  try {
    assert.equal(await resolveYoutubeCreator('@Exact'),id);
    globalThis.fetch = async () => Response.json({endpoint:{watchEndpoint:{videoId:'abcdefghijk'}}});
    await assert.rejects(resolveYoutubeCreator('@Exact'),/unique exact/);
  } finally { globalThis.fetch=original; }
});
test('live checks follow actual Streams params and retain multiple simultaneous broadcasts, excluding upcoming/recorded', async () => {
  const targets=[];
  globalThis.fetch = async (url,init) => {
    const target=JSON.parse(init.body); targets.push(target);
    const live=videoId=>({videoRenderer:{videoId,title:{simpleText:'Live'},thumbnailOverlays:[{thumbnailOverlayTimeStatusRenderer:{style:'LIVE'}}]}});
    return Response.json(target.params ? {metadata:{channelMetadataRenderer:{externalId:id}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,content:{richGridRenderer:{contents:[live('abcdefghijk'),live('12345678901'),{videoRenderer:{...live('scheduled01').videoRenderer,upcomingEventData:{}}},{videoRenderer:{videoId:'recorded001'}}]}}}}]}}} : {metadata:{channelMetadataRenderer:{externalId:id}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{title:'Live',endpoint:{commandMetadata:{webCommandMetadata:{url:`/channel/${id}/streams`}},browseEndpoint:{browseId:id,params:'actual-provider-params'}}}}]}}});
  };
  try { const rows=await browseYoutubeLives(id); assert.deepEqual(rows.map(row=>row.id).sort(),['12345678901','abcdefghijk']); assert.equal(targets.length,2); assert.equal(targets[1].params,'actual-provider-params'); } finally {globalThis.fetch=original;}
});
