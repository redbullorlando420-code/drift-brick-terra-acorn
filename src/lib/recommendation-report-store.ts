import type {Distribution} from './videos/recommendation-report.ts';
export type ReportShelf='mix'|'query';
export type ReportEntry=Readonly<{shelf:ReportShelf;distribution:Distribution;previous?:readonly string[]}>;
const listeners=new Set<()=>void>(),empty:readonly ReportEntry[]=Object.freeze([]);
let entries:readonly ReportEntry[]=empty;
export const getRecommendationReports=()=>entries;
export const emptyRecommendationReports=()=>empty;
export function subscribeRecommendationReports(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function publishRecommendationReport(shelf:ReportShelf,distribution:Distribution){
 const prior=entries.find(row=>row.shelf===shelf);if(prior?.distribution===distribution)return;
 const entry=Object.freeze({shelf,distribution,previous:prior?Object.freeze(prior.distribution.selections.map(row=>row.key)):undefined});
 entries=Object.freeze([entry,...entries.filter(row=>row.shelf!==shelf)].slice(0,2));for(const listener of listeners)listener();
}
export function clearRecommendationReports(){if(!entries.length)return;entries=empty;for(const listener of listeners)listener();}
