/* Match the time · Tactics For Listening Basic Unit 4
 * Match each time phrase with the correct clock (A–H).
 * Zero-scroll layout for desktop and phone.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u4-match-the-time";
  var GAME_NAME = "Match the time";
  var UNIT = "Unit 4 · Basic";
  var BACK = "../../";

  // Phrases in worksheet order; correct is clock letter
  var PHRASES = [
    { text: "twenty to two", correct: "A" },
    { text: "three fifteen", correct: "E" },
    { text: "ten after ten", correct: "F" },
    { text: "two twenty", correct: "C" },
    { text: "three fifty-five", correct: "G" },
    { text: "six forty-five", correct: "D" },
    { text: "two o'clock", correct: "B" },
    { text: "five past ten", correct: "H" }
  ];

  // Clock visual definitions
  // type: analog | digital
  // h, m for hands / display; style for colors
  var CLOCKS = {
    A: { type: "analog", h: 1, m: 40, face: "#f5f0e6", hand: "#2c3e50", accent: "#c0392b", bezel: "#d5c4a1" },
    B: { type: "digital", h: 2, m: 0, face: "#2ecc71", digit: "#1a3a2a", bezel: "#bdc3c7" },
    C: { type: "digital", h: 2, m: 20, face: "#f1c40f", digit: "#3d3200", bezel: "#f39c12" },
    D: { type: "digital", h: 6, m: 45, face: "#2c3e50", digit: "#5dade2", bezel: "#1a252f" },
    E: { type: "digital", h: 3, m: 15, face: "#f1c40f", digit: "#2c3e50", bezel: "#ecf0f1" },
    F: { type: "analog", h: 10, m: 10, face: "#f9e79f", hand: "#2c3e50", accent: "#e67e22", bezel: "#f39c12" },
    G: { type: "analog", h: 3, m: 55, face: "#d6eaf8", hand: "#2c3e50", accent: "#2980b9", bezel: "#aab7b8" },
    H: { type: "digital", h: 10, m: 5, face: "#1c1c1c", digit: "#e74c3c", bezel: "#2c3e50" }
  };

  var LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  var TOTAL = PHRASES.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var current = 0;
  var used = {}; // letter -> true when matched
  var results = [];
  var picked = null;
  var checked = false;
  var playRecorded = false;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ----- clock SVG ----- */
  function analogSvg(c) {
    var h = c.h % 12;
    var m = c.m;
    // 12 o'clock = -90deg in standard math; CSS rotate from 12
    var minDeg = m * 6;
    var hourDeg = h * 30 + m * 0.5;
    var ticks = "";
    for (var i = 0; i < 12; i++) {
      var a = i * 30;
      ticks +=
        '<line x1="50" y1="8" x2="50" y2="' + (i % 3 === 0 ? "14" : "11") +
        '" stroke="' + c.hand + '" stroke-width="' + (i % 3 === 0 ? "2.2" : "1.2") +
        '" stroke-linecap="round" transform="rotate(' + a + ' 50 50)"/>';
    }
    var nums = "";
    var labels = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (var j = 0; j < 12; j++) {
      var ang = (j * 30 - 90) * Math.PI / 180;
      var nx = 50 + 32 * Math.cos(ang);
      var ny = 50 + 32 * Math.sin(ang);
      nums +=
        '<text x="' + nx.toFixed(1) + '" y="' + ny.toFixed(1) +
        '" text-anchor="middle" dominant-baseline="central" font-size="7.5" font-weight="700" fill="' +
        c.hand + '" font-family="system-ui,sans-serif">' + labels[j] + "</text>";
    }
    return (
      '<svg class="mtt-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="48" fill="' + c.bezel + '"/>' +
      '<circle cx="50" cy="50" r="42" fill="' + c.face + '"/>' +
      ticks + nums +
      '<line x1="50" y1="50" x2="50" y2="28" stroke="' + c.hand +
      '" stroke-width="3.2" stroke-linecap="round" transform="rotate(' + hourDeg + ' 50 50)"/>' +
      '<line x1="50" y1="50" x2="50" y2="18" stroke="' + c.accent +
      '" stroke-width="2.2" stroke-linecap="round" transform="rotate(' + minDeg + ' 50 50)"/>' +
      '<circle cx="50" cy="50" r="3.2" fill="' + c.accent + '"/>' +
      "</svg>"
    );
  }

  function digitalSvg(c) {
    var time = pad2(c.h) + ":" + pad2(c.m);
    return (
      '<svg class="mtt-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="8" y="18" width="84" height="64" rx="12" fill="' + c.bezel + '"/>' +
      '<rect x="14" y="26" width="72" height="48" rx="8" fill="' + c.face + '"/>' +
      '<text x="50" y="56" text-anchor="middle" dominant-baseline="middle" ' +
      'font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="18" font-weight="800" fill="' +
      c.digit + '">' + time + "</text>" +
      "</svg>"
    );
  }

  function clockHtml(letter) {
    var c = CLOCKS[letter];
    return c.type === "analog" ? analogSvg(c) : digitalSvg(c);
  }

  function score() {
    var n = 0;
    for (var i = 0; i < results.length; i++) if (results[i]) n++;
    return n;
  }

  function calcStars() {
    var s = score();
    if (s >= TOTAL) return 3;
    if (s >= 6) return 2;
    if (s >= 4) return 1;
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
          unit: "basic-4",
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
    current = 0;
    used = {};
    results = [];
    picked = null;
    checked = false;
    playRecorded = false;
    phase = "play";
    render();
  }

  function pick(letter) {
    if (checked || used[letter]) return;
    picked = letter;
    renderPlay();
  }

  function checkAnswer() {
    if (checked || !picked) return;
    checked = true;
    var ok = picked === PHRASES[current].correct;
    results[current] = ok;
    if (ok) used[picked] = true;
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
    picked = null;
    checked = false;
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
      '<div class="lc-seg" role="img" aria-label="Item ' + (current + 1) + " of " + TOTAL + '">' +
      PHRASES.map(function (_, i) {
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
      '<div class="lc-hero-icon" aria-hidden="true">🕐</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Match each time phrase with the correct clock picture. Eight times — one at a time.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="mtt-start">Start →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Read the <strong>time phrase</strong></span></li>' +
      '<li><span class="tip-num">2</span><span>Tap the matching <strong>clock</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>8</strong> matches to complete</span></li>' +
      "</ol></section>";
    document.getElementById("mtt-start").onclick = startGame;
  }

  function tileClass(letter) {
    var cls = "mtt-tile";
    if (used[letter] && !(checked && picked === letter)) cls += " is-used";
    if (checked && picked === letter) {
      cls += results[current] ? " is-correct" : " is-wrong";
    } else if (!checked && picked === letter) {
      cls += " is-picked";
    }
    if (checked && letter === PHRASES[current].correct && picked !== letter) {
      cls += " is-reveal";
    }
    return cls;
  }

  function renderPlay() {
    var phrase = PHRASES[current];
    var counter = (current + 1) + " / " + TOTAL;
    var last = current + 1 >= TOTAL;

    var tiles = LETTERS.map(function (L) {
      return (
        '<button type="button" class="' + tileClass(L) + '" data-l="' + L + '"' +
        (used[L] && !(checked && picked === L) ? " disabled" : "") +
        (checked ? " disabled" : "") +
        ' aria-label="Clock ' + L + '">' +
        '<span class="mtt-letter">' + L + "</span>" +
        '<span class="mtt-face">' + clockHtml(L) + "</span>" +
        "</button>"
      );
    }).join("");

    var foot;
    if (!checked) {
      if (!picked) {
        foot = '<div class="mtt-foot"><span class="mtt-foot-text">Tap the clock that shows this time.</span></div>';
      } else {
        foot =
          '<div class="mtt-foot mtt-foot-action">' +
          '<span class="mtt-foot-text">Selected <strong>' + picked + "</strong>. Check your answer.</span>" +
          '<button type="button" class="mtt-next" id="mtt-check">Check ✓</button></div>';
      }
    } else {
      var ok = results[current];
      var msg = ok
        ? "Correct! " + phrase.text + " → " + phrase.correct
        : "Not quite. " + phrase.text + " is " + phrase.correct + ".";
      foot =
        '<div class="mtt-foot mtt-foot-action">' +
        '<span class="mtt-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="mtt-next" id="mtt-next">' +
        (last ? "See results →" : "Next →") + "</button></div>";
    }

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<div class="mtt-main">' +
        '<div class="mtt-prompt">' +
          '<span class="mtt-prompt-label">Match this time</span>' +
          '<p class="mtt-phrase">' + esc(phrase.text) + "</p>" +
        "</div>" +
        '<div class="mtt-grid" role="group" aria-label="Clocks">' + tiles + "</div>" +
        foot +
      "</div>";

    app.querySelectorAll(".mtt-tile").forEach(function (btn) {
      btn.onclick = function () {
        if (btn.disabled) return;
        pick(btn.getAttribute("data-l"));
      };
    });
    var checkBtn = document.getElementById("mtt-check");
    if (checkBtn) checkBtn.onclick = checkAnswer;
    var nextBtn = document.getElementById("mtt-next");
    if (nextBtn) nextBtn.onclick = next;
  }

  function renderDone() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score() + " of " + TOTAL + " correct</h1>" +
      '<p class="lc-intro-lede">Great work matching the times!</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="mtt-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 4</a>' +
      "</div></div></section>";
    document.getElementById("mtt-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play") return;
    var k = e.key.toUpperCase();
    if (LETTERS.indexOf(k) >= 0 && !checked) {
      e.preventDefault();
      if (!used[k]) pick(k);
    }
    if (k === "ENTER") {
      e.preventDefault();
      if (!checked && picked) checkAnswer();
      else if (checked) next();
    }
  });

  render();
})();
