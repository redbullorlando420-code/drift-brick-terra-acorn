import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
    <p className="text-xs font-medium uppercase tracking-wide text-accent">Realhub</p>
    <h1 className="font-display text-4xl">That page is not here</h1>
    <p className="max-w-md text-sm leading-6 text-muted">This library view may have moved. Return to Home, then open Landing page or another workspace from the sidebar.</p>
    <Link to="/" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg">Return to Home</Link>
  </main>;
}
