/** Apply the exact user-approved integration artifact, only if every hunk matches. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { parsePatch, applyPatch } from "diff";
const root = resolve("."),
  artifact = await readFile("docs/PROFILE_MIGRATION_PROPOSED.patch", "utf8");
const patches = parsePatch(artifact),
  changes = [];
if (patches.length !== 70) throw Error("Expected the reviewed 70-file artifact.");
for (const patch of patches) {
  const name = patch.newFileName?.replace(/^b\//, "");
  if (!name?.startsWith("src/") || patch.oldFileName !== "a/" + name)
    throw Error("Unexpected patch path.");
  const target = resolve(root, name);
  if (!target.startsWith(root + sep)) throw Error("Patch escaped workspace.");
  const before = await readFile(target, "utf8"),
    after = applyPatch(before, patch, { fuzzFactor: 0 });
  if (after === false || after === before) throw Error("Preimage no longer matches: " + name);
  changes.push({ name, target, before, after });
}
const hash = (s) => createHash("sha256").update(s).digest("hex");
if (process.argv.includes("--apply")) {
  for (const change of changes) {
    if ((await readFile(change.target, "utf8")) !== change.before)
      throw Error("Concurrent edit: " + change.name);
    await writeFile(change.target, change.after);
  }
  await writeFile(
    ".grok/profile-applied-manifest.json",
    JSON.stringify(
      {
        artifactSha256: hash(artifact),
        files: changes.map((c) => ({ name: c.name, before: hash(c.before), after: hash(c.after) })),
      },
      null,
      2,
    ),
  );
}
console.log(
  JSON.stringify({
    files: changes.length,
    artifactSha256: hash(artifact),
    applied: process.argv.includes("--apply"),
  }),
);
