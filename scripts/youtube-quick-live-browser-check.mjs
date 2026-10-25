import assert from 'node:assert/strict';
import {fromJSON} from 'seroval';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {checkedUrl,checkedOutputPath} from './browser-guard.mjs';
const origin=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??'screenshots/youtube-quick-live-browser.json',[resolve('screenshots')]);
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
const findData=value=>{if(!value||typeof value!=='object')return;if(Array.isArray(value.channels))return value;for(const child of Object.values(value)){const found=findData(child);if(found)return found;}};
try{
 for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],checks=[],calls=[];
  const report={viewport:viewport.name,errors,checks};reports.push(report);page.setDefaultTimeout(45000);
  let archiveStarted=false,releaseArchive;const archiveGate=new Promise(r=>releaseArchive=r);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))errors.push(m.text());});
  await context.addInitScript(()=>{localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,youtubeSourcesPerSweep:1,requestGapMs:250,youtubeRequestGapMs:80}));localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:false,tools:false}));});
  await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
  await context.route(/https:\/\/(?:i\.ytimg\.com|fixture\.invalid)\//,r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/><circle cx="160" cy="90" r="30" fill="#b9d8ef"/></svg>'}));
  await page.route('**/_serverFn/**',async route=>{
   const data=findData(fromJSON(JSON.parse(route.request().postData()??'{}')));
   if(!data){await route.continue();return;}
   if(!data.youtubeLiveOnly){assert(data.youtubeCatalog);archiveStarted=true;await archiveGate;await route.fulfill({contentType:'application/json',body:JSON.stringify({result:{channels:data.channels,videos:[],refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:[],retryAt:{}},context:{}})});return;}
   assert(!data.youtubeCatalog);assert(data.channels.length<=24);calls.push(data.channels.map(c=>c.id));await new Promise(r=>setTimeout(r,35));
   const now=Date.now(),failed=data.channels.filter(c=>c.handle==='creator777'),healthy=data.channels.filter(c=>!failed.includes(c));
   const channels=[...healthy.map(c=>({...c,live:Number(c.handle.slice(7))%200===0,liveCheckedAt:now,lastLiveFailure:undefined})),...failed.map(c=>({...c,liveCheckedAt:now,lastLiveFailure:{at:now,kind:'network-offline',message:'Temporary live check failure',recovery:'Retry later.'}}))];
   const videos=channels.filter(c=>!c.lastLiveFailure&&c.live).map(c=>{const videoId='l'+c.handle.slice(7).padStart(10,'0');return{id:'yt:v:'+videoId,folderId:c.id,name:'Live '+c.title,path:'',extension:'live',mime:'video/youtube',size:0,addedAt:now,poster:'https://fixture.invalid/live.svg',remote:{kind:'youtube',videoId,channelId:c.channelId,channelName:c.title,live:true,observedAt:now,youtubeType:'live',watchUrl:'https://www.youtube.com/watch?v='+videoId,embedUrl:'https://www.youtube.com/embed/'+videoId}};});
   await route.fulfill({contentType:'application/json',body:JSON.stringify({result:{channels,videos,refreshedIds:healthy.map(c=>c.id),liveCheckedIds:healthy.map(c=>c.id),retryAt:{}},context:{}})});
  });
  const navigate=async name=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp(`^${name}(?:\\s+\\d+)?$`)}).click();};
  try{
   await page.goto(origin);await page.locator('[data-home-ready="true"]').waitFor();
   await page.evaluate(async()=>{
    const now=Date.now(),channels=Array.from({length:2000},(_,i)=>{const channelId='UC'+String(i).padStart(22,'0');return{id:'yt:'+channelId,channelId,kind:'youtube',handle:'creator'+i,title:'Creator '+i,live:i===1||i===777,liveOfflineSince:i===1?now-600001:undefined,liveCheckedAt:1};});
    localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels,savedAt:now}));
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('reelcase');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    try{await new Promise((resolve,reject)=>{const tx=db.transaction('remote-cache','readwrite'),cache=tx.objectStore('remote-cache');cache.put({folders:[],checkedAt:now},'meta');
     for(let i=0;i<302;i++){const live=i>=300,creator=live?(i===300?1:777):i,channelId='UC'+String(creator).padStart(22,'0'),videoId=(live?'l'+String(creator).padStart(10,'0'):'v'+String(i).padStart(10,'0')),id='yt:v:'+videoId;cache.put({id,folderId:'yt:'+channelId,name:(live?'Existing live ':'Saved upload ')+creator,path:'',extension:live?'live':'yt',mime:'video/youtube',size:0,addedAt:now-i,duration:live?undefined:420,poster:'https://fixture.invalid/live.svg',remote:{kind:'youtube',channelId,channelName:'Creator '+creator,videoId,live,liveOfflineSince:live&&creator===1?now-600001:undefined,observedAt:now,youtubeType:live?'live':'upload',embedUrl:'https://www.youtube.com/embed/'+videoId}},'video:'+id);}
     tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });}finally{db.close();}
   });
   await page.reload();await page.getByText('302 indexed',{exact:true}).waitFor();await navigate('YouTube');
   const panel=page.getByRole('region',{name:'YouTube quick live checks'}),button=panel.getByRole('button',{name:'Check all YouTube live channels',exact:true});
   await button.click();await panel.getByRole('button',{name:'Checking YouTube live…',exact:true}).waitFor();
   await page.waitForFunction(()=>document.querySelector('progress[aria-label="YouTube live check progress"]')?.value>0);
   await panel.scrollIntoViewIfNeeded();await page.screenshot({path:output.replace(/\.json$/,`-${viewport.name}-progress.png`)});
   const during=calls.length;assert(during>0&&during<84,'progress is visible before the 2,000-channel sweep finishes');
   await button.waitFor();await panel.getByText(/Partial check · 2,000 \/ 2,000 creators · 10 broadcasts · 1 unavailable/).waitFor();
   assert.equal(calls.length,84);assert.equal(new Set(calls.flat()).size,2000);checks.push('one manual action checks every one of 2,000 verified creators in 84 bounded requests while archives are paused, with visible incremental progress');
   await navigate('Live');await page.getByText('11 matching streams',{exact:false}).waitFor();checks.push('ten discovered broadcasts appear immediately, one failed creator keeps its previous broadcast, and a confirmed offline broadcast leaves the live grid');
   const input=page.getByRole('textbox',{name:'Search live streams'});const started=Date.now();await input.fill('Creator 200');assert(Date.now()-started<1500);await page.getByText('1 matching streams',{exact:false}).waitFor();await input.fill('');
   await page.getByRole('button',{name:'Resume pulls',exact:true}).first().click();await navigate('YouTube');await page.getByRole('button',{name:'Pull next creator batch',exact:true}).click();
   for(let i=0;i<100&&!archiveStarted;i++)await new Promise(r=>setTimeout(r,30));assert(archiveStarted,'real archive browser lane started');
   const before=calls.length;await button.click();for(let i=0;i<100&&calls.length<before+2;i++)await new Promise(r=>setTimeout(r,30));assert(calls.length>=before+2,'quick live requests advance while the archive server response is still blocked');
   await panel.getByRole('button',{name:'Checking YouTube live…',exact:true}).waitFor();releaseArchive();await button.waitFor();checks.push('the real live browser lane advances beside a blocked archive request; independent progress remains visible and archive ownership is preserved');
   await panel.scrollIntoViewIfNeeded();await page.screenshot({path:output.replace(/\.json$/,`-${viewport.name}-complete.png`)});
   await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await navigate('YouTube');await panel.getByText(/1,999 \/ 2,000 creators checked successfully/).waitFor();await navigate('Live');await page.getByText('11 matching streams',{exact:false}).waitFor();checks.push('2,000 follow checkpoints and live/offline reconciliation survive reload without automatic rechecks');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);report.requests=calls.length;
  }catch(error){report.error=error.stack;await page.screenshot({path:output.replace(/\.json$/,`-${viewport.name}-failure.png`)}).catch(()=>{});console.log((await page.locator('body').innerText().catch(()=>'' )).slice(-5000));throw error;}
  finally{releaseArchive();await context.close();writeFileSync(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Isolated desktop/mobile Chromium, 2,000 real persisted follows and 302 saved videos; provider responses are deterministic fixtures. Real provider endpoints and network concurrency are checked separately.'},null,2));}
 }
}finally{await browser.close();}
console.log(JSON.stringify({ok:true,reports},null,2));
