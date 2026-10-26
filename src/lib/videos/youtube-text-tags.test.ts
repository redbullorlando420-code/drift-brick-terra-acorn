import test from 'node:test';
import assert from 'node:assert/strict';
import { youtubeTextTags, refreshYoutubeTags, YOUTUBE_TEXT_LIMITS } from './youtube-text-tags.ts';
import { topicEvidence, topicsForVideo } from './topics.ts';
import type { LibraryVideo } from './types.ts';
const video=(name:string,description=''):LibraryVideo=>({id:name,name,description,folderId:'youtube:ada',path:'youtube/ada',extension:'yt',mime:'video/youtube',size:0,addedAt:0,remote:{kind:'youtube',channelName:'Gaming Travel Music Channel'}});

test('title, description hashtags, entities and chapter phrases connect to useful topics', () => {
  const row=video('Machine learning workshop','A guide to machine learning with Python. #NeuralNetworks\n00:00 Introduction\n02:10 Training neural networks\n05:22 Model evaluation');
  const result=youtubeTextTags(row);
  for (const tag of ['neuralnetworks','machine-learning','python','training-neural-networks','model-evaluation']) assert.ok(result.tags.includes(tag),tag);
  assert.ok(topicsForVideo(row).includes('technology'));
  assert.match(topicEvidence(row).find(link=>link.topic==='technology')!.reason,/Title\/category/);
  assert.equal(youtubeTextTags(row),result,'bounded cache reuses adjacent taxonomy/keyword work');
});
test('promotional descriptions, creator identity and links cannot invent interests', () => {
  const row=video("Today's update",'Subscribe to my gaming travel music channels\nFollow me for anime #anime\nSponsored by a cooking brand\nhttps://example.com/minecraft?coding=1\nBusiness inquiries: science@example.com');
  assert.deepEqual(topicsForVideo(row),[]);
  const tags=youtubeTextTags(row).tags;
  for (const noise of ['gaming','travel','music','anime','cooking','minecraft','example','https']) assert.ok(!tags.includes(noise),noise);
});
test('inference is bounded and supports Unicode hashtags without a huge token buffer', () => {
  const row=video('Minecraft build #日本旅行','00:00 Castle building\n'+('useful word '.repeat(100_000))+'\n#mustnotread');
  const result=youtubeTextTags(row);
  assert.ok(result.tags.includes('日本旅行'));assert.ok(result.tags.includes('castle-building'));
  assert.ok(!result.tags.includes('mustnotread'));assert.ok(result.tags.length<=YOUTUBE_TEXT_LIMITS.tags);
});
test('old provider keywords leave room for better tags while manual and legacy choices survive', () => {
  const current=['personal','unknown',...Array.from({length:30},(_,i)=>`old${i}`)];
  const sources=Object.fromEntries(current.map(tag=>[tag,tag==='personal'?'manual' as const:'provider:youtube' as const]));delete sources.unknown;
  const next=refreshYoutubeTags(current,['provider-youtube','format-vod','machine-learning','python'],{tags:sources});
  assert.deepEqual(next,['personal','unknown','provider-youtube','format-vod','machine-learning','python']);
  assert.equal(refreshYoutubeTags(next,next,{tags:sources}),next);
  assert.equal(refreshYoutubeTags(current,['replace'],{tags:sources,lockedFields:['tags']}),current);
  const manual=Array.from({length:40},(_,i)=>`choice${i}`);assert.deepEqual(refreshYoutubeTags(manual,['replace']),manual);
});

test('text cache evicts old cards and catalog placeholder descriptions do not become content tags', () => {
  const row=video('An interesting experiment','Older catalog item');const first=youtubeTextTags(row);
  assert.ok(!first.tags.includes('catalog'));assert.ok(!first.tags.includes('older'));
  for(let i=0;i<520;i++) youtubeTextTags(video(`Unique title ${i}`));
  assert.notEqual(youtubeTextTags(row),first,'only a bounded set of cards may retain inferred output');
});
