/* Penalty Shootout – game rules only (no screen code).
   Runs in the browser (window.PenaltyEngine) and in Node (require), so the online
   multiplayer server can use the very same rules later. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PenaltyEngine = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var ZONES = ["left", "center", "right"];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- questions ---------- */
  // A question is { q, answer, wrong: [...], hint? }.
  // It becomes `count` chips: the right answer + (count - 1) wrong ones picked at random.
  function buildChips(question, count) {
    var wrong = shuffle(question.wrong || []).slice(0, Math.max(1, (count || 3) - 1));
    var chips = shuffle([{ text: question.answer, correct: true }].concat(
      wrong.map(function (w) { return { text: w, correct: false }; })
    ));
    return chips;
  }

  // Endless question deck: every question once (shuffled), then again.
  function makeDeck(questions) {
    var deck = [], last = null;
    return function next() {
      if (!deck.length) {
        deck = shuffle(questions);
        if (deck.length > 1 && deck[deck.length - 1] === last) deck.unshift(deck.pop());
      }
      last = deck.pop();
      return last;
    };
  }

  /* ---------- written answers ---------- */
  // A "write" question is { type:"write", q, answer, answers?, strict?, hint?, prompt? }.
  // The player types the answer. Lenient (default): case, full stops, commas, question
  // marks and apostrophes are ignored, so "isn't" and "isnt" both count.
  // Strict (strict: true): capitals and punctuation must match (used for sentence reordering).
  function normalizeText(text, strict) {
    var s = String(text == null ? "" : text).replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, " ").trim();
    if (!strict) s = s.toLowerCase().replace(/[.?!,']/g, "").replace(/\s+/g, " ").trim();
    return s;
  }

  function checkWritten(input, question) {
    var accepted = [].concat(question.answers || question.answer || []);
    var given = normalizeText(input, !!question.strict);
    return accepted.some(function (a) { return normalizeText(a, !!question.strict) === given; });
  }

  /* ---------- match ---------- */
  // Kicks alternate: player 0 shoots, player 1 keeps; then player 1 shoots, player 0 keeps...
  // Each player takes `rounds` kicks. If it is level after that, sudden death (one kick each) until someone leads.
  function newMatch(names, rounds) {
    return { names: names.slice(0, 2), rounds: rounds || 5, kick: 0, goals: [0, 0], log: [[], []], over: false, winner: null };
  }

  function kickInfo(m) {
    var k = m.kick;
    return { shooter: k % 2, keeper: (k + 1) % 2, round: Math.floor(k / 2) + 1, sudden: k >= 2 * m.rounds };
  }

  // shooterCorrect=false            -> the kick is missed (over the bar)
  // keeperCorrect && same corner    -> save
  // anything else                   -> goal   (a keeper who answered wrong slips and cannot save)
  function resolveKick(i) {
    if (!i.shooterCorrect) return "miss";
    if (i.keeperCorrect && i.diveZone === i.shotZone) return "save";
    return "goal";
  }

  function applyKick(m, result) {
    var s = m.kick % 2;
    if (result === "goal") m.goals[s]++;
    m.log[s].push(result);
    m.kick++;
    if (m.kick >= 2 * m.rounds && m.kick % 2 === 0 && m.goals[0] !== m.goals[1]) {
      m.over = true;
      m.winner = m.goals[0] > m.goals[1] ? 0 : 1;
    }
    return m;
  }

  return { ZONES: ZONES, shuffle: shuffle, buildChips: buildChips, makeDeck: makeDeck, checkWritten: checkWritten,
           newMatch: newMatch, kickInfo: kickInfo, resolveKick: resolveKick, applyKick: applyKick };
});
