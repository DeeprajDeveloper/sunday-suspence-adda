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
        className={`fixed inset-0 z-40 bg-ink/60 transition-opacity ${visible && !queueDocked ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setQueueOpen(false)}
      />
      <aside
        className={`flex flex-col border-l border-gold/15 bg-surface shadow-none ${
          queueDocked
            ? "fixed top-0 right-0 z-[25] h-dvh w-full max-w-[22rem] translate-x-0 pb-32"
            : `fixed inset-y-0 right-0 z-50 w-full max-w-md transition-transform duration-300 ${visible ? "translate-x-0" : "translate-x-full"}`
        }`}
        aria-hidden={!visible}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <p className="font-display text-[11px] tracking-[0.22em] text-gold uppercase">
              Queue
            </p>
            <h2 className="font-title text-xl font-semibold text-paper">গল্পের তালিকা</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleQueueDocked}
              className={`rounded-full p-2 transition hover:text-paper ${queueDocked ? "bg-gold/15 text-gold" : "text-paper/70 hover:bg-paper/10"}`}
              aria-pressed={queueDocked}
              aria-label={queueDocked ? "ডক খুলুন" : "তালিকা ডক করুন"}
              title={queueDocked ? "Undock playlist" : "Dock playlist"}
            >
              <Pin className={`size-5 ${queueDocked ? "fill-current" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setQueueOpen(false)}
              className="rounded-full p-2 text-paper/70 hover:bg-paper/10 hover:text-paper"
              aria-label="বন্ধ করুন"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 px-5">
          <button
            type="button"
            onClick={toggleShuffle}
            className={`rounded-full border px-3 py-1.5 ${shuffle ? "border-gold bg-gold/15 text-gold" : "border-white/10 text-paper/70"}`}
            aria-pressed={shuffle}
          >
            <span className="flex items-center gap-1.5 font-bengali text-xs">
              <Shuffle className="size-3.5" /> এলোমেলো
            </span>
          </button>
          <button
            type="button"
            onClick={cycleRepeat}
            className={`rounded-full border px-3 py-1.5 ${repeat !== "off" ? "border-gold bg-gold/15 text-gold" : "border-white/10 text-paper/70"}`}
            aria-pressed={repeat !== "off"}
          >
            <span className="flex items-center gap-1.5 font-bengali text-xs">
              <Repeat className="size-3.5" />
              {repeat === "one" ? "একটাই" : repeat === "all" ? "সব" : "আবার"}
            </span>
          </button>
          <label className="ml-auto flex items-center gap-2 font-bengali text-xs text-paper/60">
            গতি
            <select
              value={playbackRate}
              onChange={(event) => setPlaybackRate(Number(event.target.value))}
              className="rounded-md border border-white/10 bg-ink px-2 py-1 text-paper"
            >
              {SPEEDS.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}×
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="relative mx-5 mt-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-paper/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="গল্প খুঁজুন…"
            className="w-full rounded-lg border border-white/10 bg-ink py-2 pr-3 pl-9 font-bengali text-sm text-paper outline-none placeholder:text-paper/35 focus:border-gold/40"
          />
        </div>

        <div ref={listRef} className="mt-3 flex-1 overflow-y-auto px-2 pb-8">
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
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition ${active ? "bg-gold/15" : "hover:bg-gold/10"}`}
              >
                <span className="w-7 shrink-0 text-center font-display text-xs tabular-nums text-paper/40">
                  {index + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.thumbnail || thumbnailUrl(track.videoId, "mq")}
                  alt=""
                  className="size-12 shrink-0 rounded-md object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bengali text-sm text-paper">
                    {track.displayTitle}
                  </span>
                  <span className="block truncate font-bengali text-xs text-paper/45">
                    {track.author || track.englishTitle || track.channelTitle}
                  </span>
                </span>
                {active && (
                  <span className="font-bengali text-[11px] text-gold">চলছে</span>
                )}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
