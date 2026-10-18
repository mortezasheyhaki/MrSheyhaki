/* Recommend · Tactics For Listening Developing Unit 16
 * Same four recordings as Opinions. For each one, listen, then choose yes or no
 * (does the person recommend the movie?), and press the tick to confirm.
 * Only one recording plays at a time.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u16-recommend";
  var UNIT = "Unit 16 · Developing";
  var BACK = "../../";

  // answers from the key: "yes" or "no"
  var CLIPS = [
    { audio: "https://cdn.imgurl.ir/uploads/270207_40_Unit_16_-_1.mp3",  answer: "no" },
    { audio: "https://cdn.imgurl.ir/uploads/t65825_40_Unit_16-_2.mp3",   answer: "yes" },
    { audio: "https://cdn.imgurl.ir/uploads/s42137_40_Unit_16_-_3.mp3",   answer: "yes" },
    { audio: "https://cdn.imgurl.ir/uploads/d41597_40_Unit_16_-_4.mp3",   answer: "yes" },
  ];

  var TOTAL = CLIPS.length;
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var rounds = [];       // per clip: { pick: "yes"|"no"|null, checked: bool }
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
    rounds = CLIPS.map(function () { return { pick: null, checked: false }; });
    current = 0;
    score = 0;
    played = false;
    audioError = false;
    stopAudio();
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
          gameId: GAME_ID, gameName: "Recommend",
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

  function pick(value) {
    var r = rounds[current];
    if (r.checked) return;
    r.pick = (r.pick === value) ? null : value;
    sfx("click");
    renderPlay();
  }

  function tick() {
    var r = rounds[current];
    if (r.checked || r.pick === null) return;
    r.checked = true;
    var ok = r.pick === CLIPS[current].answer;
    if (ok) { score++; sfx("correct"); } else { sfx("wrong"); }
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
    saveProgress(stars, pct);
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
      "<strong>Recommend</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Recording ' + (current + 1) + " of " + TOTAL + '">' +
      CLIPS.map(function (c, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        if (rounds[i].checked) cls = rounds[i].pick === c.answer ? "is-right" : "is-wrong";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function choiceHtml(value, label) {
    var r = rounds[current];
    var clip = CLIPS[current];
    var on = r.pick === value;
    var isAnswer = clip.answer === value;
    var cls = "rc-choice";
    var mark = on ? "✓" : "";
    if (r.checked) {
      if (on && isAnswer) cls += " is-right";
      else if (on && !isAnswer) { cls += " is-wrong"; mark = "✕"; }
      else if (!on && isAnswer) { cls += " is-missed"; mark = "•"; }
    } else if (on) {
      cls += " is-on";
    }
    return (
      '<button type="button" class="' + cls + '" data-value="' + value + '"' +
      (r.checked ? " disabled" : "") + ' aria-pressed="' + (on ? "true" : "false") + '">' +
      '<span class="rc-box" aria-hidden="true">' + mark + "</span>" + esc(label) + "</button>"
    );
  }

  function footHtml() {
    var r = rounds[current];
    var last = current + 1 >= TOTAL;
    if (r.checked) {
      var ok = r.pick === CLIPS[current].answer;
      var msg = ok ? "Correct!" : "Not quite. The answer is " + CLIPS[current].answer + ".";
      return (
        '<div class="al-foot"><span class="al-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="al-next" id="rc-next">' + (last ? "See results →" : "Next →") + "</button></div>"
      );
    }
    var ready = r.pick !== null;
    var hint = ready ? "Tap ✓ to confirm." : "Does this person recommend the movie?";
    return (
      '<div class="al-foot"><span class="al-foot-text">' + esc(hint) + "</span>" +
      '<button type="button" class="op-tick" id="rc-tick" aria-label="Confirm my answer"' + (ready ? "" : " disabled") + ">✓</button></div>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🍿</div>' +
      "<h1>Recommend</h1>" +
      '<p class="lc-intro-lede">Listen to four people. Do they recommend the movie or not?</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="rc-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the recording</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose <strong>yes</strong> or <strong>no</strong></span></li>' +
      '<li><span class="tip-num">3</span><span>Tap <strong>✓</strong> to confirm, then <strong>Next</strong></span></li>' +
      "</ol></section>";
    document.getElementById("rc-start").onclick = startGame;
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
      '<button type="button" class="' + playCls + '" id="rc-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" +
      (audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON) + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="al-set" aria-label="Recommend the movie?">' +
      '<div class="rc-choices">' + choiceHtml("yes", "yes") + choiceHtml("no", "no") + "</div>" +
      "</section>" +
      footHtml() +
      "</main>";

    bind();
  }

  function bind() {
    var p = document.getElementById("rc-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".rc-choice").forEach(function (b) {
      b.onclick = function () { pick(b.getAttribute("data-value")); };
    });
    var t = document.getElementById("rc-tick");
    if (t) t.onclick = tick;
    var n = document.getElementById("rc-next");
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
      "<p>You got " + score + " out of " + TOTAL + " right.</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="rc-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("rc-again").onclick = startGame;
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
