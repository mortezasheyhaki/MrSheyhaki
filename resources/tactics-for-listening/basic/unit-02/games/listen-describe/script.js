/* Listen and Sort · Tactics For Listening Basic Unit 2
 * Eight recordings, one at a time. Play the recording, then tap Age, Height
 * or Hair. A right answer turns green and moves on; a wrong one shakes.
 * A clip with no answer yet plays and moves on without scoring.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u2-listen-describe";
  var UNIT = "Unit 2 · Basic";
  var BACK = "../../";

  var CATS = [
    { id: "age",    label: "Age" },
    { id: "height", label: "Height" },
    { id: "hair",   label: "Hair" },
  ];

  // answer: "age", "height" or "hair" from the answer key. null = not set yet.
  var CLIPS = [
    { audio: "https://cdn.imgurl.ir/uploads/k73357_07_Unit_2__1.mp3",  answer: "age" },
    { audio: "https://cdn.imgurl.ir/uploads/a046717_07_Unit_2_-_2.mp3", answer: "hair" },
    { audio: "https://cdn.imgurl.ir/uploads/j43583_07_Unit_2_-_3.mp3",  answer: "height" },
    { audio: "https://cdn.imgurl.ir/uploads/k803200_07_Unit_2_-_4.mp3", answer: "age" },
    { audio: "https://cdn.imgurl.ir/uploads/h515561_07_Unit_2_-_5.mp3", answer: "hair" },
    { audio: "https://cdn.imgurl.ir/uploads/g28015_07_Unit_2_-_6.mp3",  answer: "height" },
    { audio: "https://cdn.imgurl.ir/uploads/k864394_07_Unit_2_-_7.mp3", answer: "age" },
    { audio: "https://cdn.imgurl.ir/uploads/u224193_07_Unit_2_-_8.mp3", answer: "hair" },
  ];

  var TOTAL = CLIPS.length;
  var app = document.getElementById("game-app");
  var phase = "start";
  var current = 0;
  var mistakes = 0;
  var score = 0;
  var scoredCount = 0;
  var locked = false;
  var picked = null;       // category the student tapped last (wrong or right)
  var wrongCat = null;
  var rightCat = null;
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
  function catLabel(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].label;
    return id;
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

  /* ---------- flow ---------- */

  function calcStars() {
    if (scoredCount === 0) return 0;
    var pct = Math.round((score / scoredCount) * 100);
    if (mistakes === 0) return 3;
    if (pct >= 70) return 2;
    if (pct >= 40) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Listen and Sort",
          category: "tactics-for-listening", unit: "basic-2",
          score: score, maxScore: scoredCount,
          accuracy: scoredCount ? Math.round((score / scoredCount) * 100) : 0,
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
    score = 0;
    scoredCount = 0;
    locked = false;
    picked = null;
    wrongCat = null;
    rightCat = null;
    played = false;
    audioError = false;
    status = { text: "", kind: "" };
    playRecorded = false;
    phase = "play";
    render();
  }

  function answer(cat) {
    if (locked || phase !== "play") return;
    var clip = CLIPS[current];
    if (clip.answer === null) {
      // no answer key yet: nothing is scored, move on
      locked = true;
      rightCat = null;
      status = { text: "Answer for this clip is not set yet.", kind: "" };
      render();
      nextTimer = setTimeout(next, 900);
      return;
    }
    if (cat === clip.answer) {
      locked = true;
      wrongCat = null;
      rightCat = cat;
      score++;
      scoredCount++;
      sfx("correct");
      status = { text: "Yes! That is " + catLabel(cat).toLowerCase() + ".", kind: "is-ok" };
      render();
      nextTimer = setTimeout(next, 900);
    } else {
      mistakes++;
      sfx("wrong");
      wrongCat = cat;
      status = { text: "Not quite. Listen again or try another.", kind: "is-bad" };
      render();
      setTimeout(function () { wrongCat = null; if (phase === "play" && !locked) render(); }, 380);
    }
  }

  function next() {
    nextTimer = null;
    stopAudio();
    if (current + 1 >= TOTAL) { finish(); return; }
    current++;
    locked = false;
    picked = null;
    wrongCat = null;
    rightCat = null;
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
    var pct = scoredCount ? Math.round((score / scoredCount) * 100) : 0;
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, score: score, total: scoredCount, stars: stars,
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
      "<strong>Listen and Sort</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Recording ' + (current + 1) + " of " + TOTAL + '">' +
      CLIPS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function btnHtml(c) {
    var cls = "ls-btn";
    if (rightCat === c.id) cls += " is-right";
    if (wrongCat === c.id) cls += " is-wrong";
    return (
      '<button type="button" class="' + cls + '" data-cat="' + c.id + '"' +
      (locked || !played ? " disabled" : "") + ">" + esc(c.label) + "</button>"
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
      : "Recording " + (current + 1) + " of " + TOTAL;
    var playIcon = audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON;

    app.innerHTML =
      topBar((current + 1) + " / " + TOTAL) +
      segments() +
      '<main class="lc-main"><div class="ls-wrap">' +
      '<div class="al-listen">' +
      '<button type="button" class="' + playCls + '" id="ls-play" aria-label="' + esc(listenTitle) + '"' +
      (HAS_AUDIO ? "" : " disabled") + ">" + playIcon + "</button>" +
      '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
      '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
      "</div>" +
      '<section class="ls-prompt-card"><p class="ls-prompt">' +
      (played ? "Which group is it?" : "Listen first, then tap a group.") +
      "</p></section>" +
      '<p class="ls-status ' + status.kind + '" aria-live="polite">' + esc(status.text) + "</p>" +
      '<div class="ls-btns">' + CATS.map(btnHtml).join("") + "</div>" +
      "</div></main>";
    bind();
  }

  function bind() {
    var p = document.getElementById("ls-play");
    if (p) p.onclick = function () { if (playing) { stopAudio(); renderPlay(); } else { play(); } };
    app.querySelectorAll(".ls-btn").forEach(function (b) {
      b.onclick = function () { answer(b.getAttribute("data-cat")); };
    });
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎧</div>' +
      "<h1>Listen and Sort</h1>" +
      '<p class="lc-intro-lede">Listen to each recording and tap Age, Height or Hair.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="ls-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the recording</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap <strong>Age</strong>, <strong>Height</strong> or <strong>Hair</strong></span></li>' +
      '<li><span class="tip-num">3</span><span>Right answers turn green. Wrong ones shake, so try again.</span></li>' +
      "</ol></section>";
    document.getElementById("ls-start").onclick = startGame;
  }

  function renderDone() {
    var stars = calcStars();
    var pct = scoredCount ? Math.round((score / scoredCount) * 100) : 0;
    var headline = stars === 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practising!";
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + pct + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + score + "</span>" +
      '<span class="lc-ring-of">of ' + scoredCount + "</span></div></div>" +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + headline + "</h1>" +
      "<p>" + mistakes + (mistakes === 1 ? " mistake." : " mistakes.") + "</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="ls-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("ls-again").onclick = startGame;
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
