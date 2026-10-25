import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifiedDownload } from './verified-download.mjs';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
if(process.platform!=='win32')throw Error('This installer supports the Windows/NVIDIA workstation.');
const dir=dirname(fileURLToPath(import.meta.url)), tools=join(dir,'tools'), source=join(tools,'comfyui'), env=join(source,'venv');
async function run(exe,args,cwd=source){await new Promise((resolve,reject)=>{const c=spawn(exe,args,{cwd,stdio:'inherit',shell:false,env:{...process.env,UV_CACHE_DIR:join(tools,'uv-cache'),UV_PYTHON_INSTALL_DIR:join(tools,'python'),HF_HUB_DISABLE_TELEMETRY:'1'}});c.on('error',reject);c.on('exit',code=>code===0?resolve():reject(Error(exe+' exited '+code)));});}
await mkdir(tools,{recursive:true});
if(!existsSync(join(source,'main.py')))await run('git',['clone','--depth','1','https://github.com/Comfy-Org/ComfyUI.git',source],dir);
// Source revision verified with the app's fixed Qwen 2.1 workflow.
const engineRevision='5841c187a76ffdb565c14d9565aacbdb9a54b056';
if(!existsSync(join(tools,'comfyui-ready.json'))){await run('git',['fetch','--depth','1','origin',engineRevision]);await run('git',['checkout','--detach',engineRevision]);}
const uv=join(tools,'uv.exe');
if(!existsSync(uv)){
 const release=await fetch('https://api.github.com/repos/astral-sh/uv/releases/latest',{headers:{'User-Agent':'Realhub-Qwen-setup'},signal:AbortSignal.timeout(30000)}).then(r=>{if(!r.ok)throw Error('Official uv release HTTP '+r.status);return r.json();});
 const asset=release.assets.find(row=>row.name==='uv-x86_64-pc-windows-msvc.zip');
 if(!asset?.digest?.startsWith('sha256:')||!asset.browser_download_url.startsWith('https://github.com/astral-sh/uv/releases/download/'))throw Error('Official uv checksum unavailable.');
 const response=await fetch(asset.browser_download_url,{signal:AbortSignal.timeout(120000)});if(!response.ok)throw Error('uv download HTTP '+response.status);const bytes=Buffer.from(await response.arrayBuffer());
 if('sha256:'+createHash('sha256').update(bytes).digest('hex')!==asset.digest)throw Error('uv checksum mismatch.');
 const entries=unzipSync(bytes),key=Object.keys(entries).find(key=>/(?:^|\/)uv\.exe$/.test(key));if(!key)throw Error('Verified uv archive is missing its executable.');await writeFile(uv,entries[key]);
}
if(!existsSync(join(env,'Scripts','python.exe')))await run(uv,['venv','--python','3.12',env]);
await run(uv,['pip','install','--python',join(env,'Scripts','python.exe'),'torch==2.14.1+cu130','torchvision==0.29.1+cu130','torchaudio==2.11.0+cu130','--index-url','https://download.pytorch.org/whl/cu130']);
await run(uv,['pip','install','--python',join(env,'Scripts','python.exe'),'-r','requirements.txt']);
await writeFile(join(tools,'comfyui-ready.json'),JSON.stringify({installedAt:new Date().toISOString(),engine:'ComfyUI',python:'3.12',cuda:'cu130',source:engineRevision}));
const meta=await fetch('https://huggingface.co/api/models/Comfy-Org/Qwen-Image-2.1?blobs=true').then(r=>{if(!r.ok)throw Error('Model metadata HTTP '+r.status);return r.json();});
const wanted=['diffusion_models/qwen_image_2.1_turbo_int8_convrot.safetensors','text_encoders/qwen3vl_8b_w4a8.safetensors','vae/qwen_image_2.1_vae_bf16.safetensors'];
for(const name of wanted){const item=meta.siblings.find(r=>r.rfilename===name||r.rfilename==='split_files/'+name);if(!item?.lfs?.sha256)throw Error('Missing verified model metadata: '+name);const target=join(source,'models',name);await mkdir(dirname(target),{recursive:true});await verifiedDownload('https://huggingface.co/Comfy-Org/Qwen-Image-2.1/resolve/'+meta.sha+'/'+item.rfilename,target,item.size??item.lfs.size,item.lfs.sha256,name);}
console.log('Qwen-Image 2.1 Turbo and matching encoder/VAE are installed.');
