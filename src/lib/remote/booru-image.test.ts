import assert from "node:assert/strict";
import test from "node:test";
import { booruPostImageUrls } from "./booru-image.ts";

test("resized booru post keeps its original image link", () => {
  const html = '<a href="//images.example.org/images/original.png">Original image</a><img alt="post" src="//images.example.org/samples/resized.jpg" id="image">';
  assert.deepEqual(booruPostImageUrls(html), {
    original: "//images.example.org/images/original.png",
    sample: "//images.example.org/samples/resized.jpg",
  });
});
test('nested download links, file attributes and full-size post images are recognized', () => {
  assert.equal(booruPostImageUrls('<a href="/images/full.png"><strong>Download</strong></a><img id="image" src="/samples/small.jpg">').original, '/images/full.png');
  assert.equal(booruPostImageUrls('<article data-file-url="//cdn.test/original.png?a=1&amp;b=2"></article>').original, '//cdn.test/original.png?a=1&b=2');
  assert.equal(booruPostImageUrls('<img id="image" src="/images/full.jpg">').original, '/images/full.jpg');
  assert.equal(booruPostImageUrls('<img id="image" src="/thumbnails/tiny.jpg">').original, undefined);
});
