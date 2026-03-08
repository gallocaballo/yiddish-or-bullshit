/**
 * Scoring and game logic for the Bullshit game.
 * Pure functions only — no side effects, no state mutation.
 *
 * Scoring follows the PRD asymmetric point table:
 * - Correct answers earn more at higher confidence
 * - Wrong answers LOSE points, with steeper penalties at higher confidence
 * - This punishes overconfidence, which is the core pedagogical mechanic
 */

import type {
  Calibration,
  ConfidenceLevel,
  Vote,
  ContentItem,
  RoundResult,
  SessionResult,
  GameMode,
} from "./types";

/** Total rounds per game session */
export const ROUNDS_PER_SESSION = 5;

/** All valid confidence levels */
export const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = [
  50, 60, 70, 80, 90, 100,
] as const;

/** Default confidence level for new rounds */
export const DEFAULT_CONFIDENCE: ConfidenceLevel = 60;

/**
 * PRD point table — asymmetric scoring.
 * Higher confidence = higher reward when correct, steeper penalty when wrong.
 */
const POINT_TABLE: Record<number, { correct: number; wrong: number }> = {
  50: { correct: 50, wrong: -10 },
  60: { correct: 85, wrong: -40 },
  70: { correct: 120, wrong: -80 },
  80: { correct: 170, wrong: -140 },
  90: { correct: 240, wrong: -220 },
  100: { correct: 350, wrong: -400 },
};

/**
 * Get the streak multiplier for a given streak length.
 * Multiplier applies to the NEXT correct answer after reaching the threshold.
 *
 * @param streak - Current consecutive correct answers BEFORE this round
 * @returns Multiplier (1.0, 1.1, or 1.25)
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 5) return 1.25;
  if (streak >= 3) return 1.1;
  return 1.0;
}

/**
 * Calculate points for a single round using the PRD point table.
 *
 * @param correct - Whether the player's vote matched reality
 * @param confidence - The player's confidence level
 * @param streakMultiplier - Streak multiplier (only applied to correct answers)
 * @returns Points earned (can be negative)
 */
export function calculatePoints(
  correct: boolean,
  confidence: ConfidenceLevel,
  streakMultiplier: number = 1.0
): number {
  const entry = POINT_TABLE[confidence];
  if (correct) {
    return Math.round(entry.correct * streakMultiplier);
  }
  // Wrong answers are NOT amplified by streak multiplier
  return entry.wrong;
}

/**
 * Determine if a vote is correct for a given content item.
 *
 * @param vote - The player's vote
 * @param item - The content item being evaluated
 * @returns Whether the vote matches the item's real/fake status
 */
export function isVoteCorrect(vote: Vote, item: ContentItem): boolean {
  return (vote === "real") === item.isReal;
}

/**
 * Build a RoundResult from a player's vote on an item.
 *
 * @param item - The content item
 * @param vote - The player's vote
 * @param confidence - The player's confidence level
 * @param roundNumber - 1-based round number
 * @param streak - Current streak BEFORE this round (for multiplier)
 * @returns Complete round result
 */
export function buildRoundResult(
  item: ContentItem,
  vote: Vote,
  confidence: ConfidenceLevel,
  roundNumber: number,
  streak: number = 0
): RoundResult {
  const correct = isVoteCorrect(vote, item);
  const multiplier = getStreakMultiplier(streak);
  const points = calculatePoints(correct, confidence, multiplier);

  return {
    item,
    vote,
    confidence,
    correct,
    points,
    roundNumber,
    streakMultiplier: multiplier,
  };
}

/**
 * Calculate calibration assessment from round results.
 * Compares average confidence on wrong answers vs right answers.
 *
 * @param rounds - Completed round results
 * @returns Calibration classification
 */
export function calculateCalibration(
  rounds: readonly RoundResult[]
): Calibration {
  const wrong = rounds.filter((r) => !r.correct);
  const right = rounds.filter((r) => r.correct);

  if (wrong.length === 0) return "perfect";
  if (right.length === 0) return "n/a";

  const avgWrong =
    wrong.reduce((s, r) => s + r.confidence, 0) / wrong.length;
  const avgRight =
    right.reduce((s, r) => s + r.confidence, 0) / right.length;
  const delta = avgWrong - avgRight;

  if (delta > 15) return "overconfident";
  if (delta < -15) return "underconfident";
  return "well-calibrated";
}

/**
 * Build a SessionResult from completed round results.
 *
 * @param results - All round results from the session
 * @param mode - Game mode
 * @returns Final session result with aggregated stats
 */
export function buildSessionResult(
  results: readonly RoundResult[],
  mode: GameMode
): SessionResult {
  const totalScore = results.reduce((sum, r) => sum + r.points, 0);
  const totalCorrect = results.filter((r) => r.correct).length;
  const averageConfidence =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.confidence, 0) / results.length
        )
      : 0;

  // Streak bonus = sum of (points with multiplier - points without multiplier)
  const streakBonus = results.reduce((sum, r) => {
    if (r.correct && r.streakMultiplier > 1) {
      const base = POINT_TABLE[r.confidence].correct;
      return sum + (r.points - base);
    }
    return sum;
  }, 0);

  let bestStreak = 0;
  let currentStreak = 0;
  for (const r of results) {
    if (r.correct) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    results,
    totalScore,
    accuracy: results.length > 0 ? totalCorrect / results.length : 0,
    averageConfidence,
    calibration: calculateCalibration(results),
    streakBonus,
    bestStreak,
    mode,
    date: new Date().toISOString().split("T")[0],
  };
}

/**
 * Calculate the current streak from a list of round results.
 *
 * @param results - Round results so far
 * @returns Current consecutive correct answers from the end
 */
export function getCurrentStreak(results: readonly RoundResult[]): number {
  let streak = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].correct) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Calculate the best streak from a list of round results.
 *
 * @param results - Round results so far
 * @returns Longest run of consecutive correct answers
 */
export function getBestStreak(results: readonly RoundResult[]): number {
  let best = 0;
  let current = 0;
  for (const r of results) {
    if (r.correct) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

/**
 * Format points for display, with sign prefix.
 *
 * @param points - Points value (can be negative)
 * @returns Formatted string like "+120" or "\u2212400"
 */
export function formatPoints(points: number): string {
  if (points >= 0) return `+${points}`;
  return `\u2212${Math.abs(points)}`;
}
