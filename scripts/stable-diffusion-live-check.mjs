import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'chrome'}:{})});
try {
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await context.addInitScript(()=>{localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:true}))});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(20000);
  await page.goto('http://127.0.0.1:8080/',{waitUntil:'domcontentloaded'});await page.locator('[data-home-ready="true"]').waitFor();
  await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:'Stable Diffusion',exact:true}).click();
  const check = async()=>{const response=page.waitForResponse(r=>r.url().endsWith('/studio/status')&&r.request().method()==='GET');await page.getByRole('button',{name:'Check local engine',exact:true}).click();await response;await page.getByRole('button',{name:'Check local engine',exact:true}).waitFor();};
  await check();
  const ready=page.getByText('Connected · checkpoint ready',{exact:true});
  if(!await ready.isVisible()){
    const start=page.getByRole('button',{name:'Start local engine',exact:true});
    if(await start.isVisible())await start.click();
    for(let attempt=0;attempt<90&&!await ready.isVisible();attempt++){
      await page.waitForTimeout(10000);await check();
      console.log(`Engine startup check ${attempt+1}`);
      if(!await ready.isVisible()&&await page.getByRole('button',{name:'Start local engine',exact:true}).isVisible())throw Error('The owned engine exited before becoming ready. Check its native log.');
    }
  }
  await ready.waitFor();
  await page.getByLabel('Image prompt',{exact:true}).fill('A small green tree on a quiet hillside, watercolor illustration, soft morning light');
  await page.getByLabel('Generation steps',{exact:true}).fill('20');await page.getByLabel('Generation seed',{exact:true}).fill('42');
  await page.getByRole('button',{name:'Generate image',exact:true}).click();
  await Promise.race([
    page.getByRole('heading',{name:'Generated image',exact:true}).waitFor({timeout:60000}),
    page.getByRole('alert').first().waitFor({timeout:60000}).then(async()=>{await page.screenshot({path:'screenshots/stable-diffusion-live-error.png'});throw Error(await page.getByRole('alert').first().innerText())}),
  ]);
  console.log('Generated image rendered; downloading PNG');
  const wait=page.waitForEvent('download');await page.getByRole('link',{name:'Download PNG',exact:true}).click();const download=await wait;await download.saveAs('screenshots/stable-diffusion-live.png');
  const bytes=readFileSync('screenshots/stable-diffusion-live.png');assert.equal(bytes.readUInt32BE(16),512);assert.equal(bytes.readUInt32BE(20),512);assert.ok(bytes.length>10000);
  await page.screenshot({path:'screenshots/stable-diffusion-live-desktop.png'});await page.setViewportSize({width:390,height:844});await page.getByRole('heading',{name:'Generated image',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'screenshots/stable-diffusion-live-mobile.png'});
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const result={ok:true,actualLocalGeneration:true,width:512,height:512,bytes:bytes.length,errors};writeFileSync('screenshots/stable-diffusion-live.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close()}
