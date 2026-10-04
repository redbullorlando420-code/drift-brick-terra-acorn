export function searchEditorShortcut(event: { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean; shiftKey: boolean }, editing: boolean) {
  return !event.altKey && !event.shiftKey && ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
    || !editing && !event.ctrlKey && !event.metaKey && event.key === '/');
}

/** Closing the editor or changing source/query invalidates even a timer whose
 * callback was already queued before React cleaned up its effect. */
export function queueSearchDraft(options: {
  draft: string; query: string; sourceId: string;
  active(): boolean;
  get(): { query: string; sourceId: string; activeId: string | null; previewId: string | null };
  commit(value: string): void;
  schedule(work: () => void): () => void;
}) {
  let cancelled = false;
  const stop = options.schedule(() => {
    if (cancelled || !options.active()) return;
    const current = options.get();
    if (current.query !== options.query || current.sourceId !== options.sourceId || current.activeId || current.previewId) return;
    options.commit(options.draft);
  });
  return () => { cancelled = true; stop(); };
}
