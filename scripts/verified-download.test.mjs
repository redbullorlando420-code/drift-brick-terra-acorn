import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifiedDownload } from '../companion/verified-download.mjs';
test('verified artifact transfer validates range, bytes and digest before enabling the file', async t => {
  const root = mkdtempSync(join(tmpdir(),'realhub-artifact-')), original = globalThis.fetch, bytes = Buffer.from('verified local fixture');
  t.after(()=>{globalThis.fetch=original;rmSync(root,{recursive:true,force:true})});
  globalThis.fetch = async (_, options) => { assert.equal(options.headers.Range,`bytes=0-${bytes.length-1}`); return new Response(bytes,{status:206,headers:{'content-range':`bytes 0-${bytes.length-1}/${bytes.length}`}}); };
  const target=join(root,'valid.bin'); await verifiedDownload('https://official.test/file',target,bytes.length,createHash('sha256').update(bytes).digest('hex'),'Test'); assert.deepEqual(readFileSync(target),bytes);
  const invalid=join(root,'invalid.bin'); await assert.rejects(verifiedDownload('https://official.test/file',invalid,bytes.length,'0'.repeat(64),'Test'),/checksum mismatch/);assert.equal(existsSync(invalid),false);
  globalThis.fetch=async()=>new Response(bytes,{status:200}); await assert.rejects(verifiedDownload('https://official.test/file',join(root,'unbounded.bin'),bytes.length,'0'.repeat(64),'Test'),/bounded range/);
});
