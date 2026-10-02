/* ===== Arcade FX ===== */
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
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(v || 0.09, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + d + 0.03);
    } catch (e) {}
  }
  function label(n) {
    return n >= 10 ? "UNSTOPPABLE" : n >= 7 ? "ON FIRE" : n >= 5 ? "HOT STREAK" : n >= 3 ? "NICE" : "";
  }
  function chipEl() {
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
    var app = document.getElementById("game-app");
    if (!el || !app) return;
    var a = app.querySelector(".sbn-top") || app.firstElementChild;
    if (!a) return;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, r.bottom + 8) + "px";
  }
  function showCombo() {
    var el = chipEl();
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
    var ov = document.createElement("div");
    ov.className = "afx-burst";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"], h = "";
    for (var i = 0; i < 40; i++) {
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
  var api = (window.ArcadeFX = {
    track: null,
    bar: function () {},
    ok: function () {
      var nw = Date.now();
      if (nw - (api._o || 0) < 90) return;
      api._o = nw;
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
      if (streak >= 2) {
        var el = chipEl();
        el.className = "afx-combo is-lost";
        el.textContent = "Combo lost";
        setTimeout(function () {
          el.className = "afx-combo";
        }, 1200);
      }
      streak = 0;
    },
    cheer: function (i, n, sub) {
      var T = [["🎉", "Great job!"], ["🌟", "Brilliant!"], ["🏆", "Champion!"]];
      var c = T[i >= n - 1 && n > 1 ? 2 : Math.min(i, 1)];
      burst([c[0], c[1], sub || "Part " + (i + 1) + " of " + n + " complete"]);
    },
    reset: function () {
      streak = 0;
      best = 0;
      count = 0;
      var el = document.getElementById("afx-combo");
      if (el) el.className = "afx-combo";
    }
  });
  window.ArcadeFX.noMilestone = true;
})();

