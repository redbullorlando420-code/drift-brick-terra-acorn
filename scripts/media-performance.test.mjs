import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier,context,next) {
 if (specifier.startsWith("@/")) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href,context);
 try { return next(specifier,context); } catch(error) {
  if(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)) return next(specifier+'.ts',context);
  throw error;
 }
}});
const {acquireImageSlot,getImageLoadBudgetSnapshot,setArtworkSuppressed}=await import('../src/lib/videos/image-load-budget.ts');
const {useThumbs,getThumbDiagnostics}=await import('../src/lib/videos/thumbs.ts');
const binaryArtworkModule=await import('../src/lib/videos/binary-artwork.ts');

test('worker-free search yields, preserves metadata and exact tags, and cancels without an index',async()=>{
 const {searchCatalog}=await import('../src/lib/videos/search-index.ts');
 const videos=Array.from({length:2000},(_,i)=>({id:String(i),name:'Space telescope lecture',path:'archive/a',remote:{kind:'youtube',channelName:'Ada'},description:i===0?'nebula':'ocean'}));
 const tags={'0':['fetish-star','favorite']},categories={'0':'Learning'};
 assert.deepEqual([...await searchCatalog(videos,tags,categories,'nebula ada')],['0']);
 assert.deepEqual([...await searchCatalog(videos,tags,categories,'fetish-star')],['0']);
 assert.deepEqual([...await searchCatalog(videos,tags,categories,'science favorite')],['0']);
 const controller=new AbortController();
 const pending=searchCatalog(videos,tags,categories,'ocean',controller.signal);
 controller.abort(); await assert.rejects(pending);
});
test('cancelled offscreen thumbnail requests leave no queued work or leaked slots',async()=>{
 const releases=await Promise.all(Array.from({length:getImageLoadBudgetSnapshot().max},()=>acquireImageSlot({priority:'high'})));
 const controllers=Array.from({length:100},()=>new AbortController());
 const requests=controllers.map(c=>acquireImageSlot({priority:'high',signal:c.signal}));
 assert.equal(getImageLoadBudgetSnapshot().queued,100);
 controllers.forEach(c=>c.abort());
 (await Promise.all(requests)).forEach(release=>release?.());
 assert.equal(getImageLoadBudgetSnapshot().queued,0);
 assert.equal(getImageLoadBudgetSnapshot().active,releases.length);
 releases.forEach(release=>{release();release();});
 assert.equal(getImageLoadBudgetSnapshot().active,0);
});
test('aborting an awakened waiter still lets the next visible image load',async()=>{
 const releases=await Promise.all(Array.from({length:getImageLoadBudgetSnapshot().max},()=>acquireImageSlot({priority:'high'})));
 const controller=new AbortController();
 const cancelled=acquireImageSlot({priority:'high',signal:controller.signal});
 const next=acquireImageSlot({priority:'high'});
 releases.pop()(); controller.abort();
 (await cancelled)?.(); (await next)?.(); releases.forEach(release=>release());
 assert.equal(getImageLoadBudgetSnapshot().queued,0);
 assert.equal(getImageLoadBudgetSnapshot().active,0);
});
test('remote artwork does not grow the local frame-thumbnail cache',()=>{
 useThumbs.setState({byId:{kept:'data:image/jpeg,local'},failed:{},durations:{},diagnostics:{}});
 for(let i=0;i<1000;i++) useThumbs.getState().request({
  id:`remote-${i}`,folderId:'yt:test',name:'Remote',path:'remote',extension:'yt',mime:'video/youtube',size:0,addedAt:0,
  poster:`https://i.ytimg.com/vi/${i}/hqdefault.jpg`,remote:{kind:'youtube',videoId:String(i)},
 });
 assert.deepEqual(useThumbs.getState().byId,{kept:'data:image/jpeg,local'});
});

