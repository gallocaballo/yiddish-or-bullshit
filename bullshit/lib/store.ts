/**
 * Vercel Blob storage helpers for the content pipeline.
 *
 * Blob paths:
 *   content/pool.json            — full item pool
 *   content/daily/{date}.json    — pre-computed daily challenge
 */

import { put, list } from "@vercel/blob";
import type { ContentItem } from "./types";

const POOL_PATH = "content/pool.json";
const DAILY_PREFIX = "content/daily/";

/** Fetch a blob by path, return parsed JSON or null if not found. */
async function getBlob<T>(path: string): Promise<T | null> {
  try {
    const { blobs } = await list({ prefix: path, limit: 1 });
    const match = blobs.find((b) => b.pathname === path);
    if (!match) return null;
    const res = await fetch(match.url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Write JSON to a blob path (overwrites if exists). */
async function putBlob<T>(path: string, data: T): Promise<void> {
  await put(path, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

/** Read the full content pool from blob storage. */
export async function getPool(): Promise<ContentItem[] | null> {
  return getBlob<ContentItem[]>(POOL_PATH);
}

/** Write the full content pool to blob storage. */
export async function putPool(items: ContentItem[]): Promise<void> {
  await putBlob(POOL_PATH, items);
}

/** Read the daily challenge items for a specific date. */
export async function getDailyItems(
  date: string
): Promise<ContentItem[] | null> {
  return getBlob<ContentItem[]>(`${DAILY_PREFIX}${date}.json`);
}

/** Write daily challenge items for a specific date. */
export async function putDailyItems(
  date: string,
  items: ContentItem[]
): Promise<void> {
  await putBlob(`${DAILY_PREFIX}${date}.json`, items);
}
