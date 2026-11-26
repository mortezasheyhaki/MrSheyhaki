/* Listening for times · Tactics For Listening Basic Unit 4
 * Listen and set each digital clock (type or +/- buttons).
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u4-listening-for-times";
  var GAME_NAME = "Listening for times";
  var UNIT = "Unit 4 · Basic";
  var BACK = "../../";

  var ITEMS = [
    { h: 10, m: 15, audio: "https://cdn.imgurl.ir/uploads/a6646_.mp3" },
    { h: 2, m: 10, audio: "https://cdn.imgurl.ir/uploads/w87606_.mp3" },
    { h: 12, m: 0, audio: "https://cdn.imgurl.ir/uploads/x936927_.mp3" },
    { h: 11, m: 30, audio: "https://cdn.imgurl.ir/uploads/o872551_.mp3" },
    { h: 3, m: 45, audio: "https://cdn.imgurl.ir/uploads/y085171_.mp3" },
    { h: 7, m: 50, audio: "https://cdn.imgurl.ir/uploads/b30892_.mp3" }
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var current = 0;
  var hour = 12;
  var minute = 0;
  var checked = false;
  var results = [];
  var playing = false;
  var audioError = false;
  var audio = null;
  var playRecorded = false;
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="lft-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="lft-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="lft-play-alert" aria-hidden="true">!</span>';

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function pad2(n) {
    n = Math.abs(parseInt(n, 10) || 0);
    return (n < 10 ? "0" : "") + n;
  }
  function normHour(h) {
    h = parseInt(h, 10);
    if (isNaN(h)) return 12;
    h = ((h % 12) + 12) % 12;
    return h === 0 ? 12 : h;
  }
  function normMin(m) {
    m = parseInt(m, 10);
    if (isNaN(m)) return 0;
    return ((m % 60) + 60) % 60;
  }

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
    audio = new Audio(ITEMS[current].audio);
    audio.preload = "auto";
    playing = true;
    renderPlay();
    audio.onended = function () { playing = false; renderPlay(); };
    audio.onerror = function () { playing = false; audioError = true; renderPlay(); };
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () { playing = false; audioError = true; renderPlay(); });
    }
  }

  function score() {
    var n = 0;
    for (var i = 0; i < results.length; i++) if (results[i]) n++;
    return n;
  }

  function calcStars() {
    var s = score();
    if (s >= TOTAL) return 3;
    if (s >= 4) return 2;
    if (s >= 3) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: GAME_NAME,
          category: "tactics-for-listening",
          unit: "basic-4",
          score: score(),
          maxScore: TOTAL,
          accuracy: Math.round((score() / TOTAL) * 100),
          completed: true,
          stars: stars
        });
      }
    } catch (e) {}
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    current = 0;
    hour = 12;
    minute = 0;
    checked = false;
    results = [];
    playRecorded = false;
    stopAudio();
    phase = "play";
    render();
  }

  function bumpHour(d) {
    if (checked) return;
    hour = normHour(hour + d);
    syncInputs();
  }
  function bumpMin(d) {
    if (checked) return;
    minute = normMin(minute + d);
    // step by 5 when using buttons feels natural for this activity
    syncInputs();
  }

  function syncInputs() {
    var hi = document.getElementById("lft-h");
    var mi = document.getElementById("lft-m");
    if (hi) hi.value = pad2(hour);
    if (mi) mi.value = pad2(minute);
    var face = document.getElementById("lft-face-time");
    if (face) face.textContent = pad2(hour) + ":" + pad2(minute);
  }

  function readInputs() {
    var hi = document.getElementById("lft-h");
    var mi = document.getElementById("lft-m");
    if (hi) {
      var hv = parseInt(hi.value, 10);
      if (!isNaN(hv)) hour = normHour(hv);
    }
    if (mi) {
      var mv = parseInt(mi.value, 10);
      if (!isNaN(mv)) minute = normMin(mv);
    }
  }

  function checkAnswer() {
    if (checked) return;
    readInputs();
    checked = true;
    var it = ITEMS[current];
    // Accept 0 and 12 as equivalent for midnight/noon style if answer is 12
    var okH = hour === it.h || (it.h === 12 && hour === 0) || (it.h === 0 && hour === 12);
    var ok = okH && minute === it.m;
    results[current] = ok;
    sfx(ok ? "correct" : "wrong");
    stopAudio();
    renderPlay();
  }

  function next() {
    if (!checked) return;
    if (current + 1 >= TOTAL) {
      finish();
      return;
    }
    current++;
    hour = 12;
    minute = 0;
    checked = false;
    audioError = false;
    stopAudio();
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
        gameId: GAME_ID,
        score: score(),
        total: TOTAL,
        stars: stars,
        accuracy: Math.round((score() / TOTAL) * 100),
        timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK,
        save: false
      });
      return;
    }
    render();
  }

  function topBar(counter) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
      "<strong>" + esc(GAME_NAME) + "</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Clock ' + (current + 1) + " of " + TOTAL + '">' +
      ITEMS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        if (i < results.length) cls = results[i] ? "is-right" : "is-wrong";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function playIcon() {
    if (audioError) return ALERT_ICON;
    if (playing) return BARS_ICON;
    return PLAY_ICON;
  }
  function playLabel() {
    if (audioError) return "Audio unavailable";
    if (playing) return "Playing…";
    return "Play the recording";
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">⏰</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Listen to each person. Set the time on the clock by typing or using the buttons.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="lft-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the time</span></li>' +
      '<li><span class="tip-num">2</span><span>Set the clock with <strong>+ / −</strong> or type</span></li>' +
      '<li><span class="tip-num">3</span><span><strong>6</strong> clocks to complete</span></li>' +
      "</ol></section>";
    document.getElementById("lft-start").onclick = startGame;
  }

  function renderPlay() {
    var it = ITEMS[current];
    var counter = (current + 1) + " / " + TOTAL;
    var last = current + 1 >= TOTAL;
    var playCls = "lft-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var clockCls = "lft-clock" + (checked ? (results[current] ? " is-ok" : " is-bad") : "");

    var answerHint = "";
    if (checked && !results[current]) {
      answerHint =
        '<p class="lft-answer">Correct time: <strong>' +
        pad2(it.h) + ":" + pad2(it.m) + "</strong></p>";
    }

    var foot;
    if (!checked) {
      foot =
        '<div class="lft-foot">' +
        '<span class="lft-foot-text">Listen, then set the time.</span>' +
        '<button type="button" class="lft-next" id="lft-check">Check ✓</button></div>';
    } else {
      var ok = results[current];
      foot =
        '<div class="lft-foot">' +
        '<span class="lft-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' +
        (ok ? "Correct!" : "Not quite.") + "</span>" +
        '<button type="button" class="lft-next" id="lft-next">' +
        (last ? "See results →" : "Next →") + "</button></div>";
    }

    var disabled = checked ? " disabled" : "";

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<div class="lft-main">' +
        '<div class="lft-listen">' +
          '<button type="button" class="' + playCls + '" id="lft-replay" aria-label="' + esc(playLabel()) + '">' +
            playIcon() +
          "</button>" +
          '<div class="lft-listen-text">' +
            '<p class="lft-listen-title">' + esc(playLabel()) + "</p>" +
            '<p class="lft-listen-sub">Clock ' + (current + 1) + " of " + TOTAL + "</p>" +
          "</div>" +
        "</div>" +

        '<div class="' + clockCls + '">' +
          '<div class="lft-alarm" aria-hidden="true">' +
            '<span class="lft-alarm-top"></span>' +
            '<div class="lft-alarm-face">' +
              '<span class="lft-face-time" id="lft-face-time">' + pad2(hour) + ":" + pad2(minute) + "</span>" +
            "</div>" +
          "</div>" +

          '<div class="lft-controls">' +
            '<div class="lft-col">' +
              '<button type="button" class="lft-bump" data-part="h" data-dir="1"' + disabled + ' aria-label="Hour up">▲</button>' +
              '<input type="number" class="lft-input" id="lft-h" min="1" max="12" inputmode="numeric" value="' + pad2(hour) + '"' + disabled + ' aria-label="Hour">' +
              '<button type="button" class="lft-bump" data-part="h" data-dir="-1"' + disabled + ' aria-label="Hour down">▼</button>' +
              '<span class="lft-col-label">Hour</span>' +
            "</div>" +
            '<span class="lft-colon" aria-hidden="true">:</span>' +
            '<div class="lft-col">' +
              '<button type="button" class="lft-bump" data-part="m" data-dir="5"' + disabled + ' aria-label="Minute up">▲</button>' +
              '<input type="number" class="lft-input" id="lft-m" min="0" max="59" inputmode="numeric" value="' + pad2(minute) + '"' + disabled + ' aria-label="Minute">' +
              '<button type="button" class="lft-bump" data-part="m" data-dir="-5"' + disabled + ' aria-label="Minute down">▼</button>' +
              '<span class="lft-col-label">Min</span>' +
            "</div>" +
          "</div>" +
          answerHint +
        "</div>" +

        foot +
      "</div>";

    var replay = document.getElementById("lft-replay");
    if (replay) {
      replay.onclick = function () {
        if (playing) { stopAudio(); renderPlay(); }
        else play();
      };
    }

    app.querySelectorAll(".lft-bump").forEach(function (btn) {
      btn.onclick = function () {
        if (checked) return;
        var part = btn.getAttribute("data-part");
        var dir = parseInt(btn.getAttribute("data-dir"), 10);
        if (part === "h") bumpHour(dir);
        else bumpMin(dir);
      };
    });

    var hi = document.getElementById("lft-h");
    var mi = document.getElementById("lft-m");
    function onType() {
      if (checked) return;
      readInputs();
      var face = document.getElementById("lft-face-time");
      if (face) face.textContent = pad2(hour) + ":" + pad2(minute);
    }
    if (hi) {
      hi.addEventListener("input", onType);
      hi.addEventListener("change", function () {
        hour = normHour(hi.value);
        hi.value = pad2(hour);
        onType();
      });
    }
    if (mi) {
      mi.addEventListener("input", onType);
      mi.addEventListener("change", function () {
        minute = normMin(mi.value);
        mi.value = pad2(minute);
        onType();
      });
    }

    var checkBtn = document.getElementById("lft-check");
    if (checkBtn) checkBtn.onclick = checkAnswer;
    var nextBtn = document.getElementById("lft-next");
    if (nextBtn) nextBtn.onclick = next;
  }

  function renderDone() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score() + " of " + TOTAL + " correct</h1>" +
      '<p class="lc-intro-lede">Answers: 10:15 · 2:10 · 12:00 · 11:30 · 3:45 · 7:50</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="lft-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 4</a>' +
      "</div></div></section>";
    document.getElementById("lft-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play") return;
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    var k = e.key.toLowerCase();
    if (k === " " || k === "r") {
      e.preventDefault();
      if (playing) { stopAudio(); renderPlay(); }
      else play();
    }
    if (k === "enter") {
      e.preventDefault();
      if (!checked) checkAnswer();
      else next();
    }
    if (!checked) {
      if (k === "arrowup") { e.preventDefault(); bumpMin(5); }
      if (k === "arrowdown") { e.preventDefault(); bumpMin(-5); }
      if (k === "arrowleft") { e.preventDefault(); bumpHour(-1); }
      if (k === "arrowright") { e.preventDefault(); bumpHour(1); }
    }
  });

  render();
})();
