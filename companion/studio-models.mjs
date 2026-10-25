import { mkdir, readdir, open, rename, unlink, stat, writeFile, readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { join, basename } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

export const QWEN_FILES = ['diffusion_models/qwen_image_2.1_turbo_int8_convrot.safetensors', 'text_encoders/qwen3vl_8b_w4a8.safetensors', 'vae/qwen_image_2.1_vae_bf16.safetensors'];
const QWEN_DIGESTS = ['8144a0182964aa8403ad6dbc011db837304167d235161b9aabaa8532e967314c','7754425e55e7bea2bfde4dde59a4cc236cb44e5ee9c215ea66ef8d47012824eb','bb21f7473051e1ac368515dd3f2e15cd44d7a11748ee8823e1ddca3e4876b7c9'];
async function boundedBytes(response, limit) {
  if(Number(response.headers.get('content-length'))>limit){await response.body?.cancel();throw Error('Model server response exceeded its size budget.');}
  const parts=[];let size=0;for await(const bytes of response.body){size+=bytes.length;if(size>limit)throw Error('Model server response exceeded its size budget.');parts.push(bytes);}return Buffer.concat(parts);
}
export function huggingFaceSource(value) {
  let url; try { url = new URL(value); } catch { throw Error('Paste a Hugging Face model or .safetensors file link.'); }
  const safeQuery = [...url.searchParams].every(([key,value]) => key === 'download' && ['true','1'].includes(value));
  if (url.protocol !== 'https:' || url.hostname !== 'huggingface.co' || url.port || url.username || url.password || !safeQuery) throw Error('Use a public https://huggingface.co model link without credentials or authentication parameters.');
  const parts = decodeURIComponent(url.pathname).split('/').filter(Boolean);
  if (parts.length < 2 || !parts.slice(0,2).every(p => /^[\w.-]+$/.test(p)) || parts.some(p => p === '..' || p === '.')) throw Error('Invalid Hugging Face repository.');
  const repo = parts.slice(0,2).join('/');
  if (parts.length === 2) return { repo };
  if (!['blob','resolve'].includes(parts[2]) || parts.length < 5 || !/^[\w.-]+$/.test(parts[3])) throw Error('Use a repository page or a file link from its Files tab.');
  return { repo, revision: parts[3], file: parts.slice(4).join('/') };
}
export async function validateWeights(file, role) {
  const info = await stat(file), handle = await open(file, 'r');
  try {
    const size = Buffer.alloc(8); await handle.read(size,0,8,0); const length = Number(size.readBigUInt64LE());
    if (!Number.isSafeInteger(length) || length < 2 || length > 8_000_000 || length+8 >= info.size) throw Error('Not a valid bounded safetensors file. Pick the model weights, not a pointer or webpage.');
    const bytes = Buffer.alloc(length); await handle.read(bytes,0,length,8); const header = JSON.parse(bytes.toString('utf8'));
    const keys = Object.keys(header).filter(k => k !== '__metadata__');
    if (!keys.length) throw Error('The file has no model tensors.');
    for (const key of keys) { const row=header[key]; if (!Array.isArray(row.data_offsets) || row.data_offsets.length!==2 || !row.data_offsets.every(Number.isSafeInteger) || row.data_offsets[0]<0 || row.data_offsets[1]<row.data_offsets[0] || row.data_offsets[1]>info.size-length-8) throw Error('Invalid tensor offsets.'); }
    if (role === 'checkpoints' && !keys.some(k => k.startsWith('model.diffusion_model.input_blocks.'))) throw Error('This is not an SD 1.x/SDXL full checkpoint. Qwen diffusion models, LoRAs, GGUF and text encoders need their matching engine and component folders.');
    return true;
  } finally { await handle.close(); }
}
export function createStudioModels({ dir, fetchRemote = fetch }) {
  let job = null, controller = null;
  const comfy = join(dir,'tools','comfyui','models'), a1111 = join(dir,'tools','stable-diffusion-webui','models','Stable-diffusion');
  const folder = role => role === 'checkpoints' ? a1111 : join(comfy,role);
  async function inspect(source) {
    const parsed = huggingFaceSource(source);
    const response = await fetchRemote('https://huggingface.co/api/models/'+parsed.repo+(parsed.revision ? '/revision/'+encodeURIComponent(parsed.revision) : '')+'?blobs=true', {signal:AbortSignal.timeout(15000),redirect:'error'});
    if (!response.ok) throw Error('Hugging Face metadata HTTP '+response.status+'. Use a public, ungated model repository.');
    const metadata = JSON.parse((await boundedBytes(response,4_000_000)).toString('utf8'));
    if (!/^[a-f0-9]{40}$/.test(metadata.sha)) throw Error('Repository revision could not be pinned.');
    const files = (metadata.siblings ?? []).filter(row => row.rfilename.endsWith('.safetensors') && (!parsed.file || row.rfilename===parsed.file)).slice(0,100).map(row => {
      const relative = row.rfilename.replace(/^split_files\//,'');
      const known = parsed.repo === 'Comfy-Org/Qwen-Image-2.1' && /^(diffusion_models\/qwen_image_2\.1_(turbo_)?(bf16|int8_convrot)|text_encoders\/qwen3vl_8b_(bf16|int8_convrot|w4a8)|vae\/qwen_image_2\.1_vae_bf16)\.safetensors$/.test(relative);
      return { file:row.rfilename, name:basename(row.rfilename), role:known ? relative.split('/')[0] : 'checkpoints', bytes:row.size??row.lfs?.size, sha256:row.lfs?.sha256, supported:known ? (!relative.startsWith('text_encoders/') || relative==='text_encoders/qwen3vl_8b_w4a8.safetensors') : !/lora|vae|encoder|unet|gguf|diffusion_pytorch_model|model-\d+-of-/i.test(row.rfilename) };
    }).filter(row => Number.isSafeInteger(row.bytes) && row.bytes>8 && row.bytes<30_000_000_000 && /^[a-f0-9]{64}$/.test(row.sha256??''));
    return {repo:parsed.repo,revision:metadata.sha,files,license:metadata.cardData?.license??'Read the model card'};
  }
  async function list() {
    const models=[];
    for (const role of ['checkpoints','diffusion_models','text_encoders','vae']) {
      const names=await readdir(folder(role)).catch(()=>[]);
      for (const name of names.filter(n=>n.endsWith('.safetensors')).slice(0,100)) models.push({name,role,engine:role==='checkpoints'?'a1111':'comfy'});
    }
    return {ok:true,models,job:job ? {...job} : null};
  }
  function begin(label, work) {
    if (job?.state==='running') throw Error('A model transfer is already running. Wait or cancel it first.');
    controller=new AbortController(); job={id:randomUUID(),label,state:'running',received:0,total:0,note:'Preparing model transfer…'};
    const current=job, signal=controller.signal;
    void work(current,signal).then(()=>{current.state='done';current.note='Model installed. Refresh the engine to discover it.';}).catch(error=>{current.state=signal.aborted?'cancelled':'error';current.note=signal.aborted?'Transfer cancelled. Existing models were preserved.':error.message;});
    return {ok:true,job:{...current}};
  }
  async function download(entry, metadata, current, signal) {
    await mkdir(folder(entry.role),{recursive:true}); const target=join(folder(entry.role),entry.name);
    // Existing model names are never silently overwritten.
    if (await stat(target).then(()=>true).catch(()=>false)) {current.received+=entry.bytes;return;}
    const url='https://huggingface.co/'+metadata.repo+'/resolve/'+metadata.revision+'/'+entry.file;
    async function range(start,end) {
      const response=await fetchRemote(url,{headers:{Range:'bytes='+start+'-'+end},signal:AbortSignal.any([signal,AbortSignal.timeout(60000)])});
      if(response.status!==206 || response.headers.get('content-range')!=='bytes '+start+'-'+end+'/'+entry.bytes){await response.body?.cancel();throw Error('The model server did not return the requested bounded range.');}
      const bytes=await boundedBytes(response,end-start+1);if(bytes.length!==end-start+1)throw Error('Incomplete model download.');return bytes;
    }
    if(entry.role==='checkpoints') {
      // Inspect only the small tensor header before spending gigabytes on an
      // incompatible language model, LoRA or stand-alone diffusion component.
      current.note='Checking checkpoint compatibility…';
      const prefix=await range(0,7),length=Number(prefix.readBigUInt64LE());
      if(!Number.isSafeInteger(length)||length<2||length>8_000_000||length+8>=entry.bytes)throw Error('Not a valid safetensors checkpoint.');
      const header=JSON.parse((await range(8,7+length)).toString('utf8'));
      if(!Object.keys(header).some(k=>k.startsWith('model.diffusion_model.input_blocks.')))throw Error('This is not an SD 1.x/SDXL full checkpoint. Choose a compatible checkpoint or the Qwen 2.1 bundle; the large download was not started.');
    }
    const part=target+'.partial-'+current.id, handle=await open(part,'wx');
    try {
      for (let offset=0; offset<entry.bytes;) {
        signal.throwIfAborted(); const end=Math.min(entry.bytes-1,offset+4*1024*1024-1);
        const bytes=await range(offset,end);
        let written=0;while(written<bytes.length){const result=await handle.write(bytes,written,bytes.length-written,offset+written);if(!result.bytesWritten)throw Error('Model disk write stopped.');written+=result.bytesWritten;}
        offset=end+1;current.received+=bytes.length;
      }
      await handle.close(); current.note='Checking SHA-256 and model format…';
      const hash=createHash('sha256');for await(const bytes of createReadStream(part)){signal.throwIfAborted();hash.update(bytes);}
      if(hash.digest('hex')!==entry.sha256)throw Error('Model checksum mismatch. Unverified weights were not enabled.');
      await validateWeights(part,entry.role);signal.throwIfAborted();await rename(part,target);
      await writeFile(target+'.source.json',JSON.stringify({repo:metadata.repo,revision:metadata.revision,file:entry.file,sha256:entry.sha256}));
    } finally {await handle.close().catch(()=>{});await unlink(part).catch(()=>{});}
  }
  async function action(route,method,body={}) {
    if(route==='/studio/models'&&method==='GET')return list();
    if(route==='/studio/models/inspect'&&method==='POST')return {ok:true,...await inspect(body.url)};
    if(route==='/studio/models/cancel'&&method==='POST'){controller?.abort();return {ok:true};}
    if(route==='/studio/models/install'&&method==='POST') {
      const metadata=await inspect(body.bundle?'https://huggingface.co/Comfy-Org/Qwen-Image-2.1':body.url);
      const entries=body.bundle?QWEN_FILES.map(name=>metadata.files.find(f=>f.file.replace(/^split_files\//,'')===name)):metadata.files.filter(f=>f.file===body.file);
      if(!entries.length||entries.some(e=>!e?.supported))throw Error('Choose a supported full checkpoint or the Qwen 2.1 bundle.');
      return begin(body.bundle?'Qwen-Image 2.1 Turbo bundle':entries[0].name,async(current,signal)=>{current.total=entries.reduce((n,e)=>n+e.bytes,0);for(const entry of entries){current.note='Downloading '+entry.name;await download(entry,metadata,current,signal);}});
    }
    return null;
  }
  async function upload(req,res) {
    let result;
    try {
      const url=new URL(req.url,'http://127.0.0.1'),name=url.searchParams.get('name')??'',role=url.searchParams.get('role')??'checkpoints';
      if(!/^[\w .-]{1,180}\.safetensors$/.test(name)||name.includes('..'))throw Error('Choose a .safetensors file with a simple filename.');
      if(!['checkpoints','diffusion_models','text_encoders','vae'].includes(role))throw Error('Unknown model component.');
      if(role!=='checkpoints'&&!QWEN_FILES.includes(role+'/'+name))throw Error('For Qwen components choose the exact filenames listed in the model guide.');
      const total=Number(req.headers['content-length']);if(!Number.isSafeInteger(total)||total<10||total>30_000_000_000)throw Error('File must be between 10 bytes and 30 GB.');
      const target=join(folder(role),name);if(await stat(target).then(()=>true).catch(()=>false))throw Error('That model is already installed. Existing weights were preserved.');
      result=begin(name,async(current,signal)=>{
        current.total=total;current.note='Receiving model from this browser…';await mkdir(folder(role),{recursive:true});const part=target+'.partial-'+current.id,handle=await open(part,'wx');
        const abort=()=>req.destroy();signal.addEventListener('abort',abort,{once:true});
        try{for await(const bytes of req){signal.throwIfAborted();current.received+=bytes.length;if(current.received>total)throw Error('Upload exceeded its declared size.');let offset=0;while(offset<bytes.length){const row=await handle.write(bytes,offset,bytes.length-offset);if(!row.bytesWritten)throw Error('Disk write stopped.');offset+=row.bytesWritten;}}await handle.close();if(current.received!==total)throw Error('Upload was interrupted.');await validateWeights(part,role);if(role!=='checkpoints'){const expected=QWEN_DIGESTS[QWEN_FILES.indexOf(role+'/'+name)],hash=createHash('sha256');for await(const bytes of createReadStream(part)){signal.throwIfAborted();hash.update(bytes);}if(hash.digest('hex')!==expected)throw Error('This file does not match the official Qwen component checksum. Existing models were preserved.');}signal.throwIfAborted();await rename(part,target);}finally{signal.removeEventListener('abort',abort);await handle.close().catch(()=>{});await unlink(part).catch(()=>{});}
      });
      // Wait for the stream before replying, without buffering the file in RAM.
      const uploaded=job; while(uploaded.state==='running')await new Promise(r=>setTimeout(r,100));
      result={ok:uploaded.state==='done',job:{...uploaded},...(uploaded.state!=='done'?{error:uploaded.note}:{})};
    }catch(error){req.resume();result={ok:false,error:error.message};}
    if(!res.destroyed){res.writeHead(result.ok?200:400,{'Content-Type':'application/json'});res.end(JSON.stringify(result));}
  }
  return {action,list,upload,shutdown:()=>controller?.abort()};
}
