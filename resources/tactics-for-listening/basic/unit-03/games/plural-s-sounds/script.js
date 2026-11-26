/* Plural -s sounds · Tactics For Listening Basic Unit 3
 * Listen, then swipe the word card:
 *   ← left  = /s/
 *   → right = /z/
 *   ↑ up    = /ɪz/
 * Buttons also work for desktop / accessibility.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u3-plural-s-sounds";
  var GAME_NAME = "Plural -s sounds";
  var UNIT = "Unit 3 · Basic";
  var BACK = "../../";

  // sound codes: s | z | iz
  var ITEMS = [
    { word: "dresses", sound: "iz", audio: "https://cdn.imgurl.ir/uploads/f20510_.mp3" },
    { word: "hats", sound: "s", audio: "https://cdn.imgurl.ir/uploads/p494575_.mp3" },
    { word: "shoes", sound: "z", audio: "https://cdn.imgurl.ir/uploads/a412999_.mp3" },
    { word: "windbreakers", sound: "z", audio: "https://cdn.imgurl.ir/uploads/n2834_.mp3" },
    { word: "skirts", sound: "s", audio: "https://cdn.imgurl.ir/uploads/a21301_.mp3" },
    { word: "glasses", sound: "iz", audio: "https://cdn.imgurl.ir/uploads/s28632_.mp3" }
  ];

  var SOUND_LABEL = { s: "/s/", z: "/z/", iz: "/ɪz/" };
  var SOUND_DIR = { s: "left", z: "right", iz: "up" };
  var DIR_SOUND = { left: "s", right: "z", up: "iz" };

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var current = 0;
  var results = []; // true/false per item
  var busy = false;
  var playing = false;
  var played = false;
  var audioError = false;
  var audio = null;
  var playRecorded = false;
  var HAS_AUDIO = typeof window.Audio === "function";

  // swipe state
  var drag = null; // {x0,y0,x,y,el}

  var PLAY_ICON = '<span class="pss-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="pss-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="pss-play-alert" aria-hidden="true">!</span>';

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }

  function stopAudio() {
    playing = false;
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    }
  }

  function play() {
    if (!HAS_AUDIO || busy) return;
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
    if (p && p.catch) {
      p.catch(function () { playing = false; audioError = true; renderPlay(); });
    }
  }

  function setupGame() {
    results = [];
    current = 0;
    busy = false;
    played = false;
    audioError = false;
    stopAudio();
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
          unit: "basic-3",
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
    setupGame();
    playRecorded = false;
    phase = "play";
    render();
  }

  function answer(sound) {
    if (phase !== "play" || busy) return;
    busy = true;
    stopAudio();
    var ok = sound === ITEMS[current].sound;
    results[current] = ok;
    sfx(ok ? "correct" : "wrong");

    // fly animation class
    var card = document.getElementById("pss-card");
    if (card) {
      card.classList.remove("fly-left", "fly-right", "fly-up", "is-ok", "is-bad");
      card.classList.add(ok ? "is-ok" : "is-bad");
      card.classList.add(sound === "s" ? "fly-left" : sound === "z" ? "fly-right" : "fly-up");
    }

    // highlight zone
    document.querySelectorAll(".pss-zone").forEach(function (z) {
      z.classList.remove("is-target", "is-hit-ok", "is-hit-bad");
      if (z.getAttribute("data-sound") === sound) {
        z.classList.add(ok ? "is-hit-ok" : "is-hit-bad");
      }
    });

    setTimeout(function () {
      if (current + 1 >= TOTAL) {
        finish();
        return;
      }
      current++;
      busy = false;
      played = false;
      audioError = false;
      renderPlay();
    }, 700);
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
      '<div class="lc-seg" role="img" aria-label="Word ' + (current + 1) + " of " + TOTAL + '">' +
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
    if (played) return "Play again";
    return "Play the recording";
  }

  /* ---------- swipe handlers ---------- */
  function bindCardSwipe(card) {
    if (!card) return;

    function start(x, y) {
      if (busy) return;
      drag = { x0: x, y0: y, x: x, y: y };
      card.classList.add("is-dragging");
    }
    function move(x, y) {
      if (!drag || busy) return;
      drag.x = x;
      drag.y = y;
      var dx = x - drag.x0;
      var dy = y - drag.y0;
      var rot = dx * 0.06;
      card.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + rot + "deg)";

      // zone highlight
      var dir = dominantDir(dx, dy, 40);
      document.querySelectorAll(".pss-zone").forEach(function (z) {
        z.classList.toggle("is-target", dir && z.getAttribute("data-dir") === dir);
      });
    }
    function end() {
      if (!drag || busy) return;
      var dx = drag.x - drag.x0;
      var dy = drag.y - drag.y0;
      card.classList.remove("is-dragging");
      card.style.transform = "";
      document.querySelectorAll(".pss-zone").forEach(function (z) {
        z.classList.remove("is-target");
      });
      var dir = dominantDir(dx, dy, 70);
      drag = null;
      if (dir) answer(DIR_SOUND[dir]);
    }

    function dominantDir(dx, dy, threshold) {
      var ax = Math.abs(dx);
      var ay = Math.abs(dy);
      if (ax < threshold && ay < threshold) return null;
      // prefer the larger movement
      if (ay > ax && dy < -threshold) return "up";
      if (ax >= ay && dx < -threshold) return "left";
      if (ax >= ay && dx > threshold) return "right";
      if (ay > ax && dy < 0) return "up"; // still up if mostly vertical up
      return null;
    }

    // pointer events (covers mouse + touch)
    card.addEventListener("pointerdown", function (e) {
      if (e.button && e.button !== 0) return;
      card.setPointerCapture(e.pointerId);
      start(e.clientX, e.clientY);
    });
    card.addEventListener("pointermove", function (e) {
      if (!drag) return;
      move(e.clientX, e.clientY);
    });
    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", function () {
      if (!drag) return;
      drag = null;
      card.classList.remove("is-dragging");
      card.style.transform = "";
      document.querySelectorAll(".pss-zone").forEach(function (z) {
        z.classList.remove("is-target");
      });
    });
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🔊</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Listen to each plural word. Swipe the card to the sound you hear: <strong>/s/</strong>, <strong>/z/</strong>, or <strong>/ɪz/</strong>.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="pss-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">←</span><span>Swipe <strong>left</strong> for <strong>/s/</strong></span></li>' +
      '<li><span class="tip-num">→</span><span>Swipe <strong>right</strong> for <strong>/z/</strong></span></li>' +
      '<li><span class="tip-num">↑</span><span>Swipe <strong>up</strong> for <strong>/ɪz/</strong></span></li>' +
      "</ol></section>";
    document.getElementById("pss-start").onclick = startGame;
  }

  function renderPlay() {
    var it = ITEMS[current];
    var counter = (current + 1) + " / " + TOTAL;
    var playCls = "pss-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<div class="pss-main">' +
        '<div class="pss-listen">' +
          '<button type="button" class="' + playCls + '" id="pss-replay" aria-label="' + esc(playLabel()) + '">' +
            playIcon() +
          "</button>" +
          '<div class="pss-listen-text">' +
            '<p class="pss-listen-title">' + esc(playLabel()) + "</p>" +
            '<p class="pss-listen-sub">Word ' + (current + 1) + " of " + TOTAL + "</p>" +
          "</div>" +
        "</div>" +

        '<div class="pss-arena">' +
          '<div class="pss-zone pss-zone-up" data-sound="iz" data-dir="up">' +
            '<span class="pss-zone-arrow">↑</span>' +
            '<span class="pss-zone-label">/ɪz/</span>' +
          "</div>" +
          '<div class="pss-mid">' +
            '<div class="pss-zone pss-zone-left" data-sound="s" data-dir="left">' +
              '<span class="pss-zone-arrow">←</span>' +
              '<span class="pss-zone-label">/s/</span>' +
            "</div>" +
            '<div class="pss-card" id="pss-card" role="button" tabindex="0" aria-label="Swipe ' + esc(it.word) + '">' +
              '<span class="pss-card-word">' + esc(it.word) + "</span>" +
              '<span class="pss-card-hint">swipe ←  →  ↑</span>' +
            "</div>" +
            '<div class="pss-zone pss-zone-right" data-sound="z" data-dir="right">' +
              '<span class="pss-zone-arrow">→</span>' +
              '<span class="pss-zone-label">/z/</span>' +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="pss-buttons" role="group" aria-label="Choose sound">' +
          '<button type="button" class="pss-btn" data-sound="s"><span class="pss-btn-dir">←</span> /s/</button>' +
          '<button type="button" class="pss-btn" data-sound="iz"><span class="pss-btn-dir">↑</span> /ɪz/</button>' +
          '<button type="button" class="pss-btn" data-sound="z"><span class="pss-btn-dir">→</span> /z/</button>' +
        "</div>" +
        '<p class="pss-tip">Listen first, then swipe the card or tap a sound.</p>' +
      "</div>";

    var replay = document.getElementById("pss-replay");
    if (replay) {
      replay.onclick = function () {
        if (playing) { stopAudio(); renderPlay(); }
        else play();
      };
    }

    var card = document.getElementById("pss-card");
    bindCardSwipe(card);

    app.querySelectorAll(".pss-btn").forEach(function (btn) {
      btn.onclick = function () {
        answer(btn.getAttribute("data-sound"));
      };
    });

    // also allow tapping zones
    app.querySelectorAll(".pss-zone").forEach(function (z) {
      z.onclick = function () {
        answer(z.getAttribute("data-sound"));
      };
    });
  }

  function renderDone() {
    var s = score();
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + s + " of " + TOTAL + " correct</h1>" +
      '<p class="lc-intro-lede">Remember: /s/ after voiceless sounds, /z/ after voiced, /ɪz/ after /s, z, ʃ, ʒ, tʃ, dʒ/.</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="pss-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 3</a>' +
      "</div></div></section>";
    document.getElementById("pss-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play" || busy) return;
    var k = e.key.toLowerCase();
    if (k === " " || k === "r") {
      e.preventDefault();
      if (playing) { stopAudio(); renderPlay(); }
      else play();
      return;
    }
    if (k === "arrowleft" || k === "a") { e.preventDefault(); answer("s"); }
    if (k === "arrowright" || k === "d") { e.preventDefault(); answer("z"); }
    if (k === "arrowup" || k === "w") { e.preventDefault(); answer("iz"); }
  });

  render();
})();
