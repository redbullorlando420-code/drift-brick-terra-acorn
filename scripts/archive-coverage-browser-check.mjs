import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { rolldown } from 'rolldown';
import { fromJSON } from 'seroval';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/');
const output=checkedOutputPath(process.argv[3]??'screenshots/archive-coverage-dev.json',[resolve('screenshots')]);
const entry='\0growth-probe';
const bundle=await rolldown({input:entry,resolve:{alias:{'@':resolve('src')}},plugins:[{name:'growth-probe',resolveId:id=>id===entry?entry:undefined,load:id=>id===entry?'export * from '+JSON.stringify(resolve('src/lib/videos/persist.ts').replaceAll('\\','/'))+';':undefined}]});
const generated=await bundle.generate({format:'esm'});await bundle.close();const code=generated.output.find(row=>row.type==='chunk').code;
const find=(value,p)=>{if(!value||typeof value!=='object')return;if(p(value))return value;for(const child of Object.values(value)){const result=find(child,p);if(result)return result;}};
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
try {
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile}),page=await context.newPage();
  const report={mobile,checks:[],errors:[],requests:[]};reports.push(report);page.setDefaultTimeout(120000);
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))report.errors.push(m.text());});
  await context.route('**/__growth-probe.mjs',r=>r.fulfill({contentType:'text/javascript',body:code}));
  await context.route('**/__growth-blank.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Disposable growth fixture</title><p>Isolated fixture</p>'}));
  await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
  await context.route('**/_serverFn/**',async r=>{
   let input;try{input=fromJSON(JSON.parse(r.request().postData()??'null'));}catch{}
   const data=find(input,v=>Array.isArray(v.providers)&&v.providerPages);
   let result={channels:[],profiles:[]};
   if(data){
    report.requests.push({page:data.page,offset:data.providerOffsets?.eporner,limit:data.maxVideos});assert(data.maxVideos<=400);
    const videos=Array.from({length:10},(_,i)=>({id:'eporner:growth-'+i,folderId:'eporner:discover',name:'QA archived recording '+i,path:'QA',extension:'mp4',mime:'video/mp4',addedAt:1,remote:{kind:'eporner',videoId:'growth-'+i}}));
    result={videos,providerNextPages:{eporner:null},providerNextOffsets:{eporner:0},providerDiagnostics:[{provider:'eporner',status:'loaded',titles:10,detail:'QA public metadata fixture'}]};
   }
   await r.fulfill({contentType:'application/json',body:JSON.stringify({result,context:{}})}).catch(()=>{});
  });
  const nav=async()=>{if(mobile)await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:/^Adults(?:\s+\d+)?$/}).click();await page.getByRole('heading',{name:'Adult discovery',exact:true}).waitFor();};
  const progress=page.locator('details[aria-label="Adult archive progress"]');
  const openCounts=async()=>{await progress.locator(':scope > summary').click();await progress.locator('[aria-label="Adult media counts"][aria-busy="false"]').waitFor();};
  const counts=async()=>progress.locator('[aria-label="Adult media counts"] strong').allTextContents();
  try{
   await page.goto(new URL('/__growth-blank.html',url).href);
   await page.evaluate(async(mobile)=>{
    const p=await import('/__growth-probe.mjs');
    localStorage.setItem('reelcase.pulls-paused.v1','true');
    localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,adultBatchVideos:1200,adultMaxEntries:100000,adultCatalogTarget:100000,remoteMaxEntries:200000,adultIntervalSeconds:120}));
    localStorage.setItem('reelcase.artwork-mode','text');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:true}));
    const videos=Array.from({length:60},(_,i)=>{const kind=i<30?'eporner':i<50?'booru':'chaturbate';return {id:kind+':seed-'+i,folderId:kind+':discover',name:'QA saved source '+i,path:'QA',extension:i<30?'mp4':i<50?'image':'live',mime:i<30?'video/mp4':i<50?'image/jpeg':'video/live',size:0,addedAt:1,remote:{kind,videoId:'seed-'+i,live:i>=50}};});
    p.savePrefs({...p.loadPrefs(),sourceId:'home',tags:{'eporner:seed-0':['my-private-tag']}});
    await p.appendCatalogVideos(videos);
    await p.waitForDurableWrites();
    localStorage.setItem('reelcase.adult-archive-cursors.v1',JSON.stringify({'eporner::all::latest':{page:7,offset:120,paging:2,query:'all',order:'latest',updatedAt:1},'eporner::all::top-rated':{page:1,paging:2,query:'all',order:'top-rated',updatedAt:2,state:'exhausted',retryAt:Date.now()+1800000},'redtube::all::top-weekly':{page:10,paging:2,query:'all',order:'top-weekly',updatedAt:3,state:'failed',retryAt:Date.now()+300000},'eporner::private-query-sentinel::latest':{page:42,paging:2,query:'private-query-sentinel',order:'latest',updatedAt:4}}));
    if(!mobile){const db=await new Promise((yes,no)=>{const r=indexedDB.open('reelcase',8);r.onsuccess=()=>yes(r.result);r.onerror=()=>no(r.error);});try{for(let start=60;start<100000;start+=1000){await new Promise((yes,no)=>{const tx=db.transaction('videos','readwrite'),store=tx.objectStore('videos');for(let i=start;i<Math.min(100000,start+1000);i++){const id='eporner:scale-'+i;store.put({id,folderId:'eporner:discover',name:'QA saved recording '+i,path:id,mime:'video/mp4',extension:'mp4',addedAt:1,remote:{kind:'eporner',videoId:'scale-'+i}});}tx.oncomplete=yes;tx.onerror=tx.onabort=()=>no(tx.error);});}}finally{db.close();}}
   },mobile);
   await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();await nav();await openCounts();
   await page.waitForFunction(()=>document.querySelector('[aria-label="Adult media counts"] strong')?.textContent===(window.innerWidth>1000?'99,970':'30'));
   assert.deepEqual(await counts(),[mobile?'30':'99,970','20','10','0']);assert.equal(report.requests.length,0);
   await progress.getByText('Resume positions saved with accepted catalog windows in this profile.',{exact:true}).waitFor();
   const eporner=progress.locator('[data-archive-lanes="eporner"]');await eporner.locator('summary').click();
   await eporner.locator('[data-archive-lane="eporner:latest"]').getByText(/page 7 \+ 120/).waitFor();
   assert.equal(await eporner.getByRole('button',{name:'Continue Eporner Top rated',exact:true}).isEnabled(),false);
   assert.equal(await eporner.getByRole('button',{name:'Continue Eporner Latest',exact:true}).isEnabled(),true);
   await eporner.locator('[data-archive-lane="eporner:most-popular"]').getByText('Not checked',{exact:true}).waitFor();
   assert((await progress.locator('[data-archive-lane]').count())<=35);
   assert(!(await progress.innerText()).includes('private-query-sentinel'));
   const redtube=progress.locator('[data-archive-lanes="redtube"]');await redtube.locator('summary').click();assert.equal(await redtube.getByRole('button',{name:'Continue RedTube Latest',exact:true}).isEnabled(),false);
   report.checks.push('Independent sort coverage is bounded over the saved catalog, separates unchecked/exhausted/retry states, and respects provider cooldowns');

   report.checks.push(`Saved mixed catalog shows ${mobile?'30':'99,970'} archived videos, 20 photos and 10 room cards without pulling while paused; private query positions stay outside coverage`);
   await progress.getByRole('button',{name:'Use larger archive growth',exact:true}).click();
   await progress.getByText(/Larger archive growth saved/).waitFor();
   const settings=await page.evaluate(()=>JSON.parse(localStorage.getItem('reelcase.pull-settings.v1')));
   assert.equal(settings.adultBatchVideos,10000);assert.equal(settings.adultCatalogTarget,250000);assert.equal(settings.adultMaxEntries,300000);assert(settings.remoteMaxEntries>=450000);assert.equal(settings.automaticPulls,false);
   const expand=page.getByRole('button',{name:'Expand Adult discovery',exact:true});if(await expand.count())await expand.click();
   const discovery=page.locator('section').filter({has:page.getByRole('heading',{name:'Adult discovery',exact:true})}).last();
   await discovery.getByRole('button',{name:'Eporner only',exact:true}).click();
   await progress.getByRole('button',{name:'Continue Eporner Latest',exact:true}).click();
   await page.getByRole('button',{name:'Resume pulls',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('[aria-label="Adult media counts"]')?.textContent.includes(window.innerWidth>1000?'99,980':'40'));
   assert.deepEqual(await counts(),[mobile?'40':'99,980','20','10','0']);assert.equal(report.requests.length,1);assert.equal(report.requests[0].page,7);assert.equal(report.requests[0].offset,120);
   await discovery.getByRole('button',{name:'Continue archive',exact:true}).click();
   await page.waitForFunction(()=>/(?<!\d)0 new entries · 10 received/.test(document.body.innerText));
   assert.deepEqual(await counts(),[mobile?'40':'99,980','20','10','0']);assert.equal(report.requests.length,2);
   report.checks.push('Pull and repeat refresh save 10 new archived videos once, preserve media counts, and keep each response under 400');
   await eporner.screenshot({path:output.replace('.json',mobile?'-mobile.png':'-desktop.png')});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await nav();await openCounts();
   await page.waitForFunction(()=>document.querySelector('[aria-label="Adult media counts"] strong')?.textContent===(window.innerWidth>1000?'99,980':'40'));
   assert.deepEqual(await counts(),[mobile?'40':'99,980','20','10','0']);
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reelcase.pull-settings.v1')).adultBatchVideos),10000);
   const tags=await page.evaluate(async()=>{const p=await import('/__growth-probe.mjs');await p.restoreDurablePrefs();return p.loadPrefs().tags;});assert(tags['eporner:seed-0'].includes('my-private-tag'));
   report.checks.push('Accepted catalog, higher limits and manual tag survive reload on this disposable profile');
   assert.deepEqual(report.errors,[]);
  }catch(error){report.error=error.stack;await page.screenshot({path:output.replace('.json',mobile?'-mobile-failure.png':'-desktop-failure.png')}).catch(()=>{});throw error;}
  finally{await context.unrouteAll({behavior:'ignoreErrors'});await context.close();await writeFile(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Provider metadata is deterministic; real provider availability and rate limits are external.'},null,2));}
 }
}finally{await browser.close();}
