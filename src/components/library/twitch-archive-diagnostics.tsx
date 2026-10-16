import { useState } from 'react';
import type { FollowedChannel } from '@/lib/videos/types';

const stopLabels = {
  'page-budget': 'Page budget reached · continue with another pull',
  'entry-budget': 'Batch complete · continue with another pull',
  exhausted: 'All public shelves completed',
  stalled: 'Cursor stopped advancing · retry later',
  'incomplete-page': 'Incomplete page · position held for retry',
  challenge: 'Provider integrity challenge · accepted pages kept',
  'provider-error': 'Provider failed · accepted pages kept',
  'entry-limit': 'Your entry limit was reached · position held',
};

export function TwitchArchiveDiagnostics({ channel }: { channel: Pick<FollowedChannel, 'twitchArchiveCursor' | 'twitchArchiveLastVideoId' | 'twitchArchiveDiagnostics'> }) {
  const [showPosition, setShowPosition] = useState(false);
  const sample = channel.twitchArchiveDiagnostics;
  if (!sample) return null;
  return <div className="mt-3 border-t border-border pt-2 text-xs text-muted">
    <p className="font-medium text-fg">Last deep pull · {sample.resumed ? 'resumed' : 'from newest'}{sample.stage ? ` · ${sample.stage.toLowerCase()}` : ''}</p>
    <p className="mt-1">{sample.pages} accepted page{sample.pages === 1 ? '' : 's'} · {sample.accepted.toLocaleString()} distinct VODs · {sample.duplicates.toLocaleString()} repeats</p>
    <p className="mt-1">{stopLabels[sample.stopReason]}</p>
    {sample.error && <p className="mt-1 break-words text-accent">{sample.error}</p>}
    <p className="mt-1 text-[11px] text-subtle">{new Date(sample.at).toLocaleString()} · {sample.received.toLocaleString()} rows returned</p>
    {channel.twitchArchiveLastVideoId && <p className="mt-1 break-all text-[11px]">Last accepted VOD: {channel.twitchArchiveLastVideoId}</p>}
    {channel.twitchArchiveCursor && <>
      <button className="mt-2 text-accent underline underline-offset-2" aria-expanded={showPosition} onClick={() => setShowPosition(value => !value)}>{showPosition ? 'Hide saved position' : 'Show saved position'}</button>
      {showPosition && <code className="mt-1 block break-all rounded bg-bg/60 p-2 text-[10px]">{channel.twitchArchiveCursor}</code>}
    </>}
  </div>;
}
