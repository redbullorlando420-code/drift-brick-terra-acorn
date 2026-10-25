import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile,readFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome'}),context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
await context.addInitScript(()=>{localStorage.setItem('reelcase.pulls-paused.v1','true');localStorage.setItem('reelcase.sidebar.groups.v1',JSON.stringify({library:true,workspace:true,tools:true}));});
const page=await context.newPage(),errors=[],result={native:true,errors},prompt='A small red cabin beside a still mountain lake at sunrise, watercolor illustration, soft morning light, no text';page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.goto('http://127.0.0.1:8080/');await page.locator('[data-home-ready="true"]').waitFor();await page.getByRole('navigation',{name:'Library navigation'}).getByRole('button',{name:'Stable Diffusion',exact:true}).click();
 await page.getByLabel('Image engine',{exact:true}).selectOption('comfy');await page.getByRole('button',{name:'Check local engine',exact:true}).click();await page.getByText('Connected · checkpoint ready',{exact:true}).waitFor();
 await page.getByLabel('Selected image model',{exact:true}).selectOption('qwen_image_2.1_turbo_int8_convrot.safetensors');await page.getByLabel('Image prompt',{exact:true}).fill(prompt);await page.getByLabel('Generation seed',{exact:true}).fill('42');assert.equal(await page.getByLabel('Generation steps',{exact:true}).inputValue(),'8');
 const started=Date.now();await page.getByRole('button',{name:'Generate image',exact:true}).click();console.log('Generating one actual Qwen image through the app…');
 await page.getByRole('heading',{name:'Generated image',exact:true}).waitFor({timeout:610000});result.seconds=(Date.now()-started)/1000;
 const img=page.getByRole('img',{name:prompt,exact:true});await img.waitFor();await img.evaluate(image=>image.decode());assert.deepEqual(await img.evaluate(image=>[image.naturalWidth,image.naturalHeight]),[512,512]);
 const downloading=page.waitForEvent('download');await page.getByRole('link',{name:'Download PNG',exact:true}).click();const download=await downloading;await download.saveAs('screenshots/qwen-native.png');
 const bytes=await readFile('screenshots/qwen-native.png');assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 await page.getByRole('heading',{name:'Stable Diffusion',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'screenshots/qwen-native-desktop.png'});
 await page.setViewportSize({width:390,height:844});await img.scrollIntoViewIfNeeded();await page.screenshot({path:'screenshots/qwen-native-mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.getByRole('button',{name:'Release model memory',exact:true}).click();await page.getByRole('status').filter({hasText:'Model memory release requested.'}).waitFor();assert.deepEqual(errors,[]);Object.assign(result,{ok:true,pngBytes:bytes.length,width:512,height:512,seed:42,steps:8,downloaded:true,memoryRelease:true});
}catch(error){result.ok=false;result.error=error.stack;result.alerts=await page.getByRole('alert').allTextContents();await page.screenshot({path:'screenshots/qwen-native-failure.png'}).catch(()=>{});}finally{await context.close();await browser.close();}
await writeFile('screenshots/qwen-native-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
