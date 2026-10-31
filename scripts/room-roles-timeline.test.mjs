import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { ROOM_ROLES, roomRoleFor, roomIntentAccess } from "../src/lib/multiplayer/room-roles.ts";
import {
  connectionSteps,
  recordConnectionSteps,
  roomConnectionDiagnostic,
} from "../src/lib/multiplayer/room-connection-timeline.ts";
const base = {
  signaling: "online",
  peers: 1,
  ice: "connected",
  transport: true,
  relay: false,
  handshake: true,
  guest: true,
  player: "loading",
};
test("presets preserve independent authority and never contain catalog/local access grants", () => {
  for (const [role, preset] of Object.entries(ROOM_ROLES)) {
    assert.equal(roomRoleFor(preset.permissions), role);
    assert.deepEqual(Object.keys(preset.permissions).sort(), [
      "playback",
      "queue",
      "review",
      "seeking",
    ]);
  }
  assert.equal(roomRoleFor({ ...ROOM_ROLES.viewer.permissions, seeking: true }), "custom");
  for (const type of [
    "queue-action",
    "video-request",
    "next-request",
    "local-stage-request",
    "queue-shuffle",
  ])
    assert.equal(
      roomIntentAccess(ROOM_ROLES.viewer.permissions, 2, { type, permissionRevision: 2 }).allowed,
      false,
    );
  assert(
    roomIntentAccess(ROOM_ROLES.contributor.permissions, 2, {
      type: "queue-suggest",
      permissionRevision: 2,
    }).allowed,
  );
  assert(
    !roomIntentAccess(ROOM_ROLES.contributor.permissions, 2, {
      type: "queue-action",
      permissionRevision: 2,
    }).allowed,
  );
  for (const role of ["viewer", "contributor"])
    assert(
      !roomIntentAccess(ROOM_ROLES[role].permissions, 2, {
        type: "sync-request",
        permissionRevision: 2,
      }).allowed,
    );
  assert(
    roomIntentAccess(ROOM_ROLES.controller.permissions, 2, {
      type: "queue-action",
      permissionRevision: 2,
    }).allowed,
  );
  assert(
    !roomIntentAccess(
      ROOM_ROLES.controller.permissions,
      2,
      { type: "sync-request", permissionRevision: 2, seek: true },
      true,
    ).allowed,
  );
});
test("old and missing permission revisions cannot authorize a mutation after revoke and regrant", () => {
  for (const type of [
    "sync-request",
    "queue-suggest",
    "queue-action",
    "queue-edit",
    "queue-batch",
    "queue-shuffle",
    "queue-request",
    "next-request",
    "video-request",
    "local-queue-request",
    "local-stage-request",
  ]) {
    for (const revision of [undefined, 0, 1, 2, -1, NaN, "3", null]) {
      const result = roomIntentAccess(ROOM_ROLES.controller.permissions, 3, {
        type,
        permissionRevision: revision,
      });
      assert.equal(result.allowed, false, type);
      assert.match(result.reason, /controls changed/);
    }
    assert(
      roomIntentAccess(ROOM_ROLES.controller.permissions, 0, { type }).allowed ||
        type === "queue-suggest",
    );
  }
  assert(roomIntentAccess(ROOM_ROLES.viewer.permissions, 3, { type: "chat" }).allowed);
});
test("a blocked or failing player never changes signaling, ICE, data or accepted handshake evidence", () => {
  for (const player of ["loading", "blocked", "buffering", "error", "unsupported", "waiting"]) {
    const steps = connectionSteps({ ...base, player });
    assert(steps.slice(0, 4).every((s) => s.state === "ready"));
    assert.notEqual(steps[4].state, "ready");
  }
  assert.equal(connectionSteps({ ...base, player: "playing" })[4].state, "ready");
  assert.equal(connectionSteps({ ...base, signaling: "retrying" })[0].state, "attention");
  assert.equal(
    connectionSteps({ ...base, ice: "failed", transport: false, handshake: false })[1].state,
    "attention",
  );
  assert.equal(connectionSteps({ ...base, transport: false, relay: true })[2].state, "ready");
  assert.equal(
    connectionSteps({ ...base, transport: false, transportFailed: true })[2].state,
    "attention",
  );
  assert.equal(connectionSteps({ ...base, handshake: false })[3].state, "working");
});
test("timeline captures only changed stages, retains 24 transitions and does not store heartbeats", () => {
  let events = recordConnectionSteps([], connectionSteps(base), 1000);
  assert.equal(events.length, 5);
  const same = recordConnectionSteps(events, connectionSteps(base), 2000);
  assert.equal(same, events);
  for (let i = 0; i < 100; i++)
    events = recordConnectionSteps(
      events,
      connectionSteps({ ...base, player: i % 2 ? "playing" : "buffering" }),
      3000 + i,
    );
  assert.equal(events.length, 24);
  assert.equal(events.at(-1).stage, "player");
});
test("diagnostic allowlist excludes nested secrets, titles, paths, raw events and invitation/peer identities", () => {
  const secret = "CANARY-DO-NOT-EXPORT",
    input = {
      ...base,
      room: secret,
      invitation: secret,
      peers: Infinity,
      name: secret,
      relayConfig: { credential: secret },
      player: "blocked",
    };
  const events = [
    { stage: "player", state: "attention", at: 1000, detail: secret },
    { stage: secret, state: "ready", at: 1000 },
    { stage: "player", state: secret, at: 1000 },
  ];
  const diagnostic = roomConnectionDiagnostic(input, events, 999, NaN, 2000),
    text = JSON.stringify(diagnostic);
  assert(!text.includes(secret));
  assert.equal(diagnostic.events.length, 1);
  assert.equal(diagnostic.queue.count, 200);
  assert.equal(diagnostic.queue.revision, 0);
  assert.equal(diagnostic.peers, 0);
  assert.equal(diagnostic.stages.length, 5);
});

