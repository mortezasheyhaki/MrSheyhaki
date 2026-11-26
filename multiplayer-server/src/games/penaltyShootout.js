/* Penalty Shootout – online rules (server).
   Mirrors multiplayer/penalty-shootout/engine.js. Keep the rules in sync with that file.

   Each kick, the shooter and the keeper each answer a question at the same time, on their own
   device. A right answer lets a player pick a corner (kept secret on the server). A wrong answer
   means the shot flies over the bar (shooter) or the keeper slips (keeper). The kick resolves
   once both players are done. Nothing secret is sent to the room, only to the player it belongs to. */

import { PS_SUBJECTS } from "./penaltySubjects.js";

export const PS_ZONES = ["left", "center", "right"];
export const PS_ROUNDS = [3, 5, 7];
const CHIP_COUNT = 3;
const QUESTION_MS = 25000; // time to answer a question
const PICK_MS = 20000;     // time to choose a corner (a random one is taken if it runs out)
const REVEAL_MS = 3800;    // pause on the result before the next kick

/* ---------- helpers ---------- */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Endless deck: every question once (shuffled), then again. Never the same question twice in a row.
function makeDeck(questions) {
  let deck = [], last = null;
  return function next() {
    if (!deck.length) {
      deck = shuffle(questions);
      if (deck.length > 1 && deck[deck.length - 1] === last) deck.unshift(deck.pop());
    }
    last = deck.pop();
    return last;
  };
}

// Chip answers: the right answer plus wrong ones picked at random.
function buildChips(q, count) {
  const wrong = shuffle(q.wrong || []).slice(0, Math.max(1, (count || 3) - 1));
  return shuffle([q.answer, ...wrong]);
}

