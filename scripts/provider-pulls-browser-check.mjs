import assert from 'node:assert/strict';
import {fromJSON} from 'seroval';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {checkedUrl,checkedOutputPath} from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??'screenshots/provider-pulls-browser.json',[resolve('screenshots')]);
const find=(v,p)=>{if(!v||typeof v!=='object')return;if(p(v))return v;for(const child of Object.values(v)){const r=find(child,p);if(r)return r;}};
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
try{for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],requests=[],checks=[];const report={viewport:viewport.name,checks,errors};reports.push(report);page.setDefaultTimeout(45000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))errors.push(m.text());});
 await context.addInitScript(()=>{localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,requestGapMs:250}));localStorage.setItem('reelcase.pulls-paused.v1','false');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:false,tools:false}));});
 await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
 await context.route('https://i.ytimg.com/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/></svg>'}));
 await page.route('**/_serverFn/**',async route=>{
  const input=fromJSON(JSON.parse(route.request().postData()??'{}')),data=find(input,v=>Array.isArray(v.channels)&&v.channels.some(c=>c?.kind));let result=null;
  if(data){requests.push(data);const now=Date.now();result={channels:data.channels.map(c=>({...c,lastCheckedAt:now,...(data.youtubeCatalog?{catalogCursor:'next-'+c.id,catalogCheckedAt:now}:data.twitchContinueArchive?{twitchArchiveCursor:JSON.stringify({v:1,stage:'ARCHIVE',after:'next-'+c.id}),twitchArchiveCheckedAt:now}:{recentPull:{attemptedAt:now,checkedAt:now,failures:0}})})),videos:[],refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:[],retryAt:{}};}
  await route.fulfill({contentType:'application/json',body:JSON.stringify({result,context:{}})}).catch(()=>{});
 });
 const navigate=async name=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp('^'+name+'(?:\\s+\\d+)?$')}).click();};
 try{
  await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();
  await page.evaluate(()=>{const now=Date.now(),channels=['youtube','twitch'].flatMap(kind=>Array.from({length:16},(_,i)=>({id:kind==='youtube'?'yt:UC'+String(i).padStart(22,'0'):'tw:creator'+String(i).padStart(2,'0'),kind,channelId:kind==='youtube'?'UC'+String(i).padStart(22,'0'):'creator'+i,handle:'creator'+i,title:(kind==='youtube'?'YouTube':'Twitch')+' creator '+String(i).padStart(2,'0'),lastCheckedAt:now,liveCheckedAt:now,catalogCursor:kind==='youtube'?'saved-'+i:undefined,twitchArchiveCursor:kind==='twitch'?JSON.stringify({v:1,stage:'ARCHIVE',after:'saved-'+i}):undefined})));localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels,savedAt:now}));return channels;}).then(async channels=>{await page.evaluate(async channels=>{const db=await new Promise((res,rej)=>{const r=indexedDB.open('reelcase');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});try{await new Promise((res,rej)=>{const tx=db.transaction('remote-cache','readwrite'),store=tx.objectStore('remote-cache');store.put({folders:[],checkedAt:Date.now()},'meta');for(const c of channels){const row={id:'seed-'+c.id,folderId:c.id,name:'Saved video',path:'seed/'+c.id,extension:c.kind==='youtube'?'yt':'vod',mime:'video/'+c.kind,size:0,addedAt:1,duration:100,remote:{kind:c.kind,channelId:c.channelId,channelName:c.title,videoId:'seed'+c.handle}};store.put(row,'video:'+row.id);}tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}finally{db.close();}},channels);});
  await page.reload();await page.locator('[data-home-ready="true"]').waitFor();
  for(const name of ['YouTube','Twitch']){
   await navigate(name);const kind=name.toLowerCase(),panel=page.getByRole('region',{name:name+' pull control'});await panel.waitFor();
   for(let turn=0;turn<2;turn++){await panel.getByRole('button',{name:'Check recent uploads',exact:true}).click();await panel.getByRole('status').filter({hasText:/12 \/ 12 creators checked/}).waitFor();}
   const calls=requests.filter(d=>d.channels[0]?.kind===kind&&!d.youtubeCatalog&&!d.twitchContinueArchive);assert.equal(calls.length,12);assert(calls.every(d=>d.channels.length<=2));assert.equal(new Set(calls.slice(0,6).flatMap(d=>d.channels.map(c=>c.id))).size,12);assert.equal(new Set(calls.flatMap(d=>d.channels.map(c=>c.id))).size,16);
   checks.push(name+' recent checks rotate across all 16 creators in bounded two-creator responses');
   const selected=kind==='youtube'?'yt:UC'+String(0).padStart(22,'0'):'tw:creator00';
   await panel.getByRole('combobox').selectOption(selected);await panel.getByRole('button',{name:'Continue older videos',exact:true}).click();await panel.getByRole('status').filter({hasText:/1 \/ 1 creators checked/}).waitFor();
   const last=requests.at(-1);assert.equal(last.channels[0].id,selected);assert.equal(kind==='youtube'?last.channels[0].catalogCursor:JSON.parse(last.channels[0].twitchArchiveCursor).after,'saved-0');assert(kind==='youtube'?last.youtubeCatalog:last.twitchContinueArchive);
   checks.push(name+' selected older pull resumes saved position independently of fresh checks');
   await panel.scrollIntoViewIfNeeded();await page.screenshot({path:output.replace('.json','-'+kind+'-'+viewport.name+'.png')});
   const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('reelcase.follows.v1')).channels);assert.equal(rows.filter(c=>c.kind===kind&&c.recentPull?.checkedAt).length,16);const saved=rows.find(c=>c.id===selected);assert.equal(kind==='youtube'?saved.catalogCursor:JSON.parse(saved.twitchArchiveCursor).after,'next-'+selected);
   await page.reload();await page.locator('[data-home-ready="true"]').waitFor();
   checks.push(name+' recent health and archive continuation persist across reload');
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);report.requests=requests.length;
 }catch(e){report.error=e.stack;await page.screenshot({path:output.replace('.json','-'+viewport.name+'-failure.png')}).catch(()=>{});throw e;}
 finally{await page.unrouteAll({behavior:'ignoreErrors'});await context.unrouteAll({behavior:'ignoreErrors'});await context.close();writeFileSync(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Real UI and persistence with controlled provider responses in isolated Chrome profiles. No private follows or real upstream results changed.'},null,2));}
}}finally{await browser.close();}
console.log(JSON.stringify({ok:true,reports},null,2));
