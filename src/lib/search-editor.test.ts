import test from 'node:test';
import assert from 'node:assert/strict';
import { queueSearchDraft, searchEditorShortcut } from './search-editor.ts';

test('dismissal cancels pending search even if its callback was already queued', () => {
  let work = () => {}, commits = 0, cancelled = false;
  const cancel = queueSearchDraft({ draft:'late', query:'', sourceId:'youtube', active:()=>true,
    get:()=>({query:'',sourceId:'youtube',activeId:null,previewId:null}), commit:()=>commits++,
    schedule:callback=>{work=callback;return()=>{cancelled=true;};} });
  cancel(); work(); assert.equal(commits,0); assert.equal(cancelled,true);
});
test('pending drafts cannot overwrite navigation, an external query, or a viewer', () => {
  const base = {query:'old',sourceId:'youtube',activeId:null as string|null,previewId:null as string|null};
  for (const current of [{...base,query:'new'},{...base,sourceId:'home'},{...base,previewId:'watch'},{...base,activeId:'play'}]) {
    let work=()=>{}, commits=0;
    queueSearchDraft({draft:'late',query:'old',sourceId:'youtube',active:()=>true,get:()=>current,commit:()=>commits++,schedule:callback=>{work=callback;return()=>{};}});
    work(); assert.equal(commits,0);
  }
  let work=()=>{}, value='';
  queueSearchDraft({draft:'latest',query:'old',sourceId:'youtube',active:()=>true,get:()=>base,commit:next=>{value=next;},schedule:callback=>{work=callback;return()=>{};}});
  work(); assert.equal(value,'latest');
});
test('search shortcuts allow Ctrl/Cmd K but do not steal slash while typing', () => {
  const event={key:'/',ctrlKey:false,metaKey:false,altKey:false,shiftKey:false};
  assert.equal(searchEditorShortcut(event,false),true);assert.equal(searchEditorShortcut(event,true),false);
  assert.equal(searchEditorShortcut({...event,key:'K',metaKey:true},true),true);
  assert.equal(searchEditorShortcut({...event,key:'k',ctrlKey:true,altKey:true},false),false);
});
