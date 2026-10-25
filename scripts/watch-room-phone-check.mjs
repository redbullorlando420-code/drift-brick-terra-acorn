import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {checkedUrl,checkedOutputPath} from './browser-guard.mjs';
const origin=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/');
const output=checkedOutputPath(process.argv[3]??resolve('screenshots/watch-phone.json'),[resolve('screenshots')],'Phone playback check');
const channel=process.argv[4]??'chrome';if(!['chrome','msedge'].includes(channel))throw Error('Choose chrome or msedge for the isolated phone matrix.');
const browser=await chromium.launch({channel,headless:true});
const errors=[],checks=[];let pages=[];
const record=checks.push.bind(checks);checks.push=(...items)=>{for(const check of items)console.log(JSON.stringify({check}));return record(...items);};
const youtube=String.raw`<button id="start">Play video on phone</button><script>
window.commands=[];window.ready=false;window.unlocked=!window.__phoneFixture;
window.live=/liveRoute01|liveWatch01/.test(location.pathname);
let base=0,stamp=performance.now(),state=-1;const born=performance.now();
window.position=()=>base+(state===1?(performance.now()-stamp)/1000:0);
window.playerState=()=>state;
const send=(event,info)=>parent.postMessage(JSON.stringify({event,info}),'*');
const info=()=>send('infoDelivery',{currentTime:position(),playerState:state,duration:window.live?Math.max(20,position()):600,...(!window.__phoneFixture||!window.live?{videoData:{video_id:location.pathname.split('/').pop(),isLive:window.live}}:{})});
window.setTime=value=>{base=value;stamp=performance.now();info();};
window.setState=value=>{base=position();stamp=performance.now();state=value;send('onStateChange',value);info();};
const play=()=>{if(!window.unlocked){send('onAutoplayBlocked');return;}if(state!==1)setState(1);};
document.getElementById('start').onclick=()=>{window.unlocked=true;play();};
addEventListener('message',event=>{let packet;try{packet=typeof event.data==='string'?JSON.parse(event.data):event.data;}catch{return;}
 if(packet.event==='listening' && performance.now()-born>1400 && !window.ready){window.ready=true;info();send('onReady');}
 if(packet.event!=='command'||!window.ready)return;commands.push(packet);
 if(packet.func==='seekTo')setTime(packet.args[0]);if(packet.func==='playVideo')play();if(packet.func==='pauseVideo'&&state!==2)setState(2);
});setInterval(()=>{if(window.ready)info();},250);
</script>`;
const twitch=String.raw`window.Twitch={Player:class{
 constructor(target){this.events={};this.base=0;this.stamp=performance.now();this.state=2;this.unlocked=!window.__phoneFixture;window.fixtureTwitch=this;const button=document.createElement('button');button.textContent='Play Twitch on phone';button.onclick=()=>{this.unlocked=true;this.play();};document.getElementById(target).append(button);setTimeout(()=>this.emit('ready'),1000);}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}emit(name){for(const fn of this.events[name]??[])fn();}
 getCurrentTime(){return this.base+(this.state===1?(performance.now()-this.stamp)/1000:0);}getDuration(){return 600;}
 seek(value){this.base=value;this.stamp=performance.now();window.twitchSeeks=(window.twitchSeeks??0)+1;this.emit('seek');}setMuted(){}
 play(){if(!this.unlocked){this.emit('playback-blocked');return;}if(this.state===1)return;this.stamp=performance.now();this.state=1;this.emit('play');this.emit('playing');}
 pause(){this.base=this.getCurrentTime();this.stamp=performance.now();this.state=2;this.emit('pause');}
}};`;
try{
 const contexts=await Promise.all([{width:1280,height:800},{width:390,height:844}].map(viewport=>browser.newContext({viewport})));
 for(const [index,context] of contexts.entries()){
  await context.addInitScript(phone=>{
   window.__phoneFixture=phone;const now=Date.now;if(phone)Date.now=()=>now()+90000;
   localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:false}));
   window.packets=[];const send=RTCDataChannel.prototype.send;RTCDataChannel.prototype.send=function(value){try{const packet=JSON.parse(value);if(packet.t==='d'){window.packets.push(packet.d);if(window.packets.length>256)window.packets.shift();}}catch{}return send.call(this,value);};
  },index===1);
  await context.route('**/api/lan-origin',route=>route.fulfill({contentType:'application/json',body:'{"origins":[]}'}));
  await context.route('http://127.0.0.1:43123/**',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
  await context.route(/https:\/\/www.youtube.com\//,route=>route.fulfill({contentType:'text/html',body:youtube}));
  await context.route('https://player.twitch.tv/js/embed/v1.js',route=>route.fulfill({contentType:'application/javascript',body:twitch}));
  await context.route(/https:\/\/.*(?:ytimg.com|jtvnw.net)\//,route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"/>'}));
 }
 const [host,phone]=await Promise.all(contexts.map(context=>context.newPage()));pages=[host,phone];for(const page of pages){page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});}
 const panel=page=>page.getByRole('region',{name:'Room query and queue',exact:true});
 const add=async(page,link)=>{await panel(page).getByRole('textbox',{name:'Public video link',exact:true}).fill(link);await panel(page).getByRole('button',{name:'Add link to queue',exact:true}).click();};
 const frame=page=>page.frameLocator('iframe[src*="youtube.com/embed/"]').locator('body');
 const position=page=>frame(page).evaluate(()=>window.position());
 const timeline=page=>page.getByLabel('Room playback time',{exact:true}).getAttribute('data-room-clock').then(Number);
 await host.goto(origin);await host.locator('[data-home-ready="true"]').waitFor();await host.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:'Watch room',exact:true}).click();await host.getByRole('button',{name:'Start room',exact:true}).click();
 const room=(await host.getByRole('heading',{name:/^Room RC/}).innerText()).replace('Room ','').trim();await add(host,'https://youtu.be/dQw4w9WgXcQ');await panel(host).getByRole('button',{name:'Play next',exact:true}).click();await frame(host).evaluate(()=>new Promise(resolve=>{const id=setInterval(()=>{if(window.ready){clearInterval(id);resolve();}},50);}));
 await frame(host).evaluate(()=>window.setTime(40));await phone.goto(new URL('/?room='+room+'&theater=1',origin).href);await frame(phone).getByRole('button',{name:'Play video on phone',exact:true}).waitFor();
 await phone.getByText(/Your browser blocked autoplay/).waitFor({timeout:30000});await frame(phone).evaluate(()=>{if(!window.ready)throw Error('Ready handshake did not retry');});
 const before=await phone.evaluate(()=>window.packets.filter(packet=>packet.type==='sync-request').length);
 await phone.getByRole('button',{name:'Start on this device',exact:true}).click();await frame(phone).getByRole('button',{name:'Play video on phone',exact:true}).click();
 await phone.waitForTimeout(2200);assert.ok(Math.abs(await position(phone)-await position(host))<1,'phone catches up after its own user gesture');assert.ok(Math.abs(await timeline(phone)-await timeline(host))<1.5,'room clocks align despite 90 seconds of device clock skew');
 assert.equal(await phone.evaluate(()=>window.packets.filter(packet=>packet.type==='sync-request').length),before);await host.getByRole('heading',{name:'Playing together',exact:true}).waitFor();
 checks.push('late YouTube API readiness retries successfully; blocked mobile autoplay resolves with a device-only tap, catches up to the playing host, and does not send room pause/play requests even with 90 seconds of clock skew');
 const seekCount=await frame(phone).evaluate(()=>commands.filter(packet=>packet.func==='seekTo').length);await phone.waitForTimeout(4200);assert.ok((await frame(phone).evaluate(()=>commands.filter(packet=>packet.func==='seekTo').length))-seekCount<=1,'normal heartbeats do not cause repeated seeks');
 await frame(phone).evaluate(()=>window.setTime(window.position()-8));for(let i=0;i<24;i++){await phone.waitForTimeout(250);if(Math.abs(await position(phone)-await position(host))<1.25)break;}assert.ok(Math.abs(await position(phone)-await position(host))<1.25,'reported player drift is corrected within its cooldown');
 await frame(host).evaluate(()=>window.setState(3));await phone.waitForTimeout(2400);const held=await timeline(phone);await phone.waitForTimeout(1500);assert.ok(Math.abs(await timeline(phone)-held)<0.5,'host buffering does not advance the guest clock');
 await frame(host).evaluate(()=>window.setState(1));await phone.waitForTimeout(1800);assert.ok(Math.abs(await position(phone)-await position(host))<1.5,'host buffering resumes without manual room pause/play');
 checks.push('normal playback avoids seek storms, substantial decoder drift is corrected, and buffering freezes the shared clock and resumes the guest automatically');
 await phone.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));});await phone.waitForTimeout(1300);assert.ok(Math.abs(await position(phone)-await position(host))<1.5);assert.equal(await phone.evaluate(()=>window.packets.filter(packet=>packet.type==='sync-request').length),before);
 await phone.getByRole('button',{name:'Start on this device',exact:true}).scrollIntoViewIfNeeded();await phone.screenshot({path:output.replace(/\.json$/,'-mobile.png')});await host.screenshot({path:output.replace(/\.json$/,'-desktop.png')});
 checks.push('returning to the phone page requests fresh clock and host state without altering shared playback');
 for(let i=0;i<2;i++){await host.getByRole('button',{name:'Pause',exact:true}).first().click();await phone.getByRole('heading',{name:'Paused together',exact:true}).waitFor();await phone.waitForTimeout(900);await host.getByRole('heading',{name:'Paused together',exact:true}).waitFor();await host.getByRole('button',{name:'Play',exact:true}).first().click();await phone.getByRole('heading',{name:'Playing together',exact:true}).waitFor();await phone.waitForTimeout(900);}
 checks.push('shared pause/resume remains stable while provider telemetry is arriving, and stale player notifications do not undo the room control');
  const playbackCommands=page=>frame(page).evaluate(()=>commands.filter(packet=>['playVideo','pauseVideo','seekTo'].includes(packet.func)).map(packet=>packet.func));
  for(const link of ['https://www.youtube.com/live/liveRoute01','https://www.youtube.com/watch?v=liveWatch01']){
   await add(host,link);await panel(host).getByRole('button',{name:'Play next',exact:true}).click();
   await phone.getByText(/Your browser blocked autoplay/).waitFor();await host.getByText(/YouTube Live · Play and pause/).waitFor();await phone.getByText(/YouTube Live · Play and pause/).waitFor();
   const liveRequests=await phone.evaluate(()=>window.packets.filter(packet=>packet.type==='sync-request').length);
   await phone.getByRole('button',{name:'Start on this device',exact:true}).click();await frame(phone).getByRole('button',{name:'Play video on phone',exact:true}).click();
   await phone.waitForTimeout(1700);await frame(host).evaluate(()=>window.setTime(9500));await frame(phone).evaluate(()=>window.setTime(23));
   const initial=await playbackCommands(phone);assert.equal(initial.filter(command=>command==='seekTo').length,0,'live joining never seeks the guest to a VOD clock');
   for(let cycle=0;cycle<3;cycle++){
    await frame(host).evaluate(()=>window.setState(3));await phone.waitForTimeout(1150);assert.equal(await frame(phone).evaluate(()=>window.playerState()),1,'guest stays playing while host buffers');
    await frame(host).evaluate(()=>{window.setTime(window.position()+50);window.setState(1);});await phone.waitForTimeout(1150);
   }
   await frame(phone).evaluate(()=>window.setState(3));await phone.waitForTimeout(1100);await frame(phone).evaluate(()=>window.setState(1));
   await host.getByRole('button',{name:'Resync guests',exact:true}).click();await phone.waitForTimeout(1400);
   assert.deepEqual(await playbackCommands(phone),initial,'live heartbeats, host/guest buffering and resync never resend play/pause/seek');
   assert.ok(await timeline(host)>9500,'moving live duration does not clamp the host to the first duration');
   assert.ok(await position(phone)<100,'independent live clock is not forced to the host elapsed broadcast age');
   assert.equal(await phone.getByRole('button',{name:'−15 sec',exact:true}).isDisabled(),true);
   for(let cycle=0;cycle<2;cycle++){
    await host.getByRole('button',{name:'Pause',exact:true}).first().click();await phone.waitForTimeout(950);assert.equal(await frame(phone).evaluate(()=>window.playerState()),2);
    await host.getByRole('button',{name:'Play',exact:true}).first().click();await phone.waitForTimeout(950);assert.equal(await frame(phone).evaluate(()=>window.playerState()),1);
   }
   const after=await playbackCommands(phone);assert.deepEqual(after.slice(initial.length),['pauseVideo','playVideo','pauseVideo','playVideo'],'explicit live controls apply once per room transition');
   await phone.getByRole('button',{name:'Reload this player',exact:true}).click();await phone.getByText(/Your browser blocked autoplay/).waitFor();await frame(phone).getByRole('button',{name:'Play video on phone',exact:true}).click();await phone.waitForTimeout(1700);
   assert.equal((await playbackCommands(phone)).includes('seekTo'),false,'live player reload does not seek or change the room');
   assert.equal(await phone.evaluate(()=>window.packets.filter(packet=>packet.type==='sync-request').length),liveRequests);
  }
  checks.push('YouTube live links and watch URLs detected by host telemetry survive independent viewer clocks, three host buffering cycles, guest buffering, explicit resync and player reload without repeated play/pause/seek; deliberate room pause/resume still works once per action');
  await phone.getByRole('button',{name:'Start on this device',exact:true}).scrollIntoViewIfNeeded();await phone.screenshot({path:output.replace(/\.json$/,'-live-mobile.png')});await host.screenshot({path:output.replace(/\.json$/,'-live-desktop.png')});
  await add(host,'https://youtu.be/normalVod01');await panel(host).getByRole('button',{name:'Play next',exact:true}).click();await phone.getByText(/Your browser blocked autoplay/).waitFor();await frame(host).evaluate(()=>window.setTime(70));await frame(phone).getByRole('button',{name:'Play video on phone',exact:true}).click();await phone.waitForTimeout(2200);
  assert.ok(Math.abs(await position(phone)-await position(host))<1.5,'VOD following a live stream regains ordinary clock synchronization');assert.equal(await phone.getByRole('button',{name:'−15 sec',exact:true}).isDisabled(),false);
  checks.push('live detection is scoped to its title: switching back to a YouTube VOD restores seek controls and guest clock alignment');
 await add(host,'https://www.twitch.tv/videos/12345');await panel(host).getByRole('button',{name:'Play next',exact:true}).click();await host.waitForFunction(()=>window.fixtureTwitch?.state===1);await host.evaluate(()=>window.fixtureTwitch.seek(60));await phone.getByText(/Twitch blocked playback/).waitFor();
 const beforeTwitch=await phone.evaluate(()=>window.packets.filter(packet=>packet.type==='sync-request').length);await phone.getByRole('button',{name:'Play Twitch on phone',exact:true}).click();await phone.waitForTimeout(2000);assert.ok(Math.abs(await phone.evaluate(()=>window.fixtureTwitch.getCurrentTime())-await host.evaluate(()=>window.fixtureTwitch.getCurrentTime()))<1.25);assert.equal(await phone.evaluate(()=>window.packets.filter(packet=>packet.type==='sync-request').length),beforeTwitch);
 await phone.evaluate(()=>{window.fixtureTwitch.base-=8;});await phone.waitForTimeout(3200);assert.ok(Math.abs(await phone.evaluate(()=>window.fixtureTwitch.getCurrentTime())-await host.evaluate(()=>window.fixtureTwitch.getCurrentTime()))<1.5);
 checks.push('Twitch VOD first-start taps catch up locally without sending an old PLAY timestamp to the room; subsequent decoder drift is bounded and corrected');
 for(const page of pages)assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 writeFileSync(output,JSON.stringify({ok:true,channel,checks,errors,limitation:'Isolated desktop/mobile browser clients use real WebRTC and deterministic provider fixtures. Physical iOS/Android autoplay policy and provider ads/live latency are not emulated.'},null,2));
}catch(error){for(const [i,page]of pages.entries()){console.log(JSON.stringify({index:i,diagnostic:await page.evaluate(()=>({clock:document.querySelector('[data-room-clock]')?.getAttribute('data-room-clock'),packets:window.packets?.slice(-12),twitch:window.fixtureTwitch?.getCurrentTime()})).catch(()=>null)}));await page.screenshot({path:output.replace(/\.json$/,'-failure-'+i+'.png')}).catch(()=>{});console.log((await page.locator('body').innerText().catch(()=>'' )).slice(-2500));}writeFileSync(output,JSON.stringify({ok:false,checks,errors,error:error.stack},null,2));throw error;}finally{await browser.close();}
