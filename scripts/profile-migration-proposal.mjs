/** Read-only proposal generator. Does not edit or execute application sources. */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { createTwoFilesPatch } from "diff";
const applied = await readFile(".grok/profile-applied-manifest.json", "utf8").then(
  () => true,
  (error) => {
    if (error.code === "ENOENT") return false;
    throw error;
  },
);
if (applied)
  throw Error(
    "The reviewed migration is already applied. Its approval artifact must not be regenerated from migrated sources.",
  );
const root = resolve("."),
  files = [];
async function walk(dir) {
  for (const entry of await readdir(resolve(root, dir), { withFileTypes: true })) {
    const p = dir + "/" + entry.name;
    if (entry.isDirectory()) await walk(p);
    else if (
      /\.tsx?$/.test(p) &&
      !p.includes(".test.") &&
      ![
        "src/lib/local-profile-storage.ts",
        "src/lib/local-profiles.ts",
        "src/lib/auth/client.ts",
      ].includes(p)
    )
      files.push(p);
  }
}
await walk("src");
const proposed = new Map(),
  original = new Map();
for (const f of files) {
  let text = await readFile(f, "utf8");
  original.set(f, text);
  const local = /\blocalStorage\s*\./.test(text),
    session = /\bsessionStorage\s*\./.test(text);
  if (!local && !session) continue;
  text = text.replace(/\b(?:window|globalThis)\.(localStorage|sessionStorage)\b/g, "$1");
  let rel = relative(dirname(resolve(f)), resolve("src/lib/local-profile-storage.ts")).replaceAll(
    "\\",
    "/",
  );
  if (!rel.startsWith(".")) rel = "./" + rel;
  proposed.set(
    f,
    "import {" +
      [
        local ? "profileLocalStorage as localStorage" : "",
        session ? "profileSessionStorage as sessionStorage" : "",
      ]
        .filter(Boolean)
        .join(", ") +
      "} from " +
      JSON.stringify(rel) +
      ";\n" +
      text,
  );
}
const change = async (f, fn) => {
  const before = proposed.get(f) ?? (await readFile(f, "utf8"));
  if (!original.has(f)) original.set(f, before);
  const after = fn(before);
  if (after === before) throw Error("Proposal pattern did not match " + f);
  proposed.set(f, after);
};
await change(
  "src/lib/videos/persist.ts",
  (s) =>
    "import {profileDatabaseName,assertProfileContext} from '../local-profile-storage.ts';\n" +
    s
      .replace('const DB_NAME = "reelcase";', 'const DB_NAME = profileDatabaseName("reelcase");')
      .replace(
        "function openDb(): Promise<IDBDatabase> {",
        "function openDb(): Promise<IDBDatabase> {\n  assertProfileContext();",
      ),
);
await change(
  "src/lib/prints-blobs.ts",
  (s) =>
    "import {profileDatabaseName,assertProfileContext} from './local-profile-storage.ts';\n" +
    s
      .replace(
        'const DB_NAME = "reelcase-prints";',
        'const DB_NAME = profileDatabaseName("reelcase-prints");',
      )
      .replace(
        "function openDb(): Promise<IDBDatabase> {",
        "function openDb(): Promise<IDBDatabase> {\n  assertProfileContext();",
      ),
);
await change(
  "src/lib/writer-lease.ts",
  (s) =>
    "import {profileChannelName} from './local-profile-storage.ts';\n" +
    s.replace(
      'new BroadcastChannel("reelcase-writers.v1")',
      'new BroadcastChannel(profileChannelName("reelcase-writers.v1"))',
    ),
);
await change(
  "src/routes/__root.tsx",
  (s) =>
    "import {ProfileBoundary} from '@/components/library/profile-boundary';\n" +
    s.replace(
      "<RestoreBoundary><Outlet /></RestoreBoundary>",
      "<ProfileBoundary><RestoreBoundary><Outlet /></RestoreBoundary></ProfileBoundary>",
    ),
);
await change(
  "src/components/library/settings-section.tsx",
  (s) =>
    "import {LocalProfilesPanel} from './local-profiles-panel';\nimport {activateLocalProfile} from '@/lib/local-profiles';\n" +
    s.replace(
      "<LibraryRestoreRecovery/>",
      `<LibraryRestoreRecovery/><LocalProfilesPanel onSwitch={async target=>{const {checkpointLibraryForProfileSwitch}=await import('@/lib/videos/store');await checkpointLibraryForProfileSwitch();await activateLocalProfile(target);}}/>`,
    ),
);
await change(
  "src/lib/videos/store.ts",
  (s) =>
    s +
    `
/** Flush the old namespace before full reload; late transactions remain in its DB. */
export async function checkpointLibraryForProfileSwitch(){
 const current=useLibrary.getState();
 if(current.remoteBusy||current.refreshing||current.scanning)throw Error('Finish the active pull or source scan before switching profiles.');
 cancelCatalogHydration();current.closePlayer();current.closePreview();
 if(restoreCompletion)await restoreCompletion;
 await checkpointLibraryForRestore();
 const {catalogWriter}=await import('./persist');
 if(catalogWriter.current())throw Error('A catalog write is still finishing. The current profile was kept; retry when it completes.');
}
`,
);
let patch = "";
for (const [f, text] of proposed)
  patch += createTwoFilesPatch("a/" + f, "b/" + f, original.get(f), text, undefined, undefined, {
    context: 3,
  });
await writeFile("docs/PROFILE_MIGRATION_PROPOSED.patch", patch);
await writeFile(".grok/profile-proposal-files.json", JSON.stringify([...proposed.keys()], null, 2));
console.log(
  JSON.stringify({
    files: proposed.size,
    bytes: Buffer.byteLength(patch),
    applied: false,
    output: "docs/PROFILE_MIGRATION_PROPOSED.patch",
  }),
);
