"use client";

import { Pause, Play } from "lucide-react";
import { usePlayer } from "./player-provider";

export function NowPlaying() {
  const { current, isPlaying, isReady, toggle } = usePlayer();

  return (
    <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-70 pt-8 text-center">
      <p className="font-display text-[11px] tracking-[0.3em] text-gold uppercase">
        {isPlaying ? "Now playing" : "Sunday Suspense"}
      </p>

      <h2 className="mt-4 max-w-xl font-title text-3xl font-semibold text-balance text-paper drop-shadow-lg sm:text-4xl lg:text-5xl">
        {current?.displayTitle ?? "একটা গল্প বেছে নিন"}
      </h2>

      {(current?.author || current?.englishTitle || current?.channelTitle) && (
        <p className="mt-3 font-bengali text-sm text-paper/60">
          {current?.author || current?.englishTitle || current?.channelTitle}
        </p>
      )}

      {/* <button
        type="button"
        onClick={toggle}
        disabled={!isReady}
        className="mt-10 flex size-20 items-center justify-center rounded-full border border-gold/40 bg-ink/40 text-paper backdrop-blur-sm transition hover:border-gold hover:bg-ink/60 disabled:opacity-40"
        aria-label={isPlaying ? "বিরতি" : "চালান"}
      >
        {isPlaying ? (
          <Pause className="size-8" />
        ) : (
          <Play className="ml-1 size-8" />
        )}
      </button> */}
    </main>
  );
}
