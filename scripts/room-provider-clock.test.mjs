import test from 'node:test';
import assert from 'node:assert/strict';
import { providerMayShareEvent, roomLiveMode, providerPosition, providerNeedsCorrection, providerPlaybackWanted, youtubeLiveInfo, roomClockSample, roomPacketElapsed } from '../src/lib/multiplayer/room-provider-clock.ts';
test('live playback follows room intent independently of host buffering while VOD retains clock gating',()=>{
  assert.equal(providerPlaybackWanted(true,true,false,true),true);
  assert.equal(providerPlaybackWanted(false,true,true,true),false);
  assert.equal(providerPlaybackWanted(false,true,false,true),false);
  assert.equal(providerPlaybackWanted(true,true,false,false),false);
  assert.equal(providerPlaybackWanted(true,true,true,false),true);
  assert.equal(providerPlaybackWanted(true,false,false,false),true);
});
test('iframe live evidence must identify the current video and use an actual boolean',()=>{
  assert.equal(youtubeLiveInfo({videoData:{video_id:'live',isLive:true}},'live'),true);
  assert.equal(youtubeLiveInfo({videoData:{video_id:'vod',isLive:false}},'vod'),false);
  assert.equal(youtubeLiveInfo({videoData:{video_id:'old',isLive:true}},'vod'),undefined);
  assert.equal(youtubeLiveInfo({videoData:{isLive:'true'}},'vod'),undefined);
  assert.equal(youtubeLiveInfo({duration:100},'vod'),undefined);
  assert.equal(youtubeLiveInfo(null,'vod'),undefined);
});
test('provider clocks advance only while playing and reject stale or replaced observations',()=>{
  const sample={id:'one',position:30,state:1,at:1000};
  assert.equal(providerPosition(sample,'one',1500),30.5);
  for(const state of [2,3,-1,0])assert.equal(providerPosition({...sample,state},'one',2000),30);
  assert.equal(providerPosition(sample,'two',1500),undefined);assert.equal(providerPosition(sample,'one',5000),undefined);assert.equal(providerPosition(sample,'one',500),undefined);
});
test('provider correction ignores normal jitter and enforces a cooldown for large drift',()=>{
  assert.equal(providerNeedsCorrection(20.5,21,10000,0),false);assert.equal(providerNeedsCorrection(10,21,10000,0),true);
  assert.equal(providerNeedsCorrection(10,21,10000,9000),false);assert.equal(providerNeedsCorrection(undefined,21,10000,0),false);
});
test('clock handshakes remove device wall-clock skew with a bounded monotonic round trip',()=>{
  const sample=roomClockSample(190000,100,200,100050);
  assert.deepEqual(sample,{rtt:100,offset:-90000});assert.equal(roomPacketElapsed(100000,190100,sample.offset),0.1);
  assert.equal(roomClockSample(1,200,100,1),undefined);assert.equal(roomClockSample(1,0,3000,1),undefined);
  assert.equal(roomClockSample(1,0,100,NaN),undefined);
});
test('unsampled packet transit never turns clock skew into minutes of phantom video',()=>{
  assert.equal(roomPacketElapsed(100000,500000),2);assert.equal(roomPacketElapsed(100000,90000),0);
});

test('implicit guest live events never become room commands; live mode never invents DVR from duration',()=>{
 assert.equal(providerMayShareEvent(true),false);assert.equal(providerMayShareEvent(false),true);
 assert.equal(roomLiveMode(true),'independent-live');assert.equal(roomLiveMode(false),'on-demand');
});
