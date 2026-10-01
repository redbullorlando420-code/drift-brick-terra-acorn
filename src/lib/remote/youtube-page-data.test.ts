import test from "node:test";
import assert from "node:assert/strict";
import { youtubeInitialData, youtubePageChannelId, youtubeVideoRenderers } from "./youtube-page-data.ts";
import { youtubeCatalogItems, youtubeCatalogContinuation } from "./youtube-catalog.ts";

test("initial data permits script suffixes and quoted braces", () => {
  const root = {text:'a }; </script> quoted " brace }', value:{x:2}};
  for (const prefix of ['var ytInitialData = ', 'window["ytInitialData"] = ', 'ytInitialData=']) {
    assert.deepEqual(youtubeInitialData(`<script>${prefix}${JSON.stringify(root)}; window.other = 3;\n</script>`), root);
  }
  assert.equal(youtubeInitialData('var ytInitialData={"incomplete":'), null);
});
test("page owner wins over recommended channel IDs", () => {
  const owner = "UC1234567890123456789012", wrong = "UC9999999999999999999999";
  const html = `var ytInitialData=${JSON.stringify({contents:{channelId:wrong},metadata:{channelMetadataRenderer:{externalId:owner}}})};`;
  assert.equal(youtubePageChannelId(html), owner);
  assert.equal(youtubePageChannelId(`var ytInitialData={"recommendations":{"channelId":"${wrong}"}};`), null);
});
test("uploads playlists preserve their exact catalog continuation", () => {
  const items = [{playlistVideoRenderer:{videoId:'abcdefghijk',title:{simpleText:'Upload'}}},{continuationItemRenderer:{continuationEndpoint:{continuationCommand:{token:'next-uploads'}}}}];
  const root = {header:{continuationCommand:{token:'wrong-header'}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,content:{sectionListRenderer:{contents:[{itemSectionRenderer:{contents:[{playlistVideoListRenderer:{contents:items}}]}}]}}}}]}}};
  assert.equal(youtubeCatalogItems(root), items);
  assert.equal(youtubeCatalogContinuation(root), 'next-uploads');
  assert.equal(youtubeVideoRenderers(items, 20)[0]?.videoId, 'abcdefghijk');
});
test("Shorts renderers and migrated lockups normalize without playlist recommendations", () => {
  const rows = [{shortsLockupViewModel:{onTap:{innertubeCommand:{reelWatchEndpoint:{videoId:'shorts12345'}}},overlayMetadata:{primaryText:{content:'Short title'}}}}, {reelItemRenderer:{videoId:'reel1234567',title:{simpleText:'Reel'}}}, {lockupViewModel:{contentType:'LOCKUP_CONTENT_TYPE_VIDEO',contentId:'modern12345',metadata:{lockupMetadataViewModel:{title:{content:'Modern'}}}}}, {lockupViewModel:{contentType:'LOCKUP_CONTENT_TYPE_PLAYLIST',contentId:'playlist123'}}];
  assert.deepEqual(youtubeVideoRenderers(rows, 20).map(row=>row.videoId), ['shorts12345','reel1234567','modern12345']);
  assert.equal(youtubeVideoRenderers(rows, 1).length, 1);
});
test("playlist continuation contents keep page tokens", () => {
  const root = {continuationContents:{playlistVideoListContinuation:{contents:[{playlistVideoRenderer:{videoId:'abcdefghijk'}}],continuations:[{nextContinuationData:{continuation:'older'}}]}}};
  assert.equal(youtubeCatalogContinuation(root), 'older');
});
