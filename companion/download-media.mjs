import { createReadStream } from 'node:fs';

export function mediaRange(header, size) {
  if (!header) return { start: 0, end: size - 1, partial: false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || !match[1] && !match[2]) return null;
  let start, end;
  if (!match[1]) { const suffix = Number(match[2]); if (!Number.isSafeInteger(suffix) || suffix <= 0) return null; start = Math.max(0, size - suffix); end = size - 1; }
  else { start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1; }
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && start >= 0 && start <= end && start < size ? { start, end, partial: true } : null;
}

/** Only a manager-validated, completed job can reach this function. Existing
 * loopback/origin checks run before dispatch; no arbitrary path is accepted. */
export function serveDownloadMedia(req, res, media, {authority}={}) {
  if (!media) { res.writeHead(404); res.end('Completed download is unavailable.'); return; }
  const range = mediaRange(req.headers.range, media.size);
  res.setHeader('cache-control', 'private, no-store');
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('accept-ranges', 'bytes');
  if (!range) { res.writeHead(416, { 'content-range': 'bytes */' + media.size }); res.end(); return; }
  res.setHeader('content-type', media.mime);
  res.setHeader('content-length', range.end - range.start + 1);
  if (range.partial) res.setHeader('content-range', 'bytes ' + range.start + '-' + range.end + '/' + media.size);
  res.writeHead(range.partial ? 206 : 200);
  if (req.method === 'HEAD') { res.end(); return; }
  let access;try{access=authority?.lease(media.path);access?.assert();}catch{res.destroy();return;}
  const stream = createReadStream(media.path, { start: range.start, end: range.end });
  const abort=()=>{stream.destroy();res.destroy();};access?.signal.addEventListener('abort',abort,{once:true});
  const release=()=>{access?.signal.removeEventListener('abort',abort);access?.release();};
  stream.on('close',release);res.on('close', () => {stream.destroy();release();});
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}
