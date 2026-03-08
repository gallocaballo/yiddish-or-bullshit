"use client";

/**
 * Results screen — shows final score, round breakdown, and share card.
 * Displays: Total Points, Accuracy, Average Confidence, Best Streak.
 */

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import type { SessionResult } from "@/lib/types";
import { formatPoints } from "@/lib/game";

function ResultsContent() {
  const [result, setResult] = useState<SessionResult | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("bullshit:lastResult");
    if (raw) {
      setResult(JSON.parse(raw) as SessionResult);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!shareCardRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareCardRef.current, {
        width: 1200,
        height: 630,
        scale: 1,
        backgroundColor: "#0D0D0D",
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Fallback: download the image
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `bullshit-${result?.date ?? "score"}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch {
      // html2canvas not available
    }
  }, [result?.date]);

  const handleCopyText = useCallback(async () => {
    if (!result) return;
    const correctCount = result.results.filter((r) => r.correct).length;
    const text = `I scored ${result.totalScore} on today's Bullshit challenge. ${correctCount}/5 correct. Can you do better? playbullshit.com`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard not available
    }
  }, [result]);

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="mb-4 text-text-secondary">No results found.</p>
        <Link
          href="/"
          className="rounded-lg bg-text-primary px-6 py-3 font-semibold text-bg-primary"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const correctCount = result.results.filter((r) => r.correct).length;

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-serif text-3xl text-text-primary sm:text-4xl">
            Results
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {result.mode === "daily" ? "Daily Challenge" : "Free Play"} —{" "}
            {result.date}
          </p>
        </div>

        {/* Score summary */}
        <div className="rounded-xl border border-border bg-card-bg p-6 text-center shadow-sm">
          <p className="text-5xl font-bold tabular-nums text-text-primary">
            {result.totalScore.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-text-secondary">points</p>

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-bold text-text-primary">
                {correctCount}/5
              </p>
              <p className="text-text-secondary">Accuracy</p>
            </div>
            <div>
              <p className="font-bold text-text-primary">
                {result.averageConfidence}%
              </p>
              <p className="text-text-secondary">Avg Confidence</p>
            </div>
            <div>
              <p className="font-bold text-text-primary">
                {result.bestStreak}
              </p>
              <p className="text-text-secondary">Best Streak</p>
            </div>
          </div>

          {result.streakBonus > 0 && (
            <p className="mt-3 text-xs text-[#A07820]">
              +{result.streakBonus} streak bonus points
            </p>
          )}
        </div>

        {/* Round breakdown */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-text-secondary">
            Round Breakdown
          </h2>
          {result.results.map((r) => (
            <div
              key={r.roundNumber}
              className="flex items-center justify-between rounded-lg border border-border bg-card-bg px-4 py-3"
            >
              <div className="flex-1 truncate pr-3">
                <p className="truncate text-sm font-medium text-text-primary">
                  {r.item.headline}
                </p>
                <p className="text-xs text-text-secondary">
                  Voted{" "}
                  <span className="capitalize font-medium">{r.vote}</span> at{" "}
                  {r.confidence}%
                  {r.streakMultiplier > 1 && (
                    <span className="ml-1 text-[#A07820]">
                      ({r.streakMultiplier}x)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`text-sm font-bold ${
                    r.correct ? "text-correct-teal" : "text-wrong-amber"
                  }`}
                >
                  {r.correct ? "\u2713" : "\u2717"}
                </span>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    r.points >= 0 ? "text-text-secondary" : "text-wrong-amber"
                  }`}
                >
                  {formatPoints(r.points)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Share card (off-screen for capture) — PRD spec */}
        <div className="overflow-hidden" style={{ height: 0 }}>
          <div
            ref={shareCardRef}
            style={{
              width: 1200,
              height: 630,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0D0D0D",
              color: "#ffffff",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: 1000,
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: "normal",
                  color: "#A07820",
                  letterSpacing: "0.02em",
                }}
              >
                BULLSHIT
              </span>
              <span style={{ fontSize: 24, color: "#999999" }}>
                {result.date}
              </span>
            </div>

            {/* Score */}
            <p
              style={{
                marginTop: 40,
                fontSize: 120,
                fontWeight: "bold",
                fontFamily:
                  "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {result.totalScore.toLocaleString()}
            </p>
            <p style={{ fontSize: 24, color: "#999999", marginTop: 8 }}>
              points
            </p>

            {/* Stats row */}
            <div
              style={{
                marginTop: 32,
                display: "flex",
                gap: 64,
                fontSize: 22,
                color: "#cccccc",
              }}
            >
              <span>
                {correctCount} / 5 correct
              </span>
            </div>

            {/* Round indicators with confidence */}
            <div
              style={{
                marginTop: 40,
                display: "flex",
                gap: 16,
              }}
            >
              {result.results.map((r) => (
                <div
                  key={r.roundNumber}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      width: 56,
                      height: 56,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      fontSize: 22,
                      fontWeight: "bold",
                      backgroundColor: r.correct ? "#0D7A55" : "#A05C00",
                    }}
                  >
                    {r.correct ? "\u2713" : "\u2717"}
                  </span>
                  <span style={{ fontSize: 16, color: "#999999" }}>
                    {r.confidence}%
                  </span>
                </div>
              ))}
            </div>

            {/* Domain URL */}
            <p style={{ marginTop: 32, fontSize: 18, color: "#999999" }}>
              playbullshit.com
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleShare}
            className="w-full cursor-pointer rounded-lg bg-text-primary px-6 py-4 text-center text-lg font-semibold text-bg-primary transition-opacity hover:opacity-90"
          >
            {copied ? "Copied to Clipboard!" : "Share Score Card"}
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full cursor-pointer rounded-lg border-2 border-border px-6 py-4 text-center text-sm font-medium text-text-secondary transition-colors hover:border-text-secondary"
          >
            Copy Share Text
          </button>
          <Link
            href="/play?mode=freeplay"
            className="block w-full rounded-lg border-2 border-border px-6 py-4 text-center text-lg font-semibold text-text-primary transition-colors hover:border-text-secondary"
          >
            Play Again (Free Play)
          </Link>
          <Link
            href="/"
            className="block w-full py-3 text-center text-sm text-text-secondary underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
