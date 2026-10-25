import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LibraryVideo } from '@/lib/videos/types';
import { myFreeCamsRoomUrl } from '@/lib/videos/official-room';
import { watchHiddenPage } from '@/lib/hidden-page-release';

const MODE_KEY = 'reelcase.mfc.view-mode.v1';
type Mode = 'embedded' | 'website';
export function OfficialRoomPlayer({ video, onOpen }: { video: LibraryVideo; onOpen?: () => void }) {
  const href = myFreeCamsRoomUrl(video.remote) ?? 'https://app.myfreecams.com/';
  const name = new URL(href).pathname.slice(1);
  const shareHref = name ? 'https://share.myfreecams.com/' + name : 'https://share.myfreecams.com/';
  const frame = useRef<HTMLElement>(null), [revision, setRevision] = useState(0);
  const [fullscreenError, setFullscreenError] = useState('');
  const [mode, setMode] = useState<Mode>('website'), [ready, setReady] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const [suspended, setSuspended] = useState(false), [saveError, setSaveError] = useState('');
  useEffect(() => {
    try { setMode(localStorage.getItem(MODE_KEY) === 'embedded' ? 'embedded' : 'website'); } catch { /* Direct viewing remains available when preferences cannot be read. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || mode !== 'embedded' || suspended) return;
    return watchHiddenPage(() => setSuspended(true));
  }, [ready, mode, suspended]);
  useEffect(() => setCopyNotice(''), [href]);
  const choose = (next: Mode) => {
    if (next === 'website' && document.fullscreenElement === frame.current) void document.exitFullscreen().catch(() => {});
    setMode(next); setSuspended(false); setSaveError('');
    try { localStorage.setItem(MODE_KEY, next); } catch { setSaveError('This browser could not save your viewing choice. It applies for this visit.'); }
  };
  const openWebsite = () => { choose('website'); onOpen?.(); };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(href); setCopyNotice('Room link copied. Paste it into your usual browser to use its MFC session.'); }
    catch { setCopyNotice('Copy is unavailable. Select the room link below and copy it manually.'); }
  };
  return <section ref={frame} aria-label="MyFreeCams official player" className="min-w-0 bg-surface text-fg [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:overflow-y-auto">
    <div className="space-y-3 border-b border-border p-3 sm:p-4">
      <div><h2 className="font-display text-lg">MyFreeCams official website</h2><p className="max-w-2xl text-xs leading-5 text-muted">Sign in on MFC’s own tab so it can use its first-party session. Your viewing choice is remembered on this device.</p></div>
      <div className="flex flex-wrap gap-2" aria-label="MyFreeCams viewing mode">
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={openWebsite} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">Sign in on MFC <ExternalLink className="size-4" aria-hidden="true" /></a>
        <Button variant={mode === 'embedded' ? 'default' : 'secondary'} className="min-h-11" aria-pressed={mode === 'embedded'} onClick={() => choose('embedded')}>Inside Realhub</Button>
        <Button variant={mode === 'website' ? 'default' : 'secondary'} className="min-h-11" aria-pressed={mode === 'website'} onClick={() => choose('website')}>Direct website</Button>
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={openWebsite} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm">Watch on MyFreeCams <ExternalLink className="size-4" aria-hidden="true" /></a>
        <a href={shareHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm">Share & profile <ExternalLink className="size-4" aria-hidden="true" /></a>
      </div>
      <p className="max-w-3xl text-xs leading-5 text-muted">Inside Realhub is an embedded page, including in full screen. Browser cookie restrictions can make sign-in repeat there. Sign in on MFC opens the official room in its own tab and switches off the embedded page. The MFC session stays in that browser; signing in there may not sign in the embedded view.</p>
      <details className="rounded-md border border-border p-3"><summary className="min-h-11 cursor-pointer text-sm font-medium">Login keeps looping?</summary><div className="mt-2 space-y-3 text-xs leading-5 text-muted"><p>Use Sign in on MFC and stay in that tab for chat and playback. If this app’s browser still loops, copy the room link into your usual Chrome, Edge or Firefox profile where you normally use MFC. Avoid a private window if you want the session remembered.</p><Button variant="secondary" className="min-h-11" onClick={()=>void copyLink()}>Copy room link</Button><label className="block">Official room link<input aria-label="Official MFC room link" className="mt-1 block min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg" value={href} readOnly onFocus={event=>event.currentTarget.select()}/></label>{copyNotice&&<p role="status">{copyNotice}</p>}<p>If sign-in still repeats directly on MFC, remove only MFC’s site cookies in that browser, reopen MFC and sign in again. This signs you out of MFC. Realhub cannot inspect your login, change MFC cookies or complete its confirmations for you.</p><a href="https://wiki.myfreecams.com/wiki/Technical_Information" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-accent underline">MFC sign-in and browser help <ExternalLink className="size-4" aria-hidden="true"/></a></div></details>
      {saveError && <p role="status" className="text-xs text-muted">{saveError}</p>}
    </div>
    {ready && mode === 'embedded' && !suspended ? <>
      <div className="flex flex-wrap gap-2 p-3">
        <Button variant="secondary" className="min-h-11" onClick={() => setRevision(value => value + 1)}><RefreshCw className="size-4" aria-hidden="true" />Reload page</Button>
        <Button variant="secondary" className="min-h-11" onClick={() => setSuspended(true)}><Pause className="size-4" aria-hidden="true" />Pause embedded page</Button>
        <Button variant="secondary" className="min-h-11" onClick={() => { setFullscreenError(''); if (!frame.current?.requestFullscreen) setFullscreenError('Full screen is unavailable in this browser.'); else void frame.current.requestFullscreen().catch(() => setFullscreenError('Full screen is unavailable in this browser.')); }}><Maximize className="size-4" aria-hidden="true" />Full screen</Button>
      </div>
      <div className="bg-surface">
        <iframe key={video.id + ':' + revision} src={href} title="MyFreeCams official room page" className="block min-h-96 w-full border-0" style={{ height: 'max(24rem, 70dvh)' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-storage-access-by-user-activation" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div>
      <p className="px-3 py-2 text-xs leading-5 text-muted">Embedded pages unload after one minute in the background to release memory. Resume explicitly when you return.{fullscreenError && <span role="status"> {fullscreenError}</span>}</p>
    </> : ready ? <div className="space-y-4 p-5 sm:p-8">
      <h3 className="font-display text-xl">{suspended ? 'Embedded page paused' : 'Use MyFreeCams in its own tab'}</h3>
      <p role="status" className="max-w-xl text-sm leading-6 text-muted">{suspended ? 'The page has been unloaded to release its player and panels. Your saved library is unchanged.' : 'Open the official room, then sign in and keep watching in that tab. MFC manages the session; Realhub cannot check whether you are signed in. No embedded MFC page runs here in this mode.'}</p>
      {suspended ? <Button className="min-h-11" onClick={() => setSuspended(false)}>Resume embedded page</Button> : <a href={href} target="_blank" rel="noopener noreferrer" onClick={openWebsite} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">Open official room <ExternalLink className="size-4" aria-hidden="true" /></a>}
    </div> : <p role="status" className="p-5 text-sm text-muted">Restoring your viewing choice…</p>}
  </section>;
}
