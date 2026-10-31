import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const scripts = readdirSync('scripts').filter(name => /^(youtube-|twitch-|provider-budgets|import-payload|import-session).*\.test\.mjs$/.test(name)).map(name => 'scripts/' + name);
const native = readdirSync('src/lib/remote').filter(name => name.startsWith('youtube-') && name.endsWith('.test.ts')).map(name => 'src/lib/remote/' + name);
native.push('src/lib/videos/remote-merge.test.ts');
for (const files of (process.argv.includes('--native') ? [native] : [scripts, native])) {
  const result = spawnSync(process.execPath, ['--experimental-strip-types', '--test', '--test-concurrency=2', ...files], { stdio: 'inherit' });
  if (result.status) { process.exitCode = result.status ?? 1; break; }
}
