import { lazy, Suspense, useEffect, useState } from 'react';
import { scheduleBackgroundWork } from '@/lib/interaction-budget';
import type { LibraryVideo } from '@/lib/videos/types';
const FilmReviewEntry = lazy(() => import('./film-review').then(module => ({ default: module.FilmReviewEntry })));
const AnimeReviewEntry = lazy(() => import('./anime-review').then(module => ({ default: module.AnimeReviewEntry })));
/** Metadata tools load after the iframe has painted, independently of playback. */
export function DeferredVideoReviews({ video }: { video: LibraryVideo }) {
  const [ready, setReady] = useState(false);
  useEffect(() => scheduleBackgroundWork(() => setReady(true)), []);
  return ready ? <Suspense fallback={null}><FilmReviewEntry video={video}/><AnimeReviewEntry video={video}/></Suspense> : null;
}
