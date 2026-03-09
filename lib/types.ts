/**
 * Core type definitions for the Yiddish or Bullshit word game.
 * All game domain types live here — components import, never define.
 */

/** Confidence level — 5 discrete tiers */
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

/** Player's vote on a word */
export type Vote = "yiddish" | "bullshit";

/** Game mode */
export type GameMode = "daily" | "freeplay";

/** Part of speech for real Yiddish words */
export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "exclamation"
  | "idiom";

/** Confidence tier definitions with scoring and display text */
export const CONFIDENCE_TIERS: Record<
  ConfidenceLevel,
  { label: string; correct: number; wrong: number; subtitle: string }
> = {
  1: { label: "Guess", correct: 50, wrong: -10, subtitle: "Right: +50. Wrong: \u221210." },
  2: { label: "Hunch", correct: 100, wrong: -50, subtitle: "Right: +100. Wrong: \u221250." },
  3: { label: "Sure", correct: 150, wrong: -100, subtitle: "Right: +150. Wrong: \u2212100." },
  4: { label: "Certain", correct: 250, wrong: -250, subtitle: "Right: +250. Wrong: \u2212250." },
  5: { label: "Positive", correct: 350, wrong: -400, subtitle: "Right: +350. Wrong: \u2212400." },
} as const;

/** Shared fields for all word items */
interface BaseWordItem {
  /** Unique identifier (four-digit zero-padded string) */
  readonly id: string;
  /** Content type — "word" only in Epoch 1 */
  readonly type: "word";
  /** The word as displayed to the player (romanized Latin script) */
  readonly word: string;
  /** Phonetic pronunciation guide (stressed syllable in caps) */
  readonly pronunciation: string;
  /** Difficulty rating 0.0–1.0 */
  readonly difficulty: number;
  /** ISO date string when added to content pool */
  readonly addedDate?: string;
}

/** A real Yiddish word */
export interface RealWordItem extends BaseWordItem {
  readonly isReal: true;
  /** English definition (max 200 chars) */
  readonly definition: string;
  /** Part of speech */
  readonly partOfSpeech: PartOfSpeech;
  /** The word in Yiddish script (Hebrew characters) */
  readonly yiddishScript?: string;
  /** Example sentence using the word in English context */
  readonly exampleUsage?: string;
  /** Brief etymology note */
  readonly etymology?: string;
  /** Whether this word is commonly used in English */
  readonly commonInEnglish: boolean;
}

/** A fabricated (fake) word */
export interface FakeWordItem extends BaseWordItem {
  readonly isReal: false;
  /** The fabricated definition shown on reveal */
  readonly fakeDefinition: string;
  /** What makes this word fake — the specific giveaway */
  readonly tell: string;
  /** Which real Yiddish patterns were mimicked (editorial, not shown) */
  readonly basedOn?: string;
}

/** A word item — either real or fake (discriminated on isReal) */
export type WordItem = RealWordItem | FakeWordItem;

/** Result of a single round of play */
export interface RoundResult {
  /** The word item for this round */
  readonly item: WordItem;
  /** Player's vote */
  readonly vote: Vote;
  /** Player's confidence level (1–5) */
  readonly confidence: ConfidenceLevel;
  /** Whether the player was correct */
  readonly correct: boolean;
  /** Points earned this round (can be negative) */
  readonly points: number;
  /** Round number (1-based) */
  readonly roundNumber: number;
  /** Streak multiplier applied to this round */
  readonly streakMultiplier: number;
}

/** Possible states of the game state machine */
export type GamePhase = "idle" | "voted" | "confirmed" | "complete";

/** Full session state used by the game hook */
export interface GameSession {
  /** Current phase of the state machine */
  readonly phase: GamePhase;
  /** Game mode */
  readonly mode: GameMode;
  /** Items selected for this session (5 total) */
  readonly items: readonly WordItem[];
  /** Current round index (0-based) */
  readonly currentRound: number;
  /** Completed round results */
  readonly results: readonly RoundResult[];
  /** Current vote (set during 'voted' phase) */
  readonly currentVote: Vote | null;
  /** Current confidence (set during 'voted' phase) */
  readonly currentConfidence: ConfidenceLevel;
  /** Running score total (can be negative) */
  readonly score: number;
  /** Current streak of correct answers */
  readonly streak: number;
  /** Best streak achieved this session */
  readonly bestStreak: number;
}

/** Final result of a completed session */
export interface SessionResult {
  /** All round results */
  readonly results: readonly RoundResult[];
  /** Total score (can be negative) */
  readonly totalScore: number;
  /** Accuracy as fraction (0–1) */
  readonly accuracy: number;
  /** Average confidence across all rounds (1–5 scale) */
  readonly averageConfidence: number;
  /** Total bonus points from streak multipliers */
  readonly streakBonus: number;
  /** Best streak */
  readonly bestStreak: number;
  /** Game mode */
  readonly mode: GameMode;
  /** Date string (YYYY-MM-DD) */
  readonly date: string;
}

/** Stored daily challenge record */
export interface DailyRecord {
  /** Date string (YYYY-MM-DD) */
  readonly date: string;
  /** The session result */
  readonly result: SessionResult;
}

/** Lifetime stats stored in localStorage */
export interface PlayerStats {
  readonly gamesPlayed: number;
  readonly totalScore: number;
  readonly totalCorrect: number;
  readonly totalRounds: number;
  readonly bestScore: number;
  readonly bestStreak: number;
  readonly lastPlayedDate: string | null;
}
