import { chromium } from 'playwright';
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8081/');
 await page.getByText('Small ratings, clearer shelves.',{exact:true}).waitFor();
 if(errors.length) throw Error(JSON.stringify(errors));
 console.log(JSON.stringify({width,hydrated:true,errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
 await page.screenshot({path:`screenshots/adult-perf-built-settled-${width}.png`});
 await page.close();
}
await browser.close();
