import type { LibraryVideo, RemoteRef } from './types';

const VIDEO_FIELDS = ['duration', 'isSample', 'src', 'genre', 'tagline', 'description', 'poster'] as const;
const REMOTE_FIELDS = ['sourceKinds', 'sourceIds', 'videoId', 'channelId', 'channelName', 'live', 'embedUrl', 'watchUrl', 'previewUrl', 'thumbFallbacks'] as const;
function copyDefined<T extends object>(target: T, source: T, fields: readonly (keyof T)[]) {
  for (const field of fields) {
    const value = source[field];
    if (value !== undefined) target[field] = value;
  }
}

/** Worker projection: retain count, topic, source, dedupe and resume evidence.
 * Never clone playback transcripts, blobs or unrelated provider fields. Saved
 * catalog records remain intact; review actions resolve the original by ID. */
export function statsVideo(video: LibraryVideo): LibraryVideo {
  const remote = video.remote;
  const result: LibraryVideo = {
    id: video.id, folderId: video.folderId, name: video.name, path: video.path,
    extension: video.extension, mime: video.mime, size: video.size, addedAt: video.addedAt,
  };
  copyDefined(result, video, VIDEO_FIELDS);
  if (remote) {
    const reference: RemoteRef = { kind: remote.kind };
    copyDefined(reference, remote, REMOTE_FIELDS);
    result.remote = reference;
  }
  return result;
}
