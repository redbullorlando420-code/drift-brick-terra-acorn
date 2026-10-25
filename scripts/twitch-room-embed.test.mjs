import test from 'node:test';
import assert from 'node:assert/strict';
import { twitchEmbedUrl, twitchEmbedContext, normalizeTwitchParent } from '../src/lib/videos/twitch-embed.ts';
test('Twitch guest setup uses the viewer hostname, requires HTTPS on LAN and retains loopback development',()=>{
 assert.equal(twitchEmbedContext('http:','192.168.1.2').blocked,'https');
 assert.equal(twitchEmbedContext('http:','reelcase.local').blocked,'https');
 assert.equal(twitchEmbedContext('https:','watch.example.com').blocked,undefined);
 assert.equal(twitchEmbedContext('https:','192.168.1.2').blocked,undefined);
 for(const host of ['localhost','127.0.0.1','[::1]'])assert.equal(twitchEmbedContext('http:',host).blocked,undefined);
 assert.equal(twitchEmbedContext('https:','').blocked,'parent');
});
test('nested Twitch parents are exact deduplicated page ancestors without ports or peer-provided hostnames',()=>{
 assert.deepEqual(twitchEmbedContext('https:','watch.example.com',['https://outer.example.com:8443','https://watch.example.com','garbage','data:text/html,hello']).parents,['watch.example.com','outer.example.com']);
 for(const value of ['https://watch.example.com','watch.example.com:8080','name/path','user@host','host?parent=bad'])assert.equal(normalizeTwitchParent(value),undefined);
});
test('Twitch embeds replace stale parents with all current viewer parents and preserve VOD/clip identities',()=>{
 const parents=['watch.example.com','outer.example.com'];
 const vod=new URL(twitchEmbedUrl({embedUrl:'http://player.twitch.tv/?video=12345&parent=host-old&parent=other-old'},parents));assert.equal(vod.protocol,'https:');assert.equal(vod.searchParams.get('video'),'v12345');assert.deepEqual(vod.searchParams.getAll('parent'),parents);
 const clip=new URL(twitchEmbedUrl({embedUrl:'https://clips.twitch.tv/embed?clip=GuestClip&parent=old'},parents));assert.equal(clip.searchParams.get('clip'),'GuestClip');assert.deepEqual(clip.searchParams.getAll('parent'),parents);
 assert.equal(twitchEmbedUrl({watchUrl:'https://notwitch.tv/fake'},'watch.example.com'),null);
 assert.equal(twitchEmbedUrl({watchUrl:'https://www.twitch.tv/notyoda'},[]),null);
});
