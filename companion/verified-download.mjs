import { existsSync, createReadStream } from 'node:fs';
import { open, rename, readFile, writeFile, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
/** Large public artifacts use bounded range requests, then a full-file digest. */
export async function verifiedDownload(url, target, size, expected, label) {
  if (existsSync(target)) return;
  const part = target + '.download', journal = part + '.ranges.json', step = 4 * 1024 * 1024;
  let completed = new Set();
  try { const saved = JSON.parse(await readFile(journal,'utf8')); if (saved.url === url && saved.size === size && saved.expected === expected && saved.step === step && existsSync(part)) completed = new Set(saved.completed.filter(i => Number.isInteger(i) && i >= 0 && i < Math.ceil(size/step))); } catch { /* Fresh download. */ }
  const file = await open(part, completed.size ? 'r+' : 'w');
  let cursor = 0, received = [...completed].reduce((n,i) => n + Math.min(step,size-i*step),0), reported = received, lastSaved = 0, writes = Promise.resolve();
  const save = () => { const text = JSON.stringify({url,size,expected,step,completed:[...completed]}); writes = writes.then(() => writeFile(journal,text)); };
  console.log(`${label}: downloading ${(size / 1e9).toFixed(2)} GB with SHA-256 verification.`);
  try {
    await file.truncate(size);
    const worker = async () => {
      while (cursor < size) {
        const start = cursor, index = start/step, end = Math.min(size - 1, start + step - 1); cursor = end + 1;
        if (completed.has(index)) continue;
        let bytes;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` }, signal: AbortSignal.timeout(60000) });
            if (response.status !== 206 || response.headers.get('content-range') !== `bytes ${start}-${end}/${size}`) { await response.body?.cancel(); throw Error(`Expected a bounded range response; got HTTP ${response.status}.`); }
            bytes = Buffer.from(await response.arrayBuffer()); if (bytes.length !== end - start + 1) throw Error('Incomplete artifact range.');
            break;
          } catch (error) { if (attempt === 2) throw error; }
        }
        let offset = 0; while (offset < bytes.length) { const result = await file.write(bytes, offset, bytes.length - offset, start + offset); if (!result.bytesWritten) throw Error('Artifact write stopped.'); offset += result.bytesWritten; }
        received += bytes.length;
        completed.add(index);
        if (Date.now()-lastSaved>1000) { save(); lastSaved=Date.now(); }
        if (reported === 0 || received - reported >= 128 * 1024 * 1024 || received === size) { console.log(`${label}: ${(received / 1e9).toFixed(2)} / ${(size / 1e9).toFixed(2)} GB`); reported = received; }
      }
    };
    const results = await Promise.allSettled(Array.from({length:16},()=>worker()));
    save(); await writes;
    const failed = results.find(row => row.status === 'rejected'); if (failed) throw failed.reason;
  } finally { await file.close(); }
  const hash = createHash('sha256'); for await (const bytes of createReadStream(part)) hash.update(bytes);
  if (hash.digest('hex') !== expected) { await unlink(journal).catch(()=>{}); throw Error(`${label} checksum mismatch. The unverified file was not enabled.`); }
  await rename(part, target); await unlink(journal).catch(()=>{}); console.log(`${label}: SHA-256 verified.`);
}
