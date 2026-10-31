import { companionFetch } from './companion';
export async function localTool<T>(path: string, body?: object, signal?: AbortSignal, keepalive = false): Promise<T> {
  let response: Response;
  try {
    const timeout = AbortSignal.timeout(path.endsWith('/generate') ? 610000 : path.includes('/models/transfers/') ? 180000 : path.startsWith('/studio/models/') ? 20000 : 6000);
    response = await companionFetch(path, { method: body ? 'POST' : 'GET', headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: signal ? AbortSignal.any([signal, timeout]) : timeout, keepalive });
  } catch (cause) {
    if (signal?.aborted) throw Object.assign(new Error('Request cancelled. Use the engine interrupt control to stop any generation still running.'),{outcome:'unknown'});
    if (cause instanceof Error && cause.name === 'TimeoutError') throw Object.assign(new Error('The local tool took too long to respond. Check its status before retrying.'),{outcome:'unknown'});
    throw Object.assign(new Error('Realhub Companion is unavailable on this computer. Start Companion, then check again.'),{outcome:'unknown'});
  }
  const data = await response.json().catch(() => { throw Object.assign(new Error('Companion returned an unreadable response. Check that it is up to date.'),{outcome:'unknown'}); });
  if (!response.ok || !data.ok) throw new Error(data.error || 'Local tool request failed.');
  return data;
}
