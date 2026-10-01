export type CardVisibility = { near: boolean; visible: boolean };
type Row = { value: CardVisibility; notify: (value: CardVisibility) => void };
type Observer = Pick<IntersectionObserver, 'observe' | 'unobserve' | 'disconnect'>;
type Factory = (notify: (entries: readonly Pick<IntersectionObserverEntry, 'target' | 'isIntersecting'>[]) => void,
  options?: IntersectionObserverInit) => Observer;

/** One observer pair for every mounted card. Metadata updates do not rebuild
 * observers, and the last unmount releases observers and retained DOM nodes. */
export function createCardVisibilityTracker(factory: Factory) {
  const rows = new Map<Element, Row>();
  let near: Observer | undefined, visible: Observer | undefined;
  let generation = 0;
  const update = (entries: readonly Pick<IntersectionObserverEntry, 'target' | 'isIntersecting'>[], key: keyof CardVisibility) => {
    for (const entry of entries) {
      const row = rows.get(entry.target);
      if (!row || row.value[key] === entry.isIntersecting) continue;
      row.value = { ...row.value, [key]: entry.isIntersecting };
      row.notify(row.value);
    }
  };
  const disconnect = () => { generation++; near?.disconnect(); visible?.disconnect(); near = visible = undefined; };
  return {
    observe(element: Element, notify: Row['notify']) {
      if (!near) {
        const current = generation;
        near = factory(entries => { if (generation === current) update(entries, 'near'); }, { rootMargin: '320px' });
        visible = factory(entries => { if (generation === current) update(entries, 'visible'); });
      }
      const row: Row = { value: { near: false, visible: false }, notify };
      rows.set(element, row);
      notify(row.value);
      near.observe(element); visible!.observe(element);
      return () => {
        // An old cleanup must not unregister a remounted card on the same node.
        if (rows.get(element) !== row) return;
        rows.delete(element);
        near?.unobserve(element); visible?.unobserve(element);
        if (!rows.size) disconnect();
      };
    },
    dispose() { disconnect(); rows.clear(); },
    snapshot() { return { cards: rows.size, observers: near ? 2 : 0 }; },
  };
}

export const cardVisibility = createCardVisibilityTracker((notify, options) => new IntersectionObserver(notify, options));
// Vite swaps the module during development; old observers must not retain cards.
import.meta.hot?.dispose(() => cardVisibility.dispose());
