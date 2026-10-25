import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={responses:[],frameNavigations:[],errors:[]};
try{
 const context=await browser.newContext(),page=await context.newPage();
 await context.route('**/*',route=>['image','media','font'].includes(route.request().resourceType())?route.abort():route.continue());
 page.on('response',async response=>{if(response.request().resourceType()==='document'&&/myfreecams/.test(response.url()))report.responses.push({url:response.url(),status:response.status(),xFrameOptions:response.headers()['x-frame-options']??null,frameAncestors:response.headers()['content-security-policy']?.match(/frame-ancestors[^;]*/)?.[0]??null});});
 page.on('framenavigated',frame=>report.frameNavigations.push({main:frame===page.mainFrame(),url:frame.url()}));
 page.on('pageerror',error=>report.errors.push(error.message));
 await page.goto('http://127.0.0.1:8080/');await page.locator('[data-home-ready="true"]').waitFor();
 // An isolated QA document on the app's origin, with exactly the shipped iframe permissions.
 await page.setContent('<iframe title="Official MFC page" src="https://app.myfreecams.com/" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation" allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>');
 await page.waitForTimeout(8000);
 const frame=page.frames().find(frame=>frame.url().startsWith('https://app.myfreecams.com/'));
 report.frame=frame?{url:frame.url(),title:await frame.title(),elements:await frame.locator('body *').count()}:null;
 report.ok=Boolean(report.frame?.elements>5&&report.responses.some(response=>response.status===200));
 report.limitation='Official page tested from app origin in an isolated browser. Images, media and fonts blocked deliberately; no playback, account login or age confirmation tested.';
 writeFileSync('screenshots/live-priority-native-mfc.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 if(!report.ok)process.exitCode=1;
}finally{await browser.close();}
