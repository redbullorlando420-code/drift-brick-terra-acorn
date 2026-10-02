import { registerHooks } from 'node:module';
import fs from 'node:fs/promises';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e}}});
const { parseFollowImport } = await import('../src/lib/videos/follow-import.ts');
const { resolveYoutubeCreator } = await import('../src/lib/remote/youtube-resolve.ts');
const { setYoutubeRequestGap } = await import('../src/lib/remote/youtube-transport.ts');
const { browseYoutubeLives } = await import('../src/lib/remote/youtube-live-browse.ts');
const text = await fs.readFile(process.argv[2], 'utf8');
const names = parseFollowImport(text,'youtube').map(row=>row.query);
console.log(JSON.stringify({uniqueCreators:names.length,legacyWhitespaceTokens:new Set(text.split(/[\s,]+/)).size,unicodeNames:names.filter(n=>/[^\x00-\x7f]/.test(n)).length,quotedCommaNames:names.filter(n=>n.includes(','))}));
if (process.argv.includes('--network')) {
 setYoutubeRequestGap(1500);
 for (const query of names.slice(0,3)) try {console.log(JSON.stringify({query,channelId:await resolveYoutubeCreator(query)}));} catch(error) {console.log(JSON.stringify({query,error:error.message}));}
 try {const channelId=await resolveYoutubeCreator('@LofiGirl');console.log(JSON.stringify({liveCreator:'Lofi Girl',channelId,lives:await browseYoutubeLives(channelId)}));} catch(error) {console.log(JSON.stringify({liveError:error.message}));}
}
