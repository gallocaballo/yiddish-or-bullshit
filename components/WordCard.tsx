/**
 * WordCard — displays the word and pronunciation for the player to evaluate.
 * Serif font, centre-aligned, card layout.
 */

interface WordCardProps {
  /** The word to display */
  word: string;
  /** Phonetic pronunciation guide */
  pronunciation: string;
  /** Current round number (1-based) */
  roundNumber: number;
  /** Whether the card is in reveal state */
  revealed?: boolean;
}

export function WordCard({
  word,
  pronunciation,
  roundNumber,
  revealed = false,
}: WordCardProps) {
  return (
    <div
      className={`w-full rounded-xl border border-border bg-card-bg px-6 py-8 shadow-sm transition-all duration-300 ${
        revealed ? "opacity-80" : ""
      }`}
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-text-secondary">
        Word {roundNumber} of 5
      </p>
      <h2 className="font-serif text-3xl leading-relaxed font-normal text-text-primary sm:text-4xl text-center">
        {word}
      </h2>
      <p className="mt-2 text-center text-base italic text-text-secondary">
        {pronunciation}
      </p>
    </div>
  );
}
