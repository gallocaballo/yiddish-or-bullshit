/**
 * GNews API client — fetches real headlines by category.
 *
 * Docs: https://gnews.io/docs/v4
 * Free tier: 100 requests/day, 10 articles per request.
 */

import type { Category } from "./types";

/** A real headline fetched from GNews. */
export interface RealHeadline {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string; // ISO date string
  category: Category;
}

/** GNews article shape (subset of full response). */
interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: { name: string; url: string };
}

/** Map game categories to GNews topic slugs. */
const CATEGORY_TOPICS: Record<Category, string[]> = {
  politics: ["nation", "world"],
  "science-health": ["science", "health"],
  "tech-ai": ["technology"],
};

/** Approved source names from the PRD (case-insensitive matching). */
const APPROVED_SOURCES: Record<Category, string[]> = {
  politics: [
    "Reuters",
    "AP News",
    "Associated Press",
    "BBC News",
    "BBC",
    "NPR",
    "The Guardian",
    "Al Jazeera",
    "PBS NewsHour",
    "PBS",
    "The Hill",
    "Politico",
  ],
  "science-health": [
    "Nature",
    "Science",
    "STAT News",
    "STAT",
    "New England Journal of Medicine",
    "NEJM",
    "The Lancet",
    "Ars Technica",
    "Scientific American",
  ],
  "tech-ai": [
    "TechCrunch",
    "The Verge",
    "Wired",
    "MIT Technology Review",
    "Ars Technica",
    "Bloomberg",
    "Rest of World",
    "404 Media",
  ],
};

/** Check if a source name matches any approved source (case-insensitive). */
function isApprovedSource(sourceName: string, category: Category): boolean {
  const lower = sourceName.toLowerCase();
  return APPROVED_SOURCES[category].some((s) => lower.includes(s.toLowerCase()));
}

/**
 * Non-English URL path segments commonly used by multilingual news outlets.
 * GNews returns these even with lang=en since Pidgin/creole variants are
 * classified as English.
 */
const NON_ENGLISH_URL_PATHS = [
  "/pidgin/",
  "/mundo/",
  "/arabic/",
  "/hausa/",
  "/yoruba/",
  "/igbo/",
  "/swahili/",
  "/afrique/",
  "/zhongwen/",
  "/russian/",
  "/hindi/",
  "/urdu/",
  "/turkce/",
  "/persian/",
  "/portuguese/",
  "/japanese/",
  "/korean/",
  "/cymrufyw/",
  "/naidheachdan/",
  "/gahuza/",
  "/somali/",
  "/amharic/",
  "/tigrinya/",
  "/sinhala/",
  "/tamil/",
  "/telugu/",
  "/marathi/",
  "/gujarati/",
  "/bengali/",
  "/nepali/",
  "/burmese/",
  "/thai/",
  "/indonesian/",
  "/vietnamese/",
  "/ukrainian/",
  "/serbian/",
  "/azeri/",
  "/uzbek/",
  "/kyrgyz/",
  "/pashto/",
];

/** Check if an article URL points to a non-English language edition. */
function isNonEnglishUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return NON_ENGLISH_URL_PATHS.some((path) => lower.includes(path));
}

/**
 * Fetch headlines from GNews for a given category.
 *
 * @param category - Game content category
 * @param options.maxAge - Maximum article age in hours (default: 24)
 * @param options.max - Maximum articles to return (default: 10)
 * @returns Array of real headlines from approved sources
 */
export async function fetchHeadlines(
  category: Category,
  options: { maxAge?: number; max?: number } = {}
): Promise<RealHeadline[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) throw new Error("GNEWS_API_KEY not configured");

  const { maxAge = 24, max = 10 } = options;
  const topics = CATEGORY_TOPICS[category];
  const headlines: RealHeadline[] = [];

  for (const topic of topics) {
    const params = new URLSearchParams({
      token: apiKey,
      topic,
      lang: "en",
      max: String(max),
    });

    // Add time filter if maxAge is reasonable (< 6 months)
    if (maxAge <= 24 * 180) {
      const from = new Date(Date.now() - maxAge * 60 * 60 * 1000).toISOString();
      params.set("from", from);
    }

    try {
      const res = await fetch(
        `https://gnews.io/api/v4/top-headlines?${params}`,
        { next: { revalidate: 0 } }
      );
      if (!res.ok) {
        console.error(`GNews ${topic} failed: ${res.status}`);
        continue;
      }

      const data = (await res.json()) as { articles: GNewsArticle[] };

      for (const article of data.articles ?? []) {
        if (!isApprovedSource(article.source.name, category)) continue;
        if (isNonEnglishUrl(article.url)) continue;

        headlines.push({
          title: article.title,
          description: article.description ?? "",
          source: article.source.name,
          url: article.url,
          publishedAt: article.publishedAt,
          category,
        });
      }
    } catch (err) {
      console.error(`GNews ${topic} error:`, err);
    }
  }

  return headlines;
}

/**
 * Fetch headlines across all categories.
 *
 * @param options.maxAge - Maximum article age in hours
 * @returns All headlines grouped by category
 */
export async function fetchAllHeadlines(
  options: { maxAge?: number } = {}
): Promise<RealHeadline[]> {
  const categories: Category[] = ["politics", "science-health", "tech-ai"];
  const results = await Promise.all(
    categories.map((cat) => fetchHeadlines(cat, options))
  );
  return results.flat();
}
