"use client";

import type { PlaylistData } from "@/lib/types";
import { Header } from "./header";
import { NowPlaying } from "./now-playing";
import { PlayerBar } from "./player-bar";
import { PlayerProvider, usePlayer } from "./player-provider";
import { QueuePanel } from "./queue-panel";
import { ThemeProvider } from "./theme-provider";

function VideoBg() {
  return (
    <div className="video-bg">
      <video
        src="/3427514-hd_1920_1080_24fps.mp4"
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

function ShellLayout({ playlistId }: { playlistId: string }) {
  const { queueDocked } = usePlayer();

  return (
    <div className={`grain shell${queueDocked ? " shell--queue-docked" : ""}`}>
      <VideoBg />
      <Header playlistId={playlistId} />
      <NowPlaying />
      <PlayerBar playlistId={playlistId} />
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
