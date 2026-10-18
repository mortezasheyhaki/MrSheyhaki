/* What kind of movie? · Tactics For Listening Developing Unit 16
 * Six people each describe a movie. Listen to the recording, then choose
 * the kind of movie they describe. Same layout as True or False (voicemail).
 *
 * answer: the correct choice, "a" or "b", from the answer key.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u16-listen-genre";
  var UNIT = "Unit 16 · Developing";
  var BACK = "../../";

  var ITEMS = [
    { a: "science fiction", b: "action",          answer: "b",
      audio: "https://cdn.imgurl.ir/uploads/t926356_38_Unit_16_-_1.mp3" },
    { a: "action",          b: "comedy",          answer: "b",
      audio: "https://cdn.imgurl.ir/uploads/g40017_38_Unit_16_-_2.mp3" },
    { a: "horror",          b: "western",         answer: "a",
      audio: "https://cdn.imgurl.ir/uploads/o83740_38_Unit_16__3.mp3" },
    { a: "science fiction", b: "comedy",          answer: "a",
      audio: "https://cdn.imgurl.ir/uploads/z534876_38_Unit_16_-_4.mp3" },
    { a: "romance",         b: "western",         answer: "b",
      audio: "https://cdn.imgurl.ir/uploads/c344884_38_Unit_16_-_5.mp3" },
    { a: "action",          b: "science fiction", answer: "a",
      audio: "https://cdn.imgurl.ir/uploads/t51725_38_Unit_16_-_6.mp3" },
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var choice = [];          // per item: "a" | "b" | null
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
    if (score >= 4) return 2;
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
          gameId: GAME_ID, gameName: "What kind of movie?",
          category: "tactics-for-listening", unit: "developing-16",
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

  function pick(letter) {
    if (checked[current]) return;
    choice[current] = letter;
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
      "<strong>What kind of movie?</strong></div>" +
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

  function btnHtml(letter) {
    var it = ITEMS[current];
    var mine = choice[current];
    var label = letter + ". " + it[letter];
    var cls = "al-opt";
    var tick = "";
    if (checked[current]) {
      if (letter === it.answer) { cls += " is-correct"; tick = '<span class="al-tick" aria-hidden="true">✓</span>'; }
      else if (letter === mine) { cls += " is-wrong"; tick = '<span class="al-tick" aria-hidden="true">✕</span>'; }
    } else if (letter === mine) {
      cls += " is-picked";
    }
    return (
      '<button type="button" class="' + cls + '" data-value="' + letter + '"' +
      (checked[current] ? " disabled" : "") + ">" + esc(label) + tick + "</button>"
    );
  }

  function footHtml() {
    var last = current + 1 >= TOTAL;
    var it = ITEMS[current];
    if (choice[current] !== null && !checked[current]) {
      return (
        '<div class="al-foot"><span class="al-foot-text">You can change your answer, then Check.</span>' +
        '<button type="button" class="al-next" id="__check_btn">Check ✓</button></div>'
      );
    }
    if (checked[current]) {
      var ok = choice[current] === it.answer;
      var msg = ok ? "Correct!" : "Not quite. The answer is " + it[it.answer] + ".";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="tf-next">' + (last ? "See results →" : "Next →") + "</button></div>"
      );
    }
    var hint = played ? "What kind of movie is this?" : "Tap play to listen first.";
    return '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + "</span></div>";
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎧</div>' +
      "<h1>What kind of movie?</h1>" +
      '<p class="lc-intro-lede">Listen to six people describe a movie. Choose the kind of movie they describe.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="tf-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the person</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose <strong>a</strong> or <strong>b</strong>, then <strong>Check</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>6</strong> people in total</span></li>' +
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
      '<section class="al-set tf-single" aria-label="Choose the kind of movie">' +
      '<p class="tf-statement">What kind of movie does this person describe?</p>' +
      '<div class="al-opts">' +
      btnHtml("a") + btnHtml("b") +
      "</div></section>" +
      footHtml() +
      "</main>";

    bind();
  }

  function bind() {
    var p = document.getElementById("tf-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".al-opt").forEach(function (b) {
      b.onclick = function () { pick(b.getAttribute("data-value")); };
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
      "<p>You got " + score + " out of " + TOTAL + " right.</p>" +
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
