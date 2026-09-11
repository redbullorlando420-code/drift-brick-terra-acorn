import { useLibrary } from './store';

export function openTopic(topic: string) {
  useLibrary.getState().setQuery(topic);
  useLibrary.getState().setSource('genres');
}
