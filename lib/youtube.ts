import { playlistId, thumbnailUrl } from "./constants";
import { decodeXml } from "./format";
import { parseStoryTitle } from "./parse-title";
import type { PlaylistData, Track } from "./types";

const fetchOptions = { next: { revalidate: 3600 } } as const;

function toTrack(
  videoId: string,
  title: string,
  channelTitle: string,
  position: number,
  thumb?: string,
): Track {
  const parsed = parseStoryTitle(title);
  return {
    videoId,
    title,
    displayTitle: parsed.displayTitle,
    englishTitle: parsed.englishTitle,
    author: parsed.author,
    thumbnail: thumb || thumbnailUrl(videoId),
    channelTitle,
    position,
  };
}

function isUnavailable(title: string) {
  return title === "Private video" || title === "Deleted video";
}

async function fetchViaDataApi(
  id: string,
  apiKey: string,
): Promise<PlaylistData> {
  const tracks: Track[] = [];
  let pageToken: string | undefined;
  let playlistTitle = "Sunday Suspense Collection";

  const metaUrl = new URL("https://www.googleapis.com/youtube/v3/playlists");
  metaUrl.searchParams.set("part", "snippet");
  metaUrl.searchParams.set("id", id);
  metaUrl.searchParams.set("key", apiKey);
  const metaRes = await fetch(metaUrl, fetchOptions);
  if (metaRes.ok) {
    const meta = (await metaRes.json()) as {
      items?: { snippet?: { title?: string } }[];
    };
    playlistTitle = meta.items?.[0]?.snippet?.title || playlistTitle;
  }

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", id);
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
      throw new Error(`YouTube Data API ${res.status}`);
    }

    const data = (await res.json()) as {
      nextPageToken?: string;
      items?: {
        snippet?: {
          title?: string;
          channelTitle?: string;
          position?: number;
          resourceId?: { videoId?: string };
          thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
        };
      }[];
    };

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      const title = snippet?.title ?? "";
      if (!videoId || isUnavailable(title)) continue;
      tracks.push(
        toTrack(
          videoId,
          title,
          snippet?.channelTitle || "Mirchi Bangla",
          snippet?.position ?? tracks.length,
          snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.high?.url,
        ),
      );
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return { playlistId: id, title: playlistTitle, tracks, source: "youtube-api" };
}

async function fetchViaRss(id: string): Promise<PlaylistData> {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${id}`,
    fetchOptions,
  );
  if (!res.ok) {
    throw new Error(`YouTube RSS ${res.status}`);
  }

  const xml = await res.text();
  const feedTitle =
    decodeXml(xml.match(/<feed[\s\S]*?<title>([\s\S]*?)<\/title>/)?.[1] ?? "") ||
    "Sunday Suspense Collection";

  const tracks: Track[] = [];
  const entries = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
  for (const match of entries) {
    const entry = match[1];
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = decodeXml(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const author = decodeXml(
      entry.match(/<author>\s*<name>([\s\S]*?)<\/name>/)?.[1] ?? "",
    );
    const thumb = entry.match(/<media:thumbnail url="([^"]+)"/)?.[1];
    if (!videoId || !title) continue;
    tracks.push(toTrack(videoId, title, author || "Mirchi Bangla", tracks.length, thumb));
  }

  return { playlistId: id, title: feedTitle, tracks, source: "rss" };
}

export async function getPlaylist(): Promise<PlaylistData> {
  const id = playlistId();
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      return await fetchViaDataApi(id, apiKey);
    } catch (error) {
      console.error("YouTube Data API failed, falling back to RSS", error);
    }
  }

  try {
    return await fetchViaRss(id);
  } catch (error) {
    console.error("YouTube RSS failed", error);
    return {
      playlistId: id,
      title: "Sunday Suspense Collection",
      tracks: [],
      source: "rss",
    };
  }
}
