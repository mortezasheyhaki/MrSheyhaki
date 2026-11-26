/* Clothes definitions · Tactics For Listening Basic Unit 3
 * One clue at a time. Pick the correct word from 3 chips under the sentence.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u3-clothes-definitions";
  var GAME_NAME = "Clothes definitions";
  var UNIT = "Unit 3 · Basic";
  var BACK = "../../";

  var BANK = [
    { clue: "It's like a large purse.", answer: "shoulder bag" },
    { clue: "You might wear these in the summer.", answer: "shorts" },
    { clue: "A woman's shirt.", answer: "blouse" },
    { clue: "You wear one when it's cold outside.", answer: "jacket" },
    { clue: "A woman might wear one to a party.", answer: "dress" },
    { clue: "Jeans, slacks, trousers, etc.", answer: "pants" },
    { clue: "You might wear these to go running.", answer: "sneakers" },
    { clue: "A man might wear one to work.", answer: "suit" },
    { clue: "It goes on your head.", answer: "hat" },
    { clue: "You might wear these to the beach.", answer: "sandals" }
  ];

  var ALL_WORDS = BANK.map(function (b) { return b.answer; });

  var TOTAL = BANK.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var order = [];
  var current = 0;
  var options = []; // 3 words for current item
  var choice = null;
  var checked = false;
  var results = [];
  var playRecorded = false;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function makeOptions(correct) {
    var others = ALL_WORDS.filter(function (w) { return w !== correct; });
    others = shuffle(others).slice(0, 2);
    return shuffle([correct].concat(others));
  }

  function setupGame() {
    order = shuffle(BANK.map(function (_, i) { return i; }));
    current = 0;
    results = [];
    choice = null;
    checked = false;
    options = makeOptions(BANK[order[0]].answer);
  }

  function score() {
    var n = 0;
    for (var i = 0; i < results.length; i++) if (results[i]) n++;
    return n;
  }

  function calcStars() {
    var s = score();
    if (s >= TOTAL) return 3;
    if (s >= 7) return 2;
    if (s >= 5) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: GAME_NAME,
          category: "tactics-for-listening",
          unit: "basic-3",
          score: score(),
          maxScore: TOTAL,
          accuracy: Math.round((score() / TOTAL) * 100),
          completed: true,
          stars: stars
        });
      }
    } catch (e) {}
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    setupGame();
    playRecorded = false;
    phase = "play";
    render();
  }

  function pick(word) {
    if (checked) return;
    choice = word;
    // Auto-check on tap for faster mobile play
    checked = true;
    var item = BANK[order[current]];
    var ok = choice === item.answer;
    results[current] = ok;
    sfx(ok ? "correct" : "wrong");
    renderPlay();
  }

  function checkAnswer() {
    if (checked || choice === null) return;
    checked = true;
    var item = BANK[order[current]];
    var ok = choice === item.answer;
    results[current] = ok;
    sfx(ok ? "correct" : "wrong");
    renderPlay();
  }

  function next() {
    if (!checked) return;
    if (current + 1 >= TOTAL) {
      finish();
      return;
    }
    current++;
    choice = null;
    checked = false;
    options = makeOptions(BANK[order[current]].answer);
    renderPlay();
  }

  function finish() {
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: score(),
        total: TOTAL,
        stars: stars,
        accuracy: Math.round((score() / TOTAL) * 100),
        timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK,
        save: false
      });
      return;
    }
    render();
  }

  function topBar(counter) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
      "<strong>" + esc(GAME_NAME) + "</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Question ' + (current + 1) + " of " + TOTAL + '">' +
      BANK.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        if (i < results.length) cls = results[i] ? "is-right" : "is-wrong";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🧩</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Read each clue and choose the clothing word that matches. One clue at a time — three choices.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="cdef-start">Start →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Read the <strong>clue</strong> carefully</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap the correct <strong>word chip</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>10</strong> clues in total</span></li>' +
      "</ol></section>";
    document.getElementById("cdef-start").onclick = startGame;
  }

  function renderPlay() {
    var item = BANK[order[current]];
    var counter = (current + 1) + " / " + TOTAL;
    var last = current + 1 >= TOTAL;

    var chips = options.map(function (w) {
      var cls = "cdef-chip";
      if (checked) {
        if (w === item.answer) cls += " is-correct";
        else if (w === choice) cls += " is-wrong";
        else cls += " is-idle";
      } else if (w === choice) {
        cls += " is-picked";
      }
      return (
        '<button type="button" class="' + cls + '" data-w="' + esc(w) + '"' +
        (checked ? " disabled" : "") + ">" + esc(w) + "</button>"
      );
    }).join("");

    var foot;
    if (!checked) {
      foot =
        '<div class="cdef-foot">' +
        '<span class="cdef-foot-text">Tap a word chip to answer.</span>' +
        '</div>';
    } else {
      var ok = choice === item.answer;
      var msg = ok ? "Correct!" : "Not quite. The answer is “" + item.answer + "”.";
      foot =
        '<div class="cdef-foot cdef-foot-action">' +
        '<span class="cdef-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="cdef-next" id="cdef-next">' +
        (last ? "See results →" : "Next →") + "</button></div>";
    }

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<div class="cdef-main">' +
        '<div class="cdef-center">' +
          '<span class="cdef-badge">Clue ' + (current + 1) + ' of ' + TOTAL + '</span>' +
          '<p class="cdef-clue" aria-live="polite">' + esc(item.clue) + "</p>" +
          '<div class="cdef-chips" role="group" aria-label="Choices">' + chips + "</div>" +
        "</div>" +
        foot +
      "</div>";

    app.querySelectorAll(".cdef-chip").forEach(function (btn) {
      btn.onclick = function () {
        if (btn.disabled) return;
        pick(btn.getAttribute("data-w"));
      };
    });
    var nextBtn = document.getElementById("cdef-next");
    if (nextBtn) nextBtn.onclick = next;
  }

  function renderDone() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score() + " of " + TOTAL + " correct</h1>" +
      '<p class="lc-intro-lede">Great work matching the clothing words to their meanings.</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="cdef-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 3</a>' +
      "</div></div></section>";
    document.getElementById("cdef-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play") return;
    var k = e.key;
    if (k === "1" || k === "2" || k === "3") {
      var i = parseInt(k, 10) - 1;
      if (options[i] && !checked) {
        e.preventDefault();
        pick(options[i]);
      }
    }
    if ((k === "Enter" || k === " ") && checked) {
      e.preventDefault();
      next();
    }
  });

  render();
})();
