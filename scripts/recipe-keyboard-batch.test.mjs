import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRecipe, recipeDocument, restoreRecipes, generatedProvenance, recipeLoadReview } from '../src/lib/studio-recipes.ts';
import { StudioSession } from '../src/lib/studio-session.ts';
import { generationPayload } from '../companion/creative-tools.mjs';
import { filterCommands, commandAvailability, shortcutBlocked, readShortcutPreferences, setShortcutPreferences, shortcutEnabled } from '../src/lib/keyboard-commands.ts';
const settings={prompt:'A forest',negative:'blurry',steps:20,seed:42,size:512,model:'good.safetensors'};
const review={version:1,engine:'a1111',name:'good.safetensors',ready:true,family:'sd1',role:'checkpoint',bytes:100,checks:[],hardware:{weightsGiB:0,note:''},source:{url:'https://huggingface.co/example/model',revision:'a'.repeat(40),recordedDigest:'b'.repeat(64)}};
const observed={sd_model_name:'good',sd_model_hash:'b'.repeat(10),sampler_name:'Euler',scheduler:'Automatic',cfg_scale:7,seed:42};
const content={name:'Forest recipe',settings,checkpoint:'good',provenance:generatedProvenance(settings,observed,review)};
test('v2 recipe records observed sampler, hash, install revision and exact bounded form settings',()=>{
 const parsed=parseRecipe(JSON.stringify(recipeDocument(content)));assert.deepEqual(parsed,content);
 assert.equal(parsed.provenance.sha256,'b'.repeat(64));assert.equal(parsed.provenance.engineHash,'b'.repeat(10));assert.equal(parsed.provenance.revision,'a'.repeat(40));
 const loaded=recipeLoadReview(parsed,'a1111',['good.safetensors'],undefined,review);assert(loaded.canLoad);assert.deepEqual(loaded.warnings,[]);assert.deepEqual(loaded.settings,{...settings,engine:'a1111'});
 const replay=generationPayload({prompt:loaded.settings.prompt,negativePrompt:loaded.settings.negative,steps:loaded.settings.steps,seed:loaded.settings.seed,width:loaded.settings.size,height:loaded.settings.size});
 assert.deepEqual({sampler:replay.sampler_name,scheduler:replay.scheduler,guidance:replay.cfg_scale,seed:replay.seed,width:replay.width,height:replay.height},{sampler:'Euler',scheduler:'Automatic',guidance:7,seed:42,width:512,height:512});
});
test('legacy v1 recipes and owner records survive additive v2 export without invented provenance',()=>{
 const old={format:'realhub-studio-recipe',version:1,name:'Old',settings,checkpoint:'good'};
 const parsed=parseRecipe(JSON.stringify(old));assert(!parsed.provenance);
 const saved=restoreRecipes(JSON.stringify([{...parsed,id:'legacy',savedAt:100},{...content,id:'new',savedAt:200}]));assert.equal(saved.length,2);assert.deepEqual(saved[1].provenance,content.provenance);
 const future=JSON.stringify({...old,version:3});assert.throws(()=>parseRecipe(future));
 const plan=recipeLoadReview(parsed,'a1111',['good.safetensors']);assert(plan.warnings.some(s=>s.includes('not recorded')));
});
test('portable exports drop unknown secrets, instructions and server paths at every retained layer',()=>{
 const hostile={...content,token:'CANARY_TOKEN',path:'C:/private',settings:{...settings,server:'CANARY_SERVER',password:'CANARY_PASS'},provenance:{...content.provenance,apiKey:'CANARY_API',headers:{cookie:'CANARY_COOKIE'},localPath:'CANARY_PATH'}};
 const bytes=JSON.stringify(recipeDocument(hostile));assert(!bytes.includes('CANARY'));assert(!bytes.includes('C:/private'));assert.equal(parseRecipe(bytes).settings.prompt,settings.prompt);
 for(const patch of [{source:'https://huggingface.co/example/model?token=CANARY'},{modelName:'C:/private/model.safetensors'},{revision:'main'},{sha256:'invalid'},{sampler:'../command'},{guidance:Infinity},{width:768}])assert.throws(()=>parseRecipe(JSON.stringify({...recipeDocument(content),provenance:{...content.provenance,...patch}})));
});
test('missing model and wrong engine block loading; explicit alternatives retain honest mismatch warnings',()=>{
 const absent=recipeLoadReview(content,'a1111',['other.safetensors']);assert(!absent.canLoad);assert.equal(absent.settings,undefined);
 const alternative=recipeLoadReview(content,'a1111',['other.safetensors'],'other.safetensors');assert(alternative.canLoad);assert.equal(alternative.settings.model,'other.safetensors');assert(alternative.warnings.some(s=>s.includes('different model')));assert(alternative.warnings.some(s=>s.includes('digest')));
 assert(!recipeLoadReview(content,'comfy',['good.safetensors']).canLoad);
 assert(!recipeLoadReview(content,'a1111',['good.safetensors'],'not-installed').canLoad);
});
test('unsupported or unknown engine parameters are shown as mapping warnings, never executed',()=>{
 const changed={...content,provenance:{...content.provenance,sampler:'Unrecognized sampler',scheduler:'different',guidance:12,denoise:.5}};
 const plan=recipeLoadReview(changed,'a1111',['good.safetensors'],undefined,review);assert(plan.warnings.some(s=>s.includes('cannot apply')));assert.deepEqual(plan.supported,{sampler:'Euler',scheduler:'Automatic',guidance:7,denoise:1});assert(!('sampler' in plan.settings));
 const unknown=generatedProvenance(settings,'unreadable',review);assert(!unknown.sampler);assert(!unknown.engineHash);assert(!generatedProvenance(settings,{...observed,sd_model_name:'other'},review).sha256);
});
test('session captures submitted model evidence and actual random seed without later form edits',async()=>{
 let finish;const waiting=new Promise(resolve=>finish=resolve);const session=new StudioSession(async()=>waiting);const input={...settings,seed:-1};const running=session.generate(input,review);input.prompt='changed';finish({image:'iVBORw0KGgoAAAA=',info:JSON.stringify(observed)});await running;
 const image=session.getSnapshot().image;assert.equal(image.seed,42);assert.equal(image.settings.prompt,settings.prompt);assert.deepEqual(image.provenance,content.provenance);
});
test('Qwen recipes describe the fixed supported graph and cannot cross-load into A1111',()=>{
 const q={...settings,engine:'comfy',model:'qwen_image_2.1_turbo_int8_convrot.safetensors',steps:8};
 const recipe={name:'Qwen',settings:q,provenance:generatedProvenance(q,{sampler_name:'euler',scheduler:'simple',cfg_scale:1,sd_model_name:q.model})};
 const plan=recipeLoadReview(parseRecipe(JSON.stringify(recipeDocument(recipe))),'comfy',[q.model]);assert.equal(plan.supported.guidance,1);assert(plan.canLoad);assert(!recipeLoadReview(recipe,'a1111',[q.model]).canLoad);
});
test('shortcut map is searchable, contexts are explicit, and unsupported bindings cannot be invented',()=>{
 assert.deepEqual(filterCommands('seek').map(c=>c.id),['seek']);assert.equal(filterCommands('does not exist').length,0);
 assert.equal(commandAvailability('browse',{viewer:true,provider:true,preview:false}),'Close the viewer or preview first');assert.equal(commandAvailability('local',{viewer:true,provider:true,preview:false}),'Provider controls own these keys');
 assert.equal(commandAvailability('player',{viewer:false,provider:false,preview:false}),'Open a video first');
});
test('shortcut guards respect composition, prevented keys, repeats, text and modal focus scopes',()=>{
 const oldElement=globalThis.Element,oldDocument=globalThis.document;
 class FakeElement { constructor(editing){this.editing=editing;} closest(){return this.editing?this:null;} }
 try{globalThis.Element=FakeElement;let modal=false;globalThis.document={querySelector:()=>modal?{}:null};const event={target:new FakeElement(false)};assert(!shortcutBlocked(event));
 for(const patch of [{isComposing:true},{defaultPrevented:true},{repeat:true},{target:new FakeElement(true)}])assert(shortcutBlocked({...event,...patch}));modal=true;assert(shortcutBlocked(event));assert(!shortcutBlocked(event,{dialogs:false}));
 }finally{if(oldElement===undefined)delete globalThis.Element;else globalThis.Element=oldElement;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;}
});
test('conflict preferences are bounded allowlisted choices and default safely after corruption',()=>{
 assert.deepEqual(readShortcutPreferences('{broken'),{search:true,sidebar:true});assert.deepEqual(readShortcutPreferences('{"search":false,"sidebar":true,"command":"ignored"}'),{search:false,sidebar:true});
 setShortcutPreferences({search:false,sidebar:true});assert(!shortcutEnabled('search'));assert(shortcutEnabled('sidebar'));setShortcutPreferences({search:true,sidebar:true});
});
