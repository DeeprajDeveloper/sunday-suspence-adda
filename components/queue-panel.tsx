"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { thumbnailUrl } from "@/lib/constants";
import type { Track } from "@/lib/types";
import { Pin, Repeat, Search, Shuffle, X } from "lucide-react";
import { usePlayer } from "./player-provider";

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

function isPlaceholder(track: Track) {
  return /^গল্প \d+$/.test(track.displayTitle);
}

export function QueuePanel() {
  const {
    tracks,
    currentIndex,
    queueOpen,
    queueDocked,
    setQueueOpen,
    toggleQueueDocked,
    playAt,
    playbackRate,
    setPlaybackRate,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    hydrateTracks,
  } = usePlayer();
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const fetched = useRef(new Set<string>());

  const visible = queueOpen || queueDocked;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks.map((track, index) => ({ track, index }));
    return tracks
      .map((track, index) => ({ track, index }))
      .filter(({ track }) =>
        [track.displayTitle, track.title, track.englishTitle, track.author]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
  }, [tracks, query]);

  useEffect(() => {
    if (!visible || queueDocked) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQueueOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, queueDocked, setQueueOpen]);

  useEffect(() => {
    if (!visible || !listRef.current) return;
    const root = listRef.current;

    const flush = (ids: string[]) => {
      const unique = ids.filter((id) => !fetched.current.has(id)).slice(0, 8);
      if (unique.length === 0) return;
      unique.forEach((id) => fetched.current.add(id));
      fetch(`/api/meta?ids=${unique.join(",")}`)
        .then((res) => res.json())
        .then((data: { items?: (Partial<Track> & { videoId: string })[] }) => {
          if (data.items) hydrateTracks(data.items);
        })
        .catch(() => {
          unique.forEach((id) => fetched.current.delete(id));
        });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const ids = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => (entry.target as HTMLElement).dataset.videoId)
          .filter((id): id is string => Boolean(id));
        flush(ids);
      },
      { root, rootMargin: "160px" },
    );

    for (const node of root.querySelectorAll("[data-placeholder='true']")) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [visible, tracks, hydrateTracks]);

  useEffect(() => {
    if (!visible || !listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']");
    if (active instanceof HTMLElement) {
      active.scrollIntoView({ block: "center" });
    }
  }, [visible, currentIndex]);

  return (
    <>
      <div
        className={`queue-overlay${visible && !queueDocked ? "" : " queue-overlay--hidden"}`}
        onClick={() => setQueueOpen(false)}
      />
      <aside
        className={
          queueDocked
            ? "queue-panel queue-panel--docked"
            : `queue-panel queue-panel--floating${visible ? " queue-panel--open" : " queue-panel--closed"}`
        }
        aria-hidden={!visible}
      >
        <div className="queue-panel__header">
          <div>
            <p className="queue-panel__eyebrow">Queue</p>
            <h2 className="queue-panel__title">গল্পের তালিকা</h2>
          </div>
          <div className="queue-panel__header-actions">
            <button
              type="button"
              onClick={toggleQueueDocked}
              className={`queue-panel__icon-btn${queueDocked ? " queue-panel__pin-btn--active" : ""}`}
              aria-pressed={queueDocked}
              aria-label={queueDocked ? "ডক খুলুন" : "তালিকা ডক করুন"}
              title={queueDocked ? "Undock playlist" : "Dock playlist"}
            >
              <Pin style={queueDocked ? { fill: "currentColor" } : undefined} />
            </button>
            <button
              type="button"
              onClick={() => setQueueOpen(false)}
              className="queue-panel__icon-btn"
              aria-label="বন্ধ করুন"
            >
              <X />
            </button>
          </div>
        </div>

        <div className="queue-panel__controls">
          <button
            type="button"
            onClick={toggleShuffle}
            className={`queue-panel__chip${shuffle ? " queue-panel__chip--active" : ""}`}
            aria-pressed={shuffle}
          >
            <span><Shuffle /> এলোমেলো</span>
          </button>
          <button
            type="button"
            onClick={cycleRepeat}
            className={`queue-panel__chip${repeat !== "off" ? " queue-panel__chip--active" : ""}`}
            aria-pressed={repeat !== "off"}
          >
            <span>
              <Repeat />
              {repeat === "one" ? "একটাই" : repeat === "all" ? "সব" : "আবার"}
            </span>
          </button>
          <label className="queue-panel__speed">
            গতি
            <select
              value={playbackRate}
              onChange={(event) => setPlaybackRate(Number(event.target.value))}
              className="queue-panel__speed-select"
            >
              {SPEEDS.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}×
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="queue-panel__search-wrap">
          <span className="queue-panel__search-icon">
            <Search />
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="গল্প খুঁজুন…"
            className="queue-panel__search-input"
          />
        </div>

        <div ref={listRef} className="queue-panel__list">
          {filtered.map(({ track, index }) => {
            const active = index === currentIndex;
            return (
              <button
                key={`${track.videoId}-${index}`}
                type="button"
                data-active={active}
                data-video-id={track.videoId}
                data-placeholder={isPlaceholder(track)}
                onClick={() => playAt(index)}
                className={`queue-item${active ? " queue-item--active" : ""}`}
              >
                <span className="queue-item__number">{index + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.thumbnail || thumbnailUrl(track.videoId, "mq")}
                  alt=""
                  className="queue-item__thumb"
                />
                <span className="queue-item__info">
                  <span className="queue-item__track-title">{track.displayTitle}</span>
                  <span className="queue-item__track-author">
                    {track.author || track.englishTitle || track.channelTitle}
                  </span>
                </span>
                {active && (
                  <span className="queue-item__playing-badge">চলছে</span>
                )}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
