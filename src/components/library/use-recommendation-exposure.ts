import { useEffect,type RefObject } from 'react';
import { recommendationVisibility } from '@/lib/card-visibility';
import { createExposureDwell,type ExposureSurface } from '@/lib/recommendation-exposure-dwell';
import { hydrateRecommendationExposure,recordRecommendationExposure } from '@/lib/recommendation-exposure-store';
import { exposureKey } from '@/lib/videos/recommendation-exposure';
import type { LibraryVideo } from '@/lib/videos/types';
import { useLibrary } from '@/lib/videos/store';
let shared:ReturnType<typeof createExposureDwell>|undefined,users=0,stopGlobal:(()=>void)|undefined;
function acquire(){
 if(!shared){
  shared=createExposureDwell({schedule:(work,ms)=>{const timer=window.setTimeout(work,ms);return ()=>window.clearTimeout(timer);},record:recordRecommendationExposure,
   eligible:element=>{if(!element.isConnected)return false;const rect=element.getBoundingClientRect(),x=Math.min(innerWidth-1,Math.max(0,rect.left+rect.width/2)),y=Math.min(innerHeight-1,Math.max(0,rect.top+rect.height/2));return rect.width>0&&rect.height>0&&element.contains(document.elementFromPoint(x,y));}});
  const sync=()=>{const state=useLibrary.getState();shared?.state(document.visibilityState==='visible'&&document.hasFocus(),state.activeId?null:state.previewId?'preview':'browse');};
  const stop=useLibrary.subscribe((state,previous)=>{if(state.activeId!==previous.activeId||state.previewId!==previous.previewId)sync();});
  document.addEventListener('visibilitychange',sync);window.addEventListener('focus',sync);window.addEventListener('blur',sync);sync();
  stopGlobal=()=>{stop();document.removeEventListener('visibilitychange',sync);window.removeEventListener('focus',sync);window.removeEventListener('blur',sync);};
  void hydrateRecommendationExposure();
 }
 users++;return shared;
}
export function useRecommendationExposure(ref:RefObject<HTMLElement|null>,video:LibraryVideo,surface:ExposureSurface='browse',enabled=true){
 useEffect(()=>{
  const element=ref.current;if(!enabled||!element||typeof IntersectionObserver==='undefined')return;
  const tracker=acquire(),dwell=tracker.observe(element,exposureKey(video),surface),stop=recommendationVisibility.observe(element,dwell.visible);
  return ()=>{stop();dwell.stop();if(!--users){stopGlobal?.();stopGlobal=undefined;shared?.dispose();shared=undefined;}};
 },[ref,video.id,video.remote?.videoId,video.remote?.kind,surface,enabled]);
}
import.meta.hot?.dispose(()=>{stopGlobal?.();shared?.dispose();shared=undefined;stopGlobal=undefined;users=0;});
