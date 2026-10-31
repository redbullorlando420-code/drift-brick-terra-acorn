import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['--experimental-strip-types','--test','--test-name-pattern=1,588-creator','--test-timeout=240000','scripts/pull-entry-limits.test.mjs'],{stdio:'inherit'});process.exitCode=result.status??1;
