/**
 * Seed script — uploads data/items.json to Vercel Blob as the initial pool.
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Requires BLOB_READ_WRITE_TOKEN env var.
 */

import { put } from "@vercel/blob";
import { readFileSync } from "fs";
import { resolve } from "path";

async function main() {
  const itemsPath = resolve(__dirname, "../data/items.json");
  const items = JSON.parse(readFileSync(itemsPath, "utf-8"));

  console.log(`Seeding ${items.length} items to content/pool.json...`);

  const blob = await put("content/pool.json", JSON.stringify(items), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });

  console.log(`Done. Blob URL: ${blob.url}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
