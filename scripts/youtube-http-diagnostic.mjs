const id = 'UC0S2UwViHJtQs4_35XFQFTw';
for (const path of [`/channel/${id}/videos`, `/feeds/videos.xml?channel_id=${id}`]) {
 const response = await fetch(`https://www.youtube.com${path}`, { signal: AbortSignal.timeout(12000), headers: { 'user-agent':'Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai) AppleWebKit/537.36', accept:'text/html,application/xhtml+xml,application/xml,application/json' } });
 const body = await response.text();
 console.log(JSON.stringify({path,status:response.status,retryAfter:response.headers.get('retry-after'),server:response.headers.get('server'),contentType:response.headers.get('content-type'),bytes:body.length,title:body.match(/<title>([^<]*)/i)?.[1],initialData:body.includes('ytInitialData'),prefix:response.ok?undefined:body.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,380)}));
 await new Promise(resolve=>setTimeout(resolve,1500));
}
