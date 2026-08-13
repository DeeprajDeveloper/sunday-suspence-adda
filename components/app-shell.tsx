"use client";

import type { PlaylistData } from "@/lib/types";
import { Header } from "./header";
import { NowPlaying } from "./now-playing";
import { PlayerBar } from "./player-bar";
import { PlayerProvider, usePlayer } from "./player-provider";
import { QueuePanel } from "./queue-panel";
import { ThemeProvider } from "./theme-provider";

function ShellLayout({ playlistId }: { playlistId: string }) {
  const { queueDocked } = usePlayer();

  return (
    <div
      className={`grain relative flex min-h-dvh flex-col transition-[padding] duration-300 ${queueDocked ? "md:pr-[22rem]" : ""}`}
    >
      <Header />
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
