"use client";

import { useEffect, useState } from "react";
import type { PlaylistData } from "@/lib/types";
import { Clapperboard, X } from "lucide-react";
import { Header } from "./header";
import { NowPlaying } from "./now-playing";
import { PlayerBar } from "./player-bar";
import { PlayerProvider, usePlayer } from "./player-provider";
import { QueuePanel } from "./queue-panel";
import { ThemeProvider } from "./theme-provider";
import { readBgVideo, writeBgVideo } from "@/lib/ui-storage";

const BG_VIDEOS = [
  { id: "bg-theme-1", src: "/bg-videos/bg-theme-1.mp4", label: "Scene 1" },
  { id: "bg-theme-2", src: "/bg-videos/bg-theme-2.mp4", label: "Scene 2" },
  { id: "bg-theme-3", src: "/bg-videos/bg-theme-3.mp4", label: "Scene 3" },
  { id: "bg-theme-4", src: "/bg-videos/bg-theme-4.mp4", label: "Scene 4" },
  { id: "bg-theme-5", src: "/bg-videos/bg-theme-5.mp4", label: "Scene 5" },
];

function VideoBg({ src }: { src: string }) {
  return (
    <div className="video-bg">
      <video
        key={src}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="video-bg__video"
      />
      <div className="video-bg__vignette" />
    </div>
  );
}

function BgPicker({
  activeSrc,
  onChange,
}: {
  activeSrc: string;
  onChange: (src: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-picker">
      {open && (
        <div className="bg-picker__panel">
          <div className="bg-picker__panel-header">
            <span className="bg-picker__panel-title">Background</span>
            <button
              type="button"
              className="bg-picker__close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>
          </div>
          <div className="bg-picker__swatches">
            {BG_VIDEOS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`bg-picker__swatch${activeSrc === v.src ? " bg-picker__swatch--active" : ""}`}
                onClick={() => { onChange(v.src); setOpen(false); }}
                aria-pressed={activeSrc === v.src}
                title={v.label}
              >
                <video
                  src={v.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="bg-picker__swatch-video"
                />
                <span className="bg-picker__swatch-label">{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        className={`bg-picker__toggle${open ? " bg-picker__toggle--active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Change background video"
        aria-expanded={open}
      >
        <Clapperboard />
        <span className="bg-picker__toggle-label">Scene</span>
      </button>
    </div>
  );
}

function ShellLayout({ playlistId }: { playlistId: string }) {
  const { queueDocked } = usePlayer();
  const [activeSrc, setActiveSrcState] = useState(BG_VIDEOS[0].src);

  // Hydrate from localStorage after mount (avoids SSR/client mismatch)
  useEffect(() => {
    const saved = readBgVideo(BG_VIDEOS[0].src);
    const valid = BG_VIDEOS.find((v) => v.src === saved)?.src ?? BG_VIDEOS[0].src;
    setActiveSrcState(valid);
  }, []);

  function setActiveSrc(src: string) {
    setActiveSrcState(src);
    writeBgVideo(src);
  }

  return (
    <div className={`grain shell${queueDocked ? " shell--queue-docked" : ""}`}>
      <VideoBg src={activeSrc} />
      <Header playlistId={playlistId} />
      <NowPlaying />
      <PlayerBar playlistId={playlistId} />
      <BgPicker activeSrc={activeSrc} onChange={setActiveSrc} />
      <QueuePanel />
    </div>
  );
}

export function AppShell({ playlist }: { playlist: PlaylistData }) {
  return (
    <PlayerProvider
      playlistId={playlist.playlistId}
      initialTracks={playlist.tracks}
    >
      <ThemeProvider>
        <ShellLayout playlistId={playlist.playlistId} />
      </ThemeProvider>
    </PlayerProvider>
  );
}
