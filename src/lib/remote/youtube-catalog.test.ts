import { test } from "node:test";
import assert from "node:assert/strict";
import { youtubeCatalogContinuation, youtubeCatalogHasTerminalPage, youtubeCatalogItems } from "./youtube-catalog.ts";

test("channel archive uses the selected Videos grid continuation", () => {
  const videos = [
    { richItemRenderer: { content: { lockupViewModel: { contentId: "video-one" } } } },
    { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: "videos-next-page" } } } },
  ];
  const root = {
    header: { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: "header-description" } } } },
    contents: { twoColumnBrowseResultsRenderer: { tabs: [
      { tabRenderer: { selected: false, content: { richGridRenderer: { contents: [{ continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: "other-tab" } } } }] } } } },
      { tabRenderer: { selected: true, content: { richGridRenderer: { contents: videos } } } },
    ] } },
  };
  assert.equal(youtubeCatalogItems(root), videos);
  assert.equal(youtubeCatalogContinuation(root), "videos-next-page");
});

test("continuation responses read appended video items", () => {
  const items = [
    { richItemRenderer: { content: { lockupViewModel: { contentId: "video-two" } } } },
    { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: "next-page" } } } },
  ];
  const root = { onResponseReceivedActions: [{ appendContinuationItemsAction: { continuationItems: items } }] };
  assert.equal(youtubeCatalogItems(root), items);
  assert.equal(youtubeCatalogContinuation(root), "next-page");
});

test("continuation responses read reload items used by refreshed Videos tabs", () => {
  const items = [
    { richItemRenderer: { content: { lockupViewModel: { contentId: "reloaded-video" } } } },
    { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: "reloaded-next" } } } },
  ];
  const root = { onResponseReceivedEndpoints: [{ reloadContinuationItemsCommand: { continuationItems: items } }] };
  assert.equal(youtubeCatalogItems(root), items);
  assert.equal(youtubeCatalogContinuation(root), "reloaded-next");
});

test("a populated Videos grid is recognized when YouTube omits the selected flag", () => {
  const videos = [{ videoRenderer: { videoId: "video-three" } }, { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: "videos-next" } } } }];
  const root = { contents: { twoColumnBrowseResultsRenderer: { tabs: [
    { tabRenderer: { title: "Home", content: { richGridRenderer: { contents: [{ videoRenderer: { videoId: "wrong-tab" } }] } } } },
    { tabRenderer: { title: "Videos", content: { richGridRenderer: { contents: videos } } } },
  ] } } };
  assert.equal(youtubeCatalogItems(root), videos);
  assert.equal(youtubeCatalogContinuation(root), "videos-next");
});

test("a unique populated grid is retained even without tab metadata", () => {
  const videos = [{ videoRenderer: { videoId: "video-four" } }];
  const root = { contents: { twoColumnBrowseResultsRenderer: { tabs: [
    { tabRenderer: { selected: false } },
    { tabRenderer: { content: { richGridRenderer: { contents: videos } } } },
  ] } } };
  assert.equal(youtubeCatalogItems(root), videos);
});

test("continuation tokens nested in a migrated row still resume the archive", () => {
  const root = { onResponseReceivedEndpoints: [{ appendContinuationItemsAction: { continuationItems: [
    { richItemRenderer: { content: { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: "nested-next" } } } } } },
  ] } }] };
  assert.equal(youtubeCatalogContinuation(root), "nested-next");
  assert.equal(youtubeCatalogHasTerminalPage(root), false);
});

test("unrecognized renderer-shaped rows are never declared a completed archive", () => {
  const unsupported = { unrelatedShelf: [{ videoRenderer: { videoId: "still-more" } }] };
  const finalPage = { onResponseReceivedActions: [{ appendContinuationItemsAction: { continuationItems: [{ videoRenderer: { videoId: "last-video" } }] } }] };
  assert.equal(youtubeCatalogHasTerminalPage(unsupported), false);
  assert.equal(youtubeCatalogHasTerminalPage(finalPage), true);
});
