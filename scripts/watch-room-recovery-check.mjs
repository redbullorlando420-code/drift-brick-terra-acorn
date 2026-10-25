import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const origin=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/');
const output=checkedOutputPath(process.argv[3]??resolve('screenshots/watch-room-recovery.json'),[resolve('screenshots')],'Recovery check');
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[],checks=[];
try {
  const contexts=await Promise.all([{width:1280,height:800},{width:390,height:844}].map(viewport=>browser.newContext({viewport})));
  const twitchAttempts=[0,0];
  for(const context of contexts){
    await context.addInitScript(()=>{
      localStorage.setItem('reelcase.pulls-paused.v1','true');
      localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:false}));
      window.__recoveryMessages=[];
      window.addEventListener('message',event=>{
        const frame=document.querySelector('iframe[title^="YouTube"]');
        window.__recoveryMessages.push({origin:event.origin,active:event.source===frame?.contentWindow,data:event.data});
        if(window.__recoveryMessages.length>20)window.__recoveryMessages.shift();
      });
    });
    await context.route('**/api/lan-origin',route=>route.fulfill({contentType:'application/json',body:'{"origins":[]}'}));
    await context.route('http://127.0.0.1:43123/**',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
    await context.route(/https:\/\/(?:www.youtube.com|i.ytimg.com)\//,route=>route.fulfill({contentType:'text/html',body:'<p>Provider fixture</p><script>window.commands=[];addEventListener("message",e=>{try{commands.push(JSON.parse(e.data));}catch{}});</script>'}));
    const index=contexts.indexOf(context);
    await context.route('https://player.twitch.tv/js/embed/v1.js',route=>{
      twitchAttempts[index]++;
      if(twitchAttempts[index]===1)return route.abort('failed');
      return route.fulfill({contentType:'application/javascript',body:'window.Twitch={Player:class {constructor(target){this.events={};this.time=0;document.getElementById(target).textContent="Twitch fixture player";setTimeout(()=>this.events.ready?.forEach(fn=>fn()),20);}addEventListener(event,fn){(this.events[event]??=[]).push(fn);}getCurrentTime(){return this.time;}getDuration(){return 60;}seek(value){this.time=value;}setMuted(){}play(){}pause(){}}};'});
    });
  }
  const [host,phone]=await Promise.all(contexts.map(context=>context.newPage()));
  for(const page of [host,phone])page.on('pageerror',error=>errors.push(error.message));
  await host.goto(origin);await host.locator('[data-home-ready="true"]').waitFor();
  await host.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:'Watch room',exact:true}).click();
  await host.getByRole('button',{name:'Start room',exact:true}).click();
  const code=(await host.getByRole('heading',{name:/^Room RC/}).innerText()).match(/RC[A-Z0-9]+/)[0];
  const panel=page=>page.getByRole('region',{name:'Room query and queue',exact:true});
  await panel(host).getByRole('textbox',{name:'Public video link',exact:true}).fill('https://youtu.be/dQw4w9WgXcQ\nhttps://youtu.be/aqz-KE-bpKQ');
  await panel(host).getByRole('button',{name:'Add link to queue',exact:true}).click();
  await panel(host).getByRole('button',{name:'Play next',exact:true}).click();
  await phone.goto(new URL(`/?room=${code}&theater=1`,origin).href);
  await phone.locator('iframe[title="YouTube · dQw4w9WgXcQ"]').waitFor({timeout:45000});
  const event=async(type,info)=>phone.frameLocator('iframe[title="YouTube · dQw4w9WgXcQ"]').locator('body').evaluate((_element,{type,info})=>window.parent.postMessage(JSON.stringify({event:type,info}),'*'),{type,info});
  await event('onError',101);
  try{await phone.getByText(/This creator does not allow embedded playback/).waitFor({timeout:6000});}
  catch(error){console.log(JSON.stringify(await phone.evaluate(()=>({messages:window.__recoveryMessages,frames:Array.from(document.querySelectorAll('iframe')).map(frame=>({src:frame.src,title:frame.title})),text:document.body.innerText.slice(-7000)}))));throw error;}
  checks.push('trusted player errors show recovery without skipping');
  await phone.getByRole('button',{name:'Reload this player',exact:true}).click();
  await phone.getByText(/Reloading this player only/).waitFor();
  await event('onAutoplayBlocked');await phone.getByText(/Your browser blocked autoplay/).waitFor();
  assert.equal(await panel(host).locator('[data-room-queue-id]').count(),1);
  await phone.getByRole('navigation',{name:'Watch room shortcuts'}).getByRole('button',{name:/^Queue ·/}).click();
  assert.equal(await phone.evaluate(()=>document.activeElement?.textContent),'Up next for everyone');
  checks.push('device-only reload and queue shortcut preserve the shared queue');
  assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await phone.screenshot({path:output.replace(/\.json$/,'-mobile.png')});
  await panel(host).getByRole('textbox',{name:'Public video link',exact:true}).fill('https://twitch.tv/videos/454545');
  await panel(host).getByRole('button',{name:'Add link to queue',exact:true}).click();
  await panel(host).getByRole('button',{name:'Play Twitch · 454545',exact:true}).click();
  for(const page of [host,phone]){
    await page.getByText('Twitch interactive player could not load. Open Twitch directly below.',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Reload this player',exact:true}).click();
    await page.getByText('Twitch player ready. Use room controls to start.',{exact:true}).waitFor();
  }
  assert.deepEqual(twitchAttempts,[2,2]);
  checks.push('host and guest retry failed Twitch script loads with a fresh bounded attempt');
  assert.deepEqual(errors,[]);writeFileSync(output,JSON.stringify({ok:true,checks,errors},null,2));
}catch(error){writeFileSync(output,JSON.stringify({ok:false,checks,errors,error:String(error)},null,2));throw error;}
finally{await browser.close();}
