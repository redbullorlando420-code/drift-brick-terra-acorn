import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {NEXT_LEVEL_MISSIONS,NEXT_LEVEL_TRACKS,MODEL_EXECUTION_RULES,formatMissionBrief,formatNextLevelRoadmap} from '../src/lib/mission-next-level.ts';
import {mergeMissionPlan,MISSION_PLAN_REVISION,NEXT_LEVEL_COMPLETED_IDS} from '../src/lib/mission-plan.ts';
test('exactly 100 distinct milestones with only evidenced completions cover ten workstreams with executable contracts',()=>{
 assert.equal(NEXT_LEVEL_MISSIONS.length,100);assert.equal(new Set(NEXT_LEVEL_MISSIONS.map(m=>m.id)).size,100);assert.equal(new Set(NEXT_LEVEL_MISSIONS.map(m=>m.title.toLowerCase())).size,100);assert.equal(NEXT_LEVEL_TRACKS.length,10);
 for(const track of NEXT_LEVEL_TRACKS)assert.equal(NEXT_LEVEL_MISSIONS.filter(m=>m.brief.track===track).length,10);
 for(const [index,m] of NEXT_LEVEL_MISSIONS.entries()){
  assert.equal(m.id,'next-'+String(index+1).padStart(3,'0'));const verified=NEXT_LEVEL_COMPLETED_IDS.includes(m.id);assert.equal(m.done,verified);assert.equal(m.status,verified?'complete':'planned');
  assert(m.detail.length>=45,m.id);assert.equal(m.brief.steps.length,3);assert.equal(m.brief.acceptance.length,2);
  assert(m.brief.steps.every(s=>s.length>=55),m.id+' must have substantive implementation steps');assert(m.brief.acceptance.every(s=>s.length>=50),m.id+' must have testable acceptance checks');
  assert(['P0','P1','P2'].includes(m.brief.priority));assert(m.brief.files.length>=2);
  for(const file of m.brief.files)assert(existsSync(new URL('../'+file,import.meta.url)),m.id+' missing code entry point '+file);
 }
});
test('all prerequisite references exist, are acyclic and precede dependent work',()=>{
 const positions=new Map(NEXT_LEVEL_MISSIONS.map((m,i)=>[m.id,i]));
 for(const [i,m]of NEXT_LEVEL_MISSIONS.entries())for(const id of m.brief.dependsOn){assert(positions.has(id),m.id+' unknown prerequisite '+id);assert(positions.get(id)<i,m.id+' cyclic/forward prerequisite '+id);}
});
test('roadmap migration appends briefs once without resetting prior manual choices or custom ideas',()=>{
 assert.equal(MISSION_PLAN_REVISION,54);
 const legacy=[{id:'old-complete',title:'Old complete',detail:'Keep complete',done:true,status:'complete'},{id:'old-reopened',title:'Old reopened',detail:'Keep reopened',done:false,status:'in-progress'}],custom={id:'custom-idea',title:'My idea',detail:'Preserve my words',done:false,status:'blocked'};
 const saved=[...legacy,custom],defaults=[...legacy,NEXT_LEVEL_MISSIONS[0],...NEXT_LEVEL_MISSIONS.slice(1)];
 const first=structuredClone(mergeMissionPlan(saved,defaults,25));assert.equal(first.length,103);assert.deepEqual(first.slice(0,3),saved);assert(first.slice(3).every(m=>m.done===NEXT_LEVEL_COMPLETED_IDS.includes(m.id)));assert.equal(first.slice(3).filter(m=>m.done).length,41);
 first.find(m=>m.id==='next-001').status='in-progress';first.find(m=>m.id==='next-002').done=true;first.find(m=>m.id==='next-002').status='complete';
 const reloaded=mergeMissionPlan(JSON.parse(JSON.stringify(first)),defaults,26);assert.equal(reloaded.length,103);assert.equal(reloaded.find(m=>m.id==='next-001').status,'in-progress');assert.equal(reloaded.find(m=>m.id==='next-002').done,true);assert.deepEqual(reloaded.find(m=>m.id===custom.id),custom);
});
test('known brief updates retain saved status while adopting the current implementation contract',()=>{
 const m=NEXT_LEVEL_MISSIONS[0],saved={...m,status:'blocked',brief:{...m.brief,steps:['Outdated instruction']}};
 const next=mergeMissionPlan([saved],[m],26)[0];assert.equal(next.status,'blocked');assert.deepEqual(next.brief.steps,m.brief.steps);
});
test('copied briefs include concrete scope, dependency status, acceptance and safe execution boundaries',()=>{
 const m=NEXT_LEVEL_MISSIONS[99],text=formatMissionBrief(m,NEXT_LEVEL_MISSIONS);
 for(const heading of ['Execution contract','Dependencies','Start in','Implementation','Acceptance checks','Required handoff'])assert(text.includes('## '+heading));
 for(const step of m.brief.steps)assert(text.includes(step));for(const acceptance of m.brief.acceptance)assert(text.includes('- [ ] '+acceptance));
 assert(text.includes('next-099'));assert(text.includes('[planned]'));assert(MODEL_EXECUTION_RULES.some(s=>s.includes('real user data')));
 for(const m of NEXT_LEVEL_MISSIONS.filter(m=>m.brief.external)){const brief=formatMissionBrief(m);assert(brief.includes('## External requirement'));assert(brief.includes('Do not claim this external requirement passed from fixtures alone.'));}
});
test('checked-in roadmap is reproducible and exports all 100 full briefs without completing work',()=>{
 const document=readFileSync(new URL('../NEXT_LEVEL_MILESTONES.md',import.meta.url),'utf8');assert.equal(document,formatNextLevelRoadmap());assert.equal((document.match(/^# next-\d{3} — /gm)??[]).length,100);
 const current=NEXT_LEVEL_MISSIONS.map((m,i)=>i?m:{...m,status:'in-progress'});assert(formatNextLevelRoadmap(current).includes('Status: in-progress'));assert.equal(NEXT_LEVEL_MISSIONS.filter(m=>m.done).length,41);
});
