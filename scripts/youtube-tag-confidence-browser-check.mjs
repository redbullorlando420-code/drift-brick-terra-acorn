import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fromJSON } from 'seroval';
import { chromium } from 'playwright';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??'screenshots/tag-confidence-ui.json',[resolve('screenshots')]);
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
try { for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]) {
 const context=await browser.newContext({viewport,acceptDownloads:true}),page=await context.newPage(),errors=[],checks=[];
 const report={viewport:viewport.name,checks,errors};reports.push(report);page.setDefaultTimeout(45000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))errors.push(m.text());});
 await context.addInitScript(()=>{
  localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,requestGapMs:250}));
  localStorage.setItem('reelcase.pulls-paused.v1','true');
  localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:true}));
 });
 await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
 await context.route('https://www.youtube.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><p>Synthetic official player</p>'}));
 await context.route('https://i.ytimg.com/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/></svg>'}));

 let mode='normal',holdNext=false,release,held;let requests=0;
 const find=(value)=>{if(!value||typeof value!=='object')return;if(typeof value.id==='string'&&/^[\w-]{11}$/.test(value.id))return value;for(const row of Object.values(value)){const found=find(row);if(found)return found;}};
 await page.route('**/_serverFn/**',async route=>{
  const data=find(fromJSON(JSON.parse(route.request().postData()??'{}')));let result={comments:[],note:'Synthetic offline comments'};
  if(data){requests++;if(holdNext){holdNext=false;held?.();await new Promise(resolve=>release=resolve);}result={id:mode==='wrong'?'abcdefghijk':data.id,description:'#Travel\nPottery pottery pottery.\nSponsored by a music anime brand #anime\n00:00 Model review',keywords:['Python','Travel','Astronomy','Art','Cooking','Design','Fitness','Hiking','Quantum circuits','Ceramics'],duration:1200};}
  await route.fulfill({contentType:'application/json',body:JSON.stringify({result,context:{}})}).catch(()=>{});
 });

 const nav=async(name)=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp('^'+name+'(?:\\s+\\d+)?$')}).click();};


 const panel=page.locator('[data-tag-confidence]'),id='yt:reject00001';
 const open=async()=>{await nav('YouTube');await page.getByRole('heading',{name:'More of what you watch.',exact:true}).waitFor();const explore=page.getByRole('button',{name:'Explore recommendations and full catalog',exact:true});if(await explore.isVisible())await explore.click();const card=page.locator('[data-video-card]').filter({has:page.getByRole('heading',{name:'Python workshop',exact:true})}).first();await card.scrollIntoViewIfNeeded();await card.locator('[data-video-card-open]').click();await panel.waitFor();};
 const show=async()=>{if(!await panel.evaluate(el=>el.open))await panel.locator('> summary').click();};
 const close=()=>page.getByRole('button',{name:'Close preview',exact:true}).click();
 const journal=()=>page.evaluate(id=>({tags:JSON.parse(localStorage.getItem('reelcase.tag-edits.v1')??'{}')[id],provenance:JSON.parse(localStorage.getItem('reelcase.tag-provenance-edits.v1')??'{}')[id]}),id);
 const pull=()=>page.getByRole('button',{name:'Pull video tags & description',exact:true}).click();
 const checkedAt=()=>page.evaluate(async id=>{const db=await new Promise((res,rej)=>{const r=indexedDB.open('reelcase');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});try{return await new Promise((res,rej)=>{const r=db.transaction('remote-cache').objectStore('remote-cache').get('video:'+id);r.onsuccess=()=>res(r.result?.remote?.youtubeTagsCheckedAt);r.onerror=()=>rej(r.error);});}finally{db.close();}},id);
 const locateTag=async(tag)=>{for(let i=0;i<5;i++){const box=panel.getByRole('checkbox',{name:'Select suggested tag '+tag,exact:true});if(await box.count())return box;const next=panel.getByRole('button',{name:'Next tag suggestions',exact:true});if(!await next.isEnabled())break;await next.click();}throw Error('Missing suggestion '+tag);};
 try{
  await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();
  await page.evaluate(async()=>{
   const now=Date.now(),channelId='UC'+'0'.repeat(22),folderId='yt:'+channelId;
   const rows=Array.from({length:12},(_,i)=>{const videoId='reject'+String(i+1).padStart(5,'0');return {id:'yt:'+videoId,name:(i===0?'Python workshop':'Confidence fixture '+(i+1)),folderId,path:'youtube/fixture',extension:'yt',mime:'video/youtube',size:0,duration:1200,addedAt:now-i*86400000,remote:{kind:'youtube',videoId,channelId,channelName:'Choices creator',watchUrl:'https://www.youtube.com/watch?v='+videoId,embedUrl:'https://www.youtube.com/embed/'+videoId,publishedSource:'provider',publishedPrecision:'instant',youtubeType:'upload'}};});
   localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels:[{id:folderId,kind:'youtube',handle:'https://www.youtube.com/channel/'+channelId,title:'Choices creator',channelId}],savedAt:now}));
   const prefs=JSON.parse(localStorage.getItem('reelcase.prefs.v4')??'{}');prefs.tags=Object.fromEntries(rows.map(row=>[row.id,['keep-manual']]));prefs.metadataProvenance={'yt:reject00001':{tags:{'keep-manual':'manual'},lockedFields:['category']}};prefs.hiddenVideos={};prefs.unavailable={};localStorage.setItem('reelcase.prefs.v4',JSON.stringify(prefs));
   localStorage.setItem('reelcase.media-feedback.v1',JSON.stringify({ratings:{'yt:reject00001':4},watchTime:{'yt:reject00002':{preview:300,fullscreen:0}},creatorFavorites:{},tagLikes:{},recommendationRejections:{version:1,updatedAt:0,entries:[]}}));
   const db=await new Promise((res,rej)=>{const request=indexedDB.open('reelcase');request.onsuccess=()=>res(request.result);request.onerror=()=>rej(request.error);});
   try {await new Promise((res,rej)=>{const tx=db.transaction('remote-cache','readwrite'),store=tx.objectStore('remote-cache');store.put({folders:[],checkedAt:now},'meta');for(const row of rows)store.put(row,'video:'+row.id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}finally{db.close();}
  });
  await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await open();await show();
  await pull();await page.getByRole('button',{name:'Pull video tags & description',exact:true}).waitFor();await panel.getByRole('button',{name:'Export tag evidence',exact:true}).waitFor();
  assert.equal(await panel.getByRole('list',{name:'Recommended YouTube tags',exact:true}).locator(':scope > li').count(),8);
  const travel=await locateTag('travel'),travelRow=travel.locator('..').locator('..');await travelRow.getByText('medium confidence · 55/100',{exact:true}).waitFor();await travelRow.getByText('Review only',{exact:true}).waitFor();await travelRow.getByRole('button',{name:'Evidence for travel',exact:true}).click();await travelRow.getByText('Travel',{exact:true}).waitFor();
  assert.equal(await panel.getByRole('checkbox',{name:'Select suggested tag anime',exact:true}).count(),0);await travelRow.scrollIntoViewIfNeeded();await page.screenshot({path:output.replace('.json','-'+viewport.name+'-evidence.png')});
  const waitDownload=page.waitForEvent('download');await panel.getByRole('button',{name:'Export tag evidence',exact:true}).click();const exported=JSON.parse(await readFile(await(await waitDownload).path(),'utf8'));assert.equal(exported.videoId,'reject00001');assert.equal(exported.suggestions.find(row=>row.tag==='travel').score,55);assert(!exported.suggestions.some(row=>row.tag==='anime'));assert(exported.suggestions.some(row=>row.score>=80));assert(exported.suggestions.some(row=>row.score<50));
  checks.push('Actual metadata pull prepares high/medium/low scores and source excerpts; promotion is excluded and JSON export reflects bounded evidence');
  await travel.check();await panel.getByRole('button',{name:/^Accept selected tags/}).click();await panel.getByRole('status').filter({hasText:'reviewed tag accepted'}).waitFor();let saved=await journal();assert(saved.tags.includes('travel'));assert(saved.tags.includes('keep-manual'));assert.equal(saved.provenance.tags.travel,'youtube-review');assert.equal(saved.provenance.youtubeReviews.travel.score,55);assert.deepEqual(saved.provenance.lockedFields,['category']);
  await close();await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await open();await show();const reloaded=await locateTag('travel');await reloaded.locator('..').locator('..').getByText('Accepted by you',{exact:true}).waitFor();assert.equal(await reloaded.isEnabled(),false);await panel.locator('[data-accepted-tag-evidence] > summary').click();assert.equal((await journal()).provenance.youtubeReviews.travel.score,55);checks.push('Weak suggestion requires explicit selection; acceptance preserves manual tags/category locks and exact provenance survives durable reload');
  const before=await checkedAt();mode='wrong';await pull();await page.getByRole('alert').filter({hasText:/no longer|removed/}).waitFor();assert.equal(await checkedAt(),before);mode='normal';checks.push('Mismatched provider identity shows an error without replacing saved metadata or accepted tags');
  const gate=new Promise(resolve=>held=resolve);holdNext=true;await pull();await gate;await page.getByRole('button',{name:'Stop tag pull',exact:true}).click();release();await page.getByRole('status').filter({hasText:'Stopped. Completed saves were kept.'}).waitFor();assert.equal(await checkedAt(),before);checks.push('Stop ignores an in-flight response and requests no remaining videos');
  const gate2=new Promise(resolve=>held=resolve);holdNext=true;await pull();await gate2;await page.getByRole('button',{name:'Edit tags',exact:true}).click();await page.getByRole('textbox',{name:'IPTC/XMP-style keywords'}).fill('late-manual');await page.getByRole('button',{name:'Save metadata',exact:true}).click();release();await page.getByRole('button',{name:'Pull video tags & description',exact:true}).waitFor();await panel.getByText(/Your tag field is locked/).waitFor();saved=await journal();assert.deepEqual(saved.tags,['late-manual']);assert.deepEqual(saved.provenance.lockedFields.sort(),['category','tags']);assert.equal(saved.provenance.tags['late-manual'],'manual');assert.equal(await panel.getByRole('button',{name:/^Accept selected tags/}).isEnabled(),false);
  checks.push('Editing and locking tags while provider metadata is delayed preserves the manual value and disables acceptance');
  await panel.locator('> summary').scrollIntoViewIfNeeded();await page.screenshot({path:output.replace('.json','-'+viewport.name+'.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);checks.push('Bounded eight-row review fits desktop/mobile, with clean console and no horizontal overflow');assert.equal(requests,4,'no automatic metadata polling on reload/review/export');report.metadataRequests=requests;
 }catch(error){report.error=error.stack;report.body=(await page.locator('body').innerText()).slice(-16000);await page.screenshot({path:output.replace('.json','-'+viewport.name+'-failure.png')}).catch(()=>{});throw error;}
 finally{release?.();await page.unrouteAll({behavior:'ignoreErrors'});await context.unrouteAll({behavior:'ignoreErrors'});await context.close();await writeFile(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Isolated synthetic public catalog and controlled provider metadata; no real user library or provider modified.'},null,2));}
 }}finally{await browser.close();}
 console.log(JSON.stringify({ok:true,reports},null,2));
