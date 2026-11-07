import {
  DEFAULT_GUIDE_DIVERSITY,
  normalizeGuideDiversity,
  type GuideDiversity,
} from "./videos/guide-diversity.ts";
export function createGuideDiversitySession() {
  let snapshot = DEFAULT_GUIDE_DIVERSITY;
  const listeners = new Set<() => void>();
  const apply = (raw: Partial<GuideDiversity>) => {
    const next = normalizeGuideDiversity(raw);
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
    snapshot = next;
    for (const fn of listeners) fn();
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    apply,
    reset: () => apply(DEFAULT_GUIDE_DIVERSITY),
  };
}
/** Document-local choices are intentionally absent from persistent profile settings and room messages. */
export const guideDiversitySession = createGuideDiversitySession();
