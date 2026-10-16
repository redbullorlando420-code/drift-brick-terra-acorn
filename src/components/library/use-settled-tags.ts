import { startTransition, useEffect, useMemo, useState } from 'react';
import { createSettledInput } from '@/lib/settled-input';

/** Live cards/editors retain current tags. Full-catalog analysis observes a
 * bounded cadence rather than restarting after every enrichment batch. */
export function useSettledTags(tags: Record<string, string[]>, enabled: boolean) {
  const [settled, setSettled] = useState(tags);
  const queue = useMemo(() => createSettledInput<Record<string, string[]>>(value => startTransition(() => setSettled(value))), []);
  useEffect(() => {
    if (!enabled) { queue.cancel(); setSettled(tags); return; }
    if (settled !== tags) queue.push(tags);
  }, [enabled, tags, queue, settled]);
  useEffect(() => () => queue.cancel(), [queue]);
  return enabled ? settled : tags;
}
