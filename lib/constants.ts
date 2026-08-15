export const DEFAULT_PLAYLIST_ID = "PLDfPvBheqN1M";

export const SITE_NAME = "Sunday Suspense Adda";
export const SITE_NAME_BN = "সানডে সাসপেন্স আড্ডা";
export const SITE_TAGLINE_BN = "অন্ধকারে গল্প, মনে ভয়";
export const SITE_DESCRIPTION =
  `${SITE_TAGLINE_BN} — a Bengali horror audio-story player for the Sunday Suspense collection by Mirchi Bangla.`;
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://sunday-suspense-adda.vercel.app";

export function playlistId() {
  return (
    process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID ??
    process.env.YOUTUBE_PLAYLIST_ID ??
    DEFAULT_PLAYLIST_ID
  );
}

export function thumbnailUrl(videoId: string, quality: "hq" | "sd" | "mq" | "max" = "hq") {
  const file =
    quality === "max"
      ? "maxresdefault.jpg"
      : quality === "sd"
        ? "sddefault.jpg"
        : quality === "mq"
          ? "mqdefault.jpg"
          : "hqdefault.jpg";
  return `https://i.ytimg.com/vi/${videoId}/${file}`;
}
