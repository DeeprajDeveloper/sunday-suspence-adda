"use client";

import { useCallback } from "react";

type SliderProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  className?: string;
};

export function Slider({ value, max, onChange, ariaLabel, className = "" }: SliderProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  const updateFromPointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      onChange(ratio * max);
    },
    [max, onChange],
  );

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(value)}
      className={`group relative flex h-5 min-w-0 cursor-pointer items-center ${className}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromPointer(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          updateFromPointer(event);
        }
      }}
      onKeyDown={(event) => {
        const step = max / 50 || 1;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          onChange(Math.min(max, value + step));
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          onChange(Math.max(0, value - step));
        }
      }}
    >
      <div className="h-1.5 w-full rounded-full bg-paper/15">
        <div
          className="h-full rounded-full bg-gold"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}
