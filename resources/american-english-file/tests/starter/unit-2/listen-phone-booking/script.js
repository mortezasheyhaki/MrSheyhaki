/* Listening · Phone Booking · Starter Unit 2
 * Listen to Ibrahim book a vacation over the phone. Tick the information he gives.
 * Five of the eight items are correct. Ticking a wrong item counts against you.
 */
(function () {
  "use strict";

  var GAME_ID = "starter-u2-listen-phone-booking";
  var UNIT = "Starter · Unit 2";
  var BACK = "../";
  var AUDIO = "https://cdn.imgurl.ir/uploads/l46779_.mp3";

  /* answer: true = Ibrahim gives this information */
  var ITEMS = [
    { label: "vacation country",    answer: true },
    { label: "last name",           answer: true },
    { label: "email address",       answer: false },
    { label: "phone number",        answer: true },
    { label: "passport number",     answer: false },
    { label: "address",             answer: false },
    { label: "credit card number",  answer: true },
    { label: "nationality",         answer: true }
  ];

  var TOTAL = ITEMS.filter(function (it) { return it.answer; }).length;   /* 5 */
  var app = document.getElementById("game-app");
  var phase = "start";
  var ticked = [];          /* per item: true when ticked */
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
  function tickCount() {
    return ticked.filter(function (t) { return t; }).length;
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
    ticked = ITEMS.map(function () { return false; });
    checked = false;
    score = 0;
    played = false;
    audioError = false;
    stopAudio();
  }
  function calcStars() {
    var pct = TOTAL ? score / TOTAL : 0;
    if (pct >= 1) return 3;
    if (pct >= 0.8) return 2;
    if (pct >= 0.6) return 1;
    return 0;
  }
  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Listening · Phone Booking",
          category: "starter", unit: "starter-2",
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
  function toggle(i) {
    if (checked) return;
    ticked[i] = !ticked[i];
    renderPlay();
  }
  function check() {
    if (checked) return;
    checked = true;
    score = 0;
    ITEMS.forEach(function (it, i) { if (it.answer && ticked[i]) score++; });
    if (score === TOTAL && tickCount() === TOTAL) sfx("win"); else sfx("correct");
    stopAudio();
    renderPlay();
  }
  function finish() {
    stopAudio();
    var stars = calcStars();
    saveProgress(stars);
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

  function itemHtml(i) {
    var it = ITEMS[i];
    var on = ticked[i];
    var cls = "ul-opt" + (on ? " is-picked" : "");
    var mark = "";
    if (checked) {
      if (it.answer && on) { cls += " is-correct"; mark = '<span class="ul-tick" aria-hidden="true">✓</span>'; }
      else if (!it.answer && on) { cls += " is-wrong"; mark = '<span class="ul-tick" aria-hidden="true">✕</span>'; }
      else if (it.answer && !on) { cls += " is-missed"; mark = '<span class="ul-tick" aria-hidden="true">!</span>'; }
    }
    var rowCls = "ul-row";
    if (checked) {
      rowCls += (it.answer === on) ? " is-right" : " is-wrong";
    }
    return (
      '<div class="' + rowCls + '">' +
      '<button type="button" class="' + cls + '" data-i="' + i + '"' + (checked ? " disabled" : "") + ">" +
      '<span class="ul-box" aria-hidden="true"></span>' +
      '<span class="ul-body-text">' + esc(it.label) + "</span>" + mark +
      "</button></div>"
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
    var hint = played ? "Tick the information you hear." : "Tap play to listen first.";
    return (
      '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + " (" + tickCount() + " ticked)</span>" +
      '<button type="button" class="al-next" id="ul-check">Check ✓</button></div>'
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎧</div>' +
      "<h1>Phone Booking</h1>" +
      '<p class="lc-intro-lede">Listen to Ibrahim book a vacation over the phone. Tick the information he gives.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="ul-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the phone call</span></li>' +
      '<li><span class="tip-num">2</span><span>Tick the <strong>information</strong> Ibrahim gives</span></li>' +
      '<li><span class="tip-num">3</span><span>Press <strong>Check</strong> to see your score</span></li>' +
      "</ol></section>";
    document.getElementById("ul-start").onclick = startGame;
  }

  function renderPlay() {
    var counter = checked ? (score + " / " + TOTAL) : (tickCount() + " ticked");
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = audioError ? "Audio unavailable"
      : playing ? "Playing… tap to stop"
      : played ? "Play again" : "Play the phone call";
    var listenSub = !AUDIO ? "Audio link not added yet." : !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again at any time."
      : "Listen, then tick the information.";

    var rows = "";
    for (var i = 0; i < ITEMS.length; i++) rows += itemHtml(i);

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
      '<p class="pb-instr">Listen to Ibrahim book a vacation over the phone. Tick ✓ the information he gives.</p>' +
      '<section class="ul-list" aria-label="Information">' + rows + "</section>" +
      footHtml() +
      "</main>";
    bind();
  }

  function bind() {
    var p = document.getElementById("ul-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".ul-opt").forEach(function (b) {
      b.onclick = function () { toggle(Number(b.getAttribute("data-i"))); };
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
      "<p>You got " + score + " out of " + TOTAL + " pieces of information right.</p>" +
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

  setupGame();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
