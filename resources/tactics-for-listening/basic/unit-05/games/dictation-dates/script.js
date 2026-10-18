/* Dictation · dates · Tactics For Listening Basic Unit 5
 * One recording of the whole conversation. Write the missing words and
 * numbers in the blanks. Each date counts as one question (some dates have
 * a month and a day). Accepts "16th", "16" or "sixteenth" etc.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u5-dictation-dates";
  var UNIT = "Unit 5 · Basic";
  var BACK = "../../";
  var AUDIO = "https://cdn.imgurl.ir/uploads/f118424_29_Unit_5_www_mp3cut_net.mp3";

  // every blank, with the answers that count as correct
  var GAPS = [
    { label: "August", ok: ["august", "aug"] },                                   // 0
    { label: "16th", ok: ["16", "16th", "sixteenth"] },                           // 1
    { label: "August", ok: ["august", "aug"] },                                   // 2
    { label: "23rd", ok: ["23", "23rd", "twenty third", "twenty-third"] },        // 3
    { label: "22nd", ok: ["22", "22nd", "twenty second", "twenty-second"] },      // 4
    { label: "27th", ok: ["27", "27th", "twenty seventh", "twenty-seventh"] },    // 5
    { label: "22nd", ok: ["22", "22nd", "twenty second", "twenty-second"] },      // 6
    { label: "31st", ok: ["31", "31st", "thirty first", "thirty-first"] },        // 7
  ];

  // the six questions: which blanks make up each date
  var QUESTIONS = [[0, 1], [2, 3], [4], [5], [6], [7]];

  // the conversation, with blanks (gap numbers refer to GAPS)
  var LINES = [
    { speaker: "A", parts: ["When are you going on vacation, Nick?"] },
    { speaker: "B", parts: ["We're leaving on ", { gap: 0 }, " ", { gap: 1 }, "."] },
    { speaker: "A", parts: ["And when are you coming back?"] },
    { speaker: "B", parts: ["On ", { gap: 2 }, " ", { gap: 3 }, "."] },
    { speaker: "A", parts: ["Oh, no. That means you'll miss my party on the ", { gap: 4 }, "."] },
    { speaker: "B", parts: ["What do you mean? I'll be back before the ", { gap: 5 }, "."] },
    { speaker: "A", parts: ["I said the ", { gap: 6 }, ", not the 27th, but maybe I can change the date. Are you free on the ", { gap: 7 }, "?"] },
  ];

  var app = document.getElementById("game-app");
  var phase = "start";
  var answers = [];        // per gap: typed text
  var checked = false;
  var gapOk = [];          // per gap: true | false (after check)
  var score = 0;
  var error = "";
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
  function norm(s) {
    return String(s).toLowerCase().replace(/[.,]/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();
  }
  function isRight(gapIndex, text) {
    return GAPS[gapIndex].ok.indexOf(norm(text)) !== -1;
  }

  /* ---------- audio: one recording for the whole conversation ---------- */

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
    audio = new Audio(AUDIO);
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
    answers = GAPS.map(function () { return ""; });
    gapOk = GAPS.map(function () { return null; });
    checked = false;
    score = 0;
    error = "";
    played = false;
    audioError = false;
    stopAudio();
  }

  function calcStars() {
    if (score >= QUESTIONS.length) return 3;
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
          gameId: GAME_ID, gameName: "Dictation (dates)",
          category: "tactics-for-listening", unit: "basic-5",
          score: score, maxScore: QUESTIONS.length,
          accuracy: Math.round((score / QUESTIONS.length) * 100),
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

  function setAnswer(gap, text) {
    if (checked) return;
    answers[gap] = text;
    error = "";
  }

  function check() {
    if (checked) return;
    var empty = answers.some(function (a) { return norm(a) === ""; });
    if (empty) {
      error = "Fill in every blank first.";
      renderPlay();
      return;
    }
    checked = true;
    stopAudio();
    score = 0;
    GAPS.forEach(function (_, g) { gapOk[g] = isRight(g, answers[g]); });
    QUESTIONS.forEach(function (gaps) {
      if (gaps.every(function (g) { return gapOk[g]; })) score++;
    });
    if (score === QUESTIONS.length) sfx("correct");
    else if (score >= 3) sfx("click");
    else sfx("wrong");
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
        gameId: GAME_ID, score: score, total: QUESTIONS.length, stars: stars,
        accuracy: Math.round((score / QUESTIONS.length) * 100), timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK, save: false,
      });
      return;
    }
    render();
  }

  /* shrink the conversation text until it fits without scrolling */
  function fitConvo() {
    var box = app.querySelector(".dd-convo");
    if (!box) return;
    var fs = 17;
    box.style.setProperty("--dd-fs", fs + "px");
    while (box.scrollHeight > box.clientHeight + 1 && fs > 11) {
      fs -= 0.5;
      box.style.setProperty("--dd-fs", fs + "px");
    }
  }

  /* ---------- views ---------- */

  function topBar(counter) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
      "<strong>Dictation</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function gapHtml(g) {
    var cls = "dd-input" + (GAPS[g].label === "August" ? "" : " is-wide");
    if (checked) cls += gapOk[g] ? " is-ok" : " is-bad";
    var fix = "";
    if (checked && !gapOk[g]) {
      fix = '<span class="dd-fix">' + esc(GAPS[g].label) + "</span>";
    }
    return (
      '<input type="text" class="' + cls + '" data-gap="' + g + '" aria-label="Blank ' + (g + 1) + '"' +
      ' value="' + esc(answers[g]) + '" autocomplete="off" autocapitalize="off" spellcheck="false"' +
      (checked ? " disabled" : "") + ">" + fix
    );
  }

  function convoHtml() {
    return LINES.map(function (line) {
      var parts = line.parts.map(function (p) {
        return typeof p === "string" ? esc(p) : gapHtml(p.gap);
      }).join("");
      return (
        '<div class="dd-line"><span class="dd-speaker" aria-hidden="true">' + line.speaker + "</span>" +
        '<p class="dd-text">' + parts + "</p></div>"
      );
    }).join("");
  }

  function footHtml() {
    if (checked) {
      var right = score;
      var msg = right === QUESTIONS.length ? "All correct!" : right + " of " + QUESTIONS.length + " right. Check the corrected blanks.";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + (right >= 4 ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="dd-finish">See results →</button></div>'
      );
    }
    var hint = error ? error : played ? "Write the missing words and numbers." : "Tap play to listen first.";
    return (
      '<div class="al-foot"><span class="al-foot-text' + (error ? " is-bad" : "") + '">' + esc(hint) + "</span>" +
      '<button type="button" class="al-next" id="dd-check">Check answers</button></div>'
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">✍️</div>' +
      "<h1>Dictation</h1>" +
      '<p class="lc-intro-lede">Listen to the conversation and write the missing words and numbers.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="dd-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the conversation</span></li>' +
      '<li><span class="tip-num">2</span><span>Write the <strong>missing words or numbers</strong> in the blanks</span></li>' +
      '<li><span class="tip-num">3</span><span>Tap <strong>Check answers</strong> when you are done</span></li>' +
      "</ol></section>";
    document.getElementById("dd-start").onclick = startGame;
  }

  function renderPlay() {
    var counter = QUESTIONS.length + " dates";
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = audioError ? "Audio unavailable"
      : playing ? "Playing… tap to stop"
      : played ? "Play again" : "Play the conversation";
    var listenSub = !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again while you write."
      : "One recording for the whole conversation.";

    app.innerHTML =
      topBar(counter) +
      '<main class="lc-main">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="dd-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" +
      (audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON) + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="dd-convo" aria-label="Conversation">' + convoHtml() + "</section>" +
      footHtml() +
      "</main>";

    bind();
    fitConvo();
  }

  function bind() {
    var p = document.getElementById("dd-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll("[data-gap]").forEach(function (inp) {
      var g = +inp.getAttribute("data-gap");
      inp.oninput = function () { setAnswer(g, inp.value); };
      inp.onkeydown = function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          var all = Array.prototype.slice.call(app.querySelectorAll("[data-gap]"));
          var idx = all.indexOf(inp);
          if (idx < all.length - 1) all[idx + 1].focus(); else check();
        }
      };
    });
    var c = document.getElementById("dd-check");
    if (c) c.onclick = check;
    var f = document.getElementById("dd-finish");
    if (f) f.onclick = finish;
  }

  function renderDone() {
    var stars = calcStars();
    var p = Math.round((score / QUESTIONS.length) * 100);
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + p + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + score + "</span>" +
      '<span class="lc-ring-of">of ' + QUESTIONS.length + "</span></div></div>" +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>You got " + score + " out of " + QUESTIONS.length + " dates right.</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="dd-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("dd-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  window.addEventListener("resize", function () {
    if (phase === "play") fitConvo();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { stopAudio(); if (phase === "play") renderPlay(); }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
