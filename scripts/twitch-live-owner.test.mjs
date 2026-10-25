import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {createPeriodicScheduler} from '../src/lib/periodic-scheduler.ts';
const f={now:1_000_000,phase:'active',paused:false,policy:{automaticPulls:true},calls:[],listeners:new Set(),cleanup:null};
const timers=new Map();let serial=0;
f.scheduler=createPeriodicScheduler({now:()=>f.now,phase:()=>f.phase,inputDelay:()=>0,setTimer:(work,delay)=>{const id=++serial;timers.set(id,{work,at:f.now+delay});return id;},clearTimer:id=>timers.delete(id)});
f.state={hydrated:true,sourceId:'twitch',refreshing:true,remoteBusy:true,follows:[{id:'tw:test',kind:'twitch',handle:'test',title:'Test'}],refreshFollows:async(...args)=>{f.calls.push(args);return {pull:{}};}};
globalThis.__twitchLiveOwnerFixture=f;
const mocks={react:'export const useEffect=fn=>f.cleanup=fn();','@/lib/videos/store':'export const useLibrary=fn=>fn(f.state);useLibrary.getState=()=>f.state;','@/lib/pull-settings':'export const getPullSettings=()=>f.policy;','@/lib/pull-control':'export const catalogPullAvailable=(_interaction,ignorePause)=>ignorePause||!f.paused;export const subscribePullAvailability=fn=>{f.listeners.add(fn);return()=>f.listeners.delete(fn);};','@/lib/periodic-work':'export const registerPeriodicTask=task=>f.scheduler.register(task);'};
registerHooks({resolve(s,c,n){if(s in mocks)return {url:'data:text/javascript,'+encodeURIComponent('const f=globalThis.__twitchLiveOwnerFixture;'+mocks[s]),shortCircuit:true};try{return n(s,c);}catch(e){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const drain=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
async function advance(ms){f.now+=ms;for(let n=0;n<100;n++){const due=[...timers].find(([,t])=>t.at<=f.now);if(!due)break;timers.delete(due[0]);due[1].work();await drain();}}
test('the independent Twitch live owner runs beside archives, keeps a visible idle desk checking through archive pause, respects hidden/settings and releases its timer',async()=>{
 const now=Date.now,navigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');Date.now=()=>f.now;Object.defineProperty(globalThis,'navigator',{configurable:true,value:{onLine:true}});
 try{const {useTwitchLiveRefresh}=await import('../src/components/library/use-twitch-live-refresh.ts');useTwitchLiveRefresh();await advance(1500);assert.equal(f.calls.length,1,'archive busy flags cannot starve live checks');assert.deepEqual(f.calls[0],['twitch',{twitchLiveOnly:true,scheduled:true,liveDemand:true,liveSweep:true}]);await advance(1000);assert.equal(f.calls.length,1);await advance(15000);assert.equal(f.calls.length,2);
 f.paused=true;f.phase='idle';f.listeners.forEach(fn=>fn());await advance(120000);assert.equal(f.calls.length,3,'visible idle live pages continue through bulk pause');f.paused=false;f.listeners.forEach(fn=>fn());await advance(0);assert.equal(f.calls.length,3);
 f.phase='hidden';f.scheduler.wake();await advance(120000);assert.equal(f.calls.length,3);f.phase='active';f.policy.automaticPulls=false;f.scheduler.wake();await advance(120000);assert.equal(f.calls.length,3);f.cleanup();assert.equal(timers.size,0);assert.equal(f.listeners.size,0);
 }finally{f.cleanup?.();Date.now=now;if(navigator)Object.defineProperty(globalThis,'navigator',navigator);}
});
