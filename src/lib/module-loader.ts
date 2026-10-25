/** Share an in-flight or fulfilled import between warmup and lazy rendering.
 * Failed speculative requests must not poison a later navigation attempt. */
export function createModuleLoader<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () => promise ??= Promise.resolve().then(load).catch(error => {
    promise = undefined;
    throw error;
  });
}
