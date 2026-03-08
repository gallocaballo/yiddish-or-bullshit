"use client";

/**
 * Play screen — the main game loop.
 * Reads mode from query param, selects items, runs the game session.
 */

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useCallback, Suspense } from "react";
import { useGameSession } from "@/hooks/useGameSession";
import { ContentCard } from "@/components/ContentCard";
import { VoteButtons } from "@/components/VoteButtons";
import { ConfidenceSlider } from "@/components/ConfidenceSlider";
import { ConfirmButton } from "@/components/ConfirmButton";
import { RevealPanel } from "@/components/RevealPanel";
import { SessionHeader } from "@/components/SessionHeader";
import { selectDailyItems, selectFreePlayItems, getTodayDateStr } from "@/lib/challenge";
import { saveDailyRecord, updatePlayerStats } from "@/lib/storage";
import { ROUNDS_PER_SESSION } from "@/lib/game";
import type { ContentItem, GameMode } from "@/lib/types";
import itemsData from "@/data/items.json";

const allItems = itemsData as ContentItem[];

function PlayGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get("mode");
  const mode: GameMode = modeParam === "freeplay" ? "freeplay" : "daily";

  const { session, actions, currentItem, lastResult, sessionResult } =
    useGameSession();

  // Start session on mount
  useEffect(() => {
    const items =
      mode === "daily"
        ? selectDailyItems(allItems, getTodayDateStr())
        : selectFreePlayItems(allItems);
    actions.startSession(items, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Navigate to results when complete
  useEffect(() => {
    if (sessionResult) {
      // Save results
      updatePlayerStats(sessionResult);
      if (mode === "daily") {
        saveDailyRecord(sessionResult);
      }
      // Store result in sessionStorage for results page
      sessionStorage.setItem(
        "bullshit:lastResult",
        JSON.stringify(sessionResult)
      );
      // Navigate after a brief moment
      const timer = setTimeout(() => {
        router.push("/results");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [sessionResult, mode, router]);

  const handleVote = useCallback(
    (vote: "real" | "bullshit") => {
      actions.submitVote(vote);
    },
    [actions]
  );

  const handleConfidenceChange = useCallback(
    (level: 50 | 60 | 70 | 80 | 90 | 100) => {
      actions.setConfidence(level);
    },
    [actions]
  );

  const handleConfirm = useCallback(() => {
    actions.confirmVote();
  }, [actions]);

  /** Tap anywhere during reveal to advance. Ignores clicks on links. */
  const handleTapToContinue = useCallback(
    (e: React.MouseEvent) => {
      if (session.phase !== "confirmed") return;
      // Don't advance if the player clicked a link (e.g. "Read Source")
      if ((e.target as HTMLElement).closest("a")) return;
      actions.advance();
    },
    [session.phase, actions]
  );

  if (!currentItem && session.phase !== "complete") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  const isRevealed = session.phase === "confirmed";
  const isVoted = session.phase === "voted";

  return (
    <div
      className="flex min-h-screen flex-col items-center px-4 py-6"
      onClick={handleTapToContinue}
    >
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <SessionHeader
          round={session.currentRound + 1}
          totalRounds={ROUNDS_PER_SESSION}
          score={session.score}
          streak={session.streak}
        />

        {/* Headline card */}
        {currentItem && (
          <ContentCard
            headline={currentItem.headline}
            roundNumber={session.currentRound + 1}
            revealed={isRevealed}
          />
        )}

        {/* Vote + Confidence + Confirm (pre-reveal) */}
        {!isRevealed && session.phase !== "complete" && (
          <div className="space-y-4">
            <VoteButtons
              selectedVote={session.currentVote}
              onVote={handleVote}
              disabled={isRevealed}
            />

            {isVoted && (
              <>
                <ConfidenceSlider
                  value={session.currentConfidence}
                  onChange={handleConfidenceChange}
                />
                <ConfirmButton
                  onConfirm={handleConfirm}
                  disabled={session.currentVote === null}
                />
              </>
            )}
          </div>
        )}

        {/* Reveal panel (post-confirm) */}
        {isRevealed && lastResult && <RevealPanel result={lastResult} />}

        {/* Tap to continue hint during reveal */}
        {isRevealed && (
          <p
            className="text-center animate-[fadeIn_200ms_ease-in_500ms_both]"
            style={{ fontSize: 13, color: "#999999" }}
          >
            Tap anywhere to continue
          </p>
        )}
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      }
    >
      <PlayGame />
    </Suspense>
  );
}
