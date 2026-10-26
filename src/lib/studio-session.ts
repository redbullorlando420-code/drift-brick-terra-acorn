import { generatedSeed, studioSettingsError, type StudioSettings } from './studio-settings.ts';
import { generatedCheckpoint, generatedProvenance, type RecipeProvenance } from './studio-recipes.ts';
import type { ModelPreflight } from './studio-model-notes.ts';
import { createLocalId } from './local-id.ts';
import { recoverStudioJobs, STUDIO_JOB_LIMIT, type StudioJob } from './studio-jobs.ts';

export type StudioImage = { blob: Blob; settings: StudioSettings; seed?: number; seconds: number; checkpoint?: string; provenance?:RecipeProvenance };
type StudioSnapshot = { busy: boolean; interrupting: boolean; image: StudioImage | null; note: string; error: string; jobs:StudioJob[]; ready:boolean; saveError:string };
export type StudioRequest = (path: string, body: object) => Promise<{ image?: string; info?: string; engineJobId?:string }>;
export type StudioJobStorage = { load:()=>Promise<StudioJob[]>; save:(jobs:StudioJob[])=>Promise<string|void> };
/** One user-started request; durable small receipts never resubmit engine work.
 * Image bytes remain one in-memory preview, separate from saved job metadata. */
export class StudioSession {
  private state: StudioSnapshot;
  private listeners = new Set<() => void>();
  private run = 0;
  private engine = 'a1111';
  private hydration:Promise<void>|null=null;
  private readonly request:StudioRequest;
  private readonly storage?:StudioJobStorage;
  private writing:Promise<boolean>=Promise.resolve(true);
  constructor(request: StudioRequest,storage?:StudioJobStorage) { this.request=request;this.storage=storage;this.state={busy:false,interrupting:false,image:null,note:'',error:'',jobs:[],ready:!storage,saveError:''}; }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private patch(change: Partial<StudioSnapshot>) { this.state = { ...this.state, ...change }; for (const listener of this.listeners) listener(); }
  private job(id:string,change:Partial<StudioJob>){this.patch({jobs:this.state.jobs.map(row=>row.id===id?{...row,...change,updatedAt:Math.max(Date.now(),row.updatedAt)}:row)});}
  async hydrate(){
    if(this.state.ready||!this.storage)return;if(this.hydration)return this.hydration;
    const task=(async()=>{try{const saved=await this.storage!.load(),jobs=recoverStudioJobs(saved);this.patch({jobs,ready:true,error:''});if(jobs.some((job,i)=>job!==saved[i]))await this.persist();}catch(e){this.patch({error:e instanceof Error?e.message:'Could not recover image jobs.'});}})();
    this.hydration=task;try{await task;}finally{this.hydration=null;}
  }
  private persist(){if(!this.storage)return Promise.resolve(true);const jobs=this.state.jobs;const next=this.writing.then(async()=>{try{const warning=await this.storage!.save(jobs);this.patch({saveError:warning??''});return true;}catch(e){this.patch({saveError:e instanceof Error?e.message:'Image job history could not be saved.'});return false;}});this.writing=next;return next;}
  retrySave=()=>this.persist();
  clearImage = () => { if (!this.state.busy) this.patch({ image: null, error: '', note: 'Image cleared from this app session. Downloaded files and saved recipes are unchanged.' }); };
  async generate(settings: StudioSettings, review?:ModelPreflight) {
    if(this.state.busy)return;
    if(!this.state.ready){this.patch({error:'Recover image job history before generating.'});return;}
    const validation=studioSettingsError(settings);if(validation){this.patch({error:validation});return;}
    const submitted={...settings},started=performance.now(),id=createLocalId('studio:'),at=Date.now();
    this.run++;this.engine=submitted.engine??'a1111';
    const job:StudioJob={id,status:'queued',createdAt:at,updatedAt:at,settings:submitted,detail:'Intent recorded before contacting the local engine.'};
    this.patch({busy:true,interrupting:false,error:'',note:'Preparing a recoverable local generation.',jobs:[job,...this.state.jobs].slice(0,STUDIO_JOB_LIMIT)});
    let sent=false;
    try{
      if(this.storage&&!await this.persist())throw Error('Job was not sent because its intent could not be saved.');
      if(this.state.interrupting){this.job(id,{status:'cancelled',detail:'Cancelled before the local request was sent.'});return;}
      this.job(id,{status:'running',detail:'Local request submitted. Navigation keeps this request; reload never resubmits it.'});
      if(this.storage&&!await this.persist())throw Error('Job was not sent because its running receipt could not be saved.');
      if(this.state.interrupting){this.job(id,{status:'cancelled',detail:'Cancelled before the local request was sent.'});return;}
      this.patch({note:'Generating locally. You can visit another app tab and return to the result.'});sent=true;
      const result=await this.request(submitted.engine==='comfy'?'/studio/qwen/generate':'/studio/generate',{prompt:submitted.prompt,negativePrompt:submitted.negative,steps:submitted.steps,width:submitted.size,height:submitted.size,seed:submitted.seed,clientJobId:id,...(submitted.model?{model:submitted.model}:{})});
      if(typeof result.image!=='string'||result.image.length>14000000||!/^iVBORw0KGgo[A-Za-z0-9+/=\r\n]*$/.test(result.image))throw Error('The image response is missing, invalid or exceeds the preview budget.');
      const bytes=Uint8Array.from(atob(result.image),character=>character.charCodeAt(0)),interrupted=this.state.interrupting;
      const image:StudioImage={blob:new Blob([bytes],{type:'image/png'}),settings:submitted,seed:generatedSeed(result.info,submitted.seed),checkpoint:generatedCheckpoint(result.info),provenance:generatedProvenance(submitted,result.info,review),seconds:Math.max(.1,Math.round((performance.now()-started)/100)/10)};
      this.job(id,{status:interrupted?'cancelled':'completed',detail:interrupted?'Cancellation requested; returned image may be partial.':'Engine returned a PNG. Preview bytes are kept only in this browser session.',...(typeof result.engineJobId==='string'&&/^[\w-]{1,128}$/.test(result.engineJobId)?{engineJobId:result.engineJobId}:{}),output:{seed:image.seed,checkpoint:image.checkpoint,seconds:image.seconds,preview:'session-only'}});
      this.patch({image:interrupted&&this.state.image?this.state.image:image,note:interrupted?'Generation stopped. The engine returned a partial image; your previous completed image was preserved when available.':'Image ready. Download it before reloading or closing this browser tab.'});
    }catch(cause){
      const message=cause instanceof Error?cause.message:'Generation failed.',unknown=sent&&(cause as {outcome?:string})?.outcome==='unknown';
      const status=unknown?'interrupted':this.state.interrupting&&/interrupt|cancel/i.test(message)?'cancelled':'failed';
      this.job(id,{status,detail:unknown?'Connection ended with an unknown engine outcome. Check the engine; no automatic retry was sent.':message.slice(0,500)});
      this.patch({note:'',error:message+' Your previous image and submitted parameters remain available.'});
    }finally{if(this.storage)await this.persist();this.patch({busy:false,interrupting:false});}
  }
  async interrupt(){
    if(!this.state.busy||this.state.interrupting||!['queued','running'].includes(this.state.jobs[0]?.status??''))return;const id=this.state.jobs[0]?.id,run=this.run;
    this.patch({interrupting:true,error:''});if(id)this.job(id,{status:'cancel-requested',detail:'Explicit cancellation requested; waiting for an engine outcome.'});
    try{await this.request(this.engine==='comfy'?'/studio/qwen/interrupt':'/studio/interrupt',{});if(this.state.busy&&this.run===run){this.patch({note:'Interrupt requested. Waiting for the engine to finish stopping.'});if(this.storage)await this.persist();}}
    catch(cause){if(this.state.busy&&this.run===run){if(id)this.job(id,{status:'running',detail:'Cancellation could not be confirmed. Retry the interrupt control.'});this.patch({interrupting:false,error:cause instanceof Error?cause.message:'Interrupt could not be sent.'});}}
  }
}
export function createStudioSessions(request:StudioRequest,storage?:(owner:string)=>StudioJobStorage){
  const sessions=new Map<string,StudioSession>();
  return(owner:string)=>{let session=sessions.get(owner);if(!session){if(sessions.size>=2)sessions.delete(sessions.keys().next().value!);session=new StudioSession(request,storage?.(owner));}sessions.delete(owner);sessions.set(owner,session);return session;};
}
