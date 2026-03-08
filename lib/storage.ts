/**
 * LocalStorage helpers for the Bullshit game.
 * Handles daily records and lifetime player stats.
 * All functions are safe to call during SSR (no-op / defaults).
 */

import type { DailyRecord, PlayerStats, SessionResult } from "./types";

const STORAGE_KEYS = {
  DAILY_RECORD: "bullshit:daily",
  PLAYER_STATS: "bullshit:stats",
} as const;

/** Default stats for a new player */
const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  totalScore: 0,
  totalCorrect: 0,
  totalRounds: 0,
  bestScore: 0,
  bestStreak: 0,
  lastPlayedDate: null,
};

/**
 * Check if localStorage is available (not SSR).
 *
 * @returns Whether localStorage can be used
 */
function isStorageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

/**
 * Safely read and parse JSON from localStorage.
 *
 * @param key - Storage key
 * @returns Parsed value, or null if missing/invalid
 */
function readJson<T>(key: string): T | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Safely write JSON to localStorage.
 *
 * @param key - Storage key
 * @param value - Value to serialize and store
 */
function writeJson<T>(key: string, value: T): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/**
 * Get the daily challenge record for a specific date.
 *
 * @param dateStr - Date string (YYYY-MM-DD)
 * @returns The daily record, or null if not played yet
 */
export function getDailyRecord(dateStr: string): DailyRecord | null {
  const record = readJson<DailyRecord>(STORAGE_KEYS.DAILY_RECORD);
  if (record && record.date === dateStr) return record;
  return null;
}

/**
 * Save a daily challenge record.
 *
 * @param result - The session result to save
 */
export function saveDailyRecord(result: SessionResult): void {
  const record: DailyRecord = {
    date: result.date,
    result,
  };
  writeJson(STORAGE_KEYS.DAILY_RECORD, record);
}

/**
 * Check if the daily challenge has been completed today.
 *
 * @param dateStr - Today's date string (YYYY-MM-DD)
 * @returns Whether the daily challenge is already done
 */
export function hasDailyBeenPlayed(dateStr: string): boolean {
  return getDailyRecord(dateStr) !== null;
}

/**
 * Get the player's lifetime stats.
 *
 * @returns Player stats (defaults if none stored)
 */
export function getPlayerStats(): PlayerStats {
  return readJson<PlayerStats>(STORAGE_KEYS.PLAYER_STATS) ?? DEFAULT_STATS;
}

/**
 * Update player stats with a new session result.
 *
 * @param result - The completed session result
 */
export function updatePlayerStats(result: SessionResult): void {
  const current = getPlayerStats();
  const totalCorrect = result.results.filter((r) => r.correct).length;

  const updated: PlayerStats = {
    gamesPlayed: current.gamesPlayed + 1,
    totalScore: current.totalScore + result.totalScore,
    totalCorrect: current.totalCorrect + totalCorrect,
    totalRounds: current.totalRounds + result.results.length,
    bestScore: Math.max(current.bestScore, result.totalScore),
    bestStreak: Math.max(current.bestStreak, result.bestStreak),
    lastPlayedDate: result.date,
  };

  writeJson(STORAGE_KEYS.PLAYER_STATS, updated);
}
