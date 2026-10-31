import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['--test','--test-name-pattern=automatic live batches|failed live transport|pausing during an automatic|mixed live checks|throughput','scripts/pull-entry-limits.test.mjs'],{stdio:'inherit'});process.exitCode=result.status??1;
