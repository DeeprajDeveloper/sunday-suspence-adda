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
  const { active: fullscreen, toggleFullscreen } = useFullscreen();

  return (
    <>
      {/* Hidden YouTube engine */}
      <div aria-hidden style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <YouTubeEngine playlistId={playlistId} />
      </div>

      <div className="player-card">
        {/* Thumbnail + spinning ring behind it */}
        <div className="player-card__artwork-wrap">
          <div className={`player-card__ring${isPlaying ? " player-card__ring--spinning" : ""}`} />
          <div className="player-card__thumb">
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.thumbnail || thumbnailUrl(current.videoId, "mq")}
                alt=""
                onError={(event) => {
                  event.currentTarget.src = thumbnailUrl(current.videoId);
                }}
              />
            ) : (
              <div className="player-card__thumb-placeholder" />
            )}
          </div>
        </div>
        
        <div className="player-card__info-wrap">
          {/* Name + controls */}
          <div className="player-card__name-controls-wrap">
            {/* Track info */}
            <div className="player-card__info">
              <p className="player-card__track-title">
                {current?.displayTitle ?? "একটা গল্প বেছে নিন"}
              </p>
              <p className="player-card__track-author">
                By {current?.author || ''} | Source: {current?.channelTitle}
              </p>
            </div>

            {/* Controls */}
          <div className="player-card__controls">
            <div className="player-card__controls-left">
              <button
                type="button"
                onClick={toggleMute}
                className="player-card__icon-btn"
                aria-label={muted ? "আনমিউট" : "মিউট"}
              >
                {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
              </button>
              <div className="player-card__volume-slider">
                <Slider
                  value={muted ? 0 : volume}
                  max={100}
                  onChange={setVolume}
                  ariaLabel="ভলিউম"
                />
              </div>
            </div>

            <div className="player-card__transport">
              <button
                type="button"
                onClick={prev}
                disabled={!isReady}
                className="player-card__skip-btn"
                aria-label="আগের গল্প"
              >
                <SkipBack />
              </button>
              <button
                type="button"
                onClick={toggle}
                disabled={!isReady}
                className="player-card__play-btn"
                aria-label={isPlaying ? "বিরতি" : "চালান"}
              >
                {isPlaying ? <Pause /> : <Play />}
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!isReady}
                className="player-card__skip-btn"
                aria-label="পরের গল্প"
              >
                <SkipForward />
              </button>
            </div>

            <div className="player-card__controls-right">
              <button
                type="button"
                onClick={() => setQueueOpen(!(queueOpen || queueDocked))}
                className={`player-card__queue-btn${queueOpen || queueDocked ? " player-card__queue-btn--active" : ""}`}
                aria-pressed={queueOpen || queueDocked}
                aria-label="গল্পের তালিকা"
              >
                <ListMusic />
                {tracks.length > 0 && (
                  <span className="player-card__queue-count">{tracks.length}</span>
                )}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="player-card__icon-btn"
                aria-label={fullscreen ? "ফুলস্ক্রিন বন্ধ" : "ফুলস্ক্রিন"}
              >
                {fullscreen ? <Minimize /> : <Maximize />}
              </button>
            </div>
          </div>

          </div>

          {/* Progress */}
          <div className="player-card__progress-row">
            <span className="player-card__time">{formatTime(currentTime)}</span>
            <Slider
              value={currentTime}
              max={duration || 1}
              onChange={seek}
              ariaLabel="গল্পের অবস্থান"
              className="player-card__progress-slider"
            />
            <span className="player-card__time player-card__time--right">
              {formatTime(duration)}
            </span>
          </div>

          {/* <p className="player-card__credit">
            <TvMinimalPlay />
            YouTube · Mirchi Bangla
          </p> */}

        </div>
      </div>
    </>
  );
}
