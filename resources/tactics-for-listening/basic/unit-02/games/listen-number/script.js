/* Listen and Choose a Number · Tactics For Listening Basic Unit 2
 * Six recordings: parents looking for their children in a store. Listen, then tap
 * the child's age. The three numbers are realistic ages for a child (2 to 16) and sound alike where possible.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u2-listen-number";
  var UNIT = "Unit 2 · Basic";
  var BACK = "../../";

  // answer: the correct age (from the answer key). options: the three numbers shown.
  var ITEMS = [
    { audio: "https://cdn.imgurl.ir/uploads/i077837_09_Unit_2_-_1.mp3", answer: 9,  options: [9, 8, 10] },
    { audio: "https://cdn.imgurl.ir/uploads/g073458_09_Unit_2_-_2.mp3", answer: 11, options: [11, 12, 13] },
    { audio: "https://cdn.imgurl.ir/uploads/m66232_09_Unit_2_-_3.mp3",  answer: 10, options: [10, 13, 16] },
    { audio: "https://cdn.imgurl.ir/uploads/b789221_09_Unit_2_-_4.mp3", answer: 12, options: [12, 2, 13] },
    { audio: "https://cdn.imgurl.ir/uploads/b4683_09_Unit_2_-_5.mp3",   answer: 10, options: [10, 6, 16] },
    { audio: "https://cdn.imgurl.ir/uploads/p6172_09_Unit_2_-_6.mp3",   answer: 12, options: [12, 2, 15] },
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var mistakes = 0;
  var locked = false;
  var wrongPick = null;
  var rightPick = null;
  var order = [];
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
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
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
          gameId: GAME_ID, gameName: "Listen and Choose a Number",
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
    order = shuffle(ITEMS[0].options);
    phase = "play";
    render();
  }

  function pick(n) {
    if (locked || phase !== "play" || !played) return;
    var item = ITEMS[current];
    if (n === item.answer) {
      locked = true;
      wrongPick = null;
      rightPick = n;
      sfx("correct");
      status = { text: "Yes! That is " + n + ".", kind: "is-ok" };
      render();
      nextTimer = setTimeout(next, 900);
    } else {
      mistakes++;
      sfx("wrong");
      wrongPick = n;
      status = { text: "Not quite. Listen again and try another number.", kind: "is-bad" };
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
    order = shuffle(ITEMS[current].options);
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
      "<strong>Listen and Choose a Number</strong></div>" +
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

  function btnHtml(n) {
    var cls = "ls-btn ln-btn";
    if (rightPick === n) cls += " is-right";
    if (wrongPick === n) cls += " is-wrong";
    return (
      '<button type="button" class="' + cls + '" data-n="' + n + '"' +
      (locked || !played ? " disabled" : "") + ">" + n + "</button>"
    );
  }

  function renderPlay() {
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = audioError ? "Audio unavailable"
      : playing ? "Playing… tap to stop"
      : played ? "Play again" : "Play the recording";
    var listenSub = !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again before you answer."
      : "Child " + (current + 1) + " of " + TOTAL;
    var playIcon = audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON;

    app.innerHTML =
      topBar((current + 1) + " / " + TOTAL) +
      segments() +
      '<main class="lc-main"><div class="ls-wrap">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="ln-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" + playIcon + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="ls-prompt-card"><p class="ls-prompt">' +
      (played ? "How old is the child?" : "Listen first, then choose the age.") +
      "</p></section>" +
      '<p class="ls-status ' + status.kind + '" aria-live="polite">' + esc(status.text) + "</p>" +
      '<div class="ls-btns ln-btns">' + order.map(btnHtml).join("") + "</div>" +
      "</div></main>";
    bind();
  }

  function bind() {
    var p = document.getElementById("ln-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".ln-btn").forEach(function (b) {
      b.onclick = function () { pick(+b.getAttribute("data-n")); };
    });
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🔢</div>' +
      "<h1>Listen and Choose a Number</h1>" +
      '<p class="lc-intro-lede">Parents are looking for their children in a store. Listen and choose each child\u2019s age.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="ln-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the child</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose the right <strong>number</strong></span></li>' +
      '<li><span class="tip-num">3</span><span>Numbers sound alike, so listen carefully</span></li>' +
      "</ol></section>";
    document.getElementById("ln-start").onclick = startGame;
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
      '<button type="button" class="lc-btn primary" id="ln-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("ln-again").onclick = startGame;
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
