import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCreativeTools, generationPayload, remotePeer, readEngineJson } from '../companion/creative-tools.mjs';
import { youtubeWatchPublication } from '../src/lib/remote/youtube-publication.ts';
import { youtubePublicationTime, retainYoutubeMetadata } from '../src/lib/videos/youtube-metadata.ts';
import { studioSettings, studioSettingsError, generatedSeed } from '../src/lib/studio-settings.ts';
import { generatedCheckpoint, parseRecipe, recipeDocument, restoreRecipes, MAX_STUDIO_RECIPES } from '../src/lib/studio-recipes.ts';
import { StudioSession, createStudioSessions } from '../src/lib/studio-session.ts';

test('studio requests survive navigation, keep the submitted settings and retain a prior image on failure', async () => {
  let complete, calls = 0, notifications = 0;
  const pending = new Promise(resolve => complete = resolve);
  const session = new StudioSession(async () => { calls++; if(calls > 1) throw new Error('Engine failed'); return pending; });
  const settings = { prompt: 'A tree', negative: '', steps: 20, seed: -1, size: 512 };
  const stop = session.subscribe(() => notifications++), running = session.generate(settings);
  assert.equal(session.getSnapshot().busy, true); await session.generate(settings); assert.equal(calls, 1);
  stop(); settings.prompt = 'A changed form'; complete({ image: 'iVBORw0KGgoAAAA=', info: '{"seed":42,"sd_model_name":"local-model"}' }); await running;
  assert.equal(notifications, 1, 'unmounted views receive no notifications');
  const result = session.getSnapshot().image; assert.equal(result.settings.prompt, 'A tree'); assert.equal(result.seed, 42); assert.equal(result.checkpoint, 'local-model'); assert.ok(result.blob.size > 0);
  const back = session.subscribe(() => notifications++); await session.generate(settings); assert.equal(session.getSnapshot().image, result); assert.match(session.getSnapshot().error, /Engine failed/);
  session.clearImage(); assert.equal(session.getSnapshot().image, null); back();
});

test('studio session storage is bounded and isolates each account', () => {
  const get = createStudioSessions(async () => ({}));
  const first = get('first'), second = get('second');
  assert.notEqual(first, second); assert.equal(get('first'), first);
  get('third'); assert.notEqual(get('second'), second, 'least recently used session is released');
});

test('duplicate interrupts are coalesced and a returned partial image is labeled honestly', async () => {
  let complete, interrupted = 0;
  const pending = new Promise(resolve => complete = resolve);
  const session = new StudioSession(async path => { if(path.endsWith('interrupt')) {interrupted++; return {}} return pending });
  const running = session.generate({ prompt: 'A tree', negative: '', steps: 20, seed: 42, size: 512 });
  session.clearImage(); assert.equal(session.getSnapshot().busy, true);
  await session.interrupt(); await session.interrupt(); assert.equal(interrupted, 1);
  complete({ image: 'iVBORw0KGgoAAAA=' }); await running;
  assert.match(session.getSnapshot().note, /partial image/); assert.equal(session.getSnapshot().busy, false);
});

test('portable recipes round-trip only approved settings and reject unsupported files', () => {
  const recipe = { name: 'Forest', settings: { prompt: 'A forest', negative: 'blurry', steps: 20, seed: 12345, size: 512 }, checkpoint: 'sd15' };
  assert.deepEqual(parseRecipe(JSON.stringify(recipeDocument(recipe))), recipe);
  const untrusted = { ...recipeDocument(recipe), password: 'not-imported', settings: { ...recipe.settings, scripts: ['do not run'] } };
  const parsed = parseRecipe(JSON.stringify(untrusted)); assert.equal(parsed.password, undefined); assert.equal(parsed.settings.scripts, undefined);
  for (const text of ['not json', '{}', JSON.stringify({ ...recipeDocument(recipe), version: 2 }), JSON.stringify({ ...recipeDocument(recipe), settings: { ...recipe.settings, seed: 1.5 } }), JSON.stringify({ ...recipeDocument(recipe), settings: { ...recipe.settings, size: 9999 } }), 'x'.repeat(64001)]) assert.throws(() => parseRecipe(text));
  const full = { ...recipe, settings: { ...recipe.settings, prompt: '\u0000'.repeat(4000), negative: '森'.repeat(4000) } };
  assert.deepEqual(parseRecipe(JSON.stringify(recipeDocument(full))), full);
  assert.equal(generatedCheckpoint('{"sd_model_name":"verified-local-model"}'), 'verified-local-model');
  assert.equal(generatedCheckpoint('{}'), undefined);
});

