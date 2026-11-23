/**
 * Family Words — Picture Match (multiplayer)
 *
 * Everyone sees the same picture with three word choices (one correct, two wrong).
 * Players tap their answer. Correct answers score points, with a small bonus for
 * answering quickly. The game ends when the host's time limit runs out or all
 * pictures have been shown.
 */

export const FAMILY_PICTURES = [
  { label: "A brother", image: "https://cdn.imgurl.ir/uploads/a058161_.png", audio: "https://cdn.imgurl.ir/uploads/l88386_.mp3" },
  { label: "A daughter", image: "https://cdn.imgurl.ir/uploads/r77090_.png", audio: "https://cdn.imgurl.ir/uploads/i61968_.mp3" },
  { label: "A husband", image: "https://cdn.imgurl.ir/uploads/o891156_.png", audio: "https://cdn.imgurl.ir/uploads/i37202_.mp3" },
  { label: "A sister", image: "https://cdn.imgurl.ir/uploads/b94256_.png", audio: "https://cdn.imgurl.ir/uploads/d501248_.mp3" },
  { label: "A son", image: "https://cdn.imgurl.ir/uploads/t241587_.png", audio: "https://cdn.imgurl.ir/uploads/c386216_.mp3" },
  { label: "A wife", image: "https://cdn.imgurl.ir/uploads/y3594_.png", audio: "https://cdn.imgurl.ir/uploads/j864986_.mp3" },
  { label: "A boy", image: "https://cdn.imgurl.ir/uploads/x06536_.png", audio: "https://cdn.imgurl.ir/uploads/h11316_.mp3" },
  { label: "Children", image: "https://cdn.imgurl.ir/uploads/z113036_.png", audio: "https://cdn.imgurl.ir/uploads/m904387_.mp3" },
  { label: "Father", image: "https://cdn.imgurl.ir/uploads/n9668_.png", audio: "https://cdn.imgurl.ir/uploads/t33466_.mp3" },
  { label: "Friends", image: "https://cdn.imgurl.ir/uploads/x330610_.png", audio: "https://cdn.imgurl.ir/uploads/q93660_.mp3" },
  { label: "A girl", image: "https://cdn.imgurl.ir/uploads/q13810_.png", audio: "https://cdn.imgurl.ir/uploads/s440128_.mp3" },
  { label: "Grandfather", image: "https://cdn.imgurl.ir/uploads/g29662_.png", audio: "https://cdn.imgurl.ir/uploads/68184_.mp3" },
  { label: "Grandmother", image: "https://cdn.imgurl.ir/uploads/a774121_.png", audio: "https://cdn.imgurl.ir/uploads/d245930_.mp3" },
  { label: "A man", image: "https://cdn.imgurl.ir/uploads/h20643_.png", audio: "https://cdn.imgurl.ir/uploads/r824979_.mp3" },
  { label: "A mother", image: "https://cdn.imgurl.ir/uploads/l966851_.png", audio: "https://cdn.imgurl.ir/uploads/a552621_.mp3" },
  { label: "A woman", image: "https://cdn.imgurl.ir/uploads/c565823_.png", audio: "https://cdn.imgurl.ir/uploads/f67737_.mp3" },
];

export const FW_TIME_OPTIONS = [60, 90, 120];
export const FW_MIN_SECONDS = 30;
export const FW_MAX_SECONDS = 600;
export const FW_DEFAULT_SECONDS = 90;

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

/** Clamp a host-chosen time limit (seconds) to the allowed range. */
export function normalizeTimeLimit(raw) {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return FW_DEFAULT_SECONDS;
  return Math.min(FW_MAX_SECONDS, Math.max(FW_MIN_SECONDS, n));
}

export function createFamilyState(playerIds, { timeLimit = FW_DEFAULT_SECONDS } = {}) {
  const seconds = normalizeTimeLimit(timeLimit);
  const order = shuffle(FAMILY_PICTURES);
  const questions = order.map((pic) => {
    const others = shuffle(FAMILY_PICTURES.filter((p) => p.label !== pic.label))
      .slice(0, 2)
      .map((p) => p.label);
    const choices = shuffle([pic.label, ...others]);
    return { image: pic.image, audio: pic.audio, choices, correct: choices.indexOf(pic.label) };
  });

  const scores = {};
  playerIds.forEach((id) => {
    scores[id] = { points: 0, correct: 0 };
  });

  const now = Date.now();
  return {
    type: "family-words",
    status: "playing", // playing | finished
    timeLimit: seconds,
    questions,
    index: 0,
    answers: {}, // playerId -> { choice, correct, points, ms } for the current picture
    scores,
    startedAt: now,
    endsAt: now + seconds * 1000,
    qStartedAt: now,
  };
}

/** What every player sees for the current picture (never the correct answer). */
export function publicQuestion(game) {
  const q = game.questions[game.index];
  if (!q) return null;
  return {
    index: game.index,
    total: game.questions.length,
    image: q.image,
    choices: q.choices,
    qStartedAt: game.qStartedAt,
  };
}

export function publicScoreboard(game, players) {
  const rows = players.map((p) => {
    const s = game.scores[p.id] || { points: 0, correct: 0 };
    return {
      playerId: p.id,
      displayName: p.displayName || p.username || "Player",
      points: s.points,
      correct: s.correct,
      answered: !!game.answers[p.id],
      connected: p.connected !== false,
    };
  });
  rows.sort((a, b) => b.points - a.points || b.correct - a.correct || a.displayName.localeCompare(b.displayName));
  return rows;
}

/** Record one player's answer for the current picture. */
export function submitAnswer(game, playerId, choice) {
  if (game.status !== "playing") return { ok: false, error: "The game is not running" };
  const q = game.questions[game.index];
  if (!q) return { ok: false, error: "No picture right now" };
  if (game.answers[playerId]) return { ok: false, error: "You already answered this picture" };
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

  return { ok: true, correct, points, label: q.choices[q.correct], audio: q.audio, ms };
}

/** True once every connected player has answered the current picture. */
export function allAnswered(game, connectedPlayerIds) {
  if (!connectedPlayerIds.length) return false;
  return connectedPlayerIds.every((id) => !!game.answers[id]);
}

/** Move to the next picture, or finish when pictures or time run out. */
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
