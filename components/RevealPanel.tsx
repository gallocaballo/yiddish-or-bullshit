/**
 * RevealPanel — shown after the player confirms their vote.
 * Displays correct/wrong result, source, publication date, tell,
 * technique explanation, and source link.
 */

import type { RoundResult } from "@/lib/types";
import { formatPoints } from "@/lib/game";

/** Format an ISO date string as a readable date, avoiding Safari timezone issues */
function formatDate(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface RevealPanelProps {
  /** The round result to display */
  result: RoundResult;
}

export function RevealPanel({ result }: RevealPanelProps) {
  const { item, correct, vote, confidence, points, streakMultiplier } = result;

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
          — The headline is{" "}
          <span className="font-semibold">
            {item.isReal ? "REAL" : "BULLSHIT"}
          </span>
        </span>
      </div>

      {/* Points */}
      <div className="text-center text-sm text-text-secondary">
        You voted{" "}
        <span className="font-semibold capitalize">{vote}</span> at{" "}
        <span className="font-semibold">{confidence}%</span> confidence →{" "}
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
        {/* Source + publication date */}
        {item.source && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Source
            </p>
            <p className="text-sm text-text-primary">{item.source}</p>
            {item.isReal && item.publishedDate && (
              <p className="text-xs text-text-secondary">
                {formatDate(item.publishedDate)}
              </p>
            )}
          </div>
        )}

        {/* Tell */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            The Tell
          </p>
          <p className="font-serif text-sm text-text-primary">{item.tell}</p>
        </div>

        {/* Technique */}
        {item.techniqueName && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Technique
            </p>
            <p className="text-sm font-medium text-text-primary">
              {item.techniqueName}
            </p>
            {item.techniqueExplanation && (
              <p className="mt-1 text-xs text-text-secondary">
                {item.techniqueExplanation}
              </p>
            )}
          </div>
        )}

        {/* Read Source link — real items only */}
        {item.isReal && item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block underline"
            style={{ fontSize: 14, color: "#555555" }}
            onClick={(e) => e.stopPropagation()}
          >
            Read Source &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
