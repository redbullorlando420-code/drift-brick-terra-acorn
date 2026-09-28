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
