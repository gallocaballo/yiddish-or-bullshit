/**
 * Scoring and game logic for Yiddish or Bullshit.
 * Pure functions only — no side effects, no state mutation.
 *
 * Scoring follows the PRD asymmetric point table:
 * - Correct answers earn more at higher confidence
 * - Wrong answers LOSE points, with steeper penalties at higher confidence
 * - This punishes overconfidence, which is the core pedagogical mechanic
 */

import type {
  ConfidenceLevel,
  Vote,
  WordItem,
  RoundResult,
  SessionResult,
  GameMode,
} from "./types";

import { CONFIDENCE_TIERS } from "./types";

/** Total rounds per game session */
export const ROUNDS_PER_SESSION = 5;

/** All valid confidence levels */
export const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = [
  1, 2, 3, 4, 5,
] as const;

/** Default confidence level for new rounds */
export const DEFAULT_CONFIDENCE: ConfidenceLevel = 2;

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
 * Calculate points for a single round using the confidence tier table.
 *
 * @param correct - Whether the player's vote matched reality
 * @param confidence - The player's confidence level (1–5)
 * @param streakMultiplier - Streak multiplier (only applied to correct answers)
 * @returns Points earned (can be negative)
 */
export function calculatePoints(
  correct: boolean,
  confidence: ConfidenceLevel,
  streakMultiplier: number = 1.0
): number {
  const tier = CONFIDENCE_TIERS[confidence];
  if (correct) {
    return Math.round(tier.correct * streakMultiplier);
  }
  // Wrong answers are NOT amplified by streak multiplier
  return tier.wrong;
}

/**
 * Determine if a vote is correct for a given word item.
 *
 * @param vote - The player's vote
 * @param item - The word item being evaluated
 * @returns Whether the vote matches the item's real/fake status
 */
export function isVoteCorrect(vote: Vote, item: WordItem): boolean {
  return (vote === "yiddish") === item.isReal;
}

/**
 * Build a RoundResult from a player's vote on an item.
 *
 * @param item - The word item
 * @param vote - The player's vote
 * @param confidence - The player's confidence level (1–5)
 * @param roundNumber - 1-based round number
 * @param streak - Current streak BEFORE this round (for multiplier)
 * @returns Complete round result
 */
export function buildRoundResult(
  item: WordItem,
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
      ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      : 0;

  // Streak bonus = sum of (points with multiplier - points without multiplier)
  const streakBonus = results.reduce((sum, r) => {
    if (r.correct && r.streakMultiplier > 1) {
      const base = CONFIDENCE_TIERS[r.confidence].correct;
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
