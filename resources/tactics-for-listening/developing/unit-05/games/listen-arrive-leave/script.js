/* Arrive & Leave · Tactics For Listening Developing Unit 5
 * Six visitors. For each one, listen, then choose
 *   · when they ARRIVED (2 options: one correct, one wrong)
 *   · when they WILL LEAVE (2 options: one correct, one wrong)
 * Each visitor has a recording (Unit 5 CD track 1–6). No script is shown.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u5-listen-arrive-leave";
  var UNIT = "Unit 5 · Developing";
  var BACK = "../../";

  // audio = recording for that visitor. arrive / leave: correct + distractor.
  var ITEMS = [
    { audio: "https://cdn.imgurl.ir/uploads/d22662_24_Unit_5_-_1.mp3",
      arrive: { correct: "1st", wrong: "5th" }, leave: { correct: "14th", wrong: "16th" } },
    { audio: "https://cdn.imgurl.ir/uploads/p117782_24_Unit_5_-2.mp3",
      arrive: { correct: "4th", wrong: "2nd" }, leave: { correct: "13th", wrong: "15th" } },
    { audio: "https://cdn.imgurl.ir/uploads/25512_24_Unit_5_-_3.mp3",
      arrive: { correct: "2nd", wrong: "3rd" }, leave: { correct: "10th", wrong: "31st" } },
    { audio: "https://cdn.imgurl.ir/uploads/z06037_24_Unit_5_-_4.mp3",
      arrive: { correct: "5th", wrong: "6th" }, leave: { correct: "15th", wrong: "14th" } },
    { audio: "https://cdn.imgurl.ir/uploads/k34528_24_Unit_5_-_5.mp3",
      arrive: { correct: "3rd", wrong: "1st" }, leave: { correct: "31st", wrong: "10th" } },
    { audio: "https://cdn.imgurl.ir/uploads/e335265_24_Unit_5_-_6.mp3",
      arrive: { correct: "6th", wrong: "4th" }, leave: { correct: "16th", wrong: "13th" } },
  ];

  var TOTAL_SETS = ITEMS.length * 2; // 12 questions
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var order = [];              // per item: { arrive: [a,b], leave: [a,b] } shuffled
  var picks = {};              // "i-arrive" -> chosen text
  var checked = false;
  var score = 0;
  var playing = false;
  var played = false;
  var playRecorded = false;
  var advanceTimer = null;
  var audio = null;
  var audioError = false;
  var HAS_AUDIO = typeof window.Audio === "function";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- audio: one recording per visitor ---------- */

  function stopSpeech() {
    playing = false;
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    }
  }

  function play() {
    if (!HAS_AUDIO) return;
    sfx("click");
    stopSpeech();
    audioError = false;
    audio = new Audio(ITEMS[current].audio);
    audio.preload = "auto";
    playing = true;
    played = true;
    renderPlay();
    audio.onended = function () { playing = false; renderPlay(); };
    audio.onerror = function () { playing = false; audioError = true; renderPlay(); };
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () { playing = false; audioError = true; renderPlay(); });
    }
  }

  /* ---------- state ---------- */

  function setupGame() {
    order = ITEMS.map(function (it) {
      return { arrive: shuffle([it.arrive.correct, it.arrive.wrong]),
               leave: shuffle([it.leave.correct, it.leave.wrong]) };
    });
    picks = {};
    current = 0;
    score = 0;
    checked = false;
    played = false;
    stopSpeech();
    audioError = false;
  }

  function answered() {
    return picks[current + "-arrive"] !== undefined && picks[current + "-leave"] !== undefined;
  }

  function calcStars() {
    if (score >= TOTAL_SETS) return 3;
    if (score >= 9) return 2;
    if (score >= 6) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Arrive & Leave",
          category: "tactics-for-listening", unit: "developing-5",
          score: score, maxScore: TOTAL_SETS,
          accuracy: Math.round((score / TOTAL_SETS) * 100),
          completed: true, stars: stars,
        });
      }
    } catch (e) {}
  }

  function startGame() {
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    if (window.LAFinish) LAFinish.startTimer();
    setupGame();
    playRecorded = false;
    phase = "play";
    render();
  }

  /* ---------- interaction ---------- */

  function pick(set, text) {
    if (checked) return;
    picks[current + "-" + set] = text;
    sfx("click");
    renderPlay();
  }

  function check() {
    if (checked || !answered()) return;
    checked = true;
    var it = ITEMS[current];
    var ok = 0;
    if (picks[current + "-arrive"] === it.arrive.correct) ok++;
    if (picks[current + "-leave"] === it.leave.correct) ok++;
    score += ok;
    if (ok === 2) sfx("correct"); else if (ok === 1) sfx("click"); else sfx("wrong");
    stopSpeech();
    renderPlay();
  }

  function next() {
    if (!checked) return;
    if (current + 1 >= ITEMS.length) { finish(); return; }
    current++;
    checked = false;
    played = false;
    stopSpeech();
    renderPlay();
  }

  function finish() {
    stopSpeech();
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, score: score, total: TOTAL_SETS, stars: stars,
        accuracy: Math.round((score / TOTAL_SETS) * 100), timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK, save: false,
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
      "<strong>Arrive &amp; Leave</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Visitor ' + (current + 1) + " of " + ITEMS.length + '">' +
      ITEMS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  var PLAY_ICON = '<span class="al-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="al-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="al-play-alert" aria-hidden="true">!</span>';

  function optHtml(set, text, correct) {
    var pickedText = picks[current + "-" + set];
    var cls = "al-opt";
    var tick = "";
    if (checked) {
      if (text === correct) { cls += " is-correct"; tick = '<span class="al-tick" aria-hidden="true">✓</span>'; }
      else if (text === pickedText) { cls += " is-wrong"; tick = '<span class="al-tick" aria-hidden="true">✕</span>'; }
    } else if (text === pickedText) {
      cls += " is-picked";
    }
    return (
      '<button type="button" class="' + cls + '" data-set="' + set + '" data-text="' + esc(text) + '"' +
      (checked ? " disabled" : "") + ">" +
      esc(text) + tick + "</button>"
    );
  }

  function setHtml(set, title, icon) {
    var it = ITEMS[current];
    var correct = it[set].correct;
    return (
      '<section class="al-set" aria-label="' + esc(title) + '">' +
      '<div class="al-set-head"><span class="al-set-icon" aria-hidden="true">' + icon + "</span>" +
      '<span class="al-set-title">' + esc(title) + "</span></div>" +
      '<div class="al-opts">' +
      order[current][set].map(function (t) { return optHtml(set, t, correct); }).join("") +
      "</div></section>"
    );
  }

  function footHtml() {
    var it = ITEMS[current];
    var last = current + 1 >= ITEMS.length;
    if (checked) {
      var a = picks[current + "-arrive"] === it.arrive.correct;
      var l = picks[current + "-leave"] === it.leave.correct;
      var msg = a && l ? "Both correct!" :
        (!a && !l) ? "Both answers were wrong. Look at the correct answers." :
        (a ? "Arrival correct. Check the leaving date." : "Leaving correct. Check the arrival date.");
      var cls = a && l ? "is-ok" : "is-bad";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + cls + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="al-next">' + (last ? "See results →" : "Next →") + "</button></div>"
      );
    }
    var hint = !played ? "Tap play to listen, then answer both questions."
      : !answered() ? "Choose one date for each question."
      : "Ready? Check your answers.";
    if (!checked && answered()) {
      return (
        '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + "</span>" +
        '<button type="button" class="al-next" id="al-check">Check answers</button></div>'
      );
    }
    return '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + "</span></div>";
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🛎️</div>' +
      "<h1>Arrive &amp; Leave</h1>" +
      '<p class="lc-intro-lede">Listen to six visitors. For each one, choose when they arrived and when they will leave.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="al-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the visitor</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose the <strong>arrival</strong> date and the <strong>leaving</strong> date</span></li>' +
      '<li><span class="tip-num">3</span><span><strong>12</strong> questions in total</span></li>' +
      "</ol></section>";
    document.getElementById("al-start").onclick = startGame;
  }

  function renderPlay() {
    var counter = (current + 1) + " / " + ITEMS.length;
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = playing ? "Listening…" : played ? "Listen again" : "Listen to the visitor";
    var listenSub = !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again before you answer."
      : "Visitor " + (current + 1) + " of " + ITEMS.length;

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<main class="lc-main">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="al-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" +
      (audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON) + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<div class="al-sets">' +
      setHtml("arrive", "When did they arrive?", "🛬") +
      setHtml("leave", "When will they leave?", "🛫") +
      "</div>" +
      footHtml() +
      "</main>";

    bind();
  }

  function bind() {
    var p = document.getElementById("al-play");
    if (p) p.onclick = function () { if (playing) { stopSpeech(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".al-opt").forEach(function (b) {
      b.onclick = function () { pick(b.getAttribute("data-set"), b.getAttribute("data-text")); };
    });
    var c = document.getElementById("al-check");
    if (c) c.onclick = check;
    var n = document.getElementById("al-next");
    if (n) n.onclick = next;
  }

  function renderDone() {
    var stars = calcStars();
    var p = Math.round((score / TOTAL_SETS) * 100);
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + p + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + score + "</span>" +
      '<span class="lc-ring-of">of ' + TOTAL_SETS + "</span></div></div>" +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>You got " + score + " out of " + TOTAL_SETS + " questions right.</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="al-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("al-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { stopSpeech(); if (phase === "play") renderPlay(); }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
