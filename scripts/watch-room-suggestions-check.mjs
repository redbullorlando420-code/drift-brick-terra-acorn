import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const origin=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/');
const output=checkedOutputPath(process.argv[3]??resolve('screenshots/watch-suggestions.json'),[resolve('screenshots')],'Suggestions check');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-features=WebRtcHideLocalIpsWithMdns']});
const checks=[],errors=[];let pages=[];
try{
  const contexts=await Promise.all([{width:1280,height:800},{width:390,height:844},{width:1100,height:800}].map(viewport=>browser.newContext({viewport})));
  for(const context of contexts){
    await context.addInitScript(()=>{
      localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:false}));
      window.__suggestionPackets=[];window.__hostStateChannels=new Set();const send=RTCDataChannel.prototype.send;
      RTCDataChannel.prototype.send=function(value){try{const packet=JSON.parse(value);if(packet.t==='d'){
        window.__suggestionPackets.push(packet.d);if(window.__suggestionPackets.length>128)window.__suggestionPackets.shift();
        if(packet.d.type==='queue-suggest')window.__suggestionHostChannel=this;
        if(packet.d.type==='room-state')window.__hostStateChannels.add(this);
        if(packet.d.type==='queue-result'&&window.__dropSuggestionReceipt){window.__dropSuggestionReceipt=false;return;}
      }}catch{}return send.call(this,value);};
      window.__rawSuggestionPacket=packet=>send.call(window.__suggestionHostChannel,JSON.stringify({t:'d',d:packet}));
      window.__sendOldReviewState=(state,marker)=>{for(const channel of window.__hostStateChannels)if(channel.readyState==='open'){send.call(channel,JSON.stringify({t:'d',d:{...state,reviewQueue:false,guestQueueEnabled:false,sentAt:Date.now()}}));send.call(channel,JSON.stringify({t:'d',d:{type:'room-pulse',sentAt:marker}}));}};
    });
    await context.route('**/api/lan-origin',route=>route.fulfill({contentType:'application/json',body:'{"origins":[]}'}));
    await context.route('http://127.0.0.1:43123/**',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
    await context.route(/https:\/\/(?:www.youtube.com|player.twitch.tv|clips.twitch.tv)\//,route=>route.fulfill({contentType:'text/html',body:'<p>Public provider fixture</p>'}));
    await context.route(/https:\/\/.*(?:ytimg.com|jtvnw.net)\//,route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#263342"/></svg>'}));
  }
  const [host,phone,other]=await Promise.all(contexts.map(context=>context.newPage()));pages=[host,phone,other];
  for(const page of pages){page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});}
  const panel=page=>page.getByRole('region',{name:'Room query and queue',exact:true});
  const requests=page=>page.getByRole('region',{name:'Guest video suggestions',exact:true});
  const order=page=>panel(page).locator('[data-room-queue-id]').evaluateAll(rows=>rows.map(row=>row.dataset.roomQueueId));
  const waitOrder=(page,ids)=>page.waitForFunction(ids=>JSON.stringify([...document.querySelectorAll('[data-room-queue-id]')].map(row=>row.dataset.roomQueueId))===JSON.stringify(ids),ids);
  const waitSuggestions=(page,count)=>page.waitForFunction(count=>document.querySelectorAll('[data-room-suggestion-id]').length===count,count);
  const add=async(page,links,suggest=false)=>{await panel(page).getByRole('textbox',{name:'Public video link',exact:true}).fill(links);await panel(page).getByRole('button',{name:suggest?'Suggest links':'Add link to queue',exact:true}).click();};
  const review=()=>panel(host).getByRole('checkbox',{name:'Review guest additions before queuing',exact:true});
  const permission=()=>panel(host).getByRole('checkbox',{name:'Allow guests to edit queue and select videos',exact:true});
  const row=(page,id)=>requests(page).locator(`[data-room-suggestion-id="youtube:${id}"]`);
  await host.goto(origin);await host.locator('[data-home-ready="true"]').waitFor();
  await host.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:'Watch room',exact:true}).click();await host.getByRole('button',{name:'Start room',exact:true}).click();
  const room=(await host.getByRole('heading',{name:/^Room RC/}).innerText()).replace('Room ','').trim();
  await add(host,'https://youtu.be/dQw4w9WgXcQ\nhttps://youtu.be/tailQA00001');await panel(host).getByRole('button',{name:'Play next',exact:true}).click();
  await other.goto(origin);await other.locator('[data-home-ready="true"]').waitFor();await other.waitForFunction(async()=>(await indexedDB.databases()).some(db=>db.name==='reelcase'));
  await other.evaluate(async()=>{
    localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels:[{id:'yt:own-review',kind:'youtube',handle:'own-review',title:'Own creator'}],savedAt:Date.now()}));
    const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('reelcase');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    await new Promise((resolve,reject)=>{const tx=db.transaction('remote-cache','readwrite'),store=tx.objectStore('remote-cache');store.put({folders:[],checkedAt:Date.now()},'meta');store.put({id:'room:youtube:dQw4w9WgXcQ',name:'My public review title',folderId:'yt:own-review',path:'private review catalog path',extension:'yt',mime:'video/youtube',size:0,addedAt:Date.now(),remote:{kind:'youtube',videoId:'aqz-KE-bpKQ',channelName:'Own creator'}},'video:room:youtube:dQw4w9WgXcQ');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
  });
  const join=new URL(`/?room=${room}&theater=1`,origin).href;await Promise.all([phone.goto(join),other.goto(join)]);
  for(const page of [phone,other])await page.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').waitFor({timeout:45000});
  await host.getByText(/Connection details · 2\/2 connected/).waitFor({timeout:30000});
  await review().check();await panel(phone).getByText(/Review mode: suggest public videos below/).waitFor();
  assert.equal(await panel(phone).getByRole('button',{name:'Request next',exact:true}).isDisabled(),true);
  const before=await order(host),savedBefore=await host.evaluate(()=>localStorage.getItem('reelcase.watch-room.queue.v1'));
  await host.evaluate(()=>{window.__dropSuggestionReceipt=true;});
  await add(phone,'https://youtu.be/suggestQA01\nhttps://youtu.be/suggestQA02\nhttps://youtu.be/suggestQA01\nhttps://invalid.example/video',true);
  await Promise.all(pages.map(page=>waitSuggestions(page,2)));await panel(phone).getByText(/2 sent for host review.*1 already.*1 invalid/).waitFor({timeout:10000});
  await phone.waitForFunction(()=>{const packets=window.__suggestionPackets.filter(packet=>packet.type==='queue-suggest');return packets.length>=2&&packets.at(-1).requestId===packets.at(-2).requestId;});
  assert.deepEqual(await order(host),before);assert.equal(await host.evaluate(()=>localStorage.getItem('reelcase.watch-room.queue.v1')),savedBefore);
  await add(other,'https://youtu.be/suggestQA01',true);await panel(other).getByText(/0 sent for host review.*1 already/).waitFor();await waitSuggestions(host,2);
  const oldReview=await host.evaluate(()=>window.__suggestionPackets.findLast(packet=>packet.type==='room-state'&&packet.suggestions?.length===2));
  checks.push('review submissions do not change playback, queue or its saved draft; duplicate and invalid batches report clearly, and a dropped receipt retries once with the same identity');
  await panel(other).getByRole('textbox',{name:'Search room videos',exact:true}).fill('My public review title');
  await panel(other).getByRole('button',{name:'Suggest My public review title',exact:true}).click();await waitSuggestions(host,3);
  await row(host,'suggestQA01').getByRole('button',{name:'Approve to end',exact:true}).click();await waitOrder(phone,[...before,'room:youtube:suggestQA01']);
  await panel(host).getByRole('button',{name:'Undo queue change',exact:true}).click();await waitOrder(phone,before);await waitSuggestions(phone,2);
  await row(host,'suggestQA02').getByRole('button',{name:'Approve next',exact:true}).click();await waitOrder(phone,['room:youtube:suggestQA02',...before]);
  await row(host,'aqz-KE-bpKQ').getByRole('button',{name:'Dismiss',exact:true}).click();await waitSuggestions(phone,0);
  await panel(other).getByText(/The host dismissed My public review title/).waitFor();assert.equal(await host.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').count(),1);
  checks.push('host approvals append or prioritize without changing the stage; Undo restores the queue while resolving the request, and dismissal notifies the submitting guest');
  const marker=Date.now();await host.evaluate(({state,marker})=>window.__sendOldReviewState(state,marker),{state:oldReview,marker});
  await Promise.all([phone,other].map(page=>page.waitForFunction(marker=>window.__suggestionPackets.some(packet=>packet.type==='room-pulse-ack'&&packet.sentAt===marker),marker)));
  await waitSuggestions(phone,0);await waitSuggestions(other,0);assert.equal(await panel(phone).getByRole('button',{name:'Suggest links',exact:true}).isEnabled(),true);
  checks.push('freshly timestamped stale review snapshots cannot resurrect resolved requests or overwrite the newer review policy');
  const confirmed=await order(host);
  await phone.evaluate(id=>window.__rawSuggestionPacket({type:'queue-action',requestId:'review-bypass',operation:{kind:'remove',id}}),confirmed[0]);
  await host.waitForFunction(()=>window.__suggestionPackets.some(packet=>packet.requestId==='review-bypass'&&packet.text?.includes('reviewing suggestions')));await waitOrder(host,confirmed);
  await add(phone,Array.from({length:10},(_,i)=>`https://youtu.be/pendingQA0${i}`).join('\n'),true);await waitSuggestions(host,8);await panel(phone).getByText(/8 sent for host review.*2 held back/).waitFor();
  await phone.reload();await panel(phone).getByRole('button',{name:'Suggest links',exact:true}).waitFor();await waitSuggestions(phone,8);
  await phone.getByRole('navigation',{name:'Watch room shortcuts'}).getByRole('button',{name:'Requests · 8',exact:true}).click();
  assert.equal(await phone.evaluate(()=>document.activeElement?.textContent),'Guest suggestions');await phone.screenshot({path:output.replace(/\.json$/,'-mobile.png')});
  await requests(host).scrollIntoViewIfNeeded();await host.screenshot({path:output.replace(/\.json$/,'-desktop.png')});
  checks.push('review mode rejects direct queue-edit packets, enforces per-connection limits, restores pending requests to rejoining guests and provides a focused mobile Requests shortcut');
  await panel(host).getByRole('button',{name:'Clear queue',exact:true}).click();await waitOrder(phone,[]);
  await add(host,Array.from({length:48},(_,i)=>`https://youtu.be/reviewFill${i}`).join('\n'));await host.waitForFunction(()=>document.querySelectorAll('[data-room-queue-id]').length===48);
  await add(phone,'https://youtu.be/fullReview1',true);await waitSuggestions(host,9);
  assert.equal(await row(host,'fullReview1').getByRole('button',{name:'Approve next',exact:true}).isDisabled(),true);
  await panel(host).getByRole('button',{name:'Clear queue',exact:true}).click();await waitOrder(phone,[]);
  await row(host,'fullReview1').getByRole('button',{name:'Approve next',exact:true}).click();await waitOrder(phone,['room:youtube:fullReview1']);await waitSuggestions(host,8);
  await permission().uncheck();await panel(phone).getByText(/The host has locked queue edits and video selection/).waitFor();assert.equal(await panel(phone).getByRole('button',{name:'Suggest links',exact:true}).isDisabled(),true);
  await phone.evaluate(()=>window.__rawSuggestionPacket({type:'queue-suggest',requestId:'locked-review',queueMedia:[{id:'qa-locked',name:'Locked suggestion',kind:'youtube',videoId:'lockedQA001'}]}));
  await host.waitForFunction(()=>window.__suggestionPackets.some(packet=>packet.requestId==='locked-review'&&packet.text?.includes('locked')));await waitSuggestions(host,8);
  await permission().check();await review().uncheck();await panel(phone).getByRole('button',{name:'Add link to queue',exact:true}).waitFor();await waitSuggestions(phone,8);
  checks.push('full live queues retain suggestions for later approval; disabling guest access rejects raw suggestions, and turning review off preserves outstanding requests without auto-queuing them');
  await review().check();await host.reload();await host.locator('[data-home-ready="true"]').waitFor();
  if(!await host.getByRole('button',{name:`Resume last room · ${room}`,exact:true}).isVisible())await host.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:'Watch room',exact:true}).click();
  await host.getByRole('button',{name:`Resume last room · ${room}`,exact:true}).click();await panel(host).getByRole('button',{name:'Restore saved queue · 1',exact:true}).click();
  await waitOrder(phone,['room:youtube:fullReview1']);await waitSuggestions(phone,0);assert.equal(await review().isChecked(),true);await review().uncheck();
  checks.push('host review preference survives reload while session-only requests clear and the separately saved live queue recovers explicitly');
  const personal=await other.evaluate(async()=>{const db=await new Promise(resolve=>{const request=indexedDB.open('reelcase');request.onsuccess=()=>resolve(request.result);});const row=await new Promise(resolve=>{const request=db.transaction('remote-cache').objectStore('remote-cache').get('video:room:youtube:dQw4w9WgXcQ');request.onsuccess=()=>resolve(request.result);});db.close();return row.remote.videoId;});assert.equal(personal,'aqz-KE-bpKQ');
  for(const page of pages)assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const packets=await host.evaluate(()=>JSON.stringify(window.__suggestionPackets));assert.doesNotMatch(packets,/private review catalog path|blob:|fingerprint/);
  assert.deepEqual(errors,[]);writeFileSync(output,JSON.stringify({ok:true,checks,errors,limitation:'Three isolated clients using real WebRTC; provider embeds use fixtures. Physical devices and cross-network TURN are separate checks.'},null,2));
}catch(error){for(const [i,page]of pages.entries()){await page.screenshot({path:output.replace(/\.json$/,`-failure-${i}.png`)}).catch(()=>{});console.log((await page.locator('body').innerText().catch(()=>'' )).slice(-4500));}writeFileSync(output,JSON.stringify({ok:false,checks,errors,error:error.stack},null,2));throw error;}
finally{await browser.close();}
