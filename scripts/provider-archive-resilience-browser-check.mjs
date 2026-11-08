import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { fromJSON } from "seroval";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const built = process.argv[2] === "--built";
const url = checkedUrl(built ? "http://127.0.0.1:8083/" : process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/provider-archive-resilience.json", [resolve("screenshots")]);
let server, held = false, cancelled = false, upstream = [], suffix = "";
const native = globalThis.fetch;
const saved = after => JSON.stringify({v:1,stage:"ARCHIVE",after});
function reset(){held=false;cancelled=false;upstream=[];}
if (built) {
  globalThis.fetch = async (input, options) => {
    const u = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    if (u.hostname !== "gql.twitch.tv") return native(input, options);
    const { variables, query } = JSON.parse(options.body);
    if (!query.includes("videos(")) return Response.json({data:{user:{id:"12345",stream:null}}});
    const after = variables.after ?? null;
    upstream.push(after);
    if (after === "historical-next"+suffix) return new Response(new ReadableStream({
      start(c){c.enqueue(new Uint8Array([123]));held=true;},
      cancel(){cancelled=true;},
    }));
    const edges = Array.from({length:after ? variables.first : 2}, (_,i)=>({
      cursor:String(i),node:{id:String((after?10000:20000)+i),title:after?"Earlier VOD "+i:"Rechecked VOD "+i,
        lengthSeconds:800,publishedAt:"2026-10-24T20:00:00Z"},
    }));
    return Response.json({data:{user:{id:"12345",displayName:"Archive Fixture",stream:null,videos:{
      pageInfo:{hasNextPage:true,endCursor:after?"historical-next"+suffix:"unused-head-token"},edges,
    }}}});
  };
  process.env.REELCASE_VERCEL_QA_PORT = "8083";
  ({server}=await import("./serve-vercel-output.mjs"));
}
const browser=await chromium.launch({channel:"chrome",headless:true}),reports=[];
try {
  for (const mobile of [false,true]) {
    reset();
    suffix=mobile?"-mobile":"";
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
    const page=await context.newPage(), report={mobile,checks:[],errors:[]};
    reports.push(report);
    page.setDefaultTimeout(12000);
    page.on("pageerror",error=>report.errors.push(error.message));
    page.on("console",message=>{if(message.type()==="error"&&!/ERR_ABORTED/.test(message.text()))report.errors.push(message.text());});
    await context.addInitScript(suffix => {
      localStorage.setItem("reelcase.pulls-paused.v1","false");
      localStorage.setItem("reelcase.pull-settings.v1",JSON.stringify({automaticPulls:false}));
      localStorage.setItem("reelcase.sidebar.groups.v1",JSON.stringify({library:true,tools:true,workspace:true}));
      if (!localStorage.getItem("reelcase.follows.v1")) localStorage.setItem("reelcase.follows.v1",JSON.stringify({savedAt:Date.now(),
        channels:[{id:"tw:archivefixture",kind:"twitch",handle:"archivefixture",title:"Archive Fixture",channelId:"12345",
          twitchArchiveCursor:JSON.stringify({v:1,stage:"ARCHIVE",after:"saved"+suffix}),liveCheckedAt:Date.now()}]}));
    },suffix);
    await context.route("http://127.0.0.1:43123/**",r=>r.fulfill({contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:'{"ok":false}'}));
    await context.route("https://*.twitch.tv/**",r=>r.fulfill({status:200,body:""}));
    if (!built) await context.route("**/_serverFn/**",r=>{
      const input=fromJSON(JSON.parse(r.request().postData()??"{}"));
      const data=input.data??input;
      const ch=data.channels?.[0];
      const now=Date.now();
      if (ch && data.twitchContinueArchive) upstream.push(JSON.parse(ch.twitchArchiveCursor).after);
      const channel=ch?{...ch,lastCheckedAt:now,twitchArchiveCheckedAt:now,twitchArchiveCursor:saved("historical-next"+suffix),
        twitchArchiveDiagnostics:{at:now,pages:1,received:76,accepted:76,duplicates:0,headCheckedAt:now,headObserved:2,resumed:true,stage:"ARCHIVE",stopReason:"entry-budget"}}:undefined;
      return r.fulfill({contentType:"application/json",body:JSON.stringify({result:{channels:channel?[channel]:[],videos:[],refreshedIds:channel?[channel.id]:[],liveCheckedIds:[],retryAt:{}},context:{}})});
    });
    const nav=async label=>{
      if(mobile)await page.getByRole("button",{name:"Open menu",exact:true}).click();
      await page.getByRole("navigation",{name:"Library navigation"}).getByRole("button",{name:new RegExp("^"+label+"(?:\\s+\\d+)?$")}).click();
    };
    const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels.find(row=>row.id==="tw:archivefixture"));
    const next=async()=>{
      const toggle=page.getByRole("button",{name:"Twitch pull controls",exact:true});
      if(await toggle.getAttribute("aria-expanded")==="false")await toggle.click();
      const panel=page.getByRole("region",{name:"Twitch pull control"});
      await panel.getByRole("combobox",{name:"Twitch pull creators"}).selectOption("tw:archivefixture");
      await panel.getByRole("button",{name:"Continue older videos",exact:true}).click();
    };
    const wait=async check=>{for(let i=0;i<160;i++){if(await check())return;await new Promise(r=>setTimeout(r,50));}throw Error("Expected archive evidence did not arrive.");};
    try {
      await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();await nav("Twitch");
      await next();
      await wait(async()=>JSON.parse((await data()).twitchArchiveCursor).after==="historical-next"+suffix);
      assert.deepEqual(upstream,built?["saved"+suffix,null]:["saved"+suffix]);
      await page.reload();await page.locator('[data-home-ready="true"]').waitFor();await nav("Twitch");
      const coverage=page.locator("[data-twitch-coverage]");
      await coverage.locator("summary").click();
      const evidence=coverage.getByText(/Newest window: 2 rows rechecked/);
      await evidence.waitFor();await evidence.scrollIntoViewIfNeeded();
      await page.screenshot({path:output.replace(".json",mobile?"-mobile.png":"-desktop.png")});
      assert.equal(JSON.parse((await data()).twitchArchiveCursor).after,"historical-next"+suffix);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      report.checks.push("Resumed pull preserves historical cursor and newest-window evidence across reload.");
      if (built) {
        await next();await wait(()=>held);
        await nav("Settings");
        await page.getByRole("button",{name:"Cancel current pull queue",exact:true}).click();
        await wait(()=>cancelled);
        assert.deepEqual(upstream,["saved"+suffix,null,"historical-next"+suffix]);
        assert.equal(JSON.parse((await data()).twitchArchiveCursor).after,"historical-next"+suffix);
        report.checks.push("Browser cancellation closed the HTTP request, released the upstream body and retained the last saved position.");
      }
      assert.deepEqual(report.errors,[]);
    } catch(error) {
      report.error=String(error);
      await page.screenshot({path:output.replace(".json",mobile?"-mobile-failure.png":"-desktop-failure.png")}).catch(()=>{});
      console.error(error);
    } finally {await context.close();}
  }
} finally {
  await browser.close();
  globalThis.fetch=native;
  if(server)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
writeFileSync(output,JSON.stringify(reports,null,2));console.log(JSON.stringify(reports));
if(reports.some(row=>row.error))process.exitCode=1;
