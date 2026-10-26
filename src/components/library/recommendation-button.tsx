import { useRef,type ButtonHTMLAttributes } from 'react';
import type { LibraryVideo } from '@/lib/videos/types';
import { useRecommendationExposure } from './use-recommendation-exposure';
export function RecommendationButton({video,surface='browse',enabled=true,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{video:LibraryVideo;surface?:'browse'|'preview';enabled?:boolean}){
 const ref=useRef<HTMLButtonElement>(null);useRecommendationExposure(ref,video,surface,enabled);
 return <button {...props} ref={ref} data-recommendation-card={enabled?video.id:undefined} />;
}
