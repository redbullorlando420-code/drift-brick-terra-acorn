export type RoomPlaybackAccess = { playback: boolean; seeking: boolean; live: boolean };
export function guestPlaybackRequest(current:{playing:boolean;position:number},request:{playing?:unknown;position?:unknown;seek?:unknown},access:RoomPlaybackAccess) {
 const seek=request.seek===true;
 if(seek&&(access.live||!access.seeking))return {allowed:false as const,reason:access.live?'Live streams keep their own playback clock.':'The host is handling timeline seeking. Readiness, voting and chat are still available.'};
 if(!seek&&!access.playback)return {allowed:false as const,reason:'The host is handling play and pause. Readiness, voting and chat are still available.'};
 if(seek&&(typeof request.position!=='number'||!Number.isFinite(request.position)||request.position<0))return {allowed:false as const,reason:'That seek time is invalid.'};
 // A playback-only request cannot smuggle a seek. A seek-only guest cannot
 // change play/pause as a side effect of moving the timeline.
 return {allowed:true as const,seek,playing:access.playback&&typeof request.playing==='boolean'?request.playing:current.playing,position:seek?request.position as number:current.position};
}
