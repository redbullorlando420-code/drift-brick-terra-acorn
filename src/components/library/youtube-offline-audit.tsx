import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { catalogTurn } from '@/lib/catalog-turn';
import { useLibrary } from '@/lib/videos/store';
import { readOfflineAuditStorage } from '@/lib/videos/persist';
import { prepareOfflineCacheAudit, type OfflineCacheAudit } from '@/lib/videos/offline-cache-audit';

const date = (at?: number) => at ? new Date(at).toLocaleString() : 'No saved timestamp';
const age = (at: number | undefined, now: number) => at ? Math.floor(Math.max(0, now - at) / 86400000).toLocaleString() + ' days old' : 'Unknown age';
export function YoutubeOfflineAudit() {
  const [open, setOpen] = useState(false);
  return <section className="mb-5 rounded-lg border border-border bg-surface p-4" aria-label="YouTube offline cache audit"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-medium text-fg">Offline cache audit</h2><p className="mt-1 text-xs leading-5 text-muted">Inspect saved channel coverage, artwork bytes, and recoverable links without a provider request.</p></div><Button variant="secondary" className="min-h-11" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Close cache audit' : 'Inspect offline cache'}</Button></div>{open && <OfflineAuditPanel />}</section>;
}
function OfflineAuditPanel() {
  const videos = useLibrary(state => state.videos), follows = useLibrary(state => state.follows);
  const [report, setReport] = useState<{ result: OfflineCacheAudit; videos: typeof videos; follows: typeof follows }>();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    const stop = () => { if (document.visibilityState === 'hidden') { controller.current?.abort(); setBusy(false); } };
    document.addEventListener('visibilitychange', stop);
    return () => { controller.current?.abort(); document.removeEventListener('visibilitychange', stop); };
  }, []);
  const run = async () => {
    controller.current?.abort(); const request = new AbortController(); controller.current = request;
    setBusy(true); setError('');
    try {
      const storage = await readOfflineAuditStorage(request.signal);
      const result = await prepareOfflineCacheAudit(videos, follows, storage, Date.now(), catalogTurn(request.signal));
      if (!request.signal.aborted) setReport({ result, videos, follows });
    } catch (error) { if (!request.signal.aborted) setError(error instanceof Error ? error.message : 'Could not read the saved cache.'); }
    finally { if (controller.current === request) { controller.current = null; setBusy(false); } }
  };
  const result = report?.result, stale = report && (report.videos !== videos || report.follows !== follows);
  return <div className="mt-4 border-t border-border pt-4" aria-busy={busy}><div className="flex flex-wrap items-center gap-3"><Button className="min-h-11" disabled={busy} onClick={() => void run()}>{busy ? 'Reading saved cache…' : result ? 'Run cache audit again' : 'Run cache audit'}</Button>{busy && <Button className="min-h-11" variant="secondary" onClick={() => { controller.current?.abort(); setBusy(false); }}>Cancel audit</Button>}{result && <p className="text-xs text-muted" role="status">Snapshot {date(result.at)}{stale ? ' · Catalog changed; run again for current coverage.' : ''}</p>}</div>{error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}{result && <><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><AuditStat label="Channels with saved videos" value={result.coveredChannels.toLocaleString() + ' / ' + result.channels.toLocaleString()} note={result.cachedVideos.toLocaleString() + ' saved YouTube cards; playlists excluded from channel count.'} /><AuditStat label="Artwork stored on this device" value={result.offlineArtwork.toLocaleString() + (result.offlineArtwork === 1 ? ' image' : ' images')} note={Math.round(result.artworkBytes / 1024).toLocaleString() + ' KiB estimated stored · ' + age(result.oldestArtworkAt, result.at)} /><AuditStat label="Saved poster references" value={result.posters.toLocaleString()} note="A URL alone does not make an image available offline. Browser HTTP and Companion caches are not measured." /><AuditStat label="Oldest saved provider observation" value={age(result.oldestObservationAt, result.at)} note={date(result.oldestObservationAt) + ' · ' + result.observedChannels.toLocaleString() + ' channels have an observation; ' + result.failedChannels.toLocaleString() + ' latest failed check(s) retained.'} /><AuditStat label="Catalog last saved" value={date(result.catalogSavedAt)} note="A storage timestamp, not evidence of a fresh or successful YouTube check." /><AuditStat label="Recoverable YouTube links" value={result.recoverableLinks.toLocaleString()} note="Saved playback/history links can survive catalog cleanup. Playback still needs YouTube and an available video." /></div><p className="mt-3 text-xs leading-5 text-muted">This audit reads saved metadata only. It does not download videos, refresh live status, or change provider success/failure records.</p>{result.recoveryPreview.length > 0 && <div className="mt-4"><h3 className="text-sm font-medium text-fg">Saved link preview · first {result.recoveryPreview.length}</h3><ul className="mt-2 space-y-1">{result.recoveryPreview.map(row => <li key={row.url}><a className="inline-flex min-h-11 max-w-full items-center break-all text-sm text-accent underline" href={row.url} target="_blank" rel="noreferrer">{row.title || row.url}</a></li>)}</ul></div>}</>}</div>;
}
function AuditStat({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="min-w-0 rounded-md bg-bg/45 p-3"><h3 className="text-xs text-muted">{label}</h3><p className="mt-2 break-words text-lg font-medium text-fg">{value}</p><p className="mt-1 text-xs leading-5 text-muted">{note}</p></div>;
}
