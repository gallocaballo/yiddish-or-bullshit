/**
 * GET /api/daily?date=YYYY-MM-DD
 *
 * Returns 5 items for the daily challenge. Reads from Vercel Blob first,
 * falls back to deterministic selection from the static item pool.
 */

import { NextResponse } from "next/server";
import { getDailyItems } from "@/lib/store";
import { selectDailyItems, getTodayDateStr } from "@/lib/challenge";
import type { ContentItem } from "@/lib/types";
import itemsFallback from "@/data/items.json";

const staticItems = itemsFallback as ContentItem[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? getTodayDateStr();

  try {
    const items = await getDailyItems(date);
    if (items && items.length === 5) {
      return NextResponse.json({ items, source: "pipeline" });
    }
  } catch {
    // Blob unavailable — fall through to static fallback
  }

  const items = selectDailyItems(staticItems, date);
  return NextResponse.json({ items, source: "fallback" });
}
