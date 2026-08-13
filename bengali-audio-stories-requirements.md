# Requirements Document: Bengali Audio Stories Playlist Site

## 1. Overview
A minimal, single-page website that plays a **public YouTube playlist** of Bengali audio stories, styled to look and feel like a **music player** (not a video embed) — persistent bottom player bar, custom controls, settings tucked away. Hosted for free on Vercel.

**Working name:** _(TBD — e.g. "গল্পঘর" / GolpoGhor / "AudioAdda")_

## 2. Goals
- Let visitors listen to a curated Bengali audio story playlist without it feeling like "watching YouTube."
- One page. Bottom player bar (à la Spotify/Apple Music web player), settings button somewhere on top/side.
- Ship fast — MVP in a single weekend, zero/near-zero cost.
- Fully deployable on Vercel's free tier, no backend/database required.

## 3. Non-Goals (v1)
- No active-visitor counter or any real-time backend state (parked for later).
- No user accounts / login.
- No custom audio hosting — YouTube remains the source of truth for content.
- No comments, likes, or social features.
- No admin dashboard for adding videos (playlist is managed directly on YouTube).
- No mobile app.

## 4. Target Users
Bengali-speaking listeners looking for audio stories (like a radio/podcast experience) — casual, mobile-first browsing.

## 5. Core Features (MVP)

### 5.1 Custom "Music Player" UI over the YouTube Playlist
- Load the playlist via the **YouTube IFrame Player API** with `controls=0` (native YouTube control bar hidden).
- The actual video element is shrunk down small — used more like album art than a video window — positioned inside the bottom player bar, not as the page's focal point.
- **Bottom player bar** (persistent, fixed to bottom of viewport) contains:
  - Small thumbnail/art
  - Current story title (and maybe uploader/series name)
  - Play/pause, previous, next buttons
  - Seek/progress bar (scrub through the current story)
  - Volume control
- **Settings button** (top-right corner, or wherever feels natural) opens a small panel/drawer with:
  - Track list / "up next" queue (pulled via **YouTube Data API v3** `playlistItems.list`, so titles show even before playing)
  - Maybe playback speed, shuffle/repeat toggle
- Autoplay next story when current one finishes (`onStateChange` event, state `ENDED`).
- **Known platform limits (not bugs):**
  - A small YouTube attribution must stay visible on the player per YouTube's embed terms — can be subtle, not fully hidden.
  - Autoplay with sound needs one user click first (browser policy) — first "play" tap starts it, everything after (including auto-advancing to next track) plays freely.

### 5.2 Simple, Bengali-friendly Page
- Just one page: minimal header/title at top, mostly empty/branded space in the middle (maybe playlist art, background pattern, or the settings drawer when open), player bar fixed at the bottom.
- Use a Bengali-supporting web font (e.g. Noto Sans Bengali / Hind Siliguri) for titles/labels.
- Fully responsive — most traffic likely mobile, so the bottom bar should feel natural on a phone (similar to Spotify's mobile mini-player).

## 6. Tech Stack
- **Framework:** Next.js (App Router) — deploys natively to Vercel, supports Serverless/Edge Functions for the visitor-count API.
- **Styling:** Tailwind CSS (fast to build a clean UI).
- **APIs:**
  - YouTube IFrame Player API (playback)
  - YouTube Data API v3 (fetch playlist item list/titles/thumbnails) — needs a free Google Cloud API key, restricted to your domain.
- **Hosting:** Vercel (Hobby/free plan) — pure static/frontend deploy, no database or serverless function needed for v1.
- **Domain:** Vercel's free `*.vercel.app` subdomain, or bring your own domain later.

## 7. Data Needed From You
- The public YouTube **playlist ID** (from the playlist URL, e.g. `list=PLxxxxxxxx`).
- A Google Cloud project + free **YouTube Data API v3 key**.

## 8. Deployment Checklist
1. Push code to GitHub.
2. Import repo into Vercel → auto-detects Next.js.
3. Add environment variables in Vercel dashboard: `YOUTUBE_API_KEY`, `YOUTUBE_PLAYLIST_ID`.
4. Deploy — done, live on `yourproject.vercel.app`.

## 9. Success Metrics (informal, v1)
- Site loads and plays the playlist without errors on mobile + desktop.
- Visitor counter updates within ~15 seconds of someone joining/leaving.
- Positive reactions when shared in relevant Bengali community spaces.

## 10. Future Ideas (post-MVP, not in scope now)
- Live "active visitors" counter (would need Upstash Redis or Firebase presence — small backend addition)
- Multiple curated playlists/categories (horror, folk tales, kids' stories, etc.)
- "Now playing" history / recently played
- Shareable link to a specific story with timestamp
- Dark mode
- Basic analytics (Vercel Analytics is free and easy to bolt on)
