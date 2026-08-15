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
      className={`slider ${className}`}
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
      <div className="slider__track">
        <div className="slider__fill" style={{ width: `${pct}%` }} />
      </div>
      <div
        className="slider__thumb"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}
