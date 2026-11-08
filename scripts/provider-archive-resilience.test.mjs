import assert from "node:assert/strict";
import { test } from "node:test";
import { registerHooks } from "node:module";
import { fixtureFreshness, readRegistry } from "./provider-fixture-freshness.mjs";
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const { walkTwitchArchive } = await import("../src/lib/remote/twitch-archive-walk.ts");
const { normalizeTwitchPullDiagnostics } = await import("../src/lib/videos/follow-checkpoints.ts");
const { runFollowRemote, runRefreshRemotes } = await import("../src/lib/remote/api.ts");
const { youtubeBrowseArchive } = await import("../src/lib/remote/youtube-browse.ts");
const { mergeMissionPlan, MISSION_PLAN_REVISION } = await import("../src/lib/mission-plan.ts");
const { NEXT_WAVE_MISSIONS } = await import("../src/lib/mission-next-wave.ts");
const cursor = after => JSON.stringify({ v:1,stage:"ARCHIVE",after });
const connection = (ids, endCursor) => ({id:"123",stream:null,videos:{
  pageInfo:{hasNextPage:!!endCursor,endCursor},
  edges:ids.map(id=>({cursor:id,node:{id,title:"Archive fixture",lengthSeconds:800}})),
}});
const body = (ids, token) => ({ onResponseReceivedActions:[{appendContinuationItemsAction:{continuationItems:[
  ...ids.map(videoId=>({videoRenderer:{videoId,title:{simpleText:"Archive fixture"}}})),
  { continuationItemRenderer:{continuationEndpoint:{continuationCommand:{token}}} },
]}}] });
const gap = async () => {};

test("reordered Twitch head admits a newly inserted identity and never moves the historical cursor",async()=>{
  const calls=[];
  const result=await walkTwitchArchive({limit:8,maxPages:1,pageSize:100,savedCursor:cursor("saved"),gap,
    read:async (position,first)=>{calls.push([position.after,first]);return position.after
      ?connection(["historical","old"],"historical-next"):connection(["inserted","old"],"discard-head-token");}});
  assert.deepEqual(calls,[["saved",6],[null,2]]);
  assert.deepEqual(result.edges.map(row=>row.node.id),["historical","old","inserted"]);
  assert.equal(result.cursor,cursor("historical-next"));
  assert.equal(result.diagnostics.lastVideoId,"old");
  assert.equal(normalizeTwitchPullDiagnostics(result.diagnostics).headObserved,2);
  calls.length=0;
  await walkTwitchArchive({limit:8,maxPages:1,pageSize:100,savedCursor:result.cursor,headCheckedAt:result.diagnostics.headCheckedAt,gap,
    read:async position=>{calls.push(position.after);return connection(["older"],"after-older");}});
  assert.deepEqual(calls,["historical-next"]);
});

test("Twitch preserves completed historical work and stops after a head rate limit",async()=>{
  const calls=[];
  const result=await walkTwitchArchive({limit:100,maxPages:1,pageSize:100,savedCursor:cursor("saved"),gap,
    read:async position=>{calls.push(position.after);if(!position.after)throw Error("HTTP 429");return connection(["older"],"next");}});
  assert.deepEqual(calls,["saved",null]);
  assert.equal(result.cursor,cursor("next"));
  assert.match(result.diagnostics.error,/429/);
});

test("Twitch and YouTube preserve the last complete page and exact cursor after a later timeout",async()=>{
  const native=globalThis.fetch;
  const calls=[];
  globalThis.fetch=async (url,init)=>{
    const data=JSON.parse(init.body);
    const after=data.variables?.after??data.continuation??null;
    calls.push(after);
    if(after)throw new DOMException("Fixture provider deadline","TimeoutError");
    return Response.json(String(url).includes("twitch")?{data:{user:connection(["1234"],"next-twitch")}}:body(["fixture0001"],"next-youtube"));
  };
  try {
    const twitch=await runFollowRemote({kind:"twitch",query:"fixturetimeout",clipLimit:0,twitchVodLimit:100});
    assert.equal(twitch.channel.twitchArchiveCursor,cursor("next-twitch"));
    assert.equal(twitch.channel.twitchArchiveDiagnostics.pages,1);
    assert(twitch.videos.some(row=>row.remote?.videoId==="1234"));
    const youtube=await youtubeBrowseArchive("UUfixture",100);
    assert.equal(youtube.cursor,"next-youtube");
    assert.deepEqual(youtube.rows.map(row=>row.videoId),["fixture0001"]);
    assert.equal(youtube.failure.name,"TimeoutError");
    assert.deepEqual(calls,[null,"next-twitch",null,"next-youtube"]);
  } finally { globalThis.fetch=native; }
});

test("request abort releases stalled bodies on both providers and stops additional pages",async()=>{
  const native=globalThis.fetch;
  try {
    for (const provider of ["youtube","twitch"]) {
      let reads=0,cancelled=false,started;
      const held=new Promise(resolve=>{started=resolve;});
      globalThis.fetch=async ()=>{
        reads++;
        return new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array([123])); started();},cancel(){cancelled=true;}}));
      };
      const controller=new AbortController();
      const channelId="UC"+"0".repeat(22);
      const request=provider==="youtube"
        ?runRefreshRemotes({channels:[{id:"yt:"+channelId,kind:"youtube",channelId,handle:"fixture",title:"Fixture",catalogCursor:"continue"}],youtubeCatalog:true},controller.signal)
        :runFollowRemote({kind:"twitch",query:"fixturecancel",clipLimit:0,twitchVodLimit:100},controller.signal);
      await Promise.race([held,request]);
      controller.abort(new DOMException("fixture cancel","AbortError"));
      await assert.rejects(request,{name:"AbortError"});
      assert(cancelled);
      assert.equal(reads,1);
    }
  } finally {globalThis.fetch=native;}
});

test("fixture age, parser success and public evidence remain independent",()=>{
  const registry=readRegistry();
  const now=Date.parse("2026-11-08T12:00:00Z");
  const altered={...registry,entries:registry.entries.map(row=>row.id==="youtube-catalog"?{...row,reviewedAt:"2020-01-01"}:row)};
  const rows=fixtureFreshness(altered,[{id:"youtube-catalog",at:now-1000,status:"observed"},{id:"twitch-archive",at:now-2000,status:"unavailable"}],now);
  assert.equal(rows.find(row=>row.id==="youtube-catalog").fixtureReview,"review due");
  assert.equal(rows.find(row=>row.id==="youtube-catalog").canary,"recent sample");
  assert.equal(rows.find(row=>row.id==="twitch-archive").canary,"last attempt unavailable");
  assert.equal(rows.find(row=>row.id==="youtube-live").canary,"no authorized canary");
  assert.throws(()=>fixtureFreshness({...registry,entries:[{...registry.entries[0],fixture:"scripts/../.env"}]},[],now));
});

test("revision 105 promotes just the archive and fixture trio and respects later reopens",()=>{
  const ids=["next-114","next-115","next-192"];
  const original=NEXT_WAVE_MISSIONS.map(row=>ids.includes(row.id)||row.id==="next-156"?{...row,done:false,status:"blocked"}:row);
  const after=mergeMissionPlan(original,NEXT_WAVE_MISSIONS,104);
  assert.deepEqual(after.filter((row,index)=>row.done!==original[index].done).map(row=>row.id),ids);
  const reopened=after.map(row=>row.id==="next-192"?{...row,done:false,status:"planned"}:row);
  assert.equal(mergeMissionPlan(reopened,NEXT_WAVE_MISSIONS,MISSION_PLAN_REVISION).find(row=>row.id==="next-192").done,false);
});
