"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { thumbnailUrl } from "@/lib/constants";
import { loadPlayback, savePlayback } from "@/lib/playback-storage";
import { parseStoryTitle } from "@/lib/parse-title";
import type { RepeatMode, Track } from "@/lib/types";
import {
  getQueueDocked,
  getQueueDockedServer,
  subscribeQueueDocked,
  writeQueueDocked,
} from "@/lib/ui-storage";

const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const YT_CUED = 5;

type PlayerContextValue = {
  tracks: Track[];
  currentIndex: number;
  current: Track | undefined;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  isPlaying: boolean;
  isReady: boolean;
  playbackRate: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queueOpen: boolean;
  queueDocked: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  playAt: (index: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setQueueOpen: (open: boolean) => void;
  toggleQueueDocked: () => void;
  hydrateTracks: (items: Partial<Track> & { videoId: string }[]) => void;
  onPlayerReady: (player: YT.Player) => void;
  onPlayerState: (player: YT.Player, state: number) => void;
  onPlayerError: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

function placeholderTrack(videoId: string, position: number): Track {
  return {
    videoId,
    title: `গল্প ${position + 1}`,
    displayTitle: `গল্প ${position + 1}`,
    thumbnail: thumbnailUrl(videoId),
    channelTitle: "Sunday Suspense",
    position,
  };
}

function isPlaceholder(track: Track) {
  return /^গল্প \d+$/.test(track.displayTitle);
}

export function PlayerProvider({
  playlistId,
  initialTracks,
  children,
}: {
  playlistId: string;
  initialTracks: Track[];
  children: ReactNode;
}) {
  const playerRef = useRef<YT.Player | null>(null);
  const repeatRef = useRef<RepeatMode>("off");
  const restoredRef = useRef(false);
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [queueOpen, setQueueOpenState] = useState(false);
  const queueDocked = useSyncExternalStore(
    subscribeQueueDocked,
    getQueueDocked,
    getQueueDockedServer,
  );

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const syncFromPlayer = useCallback((player: YT.Player) => {
    const ids = player.getPlaylist();
    if (ids?.length) {
      setTracks((prev) => {
        const byId = new Map(prev.map((track) => [track.videoId, track]));
        return ids.map((id, index) => {
          const existing = byId.get(id);
          return existing
            ? { ...existing, position: index }
            : placeholderTrack(id, index);
        });
      });
    }

    const index = player.getPlaylistIndex();
    if (Number.isFinite(index) && index >= 0) {
      setCurrentIndex(index);
    }

    const data = player.getVideoData();
    if (data?.video_id && data.title) {
      const parsed = parseStoryTitle(data.title);
      setTracks((prev) =>
        prev.map((track) =>
          track.videoId === data.video_id && (isPlaceholder(track) || !track.author)
            ? {
                ...track,
                title: data.title ?? track.title,
                displayTitle: parsed.displayTitle,
                englishTitle: parsed.englishTitle,
                author: parsed.author || data.author || track.author,
                channelTitle: data.author || track.channelTitle,
              }
            : track,
        ),
      );
    }

    setDuration(player.getDuration() || 0);
    setCurrentTime(player.getCurrentTime() || 0);
  }, []);

  const restorePlayback = useCallback(
    (player: YT.Player) => {
      if (restoredRef.current) return;
      const ids = player.getPlaylist() ?? [];
      if (ids.length === 0) return;

      restoredRef.current = true;
      const saved = loadPlayback(playlistId);
      if (!saved?.videoId) return;

      const index = ids.indexOf(saved.videoId);
      if (index < 0) return;

      player.cuePlaylist({
        listType: "playlist",
        list: playlistId,
        index,
        startSeconds: Math.floor(saved.seconds),
      });
      setCurrentIndex(index);
      setCurrentTime(saved.seconds);
    },
    [playlistId],
  );

  const persistPlayback = useCallback(() => {
    if (!restoredRef.current) return;
    const player = playerRef.current;
    if (!player) return;
    const index = player.getPlaylistIndex();
    const ids = player.getPlaylist() ?? [];
    const videoId = ids[index] || player.getVideoData()?.video_id;
    if (!videoId) return;
    savePlayback({
      playlistId,
      videoId,
      index: index >= 0 ? index : 0,
      seconds: player.getCurrentTime() || 0,
    });
  }, [playlistId]);

  const onPlayerReady = useCallback(
    (player: YT.Player) => {
      playerRef.current = player;
      player.setVolume(80);
      player.setLoop(false);
      restorePlayback(player);
      syncFromPlayer(player);
      setIsReady(true);
    },
    [restorePlayback, syncFromPlayer],
  );

  const onPlayerState = useCallback(
    (player: YT.Player, state: number) => {
      if (state === YT_ENDED) {
        if (repeatRef.current === "one") {
          player.seekTo(0, true);
          player.playVideo();
          return;
        }
        setIsPlaying(false);
      }
      setIsPlaying(state === YT_PLAYING);
      if (
        state === YT_PLAYING ||
        state === YT_PAUSED ||
        state === YT_CUED
      ) {
        restorePlayback(player);
        syncFromPlayer(player);
      }
      if (state === YT_PAUSED || state === YT_ENDED) {
        persistPlayback();
      }
    },
    [persistPlayback, restorePlayback, syncFromPlayer],
  );

  const onPlayerError = useCallback(() => {
    playerRef.current?.nextVideo();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || 0);
    }, 250);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!isReady || !isPlaying) return;
    persistPlayback();
    const timer = window.setInterval(persistPlayback, 3000);
    return () => window.clearInterval(timer);
  }, [isReady, isPlaying, persistPlayback]);

  useEffect(() => {
    const onHide = () => persistPlayback();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [persistPlayback]);

  const play = useCallback(() => playerRef.current?.playVideo(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);
  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const state = player.getPlayerState();
    if (state === YT_PLAYING) player.pauseVideo();
    else player.playVideo();
  }, []);
  const next = useCallback(() => playerRef.current?.nextVideo(), []);
  const prev = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.getCurrentTime() > 3) {
      player.seekTo(0, true);
      return;
    }
    player.previousVideo();
  }, []);
  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setCurrentTime(seconds);
    persistPlayback();
  }, [persistPlayback]);
  const setVolume = useCallback((value: number) => {
    const nextVolume = Math.min(100, Math.max(0, value));
    playerRef.current?.setVolume(nextVolume);
    if (nextVolume > 0) playerRef.current?.unMute();
    setVolumeState(nextVolume);
    setMuted(nextVolume === 0);
  }, []);
  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted() || volume === 0) {
      player.unMute();
      if (volume === 0) {
        player.setVolume(80);
        setVolumeState(80);
      }
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  }, [volume]);
  const setQueueOpen = useCallback((open: boolean) => {
    setQueueOpenState(open);
    if (!open) writeQueueDocked(false);
  }, []);

  const toggleQueueDocked = useCallback(() => {
    const next = !getQueueDocked();
    writeQueueDocked(next);
    if (next) setQueueOpenState(true);
  }, []);

  const playAt = useCallback((index: number) => {
    playerRef.current?.playVideoAt(index);
    setCurrentIndex(index);
    if (!getQueueDocked()) setQueueOpenState(false);
  }, []);
  const setPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRateState(rate);
  }, []);
  const toggleShuffle = useCallback(() => {
    const nextShuffle = !shuffle;
    playerRef.current?.setShuffle(nextShuffle);
    setShuffle(nextShuffle);
    const player = playerRef.current;
    if (player) window.setTimeout(() => syncFromPlayer(player), 200);
  }, [shuffle, syncFromPlayer]);
  const cycleRepeat = useCallback(() => {
    setRepeat((mode) => {
      const nextMode: RepeatMode =
        mode === "off" ? "all" : mode === "all" ? "one" : "off";
      playerRef.current?.setLoop(nextMode === "all");
      return nextMode;
    });
  }, []);

  const hydrateTracks = useCallback(
    (items: (Partial<Track> & { videoId: string })[]) => {
      if (items.length === 0) return;
      const incoming = new Map(items.map((item) => [item.videoId, item]));
      setTracks((prev) =>
        prev.map((track) => {
          const extra = incoming.get(track.videoId);
          if (!extra?.title) return track;
          return {
            ...track,
            title: extra.title,
            displayTitle: extra.displayTitle || parseStoryTitle(extra.title).displayTitle,
            englishTitle: extra.englishTitle || track.englishTitle,
            author: extra.author || track.author,
            thumbnail: extra.thumbnail || track.thumbnail,
            channelTitle: extra.channelTitle || track.channelTitle,
          };
        }),
      );
    },
    [],
  );

  const current = tracks[currentIndex];

  useEffect(() => {
    if (!current || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.displayTitle,
      artist: current.author || current.channelTitle,
      album: "Sunday Suspense Adda",
      artwork: [
        { src: current.thumbnail, sizes: "480x360", type: "image/jpeg" },
      ],
    });
    navigator.mediaSession.setActionHandler("play", play);
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("previoustrack", prev);
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") seek(details.seekTime);
    });
  }, [current, play, pause, prev, next, seek]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        toggle();
      } else if (event.key === "ArrowRight") {
        seek(currentTime + 10);
      } else if (event.key === "ArrowLeft") {
        seek(Math.max(0, currentTime - 10));
      } else if (event.key.toLowerCase() === "n") {
        next();
      } else if (event.key.toLowerCase() === "p") {
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, seek, currentTime, next, prev]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      tracks,
      currentIndex,
      current,
      currentTime,
      duration,
      volume,
      muted,
      isPlaying,
      isReady,
      playbackRate,
      shuffle,
      repeat,
      queueOpen,
      queueDocked,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      playAt,
      setPlaybackRate,
      toggleShuffle,
      cycleRepeat,
      setQueueOpen,
      toggleQueueDocked,
      hydrateTracks,
      onPlayerReady,
      onPlayerState,
      onPlayerError,
    }),
    [
      tracks,
      currentIndex,
      current,
      currentTime,
      duration,
      volume,
      muted,
      isPlaying,
      isReady,
      playbackRate,
      shuffle,
      repeat,
      queueOpen,
      queueDocked,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      playAt,
      setPlaybackRate,
      toggleShuffle,
      cycleRepeat,
      setQueueOpen,
      toggleQueueDocked,
      hydrateTracks,
      onPlayerReady,
      onPlayerState,
      onPlayerError,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      <div data-playlist={playlistId} className="contents">
        {children}
      </div>
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