registerHooks({
  resolve(s, c, n) {
    if (s === "../periodic-work.ts" && c.parentURL?.endsWith("/p2p.ts"))
      return {
        shortCircuit: true,
        url: "data:text/javascript,export function registerPeriodicTask(){return {cancel(){}}}",
      };
    return n(s, c);
  },
});
const { P2PRoom } = await import("../src/lib/multiplayer/p2p.ts");
test("real signaling retry reports failure/recovery, serializes polls and preserves healthy peer channels", async () => {
  const original = {
    fetch: globalThis.fetch,
    window: globalThis.window,
    pc: globalThis.RTCPeerConnection,
    bc: globalThis.BroadcastChannel,
    now: Date.now,
  };
  const pcs = [],
    states = [];
  let at = 10000,
    calls = 0,
    holdResolve;
  class PC {
    constructor() {
      if (pcs.length >= 4) throw Error("Unbounded peer recreation");
      this.connectionState = "new";
      this.iceConnectionState = "new";
      this.channels = [];
      this.closed = false;
      pcs.push(this);
    }
    getSenders() {
      return [];
    }
    createDataChannel(label) {
      const c = { label, readyState: "connecting", send() {} };
      this.channels.push(c);
      return c;
    }
    close() {
      this.closed = true;
      this.connectionState = "closed";
    }
    restartIce() {}
    async getStats() {
      return new Map();
    }
  }
  try {
    Date.now = () => at;
    globalThis.window = { addEventListener() {}, removeEventListener() {} };
    globalThis.RTCPeerConnection = PC;
    globalThis.BroadcastChannel = undefined;
    globalThis.fetch = async (url, init) => {
      if (init?.method === "POST") return new Response("{}");
      calls++;
      if (calls === 1) throw Error("Synthetic offline");
      if (calls === 3) await new Promise((r) => (holdResolve = r));
      return Response.json({
        peers: [
          { id: "z", name: "host" },
          { id: "a", name: "guest" },
          { id: "b", name: "other" },
        ],
        signals: [],
      });
    };
    const room = new P2PRoom({
      room: "secret-room",
      selfId: "z",
      iceServers: [],
      onSignalingState: (s) => states.push(s),
    });
    try {
      await room.join();
      assert.deepEqual(states, ["retrying"]);
      room.retrySignaling();
      await new Promise((r) => setTimeout(r, 20));
      assert.deepEqual(states, ["retrying", "online"]);
      assert.equal(pcs.length, 2);
      const healthy = pcs[0];
      healthy.connectionState = "connected";
      healthy.iceConnectionState = "connected";
      healthy.onconnectionstatechange();
      const channel = healthy.channels.find((c) => c.label === "reliable");
      channel.readyState = "open";
      channel.onopen();
      assert(room.peerList().find((p) => p.id === "a").reliableReady);
      pcs[1].connectionState = "failed";
      at += 3000;
      room.retryPeers();
      await new Promise((r) => setTimeout(r, 20));
      assert.equal(pcs.length, 3);
      assert.equal(healthy.closed, false);
      assert.equal(pcs[1].closed, true);
      at += 3000;
      room.retrySignaling();
      await new Promise((r) => setTimeout(r, 10));
      assert.equal(calls, 3, "manual retry cannot overlap an in-flight roster poll");
      holdResolve();
      await new Promise((r) => setTimeout(r, 10));
      healthy.connectionState = "failed";
      channel.readyState = "open";
      at += 3000;
      room.retryPeers();
      assert.equal(healthy.closed, true, "a stale open channel cannot hide a failed peer path");
      assert.equal(pcs.length, 4);
    } finally {
      room.close();
      holdResolve?.();
    }
  } finally {
    globalThis.fetch = original.fetch;
    globalThis.window = original.window;
    globalThis.RTCPeerConnection = original.pc;
    globalThis.BroadcastChannel = original.bc;
    Date.now = original.now;
  }
});
