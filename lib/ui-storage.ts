const DOCK_KEY = "sunday-suspense-adda:queue-docked";

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
