import {readdirSync} from 'node:fs';import {spawnSync} from 'node:child_process';
const scripts=readdirSync('scripts').filter(s=>s.startsWith('room-')&&s.endsWith('.test.mjs')).map(s=>'scripts/'+s);
const native=readdirSync('src/lib/multiplayer').filter(s=>s.endsWith('.test.ts')).map(s=>'src/lib/multiplayer/'+s);
native.push('src/lib/mission-plan.test.ts');scripts.push('scripts/mission-next-level.test.mjs','scripts/status-announcement.test.mjs');
let result=spawnSync(process.execPath,['--test','--test-concurrency=2',...scripts],{stdio:'inherit'});if(result.status){process.exitCode=result.status??1;}else{result=spawnSync(process.execPath,['--experimental-strip-types','--test','--test-concurrency=2',...native],{stdio:'inherit'});process.exitCode=result.status??1;}
