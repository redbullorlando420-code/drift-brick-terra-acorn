import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate';
import { chromium } from 'playwright';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??'screenshots/rejection-ui.json',[resolve('screenshots')]);
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
try { for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]) {
 const context=await browser.newContext({viewport,acceptDownloads:true}),page=await context.newPage(),errors=[],checks=[];
 const report={viewport:viewport.name,checks,errors};reports.push(report);page.setDefaultTimeout(45000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))errors.push(m.text());});
 await context.addInitScript(()=>{
  localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,requestGapMs:250}));
  localStorage.setItem('reelcase.pulls-paused.v1','true');
  localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:true}));
  const write=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(window.__denyFeedbackSave&&key==='reelcase.media-feedback.v1')throw new DOMException('Fixture quota reached','QuotaExceededError');return write.call(this,key,value);};
  const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(window.__denyFeedbackSave&&this.name==='activity'&&key==='feedback')throw new DOMException('Fixture disk full','QuotaExceededError');return put.call(this,value,key);};
 });
 await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
 await context.route('https://www.youtube.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><p>Synthetic official player</p>'}));
 await context.route('https://i.ytimg.com/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/></svg>'}));
 await page.route('**/_serverFn/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({result:{comments:[],note:'Fixture offline'}})}));
 const nav=async(name)=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp('^'+name+'(?:\\s+\\d+)?$')}).click();};
 const open=async()=>{await nav('YouTube');await page.getByRole('heading',{name:'More of what you watch.',exact:true}).waitFor();const explore=page.getByRole('button',{name:'Explore recommendations and full catalog',exact:true});if(await explore.isVisible())await explore.click();const card=page.locator('[data-video-card]').filter({has:page.getByRole('heading',{name:'Racing choices fixture 1',exact:true})}).first();await card.scrollIntoViewIfNeeded();await card.locator('[data-video-card-open]').click();await page.locator('[data-recommendation-choices]').waitFor();await page.locator('[data-recommendation-choices] > summary').click();};
 const panel=page.locator('[data-recommendation-choices]');
 const ledger=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('reelcase.media-feedback.v1')).recommendationRejections);
 const saved=()=>panel.getByRole('status').filter({hasText:'Saved to this browser.'}).waitFor();
 const close=()=>page.getByRole('button',{name:'Close preview',exact:true}).click();
 const importPack=async(buffer)=>{const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import library pack',exact:true}).click();await (await chooser).setFiles({name:'synthetic-rejections.zip',mimeType:'application/zip',buffer});await page.getByText(/Pack import ·/).first().waitFor();};
 page.on('dialog',dialog=>dialog.message().startsWith('Also REPLACE')?dialog.dismiss():dialog.accept());
 try {
  await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();
  await page.evaluate(async()=>{
   const now=Date.now(),channelId='UC'+'0'.repeat(22),folderId='yt:'+channelId;
   const rows=Array.from({length:12},(_,i)=>{const videoId='reject'+String(i+1).padStart(5,'0');return {id:'yt:'+videoId,name:'Racing choices fixture '+(i+1),folderId,path:'youtube/fixture',extension:'yt',mime:'video/youtube',size:0,duration:1200,genre:'iRacing',addedAt:now-i*86400000,remote:{kind:'youtube',videoId,channelId,channelName:'Choices creator',watchUrl:'https://www.youtube.com/watch?v='+videoId,embedUrl:'https://www.youtube.com/embed/'+videoId,publishedSource:'provider',publishedPrecision:'instant',youtubeType:'upload'}};});
   localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels:[{id:folderId,kind:'youtube',handle:'https://www.youtube.com/channel/'+channelId,title:'Choices creator',channelId}],savedAt:now}));
   const prefs=JSON.parse(localStorage.getItem('reelcase.prefs.v4')??'{}');prefs.tags=Object.fromEntries(rows.map(row=>[row.id,['racing']]));prefs.hiddenVideos={};prefs.unavailable={};localStorage.setItem('reelcase.prefs.v4',JSON.stringify(prefs));
   localStorage.setItem('reelcase.media-feedback.v1',JSON.stringify({ratings:{'yt:reject00001':4},watchTime:{'yt:reject00002':{preview:300,fullscreen:0}},creatorFavorites:{},tagLikes:{},recommendationRejections:{version:1,updatedAt:0,entries:[]}}));
   const db=await new Promise((res,rej)=>{const request=indexedDB.open('reelcase');request.onsuccess=()=>res(request.result);request.onerror=()=>rej(request.error);});
   try {await new Promise((res,rej)=>{const tx=db.transaction('remote-cache','readwrite'),store=tx.objectStore('remote-cache');store.put({folders:[],checkedAt:now},'meta');for(const row of rows)store.put(row,'video:'+row.id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}finally{db.close();}
  });
  await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await open();
  await panel.getByRole('button',{name:'Less of this title',exact:true}).click();await saved();
  assert.deepEqual((await ledger()).entries.map(e=>e.scope),['title']);
  await panel.getByRole('button',{name:'Less from this creator',exact:true}).click();await saved();
  await panel.getByRole('combobox',{name:'Topic to recommend less'}).selectOption('racing');await panel.getByRole('button',{name:'Less of this topic',exact:true}).click();await saved();
  assert.equal((await ledger()).entries.length,3);checks.push('Title, provider-scoped creator and canonical topic choices are distinct, durably saved and reversible');
  await page.getByRole('button',{name:'Save',exact:true}).click();await panel.getByText(/protected by a favorite/).waitFor();await page.getByRole('button',{name:'Saved',exact:true}).click();
  await panel.locator('[data-rejection-review] > summary').click();assert.equal(await panel.locator('li').count(),3);await panel.scrollIntoViewIfNeeded();await page.screenshot({path:output.replace('.json','-'+viewport.name+'.png')});
  await close();await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await open();
  assert.equal(await panel.getByRole('button',{name:'Undo: Less of this title',exact:true}).getAttribute('aria-pressed'),'true');assert.equal((await ledger()).entries.length,3);checks.push('Choices survive a real IndexedDB/localStorage reload, while explicit favorite protection is explained');
  await page.evaluate(()=>window.__denyFeedbackSave=true);await panel.getByRole('button',{name:'Undo: Less of this title',exact:true}).click();await panel.getByRole('alert').filter({hasText:'Browser storage could not save'}).waitFor();
  await page.evaluate(()=>window.__denyFeedbackSave=false);await panel.getByRole('button',{name:'Retry saving feedback',exact:true}).click();await saved();assert.equal((await ledger()).entries.length,2);await panel.getByRole('button',{name:'Less of this title',exact:true}).click();await saved();checks.push('Simultaneous quota failures in both mirrors show a session-only warning; explicit retry saves current evidence');
  const backedUp=(await ledger()).entries;await close();await nav('Settings');const downloadWait=page.waitForEvent('download');await page.getByRole('button',{name:'Export library pack',exact:true}).click();const bytes=await readFile(await (await downloadWait).path()),files=unzipSync(bytes),ratingsPath=Object.keys(files).find(key=>key.endsWith('/marks/ratings.json')),ratings=JSON.parse(strFromU8(files[ratingsPath]));
  assert.deepEqual(ratings.recommendationRejections.entries,backedUp);assert.equal(ratings.ratings['yt:reject00001'],4);assert.equal(ratings.watchTime['yt:reject00002'].preview,300);
  await open();await panel.locator('[data-rejection-review] > summary').click();while(await panel.locator('li').count())await panel.locator('li').first().getByRole('button',{name:/^Undo /}).click();await saved();assert.equal((await ledger()).entries.length,0);await close();await nav('Settings');await importPack(bytes);assert.deepEqual((await ledger()).entries,backedUp);checks.push('Downloaded library pack contains all ranking feedback; importing after Undo restores the exact rejection inputs and keeps ratings/watch-time');
  await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await open();assert.equal((await ledger()).entries.length,3);
  await close();await nav('Settings');const extra=structuredClone(ratings);extra.recommendationRejections.entries.push(...Array.from({length:9},(_,i)=>({scope:'title',target:'local:synthetic-'+i,label:'Synthetic extra choice '+i,at:Date.now()+i})));files[ratingsPath]=strToU8(JSON.stringify(extra));await importPack(Buffer.from(zipSync(files)));await open();await panel.locator('[data-rejection-review] > summary').click();assert.equal(await panel.locator('li').count(),8);await panel.getByRole('button',{name:'Next choices',exact:true}).click();assert.equal(await panel.locator('li').count(),4);await panel.getByRole('button',{name:'Previous choices',exact:true}).click();assert.equal(await panel.locator('li').count(),8);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);checks.push('Review mounts at most eight choices, pages correctly, and has no desktop/mobile overflow or console errors');
 }catch(error){report.error=error.stack;report.body=(await page.locator("body").innerText()).slice(-12000);await page.screenshot({path:output.replace('.json','-'+viewport.name+'-failure.png')}).catch(()=>{});throw error;}
 finally {await page.unrouteAll({behavior:'ignoreErrors'});await context.unrouteAll({behavior:'ignoreErrors'});await context.close();await writeFile(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Synthetic public catalog, isolated desktop/mobile Chrome storage and provider player fixture; no real user data or external provider behavior modified.'},null,2));}
}}finally{await browser.close();}
console.log(JSON.stringify({ok:true,reports},null,2));