// Typed answers. Lenient by default (case, full stops, commas, question marks and apostrophes ignored).
// Strict (q.strict) keeps capitals and punctuation, used for sentence reordering.
function normalizeText(text, strict) {
  let s = String(text == null ? "" : text).replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, " ").trim();
  if (!strict) s = s.toLowerCase().replace(/[.?!,']/g, "").replace(/\s+/g, " ").trim();
  return s;
}

function checkWritten(input, q) {
  const accepted = [].concat(q.answers || q.answer || []);
  const given = normalizeText(input, !!q.strict);
  return accepted.some((a) => normalizeText(a, !!q.strict) === given);
}

export function listPenaltySubjects() {
  return PS_SUBJECTS.map((s) => ({
    id: s.id, title: s.title, tag: s.tag || "", emoji: s.emoji || "📘", count: s.questions.length,
  }));
}

export function getPenaltySubject(id) {
  return PS_SUBJECTS.find((s) => s.id === id) || null;
}

export function normalizeRounds(n) {
  return PS_ROUNDS.includes(Number(n)) ? Number(n) : 5;
}

/* ---------- match ---------- */

export function createPenaltyState(playerIds, settings = {}) {
  const subject = getPenaltySubject(settings.subjectId) || PS_SUBJECTS[0];
  return {
    type: "penalty-shootout",
    subjectId: subject.id,
    subjectTitle: subject.title,
    players: playerIds.slice(0, 2),
    rounds: normalizeRounds(settings.rounds),
    kick: 0,
    goals: [0, 0],
    log: [[], []],
    over: false,
    winnerIdx: null,
    deck: makeDeck(subject.questions),
    role: null,      // { [playerId]: { kind, stage, q, chips, correct, zone, answerText, deadline } } for the current kick
    nextAt: null,    // when the next kick starts (after a reveal)
    seq: 0,          // bumps every time a kick resolves, so clients can animate once
    lastKick: null,
  };
}

export function kickInfo(game) {
  const k = game.kick;
  return {
    shooterIdx: k % 2,
    keeperIdx: (k + 1) % 2,
    round: Math.floor(k / 2) + 1,
    sudden: k >= 2 * game.rounds,
    total: 2 * game.rounds,
  };
}

function roleFor(game, kind, playerId) {
  const q = game.deck();
  const isChip = !!q.answer && !q.type;
  return {
    playerId,
    kind,
    stage: "question",       // question -> pick -> locked, or question -> done (wrong answer)
    q,
    chips: isChip ? buildChips(q, CHIP_COUNT) : null,
    correct: false,
    zone: null,
    answerText: null,
    deadline: null,
  };
}

// Start the next kick: the shooter and the keeper each get their own question.
export function startKick(game, now) {
  if (game.over) return;
  const info = kickInfo(game);
  const shooter = game.players[info.shooterIdx];
  const keeper = game.players[info.keeperIdx];
  game.nextAt = null;
  game.role = {
    [shooter]: roleFor(game, "shoot", shooter),
    [keeper]: roleFor(game, "dive", keeper),
  };
  Object.values(game.role).forEach((r) => { r.deadline = now + QUESTION_MS; });
}

function requireRole(game, playerId) {
  const r = game.role && game.role[playerId];
  if (!r) return { ok: false, error: "Nothing to answer right now" };
  return { ok: true, role: r };
}

// Answer a question. Returns { ok, correct } or { ok:false, error }.
export function submitAnswer(game, playerId, answer, now) {
  const found = requireRole(game, playerId);
  if (!found.ok) return found;
  const r = found.role;
  if (r.stage !== "question") return { ok: false, error: "Already answered" };

  const q = r.q;
  const correct = q.type === "write"
    ? checkWritten(answer, q)
    : String(answer) === String(q.answer);

  r.correct = correct;
  r.answerText = q.answer;
  if (correct) {
    r.stage = "pick";
    r.deadline = now + PICK_MS;
  } else {
    r.stage = "done";
    r.deadline = null;
  }
  return { ok: true, correct };
}

export function submitPick(game, playerId, zone) {
  const found = requireRole(game, playerId);
  if (!found.ok) return found;
  const r = found.role;
  if (r.stage !== "pick") return { ok: false, error: "Answer the question first" };
  if (!PS_ZONES.includes(zone)) return { ok: false, error: "Pick a corner" };
  r.zone = zone;
  r.stage = "locked";
  r.deadline = null;
  return { ok: true };
}

// Called when a deadline passes: a question is wrong, a corner is picked at random.
function expireRole(r, now) {
  if (r.stage === "question") {
    r.correct = false;
    r.answerText = r.q.answer;
    r.stage = "done";
  } else if (r.stage === "pick") {
    r.zone = PS_ZONES[Math.floor(Math.random() * PS_ZONES.length)];
    r.stage = "locked";
  }
  r.deadline = null;
}

function resolveKick(game, now) {
  const info = kickInfo(game);
  const roles = Object.values(game.role);
  const shooter = roles.find((r) => r.kind === "shoot");
  const keeper = roles.find((r) => r.kind === "dive");

  const shooterCorrect = shooter.correct;
  const keeperCorrect = keeper.correct;
  const shotZone = shooterCorrect ? shooter.zone : null;
  const diveZone = keeperCorrect ? keeper.zone : null;

  // Same rules as engine.js
  let result;
  if (!shooterCorrect) result = "miss";
  else if (keeperCorrect && diveZone === shotZone) result = "save";
  else result = "goal";

  const s = info.shooterIdx;
  if (result === "goal") game.goals[s]++;
  game.log[s].push(result);
  game.kick++;

  game.seq++;
  game.lastKick = {
    seq: game.seq,
    round: info.round,
    sudden: info.sudden,
    shooterId: shooter.playerId,
    keeperId: keeper.playerId,
    shooterCorrect,
    keeperCorrect,
    shotZone,
    diveZone,
    result,
    shooterAnswer: shooter.answerText,
    keeperAnswer: keeper.answerText,
  };

  if (game.kick >= 2 * game.rounds && game.kick % 2 === 0 && game.goals[0] !== game.goals[1]) {
    game.over = true;
    game.winnerIdx = game.goals[0] > game.goals[1] ? 0 : 1;
    game.nextAt = null;
  } else {
    game.nextAt = now + REVEAL_MS;
  }
  game.role = null;
}

/* Advance the match to `now`: expire passed deadlines, resolve a finished kick, or start the next kick.
   Returns true if anything changed. */
export function advancePenalty(game, now) {
  if (game.over) return false;
  if (game.nextAt && now >= game.nextAt) {
    startKick(game, now);
    return true;
  }
  if (!game.role) return false;

  let changed = false;
  for (const r of Object.values(game.role)) {
    if (r.deadline && now >= r.deadline && (r.stage === "question" || r.stage === "pick")) {
      expireRole(r, now);
      changed = true;
    }
  }
  const done = Object.values(game.role).every((r) => r.stage === "locked" || r.stage === "done");
  if (done) {
    resolveKick(game, now);
    changed = true;
  }
  return changed;
}

/* When the next thing should happen (for the server timer), or null. */
export function nextPenaltyDeadline(game) {
  if (game.over) return null;
  if (game.nextAt) return game.nextAt;
  if (!game.role) return null;
  const pending = Object.values(game.role).filter((r) => r.deadline && (r.stage === "question" || r.stage === "pick"));
  if (!pending.length) return null;
  return Math.min(...pending.map((r) => r.deadline));
}

/* ---------- what each side sees ---------- */

// Room-wide view: no secret choices, no open questions. Only who is still busy.
export function publicPenaltyState(game) {
  const info = kickInfo(game);
  const waitingOn = game.role
    ? Object.values(game.role).filter((r) => r.stage === "question" || r.stage === "pick").map((r) => r.playerId)
    : [];
  return {
    type: "penalty-shootout",
    subjectId: game.subjectId,
    subjectTitle: game.subjectTitle,
    rounds: game.rounds,
    kick: game.kick,
    total: info.total,
    round: info.round,
    sudden: info.sudden,
    shooterId: game.over ? null : game.players[info.shooterIdx],
    keeperId: game.over ? null : game.players[info.keeperIdx],
    players: game.players.slice(),
    goals: game.goals.slice(),
    log: game.log.map((l) => l.slice()),
    over: game.over,
    winnerId: game.over ? game.players[game.winnerIdx] : null,
    waitingOn,
    kicking: !!game.role,
    lastKick: game.lastKick,
  };
}

// The private view for one player: only their own question, and their own corner once picked.
export function privatePenaltyState(game, playerId, now) {
  const r = game.role && game.role[playerId];
  if (!r) return { role: null };

  const question = r.q.type === "write"
    ? { type: "write", q: r.q.q, hint: r.q.hint || null, prompt: r.q.prompt || null }
    : { type: "chips", q: r.q.q, hint: r.q.hint || null, prompt: r.q.prompt || null, chips: r.chips };

  return {
    role: {
      kind: r.kind,
      stage: r.stage,
      kick: game.kick,
      correct: r.correct,
      zone: r.zone,
      answerText: r.stage === "done" || r.stage === "locked" ? r.answerText : null,
      left: r.deadline ? Math.max(0, Math.ceil((r.deadline - now) / 1000)) : null,
      question: r.stage === "question" ? question : null,
    },
  };
}
