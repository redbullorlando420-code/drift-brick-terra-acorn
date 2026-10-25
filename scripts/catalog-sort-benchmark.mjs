import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sortCatalogRows } from '../src/lib/catalog-work.ts';
import { checkedOutputPath } from './browser-guard.mjs';

// Retain the pre-optimization implementation for repeatable same-process A/B.
async function original(rows, compare, turn, maxRows = 2048) {
  let source=rows,target=new Array(rows.length),visited=0,started=performance.now();
  for(let width=1;width<rows.length;width*=2){
    for(let left=0;left<rows.length;left+=width*2){
      const middle=Math.min(left+width,rows.length),right=Math.min(left+width*2,rows.length);let a=left,b=middle;
      for(let out=left;out<right;out++){
        target[out]=a<middle&&(b>=right||compare(source[a],source[b])<=0)?source[a++]:source[b++];
        if(++visited>=maxRows||(visited%64===0&&performance.now()-started>=4)){await turn();visited=0;started=performance.now()}
      }
    }
    [source,target]=[target,source];
  }
  return source;
}

async function measure(fixture, algorithm) {
  const input=fixture.slice();let comparisons=0,yields=0,worstWorkMs=0,sliceStarted=performance.now();
  const turn=async()=>{worstWorkMs=Math.max(worstWorkMs,performance.now()-sliceStarted);yields++;await new Promise(resolve=>setImmediate(resolve));sliceStarted=performance.now()};
  const started=performance.now();
  const pending=algorithm(input,(a,b)=>{comparisons++;return a.key-b.key},turn);
  const initiatingMs=performance.now()-started,result=await pending;
  worstWorkMs=Math.max(worstWorkMs,performance.now()-sliceStarted);
  const elapsedMs=performance.now()-started;
  for(let i=1;i<result.length;i++)assert.ok(result[i-1].key<result[i].key||result[i-1].key===result[i].key&&result[i-1].index<result[i].index,'stable order');
  return {result,metrics:{elapsedMs:+elapsedMs.toFixed(2),initiatingMs:+initiatingMs.toFixed(3),comparisons,yields,worstWorkMs:+worstWorkMs.toFixed(2)}};
}
const output=checkedOutputPath(process.argv[2]??'screenshots/catalog-sort-speed.json',[resolve('screenshots')]),results=[];
for(const size of [100_000,1_000_000]){
  for(const shape of ['ordered','nearly-ordered','reverse','mixed','ties']){
    const fixture=Array.from({length:size},(_,i)=>({index:i,key:shape==='ordered'?i:shape==='nearly-ordered'?(i%4096===4095&&i+1<size?i+1:i%4096===0&&i>0?i-1:i):shape==='reverse'?size-i:shape==='ties'?i%23:Math.imul(i+1,2654435761)>>>0}));
    const before=[],after=[];
    for(let round=0;round<3;round++){
      const algorithms=round%2?[sortCatalogRows,original]:[original,sortCatalogRows];
      const first=await measure(fixture,algorithms[0]),second=await measure(fixture,algorithms[1]);
      assert.deepEqual(first.result.map(row=>row.index),second.result.map(row=>row.index));
      (round%2?after:before).push(first.metrics);(round%2?before:after).push(second.metrics);
    }
    const median=rows=>{const metrics={};for(const key of Object.keys(rows[0]))metrics[key]=rows.map(row=>row[key]).sort((a,b)=>a-b)[1];return metrics};
    results.push({size,shape,before:median(before),after:median(after)});
  }
}
const report={results,note:'Synthetic Node A/B with the previous production helper, identical reference arrays and cooperative setImmediate yields. Each metric is the median of three runs with alternating algorithm order. Stable full outputs are compared. Elapsed times include scheduling and runtime GC; these are not browser paint timings.'};
writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
