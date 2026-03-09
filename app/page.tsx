"use client";

/**
 * Home page — entry point with Daily Challenge and Free Play options.
 * Shows rotating tagline and daily-completed state.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDailyRecord } from "@/lib/storage";
import { getTodayDateStr } from "@/lib/challenge";
import { seededPick, TAGLINES, BUTTONS, ENDEARMENTS, HOME_SUBTITLES } from "@/lib/copy";

export default function HomePage() {
  const [dailyScore, setDailyScore] = useState<number | null>(null);
  const [dailyPlayed, setDailyPlayed] = useState(false);

  const todayDate = getTodayDateStr();
  const tagline = seededPick(TAGLINES, todayDate);
  const endearment = seededPick(ENDEARMENTS, todayDate);

  useEffect(() => {
    const record = getDailyRecord(todayDate);
    if (record) {
      setDailyPlayed(true);
      setDailyScore(record.result.totalScore);
    }
  }, [todayDate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <main className="w-full max-w-md space-y-8 text-center">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-text-primary sm:text-5xl">
            Yiddish or Bullshit
          </h1>
          <p className="text-lg text-text-secondary">
            {tagline}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-text-secondary">
          You&apos;ll see 5 words. For each one, decide if it&apos;s{" "}
          <span className="font-semibold text-yiddish-blue">Yiddish</span> or{" "}
          <span className="font-semibold text-bs-red">Bullshit</span>, then set
          your confidence. Higher confidence on correct answers means more
          points.
        </p>

        {/* Action buttons */}
        <div className="space-y-5">
          {dailyPlayed ? (
            <>
              {/* Daily already completed */}
              <div>
                <div className="rounded-lg border border-border bg-card-bg px-6 py-4 text-center">
                  <p className="text-lg font-semibold text-text-primary">
                    {BUTTONS.daily.primary} &#10003;
                  </p>
                  {dailyScore !== null && (
                    <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                      {dailyScore.toLocaleString()} pts
                    </p>
                  )}
                </div>
                <p className="mt-1.5 text-center" style={{ fontSize: 13, color: "#999999" }}>
                  {HOME_SUBTITLES.dailyCompleted} Score: {dailyScore?.toLocaleString() ?? 0}.
                </p>
              </div>
              <div>
                <Link
                  href="/play?mode=freeplay"
                  className="block w-full rounded-lg border-2 border-border px-6 py-4 text-center text-lg font-semibold text-text-primary transition-colors hover:border-text-secondary"
                >
                  {BUTTONS.practice.primary}
                </Link>
                <p className="mt-1.5 text-center" style={{ fontSize: 13, color: "#999999" }}>
                  {HOME_SUBTITLES.practice}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <Link
                  href="/play?mode=daily"
                  className="block w-full rounded-lg bg-text-primary px-6 py-4 text-center text-lg font-semibold text-bg-primary transition-opacity hover:opacity-90"
                >
                  {BUTTONS.daily.primary}
                </Link>
                <p className="mt-1.5 text-center" style={{ fontSize: 13, color: "#999999" }}>
                  {HOME_SUBTITLES.daily}
                </p>
              </div>
              <div>
                <Link
                  href="/play?mode=freeplay"
                  className="block w-full rounded-lg border-2 border-border px-6 py-4 text-center text-lg font-semibold text-text-primary transition-colors hover:border-text-secondary"
                >
                  {BUTTONS.practice.primary}
                </Link>
                <p className="mt-1.5 text-center" style={{ fontSize: 13, color: "#999999" }}>
                  {HOME_SUBTITLES.practice}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-xs text-text-secondary">
          Everyone gets the same daily words. Come back tomorrow for a new
          set.
        </p>
      </main>
    </div>
  );
}
