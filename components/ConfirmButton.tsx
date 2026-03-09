"use client";

/**
 * ConfirmButton — locks in the player's vote and confidence.
 * Only enabled when a vote has been selected.
 */

interface ConfirmButtonProps {
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button label text (rotates per round) */
  label?: string;
}

export function ConfirmButton({ onConfirm, disabled = false, label = "Lock it in" }: ConfirmButtonProps) {
  return (
    <button
      type="button"
      onClick={onConfirm}
      disabled={disabled}
      className={`w-full rounded-lg bg-text-primary px-6 py-4 text-base font-semibold text-bg-primary transition-all duration-150 sm:text-lg ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer hover:opacity-90 active:scale-[0.98]"
      }`}
    >
      {label}
    </button>
  );
}
