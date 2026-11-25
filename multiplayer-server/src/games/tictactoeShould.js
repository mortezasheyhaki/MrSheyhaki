/**
 * Tic-Tac-Toe (Should) — 2-player server-authoritative game logic.
 *
 * Flow:
 * 1. phase = "rps": Both players choose rock | paper | scissors.
 *    - Tie -> bump rps.round, show reveal + rpsNote, let both pick again.
 *    - Win -> set xId = winner, symbols = { winner: "X", loser: "O" },
 *      show reveal briefly, then move to phase = "turn".
 * 2. phase = "turn":
 *    - stage = "answer": activeId answers a Should question (choice or order) or skips (ttt:cant).
 *      Correct -> markBy = activeId. Wrong / pass -> markBy = opponentId.
 *    - stage = "mark": markBy places their symbol on an empty board cell (0..8).
 *      Win line -> phase = "over", winnerId = markBy, winLine = [...].
 *      Board full -> phase = "over", winnerId = "draw".
 *      Otherwise -> next turn, alternating activeId.
 */

const HANDS = ["rock", "paper", "scissors"];
const BEATS = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export const LINES_WIN = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const CHOICE_QUESTIONS = [
  {
    type: "choice",
    subject: "She has a bad headache.",
    note: "advice",
    q: "Should she take some medicine?",
    hint: "Yes, …",
    options: ["Yes, she should.", "No, she shouldn't."],
    correct: 0,
  },
  {
    type: "choice",
    subject: "He has a math exam tomorrow.",
    note: "advice",
    q: "Should he play video games all night?",
    hint: "No, …",
    options: ["Yes, he should.", "No, he shouldn't."],
    correct: 1,
  },
  {
    type: "choice",
    subject: "It's raining outside.",
    note: "advice",
    q: "Should I take an umbrella?",
    hint: "Yes, …",
    options: ["Yes, you should.", "No, you shouldn't."],
    correct: 0,
  },
  {
    type: "choice",
    subject: "Your friend is very tired.",
    note: "advice",
    q: "Should she go to bed early?",
    hint: "Yes, …",
    options: ["Yes, she should.", "No, she shouldn't."],
    correct: 0,
  },
  {
    type: "choice",
    subject: "I want to learn English faster.",
    note: "advice",
    q: "Should I practice speaking every day?",
    hint: "Yes, …",
    options: ["Yes, you should.", "No, you shouldn't."],
    correct: 0,
  },
  {
    type: "choice",
    subject: "My brother has a toothache.",
    note: "advice",
    q: "Should he eat lots of candy?",
    hint: "No, …",
    options: ["Yes, he should.", "No, he shouldn't."],
    correct: 1,
  },
  {
    type: "choice",
    subject: "The traffic light is red.",
    note: "safety",
    q: "Should cars cross the street now?",
    hint: "No, …",
    options: ["Yes, they should.", "No, they shouldn't."],
    correct: 1,
  },
  {
    type: "choice",
    subject: "We are going to the airport soon.",
    note: "travel",
    q: "Should we check our passports before we leave?",
    hint: "Yes, …",
    options: ["Yes, we should.", "No, we shouldn't."],
    correct: 0,
  },
  {
    type: "choice",
    subject: "Tom forgot his coat on a cold day.",
    note: "advice",
    q: "Should he stay outside for two hours without a jacket?",
    hint: "No, …",
    options: ["Yes, he should.", "No, he shouldn't."],
    correct: 1,
  },
  {
    type: "choice",
    subject: "You want to stay healthy.",
    note: "health",
    q: "Should you drink plenty of water every day?",
    hint: "Yes, …",
    options: ["Yes, I should.", "No, I shouldn't."],
    correct: 0,
  },
];

const ORDER_QUESTIONS = [
  {
    type: "order",
    b: "Yes, you should see a doctor.",
    words: ["Should", "I", "see", "a", "doctor?"],
  },
  {
    type: "order",
    b: "You should wear a warm coat.",
    words: ["What", "should", "I", "wear", "today?"],
  },
  {
    type: "order",
    b: "No, she shouldn't go to school.",
    words: ["Should", "she", "go", "to", "school?"],
  },
  {
    type: "order",
    b: "He should study harder for the test.",
    words: ["What", "should", "he", "do", "now?"],
  },
  {
    type: "order",
    b: "Yes, we should leave at 7 o'clock.",
    words: ["Should", "we", "leave", "at", "7?"],
  },
  {
    type: "order",
    b: "You shouldn't eat fast food every day.",
    words: ["You", "shouldn't", "eat", "fast", "food."],
  },
  {
    type: "order",
    b: "No, they shouldn't shout in the library.",
    words: ["Should", "they", "be", "quiet", "here?"],
  },
  {
    type: "order",
    b: "She should drink some warm tea.",
    words: ["She", "should", "drink", "warm", "tea."],
  },
];

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestion(raw) {
  if (raw.type === "choice") {
    return {
      type: "choice",
      subject: raw.subject,
      note: raw.note || "",
      q: raw.q,
      hint: raw.hint,
      options: raw.options.slice(),
      correct: raw.correct,
      revealText: raw.options[raw.correct],
    };
  }
  // Word order question: guarantee chips are shuffled differently from solved order when length > 1
  let chips = shuffle(raw.words);
  if (raw.words.length > 1 && chips.join(" ") === raw.words.join(" ")) {
    chips = raw.words.slice(1).concat(raw.words[0]);
  }
  const answerText = raw.words.join(" ");
  return {
    type: "order",
    b: raw.b,
    chips,
    answerText,
    revealText: answerText,
  };
}

