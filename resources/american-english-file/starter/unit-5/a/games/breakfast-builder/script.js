/* Breakfast Builder · AND · OR · BUT · AEF Starter Unit 5A */
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
  })();

  var GAME_ID = "starter-5a-breakfast-builder";

  var ROUND1 = [
    { sentence: "I have cereal ___ milk.", answer: "AND", explain: "AND adds two things." },
    { sentence: "Do you want tea ___ coffee?", answer: "OR", explain: "OR gives a choice." },
    { sentence: "I like fruit ___ I don't like vegetables.", answer: "BUT", explain: "BUT shows a contrast." },
    { sentence: "I have an apple ___ an orange.", answer: "OR", explain: "OR gives a choice." },
    { sentence: "I have bread ___ cheese.", answer: "AND", explain: "AND adds two things." },
    { sentence: "I like coffee ___ I don't like tea.", answer: "BUT", explain: "BUT shows a contrast." },
    { sentence: "I have milk ___ cereal for breakfast.", answer: "AND", explain: "AND adds two things." },
    { sentence: "Do you want an apple ___ a banana?", answer: "OR", explain: "OR gives a choice." }
  ];

  var ROUND2 = [
    { situation: "Choose ONE drink:", sentence: "milk ___ orange juice", answer: "OR", explain: "OR = a choice between two things." },
    { situation: "I eat both:", sentence: "I have bread ___ cheese.", answer: "AND", explain: "AND = two things together." },
    { situation: "Different ideas:", sentence: "I like fruit ___ I don't like eggs.", answer: "BUT", explain: "BUT shows contrast." },
    { situation: "Choose ONE fruit:", sentence: "an apple ___ a banana", answer: "OR", explain: "OR = a choice." },
    { situation: "Two foods together:", sentence: "I have cereal ___ milk.", answer: "AND", explain: "AND adds two things." },
    { situation: "Contrast:", sentence: "I like coffee ___ I don't like tea.", answer: "BUT", explain: "BUT shows different ideas." },
    { situation: "Choose ONE drink:", sentence: "tea ___ coffee", answer: "OR", explain: "OR = a choice." },
    { situation: "I eat both:", sentence: "I have eggs ___ bread.", answer: "AND", explain: "AND adds two things." }
  ];

  var ROUND3 = [
    { sentence: "I have cereal ___ milk.", answer: "AND", explain: "AND adds two things.", foods: ["🥣 cereal", "🥛 milk"] },
    { sentence: "I have tea ___ coffee.", answer: "OR", explain: "OR gives a choice.", foods: ["🍵 tea", "☕ coffee"] },
    { sentence: "I like eggs ___ I don't like cheese.", answer: "BUT", explain: "BUT shows contrast.", foods: ["🥚 eggs", "🧀 cheese"] },
    { sentence: "I have an apple ___ an orange.", answer: "OR", explain: "OR gives a choice.", foods: ["🍎 apple", "🍊 orange"] },
    { sentence: "I have bread ___ cheese.", answer: "AND", explain: "AND adds two things.", foods: ["🍞 bread", "🧀 cheese"] },
    { sentence: "I like fruit ___ I don't like vegetables.", answer: "BUT", explain: "BUT shows contrast.", foods: ["🍎 fruit"] },
    { sentence: "Do you want milk ___ orange juice?", answer: "OR", explain: "OR gives a choice.", foods: ["🥛 milk", "🧃 orange juice"] },
    { sentence: "I have banana ___ cereal.", answer: "AND", explain: "AND adds two things.", foods: ["🍌 banana", "🥣 cereal"] }
  ];

  var CHARACTERS = {
    marcos: { emoji: "🧔", name: "Marcos", line: "Let's make a healthy breakfast!" },
    emma:   { emoji: "👩", name: "Emma",   line: "What do you want to drink?" },
    alex:   { emoji: "🧑", name: "Alex",   line: "I like some foods, but not others!" }
  };

  var app = document.getElementById("game-app");
  if (!app) return;

  var state = {
    phase: "start",
    score: 0,
    combo: 0,
    bestCombo: 0,
    correct: 0,
    total: 0,
    round: 1,
    qIndex: 0,
    questions: [],
    locked: false,
    timeLeft: 60,
    timerId: null,
    answeredAt: 0,
    highScore: 0,
    muted: false
  };

  try { state.highScore = parseInt(localStorage.getItem("bb-highscore") || "0", 10) || 0; } catch (e) {}

  /* ── SFX helpers ── */
  var sfxCtx = null;
  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }
  function tone(freq, start, dur, type, gain) {
    if (state.muted) return;
    var ctx = getSfxCtx();
    if (!ctx) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(start);
    o.stop(start + dur + 0.02);
  }
  function sfxTap() {
    try { if (window.LASfx && LASfx.click) LASfx.click(); } catch (_) {}
    try { if (window.sfxTap) window.sfxTap(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx || state.muted) return;
    tone(640, ctx.currentTime, 0.05, "sine", 0.07);
  }
  function sfxOk() {
    try { if (window.LASfx && LASfx.correct) LASfx.correct(); } catch (_) {}
    try { if (window.sfxCorrect) window.sfxCorrect(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx || state.muted) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.09, "triangle", 0.12);
    tone(659.25, t + 0.07, 0.1, "triangle", 0.12);
    tone(783.99, t + 0.14, 0.14, "sine", 0.1);
  }
  function sfxBad() {
    try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); } catch (_) {}
    try { if (window.sfxWrong) window.sfxWrong(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx || state.muted) return;
    tone(200, ctx.currentTime, 0.12, "sawtooth", 0.06);
  }
  function sfxCombo() {
    var ctx = getSfxCtx(); if (!ctx || state.muted) return;
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, ctx.currentTime + i * 0.06, 0.12, "sine", 0.09); });
  }
  function sfxCelebrate() {
    try { if (window.sfxCelebrate) window.sfxCelebrate(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx || state.muted) return;
    [523, 659, 784, 988, 1175].forEach(function (f, i) { tone(f, ctx.currentTime + i * 0.08, 0.15, "triangle", 0.1); });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function formatScore(n) {
    var s = String(Math.max(0, n));
    while (s.length < 4) s = "0" + s;
    return s;
  }
  function clearTimer() {
    if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  }
  function getChar(q) {
    if (q.answer === "AND") return CHARACTERS.marcos;
    if (q.answer === "OR") return CHARACTERS.emma;
    return CHARACTERS.alex;
  }

  /* ── Render ── */
  function render() {
    if (state.phase === "start") renderStart();
    else if (state.phase === "play") renderPlay();
    else if (state.phase === "results") renderResults();
  }

  function renderStart() {
    clearTimer();
    app.innerHTML =
      '<header class="bb-topbar">' +
      '<a class="bb-back" href="../" aria-label="Back">←</a>' +
      '<span class="bb-title">Breakfast Builder</span>' +
      '<span class="bb-badge">5A</span></header>' +
      '<section class="bb-start">' +
      '<div class="bb-hero" aria-hidden="true">🥣</div>' +
      '<h1>BREAKFAST BUILDER</h1>' +
      '<p class="bb-sub">AND · OR · BUT<br>Help the characters build their breakfast!</p>' +
      '<div class="bb-rules">' +
      '<div class="bb-rule"><span class="bb-rule-badge and">AND</span><span class="bb-rule-text">adds two things</span></div>' +
      '<div class="bb-rule"><span class="bb-rule-badge or">OR</span><span class="bb-rule-text">gives a choice</span></div>' +
      '<div class="bb-rule"><span class="bb-rule-badge but">BUT</span><span class="bb-rule-text">shows a contrast</span></div>' +
      '</div>' +
      '<p class="bb-best">Best Score: <strong>' + formatScore(state.highScore) + '</strong></p>' +
      '<button type="button" class="bb-btn" id="bb-start">START GAME</button>' +
      '</section>';
    document.getElementById("bb-start").onclick = startGame;
  }

  function renderPlay() {
    var q = state.questions[state.qIndex];
    if (!q) { endGame(); return; }
    var char = getChar(q);
    var totalQ = state.questions.length;
    var pct = Math.round((state.qIndex / Math.max(1, totalQ)) * 100);
    var warn = state.timeLeft <= 10 ? (state.timeLeft <= 5 ? " crit" : " warn") : "";

    var foodsHtml = "";
    if (q.foods && q.foods.length) {
      foodsHtml = '<div class="bb-foods">' + q.foods.map(function (f) {
        return '<span class="bb-food">' + f + '</span>';
      }).join("") + '</div>';
    }

    var label = q.situation
      ? q.situation
      : "Round " + state.round + " · " + (state.qIndex + 1) + "/" + totalQ;

    app.innerHTML =
      '<header class="bb-topbar">' +
      '<a class="bb-back" href="../" aria-label="Back">←</a>' +
      '<span class="bb-title">Breakfast Builder</span>' +
      '<span class="bb-badge">' + state.round + "/3</span>" +
      '<div class="bb-stats">' +
      '<span class="bb-stat">SCORE ' + formatScore(state.score) + '</span>' +
      '<span class="bb-stat combo">COMBO x' + Math.max(1, state.combo) + '</span>' +
      '<span class="bb-stat time' + warn + '" id="bb-time">TIME ' + pad(state.timeLeft) + '</span>' +
      '<button type="button" class="bb-mute" id="bb-mute" aria-label="Mute">' + (state.muted ? "🔇" : "🔊") + '</button>' +
      '</div></header>' +
      '<div class="bb-progress"><div class="bb-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="bb-char">' +
      '<div class="bb-avatar" aria-hidden="true">' + char.emoji + '</div>' +
      '<div class="bb-bubble"><strong>' + char.name + '</strong><br>' + char.line + '</div>' +
      '</div>' +
      '<div class="bb-qcard">' +
      '<div class="bb-qlabel">' + label + '</div>' +
      foodsHtml +
      '<div class="bb-sentence">' + q.sentence.replace("___", '<span class="bb-blank">___</span>') + '</div>' +
      (state.round === 2 ? '<div class="bb-hint">AND = + two things · OR = choice · BUT = contrast</div>' : "") +
      '</div>' +
      '<div class="bb-answers" id="bb-answers">' +
      '<button type="button" class="bb-ans and" data-ans="AND">AND</button>' +
      '<button type="button" class="bb-ans or" data-ans="OR">OR</button>' +
      '<button type="button" class="bb-ans but" data-ans="BUT">BUT</button>' +
      '</div>' +
      '<div id="bb-fb"></div>';

    document.getElementById("bb-mute").onclick = toggleMute;
    app.querySelectorAll(".bb-ans").forEach(function (btn) {
      btn.onclick = function () { checkAnswer(btn.getAttribute("data-ans"), btn); };
    });
  }

  function showFeedback(ok, q, points) {
    var area = document.getElementById("bb-fb");
    if (!area) return;
    var completed = q.sentence.replace("___", q.answer);
    if (ok) {
      area.innerHTML =
        '<div class="bb-fb ok">' +
        '<div class="bb-fb-title">✓ CORRECT!</div>' +
        '<div class="bb-fb-sent">"' + completed + '"</div>' +
        '<div class="bb-fb-exp">' + q.explain + '</div>' +
        '<div class="bb-fb-pts">+' + points + (state.combo >= 3 ? " · 🔥 x" + state.combo + " COMBO" : "") + "</div>" +
        '<button type="button" class="bb-btn" id="bb-next" style="margin-top:10px">NEXT</button>' +
        "</div>";
    } else {
      area.innerHTML =
        '<div class="bb-fb bad">' +
        '<div class="bb-fb-title">✗ NOT QUITE</div>' +
        '<div class="bb-fb-exp">The correct answer is <strong>' + q.answer + "</strong>.</div>" +
        '<div class="bb-fb-sent">"' + completed + '"</div>' +
        '<div class="bb-fb-exp">' + q.explain + "</div>" +
        '<button type="button" class="bb-btn" id="bb-next" style="margin-top:10px">NEXT</button>' +
        "</div>";
    }
    document.getElementById("bb-next").onclick = nextQuestion;
  }

  function renderResults() {
    clearTimer();
    var accuracy = state.total ? Math.round((state.correct / state.total) * 100) : 0;
    var isNew = state.score > state.highScore;
    if (isNew) {
      state.highScore = state.score;
      try { localStorage.setItem("bb-highscore", String(state.highScore)); } catch (e) {}
    }
    var msg = accuracy >= 90
      ? "Excellent! You really know your connectors."
      : accuracy >= 70
      ? "Great work! Keep practicing AND, OR, and BUT."
      : "Good try! Review the meanings and play again.";

    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

    app.innerHTML =
      '<header class="bb-topbar">' +
      '<a class="bb-back" href="../" aria-label="Back">←</a>' +
      '<span class="bb-title">Breakfast Builder</span>' +
      '<span class="bb-badge">Done</span></header>' +
      '<section class="bb-start">' +
      '<div class="bb-hero" aria-hidden="true">🥣</div>' +
      '<div class="bb-results">' +
      (isNew ? '<div class="bb-newbest">🏆 NEW BEST SCORE!</div>' : "") +
      "<h2>BREAKFAST COMPLETE!</h2>" +
      '<div class="bb-score-big">' + state.score.toLocaleString() + "</div>" +
      '<div class="bb-stats-grid">' +
      '<div class="bb-stat-box"><div class="val">x' + state.bestCombo + '</div><div class="lbl">Best Combo</div></div>' +
      '<div class="bb-stat-box"><div class="val">' + state.correct + " / " + state.total + '</div><div class="lbl">Correct</div></div>' +
      '<div class="bb-stat-box"><div class="val">' + accuracy + '%</div><div class="lbl">Accuracy</div></div>' +
      '<div class="bb-stat-box"><div class="val">' + formatScore(state.highScore) + '</div><div class="lbl">Best Score</div></div>' +
      "</div>" +
      '<p class="bb-msg">' + msg + "</p>" +
      "</div>" +
      '<div class="bb-btn-row">' +
      '<button type="button" class="bb-btn" id="bb-again">PLAY AGAIN</button>' +
      '<button type="button" class="bb-btn secondary" id="bb-menu">BACK</button>' +
      "</div></section>";

    if (accuracy >= 70) launchConfetti();
    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = 60000 - (state.timeLeft * 1000);
        LAFinish.show({
          gameId: GAME_ID,
          score: state.correct,
          total: state.total || 24,
          stars: stars,
          timeMs: Math.max(0, timeMs),
          onAgain: startGame,
          onModes: function () { state.phase = "start"; render(); },
          backHref: "../"
        });
      } catch (e) {}
    }

    document.getElementById("bb-again").onclick = startGame;
    document.getElementById("bb-menu").onclick = function () {
      state.phase = "start";
      render();
    };
  }

  /* ── Game flow ── */
  function startGame() {
    clearTimer();
    getSfxCtx();
    if (window.LAFinish) try { LAFinish.startTimer(); } catch (e) {}
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.correct = 0;
    state.total = 0;
    state.round = 1;
    state.qIndex = 0;
    state.locked = false;
    state.timeLeft = 60;
    state.questions = shuffle(ROUND1);
    state.phase = "play";
    state.answeredAt = Date.now();
    render();
    startTimer();
  }

  function startTimer() {
    clearTimer();
    state.timerId = setInterval(function () {
      state.timeLeft--;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        clearTimer();
        endGame();
        return;
      }
      var el = document.getElementById("bb-time");
      if (el) {
        el.textContent = "TIME " + pad(state.timeLeft);
        el.className = "bb-stat time" + (state.timeLeft <= 5 ? " crit" : state.timeLeft <= 10 ? " warn" : "");
      }
    }, 1000);
  }

  function checkAnswer(chosen) {
    if (state.locked) return;
    state.locked = true;
    sfxTap();
    var q = state.questions[state.qIndex];
    var ok = chosen === q.answer;
    state.total++;

    app.querySelectorAll(".bb-ans").forEach(function (b) {
      var a = b.getAttribute("data-ans");
      if (a === q.answer) b.classList.add("correct");
      else if (a === chosen && !ok) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    var points = 0;
    if (ok) {
      state.correct++;
      state.combo++;
      if (state.combo > state.bestCombo) state.bestCombo = state.combo;
      points = 100;
      var elapsed = (Date.now() - state.answeredAt) / 1000;
      if (elapsed < 4) points += 30;
      else if (elapsed < 7) points += 15;
      if (state.combo >= 5) { points = Math.round(points * 1.5); sfxCombo(); }
      else if (state.combo >= 3) { points = Math.round(points * 1.25); sfxCombo(); }
      else sfxOk();
      state.score += points;
    } else {
      state.combo = 0;
      sfxBad();
    }

    showFeedback(ok, q, points);
  }

  function nextQuestion() {
    state.qIndex++;
    state.locked = false;
    state.answeredAt = Date.now();

    if (state.qIndex >= state.questions.length) {
      if (state.round === 1) {
        state.round = 2;
        state.qIndex = 0;
        state.questions = shuffle(ROUND2);
        render();
      } else if (state.round === 2) {
        state.round = 3;
        state.qIndex = 0;
        state.questions = shuffle(ROUND3);
        render();
      } else {
        endGame();
      }
    } else {
      render();
    }
  }

  function endGame() {
    clearTimer();
    state.phase = "results";
    render();
  }

  function toggleMute() {
    state.muted = !state.muted;
    var btn = document.getElementById("bb-mute");
    if (btn) btn.textContent = state.muted ? "🔇" : "🔊";
    sfxTap();
  }

  function launchConfetti() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var colors = ["#ea580c", "#16a34a", "#2563eb", "#7c3aed", "#f59e0b", "#ec4899"];
    for (var i = 0; i < 36; i++) {
      (function (idx) {
        setTimeout(function () {
          var p = document.createElement("div");
          p.className = "bb-confetti";
          p.style.left = Math.random() * 100 + "vw";
          p.style.background = colors[Math.floor(Math.random() * colors.length)];
          p.style.animationDuration = (1.5 + Math.random() * 1.2) + "s";
          p.style.width = (5 + Math.random() * 6) + "px";
          p.style.height = p.style.width;
          document.body.appendChild(p);
          setTimeout(function () { p.remove(); }, 2800);
        }, idx * 28);
      })(i);
    }
  }

  /* Keyboard */
  document.addEventListener("keydown", function (e) {
    if (state.phase !== "play" || state.locked) return;
    var map = { "1": "AND", a: "AND", "2": "OR", o: "OR", "3": "BUT", b: "BUT" };
    var ans = map[e.key.toLowerCase()];
    if (ans) {
      var btn = app.querySelector('.bb-ans[data-ans="' + ans + '"]');
      if (btn) checkAnswer(ans);
    }
  });

  render();
})();
