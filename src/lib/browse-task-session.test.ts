import test from "node:test";
import assert from "node:assert/strict";
import {
  browseTaskSnapshot,
  subscribeBrowseTasks,
  installBrowseTaskActions,
  updateBrowseTaskSession,
  finishBrowseRestore,
  captureBrowseTask,
} from "./browse-task-session.ts";
import type { BrowseTask } from "./browse-tasks";
test("obsolete completion cannot consume a newer task; uninstall releases session state and actions", () => {
  const task: BrowseTask = {
    source: "home",
    query: "",
    sort: "name",
    view: "grid",
    private: false,
    scroll: 0,
    options: {},
  };
  let notices = 0;
  const unsubscribe = subscribeBrowseTasks(() => notices++),
    stop = installBrowseTaskActions({ move() {}, capture: () => task, open() {} });
  updateBrowseTaskSession({
    ready: true,
    restore: { ticket: 2, task, ready: true, note: "Source unavailable." },
  });
  finishBrowseRestore(1, "Old title restored");
  assert.equal(browseTaskSnapshot().restore?.ticket, 2);
  finishBrowseRestore(2, "Query retained.");
  assert.equal(browseTaskSnapshot().message, "Source unavailable. Query retained.");
  assert.equal(browseTaskSnapshot().restore, undefined);
  assert.equal(captureBrowseTask(), task);
  stop();
  assert.equal(browseTaskSnapshot().ready, false);
  assert.equal(browseTaskSnapshot().message, "");
  assert.throws(captureBrowseTask, /loading/);
  unsubscribe();
  assert(notices >= 3);
});
