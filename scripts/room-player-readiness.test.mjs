import test from "node:test";
import assert from "node:assert/strict";
import {
  readPlayerReadiness,
  samePlayerReadiness,
  observePlayerReadiness,
  PLAYER_STATES,
  PLAYER_LABELS,
  playerReadinessHelp,
  playerNeedsHelp,
} from "../src/lib/multiplayer/room-player-readiness.ts";
import {
  RoomParticipation,
  readParticipationState,
  readParticipationAction,
  participationVotes,
} from "../src/lib/multiplayer/room-participation.ts";
const report = (status = "playing", selection = 3) => ({
  selection,
  status,
  capability: "youtube",
});
const room = () => {
  const model = new RoomParticipation();
  model.setSelection(3);
  model.reconcile(["host", "guest"], ["a", "b"]);
  return model;
};
test("readiness wire data is a strict bounded whitelist without telemetry, names, paths or credentials", () => {
  assert.deepEqual(
    readPlayerReadiness({
      ...report(),
      name: "SECRET",
      position: 99,
      path: "C:/SECRET",
      videoId: "SECRET",
      token: "SECRET",
    }),
    report(),
  );
  for (const value of [
    null,
    {},
    [],
    { ...report(), status: "hacked" },
    { ...report(), capability: "device fingerprint" },
    { ...report(), selection: -1 },
    { ...report(), selection: Infinity },
    { ...report(), selection: 2.2 },
  ])
    assert.equal(readPlayerReadiness(value), undefined);
  for (const status of PLAYER_STATES) {
    assert(readPlayerReadiness(report(status)));
    assert(PLAYER_LABELS[status]);
    assert(playerReadinessHelp(status).length > 25);
  }
  assert.equal(
    readParticipationAction({ kind: "player", value: { ...report(), token: "SECRET" } }).value
      .token,
    undefined,
  );
});
test("player readiness preserves blocked/error and observed playback against incidental ready signals", () => {
  for (const status of ["blocked", "error", "playing", "buffering", "paused", "ended"])
    assert.equal(observePlayerReadiness(status, "ready"), status);
  for (const status of ["blocked", "error"])
    for (const next of ["loading", "buffering", "paused"])
      assert.equal(observePlayerReadiness(status, next), status);
  assert.equal(observePlayerReadiness("loading", "ready"), "ready");
  assert.equal(observePlayerReadiness("blocked", "playing"), "playing");
  assert.equal(observePlayerReadiness("playing", "buffering"), "buffering");
  for (const state of ["ready", "paused", "ended"]) {
    assert(playerNeedsHelp(state, true));
    assert(!playerNeedsHelp(state, false));
  }
  assert(playerNeedsHelp("blocked", false));
  assert(!playerNeedsHelp("playing", true));
});
test("manual ready and queue votes remain independent of actual blocked, buffering and playing reports", () => {
  const model = room();
  model.apply("guest", { kind: "ready", value: true }, ["a", "b"]);
  model.apply("guest", { kind: "vote", value: "b" }, ["a", "b"]);
  for (const status of ["blocked", "playing", "buffering", "error"]) {
    model.apply("guest", { kind: "player", value: report(status) }, ["a", "b"]);
    const guest = model.snapshot().people.find((p) => p.id === "guest");
    assert.equal(guest.ready, true);
    assert.equal(guest.vote, "b");
    assert.equal(guest.player.status, status);
  }
  assert.deepEqual(participationVotes(model.snapshot(), ["a", "b"]), [
    { id: "b", index: 1, votes: 1 },
  ]);
});
test("title changes clear only media readiness and reject delayed or future reports from connected peers", () => {
  const model = room();
  model.apply("guest", { kind: "ready", value: true }, []);
  model.apply("guest", { kind: "player", value: report() }, []);
  model.setSelection(4);
  assert.equal(model.snapshot().people.find((p) => p.id === "guest").player, undefined);
  assert.equal(model.snapshot().people.find((p) => p.id === "guest").ready, true);
  assert.equal(model.apply("guest", { kind: "player", value: report("playing", 3) }, []), false);
  assert.equal(model.apply("guest", { kind: "player", value: report("playing", 5) }, []), false);
  assert.equal(model.apply("outsider", { kind: "player", value: report("playing", 4) }, []), false);
  assert(model.apply("guest", { kind: "player", value: report("loading", 4) }, []));
  assert.equal(model.setSelection(4), false);
  assert.equal(model.setSelection(2), false);
  assert.equal(model.snapshot().selection, 4);
});
test("repeated player observations do not grow participation revisions or history", () => {
  const model = room();
  model.apply("guest", { kind: "player", value: report() }, []);
  const before = model.snapshot();
  for (let i = 0; i < 10000; i++)
    assert(model.apply("guest", { kind: "player", value: report() }, []));
  assert.deepEqual(model.snapshot(), before);
  assert(samePlayerReadiness(before.people[1].player, report()));
  assert(!samePlayerReadiness(report(), report("blocked")));
});
test("queue consumption retains player observations, departure drops them and roster size stays bounded", () => {
  const model = room();
  model.apply("guest", { kind: "vote", value: "a" }, ["a"]);
  model.apply("guest", { kind: "player", value: report() }, []);
  model.reconcile(["host", "guest"], []);
  assert.equal(model.snapshot().people[1].vote, undefined);
  assert.equal(model.snapshot().people[1].player.status, "playing");
  model.reconcile(["host"], []);
  assert.equal(model.snapshot().people.length, 1);
  model.reconcile(["host", "guest"], []);
  assert.equal(model.snapshot().people[1].player, undefined);
  assert.equal(model.snapshot().people[1].ready, false);
  model.reconcile(
    Array.from({ length: 1000 }, (_, i) => "peer-" + i),
    [],
  );
  assert.equal(model.snapshot().people.length, 65);
});
test("participation state validates generation-scoped player data and remains compatible with old manual-only clients", () => {
  const model = room();
  model.apply("guest", { kind: "player", value: report() }, []);
  const state = model.snapshot();
  assert.deepEqual(readParticipationState(state), state);
  assert.equal(readParticipationState({ ...state, selection: 4 }), undefined);
  assert.equal(readParticipationState({ ...state, selection: -1 }), undefined);
  assert.equal(
    readParticipationState({ ...state, people: [...state.people, { ...state.people[1] }] }),
    undefined,
  );
  assert.deepEqual(
    readParticipationState({ revision: 1, people: [{ id: "old-client", ready: true }] }),
    { revision: 1, people: [{ id: "old-client", ready: true }] },
  );
  assert.doesNotMatch(
    JSON.stringify(readParticipationState({ ...state, token: "SECRET" })),
    /SECRET/,
  );
});
test("invalid and no-op reports cannot alter manual choices or the queue, and each participant owns only their report", () => {
  const model = room(),
    queue = ["a", "b"];
  model.apply("host", { kind: "player", value: report("ready") }, queue);
  const before = model.snapshot();
  assert.equal(
    model.apply("guest", { kind: "player", value: { ...report(), selection: "3" } }, queue),
    false,
  );
  assert.deepEqual(model.snapshot(), before);
  model.apply(
    "guest",
    { kind: "player", id: "host", value: { ...report("blocked"), peerId: "host" } },
    queue,
  );
  assert.equal(model.snapshot().people.find((p) => p.id === "host").player.status, "ready");
  assert.equal(model.snapshot().people.find((p) => p.id === "guest").player.status, "blocked");
  assert.deepEqual(queue, ["a", "b"]);
  assert(model.snapshot().people.every((p) => !p.ready));
});
