import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {createYoutubeLiveReader}=await import('../src/lib/remote/youtube-live-browse.ts');
const {browseYoutubeCatalog}=await import('../src/lib/remote/youtube-browse.ts');
const {resolveYoutubeCreator}=await import('../src/lib/remote/youtube-resolve.ts');
const ids=['UCLA_DiR1FfKNvjuUpBHmylQ',await resolveYoutubeCreator('@NASASpaceflight')];
let requests=0;const targets=[];
const reader=createYoutubeLiveReader(async target=>{requests++;targets.push({channel:target.browseId,streams:Boolean(target.params)});return browseYoutubeCatalog(target,undefined,true);});
const results=[];for(const id of ids){const before=requests,at=performance.now();try{const rows=await reader(id);results.push({channel:id,requests:requests-before,elapsedMs:Math.round(performance.now()-at),broadcasts:rows});}catch(error){results.push({channel:id,requests:requests-before,error:error.message});}}
const before=requests;try{const rows=await reader(ids[0]);results.push({channel:ids[0],warm:true,requests:requests-before,broadcasts:rows});}catch(error){results.push({channel:ids[0],warm:true,error:error.message});}
const report={at:new Date().toISOString(),results,targets,limitation:'Three point-in-time checks of two public channels; no personal follow list was read. Provider availability can change.'};
writeFileSync('screenshots/youtube-quick-live-native.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(results.some(row=>row.error))process.exitCode=1;
