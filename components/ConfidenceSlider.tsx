"use client";

/**
 * ConfidenceSlider — horizontal pill buttons for 5 confidence tiers.
 * Selected tier shown filled; risk/reward displayed once below.
 */

import type { ConfidenceLevel } from "@/lib/types";
import { CONFIDENCE_TIERS } from "@/lib/types";
import { CONFIDENCE_LEVELS } from "@/lib/game";

interface ConfidenceSliderProps {
  /** Current confidence value (1–5) */
  value: ConfidenceLevel;
  /** Callback when confidence changes */
  onChange: (level: ConfidenceLevel) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

export function ConfidenceSlider({
  value,
  onChange,
  disabled = false,
}: ConfidenceSliderProps) {
  const selectedTier = CONFIDENCE_TIERS[value];

  return (
    <div className="w-full space-y-2">
      <span className="text-sm font-medium text-text-secondary">
        Confidence
      </span>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {CONFIDENCE_LEVELS.map((level) => {
          const tier = CONFIDENCE_TIERS[level];
          const isSelected = level === value;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              disabled={disabled}
              className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                isSelected
                  ? "bg-text-primary text-bg-primary"
                  : "border border-border bg-card-bg text-text-primary hover:border-text-secondary"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {tier.label}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-text-secondary">
        {selectedTier.subtitle}
      </p>
    </div>
  );
}
