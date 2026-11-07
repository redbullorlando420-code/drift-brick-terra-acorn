import { useEffect, useSyncExternalStore } from "react";
import type { reviewedDocument } from "@/lib/reviewed-document";
export function useReviewedDocument<T>(doc: ReturnType<typeof reviewedDocument<T>>) {
  const state = useSyncExternalStore(doc.subscribe, doc.get, doc.server);
  useEffect(() => doc.hydrate(), [doc]);
  return state;
}
