import { chromium } from 'playwright';
import { fromJSON } from 'seroval';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/');
const output=checkedOutputPath(process.argv[3]??'screenshots/youtube-cleanup-dev.json',[resolve('screenshots')]);
mkdirSync(dirname(output),{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'chrome'}:{})});
const results=[];
const channel={id:'yt:cleanup-fixture',kind:'youtube',handle:'@cleanup-fixture',title:'Cleanup fixture',channelId:'UC'+'A'.repeat(22),catalogCursor:'before',thumb:'https://fixture.invalid/avatar.svg',description:'Fixture'};
try {for(const viewport of [{name:'desktop',width:1280,height:800},{name:'mobile',width:390,height:844}]) {
  const context=await browser.newContext({viewport});
  const errors=[];let response=null, failure=false, requests=0, twitchResponse=null, adultResponse=null, twitchHold=null, twitchDelivered=false;
  await context.addInitScript(()=>{
    localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.artwork-mode','text');
    if(!localStorage.getItem('reelcase.pull-settings.v1')) localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,youtubeAutoCleanup:true,youtubeMaxEntries:80,remoteMaxEntries:80,youtubeCleanupBatch:3,youtubeCleanupMinAgeDays:30,requestGapMs:250}));
    const put=IDBObjectStore.prototype.put;
    const get=IDBObjectStore.prototype.get;
    IDBObjectStore.prototype.get=function(key) {
      if(window.__failCleanupRatingRead && this.name==='activity' && key==='feedback') {window.__failCleanupRatingRead=false;throw new DOMException('Synthetic rating read failure','UnknownError');}
      if(window.__failCleanupShelfRead && this.name==='activity' && key==='shelves') {window.__failCleanupShelfRead=false;throw new DOMException('Synthetic shelf read failure','UnknownError');}
      return get.call(this,key);
    };
    IDBObjectStore.prototype.put=function(value,key) {
      const result=put.call(this,value,key);
      if(window.__failYoutubeCleanup && this.name==='remote-cache' && key==='youtube-cleanup') {window.__failYoutubeCleanup=false;this.transaction.abort();}
      return result;
    };
  });
  await context.route('http://127.0.0.1:43123/**',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
  await context.route('https://fixture.invalid/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'}));
  await context.route('**/*',async route=>{
    const request=route.request();
    if(request.headers()['x-tsr-serverfn']!=='true') return route.fallback();
    let data;try {data=fromJSON(JSON.parse(request.postData()??'null')).data;}catch{data=null;}
    let payload=[];
    if(data?.channels) {
      if(data.youtubeCatalog && !data.youtubeLiveOnly) {requests++;if(failure) return route.fulfill({contentType:'application/json',body:JSON.stringify({error:'Synthetic provider failure',context:{}})});payload=response;}
      else if(twitchResponse && data.channels.some(row=>row.kind==='twitch') && !data.twitchLiveOnly) {requests++;console.log(`${viewport.name}: Twitch RPC returned ${twitchResponse.videos.length} entries`);if(twitchHold)await twitchHold;payload=twitchResponse;}
      else payload={channels:data.channels,videos:[],refreshedIds:[],liveCheckedIds:[],retryAt:{}};
    }
    if(adultResponse && data?.providers && data?.query !== undefined) {requests++;payload=adultResponse;}
    await route.fulfill({contentType:'application/json',body:JSON.stringify({result:payload,context:{}})});
    if(payload===twitchResponse)twitchDelivered=true;
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const result={viewport:viewport.name,errors};
  try {
    console.log(`${viewport.name}: seed protected cache entries`);
    await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('[data-home-ready="true"]').waitFor();
    const seed=await page.evaluate(async channel=>{
      const now=Date.now(),day=86400000;
      const rows=Array.from({length:80},(_,i)=>({id:`yt:cleanup-${i}`,folderId:channel.id,name:`Cleanup video ${i}`,path:`cleanup/${i}`,extension:'yt',mime:'video/youtube',size:0,duration:400,addedAt:i===6?0:i===7?now-day:now-(500-i)*day,remote:{kind:'youtube',videoId:`cleanup-${String(i).padStart(3,'0')}`,channelId:channel.channelId,channelName:channel.title,publishedSource:i===6?'unknown':'provider',youtubeType:i===5?'upcoming':'upload',...(i===4?{live:true,observedAt:now}:{})}}));
      localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels:[channel],savedAt:now}));
      localStorage.setItem('reelcase.media-feedback.v1',JSON.stringify({ratings:{'yt:cleanup-3':3},notes:{'yt:cleanup-8':'Keep my note'}}));
      const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('reelcase');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
      try {await new Promise((resolve,reject)=>{
        const tx=db.transaction(['remote-cache','activity'],'readwrite'),remote=tx.objectStore('remote-cache'),activity=tx.objectStore('activity');
        remote.put({folders:[{id:channel.id,name:channel.title,kind:'youtube',videoCount:80}],checkedAt:now},'meta');
        for(const row of rows) {remote.put(row,`video:${row.id}`);activity.put({id:row.id,tags:['science'],provenance:{tags:{science:row.id==='yt:cleanup-9'?'manual':'provider:youtube'},updatedAt:now,youtubeTextTagVersion:1}},`metadata-enrichment:${row.id}`);}
        activity.put({favorites:['yt:cleanup-1'],likes:['yt:cleanup-0'],savedAt:now},'shelves');
        activity.put({ratings:{'yt:cleanup-2':5},savedAt:now},'feedback');
        activity.put({history:[{id:'yt:cleanup-10',title:'Cleanup video 10',url:'https://www.youtube.com/watch?v=cleanup-010',at:now,source:'open'}],progress:{'yt:cleanup-10':{t:10,d:400,at:now}},resumeProgress:{},viewCounts:{'yt:cleanup-10':1},savedAt:now},'primary');
        tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error);
      });}finally{db.close();}return rows;
    },channel);
    const reload=async()=>{await page.reload({waitUntil:'domcontentloaded'});await page.locator('[data-home-ready="true"]').waitFor();};
    const navigate=async name=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();if(name==='Settings'){const tools=page.getByRole('button',{name:'Tools',exact:true});if(await tools.getAttribute('aria-expanded')==='false')await tools.click();}await page.getByRole('button',{name:new RegExp(`^${name}(?:$|\\s)`)}).first().click();};
    const disk=()=>page.evaluate(async()=>{
      const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('reelcase');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
      try{return await new Promise((resolve,reject)=>{
        const tx=db.transaction(['remote-cache','activity'],'readonly'),store=tx.objectStore('remote-cache'),keys=store.getAllKeys(),journal=store.get('youtube-cleanup'),history=tx.objectStore('activity').get('primary'),saves=tx.objectStore('activity').get('shelves'),metadata=tx.objectStore('activity').getAllKeys();
        tx.oncomplete=()=>resolve({ids:keys.result.filter(key=>String(key).startsWith('video:')).map(key=>String(key).slice(6)),journal:journal.result,history:history.result,saves:saves.result,metadata:metadata.result});tx.onerror=()=>reject(tx.error);
      });}finally{db.close();}
    });
    const checkProtected=snapshot=>{for(let i=0;i<10;i++)if(!snapshot.ids.includes(`yt:cleanup-${i}`))throw Error(`Protected entry ${i} was removed`);if(snapshot.history.history[0]?.id!=='yt:cleanup-10'||snapshot.history.progress['yt:cleanup-10']?.t!==10)throw Error('Cleanup lost playback history');};
    await reload();await navigate('Settings');
    const cleanup=page.locator('[data-youtube-cleanup]'),button=()=>cleanup.getByRole('button',{name:'Free up to 3 YouTube slots now',exact:true});
    await button().waitFor();await page.evaluate(()=>{window.__failCleanupRatingRead=true;});
    await button().click();await cleanup.getByRole('alert').filter({hasText:/Saved ratings could not be verified/}).waitFor();
    if((await disk()).ids.length!==80)throw Error('Cleanup removed entries without checking saved ratings');
    result.ratingReadProtectionVerified=true;
    await page.evaluate(()=>{window.__failCleanupShelfRead=true;});
    await button().click();await cleanup.getByRole('alert').filter({hasText:/Saved likes and favorites could not be verified/}).waitFor();
    if((await disk()).ids.length!==80)throw Error('Cleanup removed entries without checking saved likes');
    result.shelfReadProtectionVerified=true;
    await page.evaluate(()=>{window.__failYoutubeCleanup=true;});
    await button().click();await cleanup.getByRole('alert').waitFor();
    let snapshot=await disk();if(snapshot.ids.length!==80||snapshot.journal?.removedCount)throw Error('Failed cleanup partially removed persisted rows');checkProtected(snapshot);
    console.log(`${viewport.name}: successful manual cleanup and reload`);
    await button().click();await cleanup.getByText(/^3 old, low-rated YouTube entries removed/).waitFor();
    snapshot=await disk();if(snapshot.ids.length!==77||snapshot.journal.removedCount!==3)throw Error('Manual cleanup did not free three slots');checkProtected(snapshot);
    for(let i=10;i<13;i++)if(snapshot.ids.includes(`yt:cleanup-${i}`)||snapshot.metadata.includes(`metadata-enrichment:yt:cleanup-${i}`))throw Error('Cleanup left retired metadata on disk');
    result.screenshot=output.replace(/\.json$/,`-${viewport.name}.png`);await cleanup.scrollIntoViewIfNeeded();await page.screenshot({path:result.screenshot});
    await reload();await navigate('Settings');await cleanup.getByText(/3 entries removed · last cleanup/).waitFor();
    // Bring storage back to the cap with three new cards, using actual UI pulls.
    response={channels:[{...channel,catalogCursor:'filled'}],videos:seed.slice(10,13).map((row,i)=>({...row,id:`yt:new-cleanup-${i}`,remote:{...row.remote,videoId:`new-cleanup-${i}`}})),refreshedIds:[channel.id],retryAt:{}};
    const pull=async()=>{
      await navigate('YouTube');const resume=page.getByRole('button',{name:'Resume pulls',exact:true});if(await resume.count())await resume.click();
      await page.getByRole('button',{name:'Pull next creator batch',exact:true}).click();
      await page.getByRole('button',{name:'Pull next creator batch',exact:true}).waitFor();
      await page.waitForFunction(()=>{try{const saved=JSON.parse(localStorage.getItem('reelcase.follows.v1')??'{}');return !!saved.channels?.length;}catch{return false;}});
    };
    await pull();snapshot=await disk();if(snapshot.ids.length!==80||snapshot.journal.removedCount!==3)throw Error('Free slots did not accept new YouTube entries');
    console.log(`${viewport.name}: automatic rotation, suppression and failures`);
    response={...response,channels:[{...channel,catalogCursor:'rotated'}],videos:seed.slice(13,18).map((row,i)=>({...row,id:`yt:rotation-${i}`,remote:{...row.remote,videoId:`rotation-${i}`}}))};
    await pull();snapshot=await disk();if(snapshot.ids.length!==80||snapshot.journal.removedCount!==6)throw Error('Automatic pull failed to replace exactly its three-entry budget');checkProtected(snapshot);
    const savedFollows=await page.evaluate(()=>JSON.parse(localStorage.getItem('reelcase.follows.v1')));
    if(savedFollows.channels[0].catalogCursor!=='filled')throw Error('Partially accepted page lost its prior cursor');
    response={...response,channels:[{...channel,catalogCursor:'suppressed'}],videos:seed.slice(10,13)};
    await pull();let after=await disk();if(after.journal.removedCount!==6||after.ids.length!==80)throw Error('Retired-only pull removed more rows or reimported them');
    failure=true;await pull();failure=false;after=await disk();if(after.journal.removedCount!==6||after.ids.length!==80)throw Error('Failed pull removed cached rows');
    // A leftover legacy snapshot must not resurrect retired entries on reload.
    await page.evaluate(async({seed,channel})=>{
      const db=await new Promise(resolve=>{const req=indexedDB.open('reelcase');req.onsuccess=()=>resolve(req.result);});
      try{await new Promise((resolve,reject)=>{const tx=db.transaction('remote-cache','readwrite');tx.objectStore('remote-cache').put({videos:seed.slice(10,13),folders:[{id:channel.id,name:channel.title,kind:'youtube'}],checkedAt:Date.now()},'snapshot');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}
    },{seed,channel});
    await reload();await navigate('Settings');await cleanup.getByText(/6 entries removed · last cleanup/).waitFor();
    await navigate('History');await page.getByText('Cleanup video 10',{exact:true}).first().waitFor();await navigate('Settings');
    after=await disk();checkProtected(after);if(after.ids.length!==80||after.ids.includes('yt:cleanup-10'))throw Error('Reload resurrected retired legacy entries');
    const automatic=cleanup.getByLabel('Automatically make room for new YouTube pulls',{exact:true});
    await automatic.uncheck();await automatic.check();
    const batch=cleanup.getByLabel('Maximum entries replaced per pull',{exact:true});await batch.fill('1000');await batch.press('Enter');
    const largeButton=cleanup.getByRole('button',{name:'Free up to 1,000 YouTube slots now',exact:true});await largeButton.waitFor();
    const inside=await largeButton.evaluate(button=>{const bounds=button.closest('[data-youtube-cleanup]').getBoundingClientRect(),rect=button.getBoundingClientRect();return rect.left>=bounds.left&&rect.right<=bounds.right;});
    if(!inside)throw Error('Large cleanup button extends beyond its settings panel');
    await cleanup.scrollIntoViewIfNeeded();await page.screenshot({path:result.screenshot});
    await navigate('YouTube');await page.getByRole('button',{name:'Manage YouTube cleanup',exact:true}).click();await largeButton.waitFor();
    result.settingsAndEntryPointVerified=true;
    if(process.argv.includes('--remote-replacement')) {
      console.log(`${viewport.name}: Twitch and Adult storage, controls, rollback and replacement`);
      const extra=await page.evaluate(async channel=>{
        const now=Date.now(),day=86400000,tw={id:'tw:rotation-fixture',kind:'twitch',handle:'rotationfixture',title:'Rotation fixture',twitchArchiveCursor:'before',twitchClipCursor:'clip-before'};
        const rows=kind=>Array.from({length:10},(_,i)=>({id:`${kind}:cross-cleanup-${i}`,folderId:kind==='twitch'?tw.id:'eporner:discover',name:`${kind} cleanup ${i}`,path:`${kind}/${i}`,extension:kind==='twitch'?'vod':'mp4',mime:'video/mp4',size:0,duration:400,addedAt:i===4?0:now-(500-i)*day,remote:{kind,videoId:`${kind}-${i}`,channelId:kind==='twitch'?'rotationfixture':undefined,channelName:'Rotation fixture',...(i===3?{live:true,observedAt:now}:{})}}));
        const twitch=rows('twitch'),adult=rows('eporner');
        localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels:[channel,tw],savedAt:now}));
        const policy=JSON.parse(localStorage.getItem('reelcase.pull-settings.v1'));localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({...policy,remoteMaxEntries:100,twitchMaxEntries:10,adultMaxEntries:10,twitchAutoCleanup:true,adultAutoCleanup:true,twitchCleanupBatch:2,adultCleanupBatch:2}));
        localStorage.setItem('reelcase.media-feedback.v1',JSON.stringify({ratings:{'yt:cleanup-3':3,'twitch:cross-cleanup-2':5,'eporner:cross-cleanup-2':5},notes:{'yt:cleanup-8':'Keep my note'}}));
        const db=await new Promise(resolve=>{const req=indexedDB.open('reelcase');req.onsuccess=()=>resolve(req.result);});
        try{await new Promise((resolve,reject)=>{const tx=db.transaction(['remote-cache','videos','activity'],'readwrite'),remote=tx.objectStore('remote-cache'),activity=tx.objectStore('activity');
          for(const row of twitch)remote.put(row,`video:${row.id}`);for(const row of adult)tx.objectStore('videos').put(row);
          remote.put({folders:[{id:channel.id,name:channel.title,kind:'youtube',videoCount:80},{id:tw.id,name:tw.title,kind:'twitch',videoCount:10},{id:'eporner:discover',name:'Eporner',kind:'eporner',videoCount:10,adult:true}],checkedAt:now},'meta');
          activity.put({favorites:['yt:cleanup-1',twitch[1].id,adult[1].id],likes:['yt:cleanup-0',twitch[0].id,adult[0].id],savedAt:now},'shelves');
          activity.put({ratings:{'yt:cleanup-2':5,[twitch[2].id]:5,[adult[2].id]:5},savedAt:now},'feedback');
          tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error);});}finally{db.close();}return {tw,twitch,adult};
      },channel);
      const crossDisk=()=>page.evaluate(async()=>{
        const db=await new Promise(resolve=>{const req=indexedDB.open('reelcase');req.onsuccess=()=>resolve(req.result);});
        try{return await new Promise((resolve,reject)=>{const tx=db.transaction(['videos','remote-cache'],'readonly'),local=tx.objectStore('videos').getAll(),remote=tx.objectStore('remote-cache').getAll(),journal=tx.objectStore('remote-cache').get('youtube-cleanup');tx.oncomplete=()=>resolve({rows:[...local.result,...remote.result].filter(row=>row?.remote),journal:journal.result});tx.onerror=()=>reject(tx.error);});}finally{db.close();}
      });
      await reload();await navigate('Settings');
      for(const [group,label] of [['twitch','Twitch'],['adult','Adult']]) {
        const section=page.locator(`[data-${group}-cleanup]`),button=section.getByRole('button',{name:`Free up to 2 ${label} slots now`,exact:true});
        await button.waitFor();await page.evaluate(()=>{window.__failYoutubeCleanup=true;});await button.click();await section.getByRole('alert').waitFor();
        if((await crossDisk()).rows.length!==100)throw Error(`${label} failed transaction deleted cache rows`);
        await button.click();await section.getByText(new RegExp(`^2 old, low-rated ${label} entries removed`)).waitFor();
        const afterManual=await crossDisk(),kind=group==='adult'?'eporner':group,ids=afterManual.rows.filter(row=>row.remote.kind===kind).map(row=>row.id);
        if(ids.length!==8||ids.includes(`${kind}:cross-cleanup-5`)||ids.includes(`${kind}:cross-cleanup-6`))throw Error(`${label} manual cleanup did not remove the expected two oldest eligible rows`);
        for(let i=0;i<5;i++)if(!ids.includes(`${kind}:cross-cleanup-${i}`))throw Error(`${label} removed protected entry ${i}`);
        await section.scrollIntoViewIfNeeded();await page.screenshot({path:output.replace(/\.json$/,`-${viewport.name}-${group}.png`)});
        const resumePulling=page.getByRole('button',{name:'Resume pulling',exact:true});if(await resumePulling.count())await resumePulling.click();
        const newRows=(group==='adult'?extra.adult:extra.twitch).slice(5,10).map((row,i)=>({...row,id:`${kind}:new-cross-${i}`,addedAt:Date.now(),remote:{...row.remote,videoId:`new-cross-${i}`}}));
        if(group==='twitch') {
          twitchResponse={channels:[{...extra.tw,twitchArchiveCursor:'after',twitchClipCursor:'clip-after'}],videos:newRows,refreshedIds:[extra.tw.id],liveCheckedIds:[],retryAt:{}};
          await navigate('Twitch');await page.locator('[data-twitch-coverage] summary').click();await page.getByRole('button',{name:'Pull recent VODs + clips',exact:true}).click();
        }else {
          adultResponse={videos:newRows,providerNextPages:{eporner:2},providerNextOffsets:{eporner:0},providerDiagnostics:[{provider:'eporner',status:'ok',titles:5,detail:'fixture'}]};
          await navigate('Adults');await page.getByRole('heading',{name:'Adult discovery',exact:true}).waitFor();const expand=page.getByRole('button',{name:'Expand Adult discovery',exact:true});if(await expand.count())await expand.click();await page.getByRole('button',{name:'Continue archive',exact:true}).click();
        }
        const deadline=Date.now()+20_000;
        while(Date.now()<deadline) {const current=await crossDisk();if(current.journal.removedCount===(group==='twitch'?10:14)&&current.rows.filter(row=>row.remote.kind===kind).length===10)break;await page.waitForTimeout(200);}
        const afterPull=await crossDisk();if(afterPull.rows.filter(row=>row.remote.kind===kind).length!==10||afterPull.journal.removedCount!==(group==='twitch'?10:14))throw Error(`${label} automatic replacement: ${afterPull.rows.filter(row=>row.remote.kind===kind).length} rows, ${afterPull.journal.removedCount} cumulative replacements`);
        await reload();await navigate('Settings');
        const afterReload=await crossDisk();if(afterReload.rows.filter(row=>row.remote.kind===kind).length!==10||afterReload.rows.some(row=>row.id===`${kind}:cross-cleanup-5`||row.id===`${kind}:cross-cleanup-6`))throw Error(`${label} reload restored retired entries`);
      }
      result.crossProviderReplacementVerified=true;
      if(process.argv.includes('--replacement-resilience')) {
        console.log(`${viewport.name}: shared-cap donation, opt-out and gradual lowered-cap recovery`);
        const waitDisk=async(predicate,label)=>{const deadline=Date.now()+25000;for(;;){const current=await crossDisk();if(predicate(current))return current;if(Date.now()>deadline)throw Error(`${label}: ${current.rows.length} stored, ${current.journal?.removedCount} removed`);await page.waitForTimeout(200);}};
        const beforeShared=await crossDisk(),sharedBase=beforeShared.journal.removedCount;
        await page.evaluate(async({channel,tw})=>{
          const now=Date.now(),policy=JSON.parse(localStorage.getItem('reelcase.pull-settings.v1'));
          localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({...policy,automaticPulls:false,youtubeMaxEntries:100,twitchMaxEntries:10,adultMaxEntries:10,remoteMaxEntries:100,sharedCapCleanup:true,youtubeCleanupBatch:2,twitchCleanupBatch:2,adultCleanupBatch:2,adultAutoCleanup:false}));
          const db=await new Promise(resolve=>{const req=indexedDB.open('reelcase');req.onsuccess=()=>resolve(req.result);});
          try{await new Promise((resolve,reject)=>{const tx=db.transaction('remote-cache','readwrite'),remote=tx.objectStore('remote-cache'),all=remote.getAll();all.onsuccess=()=>{for(const row of all.result)if(row?.remote?.kind==='twitch')remote.delete(`video:${row.id}`);for(let i=0;i<10;i++)remote.put({id:`yt:resilience-filler-${i}`,folderId:channel.id,name:`Replacement filler ${i}`,path:'fixture',extension:'yt',mime:'video/youtube',size:0,addedAt:now-(700-i)*86400000,remote:{kind:'youtube',videoId:`res-filler-${i}`,channelId:channel.channelId,channelName:channel.title,publishedSource:'provider'}},`video:yt:resilience-filler-${i}`);remote.put({folders:[{id:channel.id,name:channel.title,kind:'youtube',videoCount:90},{id:tw.id,name:tw.title,kind:'twitch',videoCount:0},{id:'eporner:discover',name:'Eporner',kind:'eporner',videoCount:10,adult:true}],checkedAt:now},'meta');};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}
        },{channel,tw:extra.tw});
        twitchResponse={channels:[{...extra.tw,twitchArchiveCursor:'shared-after'}],videos:extra.twitch.slice(5,8).map((row,i)=>({...row,id:`tw:resilience-new-${i}`,addedAt:Date.now(),remote:{...row.remote,videoId:`shared-new-${i}`}})),refreshedIds:[extra.tw.id],liveCheckedIds:[],retryAt:{}};
        const pullTw=async()=>{await navigate('Twitch');const summary=page.locator('[data-twitch-coverage] summary');await summary.waitFor();if(!await page.locator('[data-twitch-coverage]').getAttribute('open'))await summary.click();await page.getByRole('button',{name:'Pull recent VODs + clips',exact:true}).click();};
        await reload();await navigate('Settings');await page.getByText(/^100 stored \/ 100 max/).waitFor();await page.getByRole('button',{name:'Resume pulling',exact:true}).click();
        let releaseTwitch;twitchHold=new Promise(resolve=>{releaseTwitch=resolve;});twitchDelivered=false;const requestAt=requests;
        await pullTw();while(requests===requestAt)await page.waitForTimeout(50);
        await navigate('Settings');await page.getByRole('button',{name:'Pause pulling',exact:true}).click();releaseTwitch();
        while(!twitchDelivered)await page.waitForTimeout(50);twitchHold=null;await page.waitForTimeout(350);
        const held=await crossDisk();if(held.rows.length!==100||held.journal.removedCount!==sharedBase)throw Error('Paused pulling still evicted cached videos');
        await page.getByRole('button',{name:'Resume pulling',exact:true}).click();
        let donated=await waitDisk(d=>d.journal.removedCount===sharedBase+2&&d.rows.filter(row=>row.remote.kind==='twitch').length===2,'Shared cap blocked a new Twitch source');
        result.pauseBeforeReplacementVerified=true;
        if(donated.rows.length!==100||donated.journal.groups.youtube.removedCount!==beforeShared.journal.groups.youtube.removedCount+2||donated.journal.groups.twitch.removedCount!==beforeShared.journal.groups.twitch.removedCount)throw Error('Shared cleanup exceeded or misattributed source budgets');
        for(let i=0;i<10;i++)if(!donated.rows.some(row=>row.id===`yt:cleanup-${i}`))throw Error('Shared donation removed protected YouTube content');
        await navigate('Settings');const shared=page.getByLabel('Allow shared-cap replacement across enabled sources',{exact:true});await shared.uncheck();
        await pullTw();await page.locator('[data-twitch-coverage]').waitFor({state:'attached'});await navigate('Settings');await page.getByLabel('Automatically make room for new Twitch pulls',{exact:true}).waitFor();
        await page.getByRole('button',{name:'Pause pulling',exact:true}).waitFor();
        const noDonation=await crossDisk();if(noDonation.journal.removedCount!==sharedBase+2||noDonation.rows.length!==100)throw Error('Shared opt-out still removed another source');
        await page.getByLabel('Automatically make room for new Twitch pulls',{exact:true}).uncheck();
        const youtubeLimit=page.locator('#pull-youtubeMaxEntries');await youtubeLimit.fill('86');await youtubeLimit.press('Enter');
        response={channels:[{...channel,catalogCursor:'lowered-after'}],videos:[{...seed[13],id:'yt:resilience-lowered-new',addedAt:Date.now(),remote:{...seed[13].remote,videoId:'lowered-new'}}],refreshedIds:[channel.id],retryAt:{}};
        await pull();await waitDisk(d=>d.journal.removedCount===sharedBase+4&&d.rows.filter(row=>row.remote.kind==='youtube').length===86,'Lowered cap did not make bounded progress');
        if((await crossDisk()).rows.some(row=>row.id==='yt:resilience-lowered-new'))throw Error('A lowered cap admitted an entry before it had room');
        await pull();await waitDisk(d=>d.journal.removedCount===sharedBase+5&&d.rows.some(row=>row.id==='yt:resilience-lowered-new'),'Lowered cap never resumed its pending page');
        result.sharedCapAndRecoveryVerified=true;
        console.log(`${viewport.name}: automatic Adult catalog target rotation`);
        await page.evaluate(async()=>{
          const now=Date.now(),policy=JSON.parse(localStorage.getItem('reelcase.pull-settings.v1'));
          localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({...policy,automaticPulls:true,adultAutoCleanup:true,adultCatalogTarget:1000,adultMaxEntries:1200,remoteMaxEntries:2000,adultCleanupBatch:2,adultIntervalSeconds:30}));
          const db=await new Promise(resolve=>{const req=indexedDB.open('reelcase');req.onsuccess=()=>resolve(req.result);});
          try{await new Promise((resolve,reject)=>{const tx=db.transaction(['videos','activity'],'readwrite'),local=tx.objectStore('videos'),activity=tx.objectStore('activity');local.clear();for(let i=0;i<1000;i++)local.put({id:`eporner:auto-floor-${i}`,folderId:'eporner:discover',name:`Automatic fixture ${i}`,path:'fixture',extension:'eporner',mime:'video/eporner',size:0,addedAt:now-(2000-i)*86400000,remote:{kind:'eporner',videoId:`auto-floor-${i}`,channelName:'Automatic fixture'}});const shelves=activity.get('shelves'),feedback=activity.get('feedback');shelves.onsuccess=()=>activity.put({...shelves.result,favorites:[...(shelves.result?.favorites??[]),'eporner:auto-floor-1'],likes:[...(shelves.result?.likes??[]),'eporner:auto-floor-0'],savedAt:now},'shelves');feedback.onsuccess=()=>activity.put({...feedback.result,ratings:{...feedback.result?.ratings,'eporner:auto-floor-2':5},savedAt:now},'feedback');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}
        });
        adultResponse={videos:Array.from({length:3},(_,i)=>({...extra.adult[5],id:`eporner:automatic-new-${i}`,addedAt:Date.now(),remote:{kind:'eporner',videoId:`automatic-new-${i}`,channelName:'Automatic fixture'}})),providerNextPages:{eporner:2},providerNextOffsets:{eporner:0},providerDiagnostics:[{provider:'eporner',status:'ok',titles:3,detail:'fixture'}]};
        await reload();await navigate('Settings');await page.getByRole('button',{name:'Resume pulling',exact:true}).click();await navigate('Adults');
        const automatic=await waitDisk(d=>d.journal.removedCount===sharedBase+7&&d.rows.filter(row=>row.remote.kind==='eporner').length===1000&&d.rows.some(row=>row.id==='eporner:automatic-new-0'),'Automatic Adult pulls stopped at the catalog target');
        for(let i=0;i<3;i++)if(!automatic.rows.some(row=>row.id===`eporner:auto-floor-${i}`))throw Error('Automatic target rotation removed saved or highly rated media');
        await navigate('Settings');await page.getByLabel('Automatic catalog pulls',{exact:true}).uncheck();
        const age=page.locator('#pull-twitchCleanupMinAgeDays');await age.fill('0');await age.press('Enter');
        await reload();await navigate('Settings');if(await page.locator('#pull-twitchCleanupMinAgeDays').inputValue()!=='0')throw Error('Zero age setting did not survive reload');
        await page.locator('[data-adult-cleanup]').scrollIntoViewIfNeeded();await page.screenshot({path:output.replace(/\.json$/,`-${viewport.name}-resilience.png`)});
        result.automaticAdultTargetVerified=true;
      }
    }
    result.rollbackVerified=true;result.historyAndProtectionVerified=true;result.manualAndAutomaticVerified=true;result.cursorAndSuppressionVerified=true;result.reloadVerified=true;result.requests=requests;
    result.overflowPixels=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth));
    if(result.overflowPixels)throw Error('Cleanup settings overflow the viewport');
    result.ok=errors.length===0;
  }catch(error){result.ok=false;result.failure=error.message;console.error(viewport.name,error.message,(await page.locator('body').innerText()).slice(-1200));}
  results.push(result);await context.close();
}}finally{await browser.close();}
const report={ok:results.length===2&&results.every(row=>row.ok),url,fixture:process.argv.includes('--replacement-resilience')?'Isolated 80/100-entry mixed catalogs and 1,000-entry Adult target; synthetic provider RPCs; actual controls, automatic owner and IndexedDB; no user-library access.':'Isolated 80-entry catalog; fake provider RPC responses; actual app controls and IndexedDB transactions; no user-library access.',results};
writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=report.ok?0:1;
