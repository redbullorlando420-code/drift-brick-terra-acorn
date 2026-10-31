import { registerHooks } from "node:module";
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { checkedOutputPath } from "./browser-guard.mjs";
import { runTwitchCanary, canaryResume } from "./twitch-canary-core.mjs";
// Only this explicit CLI loads server pull code. It is not an application poller.
const args = process.argv.slice(2),
  settings = { maxRequests: 12 },
  seen = new Set();
for (let i = 0; i < args.length; i++) {
  const key = args[i],
    value = args[++i];
  if (
    !["--creators", "--max-requests", "--out", "--resume"].includes(key) ||
    seen.has(key) ||
    !value
  )
    throw Error(
      "Use --creators login[,login] --max-requests 1..18 --out screenshots/report.json, or --resume screenshots/report.json.",
    );
  seen.add(key);
  if (key === "--creators") settings.creators = value.split(",");
  else if (key === "--max-requests") settings.maxRequests = Number(value);
  else settings[key.slice(2)] = value;
}
const output = checkedOutputPath(settings.out ?? "screenshots/twitch-canary.json", [
  resolve("screenshots"),
]);
let resume;
if (settings.resume) {
  const input = checkedOutputPath(realpathSync(settings.resume), [resolve("screenshots")]),
    text = readFileSync(input, "utf8");
  if (Buffer.byteLength(text) > 64000) throw Error("Canary report exceeds 64 KB.");
  resume = JSON.parse(text);
  canaryResume(resume);
}
if (!settings.creators && !resume)
  throw Error(
    "Choose one to three public creators explicitly; no followed-account list is loaded.",
  );
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const api = await import("../src/lib/remote/api.ts"),
  original = globalThis.fetch;
try {
  const report = await runTwitchCanary({
    ...settings,
    resume,
    fetcher: original,
    runTask: async (task, fetcher) => {
      globalThis.fetch = fetcher;
      if (task.scope === "live")
        return api.runRefreshRemotes({
          channels: [
            { id: "tw:" + task.creator, kind: "twitch", handle: task.creator, title: task.creator },
          ],
          twitchLiveOnly: true,
        });
      return api.runFollowRemote({
        kind: "twitch",
        query: task.creator,
        ...(task.scope === "clips"
          ? { twitchClipMode: "archive", clipLimit: 2 }
          : { twitchVodLimit: 100, clipLimit: 0 }),
      });
    },
  });
  writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.ok ? 0 : 2;
} finally {
  globalThis.fetch = original;
}
