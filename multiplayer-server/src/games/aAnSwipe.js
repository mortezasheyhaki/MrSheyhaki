/**
 * A or An Swipe — multiplayer game logic
 * Same word list as the single-player game on the website.
 */

const WORDS = [
  { word: "apple", article: "an" },
  { word: "apartment", article: "an" },
  { word: "egg", article: "an" },
  { word: "email", article: "an" },
  { word: "ice cream", article: "an" },
  { word: "insect", article: "an" },
  { word: "orange", article: "an" },
  { word: "octopus", article: "an" },
  { word: "umbrella", article: "an" },
  { word: "uncle", article: "an" },
  { word: "phone", article: "a" },
  { word: "newspaper", article: "a" },
  { word: "charger", article: "a" },
  { word: "memory card", article: "a" },
  { word: "wallet", article: "a" },
  { word: "watch", article: "a" },
  { word: "pen", article: "a" },
  { word: "pencil", article: "a" },
  { word: "notebook", article: "a" },
  { word: "change purse", article: "a" },
  { word: "pencil case", article: "a" },
  { word: "bank card", article: "a" },
];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Default settings for a match */
export const DEFAULT_SETTINGS = {
  questionCount: 10, // how many words per match
  timePerQuestion: 8, // seconds to answer
  pointsCorrect: 10,
  pointsFastBonus: 5, // extra if answered in first 3 seconds
};

/**
 * Create a fresh game state for a room.
 */
export function createGameState(settings = {}) {
  const cfg = { ...DEFAULT_SETTINGS, ...settings };
  const deck = shuffle(WORDS).slice(0, cfg.questionCount);

  return {
    type: "a-an-swipe",
    status: "playing", // playing | finished
    settings: cfg,
    questions: deck,
    index: 0, // current question index
    startedAt: Date.now(),
    questionStartedAt: Date.now(),
    // playerId → { score, correct, wrong, answers: [] }
    scores: {},
    // answers for the current question: playerId → { answer, at }
    currentAnswers: {},
    finished: false,
  };
}

/**
 * Public view of the current question (no correct answer leaked).
 */
export function publicQuestion(game) {
  if (!game || game.finished || game.index >= game.questions.length) {
    return null;
  }
  const q = game.questions[game.index];
  return {
    index: game.index,
    total: game.questions.length,
    word: q.word,
    timeLimit: game.settings.timePerQuestion,
    startedAt: game.questionStartedAt,
  };
}

/**
 * Public scoreboard.
 */
export function publicScoreboard(game, players) {
  const list = players.map((p) => {
    const s = game.scores[p.id] || { score: 0, correct: 0, wrong: 0 };
    return {
      id: p.id,
      username: p.username,
      displayName: p.displayName,
      score: s.score,
      correct: s.correct,
      wrong: s.wrong,
    };
  });
  list.sort((a, b) => b.score - a.score || b.correct - a.correct);
  return list;
}

/**
 * Ensure every player has a score entry.
 */
export function ensureScores(game, playerIds) {
  for (const id of playerIds) {
    if (!game.scores[id]) {
      game.scores[id] = { score: 0, correct: 0, wrong: 0, answers: [] };
    }
  }
}

/**
 * Record an answer. Returns result for that player.
 * Does nothing if already answered this question or game is finished.
 */
export function submitAnswer(game, playerId, answer) {
  if (!game || game.finished) {
    return { ok: false, error: "Game is over" };
  }
  if (game.index >= game.questions.length) {
    return { ok: false, error: "No active question" };
  }
  if (game.currentAnswers[playerId]) {
    return { ok: false, error: "Already answered" };
  }

  const normalized = String(answer || "").trim().toLowerCase();
  if (normalized !== "a" && normalized !== "an") {
    return { ok: false, error: "Answer must be 'a' or 'an'" };
  }

  const q = game.questions[game.index];
  const correct = normalized === q.article;
  const elapsed = (Date.now() - game.questionStartedAt) / 1000;
  const fast = elapsed <= 3;

  let points = 0;
  if (correct) {
    points = game.settings.pointsCorrect;
    if (fast) points += game.settings.pointsFastBonus;
  }

  if (!game.scores[playerId]) {
    game.scores[playerId] = { score: 0, correct: 0, wrong: 0, answers: [] };
  }
  const s = game.scores[playerId];
  s.score += points;
  if (correct) s.correct += 1;
  else s.wrong += 1;
  s.answers.push({
    index: game.index,
    word: q.word,
    answer: normalized,
    correct,
    points,
  });

  game.currentAnswers[playerId] = {
    answer: normalized,
    correct,
    points,
    at: Date.now(),
  };

  return {
    ok: true,
    correct,
    points,
    article: q.article, // reveal correct article after they answer
    word: q.word,
  };
}

/**
 * Advance to next question (or finish).
 * Call this when time is up or all connected players have answered.
 */
export function advanceQuestion(game) {
  if (!game || game.finished) return { done: true };

  game.index += 1;
  game.currentAnswers = {};

  if (game.index >= game.questions.length) {
    game.finished = true;
    game.status = "finished";
    return { done: true };
  }

  game.questionStartedAt = Date.now();
  return { done: false, question: publicQuestion(game) };
}

/**
 * Check if all connected players have answered the current question.
 */
export function allAnswered(game, connectedPlayerIds) {
  if (!game || !connectedPlayerIds.length) return false;
  return connectedPlayerIds.every((id) => !!game.currentAnswers[id]);
}
