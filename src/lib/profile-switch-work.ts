export type ProfileWork = { label: string; state: "save" | "wait" | "blocked"; detail: string };
type Participant = { read: () => ProfileWork | undefined; checkpoint?: () => void | Promise<void> };

export function createProfileSwitchWork() {
  const entries = new Map<symbol, { participant: Participant; attached: boolean }>(),
    listeners = new Set<() => void>();
  let revision = 0,
    running = false;
  const sweep = () => {
    for (const [id, entry] of entries)
      if (!entry.attached && !entry.participant.read()) entries.delete(id);
  };
  const notify = () => {
    sweep();
    revision++;
    for (const listen of listeners) listen();
  };
  const inventory = () =>
    [...entries.values()].flatMap(({ participant }) => {
      const work = participant.read();
      return work ? [work] : [];
    });
  const describe = (work: ProfileWork) => work.label + ": " + work.detail;
  const assertIdle = () => {
    const work = inventory();
    if (work.length) throw Error("Your current profile was kept. " + work.map(describe).join(" "));
  };
  return {
    register(participant: Participant) {
      const id = Symbol(),
        entry = { participant, attached: true };
      entries.set(id, entry);
      notify();
      return {
        notify,
        detach() {
          entry.attached = false;
          notify();
        },
      };
    },
    notify,
    inventory,
    version: () => revision,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    assertIdle,
    async run(activate: () => Promise<void>) {
      if (running) throw Error("A profile switch is already being checked in this tab.");
      running = true;
      try {
        const blockers = inventory().filter((work) => work.state !== "save");
        if (blockers.length)
          throw Error("Your current profile was kept. " + blockers.map(describe).join(" "));
        for (const { participant } of [...entries.values()]) {
          const work = participant.read();
          if (!work) continue;
          if (work.state !== "save" || !participant.checkpoint)
            throw Error("Your current profile was kept. " + describe(work));
          try {
            await participant.checkpoint();
          } catch {
            throw Error(
              "Your current profile was kept. " +
                work.label +
                " could not be saved. Reopen the tool or retry after fixing storage access.",
            );
          }
        }
        assertIdle();
        await activate();
      } finally {
        running = false;
        notify();
      }
    },
  };
}
export const profileSwitchWork = createProfileSwitchWork();