function createDeck() {
  const combined = [...CHOICE_QUESTIONS, ...ORDER_QUESTIONS];
  return shuffle(combined).map(buildQuestion);
}

function publicQuestion(q, number, total) {
  if (!q) return null;
  if (q.type === "choice") {
    return {
      type: "choice",
      number,
      total,
      subject: q.subject,
      note: q.note,
      q: q.q,
      hint: q.hint,
      options: q.options,
    };
  }
  return {
    type: "order",
    number,
    total,
    b: q.b,
    chips: q.chips,
  };
}

export function createTttShouldState(playerIds) {
  if (!Array.isArray(playerIds) || playerIds.length !== 2) {
    throw new Error("Tic-Tac-Toe needs exactly 2 players");
  }
  const deck = createDeck();
  return {
    type: "tictactoe-should",
    playerIds: playerIds.slice(0, 2),
    phase: "rps", // rps | turn | over
    symbols: {}, // playerId -> "X" | "O"
    xId: null,
    board: Array(9).fill(null),
    winLine: null,
    winnerId: null,
    rps: {
      round: 1,
      choices: {}, // internal secret map: playerId -> rock|paper|scissors
      reveal: null, // populated once both lock in
    },
    rpsNote: "",
    deck,
    qIndex: 0,
    turnNumber: 1,
    totalQuestions: deck.length,
    turn: null,
  };
}

export function publicTttState(game) {
  if (!game || game.type !== "tictactoe-should") return null;
  const chosen = {};
  game.playerIds.forEach((id) => {
    chosen[id] = !!game.rps.choices[id];
  });

  let turn = null;
  if (game.turn) {
    turn = {
      number: game.turn.number,
      total: game.turn.total,
      stage: game.turn.stage,
      activeId: game.turn.activeId,
      markBy: game.turn.markBy,
      result: game.turn.result,
      reveal: game.turn.reveal,
      question: publicQuestion(game.turn.questionFull, game.turn.number, game.turn.total),
    };
  }

  return {
    type: game.type,
    phase: game.phase,
    symbols: { ...game.symbols },
    xId: game.xId,
    board: game.board.slice(),
    winLine: game.winLine ? game.winLine.slice() : null,
    winnerId: game.winnerId,
    rps: {
      round: game.rps.round,
      chosen,
      reveal: game.rps.reveal ? { ...game.rps.reveal } : null,
    },
    rpsNote: game.rpsNote,
    turn,
  };
}

export function submitRps(game, playerId, choice) {
  if (!game || game.phase !== "rps") {
    return { ok: false, error: "Rock Paper Scissors is not active" };
  }
  if (!game.playerIds.includes(playerId)) {
    return { ok: false, error: "You are not a player in this match" };
  }
  if (game.xId) {
    return { ok: false, error: "First player already decided" };
  }
  if (!HANDS.includes(choice)) {
    return { ok: false, error: "Choose rock, paper, or scissors" };
  }
  if (game.rps.choices[playerId]) {
    return { ok: false, error: "You already locked in" };
  }

  // Starting a fresh round clears the previous tie reveal
  if (Object.keys(game.rps.choices).length === 0) {
    game.rps.reveal = null;
    game.rpsNote = "";
  }

  game.rps.choices[playerId] = choice;

  const [p1, p2] = game.playerIds;
  const c1 = game.rps.choices[p1];
  const c2 = game.rps.choices[p2];

  if (!c1 || !c2) {
    return { ok: true, resolved: false, tie: false };
  }

  const reveal = { [p1]: c1, [p2]: c2 };
  if (c1 === c2) {
    game.rps.round += 1;
    game.rps.choices = {};
    game.rps.reveal = reveal;
    game.rpsNote = "Tie! Choose again.";
    return { ok: true, resolved: true, tie: true };
  }

  const winner = BEATS[c1] === c2 ? p1 : p2;
  const loser = winner === p1 ? p2 : p1;
  game.xId = winner;
  game.symbols = { [winner]: "X", [loser]: "O" };
  game.rps.reveal = reveal;
  game.rpsNote = "";
  return { ok: true, resolved: true, tie: false, winner };
}

