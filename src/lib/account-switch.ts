type AccountWriter = { current: () => unknown; subscribe: (changed: () => void) => () => void };

/** Observe only an already accepted local write; never poll or bypass a checkpoint. */
export function waitForAccountWriter(writer: AccountWriter, timeoutMs = 5000): Promise<void> {
  if (!writer.current()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let settled = false,
      stop = () => {};
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      stop();
      if (error) reject(error);
      else resolve();
    };
    const timer = setTimeout(
      () =>
        finish(
          Error(
            "The catalog is still saving. Your current account was kept; try switching again when it finishes.",
          ),
        ),
      timeoutMs,
    );
    const changed = () => {
      if (!writer.current()) finish();
    };
    stop = writer.subscribe(changed);
    if (settled) stop();
    changed();
  });
}

export async function checkpointAccountSwitch(
  checkpoint: () => Promise<void>,
  writer: () => Promise<AccountWriter>,
  activate: () => Promise<void>,
) {
  try {
    await checkpoint();
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.startsWith("A catalog write is still finishing.")
    )
      throw error;
    await waitForAccountWriter(await writer());
    await checkpoint();
  }
  await activate();
}
