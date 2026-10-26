import {sessionPreferenceAdjustment,type RecommendationSession} from './recommendation-session.ts';
export type GuideWeights=Readonly<{favorite:number;like:number;topic:number}>;
export const DEFAULT_GUIDE_WEIGHTS:GuideWeights=Object.freeze({favorite:3,like:2,topic:1});
export function isGuideWeights(raw:unknown):raw is GuideWeights{
 const r=raw as GuideWeights|undefined;return Boolean(r&&Number.isInteger(r.favorite)&&r.favorite>=0&&r.favorite<=8&&Number.isInteger(r.like)&&r.like>=0&&r.like<=8&&Number.isInteger(r.topic)&&r.topic>=0&&r.topic<=3);
}
export const sameGuideWeights=(a:GuideWeights,b:GuideWeights)=>a.favorite===b.favorite&&a.like===b.like&&a.topic===b.topic;
export function guideWeights(raw?:unknown):GuideWeights{return isGuideWeights(raw)?Object.freeze({favorite:raw.favorite,like:raw.like,topic:raw.topic}):DEFAULT_GUIDE_WEIGHTS;}
export const guidePositive=(favorite:boolean,like:boolean,topics:number,w:GuideWeights)=>Number(favorite)*w.favorite+Number(like)*w.like+topics*w.topic;
export function guidePersonalScore(row:{favorite:boolean;like:boolean;topics:number;penalty:number;exposure:number},w:GuideWeights,session:RecommendationSession){const positive=guidePositive(row.favorite,row.like,row.topics,w);return positive+sessionPreferenceAdjustment(positive,session)-row.penalty-row.exposure;}
export function guideTieRank(id:string,seed:number){let value=seed>>>0;for(const char of id)value=Math.imul(value^char.charCodeAt(0),0x45d9f3b);return value>>>0;}
export type GuidePreset={version:1;updatedAt:number;current:GuideWeights;previous?:GuideWeights};
export const EMPTY_GUIDE_PRESET:GuidePreset=Object.freeze({version:1,updatedAt:0,current:DEFAULT_GUIDE_WEIGHTS});
export function isGuidePreset(raw:unknown):raw is GuidePreset{const r=raw as GuidePreset|undefined;return Boolean(r&&r.version===1&&Number.isSafeInteger(r.updatedAt)&&r.updatedAt>=0&&isGuideWeights(r.current)&&(r.previous===undefined||isGuideWeights(r.previous)));}
export function normalizeGuidePreset(raw:unknown):GuidePreset{return isGuidePreset(raw)?Object.freeze({version:1,updatedAt:raw.updatedAt,current:guideWeights(raw.current),...(raw.previous?{previous:guideWeights(raw.previous)}:{})}):EMPTY_GUIDE_PRESET;}
export function newestGuidePreset(a:unknown,b:unknown){const left=normalizeGuidePreset(a),right=normalizeGuidePreset(b);return right.updatedAt>=left.updatedAt?right:left;}
export function changeGuidePreset(ledger:GuidePreset,weights:GuideWeights,now=Date.now()):GuidePreset{if(!isGuideWeights(weights))throw Error('Invalid Guide weights.');if(sameGuideWeights(ledger.current,weights))return ledger;return normalizeGuidePreset({version:1,updatedAt:Math.max(now,ledger.updatedAt+1),current:weights,previous:ledger.current});}
export const rollbackGuidePreset=(ledger:GuidePreset,now=Date.now())=>ledger.previous?changeGuidePreset(ledger,ledger.previous,now):ledger;
