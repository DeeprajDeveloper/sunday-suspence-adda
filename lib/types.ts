export type Track = {
  videoId: string;
  title: string;
  displayTitle: string;
  englishTitle?: string;
  author?: string;
  thumbnail: string;
  channelTitle: string;
  position: number;
};

export type PlaylistData = {
  playlistId: string;
  title: string;
  tracks: Track[];
  source: "youtube-api" | "rss";
};

export type RepeatMode = "off" | "all" | "one";
