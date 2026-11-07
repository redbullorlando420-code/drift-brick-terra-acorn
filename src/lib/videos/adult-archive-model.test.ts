import test from 'node:test';
import assert from 'node:assert/strict';
import {readArchiveLedger,migrateArchiveLedger,validArchiveCheckpoint,ARCHIVE_POSITION_LIMIT,type ArchiveCheckpoint} from './adult-archive-model.ts';
import {archiveCoverageState,archiveOrdersFor} from './adult-archive-coverage.ts';
const cursor={page:7,query:'all',order:'latest',updatedAt:1,paging:2 as const,checkpointId:'archive:one'};
const point:ArchiveCheckpoint={version:1,provider:'eporner',query:'all',order:'latest',before:null,token:'archive:one',cursor,acceptedIds:['one']};
test('checkpoint schema rejects malformed, duplicated, future and oversized admissions',()=>{
 assert(validArchiveCheckpoint(point));
 for(const invalid of [{...point,version:2},{...point,provider:'unknown'},{...point,token:'https://private.invalid'},{...point,acceptedIds:['one','one']},{...point,acceptedIds:Array.from({length:433},(_,i)=>String(i))},{...point,cursor:{...cursor,page:0}},{...point,cursor:{...cursor,extraPayload:'private text'}},{...point,cursor:{...cursor,order:'unsupported'}}])assert.equal(validArchiveCheckpoint(invalid),false);
 assert.throws(()=>readArchiveLedger({version:99,positions:{}}),/Unsupported/);
 assert.throws(()=>readArchiveLedger({version:1,positions:Object.fromEntries(Array.from({length:ARCHIVE_POSITION_LIMIT+1},(_,i)=>[String(i),{}]))}),/Unsupported/);
});
test('migration keeps durable positions authoritative and leaves separate sort positions independent',()=>{
 const current=readArchiveLedger({version:1,positions:{'eporner::all::latest':{provider:'eporner',cursor,token:'archive:one',accepted:1}}});
 const migrated=migrateArchiveLedger(current,{'eporner::all::latest':{...cursor,page:1,updatedAt:99},'eporner::all::top-rated':{...cursor,order:'top-rated',page:30}});
 assert.equal(migrated.positions['eporner::all::latest']!.cursor.page,7);assert.equal(migrated.positions['eporner::all::top-rated']!.cursor.page,30);
 assert.deepEqual(migrateArchiveLedger(migrated,{}),migrated);
});

test('future and oversized yield sketches cannot enter an otherwise valid checkpoint',()=>{
 assert(validArchiveCheckpoint({...point,observeYield:false}));assert.equal(validArchiveCheckpoint({...point,observeYield:'disabled'}),false);
 for(const yieldValue of [{version:2,windows:1,score:1,recovery:1},{version:1,windows:9,score:1,recovery:1},{version:1,windows:1,score:1001,recovery:1},{version:1,windows:1,score:1,recovery:1,privatePayload:'unbounded'}])assert.equal(validArchiveCheckpoint({...point,cursor:{...cursor,yield:yieldValue}}),false);
});
test('coverage separates not checked, exhausted, cooling down and retryable failures without blocking another sort',()=>{
 const now=1000;assert.equal(archiveCoverageState(undefined,now).label,'Not checked');
 assert.equal(archiveCoverageState({...cursor,state:'exhausted',retryAt:2000},now).canContinue,false);
 assert.equal(archiveCoverageState(cursor,now).canContinue,true);
 assert.equal(archiveCoverageState({...cursor,state:'failed',retryAt:900},now).canContinue,true);
 assert.equal(archiveCoverageState(cursor,now,2000).canContinue,false);
 assert.equal(archiveOrdersFor('eporner').length,5);assert.deepEqual(archiveOrdersFor('booru',['latest','latest','unsupported']),['top-weekly','latest']);
});
