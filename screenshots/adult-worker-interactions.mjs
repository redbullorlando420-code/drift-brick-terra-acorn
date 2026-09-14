import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const results = [];
for (const [name, width, height] of [['desktop',1280,800],['mobile',390,844]]) {
 const context = await browser.newContext({ viewport: { width, height } });
 const page = await context.newPage();
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.addInitScript(({blocked}) => {
  window.__blockAdultWorker=blocked;
  const NativeWorker=window.Worker;
  window.Worker=class extends NativeWorker {
   constructor(url,options){if(String(url).includes('adult-browse') && window.__blockAdultWorker) throw Error('Test worker unavailable');super(url,options);}
  };
 }, {blocked:width===390});
 await page.goto('http://127.0.0.1:8080/');
 await page.waitForTimeout(500);
 const benchmark = await page.evaluate(async () => {
  const storeUrl=performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname==='/src/lib/videos/store.ts')?.name;
  if(!storeUrl) throw Error('App store was not loaded');
  const mod = await import(storeUrl);
  if(!mod.useLibrary.getState().hydrated) await new Promise(resolve=>{const off=mod.useLibrary.subscribe(s=>{if(s.hydrated){off();resolve();}});});
  window.perfStore = mod;
  const folders = ['eporner','reddit','booru'].map(kind => ({ id:`${kind}:discover`, name:kind, kind, adult:true, videoCount:0 }));
  const poster = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#223c50"/><circle cx="320" cy="180" r="60" fill="#b9d6ea"/></svg>');
  const videos = Array.from({length:20000}, (_,i) => {const kind=folders[i%3].kind;return {id:`perf-${i}`,folderId:`${kind}:discover`,name:`Performance sample ${i}`,addedAt:Date.now()-i*10000,size:0,path:`sample-${i}`,extension:kind==='booru'?'jpg':'mp4',mime:kind==='booru'?'image/jpeg':'video/mp4',poster,remote:{kind,videoId:String(i),watchUrl:`https://example.test/${kind}/${i}`,channelName:`Creator ${i%80}`}};});
  const tags = Object.fromEntries(videos.map((v,i)=>[v.id,['adult','amateur',i%2?'pov':'solo female',`source-${v.remote.kind}`]]));
  mod.useLibrary.setState({videos,folders,tags,sourceId:'home',hydrated:true});
  const state=mod.useLibrary.getState();
  const historyState = {...state, history:[{id:videos[0].id,at:Date.now()}]};
  if(mod.selectHistory(historyState,false).length) throw Error('Adult history leaked');
  if(mod.selectHistory(historyState,true)[0]?.id!==videos[0].id) throw Error('Adult history lookup lost its scope');
  const favoritesState={...state,favorites:{[videos[0].id]:true}};
  if(mod.selectFavorites(favoritesState,true).length!==1) throw Error('Favorite cache did not invalidate');
  const start=performance.now(); const first=mod.selectAdultRemote({...state,videos:[...state.videos]}); const coldMs=performance.now()-start;
  const warm=mod.selectAdultRemote(state);
  const cachedStart=performance.now();
  for(let i=0;i<100;i++) if(mod.selectAdultRemote({...state,remoteBusy:Boolean(i%2)})!==warm) throw Error('catalog cache missed');
  const cached100Ms=performance.now()-cachedStart;
  const publicHistory=mod.selectHistory(state,false); const adultHistory=mod.selectHistory(state,true);
  if(publicHistory.some(v=>v.folderId==='eporner:discover')) throw Error('Adult history leaked');
  return {titles:first.length,coldMs,cached100Ms};
 });
 if(width<500) await page.getByRole('button',{name:'Open menu',exact:true}).click();
 const start=Date.now();
 await page.getByRole('button',{name:/^Adults/}).click();
 await page.getByText('Adult media view',{exact:true}).waitFor();
 const openMs=Date.now()-start;
 if(width===390){
  await page.getByText('Recommendations are unavailable. You can still browse your catalog.',{exact:true}).waitFor();
  await page.getByRole('button',{name:/^Photos ·/}).click();
  await page.getByRole('button',{name:'Combined · 20000',exact:true}).waitFor();
  await page.evaluate(()=>{window.__blockAdultWorker=false;});
  await page.getByRole('button',{name:'Retry recommendations',exact:true}).click();
 }

 await page.getByText('Your mix is ready.',{exact:true}).waitFor({timeout:20000});
 await page.getByRole('button',{name:'Combined · 20000',exact:true}).waitFor();
 for(let i=0;i<6;i++) {
  await page.getByRole('button',{name:i%2?/^Videos ·/:/^Photos ·/}).click();
 }
 await page.getByRole('button',{name:/^Photos ·/}).click();
 await page.getByText('Your mix is ready.',{exact:true}).waitFor({timeout:20000});
 const titles=await page.locator('main h3').allTextContents();
 const sampleIds=titles.map(text=>text.match(/Performance sample (\d+)/)?.[1]).filter(Boolean).map(Number);
 if(!sampleIds.length || sampleIds.some(id=>id%3!==2)) throw Error('Stale type results after rapid filter changes: '+JSON.stringify(sampleIds));
 await page.getByRole('button',{name:/^Combined ·/}).waitFor();
 await page.getByRole('button',{name:/^Combined ·/}).click();
 await page.getByRole('button',{name:'Refresh mix',exact:true}).click();
 await page.getByText('Your mix is ready.',{exact:true}).waitFor({timeout:20000});
 await page.getByRole('button',{name:'Load milestones and private shelves',exact:true}).click();
 await page.getByText('Your mix is ready.',{exact:true}).waitFor({timeout:20000});
 await page.getByText('Adult media view',{exact:true}).scrollIntoViewIfNeeded();
 await page.waitForTimeout(300);
 await page.screenshot({path:`screenshots/adult-worker-interactions-${name}.png`});
 const diagnostics=await page.evaluate(async()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll("main *")].filter(e=>e.getBoundingClientRect().right>innerWidth+2 && getComputedStyle(e).position!=="absolute").slice(0,12).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right})),overflow:document.documentElement.scrollWidth>innerWidth,render:(await import('/src/lib/render-budget.ts')).getRenderBudgetSnapshot()}));
 console.log(JSON.stringify({name,benchmark,openMs,errors,diagnostics}));
 if(errors.length || diagnostics.overflow) throw Error(JSON.stringify({errors,diagnostics}));
 results.push({name,...benchmark,openMs,...diagnostics,errors});
 await context.close();
}
await browser.close();
writeFileSync('screenshots/adult-worker-interactions.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));