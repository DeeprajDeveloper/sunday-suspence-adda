import { NextRequest, NextResponse } from "next/server";
import { parseStoryTitle } from "@/lib/parse-title";

const VIDEO_ID = /^[\w-]{11}$/;

type OEmbed = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
};

async function fetchMeta(id: string) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = (await res.json()) as OEmbed;
  if (!data.title) return null;
  return {
    videoId: id,
    title: data.title,
    ...parseStoryTitle(data.title),
    author: parseStoryTitle(data.title).author || data.author_name,
    thumbnail: data.thumbnail_url,
    channelTitle: data.author_name || "Mirchi Bangla",
  };
}

export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => VIDEO_ID.test(id))
    .slice(0, 8);

  if (ids.length === 0) {
    return NextResponse.json({ error: "invalid ids" }, { status: 400 });
  }

  const items = (await Promise.all(ids.map(fetchMeta))).filter(Boolean);
  return NextResponse.json({ items });
}
