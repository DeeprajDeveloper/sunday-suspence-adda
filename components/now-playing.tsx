"use client";

import { thumbnailUrl } from "@/lib/constants";
import { Pause, Play } from "lucide-react";
import { usePlayer } from "./player-provider";

export function NowPlaying() {
  const { current, isPlaying, isReady, toggle } = usePlayer();
  const art = current ? thumbnailUrl(current.videoId, "max") : undefined;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 pb-40 pt-8">
      <div className="relative w-full max-w-[530px]">
        <div
          className={`pointer-events-none absolute -inset-2 rounded-[1.35rem] border border-gold/25 ${isPlaying ? "border-gold/50" : ""}`}
        />
        <button
          type="button"
          onClick={toggle}
          disabled={!isReady}
          className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-gold/20 bg-wine/40"
          aria-label={isPlaying ? "বিরতি" : "চালান"}
        >
          {art ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={art}
              alt=""
              className="size-full object-cover"
              onError={(event) => {
                if (current) {
                  event.currentTarget.src = thumbnailUrl(current.videoId, "sd");
                }
              }}
            />
          ) : (
            <div className="flex size-full items-center justify-center font-bengali text-paper/40">
              লোড হচ্ছে…
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="flex size-16 items-center justify-center rounded-full bg-gold text-ink">
              {isPlaying ? (
                <Pause className="size-7" />
              ) : (
                <Play className="size-7" />
              )}
            </span>
          </span>
        </button>
      </div>

      <div className="mt-8 w-full max-w-[530px] text-center">
        <p className="font-display text-[11px] tracking-[0.22em] text-gold uppercase">
          {isPlaying ? "Now playing" : "Sunday Suspense"}
        </p>
        <h2 className="mt-2 font-title text-2xl font-semibold text-balance text-paper sm:text-3xl">
          {current?.displayTitle ?? "একটা গল্প বেছে নিন"}
        </h2>
        <p className="mt-2 font-bengali text-sm text-paper/55">
          {current?.author || current?.englishTitle || current?.channelTitle || "Mirchi Bangla"}
        </p>
      </div>
    </main>
  );
}
