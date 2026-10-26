import {DEFAULT_RECOMMENDATION_SESSION,normalizeRecommendationSession,sameRecommendationSession,type RecommendationSession} from './videos/recommendation-session.ts';
/** Volatile discovery controls: no persistence, library mutation, room sharing or provider request. */
export function createRecommendationSessionStore(){
  let snapshot=DEFAULT_RECOMMENDATION_SESSION;const listeners=new Set<()=>void>();
  const apply=(raw:Partial<RecommendationSession>)=>{const next=normalizeRecommendationSession(raw);if(sameRecommendationSession(snapshot,next))return false;snapshot=next;for(const listener of listeners)listener();return true;};
  return {getSnapshot:()=>snapshot,subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},apply,reset:()=>apply(DEFAULT_RECOMMENDATION_SESSION)};
}
export const recommendationSessionStore=createRecommendationSessionStore();
