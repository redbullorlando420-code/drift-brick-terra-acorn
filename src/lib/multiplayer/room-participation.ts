import {
  readPlayerReadiness,
  samePlayerReadiness,
  type RoomPlayerReadiness,
} from "./room-player-readiness.ts";
export type RoomParticipant = {
  id: string;
  ready: boolean;
  vote?: string;
  player?: RoomPlayerReadiness;
};
export type ParticipationAction =
  | { kind: "ready"; value: boolean }
  | { kind: "vote"; value: string | null }
  | { kind: "player"; value: RoomPlayerReadiness };
export type ParticipationState = {
  revision: number;
  people: RoomParticipant[];
  selection?: number;
};
export function readParticipationAction(raw: unknown): ParticipationAction | undefined {
  if (!raw || typeof raw !== "object") return;
  const row = raw as Record<string, unknown>;
  if (row.kind === "player") {
    const value = readPlayerReadiness(row.value);
    if (value) return { kind: "player", value };
    return;
  }
  if (row.kind === "ready" && typeof row.value === "boolean")
    return { kind: "ready", value: row.value };
  if (
    row.kind === "vote" &&
    (row.value === null ||
      (typeof row.value === "string" && row.value.length > 0 && row.value.length <= 600))
  )
    return { kind: "vote", value: row.value as string | null };
}
export function readParticipationState(raw: unknown): ParticipationState | undefined {
  if (!raw || typeof raw !== "object") return;
  const state = raw as ParticipationState;
  if (
    !Number.isSafeInteger(state.revision) ||
    state.revision < 0 ||
    !Array.isArray(state.people) ||
    state.people.length > 65
  )
    return;
  if (
    state.selection !== undefined &&
    (!Number.isSafeInteger(state.selection) || state.selection < 0)
  )
    return;
  const seen = new Set<string>(),
    people: RoomParticipant[] = [];
  for (const person of state.people) {
    if (
      !person ||
      typeof person.id !== "string" ||
      !person.id ||
      person.id.length > 160 ||
      seen.has(person.id) ||
      typeof person.ready !== "boolean" ||
      (person.vote !== undefined &&
        (typeof person.vote !== "string" || !person.vote || person.vote.length > 600))
    )
      return;
    const player = person.player === undefined ? undefined : readPlayerReadiness(person.player);
    if (person.player !== undefined && (!player || player.selection !== state.selection)) return;
    seen.add(person.id);
    people.push({
      id: person.id,
      ready: person.ready,
      ...(person.vote ? { vote: person.vote } : {}),
      ...(player ? { player } : {}),
    });
  }
  return {
    revision: state.revision,
    people,
    ...(state.selection !== undefined ? { selection: state.selection } : {}),
  };
}
/** Host-owned ephemeral room state. Transport identity, rather than a claimed
 * name or client-supplied ID, owns each readiness flag and latest vote. */
export class RoomParticipation {
  private revision = 0;
  private selection: number | undefined;
  setSelection(value: number) {
    if (
      !Number.isSafeInteger(value) ||
      value < 0 ||
      this.selection === value ||
      (this.selection !== undefined && value < this.selection)
    )
      return false;
    this.selection = value;
    for (const [id, row] of this.people)
      this.people.set(id, { id, ready: row.ready, ...(row.vote ? { vote: row.vote } : {}) });
    this.revision++;
    return true;
  }
  private people = new Map<string, RoomParticipant>();
  reconcile(members: readonly string[], queue: readonly string[]) {
    const allowed = new Set(members.slice(0, 65)),
      queued = new Set(queue.slice(0, 48));
    let changed = false;
    for (const id of this.people.keys())
      if (!allowed.has(id)) {
        this.people.delete(id);
        changed = true;
      }
    for (const id of allowed)
      if (!this.people.has(id)) {
        this.people.set(id, { id, ready: false });
        changed = true;
      }
    for (const [id, row] of this.people)
      if (row.vote && !queued.has(row.vote)) {
        this.people.set(id, { ...row, vote: undefined });
        changed = true;
      }
    if (changed) this.revision++;
    return changed;
  }
  apply(from: string, raw: unknown, queue: readonly string[]) {
    const row = this.people.get(from),
      action = readParticipationAction(raw);
    if (!row || !action) return false;
    if (action.kind === "player") {
      if (action.value.selection !== this.selection) return false;
      if (!samePlayerReadiness(row.player, action.value)) {
        this.people.set(from, { ...row, player: action.value });
        this.revision++;
      }
      return true;
    }
    if (action.kind === "vote" && action.value !== null && !queue.includes(action.value))
      return false;
    const next = {
      ...row,
      ...(action.kind === "ready" ? { ready: action.value } : { vote: action.value ?? undefined }),
    };
    if (next.ready === row.ready && next.vote === row.vote) return true;
    this.people.set(from, next);
    this.revision++;
    return true;
  }
  snapshot(): ParticipationState {
    return {
      revision: this.revision,
      people: [...this.people.values()],
      ...(this.selection !== undefined ? { selection: this.selection } : {}),
    };
  }
}
/** Equal vote counts keep the host's confirmed queue order. Votes never edit
 * that order automatically; the host chooses whether to prioritize a title. */
export function participationVotes(state: ParticipationState, queue: readonly string[]) {
  const counts = new Map<string, number>();
  for (const person of state.people)
    if (person.vote) counts.set(person.vote, (counts.get(person.vote) ?? 0) + 1);
  return queue
    .map((id, index) => ({ id, index, votes: counts.get(id) ?? 0 }))
    .filter((row) => row.votes > 0)
    .sort((a, b) => b.votes - a.votes || a.index - b.index);
}
