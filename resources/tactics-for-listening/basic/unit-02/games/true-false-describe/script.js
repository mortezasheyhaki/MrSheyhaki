/* True or False · Tactics For Listening Basic Unit 2
 * Same four recordings as Listen and Pick. Listen, then decide if the statement
 * is true or false. A right answer turns green and moves on; a wrong one shakes.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u2-true-false-describe";
  var UNIT = "Unit 2 · Basic";
  var BACK = "../../";

  // answer: "true" or "false", checked against the transcript
  var ITEMS = [
    { audio: "https://cdn.imgurl.ir/uploads/g37403_08_Unit_2_-_1.mp3",
      statement: "Ella isn’t very tall.", answer: "false" },   // she is tall, with long dark brown hair
    { audio: "https://cdn.imgurl.ir/uploads/k11648_08_Unit_2_-_2.mp3",
      statement: "Daniel is in his teens.", answer: "true" },   // he is 17
    { audio: "https://cdn.imgurl.ir/uploads/f5666_08_Unit_2_-_3.mp3",
      statement: "Anne is 29.", answer: "false" },              // the new girl is about 20
    { audio: "https://cdn.imgurl.ir/uploads/k70210_08_Unit_2_-_4.mp3",
      statement: "Paul’s cousin has blond hair.", answer: "false" }, // she has dark brown hair
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var mistakes = 0;
  var locked = false;
  var wrongPick = null;
  var rightPick = null;
  var status = { text: "", kind: "" };
  var nextTimer = null;
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

  /* ---------- audio: one recording at a time ---------- */

  function stopAudio() {
    playing = false;
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
      audio.onended = null; audio.onerror = null;
      audio = null;
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
    if (p && p.catch) p.catch(function () { playing = false; audioError = true; renderPlay(); });
  }

  /* ---------- flow ---------- */

  function calcStars() {
    if (mistakes === 0) return 3;
    if (mistakes <= 2) return 2;
    if (mistakes <= 4) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    var right = Math.max(0, TOTAL - mistakes);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "True or False",
          category: "tactics-for-listening", unit: "basic-2",
          score: right, maxScore: TOTAL,
          accuracy: Math.round((right / TOTAL) * 100),
          completed: true, stars: stars,
        });
      }
    } catch (e) {}
  }

  function clearNext() {
    if (nextTimer) { clearTimeout(nextTimer); nextTimer = null; }
  }

  function startGame() {
    clearNext();
    stopAudio();
    if (window.LAFinish) LAFinish.startTimer();
    current = 0;
    mistakes = 0;
    locked = false;
    wrongPick = null;
    rightPick = null;
    played = false;
    audioError = false;
    status = { text: "", kind: "" };
    playRecorded = false;
    phase = "play";
    render();
  }

  function pick(value) {
    if (locked || phase !== "play" || !played) return;
    var item = ITEMS[current];
    if (value === item.answer) {
      locked = true;
      wrongPick = null;
      rightPick = value;
      sfx("correct");
      status = { text: "Yes! That statement is " + value + ".", kind: "is-ok" };
      render();
      nextTimer = setTimeout(next, 900);
    } else {
      mistakes++;
      sfx("wrong");
      wrongPick = value;
      status = { text: "Not quite. Listen again and try the other answer.", kind: "is-bad" };
      render();
      setTimeout(function () { wrongPick = null; if (phase === "play" && !locked) render(); }, 380);
    }
  }

  function next() {
    nextTimer = null;
    stopAudio();
    if (current + 1 >= TOTAL) { finish(); return; }
    current++;
    locked = false;
    wrongPick = null;
    rightPick = null;
    played = false;
    audioError = false;
    status = { text: "", kind: "" };
    render();
  }

  function finish() {
    stopAudio();
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    sfx("win");
    var right = Math.max(0, TOTAL - mistakes);
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, score: right, total: TOTAL, stars: stars,
        accuracy: Math.round((right / TOTAL) * 100), timeMs: timeMs,
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
      "<strong>True or False</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Recording ' + (current + 1) + " of " + TOTAL + '">' +
      ITEMS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function btnHtml(value, label) {
    var cls = "ls-btn tfd-btn";
    if (rightPick === value) cls += " is-right";
    if (wrongPick === value) cls += " is-wrong";
    return (
      '<button type="button" class="' + cls + '" data-value="' + value + '"' +
      (locked || !played ? " disabled" : "") + ">" + label + "</button>"
    );
  }

  function renderPlay() {
    var item = ITEMS[current];
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = audioError ? "Audio unavailable"
      : playing ? "Playing… tap to stop"
      : played ? "Play again" : "Play the recording";
    var listenSub = !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again before you answer."
      : "Recording " + (current + 1) + " of " + TOTAL;
    var playIcon = audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON;

    app.innerHTML =
      topBar((current + 1) + " / " + TOTAL) +
      segments() +
      '<main class="lc-main"><div class="ls-wrap">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="tfd-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" + playIcon + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="ls-prompt-card tf-stmt-card"><p class="ls-prompt">' +
      (played ? esc(item.statement) : "Listen first, then decide if this is true or false.") +
      "</p></section>" +
      '<p class="ls-status ' + status.kind + '" aria-live="polite">' + esc(status.text) + "</p>" +
      '<div class="ls-btns tfd-btns">' + btnHtml("true", "True") + btnHtml("false", "False") + "</div>" +
      "</div></main>";
    bind();
  }

  function bind() {
    var p = document.getElementById("tfd-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".tfd-btn").forEach(function (b) {
      b.onclick = function () { pick(b.getAttribute("data-value")); };
    });
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">✅</div>' +
      "<h1>True or False</h1>" +
      '<p class="lc-intro-lede">Listen to four people, then decide if each statement is true or false.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="tfd-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the recording</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap <strong>True</strong> or <strong>False</strong></span></li>' +
      '<li><span class="tip-num">3</span><span>Right answers turn green. Wrong ones shake, so try again.</span></li>' +
      "</ol></section>";
    document.getElementById("tfd-start").onclick = startGame;
  }

  function renderDone() {
    var stars = calcStars();
    var right = Math.max(0, TOTAL - mistakes);
    var pct = Math.round((right / TOTAL) * 100);
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + pct + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + right + "</span>" +
      '<span class="lc-ring-of">of ' + TOTAL + "</span></div></div>" +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>" + mistakes + (mistakes === 1 ? " mistake." : " mistakes.") + "</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="tfd-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("tfd-again").onclick = startGame;
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
