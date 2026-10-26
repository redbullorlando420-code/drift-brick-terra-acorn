import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SignalPack } from '@/lib/stream-signal';
import type { StoryLayout } from '@/lib/stream-signal-card';

export function SignalStoryExport({ pack }: { pack: SignalPack | null }) {
  const [prepared, setPrepared] = useState<{ url: string; layout: StoryLayout; caption: string } | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const generation = useRef(0);
  useEffect(() => { generation.current++; setPrepared(null); setBusy(false); setError(''); return () => { generation.current++; }; }, [pack?.id, pack?.profile]);
  useEffect(() => () => { if (prepared) URL.revokeObjectURL(prepared.url); }, [prepared]);
  const prepare = async () => {
    if (!pack) return; const ticket = ++generation.current;
    setBusy(true); setError('');
    try {
      const { prepareSignalStoryCard } = await import('@/lib/stream-signal-card');
      const next = await prepareSignalStoryCard(pack);
      if (ticket === generation.current) setPrepared({ ...next, url: URL.createObjectURL(next.blob) });
    } catch (e) { if (ticket === generation.current) setError(e instanceof Error ? e.message : 'The card could not be prepared. Try again.'); }
    finally { if (ticket === generation.current) setBusy(false); }
  };
  const caption = () => {
    if (!prepared || !pack) return;
    const url = URL.createObjectURL(new Blob([prepared.caption], { type: 'text/plain;charset=utf-8' })), link = document.createElement('a');
    link.href = url; link.download = `stream-signal-caption-${pack.createdAt}.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="mt-4 space-y-3" data-story-export>
    <Button variant="secondary" className="w-full" disabled={!pack || busy} onClick={() => void prepare()}>{busy ? 'Measuring card…' : prepared ? 'Refresh export preview' : 'Review Story export'}</Button>
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    {prepared && pack && <section aria-label="Story export review" className="space-y-3 rounded-md border border-border bg-bg/60 p-3">
      <p className="text-sm font-medium text-fg">Measured export · 1080 × 1920</p>
      {prepared.layout.warnings.length ? <div role="alert" className="space-y-2 text-sm text-danger">{prepared.layout.warnings.map(warning => <p key={warning}>{warning}</p>)}</div> : <p className="text-sm text-muted">All announcement text fits the card’s safe regions.</p>}
      <img src={prepared.url} alt={`Story announcement: ${pack.profile.creator} is going live. ${pack.profile.title}. ${pack.profile.game}. Full text and stream links are available in the caption below.`} className="mx-auto h-auto w-full max-w-xs rounded-md" width={1080} height={1920} />
      <Button asChild className="signal-primary w-full"><a href={prepared.url} download={`stream-signal-story-${pack.createdAt}.png`}><Download className="size-4" />{prepared.layout.warnings.length ? 'Download shortened Story PNG' : 'Download Story PNG'}</a></Button>
      <Button variant="secondary" className="w-full" onClick={caption}>Download full caption / alt text</Button>
      <label className="block"><span className="signal-label">Full Story caption and text alternative</span><textarea readOnly aria-label="Full Story caption and text alternative" value={prepared.caption} rows={6} className="w-full rounded-md border border-border bg-bg p-3 text-sm text-fg" /></label>
      <details className="text-xs text-muted"><summary className="cursor-pointer py-2">Text fit and contrast</summary><ul className="space-y-2">{prepared.layout.fields.map(field => <li key={field.key}>{field.label}: {field.lines.length} line(s), {field.size}px · {field.shortened ? 'shortened; see full caption' : 'full text'}</li>)}{prepared.layout.contrast.map(row => <li key={row.label}>{row.label}: {row.ratio.toFixed(2)}:1</li>)}</ul><p className="mt-2">Text remains inside the card’s safe regions. Leave room in Instagram for a Link sticker; the PNG itself has no clickable links.</p></details>
    </section>}
  </div>;
}
