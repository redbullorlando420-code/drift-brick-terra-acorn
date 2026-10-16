import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { DEFAULT_PULL_SETTINGS, getPullSettings, subscribePullSettings } from '@/lib/pull-settings';
import { useLibrary } from '@/lib/videos/store';

export function YoutubeCleanupStatus() {
  const settings = useSyncExternalStore(subscribePullSettings, getPullSettings, () => DEFAULT_PULL_SETTINGS);
  const removed = useLibrary(s => s.youtubeCleanup.groups?.youtube?.removedCount ?? 0), note = useLibrary(s => s.cleanupNotes.youtube ?? '');
  const setSource = useLibrary(s => s.setSource);
  const enabled = settings.youtubeAutoCleanup && settings.youtubeMaxEntries > 0 && settings.remoteMaxEntries > 0;
  return <div data-youtube-cleanup-status className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs leading-5">
    <span>{enabled ? `At the cap, replace up to ${settings.youtubeCleanupBatch.toLocaleString()} old, low-rated videos per pull. Likes, favorites and 3–5-star ratings stay.` : 'Automatic YouTube cleanup is off. New entries hold at the cap.'} {removed > 0 && `${removed.toLocaleString()} entries removed so far.`}</span>
    <Button size="sm" variant="secondary" className="h-11 sm:h-9" onClick={() => {
      try { sessionStorage.setItem('reelcase.settings-section', 'youtube-cleanup'); } catch { /* Settings still opens without storage. */ }
      setSource('settings');
    }}>Manage YouTube cleanup</Button>
    {note && <span className="basis-full text-muted" role="status">{note}</span>}
  </div>;
}
