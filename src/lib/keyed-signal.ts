/** A signal keeps only live listeners, never a ledger of previously seen IDs. */
export function createKeyedSignal() {
  const listeners = new Map<string, Set<() => void>>();
  return {
    subscribe(id: string, listener: () => void) {
      let group = listeners.get(id);
      if (!group) { group = new Set(); listeners.set(id, group); }
      group.add(listener);
      return () => { group.delete(listener); if (!group.size && listeners.get(id) === group) listeners.delete(id); };
    },
    emit(id: string) { listeners.get(id)?.forEach(listener => listener()); },
    emitAll() { listeners.forEach(group => group.forEach(listener => listener())); },
    size() { return listeners.size; },
  };
}