test('recipe restoration is bounded and keeps valid entries when another is damaged', () => {
  const row = { id: 'saved', savedAt: 1000, name: 'Forest', settings: { prompt: 'A forest', negative: '', steps: 20, seed: 42, size: 512 } };
  assert.equal(restoreRecipes(JSON.stringify([{ ...row, id: 'broken', settings: {} }, row, row])).length, 1);
  assert.equal(restoreRecipes(JSON.stringify(Array.from({ length: 40 }, (_, i) => ({ ...row, id: `recipe:${i}` })))).length, MAX_STUDIO_RECIPES);
  assert.deepEqual(restoreRecipes('{broken'), []);
});

test('engine response limit cancels chunked and declared oversized bodies before buffering all data', async () => {
  let cancelled = false;
  const body = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(16)); }, cancel() { cancelled = true; } });
  await assert.rejects(readEngineJson(new Response(body), 32), /size budget/); assert.equal(cancelled, true);
  let declaredCancelled = false;
  const declared = new ReadableStream({ cancel() { declaredCancelled = true; } });
  await assert.rejects(readEngineJson(new Response(declared, { headers: { 'content-length': '1000' } }), 32), /size budget/); assert.equal(declaredCancelled, true);
  const encoded = new TextEncoder().encode('{"title":"森林"}');
  const split = new ReadableStream({ start(controller) { controller.enqueue(encoded.slice(0, 11)); controller.enqueue(encoded.slice(11)); controller.close(); } });
  assert.deepEqual(await readEngineJson(new Response(split), 100), { title: '森林' });
});
test('publication comes from the matching video, never a pull time, relative label or recommended date', () => {
  const id = 'jNQXAC9IVRw';
  const page = data => `var ytInitialPlayerResponse = ${JSON.stringify(data)};`;
  assert.equal(youtubeWatchPublication(page({ videoDetails: { videoId: id }, microformat: { playerMicroformatRenderer: { publishDate: '2005-04-23', uploadDate: '2005-04-22' } }, recommended: { publishDate: '2026-10-18' } }), id), '2005-04-23');
  assert.equal(youtubeWatchPublication(page({ videoDetails: { videoId: 'other' }, microformat: { playerMicroformatRenderer: { publishDate: '2026-10-18' } } }), id), undefined);
  assert.equal(youtubeWatchPublication(page({ videoDetails: { videoId: id, isLiveContent: true }, microformat: { playerMicroformatRenderer: { publishDate: '2026-10-18', liveBroadcastDetails: { isLiveNow: true } } } }), id), undefined);
  assert.equal(youtubeWatchPublication(`watch?v=${id}<meta content="2005-04-23" itemprop="datePublished">`, id), '2005-04-23');
  for (const date of ['2 days ago', '2026-02-30', '', 'today']) assert.equal(youtubeWatchPublication(page({ videoDetails: { videoId: id }, microformat: { playerMicroformatRenderer: { publishDate: date } } }), id), undefined);
  const imported = { id, addedAt: Date.now(), remote: { kind: 'youtube' } }; assert.equal(youtubePublicationTime(imported), 0);
  const verified = { ...imported, addedAt: Date.parse('2005-04-23'), remote: { ...imported.remote, publishedSource: 'watch', publishedDate: '2005-04-23' } };
  const merged = retainYoutubeMetadata(verified, { ...imported, addedAt: Date.now(), remote: { kind: 'youtube', publishedSource: 'rss' } }); assert.equal(merged.addedAt, verified.addedAt); assert.equal(merged.remote.publishedDate, '2005-04-23');
});
test('generation sends a bounded allow-list and rejects missing/oversized prompts and bad numbers', () => {
  const payload = generationPayload({ prompt: ' Hello ', steps: 20, scripts: ['bad'], override_settings: { bad: true } });
  assert.equal(payload.prompt, 'Hello'); assert.equal(payload.batch_size, 1); assert.equal(payload.scripts, undefined); assert.equal(payload.override_settings, undefined);
  for (const body of [{}, { prompt: 'x'.repeat(4001) }, { prompt: 'x', steps: 100 }, { prompt: 'x', width: 4096 }, { prompt: 'x', width: 257 }, { prompt: 'x', negativePrompt: {} }, { prompt: 'x', negativePrompt: 'x'.repeat(4001) }, { prompt: 'x', seed: NaN }]) assert.throws(() => generationPayload(body));
  for (const value of ['--connect 123', 'http://evil.test', '123&456789', '123']) assert.throws(() => remotePeer(value));
});

