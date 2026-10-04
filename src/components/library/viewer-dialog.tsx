import * as Dialog from '@radix-ui/react-dialog';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useLibrary } from '@/lib/videos/store';
import { viewerReturnTarget } from '@/lib/viewer-accessibility';

/** One modal lifetime covers lazy loading, preview and playback. */
export function ViewerDialog({ title, children }: { title: string; children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null);
  const opener = useRef(typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null);
  const scope = useRef({ source: useLibrary.getState().sourceId, query: useLibrary.getState().query });
  const cardId = useRef(opener.current?.closest<HTMLElement>('[data-video-card-id]')?.dataset.videoCardId);
  const close = () => {
    const state = useLibrary.getState();
    if (state.activeId) state.closePlayer();
    if (state.previewId) state.closePreview();
  };
  return <Dialog.Root open onOpenChange={open => { if (!open) close(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/90" />
      <Dialog.Content ref={content} className="fixed inset-0 z-50 outline-none" aria-modal="true" aria-describedby={undefined}
        onPointerDownOutside={event => event.preventDefault()}
        onEscapeKeyDown={event => {
          if (!document.fullscreenElement) return;
          event.preventDefault();
          void document.exitFullscreen().catch(() => undefined);
        }}
        onCloseAutoFocus={event => {
          event.preventDefault();
          const state = useLibrary.getState();
          const current = document.activeElement;
          const target = viewerReturnTarget({
            viewerOpen: Boolean(state.activeId || state.previewId),
            sameScope: state.sourceId === scope.current.source && state.query === scope.current.query,
            currentOutside: current instanceof HTMLElement && current !== document.body && current.isConnected
              && !content.current?.contains(current) && !current.closest('[data-media-viewer]'),
            opener: opener.current?.isConnected ? opener.current : null,
            replacement: cardId.current ? document.querySelector<HTMLElement>(`[data-video-card-id="${CSS.escape(cardId.current)}"]`) : null,
            fallback: document.querySelector<HTMLElement>('[data-library-focus]'),
          });
          target?.focus({ preventScroll: true });
        }} data-media-viewer>
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

/** Ready controls replace the loading action without waiting for artwork. */
export function useViewerInitialFocus() {
  const button = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => { button.current?.focus({ preventScroll: true }); }, []);
  return button;
}
