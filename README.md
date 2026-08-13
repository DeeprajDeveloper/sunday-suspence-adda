# Sunday Suspense Adda

A one-page music player for the public [Sunday Suspense Collection](https://www.youtube.com/playlist?list=PLDfPvBheqN1M) playlist. YouTube stays the source of truth; this site is just a listening room.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Playback works without an API key. The queue fills from the YouTube player (and the public RSS feed for the latest titles).

## Full track list (recommended)

To show every episode title in the queue on first load:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **YouTube Data API v3**.
3. Create an **API key** and restrict it to your domain (and `localhost:3000` while developing).
4. Put the key in `.env.local`:

```
YOUTUBE_API_KEY=your_key_here
YOUTUBE_PLAYLIST_ID=PLDfPvBheqN1M
NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID=PLDfPvBheqN1M
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Add the same environment variables in the Vercel dashboard.
4. Deploy.

The playlist ID is already set to `PLDfPvBheqN1M`. Change it if you curate a different list.
