import {useEffect,useSyncExternalStore} from 'react';
import {getFilmReviews,getServerFilmReviews,hydrateFilmReviews,subscribeFilmReviews} from '@/lib/film-review-store';
export function useFilmReviews(active=true){const snapshot=useSyncExternalStore(subscribeFilmReviews,active?getFilmReviews:getServerFilmReviews,getServerFilmReviews);useEffect(()=>{if(active)void hydrateFilmReviews();},[active]);return snapshot;}
