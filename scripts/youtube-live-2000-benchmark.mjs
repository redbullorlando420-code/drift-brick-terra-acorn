import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {createYoutubeLiveReader}=await import('../src/lib/remote/youtube-live-browse.ts');
const {createYoutubeTransport}=await import('../src/lib/remote/youtube-transport.ts');
const channels=Array.from({length:2000},(_,i)=>'UC'+String(i).padStart(22,'0'));
async function measure(quick){
 let requests=0,active=0,peak=0,homes=0;const latencyMs=8;
 const transport=createYoutubeTransport({gapMs:()=>1,fetch:async(_url,init)=>{
  requests++;peak=Math.max(peak,++active);const target=JSON.parse(init.body);if(!target.params)homes++;
  await new Promise(r=>setTimeout(r,latencyMs));active--;
  return Response.json({metadata:{channelMetadataRenderer:{externalId:target.browseId}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:!target.params,title:'Home',content:{}}},{tabRenderer:{selected:Boolean(target.params),title:'Live',endpoint:{commandMetadata:{webCommandMetadata:{url:'/channel/'+target.browseId+'/streams'}},browseEndpoint:{browseId:target.browseId,params:'streams'}},content:{richGridRenderer:{contents:[]}}}}]}}});
 }});
 const read=async target=>(await transport.request('https://www.youtube.com/youtubei/v1/browse',{scope:quick?'live':'catalog',body:JSON.stringify(target)})).json();
 const reader=quick?createYoutubeLiveReader(read):async id=>{await read({browseId:id});await read({browseId:id,params:'streams'});return[];};
 let position=0;const started=performance.now();await Promise.all(Array.from({length:4},async()=>{while(position<channels.length)await reader(channels[position++]);}));
 return{channels:channels.length,requests,homeRequests:homes,peakTransfers:peak,elapsedMs:Math.round(performance.now()-started),simulatedLatencyMs:latencyMs,startGapMs:1};
}
const baseline=await measure(false),quick=await measure(true);
const report={baseline,quick,speedup:Number((baseline.elapsedMs/quick.elapsedMs).toFixed(2)),requestReductionPercent:Number(((1-quick.requests/baseline.requests)*100).toFixed(1)),limitation:'Synthetic I/O benchmark: 2,000 unique channels, 8ms mocked latency, 1ms start gap; real YouTube/network latency and user pacing determine actual scan time. No public provider traffic was generated.'};
if(quick.peakTransfers>4||quick.requests>2010||quick.elapsedMs>=baseline.elapsedMs)throw Error('Quick live throughput regression');
writeFileSync('screenshots/youtube-live-2000-benchmark.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
