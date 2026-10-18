/* What they did (multiple choice) · Tactics For Listening Basic Unit 5
 * Four people. For each one, listen, then choose what he or she did (or will
 * do) on his or her birthday: a, b or c. Same recordings as Birthdays.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u5-what-they-did";
  var UNIT = "Unit 5 · Basic";
  var BACK = "../../";
  var LETTERS = ["a", "b", "c"];

  var ITEMS = [
    { who: "Henry", pronoun: "his",
      audio: "https://cdn.imgurl.ir/uploads/h572000_26_Unit_5_-_1.mp3",
      options: ["had a party", "studied for exams", "met friends"], correct: 1 },
    { who: "Eva", pronoun: "her",
      audio: "https://cdn.imgurl.ir/uploads/o726473_26_Unit_5_-_2.mp3",
      options: ["went to her parents' house", "went on a trip by herself", "went to New York with her parents"], correct: 2 },
    { who: "Julia", pronoun: "her",
      audio: "https://cdn.imgurl.ir/uploads/e50843_26_Unit_5_-_3.mp3",
      options: ["had a barbecue", "went out to dinner with friends", "stayed home alone"], correct: 0 },
    { who: "Luke", pronoun: "his",
      audio: "https://cdn.imgurl.ir/uploads/g108497_26_Unit_5_-_4.mp3",
      options: ["met friends", "had a busy day", "had a quiet family party"], correct: 2 },
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var choice = [];          // per item: option index or null
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
          gameId: GAME_ID, gameName: "What they did",
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

  function pick(i) {
    if (checked[current]) return;
    choice[current] = i;
    renderPlay();
  }

  function checkAnswer() {
    if (checked[current] || choice[current] === null) return;
    checked[current] = true;
    if (choice[current] === ITEMS[current].correct) { score++; sfx("correct"); } else { sfx("wrong"); }
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
      "<strong>What they did</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Person ' + (current + 1) + " of " + TOTAL + '">' +
      ITEMS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        if (checked[i]) cls = choice[i] === ITEMS[i].correct ? "is-right" : "is-wrong";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function optHtml(i) {
    var it = ITEMS[current];
    var mine = choice[current];
    var cls = "al-opt wd-opt";
    var tick = "";
    if (checked[current]) {
      if (i === it.correct) { cls += " is-correct"; tick = '<span class="al-tick" aria-hidden="true">✓</span>'; }
      else if (i === mine) { cls += " is-wrong"; tick = '<span class="al-tick" aria-hidden="true">✕</span>'; }
    } else if (i === mine) {
      cls += " is-picked";
    }
    return (
      '<button type="button" class="' + cls + '" data-i="' + i + '"' + (checked[current] ? " disabled" : "") + ">" +
      '<span class="wd-letter" aria-hidden="true">' + LETTERS[i] + "</span>" +
      '<span class="wd-text">' + esc(it.options[i]) + "</span>" + tick + "</button>"
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
      var it = ITEMS[current];
      var ok = choice[current] === it.correct;
      var msg = ok ? "Correct!" : "Not quite. The answer is " + LETTERS[it.correct] + ": " + it.options[it.correct] + ".";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="wd-next">' + (last ? "See results →" : "Next →") + "</button></div>"
      );
    }
    var hint = played ? "Choose a, b or c." : "Tap play to listen first.";
    return '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + "</span></div>";
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎁</div>' +
      "<h1>What they did</h1>" +
      '<p class="lc-intro-lede">Listen to four people. Choose what they did, or will do, on their birthday.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="wd-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the person</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose <strong>a</strong>, <strong>b</strong> or <strong>c</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>4</strong> questions in total</span></li>' +
      "</ol></section>";
    document.getElementById("wd-start").onclick = startGame;
  }

  function renderPlay() {
    var it = ITEMS[current];
    var counter = (current + 1) + " / " + TOTAL;
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = audioError ? "Audio unavailable"
      : playing ? "Playing… tap to stop"
      : played ? "Play again" : "Play the recording";
    var listenSub = !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again before you answer."
      : it.who + " · person " + (current + 1) + " of " + TOTAL;

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<main class="lc-main">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="wd-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" +
      (audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON) + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="al-set wd-single" aria-label="Question">' +
      '<p class="tf-statement">What did (or will) ' + esc(it.who) + " do on " + esc(it.pronoun) + " birthday?</p>" +
      '<div class="al-opts wd-opts">' +
      it.options.map(function (_, i) { return optHtml(i); }).join("") +
      "</div></section>" +
      footHtml() +
      "</main>";

    bind();
  }

  function bind() {
    var p = document.getElementById("wd-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".wd-opt").forEach(function (b) {
      b.onclick = function () { pick(+b.getAttribute("data-i")); };
    });
    var n = document.getElementById("wd-next");
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
      '<button type="button" class="lc-btn primary" id="wd-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("wd-again").onclick = startGame;
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
