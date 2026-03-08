/**
 * ContentCard — displays the headline for the player to evaluate.
 * Serif font, centre-aligned, card layout.
 */

interface ContentCardProps {
  /** The headline text to display */
  headline: string;
  /** Current round number (1-based) */
  roundNumber: number;
  /** Whether the card is in reveal state */
  revealed?: boolean;
}

export function ContentCard({
  headline,
  roundNumber,
  revealed = false,
}: ContentCardProps) {
  return (
    <div
      className={`w-full rounded-xl border border-border bg-card-bg px-6 py-8 shadow-sm transition-all duration-300 ${
        revealed ? "opacity-80" : ""
      }`}
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-text-secondary">
        Headline {roundNumber} of 5
      </p>
      <h2 className="font-serif text-xl leading-relaxed font-normal text-text-primary sm:text-2xl md:text-3xl text-center">
        &ldquo;{headline}&rdquo;
      </h2>
    </div>
  );
}