test('real frame captures release media on viewer pause, resume subscribed cards, and cancel unmounted work',async()=>{
 const saved=Object.fromEntries(['window','document'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const decoders=[],canvases=[];
 const page=Object.assign(new EventTarget(),{hidden:false,visibilityState:'visible',createElement(kind){
  if(kind==='video'){
   const video={duration:40,videoWidth:1280,videoHeight:720,currentTime:0,paused:0,loads:0,
    pause(){this.paused++;},load(){this.loads++;},removeAttribute(key){delete this[key];}};
   decoders.push(video);return video;
  }
  const canvas={width:0,height:0,getContext:()=>({drawImage(){}}),toBlob:callback=>callback(new Blob(['captured'],{type:'image/jpeg'}))};
  canvases.push(canvas);return canvas;
 }});
 const surface=Object.assign(new EventTarget(),{setTimeout,clearTimeout,setInterval,clearInterval});
 const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
 Object.defineProperty(globalThis,'document',{configurable:true,value:page});
 Object.defineProperty(globalThis,'window',{configurable:true,value:surface});
 const {trackSessionActivity}=await import('../src/lib/session-activity.ts');
 const stop=trackSessionActivity(()=>{});
 const local={id:'local-capture',folderId:'local',name:'Local',src:'/approved-test-video.mp4',path:'local',extension:'mp4',mime:'video/mp4',size:1,addedAt:0};
 try{
  useThumbs.setState({byId:{},failed:{},durations:{},diagnostics:{}});
  const unmount=useThumbs.getState().request(local,{priority:'high'});
  const duplicate=useThumbs.getState().request(local,{priority:'high'});
  await flush();assert.equal(decoders.length,1);
  unmount();assert.equal(getThumbDiagnostics().inflight,1,'another visible copy owns the capture');
  setArtworkSuppressed(true);await flush();
  assert.equal(decoders[0].src,undefined);assert.ok(decoders[0].paused&&decoders[0].loads);
  assert.equal(getThumbDiagnostics().active,0);assert.equal(getThumbDiagnostics().queued,1);
  assert.deepEqual(useThumbs.getState().failed,{});assert.deepEqual(useThumbs.getState().diagnostics,{});
  setArtworkSuppressed(false);await flush();assert.equal(decoders.length,2);
  decoders[1].onloadedmetadata();decoders[1].onseeked();await flush();
  const captured=useThumbs.getState().byId[local.id];
  assert.ok(captured.startsWith('blob:'));
  assert.equal(await (await fetch(captured)).text(),'captured');
  assert.equal(getThumbDiagnostics().bytes,8,'blob backing bytes count toward the memory budget');
  assert.equal(useThumbs.getState().durations[local.id],40);
  assert.ok(canvases.every(canvas=>canvas.width===0&&canvas.height===0));
  assert.equal(getThumbDiagnostics().inflight,0);duplicate();
  const cancel=useThumbs.getState().request({...local,id:'unmounted'});await flush();cancel();await flush();
  assert.equal(getThumbDiagnostics().active,0);assert.equal(getThumbDiagnostics().queued,0);
  assert.equal(decoders.at(-1).src,undefined);assert.deepEqual(useThumbs.getState().failed,{});
 }finally{
  setArtworkSuppressed(false);useThumbs.getState().trimMemory();await flush();stop();
  const {releaseArtwork}=await import('../src/lib/videos/binary-artwork.ts');
  Object.values(useThumbs.getState().byId).forEach(releaseArtwork);
  useThumbs.setState({byId:{}});
  for(const [key,descriptor]of Object.entries(saved))if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);
 }
});

test('binary thumbnails obey backing-byte limits and revoke evicted URLs',()=>{
 const {artworkUrl,binaryArtworkSnapshot}=binaryArtworkModule;
 const page=Object.getOwnPropertyDescriptor(globalThis,'document');
 Object.defineProperty(globalThis,'document',{configurable:true,value:{hidden:false}});
 try{
  const byId={};
  for(let i=0;i<10;i++)byId[String(i)]=artworkUrl(new Blob([new Uint8Array(256*1024)],{type:'image/jpeg'}));
  useThumbs.setState({byId}); useThumbs.getState().trimMemory();
  assert.equal(getThumbDiagnostics().bytes,1024*1024);
  assert.equal(Object.keys(useThumbs.getState().byId).length,4);
  assert.equal(binaryArtworkSnapshot().urls,4);
  Object.values(useThumbs.getState().byId).forEach(binaryArtworkModule.releaseArtwork);
  useThumbs.setState({byId:{}}); assert.equal(binaryArtworkSnapshot().urls,0);
 }finally{if(page)Object.defineProperty(globalThis,'document',page);else Reflect.deleteProperty(globalThis,'document');}
});

test('an evicted binary disk thumbnail reopens without file access or video decoding',async()=>{
 const saved=Object.fromEntries(['window','document','indexedDB'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const blob=new Blob(['stored JPEG'],{type:'image/jpeg'}),reads=[];
 const page=Object.assign(new EventTarget(),{hidden:false,visibilityState:'visible',createElement(){throw new Error('disk hits must not create a decoder');}});
 const surface=Object.assign(new EventTarget(),{setTimeout,clearTimeout,setInterval,clearInterval});
 const db={close(){},transaction(){return{objectStore(){return{get(id){
  reads.push(id);const request={};setImmediate(()=>{request.result={id,thumb:blob,at:1};request.onsuccess();});return request;
 }}}};}};
 Object.defineProperty(globalThis,'document',{configurable:true,value:page});
 Object.defineProperty(globalThis,'window',{configurable:true,value:surface});
 Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:{open(){const request={};setImmediate(()=>{request.result=db;request.onsuccess();});return request;}}});
 const {trackSessionActivity}=await import('../src/lib/session-activity.ts');const stop=trackSessionActivity(()=>{});
 try{
  useThumbs.setState({byId:{},failed:{},durations:{},diagnostics:{}});
  const cancel=useThumbs.getState().request({id:'disk-hit',folderId:'local',name:'Local',path:'missing-file',extension:'mp4',mime:'video/mp4',size:1,addedAt:0});
  await new Promise(resolve=>setTimeout(resolve,20));
  assert.deepEqual(reads,['disk-hit']);
  const url=useThumbs.getState().byId['disk-hit'];assert.ok(url?.startsWith('blob:'));
  assert.equal(await(await fetch(url)).text(),'stored JPEG');assert.deepEqual(useThumbs.getState().failed,{});
  assert.equal(getThumbDiagnostics().active,0);cancel();
 }finally{
  stop();Object.values(useThumbs.getState().byId).forEach(binaryArtworkModule.releaseArtwork);
  useThumbs.setState({byId:{}});
  for(const [key,descriptor]of Object.entries(saved))if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);
 }
});
test('worker batches preserve search metadata and replace stale generations',async()=>{
 const oldSelf=globalThis.self; const replies=[];
 globalThis.self={postMessage:data=>replies.push(data)};
 try {
  await import('../src/lib/videos/search.worker.ts');
  const send=data=>globalThis.self.onmessage({data});
  const video={id:'a',name:'Space telescope lecture',path:'archive/a',remote:{kind:'youtube',channelName:'Ada'},description:'nebula'};
  send({type:'batch',generation:1,reset:true,done:false,batch:[{video,tags:['favorite'],category:'Learning'}]});
  assert.equal(replies.at(-1).type,'next');
  send({type:'batch',generation:1,reset:false,done:true,batch:[{video:{...video,id:'b',name:'Ocean'},tags:[]}]});
  send({type:'search',generation:1,requestId:1,query:'science favorite'});
  assert.deepEqual(replies.at(-1).ids,['a']);
  send({type:'search',generation:1,requestId:2,query:'nebula ada'});
  assert.deepEqual(replies.at(-1).ids,['a','b']);
  send({type:'batch',generation:2,reset:true,done:true,batch:[{video:{...video,id:'c'},tags:['newtag']}]});
  const count=replies.length;
  send({type:'batch',generation:1,reset:false,done:true,batch:[{video,tags:[]}]});
  send({type:'search',generation:1,requestId:3,query:'favorite'});
  assert.equal(replies.length,count);
  send({type:'search',generation:2,requestId:4,query:'favorite'});
  assert.deepEqual(replies.at(-1).ids,[]);
  send({type:'search',generation:2,requestId:5,query:'newtag'});
  assert.deepEqual(replies.at(-1).ids,['c']);
 } finally { globalThis.self=oldSelf; }
});

