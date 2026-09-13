#!/usr/bin/env node
/**
 * Nitro traces PGlite's JavaScript entry point, but its three WebAssembly/data
 * files are located through `new URL()` at runtime. Keep those assets beside
 * the traced module so `npm run preview` exercises the same no-DB fallback as
 * the live preview.
 */
import { access, copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "node_modules", "@electric-sql", "pglite", "dist");
const targetDir = join(
  root,
  ".vercel",
  "output",
  "functions",
  "__server.func",
  "_libs",
);
const assets = ["pglite.data", "pglite.wasm", "initdb.wasm"];

try {
  await access(targetDir);
} catch {
  console.log("[pglite-preview-assets] no Nitro output — skipping.");
  process.exit(0);
}

await mkdir(targetDir, { recursive: true });
await Promise.all(
  assets.map((asset) => copyFile(join(sourceDir, asset), join(targetDir, asset))),
);
console.log(`[pglite-preview-assets] copied ${assets.join(", ")}.`);
