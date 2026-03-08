/**
 * GET /api/freeplay
 *
 * Returns 5 balanced items for free play. Reads from the blob pool first,
 * falls back to random selection from the static item pool.
 */

import { NextResponse } from "next/server";
import { getPool } from "@/lib/store";
import { selectFreePlayItems } from "@/lib/challenge";
import type { ContentItem } from "@/lib/types";
import itemsFallback from "@/data/items.json";

const staticItems = itemsFallback as ContentItem[];

export async function GET() {
  try {
    const pool = await getPool();
    if (pool && pool.length >= 10) {
      const items = selectFreePlayItems(pool);
      return NextResponse.json({ items, source: "pipeline" });
    }
  } catch {
    // Blob unavailable — fall through to static fallback
  }

  const items = selectFreePlayItems(staticItems);
  return NextResponse.json({ items, source: "fallback" });
}
