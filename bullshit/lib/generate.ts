/**
 * Claude fabrication generator — takes real headlines and generates
 * matching fabricated counterparts with tells and technique metadata.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { FabricatedContentItem, Technique } from "./types";
import type { RealHeadline } from "./news";

const VALID_TECHNIQUES: Technique[] = [
  "anonymous-sourcing",
  "emotional-amplification",
  "headline-body-mismatch",
  "false-precision",
  "recycled-news",
  "out-of-context",
  "false-authority",
  "ai-generated-text",
  "satire-presented-as-real",
  "missing-dateline",
  "correlation-as-causation",
];

/** Shape of each fabricated item in Claude's JSON response. */
interface GeneratedItem {
  headline: string;
  tell: string;
  technique: string;
  techniqueName: string;
  techniqueExplanation: string;
  difficulty: number;
  category: string;
}

/**
 * Generate fabricated headlines from a batch of real headlines.
 *
 * @param realHeadlines - Real headlines to base fabrications on
 * @param startId - Starting numeric ID for generated items
 * @returns Array of fabricated content items
 */
export async function generateFabricated(
  realHeadlines: RealHeadline[],
  startId: number = 100
): Promise<FabricatedContentItem[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });

  const headlineList = realHeadlines
    .map(
      (h, i) =>
        `${i + 1}. "${h.title}" (source: ${h.source}, category: ${h.category})`
    )
    .join("\n");

  const prompt = `You are generating fabricated news headlines for a media literacy game called "Bullshit." Players must distinguish real headlines from fake ones.

For each real headline below, generate ONE fabricated headline that:
- Sounds plausible but is fake
- Uses a manipulation technique from this approved list: ${VALID_TECHNIQUES.join(", ")}
- Has a specific, identifiable "tell" (the exact word choice, structural feature, or logical flaw that gives it away)
- Matches the category of the real headline it's based on
- Is max 180 characters

Real headlines:
${headlineList}

Respond with a JSON array. Each element must have these fields:
- "headline": string (the fabricated headline, max 180 chars)
- "tell": string (1-2 sentences naming exactly what gives it away)
- "technique": string (slug from the approved technique list)
- "techniqueName": string (human-readable technique name)
- "techniqueExplanation": string (one paragraph explaining the broader technique)
- "difficulty": number (0.0-1.0, how hard it is to spot as fake)
- "category": string ("politics", "science-health", or "tech-ai")

Return ONLY the JSON array, no markdown fences or other text.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON — strip markdown fences if Claude wraps it
  const cleaned = text.replace(/^```json?\s*\n?/, "").replace(/\n?```\s*$/, "");
  let parsed: GeneratedItem[];

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Retry once with a simpler prompt
    console.error("Failed to parse Claude response, retrying...");
    const retry = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: text },
        {
          role: "user",
          content:
            "Your response was not valid JSON. Please respond with ONLY a valid JSON array, no other text.",
        },
      ],
    });
    const retryText =
      retry.content[0].type === "text" ? retry.content[0].text : "";
    const retryCleaned = retryText
      .replace(/^```json?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
    parsed = JSON.parse(retryCleaned);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Claude response is not an array");
  }

  // Validate and convert to ContentItem type
  return parsed
    .filter(
      (item) =>
        item.headline &&
        item.tell &&
        VALID_TECHNIQUES.includes(item.technique as Technique)
    )
    .map((item, i) => ({
      id: String(startId + i).padStart(3, "0"),
      type: "headline" as const,
      headline: item.headline.slice(0, 180),
      isReal: false as const,
      category: (["politics", "science-health", "tech-ai"].includes(
        item.category
      )
        ? item.category
        : "politics") as FabricatedContentItem["category"],
      difficulty: Math.max(0, Math.min(1, item.difficulty ?? 0.5)),
      tell: item.tell,
      technique: item.technique as Technique,
      techniqueName: item.techniqueName,
      techniqueExplanation: item.techniqueExplanation,
      addedDate: new Date().toISOString().split("T")[0],
    }));
}
