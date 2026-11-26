/**
 * Snakes & Ladders — multiplayer logic (server-authoritative), 2–4 players.
 */
import {
  DEFAULT_TOPIC,
  QUESTION_SQUARES,
  TOPICS,
  getTopicQuestions,
  normalizeTopicId,
} from "./slQuestions.js";

export { QUESTION_SQUARES };
export const MAX_PLAYERS_SL = 4;
export const LADDERS = { 8: 31, 21: 42, 25: 34, 66: 73, 70: 89 };
export const SNAKES = {
  19: 6, 29: 27, 54: 34, 57: 41, 62: 19, 75: 53, 88: 67, 93: 70, 96: 75, 98: 79,
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rawTrim(s) {
  return String(s ?? "").replace(/\u2019/g, "'").replace(/\s+/g, " ").trim();
}

/** Same normalisation the client uses before checking standard typed answers. */
function normalize(s) {
  return rawTrim(s).toLowerCase();
}

export function createSnakesLaddersState(playerIds, level = "beginner", topic = DEFAULT_TOPIC) {
  if (!playerIds || playerIds.length < 2) {
    throw new Error("Snakes & Ladders needs 2 to 4 players");
  }
  const ids = playerIds.slice(0, MAX_PLAYERS_SL);
  const positions = {};
  ids.forEach((id) => { positions[id] = 1; });
  const topicId = normalizeTopicId(topic);
  const bank = getTopicQuestions(topicId);
  return {
    type: "snakes-ladders",
    status: "playing", // playing | finished
    playerIds: ids,
    positions,
    turnIndex: 0,
    phase: "roll", // roll | pickQuestion | answer | done
    lastDice: null,
    pendingQuestions: null,
    pendingQuestionFull: null,
    answerFor: null,
    pickFor: null,
    usedQuestionIds: [],
    shuffledQueue: shuffle(bank.map((q) => q.id)),
    winnerId: null,
    level: level || "beginner",
    topic: topicId,
    topicTitle: TOPICS[topicId].title,
    message: "Game started",
    updatedAt: Date.now(),
  };
}

function nextTurn(game) {
  game.turnIndex = (game.turnIndex + 1) % game.playerIds.length;
}

export function publicSlState(game, players) {
  if (!game || game.type !== "snakes-ladders") return null;
  const names = {};
  (players || []).forEach((p) => {
    names[p.id] = p.displayName || p.username || "Player";
  });
  const full = game.pendingQuestionFull;
  const topicId = normalizeTopicId(game.topic);
  return {
    type: game.type,
    status: game.status,
    playerIds: game.playerIds,
    positions: { ...game.positions },
    turnIndex: game.turnIndex,
    turnId: game.playerIds[game.turnIndex],
    phase: game.phase,
    level: game.level,
    topic: topicId,
    topicTitle: game.topicTitle || TOPICS[topicId].title,
    lastDice: game.lastDice,
    pendingQuestions: game.pendingQuestions,
    // answers and checkers never leave the server
    currentQuestion:
      game.phase === "answer" && full
        ? {
            id: full.id,
            q: full.q,
            type: full.type || "choice",
            ui: full.ui || null,
            promptLabel: full.promptLabel || null,
            hint: full.hint || null,
            wordBox: full.wordBox || null,
            blanks: full.blanks ? full.blanks.length : 0,
            choices: full.choices,
          }
        : null,
    answerFor: game.answerFor,
    pickFor: game.pickFor,
    winnerId: game.winnerId,
    message: game.message,
    names,
    updatedAt: game.updatedAt,
  };
}

function applySnakesLadders(pos) {
  if (LADDERS[pos]) return { pos: LADDERS[pos], event: "ladder", to: LADDERS[pos] };
  if (SNAKES[pos]) return { pos: SNAKES[pos], event: "snake", to: SNAKES[pos] };
  return { pos, event: null };
}

function pickThree(game) {
  const bank = getTopicQuestions(game.topic);
  const byId = new Map(bank.map((q) => [q.id, q]));
  let pool = bank.filter((q) => !game.usedQuestionIds.includes(q.id));
  if (pool.length < 3) {
    game.usedQuestionIds = [];
    pool = bank.slice();
  }
  const poolIds = new Set(pool.map((q) => q.id));
  let queue = (game.shuffledQueue || []).filter((id) => poolIds.has(id));
  if (queue.length < 3) {
    queue = shuffle(pool.map((q) => q.id));
  }
  const pickedIds = queue.slice(0, 3);
  game.shuffledQueue = queue.slice(3);
  return pickedIds.map((id) => byId.get(id)).filter(Boolean);
}

/** Current player rolls. */
export function rollDice(game, playerId) {
  if (game.status !== "playing") return { ok: false, error: "Game over" };
  if (game.phase !== "roll") return { ok: false, error: "Not time to roll" };
  if (playerId !== game.playerIds[game.turnIndex]) return { ok: false, error: "Not your turn" };

  const dice = 1 + Math.floor(Math.random() * 6);
  game.lastDice = dice;
  let pos = game.positions[playerId];

  if (dice > 100 - pos) {
    game.message = "Need exact number to finish. Turn skipped.";
    nextTurn(game);
    game.updatedAt = Date.now();
    return { ok: true, game, events: [{ type: "skip", dice }] };
  }

  pos = Math.min(100, pos + dice);
  const after = applySnakesLadders(pos);
  game.positions[playerId] = after.pos;
  const path = [{ to: pos, dice }];
  if (after.event) path.push({ event: after.event, to: after.pos });
  game.updatedAt = Date.now();

  if (after.pos >= 100) {
    game.positions[playerId] = 100;
    game.status = "finished";
    game.phase = "done";
    game.winnerId = playerId;
    game.message = "Winner!";
    return { ok: true, game, events: [{ type: "win", path, dice }] };
  }

  if (QUESTION_SQUARES.includes(after.pos)) {
    const three = pickThree(game);
    game.pendingQuestionFull = null;
    game._pendingFull = three;
    game.pendingQuestions = three.map((q) => ({
      id: q.id,
      q: q.q.replace(/\[\[\d+\]\]/g, "______"),
      type: q.type || "choice",
      ui: q.ui || null,
      promptLabel: q.promptLabel || null,
      choices: q.choices,
    }));
    game.phase = "pickQuestion";
    game.answerFor = playerId;
    // the next player in turn order chooses the question
    game.pickFor = game.playerIds[(game.turnIndex + 1) % game.playerIds.length];
    game.message = "Question square!";
    return { ok: true, game, events: [{ type: "question", path, dice }] };
  }

  nextTurn(game);
  game.phase = "roll";
  game.message = "Next turn";
  return { ok: true, game, events: [{ type: "moved", path, dice }] };
}

export function pickQuestion(game, playerId, questionId) {
  if (game.phase !== "pickQuestion") return { ok: false, error: "Not picking" };
  if (playerId !== game.pickFor) return { ok: false, error: "Not your pick" };
  const full = (game._pendingFull || []).find((q) => q.id === questionId);
  if (!full) return { ok: false, error: "Invalid question" };
  game.pendingQuestionFull = full;
  game.pendingQuestions = null;
  game.phase = "answer";
  game.usedQuestionIds.push(full.id);
  game.message = "Answer the question";
  game.updatedAt = Date.now();
  return { ok: true, game };
}

/**
 * answer = { choiceIndex } for choice questions, { text } or { texts } for typed ones.
 * A plain number is accepted as a choice index.
 */
export function answerQuestion(game, playerId, answer) {
  if (game.phase !== "answer") return { ok: false, error: "Not answering" };
  if (playerId !== game.answerFor) return { ok: false, error: "Not your question" };
  const q = game.pendingQuestionFull;
  if (!q) return { ok: false, error: "No question" };

  let correct;
  let shown;
  if (q.type === "type") {
    if (q.blanks) {
      const texts = typeof answer === "object" && Array.isArray(answer?.texts) ? answer.texts : [];
      const nonEmpty = q.blanks.every((_, i) => rawTrim(texts[i]).length > 0);
      if (!nonEmpty) {
        correct = false;
      } else if (q.checkJoined) {
        correct = !!q.checkJoined(normalize(texts.slice(0, q.blanks.length).join(" ")));
      } else {
        correct = q.blanks.every((check, i) => !!check(normalize(texts[i])));
      }
    } else if (q.rawCheck) {
      correct = !!q.rawCheck(rawTrim(typeof answer === "object" ? answer?.text : ""));
    } else {
      correct = !!q.check(normalize(typeof answer === "object" ? answer?.text : ""));
    }
    shown = q.model;
  } else {
    const idx = typeof answer === "object" ? answer?.choiceIndex : answer;
    correct = Number(idx) === q.answer;
    shown = q.answer;
  }

  if (!correct) {
    game.positions[playerId] = Math.max(1, game.positions[playerId] - 3);
  }
  game.pendingQuestionFull = null;
  game._pendingFull = null;
  game.phase = "roll";
  nextTurn(game);
  game.answerFor = null;
  game.pickFor = null;
  game.message = correct ? "Correct!" : "Wrong — back 3";
  game.updatedAt = Date.now();
  return { ok: true, game, correct, answer: shown };
}
