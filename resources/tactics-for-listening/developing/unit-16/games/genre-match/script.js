/* Match the movie genres · Tactics For Listening Developing Unit 16
 * Tap a genre (left) and its meaning (right), or tap the meaning first.
 * Item 1 is the worked example from the worksheet and starts matched.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u16-genre-match";
  var UNIT = "Unit 16 · Developing";
  var BACK = "../../";

  // genre (left) -> letter of its meaning (right)
  var PAIRS = [
    { key: 1, word: "romance",         answer: "b", example: true },
    { key: 2, word: "western",         answer: "c" },
    { key: 3, word: "horror",          answer: "d" },
    { key: 4, word: "action",          answer: "f" },
    { key: 5, word: "science fiction", answer: "a" },
    { key: 6, word: "comedy",          answer: "e" },
  ];

  var MEANINGS = {
    a: "A movie about events that take place in the future or in other parts of the universe.",
    b: "A movie that tells a love story.",
    c: "A movie about life in the west of the United States in the nineteenth century.",
    d: "A movie that tries to scare the audience.",
    e: "A movie that tries to make people laugh.",
    f: "A movie with a fast-moving story that is full of danger and excitement.",
  };

  var LETTERS = ["a", "b", "c", "d", "e", "f"];
  var SCORED = PAIRS.filter(function (p) { return !p.example; }).length; // 5

  var app = document.getElementById("game-app");
  var phase = "start";
  var matched = {};        // left key -> letter
  var matchedRight = {};   // letter -> left key
  var order = [];          // shuffled letters for the right column
  var selected = null;     // { side: "L"|"R", id: key|letter }
  var mistakes = 0;
  var correct = 0;
  var shakeKey = null;     // "L2|Rc" style while a wrong pair shakes
  var locked = false;
  var playRecorded = false;
  var advanceTimer = null;
  var shakeTimer = null;
  var msg = { text: "", kind: "" };

  var HINT_START = "Tap a genre, then its meaning.";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") LASfx[name]();
    } catch (e) {}
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- state ---------- */

  function setupBoard() {
    matched = {};
    matchedRight = {};
    PAIRS.forEach(function (p) {
      if (p.example) {
        matched[p.key] = p.answer;
        matchedRight[p.answer] = p.key;
      }
    });
    order = shuffle(LETTERS);
    selected = null;
    mistakes = 0;
    correct = 0;
    shakeKey = null;
    locked = false;
    msg = { text: HINT_START, kind: "" };
  }

  function matchedCount() {
    return Object.keys(matched).length; // includes the example
  }

  function calcStars() {
    if (mistakes === 0) return 3;
    if (mistakes <= 2) return 2;
    return 1;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: "Match the movie genres",
          category: "tactics-for-listening",
          unit: "developing-16",
          score: correct,
          maxScore: SCORED,
          accuracy: Math.round((correct / SCORED) * 100),
          completed: true,
          stars: stars,
        });
      }
    } catch (e) {}
  }

  function startGame() {
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    if (window.LAFinish) LAFinish.startTimer();
    playRecorded = false;
    setupBoard();
    phase = "play";
    render();
  }

  /* ---------- interaction ---------- */

  function tapLeft(key) {
    if (locked || matched[key]) return;
    if (selected && selected.side === "L" && selected.id === key) {
      selected = null;
      msg = { text: HINT_START, kind: "" };
      sfx("click");
      renderBoard();
      return;
    }
    if (selected && selected.side === "R") {
      evaluate(key, selected.id);
      return;
    }
    selected = { side: "L", id: key };
    msg = { text: "Now tap the meaning of " + PAIRS[key - 1].word + ".", kind: "" };
    sfx("click");
    renderBoard();
  }

  function tapRight(letter) {
    if (locked || matchedRight[letter]) return;
    if (selected && selected.side === "R" && selected.id === letter) {
      selected = null;
      msg = { text: HINT_START, kind: "" };
      sfx("click");
      renderBoard();
      return;
    }
    if (selected && selected.side === "L") {
      evaluate(selected.id, letter);
      return;
    }
    selected = { side: "R", id: letter };
    msg = { text: "Now tap the genre that matches it.", kind: "" };
    sfx("click");
    renderBoard();
  }

  function evaluate(key, letter) {
    var pair = PAIRS[key - 1];
    selected = null;
    if (pair.answer === letter) {
      matched[key] = letter;
      matchedRight[letter] = key;
      correct++;
      sfx("pop");
      msg = { text: "Yes! " + pair.word + " is " + MEANINGS[letter].charAt(0).toLowerCase() + MEANINGS[letter].slice(1), kind: "is-ok" };
      renderBoard();
      if (matchedCount() >= PAIRS.length) {
        locked = true;
        advanceTimer = setTimeout(finish, 1100);
      }
      return;
    }
    mistakes++;
    sfx("wrong");
    shakeKey = "L" + key + "|R" + letter;
    msg = { text: "Not quite. Think about the genre and try another match.", kind: "is-bad" };
    renderBoard();
    if (shakeTimer) clearTimeout(shakeTimer);
    shakeTimer = setTimeout(function () {
      shakeKey = null;
      renderBoard();
    }, 380);
  }

  function finish() {
    advanceTimer = null;
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: correct,
        total: SCORED,
        stars: stars,
        accuracy: Math.round((correct / SCORED) * 100),
        timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK,
        save: false,
      });
      return;
    }
    render();
  }

  /* ---------- views ---------- */

  function topBar(counter) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
      "<strong>Match the movie genres</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segmentsHtml() {
    return (
      '<div class="lc-seg" role="img" aria-label="' + matchedCount() + " of " + PAIRS.length + ' genres matched">' +
      PAIRS.map(function (p) {
        var cls = matched[p.key] ? (p.example ? "is-done" : "is-right") : "";
        return '<i class="' + cls + '"></i>';
      }).join("") +
      "</div>"
    );
  }

  function leftHtml(p) {
    var isMatched = !!matched[p.key];
    var isSel = selected && selected.side === "L" && selected.id === p.key;
    var cls = "mt-item mt-left";
    if (isMatched) cls += " is-matched";
    if (isSel) cls += " is-selected";
    if (p.example) cls += " is-example";
    if (shakeKey && shakeKey.indexOf("L" + p.key + "|") === 0) cls += " is-shake";
    return (
      '<button type="button" class="' + cls + '" data-l="' + p.key + '"' +
      (isMatched || locked ? " disabled" : "") + ">" +
      (p.example ? '<span class="mt-example-tag">Example</span>' : "") +
      '<span class="mt-badge">' + p.key + "</span>" +
      '<span class="mt-text">' + esc(p.word) + "</span>" +
      '<span class="mt-state' + (isMatched ? " is-filled" : "") + '">' +
      (isMatched ? esc(matched[p.key]) : "") + "</span>" +
      "</button>"
    );
  }

  function rightHtml(letter) {
    var isMatched = !!matchedRight[letter];
    var isSel = selected && selected.side === "R" && selected.id === letter;
    var cls = "mt-item mt-right";
    if (isMatched) cls += " is-matched";
    if (isSel) cls += " is-selected";
    if (shakeKey && shakeKey.indexOf("|R" + letter) !== -1) cls += " is-shake";
    return (
      '<button type="button" class="' + cls + '" data-r="' + letter + '"' +
      (isMatched || locked ? " disabled" : "") + ">" +
      '<span class="mt-badge">' + letter + "</span>" +
      '<span class="mt-text">' + esc(MEANINGS[letter]) + "</span>" +
      '<span class="mt-state' + (isMatched ? " is-filled" : "") + '">' +
      (isMatched ? matchedRight[letter] : "") + "</span>" +
      "</button>"
    );
  }

  function renderBoard() {
    var counter = matchedCount() + " / " + PAIRS.length;
    var board =
      '<main class="lc-main">' +
      '<p class="mt-help">' + HINT_START + "</p>" +
      '<div class="mt-board">' +
      '<section class="mt-col" aria-label="Genres">' +
      '<h2 class="mt-col-head">Genres</h2>' +
      PAIRS.map(leftHtml).join("") +
      "</section>" +
      '<section class="mt-col" aria-label="Meanings">' +
      '<h2 class="mt-col-head">Meanings</h2>' +
      order.map(rightHtml).join("") +
      "</section>" +
      "</div>" +
      '<p class="mt-status ' + msg.kind + '" aria-live="polite">' + esc(msg.text) + "</p>" +
      "</main>";

    app.innerHTML = topBar(counter) + segmentsHtml() + board;
    bind();
  }

  function bind() {
    app.querySelectorAll("[data-l]").forEach(function (b) {
      b.onclick = function () { tapLeft(+b.getAttribute("data-l")); };
    });
    app.querySelectorAll("[data-r]").forEach(function (b) {
      b.onclick = function () { tapRight(b.getAttribute("data-r")); };
    });
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎬</div>' +
      "<h1>Match the movie genres</h1>" +
      '<p class="lc-intro-lede">Match each movie genre on the left with its meaning on the right.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="mt-start">Start →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap a <strong>genre</strong> on the left</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap the <strong>meaning</strong> that matches it</span></li>' +
      '<li><span class="tip-num">3</span><span>Match all <strong>6</strong> genres. Number 1 is done for you.</span></li>' +
      "</ol>" +
      "</section>";
    document.getElementById("mt-start").onclick = startGame;
  }

  function renderDone() {
    var stars = calcStars();
    var p = Math.round((correct / SCORED) * 100);
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + p + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + correct + "</span>" +
      '<span class="lc-ring-of">of ' + SCORED + "</span></div></div>" +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>You matched " + correct + " of " + SCORED + " genres with " + mistakes +
      (mistakes === 1 ? " mistake." : " mistakes.") + "</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="mt-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("mt-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderBoard();
    else renderDone();
  }

  /* keyboard on desktop: 1–6 pick a genre, a–f pick a meaning */
  document.addEventListener("keydown", function (e) {
    if (phase !== "play" || locked) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (/^[1-6]$/.test(k)) { e.preventDefault(); tapLeft(+k); }
    else if (LETTERS.indexOf(k) !== -1) { e.preventDefault(); tapRight(k); }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
