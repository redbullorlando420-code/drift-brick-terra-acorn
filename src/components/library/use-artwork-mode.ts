import { useSyncExternalStore } from 'react';
import { getTextFirstArtwork, subscribeArtworkMode } from '@/lib/artwork-mode';

export function useTextFirstArtwork() {
  return useSyncExternalStore(subscribeArtworkMode, getTextFirstArtwork, () => false);
}
