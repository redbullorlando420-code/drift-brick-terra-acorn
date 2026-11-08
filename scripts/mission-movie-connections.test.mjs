import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { MOVIE_CONNECTION_MISSIONS as missions } from "../src/lib/mission-movie-connections.ts";
import { mergeMissionPlan, MISSION_PLAN_REVISION } from "../src/lib/mission-plan.ts";
test("three explicit movie delivery briefs append without altering the fixed roadmap", () => {
  assert.equal(MISSION_PLAN_REVISION, 105);
  assert.equal(missions.length, 3);
  assert.equal(new Set(missions.map((m) => m.id)).size, 3);
  for (const m of missions) {
    assert(!m.id.startsWith("next-"));
    assert(m.done);
    assert.equal(m.status, "complete");
    assert.equal(m.brief.steps.length, 3);
    assert.equal(m.brief.acceptance.length, 2);
    for (const file of m.brief.files) assert(existsSync(new URL("../" + file, import.meta.url)));
    for (const dep of m.brief.dependsOn) assert(missions.some((row) => row.id === dep));
  }
});
test("revision 99 promotes only movie connections once and preserves prior manual reopens and notes", () => {
  const old = { id: "next-151", title: "Reopened", detail: "Keep", done: false, status: "blocked" },
    custom = {
      id: "custom",
      title: "My work",
      detail: "My exact notes",
      done: false,
      status: "in-progress",
    };
  const defaults = [...missions, old],
    saved = [{ ...missions[0], done: false, status: "planned" }, old, custom];
  const migrated = mergeMissionPlan(saved, defaults, 98);
  assert.equal(migrated.length, 5);
  assert.equal(migrated.filter((m) => m.id.startsWith("movie-connect-") && m.done).length, 3);
  assert.equal(migrated.find((m) => m.id === old.id).status, "blocked");
  assert.deepEqual(
    migrated.find((m) => m.id === custom.id),
    custom,
  );
  const reopened = migrated.map((m) =>
    m.id === missions[0].id ? { ...m, done: false, status: "in-progress" } : m,
  );
  assert.equal(
    mergeMissionPlan(reopened, defaults, 99).find((m) => m.id === missions[0].id).status,
    "in-progress",
  );
  assert.deepEqual(mergeMissionPlan(reopened, defaults, 99), reopened);
});
