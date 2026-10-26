import { studioSettings, studioSettingsError, type StudioSettings } from './studio-settings.ts';
export const STUDIO_JOB_LIMIT=8;
export const STUDIO_JOB_STATES=['queued','running','cancel-requested','completed','cancelled','failed','interrupted'] as const;
export type StudioJob={id:string;status:typeof STUDIO_JOB_STATES[number];createdAt:number;updatedAt:number;settings:StudioSettings;engineJobId?:string;detail:string;output?:{seed?:number;checkpoint?:string;seconds:number;preview:'session-only'}};
export type StudioJobLedger={version:1;updatedAt:number;jobs:StudioJob[]};
export const EMPTY_STUDIO_JOBS:StudioJobLedger={version:1,updatedAt:0,jobs:[]};
export function readStudioJobs(raw:unknown):StudioJobLedger {
  const r=raw as StudioJobLedger;if(!r||r.version!==1||!Number.isSafeInteger(r.updatedAt)||r.updatedAt<0||!Array.isArray(r.jobs)||r.jobs.length>STUDIO_JOB_LIMIT)throw Error('Unsupported image job history.');
  const seen=new Set<string>();const jobs=r.jobs.map(value=>{if(!value||typeof value.id!=='string'||!/^[\w:-]{1,100}$/.test(value.id)||seen.has(value.id)||!(STUDIO_JOB_STATES as readonly string[]).includes(value.status)||!Number.isSafeInteger(value.createdAt)||value.createdAt<0||!Number.isSafeInteger(value.updatedAt)||value.updatedAt<value.createdAt||typeof value.detail!=='string'||value.detail.length>500)throw Error('Invalid saved image job.');seen.add(value.id);
    const settings=studioSettings(value.settings);if(studioSettingsError(value.settings)||studioSettingsError(settings)||typeof value.settings?.prompt!=='string'||settings.prompt!==value.settings.prompt)throw Error('Invalid saved image parameters.');
    const engineJobId=typeof value.engineJobId==='string'&&/^[\w-]{1,128}$/.test(value.engineJobId)?value.engineJobId:undefined;
    const output=value.output&&Number.isFinite(value.output.seconds)&&value.output.seconds>=0?{seconds:Math.min(6000,value.output.seconds),preview:'session-only' as const,...(Number.isInteger(value.output.seed)&&value.output.seed!>=0?{seed:value.output.seed}:{}),...(typeof value.output.checkpoint==='string'?{checkpoint:value.output.checkpoint.slice(0,200)}:{})}:undefined;
    return {id:value.id,status:value.status,createdAt:value.createdAt,updatedAt:value.updatedAt,settings,detail:value.detail,...(engineJobId?{engineJobId}:{}),...(output?{output}:{})};});
  return {version:1,updatedAt:r.updatedAt,jobs};
}
export const activeStudioJob=(job:StudioJob)=>['queued','running','cancel-requested'].includes(job.status);
export function recoverStudioJobs(jobs:StudioJob[],now=Date.now()) {return jobs.map(job=>activeStudioJob(job)?{...job,status:'interrupted' as const,updatedAt:Math.max(now,job.updatedAt),detail:'Browser session ended. Engine outcome is unknown; this request was not resubmitted. Check the local engine before a new explicit generation.'}:job);}
