import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, ExternalLink, LoaderCircle, Play, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPANION_ORIGIN } from '@/lib/companion';
import { closeYoutubeDownload, type YoutubeDownloadTarget, type YoutubeDownloadState } from '@/lib/youtube-download';

const active = (status?: string) => status === 'queued' || status === 'running';
async function request(path: string, signal: AbortSignal, body?: object) {
  const response = await fetch(`${COMPANION_ORIGIN}/youtube/downloads${path}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
    ...(body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || 'Companion could not complete the request.');
  return result;
}
export default function YoutubeDownloadDialog({ target }: { target: YoutubeDownloadTarget }) {
  const [state, setState] = useState<YoutubeDownloadState | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [useBrowserSession, setUseBrowserSession] = useState(false);
  const [browser, setBrowser] = useState('chrome');
  const [watching, setWatching] = useState(false), [playError, setPlayError] = useState('');
  const mutation = useRef<AbortController | null>(null);
  const job = state?.jobs.find(row => row.key === target.videoId);
  const running = active(job?.status);
  const refresh = useCallback(() => setRevision(n => n + 1), []);
  useEffect(() => {
    let disposed = false, timer: ReturnType<typeof setTimeout> | undefined, controller: AbortController | null = null;
    const load = async () => {
      clearTimeout(timer);
      if (document.hidden || busy || disposed) return;
      controller?.abort(); const attempt = new AbortController(); controller = attempt;
      try {
        const next = await request('', attempt.signal) as YoutubeDownloadState;
        if (disposed || attempt.signal.aborted) return;
        setState(next); setError(''); setLoading(false);
        if (next.jobs.some(row => row.key === target.videoId && active(row.status))) timer = setTimeout(load, 2000);
      } catch (cause) {
        if (disposed || attempt.signal.aborted) return;
        setState(null); setLoading(false); setError(cause instanceof Error && !/fetch|network|timeout/i.test(cause.message) ? cause.message : 'Companion is unavailable on this computer. Start Realhub Companion, then try again.');
      }
    };
    const visibility = () => { clearTimeout(timer); if (document.hidden) controller?.abort(); else void load(); };
    void load(); document.addEventListener('visibilitychange', visibility);
    return () => { disposed = true; clearTimeout(timer); controller?.abort(); document.removeEventListener('visibilitychange', visibility); };
  }, [target.videoId, revision, busy]);
  useEffect(() => () => mutation.current?.abort(), []);
  const act = async (cancel = false) => {
    if (busy || cancel && !job) return;
    const controller = new AbortController(); mutation.current = controller; setBusy(true); setError('');
    try {
      setWatching(false); setPlayError('');
      const result = await request(cancel ? `/${job!.id}/cancel` : '', controller.signal, cancel ? {} : { videoId: target.videoId, title: target.title,
        ...(useBrowserSession ? { useBrowserSession: true, browser } : {}) });
      if (controller.signal.aborted) return;
      setState(previous => previous ? { ...previous, jobs: [result.job, ...previous.jobs.filter(row => row.id !== result.job.id)] } : previous);
    } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Download request failed.'); }
    finally { if (!controller.signal.aborted) { setBusy(false); refresh(); } }
  };
  return <Dialog.Root open onOpenChange={open => { if (!open) closeYoutubeDownload(); }}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-60 bg-bg/80" />
    <Dialog.Content className="youtube-download-dialog fixed inset-x-3 top-1/2 z-60 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-5 text-fg shadow-xl outline-none sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-widest text-accent">Save to your computer</p><Dialog.Title className="mt-2 font-display text-2xl">YouTube download</Dialog.Title></div>
        <Dialog.Close asChild><Button variant="ghost" size="icon" className="min-h-11 min-w-11 shrink-0" aria-label="Close YouTube download"><X className="size-5" /></Button></Dialog.Close></div>
      <Dialog.Description className="mt-3 break-words text-sm leading-6 text-muted">{target.title}</Dialog.Description>
      {!watching && <div className="mt-5 rounded-lg border border-border bg-bg p-4">
        <div className="flex items-center gap-2 text-sm font-medium">{loading ? <LoaderCircle className="size-4 motion-safe:animate-spin" /> : state?.configured ? <CheckCircle2 className="size-4 text-accent" /> : <Download className="size-4" />}
          {loading ? 'Checking Companion…' : state?.configured ? `${state.engine} ${state.version ?? ''}` : 'Setup needed'}</div>
        <p className="mt-2 text-xs leading-5 text-muted">One video per download. Prefers MP4 with audio; uses the best combined format available. No playlist or live recording.</p>
        {state?.path && <p className="mt-3 break-all text-xs leading-5 text-muted"><span className="font-medium text-fg">Save folder</span><br />{job?.path || state.path}</p>}
      </div>}
      {!watching && !target.live && state?.configured && <section aria-label="Browser sign-in" className="mt-4 rounded-lg border border-border p-4">
        <label className="flex min-h-11 items-center gap-3 text-sm font-medium"><input type="checkbox" checked={useBrowserSession} disabled={!state.browserAuth || running || busy} onChange={event => setUseBrowserSession(event.target.checked)} className="size-4 accent-accent" />Use my signed-in browser for this download</label>
        <p className="mt-1 text-xs leading-5 text-muted">For age-restricted or sign-in-required videos your YouTube account can already watch. The local downloader reads browser cookies for this request; cookies are never sent to Realhub or saved in its library.</p>
        {useBrowserSession && <label className="mt-3 flex flex-wrap items-center gap-3 text-sm">Signed-in browser<select aria-label="Signed-in browser" value={browser} disabled={running || busy} onChange={event => setBrowser(event.target.value)} className="min-h-11 rounded-md border border-border bg-bg px-3 text-fg"><option value="chrome">Chrome</option><option value="edge">Edge</option><option value="firefox">Firefox</option></select></label>}
        {!state.browserAuth && <p className="mt-2 text-xs leading-5 text-muted">Update Companion with Setup-YouTube-Downloads.cmd to enable browser sign-in. Existing downloads still work.</p>}
        {useBrowserSession && <p className="mt-2 text-xs leading-5 text-muted">If the browser cookie database is locked, close that browser and retry. If Chrome or Edge reports an encryption error, choose a signed-in Firefox session. YouTube may still require age verification or reject the request.</p>}
      </section>}
      {!loading && !state?.configured && <div className="mt-4 text-sm leading-6 text-muted"><p>On the computer running Realhub, open <strong className="text-fg">Setup-YouTube-Downloads.cmd</strong> in the Companion folder once, then open <strong className="text-fg">Start-Realhub-Companion.cmd</strong>.</p>
        <p className="mt-2">The included setup installs the official yt-dlp release and approves a local save folder. Downloading requires Realhub on the same computer as Companion. A phone cannot use the computer’s download button remotely.</p>
        {state?.needs?.map(need => <p key={need} className="mt-2">{need}</p>)}
      </div>}
      {target.live && <p role="note" className="mt-4 text-sm text-muted">This is a live stream. Download the archived video after it ends.</p>}
      {job && <section aria-label="Download status" className="mt-4 rounded-lg border border-border p-4"><p role="status" className="text-sm font-medium">{({ queued: 'Queued', running: 'Downloading', done: 'Download complete', error: 'Download failed', cancelled: 'Cancelled' })[job.status]}{running && job.progress > 0 ? ` · ${Math.round(job.progress)}%` : ''}</p>
        {running && <progress aria-label="Download progress" max={100} value={job.progress || undefined} className="mt-3 h-2 w-full accent-accent" />}
        <p className="mt-2 break-words text-xs leading-5 text-muted">{job.detail}</p>{job.file && job.status === 'done' && <p className="mt-2 break-all text-xs text-fg">{job.file}</p>}
      </section>}
      {job?.status === 'error' && /age|sign.?in|cookie|DPAPI|decrypt|encrypt|database|confirm.*bot/i.test(job.detail) && <p role="note" className="mt-3 text-sm leading-6 text-muted">This video needs account access, or the browser session could not be read. Enable browser sign-in and choose the browser where this video plays on YouTube. For an encrypted Chrome/Edge session, try Firefox.</p>}
      {watching && job?.status === 'done' && <section aria-label="Saved YouTube video" className="mt-4"><video key={job.id} controls autoPlay playsInline crossOrigin="anonymous" preload="metadata" aria-label={`Saved video: ${target.title}`} src={`${COMPANION_ORIGIN}/youtube/downloads/${encodeURIComponent(job.id)}/media`} className="aspect-video w-full rounded-lg bg-bg" onError={() => setPlayError('The saved video could not be played. Check Companion and the saved file; this browser may not support its codec.')} />{playError && <p role="alert" className="mt-2 text-sm leading-6 text-muted">{playError}</p>}<p className="mt-2 text-xs text-muted">Playing the completed copy on this computer. Seeking uses the local file.</p></section>}
      {error && <p role="alert" className="mt-4 break-words text-sm leading-6 text-fg">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {state?.configured && !target.live && !running && <Button className="min-h-11" disabled={busy || useBrowserSession && !state.browserAuth} onClick={() => void act()}><Download className="size-4" />{busy ? 'Starting…' : job?.status === 'error' || job?.status === 'cancelled' ? 'Retry download' : job?.status === 'done' ? 'Download again' : `Download with ${state.engine}`}</Button>}
        {job?.status === 'done' && state?.localPlayback && <Button variant="secondary" className="min-h-11" onClick={() => { setWatching(value => !value); setPlayError(''); }}><Play className="size-4" />{watching ? 'Hide local player' : 'Watch saved video'}</Button>}
        {running && <Button variant="secondary" className="min-h-11" disabled={busy} onClick={() => void act(true)}>Cancel download</Button>}
        <Button variant="secondary" className="min-h-11" disabled={busy} onClick={refresh}><RefreshCw className="size-4" />Check status</Button>
        <a href={`https://www.youtube.com/watch?v=${target.videoId}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted hover:text-fg">Open YouTube<ExternalLink className="size-4" /></a>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">Closing this panel keeps a started download running. Reopen this video’s Download button to check it.</p>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}
