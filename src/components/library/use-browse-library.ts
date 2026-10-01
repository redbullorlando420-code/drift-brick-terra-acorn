import { useStore } from 'zustand';
import { createDeferredStore } from '@/lib/deferred-store';
import { useLibrary, type LibraryState } from '@/lib/videos/store';

const browse = createDeferredStore(useLibrary, state => Boolean(state.activeId || state.previewId));

/** Full-screen playback uses the live library. Its covered browse page waits
 * for the viewer to close before recomputing catalog shelves and insights. */
export function useBrowseLibrary<T>(selector: (state: LibraryState) => T) {
  return useStore(browse, selector);
}
