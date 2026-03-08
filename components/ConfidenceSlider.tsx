"use client";

/**
 * ConfidenceSlider — 5 discrete tier buttons replacing the range slider.
 * Each tier shows label, risk/reward subtitle, and visual selection state.
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
  return (
    <div className="w-full space-y-2">
      <p className="text-sm font-medium text-text-secondary">
        How confident are you?
      </p>
      <div className="flex flex-col gap-2">
        {CONFIDENCE_LEVELS.map((level) => {
          const tier = CONFIDENCE_TIERS[level];
          const isSelected = level === value;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              disabled={disabled}
              className={`w-full rounded-lg px-4 py-3 text-left transition-all duration-150 ${
                isSelected
                  ? "bg-text-primary text-bg-primary ring-2 ring-text-primary ring-offset-2 ring-offset-bg-primary"
                  : "border border-border bg-card-bg text-text-primary hover:border-text-secondary"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span className="text-sm font-semibold">{tier.label}</span>
              <span
                className={`ml-2 text-xs ${
                  isSelected ? "text-bg-primary/70" : "text-text-secondary"
                }`}
              >
                {tier.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
