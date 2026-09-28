import assert from "node:assert/strict";
import test from "node:test";
import { shareableRoomInvite } from "./room-invite.ts";

test("a localhost room invite cannot be copied as a cross-device link", () => {
  for (const origin of ["http://localhost:8080", "http://127.0.0.1:8080", "http://[::1]:8080"])
    assert.equal(shareableRoomInvite(origin, "/", "RCE804F"), null);
});

test("a network room invite preserves the reachable app origin", () => {
  assert.equal(shareableRoomInvite("http://192.168.1.68:8080", "/", "RCE804F"), "http://192.168.1.68:8080/?room=RCE804F&theater=1");
});
