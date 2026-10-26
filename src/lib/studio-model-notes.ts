export const MODEL_NOTE_LIMIT = 64, MODEL_NOTE_BYTES = 32000;
export const MODEL_ROLES = ['checkpoint','diffusion-model','lora','vae','text-encoder','pipeline'] as const;
export type ModelNote = { version:1; url:string; revision:string; file:string; license:string; family:'sd1'|'sdxl'|'qwen-image-2.1'|'other'|'unknown'; engine:'a1111'|'comfy'|'other'|'unknown'; role:typeof MODEL_ROLES[number]; requirements:string; hardware:string };
export type SavedModelNote = ModelNote & { savedAt:number };
export type ModelNoteLedger = { version:1; updatedAt:number; notes:SavedModelNote[] };
export type ModelPreflight = { version:1; engine:'a1111'|'comfy'; name:string; ready:boolean; family:string; role:string; bytes:number; checks:Array<{label:string;state:'pass'|'fail'|'unknown';detail:string}>; source?:{url:string;revision:string;recordedDigest?:string}; hardware:{weightsGiB:number;note:string} };
export const EMPTY_MODEL_NOTES:ModelNoteLedger={version:1,updatedAt:0,notes:[]};
export function readModelPreflight(raw:unknown):ModelPreflight {
  const r=raw as ModelPreflight;
  if(!r||r.version!==1||!['a1111','comfy'].includes(r.engine)||typeof r.name!=='string'||r.name.length>240||typeof r.family!=='string'||r.family.length>60||typeof r.role!=='string'||r.role.length>60||!Array.isArray(r.checks)||!r.checks.length||r.checks.length>32||!Number.isSafeInteger(r.bytes)||r.bytes<0||!r.hardware||!Number.isFinite(r.hardware.weightsGiB)||r.hardware.weightsGiB<0||typeof r.hardware.note!=='string'||r.hardware.note.length>1000)throw Error('Unsupported model compatibility report.');
  const checks=r.checks.map(c=>{if(!c||typeof c.label!=='string'||c.label.length>200||typeof c.detail!=='string'||c.detail.length>1000||!['pass','fail','unknown'].includes(c.state))throw Error('Invalid model compatibility checklist.');return {label:c.label,state:c.state,detail:c.detail};});
  const ready=r.ready===true&&checks.every(c=>c.state!=='fail')&&(r.engine==='a1111'?['sd1','sdxl'].includes(r.family)&&r.role==='checkpoint':r.family==='qwen-image-2.1'&&r.role==='diffusion-model');
  let source:ModelPreflight['source'];if(r.source){source={url:canonicalModelUrl(r.source.url),revision:r.source.revision};if(!/^[a-f0-9]{40}$/.test(source.revision))throw Error('Invalid installation revision.');if(r.source.recordedDigest&&/^[a-f0-9]{64}$/.test(r.source.recordedDigest))source.recordedDigest=r.source.recordedDigest;}
  return {version:1,engine:r.engine,name:r.name,family:r.family,role:r.role,ready,bytes:r.bytes,checks,hardware:{weightsGiB:r.hardware.weightsGiB,note:r.hardware.note},...(source?{source}:{})};
}
export function canonicalModelUrl(value:string) {
  const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='huggingface.co'||u.username||u.password||u.port||u.search||u.hash)throw Error('Use a public HTTPS Hugging Face repository or file URL without credentials or query parameters.');
  const parts=decodeURIComponent(u.pathname).split('/').filter(Boolean);if(parts.length<2||!parts.slice(0,2).every(p=>/^[\w.-]+$/.test(p))||parts.some(p=>p==='.'||p==='..')||parts.length>2&&(!['blob','resolve'].includes(parts[2]!)||parts.length<5||!parts.slice(3).every(p=>/^[\w .-]+$/.test(p))))throw Error('Use a model repository or an exact model file page.');
  return 'https://huggingface.co/'+parts.map(encodeURIComponent).join('/');
}
export function parseModelNote(raw:unknown):ModelNote {
  const r=raw as ModelNote;if(!r||r.version!==1||typeof r.url!=='string'||r.url.length>2048)throw Error('Unsupported model requirements note.');
  const string=(key:keyof ModelNote,max:number)=>{const value=r[key];if(typeof value!=='string'||value.length>max)throw Error('Invalid '+key+' in model requirements.');return value.trim();};
  const revision=string('revision',80),file=string('file',180),license=string('license',200),requirements=string('requirements',4000),hardware=string('hardware',500);
  if(revision&&!/^[\w.-]+$/.test(revision)||file&&(!/^[\w .-]+$/.test(file)||file.includes('..')))throw Error('Use a revision label and a filename without paths.');
  if(!['sd1','sdxl','qwen-image-2.1','other','unknown'].includes(r.family)||!['a1111','comfy','other','unknown'].includes(r.engine)||!(MODEL_ROLES as readonly string[]).includes(r.role))throw Error('Select a supported note family, engine and artifact role.');
  return {version:1,url:canonicalModelUrl(r.url),revision,file,license,family:r.family,engine:r.engine,role:r.role,requirements,hardware};
}
export function importModelNote(text:string){if(text.length>MODEL_NOTE_BYTES||new TextEncoder().encode(text).length>MODEL_NOTE_BYTES)throw Error('Requirements notes must be smaller than 32 KB.');return parseModelNote(JSON.parse(text));}
export function readModelNotes(raw:unknown):ModelNoteLedger {
  const r=raw as ModelNoteLedger;if(!r||r.version!==1||!Number.isSafeInteger(r.updatedAt)||r.updatedAt<0||!Array.isArray(r.notes)||r.notes.length>MODEL_NOTE_LIMIT)throw Error('Unsupported model requirements storage.');
  const seen=new Set<string>();const notes=r.notes.map(value=>{const note=parseModelNote(value);if(!Number.isSafeInteger(value.savedAt)||value.savedAt<0||seen.has(note.url+'|'+note.file+'|'+note.revision))throw Error('Invalid or duplicate saved model note.');seen.add(note.url+'|'+note.file+'|'+note.revision);return {...note,savedAt:value.savedAt};});return {version:1,updatedAt:r.updatedAt,notes};
}
export function saveModelNote(ledger:ModelNoteLedger,raw:unknown,now=Date.now()):ModelNoteLedger {
  const note=parseModelNote(raw),same=(n:ModelNote)=>n.url===note.url&&n.file===note.file&&n.revision===note.revision,notes=ledger.notes.filter(n=>!same(n));if(notes.length>=MODEL_NOTE_LIMIT)throw Error('All 64 note slots are used. Export or remove a note before adding one.');return readModelNotes({version:1,updatedAt:Math.max(now,ledger.updatedAt+1),notes:[{...note,savedAt:now},...notes]});
}
export function modelNoteChecklist(note:ModelNote,review?:ModelPreflight) {
  const match=!!review&&review.name===note.file;
  return [
    {label:'Exact repository revision',verified:/^[a-f0-9]{40}$/.test(note.revision),detail:/^[a-f0-9]{40}$/.test(note.revision)?'Pinned revision recorded; content verification is separate.':'Branch, missing or ambiguous revision remains unverified.'},
    {label:'Artifact role',verified:match&&review.role===note.role,detail:note.role==='checkpoint'?'Full checkpoint, not a LoRA/VAE/encoder.':note.role==='diffusion-model'?'Diffusion weights require matching text encoder and VAE.':note.role==='pipeline'?'A pipeline is a multi-component package; this installer cannot run arbitrary pipeline code.':note.role+' is an add-on/component, not a full checkpoint.'},
    {label:'Architecture and engine',verified:match&&review.ready&&review.family===note.family&&review.engine===note.engine,detail:match?'Compared with the inspected local model.':'Owner-entered requirements are unverified until the exact installed file is inspected.'},
    {label:'License review',verified:false,detail:note.license?'Recorded license: '+note.license+'. Review publisher terms; text is not legal verification.':'License is missing; review the publisher model card.'},
    {label:'Hardware suitability',verified:false,detail:note.hardware||'No verified runtime/VRAM measurement is recorded.'},
  ];
}
