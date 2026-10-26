import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/');
const output=checkedOutputPath(process.argv[3]??resolve('screenshots/milestone-completion-dev.json'),[resolve('screenshots')],'Milestone report');
mkdirSync(dirname(output),{recursive:true});
const results=[];
for(const channel of ['chrome','msedge']) {
 const browser=await chromium.launch({channel,headless:true});
 try { for(const mobile of [false,true]) {
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,acceptDownloads:true});
  const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[],result={browser:channel,mobile,errors};
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  let providerReads=0;
  await context.route('**/_serverFn/**',route=>{providerReads++;return route.fulfill({contentType:'application/json',body:JSON.stringify({result:[],context:{}})});});
  await context.route('http://127.0.0.1:43123/**',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
  await context.addInitScript(()=>{localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.artwork-mode','text');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:true}));});
  const nav=async name=>{if(mobile)await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp('^'+name+'(?:\\s+\\d+)?$')}).click();};
  try {
   await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('[data-home-ready="true"]').waitFor();
   await page.evaluate(async()=>{
    const now=Date.now(),a='UC'+'a'.repeat(22),b='UC'+'b'.repeat(22),c='UC'+'c'.repeat(22);
    const follows=[a,b,c].map((id,i)=>({id:'yt:'+id,channelId:id,kind:'youtube',handle:i<2?'@shared':'@independent',title:['Identity alpha','Identity beta','Independent creator'][i],thumb:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',description:'Saved description',lastCheckedAt:now-(i+1)*86400000,...(i===0?{lastProviderFailure:{kind:'network-offline',at:now,message:'Saved failed attempt',recovery:'Retry later'}}:{})}));
    localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels:follows,savedAt:now}));
    localStorage.setItem('reelcase.mission-plan.revision','24');
    localStorage.setItem('reelcase.mission-plan.v1',JSON.stringify(['youtube-upgrade-06','youtube-upgrade-17','youtube-upgrade-18','twitch-upgrade-19','watch','watch-room-cross-device','sprint-19','recent-provider-soak','speed-01','my-milestone'].map(id=>({id,title:id,detail:id,done:false,status:id==='watch-room-cross-device'?'blocked':'planned'}))));
    const db=await new Promise((yes,no)=>{const r=indexedDB.open('reelcase');r.onsuccess=()=>yes(r.result);r.onerror=()=>no(r.error);});
    try { await new Promise((yes,no)=>{const tx=db.transaction(['remote-cache','thumb-cache','activity'],'readwrite'),remote=tx.objectStore('remote-cache');remote.put({folders:[],checkedAt:now-3600000},'meta');
     for(let i=0;i<1200;i++){const videoId=String(i).padStart(11,'0'),creator=follows[i%2];remote.put({id:'yt:v:'+videoId,folderId:creator.id,name:'Milestone upload '+i,path:'youtube/'+videoId,extension:'yt',mime:'video/youtube',size:0,duration:1200,addedAt:now-i*60000,poster:'https://i.ytimg.com/vi/'+videoId+'/hqdefault.jpg',remote:{kind:'youtube',channelId:creator.channelId,channelName:creator.title,videoId,publishedSource:'provider',watchUrl:'https://www.youtube.com/watch?v='+videoId,embedUrl:'https://www.youtube.com/embed/'+videoId}},'video:yt:v:'+videoId);}
     tx.objectStore('thumb-cache').put({id:'yt:v:00000000000',thumb:new Blob(['image'],{type:'image/png'}),at:now-172800000});
     tx.objectStore('thumb-cache').put({id:'yt:v:00000000001',thumb:'https://image.invalid/reference-only.jpg',at:1});
     tx.objectStore('activity').put({links:[{id:'saved-recovery',title:'Saved recovery video',url:'https://youtu.be/recovery001',savedAt:now-86400000,source:'history'}],savedAt:now},'links');
     tx.oncomplete=yes;tx.onerror=tx.onabort=()=>no(tx.error);
    });}finally{db.close();}
   });
   await page.reload({waitUntil:'domcontentloaded'});await page.getByText(/1,200 indexed/).first().waitFor();await nav('YouTube');
   const audit=page.getByRole('region',{name:'YouTube offline cache audit',exact:true});await audit.getByRole('button',{name:'Inspect offline cache',exact:true}).click();
   const readsBefore=providerReads;await audit.getByRole('button',{name:'Run cache audit',exact:true}).click();
   await audit.getByRole('heading',{name:'Channels with saved videos',exact:true}).locator('..').getByText('2 / 3',{exact:true}).waitFor();
   await audit.getByRole('heading',{name:'Artwork stored on this device',exact:true}).locator('..').getByText('1 image',{exact:true}).waitFor();
   await audit.getByRole('heading',{name:'Saved poster references',exact:true}).locator('..').getByText('1,200',{exact:true}).waitFor();
   await audit.getByRole('heading',{name:'Recoverable YouTube links',exact:true}).locator('..').getByText('1',{exact:true}).waitFor();
   assert.equal(await audit.getByRole('link',{name:'Saved recovery video',exact:true}).getAttribute('href'),'https://youtu.be/recovery001');assert.equal(providerReads,readsBefore);
   await page.evaluate(()=>{window.__auditGetAll=IDBObjectStore.prototype.getAll;IDBObjectStore.prototype.getAll=function(...args){if(this.name==='thumb-cache')throw new Error('Synthetic storage read failure');return window.__auditGetAll.apply(this,args);};});
   await audit.getByRole('button',{name:'Run cache audit again',exact:true}).click();await audit.getByRole('alert').getByText('Synthetic storage read failure',{exact:true}).waitFor();
   await page.evaluate(()=>{IDBObjectStore.prototype.getAll=window.__auditGetAll;delete window.__auditGetAll;});
   await audit.getByRole('button',{name:'Run cache audit again',exact:true}).click();await audit.getByRole('alert').waitFor({state:'detached'});await audit.getByRole('button',{name:'Run cache audit again',exact:true}).waitFor();assert.equal(providerReads,readsBefore);result.auditFailureRecovery=true;
   result.audit=true;result.auditScreenshot=output.replace(/\.json$/,'-'+channel+'-'+(mobile?'mobile':'desktop')+'-audit.png');await audit.scrollIntoViewIfNeeded();await page.screenshot({path:result.auditScreenshot});
   await audit.getByRole('button',{name:'Close cache audit',exact:true}).click();assert.equal(await audit.getByRole('heading',{name:'Channels with saved videos',exact:true}).count(),0);
   await page.getByRole('button',{name:'Expand YouTube creator control',exact:true}).click();await page.getByRole('button',{name:'Review identity choices',exact:true}).click();
   assert.equal(await page.getByLabel('Channel verification filter',{exact:true}).inputValue(),'identity');
   assert.equal(await page.getByRole('button',{name:'Manage Independent creator',exact:true}).count(),0);
   await page.getByRole('button',{name:'Manage Identity alpha',exact:true}).click();
   const review=page.getByLabel('YouTube identity review',{exact:true});await review.getByText(/Also saved: Identity beta/).waitFor();await review.getByRole('button',{name:'Keep saved identities separate',exact:true}).click();
   await review.getByRole('button',{name:'Identity choice saved',exact:true}).waitFor();
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('reelcase.follows.v1')).channels);assert.equal(saved.length,3);assert(saved[0].identityReview||saved.find(r=>r.title==='Identity alpha').identityReview);
   result.identityScreenshot=output.replace(/\.json$/,'-'+channel+'-'+(mobile?'mobile':'desktop')+'-identity.png');await review.scrollIntoViewIfNeeded();await page.screenshot({path:result.identityScreenshot});
   await page.reload({waitUntil:'domcontentloaded'});await page.getByText(/1,200 indexed/).first().waitFor();
   // Last source is restored, but navigate explicitly when the app defaults Home.
   if(!await page.getByRole('button',{name:'Expand YouTube creator control',exact:true}).count())await nav('YouTube');
   await page.getByRole('button',{name:'Expand YouTube creator control',exact:true}).click();await page.getByRole('button',{name:'Manage Identity alpha',exact:true}).click();await page.getByLabel('YouTube identity review',{exact:true}).getByRole('button',{name:'Identity choice saved',exact:true}).waitFor();result.identityPersistence=true;
   await page.getByRole('button',{name:'Collapse YouTube creator control',exact:true}).click();
   const rail=page.getByRole('list',{name:/^Mixed from your creators ·/});await rail.scrollIntoViewIfNeeded();await rail.locator('[data-video-card-open]').first().waitFor();
   if(mobile){
    await rail.evaluate(node=>{node.scrollLeft=0;});await page.waitForTimeout(400);
    const box=await rail.boundingBox(),before=await page.evaluate(()=>scrollY),session=await context.newCDPSession(page),x=Math.min(box.x+box.width-20,365),y=Math.min(box.y+45,760);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let step=1;step<=10;step++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-step*24,y:y+step*.2}]});await page.waitForTimeout(20);}
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);
    assert(await rail.evaluate(node=>node.scrollLeft)>100,'native horizontal swipe advances the rail');assert(Math.abs(await page.evaluate(()=>scrollY)-before)<12,'horizontal swipe does not scroll the page');
    assert.equal(await page.getByRole('button',{name:'Close preview',exact:true}).count(),0,'swiping does not open a video');
    const card=rail.locator('[data-video-card]').filter({has:page.locator('[data-video-card-open]')}).first();
    const touch=card.locator('[data-touch-card-actions]');await touch.scrollIntoViewIfNeeded();assert(await touch.isVisible());
    for(const button of await touch.getByRole('button').all()){const bounds=await button.boundingBox();assert(bounds.width>=44&&bounds.height>=44,'touch actions are at least 44px');}
    const favorite=touch.getByRole('button',{name:'Add to favorites',exact:true});await favorite.click();await touch.getByRole('button',{name:'Remove from favorites',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Close preview',exact:true}).count(),0);
    result.nativeTouchSwipe=true;result.touchTargets=true;
   }
   const first=rail.locator('[data-video-card-open]').first();await first.focus();await page.keyboard.press('ArrowRight');
   await page.waitForTimeout(250);const focused=await page.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),style=getComputedStyle(e);return {card:e.hasAttribute('data-video-card-open'),visible:r.left>=0&&r.right<=innerWidth,outline:style.outlineStyle,width:parseFloat(style.outlineWidth)};});assert(focused.card&&focused.visible&&focused.outline!=='none'&&focused.width>=2,'keyboard focus is visible after rail movement');result.keyboardFocus=true;
   result.railScreenshot=output.replace(/\.json$/,'-'+channel+'-'+(mobile?'mobile':'desktop')+'-rail.png');await page.screenshot({path:result.railScreenshot});
   await nav('Mission plan');await page.getByRole('heading',{name:'Build a private media home that scales.',exact:true}).waitFor();
   const missions=await page.evaluate(()=>({rows:JSON.parse(localStorage.getItem('reelcase.mission-plan.v1')),revision:Number(localStorage.getItem('reelcase.mission-plan.revision'))}));
   for(const id of ['youtube-upgrade-06','youtube-upgrade-17','youtube-upgrade-18','twitch-upgrade-19'])assert.equal(missions.rows.find(row=>row.id===id)?.done,true,'verified milestone '+id+' migrated');
   for(const id of ['watch','watch-room-cross-device','sprint-19','recent-provider-soak','speed-01','my-milestone'])assert.equal(missions.rows.find(row=>row.id===id)?.done,false,'unverified/custom/manual milestone '+id+' preserved');assert.equal(missions.revision,41);
   const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export mission plan',exact:true}).click();const download=await downloadPromise;assert(download.suggestedFilename().endsWith('.csv'));const csv=await (await import('node:fs/promises')).readFile(await download.path(),'utf8');assert(csv.includes('Creator ambiguity review')&&csv.includes('complete')&&csv.includes('my-milestone'));result.missionMigration=true;result.missionExport=true;
   result.overflowPixels=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth));assert.equal(result.overflowPixels,0);assert.deepEqual(errors,[]);result.ok=true;
  }catch(error){result.ok=false;result.error=error.stack;console.error(JSON.stringify({channel,mobile,error:error.message,body:(await page.locator('body').innerText()).slice(-1500)}));await page.screenshot({path:output.replace(/\.json$/,'-'+channel+'-'+mobile+'-failure.png')}).catch(()=>{});}
  results.push(result);await context.unrouteAll({behavior:'ignoreErrors'});await context.close();
 }}finally{await browser.close();}
}
const report={ok:results.every(r=>r.ok),url,fixture:'1,200 saved YouTube cards; conflicting stable identities, local image bytes versus URL references, saved recovery link, revision-24/custom/manual milestone states; isolated Chrome/Edge desktop and touch-phone viewports.',limitation:'Touch input is native browser automation; physical iOS/Android policy is not measured.',results};writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=report.ok?0:1;
