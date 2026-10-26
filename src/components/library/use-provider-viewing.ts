import {useEffect,useSyncExternalStore} from 'react';
import {getProviderViewing,getServerProviderViewing,subscribeProviderViewing,hydrateProviderViewing,changeProviderViewing} from '@/lib/provider-viewing-store';
import {chooseProviderView,type ProviderViewMode} from '@/lib/videos/provider-viewing';
import type {AdultPullProvider} from '@/lib/videos/adult-providers';
export function useProviderViewing(){const state=useSyncExternalStore(subscribeProviderViewing,getProviderViewing,getServerProviderViewing);useEffect(()=>{void hydrateProviderViewing();},[]);return state;}
export function useProviderView(provider:AdultPullProvider,href:string){const state=useProviderViewing(),choice=state.ledger.choices[provider];const mode=choice?.mode??(provider==='myfreecams'&&!state.legacyMfc?'website':'embedded');return {...state,mode,choose(next:ProviderViewMode){changeProviderViewing(l=>chooseProviderView(l,provider,next,href));if(provider==='myfreecams')try{localStorage.setItem('reelcase.mfc.view-mode.v1',next);}catch{/* The durable store reports save failure. */}}};}