/* Question Builder · be · AEF Starter Unit 2A
   Part 1: build questions (Am I…? Are you…?)
   Part 2: see statement → build question → build short answer (Yes, I am.) with no/not distractors
*/
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
      var osc = c.createOscillator(), gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    window.sfxTap = function () {
      tone(520, 0.06, "triangle", 0.08);
    };
    window.sfxCorrect = function () {
      if (window.ArcadeFX) ArcadeFX.ok();
      tone(523, 0.1, "sine", 0.12, 0);
      tone(659, 0.12, "sine", 0.12, 0.08);
      tone(784, 0.18, "sine", 0.1, 0.16);
    };
    window.sfxWrong = function () {
      if (window.ArcadeFX) ArcadeFX.bad();
      tone(220, 0.14, "sawtooth", 0.07, 0);
      tone(180, 0.18, "sawtooth", 0.06, 0.1);
    };
    window.sfxCelebrate = function () {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone(f, 0.15, "sine", 0.1, i * 0.07);
      });
    };
  })();

  function sfx(name) {
    if (name === "correct" && window.sfxCorrect) sfxCorrect();
    else if (name === "wrong" && window.sfxWrong) sfxWrong();
    else if (name === "click" && window.sfxTap) sfxTap();
    else if (name === "win" && window.sfxCelebrate) sfxCelebrate();
  }

  var GAME_ID = "starter-2a-sentence-builder-be-questions";

  // Part 1 — build questions only
  var PART1 = [
    { words: ["Am", "I", "in", "room", "2", "?"], answer: "Am I in room 2?" },
    { words: ["Are", "you", "Linda", "?"], answer: "Are you Linda?" },
    { words: ["Is", "he", "Brazilian", "?"], answer: "Is he Brazilian?" },
    { words: ["Is", "she", "from", "Peru", "?"], answer: "Is she from Peru?" },
    { words: ["Is", "it", "good", "?"], answer: "Is it good?" },
    { words: ["Are", "we", "late", "?"], answer: "Are we late?" },
    { words: ["Are", "you", "from", "the", "UK", "?"], answer: "Are you from the UK?" },
    { words: ["Are", "they", "Mexican", "?"], answer: "Are they Mexican?" }
  ];

  // Part 2 — show question only; build mixed Yes/No short answers (word chips only)
  // Yes: Yes + pronoun + be (3 chips)
  // No:  No + pronoun + be + n't  OR  No + I + 'm + not
  var PART2 = [
    {
      question: "Am I in room 2?",
      words: ["Yes", "you", "are", "No", "not"],
      answer: "Yes, you are",
      need: 3
    },
    {
      question: "Are you Linda?",
      words: ["No", "I", "'m", "not", "Yes", "am"],
      answer: "No, I'm not",
      need: 4
    },
    {
      question: "Is he Brazilian?",
      words: ["Yes", "he", "is", "No", "n't"],
      answer: "Yes, he is",
      need: 3
    },
    {
      question: "Is she from Peru?",
      words: ["No", "she", "is", "n't", "Yes", "not"],
      answer: "No, she isn't",
      need: 4
    },
    {
      question: "Is it good?",
      words: ["Yes", "it", "is", "No", "n't"],
      answer: "Yes, it is",
      need: 3
    },
    {
      question: "Are we late?",
      words: ["No", "we", "are", "n't", "Yes", "not"],
      answer: "No, we aren't",
      need: 4
    },
    {
      question: "Are you from the UK?",
      words: ["Yes", "I", "am", "No", "not"],
      answer: "Yes, I am",
      need: 3
    },
    {
      question: "Are they Mexican?",
      words: ["No", "they", "are", "n't", "Yes", "not"],
      answer: "No, they aren't",
      need: 4
    }
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

  function progressUnitsDone() {
    return (part === 1 ? 0 : PART1.length) + index;
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
      // join "are n't" / "is n't" → "aren't" / "isn't"
      .replace(/\s+n'?t\b/g, "n't")
      // join "i 'm" → "i'm"
      .replace(/\bi\s*'m\b/g, "i'm")
      // punctuation → space (never glue words together)
      .replace(/[.,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function clearTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function calcStars() {
    var total = totalItems();
    var got = part1Score + score;
    if (got >= total) return 3;
    if (got >= Math.ceil(total * 0.66)) return 2;
    if (got >= Math.ceil(total * 0.33)) return 1;
    return 0;
  }

  function saveProgress(stars) {
    try {
      if (typeof window.laSaveProgress === "function") {
        window.laSaveProgress(GAME_ID, {
          score: part1Score + score,
          total: totalItems(),
          stars: stars
        });
      }
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        if (typeof LAStars.save === "function") LAStars.save(GAME_ID, stars);
        else if (typeof LAStars.saveFromAccuracy === "function") {
          LAStars.saveFromAccuracy(
            GAME_ID,
            Math.round(((part1Score + score) / totalItems()) * 100)
          );
        }
      }
    } catch (e) {}
  }

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
      '<div class="sbn-hero" aria-hidden="true">❓</div>' +
      "<h1>Question Builder</h1>" +
      "<p>Build <strong>am / is / are</strong> questions, then answer with <strong>Yes</strong> or <strong>No</strong> short forms.</p>" +
      '<div class="sbn-parts">' +
      '<div class="sbn-part-card"><span class="sbn-part-num">1</span><strong>Questions</strong><span>Are you Linda?</span></div>' +
      '<div class="sbn-part-card"><span class="sbn-part-num">2</span><strong>Short answers</strong><span>Yes, I am / No, I\'m not</span></div>' +
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
    order = shuffle(
      items.map(function (_, i) {
        return i;
      })
    );
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

  function topBar() {
    var done = progressUnitsDone();
    var total = totalItems();
    var pct = Math.min(100, Math.round((done / total) * 100));
    var tag =
      part === 1
        ? "Part 1 · " + (index + 1) + " / " + items.length
        : "Part 2 · " + (index + 1) + " / " + items.length;
    return (
      '<div class="sbn-top">' +
      '<a class="sbn-back" href="../" aria-label="Back">←</a>' +
      '<div class="sbn-progress" aria-hidden="true"><span style="width:' +
      pct +
      '%"></span></div>' +
      '<span class="sbn-mode-tag">' +
      tag +
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
    if (bar) {
      bar.style.width =
        Math.min(100, Math.round(((progressUnitsDone() + (locked ? 1 : 0)) / totalItems()) * 100)) +
        "%";
    }
  }

  function render() {
    locked = false;
    if (part === 1) renderPart1();
    else renderPart2();
  }

  /* ---------- PART 1: build question ---------- */
  function renderPart1() {
    var item = items[order[index]];
    setupChips(item.words);
    app.innerHTML =
      topBar() +
      '<div class="sbn-play">' +
      '<div class="sbn-phase">Build the question · ' +
      (index + 1) +
      "</div>" +
      '<div class="sbn-prompt" id="sbnCard">' +
      '<div class="sbn-prompt-label">Tap the chips in order</div>' +
      '<div class="sbn-slots" id="slotsArea"></div>' +
      "</div>" +
      '<div class="sbn-chips" id="poolArea"></div>' +
      '<div class="sbn-actions">' +
      '<button type="button" class="sbn-undo" id="undoBtn" disabled>Undo</button>' +
      '<button type="button" class="sbn-check" id="checkBtn" disabled>Check</button>' +
      "</div>" +
      '<div class="sbn-feedback" id="feedback"></div>' +
      "</div>";
    paint(item.words.length);
    document.getElementById("undoBtn").onclick = undoLast;
    document.getElementById("checkBtn").onclick = function () {
      checkBuilt(item.answer, function () {
        nextAfterPart1();
      });
    };
  }

  /* ---------- PART 2: statement → question → short answer ---------- */
  function renderPart2() {
    var item = items[order[index]];
    setupChips(item.words);
    app.innerHTML =
      topBar() +
      '<div class="sbn-play">' +
      '<div class="sbn-phase">Short answer · ' +
      (index + 1) +
      "</div>" +
      '<div class="sbn-prompt" id="sbnCard">' +
      '<div class="sbn-prompt-label">Question</div>' +
      '<p class="sbn-statement sbn-q-show">' +
      escapeHtml(item.question) +
      "</p>" +
      '<div class="sbn-prompt-label" style="margin-top:14px">Build the short answer</div>' +
      '<div class="sbn-slots" id="slotsArea"></div>' +
      "</div>" +
      '<div class="sbn-chips" id="poolArea"></div>' +
      '<div class="sbn-actions">' +
      '<button type="button" class="sbn-undo" id="undoBtn" disabled>Undo</button>' +
      '<button type="button" class="sbn-check" id="checkBtn" disabled>Check</button>' +
      "</div>" +
      '<div class="sbn-feedback" id="feedback"></div>' +
      "</div>";
    paint(item.need);
    document.getElementById("undoBtn").onclick = undoLast;
    document.getElementById("checkBtn").onclick = function () {
      checkBuilt(item.answer, function () {
        nextAfterPart2();
      });
    };
  }

  function setupChips(words) {
    chipIdSeq = 0;
    allChips = shuffle(
      words.map(function (w) {
        return { id: chipIdSeq++, word: w };
      })
    );
    built = [];
  }

  function paint(needCount) {
    var slotsArea = document.getElementById("slotsArea");
    var poolArea = document.getElementById("poolArea");
    var undoBtn = document.getElementById("undoBtn");
    var checkBtn = document.getElementById("checkBtn");
    if (!slotsArea || !poolArea) return;

    var n = needCount;
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

    // Single-chip undo only
    slotsArea.querySelectorAll(".sbn-slot.filled").forEach(function (slot) {
      slot.addEventListener("click", function () {
        if (locked) return;
        var idx = Number(slot.getAttribute("data-idx"));
        if (idx < 0 || idx >= built.length) return;
        built.splice(idx, 1);
        sfx("click");
        paint(n);
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
        pickChip(Number(btn.getAttribute("data-id")), n);
      });
    });

    undoBtn.disabled = locked || !built.length;
    checkBtn.disabled = locked || built.length < n;
  }

  function pickChip(id, needCount) {
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
    if (built.length >= needCount) return;
    built.push(chip);
    sfx("click");
    paint(needCount);
  }

  function undoLast() {
    if (locked || !built.length) return;
    built.pop();
    sfx("click");
    // re-paint with same slot count from current need
    var slots = document.querySelectorAll("#slotsArea .sbn-slot, #slotsArea .sbn-slot.filled");
    // count empty+filled = need
    var need = document.querySelectorAll("#slotsArea > *").length;
    paint(need);
  }

  function checkBuilt(correctAnswer, onOk, needOverride) {
    if (locked || !built.length) return;
    locked = true;
    var attempt = built
      .map(function (c) {
        return c.word;
      })
      .join(" ");
    // Join punctuation tightly for normalize
    attempt = attempt
      .replace(/\s+,/g, ",")
      .replace(/\s+\./g, ".")
      .replace(/\s+\?/g, "?");
    var ok = normalize(attempt) === normalize(correctAnswer);

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
      advanceTimer = setTimeout(onOk, 800);
    } else {
      streak = 0;
      sfx("wrong");
      if (card) card.classList.add("is-wrong");
      setTimeout(function () {
        var slotsArea = document.getElementById("slotsArea");
        if (slotsArea) {
          // show correct tokens
          var show = correctAnswer
            .replace(/([,?!.])/g, " $1")
            .trim()
            .split(/\s+/);
          slotsArea.innerHTML = show
            .map(function (w) {
              return '<span class="sbn-slot filled correct">' + escapeHtml(w) + "</span>";
            })
            .join("");
        }
      }, 500);
      feedback.innerHTML = 'Answer: <strong>' + escapeHtml(correctAnswer) + "</strong>";
      feedback.className = "sbn-feedback bad show";
      updatePills();
      advanceTimer = setTimeout(onOk, 1600);
    }
  }

  function nextAfterPart1() {
    clearTimer();
    if (index + 1 >= order.length) {
      part1Score = score;
      if (window.ArcadeFX) ArcadeFX.cheer(0, 2, "Part 1 complete — Yes / No answers next!");
      showPart2Intro();
      return;
    }
    index += 1;
    render();
  }

  function nextAfterPart2() {
    clearTimer();
    if (index + 1 >= order.length) {
      finish();
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
      '<div class="sbn-progress"><span style="width:33%"></span></div>' +
      '<span class="sbn-mode-tag">Part 1 done</span>' +
      "</div>" +
      '<div class="sbn-bridge">' +
      '<div class="sbn-hero" aria-hidden="true">💬</div>' +
      "<h2>Part 2 · Short answers</h2>" +
      "<p>Read the question. Answer with <strong>Yes, …</strong> or <strong>No, …</strong> (use <em>n't</em> / <em>not</em> for negatives).</p>" +
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

  showStart();
})();
