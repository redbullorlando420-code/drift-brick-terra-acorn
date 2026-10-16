import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useLayoutEffect } from 'react';
import { LibraryApp } from '@/components/library/library-app';
import { useLibrary } from '@/lib/videos/store';

export const Route = createFileRoute('/landing')({ component: LandingRoute });

function LandingRoute() {
  const navigate = useNavigate();
  const setSource = useLibrary(state => state.setSource);
  useLayoutEffect(() => {
    setSource('landing');
    void navigate({ to: '/', replace: true });
  }, [navigate, setSource]);
  return <LibraryApp />;
}
