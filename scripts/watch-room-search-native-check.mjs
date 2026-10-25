import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {checkedUrl,checkedOutputPath} from './browser-guard.mjs';
const origin=checkedUrl(process.argv[2]??'http://127.0.0.1:8080/'),output=checkedOutputPath(process.argv[3]??resolve('screenshots/watch-search-native.json'),[resolve('screenshots')]);
const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));
 await context.addInitScript(()=>{localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:false}));});
 await context.route('**/api/lan-origin',route=>route.fulfill({contentType:'application/json',body:'{"origins":[]}'}));
 await page.goto(origin);await page.locator('[data-home-ready="true"]').waitFor();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:'Watch room',exact:true}).click();await page.getByRole('button',{name:'Start room',exact:true}).click();
 await page.getByRole('navigation',{name:'Watch room shortcuts'}).getByRole('button',{name:'Find videos',exact:true}).click();const section=page.getByRole('region',{name:'Find room videos',exact:true});await section.getByRole('button',{name:'YouTube search',exact:true}).click();await section.getByRole('textbox',{name:'Search room videos',exact:true}).fill('iRacing Arcade');
 const responsePromise=page.waitForResponse(response=>response.url().includes('/_serverFn/')&&response.request().postData()?.includes('iRacing Arcade'),{timeout:60000});await section.getByRole('button',{name:'Search YouTube',exact:true}).click();const response=await responsePromise;await page.waitForFunction(()=>document.querySelector('[aria-label="Room video search results"]')?.getAttribute('aria-busy')==='false');
 const readTitles=()=>section.locator('[data-room-result-id]').evaluateAll(rows=>rows.map(row=>row.querySelector('button')?.getAttribute('aria-label')));
 const titles=await readTitles(),notice=await section.getByRole('status').innerText();let nextTitles=[],returned=false;
 if(await section.getByRole('button',{name:'More results',exact:true}).isEnabled()){
  const nextResponse=page.waitForResponse(response=>response.url().includes('/_serverFn/')&&response.request().postData()?.includes('iRacing Arcade'),{timeout:60000});await section.getByRole('button',{name:'More results',exact:true}).click();await nextResponse;await page.waitForFunction(()=>document.querySelector('[aria-label="Room video search results"]')?.getAttribute('aria-busy')==='false');nextTitles=await readTitles();
  await section.getByRole('button',{name:'Previous results',exact:true}).click();await page.waitForFunction(expected=>document.querySelector('[data-room-result-id] button')?.getAttribute('aria-label')===expected,titles[0]);returned=true;
 }
 await section.scrollIntoViewIfNeeded();await page.screenshot({path:output.replace(/\.json$/,'.png')});const ok=response.ok()&&titles.length>0&&nextTitles.some(title=>!titles.includes(title))&&returned&&!errors.length;writeFileSync(output,JSON.stringify({ok,query:'iRacing Arcade',status:response.status(),titles,nextTitles,returned,notice,errors,fixture:false},null,2));if(!ok)process.exitCode=1;
}finally{await browser.close();}
