const STORAGE_KEY = "sunday-suspense-adda:playback";

export type SavedPlayback = {
  playlistId: string;
  videoId: string;
  index: number;
  seconds: number;
};

export function loadPlayback(playlistId: string): SavedPlayback | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SavedPlayback>;
    if (data.playlistId !== playlistId || typeof data.videoId !== "string") {
      return null;
    }
    return {
      playlistId: data.playlistId,
      videoId: data.videoId,
      index: typeof data.index === "number" ? data.index : 0,
      seconds: typeof data.seconds === "number" && data.seconds > 0 ? data.seconds : 0,
    };
  } catch {
    return null;
  }
}

export function savePlayback(playback: SavedPlayback) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playback));
  } catch {
    /* quota / private mode */
  }
}
