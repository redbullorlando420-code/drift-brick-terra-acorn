import { studioSettings, studioSettingsError, type StudioSettings } from './studio-settings.ts';
import { canonicalModelUrl, type ModelPreflight } from './studio-model-notes.ts';

export const MAX_STUDIO_RECIPES = 8;
export const MAX_RECIPE_BYTES = 64_000;
export type RecipeProvenance = { engine: 'a1111'|'comfy'; width:number; height:number; modelName?:string; family?:string; revision?:string; sha256?:string; engineHash?:string; source?:string; sampler?:string; scheduler?:string; guidance?:number; denoise?:number };
export type StudioRecipe = { id: string; name: string; savedAt: number; settings: StudioSettings; checkpoint?: string; provenance?:RecipeProvenance };
export type RecipeContent = Pick<StudioRecipe, 'name' | 'settings' | 'checkpoint' | 'provenance'>;

const modelLabel = (v:unknown) => typeof v==='string'&&v.trim()&&v.length<=240&&!/[\\/:\x00-\x1f]/.test(v) ? v.trim() : undefined;
export const modelIdentity = (v:string) => v.replace(/ \[[a-f0-9]+\]$/i,'').replace(/\.(safetensors|ckpt)$/i,'');
function provenance(raw:unknown):RecipeProvenance {
  const r=raw as RecipeProvenance;
  if(!r||!['a1111','comfy'].includes(r.engine)||![256,512,768].includes(r.width)||r.height!==r.width)throw Error('Unsupported recipe engine or dimensions.');
  const out:RecipeProvenance={engine:r.engine,width:r.width,height:r.height};
  for(const key of ['modelName','family','sampler','scheduler'] as const){if(r[key]!==undefined){const value=modelLabel(r[key]);if(!value)throw Error('Invalid recipe '+key+'.');out[key]=value;}}
  for(const [key,re] of [['revision',/^[a-f0-9]{40}$/],['sha256',/^[a-f0-9]{64}$/],['engineHash',/^[a-f0-9]{8,64}$/]] as const){if(r[key]!==undefined){if(typeof r[key]!=='string'||!re.test(r[key]!))throw Error('Invalid recipe '+key+'.');out[key]=r[key];}}
  if(r.source!==undefined){if(typeof r.source!=='string'||r.source.length>2048)throw Error('Invalid recipe model source.');out.source=canonicalModelUrl(r.source);}
  for(const key of ['guidance','denoise'] as const){if(r[key]!==undefined){if(!Number.isFinite(r[key])||r[key]!<0||r[key]!>(key==='denoise'?1:100))throw Error('Invalid recipe '+key+'.');out[key]=r[key];}}
  return out;
}

export function recipeDocument(recipe: RecipeContent) {
  // Round-trip through the allowlist even for internally supplied values.
  const clean=parseRecipe(JSON.stringify({format:'realhub-studio-recipe',version:2,...recipe}));
  return { format: 'realhub-studio-recipe', version: 2, ...clean };
}

/** Imports are an allow-list of form values, never native engine instructions. */
export function parseRecipe(text: string): RecipeContent {
  if (text.length > MAX_RECIPE_BYTES || new TextEncoder().encode(text).length > MAX_RECIPE_BYTES) throw new Error('Choose a recipe JSON file smaller than 64 KB.');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('This file is not valid JSON. Choose an exported Realhub image recipe.'); }
  if (data?.format !== 'realhub-studio-recipe' || ![1,2].includes(data.version) || !data.settings || typeof data.settings !== 'object') throw new Error('This is not a supported Realhub image recipe.');
  const row = data.settings;
  if (typeof row.prompt !== 'string' || row.prompt.length > 4000 || typeof row.negative !== 'string' || row.negative.length > 4000 || ![256, 512, 768].includes(row.size)) throw new Error('The recipe contains invalid prompts or image dimensions.');
  const failure = studioSettingsError(row);
  if (failure) throw new Error(failure);
  if(data.version===2&&data.provenance!==undefined){const p=provenance(data.provenance);if(p.engine!==(row.engine??"a1111")||p.width!==row.size)throw Error("Recipe provenance disagrees with its engine or dimensions.");}
  return {
    name: typeof data.name === 'string' && data.name.trim() ? data.name.trim().slice(0, 80) : row.prompt.trim().slice(0, 80),
    settings: studioSettings(row),
    ...(modelLabel(data.checkpoint) ? { checkpoint: modelLabel(data.checkpoint) } : {}),
    ...(data.version===2&&data.provenance!==undefined?{provenance:provenance(data.provenance)}:{}),
  };
}

export function restoreRecipes(text: string | null): StudioRecipe[] {
  if (!text || text.length > MAX_RECIPE_BYTES * MAX_STUDIO_RECIPES) return [];
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return [];
    const rows: StudioRecipe[] = [];
    for (const row of data.slice(0, MAX_STUDIO_RECIPES)) {
      if (typeof row?.id !== 'string' || row.id.length > 100 || !Number.isFinite(row.savedAt) || row.savedAt <= 0 || rows.some(item => item.id === row.id)) continue;
      try { rows.push({ ...parseRecipe(JSON.stringify({ ...row, format: 'realhub-studio-recipe', version: 2 })), id: row.id, savedAt: row.savedAt }); } catch { /* Retain other valid recipes if one entry is damaged. */ }
    }
    return rows;
  } catch { return []; }
}

