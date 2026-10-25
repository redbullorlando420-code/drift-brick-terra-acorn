import assert from 'node:assert/strict';
import {fromJSON} from 'seroval';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {checkedUrl,checkedOutputPath} from './browser-guard.mjs';
const url=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??'screenshots/youtube-live-pipeline-browser.json',[resolve('screenshots')]);
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
const dataOf=value=>{if(!value||typeof value!=='object')return;if(Array.isArray(value.channels))return value;for(const child of Object.values(value)){const result=dataOf(child);if(result)return result;}};
try{for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],checks=[],calls=[];page.setDefaultTimeout(45000);const report={viewport:viewport.name,checks,errors};reports.push(report);
 let release,held=false,active=0,peak=0,lateDelivered=false;const gate=new Promise(resolve=>release=resolve);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_ABORTED/.test(m.text()))errors.push(m.text());});
 await context.addInitScript(()=>{localStorage.setItem('reelcase.pull-settings.v1',JSON.stringify({automaticPulls:false,requestGapMs:1500,youtubeRequestGapMs:1500}));localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:false,tools:true}));});
 await context.route('http://127.0.0.1:43123/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":false}'}));
 await page.route('**/_serverFn/**',async route=>{const data=dataOf(fromJSON(JSON.parse(route.request().postData()??'{}')));let result=null;
 if(data){assert(data.youtubeLiveOnly);assert(data.channels.length<=8);calls.push(data);peak=Math.max(peak,++active);try{
  if(!held){held=true;await gate;lateDelivered=true;}
  const now=Date.now(),channels=data.channels.map(c=>({...c,live:false,liveCheckedAt:now,lastLiveFailure:undefined}));result={channels,videos:[],refreshedIds:channels.map(c=>c.id),liveCheckedIds:channels.map(c=>c.id),retryAt:{}};
 }finally{active--;}}
 await route.fulfill({contentType:'application/json',body:JSON.stringify({result,context:{}})}).catch(()=>{});
 });
 const navigate=async name=>{if(viewport.name==='mobile')await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:new RegExp('^'+name+'(?:\\s+\\d+)?$')}).click();};
 const status=()=>page.getByRole('region',{name:'YouTube quick live checks',exact:true});
 try{
  await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();
  await page.evaluate(()=>{const channels=Array.from({length:48},(_,i)=>{const channelId='UC'+String(i).padStart(22,'0');return{id:'yt:'+channelId,channelId,kind:'youtube',title:'Pipeline '+i,handle:'pipeline'+i};});localStorage.setItem('reelcase.follows.v1',JSON.stringify({channels,savedAt:Date.now()}));});
  await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await navigate('Live');await status().getByRole('button',{name:'Check due YouTube creators (48)',exact:true}).click();
  await status().getByText('40 / 48 creators checked successfully',{exact:false}).waitFor();assert(held);assert.equal(lateDelivered,false);assert(peak<=3&&peak>=2,'peak='+peak+', active='+active);assert.equal(calls.length,6);checks.push('40 healthy creators finish and update visible coverage before a stalled eight-creator batch, through a bounded three-request pipeline');
  await status().scrollIntoViewIfNeeded();await page.screenshot({path:output.replace('.json','-'+viewport.name+'.png')});
  await navigate('Settings');await page.getByRole('button',{name:'Cancel current pull queue',exact:true}).click();await navigate('Live');await status().getByRole('button',{name:'Check due YouTube creators (8)',exact:true}).waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('progress[aria-label="YouTube live check progress"]')?.closest('[role="status"]')?.textContent.includes('Checking'));
  release();await page.waitForTimeout(300);assert.equal(lateDelivered,true);await status().getByText('40 / 48 creators checked successfully',{exact:false}).waitFor();assert.equal(await status().getByText(/latest YouTube checks need attention/).count(),0);checks.push('cancel releases the held request, ignores its late response and preserves healthy observations without marking cancellations as creator failures');
  await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await navigate('Live');await status().getByText('40 / 48 creators checked successfully',{exact:false}).waitFor();await status().getByRole('button',{name:'Check due YouTube creators (8)',exact:true}).click();await status().getByText('48 / 48 creators checked successfully',{exact:false}).waitFor();await status().getByText(/Check complete/).waitFor();checks.push('saved partial coverage survives reload and due-only retry checks the remaining eight creators');
  assert.equal(calls.length,7);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);report.requests=calls.length;report.peakRequests=peak;
 }catch(error){report.error=error.stack;console.log((await page.locator('body').innerText()).slice(0,5000));await page.screenshot({path:output.replace('.json','-'+viewport.name+'-failure.png')}).catch(()=>{});throw error;}
 finally{release();await page.unrouteAll({behavior:'ignoreErrors'});await context.unrouteAll({behavior:'ignoreErrors'});await context.close();writeFileSync(output,JSON.stringify({ok:reports.every(r=>!r.error),reports,limitation:'Isolated desktop/mobile Chrome using real client scheduler, UI and persistence with controlled provider responses; upstream reads are checked separately.'},null,2));}
}}finally{await browser.close();}
console.log(JSON.stringify({ok:true,reports},null,2));
