import { useEffect, useRef, useState } from 'react';
import { MonitorPlay, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { localTool } from '@/lib/local-tools';
import { HubShell } from './hub-shared';
import { useCurrentUserState } from '@/lib/auth/use-current-user';
type Status = { installed: boolean; launcherRunning: boolean; audit: { event: string; at: number }[] };
export function RemoteDesktopSection() {
  const { user, isPending } = useCurrentUserState();
  if (!user) return <p className="p-6 text-muted">{isPending ? 'Loading your workspace…' : 'Sign in through this app to use remote launch controls.'}</p>;
  return <RemoteWorkspace key={user.id} />;
}
function RemoteWorkspace() {
  const [peer, setPeer] = useState(''), [confirmation, setConfirmation] = useState(''), [approval, setApproval] = useState<{ token: string; expires: number } | null>(null), [status, setStatus] = useState<Status | null>(null), [note, setNote] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [owned, setOwned] = useState(false), [seconds, setSeconds] = useState(0);
  const used = useRef(false);
  const mounted = useRef(true), operation = useRef(false);
  const currentApproval = useRef(approval);
  currentApproval.current = approval;
  useEffect(() => {
    const hide = () => {
      if (document.visibilityState !== 'hidden' || !currentApproval.current) return;
      const token = currentApproval.current.token;
      currentApproval.current = null; setApproval(null); setConfirmation('');
      setNote('Unconfirmed approval cancelled when this tab was hidden. Prepare a new request to continue.');
      void localTool('/remote/revoke', { token }, undefined, true).catch(() => {});
    };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);
  useEffect(() => {
    if (!approval) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((approval.expires - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining) { setApproval(null); setConfirmation(''); setNote('Connection approval expired. Prepare a new request.'); }
    };
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [approval]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (used.current) void localTool('/remote/lock', {}).catch(() => {}); }; }, []);
  const check = async () => { const next = await localTool<Status>('/remote/status'); if (mounted.current) setStatus(next); };
  const revokeApproval = () => {
    setApproval(null); setConfirmation('');
    if (approval) void localTool('/remote/revoke', { token: approval.token }).catch(() => {});
  };
  const act = async (path: 'check' | 'arm' | 'connect' | 'lock') => {
    if (operation.current) return;
    operation.current = true;
    if (path !== 'check') used.current = true;
    setBusy(true); setNote(''); setError('');
    try {
      if (path === 'arm') { const next = await localTool<{ token: string; expires: number }>('/remote/arm', { peer }); if (mounted.current && document.visibilityState !== 'hidden') { setApproval(next); setConfirmation(''); } else { await localTool('/remote/revoke', { token: next.token }); if (mounted.current) setNote('Unconfirmed approval cancelled while this tab was hidden. Prepare a new request.'); } }
      else if (path === 'connect') {
        const token = approval?.token; setApproval(null); setConfirmation('');
        const result = await localTool<{ note: string }>('/remote/connect', { peer, token, confirmation });
        if (mounted.current) { setOwned(false); setNote(result.note); }
      }
      else if (path === 'lock') { setApproval(null); setConfirmation(''); setOwned(false); const result = await localTool<{ note: string }>('/remote/lock', {}); if (mounted.current) setNote(result.note); }
      await check();
    } catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : 'Start Companion on this computer and retry.'); }
    finally { operation.current = false; if (mounted.current) setBusy(false); }
  };
  return <HubShell eyebrow="Personal access" icon={<MonitorPlay className="size-4" />} title="Remote desktop" copy="A guarded handoff to RustDesk on this computer. Desktop viewing and control run in RustDesk’s native window, outside this website.">
    <div className="mt-6 grid items-start gap-5 lg:grid-cols-2"><Card><CardHeader><div><Badge variant={approval ? 'solid' : 'default'}>{approval ? 'Awaiting your confirmation' : status?.launcherRunning ? 'Native launcher active' : 'Launch controls locked'}</Badge></div><CardTitle>Connect to your computer</CardTitle><CardDescription>{status?.installed ? 'RustDesk portable client detected' : status ? 'RustDesk client not installed' : 'Check the local client before connecting'}</CardDescription></CardHeader><CardContent>
      <ol className="list-decimal space-y-1 pl-5 text-xs leading-6 text-muted"><li>Check RustDesk on this computer.</li><li>Enter the ID shown on your remote computer.</li><li>Confirm this launch, then authenticate in RustDesk.</li></ol>
      <label className="block space-y-2 text-sm">RustDesk ID<Input aria-label="RustDesk peer ID" inputMode="numeric" maxLength={20} disabled={busy} autoComplete="off" spellCheck={false} value={peer} onChange={e => { setPeer(e.target.value.replace(/[\s-]/g, '').slice(0, 12)); revokeApproval(); setOwned(false); }} placeholder="9–12 digit ID" /></label>
      {peer && !/^\d{9,12}$/.test(peer) && <p className="text-xs text-muted">Use 9–12 digits. Spaces and hyphens from a pasted ID are removed.</p>}
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" disabled={busy} checked={owned} onChange={e => { setOwned(e.target.checked); revokeApproval(); }} />I own this device or have permission to connect</label>
      {approval && <div className="space-y-3 rounded-lg border border-border bg-bg p-4"><p className="text-xs text-muted">One-use approval · expires in {seconds}s</p><label className="block space-y-2 text-sm">Type CONNECT {peer} to approve this one launch<Input aria-label="Connection confirmation" value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} /></label><Button variant="ghost" disabled={busy} onClick={revokeApproval}>Cancel approval</Button></div>}
      <p className="text-xs leading-5 text-muted">The one-use approval expires after 30 seconds and is bound to this site and device ID. Passwords, peer IDs and approval tokens are never saved by this page. RustDesk asks for authentication and controls the actual session permissions.</p>
      {status?.launcherRunning && <p className="text-sm leading-6 text-muted">A tracked RustDesk launcher is active. Finish in its native window, or lock these launch controls before preparing another request.</p>}
    </CardContent><CardFooter><Button variant="secondary" disabled={busy} onClick={() => void act('check')}>{busy ? 'Working…' : 'Check RustDesk'}</Button>{!approval ? <Button disabled={busy || !owned || !/^\d{9,12}$/.test(peer) || !status?.installed || status.launcherRunning} onClick={() => void act('arm')}>Prepare connection</Button> : <Button disabled={busy || seconds <= 0 || confirmation !== `CONNECT ${peer}`} onClick={() => void act('connect')}>Launch RustDesk connection</Button>}<Button variant="danger" disabled={busy} onClick={() => void act('lock')}><Lock className="size-4" />Lock launch controls</Button></CardFooter></Card>
      <div className="space-y-5"><Card><CardHeader><CardTitle>Access safeguards</CardTitle></CardHeader><CardContent><ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted"><li>Only explicit outbound connections to numeric RustDesk IDs.</li><li>No service installation, unattended password, auto-start, public web endpoint, file transfer or terminal launch.</li><li>The native client is launched with --no-server. Existing RustDesk installations and sessions are not reconfigured.</li><li>Use interactive approval on the remote computer. Disable clipboard, file transfer and input there unless you need them.</li><li>Lock revokes new approvals and stops the tracked launcher. Close the native RustDesk session to guarantee disconnection; this page cannot verify a handed-off session.</li></ul><p className="text-xs leading-5 text-muted">Run Setup-Creative-Tools.cmd in the Companion folder to prepare the verified portable client, then restart Companion. Mobile browsers cannot launch a client on another computer through this loopback bridge.</p></CardContent></Card>
      {status && <Card><CardHeader><CardTitle>Local launch activity</CardTitle></CardHeader><CardContent>{status.audit.length ? status.audit.map((row, i) => <p key={`${row.at}-${i}`} className="text-xs leading-5 text-muted">{new Date(row.at).toLocaleTimeString()} · {row.event}</p>) : <p className="text-sm text-muted">No remote launch actions in this Companion session.</p>}</CardContent></Card>}</div></div>
    {note && <p role="status" className="mt-4 break-words text-sm leading-6 text-muted">{note}</p>}{error && <p role="alert" className="mt-4 break-words text-sm leading-6 text-danger">{error}</p>}
  </HubShell>;
}