test('search client applies backpressure, rejects stale replies, and settles worker failures',async()=>{
 const original=globalThis.Worker; let worker;
 globalThis.Worker=class {
  messages=[];
  constructor(){worker=this;}
  postMessage(message){this.messages.push(message);}
  terminate(){}
 };
 try {
  const {searchWorkerIndex:index}=await import('../src/lib/videos/search-worker-index.ts');
  const videos=Array.from({length:400},(_,i)=>({id:String(i),name:'sample',path:'sample'}));
  index.sync(videos,{},{});
  await new Promise(r=>setTimeout(r,10));
  assert.equal(worker.messages.length,1);
  assert.equal(worker.messages[0].batch.length,128);
  const oldGeneration=worker.messages[0].generation;
  const result=index.search('current');
  index.sync(videos.slice(0,1),{},{});
  await new Promise(r=>setTimeout(r,10));
  const currentGeneration=worker.messages.at(-1).generation;
  const obsolete=Array.from({length:100},()=>new AbortController());
  const abandoned=obsolete.map(controller=>index.search('abandoned',controller.signal));
  obsolete.forEach(controller=>controller.abort());
  assert.ok((await Promise.all(abandoned)).every(result=>result===null));
  worker.onmessage({data:{type:'ready',generation:oldGeneration}});
  assert.equal(index.getStatus(),'building');
  worker.onmessage({data:{type:'ready',generation:currentGeneration}});
  assert.equal(worker.messages.filter(message=>message.type==='search'&&message.query==='abandoned').length,0,'cancelled typing must not flood the worker when indexing finishes');
  const request=worker.messages.at(-1);
  assert.equal(request.type,'search');
  worker.onmessage({data:{type:'result',generation:currentGeneration,requestId:request.requestId,ids:['0']}});
  assert.deepEqual(await result,['0']);
  const activeCancel=new AbortController();const stale=index.search('stale',activeCancel.signal);
  const staleRequest=worker.messages.at(-1);activeCancel.abort();assert.equal(await stale,null);
  worker.onmessage({data:{type:'result',generation:currentGeneration,requestId:staleRequest.requestId,ids:['wrong']}});
  const failed=index.search('failure'); worker.onerror(new Error('worker stopped'));
  assert.equal(await failed,null);
  assert.equal(index.getStatus(),'failed');
 } finally {globalThis.Worker=original;}
});
