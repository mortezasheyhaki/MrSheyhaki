/* Who Is It? · Tactics For Listening Basic Unit 2
 * Six recordings (the same as Listen and Choose a Number). Listen, then tap the
 * picture of the child being described. Answers are from the answer key.
 * Item 1 is D (confirmed). Item 2 follows the key (A).
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u2-who-is-it";
  var UNIT = "Unit 2 · Basic";
  var BACK = "../../";

  var PICS = [
    { letter: "A", src: "https://cdn.imgurl.ir/uploads/y0417_2._a.png" },
    { letter: "B", src: "https://cdn.imgurl.ir/uploads/e699566_B._4.png" },
    { letter: "C", src: "https://cdn.imgurl.ir/uploads/q436909_C._5.png" },
    { letter: "D", src: "https://cdn.imgurl.ir/uploads/m152559_D._1.png" },
    { letter: "E", src: "https://cdn.imgurl.ir/uploads/i567548_E._6.png" },
    { letter: "F", src: "https://cdn.imgurl.ir/uploads/q843295_F._3.png" },
  ];

  // answer: the picture letter from the answer key
  var ITEMS = [
    { audio: "https://cdn.imgurl.ir/uploads/i077837_09_Unit_2_-_1.mp3", answer: "d" },
    { audio: "https://cdn.imgurl.ir/uploads/g073458_09_Unit_2_-_2.mp3", answer: "a" },
    { audio: "https://cdn.imgurl.ir/uploads/m66232_09_Unit_2_-_3.mp3",  answer: "f" },
    { audio: "https://cdn.imgurl.ir/uploads/b789221_09_Unit_2_-_4.mp3", answer: "b" },
    { audio: "https://cdn.imgurl.ir/uploads/b4683_09_Unit_2_-_5.mp3",   answer: "c" },
    { audio: "https://cdn.imgurl.ir/uploads/p6172_09_Unit_2_-_6.mp3",   answer: "e" },
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var mistakes = 0;
  var locked = false;
  var wrongPick = null;
  var rightPick = null;
  var doneLetters = {};   // pictures already picked correctly: stay ticked and locked for the whole game
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
          gameId: GAME_ID, gameName: "Who Is It?",
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
    doneLetters = {};
    played = false;
    audioError = false;
    status = { text: "", kind: "" };
    playRecorded = false;
    phase = "play";
    render();
  }

  function pick(letter) {
    if (locked || phase !== "play" || !played) return;
    var item = ITEMS[current];
    if (letter.toLowerCase() === item.answer) {
      locked = true;
      wrongPick = null;
      rightPick = letter;
      doneLetters[letter] = true;
      sfx("correct");
      status = { text: "Yes! That is the right child.", kind: "is-ok" };
      render();
      nextTimer = setTimeout(next, 900);
    } else {
      mistakes++;
      sfx("wrong");
      wrongPick = letter;
      status = { text: "Not quite. Listen again and try another picture.", kind: "is-bad" };
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
      "<strong>Who Is It?</strong></div>" +
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

  function picHtml(p) {
    var done = !!doneLetters[p.letter];
    var cls = "wi-pic";
    if (done) cls += " is-done";
    if (rightPick === p.letter) cls += " is-right";
    if (wrongPick === p.letter) cls += " is-wrong";
    return (
      '<button type="button" class="' + cls + '" data-letter="' + p.letter + '"' +
      (done || locked || !played ? " disabled" : "") + ' aria-label="Picture ' + p.letter + '">' +
      '<img src="' + esc(p.src) + '" alt="Picture ' + p.letter + '">' +
      '<span class="wi-letter">' + p.letter + "</span>" +
      (done ? '<span class="wi-tick" aria-hidden="true">✓</span>' : "") +
      "</button>"
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
      '<button type="button" class="' + playCls + '" id="wi-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" + playIcon + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="ls-prompt-card"><p class="ls-prompt">' +
      (played ? "Which child is being described?" : "Listen first, then choose the child.") +
      "</p></section>" +
      '<p class="ls-status ' + status.kind + '" aria-live="polite">' + esc(status.text) + "</p>" +
      '<div class="wi-grid">' + PICS.map(picHtml).join("") + "</div>" +
      "</div></main>";
    bind();
  }

  function bind() {
    var p = document.getElementById("wi-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".wi-pic").forEach(function (b) {
      b.onclick = function () { pick(b.getAttribute("data-letter")); };
    });
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🧒</div>' +
      "<h1>Who Is It?</h1>" +
      '<p class="lc-intro-lede">Listen to each child. Tap the picture of the child being described.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="wi-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the child</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap the matching <strong>picture</strong></span></li>' +
      '<li><span class="tip-num">3</span><span>Right answers turn green. Wrong ones shake, so try again.</span></li>' +
      "</ol></section>";
    document.getElementById("wi-start").onclick = startGame;
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
      '<button type="button" class="lc-btn primary" id="wi-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("wi-again").onclick = startGame;
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
