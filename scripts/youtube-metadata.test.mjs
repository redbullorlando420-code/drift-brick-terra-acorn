import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(s,c,n) { if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e} } });
const { youtubePublicationTime, youtubeContentKind, youtubeDateSource, exactYoutubePublished, youtubeRendererMetadata } = await import('../src/lib/videos/youtube-metadata.ts');
const { catalogCard, withCatalogDetails } = await import('../src/lib/videos/catalog-card.ts');
const { mergeRemoteCatalogAsync, mergeRemoteRefreshAsync } = await import('../src/lib/videos/remote-merge.ts');
const { youtubeVideoRenderers } = await import('../src/lib/remote/youtube-page-data.ts');
const { publicPlaylistEntries } = await import('../src/lib/remote/youtube-playlist.ts');
const { youtubeCatalogSelection } = await import('../src/lib/videos/youtube-catalog-selection.ts');
const { prepareYoutubeBrowse, youtubeBrowseGroups } = await import('../src/lib/videos/youtube-browse.ts');
const { youtubeCoverageIndex } = await import('../src/lib/remote/youtube-coverage.ts');
const { youtubeSourceIndex } = await import('../src/lib/remote/youtube-sources.ts');
const { youtubeOutsideFollows, youtubeTopicIndex } = await import('../src/lib/remote/youtube-discovery.ts');
const { mixYoutubeCreators } = await import('../src/lib/remote/youtube-mix.ts');
const { runRefreshRemotes, runFollowRemote } = await import('../src/lib/remote/api.ts');
const { setYoutubeRequestGap } = await import('../src/lib/remote/youtube-transport.ts');
setYoutubeRequestGap(0);
const published=Date.parse('2026-09-01T12:00:00Z');
const card=(id='one',remote={})=>({id:`yt:${id}`,folderId:'yt:creator',name:`Upload ${id}`,path:id,size:0,mime:'video/youtube',extension:'yt',addedAt:published,remote:{kind:'youtube',videoId:id,channelName:'Creator',...remote}});

