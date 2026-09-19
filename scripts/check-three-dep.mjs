/**
 * Prints viewer (`print-model-viewer.tsx`) dynamically imports `three`.
 * The App Builder sandbox does not preinstall game engines, so a fresh
 * workspace / deploy without `npm install` yields:
 *   [vite]: Rolldown failed to resolve import "three"
 * Fail fast with an actionable message before Vite/Rolldown runs.
 */
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const declared = pkg.dependencies?.three;
if (!declared) {
  console.error(
    '[check-three] "three" is missing from package.json dependencies. Add it with: npm install three@^0.186.0',
  );
  process.exit(1);
}

const installedPkg = join(root, "node_modules", "three", "package.json");
if (!existsSync(installedPkg)) {
  console.error(
    `[check-three] "three" is declared (${declared}) but not installed in node_modules.`,
  );
  console.error("[check-three] Run: npm install three@^0.186.0");
  process.exit(1);
}

// three's package "exports" omit ./package.json — resolve the package root instead.
const require = createRequire(join(root, "package.json"));
try {
  require.resolve("three");
} catch (err) {
  console.error("[check-three] node cannot resolve import \"three\":", err);
  console.error("[check-three] Run: npm install three@^0.186.0");
  process.exit(1);
}

const installed = JSON.parse(readFileSync(installedPkg, "utf8"));
console.log(`[check-three] ok — three@${installed.version} (package.json: ${declared})`);
