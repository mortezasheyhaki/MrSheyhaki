/* Showtimes · Tactics For Listening Developing Unit 16
 * Six conversations about movies (same recordings as Movie Wheel). Each clip
 * has four showtimes. Each round shows three of them as answers and two
 * distractors. Listen once, then tap the three times you heard and Check.
 * Only one recording plays at a time.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u16-showtimes";
  var UNIT = "Unit 16 · Developing";
  var BACK = "../../";

  // Same six recordings as Movie Wheel. times = the four showtimes in the answer key.
  var CLIPS = [
    { audio: "https://cdn.imgurl.ir/uploads/d894222_39_Unit_16_-_1.mp3", times: ["2:30", "4:45", "7:30", "10:00"] },
    { audio: "https://cdn.imgurl.ir/uploads/k498402_39_Unit_16_-_2.mp3", times: ["1:30", "4:30", "6:15", "9:00"] },
    { audio: "https://cdn.imgurl.ir/uploads/n55375_39_Unit_16_-_3.mp3",  times: ["1:00", "3:15", "6:30", "9:30"] },
    { audio: "https://cdn.imgurl.ir/uploads/x88126_39_Unit_16_-_4.mp3",  times: ["12:00", "3:30", "5:30", "8:00"] },
    { audio: "https://cdn.imgurl.ir/uploads/n2022_39_Unit_16_-_5.mp3",   times: ["2:00", "5:00", "7:00", "9:15"] },
    { audio: "https://cdn.imgurl.ir/uploads/x29529_39_Unit_16_-_6.mp3",  times: ["10:00", "1:45", "4:15", "6:45"] },
  ];

  // plausible times used as distractors (never one of the clip's four times)
  var POOL = ["11:30", "2:45", "8:30", "12:30", "5:15", "7:45", "9:45", "1:15", "3:00", "6:00", "4:00", "8:45"];

  var ANSWERS_PER_ROUND = 3;
  var DISTRACTORS = 2;
  var TOTAL = CLIPS.length;

  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var rounds = [];          // per round: { answers, options, selected: [], checked, ok }
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
    audio = new Audio(CLIPS[current].audio);
    audio.preload = "auto";
    playing = true;
    played = true;
    renderPlay();
    audio.onended = function () { playing = false; renderPlay(); };
    audio.onerror = function () { playing = false; audioError = true; renderPlay(); };
    var p = audio.play();
    if (p && p.catch) p.catch(function () { playing = false; audioError = true; renderPlay(); });
  }

  /* ---------- rounds ---------- */

  function buildRound(clip) {
    var pool = clip.times.slice();
    var answers = shuffle(pool).slice(0, ANSWERS_PER_ROUND);
    var distractors = shuffle(POOL.filter(function (t) { return clip.times.indexOf(t) === -1; }))
      .slice(0, DISTRACTORS);
    return { answers: answers, options: shuffle(answers.concat(distractors)), selected: [], checked: false, ok: false };
  }

  function setupGame() {
    rounds = CLIPS.map(buildRound);
    current = 0;
    score = 0;
    played = false;
    audioError = false;
    stopAudio();
  }

  function calcStars(pct) {
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Showtimes",
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

  function toggle(time) {
    var r = rounds[current];
    if (r.checked) return;
    var i = r.selected.indexOf(time);
    if (i !== -1) {
      r.selected.splice(i, 1);
      sfx("click");
    } else if (r.selected.length < ANSWERS_PER_ROUND) {
      r.selected.push(time);
      sfx("click");
    }
    renderPlay();
  }

  function check() {
    var r = rounds[current];
    if (r.checked || r.selected.length !== ANSWERS_PER_ROUND) return;
    r.checked = true;
    var allRight = r.selected.every(function (t) { return r.answers.indexOf(t) !== -1; });
    r.ok = allRight;
    if (r.ok) { score++; sfx("correct"); } else { sfx("wrong"); }
    stopAudio();
    renderPlay();
  }

  function next() {
    if (!rounds[current].checked) return;
    if (current + 1 >= TOTAL) { finish(); return; }
    current++;
    played = false;
    audioError = false;
    stopAudio();
    renderPlay();
  }

  function finish() {
    stopAudio();
    var pct = Math.round((score / TOTAL) * 100);
    var stars = calcStars(pct);
    saveProgress(stars);
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, score: score, total: TOTAL, stars: stars,
        accuracy: pct, timeMs: timeMs,
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
      "<strong>Showtimes</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Clip ' + (current + 1) + " of " + TOTAL + '">' +
      CLIPS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        if (rounds[i].checked) cls = rounds[i].ok ? "is-right" : "is-wrong";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function timeBtn(t) {
    var r = rounds[current];
    var picked = r.selected.indexOf(t) !== -1;
    var isAnswer = r.answers.indexOf(t) !== -1;
    var cls = "al-opt";
    var tick = "";
    if (r.checked) {
      if (picked && isAnswer) { cls += " is-correct"; tick = '<span class="al-tick" aria-hidden="true">✓</span>'; }
      else if (picked && !isAnswer) { cls += " is-wrong"; tick = '<span class="al-tick" aria-hidden="true">✕</span>'; }
      else if (!picked && isAnswer) { cls += " is-missed"; tick = '<span class="al-tick" aria-hidden="true">•</span>'; }
    } else if (picked) {
      cls += " is-picked";
    }
    return (
      '<button type="button" class="' + cls + '" data-time="' + esc(t) + '"' +
      (r.checked ? " disabled" : "") + ">" + esc(t) + tick + "</button>"
    );
  }

  function footHtml() {
    var r = rounds[current];
    var last = current + 1 >= TOTAL;
    var n = r.selected.length;
    if (r.checked) {
      var msg = r.ok
        ? "Correct! " + r.answers.join(", ")
        : "The times were " + r.answers.join(", ") + ".";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + (r.ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="st-next">' + (last ? "See results →" : "Next →") + "</button></div>"
      );
    }
    var hint = n === ANSWERS_PER_ROUND
      ? "Check your three times."
      : "Pick the " + ANSWERS_PER_ROUND + " times you hear (" + n + " of " + ANSWERS_PER_ROUND + ").";
    return (
      '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + "</span>" +
      '<button type="button" class="al-next" id="st-check"' + (n === ANSWERS_PER_ROUND ? "" : " disabled") + ">Check ✓</button></div>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🕒</div>' +
      "<h1>Showtimes</h1>" +
      '<p class="lc-intro-lede">Listen to six people talk about a movie. Pick the three showtimes you hear.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="st-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the conversation</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap the <strong>three</strong> times you heard</span></li>' +
      '<li><span class="tip-num">3</span><span>Tap <strong>Check</strong>, then <strong>Next</strong></span></li>' +
      "</ol></section>";
    document.getElementById("st-start").onclick = startGame;
  }

  function renderPlay() {
    var counter = (current + 1) + " / " + TOTAL;
    var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var listenTitle = audioError ? "Audio unavailable"
      : playing ? "Playing… tap to stop"
      : played ? "Play again" : "Play the conversation";
    var listenSub = !HAS_AUDIO ? "Audio is not supported in this browser."
      : audioError ? "This recording could not load. Check your connection."
      : playing ? "Tap the square to stop."
      : played ? "You can play it again before you check."
      : "Conversation " + (current + 1) + " of " + TOTAL;

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<main class="lc-main">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="st-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" +
      (audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON) + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="al-set" aria-label="Showtimes">' +
      '<p class="st-hint">Which three times did you hear?</p>' +
      '<div class="st-opts">' + rounds[current].options.map(timeBtn).join("") + "</div>" +
      "</section>" +
      footHtml() +
      "</main>";

    bind();
  }

  function bind() {
    var p = document.getElementById("st-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".al-opt").forEach(function (b) {
      b.onclick = function () { toggle(b.getAttribute("data-time")); };
    });
    var c = document.getElementById("st-check");
    if (c) c.onclick = check;
    var n = document.getElementById("st-next");
    if (n) n.onclick = next;
  }

  function renderDone() {
    var pct = Math.round((score / TOTAL) * 100);
    var stars = calcStars(pct);
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + pct + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + score + "</span>" +
      '<span class="lc-ring-of">of ' + TOTAL + "</span></div></div>" +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>You got " + score + " out of " + TOTAL + " conversations right.</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="st-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("st-again").onclick = startGame;
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