test('studio restores valid settings, migrates the legacy prompt and uses actual random seeds', () => {
  assert.equal(studioSettings(null, 'My saved prompt').prompt, 'My saved prompt');
  const saved = { prompt: 'A tree', negative: 'blurry', steps: 30, seed: 42, size: 768 };
  assert.deepEqual(studioSettings(saved), saved);
  assert.deepEqual(studioSettings({ ...saved, steps: null, seed: -100, size: 8192 }), { ...saved, steps: 20, seed: -1, size: 512 });
  for (const change of [{ steps: NaN }, { steps: 2.5 }, { seed: NaN }, { seed: 1.2 }, { seed: 2147483648 }]) assert.ok(studioSettingsError({ ...saved, ...change }));
  assert.equal(studioSettingsError(saved), undefined);
  assert.equal(generatedSeed('{"seed":123456}', -1), 123456);
  assert.equal(generatedSeed('{"all_seeds":[123]}', -1), 123);
  assert.equal(generatedSeed('broken metadata', 42), 42);
  assert.equal(generatedSeed('{}', -1), undefined);
});

test('cancelling an approval is token/origin-bound and cannot cancel a newer request', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'realhub-revoke-')); t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'tools')); writeFileSync(join(dir, 'tools', process.platform === 'win32' ? 'rustdesk.exe' : 'rustdesk'), 'fixture');
  const handle = createCreativeTools({ dir }), origin = 'http://127.0.0.1:8080', peer = '123456789';
  const first = await handle('/remote/arm', 'POST', { peer }, origin);
  const next = await handle('/remote/arm', 'POST', { peer }, origin);
  await handle('/remote/revoke', 'POST', { token: first.token }, origin);
  assert.equal((await handle('/remote/status', 'GET')).armed, true);
  await handle('/remote/revoke', 'POST', { token: next.token }, 'http://other.test');
  assert.equal((await handle('/remote/status', 'GET')).armed, true);
  await handle('/remote/revoke', 'POST', { token: next.token }, origin);
  assert.equal((await handle('/remote/status', 'GET')).armed, false);
  await assert.rejects(handle('/remote/connect', 'POST', { peer, token: next.token, confirmation: `CONNECT ${peer}` }, origin), /Approval/);
});

