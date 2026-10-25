import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
type TunnelStatus = { running?: boolean; starting?: boolean; url?: string | null; error?: string | null };
const secureOrigin = (value: unknown) => { try { if (typeof value !== 'string') return; const url = new URL(value); if (url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash) return url.origin; } catch { /* No usable public origin. */ } };
export function RoomHttpsInvitation({ onOrigin }: { onOrigin: (origin: string) => void }) {
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [running, setRunning] = useState(false);
  const request = useRef<AbortController | undefined>(undefined);
  useEffect(() => { const hide = () => { if (document.hidden && request.current) { request.current.abort(); setBusy(false); setNotice('HTTPS address check paused. Use the buttons below to check again.'); } }; document.addEventListener('visibilitychange', hide); return () => { document.removeEventListener('visibilitychange', hide); request.current?.abort(); }; }, []);
  const change = async (action: 'check' | 'start' | 'stop') => {
    if (busy) return;
    request.current?.abort(); const controller = new AbortController(); request.current = controller; setBusy(true); setNotice(action === 'start' ? 'Starting temporary HTTPS sharing…' : action === 'stop' ? 'Stopping temporary sharing…' : 'Checking the host’s HTTPS address…');
    const read = async (mutation?: 'start' | 'stop') => {
      const response = await fetch('/api/quick-tunnel', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]), ...(mutation ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: mutation }) } : {}) });
      const data = await response.json() as TunnelStatus;
      if (!response.ok) throw Error(data.error || 'Only the host computer can manage HTTPS sharing.');
      return data;
    };
    try {
      let data = await read(action === 'check' ? undefined : action);
      if (action === 'start') for (let attempt = 0; data.starting && !secureOrigin(data.url) && attempt < 12; attempt++) {
        await new Promise<void>((resolve, reject) => { const abort = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); }; const timer = setTimeout(() => { controller.signal.removeEventListener('abort', abort); resolve(); }, 1500); controller.signal.addEventListener('abort', abort, { once: true }); if (controller.signal.aborted) abort(); });
        data = await read();
      }
      if (controller.signal.aborted) return;
      setRunning(Boolean(data.running || data.starting));
      if (action === 'stop') onOrigin('');
      const origin = secureOrigin(data.url);
      if (data.running && origin) { onOrigin(origin); setNotice('The invitation now uses HTTPS. Share the updated link or QR code; the current host room stays open.'); }
      else setNotice(action === 'stop' ? 'Temporary sharing stopped. Any saved HTTPS link from this tunnel no longer works.' : data.error || (data.starting ? 'Still starting. Check again shortly; no more automatic checks will run.' : 'No running HTTPS address. Use an existing HTTPS deployment, or start temporary sharing below.'));
    } catch (error) { if (!controller.signal.aborted) setNotice(error instanceof Error ? error.message : 'Could not obtain an HTTPS address.'); }
    finally { if (request.current === controller) request.current = undefined; if (!controller.signal.aborted) setBusy(false); }
  };
  return <section aria-label="HTTPS room sharing" className="mt-3 space-y-3 rounded-md border border-border p-3"><p className="text-sm font-medium text-fg">HTTPS invitation for Twitch</p><p className="text-xs leading-5 text-muted">Twitch embeds need HTTPS on a guest phone. Use your existing HTTPS app address under Phone address, or use the host’s temporary sharing link.</p><Button variant="secondary" className="min-h-11" disabled={busy} onClick={() => void change('check')}>Use running HTTPS address</Button><details><summary className="min-h-11 cursor-pointer text-xs font-medium">Start temporary HTTPS sharing</summary><p className="my-2 text-xs leading-5 text-muted">This starts the existing Cloudflare trial tunnel and makes this app reachable at a temporary public address. Share it only with invited guests. Starting a link does not move or reload the host. Stop sharing when finished; closing this panel does not stop the tunnel. Cloudflared must be installed on the host.</p><div className="flex flex-wrap gap-2"><Button className="min-h-11" disabled={busy} onClick={() => void change('start')}>Start temporary HTTPS link</Button><Button variant="secondary" className="min-h-11" disabled={busy || !running} onClick={() => void change('stop')}>Stop temporary HTTPS link</Button></div></details>{notice && <p role="status" className="text-xs leading-5 text-muted">{notice}</p>}</section>;
}
