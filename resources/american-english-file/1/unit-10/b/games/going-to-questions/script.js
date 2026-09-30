/* Going to questions — unscramble · AEF 1 Unit 10B */
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

  var GAME_ID = "1-10b-going-to-questions";

  var ITEMS = [
    { words: ["you", "going", "are", "to", "study", "tonight"], answer: "Are you going to study tonight?" },
    { words: ["she", "going", "is", "to", "cook", "dinner"], answer: "Is she going to cook dinner?" },
    { words: ["they", "going", "are", "to", "play", "football"], answer: "Are they going to play football?" },
    { words: ["he", "going", "is", "to", "watch", "a", "movie"], answer: "Is he going to watch a movie?" },
    { words: ["we", "going", "are", "to", "travel", "tomorrow"], answer: "Are we going to travel tomorrow?" },
    { words: ["your", "parents", "going", "are", "to", "visit", "you"], answer: "Are your parents going to visit you?" },
    { words: ["Tom", "going", "is", "to", "buy", "a", "phone"], answer: "Is Tom going to buy a phone?" },
    { words: ["you", "going", "are", "to", "go", "shopping"], answer: "Are you going to go shopping?" },
    { words: ["Anna", "going", "is", "to", "study", "tonight"], answer: "Is Anna going to study tonight?" },
    { words: ["your", "friends", "going", "are", "to", "come", "tomorrow"], answer: "Are your friends going to come tomorrow?" }
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
  var allChips = [];
  var built = [];
  var chipIdSeq = 0;

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
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[?.!]+$/, "");
  }

  function showStart() {
    clearTimer();
    locked = false;
    app.innerHTML =
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      "</div>" +
      '<div class="wgt-start">' +
      '<div class="wgt-hero" aria-hidden="true">❓</div>' +
      "<h1>Going to questions</h1>" +
      "<p>Put the words in the correct order to make a <strong>question</strong>.</p>" +
      '<div class="wgt-hint">Example: you / going / are / to / study → <strong>Are you going to study?</strong></div>' +
      '<button type="button" class="wgt-btn" id="startBtn">Start</button>' +
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

  function topBar() {
    var pct = ((index + 1) / ITEMS.length) * 100;
    return (
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      '<div class="wgt-progress"><span style="width:' + pct + '%"></span></div>' +
      '<span class="wgt-mode-tag">' + (index + 1) + " / " + ITEMS.length + "</span>" +
      '<span class="wgt-pill streak' + (streak >= 3 ? " is-hot" : "") + '" id="streakPill">' +
      (streak > 0 ? "🔥 " + streak : "—") +
      "</span>" +
      "</div>"
    );
  }

  function updateStreak() {
    var st = document.getElementById("streakPill");
    if (st) {
      st.textContent = streak > 0 ? "🔥 " + streak : "—";
      st.className = "wgt-pill streak" + (streak >= 3 ? " is-hot" : "");
    }
  }

  function render() {
    clearTimer();
    locked = false;
    var item = ITEMS[order[index]];
    chipIdSeq = 0;
    allChips = shuffle(
      item.words.map(function (w) {
        return { id: chipIdSeq++, word: w };
      })
    );
    built = [];

    app.innerHTML =
      topBar() +
      '<div class="wgt-play">' +
      '<div class="wgt-phase">Question ' + (index + 1) + " of " + ITEMS.length + "</div>" +
      '<div class="su-prompt" id="wgtCard">' +
      '<div class="su-prompt-label">Put the words in order · make a question</div>' +
      '<div class="su-slots" id="slotsArea"></div>' +
      "</div>" +
      '<div class="su-chips" id="poolArea"></div>' +
      '<div class="wgt-actions">' +
      '<button type="button" class="wgt-undo" id="undoBtn" disabled>Undo</button>' +
      '<button type="button" class="wgt-check" id="checkBtn" disabled>Check</button>' +
      "</div>" +
      '<div class="wgt-feedback" id="feedback"></div>' +
      "</div>";

    paint();
    document.getElementById("undoBtn").onclick = undoChip;
    document.getElementById("checkBtn").onclick = check;
  }

  function paint() {
    var item = ITEMS[order[index]];
    var slotsArea = document.getElementById("slotsArea");
    var poolArea = document.getElementById("poolArea");
    var undoBtn = document.getElementById("undoBtn");
    var checkBtn = document.getElementById("checkBtn");
    var n = item.words.length;

    var slotsHtml = "";
    for (var s = 0; s < n; s++) {
      if (s < built.length) {
        slotsHtml +=
          '<button type="button" class="su-slot filled" data-idx="' +
          s +
          '">' +
          escapeHtml(built[s].word) +
          "</button>";
      } else {
        slotsHtml += '<span class="su-slot"></span>';
      }
    }
    // trailing ? mark visual
    slotsHtml += '<span class="su-slot filled" style="cursor:default;min-width:40px;pointer-events:none">?</span>';
    slotsArea.innerHTML = slotsHtml;

    slotsArea.querySelectorAll(".su-slot.filled[data-idx]").forEach(function (slot) {
      slot.addEventListener("click", function () {
        if (locked) return;
        var idx = Number(slot.getAttribute("data-idx"));
        while (built.length > idx) built.pop();
        sfx("click");
        paint();
      });
    });

    var usedIds = {};
    built.forEach(function (c) {
      usedIds[c.id] = true;
    });

    poolArea.innerHTML = allChips
      .map(function (c) {
        var used = !!usedIds[c.id];
        return (
          '<button type="button" class="su-chip' +
          (used ? " used" : "") +
          '" data-id="' +
          c.id +
          '"' +
          (used || locked ? " disabled" : "") +
          ">" +
          escapeHtml(c.word) +
          "</button>"
        );
      })
      .join("");

    poolArea.querySelectorAll(".su-chip:not(.used)").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (locked) return;
        pickChip(Number(btn.getAttribute("data-id")));
      });
    });

    undoBtn.disabled = locked || !built.length;
    checkBtn.disabled = locked || built.length < n;
  }

  function pickChip(id) {
    for (var k = 0; k < built.length; k++) {
      if (built[k].id === id) return;
    }
    var chip = null;
    for (var i = 0; i < allChips.length; i++) {
      if (allChips[i].id === id) {
        chip = allChips[i];
        break;
      }
    }
    if (!chip) return;
    if (built.length >= ITEMS[order[index]].words.length) return;
    built.push(chip);
    sfx("click");
    paint();
  }

  function undoChip() {
    if (locked || !built.length) return;
    built.pop();
    sfx("click");
    paint();
  }

  function check() {
    if (locked || !built.length) return;
    locked = true;
    var item = ITEMS[order[index]];
    var attempt = built.map(function (c) { return c.word; }).join(" ");
    var ok = normalize(attempt) === normalize(item.answer);

    var card = document.getElementById("wgtCard");
    var feedback = document.getElementById("feedback");
    document.getElementById("undoBtn").disabled = true;
    document.getElementById("checkBtn").disabled = true;

    document.querySelectorAll("#poolArea .su-chip").forEach(function (b) {
      b.disabled = true;
      b.classList.add("used");
    });
    document.querySelectorAll("#slotsArea .su-slot.filled[data-idx]").forEach(function (slot) {
      slot.classList.add(ok ? "correct" : "wrong");
      slot.style.cursor = "default";
    });

    if (ok) {
      score += 1;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      sfx("correct");
      if (card) card.classList.add("is-correct");
      feedback.textContent = streak >= 3 ? "Correct! 🔥 " + streak : "Correct!";
      feedback.className = "wgt-feedback ok show";
      updateStreak();
      advanceTimer = setTimeout(next, 850);
    } else {
      streak = 0;
      sfx("wrong");
      if (card) card.classList.add("is-wrong");
      setTimeout(function () {
        var slotsArea = document.getElementById("slotsArea");
        if (slotsArea) {
          var words = item.answer.replace(/\?$/, "").trim().split(/\s+/);
          slotsArea.innerHTML =
            words
              .map(function (w) {
                return '<span class="su-slot filled correct">' + escapeHtml(w) + "</span>";
              })
              .join("") +
            '<span class="su-slot filled correct" style="min-width:40px">?</span>';
        }
      }, 550);
      feedback.innerHTML = "Answer: <strong>" + escapeHtml(item.answer) + "</strong>";
      feedback.className = "wgt-feedback bad show";
      updateStreak();
      advanceTimer = setTimeout(next, 1800);
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
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      "</div>" +
      '<div class="wgt-done">' +
      '<div class="trophy" aria-hidden="true">🏆</div>' +
      "<h1>Well done!</h1>" +
      '<div class="wgt-score-big">' + score + " / " + total + "</div>" +
      (bestStreak > 1 ? "<p>Best streak: " + bestStreak + "</p>" : "") +
      '<button type="button" class="wgt-btn" id="againBtn">Play again</button>' +
      "</div>";
    document.getElementById("againBtn").onclick = start;
  }

  showStart();
})();
