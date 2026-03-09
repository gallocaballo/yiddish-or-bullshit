/**
 * All player-facing copy pools for Yiddish or Bullshit.
 * Components import from here — no hardcoded strings in components.
 */

// ---------------------------------------------------------------------------
// Seeded random helper
// ---------------------------------------------------------------------------

/**
 * Select a random item from an array using a seeded value.
 * Same seed always returns the same index.
 */
export function seededPick<T>(pool: readonly T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(hash) % pool.length];
}

// ---------------------------------------------------------------------------
// Home screen
// ---------------------------------------------------------------------------

export const TAGLINES = [
  "Real Yiddish words. Fake Yiddish words. You decide.",
  "Some of these words are real. Some are bupkes. Good luck.",
  "Five words. Five chances to prove you're not a schmuck.",
  "A daily game of language, bluffing, and chutzpah.",
  "Your bubbe knew these words. Do you?",
  "Half Yiddish. Half bullshit. All fun.",
  "The game where knowing from gornisht is a compliment.",
] as const;

export const ENDEARMENTS = ["maydele", "tatele", "neshomele"] as const;

// ---------------------------------------------------------------------------
// Reveal reactions
// ---------------------------------------------------------------------------

export const REVEAL_REACTIONS = {
  /** Player voted YIDDISH, word is real — correct */
  correctReal: [
    "Look at you, a regular yiddishist.",
    "Your bubbe would be proud. Maybe.",
    "Knew it in your kishkes, didn't you?",
    "Not bad for a someone who probably can't order in a deli.",
    "A bisl mazel, a bisl seykhl.",
    "You didn't just guess. I can tell.",
    "Azoy! The word lives.",
    "Someone's been talking to alte Yidn.",
    "Correct. Don't let it go to your kop.",
    "Nu, so you know a word. Big deal. (It is a big deal.)",
  ],
  /** Player voted BULLSHIT, word is fake — correct */
  correctFake: [
    "Sharp. That word was bupkes.",
    "You smelled the fakery. Good nose.",
    "Correct — we made it up. Like a gonif makes an alibi.",
    "Not a real word. Not even close. And you knew it.",
    "Bullshit detected. The nose knows.",
    "That word has as much Yiddish in it as a ham sandwich.",
    "You saw right through it, you clever mensch.",
    "Farfeleh, that was pure dreck and you knew it.",
    "Invented. Fabricated. Fakakt. And you caught it.",
    "That word never set foot in a shul.",
  ],
  /** Player voted BULLSHIT, word is real — wrong */
  wrongReal: [
    "Oy. That's a real word. Now you know.",
    "Wrong — but now it's yours forever.",
    "A real word! Your Yiddish teacher just felt a chill.",
    "It's real. I know, I know — it sounds like we made it up.",
    "Real as your bubbe's guilt trips.",
    "Surprise — the language is stranger than fiction.",
    "The Yiddish language doesn't need your approval to exist.",
    "Wrong, but you just learned something. That's worth more than points.",
    "A genuine word. Funny how the real ones sound fake sometimes.",
    "It's real. Don't plotz.",
  ],
  /** Player voted YIDDISH, word is fake — wrong */
  wrongFake: [
    "Oy vey. You fell for it.",
    "Not a word. We made it up. You got suckered.",
    "Feh! That's a fake. A nothing. A gornisht.",
    "Hook, line, and schmaltz. That word is treif.",
    "We invented that. You believed it. We're all a little embarrassed.",
    "A fakakt word and you bought it wholesale.",
    "That word is about as real as my uncle's war stories.",
    "Nope. Made up. Don't feel bad — it was designed to fool you.",
    "Bubkes! A fake word with a fake mustache.",
    "You got shmeared. It happens to the best of us.",
  ],
  /** Wrong AND confidence tier 4 or 5 — replaces the standard reaction */
  highConfidenceWrong: [
    "Positive, you said. Positively wrong.",
    "Certain? Certainly not.",
    "Such confidence! Such wrongness! A true shlimazl.",
    "You were so sure. The sureness made it worse.",
    "That confidence? Misplaced. Like a yarmulke on a cat.",
    "Oy, the chutzpah. Wrong and proud of it.",
    "Your confidence wrote a check your Yiddish couldn't cash.",
    "Bold. Incorrect. But bold.",
    "The bigger the confidence, the harder the fall. You fell hard.",
    "You locked it in like you knew something. You did not.",
  ],
} as const;

// ---------------------------------------------------------------------------
// Share card copy
// ---------------------------------------------------------------------------

