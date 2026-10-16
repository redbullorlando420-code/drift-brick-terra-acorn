const escapedNull = new Uint8Array([92, 117, 48, 48, 48, 48]); // JavaScript \u0000

/** SSR serializes router match IDs into JS strings containing literal NULs.
 * Some HTTP inspection layers truncate HTML there, dropping the boot script.
 * Escape that byte without buffering the document or decoding split UTF-8.
 * Ordinary chunks pass through unchanged; non-HTML and compressed data bypass. */
export function safeHydrationResponse(response: Response): Response {
  if (!response.body || !/^text\/html(?:\s*;|$)/i.test(response.headers.get('content-type') ?? '')
    || response.headers.has('content-encoding')) return response;
  const headers = new Headers(response.headers);
  headers.delete('content-length'); headers.delete('etag');
  return new Response(response.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const first = chunk.indexOf(0);
      if (first < 0) { controller.enqueue(chunk); return; }
      let count = 0;
      for (let i = first; i < chunk.length; i++) if (chunk[i] === 0) count++;
      const output = new Uint8Array(chunk.length + count * 5);
      output.set(chunk.subarray(0, first));
      let at = first;
      for (let i = first; i < chunk.length; i++) {
        if (chunk[i] === 0) { output.set(escapedNull, at); at += escapedNull.length; }
        else output[at++] = chunk[i]!;
      }
      controller.enqueue(output);
    },
  })), { status: response.status, statusText: response.statusText, headers });
}
