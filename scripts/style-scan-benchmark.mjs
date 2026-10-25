import { Scanner } from '@tailwindcss/oxide';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { checkedOutputPath } from './browser-guard.mjs';

const output = checkedOutputPath(process.argv[2] ?? resolve('screenshots/style-scan.json'), [resolve('screenshots')], 'source scan report');
const results = [];
// The installed Vite plugin uses exactly these Scanner options for its default
// working-directory root and an explicit source() root, respectively.
for (const directory of ['.', 'src']) {
  const started = performance.now(), scanner = new Scanner({ sources: [{ base: resolve(directory), pattern: '**/*', negated: false }] });
  const candidates = scanner.scan(), files = scanner.files.map(file => relative(process.cwd(), file).replaceAll('\\', '/'));
  results.push({ directory, ms: performance.now() - started, files: files.length, candidates: candidates.length,
    generatedBuildFiles: files.filter(file => file.startsWith('.vercel/')).length,
    qaFiles: files.filter(file => file.startsWith('screenshots/')).length });
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify({ limitation: 'One scan per root in one process; cache and filesystem state affect timings. File counts establish the scope difference, not whole-app startup speed.', results }, null, 2));
console.log(JSON.stringify(results, null, 2));
