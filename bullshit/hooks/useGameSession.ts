"use client";

/**
 * Game session state machine hook.
 *
 * State flow: idle → voted → confirmed → idle (next round)
 * After ROUNDS_PER_SESSION rounds: → complete
 *
 * The reveal screen stays until the player taps to continue.
 * All scoring logic is delegated to /lib/game.ts.
 */

import { useCallback, useState } from "react";
import type {
  ConfidenceLevel,
  ContentItem,
  GameMode,
  GameSession,
  RoundResult,
  SessionResult,
  Vote,
} from "@/lib/types";
import {
  buildRoundResult,
  buildSessionResult,
  DEFAULT_CONFIDENCE,
  getBestStreak,
  getCurrentStreak,
  ROUNDS_PER_SESSION,
} from "@/lib/game";

/** Actions the game hook exposes */
export interface GameActions {
  /** Start a new game session with selected items */
  startSession: (items: ContentItem[], mode: GameMode) => void;
  /** Submit a vote (transitions idle → voted, or updates vote during voted phase) */
  submitVote: (vote: Vote) => void;
  /** Update confidence level (only during voted phase) */
  setConfidence: (level: ConfidenceLevel) => void;
  /** Confirm the vote + confidence (transitions voted → confirmed) */
  confirmVote: () => void;
  /** Advance to the next round or complete (transitions confirmed → idle/complete) */
  advance: () => void;
  /** Reset to initial state */
  reset: () => void;
}

/** Return type of the useGameSession hook */
export interface UseGameSessionReturn {
  session: GameSession;
  actions: GameActions;
  /** The current item being evaluated, or null if complete */
  currentItem: ContentItem | null;
  /** The latest round result (available during confirmed phase) */
  lastResult: RoundResult | null;
  /** Final session result (available when phase is 'complete') */
  sessionResult: SessionResult | null;
}

/** Initial session state */
function createInitialSession(
  items: readonly ContentItem[] = [],
  mode: GameMode = "daily"
): GameSession {
  return {
    phase: "idle",
    mode,
    items,
    currentRound: 0,
    results: [],
    currentVote: null,
    currentConfidence: DEFAULT_CONFIDENCE,
    score: 0,
    streak: 0,
    bestStreak: 0,
  };
}

/**
 * Core game session hook. Manages the full game lifecycle.
 *
 * @returns Game session state, actions, and derived values
 */
export function useGameSession(): UseGameSessionReturn {
  const [session, setSession] = useState<GameSession>(createInitialSession());

  const startSession = useCallback(
    (items: ContentItem[], mode: GameMode) => {
      setSession(createInitialSession(items, mode));
    },
    []
  );

  const submitVote = useCallback((vote: Vote) => {
    setSession((prev) => {
      if (prev.phase !== "idle" && prev.phase !== "voted") return prev;
      return {
        ...prev,
        phase: "voted",
        currentVote: vote,
      };
    });
  }, []);

  const setConfidence = useCallback((level: ConfidenceLevel) => {
    setSession((prev) => {
      if (prev.phase !== "voted") return prev;
      return {
        ...prev,
        currentConfidence: level,
      };
    });
  }, []);

  const confirmVote = useCallback(() => {
    setSession((prev) => {
      if (prev.phase !== "voted" || prev.currentVote === null) return prev;

      const item = prev.items[prev.currentRound];
      if (!item) return prev;

      // Pass current streak so multiplier is computed from streak BEFORE this round
      const result = buildRoundResult(
        item,
        prev.currentVote,
        prev.currentConfidence,
        prev.currentRound + 1,
        prev.streak
      );

      const newResults = [...prev.results, result];
      const newStreak = getCurrentStreak(newResults);
      const newBestStreak = getBestStreak(newResults);

      return {
        ...prev,
        phase: "confirmed",
        results: newResults,
        score: prev.score + result.points,
        streak: newStreak,
        bestStreak: newBestStreak,
      };
    });
  }, []);

  /** Advance to next round (or complete). Called when player taps to continue. */
  const advance = useCallback(() => {
    setSession((prev) => {
      if (prev.phase !== "confirmed") return prev;

      const nextRound = prev.currentRound + 1;

      if (nextRound >= ROUNDS_PER_SESSION) {
        return {
          ...prev,
          phase: "complete",
        };
      }

      return {
        ...prev,
        phase: "idle",
        currentRound: nextRound,
        currentVote: null,
        currentConfidence: DEFAULT_CONFIDENCE,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setSession(createInitialSession());
  }, []);

  // Derived values
  const currentItem: ContentItem | null =
    session.phase !== "complete" ? (session.items[session.currentRound] ?? null) : null;

  const lastResult: RoundResult | null =
    session.phase === "confirmed"
      ? (session.results[session.results.length - 1] ?? null)
      : null;

  const sessionResult: SessionResult | null =
    session.phase === "complete"
      ? buildSessionResult(session.results, session.mode)
      : null;

  return {
    session,
    actions: {
      startSession,
      submitVote,
      setConfidence,
      confirmVote,
      advance,
      reset,
    },
    currentItem,
    lastResult,
    sessionResult,
  };
}
