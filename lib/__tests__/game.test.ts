import { describe, it, expect } from "vitest";
import {
  calculatePoints,
  isVoteCorrect,
  getStreakMultiplier,
  buildRoundResult,
  buildSessionResult,
  formatPoints,
} from "@/lib/game";
import { CONFIDENCE_TIERS } from "@/lib/types";
import type { ConfidenceLevel, WordItem, RoundResult } from "@/lib/types";

const realWord: WordItem = {
  id: "0001",
  type: "word",
  word: "Chutzpah",
  pronunciation: "KHOOTS-pah",
  isReal: true,
  definition: "Shameless audacity.",
  partOfSpeech: "noun",
  difficulty: 0.15,
  commonInEnglish: true,
};

const fakeWord: WordItem = {
  id: "0101",
  type: "word",
  word: "Grepshin",
  pronunciation: "GREP-shin",
  isReal: false,
  fakeDefinition: "To rummage through old belongings.",
  tell: "The -shin ending is not a natural Yiddish suffix.",
  difficulty: 0.35,
};

describe("calculatePoints", () => {
  it("returns correct points for all 5 tiers when correct", () => {
    const levels: ConfidenceLevel[] = [1, 2, 3, 4, 5];
    for (const level of levels) {
      const expected = CONFIDENCE_TIERS[level].correct;
      expect(calculatePoints(true, level)).toBe(expected);
    }
  });

  it("returns correct points for all 5 tiers when wrong", () => {
    const levels: ConfidenceLevel[] = [1, 2, 3, 4, 5];
    for (const level of levels) {
      const expected = CONFIDENCE_TIERS[level].wrong;
      expect(calculatePoints(false, level)).toBe(expected);
    }
  });

  it("applies streak multiplier to correct answers", () => {
    expect(calculatePoints(true, 3, 1.1)).toBe(Math.round(150 * 1.1));
    expect(calculatePoints(true, 5, 1.25)).toBe(Math.round(350 * 1.25));
  });

  it("does NOT apply streak multiplier to wrong answers", () => {
    expect(calculatePoints(false, 3, 1.1)).toBe(-100);
    expect(calculatePoints(false, 5, 1.25)).toBe(-400);
  });
});

describe("getStreakMultiplier", () => {
  it("returns 1.0 for streak 0-2", () => {
    expect(getStreakMultiplier(0)).toBe(1.0);
    expect(getStreakMultiplier(1)).toBe(1.0);
    expect(getStreakMultiplier(2)).toBe(1.0);
  });

  it("returns 1.1 for streak 3-4", () => {
    expect(getStreakMultiplier(3)).toBe(1.1);
    expect(getStreakMultiplier(4)).toBe(1.1);
  });

  it("returns 1.25 for streak 5+", () => {
    expect(getStreakMultiplier(5)).toBe(1.25);
    expect(getStreakMultiplier(10)).toBe(1.25);
  });
});

describe("isVoteCorrect", () => {
  it('returns true when voting "yiddish" on a real word', () => {
    expect(isVoteCorrect("yiddish", realWord)).toBe(true);
  });

  it('returns false when voting "bullshit" on a real word', () => {
    expect(isVoteCorrect("bullshit", realWord)).toBe(false);
  });

  it('returns true when voting "bullshit" on a fake word', () => {
    expect(isVoteCorrect("bullshit", fakeWord)).toBe(true);
  });

  it('returns false when voting "yiddish" on a fake word', () => {
    expect(isVoteCorrect("yiddish", fakeWord)).toBe(false);
  });
});

describe("buildRoundResult", () => {
  it("builds correct result for a correct vote", () => {
    const result = buildRoundResult(realWord, "yiddish", 3, 1, 0);
    expect(result.correct).toBe(true);
    expect(result.points).toBe(150);
    expect(result.roundNumber).toBe(1);
    expect(result.streakMultiplier).toBe(1.0);
  });

  it("builds correct result with streak multiplier", () => {
    const result = buildRoundResult(realWord, "yiddish", 3, 2, 3);
    expect(result.correct).toBe(true);
    expect(result.points).toBe(Math.round(150 * 1.1));
    expect(result.streakMultiplier).toBe(1.1);
  });

  it("builds correct result for a wrong vote", () => {
    const result = buildRoundResult(realWord, "bullshit", 4, 1, 0);
    expect(result.correct).toBe(false);
    expect(result.points).toBe(-250);
  });
});

describe("buildSessionResult", () => {
  it("calculates session stats correctly", () => {
    const results: RoundResult[] = [
      buildRoundResult(realWord, "yiddish", 2, 1, 0),
      buildRoundResult(fakeWord, "bullshit", 3, 2, 1),
      buildRoundResult(realWord, "bullshit", 4, 3, 2),
    ];

    const session = buildSessionResult(results, "daily");
    expect(session.totalScore).toBe(100 + 150 + (-250));
    expect(session.accuracy).toBeCloseTo(2 / 3);
    expect(session.bestStreak).toBe(2);
    expect(session.mode).toBe("daily");
  });
});

describe("formatPoints", () => {
  it("formats positive points with +", () => {
    expect(formatPoints(120)).toBe("+120");
  });

  it("formats zero as +0", () => {
    expect(formatPoints(0)).toBe("+0");
  });

  it("formats negative points with minus sign", () => {
    expect(formatPoints(-400)).toBe("\u2212400");
  });
});
