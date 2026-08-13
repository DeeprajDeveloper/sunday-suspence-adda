"use client";

import { thumbnailUrl } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import {
  ListMusic,
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  TvMinimalPlay,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayer } from "./player-provider";
import { Slider } from "./slider";
import { useTheme } from "./theme-provider";
import { useFullscreen } from "./use-fullscreen";
import { YouTubeEngine } from "./youtube-engine";

export function PlayerBar({ playlistId }: { playlistId: string }) {
  const {
    current,
    currentTime,
    duration,
    isPlaying,
    isReady,
    volume,
    muted,
    tracks,
    queueOpen,
    queueDocked,
    toggle,
    prev,
    next,
    seek,
    setVolume,
    toggleMute,
    setQueueOpen,
  } = usePlayer();
  const { theme, toggleTheme } = useTheme();
  const { active: fullscreen, toggleFullscreen } = useFullscreen();

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 isolate overflow-hidden border-t border-gold/15">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <YouTubeEngine playlistId={playlistId} />
      </div>
      <div className="relative z-10 bg-ink transform-gpu">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 pt-3 sm:gap-4 sm:px-6">
          <div className="size-12 shrink-0 overflow-hidden rounded-md bg-wine/40 sm:size-14">
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.thumbnail || thumbnailUrl(current.videoId, "mq")}
                alt=""
                className="size-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = thumbnailUrl(current.videoId);
                }}
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-title text-sm font-medium text-paper">
              {current?.displayTitle ?? "লোড হচ্ছে…"}
            </p>
            <p className="truncate font-bengali text-xs text-paper/50">
              {current?.author || current?.channelTitle || "Mirchi Bangla"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={!isReady}
              className="rounded-full p-2 text-paper/80 transition hover:bg-paper/10 hover:text-paper disabled:opacity-40"
              aria-label="আগের গল্প"
            >
              <SkipBack className="size-5" />
            </button>
            <button
              type="button"
              onClick={toggle}
              disabled={!isReady}
              className="flex size-11 items-center justify-center rounded-full bg-gold text-ink transition hover:bg-gold-soft disabled:opacity-40"
              aria-label={isPlaying ? "বিরতি" : "চালান"}
            >
              {isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5" />
              )}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!isReady}
              className="rounded-full p-2 text-paper/80 transition hover:bg-paper/10 hover:text-paper disabled:opacity-40"
              aria-label="পরের গল্প"
            >
              <SkipForward className="size-5" />
            </button>
          </div>

          <div className="hidden w-32 shrink-0 items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={toggleMute}
              className="text-paper/70 hover:text-paper"
              aria-label={muted ? "আনমিউট" : "মিউট"}
            >
              {muted || volume === 0 ? (
                <VolumeX className="size-5" />
              ) : (
                <Volume2 className="size-5" />
              )}
            </button>
            <Slider
              value={muted ? 0 : volume}
              max={100}
              onChange={setVolume}
              ariaLabel="ভলিউম"
              className="flex-1"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setQueueOpen(!(queueOpen || queueDocked))}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 transition ${
                queueOpen || queueDocked
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-gold/25 bg-paper/5 text-paper/90 hover:border-gold/50 hover:bg-paper/10"
              }`}
              aria-pressed={queueOpen || queueDocked}
              aria-label="গল্পের তালিকা"
            >
              <ListMusic className="size-5" />
              <span className="hidden font-bengali text-sm sm:inline">তালিকা</span>
              {tracks.length > 0 && (
                <span className="rounded-full bg-gold/15 px-1.5 font-display text-[11px] text-gold">
                  {tracks.length}
                </span>
              )}
            </button>
            {/* <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full p-2 text-paper/80 transition hover:bg-paper/10 hover:text-paper"
              aria-label={theme === "dark" ? "লাইট থিম" : "ডার্ক থিম"}
            >
              {theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </button> */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-full p-2 text-paper/80 transition hover:bg-paper/10 hover:text-paper"
              aria-label={fullscreen ? "ফুলস্ক্রিন বন্ধ" : "ফুলস্ক্রিন"}
            >
              {fullscreen ? (
                <Minimize className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 pt-2 pb-1 sm:px-6">
          <span className="w-12 shrink-0 font-display text-[11px] tabular-nums text-paper/45">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={currentTime}
            max={duration || 1}
            onChange={seek}
            ariaLabel="গল্পের অবস্থান"
            className="min-w-0 flex-1"
          />
          <span className="w-12 shrink-0 text-right font-display text-[11px] tabular-nums text-paper/45">
            {formatTime(duration)}
          </span>
        </div>

        <p className="flex items-center justify-center gap-1 pb-2 font-display text-[10px] tracking-wide text-paper/35">
          <TvMinimalPlay className="size-3.5 text-paper/40" />
          Source: YouTube · Mirchi Bangla
        </p>
      </div>
    </footer>
  );
}
