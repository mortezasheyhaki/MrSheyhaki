/* Listen & Write · Unit 5A
   Listen to breakfast sentences and type them.
   Style matched to Sentence Builder / Sentence Unscramble */
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
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

var GAME_ID = "starter-5a-breakfast-listen-write";

  var ITEMS = [
    {
      sentence: "I have a croissant and coffee.",
      audio: "https://cdn.imgurl.ir/uploads/g702134_I_have_a_crossiant_and_coffee.mp3"
    },
    {
      sentence: "I have breakfast at home.",
      audio: "https://cdn.imgurl.ir/uploads/k31529_I_have_breakfast_at_home.mp3"
    },
    {
      sentence: "I don't eat in the morning.",
      audio: "https://cdn.imgurl.ir/uploads/v175209_I_dont__in_the_morning.mp3"
    },
    {
      sentence: "I really like breakfast.",
      audio: "https://cdn.imgurl.ir/uploads/q682732_I_really_like_breakfast.mp3"
    },
    {
      sentence: "I have breakfast at home with my family.",
      audio: "https://cdn.imgurl.ir/uploads/53825_I_have_breakfast_at_home_with_my_family.mp3"
    },
    {
      sentence: "We have rice, fish and miso soup.",
      audio: "https://cdn.imgurl.ir/uploads/x235164_We_have_rice_fish_and_miso_soup.mp3"
    },
    {
      sentence: "We don't drink coffee.",
      audio: "https://cdn.imgurl.ir/uploads/z748713_We_don39t_drink_coffee.mp3"
    }
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | done
  var index = 0;
  var score = 0;
  var locked = false;
  var currentAudio = null;
  var sfxCtx = null;

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[?.!,;:]+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getSfxCtx() {
    if (!sfxCtx) {
      try {
        sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }

  function tone(freq, start, dur, type, gain) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.1, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  function sfxOk() {
    try {
      if (window.LASfx && LASfx.correct) LASfx.correct();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.09, "triangle", 0.12);
    tone(659.25, t + 0.07, 0.1, "triangle", 0.12);
    tone(783.99, t + 0.14, 0.14, "sine", 0.1);
  }

  function sfxBad() {
    try {
      if (window.LASfx && LASfx.wrong) LASfx.wrong();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(200, ctx.currentTime, 0.12, "sawtooth", 0.06);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lw-play-btn.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playAudio() {
    var item = ITEMS[index];
    if (!item) return;
    stopAudio();
    var a = new Audio(item.audio);
    currentAudio = a;
    var btn = app.querySelector(".lw-play-btn");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    index = 0;
    score = 0;
    phase = "play";
    locked = false;
    startRound();
  }

  function startRound() {
    if (index >= TOTAL) {
      finishGame();
      return;
    }
    locked = false;
    stopAudio();
    render();
    // Auto-play on each new sentence
    setTimeout(function () {
      playAudio();
    }, 250);
  }

  function checkAnswer() {
    if (locked) return;
    var input = document.getElementById("lw-input");
    if (!input) return;
    var user = normalize(input.value);
    if (!user) return;

    locked = true;
    var correct = normalize(ITEMS[index].sentence);
    var ok = user === correct;

    // Allow common variants: don't / do not, etc.
    if (!ok) { try{sfxWrong();}catch(e){}
      var alt = correct
        .replace(/don't/g, "do not")
        .replace(/doesn't/g, "does not");
      var userAlt = user
        .replace(/don't/g, "do not")
        .replace(/doesn't/g, "does not");
      if (userAlt === alt || user === alt || userAlt === correct) ok = true;
    }

    input.classList.remove("correct", "wrong");
    input.classList.add(ok ? "correct" : "wrong");
    input.readOnly = true;

    var checkBtn = document.getElementById("lw-check");
    if (checkBtn) checkBtn.disabled = true;

    var fb = document.getElementById("lw-fb");
    if (ok) { try{sfxCorrect();}catch(e){}
      sfxOk();
      score++;
      if (fb) {
        fb.textContent = "Perfect!";
        fb.className = "lw-fb ok";
      }
      setTimeout(function () {
        index++;
        startRound();
      }, 900);
    } else {
      sfxBad();
      if (fb) {
        fb.innerHTML =
          'Not quite. <span class="lw-answer-reveal" style="display:block;margin-top:10px;">' +
          escapeHtml(ITEMS[index].sentence) +
          "</span>";
        fb.className = "lw-fb bad";
      }
      // Show next after a moment so they can read the answer
      setTimeout(function () {
        var actions = document.getElementById("lw-actions");
        if (actions) {
          actions.innerHTML =
            '<button type="button" class="lw-btn lw-btn-primary" id="lw-next" style="width:100%;">Next →</button>';
          document.getElementById("lw-next").onclick = function () {
            index++;
            startRound();
          };
        }
      }, 400);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function progressPct() {
    return Math.round((index / TOTAL) * 100);
  }

  function finishGame() {
    phase = "done";
    stopAudio();
    var timeMs = 0;
    try {
      if (window.LAFinish && LAFinish.stopTimer) timeMs = LAFinish.stopTimer();
    } catch (_) {}
    if (window.LAFinish) {
      try {
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          stars: score >= TOTAL ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0,
          timeMs: timeMs,
          onAgain: function () {
            startGame();
          },
          backHref: "../"
        });
      } catch (_) {}
    }
    render();
  }

  function render() {
    if (phase === "start") {
      stopAudio();
      app.innerHTML =
        '<div class="lw-top">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        "</div>" +
        '<div class="lw-start">' +
        '<div class="lw-hero" aria-hidden="true">✍️</div>' +
        "<h1>Listen & Write</h1>" +
        "<p>Listen to each breakfast sentence and type what you hear.</p>" +
        '<button type="button" class="lw-btn lw-btn-primary" id="lw-start" style="max-width:280px;width:100%;margin:0 auto;display:block;">Start</button>' +
        "</div>";
      document.getElementById("lw-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      var stars = score >= TOTAL ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
      var title =
        stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep practicing!";
      app.innerHTML =
        '<div class="lw-top">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        "</div>" +
        '<div class="lw-start">' +
        "<h1>" +
        title +
        "</h1>" +
        "<p>You wrote <strong>" +
        score +
        "</strong> of " +
        TOTAL +
        " sentences correctly.</p>" +
        '<button type="button" class="lw-btn lw-btn-primary" id="lw-again" style="max-width:280px;width:100%;margin:0 auto;display:block;">Play again</button>' +
        "</div>";
      document.getElementById("lw-again").onclick = startGame;
      return;
    }

    // play phase
    app.innerHTML =
      '<div class="lw-top">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<div class="lw-progress"><span style="width:' +
      progressPct() +
      '%"></span></div>' +
      '<span class="lw-mode-tag">' +
      (index + 1) +
      " / " +
      TOTAL +
      "</span>" +
      "</div>" +
      '<div class="lw-play">' +
      '<div class="lw-phase">Sentence ' +
      (index + 1) +
      "</div>" +
      '<div class="lw-prompt">' +
      '<div class="lw-prompt-label">Listen, then type the sentence</div>' +
      '<button type="button" class="lw-play-btn" id="lw-play" aria-label="Play audio">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<span class="eq"><span></span><span></span><span></span><span></span></span>' +
      "</button>" +
      "</div>" +
      '<div class="lw-input-wrap">' +
      '<input type="text" class="lw-input" id="lw-input" placeholder="Type what you hear…" autocomplete="off" autocapitalize="off" spellcheck="false" />' +
      "</div>" +
      '<div class="lw-actions" id="lw-actions">' +
      '<button type="button" class="lw-btn lw-btn-ghost" id="lw-replay">Replay</button>' +
      '<button type="button" class="lw-btn lw-btn-primary" id="lw-check">Check ✓</button>' +
      "</div>" +
      '<div class="lw-fb" id="lw-fb" aria-live="polite"></div>' +
      "</div>";

    document.getElementById("lw-play").onclick = playAudio;
    document.getElementById("lw-replay").onclick = playAudio;
    document.getElementById("lw-check").onclick = checkAnswer;

    var input = document.getElementById("lw-input");
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    setTimeout(function () {
      input.focus();
    }, 300);
  }

  render();
})();
