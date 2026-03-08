/**
 * RevealPanel — shown after the player confirms their vote.
 * Displays correct/wrong result, and word details:
 * - Real words: definition, part of speech, example, etymology
 * - Fake words: fake definition (dimmed), tell
 */

import type { RoundResult } from "@/lib/types";
import { CONFIDENCE_TIERS } from "@/lib/types";
import { formatPoints } from "@/lib/game";

interface RevealPanelProps {
  /** The round result to display */
  result: RoundResult;
}

export function RevealPanel({ result }: RevealPanelProps) {
  const { item, correct, vote, confidence, points, streakMultiplier } = result;
  const tierLabel = CONFIDENCE_TIERS[confidence].label;

  return (
    <div className="animate-reveal w-full space-y-4">
      {/* Result badge */}
      <div
        className={`rounded-lg px-4 py-3 text-center text-lg font-bold ${
          correct
            ? "bg-correct-teal/10 text-correct-teal"
            : "bg-wrong-amber/10 text-wrong-amber"
        }`}
      >
        {correct ? "Correct!" : "Wrong!"}{" "}
        <span className="font-normal">
          — The word is{" "}
          <span className="font-semibold">
            {item.isReal ? "REAL YIDDISH" : "NOT A REAL WORD"}
          </span>
        </span>
      </div>

      {/* Points */}
      <div className="text-center text-sm text-text-secondary">
        You voted{" "}
        <span className="font-semibold capitalize">{vote}</span> at{" "}
        <span className="font-semibold">{tierLabel}</span> confidence →{" "}
        <span
          className={`font-bold ${
            points >= 0 ? "text-correct-teal" : "text-wrong-amber"
          }`}
        >
          {formatPoints(points)} pts
        </span>
        {streakMultiplier > 1 && (
          <span className="ml-1 text-xs text-[#A07820]">
            ({streakMultiplier}x streak)
          </span>
        )}
      </div>

      {/* Details card */}
      <div className="rounded-lg border border-border bg-card-bg p-4 space-y-3">
        {item.isReal ? (
          <>
            {/* Real word details */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                Definition
              </p>
              <p className="text-sm text-text-primary">
                <span className="italic text-text-secondary">
                  ({item.partOfSpeech})
                </span>{" "}
                {item.definition}
              </p>
            </div>

            {item.exampleUsage && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Example
                </p>
                <p className="font-serif text-sm italic text-text-primary">
                  {item.exampleUsage}
                </p>
              </div>
            )}

            {item.etymology && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Etymology
                </p>
                <p className="text-xs text-text-secondary">{item.etymology}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Fake word details */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                Fake Definition
              </p>
              <p className="text-sm text-text-secondary italic">
                {item.fakeDefinition}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                The Tell
              </p>
              <p className="font-serif text-sm text-text-primary">
                {item.tell}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
