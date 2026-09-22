import test from "node:test";
import assert from "node:assert/strict";
import { roomRelayConfig } from "../src/lib/multiplayer/relay-config.ts";

test("TURN configuration accepts bounded standard endpoints and relay-only policy", () => {
  const config = roomRelayConfig("turns:relay.example.com:5349?transport=tcp, turn:[::1]:3478", " guest ", "temporary", true);
  assert.equal(config.iceTransportPolicy, "relay");
  assert.equal(config.iceServers[0].username, "guest");
  assert.equal(config.iceServers[0].urls.length, 2);
  assert.equal(roomRelayConfig("turn:relay.example.com", "guest", "secret", false).iceTransportPolicy, "all");
});
test("TURN configuration rejects unsafe or malformed inputs", () => {
  for (const url of ["", "https://relay.example.com", "turn:user:pass@relay.example.com", "turn:relay.example.com:0", "turn:relay.example.com:65536", "turn:relay.example.com?token=secret"]) {
    assert.throws(() => roomRelayConfig(url, "guest", "secret", false));
  }
  assert.throws(() => roomRelayConfig("turn:relay.example.com", "", "secret", false));
  assert.throws(() => roomRelayConfig("turn:relay.example.com", "guest", "", false));
});
