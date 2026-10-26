import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {getTopicBridges,pauseTopicBridge} from '@/lib/topic-bridge-store';
import {bridgeKey,type BridgePause} from '@/lib/videos/topic-bridges';
export function TopicBridgeButton({bridge}:{bridge:Omit<BridgePause,'at'>}){
 const [message,setMessage]=useState(''),[error,setError]=useState(''),key=bridgeKey(bridge),paused=getTopicBridges().entries.some(entry=>bridgeKey(entry)===key);
 const photo=bridge.a==='photo'||bridge.b==='photo',label='#'+bridge.topic+' · '+bridge.a+' ↔ '+bridge.b;
 return <div className="mt-3"><Button type="button" variant="secondary" className="min-h-11 max-w-full whitespace-normal" aria-label={(paused?'Undo bridge pause ':photo?'Pause photo bridge ':'Pause Guide bridge ')+label} aria-pressed={paused} onClick={()=>{try{pauseTopicBridge({...bridge,at:Date.now()},paused);setError('');setMessage(photo?(paused?'Photo audit connection restored.':'Photo audit connection paused and excluded from active audit counts. It stays here for Undo.'):(paused?'Bridge restored. Ask again or choose New recommendations to apply.':'Guide preference bridge paused. Ask again or choose New recommendations to apply. Tags and explicit search stay unchanged.'));}catch(cause){setError(cause instanceof Error?cause.message:'Bridge choice could not be saved.');}}}>{paused?'Undo bridge pause':photo?'Pause photo bridge':'Pause Guide bridge'}</Button><p role="status" className="mt-2 text-xs leading-5 text-muted">{message}</p>{error&&<p role="alert" className="mt-2 text-xs text-fg">{error}</p>}</div>;
}
