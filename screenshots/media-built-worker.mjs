import {chromium} from 'playwright';
import {readdirSync,writeFileSync} from 'node:fs';
const filename=readdirSync('.vercel/output/static/assets').find(f=>f.startsWith('search.worker-')&&f.endsWith('.js'));
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage(); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8081/');
 const result=await page.evaluate(filename=>new Promise((resolve,reject)=>{
  const worker=new Worker('/assets/'+filename,{type:'module'}); let offset=0;let batches=0;const start=performance.now();
  const timeout=setTimeout(()=>{worker.terminate();reject(Error('worker timed out'));},20000);
  worker.onerror=e=>reject(Error(e.message));
  function send(){const batch=Array.from({length:Math.min(128,20000-offset)},(_,i)=>({video:{id:String(offset+i),name:'Space telescope '+(offset+i),path:'sample',remote:{kind:(offset+i)%2?'youtube':'twitch'}},tags:['science'],category:'Learning'}));
   worker.postMessage({type:'batch',generation:1,reset:offset===0,done:offset+batch.length===20000,batch}); offset+=batch.length;batches++;
  }
  worker.onmessage=({data})=>{
   if(data.type==='next')send();
   if(data.type==='ready')worker.postMessage({type:'search',generation:1,requestId:1,query:'science telescope 19999 youtube'});
   if(data.type==='result'){clearTimeout(timeout);worker.terminate();if(JSON.stringify(data.ids)!=='["19999"]')reject(Error(JSON.stringify(data)));else resolve({titles:offset,batches,elapsedMs:performance.now()-start});}
  };send();
 }),filename);
 if(errors.length)throw Error(JSON.stringify(errors));
 writeFileSync('screenshots/media-built-worker.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}
