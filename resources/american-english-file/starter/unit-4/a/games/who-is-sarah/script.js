/* Who is Sarah? · listening · Unit 4A
   Listen and decide: babysitter or family friend? */
(function () {
  "use strict";

  /* === Shared UI sound effects (Web Audio) === */
  (function () {
    if (window.__laUiSfx) return;
    var ctx = null;
    function getCtx() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume().catch(function () {});
      return ctx;
    }
    function tone(freq, dur, type, vol, when) {
      var c = getCtx();
      if (!c) return;
      var t0 = (when || 0) + c.currentTime;
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
    function sfxCorrect() {
      tone(523, 0.1, "sine", 0.12, 0);
      tone(659, 0.12, "sine", 0.12, 0.08);
      tone(784, 0.18, "sine", 0.1, 0.16);
    }
    function sfxWrong() {
      tone(220, 0.14, "sawtooth", 0.07, 0);
      tone(180, 0.18, "sawtooth", 0.06, 0.1);
    }
    function sfxCelebrate() {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone(f, 0.15, "sine", 0.1, i * 0.07);
      });
    }
    window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
    window.sfxTap = sfxTap;
    window.sfxCorrect = sfxCorrect;
    window.sfxWrong = sfxWrong;
    window.sfxCelebrate = sfxCelebrate;
  })();

  var GAME_ID = "starter-4a-who-is-sarah";
  var AUDIO_URL = "audio/conversation.mp3";

  var OPTIONS = [
    { id: "babysitter", label: "A babysitter", correct: true },
    { id: "friend", label: "A family friend", correct: false },
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var selected = null;
  var answered = false;
  var isCorrect = false;
  var audio = null;
  var playing = false;

  function sfx(name) {
    try {
      if (window.__laUiSfx && typeof window.__laUiSfx[name] === "function") window.__laUiSfx[name]();
    } catch (e) {}
  }

  function ensureAudio() {
    if (!audio) {
      audio = new Audio(AUDIO_URL);
      audio.preload = "auto";
      audio.addEventListener("ended", function () {
        playing = false;
        var btn = document.getElementById("ws-play");
        if (btn) btn.classList.remove("playing");
      });
      audio.addEventListener("error", function () {
        playing = false;
        var btn = document.getElementById("ws-play");
        if (btn) btn.classList.remove("playing");
      });
    }
    return audio;
  }

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    }
    playing = false;
  }

  function togglePlay() {
    sfx("tap");
    var a = ensureAudio();
    var btn = document.getElementById("ws-play");
    if (playing) {
      stopAudio();
      if (btn) btn.classList.remove("playing");
      return;
    }
    playing = true;
    if (btn) btn.classList.add("playing");
    var p = a.play();
    if (p && p.catch) {
      p.catch(function () {
        playing = false;
        if (btn) btn.classList.remove("playing");
      });
    }
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    selected = null;
    answered = false;
    isCorrect = false;
    stopAudio();
    phase = "play";
    render();
  }

  function checkAnswer() {
    if (answered || !selected) return;
    answered = true;
    var opt = OPTIONS.filter(function (o) { return o.id === selected; })[0];
    isCorrect = !!(opt && opt.correct);
    if (isCorrect) sfx("correct");
    else sfx("wrong");
    render();
  }

  function finish() {
    stopAudio();
    phase = "done";
    sfx("celebrate");
    var stars = isCorrect ? 3 : 0;
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      } catch (e) {}
    }
    if (window.LAFinish && LAFinish.show) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: isCorrect ? 1 : 0,
        total: 1,
        stars: stars,
        accuracy: isCorrect ? 100 : 0,
        timeMs: timeMs,
        onAgain: startGame,
        onModes: function () {
          phase = "start";
          render();
        },
        backHref: "../",
        save: true,
      });
      return;
    }
    render();
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<div class="ws-start">' +
        '<header class="ws-topbar">' +
        '<a class="ws-back" href="../" aria-label="Back">←</a>' +
        '<span class="ws-title">Starter · Unit 4A</span>' +
        '<span class="ws-badge">Listen</span></header>' +
        '<div class="ws-hero">' +
        '<div class="ws-hero-icon" aria-hidden="true">👂</div>' +
        "<h1>Who is Sarah?</h1>" +
        '<p class="ws-desc">Listen to the conversation. Is Sarah a babysitter or a family friend?</p>' +
        '<button type="button" class="ws-btn" id="ws-start">Start listening</button>' +
        "</div></div>";
      document.getElementById("ws-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        '<div class="ws-done">' +
        '<header class="ws-topbar">' +
        '<a class="ws-back" href="../" aria-label="Back">←</a>' +
        '<span class="ws-title">Who is Sarah?</span></header>' +
        '<div class="ws-hero">' +
        '<div class="ws-stars" aria-hidden="true">' +
        (isCorrect ? "★★★" : "☆☆☆") +
        "</div>" +
        "<h1>" + (isCorrect ? "Perfect!" : "Keep practising") + "</h1>" +
        '<p class="ws-desc">' +
        (isCorrect
          ? "Sarah is a babysitter."
          : "Sarah is a babysitter — listen again for clues.") +
        "</p>" +
        '<button type="button" class="ws-btn" id="ws-again">Play again</button>' +
        '<a class="ws-btn secondary" href="../">Back to games</a>' +
        "</div></div>";
      document.getElementById("ws-again").onclick = startGame;
      return;
    }

    // play
    var optsHtml = OPTIONS.map(function (o) {
      var cls = "ws-opt";
      if (answered) {
        if (o.correct) cls += " correct";
        else if (o.id === selected) cls += " wrong";
        else cls += " dim";
      } else if (o.id === selected) {
        cls += " selected";
      }
      return (
        '<button type="button" class="' + cls + '" data-id="' + o.id + '"' +
        (answered ? " disabled" : "") + ">" + o.label + "</button>"
      );
    }).join("");

    var feedback = "";
    if (answered) {
      feedback =
        '<p class="ws-feedback ' + (isCorrect ? "ok" : "bad") + '">' +
        (isCorrect
          ? "Correct! Sarah is a babysitter."
          : "Not quite — Sarah is a babysitter.") +
        "</p>";
    }

    app.innerHTML =
      '<div class="ws-play">' +
      '<header class="ws-topbar">' +
      '<a class="ws-back" href="../" aria-label="Back">←</a>' +
      '<span class="ws-title">Who is Sarah?</span>' +
      '<span class="ws-badge">Listen</span></header>' +
      '<p class="ws-question">Who is Sarah?</p>' +
      '<div class="ws-player">' +
      '<button type="button" class="ws-play-btn' + (playing ? " playing" : "") + '" id="ws-play" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<div class="ws-player-meta"><strong>Conversation</strong><span>Listen, then choose</span></div>' +
      "</div>" +
      '<div class="ws-options">' + optsHtml + "</div>" +
      feedback +
      '<div class="ws-actions">' +
      (!answered
        ? '<button type="button" class="ws-btn" id="ws-check"' + (selected ? "" : " disabled") + ">Check</button>"
        : '<button type="button" class="ws-btn" id="ws-next">Continue →</button>') +
      "</div></div>";

    document.getElementById("ws-play").onclick = togglePlay;
    var checkBtn = document.getElementById("ws-check");
    if (checkBtn) checkBtn.onclick = checkAnswer;
    var nextBtn = document.getElementById("ws-next");
    if (nextBtn) nextBtn.onclick = finish;

    app.querySelectorAll(".ws-opt").forEach(function (el) {
      el.onclick = function () {
        if (answered) return;
        selected = el.getAttribute("data-id");
        sfx("tap");
        render();
      };
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