test('publication evidence accepts exact dates and rejects relative, scheduled-era and calendar overflow values',()=>{
  for(const value of ['2026-09-01','2026-09-01T12:00:00Z','2026-09-01T12:00:00-04:00'])assert.equal(exactYoutubePublished(value),value);
  for(const value of ['3 days ago','Streamed 2 days ago','Scheduled for today','2026-02-30','2026-02-30T12:00:00Z','1970-01-02','bad'])assert.equal(exactYoutubePublished(value),undefined);
  assert.equal(youtubePublicationTime(card('bad',{publishedSource:'unknown'})),0);
});
test('RSS provenance prevents synthetic-description repair from erasing a real date and survives compact/disk details',()=>{
  const original={...card('rss',{publishedSource:'rss'}),description:'Creator public channel catalog item.'};
  const compact=catalogCard(original);assert.equal(compact.addedAt,published);assert.equal(compact.remote.publishedSource,'rss');assert(!compact.description);
  const restored=withCatalogDetails(compact,original);assert.equal(restored.description,original.description);assert.equal(restored.remote.publishedSource,'rss');
  assert.equal(catalogCard({...original,remote:{...original.remote,publishedSource:undefined}}).addedAt,0);
});
test('shallow refreshes retain RSS dates, formats and current live evidence; exact RSS corrections win',async()=>{
  const previous=card('one',{publishedSource:'rss',youtubeType:'short',live:true,observedAt:Date.now()});
  const partial={...card('one',{publishedSource:'unknown'}),addedAt:0};
  const next=(await mergeRemoteCatalogAsync([previous],[partial]))[0];
  assert.equal(next.addedAt,published);assert.equal(next.remote.publishedSource,'rss');assert.equal(next.remote.youtubeType,'short');assert.equal(next.remote.live,true);
  const weaker={...card('one',{publishedSource:'provider'}),addedAt:published+86400000};
  assert.equal((await mergeRemoteCatalogAsync([previous],[weaker]))[0].addedAt,published);
  const corrected={...card('one',{publishedSource:'rss'}),addedAt:published-86400000};
  assert.equal((await mergeRemoteCatalogAsync([previous],[corrected]))[0].addedAt,corrected.addedAt);
});
test('format and date-source repairs are published even when title and epoch stay equal',async()=>{
  const original=card(),incoming=card('one',{publishedSource:'rss',youtubeType:'replay'});
  const merged=await mergeRemoteCatalogAsync([original],[incoming]);assert.notEqual(merged[0],original);assert.equal(merged[0].remote.youtubeType,'replay');assert.equal(merged[0].remote.publishedSource,'rss');
  assert.equal(await mergeRemoteCatalogAsync(merged,[incoming]),merged,'an identical repeated repair shares the original array');
});
test('format evidence comes from provider fields, never video duration or title words',()=>{
  assert.equal(youtubeRendererMetadata({publishedTimeText:{simpleText:'Streamed 3 days ago'}}).youtubeType,'replay');
  assert.equal(youtubeRendererMetadata({isLive:true}).youtubeType,'live');
  assert.equal(youtubeRendererMetadata({upcomingEventData:{startTime:'1800000000'},isLive:true}).youtubeType,'upcoming');
  assert.equal(youtubeRendererMetadata({navigationEndpoint:{reelWatchEndpoint:{}}}).youtubeType,'short');
  assert.equal(youtubeRendererMetadata({title:{simpleText:'Streamed live highlights'},lengthSeconds:30}).youtubeType,undefined);
  assert.equal(youtubeRendererMetadata({publishedTimeText:{simpleText:'Streamed 3 days ago'}}).published,undefined);
  assert.equal(youtubeRendererMetadata({thumbnailOverlays:[{thumbnailOverlayTimeStatusRenderer:{style:'DEFAULT'}}]}).youtubeType,'upload');
  assert.equal(youtubeContentKind(card('legacy',{youtubeType:'bad'})),'upload');
});
test('old and modern Shorts/lockup renderers retain format, live and upcoming evidence',()=>{
  const rows=youtubeVideoRenderers([{reelItemRenderer:{videoId:'short-old'}},{shortsLockupViewModel:{onTap:{innertubeCommand:{reelWatchEndpoint:{videoId:'short-new'}}}}},
    ...['LIVE','UPCOMING'].map((style)=>({lockupViewModel:{contentType:'LOCKUP_CONTENT_TYPE_VIDEO',contentId:style,contentImage:{thumbnailViewModel:{overlays:[{thumbnailBottomOverlayViewModel:{badges:[{thumbnailBadgeViewModel:{badgeStyle:`THUMBNAIL_OVERLAY_BADGE_STYLE_${style}`}}]}}]}}}}))],20);
  assert.deepEqual(rows.map(row=>youtubeRendererMetadata(row).youtubeType),['short','short','live','upcoming']);
  const playlist=publicPlaylistEntries({lockupViewModel:{contentType:'LOCKUP_CONTENT_TYPE_VIDEO',contentId:'replay',metadata:{lockupMetadataViewModel:{metadata:{contentMetadataViewModel:{metadataRows:[{metadataParts:[{text:{content:'Streamed 3 days ago'}}]}]}}}}}},10);
  assert.equal(playlist[0].metadata.youtubeType,'replay');
});
test('cooperative groups isolate live/upcoming cards, share stable records, preserve order and cancel cleanly',async()=>{
  const rows=Array.from({length:5000},(_,i)=>card(String(i),{youtubeType:['upload','short','replay','live','upcoming'][i%5]}));
  let turns=0;await prepareYoutubeBrowse(rows,undefined,async()=>{turns++;});const groups=youtubeBrowseGroups(rows);
  assert(turns>=2);assert.equal(groups.all.length,3000);assert.equal(groups.live.length,1000);assert.equal(groups.upcoming.length,1000);
  assert.equal(groups.short[0],rows[1]);assert.equal(groups.replay[0],rows[2]);assert.equal(groups.all[0],rows[0]);assert.equal(youtubeBrowseGroups(rows),groups);
  const ordinary=Array.from({length:1000},(_,i)=>card(String(i)));await prepareYoutubeBrowse(ordinary,undefined,async()=>{});
  assert.equal(youtubeBrowseGroups(ordinary).all,ordinary);assert.equal(youtubeBrowseGroups(ordinary).upload,ordinary);
  const controller=new AbortController();await assert.rejects(prepareYoutubeBrowse(rows.slice(),controller.signal,async()=>controller.abort()),{name:'AbortError'});
});
test('unknown publication dates sort last and never become creator freshness or cached-upload coverage',async()=>{
  const unknown={...card('unknown',{publishedSource:'unknown'}),addedAt:Date.now()};
  const rows=[unknown,card('known',{publishedSource:'rss'}),card('live',{youtubeType:'live',live:true}),card('future',{youtubeType:'upcoming'})];
  const selected=await youtubeCatalogSelection({videos:rows,privateFolders:new Set(),unavailable:{},hiddenVideos:{},hideDemo:false},undefined,async()=>{});
  assert.equal(selected.at(-1),unknown);
  const coverage=youtubeCoverageIndex(rows);assert.equal(coverage.bySource.get('yt:creator'),2);assert.equal(coverage.newestBySource.get('yt:creator'),published);assert.equal(coverage.distinctVideos,4);
  assert.deepEqual(youtubeSourceIndex(rows).bySource.get('yt:creator'),[unknown,rows[1]],'creator catalogs agree with cached archive coverage');
  assert.deepEqual(youtubeOutsideFollows(rows,[]),[unknown,rows[1]]);
  const topics=youtubeTopicIndex(rows,Object.fromEntries(rows.map(row=>[row.id,['space']])));
  assert.deepEqual(topics.get('space'),[unknown,rows[1]]);
  assert.deepEqual(mixYoutubeCreators(rows,0,10,'latest').map(row=>row.id),['yt:known','yt:unknown']);
});
test('RSS/archive success preserves live state; a successful live check records a durable completed stream',async()=>{
  const live={...card('live',{youtubeType:'live',live:true,observedAt:Date.now(),publishedSource:'unknown'}),addedAt:0};
  const existing=[live],endedYoutubeRows=[],staleLiveIds=[];
  assert.equal(await mergeRemoteRefreshAsync(existing,[],['yt:creator'],new Set(),{liveCheckedIds:[]}),existing);
  const ended=await mergeRemoteRefreshAsync(existing,[],['yt:creator'],new Set(),{liveCheckedIds:['yt:creator'],endedYoutubeRows,staleLiveIds});
  assert.equal(ended[0].remote.live,false);assert.equal(ended[0].remote.youtubeType,'replay');assert.equal(ended[0].addedAt,0);
  assert.deepEqual(endedYoutubeRows,[ended[0]]);assert.deepEqual(staleLiveIds,[live.id]);assert.equal(catalogCard(endedYoutubeRows[0]).remote.youtubeType,'replay');
  const playlistLive={...live,folderId:'ytpl:saved',remote:{...live.remote,channelId:'creator',sourceIds:['ytpl:saved','yt:creator']}};
  const playlistEnded=await mergeRemoteRefreshAsync([playlistLive],[],['yt:creator'],new Set(),{liveCheckedIds:['yt:creator']});
  assert.equal(playlistEnded[0].remote.youtubeType,'replay');assert.deepEqual(playlistEnded[0].remote.sourceIds,playlistLive.remote.sourceIds);
  const upcoming=card('premiere',{youtubeType:'upcoming'});
  const published=card('premiere',{...youtubeRendererMetadata({thumbnailOverlays:[{thumbnailOverlayTimeStatusRenderer:{style:'DEFAULT'}}]}),live:false});
  assert.equal((await mergeRemoteCatalogAsync([upcoming],[published]))[0].remote.youtubeType,'upload','confirmed upload metadata releases a previously scheduled event');
});
const creator='UC1234567890123456789012';
const follow={id:`yt:${creator}`,kind:'youtube',handle:`https://www.youtube.com/channel/${creator}`,channelId:creator,title:'Metadata creator'};
const feed='<feed><author><name>Metadata creator</name></author><entry><yt:videoId>datemeta001</yt:videoId><title>Known upload</title><published>2026-09-01T12:00:00Z</published></entry></feed>';
test('actual RSS and archive paths retain publication provenance and format evidence with no fake current dates',async()=>{
  const original=globalThis.fetch;let requests=0;
  globalThis.fetch=async(url)=>{requests++;return String(url).includes('/feeds/')?new Response(feed):Response.json({onResponseReceivedActions:[{appendContinuationItemsAction:{continuationItems:[
    {videoRenderer:{videoId:'datemeta001',title:{simpleText:'Known upload'},publishDate:'2026-10-01',isLiveContent:true}},
    {reelItemRenderer:{videoId:'datemeta002',title:{simpleText:'A Short'},publishedTimeText:{simpleText:'2 days ago'}}},
    {videoRenderer:{videoId:'datemeta003',title:{simpleText:'Upcoming'},upcomingEventData:{startTime:'1800000000'}}},
  ]}}]});};
  try{
    const shallow=await runRefreshRemotes({channels:[follow]});assert.equal(requests,1);assert.deepEqual(shallow.liveCheckedIds,[]);assert.equal(shallow.videos[0].remote.publishedSource,'rss');
    const deep=await runRefreshRemotes({channels:[follow],youtubeCatalog:true,youtubeVideoLimit:100});
    assert.equal(deep.videos.length,3);assert.deepEqual(deep.liveCheckedIds,[]);
    const dated=deep.videos.find(row=>row.remote.videoId==='datemeta001');assert.equal(dated.addedAt,published);assert.equal(dated.remote.publishedSource,'rss');assert.equal(dated.remote.youtubeType,'replay');
    const short=deep.videos.find(row=>row.remote.videoId==='datemeta002');assert.equal(short.remote.youtubeType,'short');assert.equal(short.addedAt,0);assert.equal(short.remote.publishedSource,'unknown');
    assert.equal(deep.videos.find(row=>row.remote.videoId==='datemeta003').remote.youtubeType,'upcoming');
  }finally{globalThis.fetch=original;}
});
test('actual live checks supply a separate observation signal and no publication timestamp',async()=>{
  const original=globalThis.fetch;let on=true;
  globalThis.fetch=async()=>Response.json({metadata:{channelMetadataRenderer:{externalId:creator}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,title:'Live',content:{richGridRenderer:{contents:on?[{videoRenderer:{videoId:'datemeta004',title:{simpleText:'Current stream'},thumbnailOverlays:[{thumbnailOverlayTimeStatusRenderer:{style:'LIVE'}}]}}]:[]}}}}]}}});
  try{
    const live=await runRefreshRemotes({channels:[follow],youtubeLiveOnly:true});assert.deepEqual(live.liveCheckedIds,[follow.id]);assert.equal(live.videos[0].addedAt,0);assert.equal(live.videos[0].remote.publishedSource,'unknown');assert.equal(live.videos[0].remote.youtubeType,'live');assert(live.videos[0].remote.observedAt>0);
    on=false;const offline=await runRefreshRemotes({channels:live.channels,youtubeLiveOnly:true});assert.deepEqual(offline.liveCheckedIds,[follow.id]);assert.equal(offline.videos.length,0);assert.equal(offline.channels[0].live,false);
  }finally{globalThis.fetch=original;}
});
test('direct oEmbed imports keep publication unknown and explicit Shorts URLs retain their format',async()=>{
  const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({title:'Saved old video',author_name:'Metadata creator'});
  try{const result=await runFollowRemote({query:'https://www.youtube.com/watch?v=datemeta005',kind:'youtube'});assert.equal(result.videos[0].addedAt,0);assert.equal(result.videos[0].remote.publishedSource,'unknown');const short=await runFollowRemote({query:'https://www.youtube.com/shorts/datemeta005',kind:'youtube'});assert.equal(short.videos[0].remote.youtubeType,'short');assert.equal(short.videos[0].addedAt,0);}
  finally{globalThis.fetch=original;}
});
