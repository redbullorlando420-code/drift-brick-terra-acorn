import test from "node:test";
import assert from "node:assert/strict";
import {
  captionLanguage,
  readRoomCaptionPreference,
  roomCaptionTracks,
  applyRoomCaptions,
  youtubeCaptionParameters,
} from "../src/lib/multiplayer/room-device-captions.ts";
const tracks = () => [
  { kind: "metadata", language: "en", label: "Metadata", mode: "hidden" },
  { kind: "subtitles", language: "en", label: "English", mode: "disabled" },
  { kind: "captions", language: "es-MX", label: "Español", mode: "disabled" },
];
test("caption preferences validate bounded language codes and malformed storage", () => {
  for (const raw of [null, undefined, 42, "bad", {}, { enabled: "yes", language: "<script>" }])
    assert.deepEqual(readRoomCaptionPreference(raw), { enabled: false, language: "" });
  assert.equal(captionLanguage(" pt-BR "), "pt-br");
  assert.equal(captionLanguage(""), "");
  assert.equal(captionLanguage("en_US"), undefined);
  assert.equal(captionLanguage("a".repeat(36)), undefined);
  assert.deepEqual(readRoomCaptionPreference({ enabled: true, language: "es" }), {
    enabled: true,
    language: "es",
  });
});
test("native caption inventory excludes metadata, bounds labels and rows", () => {
  assert.deepEqual(
    roomCaptionTracks(tracks()).map((t) => t.label),
    ["English", "Español"],
  );
  assert.equal(
    roomCaptionTracks(
      Array.from({ length: 100 }, () => ({
        kind: "captions",
        label: "x".repeat(200),
        language: "en",
        mode: "disabled",
      })),
    ).length,
    32,
  );
  assert.equal(
    roomCaptionTracks([
      { kind: "captions", label: "x".repeat(200), language: "en", mode: "disabled" },
    ])[0].label.length,
    100,
  );
});
test("native caption selection matches exact/base language, falls back, toggles without touching metadata", () => {
  const list = tracks();
  applyRoomCaptions(list, { enabled: true, language: "es" });
  assert.deepEqual(
    list.map((t) => t.mode),
    ["hidden", "disabled", "showing"],
  );
  applyRoomCaptions(list, { enabled: true, language: "en" });
  assert.equal(list[1].mode, "showing");
  assert.equal(list[2].mode, "disabled");
  applyRoomCaptions(list, { enabled: true, language: "fr" });
  assert.equal(list[1].mode, "showing");
  applyRoomCaptions(list, { enabled: false, language: "en" });
  assert.deepEqual(
    list.map((t) => t.mode),
    ["hidden", "disabled", "disabled"],
  );
  applyRoomCaptions([], { enabled: true, language: "en" });
});
test("YouTube uses documented load preferences and never promises a force-off parameter", () => {
  const url = new URL(
    "https://www.youtube.com/embed/abc?enablejsapi=1&cc_load_policy=1&cc_lang_pref=es",
  );
  youtubeCaptionParameters(url, { enabled: false, language: "en" });
  assert.equal(url.searchParams.get("cc_load_policy"), null);
  assert.equal(url.searchParams.get("cc_lang_pref"), null);
  assert.equal(url.searchParams.get("enablejsapi"), "1");
  youtubeCaptionParameters(url, { enabled: true, language: "pt-br" });
  assert.equal(url.searchParams.get("cc_load_policy"), "1");
  assert.equal(url.searchParams.get("cc_lang_pref"), "pt-br");
});
