/* Opinions · Tactics For Listening Developing Unit 16
 * Four short recordings. For each one, listen, then tap Liked or Didn't like
 * for the story, the acting, the ending and the music. A row can only have one
 * choice. Press the tick to confirm. Only one recording plays at a time.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u16-opinions";
  var UNIT = "Unit 16 · Developing";
  var BACK = "../../";

  var ASPECTS = [
    { key: "story",  label: "the story" },
    { key: "acting", label: "the acting" },
    { key: "ending", label: "the ending" },
    { key: "music",  label: "the music" },
  ];

  // answers from the key: "liked" or "dislike" for each aspect
  var CLIPS = [
    { audio: "https://cdn.imgurl.ir/uploads/270207_40_Unit_16_-_1.mp3",
      answers: { story: "dislike", acting: "dislike", ending: "dislike", music: "liked" } },
    { audio: "https://cdn.imgurl.ir/uploads/t65825_40_Unit_16-_2.mp3",
      answers: { story: "liked", acting: "liked", ending: "dislike", music: "dislike" } },
    { audio: "https://cdn.imgurl.ir/uploads/s42137_40_Unit_16_-_3.mp3",
      answers: { story: "liked", acting: "liked", ending: "liked", music: "liked" } },
    { audio: "https://cdn.imgurl.ir/uploads/d41597_40_Unit_16_-_4.mp3",
      answers: { story: "liked", acting: "liked", ending: "liked", music: "dislike" } },
  ];

  var TOTAL = CLIPS.length;
  var ROWS = ASPECTS.length;

  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var rounds = [];         // per clip: { picks: {key: "liked"|"dislike"|undefined}, checked, rightRows }
  var score = 0;           // recordings answered fully right (one point each)
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

  /* ---------- state ---------- */

  function setupGame() {
    rounds = CLIPS.map(function () { return { picks: {}, checked: false }; });
    current = 0;
    score = 0;
    played = false;
    audioError = false;
    stopAudio();
  }

  function rowCorrect(r, clip, key) {
    return r.picks[key] === clip.answers[key];
  }

  function calcStars(pct) {
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  }

  function saveProgress(stars, pct) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Opinions",
          category: "tactics-for-listening", unit: "developing-16",
          score: score, maxScore: TOTAL,
          accuracy: pct, completed: true, stars: stars,
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

  // tap a box: pick it, or clear it if it's already picked; the other box in the row switches
  function pickCell(key, value) {
    var r = rounds[current];
    if (r.checked) return;
    if (r.picks[key] === value) { delete r.picks[key]; sfx("click"); }
    else { r.picks[key] = value; sfx("click"); }
    renderPlay();
  }

  function allRowsAnswered() {
    var r = rounds[current];
    return ASPECTS.every(function (a) { return r.picks[a.key] === "liked" || r.picks[a.key] === "dislike"; });
  }

  function tick() {
    var r = rounds[current];
    if (r.checked || !allRowsAnswered()) return;
    r.checked = true;
    var clip = CLIPS[current];
    var right = ASPECTS.filter(function (a) { return rowCorrect(r, clip, a.key); }).length;
    if (right === ROWS) score++;
    sfx(right === ROWS ? "correct" : "wrong");
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
    var max = TOTAL;
    var pct = Math.round((score / max) * 100);
    var stars = calcStars(pct);
    saveProgress(stars, pct);
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, score: score, total: max, stars: stars,
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
      "<strong>Opinions</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Recording ' + (current + 1) + " of " + TOTAL + '">' +
      CLIPS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        if (rounds[i].checked) {
          var c = CLIPS[i];
          var all = ASPECTS.every(function (a) { return rowCorrect(rounds[i], c, a.key); });
          cls = all ? "is-right" : "is-wrong";
        }
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function cellHtml(key, value, label) {
    var r = rounds[current];
    var clip = CLIPS[current];
    var on = r.picks[key] === value;
    var isAnswer = clip.answers[key] === value;
    var cls = "op-cell";
    var mark = on ? "✓" : "";
    if (r.checked) {
      if (on && isAnswer) cls += " is-right";
      else if (on && !isAnswer) { cls += " is-wrong"; mark = "✕"; }
      else if (!on && isAnswer) { cls += " is-missed"; mark = "•"; }
    } else if (on) {
      cls += " is-on";
    }
    return (
      '<button type="button" class="' + cls + '" data-key="' + key + '" data-value="' + value + '"' +
      (r.checked ? " disabled" : "") + ' aria-pressed="' + (on ? "true" : "false") +
      '" aria-label="' + esc(label) + '">' + mark + "</button>"
    );
  }

  function gridHtml() {
    var r = rounds[current];
    var clip = CLIPS[current];
    var head =
      '<div class="op-head">Aspect</div>' +
      '<div class="op-head">Liked</div>' +
      '<div class="op-head">Didn’t like</div>';
    var rows = ASPECTS.map(function (a) {
      var status = "";
      if (r.checked) {
        var ok = rowCorrect(r, clip, a.key);
        status = '<span class="op-row-status ' + (ok ? "is-ok" : "is-bad") + '">' + (ok ? "✓" : "✕") + "</span>";
      }
      return (
        '<div class="op-aspect">' + esc(a.label) + status + "</div>" +
        '<div class="op-box">' + cellHtml(a.key, "liked", a.label + ", liked") + "</div>" +
        '<div class="op-box">' + cellHtml(a.key, "dislike", a.label + ", didn’t like") + "</div>"
      );
    }).join("");
    return '<div class="op-grid">' + head + rows + "</div>";
  }

  function footHtml() {
    var r = rounds[current];
    var last = current + 1 >= TOTAL;
    if (r.checked) {
      var clip = CLIPS[current];
      var right = ASPECTS.filter(function (a) { return rowCorrect(r, clip, a.key); }).length;
      var msg = right === ROWS ? "All four correct!" : right + " of " + ROWS + " correct.";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + (right === ROWS ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="op-next">' + (last ? "See results →" : "Next →") + "</button></div>"
      );
    }
    var ready = allRowsAnswered();
    var hint = ready ? "Tap ✓ to confirm." : "Tap a box for each aspect.";
    return (
      '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + "</span>" +
      '<button type="button" class="op-tick" id="op-tick" aria-label="Confirm my answers"' + (ready ? "" : " disabled") + ">✓</button></div>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">👍</div>' +
      "<h1>Opinions</h1>" +
      '<p class="lc-intro-lede">Listen to four people. Tap whether they liked or didn’t like each part.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="op-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the recording</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap <strong>Liked</strong> or <strong>Didn’t like</strong> for each part</span></li>' +
      '<li><span class="tip-num">3</span><span>Tap <strong>✓</strong> to confirm, then <strong>Next</strong></span></li>' +
      "</ol></section>";
    document.getElementById("op-start").onclick = startGame;
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
      : played ? "You can play it again before you confirm."
      : "Recording " + (current + 1) + " of " + TOTAL;

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<main class="lc-main">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="op-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" +
      (audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON) + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="al-set" aria-label="Liked or didn’t like">' +
      gridHtml() +
      "</section>" +
      footHtml() +
      "</main>";

    bind();
  }

  function bind() {
    var p = document.getElementById("op-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".op-cell").forEach(function (b) {
      b.onclick = function () { pickCell(b.getAttribute("data-key"), b.getAttribute("data-value")); };
    });
    var t = document.getElementById("op-tick");
    if (t) t.onclick = tick;
    var n = document.getElementById("op-next");
    if (n) n.onclick = next;
  }

  function renderDone() {
    var max = TOTAL;
    var pct = Math.round((score / max) * 100);
    var stars = calcStars(pct);
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + pct + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + score + "</span>" +
      '<span class="lc-ring-of">of ' + max + "</span></div></div>" +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>You got " + score + " of " + max + " recordings completely right.</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="op-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("op-again").onclick = startGame;
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
