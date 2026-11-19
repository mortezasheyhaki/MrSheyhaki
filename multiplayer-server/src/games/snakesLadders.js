/**
 * Snakes & Ladders — 2-player multiplayer logic (server-authoritative)
 */

export const LADDERS = { 8: 31, 21: 42, 25: 34, 66: 73, 70: 89 };
export const SNAKES = {
  19: 6, 29: 27, 54: 34, 57: 41, 62: 19, 75: 53, 88: 67, 93: 70, 96: 75, 98: 79,
};
export const QUESTION_SQUARES = [
  2, 6, 11, 12, 15, 17, 20, 23, 27, 32, 34, 41, 44, 51, 52, 54,
  60, 61, 64, 69, 73, 74, 81, 83, 90, 91, 94, 95, 97,
];

export const QUESTIONS = [
  { id: 1, q: "Which of these words isn't used with the present simple?", choices: ["always", "never", "now"], answer: 2 },
  { id: 2, q: "Which sentence is correct?", choices: ["I usually play football after school on Wednesdays.", "I'm usually playing football after school on Wednesdays."], answer: 0 },
  { id: 3, q: "What's the missing word? Where ______ you going?", choices: ["do", "are", "is"], answer: 1 },
  { id: 4, q: "Which time word isn't used with the present continuous?", choices: ["Today", "Sometimes", "Now"], answer: 1 },
  { id: 5, q: "Correct ending: 'I always…'", choices: ["… get up at 7am.", "… am getting up at 7am.", "… getting up at 7am."], answer: 0 },
  { id: 6, q: "Why is the present simple used? 'I live in a small city in France.'", choices: ["It's a temporary action", "It's a permanent fact / routine", "It's happening right now"], answer: 1 },
  { id: 7, q: "Finish: I can't talk right now because I ______ (have) lunch.", choices: ["have", "am having", "having"], answer: 1 },
  { id: 8, q: "Correct this: Sarah and Michael watching a film.", choices: ["Sarah and Michael is watching a film.", "Sarah and Michael are watching a film.", "Sarah and Michael watch a film."], answer: 1 },
  { id: 9, q: "Which sentence is correct?", choices: ["I don't see my grandmother every day.", "I'm not seeing my grandmother every day.", "I not see my grandmother every day."], answer: 0 },
  { id: 10, q: "Make a correct sentence: We / have / a lot of fun on holiday this week.", choices: ["We have a lot of fun on holiday this week.", "We are having a lot of fun on holiday this week.", "We having a lot of fun on holiday this week."], answer: 1 },
  { id: 11, q: "Correct this: I'm not knowing how to cook.", choices: ["I don't know how to cook.", "I'm not know how to cook.", "I not knowing how to cook."], answer: 0 },
  { id: 12, q: "Emmanuelle and Fred ______ (not like) Paris, so they ______ (not enjoy) their holiday.", choices: ["don't like / aren't enjoying", "aren't liking / don't enjoy", "don't like / don't enjoy"], answer: 0 },
  { id: 13, q: "I usually ______ (wear) jeans, but today I ______ (not wear) jeans.", choices: ["wear / am not wearing", "am wearing / don't wear", "wear / don't wear"], answer: 0 },
  { id: 14, q: "Correct this: I don't never do my homework.", choices: ["I never do my homework.", "I don't ever not do my homework.", "I'm never doing my homework."], answer: 0 },
  { id: 15, q: "Difference: a) She's an angry person. b) She's feeling angry today.", choices: ["a = permanent character, b = temporary feeling", "a = temporary, b = permanent", "No difference"], answer: 0 },
  { id: 16, q: "Finish: 'My brother and sister are making dinner…'", choices: ["… usually.", "… on Saturdays.", "… at the moment."], answer: 2 },
  { id: 17, q: "Lilly ______ (not usually) ______ (eat) cake, but today she ______ (eat) chocolate cake.", choices: ["doesn't usually eat / is eating", "isn't usually eating / eats", "doesn't usually eat / eats"], answer: 0 },
  { id: 18, q: "I'm not in the office today, because…", choices: ["… I visiting my aunt.", "… I'm visiting my aunt.", "… I visit my aunt."], answer: 1 },
  { id: 19, q: "Make a correct sentence: Where / Lana / go to school?", choices: ["Where does Lana go to school?", "Where is Lana go to school?", "Where Lana goes to school?"], answer: 0 },
  { id: 20, q: "Correct this: Who are George live with?", choices: ["Who does George live with?", "Who is George live with?", "Who George lives with?"], answer: 0 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createSnakesLaddersState(playerIds) {
  if (!playerIds || playerIds.length < 2) {
    throw new Error("Snakes & Ladders needs exactly 2 players");
  }
  const ids = playerIds.slice(0, 2);
  return {
    type: "snakes-ladders",
    status: "playing", // playing | finished
    playerIds: ids,
    positions: { [ids[0]]: 1, [ids[1]]: 1 },
    turnIndex: 0, // 0 or 1 into playerIds
    phase: "roll", // roll | moving | pickQuestion | answer | done
    lastDice: null,
    pendingQuestions: null, // [{id,q,choices}] without answers for picker
    pendingQuestionFull: null, // full question for answer phase
    answerFor: null,
    pickFor: null,
    usedQuestionIds: [],
    winnerId: null,
    message: "Game started",
    updatedAt: Date.now(),
  };
}

export function publicSlState(game, players) {
  if (!game || game.type !== "snakes-ladders") return null;
  const names = {};
  (players || []).forEach((p) => {
    names[p.id] = p.displayName || p.username || "Player";
  });
  return {
    type: game.type,
    status: game.status,
    playerIds: game.playerIds,
    positions: { ...game.positions },
    turnIndex: game.turnIndex,
    turnId: game.playerIds[game.turnIndex],
    phase: game.phase,
    lastDice: game.lastDice,
    pendingQuestions: game.pendingQuestions,
    // only send choices+q to answerer, never answer index until after
    currentQuestion:
      game.phase === "answer" && game.pendingQuestionFull
        ? {
            id: game.pendingQuestionFull.id,
            q: game.pendingQuestionFull.q,
            choices: game.pendingQuestionFull.choices,
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

function currentPlayerId(game) {
  return game.playerIds[game.turnIndex];
}

function applySnakesLadders(pos) {
  if (LADDERS[pos]) return { pos: LADDERS[pos], event: "ladder", to: LADDERS[pos] };
  if (SNAKES[pos]) return { pos: SNAKES[pos], event: "snake", to: SNAKES[pos] };
  return { pos, event: null };
}

function pickThree(game) {
  let pool = QUESTIONS.filter((q) => !game.usedQuestionIds.includes(q.id));
  if (pool.length < 3) {
    game.usedQuestionIds = [];
    pool = QUESTIONS.slice();
  }
  return shuffle(pool).slice(0, 3);
}

/**
 * Current player rolls dice. Returns { ok, game, events }
 */
export function rollDice(game, playerId) {
  if (game.status !== "playing") return { ok: false, error: "Game over" };
  if (game.phase !== "roll") return { ok: false, error: "Not time to roll" };
  if (playerId !== currentPlayerId(game)) return { ok: false, error: "Not your turn" };

  const dice = 1 + Math.floor(Math.random() * 6);
  game.lastDice = dice;
  let pos = game.positions[playerId];
  const remaining = 100 - pos;

  if (dice > remaining) {
    game.message = "Need exact number to finish. Turn skipped.";
    game.phase = "roll";
    game.turnIndex = 1 - game.turnIndex;
    game.updatedAt = Date.now();
    return { ok: true, game, events: [{ type: "skip", dice }] };
  }

  pos = pos + dice;
  if (pos > 100) pos = 100;
  const path = [];
  // final square after steps
  const after = applySnakesLadders(pos);
  game.positions[playerId] = after.pos;
  path.push({ to: pos, dice });
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
    game.pendingQuestions = three.map((q) => ({
      id: q.id,
      q: q.q,
      choices: q.choices,
    }));
    // store full with answers server-side only
    game._pendingFull = three;
    game.phase = "pickQuestion";
    game.answerFor = playerId;
    game.pickFor = game.playerIds[1 - game.turnIndex];
    game.message = "Question square!";
    return { ok: true, game, events: [{ type: "question", path, dice }] };
  }

  game.phase = "roll";
  game.turnIndex = 1 - game.turnIndex;
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

export function answerQuestion(game, playerId, choiceIndex) {
  if (game.phase !== "answer") return { ok: false, error: "Not answering" };
  if (playerId !== game.answerFor) return { ok: false, error: "Not your question" };
  const q = game.pendingQuestionFull;
  if (!q) return { ok: false, error: "No question" };
  const correct = Number(choiceIndex) === q.answer;
  if (!correct) {
    const back = Math.max(1, game.positions[playerId] - 3);
    game.positions[playerId] = back;
  }
  game.pendingQuestionFull = null;
  game._pendingFull = null;
  game.phase = "roll";
  game.turnIndex = 1 - game.turnIndex;
  game.answerFor = null;
  game.pickFor = null;
  game.message = correct ? "Correct!" : "Wrong — back 3";
  game.updatedAt = Date.now();
  return { ok: true, game, correct, answer: q.answer };
}
