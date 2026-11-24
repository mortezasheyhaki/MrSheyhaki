/**
 * Family Words — Singular & Plural (multiplayer game 2)
 *
 * One word at a time: the singular noun is shown in the centre, and players
 * choose its plural form from three chip buttons (one correct, two wrong).
 * No audio. Scoring matches Picture Match.
 */

import { publicScoreboard, allAnswered, normalizeTimeLimit, FW_DEFAULT_SECONDS } from "./familyWords.js";

export const PLURAL_ITEMS = [
  { prompt: "a boy", answer: "boys", wrong: ["boyes", "boies"] },
  { prompt: "a girl", answer: "girls", wrong: ["girles", "gerls"] },
  { prompt: "a man", answer: "men", wrong: ["mans", "manes"] },
  { prompt: "a woman", answer: "women", wrong: ["womans", "womens"] },
  { prompt: "a child", answer: "children", wrong: ["childs", "childrens"] },
  { prompt: "a person", answer: "people", wrong: ["persons", "peoples"] },
];

const POINTS_CORRECT = 10;
const POINTS_SPEED_BONUS = 5;
const SPEED_WINDOW_MS = 10000;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createPluralState(playerIds, { timeLimit = FW_DEFAULT_SECONDS } = {}) {
  const seconds = normalizeTimeLimit(timeLimit);
  const questions = shuffle(PLURAL_ITEMS).map((item) => {
    const choices = shuffle([item.answer, ...item.wrong]);
    return { prompt: item.prompt, choices, correct: choices.indexOf(item.answer) };
  });
  const scores = {};
  playerIds.forEach((id) => { scores[id] = { points: 0, correct: 0 }; });
  const now = Date.now();
  return {
    type: "plural-forms",
    status: "playing",
    timeLimit: seconds,
    questions,
    index: 0,
    answers: {},
    scores,
    startedAt: now,
    endsAt: now + seconds * 1000,
    qStartedAt: now,
  };
}

/** What every player sees for the current word (never the correct answer). */
export function publicQuestion(game) {
  const q = game.questions[game.index];
  if (!q) return null;
  return {
    index: game.index,
    total: game.questions.length,
    prompt: q.prompt,
    choices: q.choices,
    qStartedAt: game.qStartedAt,
  };
}

export function submitAnswer(game, playerId, choice) {
  if (game.status !== "playing") return { ok: false, error: "The game is not running" };
  const q = game.questions[game.index];
  if (!q) return { ok: false, error: "No word right now" };
  if (game.answers[playerId]) return { ok: false, error: "You already answered this word" };
  if (!(playerId in game.scores)) game.scores[playerId] = { points: 0, correct: 0 };

  const pick = Number(choice);
  if (!Number.isInteger(pick) || pick < 0 || pick >= q.choices.length) {
    return { ok: false, error: "Choose one of the three words" };
  }

  const ms = Math.max(0, Date.now() - game.qStartedAt);
  const correct = pick === q.correct;
  let points = 0;
  if (correct) {
    const left = Math.max(0, 1 - Math.min(ms, SPEED_WINDOW_MS) / SPEED_WINDOW_MS);
    points = POINTS_CORRECT + Math.round(POINTS_SPEED_BONUS * left);
    game.scores[playerId].points += points;
    game.scores[playerId].correct += 1;
  }
  game.answers[playerId] = { choice: pick, correct, points, ms };
  return { ok: true, correct, points, label: q.choices[q.correct], audio: null, ms };
}

export function advanceQuestion(game) {
  if (game.status !== "playing") return { done: true };
  game.index += 1;
  game.answers = {};
  if (game.index >= game.questions.length || Date.now() >= game.endsAt) {
    game.status = "finished";
    return { done: true };
  }
  game.qStartedAt = Date.now();
  return { done: false, question: publicQuestion(game) };
}

export function finishGame(game) {
  game.status = "finished";
}

export { publicScoreboard, allAnswered };
