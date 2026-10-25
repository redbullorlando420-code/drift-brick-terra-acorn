import assert from 'node:assert/strict';
import {fromJSON} from 'seroval';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {checkedUrl,checkedOutputPath} from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??'screenshots/home-session-dev.json',[resolve('screenshots')]);
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
const find=v=>{if(!v||typeof v!=='object')return;if(v.provider==='chaturbate'||v.provider==='myfreecams')return v;for(const x of Object.values(v)){const result=find(x);if(result)return result;}};
try{for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],checks=[],workers=new Set();let frameLoads=0;
 const report={viewport:viewport.name,checks,errors};reports.push(report);page.setDefaultTimeout(45000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))errors.push(m.text());});page.on('worker',worker=>{workers.add(worker);worker.on('close',()=>workers.delete(worker));});
 await page.clock.install({time:new Date()});
 await context.addInitScript(()=>{localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false}));localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.artwork-mode','text');});
 await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
 await context.route('https://fixture.invalid/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/></svg>'}));
 await context.route('https://app.myfreecams.com/**',r=>{frameLoads++;return r.fulfill({contentType:'text/html',body:'<p>Official room lifecycle fixture. No media or authentication.</p>'});});
 await context.route('**/_serverFn/**',async r=>{let data;try{data=find(fromJSON(JSON.parse(r.request().postData()??'{}')));}catch{}const now=await page.evaluate(()=>Date.now()).catch(()=>Date.now());let result=null;
  if(data){const mfc=data.provider==='myfreecams';result={provider:data.provider,offset:data.offset,checkedAt:now,stale:false,nextOffset:null,total:mfc?1:0,videos:mfc?[{id:'myfreecams:public_room',folderId:'myfreecams:discover',name:'MFC lifecycle fixture',path:'',extension:'myfreecams',mime:'video/myfreecams',size:0,addedAt:now,poster:'https://fixture.invalid/poster.svg',remote:{kind:'myfreecams',videoId:'public_room',channelName:'public_room',live:true,observedAt:now,watchUrl:'https://app.myfreecams.com/public_room'}}]:[]};}
  await r.fulfill({contentType:'application/json',body:JSON.stringify({result,context:{}})}).catch(()=>{});
 });
 const navigate=async name=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();const button=page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp('^'+name+'(?:\\s+\\d+)?$')});await button.click();};
 const home=()=>page.getByRole('region',{name:'Quick Home',exact:true});
 const openMfc=async()=>{await navigate('Live');const region=page.getByRole('region',{name:'MyFreeCams live streams',exact:true});await region.locator('[data-video-card-open]').first().click();await page.getByRole('region',{name:'MyFreeCams official player',exact:true}).waitFor();};
 try{
  await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();
  const nav=home().getByRole('navigation',{name:'Home workspaces'});assert.equal(await nav.locator('details').count(),6);assert.equal(await nav.locator('button').count(),29);assert.equal(await home().locator('img,iframe,video,[data-video-card-id]').count(),0);
  await home().locator('summary').filter({hasText:'Create & play'}).focus();await page.keyboard.press('Enter');await nav.getByRole('button',{name:/^Stable Diffusion/}).waitFor();
  await home().locator('summary').filter({hasText:'Manage & connect'}).click();await nav.getByRole('button',{name:/^Settings/}).click();await page.getByRole('heading',{name:'Settings & local export',exact:true}).waitFor();await navigate('Home');
  assert.equal(await home().locator('details').filter({has:page.locator('summary',{hasText:'Create & play'})}).getAttribute('open'),'');
  await page.reload();await page.locator('[data-home-ready="true"]').waitFor();assert(await home().getByRole('button',{name:/^Stable Diffusion/}).isVisible());
  assert.equal(await home().locator('details').filter({has:page.locator('summary',{hasText:'Private areas'})}).getAttribute('open'),null);checks.push('29 Home destinations in six accessible dropdown groups; keyboard expansion, Settings navigation and expansion recovery across navigation/reload; private group closed by default and no media mounts');
  await page.screenshot({path:output.replace('.json','-home-'+viewport.name+'.png'),fullPage:false});
  await page.evaluate(async()=>{
   const channelId='UCabcdefghijklmnopqrstuv',now=Date.now();localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels:[{id:'yt:'+channelId,kind:'youtube',channelId,handle:'fixture',title:'Fixture creator'}],savedAt:now}));
   const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('reelcase');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
   try{await new Promise((resolve,reject)=>{const tx=db.transaction('remote-cache','readwrite'),store=tx.objectStore('remote-cache');store.put({folders:[],checkedAt:now},'meta');for(let i=0;i<40000;i++){const id='f'+String(i).padStart(10,'0');store.put({id:'yt:'+id,folderId:'yt:'+channelId,name:'Fixture archive '+i,path:'youtube/'+id,extension:'yt',mime:'video/youtube',size:0,addedAt:now-i*1000,poster:'https://fixture.invalid/poster.svg',remote:{kind:'youtube',videoId:id,channelId,channelName:'Fixture creator',publishedSource:'provider'}},'video:yt:'+id);}tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}
  });await page.reload();await page.getByText('40,000 indexed',{exact:true}).waitFor();
  const cdp=await context.newCDPSession(page);await cdp.send('HeapProfiler.enable');const heap=async()=>{await page.waitForTimeout(1100);await cdp.send('HeapProfiler.collectGarbage');const data=await cdp.send('Runtime.getHeapUsage');return {usedBytes:data.usedSize,nodes:(await cdp.send('Memory.getDOMCounters')).nodes,workers:workers.size,frames:page.frames().length};};
  // Warm module imports before measuring retained growth. Rapid returns also
  // exercise cleanup of coverage scans that are still preparing a large index.
  for(let i=0;i<4;i++){await navigate('YouTube');await navigate('Home');}
  const samples=[await heap()];for(let i=0;i<20;i++){await navigate('YouTube');await navigate('Home');if(i%5===4)samples.push(await heap());}
  const first=samples[0],last=samples.at(-1);report.memory={catalog:40000,cycles:24,samples,growthBytes:last.usedBytes-first.usedBytes};assert(last.usedBytes-first.usedBytes<24*1024*1024,'retained main-frame heap exceeded 24 MiB growth after warmup');assert(last.nodes-first.nodes<400);assert.equal(last.workers,0);assert.equal(last.frames,1);assert.equal(await home().locator('img,iframe,video,[data-video-card-id]').count(),0);checks.push('24 rapid YouTube/Home cycles with 40,000 persisted entries: collected main-frame heap and DOM growth stay bounded; no workers, frames or media remain on Home');
  await page.clock.fastForward(24*60*60*1000);await page.locator('[data-home-ready="true"]').waitFor();assert.equal(await home().locator('iframe,video').count(),0);checks.push('24-hour virtual idle advance leaves Home responsive with no background media; this is accelerated lifecycle testing, not a physical-day soak');
  await openMfc();const official=page.getByRole('region',{name:'MyFreeCams official player',exact:true});assert.equal(await official.locator('iframe').count(),0);await official.getByRole('button',{name:'Inside Realhub',exact:true}).click();await official.locator('iframe').waitFor();assert((await official.locator('iframe').getAttribute('sandbox')).includes('allow-storage-access-by-user-activation'));
  assert.equal(await official.getByRole('link',{name:'Share & profile'}).getAttribute('href'),'https://share.myfreecams.com/public_room');
  await official.getByRole('button',{name:'Pause embedded page',exact:true}).click();await official.getByRole('button',{name:'Resume embedded page',exact:true}).waitFor();assert.equal(await official.locator('iframe').count(),0);await official.getByRole('button',{name:'Resume embedded page',exact:true}).click();await official.locator('iframe').waitFor();
  await page.evaluate(()=>{window.__fixtureHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__fixtureHidden});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>window.__fixtureHidden?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.fastForward(60001);await page.evaluate(()=>{window.__fixtureHidden=false;document.dispatchEvent(new Event('visibilitychange'));});await official.getByRole('button',{name:'Resume embedded page',exact:true}).waitFor();assert.equal(await official.locator('iframe').count(),0);
  await official.getByRole('button',{name:'Direct website',exact:true}).click();await official.getByRole('link',{name:'Open official room',exact:true}).waitFor();assert.equal(await official.locator('iframe').count(),0);assert.equal(await page.evaluate(()=>localStorage.getItem('reelcase.mfc.view-mode.v1')),'website');
  await official.screenshot({path:output.replace('.json','-mfc-'+viewport.name+'.png')});await page.getByRole('button',{name:'Close preview',exact:true}).click();const before=frameLoads;
  await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await openMfc();await page.getByRole('link',{name:'Open official room',exact:true}).waitFor();assert.equal(frameLoads,before,'remembered direct mode must not briefly create an iframe');assert.equal(await official.locator('iframe').count(),0);
  await official.getByRole('button',{name:'Inside Realhub',exact:true}).click();await official.locator('iframe').waitFor();await page.getByRole('button',{name:'Close preview',exact:true}).click();assert.equal(await page.locator('iframe[title="MyFreeCams official room page"]').count(),0);checks.push('MFC direct Share/profile link, storage-access sandbox token, manual pause/resume, hidden expiry, explicit resume and remembered Direct website mode all work; reload creates no hidden frame in Direct mode');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
 }catch(error){report.error=error.stack;console.log(await page.locator('nav[aria-label="Library navigation"]').ariaSnapshot().catch(()=>''));console.log((await page.locator('body').innerText()).slice(0,2000));await page.screenshot({path:output.replace('.json','-failure-'+viewport.name+'.png')}).catch(()=>{});throw error;}
 finally{await context.unrouteAll({behavior:'ignoreErrors'});await context.close();writeFileSync(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Isolated Chrome desktop/mobile; 40k metadata fixture, controlled provider responses and abstract artwork. Heap samples cover the main frame. MFC cookie acceptance/authentication and actual streaming remain provider/browser controlled. Accelerated idle is not an overnight physical-device soak.'},null,2));}
}}finally{await browser.close();}
console.log(JSON.stringify({ok:true,reports},null,2));
