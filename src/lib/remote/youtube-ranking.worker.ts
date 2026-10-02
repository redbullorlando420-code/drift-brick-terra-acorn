import { createYoutubeRankingProcessor, type YoutubeRankingMessage } from './youtube-ranking-protocol';
const process = createYoutubeRankingProcessor((ids, offsets) => self.postMessage({ ids, offsets }));
self.onmessage = ({ data }: MessageEvent<YoutubeRankingMessage>) => process(data);
