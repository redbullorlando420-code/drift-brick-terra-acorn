import { open, stat, realpath } from 'node:fs/promises';
import { join, relative, isAbsolute } from 'node:path';

export function classifyModelHeader(header) {
  const keys = Object.keys(header).filter(k => k !== '__metadata__'), has = prefix => keys.some(k => k.startsWith(prefix));
  if (keys.some(k => /lora_(?:up|down)|\.lora_[AB]\.|^lora_unet_/i.test(k))) return { family: 'unknown', role: 'lora', missing: ['A LoRA is an add-on, not a full generation model.'] };
  for (const prefix of ['', 'model.diffusion_model.']) {
    if (['txt_in.text_norm.weight','modulation.1.weight','transformer_blocks.0.attn.norm_q.weight','img_in.weight','proj_out.weight'].every(k => keys.includes(prefix + k)) && ['gate_up','proj'].some(k => keys.includes(prefix + 'transformer_blocks.0.img_mlp.' + k + '.weight'))) return { family: 'qwen-image-2.1', role: 'diffusion-model', missing: [] };
  }
  if (has('model.diffusion_model.input_blocks.')) {
    const xl = has('conditioner.embedders.0.transformer.text_model.') && has('conditioner.embedders.1.model.'), text = xl || has('cond_stage_model.transformer.text_model.'), vae = has('first_stage_model.decoder.');
    return { family: xl ? 'sdxl' : text ? 'sd1' : 'unknown', role: 'checkpoint', missing: [...(!text ? ['Checkpoint is missing supported text-conditioning tensors.'] : []), ...(!vae ? ['Checkpoint is missing its image-decoder tensors.'] : [])] };
  }
  if (has('model.layers.') || has('model.embed_tokens.') || has('text_model.') || has('transformer.text_model.')) return { family: 'unknown', role: 'text-encoder', missing: ['A text encoder or language model cannot generate an image by itself.'] };
  if (has('decoder.') && has('encoder.')) return { family: String(header.__metadata__?.['modelspec.architecture'] ?? '').includes('qwen_image_2.1') ? 'qwen-image-2.1' : 'unknown', role: 'vae', missing: ['A VAE decodes images; select a compatible diffusion model instead.'] };
  return { family: 'unknown', role: 'unknown', missing: ['Tensor architecture is unsupported or ambiguous for this fixed image workflow.'] };
}
const inside = (base, target) => { const rel = relative(base, target); return rel !== '..' && !rel.startsWith('..\\') && !rel.startsWith('../') && !isAbsolute(rel); };
export function createModelPreflight({ dir }) {
  const cache = new Map();
  const folder = role => role === 'checkpoints' ? join(dir,'tools/stable-diffusion-webui/models/Stable-diffusion') : join(dir,'tools/comfyui/models',role);
  async function summary(role, name) {
    if (!/^[\w .-]{1,180}\.safetensors$/.test(name) || name.includes('..')) throw Error('Use an installed safetensors filename, not a local path.');
    const base = await realpath(folder(role)), target = await realpath(join(base,name)), approved = await realpath(dir);
    if (!inside(approved,base) || !inside(base,target)) throw Error('Model must remain inside its approved Companion model folder.');
    const info = await stat(target); if (!info.isFile()) throw Error('Model is not a regular file.');
    const key = role + '/' + name, previous = cache.get(key);
    if (previous?.bytes === info.size && previous.mtime === info.mtimeMs) return previous;
    const handle = await open(target,'r'); let result;
    try {
      const prefix = Buffer.alloc(8); if ((await handle.read(prefix,0,8,0)).bytesRead !== 8) throw Error('Model header is incomplete.');
      const length = Number(prefix.readBigUInt64LE()); if (!Number.isSafeInteger(length) || length < 2 || length > 8000000 || length + 8 >= info.size) throw Error('Not a bounded safetensors weight file.');
      const bytes = Buffer.alloc(length); if ((await handle.read(bytes,0,length,8)).bytesRead !== length) throw Error('Model header is incomplete.');
      const header = JSON.parse(bytes.toString('utf8')); if (!header || typeof header !== 'object' || Array.isArray(header)) throw Error('Invalid tensor header.');
      const tensors = Object.entries(header).filter(([k]) => k !== '__metadata__'); if (!tensors.length || tensors.length > 100000) throw Error('Invalid tensor count.');
      for (const [,tensor] of tensors) if (!tensor || !Array.isArray(tensor.data_offsets) || tensor.data_offsets.length !== 2 || !tensor.data_offsets.every(Number.isSafeInteger) || tensor.data_offsets[0] < 0 || tensor.data_offsets[1] < tensor.data_offsets[0] || tensor.data_offsets[1] > info.size - length - 8 || !Array.isArray(tensor.shape) || tensor.shape.length > 8 || !tensor.shape.every(n => Number.isSafeInteger(n) && n >= 0)) throw Error('Invalid tensor bounds or shape.');
      result = { ...classifyModelHeader(header), bytes: info.size, mtime: info.mtimeMs, headerBytes: length };
    } finally { await handle.close(); }
    cache.delete(key); cache.set(key,result); while (cache.size > 32) cache.delete(cache.keys().next().value);
    return result;
  }
  async function preflight({ engine, model }) {
    if (!['a1111','comfy'].includes(engine)) throw Error('Select a supported image engine.');
    const name = String(model ?? '').replace(/ \[[a-f0-9]+\]$/i,'');
    if (!/^[\w .-]{1,180}\.safetensors$/.test(name) || name.includes('..')) throw Error('Use an installed safetensors filename, not a local path.');
    const role = engine === 'a1111' ? 'checkpoints' : 'diffusion_models', checks = [], add = (label,state,detail) => checks.push({label,state,detail});
    let data; try { data = await summary(role,name); add('Weight format','pass','Bounded safetensors header and tensor offsets examined; full weights were not loaded.'); } catch (e) { add('Weight format','fail',e.code === 'ENOENT' ? 'This model is not installed in the matching Companion model folder.' : e.message); }
    const family = data?.family ?? 'unknown', artifact = data?.role ?? 'unknown';
    const architecture = engine === 'a1111' ? artifact === 'checkpoint' && ['sd1','sdxl'].includes(family) : artifact === 'diffusion-model' && family === 'qwen-image-2.1' && /^qwen_image_2\.1_(turbo_)?(bf16|int8_convrot)\.safetensors$/.test(name);
    add('Architecture and engine',architecture ? 'pass' : 'fail',architecture ? family + ' matches the selected engine’s fixed workflow.' : 'This artifact is not a supported complete model for the selected engine.');
    for (const missing of data?.missing ?? []) add('Required model content','fail',missing);
    if (engine === 'comfy') for (const [component,file,expected] of [['text_encoders','qwen3vl_8b_w4a8.safetensors','text-encoder'],['vae','qwen_image_2.1_vae_bf16.safetensors','vae']]) {
      try { const part = await summary(component,file); if (part.role !== expected || expected === 'vae' && part.family !== 'qwen-image-2.1') throw Error('Component architecture does not match the Qwen 2.1 workflow.'); add(file,'pass','Matching component header found.'); } catch(e) { add(file,'fail',e.code === 'ENOENT' ? 'Required matching component is missing.' : e.message); }
    }
    let source;
    try { const sourcePath = await realpath(join(folder(role),name+'.source.json')); if (!inside(await realpath(folder(role)),sourcePath)) throw Error('Invalid source record.'); const sourceHandle = await open(sourcePath,'r'); let raw; try { const buffer=Buffer.alloc(4097), read=await sourceHandle.read(buffer,0,4097,0); if(read.bytesRead>4096)throw Error('Source record is too large.'); raw=buffer.subarray(0,read.bytesRead).toString('utf8'); } finally { await sourceHandle.close(); } if (raw.length <= 4096) { const s = JSON.parse(raw); if (/^[\w.-]+\/[\w.-]+$/.test(s.repo) && /^[a-f0-9]{40}$/.test(s.revision)) source = { url:'https://huggingface.co/'+s.repo, revision:s.revision, ...( /^[a-f0-9]{64}$/.test(s.sha256) ? { recordedDigest:s.sha256 } : {}) }; } } catch { /* Local files can have no publisher provenance. */ }
    add('Publisher provenance',source ? 'pass' : 'unknown',source ? 'Pinned installation source recorded. The digest is not recomputed during this lightweight check.' : 'No pinned installation source is recorded; review the original model card.');
    return { ok:true, version:1, engine, name, family, role:artifact, ready:checks.every(c=>c.state!=='fail'), checks, ...(source?{source}:{}), bytes:data?.bytes??0, hardware:{weightsGiB:Math.round((data?.bytes??0)/1073741824*100)/100,note:'Weight-file size is not a VRAM estimate. Runtime, precision, offloading and image size determine actual memory. Start small; hardware suitability remains unverified.'} };
  }
  return { preflight, summary };
}
