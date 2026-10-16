import assert from "node:assert/strict";
import test from "node:test";
import { shareableRoomInvite } from "./room-invite.ts";

test("a localhost room invite cannot be copied as a cross-device link", () => {
  for (const origin of ["http://localhost:8080", "http://127.0.0.1:8080", "http://[::1]:8080"])
    assert.equal(shareableRoomInvite(origin, "/", "RCE804F"), null);
});

test("a network room invite preserves the reachable app origin", () => {
  assert.equal(
    shareableRoomInvite("http://192.168.1.68:8080", "/", "RCE804F"),
    "http://192.168.1.68:8080/?room=RCE804F&theater=1",
  );
});

test("QR invitations retain the selected room, clear old parameters and reject local or unsafe addresses", () => {
  assert.equal(
    shareableRoomInvite("https://room.example", "/library?old=1#search", "RCABCD"),
    "https://room.example/library?room=RCABCD&theater=1",
  );
  for (const origin of [
    "http://127.0.0.2:8080",
    "http://0.0.0.0:8080",
    "https://user:password@room.example",
    "javascript:alert(1)",
    "http://test.localhost",
  ])
    assert.equal(shareableRoomInvite(origin, "/", "RCABCD"), null);
  assert.equal(shareableRoomInvite("https://room.example", "/", "bad code"), null);
});
