/* Negative going to · AEF 1 Unit 10B */
(function () {
  "use strict";

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

  var GAME_ID = "1-10b-going-to-negative";

  // positive → preferred negative (+ accepted alternates)
  var ITEMS = [
    {
      positive: "I am going to watch TV.",
      correct: "I'm not going to watch TV.",
      alts: ["I am not going to watch TV.", "I am not going to watch TV"]
    },
    {
      positive: "She is going to cook dinner.",
      correct: "She isn't going to cook dinner.",
      alts: ["She is not going to cook dinner.", "She's not going to cook dinner."]
    },
    {
      positive: "They are going to play football.",
      correct: "They aren't going to play football.",
      alts: ["They are not going to play football.", "They're not going to play football."]
    },
    {
      positive: "He is going to buy a car.",
      correct: "He isn't going to buy a car.",
      alts: ["He is not going to buy a car.", "He's not going to buy a car."]
    },
    {
      positive: "We are going to travel next week.",
      correct: "We aren't going to travel next week.",
      alts: ["We are not going to travel next week.", "We're not going to travel next week."]
    },
    {
      positive: "You are going to clean the house.",
      correct: "You aren't going to clean the house.",
      alts: ["You are not going to clean the house."]
    },
    {
      positive: "My father is going to make dinner.",
      correct: "My father isn't going to make dinner.",
      alts: ["My father is not going to make dinner."]
    },
    {
      positive: "The students are going to take a test.",
      correct: "The students aren't going to take a test.",
      alts: ["The students are not going to take a test."]
    },
    {
      positive: "Anna is going to visit her grandmother.",
      correct: "Anna isn't going to visit her grandmother.",
      alts: ["Anna is not going to visit her grandmother."]
    },
    {
      positive: "I am going to go shopping.",
      correct: "I'm not going to go shopping.",
      alts: ["I am not going to go shopping."]
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var order = [];
  var index = 0;
  var score = 0;
  var streak = 0;
  var bestStreak = 0;
  var locked = false;
  var advanceTimer = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx.play === "function") LASfx.play(name);
      else if (name === "correct" && window.sfxCorrect) sfxCorrect();
      else if (name === "wrong" && window.sfxWrong) sfxWrong();
      else if (name === "click" && window.sfxTap) sfxTap();
      else if (name === "win" && window.sfxCelebrate) sfxCelebrate();
    } catch (_) {}
  }

  function clearTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/\.+$/, "")
      .replace(/!+$/, "");
  }

  function isCorrect(input, item) {
    var n = normalize(input);
    if (!n) return false;
    var list = [item.correct].concat(item.alts || []);
    for (var i = 0; i < list.length; i++) {
      if (normalize(list[i]) === n) return true;
    }
    // also accept "is not" / "isn't" swaps already in alts
    return false;
  }

  function showStart() {
    clearTimer();
    locked = false;
    app.innerHTML =
      '<div class="bia-top">' +
      '<a class="bia-back" href="../" aria-label="Back">←</a>' +
      '<div class="bia-title-wrap">' +
      '<div class="bia-kicker">Unit 10B · Grammar</div>' +
      '<h1 class="bia-title">Negative going to</h1>' +
      "</div></div>" +
      '<div class="bia-start">' +
      '<div class="bia-hero" aria-hidden="true">🚫</div>' +
      "<h1>Make it negative</h1>" +
      "<p>Change each sentence. Use <strong>isn't / aren't / I'm not</strong> + going to.</p>" +
      '<p style="font-size:0.9rem;color:#64748b;margin:0">Example: She is going to study. → She <strong>isn\'t</strong> going to study.</p>' +
      '<button type="button" class="bia-btn" id="startBtn">Start</button>' +
      "</div>";
    document.getElementById("startBtn").onclick = start;
  }

  function start() {
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    locked = false;
    clearTimer();
    try {
      if (window.LAFinish) LAFinish.startTimer();
    } catch (_) {}
    sfx("click");
    render();
  }

  function render() {
    clearTimer();
    locked = false;
    var item = ITEMS[order[index]];
    var pct = (index / ITEMS.length) * 100;

    app.innerHTML =
      '<div class="bia-top">' +
      '<a class="bia-back" href="../" aria-label="Back">←</a>' +
      '<div class="bia-title-wrap">' +
      '<div class="bia-kicker">Unit 10B · Grammar</div>' +
      '<h1 class="bia-title">Negative going to</h1>' +
      "</div>" +
      '<div class="bia-stats">' +
      '<span class="bia-pill" id="scorePill">' + score + " / " + ITEMS.length + "</span>" +
      '<span class="bia-pill streak' + (streak >= 3 ? " is-hot" : "") + '" id="streakPill">' +
      (streak > 0 ? "🔥 " + streak : "—") +
      "</span>" +
      "</div></div>" +
      '<div class="bia-track"><div class="bia-fill" id="biaFill" style="width:' + pct + '%"></div></div>' +
      '<div class="bia-play">' +
      '<div class="bia-card enter" id="biaCard">' +
      '<div class="bia-q-num">Question ' + (index + 1) + " of " + ITEMS.length + "</div>" +
      '<p class="bia-prompt">' + escapeHtml(item.positive) + "</p>" +
      '<div class="bia-arrow">→ write the negative</div>' +
      '<input class="bia-input" id="answerInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="true" placeholder="She isn\'t going to…" maxlength="120" />' +
      '<button type="button" class="bia-check" id="checkBtn">Check</button>' +
      "</div>" +
      '<div class="bia-feedback" id="feedback"></div>' +
      "</div>";

    requestAnimationFrame(function () {
      var fill = document.getElementById("biaFill");
      if (fill) fill.style.width = ((index + 1) / ITEMS.length) * 100 + "%";
    });

    var input = document.getElementById("answerInput");
    var checkBtn = document.getElementById("checkBtn");
    input.focus();
    checkBtn.onclick = submit;
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    });
  }

  function submit() {
    if (locked) return;
    var input = document.getElementById("answerInput");
    var val = String(input.value || "").trim();
    if (!val) {
      input.focus();
      sfx("wrong");
      var fb0 = document.getElementById("feedback");
      fb0.textContent = "Type the negative sentence.";
      fb0.className = "bia-feedback bad show";
      return;
    }

    locked = true;
    var item = ITEMS[order[index]];
    var ok = isCorrect(val, item);
    var card = document.getElementById("biaCard");
    var feedback = document.getElementById("feedback");
    var checkBtn = document.getElementById("checkBtn");

    input.disabled = true;
    checkBtn.disabled = true;

    if (ok) {
      score += 1;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      sfx("correct");
      if (card) card.classList.add("is-correct");
      feedback.textContent = streak >= 3 ? "Correct! 🔥 Streak " + streak : "Correct!";
      feedback.className = "bia-feedback ok show";
      document.getElementById("scorePill").textContent = score + " / " + ITEMS.length;
      var sp = document.getElementById("streakPill");
      sp.textContent = "🔥 " + streak;
      sp.className = "bia-pill streak" + (streak >= 3 ? " is-hot" : "");
      advanceTimer = setTimeout(next, 800);
    } else {
      streak = 0;
      sfx("wrong");
      if (card) card.classList.add("is-wrong");
      feedback.innerHTML =
        'Answer: <strong>' + escapeHtml(item.correct) + "</strong>";
      feedback.className = "bia-feedback bad show";
      var sp2 = document.getElementById("streakPill");
      sp2.textContent = "—";
      sp2.className = "bia-pill streak";
      advanceTimer = setTimeout(next, 1600);
    }
  }

  function next() {
    clearTimer();
    if (index + 1 >= order.length) {
      finish();
      return;
    }
    index += 1;
    render();
  }

  function finish() {
    clearTimer();
    sfx("win");
    var total = ITEMS.length;
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, Math.round((score / total) * 100));
      }
    } catch (_) {}

    try {
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          timeMs: timeMs,
          onAgain: start,
          onModes: showStart,
          backHref: "../",
          save: true
        });
        return;
      }
    } catch (_) {}

    app.innerHTML =
      '<div class="bia-top">' +
      '<a class="bia-back" href="../" aria-label="Back">←</a>' +
      '<div class="bia-title-wrap">' +
      '<div class="bia-kicker">Unit 10B · Grammar</div>' +
      '<h1 class="bia-title">Complete!</h1>' +
      "</div></div>" +
      '<div class="bia-done">' +
      '<div class="trophy" aria-hidden="true">🏆</div>' +
      "<h1>Well done!</h1>" +
      '<div class="bia-score-big">' + score + " / " + total + "</div>" +
      (bestStreak > 1 ? "<p>Best streak: " + bestStreak + "</p>" : "") +
      '<button type="button" class="bia-btn" id="againBtn">Play again</button>' +
      "</div>";
    document.getElementById("againBtn").onclick = start;
  }

  showStart();
})();
