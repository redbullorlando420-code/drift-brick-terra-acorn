import { createServerFn } from '@tanstack/react-start';
import { youtubePublicRequest } from './youtube-browse';
import { parseRoomYoutubeSearch, roomYoutubeSearchInput } from './room-youtube-search';
type Page = ReturnType<typeof parseRoomYoutubeSearch>;
const cache=new Map<string,{page:Page;expires:number}>(),pending=new Map<string,Promise<Page>>();
export const searchRoomYoutube=createServerFn({method:'POST'}).validator(roomYoutubeSearchInput).handler(async({data})=>{
  const key=JSON.stringify([data.query,data.cursor??'']);
  const hit=cache.get(key);if(hit&&hit.expires>Date.now())return hit.page;
  const existing=pending.get(key);if(existing)return existing;
  if(pending.size>=8)throw Error('Search is busy. Wait a moment and try again.');
  const task=(async()=>{
    const response=await youtubePublicRequest('search',data.cursor?{continuation:data.cursor}:{query:data.query,params:'EgIQAQ%3D%3D'});
    const page=parseRoomYoutubeSearch(response);
    cache.delete(key);cache.set(key,{page,expires:Date.now()+120000});
    while(cache.size>24)cache.delete(cache.keys().next().value!);
    return page;
  })().finally(()=>pending.delete(key));pending.set(key,task);return task;
});
