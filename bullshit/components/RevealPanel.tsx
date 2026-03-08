/**
 * RevealPanel — shown after the player confirms their vote.
 * Asymmetric reveal:
 *   Real items → source, publication date, "Read Source →" link
 *   Fabricated items → tell, technique name + explanation
 */

import type { RoundResult } from "@/lib/types";
import { CONFIDENCE_TIERS } from "@/lib/types";
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
  const tierLabel = CONFIDENCE_TIERS[confidence]?.label ?? "—";

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
      <div className="text-center">
        <p
          className={`text-2xl font-bold ${
            points >= 0 ? "text-correct-teal" : "text-wrong-amber"
          }`}
        >
          {formatPoints(points)} pts
        </p>
        {streakMultiplier > 1 && (
          <p className="text-xs text-[#A07820]">
            {streakMultiplier}x streak
          </p>
        )}
        <p className="mt-1 text-xs capitalize text-text-muted">
          {vote} · {tierLabel}
        </p>
      </div>

      {/* Details card — asymmetric by item type */}
      <div className="rounded-lg border border-border bg-card-bg p-4 space-y-3">
        {item.isReal ? (
          /* ── Real item reveal: source + date + summary + link ── */
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                Source
              </p>
              <p className="text-sm text-text-primary">{item.source}</p>
              <p className="text-xs text-text-secondary">
                {formatDate(item.publishedDate)}
              </p>
            </div>

            {item.summary && (
              <p className="text-sm leading-relaxed text-text-secondary">
                {item.summary}
              </p>
            )}

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
          </>
        ) : (
          /* ── Fabricated item reveal: tell + technique ── */
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                The Tell
              </p>
              <p className="font-serif text-sm text-text-primary">
                {item.tell}
              </p>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}
