import {useEffect,useSyncExternalStore} from 'react';
import {getAnimeReviews,getServerAnimeReviews,hydrateAnimeReviews,subscribeAnimeReviews} from '@/lib/anime-review-store';
export function useAnimeReviews(active=true){const snapshot=useSyncExternalStore(subscribeAnimeReviews,active?getAnimeReviews:getServerAnimeReviews,getServerAnimeReviews);useEffect(()=>{if(active)void hydrateAnimeReviews();},[active]);return snapshot;}
