/* Listening · Five Conversations · Starter Unit 7
 * Listen to five conversations and check the correct answer.
 */
(function () {
  "use strict";

  var GAME_ID = "starter-u7-listen-weekends-questions";
  var UNIT = "Starter · Unit 7";
  var BACK = "../";
  var AUDIO = "https://cdn.imgurl.ir/uploads/z497220_.mp3";

  var ITEMS = [
  { before: "What kind of movie do the two people go to see?", opts: ["an action movie", "a western", "a science fiction movie"], answer: 2 },
  { before: "What does the director ask the actor to say?", opts: ["Don’t talk to her!", "Don’t talk to him!", "Don’t talk to me!"], answer: 0 },
  { before: "What does Juan usually do on Saturday?", opts: ["He plays tennis.", "He works.", "He goes to the mountains with his family."], answer: 2 },
  { before: "What kind of movies does the man like?", opts: ["American movies", "French and Mexican movies", "Chinese movies"], answer: 1 },
  { before: "When is Ben’s birthday?", opts: ["July 26th", "August 5th", "August 6th"], answer: 1 }
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  var phase = "start";
  var choice = [];          // per line: index of picked option or null
  var checked = false;
  var score = 0;
  var playing = false;
  var played = false;
  var audio = null;
  var audioError = false;
  var playRecorded = false;
  var HAS_AUDIO = typeof window.Audio === "function" && !!AUDIO;

  var PLAY_ICON = '<span class="al-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="al-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="al-play-alert" aria-hidden="true">!</span>';

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function answeredCount() {
    return choice.filter(function (c) { return c !== null; }).length;
  }

  /* ---------- audio ---------- */
  function stopAudio() {
    playing = false;
    if (audio) { try { audio.pause(); audio.currentTime = 0; } catch (e) {} }
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
    choice = ITEMS.map(function () { return null; });
    checked = false;
    score = 0;
    played = false;
    audioError = false;
    stopAudio();
  }
  function calcStars() {
    if (score >= TOTAL) return 3;
    if (score >= 4) return 2;
    if (score >= 3) return 1;
    return 0;
  }
  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Listening · Five Conversations",
          category: "starter", unit: "starter-11",
          score: score, maxScore: TOTAL,
          accuracy: Math.round((score / TOTAL) * 100),
          completed: true, stars: stars
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
  function pick(i, k) {
    if (checked) return;
    choice[i] = k;
    renderPlay();
  }
  function check() {
    if (checked || answeredCount() < TOTAL) return;
    checked = true;
    score = 0;
    choice.forEach(function (c, i) { if (c === ITEMS[i].answer) score++; });
    if (score === TOTAL) sfx("win"); else sfx("correct");
    stopAudio();
    renderPlay();
  }
  function finish() {
    stopAudio();
    var stars = calcStars();
    saveProgress(stars);
    /* the Unit 11 hub star: one star per finished test */
    try {
      if (window.TestStars && typeof TestStars.award === "function") TestStars.award(GAME_ID);
    } catch (e) {}
    phase = "done";
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, score: score, total: TOTAL, stars: stars,
        accuracy: Math.round((score / TOTAL) * 100), timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK, save: false
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
      "<strong>Listening</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function lineHtml(i) {
    var it = ITEMS[i];
    var mine = choice[i];
    var btns = it.opts.map(function (label, k) {
      var cls = "ul-opt";
      var tick = "";
      if (checked) {
        if (k === it.answer) { cls += " is-correct"; tick = '<span class="ul-tick" aria-hidden="true">✓</span>'; }
        else if (k === mine) { cls += " is-wrong"; tick = '<span class="ul-tick" aria-hidden="true">✕</span>'; }
      } else if (k === mine) {
        cls += " is-picked";
      }
      return '<button type="button" class="' + cls + '" data-i="' + i + '" data-k="' + k + '"' +
        (checked ? " disabled" : "") + '><span class="ul-letter">' + String.fromCharCode(65 + k) + "</span>" +
        esc(label) + tick + "</button>";
    }).join("");
    var rowCls = "ul-row" + (checked ? (mine === it.answer ? " is-right" : " is-wrong") : "");
    return (
      '<div class="' + rowCls + '">' +
      '<div class="ul-line"><span class="ul-num">' + (i + 1) + "</span>" +
      '<div class="ul-body"><span class="ul-text">' + esc(it.before) + "</span>" +
      '<div class="ul-choices">' + btns + "</div></div>" +
      "</div></div>"
    );
  }

  function footHtml() {
    if (checked) {
      var msg = score + " / " + TOTAL + " correct";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + (score === TOTAL ? "is-ok" : "") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="ul-results">See results →</button></div>'
      );
    }
    if (answeredCount() === TOTAL) {
      return (
        '<div class="al-foot"><span class="al-foot-text">Ready? Press Check.</span>' +
        '<button type="button" class="al-next" id="ul-check">Check ✓</button></div>'
      );
    }
    var hint = played ? "Choose A, B or C for each question." : "Tap play to listen first.";
    return '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + " (" + answeredCount() + " / " + TOTAL + ")</span></div>";
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎧</div>' +
      "<h1>Conversations · Questions 1</h1>" +
      '<p class="lc-intro-lede">Listen to five conversations and answer the questions.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="ul-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the conversation</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose <strong>A</strong>, <strong>B</strong> or <strong>C</strong> for each of the <strong>5</strong> questions</span></li>' +
      '<li><span class="tip-num">3</span><span>Press <strong>Check</strong> to see your score</span></li>' +
      "</ol></section>";
    document.getElementById("ul-start").onclick = startGame;
  }

  function renderPlay() {
    var counter = checked ? (score + " / " + TOTAL) : (answeredCount() + " / " + TOTAL);
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = audioError ? "Audio unavailable"
      : playing ? "Playing… tap to stop"
      : played ? "Play again" : "Play the conversation";
    var listenSub = !AUDIO ? "Audio link not added yet." : !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again at any time."
      : "Listen, then choose A, B or C.";

    var rows = "";
    for (var i = 0; i < TOTAL; i++) rows += lineHtml(i);

    app.innerHTML =
      topBar(counter) +
      '<main class="lc-main" style="display:flex;flex-direction:column;flex:1 1 auto;min-height:0;">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="ul-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" +
      (audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON) + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="ul-list" aria-label="Questions">' + rows + "</section>" +
      footHtml() +
      "</main>";
    bind();
  }

  function bind() {
    var p = document.getElementById("ul-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".ul-opt").forEach(function (b) {
      b.onclick = function () { pick(Number(b.getAttribute("data-i")), Number(b.getAttribute("data-k"))); };
    });
    var c = document.getElementById("ul-check");
    if (c) c.onclick = check;
    var r = document.getElementById("ul-results");
    if (r) r.onclick = finish;
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
      '<button type="button" class="lc-btn primary" id="ul-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("ul-again").onclick = startGame;
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
