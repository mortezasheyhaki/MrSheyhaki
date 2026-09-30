/* Choose am / is / are — be going to · AEF 1 Unit 10B */
(function () {
  "use strict";

  /* === Shared UI SFX === */
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

  var GAME_ID = "1-10b-choose-am-is-are";

  var ITEMS = [
    { before: "I", after: "going to study tonight.", correct: "am" },
    { before: "She", after: "going to cook dinner.", correct: "is" },
    { before: "They", after: "going to play football.", correct: "are" },
    { before: "He", after: "going to watch a movie.", correct: "is" },
    { before: "We", after: "going to visit our grandparents.", correct: "are" },
    { before: "You", after: "going to clean your room.", correct: "are" },
    { before: "My parents", after: "going to travel next week.", correct: "are" },
    { before: "Tom", after: "going to buy a new phone.", correct: "is" },
    { before: "The students", after: "going to have a test.", correct: "are" },
    { before: "Anna and Sara", after: "going to go shopping.", correct: "are" }
  ];

  var OPTIONS = ["am", "is", "are"];

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

  function showStart() {
    clearTimer();
    locked = false;
    app.innerHTML =
      '<div class="bia-top">' +
      '<a class="bia-back" href="../" aria-label="Back">←</a>' +
      '<div class="bia-title-wrap">' +
      '<div class="bia-kicker">Unit 10B · Grammar</div>' +
      "<h1 class=\"bia-title\">am / is / are + going to</h1>" +
      "</div></div>" +
      '<div class="bia-start">' +
      '<div class="bia-hero" aria-hidden="true">🚀</div>' +
      "<h1>Choose am / is / are</h1>" +
      "<p>Complete each sentence with the correct form of <strong>be</strong>.</p>" +
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
    var pct = ((index) / ITEMS.length) * 100;

    app.innerHTML =
      '<div class="bia-top">' +
      '<a class="bia-back" href="../" aria-label="Back">←</a>' +
      '<div class="bia-title-wrap">' +
      '<div class="bia-kicker">Unit 10B · Grammar</div>' +
      "<h1 class=\"bia-title\">am / is / are</h1>" +
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
      '<p class="bia-sentence">' +
      escapeHtml(item.before) +
      ' <span class="bia-blank" id="blank">___</span> ' +
      escapeHtml(item.after) +
      "</p>" +
      "</div>" +
      '<div class="bia-chips" id="chips">' +
      OPTIONS.map(function (opt) {
        return (
          '<button type="button" class="bia-chip" data-val="' +
          opt +
          '">' +
          opt +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<div class="bia-feedback" id="feedback"></div>' +
      "</div>";

    // animate progress to current (after answer it will jump further)
    requestAnimationFrame(function () {
      var fill = document.getElementById("biaFill");
      if (fill) fill.style.width = ((index + 1) / ITEMS.length) * 100 + "%";
    });

    var chips = document.getElementById("chips");
    chips.querySelectorAll(".bia-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        choose(btn.getAttribute("data-val"), btn);
      });
    });
  }

  function choose(val, btn) {
    if (locked) return;
    locked = true;
    var item = ITEMS[order[index]];
    var ok = val === item.correct;
    var card = document.getElementById("biaCard");
    var blank = document.getElementById("blank");
    var feedback = document.getElementById("feedback");
    var chips = document.getElementById("chips");

    chips.querySelectorAll(".bia-chip").forEach(function (b) {
      b.disabled = true;
      var v = b.getAttribute("data-val");
      if (v === item.correct) b.classList.add("is-correct");
      else if (b === btn && !ok) b.classList.add("is-wrong");
      else b.classList.add("is-dim");
    });

    if (blank) {
      blank.textContent = val;
      blank.classList.add(ok ? "filled-ok" : "filled-bad");
    }

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
      advanceTimer = setTimeout(next, 750);
    } else {
      streak = 0;
      sfx("wrong");
      if (card) card.classList.add("is-wrong");
      if (blank) {
        // briefly show wrong, then reveal correct
        setTimeout(function () {
          blank.textContent = item.correct;
          blank.classList.remove("filled-bad");
          blank.classList.add("filled-ok");
        }, 500);
      }
      feedback.textContent = "Answer: " + item.correct;
      feedback.className = "bia-feedback bad show";
      var sp2 = document.getElementById("streakPill");
      sp2.textContent = "—";
      sp2.className = "bia-pill streak";
      advanceTimer = setTimeout(next, 1300);
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
    var timeMs = 0;
    try {
      if (window.LAFinish) {
        timeMs = LAFinish.stopTimer();
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
      "<h1 class=\"bia-title\">Complete!</h1>" +
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
