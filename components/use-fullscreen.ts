"use client";

import { useCallback, useEffect, useState } from "react";

export function useFullscreen() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const root = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (root.requestFullscreen) {
        await root.requestFullscreen();
        return;
      }
      root.webkitRequestFullscreen?.();
    } catch {
      /* ignore denied requests */
    }
  }, []);

  return { active, toggleFullscreen };
}
