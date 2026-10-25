import assert from 'node:assert/strict';
import {fromJSON} from 'seroval';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {checkedUrl,checkedOutputPath} from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??'screenshots/youtube-live-health-browser.json',[resolve('screenshots')]);
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
const dataOf=value=>{if(!value||typeof value!=='object')return;if(Array.isArray(value.channels))return value;for(const child of Object.values(value)){const found=dataOf(child);if(found)return found;}};
try{for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],calls=[],checks=[];
 const report={viewport:viewport.name,errors,checks};reports.push(report);page.setDefaultTimeout(45000);
 await page.clock.install({time:Date.now()});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))errors.push(m.text());});
 await context.addInitScript(()=>{if(!sessionStorage.getItem('youtube-health-init')){sessionStorage.setItem('youtube-health-init','true');localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,requestGapMs:250}));}localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:false,tools:false}));});
 await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
 await context.route(/https:\/\/(?:i\.ytimg\.com|fixture\.invalid)\//,r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/></svg>'}));
 await page.route('**/_serverFn/**',async route=>{
  const data=dataOf(fromJSON(JSON.parse(route.request().postData()??'{}')));let result=null;
  if(data){assert(data.youtubeLiveOnly&&!data.twitchLiveOnly);calls.push(data);const now=await page.evaluate(()=>Date.now());const channels=data.channels.map(c=>({...c,liveCheckedAt:now,lastLiveFailure:undefined}));
   result={channels,videos:channels.filter(c=>c.live).map(c=>{const i=Number(c.handle.slice(7)),videoId='l'+String(i).padStart(10,'0');return{id:'yt:v:'+videoId,folderId:c.id,name:c.title+' live',path:'',extension:'live',mime:'video/youtube',size:0,addedAt:now,poster:'https://fixture.invalid/live.svg',remote:{kind:'youtube',channelId:c.channelId,channelName:c.title,videoId,live:true,observedAt:now,viewers:1234,watchUrl:'https://www.youtube.com/watch?v='+videoId}};}),refreshedIds:channels.map(c=>c.id),liveCheckedIds:channels.map(c=>c.id),retryAt:{}};
  }
  await route.fulfill({contentType:'application/json',body:JSON.stringify({result,context:{}})}).catch(()=>{});
 });
 const navigate=async name=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp('^'+name+'(?:\\s+\\d+)?$')}).click();};
 const status=()=>page.getByRole('region',{name:'YouTube quick live checks',exact:true});
 try{
  await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();
  await page.evaluate(async()=>{
   const now=Date.now(),channels=Array.from({length:54},(_,i)=>{const channelId='UC'+String(i).padStart(22,'0');return{id:'yt:'+channelId,channelId,kind:'youtube',handle:'creator'+i,title:'Creator '+i,live:i>=40&&i<46,liveCheckedAt:now-(i<30?1000:i<40?360000:i<46?90000:600000),...(i>=46?{lastLiveFailure:{kind:'network-offline',at:now,attempts:1,retryAt:now+60000,message:'Creator '+i+' timed out',recovery:'Retry later'}}:{})};});
   localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels,savedAt:now}));
   const db=await new Promise((res,rej)=>{const r=indexedDB.open('reelcase');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
   try{await new Promise((res,rej)=>{const tx=db.transaction('remote-cache','readwrite'),cache=tx.objectStore('remote-cache');cache.put({folders:[],checkedAt:now},'meta');for(const c of channels.filter(c=>c.live)){const i=Number(c.handle.slice(7)),videoId='l'+String(i).padStart(10,'0'),id='yt:v:'+videoId;cache.put({id,folderId:c.id,name:c.title+' live',path:'',extension:'live',mime:'video/youtube',size:0,addedAt:now,poster:'https://fixture.invalid/live.svg',remote:{kind:'youtube',channelId:c.channelId,channelName:c.title,videoId,live:true,observedAt:c.liveCheckedAt,viewers:100,watchUrl:'https://www.youtube.com/watch?v='+videoId}},'video:'+id);}tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}finally{db.close();}
  });
  await page.reload();await page.getByText('6 indexed',{exact:true}).waitFor();await navigate('Live');
  await status().getByText('36 / 54 creators checked successfully',{exact:false}).waitFor();await status().getByText('8 waiting to retry',{exact:false}).waitFor();
  await status().getByRole('button',{name:'Check due YouTube creators (16)',exact:true}).click();
  await status().getByText(/Check complete · 16 \/ 16/).waitFor();
  assert.equal(calls.flatMap(c=>c.channels).length,16);assert(calls.flatMap(c=>c.channels).every(c=>{const i=Number(c.handle.slice(7));return i>=30&&i<46;}));
  await status().getByText('46 / 54 creators checked successfully',{exact:false}).waitFor();assert(await status().getByRole('button',{name:'Check due YouTube creators',exact:true}).isDisabled());
  checks.push('Check due refreshes exactly 16 overdue creators, skipping 30 fresh observations and eight retry waits');
  await status().getByText('8 latest YouTube checks need attention',{exact:true}).click();await status().getByText('Creator 46 timed out',{exact:true}).waitFor();assert.match(await status().getByRole('link',{name:'Creator 46',exact:true}).getAttribute('href'),/^https:\/\/www.youtube.com\/channel\/UC/);
  await status().scrollIntoViewIfNeeded();await page.screenshot({path:output.replace('.json','-'+viewport.name+'.png')});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('reelcase.follows.v1')).channels.filter(c=>!c.lastLiveFailure).every(c=>Date.now()-c.liveCheckedAt<300000));
  await page.reload();await page.getByText('6 indexed',{exact:true}).waitFor();await navigate('Live');await status().getByText('46 / 54 creators checked successfully',{exact:false}).waitFor();
  checks.push('successful observations and failed-creator backoff survive reload; the bounded failure list shows names, errors and official creator links');
  const before=calls.length;
  await page.evaluate(()=>{const saved=JSON.parse(localStorage.getItem('reelcase.follows.v1')),c=saved.channels.find(c=>c.handle==='creator46');c.lastLiveFailure={...c.lastLiveFailure,at:Date.now(),retryAt:Date.now()+120000,kind:'rate-limited',cooldownScope:'live',message:'YouTube live rate limit'};saved.savedAt=Date.now()+1;localStorage.setItem('reelcase.follows.v1',JSON.stringify(saved));});
  await page.reload();await page.getByText('6 indexed',{exact:true}).waitFor();await navigate('Live');
  await status().getByText('YouTube asked to wait until',{exact:false}).waitFor();assert(await status().getByRole('button',{name:/Check due YouTube creators/}).isDisabled());
  await status().getByRole('button',{name:'Enable automatic checks',exact:true}).click();await page.clock.runFor(5000);assert.equal(calls.length,before);
  checks.push('provider live cooldown restores from durable follows and prevents automatic network retries after reload');
  await page.clock.fastForward(121000);
  await status().getByText('54 / 54 creators checked successfully',{exact:false}).waitFor();
  assert.equal(await status().getByText(/latest YouTube checks need attention/).count(),0);await status().getByText(/Batch complete/).waitFor();
  checks.push('automatic checks resume after the deadline, recover failed creators and clear their diagnostics without a full fresh-creator rescan');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);report.requests=calls.length;
 }catch(error){report.error=error.stack;await page.screenshot({path:output.replace('.json','-'+viewport.name+'-failure.png')}).catch(()=>{});console.log((await page.locator('body').innerText()).slice(0,5000));throw error;}
 finally{await page.unrouteAll({behavior:'ignoreErrors'});await context.unrouteAll({behavior:'ignoreErrors'});await context.close();writeFileSync(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Isolated desktop/mobile Chrome with real UI/store/persistence and deterministic public-metadata fixtures. Virtual time tests retry deadlines; upstream requests are tested separately.'},null,2));}
}}finally{await browser.close();}
console.log(JSON.stringify({ok:true,reports},null,2));
