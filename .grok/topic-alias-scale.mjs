
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {writeFile} from 'node:fs/promises';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const a=await import('../src/lib/videos/topic-aliases.ts'),{topicPostings}=await import('../src/lib/videos/topic-postings.ts');
a.installTopicAliases(a.EMPTY_TOPIC_ALIASES);
const videos=Array.from({length:80000},(_,i)=>({id:'scale:'+i,name:'Untitled record '+i,folderId:'local',path:'',extension:'mp4',mime:'video/mp4',size:0,addedAt:0}));
const tags=Object.fromEntries(videos.map((row,i)=>[row.id,[i%4===0?'science':i%4===1?'sience':'gaming']]));
const input={videos,tags,folders:[{id:'local',adult:false}],hiddenVideos:{},unavailable:{},hideDemo:true};
let checkpoints=0;const turn=async()=>{checkpoints++;await new Promise(resolve=>setImmediate(resolve));};
const start=performance.now(),index=await topicPostings(input,turn),built=performance.now(),gaming=index.topics.get('gaming');
a.installTopicAliases(a.changeTopicAlias(a.EMPTY_TOPIC_ALIASES,{alias:'sience',topic:'science',at:Date.now(),method:'spelling-review',titleCount:20000,sources:['local']}));
const patched=await topicPostings(input,turn),end=performance.now();
assert.equal(patched.topics.get('science').all.length,40000);assert.equal(patched.topics.get('gaming'),gaming);assert.deepEqual(patched.patchedTopics,['science']);assert.equal(patched.baseBuilds,1);
const result={ok:true,titles:videos.length,initialBuildMs:Math.round(built-start),affectedPatchMs:Math.round(end-built),checkpoints,canonicalCount:40000,unrelatedPostingReused:true,baseBuilds:patched.baseBuilds,patchedTopics:patched.patchedTopics,fixture:'Synthetic local catalog; timings describe this machine/run, not a real-user endurance test.'};
await writeFile(new URL('../screenshots/topic-alias-scale.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
