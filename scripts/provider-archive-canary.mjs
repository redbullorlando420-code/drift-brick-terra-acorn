import { registerHooks } from "node:module";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkedOutputPath } from "./browser-guard.mjs";
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
if (process.argv[2] !== "--public") throw Error("Pass --public to make the bounded public provider reads.");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/provider-archive-canary.json", [resolve("screenshots")]);
const { twitchUser } = await import("../src/lib/remote/api.ts");
const { youtubeUploadsArchive } = await import("../src/lib/remote/youtube-browse.ts");
const { resolveYoutubeCreator } = await import("../src/lib/remote/youtube-resolve.ts");
const observations = [];
for (const [id, run] of [
  ["twitch-archive", async signal => {
    const first = await twitchUser("twitch", null, 12, "ARCHIVE", signal);
    if (!first?.id || first.videos?.providerError || !Array.isArray(first.videos?.edges)) throw Error("Unreadable Twitch archive");
    const second = await twitchUser("twitch", null, 12, "ARCHIVE", signal);
    if (second?.id !== first.id || second.videos?.providerError || !Array.isArray(second.videos?.edges)) throw Error("Unreadable Twitch recheck");
    const a = first.videos.edges.map(row => row.node?.id), b = second.videos.edges.map(row => row.node?.id);
    if (!a.length || !b.length) throw Error("No public archive rows in the sample");
    return { firstRows:a.length, secondRows:b.length, changedOrder:a.join()!==b.join(), newIdentities:b.filter(id=>!a.includes(id)).length };
  }],
  ["youtube-catalog", async signal => {
    const id = await resolveYoutubeCreator("@YouTube", undefined, signal);
    const page = await youtubeUploadsArchive(id, 30, undefined, undefined, { maxPages:1, signal });
    if (!page?.rows.length || page.failure) throw Error("Unreadable YouTube catalog");
    return { rows:page.rows.length, continuationObserved:!!page.cursor };
  }],
]) {
  const at = Date.now();
  try { observations.push({ id, at, status:"observed", ...await run(AbortSignal.timeout(20_000)) }); }
  catch (error) {
    const status = /\b(403|429|503)\b/.exec(String(error))?.[1];
    observations.push({ id, at, status:"unavailable", reason:status ? "HTTP "+status :
      error?.name === "TimeoutError" ? "timeout" : /unreadable|no public/i.test(String(error)) ? "unverified response" : "connection or provider failure" });
  }
}
const report = { version:1, scope:"Two fixed public channels; no account, cookies, titles or cursors recorded.", observations };
writeFileSync(output, JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
