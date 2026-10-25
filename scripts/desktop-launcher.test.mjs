import test from 'node:test';
import assert from 'node:assert/strict';
import { readiness, startServices } from './start-desktop.mjs';
test('starts stopped services then waits', async()=>{ const started=[], seen=new Set(); await startServices({probe:async s=>{if(seen.has(s))return 'Ready';seen.add(s);return 'Stopped';},start:s=>started.push(s)});assert.deepEqual(started,['Server','Companion']); });
test('reuses ready or starting services',async()=>{let calls=0;await startServices({probe:async()=>++calls>2?'Ready':'Waiting',start:()=>assert.fail('duplicate')});});
test('refuses foreign listeners',async()=>{await assert.rejects(startServices({probe:async()=> 'Foreign',start:()=>assert.fail('started')}),/another application/);});
test('bounds startup',async()=>{let time=0;await assert.rejects(startServices({probe:async()=> 'Waiting',start(){},now:()=>time,wait:async()=>{time+=100;},timeout:200}),/timed out/);});
test('requires identity and trusted origin',async()=>{assert.equal(await readiness('http://127.0.0.1:8080/','Server',async()=>new Response('<title>Realhub</title>')),'Ready');assert.equal(await readiness('http://127.0.0.1:8080/','Server',async()=>new Response('<title>Other</title>')),'Foreign');assert.equal(await readiness('http://127.0.0.1:43123/','Companion',async(_,o)=>{assert.equal(o.headers.Origin,'http://127.0.0.1:8080');return Response.json({service:'reelcase-companion'});}),'Ready');});
