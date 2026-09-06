import type { Folder, LibraryVideo } from "./types";

export const DEMO_FOLDER_ID = "demo";
export const YT_FOLDER_ID = "youtube:featured";

export const DEMO_FOLDER: Folder = {
  id: DEMO_FOLDER_ID,
  name: "Classics",
  kind: "demo",
  videoCount: 4,
};

export const YT_FOLDER: Folder = {
  id: YT_FOLDER_ID,
  name: "YouTube",
  kind: "youtube",
  videoCount: 4,
};

function ytFilm(opts: {
  id: string;
  name: string;
  year: number;
  duration: number;
  genre: string;
  tagline: string;
  channel: string;
}): LibraryVideo {
  const videoId = opts.id;
  return {
    id: `yt:${videoId}`,
    folderId: YT_FOLDER_ID,
    name: opts.name,
    path: `youtube/${opts.name}`,
    extension: "yt",
    mime: "video/youtube",
    size: 0,
    duration: opts.duration,
    addedAt: 20 + opts.year,
    year: opts.year,
    genre: opts.genre,
    tagline: opts.tagline,
    poster: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    src: `https://www.youtube.com/embed/${videoId}`,
    remote: {
      kind: "youtube",
      videoId,
      channelName: opts.channel,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    },
  };
}

export const FEATURED_YOUTUBE: LibraryVideo[] = [
  ytFilm({
    id: "aqz-KE-bpKQ",
    name: "Big Buck Bunny",
    year: 2008,
    duration: 596,
    genre: "Animation",
    tagline: "An open movie from the Blender Foundation.",
    channel: "Blender",
  }),
  ytFilm({
    id: "Y-rmzh0PI3c",
    name: "Cosmos Laundromat",
    year: 2015,
    duration: 720,
    genre: "Fantasy",
    tagline: "A down-on-his-luck sheep, and a deal.",
    channel: "Blender",
  }),
  ytFilm({
    id: "R6MlUcmOul8",
    name: "Tears of Steel",
    year: 2012,
    duration: 734,
    genre: "Sci-Fi",
    tagline: "Amsterdam, after the machines.",
    channel: "Blender",
  }),
  ytFilm({
    id: "UXqq0ZvbOnk",
    name: "Charge",
    year: 2022,
    duration: 720,
    genre: "Sci-Fi",
    tagline: "A Blender Studio open movie.",
    channel: "Blender Studio",
  }),
  ytFilm({ id: "eRsGyueVLvQ", name: "Elephants Dream", year: 2006, duration: 650, genre: "Sci-Fi", tagline: "The first Blender open movie.", channel: "Blender" }),
  ytFilm({ id: "YE7VzlLtp-4", name: "Sintel", year: 2010, duration: 888, genre: "Fantasy", tagline: "An open adventure from Blender.", channel: "Blender" }),
  ytFilm({ id: "XCejtdKK40o", name: "Caminandes", year: 2013, duration: 120, genre: "Animation", tagline: "A short open-film journey.", channel: "Blender" }),
  ytFilm({ id: "mN0zPOpADL4", name: "Agent 327", year: 2017, duration: 210, genre: "Animation", tagline: "A Blender Studio open project.", channel: "Blender Studio" }),
];

export const SAMPLE_VIDEOS: LibraryVideo[] = [
  {
    id: "demo:night-rain",
    folderId: DEMO_FOLDER_ID,
    name: "Night Rain",
    path: "Night Rain.mp4",
    extension: "mp4",
    mime: "video/mp4",
    size: 6468106,
    duration: 6,
    addedAt: 1,
    isSample: true,
    src: "/samples/night-rain.mp4",
    year: 1947,
    genre: "Noir",
    tagline: "The city never dries.",
    collection: "classics",
    poster: "/posters/night-rain.jpg",
  },
  {
    id: "demo:empty-house",
    folderId: DEMO_FOLDER_ID,
    name: "Empty House",
    path: "Empty House.mp4",
    extension: "mp4",
    mime: "video/mp4",
    size: 3499342,
    duration: 6,
    addedAt: 2,
    isSample: true,
    src: "/samples/empty-house.mp4",
    year: 1961,
    genre: "Drama",
    tagline: "Something stayed behind.",
    collection: "classics",
    poster: "/posters/empty-house.jpg",
  },
  {
    id: "demo:golden-coast",
    folderId: DEMO_FOLDER_ID,
    name: "Golden Coast",
    path: "Golden Coast.mp4",
    extension: "mp4",
    mime: "video/mp4",
    size: 15807485,
    duration: 6,
    addedAt: 3,
    isSample: true,
    src: "/samples/golden-coast.mp4",
    year: 1958,
    genre: "Romance",
    tagline: "Light on the water.",
    collection: "classics",
    poster: "/posters/golden-coast.jpg",
  },
  {
    id: "demo:tungsten-reel",
    folderId: DEMO_FOLDER_ID,
    name: "Tungsten Reel",
    path: "Tungsten Reel.mp4",
    extension: "mp4",
    mime: "video/mp4",
    size: 4498613,
    duration: 6,
    addedAt: 4,
    isSample: true,
    src: "/samples/tungsten-reel.mp4",
    year: 1932,
    genre: "Studio",
    tagline: "The lamp still burns.",
    collection: "classics",
    poster: "/posters/tungsten-reel.jpg",
  },
];

