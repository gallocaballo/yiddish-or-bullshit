/**
 * SessionHeader — displays round count, running score, and streak.
 * Shows streak multiplier badge when active (3+ streak).
 */

import type { GameMode } from "@/lib/types";
import { getStreakMultiplier, formatPoints } from "@/lib/game";

interface SessionHeaderProps {
  /** Game mode */
  mode: GameMode;
  /** Current round (1-based) */
  round: number;
  /** Total rounds */
  totalRounds: number;
  /** Running score (can be negative) */
  score: number;
  /** Current streak */
  streak: number;
}

export function SessionHeader({
  mode,
  round,
  totalRounds,
  score,
  streak,
}: SessionHeaderProps) {
  const multiplier = getStreakMultiplier(streak);

  return (
    <div className="flex w-full items-center justify-between rounded-lg bg-card-bg px-4 py-3 border border-border shadow-sm">
      {/* Mode + Round indicator */}
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, color: "#999999" }}>
          {mode === "daily" ? "Today\u2019s Words" : "Practice"}
        </span>
        <span style={{ fontSize: 12, color: "#999999" }}>&middot;</span>
        <span className="text-sm font-medium text-text-secondary">Round</span>
        <span className="text-lg font-bold tabular-nums text-text-primary">
          {round}/{totalRounds}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-secondary">Score</span>
        <span className="text-lg font-bold tabular-nums text-text-primary">
          {score < 0 ? formatPoints(score).replace("+", "") : score}
        </span>
      </div>

      {/* Streak + multiplier */}
      <div className="flex items-center gap-1">
        {streak > 0 && (
          <>
            <span className="text-sm font-medium text-text-secondary">
              Streak
            </span>
            <span className="text-lg font-bold tabular-nums text-text-primary">
              {streak}
            </span>
            {multiplier > 1 && (
              <span className="rounded-full bg-[#A07820]/15 px-1.5 py-0.5 text-xs font-bold text-[#A07820]">
                {multiplier}x
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
