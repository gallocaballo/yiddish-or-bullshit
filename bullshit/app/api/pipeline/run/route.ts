/**
 * POST /api/pipeline/run
 *
 * Cron endpoint — runs the content pipeline to ingest fresh headlines
 * and generate fabricated counterparts.
 *
 * Runs daily mode first (builds today's challenge), then freeplay mode
 * (refreshes the general pool).
 *
 * Authenticated via CRON_SECRET header to prevent unauthorized invocation.
 *
 * Vercel Cron schedule: daily at midnight UTC (configured in vercel.json).
 */

import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";

export const maxDuration = 60; // Allow up to 60s for Claude calls

export async function POST(request: Request) {
  // Authenticate via CRON_SECRET
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = [];

  // 1. Run daily pipeline
  try {
    const daily = await runPipeline("daily");
    results.push(daily);
    console.log("Daily pipeline complete:", daily);
  } catch (err) {
    console.error("Daily pipeline failed:", err);
    results.push({
      mode: "daily",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // 2. Run freeplay pool refresh
  try {
    const freeplay = await runPipeline("freeplay");
    results.push(freeplay);
    console.log("Freeplay pipeline complete:", freeplay);
  } catch (err) {
    console.error("Freeplay pipeline failed:", err);
    results.push({
      mode: "freeplay",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return NextResponse.json({ ok: true, results });
}
