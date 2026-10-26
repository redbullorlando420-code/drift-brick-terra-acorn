import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { searchWorkerIndex } from '@/lib/videos/search-worker-index';
export function SearchWorkerRecovery({onRetry}:{onRetry:()=>void}) {
  const status=useSyncExternalStore(searchWorkerIndex.subscribe,searchWorkerIndex.getStatus,()=> 'idle' as const);
  if(status!=='failed')return null;
  return <div role="status" className="my-3 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-3" data-search-worker-recovery><p className="text-xs leading-5 text-muted">Search worker stopped. Search continues with a cooperative local scan; saved media is unchanged.</p><Button variant="secondary" className="min-h-11" onClick={onRetry}>Retry search index</Button></div>;
}
