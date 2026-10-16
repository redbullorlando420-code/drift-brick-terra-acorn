import { createYoutubeRankingProcessor, type YoutubeRankingMessage } from './youtube-ranking-protocol';
const process = createYoutubeRankingProcessor((ids, offsets, detail) => self.postMessage({ ids, offsets, ...detail }));
self.onmessage = ({ data }: MessageEvent<YoutubeRankingMessage>) => process(data);
