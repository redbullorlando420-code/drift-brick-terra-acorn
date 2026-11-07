import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareGuide,answerGuideQuery} from '../src/lib/videos/guide-picks.ts';
import {distributionExport} from '../src/lib/videos/recommendation-report.ts';
import {topicPostings} from '../src/lib/videos/topic-postings.ts';
import {youtubeCatalogSelection} from '../src/lib/videos/youtube-catalog-selection.ts';
import {prepareRoomCandidates} from '../src/lib/multiplayer/room-candidates.ts';
import {buildRoomCatalogIndex,roomCatalogAllows,roomCatalogSearchText} from '../src/lib/multiplayer/room-catalog-policy.ts';
import {roomSearchPage} from '../src/lib/multiplayer/room-search.ts';
const now=1793653200000,turn=async()=>{};
const row=(id,extra={})=>({id,name:'Science '+id,folderId:'public',path:id,extension:'mp4',mime:'video/mp4',size:1,addedAt:now,remote:{kind:'youtube',videoId:id,channelId:'same-creator'},...extra});
const publicRows=[row('shared-id'),row('beta-2')],secret=row('secret',{folderId:'private',name:'PRIVATE_ISOLATION_CANARY'}),folders=[{id:'public',kind:'youtube',name:'Public'},{id:'private',adult:true,kind:'youtube',name:'PRIVATE_ISOLATION_CANARY'}];
const beta={videos:publicRows,folders,tags:{'shared-id':['science'],'beta-2':['science']},favorites:{'shared-id':true},likes:{},history:[],metadataProvenance:{'shared-id':{tags:{science:'manual'}}},hidden:{},unavailable:{}};
async function project(input){
 const guide=await prepareGuide(input,42,now,turn),query=await answerGuideQuery(input,'science',42,now,turn),topics=await topicPostings({...input,hiddenVideos:input.hidden,hideDemo:false},turn),home=await youtubeCatalogSelection({videos:input.videos,privateFolders:new Set(['private']),unavailable:input.unavailable,hiddenVideos:input.hidden,hideDemo:false},undefined,turn),room=await prepareRoomCandidates({videos:input.videos,folders,shared:{},guest:false,favorites:input.favorites,hidden:input.hidden,unavailable:input.unavailable,history:input.history,seed:42,canStage:()=>true,rank:()=>1},turn),index=await buildRoomCatalogIndex(input.videos,folders,input.hidden,input.unavailable,turn),search=await roomSearchPage(input.videos,'science',0,turn,roomCatalogAllows(index,{enabled:true,localTitles:false,folders:['public']}),roomCatalogSearchText);
 return {picks:guide.picks.map(v=>v.id),explanations:guide.explanations,query:query.picks.map(v=>v.id),report:distributionExport(guide.distribution),topics:[...topics.eligible],home:home.map(v=>v.id),room:room.map(v=>v.id),search:search.videos.map(v=>v.id)};
}
test('adversarial Alpha feedback and held work leave every Beta public projection and report unchanged',async()=>{
 const before=await project(beta),bytes=JSON.stringify(beta);let release,started;
 const ready=new Promise(r=>started=r),gate=new Promise(r=>release=r);let first=true;
 const alpha={...beta,videos:[...publicRows,secret],tags:{'shared-id':['PRIVATE_ISOLATION_CANARY'],secret:['PRIVATE_ISOLATION_CANARY','science']},favorites:{secret:true},likes:{secret:true},history:[{id:'secret'}],weights:{favorite:8,like:8,topic:3},novelty:2,recommendationExposure:{version:1,updatedAt:now,entries:[{key:'youtube:shared-id',count:8,at:now}]},recommendationRejections:{version:1,updatedAt:now,entries:[{scope:'title',target:'youtube:shared-id',label:'PRIVATE_ISOLATION_CANARY',at:now}]},ratingOf:()=>1};
 const held=prepareGuide(alpha,7,now,async()=>{if(first){first=false;started();await gate;}});await ready;
 const during=await project(beta);assert.deepEqual(during,before);release();await held;await answerGuideQuery(alpha,'science',7,now,turn);
 assert.deepEqual(await project(beta),before);assert.equal(JSON.stringify(beta),bytes);assert(!JSON.stringify(before).includes('PRIVATE_ISOLATION_CANARY'));
});

