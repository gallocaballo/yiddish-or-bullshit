"use client";

/**
 * VoteButtons — YIDDISH (#1A3D5C) and BULLSHIT (#5C1A1A) vote buttons.
 */

import type { Vote } from "@/lib/types";

interface VoteButtonsProps {
  /** Currently selected vote, if any */
  selectedVote: Vote | null;
  /** Callback when a vote is selected */
  onVote: (vote: Vote) => void;
  /** Whether voting is disabled (e.g., after confirmation) */
  disabled?: boolean;
}

export function VoteButtons({
  selectedVote,
  onVote,
  disabled = false,
}: VoteButtonsProps) {
  return (
    <div className="flex w-full gap-3 sm:gap-4">
      <button
        type="button"
        onClick={() => onVote("yiddish")}
        disabled={disabled}
        className={`flex-1 rounded-lg px-6 py-4 text-base font-semibold uppercase tracking-wider transition-all duration-150 sm:text-lg ${
          selectedVote === "yiddish"
            ? "bg-yiddish-blue text-white ring-2 ring-yiddish-blue ring-offset-2 ring-offset-bg-primary"
            : "border-2 border-yiddish-blue text-yiddish-blue hover:bg-yiddish-blue hover:text-white"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        Yiddish
      </button>
      <button
        type="button"
        onClick={() => onVote("bullshit")}
        disabled={disabled}
        className={`flex-1 rounded-lg px-6 py-4 text-base font-semibold uppercase tracking-wider transition-all duration-150 sm:text-lg ${
          selectedVote === "bullshit"
            ? "bg-bs-red text-white ring-2 ring-bs-red ring-offset-2 ring-offset-bg-primary"
            : "border-2 border-bs-red text-bs-red hover:bg-bs-red hover:text-white"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        Bullshit
      </button>
    </div>
  );
}
