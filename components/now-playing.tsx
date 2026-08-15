"use client";

import { usePlayer } from "./player-provider";
import { SITE_NAME, SITE_NAME_BN } from "@/lib/constants";

export function NowPlaying() {
  const { current, isPlaying } = usePlayer();

  return (
    <main className="now-playing">
      <p className="now-playing__status">
        {isPlaying ? "Now playing" : SITE_NAME}
      </p>

      <h2 className="now-playing__title">
        {SITE_NAME_BN}
      </h2>

      {(current?.author || current?.englishTitle || current?.channelTitle) && (
        <p className="now-playing__author">
          {current?.displayTitle} - By {current?.author || current?.englishTitle || current?.channelTitle}
        </p>
      )}
    </main>
  );
}
