import { createMiddleware, createStart } from '@tanstack/react-start';
import { safeHydrationResponse } from './lib/html-stream-compat';

const hydrationCompatibility = createMiddleware().server(async ({ next }) => {
  const result = await next();
  return { ...result, response: safeHydrationResponse(result.response) };
});

export const startInstance = createStart(() => ({ requestMiddleware: [hydrationCompatibility] }));
