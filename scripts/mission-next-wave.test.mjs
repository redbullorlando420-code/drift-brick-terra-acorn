import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { NEXT_WAVE_MISSIONS, NEXT_WAVE_TRACKS } from "../src/lib/mission-next-wave.ts";
import {
  ALL_NEXT_LEVEL_MISSIONS,
  ALL_NEXT_LEVEL_TRACKS,
  missionMatchesBatch,
} from "../src/lib/mission-roadmap.ts";
import {
  NEXT_LEVEL_MISSIONS,
  formatMissionBrief,
  formatNextLevelRoadmap,
} from "../src/lib/mission-next-level.ts";
import {
  mergeMissionPlan,
  MISSION_PLAN_REVISION,
  NEXT_LEVEL_COMPLETED_IDS,
  NEXT_WAVE_COMPLETED_IDS,
} from "../src/lib/mission-plan.ts";

test("100 append-only milestones retain evidenced completions across 20 roadmap tracks", () => {
  assert.equal(NEXT_WAVE_MISSIONS.length, 100);
  assert.equal(ALL_NEXT_LEVEL_MISSIONS.length, 200);
  assert.equal(NEXT_WAVE_TRACKS.length, 10);
  assert.equal(new Set(ALL_NEXT_LEVEL_TRACKS).size, 20);
  assert.equal(new Set(ALL_NEXT_LEVEL_MISSIONS.map((m) => m.id)).size, 200);
  assert.equal(new Set(ALL_NEXT_LEVEL_MISSIONS.map((m) => m.title.toLowerCase())).size, 200);
  for (const track of NEXT_WAVE_TRACKS)
    assert.equal(NEXT_WAVE_MISSIONS.filter((m) => m.brief.track === track).length, 10);
  for (const [i, m] of NEXT_WAVE_MISSIONS.entries()) {
    assert.equal(m.id, "next-" + String(i + 101).padStart(3, "0"));
    const verified = NEXT_WAVE_COMPLETED_IDS.includes(m.id);
    assert.equal(m.done, verified);
    assert.equal(m.status, verified ? "complete" : "planned");
    assert(m.detail.length >= 45, m.id);
    assert(["P0", "P1", "P2"].includes(m.brief.priority));
    assert.equal(m.brief.steps.length, 3);
    assert.equal(m.brief.acceptance.length, 2);
    for (const step of m.brief.steps) assert(step.length >= 55, m.id + ": short step " + step);
    for (const check of m.brief.acceptance)
      assert(check.length >= 50, m.id + ": short check " + check);
    assert(m.brief.files.length >= 2);
    for (const file of m.brief.files)
      assert(existsSync(new URL("../" + file, import.meta.url)), m.id + ": missing " + file);
  }
  assert.equal(new Set(NEXT_WAVE_MISSIONS.flatMap((m) => m.brief.steps)).size, 300);
  assert.equal(new Set(NEXT_WAVE_MISSIONS.flatMap((m) => m.brief.acceptance)).size, 200);
  assert.equal(NEXT_LEVEL_COMPLETED_IDS.length, 96);
  assert.deepEqual(NEXT_WAVE_COMPLETED_IDS, ['next-101', 'next-105', 'next-106', 'next-108', 'next-111']);
  assert.equal(ALL_NEXT_LEVEL_MISSIONS.filter((m) => m.done).length, 101);
});

test("every dependency exists, is distinct and precedes its dependent milestone", () => {
  const positions = new Map(ALL_NEXT_LEVEL_MISSIONS.map((m, i) => [m.id, i]));
  for (const [i, m] of ALL_NEXT_LEVEL_MISSIONS.entries()) {
    assert.equal(new Set(m.brief.dependsOn).size, m.brief.dependsOn.length, m.id);
    for (const id of m.brief.dependsOn)
      assert(positions.has(id) && positions.get(id) < i, m.id + ": invalid dependency " + id);
  }
});

test("the new batch appends exactly once and preserves old manual decisions and custom notes", () => {
  assert.equal(MISSION_PLAN_REVISION, 87);
  const custom = {
    id: "custom-preserved",
    title: "My roadmap",
    detail: "Keep my exact notes",
    done: false,
    status: "blocked",
  };
  const old = NEXT_LEVEL_MISSIONS.map((m) =>
    m.id === "next-010" ? { ...m, done: false, status: "blocked" } : structuredClone(m),
  );
  const saved = [...old, custom];
  const before = JSON.stringify(saved);
  const merged = structuredClone(mergeMissionPlan(saved, ALL_NEXT_LEVEL_MISSIONS, 83));
  assert.equal(merged.length, 201);
  assert.deepEqual(merged.slice(0, 101), saved);
  assert.deepEqual(merged.slice(101), NEXT_WAVE_MISSIONS);
  assert.equal(JSON.stringify(saved), before);
  merged.find((m) => m.id === "next-101").status = "in-progress";
  merged.find((m) => m.id === "next-101").done = false;
  merged.find((m) => m.id === "next-102").done = true;
  merged.find((m) => m.id === "next-102").status = "complete";
  const reloaded = mergeMissionPlan(structuredClone(merged), ALL_NEXT_LEVEL_MISSIONS, 87);
  assert.deepEqual(reloaded, merged);
  assert.equal(reloaded.find((m) => m.id === "next-010").status, "blocked");
});

test("new-batch filters use exact membership and preserve the historical first batch", () => {
  assert.equal(ALL_NEXT_LEVEL_MISSIONS.filter((m) => missionMatchesBatch(m.id, "new")).length, 100);
  assert.equal(
    ALL_NEXT_LEVEL_MISSIONS.filter((m) => missionMatchesBatch(m.id, "first")).length,
    100,
  );
  assert(missionMatchesBatch("custom-idea", "all"));
  for (const id of ["custom-idea", "next-201", "next-101-copy"]) {
    assert.equal(missionMatchesBatch(id, "new"), false);
    assert.equal(missionMatchesBatch(id, "first"), false);
  }
});

test("new-batch exports resolve old dependencies and retain current status and external requirements", () => {
  const context = ALL_NEXT_LEVEL_MISSIONS.map((m) =>
    m.id === "next-010" ? { ...m, done: false, status: "blocked" } : m,
  );
  const text = formatNextLevelRoadmap(NEXT_WAVE_MISSIONS, context);
  assert(text.includes("# Realhub — 100 next-level milestones"));
  assert(text.includes("next-010 — Portable profile boundaries [blocked]"));
  assert.equal(text.includes("resolve this prerequisite"), false);
  assert.equal((text.match(/^# next-\d{3} — /gm) ?? []).length, 100);
  for (const m of NEXT_WAVE_MISSIONS.filter((m) => m.brief.external)) {
    const brief = formatMissionBrief(m, context);
    assert(brief.includes(m.brief.external));
    assert(brief.includes("Do not claim this external requirement passed from fixtures alone."));
  }
});

test("checked-in new and combined roadmaps reproduce from the executable definitions", () => {
  assert.equal(
    readFileSync(new URL("../NEXT_100_MILESTONES.md", import.meta.url), "utf8"),
    formatNextLevelRoadmap(NEXT_WAVE_MISSIONS, ALL_NEXT_LEVEL_MISSIONS),
  );
  const combined = formatNextLevelRoadmap(ALL_NEXT_LEVEL_MISSIONS);
  assert.equal(
    readFileSync(new URL("../ROADMAP_200_MILESTONES.md", import.meta.url), "utf8"),
    combined,
  );
  assert.equal((combined.match(/^# next-\d{3} — /gm) ?? []).length, 200);
  assert(combined.startsWith("# Realhub — 200 next-level milestones"));
});
