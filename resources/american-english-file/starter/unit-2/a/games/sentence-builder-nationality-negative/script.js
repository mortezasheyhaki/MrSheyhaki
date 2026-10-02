/* ===== Arcade FX: progress, combo, celebration ===== */
(function () {
  if (window.ArcadeFX) return;
  var streak = 0, best = 0, count = 0, lastPct = 0, ctx = null;
  var CHEERS = [
    ["🌟", "Awesome!", "10 correct answers!"],
    ["🚀", "Superstar!", "20 correct — unstoppable!"],
    ["👑", "Legend!", "30 correct — the best of the best!"]
  ];
  function tone(f, d, type, v, when) {
    try {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime + (when || 0);
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(v || 0.09, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + d + 0.03);
    } catch (e) {}
  }
  function label(n) {
    return n >= 10 ? "UNSTOPPABLE" : n >= 7 ? "ON FIRE" : n >= 5 ? "HOT STREAK" : n >= 3 ? "NICE" : "";
  }
  function chip() {
    var el = document.getElementById("afx-combo");
    if (!el) {
      el = document.createElement("div");
      el.id = "afx-combo";
      el.className = "afx-combo";
      document.body.appendChild(el);
    }
    return el;
  }
  function place(el) {
    el = el || document.getElementById("afx-combo");
    var app = document.getElementById("game-app") || document.getElementById("app");
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    if (a.offsetParent === null) a = app;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, a === app ? r.top + 64 : r.bottom + 8) + "px";
  }
  function showCombo() {
    var el = chip();
    place(el);
    el.className = "afx-combo is-on" + (streak >= 5 ? " is-hot" : "");
    el.innerHTML = '<span class="afx-fire">🔥</span> x' + streak + " <em>" + label(streak) + "</em>";
    void el.offsetWidth;
    el.classList.add("is-bump");
  }
  function burst(c) {
    [523, 659, 784, 1047, 1319].forEach(function (f, i) {
      tone(f, 0.22, "triangle", 0.1, i * 0.09);
    });
    tone(1568, 0.6, "sine", 0.08, 0.5);
    var ov = document.createElement("div");
    ov.className = "afx-burst";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"];
    var h = "";
    for (var i = 0; i < 44; i++) {
      h +=
        '<i style="left:' +
        Math.random() * 100 +
        "%;background:" +
        cols[i % 6] +
        ";animation-delay:" +
        (Math.random() * 0.35).toFixed(2) +
        "s;animation-duration:" +
        (1.3 + Math.random() * 0.9).toFixed(2) +
        's"></i>';
    }
    ov.innerHTML =
      h +
      '<div class="afx-card"><div class="afx-emoji">' +
      c[0] +
      '</div><div class="afx-title">' +
      c[1] +
      '</div><div class="afx-sub">' +
      c[2] +
      "</div></div>";
    document.body.appendChild(ov);
    setTimeout(function () {
      ov.classList.add("is-out");
    }, 1900);
    setTimeout(function () {
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    }, 2300);
  }
  function hookRestart() {
    var L = window.LAFinish;
    if (L && L.startTimer && !L.__afx) {
      var st = L.startTimer;
      L.__afx = 1;
      L.startTimer = function () {
        api.reset();
        return st.apply(this, arguments);
      };
    }
  }
  var api = (window.ArcadeFX = {
    track: null,
    bar: function (pct) {
      var app = document.getElementById("game-app") || document.getElementById("app");
      if (!app) return;
      var bar = app.querySelector(".afx-bar");
      if (!bar) {
        var anchor = app.querySelector('[id*="rogress"]') || app.querySelector(".sbn-top") || app.querySelector("header");
        if (!anchor) return;
        var host = anchor.closest(".sbn-top") || anchor.parentElement;
        bar = document.createElement("div");
        bar.className = "afx-bar";
        bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
        host.parentNode.insertBefore(bar, host.nextSibling);
      }
      var fill = bar.firstChild;
      lastPct = pct;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.width = pct + "%";
        });
      });
    },
    ok: function () {
      var nw = Date.now();
      if (nw - (api._o || 0) < 90) return;
      api._o = nw;
      hookRestart();
      streak++;
      count++;
      if (streak > best) best = streak;
      if (streak >= 2) {
        var b = 660 * Math.pow(1.0595, Math.min(streak, 12));
        tone(b, 0.09, "triangle", 0.08, 0);
        tone(b * 1.5, 0.14, "triangle", 0.07, 0.07);
        showCombo();
      }
      if (count % 10 === 0 && !api.noMilestone) {
        setTimeout(function () {
          burst(CHEERS[Math.min(Math.floor(count / 10) - 1, 2)]);
        }, 250);
      }
    },
    bad: function () {
      var nw = Date.now();
      if (nw - (api._b || 0) < 90) return;
      api._b = nw;
      hookRestart();
      if (streak >= 3) {
        tone(300, 0.12, "sawtooth", 0.05, 0);
        tone(200, 0.2, "sawtooth", 0.05, 0.09);
      }
      if (streak >= 2) {
        var el = chip();
        el.className = "afx-combo is-lost";
        el.textContent = "Combo lost";
        setTimeout(function () {
          el.className = "afx-combo";
        }, 1200);
      }
      streak = 0;
    },
    cheer: function (i, n, sub) {
      var T = [
        ["🎉", "Great job!"],
        ["🌟", "Brilliant!"],
        ["🏆", "Champion!"]
      ];
      var c = T[i >= n - 1 && n > 1 ? 2 : Math.min(i, 1)];
      burst([c[0], c[1], sub || "Part " + (i + 1) + " of " + n + " complete"]);
    },
    reset: function () {
      streak = 0;
      best = 0;
      count = 0;
      lastPct = 0;
      var el = document.getElementById("afx-combo");
      if (el) el.className = "afx-combo";
    }
  });
  function sync() {
    var app = document.getElementById("game-app") || document.getElementById("app");
    if (!app) return;
    place();
    if (api.track) {
      try {
        api.bar(api.track());
      } catch (e) {}
    }
  }
  var q = 0;
  function start() {
    var app = document.getElementById("game-app") || document.getElementById("app");
    if (!app) return;
    new MutationObserver(function () {
      if (q) return;
      q = requestAnimationFrame(function () {
        q = 0;
        sync();
      });
    }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () {
      place();
    });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Sentence Builder · Negative · be not + nationality · AEF Starter Unit 2A
   Part 1: full negatives (I am not Korean)
   Part 2: short negatives (He is n't Spanish / I'm not Korean)
   Chip undo: remove ONLY the tapped chip (not everything after it)
*/
(function () {
  "use strict";

  /* --- SFX --- */
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
    function sfxTap() {
      tone(520, 0.06, "triangle", 0.08);
    }
    function sfxCorrect() {
      if (window.ArcadeFX) ArcadeFX.ok();
      tone(523, 0.1, "sine", 0.12, 0);
      tone(659, 0.12, "sine", 0.12, 0.08);
      tone(784, 0.18, "sine", 0.1, 0.16);
    }
    function sfxWrong() {
      if (window.ArcadeFX) ArcadeFX.bad();
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

  function sfx(name) {
    if (name === "correct" && window.sfxCorrect) sfxCorrect();
    else if (name === "wrong" && window.sfxWrong) sfxWrong();
    else if (name === "click" && window.sfxTap) sfxTap();
    else if (name === "win" && window.sfxCelebrate) sfxCelebrate();
  }

  var GAME_ID = "starter-2a-sentence-builder-nationality-negative";

  // Part 1 — full negative forms
  var PART1 = [
    { words: ["I", "am", "not", "Korean"], answer: "I am not Korean" },
    { words: ["You", "are", "not", "Brazilian"], answer: "You are not Brazilian" },
    { words: ["He", "is", "not", "Spanish"], answer: "He is not Spanish" },
    { words: ["She", "is", "not", "Turkish"], answer: "She is not Turkish" },
    { words: ["It", "is", "not", "Japanese"], answer: "It is not Japanese" },
    { words: ["We", "are", "not", "American"], answer: "We are not American" },
    { words: ["You", "are", "not", "Chilean"], answer: "You are not Chilean" },
    { words: ["They", "are", "not", "Peruvian"], answer: "They are not Peruvian" }
  ];

  // Part 2 — short negatives: subject + be + n't + nationality (I uses 'm + not)
  var PART2 = [
    { words: ["I", "'m", "not", "Korean"], answer: "I'm not Korean" },
    { words: ["You", "are", "n't", "Brazilian"], answer: "You aren't Brazilian" },
    { words: ["He", "is", "n't", "Spanish"], answer: "He isn't Spanish" },
    { words: ["She", "is", "n't", "Turkish"], answer: "She isn't Turkish" },
    { words: ["It", "is", "n't", "Japanese"], answer: "It isn't Japanese" },
    { words: ["We", "are", "n't", "American"], answer: "We aren't American" },
    { words: ["You", "are", "n't", "Chilean"], answer: "You aren't Chilean" },
    { words: ["They", "are", "n't", "Peruvian"], answer: "They aren't Peruvian" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var part = 1;
  var items = PART1;
  var order = [];
  var index = 0;
  var score = 0;
  var part1Score = 0;
  var streak = 0;
  var bestStreak = 0;
  var locked = false;
  var advanceTimer = null;

  var allChips = [];
  var built = [];
  var chipIdSeq = 0;

  function totalItems() {
    return PART1.length + PART2.length;
  }

  function globalIndex() {
    return (part === 1 ? 0 : PART1.length) + index;
  }

  function progressPct() {
    return Math.round((globalIndex() / totalItems()) * 100);
  }

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

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[\u2019\u2018']/g, "'")
      .replace(/\s+'/g, "'")
      .replace(/\s+n'?t\b/g, "n't")  // "is n't" / "are n't" → "isn't" / "aren't"
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function clearTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function saveProgress(stars) {
    // Single save path only — LAFinish uses save:false to avoid double-counting stars
    try {
      if (typeof window.laSaveProgress === "function") {
        window.laSaveProgress(GAME_ID, { score: part1Score + score, total: totalItems(), stars: stars });
      }
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        if (typeof LAStars.save === "function") LAStars.save(GAME_ID, stars);
        else if (typeof LAStars.saveFromAccuracy === "function") {
          LAStars.saveFromAccuracy(GAME_ID, Math.round(((part1Score + score) / totalItems()) * 100));
        }
      }
    } catch (e) {}
  }

  function calcStars() {
    var total = totalItems();
    var got = part1Score + score;
    if (got >= total) return 3;
    if (got >= Math.ceil(total * 0.66)) return 2;
    if (got >= Math.ceil(total * 0.33)) return 1;
    return 0;
  }

  /* --- Screens --- */
  function showStart() {
    clearTimer();
    part = 1;
    score = 0;
    part1Score = 0;
    streak = 0;
    bestStreak = 0;
    locked = false;
    if (window.ArcadeFX) ArcadeFX.reset();

    app.innerHTML =
      '<div class="sbn-top">' +
      '<a class="sbn-back" href="../" aria-label="Back">←</a>' +
      '<span class="sbn-mode-tag">Unit 2A</span>' +
      "</div>" +
      '<div class="sbn-start">' +
      '<div class="sbn-hero" aria-hidden="true">🧩</div>' +
      "<h1>Sentence Builder · Negative</h1>" +
      "<p>Tap the chips to build <strong>negative</strong> sentences with <strong>be</strong> + nationality.</p>" +
      '<div class="sbn-parts">' +
      '<div class="sbn-part-card"><span class="sbn-part-num">1</span><strong>Full form</strong><span>I am not Korean</span></div>' +
      '<div class="sbn-part-card"><span class="sbn-part-num">2</span><strong>Short form</strong><span>He isn\'t Spanish</span></div>' +
      "</div>" +
      '<button type="button" class="sbn-btn" id="sbnStart">Start</button>' +
      "</div>";

    document.getElementById("sbnStart").onclick = function () {
      startPart(1);
    };
  }

  function startPart(p) {
    part = p;
    items = part === 1 ? PART1 : PART2;
    order = shuffle(items.map(function (_, i) {
      return i;
    }));
    index = 0;
    score = 0;
    locked = false;
    if (part === 1) {
      part1Score = 0;
      if (window.LAFinish) LAFinish.startTimer();
    }
    sfx("click");
    render();
  }

  function topBar(tag) {
    var done = globalIndex();
    var total = totalItems();
    var pct = Math.min(100, Math.round((done / total) * 100));
    return (
      '<div class="sbn-top">' +
      '<a class="sbn-back" href="../" aria-label="Back">←</a>' +
      '<div class="sbn-progress" aria-hidden="true"><span style="width:' +
      pct +
      '%"></span></div>' +
      '<span class="sbn-mode-tag">Part ' +
      part +
      " · " +
      (index + 1) +
      " / " +
      items.length +
      "</span>" +
      '<div class="sbn-stats">' +
      '<span class="sbn-pill" id="sbnScore">' +
      (part1Score + score) +
      "/" +
      total +
      "</span>" +
      "</div>" +
      "</div>"
    );
  }

  function updatePills() {
    var el = document.getElementById("sbnScore");
    if (el) el.textContent = part1Score + score + "/" + totalItems();
    var bar = app.querySelector(".sbn-progress > span");
    if (bar) bar.style.width = Math.min(100, Math.round(((globalIndex() + (locked ? 1 : 0)) / totalItems()) * 100)) + "%";
  }

  function render() {
    locked = false;
    renderBuilder();
  }

  function renderBuilder() {
    var item = items[order[index]];
    chipIdSeq = 0;
    allChips = shuffle(
      item.words.map(function (w) {
        return { id: chipIdSeq++, word: w };
      })
    );
    built = [];

    var phaseLabel = part === 1 ? "Full form" : "Short form";

    app.innerHTML =
      topBar(phaseLabel) +
      '<div class="sbn-play">' +
      '<div class="sbn-phase">' +
      phaseLabel +
      " · Sentence " +
      (index + 1) +
      "</div>" +
      '<div class="sbn-prompt" id="sbnCard">' +
      '<div class="sbn-prompt-label">Tap the words to build the sentence</div>' +
      '<div class="sbn-slots" id="slotsArea"></div>' +
      "</div>" +
      '<div class="sbn-chips" id="poolArea"></div>' +
      '<div class="sbn-actions">' +
      '<button type="button" class="sbn-undo" id="undoBtn" disabled>Undo</button>' +
      '<button type="button" class="sbn-check" id="checkBtn" disabled>Check</button>' +
      "</div>" +
      '<div class="sbn-feedback" id="feedback"></div>' +
      "</div>";

    paint();
    document.getElementById("undoBtn").onclick = undoLast;
    document.getElementById("checkBtn").onclick = checkAnswer;
  }

  function paint() {
    var item = items[order[index]];
    var slotsArea = document.getElementById("slotsArea");
    var poolArea = document.getElementById("poolArea");
    var undoBtn = document.getElementById("undoBtn");
    var checkBtn = document.getElementById("checkBtn");
    if (!slotsArea || !poolArea) return;

    var n = item.words.length;
    var slotsHtml = "";
    for (var s = 0; s < n; s++) {
      if (s < built.length) {
        slotsHtml +=
          '<button type="button" class="sbn-slot filled" data-idx="' +
          s +
          '" title="Remove this word">' +
          escapeHtml(built[s].word) +
          "</button>";
      } else {
        slotsHtml += '<span class="sbn-slot"></span>';
      }
    }
    slotsArea.innerHTML = slotsHtml;

    /* FIX: remove ONLY the tapped chip — not all chips after it */
    slotsArea.querySelectorAll(".sbn-slot.filled").forEach(function (slot) {
      slot.addEventListener("click", function () {
        if (locked) return;
        var idx = Number(slot.getAttribute("data-idx"));
        if (idx < 0 || idx >= built.length) return;
        built.splice(idx, 1); // single chip only
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
          '<button type="button" class="sbn-chip' +
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

    poolArea.querySelectorAll(".sbn-chip:not(.used)").forEach(function (btn) {
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
    if (built.length >= items[order[index]].words.length) return;
    built.push(chip);
    sfx("click");
    paint();
  }

  /** Undo button: remove last chip only */
  function undoLast() {
    if (locked || !built.length) return;
    built.pop();
    sfx("click");
    paint();
  }

  function checkAnswer() {
    if (locked || !built.length) return;
    locked = true;
    var item = items[order[index]];
    var attempt = built.map(function (c) {
      return c.word;
    }).join(" ");
    var ok = normalize(attempt) === normalize(item.answer);

    var card = document.getElementById("sbnCard");
    var feedback = document.getElementById("feedback");
    var undoBtn = document.getElementById("undoBtn");
    var checkBtn = document.getElementById("checkBtn");
    if (undoBtn) undoBtn.disabled = true;
    if (checkBtn) checkBtn.disabled = true;

    document.querySelectorAll("#poolArea .sbn-chip").forEach(function (b) {
      b.disabled = true;
      b.classList.add("used");
    });
    document.querySelectorAll("#slotsArea .sbn-slot").forEach(function (slot) {
      if (slot.classList.contains("filled")) {
        slot.classList.add(ok ? "correct" : "wrong");
        slot.style.cursor = "default";
      }
    });

    if (ok) {
      score += 1;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      sfx("correct");
      if (card) card.classList.add("is-correct");
      feedback.textContent = streak >= 3 ? "Correct! 🔥 ×" + streak : "Correct!";
      feedback.className = "sbn-feedback ok show";
      updatePills();
      advanceTimer = setTimeout(next, 850);
    } else {
      streak = 0;
      sfx("wrong");
      if (card) card.classList.add("is-wrong");
      setTimeout(function () {
        var correctWords = item.answer.split(" ");
        var slotsArea = document.getElementById("slotsArea");
        if (slotsArea) {
          slotsArea.innerHTML = correctWords
            .map(function (w) {
              return '<span class="sbn-slot filled correct">' + escapeHtml(w) + "</span>";
            })
            .join("");
        }
      }, 550);
      feedback.innerHTML = 'Answer: <strong>' + escapeHtml(item.answer) + "</strong>";
      feedback.className = "sbn-feedback bad show";
      updatePills();
      advanceTimer = setTimeout(next, 1700);
    }
  }

  function next() {
    clearTimer();
    if (index + 1 >= order.length) {
      if (part === 1) {
        part1Score = score;
        if (window.ArcadeFX) ArcadeFX.cheer(0, 2, "Part 1 complete — short forms next!");
        showPart2Intro();
      } else {
        finish();
      }
      return;
    }
    index += 1;
    render();
  }

  function showPart2Intro() {
    locked = false;
    app.innerHTML =
      '<div class="sbn-top">' +
      '<a class="sbn-back" href="../" aria-label="Back">←</a>' +
      '<div class="sbn-progress"><span style="width:50%"></span></div>' +
      '<span class="sbn-mode-tag">Part 1 done</span>' +
      "</div>" +
      '<div class="sbn-bridge">' +
      '<div class="sbn-hero" aria-hidden="true">✨</div>' +
      "<h2>Part 2 · Short form</h2>" +
      "<p>Now build negatives with short forms: <strong>I'm not, isn't, aren't…</strong></p>" +
      '<p class="sbn-hint">Part 1 score: <strong>' +
      part1Score +
      " / " +
      PART1.length +
      "</strong></p>" +
      '<button type="button" class="sbn-btn" id="sbnPart2">Continue</button>' +
      "</div>";
    document.getElementById("sbnPart2").onclick = function () {
      startPart(2);
    };
  }

  function finish() {
    clearTimer();
    sfx("win");
    var total = totalItems();
    var finalScore = part1Score + score;
    var stars = calcStars();
    saveProgress(stars);

    try {
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: finalScore,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: showStart,
          onModes: showStart,
          backHref: "../",
          save: false
        });
        return;
      }
    } catch (e) {}

    app.innerHTML =
      '<div class="sbn-start">' +
      '<div class="sbn-hero">🏆</div>' +
      "<h1>Done!</h1>" +
      "<p>Score: <strong>" +
      finalScore +
      " / " +
      total +
      "</strong></p>" +
      '<button type="button" class="sbn-btn" id="sbnAgain">Play again</button>' +
      "</div>";
    document.getElementById("sbnAgain").onclick = showStart;
  }

  if (window.ArcadeFX) {
    ArcadeFX.track = function () {
      return progressPct();
    };
  }

  showStart();
})();
