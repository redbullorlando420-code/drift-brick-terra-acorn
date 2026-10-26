import {bridgeText} from './videos/topic-bridges.ts';
import type {ReviewedPhoto} from './videos/topic-bridge-audit.ts';
const EMPTY:readonly ReviewedPhoto[]=Object.freeze([]);let rows=EMPTY;const listeners=new Set<()=>void>();
export const getReviewedPhotos=()=>rows;
export function setReviewedPhotos(next:readonly ReviewedPhoto[]){rows=Object.freeze(next.slice(0,48).map((photo,index)=>Object.freeze({id:'reviewed-photo:'+index,name:bridgeText(photo.name),tags:Object.freeze(photo.tags.filter(tag=>typeof tag==='string').slice(0,80)),reviewed:photo.reviewed===true,direct:photo.direct===true,hidden:photo.hidden===true})));for(const listener of listeners)listener();}
export function clearReviewedPhotos(){if(!rows.length)return;rows=EMPTY;for(const listener of listeners)listener();}
export const subscribeReviewedPhotos=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
export const getServerReviewedPhotos=()=>EMPTY;
