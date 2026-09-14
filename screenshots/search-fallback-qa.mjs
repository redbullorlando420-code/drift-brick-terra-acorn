import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const NativeWorker=Worker;window.Worker=class extends NativeWorker{constructor(url,opts){if(String(url).includes('search.worker'))throw Error('Test worker unavailable');super(url,opts);}};});
 await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(500);
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname==='/src/lib/videos/store.ts')?.name;
  const mod=await import(url);window.perfStore=mod;
  if(!mod.useLibrary.getState().hydrated)await new Promise(resolve=>{const off=mod.useLibrary.subscribe(s=>{if(s.hydrated){off();resolve();}});});
  mod.useLibrary.setState({sourceId:'youtube',folders:[{id:'youtube:test',name:'Test',kind:'youtube',adult:false}],videos:[{id:'qa',name:'Space telescope lecture',folderId:'youtube:test',path:'qa',addedAt:Date.now(),size:0,extension:'mp4',remote:{kind:'youtube',videoId:'qa',watchUrl:'https://example.test/qa'}}],tags:{qa:['science']}});
 });
 const input=page.getByRole('searchbox',{name:'Global media search'});
 await input.fill('science telescope');
 await page.waitForFunction(()=>window.perfStore.useLibrary.getState().searchResult?.query==='science telescope');
 const read=()=>page.evaluate(()=>window.perfStore.selectVisible(window.perfStore.useLibrary.getState()).map(v=>v.id));
 assert.deepEqual(await read(),['qa']);
 await input.press('Enter');assert.deepEqual(await read(),['qa']);
 await page.evaluate(()=>window.perfStore.useLibrary.setState({tags:{qa:['newtag']}}));
 await page.waitForFunction(()=>{const s=window.perfStore.useLibrary.getState();return s.searchResult?.tags===s.tags;});
 await input.fill('newtag');
 await page.waitForFunction(()=>window.perfStore.useLibrary.getState().searchResult?.query==='newtag');
 assert.deepEqual(await read(),['qa']);assert.deepEqual(errors,[]);console.log('Fallback, metadata edits, and repeated Enter pass.');
}finally{await browser.close();}
