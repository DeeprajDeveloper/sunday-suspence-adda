const DOCK_KEY = "sunday-suspense-adda:queue-docked";
const BG_KEY   = "sunday-suspense-adda:bg-video";
const MINI_KEY = "sunday-suspense-adda:player-minimized";

/* ── Queue docked (uses useSyncExternalStore so multiple subscribers stay in sync) ── */

const listeners = new Set<() => void>();

export function subscribeQueueDocked(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getQueueDocked() {
  try {
    return localStorage.getItem(DOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function getQueueDockedServer() {
  return false;
}

export function writeQueueDocked(docked: boolean) {
  try {
    localStorage.setItem(DOCK_KEY, docked ? "1" : "0");
  } catch {
    /* ignore */
  }
  for (const listener of listeners) listener();
}

/* ── Background video ── */

export function readBgVideo(fallback: string): string {
  try {
    return localStorage.getItem(BG_KEY) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeBgVideo(src: string) {
  try {
    localStorage.setItem(BG_KEY, src);
  } catch {
    /* ignore */
  }
}

/* ── Player minimized ── */

export function readPlayerMinimized(): boolean {
  try {
    return localStorage.getItem(MINI_KEY) === "1";
  } catch {
    return false;
  }
}

export function writePlayerMinimized(minimized: boolean) {
  try {
    localStorage.setItem(MINI_KEY, minimized ? "1" : "0");
  } catch {
    /* ignore */
  }
}
