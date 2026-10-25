import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const origin=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/');
const output=checkedOutputPath(process.argv[3]??resolve('screenshots/watch-lists.json'),[resolve('screenshots')],'Saved lists check');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-features=WebRtcHideLocalIpsWithMdns']});
const checks=[],errors=[];let pages=[];
try{
  const contexts=await Promise.all([{width:1280,height:800},{width:390,height:844},{width:1100,height:800}].map(viewport=>browser.newContext({viewport})));
  for(const context of contexts){
    await context.addInitScript(()=>{
      localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:false}));
      window.__listWrites=0;window.__failListWrites=false;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='reelcase.watch-room.playlists.v1'){if(window.__failListWrites)throw new DOMException('Storage quota exceeded','QuotaExceededError');window.__listWrites++;}return set.call(this,key,value);};window.__suggestionPackets=[];window.__hostStateChannels=new Set();const send=RTCDataChannel.prototype.send;
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

  const key='reelcase.watch-room.playlists.v1';
  const lists=page=>page.getByRole('group',{name:'Saved watch lists',exact:true});
  const openLists=async page=>{const group=lists(page);if(!await group.evaluate(element=>element.open))await group.locator(':scope > summary').click();return group;};
  const rows=page=>lists(page).locator('[data-room-playlist-id]');
  const list=(page,name)=>rows(page).filter({has:page.getByText(name,{exact:true})});
  const save=async(page,name)=>{await openLists(page);await lists(page).getByRole('textbox',{name:'New watch list name',exact:true}).fill(name);await lists(page).getByRole('button',{name:'Save queue as list',exact:true}).click();};
  const review=()=>panel(host).getByRole('checkbox',{name:'Review guest additions before queuing',exact:true});
  const permission=()=>panel(host).getByRole('checkbox',{name:'Allow guests to edit queue and select videos',exact:true});
  await host.goto(origin);await host.locator('[data-home-ready="true"]').waitFor();
  await host.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:'Watch room',exact:true}).click();await host.getByRole('button',{name:'Start room',exact:true}).click();
  const room=(await host.getByRole('heading',{name:/^Room RC/}).innerText()).replace('Room ','').trim();
  await add(host,'https://youtu.be/dQw4w9WgXcQ\nhttps://youtu.be/watchList01\nhttps://youtu.be/watchList02');await panel(host).getByRole('button',{name:'Play next',exact:true}).click();
  const initial=await order(host);assert.equal(initial.length,2);
  const join=new URL('/?room='+room+'&theater=1',origin).href;await Promise.all([phone.goto(join),other.goto(join)]);
  for(const page of [phone,other])await page.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').waitFor({timeout:45000});
  await host.getByText(/Connection details · 2\/2 connected/).waitFor({timeout:30000});
  await save(host,'Friday watch night');await list(host,'Friday watch night').waitFor();assert.equal(await rows(phone).count(),0);
  const original=await host.evaluate(key=>localStorage.getItem(key),key);
  assert.equal(JSON.parse(original).items[0].media.length,2);assert.doesNotMatch(original,/dQw4w9WgXcQ|streamId|fingerprint|peer/);
  await save(phone,'Guest favorites');await list(phone,'Guest favorites').waitFor();assert.equal(await rows(host).count(),1);
  await list(host,'Friday watch night').getByRole('button',{name:'Rename list',exact:true}).click();await lists(host).getByRole('textbox',{name:'Rename watch list',exact:true}).fill('Racing night');await lists(host).getByRole('button',{name:'Save name',exact:true}).click();
  await list(host,'Racing night').waitFor();await save(host,'RACING NIGHT');await lists(host).getByText(/That name already exists/).waitFor();assert.equal(await rows(host).count(),1);
  await list(host,'Racing night').getByRole('button',{name:'Remove list',exact:true}).click();assert.equal(await rows(host).count(),0);await lists(host).getByRole('button',{name:'Undo removed list',exact:true}).click();await list(host,'Racing night').waitFor();
  await list(host,'Racing night').locator('summary').click();const exported=await lists(host).getByRole('textbox',{name:'Saved links for Racing night',exact:true}).inputValue();assert.equal(exported,'https://www.youtube.com/watch?v=watchList01\nhttps://www.youtube.com/watch?v=watchList02');
  checks.push('named public lists save, preview, rename and remove with undo; duplicate names are rejected and isolated clients retain separate personal lists');
  await panel(host).getByRole('button',{name:'Clear queue',exact:true}).click();await waitOrder(phone,[]);
  await list(host,'Racing night').getByRole('button',{name:'Add list to queue',exact:true}).click();await waitOrder(phone,initial);await panel(host).getByText(/Saved list: 2 queued/).waitFor();
  await list(host,'Racing night').getByRole('button',{name:'Add list to queue',exact:true}).click();await panel(host).getByText(/0 queued.*2 already/).waitFor();assert.deepEqual(await order(host),initial);
  await panel(host).getByRole('button',{name:'Undo queue change',exact:true}).click();await waitOrder(phone,[]);
  await list(phone,'Guest favorites').getByRole('button',{name:'Add list to queue',exact:true}).click();await waitOrder(host,initial);await panel(phone).getByText(/2 queued/).waitFor();
  assert.equal(await host.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').count(),1);
  await panel(host).getByRole('button',{name:'Clear queue',exact:true}).click();await waitOrder(phone,[]);await review().check();await panel(phone).getByText(/Review mode:/).waitFor();
  await list(phone,'Guest favorites').getByRole('button',{name:'Suggest list',exact:true}).click();await waitSuggestions(host,2);assert.deepEqual(await order(host),[]);
  await requests(host).locator('[data-room-suggestion-id="youtube:watchList01"]').getByRole('button',{name:'Approve to end',exact:true}).click();await waitOrder(phone,[initial[0]]);
  await requests(host).locator('[data-room-suggestion-id="youtube:watchList02"]').getByRole('button',{name:'Dismiss',exact:true}).click();await waitSuggestions(phone,0);
  await permission().uncheck();await panel(phone).getByText(/The host has locked/).waitFor();assert.equal(await list(phone,'Guest favorites').getByRole('button',{name:'Suggest list',exact:true}).isDisabled(),true);
  await list(phone,'Guest favorites').getByRole('button',{name:'Rename list',exact:true}).click();await lists(phone).getByRole('textbox',{name:'Rename watch list',exact:true}).fill('My saved favorites');await lists(phone).getByRole('button',{name:'Save name',exact:true}).click();await list(phone,'My saved favorites').waitFor();
  checks.push('host list batches are duplicate-safe and undoable; guest direct additions require acknowledgement, review mode holds suggestions separately, and host locks still allow personal list management');
  await permission().check();await review().uncheck();await panel(host).getByRole('button',{name:'Clear queue',exact:true}).click();await waitOrder(host,[]);
  await add(host,'https://youtu.be/replaced001');await waitOrder(host,['room:youtube:replaced001']);
  await list(host,'Racing night').getByRole('button',{name:'Replace with queue',exact:true}).click();await list(host,'Racing night').getByText('1 public video',{exact:true}).waitFor();
  await save(host,'Capacity test');await list(host,'Capacity test').waitFor();
  await panel(host).getByRole('button',{name:'Clear queue',exact:true}).click();await waitOrder(host,[]);
  await add(host,Array.from({length:47},(_,i)=>'https://youtu.be/listFill'+i).join('\n'));await host.waitForFunction(()=>document.querySelectorAll('[data-room-queue-id]').length===47);
  await list(phone,'My saved favorites').getByRole('button',{name:'Add list to queue',exact:true}).click();await host.waitForFunction(()=>document.querySelectorAll('[data-room-queue-id]').length===48);await panel(phone).getByText(/1 queued.*1 skipped.*queue full/).waitFor();
  assert.equal(await list(host,'Racing night').getByRole('button',{name:'Add list to queue',exact:true}).isDisabled(),true);
  await panel(host).getByRole('button',{name:'Undo queue change',exact:true}).click();await host.waitForFunction(()=>document.querySelectorAll('[data-room-queue-id]').length===47);
  assert.equal(JSON.parse(await phone.evaluate(key=>localStorage.getItem(key),key)).items[0].media.length,2);
  checks.push('replacing a saved list is explicit, partial additions report capacity without losing saved titles, and Undo restores the entire host batch');
  const currentRaw=await host.evaluate(key=>localStorage.getItem(key),key);
  await host.evaluate(()=>{window.__failListWrites=true;});await save(host,'Should not save');await lists(host).getByText(/quota exceeded/i).waitFor();assert.equal(await rows(host).count(),2);assert.equal(await host.evaluate(key=>localStorage.getItem(key),key),currentRaw);await host.evaluate(()=>{window.__failListWrites=false;});
  // Another tab updates browser-local lists. The mounted room must adopt it,
  // and a later explicit save must merge the latest value rather than clobber it.
  const tab=await contexts[0].newPage();await tab.goto(origin);await tab.locator('[data-home-ready="true"]').waitFor();
  await tab.evaluate(key=>{const value=JSON.parse(localStorage.getItem(key));value.items.push({...value.items[0],id:'other-tab',name:'Other tab list'});localStorage.setItem(key,JSON.stringify(value));},key);
  await list(host,'Other tab list').waitFor();await save(host,'Merged list');await list(host,'Merged list').waitFor();assert.equal(await rows(host).count(),4);
  const safeRaw=await host.evaluate(key=>localStorage.getItem(key),key);
  await tab.evaluate(key=>localStorage.setItem(key,'{broken'),key);await lists(host).getByText(/could not be read.*kept/).waitFor();await save(host,'No overwrite');assert.equal(await host.evaluate(key=>localStorage.getItem(key),key),'{broken');await tab.evaluate(({key,safeRaw})=>localStorage.setItem(key,safeRaw),{key,safeRaw});await lists(host).getByText('Saved lists updated from another tab.',{exact:true}).waitFor();await tab.close();
  const writes=await host.evaluate(()=>window.__listWrites);await host.waitForTimeout(3200);assert.equal(await host.evaluate(()=>window.__listWrites),writes);
  checks.push('storage quota failures and unreadable data preserve saved lists and the live queue; storage events merge changes from another tab and playback does not write named lists');
  await panel(host).getByRole('button',{name:'Clear queue',exact:true}).click();await waitOrder(phone,[]);await list(phone,'My saved favorites').getByRole('button',{name:'Add list to queue',exact:true}).click();await waitOrder(host,initial);
  await host.reload();await host.locator('[data-home-ready="true"]').waitFor();
  if(!await host.getByRole('button',{name:'Resume last room · '+room,exact:true}).isVisible())await host.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:'Watch room',exact:true}).click();
  await host.getByRole('button',{name:'Resume last room · '+room,exact:true}).click();await openLists(host);await list(host,'Racing night').waitFor();assert.equal(await rows(host).count(),4);assert.deepEqual(await order(host),[]);
  await list(host,'Racing night').getByRole('button',{name:'Add list to queue',exact:true}).click();await waitOrder(host,['room:youtube:replaced001']);
  await phone.reload();await openLists(phone);await list(phone,'My saved favorites').waitFor();await waitOrder(phone,['room:youtube:replaced001']);assert.equal(await rows(phone).count(),1);
  await lists(host).scrollIntoViewIfNeeded();await host.screenshot({path:output.replace(/\.json$/,'-desktop.png')});await lists(phone).scrollIntoViewIfNeeded();await phone.screenshot({path:output.replace(/\.json$/,'-mobile.png')});
  for(const page of pages)assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const packets=await host.evaluate(()=>JSON.stringify(window.__suggestionPackets));assert.doesNotMatch(packets,/Racing night|Friday watch night|Guest favorites|My saved favorites|Other tab list/);
  assert.deepEqual(errors,[]);checks.push('named lists survive host and guest reloads without auto-queuing, preserve updated public titles, remain private to each browser, and fit desktop and phone layouts');
  writeFileSync(output,JSON.stringify({ok:true,checks,errors,limitation:'Three isolated browser clients use real WebRTC; provider embeds are fixtures. Physical devices and cross-network TURN are separate checks.'},null,2));
}catch(error){for(const [i,page]of pages.entries()){await page.screenshot({path:output.replace(/\.json$/,'-failure-'+i+'.png')}).catch(()=>{});console.log((await page.locator('body').innerText().catch(()=>'' )).slice(-4500));}writeFileSync(output,JSON.stringify({ok:false,checks,errors,error:error.stack},null,2));throw error;}
finally{await browser.close();}
