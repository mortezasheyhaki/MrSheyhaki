/* Is Sarah a good babysitter? · listening · Unit 4A
   Answer: No, she isn't. (pizza & TV against mother's rules) */
(function () {

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
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();


  const GAME_ID = "starter-4a-good-babysitter";
  const AUDIO_URL = "audio/conversation.mp3";

  const OPTIONS = [
    { id: "yes", label: "Yes, she is.", correct: false },
    { id: "no", label: "No, she isn't.", correct: true },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let selected = null;
  let answered = false;
  let correct = false;
  let audio = null;
  let playing = false;

  function ensureAudio() {
    if (!audio) {
      audio = new Audio(AUDIO_URL);
      audio.preload = "auto";
      audio.addEventListener("ended", function () {
        playing = false;
        var btn = document.getElementById("gb-play");
        if (btn) btn.classList.remove("playing");
      });
      audio.addEventListener("error", function () {
        playing = false;
        var btn = document.getElementById("gb-play");
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
      } catch (_) {}
    }
    playing = false;
    var btn = document.getElementById("gb-play");
    if (btn) btn.classList.remove("playing");
  }

  function togglePlay() {
    var a = ensureAudio();
    var btn = document.getElementById("gb-play");
    if (playing) {
      a.pause();
      playing = false;
      if (btn) btn.classList.remove("playing");
      return;
    }
    a.play()
      .then(function () {
        playing = true;
        if (btn) btn.classList.add("playing");
      })
      .catch(function () {
        playing = false;
        if (btn) btn.classList.remove("playing");
      });
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    selected = null;
    answered = false;
    correct = false;
    stopAudio();
    phase = "play";
    render();
  }

  function checkAnswer() {
    if (answered || !selected) return;
    answered = true;
    var choice = OPTIONS.find(function (c) {
      return c.id === selected;
    });
    correct = !!(choice && choice.correct);
    saveStars(correct ? 3 : 1);

    app.querySelectorAll(".gb-opt").forEach(function (el) {
      var id = el.dataset.id;
      var c = OPTIONS.find(function (x) {
        return x.id === id;
      });
      if (c && c.correct) el.classList.add("correct");
      if (id === selected && !c.correct) el.classList.add("wrong");
      el.disabled = true;
    });

    var fb = document.getElementById("gb-feedback");
    if (fb) {
      fb.textContent = correct
        ? "Correct! She isn't a good babysitter."
        : "Not quite — she isn't a good babysitter.";
      fb.className = "gb-feedback " + (correct ? "ok" : "bad");
    }

    var checkBtn = document.getElementById("gb-check");
    if (checkBtn) checkBtn.style.display = "none";
    var nextBtn = document.getElementById("gb-done-btn");
    if (nextBtn) nextBtn.style.display = "";
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="gb-topbar">' +
        '<a class="gb-back" href="../" aria-label="Back">←</a>' +
        '<span class="gb-title">Good babysitter?</span>' +
        '<span class="gb-badge">4A</span></header>' +
        '<section class="gb-start">' +
        '<div class="gb-hero" aria-hidden="true">🎧</div>' +
        "<h1>Is Sarah a good babysitter?</h1>" +
        '<p class="gb-desc">Listen to the conversation. Then choose the correct answer.</p>' +
        '<button type="button" class="gb-btn" id="gb-start">Start</button></section>';
      document.getElementById("gb-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: 0,
          total: 10,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; if (typeof render === 'function') render(); else location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

      var stars = correct ? 3 : 1;
      app.innerHTML =
        '<header class="gb-topbar">' +
        '<a class="gb-back" href="../" aria-label="Back">←</a>' +
        '<span class="gb-title">Good babysitter?</span>' +
        '<span class="gb-badge">Done</span></header>' +
        '<section class="gb-done">' +
        '<div class="gb-stars" aria-hidden="true">' +
        "★".repeat(stars) +
        "☆".repeat(3 - stars) +
        "</div>" +
        "<h1>" +
        (correct ? "Well done!" : "Almost!") +
        "</h1>" +
        '<p class="gb-desc">' +
        (correct
          ? "Sarah wants pizza and TV — but Mom said no."
          : "Listen again — Sarah ignores the mother's rules.") +
        "</p>" +
        '<button type="button" class="gb-btn" id="gb-again">Play again</button>' +
        '<button type="button" class="gb-btn secondary" id="gb-menu">Back to start</button></section>';
      document.getElementById("gb-again").onclick = startGame;
      document.getElementById("gb-menu").onclick = function () {
        stopAudio();
        phase = "menu";
        render();
      };
      return;
    }

    var opts = OPTIONS.map(function (c) {
      return (
        '<button type="button" class="gb-opt" data-id="' +
        c.id +
        '">' +
        c.label +
        "</button>"
      );
    }).join("");

    app.innerHTML =
      '<header class="gb-topbar">' +
      '<a class="gb-back" href="../" aria-label="Back">←</a>' +
      '<span class="gb-title">Good babysitter?</span>' +
      '<span class="gb-badge">Listen</span></header>' +
      '<div class="gb-play">' +
      '<p class="gb-question">Is Sarah a good babysitter?</p>' +
      '<div class="gb-player">' +
      '<button type="button" class="gb-play-btn" id="gb-play" aria-label="Play">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<div class="gb-player-meta">' +
      "<strong>Conversation</strong>" +
      "<span>Listen, then choose below</span>" +
      "</div></div>" +
      '<div class="gb-options">' +
      opts +
      "</div>" +
      '<p class="gb-feedback" id="gb-feedback"></p>' +
      '<div class="gb-actions">' +
      '<button type="button" class="gb-btn" id="gb-check" disabled>Check</button>' +
      '<button type="button" class="gb-btn secondary" id="gb-done-btn" style="display:none">Continue</button>' +
      "</div></div>";

    document.getElementById("gb-play").onclick = togglePlay;
    document.getElementById("gb-check").onclick = checkAnswer;
    document.getElementById("gb-done-btn").onclick = function () {
      stopAudio();
      phase = "done";
      render();
    };

    app.querySelectorAll(".gb-opt").forEach(function (el) {
      el.onclick = function () {
        if (answered) return;
        selected = el.dataset.id;
        app.querySelectorAll(".gb-opt").forEach(function (c) {
          c.classList.toggle("selected", c.dataset.id === selected);
        });
        document.getElementById("gb-check").disabled = false;
      };
    });
  }

  render();
})();
