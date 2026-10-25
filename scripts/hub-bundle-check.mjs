/** Verify the built dependency graph, not just the presence of lazy imports. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const assets = resolve(root, '.vercel/output/static/assets');
const files = readdirSync(assets).filter(file => file.endsWith('.js'));
const entry = prefix => {
  const matches = files.filter(file => file.startsWith(`${prefix}-`));
  assert.equal(matches.length, 1, `Expected one built ${prefix} chunk`);
  return resolve(assets, matches[0]);
};
const closure = (file, visited = new Set()) => {
  if (visited.has(file)) return visited;
  visited.add(file);
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);
  for (const node of source.statements) {
    if (!(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) || !node.moduleSpecifier) continue;
    const path = node.moduleSpecifier.text;
    if (path.startsWith('.')) closure(resolve(dirname(file), path), visited);
  }
  return visited;
};
const initial = closure(entry('library-app'), closure(entry('index')));
assert.ok(![...initial].some(file => /(?:-section|hub-sections)-/.test(basename(file))), 'Home must not eagerly import a Hub desk');
const desks = files.filter(file => /-section-/.test(file));
assert.equal(desks.length, 19, 'Every Hub desk must have its own boundary');
const results = desks.map(name => {
  const graph = closure(resolve(assets, name));
  const unrelated = [...graph].filter(file => /-section-/.test(basename(file)) && basename(file) !== name);
  assert.deepEqual(unrelated, [], `${name} must not statically load another desk`);
  const extra = [...graph].filter(file => !initial.has(file));
  return { desk: name.replace(/-section-.*/, '-section'), additionalBytes: extra.reduce((sum, file) => sum + statSync(file).size, 0),
    additionalGzipBytes: extra.reduce((sum, file) => sum + gzipSync(readFileSync(file)).length, 0), chunks: extra.map(file => basename(file)) };
});
const report = { ok: true, initialBytes: [...initial].reduce((sum, file) => sum + statSync(file).size, 0), desks: results };
writeFileSync(resolve(root, 'screenshots/desk-split-bundles.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
