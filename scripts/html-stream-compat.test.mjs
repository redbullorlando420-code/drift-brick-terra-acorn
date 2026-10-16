import test from 'node:test';
import assert from 'node:assert/strict';
import { safeHydrationResponse } from '../src/lib/html-stream-compat.ts';

test('HTML compatibility escapes raw nulls without changing the serialized router strings', async()=>{
  const html='<script>globalThis.routerIds=["__root__\0","\0\0","温泉/☃"]</script><script type="module" src="/boot.js"></script>';
  const bytes=new TextEncoder().encode(html);
  const response=new Response(new ReadableStream({start(controller){for(let i=0;i<bytes.length;i+=3)controller.enqueue(bytes.slice(i,i+3));controller.close();}}),{status:202,headers:{'content-type':'text/html; charset=utf-8','content-length':String(bytes.length),etag:'old','x-app':'keep'}});
  const fixed=safeHydrationResponse(response),text=await fixed.text();
  assert.equal(text.includes('\0'),false);assert.ok(text.endsWith('<script type="module" src="/boot.js"></script>'));
  assert.equal(fixed.status,202);assert.equal(fixed.headers.get('x-app'),'keep');assert.equal(fixed.headers.has('content-length'),false);assert.equal(fixed.headers.has('etag'),false);
  const original=Function(`${html.match(/<script>(.*?)<\/script>/s)[1]};return routerIds`)();
  const recovered=Function(`${text.match(/<script>(.*?)<\/script>/s)[1]};return routerIds`)();
  assert.deepEqual(recovered,original);delete globalThis.routerIds;
});

test('HTML streaming forwards ordinary chunks immediately without buffering or text decoding',async()=>{
  let next;const chunk=new TextEncoder().encode('<head>First paint</head>');
  const stream=new ReadableStream({start(controller){controller.enqueue(chunk);next=controller;}});
  const fixed=safeHydrationResponse(new Response(stream,{headers:{'content-type':'text/html'}}));
  const reader=fixed.body.getReader();assert.equal((await reader.read()).value,chunk);
  next.enqueue(new Uint8Array([0,0]));next.close();
  assert.equal(new TextDecoder().decode((await reader.read()).value),'\\u0000\\u0000');assert.equal((await reader.read()).done,true);
});

test('non-HTML, compressed, and bodyless responses retain their exact bytes and identity',async()=>{
  for(const headers of [{'content-type':'application/octet-stream'},{'content-type':'application/json'},{'content-type':'text/html','content-encoding':'gzip'}]){
    const response=new Response(new Uint8Array([0,255,0]),{headers});assert.equal(safeHydrationResponse(response),response);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[0,255,0]);
  }
  const response=new Response(null,{status:204});assert.equal(safeHydrationResponse(response),response);
});
