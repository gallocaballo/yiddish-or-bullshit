/**
 * Challenge seeding and item selection for the Bullshit game.
 *
 * Daily challenges use a date-based seed for deterministic selection.
 * Free play uses a random seed each time.
 */

import type { ContentItem } from "./types";
import { ROUNDS_PER_SESSION } from "./game";

/**
 * Simple seeded pseudo-random number generator (mulberry32).
 * Deterministic: same seed always produces the same sequence.
 *
 * @param seed - 32-bit integer seed
 * @returns A function that returns the next pseudo-random number [0, 1)
 */
export function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert a date string (YYYY-MM-DD) to a numeric seed.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns A 32-bit integer seed
 */
export function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash;
}

/**
 * Shuffle an array using Fisher-Yates with a seeded RNG.
 *
 * @param items - Array to shuffle (not mutated)
 * @param rng - Seeded random number generator
 * @returns New shuffled array
 */
export function seededShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Select items for a daily challenge.
 * Uses date-based seed for deterministic, reproducible selection.
 * Ensures a balanced mix of real and fake items.
 *
 * @param allItems - Full pool of content items
 * @param dateStr - Date string (YYYY-MM-DD) for seeding
 * @returns Array of ROUNDS_PER_SESSION items
 */
export function selectDailyItems(
  allItems: readonly ContentItem[],
  dateStr: string
): ContentItem[] {
  const seed = dateToSeed(dateStr);
  const rng = createRng(seed);

  const realItems = allItems.filter((item) => item.isReal);
  const fakeItems = allItems.filter((item) => !item.isReal);

  const shuffledReal = seededShuffle(realItems, rng);
  const shuffledFake = seededShuffle(fakeItems, rng);

  // Pick ~half real, ~half fake (for 5 rounds: 2-3 of each)
  const realCount = Math.floor(ROUNDS_PER_SESSION / 2) + (rng() > 0.5 ? 1 : 0);
  const fakeCount = ROUNDS_PER_SESSION - realCount;

  const selected: ContentItem[] = [
    ...shuffledReal.slice(0, realCount),
    ...shuffledFake.slice(0, fakeCount),
  ];

  // Final shuffle so order isn't predictable
  return seededShuffle(selected, rng);
}

/**
 * Select items for free play mode.
 * Uses a random seed for non-deterministic selection.
 *
 * @param allItems - Full pool of content items
 * @returns Array of ROUNDS_PER_SESSION items
 */
export function selectFreePlayItems(
  allItems: readonly ContentItem[]
): ContentItem[] {
  const seed = Date.now() ^ Math.floor(Math.random() * 0xffffffff);
  const rng = createRng(seed);

  const realItems = allItems.filter((item) => item.isReal);
  const fakeItems = allItems.filter((item) => !item.isReal);

  const shuffledReal = seededShuffle(realItems, rng);
  const shuffledFake = seededShuffle(fakeItems, rng);

  const realCount = Math.floor(ROUNDS_PER_SESSION / 2) + (rng() > 0.5 ? 1 : 0);
  const fakeCount = ROUNDS_PER_SESSION - realCount;

  const selected: ContentItem[] = [
    ...shuffledReal.slice(0, realCount),
    ...shuffledFake.slice(0, fakeCount),
  ];

  return seededShuffle(selected, rng);
}

/**
 * Get today's date as a YYYY-MM-DD string.
 *
 * @returns Today's date string
 */
export function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}
