"use client";

import { useEffect, useState } from "react";
import { SITE_NAME, SITE_NAME_BN, SITE_TAGLINE_BN } from "@/lib/constants";
import { SquareArrowOutUpRight } from "lucide-react";

function YtIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
    </svg>
  );
}

type ClockParts = { hh: string; mm: string; ampm: string } | null;

function useClock(): ClockParts {
  const [parts, setParts] = useState<ClockParts>(null);

  useEffect(() => {
    function tick() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setParts({
        hh: String(hours).padStart(2, "0"),
        mm: String(minutes).padStart(2, "0"),
        ampm,
      });
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  return parts;
}

export function Header({ playlistId }: { playlistId?: string }) {
  const clock = useClock();
  const ytUrl = playlistId
    ? `https://www.youtube.com/playlist?list=${playlistId}`
    : "https://www.youtube.com/@MirchiBangla";

  return (
    <header className="site-header">
      <div className="site-header__left">
        {clock && (
          <time className="site-header__clock">
            {clock.hh}<span className="clock-colon">:</span>{clock.mm} {clock.ampm}
          </time>
        )}
      </div>

      <div className="site-header__center">
        {/* <p className="site-header__eyebrow">{SITE_NAME}</p> */}
        {/* <h1 className="site-header__title">{SITE_NAME_BN}</h1> */}
        <p className="site-header__tagline">{SITE_TAGLINE_BN}</p>
      </div>

      <div className="site-header__right">
        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="site-header__yt-link"
          aria-label="YouTube Playlist"
          title="Open YouTube Playlist"
        >
          <span className="site-header__yt-link-text">YouTube Playlist</span>
          <YtIcon />
        </a>
      </div>
    </header>
  );
}
