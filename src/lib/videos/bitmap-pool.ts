import { getPerformanceProfile, subscribePerformanceProfile } from '../performance-profile.ts';

type Bitmap = { width:number; height:number; close:()=>void };
type Job<T> = { source?:T; signal?:AbortSignal; abort:()=>void; settled:boolean; resolve:(bitmap:Bitmap)=>void; reject:(error:Error)=>void };
/** Native bitmap decoding cannot be cancelled. Aborted callers settle promptly,
 * but their native work keeps its slot until it actually returns and is closed. */
export function createBitmapPool<T>(options:{decode:(source:T)=>Promise<Bitmap>;limit:()=>number;subscribe?:(wake:()=>void)=>()=>void;queueLimit?:number}) {
  const waiting:Job<T>[]=[],active=new Set<Job<T>>();
  let stop:(()=>void)|undefined,disposed=false,closedLate=0,cancelled=0,completed=0,peak=0;
  const settle=(job:Job<T>,bitmap?:Bitmap,error?:Error)=>{
    if(job.settled){bitmap?.close();if(bitmap)closedLate++;return;}
    job.settled=true;job.signal?.removeEventListener('abort',job.abort);
    if(bitmap)job.resolve(bitmap);else job.reject(error??new Error('Artwork decoding cancelled.'));
  };
  const unwatch=()=>{if(!active.size&&!waiting.length){stop?.();stop=undefined;}};
  function wake(){
    const limit=Math.max(1,Math.min(4,options.limit()));
    while(!disposed&&active.size<limit&&waiting.length){
      const job=waiting.shift()!;
      if(job.settled)continue;
      active.add(job);peak=Math.max(peak,active.size);
      const source=job.source!;job.source=undefined;
      void Promise.resolve().then(()=>options.decode(source)).then(bitmap=>{
        if(job.signal?.aborted||disposed)settle(job,undefined,new Error('Artwork decoding cancelled.'));
        settle(job,bitmap);completed++;
      },()=>settle(job,undefined,new Error('Artwork could not be decoded.'))).finally(()=>{active.delete(job);wake();unwatch();});
    }
    unwatch();
  }
  return {
    request(source:T,signal?:AbortSignal):Promise<Bitmap>{
      if(disposed||signal?.aborted)return Promise.reject(new Error('Artwork decoding cancelled.'));
      if(waiting.length>=(options.queueLimit??96))return Promise.reject(new Error('Artwork decoder queue is full.'));
      return new Promise((resolve,reject)=>{
        const job:Job<T>={source,signal,settled:false,resolve,reject,abort:()=>{if(job.settled)return;cancelled++;const index=waiting.indexOf(job);if(index>=0)waiting.splice(index,1);job.source=undefined;settle(job);wake();}};
        waiting.push(job);signal?.addEventListener('abort',job.abort,{once:true});
        if(!stop)stop=options.subscribe?.(wake);
        wake();
      });
    },
    snapshot:()=>({active:active.size,queued:waiting.length,limit:Math.max(1,Math.min(4,options.limit())),cancelled,closedLate,completed,peak}),
    dispose(){disposed=true;for(const job of [...waiting,...active])job.abort();waiting.length=0;stop?.();stop=undefined;},
  };
}
const bitmapPool=createBitmapPool<ImageBitmapSource>({decode:source=>createImageBitmap(source),limit:()=>getPerformanceProfile().photoWorkers,subscribe:subscribePerformanceProfile});
export const decodeArtworkBitmap=(source:ImageBitmapSource,signal?:AbortSignal)=>bitmapPool.request(source,signal) as Promise<ImageBitmap>;
export const artworkDecodeSnapshot=()=>bitmapPool.snapshot();
import.meta.hot?.dispose(()=>bitmapPool.dispose());
