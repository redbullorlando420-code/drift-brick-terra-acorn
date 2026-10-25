import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/lib/videos/store';
import { fetchYoutubeVideoMetadata } from '@/lib/remote/youtube-publication-functions';
import { readLocalRuntime } from '@/lib/videos/local-runtime';
import type { LibraryVideo } from '@/lib/videos/types';

export function MovieRuntimeRepair({ candidates, total }: { candidates: LibraryVideo[]; total: number }) {
  const attempted = useRef(new Set<string>()), active = useRef<AbortController | null>(null), mounted = useRef(true);
  const [busy, setBusy] = useState(false), [report, setReport] = useState<Array<{ title: string; detail: string }>>([]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; active.current?.abort(); }; }, []);
  const check = async () => {
    const controller = new AbortController(); active.current = controller; setBusy(true);
    const results: typeof report = [];
    try {
      for (const video of candidates.filter(video => !attempted.current.has(video.id)).slice(0, 5)) {
        if (controller.signal.aborted) break;
        attempted.current.add(video.id);
        try {
          let duration: number | undefined;
          if (video.remote?.kind === 'youtube' && video.remote.videoId) {
            const metadata = await fetchYoutubeVideoMetadata({ data: { id: video.remote.videoId }, signal: controller.signal });
            controller.signal.throwIfAborted(); duration = metadata.duration;
            if (!duration) throw new Error('YouTube did not expose a runtime. The title remains unconfirmed.');
            await useLibrary.getState().setYoutubeMetadata(video.id, metadata);
          } else {
            duration = await readLocalRuntime(video, controller.signal);
            controller.signal.throwIfAborted(); await useLibrary.getState().setLocalVideoDuration(video.id, duration);
          }
          results.push({ title: video.name, detail: duration > 600 ? `${Math.round(duration / 60)} minutes · runtime saved` : '10 minutes or less · kept outside Movies' });
        } catch (error) {
          if (controller.signal.aborted) { attempted.current.delete(video.id); break; }
          results.push({ title: video.name, detail: error instanceof Error ? error.message : 'Runtime unavailable.' });
        }
        if (mounted.current) setReport([...results]);
      }
    } finally { if (mounted.current) { setBusy(false); setReport(results); } active.current = null; }
  };
  if (!total && !report.length) return null;
  const remaining = candidates.some(video => !attempted.current.has(video.id));
  return <section className="mb-6 rounded-lg border border-border bg-elevated p-4" aria-label="Movie runtime checks">
    <p className="font-medium text-fg">{total.toLocaleString()} likely movie{total === 1 ? '' : 's'} awaiting runtime</p>
    <p className="mt-2 text-sm text-muted">These titles have movie evidence, but their length is missing. Check up to five at a time using YouTube metadata or your connected local files. Only films longer than 10 minutes enter Movies.</p>
    <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" disabled={busy || !remaining} onClick={() => void check()}>{busy ? 'Checking movie runtimes…' : 'Check next 5 movie runtimes'}</Button>{busy ? <Button variant="ghost" onClick={() => active.current?.abort()}>Stop checks</Button> : report.length > 0 && <Button variant="ghost" onClick={() => { attempted.current.clear(); setReport([]); }}>Retry unavailable runtimes</Button>}</div>
    <ul className="mt-3 space-y-2 text-xs text-muted" aria-live="polite">{report.map((row, index) => <li key={index}><span className="font-medium text-fg">{row.title}</span> · {row.detail}</li>)}</ul>
  </section>;
}
