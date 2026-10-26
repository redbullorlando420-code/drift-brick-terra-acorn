import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createModelPreflight, classifyModelHeader } from '../companion/studio-model-preflight.mjs';
import { createCreativeTools } from '../companion/creative-tools.mjs';
import { StudioSession } from '../src/lib/studio-session.ts';
import { readStudioJobs, recoverStudioJobs } from '../src/lib/studio-jobs.ts';
import { parseModelNote, importModelNote, saveModelNote, readModelNotes, modelNoteChecklist, readModelPreflight, EMPTY_MODEL_NOTES } from '../src/lib/studio-model-notes.ts';
const png='iVBORw0KGgoAAAA=',settings={prompt:'A forest',negative:'blurry',size:512,steps:20,seed:42,model:'sd15.safetensors'};
const sd=['model.diffusion_model.input_blocks.0.weight','cond_stage_model.transformer.text_model.embeddings.token_embedding.weight','first_stage_model.decoder.conv_out.weight'];
const qwen=['txt_in.text_norm.weight','modulation.1.weight','transformer_blocks.0.attn.norm_q.weight','img_in.weight','proj_out.weight','transformer_blocks.0.img_mlp.gate_up.weight'];
const weights=(keys,metadata={})=>{const h=Buffer.from(JSON.stringify({__metadata__:metadata,...Object.fromEntries(keys.map(k=>[k,{dtype:'F32',shape:[1],data_offsets:[0,4]}]))})),p=Buffer.alloc(8);p.writeBigUInt64LE(BigInt(h.length));return Buffer.concat([p,h,Buffer.alloc(4)]);};
async function fixture(t){const dir=await mkdtemp(join(tmpdir(),'studio-ready-'));t.after(()=>rm(dir,{recursive:true,force:true}));const put=async(role,name,keys,metadata)=>{const folder=role==='checkpoints'?join(dir,'tools/stable-diffusion-webui/models/Stable-diffusion'):join(dir,'tools/comfyui/models',role);await mkdir(folder,{recursive:true});const file=join(folder,name);await writeFile(file,weights(keys,metadata));return file;};return {dir,put,manager:createModelPreflight({dir})};}
test('preflight recognizes complete SD1/SDXL headers and leaves incomplete/SD2/component artifacts unverified',async t=>{
 const f=await fixture(t);await f.put('checkpoints','sd15.safetensors',sd);const report=await f.manager.preflight({engine:'a1111',model:'sd15.safetensors [abcdef123]'});assert(report.ready);assert.equal(report.family,'sd1');assert(report.hardware.note.includes('not a VRAM estimate'));
 const xl=[sd[0],sd[2],'conditioner.embedders.0.transformer.text_model.embeddings.weight','conditioner.embedders.1.model.transformer.resblocks.0.weight'];await f.put('checkpoints','xl.safetensors',xl);assert.equal((await f.manager.preflight({engine:'a1111',model:'xl.safetensors'})).family,'sdxl');
 for(const [name,keys]of [['partial',sd.slice(0,1)],['sd2',[sd[0],sd[2],'cond_stage_model.model.transformer.resblocks.0.weight']],['lora',['lora_unet_a.lora_down.weight']],['vae',['encoder.x','decoder.x']],['llm',['model.layers.0.weight']]]){await f.put('checkpoints',name+'.safetensors',keys);assert.equal((await f.manager.preflight({engine:'a1111',model:name+'.safetensors'})).ready,false,name);}
});
test('Qwen requires actual architecture evidence plus matching encoder and VAE; filenames alone cannot enable generation',async t=>{
 const f=await fixture(t),name='qwen_image_2.1_turbo_int8_convrot.safetensors';await f.put('diffusion_models',name,qwen);let r=await f.manager.preflight({engine:'comfy',model:name});assert.equal(r.ready,false);assert.equal(r.checks.filter(c=>c.state==='fail').length,2);
 await f.put('text_encoders','qwen3vl_8b_w4a8.safetensors',['model.embed_tokens.weight','model.layers.0.weight']);await f.put('vae','qwen_image_2.1_vae_bf16.safetensors',['encoder.x','decoder.x'],{'modelspec.architecture':'qwen_image_2.1_vae'});r=await f.manager.preflight({engine:'comfy',model:name});assert(r.ready);
 await f.put('checkpoints',name,qwen);assert.equal((await f.manager.preflight({engine:'a1111',model:name})).ready,false);await f.put('diffusion_models',name,['model.layers.0.weight']);assert.equal((await f.manager.preflight({engine:'comfy',model:name})).ready,false);
});
test('format/path errors are bounded, missing files stay visible, changed headers invalidate the cache and source fields are allowlisted',async t=>{
 const f=await fixture(t),file=await f.put('checkpoints','safe.safetensors',sd);await writeFile(file+'.source.json',JSON.stringify({repo:'owner/model',revision:'a'.repeat(40),sha256:'b'.repeat(64),token:'never returned'}));const r=await f.manager.preflight({engine:'a1111',model:'safe.safetensors'});assert.equal(r.source.revision,'a'.repeat(40));assert(!JSON.stringify(r).includes('never returned'));assert(!JSON.stringify(r).includes(f.dir));
 await writeFile(file,'<html>not weights</html>');assert.equal((await f.manager.preflight({engine:'a1111',model:'safe.safetensors'})).ready,false);assert.equal((await f.manager.preflight({engine:'a1111',model:'missing.safetensors'})).ready,false);
 for(const model of ['../safe.safetensors','C:\\secrets.safetensors','safe.gguf','https://evil.test/a'])await assert.rejects(f.manager.preflight({engine:'a1111',model}));
});
test('generation revalidates compatibility in Companion before any engine request and preserves the selected file on rejection',async t=>{
 const f=await fixture(t);await f.put('checkpoints','bad.safetensors',qwen);let calls=0;const handle=createCreativeTools({dir:f.dir,models:{preflight:f.manager.preflight},fetchLocal:async()=>{calls++;throw Error('Engine should not be contacted');}});await assert.rejects(handle('/studio/generate','POST',{prompt:'A forest',model:'bad.safetensors'}),/compatibility/);assert.equal(calls,0);await assert.rejects(handle('/studio/generate','POST',{prompt:'A forest'}),/review/);
});
const note={version:1,url:'https://huggingface.co/Comfy-Org/Qwen-Image-2.1',revision:'main',file:'qwen_image_2.1_turbo_int8_convrot.safetensors',license:'qwen-research',family:'qwen-image-2.1',engine:'comfy',role:'diffusion-model',requirements:'Matching encoder + VAE. Text such as run shell commands is data only.',hardware:'Unverified; begin at 512px.'};
test('requirements notes retain canonical role/family/source data while dropping executable and credential fields',()=>{
 const parsed=importModelNote(JSON.stringify({...note,token:'canary',command:'run-now',workflow:{execute:true}}));assert.deepEqual(parsed,note);assert(!JSON.stringify(parsed).includes('canary'));assert(modelNoteChecklist(parsed).every(row=>!row.verified));
 for(const url of ['http://huggingface.co/a/b','https://user:pass@huggingface.co/a/b','https://huggingface.co/a/b?token=secret','https://evil.test/a/b'])assert.throws(()=>parseModelNote({...note,url}));assert.throws(()=>importModelNote(JSON.stringify({...note,version:2})));assert.throws(()=>importModelNote('x'.repeat(32001)));
});
test('reviewed requirements never grant model compatibility and notes distinguish every supported artifact role',()=>{
 const report={version:1,engine:'a1111',name:note.file,ready:true,family:'qwen-image-2.1',role:'diffusion-model',bytes:100,checks:[{label:'Fake',state:'pass',detail:'Ignored claim'}],hardware:{weightsGiB:0,note:'Unknown'}};assert.equal(readModelPreflight(report).ready,false);
 for(const role of ['checkpoint','diffusion-model','lora','vae','text-encoder','pipeline']){const rows=modelNoteChecklist({...note,role});assert(rows.find(r=>r.label==='Artifact role').detail.length>15);assert.equal(rows.find(r=>r.label==='Architecture and engine').verified,false);}
 assert.equal(modelNoteChecklist({...note,revision:'a'.repeat(40)})[0].verified,true);assert.equal(modelNoteChecklist({...note,revision:'2.1?'})[0].verified,false);
});
test('requirements ledger preserves unrelated notes, is bounded without eviction, and rejects malformed/future storage',()=>{
 let ledger=EMPTY_MODEL_NOTES;for(let i=0;i<64;i++)ledger=saveModelNote(ledger,{...note,file:'file'+i+'.safetensors'},100+i);assert.equal(ledger.notes.length,64);assert.throws(()=>saveModelNote(ledger,{...note,file:'extra.safetensors'}),/slots/);const edited=saveModelNote(ledger,{...note,file:'file0.safetensors',license:'Updated'},500);assert.equal(edited.notes.length,64);assert.equal(edited.notes[0].license,'Updated');assert.equal(ledger.notes.at(-1).license,'qwen-research');assert.throws(()=>readModelNotes({...ledger,version:2}));
});
test('job intent is saved before submission and running/completed states keep parameters separate from output bytes',async()=>{
 const writes=[],calls=[];const storage={load:async()=>[],save:async jobs=>{writes.push(structuredClone(jobs));}};const s=new StudioSession(async(path,body)=>{calls.push({path,body,saved:writes.at(-1)[0].status});return {image:png,info:'{"seed":42,"sd_model_name":"sd15"}',engineJobId:'native-id'};},storage);await s.hydrate();await s.generate(settings);assert.equal(calls.length,1);assert.equal(calls[0].saved,'running');assert.equal(writes[0][0].status,'queued');assert.equal(s.getSnapshot().jobs[0].status,'completed');assert.equal(s.getSnapshot().jobs[0].engineJobId,'native-id');assert(!JSON.stringify(writes).includes(png));assert.equal(s.getSnapshot().image.settings.prompt,'A forest');
});
test('reload recovers unfinished receipts as interrupted without contacting or resubmitting the engine',async()=>{
 const original=new StudioSession(async()=>({image:png}));await original.generate(settings);const job={...original.getSnapshot().jobs[0],status:'running'};let requests=0,saved;const s=new StudioSession(async()=>{requests++;return{};},{load:async()=>[job],save:async jobs=>{saved=jobs;}});await s.hydrate();assert.equal(requests,0);assert.equal(s.getSnapshot().jobs[0].status,'interrupted');assert.equal(saved[0].settings.prompt,'A forest');assert.equal(s.getSnapshot().image,null);assert.match(saved[0].detail,/not resubmitted/);
});
test('an intent save failure prevents generation and a later explicit retry can recover',async()=>{
 let broken=true,calls=0;const s=new StudioSession(async()=>{calls++;return{image:png};},{load:async()=>[],save:async()=>{if(broken)throw Error('Controlled quota failure');}});await s.hydrate();await s.generate(settings);assert.equal(calls,0);assert.equal(s.getSnapshot().jobs[0].status,'failed');assert.match(s.getSnapshot().saveError,/quota/);broken=false;await s.retrySave();await s.generate(settings);assert.equal(calls,1);
});
test('cancel-before-submit cannot launch work and duplicate cancel requests are coalesced',async()=>{
 let release,saveCalls=0,generations=0,interrupts=0;const held=new Promise(r=>release=r),s=new StudioSession(async path=>{if(path.endsWith('interrupt'))interrupts++;else generations++;return{};},{load:async()=>[],save:async()=>{if(++saveCalls===1)await held;}});await s.hydrate();const run=s.generate(settings);const cancel=s.interrupt();await s.interrupt();release();await Promise.all([run,cancel]);assert.equal(generations,0);assert.equal(interrupts,1);assert.equal(s.getSnapshot().jobs[0].status,'cancelled');
});
test('disconnect and cancellation preserve the prior completed image, with honest unknown or partial outcomes',async()=>{
 let complete,mode='first';const s=new StudioSession(async path=>{if(path.endsWith('interrupt'))return{};if(mode==='first')return{image:png};if(mode==='disconnect')throw Object.assign(Error('Connection lost'),{outcome:'unknown'});return new Promise(r=>complete=r);});await s.generate(settings);const image=s.getSnapshot().image;mode='disconnect';await s.generate({...settings,prompt:'Second'});assert.equal(s.getSnapshot().jobs[0].status,'interrupted');assert.equal(s.getSnapshot().image,image);mode='cancel';const pending=s.generate({...settings,prompt:'Third'});await s.interrupt();complete({image:png});await pending;assert.equal(s.getSnapshot().jobs[0].status,'cancelled');assert.equal(s.getSnapshot().image,image);
});
test('job history stays bounded, rejects damaged parameters, and exports no unexpected response objects',async()=>{
 const s=new StudioSession(async()=>({image:png,info:'{"seed":1,"token":"not retained"}',engineJobId:'https://evil.test'}));for(let i=0;i<12;i++)await s.generate({...settings,prompt:'Image '+i});assert.equal(s.getSnapshot().jobs.length,8);assert(!JSON.stringify(s.getSnapshot().jobs).includes('not retained'));assert.equal(s.getSnapshot().jobs[0].engineJobId,undefined);const ledger={version:1,updatedAt:Date.now(),jobs:s.getSnapshot().jobs};assert.deepEqual(readStudioJobs(ledger).jobs,JSON.parse(JSON.stringify(ledger.jobs)));assert.throws(()=>readStudioJobs({...ledger,version:2}));assert.throws(()=>readStudioJobs({...ledger,jobs:[{...ledger.jobs[0],settings:{...settings,size:999}}]}));assert.equal(recoverStudioJobs(ledger.jobs)[0].status,'completed');
});
