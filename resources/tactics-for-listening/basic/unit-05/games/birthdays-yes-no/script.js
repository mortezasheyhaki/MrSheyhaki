/* Birthdays (Yes or No) · Tactics For Listening Basic Unit 5
 * Four people. For each one, listen, then answer: have they had their
 * birthday yet this year? Yes or No.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u5-birthdays-yes-no";
  var UNIT = "Unit 5 · Basic";
  var BACK = "../../";

  var ITEMS = [
    { statement: "Has Henry had his birthday yet this year?", answer: true,
      audio: "https://cdn.imgurl.ir/uploads/h572000_26_Unit_5_-_1.mp3" },
    { statement: "Has Eva had her birthday yet this year?", answer: false,
      audio: "https://cdn.imgurl.ir/uploads/o726473_26_Unit_5_-_2.mp3" },
    { statement: "Has Julia had her birthday yet this year?", answer: false,
      audio: "https://cdn.imgurl.ir/uploads/e50843_26_Unit_5_-_3.mp3" },
    { statement: "Has Luke had his birthday yet this year?", answer: true,
      audio: "https://cdn.imgurl.ir/uploads/g108497_26_Unit_5_-_4.mp3" },
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var choice = [];          // per item: true | false | null
  var checked = [];         // per item: locked after Check
  var score = 0;
  var playing = false;
  var played = false;
  var audio = null;
  var audioError = false;
  var playRecorded = false;
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

  /* ---------- audio ---------- */

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
    choice = ITEMS.map(function () { return null; });
    checked = ITEMS.map(function () { return false; });
    current = 0;
    score = 0;
    played = false;
    audioError = false;
    stopAudio();
  }

  function calcStars() {
    if (score >= TOTAL) return 3;
    if (score >= 3) return 2;
    if (score >= 2) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Birthdays (Yes or No)",
          category: "tactics-for-listening", unit: "basic-5",
          score: score, maxScore: TOTAL,
          accuracy: Math.round((score / TOTAL) * 100),
          completed: true, stars: stars,
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

  /* ---------- interaction ---------- */

  function pick(value) {
    if (checked[current]) return;
    choice[current] = value;
    renderPlay();
  }

  function checkAnswer() {
    if (checked[current] || choice[current] === null) return;
    checked[current] = true;
    var ok = choice[current] === ITEMS[current].answer;
    if (ok) { score++; sfx("correct"); } else { sfx("wrong"); }
    stopAudio();
    renderPlay();
  }

  function next() {
    if (!checked[current]) return;
    if (current + 1 >= TOTAL) { finish(); return; }
    current++;
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
        gameId: GAME_ID, score: score, total: TOTAL, stars: stars,
        accuracy: Math.round((score / TOTAL) * 100), timeMs: timeMs,
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
      "<strong>Yes or No</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Person ' + (current + 1) + " of " + TOTAL + '">' +
      ITEMS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        if (checked[i]) cls = choice[i] === ITEMS[i].answer ? "is-right" : "is-wrong";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function btnHtml(value, label) {
    var it = ITEMS[current];
    var mine = choice[current];
    var cls = "al-opt";
    var tick = "";
    if (checked[current]) {
      if (value === it.answer) { cls += " is-correct"; tick = '<span class="al-tick" aria-hidden="true">✓</span>'; }
      else if (value === mine) { cls += " is-wrong"; tick = '<span class="al-tick" aria-hidden="true">✕</span>'; }
    } else if (value === mine) {
      cls += " is-picked";
    }
    return (
      '<button type="button" class="' + cls + '" data-value="' + value + '"' +
      (checked[current] ? " disabled" : "") + ">" + label + tick + "</button>"
    );
  }

  function footHtml() {
    var last = current + 1 >= TOTAL;
    if (choice[current] !== null && !checked[current]) {
      return (
        '<div class="al-foot"><span class="al-foot-text">You can change your answer, then Check.</span>' +
        '<button type="button" class="al-next" id="__check_btn">Check ✓</button></div>'
      );
    }
    if (checked[current]) {
      var ok = choice[current] === ITEMS[current].answer;
      var msg = ok ? "Correct!" : "Not quite. The answer is " + (ITEMS[current].answer ? "Yes" : "No") + ".";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="tf-next">' + (last ? "See results →" : "Next →") + "</button></div>"
      );
    }
    var hint = played ? "Has this person had their birthday yet?" : "Tap play to listen first.";
    return '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + "</span></div>";
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎂</div>' +
      "<h1>Yes or No</h1>" +
      '<p class="lc-intro-lede">Listen to four people. Have they had their birthdays yet this year?</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="tf-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the person</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose <strong>Yes</strong> or <strong>No</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>4</strong> questions in total</span></li>' +
      "</ol></section>";
    document.getElementById("tf-start").onclick = startGame;
  }

  function renderPlay() {
    var counter = (current + 1) + " / " + TOTAL;
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = audioError ? "Audio unavailable"
      : playing ? "Playing… tap to stop"
      : played ? "Play again" : "Play the recording";
    var listenSub = !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again before you answer."
      : "Person " + (current + 1) + " of " + TOTAL;

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<main class="lc-main">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="tf-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" +
      (audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON) + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="al-set tf-single" aria-label="Question">' +
      '<p class="tf-statement">' + esc(ITEMS[current].statement) + "</p>" +
      '<div class="al-opts">' +
      btnHtml(true, "Yes") + btnHtml(false, "No") +
      "</div></section>" +
      footHtml() +
      "</main>";

    bind();
  }

  function bind() {
    var p = document.getElementById("tf-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".al-opt").forEach(function (b) {
      b.onclick = function () { pick(b.getAttribute("data-value") === "true"); };
    });
    var n = document.getElementById("tf-next");
    if (n) n.onclick = next;
    var ck = document.getElementById("__check_btn");
    if (ck) ck.onclick = checkAnswer;
  }

  function renderDone() {
    var stars = calcStars();
    var p = Math.round((score / TOTAL) * 100);
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + p + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + score + "</span>" +
      '<span class="lc-ring-of">of ' + TOTAL + "</span></div></div>" +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>You got " + score + " out of " + TOTAL + " questions right.</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="tf-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("tf-again").onclick = startGame;
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
