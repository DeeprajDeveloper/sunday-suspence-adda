export {};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: string | HTMLElement,
        options: YT.PlayerOptions,
      ) => YT.Player;
    };
    onYouTubeIframeAPIReady?: () => void;
  }

  namespace YT {
    interface PlayerOptions {
      height?: string | number;
      width?: string | number;
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: OnStateChangeEvent) => void;
        onError?: (event: { data: number }) => void;
      };
    }

    interface PlayerEvent {
      target: Player;
    }

    interface OnStateChangeEvent {
      target: Player;
      data: number;
    }

    interface Player {
      playVideo(): void;
      pauseVideo(): void;
      nextVideo(): void;
      previousVideo(): void;
      playVideoAt(index: number): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      getCurrentTime(): number;
      getDuration(): number;
      getPlayerState(): number;
      getVolume(): number;
      setVolume(volume: number): void;
      mute(): void;
      unMute(): void;
      isMuted(): boolean;
      getPlaybackRate(): number;
      setPlaybackRate(rate: number): void;
      getAvailablePlaybackRates(): number[];
      getPlaylist(): string[] | undefined;
      getPlaylistIndex(): number;
      cuePlaylist(playlist: {
        listType?: string;
        list?: string;
        index?: number;
        startSeconds?: number;
      }): void;
      getVideoData(): { video_id?: string; title?: string; author?: string };
      setShuffle(shufflePlaylist: boolean): void;
      setLoop(loopPlaylist: boolean): void;
      destroy(): void;
    }
  }
}
