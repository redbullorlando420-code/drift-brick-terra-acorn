// Bounded public-metadata diagnosis. No cookies, proxy, identity rotation, or retries.
const channelId = process.argv[2] ?? 'UCpVm7bg6pXKo1Pr6k5kxG9A';
const requests = [
  { name: 'uploads browse', url: 'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false&alt=json', init: { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: '2.20260623.01.00', hl: 'en', gl: 'US' } }, browseId: `VLUU${channelId.slice(2)}` }) } },
  { name: 'public feed', url: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}` },
];
for (const request of requests) {
  try {
    const response = await fetch(request.url, { ...request.init, signal: AbortSignal.timeout(15000) });
    const body = await response.text();
    const ids = [...new Set([...body.matchAll(/"videoId":"([\w-]{11})"/g)].map(match => match[1]))];
    console.log(JSON.stringify({ name: request.name, status: response.status, bytes: body.length, videos: ids.length, firstIds: ids.slice(0, 3), prefix: response.ok ? undefined : body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 250) }));
  } catch (error) { console.log(JSON.stringify({ name: request.name, error: error.message })); }
  await new Promise(resolve => setTimeout(resolve, 1500));
}
