import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier,context,next) {
 try { return next(specifier,context); } catch(error) {
  if(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier)) return next(specifier+'.ts',context);
  throw error;
 }
}});
const {acquireImageSlot,getImageLoadBudgetSnapshot}=await import('../src/lib/videos/image-load-budget.ts');
const {useThumbs}=await import('../src/lib/videos/thumbs.ts');
test('cancelled offscreen thumbnail requests leave no queued work or leaked slots',async()=>{
 const releases=await Promise.all(Array.from({length:getImageLoadBudgetSnapshot().max},()=>acquireImageSlot({priority:'high'})));
 const controllers=Array.from({length:100},()=>new AbortController());
 const requests=controllers.map(c=>acquireImageSlot({priority:'high',signal:c.signal}));
 assert.equal(getImageLoadBudgetSnapshot().queued,100);
 controllers.forEach(c=>c.abort());
 (await Promise.all(requests)).forEach(release=>release());
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
 (await cancelled)(); (await next)(); releases.forEach(release=>release());
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
  worker.onmessage({data:{type:'ready',generation:oldGeneration}});
  assert.equal(index.getStatus(),'building');
  worker.onmessage({data:{type:'ready',generation:currentGeneration}});
  const request=worker.messages.at(-1);
  assert.equal(request.type,'search');
  worker.onmessage({data:{type:'result',generation:currentGeneration,requestId:request.requestId,ids:['0']}});
  assert.deepEqual(await result,['0']);
  const failed=index.search('failure'); worker.onerror(new Error('worker stopped'));
  assert.equal(await failed,null);
  assert.equal(index.getStatus(),'failed');
 } finally {globalThis.Worker=original;}
});
