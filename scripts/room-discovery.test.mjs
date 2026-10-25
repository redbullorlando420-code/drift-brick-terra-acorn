import test from 'node:test';
import assert from 'node:assert/strict';
import { roomSearchPage } from '../src/lib/multiplayer/room-search.ts';
import { readRoomHistory, rememberRoomVideo, ROOM_HISTORY_LIMIT } from '../src/lib/multiplayer/room-watch-history.ts';
import { describeRoomMedia, resolveRoomMedia } from '../src/lib/multiplayer/room-media.ts';
import { parseRoomYoutubeSearch, roomYoutubeSearchInput } from '../src/lib/remote/room-youtube-search.ts';
const video=index=>({id:`yt:${index}`,name:`Racing ${index}`,folderId:'yt:channel',path:'',size:0,mime:'video/youtube',extension:'yt',addedAt:0,description:'Learning a wet circuit',remote:{kind:'youtube',videoId:`v${String(index).padStart(10,'0')}`,channelName:'Café Driver',youtubeKeywords:['overtake','strategy']}});
test('room search pages beyond twenty results without mounting the whole catalog',async()=>{
 const videos=Array.from({length:90},(_,i)=>video(i)),turn=async()=>{};
 const first=await roomSearchPage(videos,'cafe strategy wet',0,turn),second=await roomSearchPage(videos,'cafe strategy wet',24,turn),last=await roomSearchPage(videos,'strategy',72,turn);
 assert.equal(first.videos.length,24);assert.equal(first.hasMore,true);assert.equal(second.videos[0].id,'yt:24');assert.equal(last.videos.length,18);assert.equal(last.hasMore,false);assert.deepEqual((await roomSearchPage(videos,'missing',0,turn)).videos,[]);
});
test('a cancelled rare search stops before publishing stale results',async()=>{
 let turns=0;await assert.rejects(roomSearchPage(Array.from({length:5000},(_,i)=>video(i)),'not here',0,async()=>{if(++turns===3)throw Error('cancelled');}),/cancelled/);
});
test('watch history survives serialization, includes current title and deduplicates provider aliases',()=>{
 let entries=rememberRoomVideo([],describeRoomMedia(video(1)),Date.now()-1000);
 entries=rememberRoomVideo(entries,describeRoomMedia(video(2)));
 entries=rememberRoomVideo(entries,describeRoomMedia({...video(1),id:'room:alias'}));
 assert.equal(entries.length,2);assert.equal(entries[0].media.id,'room:alias');assert.deepEqual(readRoomHistory(JSON.stringify({version:1,entries})),entries);
 assert.equal(rememberRoomVideo(entries,{id:'local:secret',kind:'local',name:'private.mp4',local:{name:'private.mp4',fingerprint:'secret',size:123,modified:1}}).length,2);
 assert.equal(JSON.stringify(entries).includes('fingerprint'),false);
});
test('history is bounded and rejects corrupt, oversized, future and unsafe media',()=>{
 const entries=Array.from({length:100},(_,i)=>({media:describeRoomMedia(video(i)),watchedAt:Date.now()-i}));
 assert.equal(readRoomHistory(JSON.stringify({version:1,entries})).length,ROOM_HISTORY_LIMIT);
 for(const raw of ['{','x'.repeat(260000),JSON.stringify({version:2,entries}),JSON.stringify({version:1,entries:[{media:describeRoomMedia(video(1)),watchedAt:Infinity}]})])assert.deepEqual(readRoomHistory(raw),[]);
 assert.equal(rememberRoomVideo([],describeRoomMedia(video(1)),Date.now()+120000).length,0);
 assert.equal(rememberRoomVideo([],{...describeRoomMedia(video(1)),embedUrl:'https://evil.example/embed'}).length,0);
});
const renderer=(index,extra={})=>({videoRenderer:{videoId:`v${String(index).padStart(10,'0')}`,title:{runs:[{text:`Race ${index}`}]},ownerText:{runs:[{text:'Driver'}]},descriptionSnippet:{runs:[{text:'Wet race guide'}]},publishedTimeText:{simpleText:'2 days ago'},lengthText:{simpleText:'12:34'},viewCountText:{simpleText:'12,345 views'},...extra}});
test('public YouTube search reads only video results and the primary continuation',()=>{
 const root={contents:{twoColumnSearchResultsRenderer:{primaryContents:{sectionListRenderer:{contents:[{itemSectionRenderer:{contents:[renderer(1),{adSlotRenderer:{content:renderer(2)}},renderer(3,{thumbnailOverlays:[{thumbnailOverlayTimeStatusRenderer:{style:'LIVE'}}]})]}},{continuationItemRenderer:{continuationEndpoint:{continuationCommand:{token:'next-page'}}}}]}},secondaryContents:renderer(99)}}};
 const result=parseRoomYoutubeSearch(root);assert.equal(result.videos.length,2);assert.equal(result.cursor,'next-page');assert.equal(result.videos[0].duration,754);assert.equal(result.videos[0].remote.views,12345);assert.equal(result.videos[0].addedAt,0);assert.equal(result.videos[0].remote.publishedLabel,'2 days ago');assert.equal(result.videos[1].remote.live,true);assert.equal(result.videos[1].duration,undefined);
 const restored=resolveRoomMedia(describeRoomMedia(result.videos[0])).video;assert.equal(restored.remote.views,12345);assert.equal(restored.description,'Wet race guide');assert.equal(restored.addedAt,0);
});
test('search continuation parses independently and malformed input cannot choose an upstream URL',()=>{
 assert.equal(parseRoomYoutubeSearch({onResponseReceivedCommands:[{appendContinuationItemsAction:{continuationItems:[renderer(4)]}}]}).videos[0].name,'Race 4');
 assert.throws(()=>parseRoomYoutubeSearch({contents:{watchNextResults:[renderer(2)]}}),/readable/);
 assert.deepEqual(roomYoutubeSearchInput({query:' racing '}),{query:'racing',cursor:undefined});
 for(const value of [null,{query:''},{query:'x'.repeat(161)},{query:'racing',cursor:'x'.repeat(12001)},{query:'racing',cursor:'\n'}])assert.throws(()=>roomYoutubeSearchInput(value));
});
