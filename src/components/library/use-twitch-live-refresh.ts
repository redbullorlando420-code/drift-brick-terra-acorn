import { TWITCH_QUICK_LIVE, selectTwitchQuickLiveChannels } from '@/lib/videos/twitch-quick-live';
import { useEffect } from 'react';
import { useLibrary } from '@/lib/videos/store';
import { getPullSettings } from '@/lib/pull-settings';
import { catalogPullAvailable,subscribePullAvailability } from '@/lib/pull-control';
import { registerPeriodicTask } from '@/lib/periodic-work';
let lastAttempt=0;
/** Lightweight live work has its own owner, so a long archive await cannot
 * delay status until the current broadcast expires. Requests still use the
 * shared transport/admission queue and can be cancelled normally. */
export function useTwitchLiveRefresh(){
 const hydrated=useLibrary(s=>s.hydrated),source=useLibrary(s=>s.sourceId);
 useEffect(()=>{
  if(!hydrated)return;const demand=['live','twitch'].includes(source);let busy=false,stopped=false;
  const tick=async()=>{
   if(stopped||busy||Date.now()-lastAttempt<TWITCH_QUICK_LIVE.tickMs||!getPullSettings().automaticPulls||!catalogPullAvailable(false, demand)||!navigator.onLine)return;
   const state=useLibrary.getState();if(!selectTwitchQuickLiveChannels(state.follows,1,true).length)return;
   busy=true;
   try{const result=await state.refreshFollows('twitch',{twitchLiveOnly:true,scheduled:true,liveDemand:demand,liveSweep:['twitch','live','assistant','landing'].includes(source)});if(result.pull)lastAttempt=Date.now();}
   finally{busy=false;}
  };
  const task=registerPeriodicTask({name:'Twitch live discovery',everyMs:TWITCH_QUICK_LIVE.tickMs,firstMs:1500,mode:demand?'visible':'active',enabled:()=>getPullSettings().automaticPulls&&catalogPullAvailable(true, demand)&&navigator.onLine,work:tick});
  const off=subscribePullAvailability(task.wake);
  return()=>{stopped=true;task.cancel();off();};
 },[hydrated,source]);
}
