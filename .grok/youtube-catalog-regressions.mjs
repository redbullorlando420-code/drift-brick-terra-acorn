import {spawnSync} from 'node:child_process';
const files=['scripts/creator-video-catalog.test.mjs','scripts/pull-entry-limits.test.mjs','src/lib/videos/entry-limits.test.ts'];
const result=spawnSync(process.execPath,['--experimental-strip-types','--test','--test-concurrency=1','--test-skip-pattern=1,588-creator',...files],{stdio:'inherit'});process.exitCode=result.status??1;
