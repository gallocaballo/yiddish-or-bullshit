"use client";

/**
 * ConfidenceSlider — 5 discrete buttons: Guess / Hunch / Pretty Sure / Damn Sure / No Doubt.
 * Default: Hunch (tier 2). Shows risk/reward subtitle that updates per selection.
 */

import type { ConfidenceLevel } from "@/lib/types";
import { CONFIDENCE_TIERS } from "@/lib/types";
import { CONFIDENCE_LEVELS } from "@/lib/game";

interface ConfidenceSliderProps {
  /** Current confidence value */
  value: ConfidenceLevel;
  /** Callback when confidence changes */
  onChange: (level: ConfidenceLevel) => void;
  /** Whether the buttons are disabled */
  disabled?: boolean;
}

export function ConfidenceSlider({
  value,
  onChange,
  disabled = false,
}: ConfidenceSliderProps) {
  const tier = CONFIDENCE_TIERS[value];

  return (
    <div className="w-full space-y-2">
      <p className="text-sm font-medium text-text-secondary">Confidence</p>

      {/* Tier buttons */}
      <div className="flex gap-2">
        {CONFIDENCE_LEVELS.map((level) => {
          const isSelected = level === value;
          return (
            <button
              key={level}
              type="button"
              disabled={disabled}
              onClick={() => onChange(level)}
              className={`flex-1 cursor-pointer rounded-lg border-2 px-1 py-2 text-center text-xs font-semibold transition-colors sm:text-sm ${
                isSelected
                  ? "border-text-primary bg-text-primary text-bg-primary"
                  : "border-border text-text-secondary hover:border-text-secondary"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {CONFIDENCE_TIERS[level].label}
            </button>
          );
        })}
      </div>

      {/* Risk/reward subtitle */}
      <p className="text-center text-xs tabular-nums text-text-secondary">
        Right: +{tier.correct}. Wrong: {tier.wrong}.
      </p>
    </div>
  );
}
