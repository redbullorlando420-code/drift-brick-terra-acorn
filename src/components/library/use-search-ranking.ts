import { useEffect, useState } from 'react';
import { rankSearchResults, type SearchRankingInput, type SearchRankingResult } from '@/lib/videos/search-ranking';
import { useLibrary } from '@/lib/videos/store';

const EMPTY: SearchRankingResult = { ranked: [], tags: [] };
export function useSearchRanking(input: SearchRankingInput | null) {
  const [completed, setCompleted] = useState<{ input: SearchRankingInput; result: SearchRankingResult; error?: boolean }>();
  useEffect(() => {
    // Drop the previous full result promptly instead of retaining it throughout
    // another query, a navigation, or an idle session.
    setCompleted(undefined);
    if (!input) return;
    let controller: AbortController | undefined, settled = false;
    let held = Boolean(useLibrary.getState().activeId || useLibrary.getState().previewId);
    const start = () => {
      if (held || settled) return;
      const job = new AbortController(); controller = job;
      void rankSearchResults(input, job.signal).then(result => {
        if (!job.signal.aborted) { settled = true; setCompleted({ input, result }); }
      }).catch(() => {
        if (!job.signal.aborted) { settled = true; setCompleted({ input, result: EMPTY, error: true }); }
      });
    };
    // Pause by cancelling the transient arrays, without subscribing the entire
    // app to player state. Resume one fresh pass after the viewer closes.
    const stop = useLibrary.subscribe(state => {
      const next = Boolean(state.activeId || state.previewId);
      if (held === next) return;
      held = next;
      if (held) { controller?.abort(); controller = undefined; }
      else start();
    });
    start();
    return () => { controller?.abort(); stop(); };
  }, [input]);
  const current = completed?.input === input ? completed : undefined;
  return { result: current?.result ?? EMPTY, pending: Boolean(input && !current), error: Boolean(current?.error) };
}
