import { useSyncExternalStore } from 'react';
import { getPerformanceProfile, getServerPerformanceProfile, subscribePerformanceProfile } from '@/lib/performance-profile';

export function usePerformanceProfile() {
  return useSyncExternalStore(subscribePerformanceProfile, getPerformanceProfile, getServerPerformanceProfile);
}
