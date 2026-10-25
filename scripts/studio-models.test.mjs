import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { EventEmitter } from 'node:events';
import { createStudioModels, huggingFaceSource, validateWeights } from '../companion/studio-models.mjs';
import { createQwenEngine, qwenGraph } from '../companion/qwen-engine.mjs';
import { generationPayload } from '../companion/creative-tools.mjs';
const weights = (key='model.diffusion_model.input_blocks.0.weight') => {const header=Buffer.from(JSON.stringify({[key]:{dtype:'F32',shape:[1],data_offsets:[0,4]}})),size=Buffer.alloc(8);size.writeBigUInt64LE(BigInt(header.length));return Buffer.concat([size,header,Buffer.alloc(4)]);};
async function directory(t){const dir=await mkdtemp(join(tmpdir(),'realhub-models-'));t.after(()=>rm(dir,{recursive:true,force:true}));return dir;}
async function finish(manager){for(let i=0;i<100;i++){const state=await manager.list();if(state.job?.state!=='running')return state;await new Promise(r=>setTimeout(r,5));}assert.fail('transfer did not settle');}
test('Hugging Face links allow only credential-free public model/file pages',()=>{
  assert.deepEqual(huggingFaceSource('https://huggingface.co/a/b/blob/main/model.safetensors'),{repo:'a/b',revision:'main',file:'model.safetensors'});
  assert.equal(huggingFaceSource('https://huggingface.co/a/b/resolve/main/model.safetensors?download=true').file,'model.safetensors');
  assert.deepEqual(huggingFaceSource('https://huggingface.co/Comfy-Org/Qwen-Image-2.1'),{repo:'Comfy-Org/Qwen-Image-2.1'});
  for(const value of ['file:///x','http://huggingface.co/a/b','https://user:pass@huggingface.co/a/b','https://evil.test/a/b','https://huggingface.co/a/b?token=secret','https://huggingface.co/a/b/blob/main/%2E%2E/model.safetensors'])assert.throws(()=>huggingFaceSource(value));
});
test('safetensors rejects webpage/pickle/pointer, tensor overflow and non-checkpoint components',async t=>{
  const dir=await directory(t),file=join(dir,'test');await writeFile(file,weights());assert.equal(await validateWeights(file,'checkpoints'),true);
  await writeFile(file,weights('encoder.weight'));await assert.rejects(validateWeights(file,'checkpoints'),/not an SD/);
  for(const bytes of [Buffer.from('<html>bad webpage</html>'),Buffer.from('version https://git-lfs.github.com/spec/v1'),Buffer.alloc(8)]){await writeFile(file,bytes);await assert.rejects(validateWeights(file,'checkpoints'));}
});
test('remote downloads pin revisions, check digests, preserve existing weights and retain bounded jobs',async t=>{
  const dir=await directory(t),bytes=weights(),sha=createHash('sha256').update(bytes).digest('hex'),calls=[];
  const manager=createStudioModels({dir,fetchRemote:async(url,options)=>{calls.push({url,options});if(url.includes('/api/'))return Response.json({sha:'a'.repeat(40),siblings:[{rfilename:'model.safetensors',size:bytes.length,lfs:{sha256:sha}}]});assert.match(url,/\/resolve\/a{40}\/model.safetensors$/);const [start,end]=options.headers.Range.slice(6).split('-').map(Number);return new Response(bytes.subarray(start,end+1),{status:206,headers:{'content-range':`bytes ${start}-${end}/${bytes.length}`}});}});
  const body={url:'https://huggingface.co/test/model',file:'model.safetensors'};await manager.action('/studio/models/install','POST',body);const result=await finish(manager);assert.equal(result.job.state,'done');assert.equal(result.models.length,1);assert.deepEqual(await readFile(join(dir,'tools/stable-diffusion-webui/models/Stable-diffusion/model.safetensors')),bytes);
  const before=calls.length;await manager.action('/studio/models/install','POST',body);await finish(manager);assert.equal(calls.length,before+1,'existing weights are not downloaded again');
});
test('wrong remote checksum never enables a file and cleans its temporary data',async t=>{
  const dir=await directory(t),bytes=weights();const manager=createStudioModels({dir,fetchRemote:async (url,options)=>url.includes('/api/')?Response.json({sha:'a'.repeat(40),siblings:[{rfilename:'bad.safetensors',size:bytes.length,lfs:{sha256:'b'.repeat(64)}}]}):(()=>{const [start,end]=options.headers.Range.slice(6).split('-').map(Number);return new Response(bytes.subarray(start,end+1),{status:206,headers:{'content-range':`bytes ${start}-${end}/${bytes.length}`}});})()});
  await manager.action('/studio/models/install','POST',{url:'https://huggingface.co/test/model',file:'bad.safetensors'});const result=await finish(manager);assert.equal(result.job.state,'error');assert.match(result.job.note,/checksum/);assert.deepEqual(await readdir(join(dir,'tools/stable-diffusion-webui/models/Stable-diffusion')),[]);
});
test('an incompatible large model is refused after its small header, before downloading weights',async t=>{
  const dir=await directory(t),bytes=weights('language_model.layers.0.weight'),total=1_000_000_000;let received=0;
  const manager=createStudioModels({dir,fetchRemote:async(url,options)=>{
    if(url.includes('/api/'))return Response.json({sha:'a'.repeat(40),siblings:[{rfilename:'model.safetensors',size:total,lfs:{sha256:'b'.repeat(64)}}]});
    const [start,end]=options.headers.Range.slice(6).split('-').map(Number);received+=end-start+1;
    return new Response(bytes.subarray(start,end+1),{status:206,headers:{'content-range':`bytes ${start}-${end}/${total}`}});
  }});
  await manager.action('/studio/models/install','POST',{url:'https://huggingface.co/test/language-model',file:'model.safetensors'});const state=await finish(manager);
  assert.equal(state.job.state,'error');assert.match(state.job.note,/large download was not started/);assert.ok(received<1024);assert.equal(state.models.length,0);
});
test('local binary upload streams a checkpoint and refuses overwrites or traversal',async t=>{
  const dir=await directory(t),manager=createStudioModels({dir}),server=createServer((req,res)=>void manager.upload(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const base='http://127.0.0.1:'+server.address().port+'/studio/models/upload?';
  const response=await fetch(base+new URLSearchParams({name:'local.safetensors',role:'checkpoints'}),{method:'POST',body:weights()});assert.equal(response.status,200);assert.equal((await manager.list()).models[0].name,'local.safetensors');
  for(const name of ['local.safetensors','../escape.safetensors','bad.ckpt']){const r=await fetch(base+new URLSearchParams({name}),{method:'POST',body:weights()});assert.equal(r.status,400);}
});
test('Qwen graph uses built-in fixed nodes, model family settings and no caller workflow',()=>{
  const graph=qwenGraph(generationPayload({prompt:'A forest',steps:8,workflow:{bad:true}}),'qwen_image_2.1_turbo_int8_convrot.safetensors',42);
  assert.equal(graph['6'].inputs.cfg,1);assert.equal(graph['6'].inputs.steps,8);assert.equal(graph['6'].inputs.seed,42);assert.equal(graph['2'].inputs.type,'qwen_image');assert.equal(graph['8'].class_type,'PreviewImage');assert.ok(!JSON.stringify(graph).includes('workflow'));
});
test('Qwen generation checks the native queue, returns PNG and frees owned history/model memory',async t=>{
  const dir=await directory(t),calls=[],model='qwen_image_2.1_turbo_int8_convrot.safetensors',png=Buffer.from('iVBORw0KGgoAAAA=','base64');
  const engine=createQwenEngine({dir,models:{list:async()=>({models:[{name:model,role:'diffusion_models'}]})},validate:generationPayload,fetchLocal:async(url,options)=>{calls.push({url,options});if(url.endsWith('/queue'))return Response.json({queue_running:[],queue_pending:[]});if(url.endsWith('/prompt'))return Response.json({prompt_id:'owned-id'});if(url.includes('/history/'))return Response.json({'owned-id':{outputs:{'8':{images:[{filename:'preview.png',subfolder:'',type:'temp'}]}}}});if(url.includes('/view?'))return new Response(png);if(url.endsWith('/free')||url.endsWith('/history'))return new Response(null,{status:200});return Response.json({});}});
  const result=await engine('/studio/qwen/generate','POST',{prompt:'A forest',steps:8,seed:42});assert.equal(result.image,png.toString('base64'));assert.equal(JSON.parse(result.info).seed,42);assert.ok(calls.every(c=>c.url.startsWith('http://127.0.0.1:8189/')));assert.ok(calls.some(c=>c.url.endsWith('/history')&&c.options.body.includes('owned-id')));assert.ok(calls.some(c=>c.url.endsWith('/free')));assert.equal((await engine('/studio/qwen/free','POST')).ok,true);
});
test('Qwen lifecycle is loopback-only with custom/cloud nodes and pinned memory disabled',async t=>{
  const dir=await directory(t),source=join(dir,'tools/comfyui'),calls=[];
  await mkdir(join(source,'venv/Scripts'),{recursive:true});await writeFile(join(source,'venv/Scripts/python.exe'),'fixture');await writeFile(join(dir,'tools/comfyui-ready.json'),'{}');
  const child=new EventEmitter();child.pid=12345;
  const engine=createQwenEngine({dir,models:{list:async()=>({models:[]})},validate:generationPayload,fetchLocal:async()=>{throw Error('offline');},spawnProcess:(exe,args,options)=>{calls.push({exe,args,options});return child;}});
  await engine('/studio/qwen/start','POST');await engine('/studio/qwen/start','POST');assert.equal(calls.length,1);
  assert.ok(calls[0].exe.endsWith('python.exe'));for(const flag of ['--disable-all-custom-nodes','--offline','--lowvram','--cache-none','--disable-pinned-memory'])assert.ok(calls[0].args.includes(flag));
  assert.deepEqual(calls[0].args.slice(1,5),['--listen','127.0.0.1','--port','8189']);assert.equal(calls[0].options.shell,false);
});
