import assert from 'node:assert/strict';
import {fromJSON} from 'seroval';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {checkedUrl,checkedOutputPath} from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??'screenshots/live-auto-browser.json',[resolve('screenshots')]);
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
const dataOf=value=>{if(!value||typeof value!=='object')return;if(Array.isArray(value.channels))return value;for(const child of Object.values(value)){const found=dataOf(child);if(found)return found;}};
try{for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],checks=[],calls=[];
 const report={viewport:viewport.name,checks,errors};reports.push(report);page.setDefaultTimeout(120000);
 let releaseYoutube,blocked=false;const youtubeGate=new Promise(r=>releaseYoutube=r);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))errors.push(m.text());});
 await context.addInitScript(()=>{if(!sessionStorage.getItem('live-auto-init')){sessionStorage.setItem('live-auto-init','true');localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,requestGapMs:250}));}localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:false,tools:false}));});
 await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
 await context.route(/https:\/\/(?:i\.ytimg\.com|fixture\.invalid)\//,r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/><circle cx="160" cy="90" r="30" fill="#b9d8ef"/></svg>'}));
 await page.route('**/_serverFn/**',async route=>{
  const data=dataOf(fromJSON(JSON.parse(route.request().postData()??'{}')));let result=null;
  if(data){assert(data.youtubeLiveOnly||data.twitchLiveOnly,'bulk pause must still stop archive pulls');assert(data.liveDemand,'visible live page uses demand reads');assert(data.channels.length<=(data.youtubeLiveOnly?24:100));calls.push(data);
   if(data.youtubeLiveOnly&&!blocked){blocked=true;await youtubeGate;}
   await new Promise(r=>setTimeout(r,20));const now=Date.now(),channels=data.channels.map(c=>({...c,live:c.live||Number(c.handle.slice(7))===1999,liveCheckedAt:now,lastLiveFailure:undefined}));
   result={channels,videos:channels.filter(c=>c.live).map(c=>{const i=Number(c.handle.slice(7)),videoId='l'+String(i).padStart(10,'0');return{id:c.kind==='twitch'?'tw:live:'+i:'yt:v:'+videoId,folderId:c.id,name:c.title+' live',path:'',extension:'live',mime:'video/'+c.kind,size:0,addedAt:now,poster:'https://fixture.invalid/live.svg',remote:{kind:c.kind,channelId:c.channelId,channelName:c.title,videoId:c.kind==='twitch'?c.handle:videoId,live:true,observedAt:now,viewers:1234,watchUrl:c.kind==='twitch'?'https://www.twitch.tv/'+c.handle:'https://www.youtube.com/watch?v='+videoId}};}),refreshedIds:channels.map(c=>c.id),liveCheckedIds:channels.map(c=>c.id),retryAt:{}};
  }
  await route.fulfill({contentType:'application/json',body:JSON.stringify({result,context:{}})}).catch(()=>{});
 });
 const navigate=async name=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp('^'+name+'(?:\\s+\\d+)?$')}).click();};
 try{
  await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();await page.evaluate(async()=>{
   const now=Date.now(),channels=[];for(const kind of ['twitch','youtube'])for(let i=0;i<(kind==='youtube'?2000:200);i++){const channelId=kind==='youtube'?'UC'+String(i).padStart(22,'0'):String(i+1000);channels.push({id:kind==='youtube'?'yt:'+channelId:'tw:creator'+i,kind,channelId,handle:'creator'+i,title:(kind==='youtube'?'YouTube ':'Twitch ')+i,live:i<(kind==='youtube'?52:42),liveCheckedAt:i<(kind==='youtube'?52:42)?now-3600000:undefined});}
   localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels,savedAt:now}));const db=await new Promise((res,rej)=>{const r=indexedDB.open('reelcase');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});try{await new Promise((res,rej)=>{const tx=db.transaction('remote-cache','readwrite'),cache=tx.objectStore('remote-cache');cache.put({folders:[],checkedAt:now},'meta');for(const c of channels.filter(c=>c.live)){const i=Number(c.handle.slice(7)),videoId='l'+String(i).padStart(10,'0'),id=c.kind==='twitch'?'tw:live:'+i:'yt:v:'+videoId;cache.put({id,folderId:c.id,name:c.title+' live',path:'',extension:'live',mime:'video/'+c.kind,size:0,addedAt:now,poster:'https://fixture.invalid/live.svg',remote:{kind:c.kind,channelId:c.channelId,channelName:c.title,videoId:c.kind==='twitch'?c.handle:videoId,live:true,observedAt:now-3600000,viewers:1234,watchUrl:c.kind==='twitch'?'https://www.twitch.tv/'+c.handle:'https://www.youtube.com/watch?v='+videoId}},'video:'+id);}tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}finally{db.close();}
  });await page.reload();await page.getByText('94 indexed',{exact:true}).waitFor();await navigate('Live');
  const yt=page.getByRole('region',{name:'YouTube quick live checks',exact:true}),tw=page.getByRole('region',{name:'Twitch quick live checks',exact:true});
  await yt.getByRole('button',{name:'Enable automatic checks',exact:true}).click();await tw.getByText('200 / 200 creators checked successfully', {exact:false}).waitFor();
  assert(blocked);assert(!calls.some(c=>c.youtubeLiveOnly&&c.channels.some(ch=>ch.liveCheckedAt>Date.now()-10000)));checks.push('automatic Twitch confirmation and discovery finish while the first YouTube response is deliberately blocked and bulk archives remain paused');
  releaseYoutube();await yt.getByText('2,000 / 2,000 creators checked successfully', {exact:false}).waitFor();
  assert.equal(new Set(calls.filter(c=>c.youtubeLiveOnly).flatMap(c=>c.channels.map(ch=>ch.id))).size,2000);assert.equal(new Set(calls.filter(c=>c.twitchLiveOnly).flatMap(c=>c.channels.map(ch=>ch.id))).size,200);
  await page.getByText('95 matching streams',{exact:false}).waitFor();checks.push('automatic scans refresh all 42 Twitch and 52 YouTube stale streams and discover a live creator at the tail of 2,000 follows');
  await page.waitForFunction(()=>{const saved=JSON.parse(localStorage.getItem('reelcase.follows.v1')??'null');return saved?.channels?.length===2200&&saved.channels.every(c=>c.liveCheckedAt);});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('reelcase.follows.v1')).channels);assert.equal(saved.length,2200);assert(saved.every(c=>c.liveCheckedAt));assert(saved.some(c=>c.kind==='youtube'&&c.handle==='creator1999'&&c.live));checks.push('all follow observations, including the newly discovered tail stream, are persisted in the dedicated follow checkpoint');
  await yt.scrollIntoViewIfNeeded();await page.screenshot({path:output.replace(/.json$/, '-'+viewport.name+'.png')});
  // The real session activity timer must enter idle; visible live owners still run.
  const before=calls.length;await page.clock.install();await page.clock.fastForward(6*60_000);await page.waitForFunction(()=>document.querySelector('progress[aria-label="YouTube live check progress"]')?.value>0);for(let i=0;i<100&&calls.length===before;i++)await new Promise(r=>setTimeout(r,30));assert(calls.length>before,'visible idle page must continue live checks');checks.push('live checks restart after six minutes without user input using the real browser session timer');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);report.requests=calls.length;
 }catch(error){report.error=error.stack;await page.screenshot({path:output.replace(/.json$/, '-'+viewport.name+'-failure.png')}).catch(()=>{});throw error;}
 finally{releaseYoutube();await context.close();writeFileSync(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Isolated desktop/mobile Chrome; real scheduler, store, persistence and UI, with controlled provider responses including a stalled YouTube response.'},null,2));}
}}finally{await browser.close();}
console.log(JSON.stringify({ok:true,reports},null,2));
