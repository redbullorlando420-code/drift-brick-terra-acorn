import test from 'node:test';
import assert from 'node:assert/strict';
import { createSidebarController } from './sidebar-controller.ts';
function fixture() {
  const callbacks: Array<{ work:()=>void; cancelled:boolean }> = [];
  const controller=createSidebarController(work=>{const item={work,cancelled:false};callbacks.push(item);return()=>{item.cancelled=true;};});
  return {controller,callbacks,flush:()=>callbacks.splice(0).forEach(item=>item.work())};
}
test('desktop sidebar starts open and remains pinned through navigation until the user chooses auto-hide', () => {
  const f=fixture();assert.deepEqual(f.controller.getSnapshot(),{open:true,pinned:true});
  f.controller.dismiss();assert.deepEqual(f.controller.getSnapshot(),{open:true,pinned:true});
  f.controller.pointer(false);f.flush();assert.deepEqual(f.controller.getSnapshot(),{open:true,pinned:true});
  f.controller.pin(false);assert.deepEqual(f.controller.getSnapshot(),{open:true,pinned:false});
  f.controller.pointer(true);f.flush();assert.deepEqual(f.controller.getSnapshot(),{open:true,pinned:false});
  f.controller.pointer(false);f.flush();assert.deepEqual(f.controller.getSnapshot(),{open:false,pinned:false});
});
test('manually collapsing and reopening returns to the expanded pinned state', () => {
  const f=fixture();f.controller.toggle();assert.deepEqual(f.controller.getSnapshot(),{open:false,pinned:false});
  f.controller.toggle();assert.deepEqual(f.controller.getSnapshot(),{open:true,pinned:true});
  f.controller.pointer(false);f.flush();assert.deepEqual(f.controller.getSnapshot(),{open:true,pinned:true});
});
test('automatic retraction cancels stale deadlines on pointer reentry and focus', () => {
  const f=fixture();f.controller.pin(false);f.controller.pointer(true);f.controller.pointer(false);
  assert.equal(f.callbacks.length,2);f.controller.pointer(true);f.flush();assert.equal(f.controller.getSnapshot().open,true);
  f.controller.focus(true);f.controller.pointer(false);f.flush();assert.equal(f.controller.getSnapshot().open,true);
  f.controller.focus(false);f.flush();assert.equal(f.controller.getSnapshot().open,false);
});
test('snapshot identity and listener cleanup avoid needless catalog renders', () => {
  const f=fixture(),initial=f.controller.getSnapshot();let updates=0;const unsubscribe=f.controller.subscribe(()=>updates++);
  f.controller.dismiss();assert.equal(f.controller.getSnapshot(),initial);assert.equal(updates,0);
  f.controller.toggle();assert.equal(updates,1);unsubscribe();f.controller.pointer(false);f.controller.dispose();f.flush();
  assert.equal(updates,1);assert.deepEqual(f.controller.getSnapshot(),{open:false,pinned:false},'disposed deadlines cannot reopen a manually closed sidebar');
});
