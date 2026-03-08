/**
 * Core type definitions for the Bullshit media literacy game.
 * All game domain types live here — components import, never define.
 */

/** Confidence level — 5 discrete tiers */
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

/** Player's vote on a headline */
export type Vote = "real" | "bullshit";

/** Game mode */
export type GameMode = "daily" | "freeplay";

/** Content category */
export type Category = "politics" | "science-health" | "tech-ai";

/** Calibration assessment result */
export type Calibration =
  | "overconfident"
  | "well-calibrated"
  | "underconfident"
  | "perfect"
  | "n/a";

/** Manipulation technique taxonomy — PRD canonical slugs */
export type Technique =
  | "anonymous-sourcing"
  | "emotional-amplification"
  | "headline-body-mismatch"
  | "false-precision"
  | "recycled-news"
  | "out-of-context"
  | "false-authority"
  | "ai-generated-text"
  | "satire-presented-as-real"
  | "missing-dateline"
  | "correlation-as-causation";

/**
 * Confidence tier definitions — labels, scoring, and display text.
 * Damn Sure is the crossover point (equal risk/reward).
 * No Doubt risks more than it gains.
 */
export const CONFIDENCE_TIERS: Record<
  ConfidenceLevel,
  { label: string; correct: number; wrong: number }
> = {
  1: { label: "Guess", correct: 50, wrong: -10 },
  2: { label: "Hunch", correct: 100, wrong: -50 },
  3: { label: "Pretty Sure", correct: 150, wrong: -100 },
  4: { label: "Damn Sure", correct: 250, wrong: -250 },
  5: { label: "No Doubt", correct: 350, wrong: -400 },
} as const;

/** Shared fields present on all content items */
interface BaseContentItem {
  /** Unique identifier (three-digit zero-padded string) */
  readonly id: string;
  /** Content type — "headline" only in Epoch 1 */
  readonly type: "headline";
  /** The headline text shown to the player (max 180 chars) */
  readonly headline: string;
  /** Content category */
  readonly category: Category;
  /** Difficulty rating 0.0–1.0 */
  readonly difficulty: number;
  /** ISO date string when added to the content pool */
  readonly addedDate?: string;
}

/** A real news item — source and article link are the reveal */
export interface RealContentItem extends BaseContentItem {
  readonly isReal: true;
  /** The outlet name (e.g. "Reuters", "Nature") */
  readonly source: string;
  /** URL to the original article */
  readonly sourceUrl: string;
  /** ISO date string when originally published */
  readonly publishedDate: string;
  /** 2-3 sentence summary of the article */
  readonly summary?: string;
}

/** A fabricated headline — the tell and technique are the reveal */
export interface FabricatedContentItem extends BaseContentItem {
  readonly isReal: false;
  /** The precise observation identifying this item as fabricated */
  readonly tell: string;
  /** Technique slug from the approved taxonomy */
  readonly technique: Technique;
  /** Human-readable technique name */
  readonly techniqueName?: string;
  /** One-paragraph explanation of the broader technique */
  readonly techniqueExplanation?: string;
}

/** A single content item (headline) the player evaluates */
export type ContentItem = RealContentItem | FabricatedContentItem;

/** Result of a single round of play */
export interface RoundResult {
  /** The content item for this round */
  readonly item: ContentItem;
  /** Player's vote */
  readonly vote: Vote;
  /** Player's confidence level */
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
export type GamePhase =
  | "idle"
  | "voted"
  | "confirmed"
  | "complete";

/** Full session state used by the game hook */
export interface GameSession {
  /** Current phase of the state machine */
  readonly phase: GamePhase;
  /** Game mode */
  readonly mode: GameMode;
  /** Items selected for this session (5 total) */
  readonly items: readonly ContentItem[];
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
  /** Calibration assessment */
  readonly calibration: Calibration;
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
