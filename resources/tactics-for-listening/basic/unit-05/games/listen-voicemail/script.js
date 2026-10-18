/* Voicemail · Tactics For Listening Basic Unit 5
 * Jack has six voicemails. For each one, listen, then choose
 *   · the DATE of the event (2 options: one correct, one wrong)
 *   · the TIME of the event (2 options: one correct, one wrong)
 * Each message is played from its own recording. No script is shown.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u5-listen-voicemail";
  var UNIT = "Unit 5 · Basic";
  var BACK = "../../";

  var ITEMS = [
    { event: "Dental appointment",
      audio: "https://cdn.imgurl.ir/uploads/r8633_25_Unit_5_-_1.mp3",
      date: { correct: "8/3", wrong: "8/2" },
      time: { correct: "9:30 a.m.", wrong: "11:15 a.m." } },
    { event: "Nicole's party",
      audio: "https://cdn.imgurl.ir/uploads/w270585_25_Unit_5_-_2.mp3",
      date: { correct: "7/28", wrong: "7/26" },
      time: { correct: "8:00 p.m.", wrong: "9:30 a.m." } },
    { event: "Aunt's arrival",
      audio: "https://cdn.imgurl.ir/uploads/16655_25_Unit_5_-_3.mp3",
      date: { correct: "8/10", wrong: "8/3" },
      time: { correct: "11:15 a.m.", wrong: "8:00 p.m." } },
    { event: "Tennis game",
      audio: "https://cdn.imgurl.ir/uploads/k263609_25_Unit_5_-_4.mp3",
      date: { correct: "7/26", wrong: "7/28" },
      time: { correct: "3:00 p.m.", wrong: "6:00 p.m." } },
    { event: "Meeting with Sam",
      audio: "https://cdn.imgurl.ir/uploads/m131230_25_Unit_5_-_5.mp3",
      date: { correct: "9/22", wrong: "8/10" },
      time: { correct: "6:00 p.m.", wrong: "3:00 p.m." } },
    { event: "Trip to New Orleans",
      audio: "https://cdn.imgurl.ir/uploads/k306770_25_Unit_5_-_6.mp3",
      date: { correct: "8/2", wrong: "7/28" },
      time: { correct: "2:00 p.m.", wrong: "11:15 a.m." } },
  ];

  var TOTAL_SETS = ITEMS.length * 2; // 12 questions
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var order = [];
  var picks = {};
  var checked = false;
  var score = 0;
  var playing = false;
  var played = false;
  var audio = null;
  var audioError = false;
  var playRecorded = false;
  var advanceTimer = null;
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="al-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="al-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="al-play-alert" aria-hidden="true">!</span>';

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

  /* ---------- audio: one recording per message ---------- */

  function stopAudio() {
    playing = false;
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    }
  }

  function play() {
    if (!HAS_AUDIO) return;
    sfx("click");
    stopAudio();
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
      return { date: shuffle([it.date.correct, it.date.wrong]),
               time: shuffle([it.time.correct, it.time.wrong]) };
    });
    picks = {};
    current = 0;
    score = 0;
    checked = false;
    played = false;
    audioError = false;
    stopAudio();
  }

  function answered() {
    return picks[current + "-date"] !== undefined && picks[current + "-time"] !== undefined;
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
          gameId: GAME_ID, gameName: "Voicemail",
          category: "tactics-for-listening", unit: "basic-5",
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
    if (picks[current + "-date"] === it.date.correct) ok++;
    if (picks[current + "-time"] === it.time.correct) ok++;
    score += ok;
    if (ok === 2) sfx("correct"); else if (ok === 1) sfx("click"); else sfx("wrong");
    stopAudio();
    renderPlay();
  }

  function next() {
    if (!checked) return;
    if (current + 1 >= ITEMS.length) { finish(); return; }
    current++;
    checked = false;
    played = false;
    audioError = false;
    stopAudio();
    renderPlay();
  }

  function finish() {
    stopAudio();
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
      "<strong>Voicemail</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Message ' + (current + 1) + " of " + ITEMS.length + '">' +
      ITEMS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

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
      var d = picks[current + "-date"] === it.date.correct;
      var t = picks[current + "-time"] === it.time.correct;
      var msg = d && t ? "Both correct!" :
        (!d && !t) ? "Both answers were wrong. Check the correct ones." :
        (d ? "Date correct. Check the time." : "Time correct. Check the date.");
      var cls = d && t ? "is-ok" : "is-bad";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + cls + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="al-next">' + (last ? "See results →" : "Next →") + "</button></div>"
      );
    }
    var hint = !played ? "Tap play to listen, then answer both questions."
      : !answered() ? "Choose one date and one time."
      : "Ready? Check your answers.";
    if (answered()) {
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
      '<div class="lc-hero-icon" aria-hidden="true">📞</div>' +
      "<h1>Voicemail</h1>" +
      '<p class="lc-intro-lede">Jack has six voicemails. For each one, choose the date and the time of the event.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="vm-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the message</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose the <strong>date</strong> and the <strong>time</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>12</strong> questions in total</span></li>' +
      "</ol></section>";
    document.getElementById("vm-start").onclick = startGame;
  }

  function renderPlay() {
    var counter = (current + 1) + " / " + ITEMS.length;
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = audioError ? "Audio unavailable"
      : playing ? "Playing… tap to stop"
      : played ? "Play again" : "Play the voicemail";
    var listenSub = !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again before you answer."
      : "Message " + (current + 1) + " of " + ITEMS.length + ": " + ITEMS[current].event;

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<main class="lc-main">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="vm-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" +
      (audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON) + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<div class="al-sets">' +
      setHtml("date", "What date?", "📅") +
      setHtml("time", "What time?", "🕘") +
      "</div>" +
      footHtml() +
      "</main>";

    bind();
  }

  function bind() {
    var p = document.getElementById("vm-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
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
      '<button type="button" class="lc-btn primary" id="vm-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("vm-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { stopAudio(); if (phase === "play") renderPlay(); }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
