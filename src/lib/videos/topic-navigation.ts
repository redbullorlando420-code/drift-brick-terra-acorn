import { useLibrary } from './store';

/** Open a topic without yanking the user off Adults into Genres/Search. */
export function openTopic(topic: string) {
  const clean = topic.trim().replace(/^#/, '');
  if (!clean) return;
  const state = useLibrary.getState();
  const onAdults = state.sourceId === 'adults' || state.sourceId === 'adult-fetishes';
  if (onAdults) {
    state.setQuery('');
    state.setSource('adults');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('reelcase:adult-tag', { detail: { tag: clean } }));
    }
    return;
  }
  state.setQuery(clean);
  state.setSource('genres');
}
