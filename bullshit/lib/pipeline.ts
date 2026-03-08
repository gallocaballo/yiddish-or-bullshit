/**
 * Content pipeline orchestration.
 *
 * Fetches real headlines from GNews, generates fabricated counterparts
 * via Claude, and stores everything in Vercel Blob.
 *
 * Two modes:
 *   - "daily"    → assemble today's 5-item challenge set
 *   - "freeplay" → refresh the general item pool
 */

import { fetchAllHeadlines, type RealHeadline } from "./news";
import { generateFabricated } from "./generate";
import { getPool, putPool, putDailyItems } from "./store";
import type {
  ContentItem,
  RealContentItem,
  FabricatedContentItem,
  Category,
} from "./types";

/** Pipeline result for logging / debugging. */
export interface PipelineResult {
  mode: "daily" | "freeplay";
  newReal: number;
  newFabricated: number;
  poolSize: number;
  dailySet?: ContentItem[];
  error?: string;
}

/**
 * Convert a RealHeadline (from GNews) to a RealContentItem (game format).
 */
function toRealContentItem(
  h: RealHeadline,
  id: string
): RealContentItem {
  return {
    id,
    type: "headline",
    headline: h.title.slice(0, 180),
    isReal: true,
    category: h.category,
    difficulty: 0.5,
    source: h.source,
    sourceUrl: h.url,
    publishedDate: h.publishedAt.split("T")[0],
    addedDate: new Date().toISOString().split("T")[0],
    ...(h.description ? { summary: h.description } : {}),
  };
}

/**
 * Deduplicate headlines against the existing pool.
 * Matches on URL (for real items) and headline text similarity.
 */
function dedup(
  headlines: RealHeadline[],
  pool: ContentItem[]
): RealHeadline[] {
  const existingUrls = new Set(
    pool
      .filter((item): item is RealContentItem => item.isReal)
      .map((item) => item.sourceUrl)
  );

  const existingHeadlines = new Set(
    pool.map((item) => item.headline.toLowerCase().trim())
  );

  return headlines.filter((h) => {
    if (existingUrls.has(h.url)) return false;
    if (existingHeadlines.has(h.title.toLowerCase().trim())) return false;
    return true;
  });
}

/**
 * Pick the next available numeric ID based on the pool.
 */
function nextId(pool: ContentItem[]): number {
  const maxId = pool.reduce((max, item) => {
    const n = parseInt(item.id, 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return maxId + 1;
}

/**
 * Assemble the best 5-item set for a daily challenge.
 *
 * Rules:
 *   - 2-3 real, 2-3 fabricated
 *   - No duplicate sources
 *   - At least 2 categories represented
 */
function assembleDailySet(
  realItems: RealContentItem[],
  fakeItems: FabricatedContentItem[]
): ContentItem[] {
  const TARGET = 5;
  const result: ContentItem[] = [];
  const usedSources = new Set<string>();
  const usedCategories = new Set<Category>();

  // Shuffle both arrays for variety
  const shuffledReal = [...realItems].sort(() => Math.random() - 0.5);
  const shuffledFake = [...fakeItems].sort(() => Math.random() - 0.5);

  // Pick 2-3 real items (enforce source diversity)
  const realTarget = 2 + (Math.random() > 0.5 ? 1 : 0);
  for (const item of shuffledReal) {
    if (result.length >= realTarget) break;
    if (usedSources.has(item.source)) continue;
    result.push(item);
    usedSources.add(item.source);
    usedCategories.add(item.category);
  }

  // Fill rest with fabricated items
  for (const item of shuffledFake) {
    if (result.length >= TARGET) break;
    result.push(item);
    usedCategories.add(item.category);
  }

  // Final shuffle
  return result.sort(() => Math.random() - 0.5);
}

/**
 * Run the content pipeline.
 *
 * @param mode - "daily" builds today's challenge; "freeplay" refreshes the pool
 * @returns Pipeline result with counts and any errors
 */
export async function runPipeline(
  mode: "daily" | "freeplay"
): Promise<PipelineResult> {
  // 1. Load existing pool
  const pool = (await getPool()) ?? [];
  const startingId = nextId(pool);

  // 2. Fetch real headlines
  const maxAge = mode === "daily" ? 24 : 24 * 180; // 24h or ~6 months
  const allHeadlines = await fetchAllHeadlines({ maxAge });

  if (allHeadlines.length === 0) {
    return {
      mode,
      newReal: 0,
      newFabricated: 0,
      poolSize: pool.length,
      error: "No headlines fetched from GNews",
    };
  }

  // 3. Deduplicate against existing pool
  const fresh = dedup(allHeadlines, pool);

  if (fresh.length === 0) {
    return {
      mode,
      newReal: 0,
      newFabricated: 0,
      poolSize: pool.length,
      error: "All fetched headlines already in pool",
    };
  }

  // 4. Select candidates (daily: 8-10, freeplay: up to 20)
  const limit = mode === "daily" ? Math.min(10, fresh.length) : Math.min(20, fresh.length);
  const candidates = fresh.slice(0, limit);

  // 5. Convert real headlines to ContentItems
  const newRealItems: RealContentItem[] = candidates.map((h, i) =>
    toRealContentItem(h, String(startingId + i).padStart(3, "0"))
  );

  // 6. Generate fabricated counterparts via Claude
  const fabricatedStartId = startingId + newRealItems.length;
  let newFakeItems: FabricatedContentItem[];
  try {
    newFakeItems = await generateFabricated(candidates, fabricatedStartId);
  } catch (err) {
    console.error("Fabrication failed:", err);
    return {
      mode,
      newReal: newRealItems.length,
      newFabricated: 0,
      poolSize: pool.length,
      error: `Fabrication failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // 7. Append to pool
  const updatedPool = [...pool, ...newRealItems, ...newFakeItems];
  await putPool(updatedPool);

  const result: PipelineResult = {
    mode,
    newReal: newRealItems.length,
    newFabricated: newFakeItems.length,
    poolSize: updatedPool.length,
  };

  // 8. For daily mode, also assemble and store today's challenge set
  if (mode === "daily") {
    const today = new Date().toISOString().split("T")[0];
    const dailySet = assembleDailySet(newRealItems, newFakeItems);

    if (dailySet.length >= 5) {
      await putDailyItems(today, dailySet);
      result.dailySet = dailySet;
    } else {
      // Not enough items — fall back to pool-wide selection
      const allReal = updatedPool.filter(
        (item): item is RealContentItem => item.isReal
      );
      const allFake = updatedPool.filter(
        (item): item is FabricatedContentItem => !item.isReal
      );
      const fallbackSet = assembleDailySet(allReal, allFake);
      await putDailyItems(today, fallbackSet);
      result.dailySet = fallbackSet;
    }
  }

  return result;
}