export function generatedCheckpoint(info: unknown): string | undefined {
  try {
    const data = typeof info === 'string' ? JSON.parse(info) : info;
    const value = data?.sd_model_name;
    return modelLabel(value);
  } catch { return; }
}

/** Engine observations and the exact inspected install are separate evidence. */
export function generatedProvenance(settings:StudioSettings,info:unknown,review?:ModelPreflight):RecipeProvenance {
  let row:Record<string,unknown>={};try{const r=typeof info==='string'?JSON.parse(info):info;if(r&&typeof r==='object')row=r;}catch{/* Metadata can be unavailable. */}
  const engine=settings.engine??'a1111',modelName=generatedCheckpoint(row)??modelLabel(settings.model);
  const out:RecipeProvenance={engine,width:settings.size,height:settings.size,...(modelName?{modelName}:{})};
  for(const [key,value] of [['sampler',row.sampler_name??row.sampler],['scheduler',row.scheduler]] as const){const clean=modelLabel(value);if(clean)out[key]=clean;}
  if(typeof row.cfg_scale==='number'&&Number.isFinite(row.cfg_scale)&&row.cfg_scale>=0&&row.cfg_scale<=100)out.guidance=row.cfg_scale;
  if(typeof row.denoising_strength==='number'&&row.denoising_strength>=0&&row.denoising_strength<=1)out.denoise=row.denoising_strength;
  if(typeof row.sd_model_hash==='string'&&/^[a-f0-9]{8,64}$/.test(row.sd_model_hash))out.engineHash=row.sd_model_hash;
  if(review?.ready&&review.engine===engine&&modelName&&modelIdentity(review.name)===modelIdentity(modelName)){
    out.family=review.family;
    if(review.source){out.source=review.source.url;out.revision=review.source.revision;if(review.source.recordedDigest)out.sha256=review.source.recordedDigest;}
  }
  return provenance(out);
}
export function recipeLoadReview(recipe:RecipeContent,engine:'a1111'|'comfy',models:string[],selection?:string,review?:ModelPreflight){
  const sourceEngine=recipe.provenance?.engine??recipe.settings.engine??'a1111',expected=recipe.provenance?.modelName??recipe.settings.model??recipe.checkpoint;
  const exact=expected?models.find(name=>modelIdentity(name)===modelIdentity(expected)):undefined;
  const chosen=selection===undefined?exact:models.includes(selection)?selection:undefined;
  const p=recipe.provenance,qwen=chosen?.toLowerCase().includes('turbo'),warnings:string[]=[];
  if(sourceEngine!==engine)warnings.push('This recipe uses a different engine. Switch the image engine and check it before loading.');
  if(!chosen)warnings.push('The recorded model is missing or unverified. Choose an installed compatible model explicitly.');
  if(chosen&&(!expected||modelIdentity(chosen)!==modelIdentity(expected)))warnings.push('You selected a different model. Its output will differ from this recipe.');
  const supported={sampler:engine==='comfy'?'euler':'Euler',scheduler:engine==='comfy'?'simple':'Automatic',guidance:engine==='comfy'?qwen?1:4:7,denoise:1};
  if(!p?.sampler||!p?.scheduler||p.guidance===undefined)warnings.push('Sampler, scheduler or guidance was not recorded. The current supported engine parameters will be used.');
  else if(p.sampler!==supported.sampler||p.scheduler!==supported.scheduler||p.guidance!==supported.guidance||p.denoise!==undefined&&p.denoise!==supported.denoise)warnings.push('This engine form cannot apply the recorded sampler, scheduler, guidance or denoise. Only the displayed supported parameters can be loaded.');
  const matching=review?.ready&&review.engine===engine&&chosen&&modelIdentity(review.name)===modelIdentity(chosen);
  if(p?.sha256&&(!matching||review.source?.recordedDigest!==p.sha256))warnings.push('The recorded model digest does not match a reviewed install. Review the model before generation.');
  if(p?.revision&&(!matching||review.source?.revision!==p.revision))warnings.push('The recorded repository revision has not been matched to a reviewed install.');
  if(p?.engineHash&&(!matching||!review.source?.recordedDigest?.startsWith(p.engineHash)))warnings.push('The engine-reported model hash has not been independently matched.');
  if(!p?.sha256&&!p?.engineHash)warnings.push('No model hash was recorded. A matching filename alone does not verify identical weights.');
  if(recipe.settings.seed===-1)warnings.push('The seed is random or was not returned. Loading cannot reproduce the same noise seed.');
  return {sourceEngine,expected,chosen,warnings,supported,canLoad:sourceEngine===engine&&!!chosen,settings:chosen?{...studioSettings(recipe.settings),engine,model:chosen}:undefined};
}