function getNextQuestion(game) {
  if (game.qIndex >= game.deck.length) {
    game.deck = createDeck();
    game.qIndex = 0;
  }
  const q = game.deck[game.qIndex];
  game.qIndex += 1;
  return q;
}

export function startTurnPhase(game) {
  if (!game || game.phase !== "rps" || !game.xId) {
    return { ok: false, error: "Cannot start turns yet" };
  }
  game.phase = "turn";
  game.turnNumber = 1;
  game.turn = {
    number: 1,
    total: game.totalQuestions,
    stage: "answer",
    activeId: game.xId,
    markBy: null,
    result: null,
    reveal: null,
    questionFull: getNextQuestion(game),
  };
  return { ok: true };
}

function opponentOf(game, playerId) {
  return game.playerIds[0] === playerId ? game.playerIds[1] : game.playerIds[0];
}

export function submitAnswer(game, playerId, payload = {}) {
  if (!game || game.phase !== "turn" || !game.turn) {
    return { ok: false, error: "No active turn" };
  }
  if (game.turn.stage !== "answer") {
    return { ok: false, error: "Waiting for a mark on the board" };
  }
  if (game.turn.activeId !== playerId) {
    return { ok: false, error: "Not your turn to answer" };
  }

  const q = game.turn.questionFull;
  let correct = false;
  if (q.type === "choice") {
    const idx = Number(payload.choice);
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.options.length) {
      return { ok: false, error: "Choose an answer option" };
    }
    correct = idx === q.correct;
  } else {
    const order = Array.isArray(payload.order) ? payload.order : null;
    if (!order || order.length !== q.chips.length) {
      return { ok: false, error: "Put all words in order" };
    }
    const seen = new Set(order.map(Number));
    if (seen.size !== q.chips.length) {
      return { ok: false, error: "Invalid word selection" };
    }
    const built = order
      .map((idx) => q.chips[Number(idx)])
      .filter((w) => typeof w === "string")
      .join(" ");
    correct = built === q.answerText;
  }

  game.turn.stage = "mark";
  game.turn.result = correct ? "correct" : "wrong";
  game.turn.reveal = q.revealText;
  game.turn.markBy = correct ? playerId : opponentOf(game, playerId);
  return { ok: true, correct };
}

export function cantAnswer(game, playerId) {
  if (!game || game.phase !== "turn" || !game.turn) {
    return { ok: false, error: "No active turn" };
  }
  if (game.turn.stage !== "answer") {
    return { ok: false, error: "Waiting for a mark on the board" };
  }
  if (game.turn.activeId !== playerId) {
    return { ok: false, error: "Not your turn to answer" };
  }
  game.turn.stage = "mark";
  game.turn.result = "pass";
  game.turn.reveal = game.turn.questionFull.revealText;
  game.turn.markBy = opponentOf(game, playerId);
  return { ok: true };
}

export function markCell(game, playerId, cellRaw) {
  if (!game || game.phase !== "turn" || !game.turn) {
    return { ok: false, error: "No active turn" };
  }
  if (game.turn.stage !== "mark") {
    return { ok: false, error: "Answer the question first" };
  }
  if (game.turn.markBy !== playerId) {
    return { ok: false, error: "Not your turn to mark" };
  }
  const cell = Number(cellRaw);
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) {
    return { ok: false, error: "Invalid square" };
  }
  if (game.board[cell] !== null) {
    return { ok: false, error: "Square is already taken" };
  }

  const sym = game.symbols[playerId];
  game.board[cell] = sym;

  const winLine = LINES_WIN.find(
    ([a, b, c]) => game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]
  );
  if (winLine) {
    game.phase = "over";
    game.winnerId = playerId;
    game.winLine = winLine;
    return { ok: true, over: true };
  }

  if (game.board.every((v) => v !== null)) {
    game.phase = "over";
    game.winnerId = "draw";
    game.winLine = null;
    return { ok: true, over: true };
  }

  const nextActive = opponentOf(game, game.turn.activeId);
  game.turnNumber += 1;
  game.turn = {
    number: game.turnNumber,
    total: game.totalQuestions,
    stage: "answer",
    activeId: nextActive,
    markBy: null,
    result: null,
    reveal: null,
    questionFull: getNextQuestion(game),
  };
  return { ok: true, over: false };
}
