import { COMPANION_ORIGIN } from './companion';
export async function localTool<T>(path: string, body?: object, signal?: AbortSignal, keepalive = false): Promise<T> {
  let response: Response;
  try {
    const timeout = AbortSignal.timeout(path.endsWith('/generate') ? 610000 : path.startsWith('/studio/models/') ? 20000 : 6000);
    response = await fetch(`${COMPANION_ORIGIN}${path}`, { method: body ? 'POST' : 'GET', headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: signal ? AbortSignal.any([signal, timeout]) : timeout, keepalive });
  } catch (cause) {
    if (signal?.aborted) throw new Error('Request cancelled. Use the engine interrupt control to stop any generation still running.');
    if (cause instanceof Error && cause.name === 'TimeoutError') throw new Error('The local tool took too long to respond. Check its status before retrying.');
    throw new Error('Realhub Companion is unavailable on this computer. Start Companion, then check again.');
  }
  const data = await response.json().catch(() => { throw new Error('Companion returned an unreadable response. Check that it is up to date.'); });
  if (!response.ok || !data.ok) throw new Error(data.error || 'Local tool request failed.');
  return data;
}