test('an authenticated API failure is visible and never starts a duplicate engine', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'realhub-auth-engine-')); t.after(() => rmSync(dir, { recursive: true, force: true }));
  const source = join(dir, 'tools', 'stable-diffusion-webui');
  for (const path of ['venv/Scripts', 'venv/Lib/site-packages/torch', 'models/Stable-diffusion']) mkdirSync(join(source, path), { recursive: true });
  writeFileSync(join(source, 'venv', 'Scripts', 'python.exe'), 'fixture');
  writeFileSync(join(source, 'models', 'Stable-diffusion', 'v1-5-pruned-emaonly-fp16.safetensors'), 'fixture');
  writeFileSync(join(dir, 'tools', 'stable-diffusion-ready.json'), '{}');
  let launches = 0;
  const handle = createCreativeTools({ dir, spawnProcess: () => { launches++; }, fetchLocal: async () => ({ ok: false, status: 401 }) });
  const status = await handle('/studio/status', 'GET');
  assert.equal(status.connectionIssue, 'authentication'); assert.match(status.note, /401/);
  await assert.rejects(handle('/studio/start', 'POST'), /401/); assert.equal(launches, 0);
});
test('remote approval is expiring, one-use, peer/origin-bound and never supplies a password', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'realhub-tools-')); t.after(() => rmSync(dir, { recursive: true, force: true })); mkdirSync(join(dir, 'tools')); writeFileSync(join(dir, 'tools', process.platform === 'win32' ? 'rustdesk.exe' : 'rustdesk'), 'fixture');
  let time = 100000, launches = 0, args; const child = new EventEmitter(); child.kill = () => { child.killed = true; };
  const handle = createCreativeTools({ dir, now: () => time, spawnProcess: (_, argv, options) => { launches++; args = argv; assert.equal(options.shell, false); return child; } });
  const peer = '123456789', origin = 'http://127.0.0.1:8080';
  let approval = await handle('/remote/arm', 'POST', { peer }, origin);
  await assert.rejects(handle('/remote/connect', 'POST', { peer, token: approval.token, confirmation: `CONNECT ${peer}` }, 'http://evil.test'), /Approval/);
  approval = await handle('/remote/arm', 'POST', { peer }, origin); time += 30001;
  await assert.rejects(handle('/remote/connect', 'POST', { peer, token: approval.token, confirmation: `CONNECT ${peer}` }, origin), /expired/);
  approval = await handle('/remote/arm', 'POST', { peer }, origin);
  const input = { peer, token: approval.token, confirmation: `CONNECT ${peer}` }; await handle('/remote/connect', 'POST', input, origin);
  assert.equal(launches, 1); assert.deepEqual(args, ['--connect', peer, '--no-server']);
  await assert.rejects(handle('/remote/connect', 'POST', input, origin), /Approval/);
  await handle('/remote/lock', 'POST', {}, origin); assert.equal(child.killed, true); assert.equal((await handle('/remote/status', 'GET')).armed, false);
});
test('local image API stays on the fixed loopback target and refuses non-image output', async () => {
  const calls = [], handle = createCreativeTools({ dir: '.', fetchLocal: async (url, init) => { calls.push({ url, init }); return { ok: true, text: async () => url.endsWith('sd-models') ? JSON.stringify([{ title: 'Local checkpoint' }]) : JSON.stringify({ images: ['not a PNG'] }) }; } });
  assert.equal((await handle('/studio/status', 'GET')).ready, true);
  await assert.rejects(handle('/studio/generate', 'POST', { prompt: 'x', url: 'http://evil.test' }), /PNG/);
  assert.ok(calls.every(call => call.url.startsWith('http://127.0.0.1:7860/sdapi/v1/'))); assert.equal(calls[0].init.redirect, 'error');
});
test('engine lifecycle launches only the installed Python with loopback and isolated caches', async t => {
  const dir = mkdtempSync(join(tmpdir(),'realhub-engine-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const source=join(dir,'tools','stable-diffusion-webui');for(const path of ['venv/Scripts','venv/Lib/site-packages/torch','models/Stable-diffusion'])mkdirSync(join(source,path),{recursive:true});
  writeFileSync(join(source,'venv','Scripts','python.exe'),'fixture');writeFileSync(join(source,'models','Stable-diffusion','v1-5-pruned-emaonly-fp16.safetensors'),'fixture');
  writeFileSync(join(dir,'tools','stable-diffusion-ready.json'),'{}');
  const calls=[],child=new EventEmitter();child.pid=12345;child.kill=()=>{child.killed=true};
  const handle=createCreativeTools({dir,fetchLocal:async()=>{throw Error('offline')},spawnProcess:(binary,args,options)=>{calls.push({binary,args,options});return child}});
  await handle('/studio/start','POST',{command:'ignored',host:'0.0.0.0'});
  assert.ok(calls[0].binary.endsWith(join('Scripts','python.exe')));assert.equal(calls[0].options.shell,false);assert.equal(calls[0].options.env.HF_HOME,join(dir,'tools','hf-cache'));
  assert.deepEqual(calls[0].args,['launch.py','--api','--server-name','127.0.0.1','--port','7860','--disable-extra-extensions']);
  await handle('/studio/start','POST');assert.equal(calls.length,1,'starting twice never duplicates a process');
  await handle('/studio/stop','POST');if(process.platform==='win32')assert.deepEqual(calls[1].args,['/PID','12345','/T','/F']);else assert.ok(child.killed);
});
test('generation is single-flight and interrupt only applies to a request owned by the bridge', async () => {
  let resolve,interrupts=0;const wait=new Promise(r=>resolve=r);
  const handle=createCreativeTools({dir:'.',fetchLocal:async url=>{if(url.endsWith('interrupt')){interrupts++;return{ok:true,text:async()=>'{}'}}await wait;return{ok:true,text:async()=>JSON.stringify({images:['iVBORw0KGgoAAAA=']})}}});
  await handle('/studio/interrupt','POST',{});assert.equal(interrupts,0);
  const request=handle('/studio/generate','POST',{prompt:'First'});await assert.rejects(handle('/studio/generate','POST',{prompt:'Second'}),/already running/);
  await handle('/studio/interrupt','POST',{});assert.equal(interrupts,1);resolve();assert.equal((await request).ok,true);
});
