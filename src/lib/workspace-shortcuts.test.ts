import test from "node:test";
import assert from "node:assert/strict";
import {
  spotifyShortcut,
  readSpotifyShortcuts,
  readTrackedPackages,
} from "./workspace-shortcuts.ts";
const playlist = "https://open.spotify.com/playlist/0123456789ABCDEFGHIJKL";
test("Spotify shortcuts accept official localized resources and remove tracking/duplicate variants", () => {
  assert.equal(spotifyShortcut(" " + playlist + "?si=test#track "), playlist);
  assert.equal(spotifyShortcut(playlist.replace("/playlist/", "/intl-de/playlist/")), playlist);
  assert.deepEqual(readSpotifyShortcuts(null, [playlist, playlist + "?si=other", null], playlist), {
    version: 2,
    selected: playlist,
    imports: [playlist],
  });
});
test("invalid Spotify schemes, lookalike hosts, credentials, malformed IDs and unsupported resources are rejected", () => {
  for (const value of [
    null,
    "javascript:alert(1)",
    "http://open.spotify.com/playlist/0123456789ABCDEFGHIJKL",
    "https://open.spotify.com.evil.test/playlist/0123456789ABCDEFGHIJKL",
    "https://user@open.spotify.com/playlist/0123456789ABCDEFGHIJKL",
    "https://open.spotify.com:444/playlist/0123456789ABCDEFGHIJKL",
    playlist.replace("playlist", "track"),
    playlist + "/extra",
    playlist.slice(0, -1),
  ])
    assert.equal(spotifyShortcut(value), undefined);
});
test("combined shortcuts restore the selected item atomically and preserve legacy records as read inputs", () => {
  const album = playlist.replace("playlist", "album");
  const value = { version: 2, selected: album, imports: [playlist, album] };
  assert.deepEqual(readSpotifyShortcuts(value, [], playlist), {
    version: 2,
    selected: album,
    imports: [album, playlist],
  });
  assert.deepEqual(value, { version: 2, selected: album, imports: [playlist, album] });
  assert.deepEqual(readSpotifyShortcuts(null, ["https://wrong.test"], null), {
    version: 2,
    selected: "",
    imports: [],
  });
});
test("shortcuts deduplicate before applying their existing fifty-item bound", () => {
  const rows = Array.from(
    { length: 60 },
    (_, i) => "https://open.spotify.com/artist/" + String(i).padStart(22, "0"),
  );
  assert.equal(readSpotifyShortcuts(null, [...rows, ...rows], null).imports.length, 50);
});
test("package recovery tolerates invalid collections/rows, preserves valid records and never mutates source data", () => {
  const item = {
    id: "kept",
    title: "My order",
    carrier: "UPS",
    tracking: "",
    status: "Shipped" as const,
  };
  const raw = [null, {}, item, { ...item, id: "second", status: "Unknown" }, { ...item }, []];
  const before = structuredClone(raw);
  assert.deepEqual(readTrackedPackages(raw), [item]);
  assert.deepEqual(raw, before);
  for (const value of [null, {}, "wrong", 1]) assert.deepEqual(readTrackedPackages(value), []);
});
