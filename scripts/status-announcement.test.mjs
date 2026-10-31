import test from 'node:test';
import assert from 'node:assert/strict';
import {batchStatusAnnouncement,retainStatusAnnouncement} from '../src/lib/status-announcement.ts';
test('100 creator progress ticks retain one start announcement and one final outcome',()=>{
 let current={key:'',text:''},changes=[];
 for(let n=0;n<100;n++){const next=retainStatusAnnouncement(current,batchStatusAnnouncement({id:'one',phase:'running',label:'YouTube live check',total:100+n,outcome:'Checking creator '+n}));if(next!==current)changes.push(next.text);current=next;}
 assert.equal(changes.length,1);assert.match(changes[0],/100 creators/);assert(!changes[0].includes('Checking creator'));
 const done=batchStatusAnnouncement({id:'one',phase:'complete',label:'YouTube live check',outcome:'100 checked; 2 need attention. Use Check all to retry.'});current=retainStatusAnnouncement(current,done);assert.equal(current.text,done.text);assert.equal(retainStatusAnnouncement(current,{key:'',text:''}),current);assert.equal(retainStatusAnnouncement(current,done),current);
});
test('waiting, recovery and the next run each have a semantic boundary, with bounded text',()=>{
 let current={key:'',text:''};for(const phase of ['running','waiting','running','complete']){const next=retainStatusAnnouncement(current,batchStatusAnnouncement({id:'one',phase,label:'Twitch',outcome:'x'.repeat(1000)}));assert.notEqual(next,current);assert(next.text.length<=600);current=next;}
 assert.notEqual(retainStatusAnnouncement(current,batchStatusAnnouncement({id:'two',phase:'running',label:'Twitch'})),current);
});