export const SHARE_COPY = {
  perfect: [
    "5/5 on Yiddish or Bullshit. I'm basically fluent.",
    "Perfect score. My bubbe always said I was the smart one.",
    "5 for 5. Somebody get me a chair at the Yiddish writers' table.",
    "Flawless. I know my Yiddish from my bullshit. Do you?",
  ],
  fourOfFive: [
    "[SCORE] points on Yiddish or Bullshit. 4/5. So close I can taste the kugel.",
    "4 out of 5 on today's Yiddish or Bullshit. One word got me. ONE.",
    "4/5. Not perfect, but not schlepping either.",
    "[SCORE] on Yiddish or Bullshit. I missed one. We don't talk about that one.",
  ],
  threeOfFive: [
    "[SCORE] points on Yiddish or Bullshit. 3/5. A solid meh.",
    "3 out of 5. I know some Yiddish. Apparently not enough.",
    "3/5 on today's Yiddish or Bullshit. Room for improvement. Nu, try it yourself.",
    "[SCORE] points. Could be worse. Could be better. Could be you.",
  ],
  twoOrWorse: [
    "[SCORE] points on Yiddish or Bullshit. Don't ask. Just play it yourself.",
    "I got [ACCURACY] right on Yiddish or Bullshit. In my defense, the fake words were very convincing.",
    "[ACCURACY] correct. The Yiddish language and I are not on speaking terms today.",
    "Oy. [ACCURACY] right. I need to call my bubbe more often.",
  ],
  negativeScore: [
    "I scored [SCORE] on Yiddish or Bullshit. Yes, that's negative. No, I don't want to talk about it.",
    "[SCORE] points. Below zero. My ancestors are rolling in their graves AND laughing.",
    "Minus [ABS_SCORE] points on Yiddish or Bullshit. My confidence was higher than my knowledge.",
  ],
} as const;

// ---------------------------------------------------------------------------
// Results screen reactions
// ---------------------------------------------------------------------------

export const RESULTS_REACTIONS = {
  fiveOfFive: [
    "A makhasheyfe! Five for five.",
    "Perfect. Somebody learned something at the Shabbos table.",
    "Five out of five. You're a regular Sholem Aleichem.",
    "Nisht shlekht! (Translation: not bad. Understatement: extreme.)",
  ],
  fourOfFive: [
    "Four out of five. Almost perfect. Almost.",
    "One wrong. One! We'll sit shiva for that one later.",
    "So close to perfection. So close and yet so feh.",
  ],
  threeOfFive: [
    "Three out of five. You know a bisl.",
    "Fifty-fifty plus one. A passing grade at the yeshiva of life.",
    "Eh. You've done worse. Probably.",
  ],
  twoOrWorse: [
    "Oy vey iz mir. That was not your best work.",
    "Two words: more practice. (Or maybe one word: oy.)",
    "The Yiddish language will forgive you. Eventually.",
    "A nechtiger tog! Tomorrow is another day.",
  ],
  zeroOfFive: [
    "Gornisht. Zero. Bupkes. We should talk.",
    "Oh no. Oh no no no. Zero out of five.",
    "Not a single one. I'm not angry, I'm disappointed. (I'm also angry.)",
  ],
} as const;

// ---------------------------------------------------------------------------
// Tap-to-continue
// ---------------------------------------------------------------------------

export const TAP_TO_CONTINUE = [
  "Nu? Tap to continue.",
  "Vayter. (Tap anywhere.)",
  "Next word. Tap.",
  "Shah, shah. Tap to move on.",
  "Enough looking. Tap.",
  "You done kvelling? Tap to continue.",
  "Take it in. Then tap.",
  "Onward. Tap anywhere.",
] as const;

// ---------------------------------------------------------------------------
// Lock-it-in button
// ---------------------------------------------------------------------------

export const LOCK_IT_IN = [
  "Lock it in",
  "Shoyn! Lock it in.",
  "Final answer?",
  "No take-backs.",
  "Say it with your chest.",
] as const;

// ---------------------------------------------------------------------------
// Error messages
// ---------------------------------------------------------------------------

export const ERROR_MESSAGES = {
  contentLoadFailed:
    "Oy, the words didn't load. Something's farkakt. Give it a refresh.",
  poolExhausted:
    "Genug! You've seen every word we've got. Come back tomorrow — we're not going anywhere.",
  dailyCompleted:
    "Already done today. Come back tomorrow or keep spieling.",
  genericError:
    "Nu, something went wrong. It's not you, it's us. Refresh and try again.",
} as const;

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

export const BUTTONS = {
  daily: { primary: "Today\u2019s Words" },
  practice: { primary: "Practice Mode" },
  playAgain: { primary: "Nokh a mol!", secondary: "(Again!)" },
  keepPlaying: { primary: "Vayter spielen", secondary: "(Keep playing)" },
  share: { primary: "Shray es aroys!", secondary: "(Shout it out!)" },
} as const;

// ---------------------------------------------------------------------------
// Home screen subtitles (below buttons, not inside them)
// ---------------------------------------------------------------------------

export const HOME_SUBTITLES = {
  daily: "Same 5 words for everyone. One shot. Share your score.",
  practice: "Random words. No stakes. Unlimited rounds. Go, learn something.",
  dailyCompleted: "Shoyn gemakht. Come back tomorrow.",
} as const;

// ---------------------------------------------------------------------------
// Metric labels
// ---------------------------------------------------------------------------

export const METRIC_LABELS = {
  totalPoints: { yiddish: "Punkte", english: "Points" },
  accuracy: { yiddish: "Trefn", english: "Accuracy" },
  confidence: { yiddish: "Bitokhn", english: "Confidence" },
  bestStreak: { yiddish: "Beste Strik", english: "Best Streak" },
} as const;
