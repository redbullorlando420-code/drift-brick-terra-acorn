import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate';
import { chromium } from 'playwright';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??'screenshots/topic-alias-ui.json',[resolve('screenshots')]);
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
try { for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]) {
 const context=await browser.newContext({viewport,acceptDownloads:true}),page=await context.newPage(),errors=[],checks=[];
 const report={viewport:viewport.name,checks,errors};reports.push(report);page.setDefaultTimeout(45000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))errors.push(m.text());});
 await context.addInitScript(()=>{
  localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,requestGapMs:250}));
  localStorage.setItem('reelcase.pulls-paused.v1','true');
  localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:true}));
  const write=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(window.__denyAliasSave&&key==='reelcase.topic-aliases.v1')throw new DOMException('Fixture quota reached','QuotaExceededError');return write.call(this,key,value);};
  const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(window.__denyAliasSave&&this.name==='activity'&&key==='topic-aliases')throw new DOMException('Fixture disk full','QuotaExceededError');return put.call(this,value,key);};
 });
 await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
 await context.route('https://www.youtube.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><p>Synthetic official player</p>'}));
 await context.route('https://i.ytimg.com/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/></svg>'}));
 await page.route('**/_serverFn/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({result:{comments:[],note:'Fixture offline'}})}));
 const nav=async(name)=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp('^'+name+'(?:\\s+\\d+)?$')}).click();};

  const panel=page.locator('[data-alias-review]');
  const navTopics=async()=>{await nav('Topics');await page.locator('[data-topic-catalog][data-topic-pending="false"]').waitFor();if(!await panel.evaluate(el=>el.open))await panel.locator('> summary').click();};
  const ledger=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('reelcase.topic-aliases.v1')??'{"entries":[]}'));
  const waitAlias=async(alias,present)=>page.waitForFunction(({alias,present})=>JSON.parse(localStorage.getItem('reelcase.topic-aliases.v1')??'{"entries":[]}').entries.some(e=>e.alias===alias)===present,{alias,present});
  const undo=async(alias)=>{const saved=panel.locator('[data-saved-aliases]');if(!await saved.evaluate(el=>el.open))await saved.locator('> summary').click();await saved.getByRole('button',{name:'Undo alias '+alias,exact:true}).click();};
  const science=async(count)=>page.getByRole('button',{name:new RegExp('^#science · '+count+' · score')}).waitFor();
  const importPack=async(buffer)=>{const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import library pack',exact:true}).click();await(await chooser).setFiles({name:'synthetic-aliases.zip',mimeType:'application/zip',buffer});await page.getByText(/Pack import ·/).first().waitFor();};
  page.on('dialog',dialog=>dialog.message().startsWith('Also REPLACE')?dialog.dismiss():dialog.accept());
  try {
  await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();
  await page.evaluate(async()=>{
   const now=Date.now(),channelId='UC'+'0'.repeat(22),folderId='yt:'+channelId;
   const rows=Array.from({length:12},(_,i)=>{const videoId='reject'+String(i+1).padStart(5,'0');return {id:'yt:'+videoId,name:(['Alias reference','Spelling variant title','Short label title'][i]??'Neutral fixture '+(i+1)),folderId,path:'youtube/fixture',extension:'yt',mime:'video/youtube',size:0,duration:1200,addedAt:now-i*86400000,remote:{kind:'youtube',videoId,channelId,channelName:'Choices creator',watchUrl:'https://www.youtube.com/watch?v='+videoId,embedUrl:'https://www.youtube.com/embed/'+videoId,publishedSource:'provider',publishedPrecision:'instant',youtubeType:'upload'}};});
   localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels:[{id:folderId,kind:'youtube',handle:'https://www.youtube.com/channel/'+channelId,title:'Choices creator',channelId}],savedAt:now}));
   const prefs=JSON.parse(localStorage.getItem('reelcase.prefs.v4')??'{}');prefs.tags=Object.fromEntries(rows.map(row=>[row.id,[row.id.endsWith('00001')?'science':row.id.endsWith('00002')?'sience':row.id.endsWith('00003')?'ai':'gaming']]));prefs.hiddenVideos={};prefs.unavailable={};localStorage.setItem('reelcase.prefs.v4',JSON.stringify(prefs));
   localStorage.setItem('reelcase.media-feedback.v1',JSON.stringify({ratings:{'yt:reject00001':4},watchTime:{'yt:reject00002':{preview:300,fullscreen:0}},creatorFavorites:{},tagLikes:{},recommendationRejections:{version:1,updatedAt:0,entries:[]}}));
   const db=await new Promise((res,rej)=>{const request=indexedDB.open('reelcase');request.onsuccess=()=>res(request.result);request.onerror=()=>rej(request.error);});
   try {await new Promise((res,rej)=>{const tx=db.transaction('remote-cache','readwrite'),store=tx.objectStore('remote-cache');store.put({folders:[],checkedAt:now},'meta');for(const row of rows)store.put(row,'video:'+row.id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}finally{db.close();}
  });
   await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await navTopics();await science(1);
   await panel.getByRole('button',{name:'Review alias sience',exact:true}).click();
   const preview=panel.getByRole('region',{name:'Alias approval preview'});await preview.getByText('Spelling variant title',{exact:true}).waitFor();assert.equal((await ledger()).entries.length,0);assert.equal(await preview.getByRole('combobox').inputValue(),'science');await preview.scrollIntoViewIfNeeded();await page.screenshot({path:output.replace('.json','-'+viewport.name+'-approval.png')});
   await preview.getByRole('button',{name:'Approve alias',exact:true}).click();await waitAlias('sience',true);await science(2);
   checks.push('Explicit spelling approval joins topic counts and records supporting public title evidence without automatic merges');
   await panel.getByRole('button',{name:'Review alias ai',exact:true}).click();await preview.getByRole('combobox').selectOption('technology');assert.equal(await preview.getByRole('button',{name:'Approve alias',exact:true}).isEnabled(),false);await preview.getByRole('checkbox').check();await preview.getByRole('button',{name:'Approve alias',exact:true}).click();await waitAlias('ai',true);await undo('ai');await waitAlias('ai',false);await science(2);
   checks.push('Ambiguous short labels require a target and acknowledgement; Undo preserves the original short tag');
   await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await navTopics();await science(2);
   await panel.getByRole('button',{name:'Review suggestions',exact:true}).click();
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('reelcase.prefs.v4')).tags);assert.deepEqual(stored['yt:reject00002'],['sience']);assert.deepEqual(stored['yt:reject00003'],['ai']);
   const search=async(query)=>{await page.getByRole('button',{name:'Open search',exact:true}).click();const box=page.getByRole('searchbox',{name:'Global media search'});await box.fill(query);await box.press('Enter');await page.locator('[data-video-card]').filter({has:page.getByRole('heading',{name:'Alias reference',exact:true})}).first().waitFor();await page.locator('[data-video-card]').filter({has:page.getByRole('heading',{name:'Spelling variant title',exact:true})}).first().waitFor();};
   await search('science');await search('sience');checks.push('Real worker-backed global search finds both spellings after a reload; saved tags remain unchanged');
   await page.getByRole('button',{name:'Clear search',exact:true}).click();await nav('Settings');
   const downloadWait=page.waitForEvent('download');await page.getByRole('button',{name:'Export library pack',exact:true}).click();const bytes=await readFile(await(await downloadWait).path()),files=unzipSync(bytes),aliasPath=Object.keys(files).find(key=>key.endsWith('/marks/topic-aliases.json')),backup=JSON.parse(strFromU8(files[aliasPath]));assert.deepEqual(backup.entries,(await ledger()).entries);
   await navTopics();await undo('sience');await waitAlias('sience',false);await science(1);await nav('Settings');await importPack(bytes);await waitAlias('sience',true);assert.deepEqual((await ledger()).entries,backup.entries);await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await navTopics();await science(2);
   checks.push('Downloaded pack includes exact provenance; Undo separates counts and importing the pack restores approved mappings durably');
   await page.evaluate(()=>window.__denyAliasSave=true);await undo('sience');await panel.getByRole('alert').filter({hasText:'browser storage could not save'}).waitFor();await page.evaluate(()=>window.__denyAliasSave=false);await panel.getByRole('button',{name:'Retry saving aliases',exact:true}).click();await waitAlias('sience',false);await panel.getByRole('alert').filter({hasText:'browser storage could not save'}).waitFor({state:'hidden'});await science(1);
   checks.push('Quota failures in both storage mirrors show a session-only warning and explicit retry saves the current Undo');
   await nav('Settings');const extra=structuredClone(backup);extra.entries.push(...Array.from({length:9},(_,i)=>({alias:'fixturealias'+i,topic:'gaming',at:Date.now()+i,method:'manual-review',titleCount:1,sources:['youtube']})));files[aliasPath]=strToU8(JSON.stringify(extra));await importPack(Buffer.from(zipSync(files)));await navTopics();const saved=panel.locator('[data-saved-aliases]');if(!await saved.evaluate(el=>el.open))await saved.locator('> summary').click();assert.equal(await saved.locator('li').count(),8);await saved.getByRole('button',{name:'Next reviewed aliases',exact:true}).click();assert.equal(await saved.locator('li').count(),2);await saved.getByRole('button',{name:'Previous reviewed aliases',exact:true}).click();
   await saved.locator('> summary').click();await panel.getByRole('button',{name:'Review alias ai',exact:true}).waitFor();await panel.evaluate(el=>el.scrollIntoView({block:'start'}));await page.screenshot({path:output.replace('.json','-'+viewport.name+'.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);checks.push('Review mounts at most eight saved decisions, pages correctly, and fits desktop/mobile without console errors');
  }catch(error){report.error=error.stack;report.body=(await page.locator('body').innerText()).slice(-15000);await page.screenshot({path:output.replace('.json','-'+viewport.name+'-failure.png')}).catch(()=>{});throw error;}
  finally{await page.unrouteAll({behavior:'ignoreErrors'});await context.unrouteAll({behavior:'ignoreErrors'});await context.close();await writeFile(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Isolated synthetic public catalog and storage; no user library or external provider modified.'},null,2));}
 }}finally{await browser.close();}
 console.log(JSON.stringify({ok:true,reports},null,2));
