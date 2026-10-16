import { useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { createGridAdmission } from '@/lib/grid-admission';
import { scheduleNavigationWork } from '@/lib/navigation-work';
import { useSessionPhase } from '@/lib/use-session-phase';

export function useGridAdmission(pageSize: number, count: number, source: string, variant: string, viewer: boolean) {
  const [controller] = useState(() => createGridAdmission(pageSize, scheduleNavigationWork));
  const state = useSyncExternalStore(controller.subscribe, controller.snapshot, controller.snapshot);
  const phase = useSessionPhase();
  useLayoutEffect(() => { controller.reset(pageSize); }, [controller, source, variant, pageSize]);
  useLayoutEffect(() => { controller.setMaximum(count); }, [controller, count]);
  useLayoutEffect(() => {
    controller.hold(viewer || phase !== 'active');
    return () => controller.hold(true);
  }, [controller, viewer, phase]);
  return { ...state, request: controller.request };
}
