/// <reference lib="webworker" />
import { createPreviewRankingProcessor, type PreviewWorkerRequest } from "./preview-ranking-protocol";
const process = createPreviewRankingProcessor(result => self.postMessage(result));
self.onmessage = ({ data }: MessageEvent<PreviewWorkerRequest>) => process(data);
