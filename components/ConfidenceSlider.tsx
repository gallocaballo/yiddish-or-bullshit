"use client";

/**
 * ConfidenceSlider — snaps to 10-point increments (50–100%).
 * Default: 60%. Shows labels: Guess / Lean / Confident / Sure / Certain / Definite.
 */

import type { ConfidenceLevel } from "@/lib/types";
import { CONFIDENCE_LABELS } from "@/lib/types";
import { CONFIDENCE_LEVELS } from "@/lib/game";

interface ConfidenceSliderProps {
  /** Current confidence value */
  value: ConfidenceLevel;
  /** Callback when confidence changes */
  onChange: (level: ConfidenceLevel) => void;
  /** Whether the slider is disabled */
  disabled?: boolean;
}

/**
 * Snap a raw number to the nearest valid ConfidenceLevel.
 */
function snapToLevel(raw: number): ConfidenceLevel {
  const snapped = Math.round(raw / 10) * 10;
  const clamped = Math.max(50, Math.min(100, snapped));
  return clamped as ConfidenceLevel;
}

export function ConfidenceSlider({
  value,
  onChange,
  disabled = false,
}: ConfidenceSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const snapped = snapToLevel(Number(e.target.value));
    onChange(snapped);
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          Confidence
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-text-secondary">
            {CONFIDENCE_LABELS[value]}
          </span>
          <span className="text-lg font-bold tabular-nums text-text-primary">
            {value}%
          </span>
        </div>
      </div>
      <input
        type="range"
        min={50}
        max={100}
        step={10}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-text-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="mt-1 flex justify-between">
        {CONFIDENCE_LEVELS.map((level) => (
          <span
            key={level}
            className={`text-xs tabular-nums ${
              level === value
                ? "font-bold text-text-primary"
                : "text-text-secondary"
            }`}
          >
            {level}
          </span>
        ))}
      </div>
    </div>
  );
}
