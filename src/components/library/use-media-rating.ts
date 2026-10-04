import { useCallback, useSyncExternalStore } from 'react';
import { getRating, subscribeRating } from '@/lib/media-feedback';

const serverRating = () => 0;
export function useMediaRating(id: string | null) {
  const subscribe = useCallback((listener: () => void) => id ? subscribeRating(id, listener) : () => {}, [id]);
  const read = useCallback(() => id ? getRating(id) : 0, [id]);
  return useSyncExternalStore(subscribe, read, serverRating);
}
