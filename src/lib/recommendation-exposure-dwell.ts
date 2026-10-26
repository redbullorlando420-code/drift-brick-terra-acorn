import { EXPOSURE_DWELL_MS } from './videos/recommendation-exposure.ts';
export type ExposureSurface='browse'|'preview';
type DwellRow={key:string;surface:ExposureSurface;visible:boolean;cancel?:()=>void;done:boolean};
/** Event-driven dwell timers. Backgrounding or a context switch discards partial dwell. */
export function createExposureDwell(options:{schedule:(work:()=>void,ms:number)=>()=>void;record:(key:string)=>void;eligible:(element:Element)=>boolean}) {
 const rows=new Map<Element,DwellRow>();let active=false,context:ExposureSurface|null='browse';
 const start=(element:Element,row:DwellRow)=>{
  if(row.cancel||row.done||!active||row.surface!==context||!row.visible)return;
  row.cancel=options.schedule(()=>{row.cancel=undefined;if(rows.get(element)!==row||!active||row.surface!==context||!row.visible||!options.eligible(element))return;row.done=true;options.record(row.key);},EXPOSURE_DWELL_MS);
 };
 return {
  observe(element:Element,key:string,surface:ExposureSurface){
   if(rows.size>=1024&&!rows.has(element))return {visible:(_value:boolean)=>{},stop:()=>{}};
   const old=rows.get(element);old?.cancel?.();const row={key,surface,visible:false,done:false,cancel:undefined as (()=>void)|undefined};rows.set(element,row);
   return {visible(value:boolean){if(rows.get(element)!==row||row.visible===value)return;row.visible=value;if(!value){row.cancel?.();row.cancel=undefined;}else start(element,row);},stop(){if(rows.get(element)!==row)return;row.cancel?.();rows.delete(element);}};
  },
  state(nextActive:boolean,nextContext:ExposureSurface|null){if(active===nextActive&&context===nextContext)return;active=nextActive;context=nextContext;for(const [element,row]of rows){row.cancel?.();row.cancel=undefined;start(element,row);}},
  dispose(){for(const row of rows.values())row.cancel?.();rows.clear();},
  snapshot(){return {observed:rows.size,timers:[...rows.values()].filter(row=>row.cancel).length};}
 };
}
