import { describe, it, expect } from "vitest";
import {
  createRng,
  dateToSeed,
  selectDailyItems,
  selectFreePlayItems,
} from "@/lib/challenge";
import type { WordItem } from "@/lib/types";
import wordsData from "@/data/words.json";

const allItems = wordsData as WordItem[];

describe("createRng", () => {
  it("produces deterministic sequences from the same seed", () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  it("produces different sequences from different seeds", () => {
    const rng1 = createRng(42);
    const rng2 = createRng(99);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).not.toEqual(seq2);
  });

  it("produces values in [0, 1)", () => {
    const rng = createRng(12345);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("selectDailyItems", () => {
  it("returns exactly 5 items", () => {
    const items = selectDailyItems(allItems, "2025-03-15");
    expect(items).toHaveLength(5);
  });

  it("is deterministic for the same date", () => {
    const a = selectDailyItems(allItems, "2025-06-01");
    const b = selectDailyItems(allItems, "2025-06-01");
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
  });

  it("produces different selections for different dates", () => {
    const a = selectDailyItems(allItems, "2025-06-01");
    const b = selectDailyItems(allItems, "2025-06-02");
    const idsA = a.map((i) => i.id).sort();
    const idsB = b.map((i) => i.id).sort();
    expect(idsA).not.toEqual(idsB);
  });

  it("has at least 2 real and 2 fake items across multiple dates", () => {
    const dates = [
      "2025-01-01", "2025-02-15", "2025-03-20",
      "2025-04-10", "2025-05-05", "2025-06-01",
      "2025-07-04", "2025-08-15", "2025-09-01",
      "2025-10-31",
    ];

    for (const date of dates) {
      const items = selectDailyItems(allItems, date);
      const realCount = items.filter((i) => i.isReal).length;
      const fakeCount = items.filter((i) => !i.isReal).length;
      expect(realCount).toBeGreaterThanOrEqual(2);
      expect(fakeCount).toBeGreaterThanOrEqual(2);
      expect(realCount + fakeCount).toBe(5);
    }
  });
});

describe("selectFreePlayItems", () => {
  it("returns exactly 5 items", () => {
    const items = selectFreePlayItems(allItems);
    expect(items).toHaveLength(5);
  });

  it("has at least 2 real and 2 fake items", () => {
    // Run multiple times since it's random
    for (let i = 0; i < 20; i++) {
      const items = selectFreePlayItems(allItems);
      const realCount = items.filter((i) => i.isReal).length;
      const fakeCount = items.filter((i) => !i.isReal).length;
      expect(realCount).toBeGreaterThanOrEqual(2);
      expect(fakeCount).toBeGreaterThanOrEqual(2);
    }
  });
});
