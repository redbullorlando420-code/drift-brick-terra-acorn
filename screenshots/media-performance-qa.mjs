import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
for (const [name,width,height] of [['desktop',1280,800],['mobile',390,844]]) {
 const context = await browser.newContext({ viewport: {width,height} });
 const page = await context.newPage(); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8080/');
 await page.waitForFunction(() => performance.getEntriesByType('resource').some(entry => new URL(entry.name).pathname==='/src/lib/videos/store.ts'));
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname==='/src/lib/videos/store.ts')?.name;
  if(!url) throw Error('The live store module was not loaded');
  const mod=await import(url); window.perfStore=mod;
  if(!mod.useLibrary.getState().hydrated) await new Promise(resolve=>{const off=mod.useLibrary.subscribe(s=>{if(s.hydrated){off();resolve();}});});
  const poster='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#223c50"/><circle cx="320" cy="180" r="60" fill="#b9d6ea"/></svg>');
  const kinds=['eporner','youtube','twitch'];
  const folders=kinds.map(kind=>({id:kind+':discover',name:kind,kind,adult:kind==='eporner',videoCount:20000}));
  const now=Date.now();
  const videos=kinds.flatMap(kind=>Array.from({length:20000},(_,i)=>({id:kind+'-'+i,folderId:kind+':discover',name:`${kind} science sample ${i}`,path:`sample-${i}`,addedAt:now-i*10000,size:0,extension:'mp4',mime:'video/mp4',poster,duration:i%5?3600:60,remote:{kind,videoId:String(i),watchUrl:`https://example.test/${kind}/${i}`,channelName:`Creator ${i%80}`,live:kind==='twitch'&&i<80,viewers:i%3000,observedAt:now}})));
  const tags=Object.fromEntries(videos.map(v=>[v.id,v.remote.kind==='eporner'?['adult','amateur','pov']:['science']]));
  mod.useLibrary.setState({videos,folders,tags,sourceId:'youtube',follows:[],hydrated:true});
  const s=mod.useLibrary.getState();
  for(const key of ['selectYoutube','selectTwitch','selectLive','selectClassics']) {
   const first=mod[key](s); const start=performance.now();
   for(let i=0;i<100;i++) if(mod[key]({...s,remoteBusy:!!(i%2)})!==first) throw Error(key+' recomputed');
   if(performance.now()-start>50) throw Error(key+' was unexpectedly slow');
  }
 });
 const rows=[];
 for(const source of ['Adults','YouTube','Twitch']) {
  await page.evaluate(()=>window.scrollTo(0,0));
  if(width<500) await page.getByRole('button',{name:'Open menu',exact:true}).click();
  const start=Date.now();
  await page.getByRole('button',{name:new RegExp('^'+source)}).first().click();
  await page.getByText(source==='Adults'?'Adult media view':source==='YouTube'?'YouTube, tuned to you.':'Twitch, live first.',{exact:true}).waitFor();
  const openMs=Date.now()-start;
  if(source==='Adults') await page.getByText('Your mix is ready.',{exact:true}).waitFor({timeout:30000});
  if(source==='Twitch') {
   await page.getByRole('button',{name:'Most viewers',exact:true}).click();
   await page.getByRole('button',{name:'A–Z',exact:true}).click();
   await page.getByRole('button',{name:'Live first',exact:true}).click();
  }
  await page.waitForTimeout(200);
  await page.screenshot({path:`screenshots/media-${source.toLowerCase()}-${name}.png`});
  rows.push({source,openMs,mounted:await page.locator('[data-video-card]').count()});
  if(source==='YouTube') {
   await page.getByRole('button',{name:'Explore recommendations and full catalog',exact:true}).click();
   await page.getByRole('button',{name:'Load creator and topic shelves',exact:true}).click();
   assert.equal(await page.getByRole('heading',{name:/^From Creator /}).count(),16);
  }
 }
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
 await page.waitForTimeout(400);
 // The long Twitch catalog stays reachable while old grid rows release cards.
 for(let i=0;i<5;i++) {
  const next=page.getByRole('button',{name:/^Next page/}).last();
  await next.scrollIntoViewIfNeeded(); await page.waitForTimeout(120); await next.click();
 }
 const next=page.getByRole('button',{name:/^Next page/}).last();
 await next.scrollIntoViewIfNeeded(); await page.waitForTimeout(1600);
 const mountedGrid=await page.locator('[data-poster-row] [data-video-card]').count();
 assert.ok(mountedGrid<80,`Grid retained ${mountedGrid} cards`);
 assert.ok(mountedGrid>0,'Grid did not render at the bottom');
 await page.locator('[data-poster-row]').last().scrollIntoViewIfNeeded();
 await page.waitForTimeout(250);
 await page.screenshot({path:`screenshots/media-grid-${name}.png`});
 const firstRow=page.locator('[data-poster-row]').first();
 await firstRow.focus();
 await page.waitForTimeout(100);
 assert.ok(await firstRow.locator('[data-video-card]').count()>0,'Keyboard navigation did not mount the row');
 const input=page.getByRole('searchbox',{name:'Global media search'});
 await input.fill('science sample 19999');
 await page.waitForFunction(()=>window.perfStore.useLibrary.getState().searchResult?.query==='science sample 19999',{timeout:30000});
 const matches=await page.evaluate(()=>window.perfStore.selectVisible(window.perfStore.useLibrary.getState()).map(v=>v.id));
 assert.deepEqual(matches,['twitch-19999']);
 await input.press('Enter');
 assert.equal(await page.evaluate(()=>window.perfStore.useLibrary.getState().searchResult?.query),'science sample 19999');
 await input.fill('science sample 19998'); await input.fill('science sample 19997');
 await page.waitForFunction(()=>window.perfStore.useLibrary.getState().searchResult?.query==='science sample 19997');
 assert.deepEqual(await page.evaluate(()=>window.perfStore.selectVisible(window.perfStore.useLibrary.getState()).map(v=>v.id)),['twitch-19997']);
 await page.getByRole('button',{name:'Clear search',exact:true}).click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 results.push({name,catalog:60000,rows,mountedGrid,errors});
 await context.close();
}
} finally { await browser.close(); }
writeFileSync('screenshots/media-performance.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
