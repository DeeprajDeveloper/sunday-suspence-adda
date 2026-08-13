"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "./player-provider";

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector("script[src='https://www.youtube.com/iframe_api']")) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
    if (window.YT?.Player) resolve();
  });
}

export function YouTubeEngine({ playlistId }: { playlistId: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { onPlayerReady, onPlayerState, onPlayerError } = usePlayer();
  const callbacks = useRef({ onPlayerReady, onPlayerState, onPlayerError });

  useEffect(() => {
    callbacks.current = { onPlayerReady, onPlayerState, onPlayerError };
  }, [onPlayerReady, onPlayerState, onPlayerError]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let cancelled = false;
    let player: YT.Player | null = null;
    const target = document.createElement("div");
    target.style.width = "100%";
    target.style.height = "100%";
    wrapper.appendChild(target);

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;
      player = new window.YT.Player(target, {
        width: "320",
        height: "180",
        playerVars: {
          listType: "playlist",
          list: playlistId,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => callbacks.current.onPlayerReady(event.target),
          onStateChange: (event) =>
            callbacks.current.onPlayerState(event.target, event.data),
          onError: () => callbacks.current.onPlayerError(),
        },
      });
    });

    return () => {
      cancelled = true;
      player?.destroy();
      wrapper.innerHTML = "";
    };
  }, [playlistId]);

  return <div ref={wrapperRef} className="yt-host size-full" />;
}
