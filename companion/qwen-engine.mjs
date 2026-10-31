import { existsSync, openSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { randomInt, randomUUID } from 'node:crypto';

export function qwenGraph(body, model, seed) {
  return {
    '1':{class_type:'UNETLoader',inputs:{unet_name:model,weight_dtype:'default'}},
    '2':{class_type:'CLIPLoader',inputs:{clip_name:'qwen3vl_8b_w4a8.safetensors',type:'qwen_image',device:'default'}},
    '3':{class_type:'VAELoader',inputs:{vae_name:'qwen_image_2.1_vae_bf16.safetensors'}},
    '4':{class_type:'TextEncodeQwenImage21',inputs:{clip:['2',0],prompt:body.prompt,negative_prompt:body.negative_prompt,resolution:body.width}},
    '5':{class_type:'EmptyLatentImage',inputs:{width:body.width,height:body.height,batch_size:1}},
    '6':{class_type:'KSampler',inputs:{model:['1',0],positive:['4',0],negative:['4',1],latent_image:['5',0],seed,steps:body.steps,cfg:model.includes('turbo')?1:4,sampler_name:'euler',scheduler:'simple',denoise:1}},
    '7':{class_type:'VAEDecode',inputs:{samples:['6',0],vae:['3',0]}},
    '8':{class_type:'PreviewImage',inputs:{images:['7',0]}},
  };
}
export function createQwenEngine({dir,models,validate,spawnProcess=spawn,fetchLocal=fetch,platform=process.platform}) {
  const source=join(dir,'tools','comfyui'),python=join(source,'venv','Scripts','python.exe');let engine=null,generation=null;
  const canStart=()=>platform==='win32'&&existsSync(python)&&existsSync(join(dir,'tools','comfyui-ready.json'));
  async function api(route,body,timeout=5000){const response=await fetchLocal('http://127.0.0.1:8189'+route,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(timeout)});if(!response.ok)throw Error('ComfyUI HTTP '+response.status+': '+(await response.text()).slice(0,200));const text=await response.text();return text.trim()?JSON.parse(text):{};}
  async function available(){const catalog=await models.list();return catalog.models.filter(m=>m.role==='diffusion_models'&&/^qwen_image_2\.1_(turbo_)?(bf16|int8_convrot)\.safetensors$/.test(m.name)).map(m=>m.name);}
  const stopOwned = () => { if(!engine)return;const owned=engine;if(process.platform==='win32')spawnProcess('taskkill.exe',['/PID',String(owned.pid),'/T','/F'],{shell:false,windowsHide:true,stdio:'ignore'}).once('error',()=>{});else owned.kill(); };
  const handle = async(route,method,body={})=>{
    if(!route.startsWith('/studio/qwen/'))return null;
    if(route==='/studio/qwen/status'&&method==='GET'){
      const names=await available(),components=['text_encoders/qwen3vl_8b_w4a8.safetensors','vae/qwen_image_2.1_vae_bf16.safetensors'].every(f=>existsSync(join(source,'models',f)));let connected=false;try{await api('/system_stats');connected=true;}catch{}
      return {ok:true,connected,ready:connected&&components&&names.length>0,modelPreflight:typeof models.preflight==='function',models:names,busy:!!generation,canStart:canStart(),ownedEngine:!!engine,note:!canStart()?'Run Install-Qwen.cmd to prepare the isolated ComfyUI runtime.':!components||!names.length?'Install the Qwen 2.1 bundle below; it includes the matching encoder and VAE.':connected?'Qwen-Image 2.1 · local ComfyUI · one image at a time.':'Start the Qwen engine, then check again after it finishes loading.'};
    }
    if(route==='/studio/qwen/start'&&method==='POST'){
      if(!canStart())throw Error('Finish Install-Qwen.cmd first.');if(engine)return {ok:true,note:'Qwen engine is already starting or running.'};
      try{await api('/system_stats');return {ok:true,note:'Existing ComfyUI engine reused.'};}catch{}
      const log=openSync(join(dir,'tools','comfyui-engine.log'),'a');try{const child=spawnProcess(python,['main.py','--listen','127.0.0.1','--port','8189','--disable-all-custom-nodes','--offline','--lowvram','--cache-none','--reserve-vram','2','--disable-pinned-memory'],{cwd:source,shell:false,windowsHide:true,stdio:['ignore',log,log],env:{...process.env,HF_HUB_DISABLE_TELEMETRY:'1',PYTHONUNBUFFERED:'1'}});engine=child;const release=()=>{if(engine===child)engine=null;};child.once('error',release);child.once('exit',release);}finally{closeSync(log);}return {ok:true,note:'Starting Qwen locally. Check again shortly. Stop the other image engine first to preserve GPU memory.'};
    }
    if(route==='/studio/qwen/stop'&&method==='POST'){
      if(generation)throw Error('Interrupt generation and wait for it to finish before stopping.');
      stopOwned();return {ok:true,note:engine?'Stopping the Qwen process started by Companion.':'No Companion-owned Qwen process to stop.'};
    }
    if(route==='/studio/qwen/free'&&method==='POST'){if(generation)throw Error('Wait for generation to finish.');await api('/free',{unload_models:true,free_memory:true});return {ok:true,note:'Model memory release requested. The next generation will reload its weights.'};}
    if(route==='/studio/qwen/interrupt'&&method==='POST'){if(generation){generation.cancelled=true;if(generation.id){await api('/queue',{delete:[generation.id]});await api('/interrupt',{prompt_id:generation.id});}}return {ok:true};}
    if(route==='/studio/qwen/generate'&&method==='POST'){
      if(generation)throw Error('A Qwen image is already generating.');const settings=validate(body),names=await available(),model=body.model||names.find(n=>n.includes('turbo'))||names[0];if(!names.includes(model))throw Error('Select an installed Qwen 2.1 diffusion model.');
      if(models.preflight){const review=await models.preflight({engine:'comfy',model});if(!review.ready)throw Error('Model compatibility check failed: '+review.checks.filter(c=>c.state==='fail').map(c=>c.detail).join(' '));}
      const seed=settings.seed<0?randomInt(2147483647):settings.seed,run={id:null,cancelled:false,completed:false};generation=run;
      try{
        const queue=await api('/queue');if(queue.queue_running?.length||queue.queue_pending?.length)throw Error('The local Qwen queue is busy. Wait for the current engine work.');
        const queued=await api('/prompt',{prompt:qwenGraph(settings,model,seed),client_id:randomUUID()});if(!queued.prompt_id)throw Error('Qwen workflow was rejected: '+JSON.stringify(queued.node_errors??{}).slice(0,500));run.id=queued.prompt_id;
        const deadline=Date.now()+10*60_000;
        while(Date.now()<deadline){if(run.cancelled)throw Error('Qwen generation interrupted.');await new Promise(r=>setTimeout(r,1000));const histories=await api('/history/'+encodeURIComponent(run.id)),history=histories[run.id];if(!history)continue;
          const failure=history.status?.messages?.find(m=>m[0]==='execution_error');if(failure)throw Error('Qwen generation failed: '+String(failure[1]?.exception_message??'engine error').slice(0,500));
          const image=history.outputs?.['8']?.images?.[0];if(!image){if(history.status?.completed)throw Error('Qwen completed without an image.');continue;}
          if(!['temp','output'].includes(image.type)||typeof image.filename!=='string')throw Error('Invalid generated image reference.');
          const response=await fetchLocal('http://127.0.0.1:8189/view?'+new URLSearchParams({filename:image.filename,subfolder:image.subfolder??'',type:image.type}),{signal:AbortSignal.timeout(10000),redirect:'error'});
          if(!response.ok||Number(response.headers.get('content-length'))>10_000_000)throw Error('Image preview exceeded its budget.');let size=0,parts=[];for await(const chunk of response.body){size+=chunk.length;if(size>10_000_000)throw Error('Image preview exceeded its budget.');parts.push(chunk);}const png=Buffer.concat(parts);if(png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Qwen returned a non-PNG image.');
          run.completed=true;return {ok:true,engineJobId:run.id,image:png.toString('base64'),info:JSON.stringify({seed,sd_model_name:model,sampler_name:"euler",scheduler:"simple",cfg_scale:model.includes("turbo")?1:4,denoising_strength:1})};
        }
        run.cancelled=true;await api('/queue',{delete:[run.id]}).catch(()=>{});await api('/interrupt',{prompt_id:run.id}).catch(()=>{});throw Error('Qwen generation timed out and was interrupted.');
      }finally{if(!run.completed&&run.id){await api('/queue',{delete:[run.id]}).catch(()=>{});await api('/interrupt',{prompt_id:run.id}).catch(()=>{});}generation=null;if(run.id)await api('/history',{delete:[run.id]}).catch(()=>{});await api('/free',{unload_models:true,free_memory:true}).catch(()=>{});}
    }
    return null;
  };
  handle.shutdown = async () => { if(engine){stopOwned();return;}if(generation?.id){generation.cancelled=true;await Promise.allSettled([api('/queue',{delete:[generation.id]}),api('/interrupt',{prompt_id:generation.id})]);} };
  return handle;
}

