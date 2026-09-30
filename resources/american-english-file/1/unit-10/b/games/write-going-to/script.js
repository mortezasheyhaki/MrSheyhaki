/* ===== Arcade FX: progress bar, combo, milestone celebration ===== */
(function () {
  if (window.ArcadeFX) return;
  var streak = 0, best = 0, count = 0, lastPct = 0, ctx = null;
  var CHEERS = [["🌟","Awesome!","10 correct answers!"],["🚀","Superstar!","20 correct — unstoppable!"],["👑","Legend!","30 correct — the best of the best!"]];
  function tone(f, d, type, v, when) {
    try {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); }
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(v || 0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.03);
    } catch (e) {}
  }
  function label(n) { return n >= 10 ? "UNSTOPPABLE" : n >= 7 ? "ON FIRE" : n >= 5 ? "HOT STREAK" : n >= 3 ? "NICE" : ""; }
  function chip() {
    var el = document.getElementById("afx-combo");
    if (!el) { el = document.createElement("div"); el.id = "afx-combo"; el.className = "afx-combo"; document.body.appendChild(el); }
    return el;
  }
  function place(el) {
    el = el || document.getElementById("afx-combo");
    var app = (document.getElementById("game-app") || document.getElementById("app"));
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    if (a.offsetParent === null) a = app;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, a === app ? r.top + 64 : r.bottom + 8) + "px";
  }
  function showCombo() {
    var el = chip(); place(el);
    el.className = "afx-combo is-on" + (streak >= 5 ? " is-hot" : "");
    el.innerHTML = '<span class="afx-fire">🔥</span> x' + streak + " <em>" + label(streak) + "</em>";
    void el.offsetWidth; el.classList.add("is-bump");
  }
  function celebrate(n) { burst(CHEERS[Math.min(Math.floor(n / 10) - 1, 2)]); }
  function burst(c) {
    [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.1, i * 0.09); });
    tone(1568, 0.6, "sine", 0.08, 0.5);
    var ov = document.createElement("div"); ov.className = "afx-burst";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"], h = "";
    for (var i = 0; i < 44; i++) h += '<i style="left:' + Math.random() * 100 + "%;background:" + cols[i % 6] + ";animation-delay:" + (Math.random() * 0.35).toFixed(2) + "s;animation-duration:" + (1.3 + Math.random() * 0.9).toFixed(2) + 's"></i>';
    ov.innerHTML = h + '<div class="afx-card"><div class="afx-emoji">' + c[0] + '</div><div class="afx-title">' + c[1] + '</div><div class="afx-sub">' + c[2] + "</div></div>";
    document.body.appendChild(ov);
    setTimeout(function () { ov.classList.add("is-out"); }, 1900);
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 2300);
  }
  function hookRestart() {
    var L = window.LAFinish;
    if (L && L.startTimer && !L.__afx) { var st = L.startTimer; L.__afx = 1; L.startTimer = function () { api.reset(); return st.apply(this, arguments); }; }
  }
  var api = window.ArcadeFX = {
    track: null,
    bar: function (pct) {
      var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
      var bar = app.querySelector(".afx-bar");
      if (!bar) {
        var anchor = app.querySelector('[id*="rogress"]') || app.querySelector("header"); if (!anchor) return;
        var host = anchor.closest("header") || anchor.parentElement;
        bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
        host.parentNode.insertBefore(bar, host.nextSibling);
      }
      var fill = bar.firstChild; lastPct = pct;
      requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
    },
    ok: function () {
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0 && !api.noMilestone) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    cheer: function (i, n, sub) {
      var T = [["🎉", "Great job!"], ["🌟", "Brilliant!"], ["🏆", "Champion!"]];
      var c = T[i >= n - 1 && n > 1 ? 2 : Math.min(i, 1)];
      burst([c[0], c[1], sub || ("Part " + (i + 1) + " of " + n + " complete")]);
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"],[id*="rogress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
      if (/^(?:[A-Za-z]{1,9}\s*)?\d+\s*(?:\/|of)\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (!badge && api.track) { try { api.bar(api.track()); } catch (e) {} return; }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(?:[A-Za-z]{1,9}\s*)?(\d+)\s*(?:\/|of)\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
    if (!bar) {
      var host = badge.closest("header") || badge.parentElement;
      bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
      host.parentNode.insertBefore(bar, host.nextSibling);
    }
    var fill = bar.firstChild; lastPct = pct;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
  }
  var q = 0;
  function start() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* be + going to — 2-part practice · AEF 1 Unit 10B
   Part 1: Unscramble the sentence (word chips)
   Part 2: Write am/is/are going to
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
    function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok();
      tone(523, 0.1, "sine", 0.12, 0);
      tone(659, 0.12, "sine", 0.12, 0.08);
      tone(784, 0.18, "sine", 0.1, 0.16);
    }
    function sfxWrong() { window.ArcadeFX && ArcadeFX.bad();
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

  var GAME_ID = "1-10b-write-going-to";

  // Part 1 — unscramble full sentences
  var PART1 = [
    { words: ["I", "am", "going", "to", "study", "tonight"], answer: "I am going to study tonight" },
    { words: ["She", "is", "going", "to", "cook", "dinner"], answer: "She is going to cook dinner" },
    { words: ["They", "are", "going", "to", "play", "football"], answer: "They are going to play football" },
    { words: ["He", "is", "going", "to", "watch", "a", "movie"], answer: "He is going to watch a movie" },
    { words: ["We", "are", "going", "to", "visit", "our", "grandparents"], answer: "We are going to visit our grandparents" },
    { words: ["You", "are", "going", "to", "clean", "your", "room"], answer: "You are going to clean your room" },
    { words: ["My", "parents", "are", "going", "to", "travel", "next", "week"], answer: "My parents are going to travel next week" },
    { words: ["Tom", "is", "going", "to", "buy", "a", "new", "phone"], answer: "Tom is going to buy a new phone" },
    { words: ["The", "students", "are", "going", "to", "have", "a", "test"], answer: "The students are going to have a test" },
    { words: ["Anna", "and", "Sara", "are", "going", "to", "go", "shopping"], answer: "Anna and Sara are going to go shopping", alts: ["Sara and Anna are going to go shopping"] }
  ];

  // Part 2 — write am/is/are going to
  var PART2 = [
    { before: "I", after: "study English.", correct: "am going to" },
    { before: "She", after: "cook dinner.", correct: "is going to" },
    { before: "They", after: "play tennis.", correct: "are going to" },
    { before: "He", after: "watch TV.", correct: "is going to" },
    { before: "We", after: "visit our friends.", correct: "are going to" },
    { before: "You", after: "buy a new shirt.", correct: "are going to" },
    { before: "My father", after: "wash the car.", correct: "is going to" },
    { before: "The children", after: "play outside.", correct: "are going to" },
    { before: "I", after: "make a sandwich.", correct: "am going to" },
    { before: "Sarah", after: "read a book.", correct: "is going to" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var part = 1;
  var items = PART1;
  var order = [];
  var index = 0;
  var score = 0;
  var streak = 0;
  var bestStreak = 0;
  var part1Score = 0;
  var locked = false;
  var advanceTimer = null;

  // Unscramble state
  var allChips = [];  // full chip set for current sentence
  var pool = [];
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
    if (window.ArcadeFX) { if (name === "good" || name === "correct") ArcadeFX.ok(); else if (name === "bad" || name === "wrong") ArcadeFX.bad(); }
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
      .replace(/\s+/g, " ")
      .replace(/[’']/g, "'")
      .replace(/\.+$/, "");
  }

  function isWriteCorrect(input, expected) {
    var n = normalize(input);
    var e = normalize(expected);
    if (n === e) return true;
    if (n.replace(/\s/g, "") === e.replace(/\s/g, "")) return true;
    return false;
  }

  function totalItems() {
    return PART1.length + PART2.length;
  }

  function globalProgress() {
    return (part === 1 ? 0 : PART1.length) + index;
  }

  function showStart() {
    clearTimer();
    locked = false;
    part = 1;
    app.innerHTML =
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      '<div class="wgt-title-wrap">' +
      '<div class="wgt-kicker">Unit 10B · Grammar</div>' +
      '<h1 class="wgt-title">be + going to</h1>' +
      "</div></div>" +
      '<div class="wgt-start">' +
      '<div class="wgt-hero" aria-hidden="true">🚀</div>' +
      "<h1>be + going to</h1>" +
      "<p>Two parts · 20 questions</p>" +
      '<div class="wgt-parts">' +
      '<div class="wgt-part-card"><span class="wgt-part-num">1</span><strong>Unscramble</strong><span>Tap words in order</span></div>' +
      '<div class="wgt-part-card"><span class="wgt-part-num">2</span><strong>Write</strong><span>be + going to</span></div>' +
      "</div>" +
      '<button type="button" class="wgt-btn" id="startBtn">Start Part 1</button>' +
      "</div>";
    document.getElementById("startBtn").onclick = function () {
      startPart(1);
    };
  }

  function startPart(p) {
    part = p;
    items = part === 1 ? PART1 : PART2;
    order = shuffle(items.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    streak = 0;
    locked = false;
    clearTimer();
    if (part === 1) {
      part1Score = 0;
      try {
        if (window.LAFinish) LAFinish.startTimer();
      } catch (_) {}
    }
    sfx("click");
    render();
  }

  function showPart2Intro() {
    clearTimer();
    locked = false;
    app.innerHTML =
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      '<div class="wgt-title-wrap">' +
      '<div class="wgt-kicker">Unit 10B · Grammar</div>' +
      '<h1 class="wgt-title">Part 2</h1>' +
      "</div></div>" +
      '<div class="wgt-start">' +
      '<div class="wgt-hero" aria-hidden="true">✍️</div>' +
      "<h1>Part 2 · Write</h1>" +
      "<p>Type <strong>am going to</strong>, <strong>is going to</strong>, or <strong>are going to</strong>.</p>" +
      '<div class="wgt-hint">Part 1 score: <strong>' + part1Score + " / " + PART1.length + "</strong></div>" +
      '<button type="button" class="wgt-btn" id="startP2">Start Part 2</button>' +
      "</div>";
    document.getElementById("startP2").onclick = function () {
      startPart(2);
    };
  }

  function topBar(title) {
    var gDone = globalProgress();
    var gTotal = totalItems();
    var pct = ((gDone + 1) / gTotal) * 100;
    return (
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      '<div class="wgt-progress"><span style="width:' + pct + '%"></span></div>' +
      '<span class="wgt-mode-tag">Part ' + part + " · " + (index + 1) + " / " + items.length + "</span>" +
      "</div>"
    );
  }

  function updatePills() {
    var st = document.getElementById("streakPill");
    if (st) {
      st.textContent = streak > 0 ? "🔥 " + streak : "—";
      st.className = "wgt-pill streak" + (streak >= 3 ? " is-hot" : "");
    }
  }

  function render() {
    clearTimer();
    locked = false;
    if (part === 1) renderUnscramble();
    else renderWrite();
  }

  /* ===== PART 1: Unscramble ===== */
  function renderUnscramble() {
    var item = items[order[index]];
    chipIdSeq = 0;
    allChips = shuffle(
      item.words.map(function (w) {
        return { id: chipIdSeq++, word: w };
      })
    );
    pool = allChips.slice(); // kept for compatibility
    built = [];

    app.innerHTML =
      topBar("Unscramble") +
      '<div class="wgt-play">' +
      '<div class="wgt-phase">Unscramble · Sentence ' + (index + 1) + "</div>" +
      '<div class="su-prompt" id="wgtCard">' +
      '<div class="su-prompt-label">Tap the words to build the sentence</div>' +
      '<div class="su-slots" id="slotsArea"></div>' +
      "</div>" +
      '<div class="su-chips" id="poolArea"></div>' +
      '<div class="wgt-actions">' +
      '<button type="button" class="wgt-undo" id="undoBtn" disabled>Undo</button>' +
      '<button type="button" class="wgt-check" id="checkBtn" disabled>Check</button>' +
      "</div>" +
      '<div class="wgt-feedback" id="feedback"></div>' +
      "</div>";

    paintUnscramble();
    document.getElementById("undoBtn").onclick = undoChip;
    document.getElementById("checkBtn").onclick = checkUnscramble;
  }

  function paintUnscramble() {
    var item = items[order[index]];
    var slotsArea = document.getElementById("slotsArea");
    var poolArea = document.getElementById("poolArea");
    var undoBtn = document.getElementById("undoBtn");
    var checkBtn = document.getElementById("checkBtn");
    var n = item.words.length;

    // Fixed empty slots matching sentence length
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
    slotsArea.innerHTML = slotsHtml;

    slotsArea.querySelectorAll(".su-slot.filled").forEach(function (slot) {
      slot.addEventListener("click", function () {
        if (locked) return;
        var idx = Number(slot.getAttribute("data-idx"));
        while (built.length > idx) built.pop();
        sfx("click");
        paintUnscramble();
      });
    });

    // All chips stay visible; used ones get .used (dimmed in place)
    var usedIds = {};
    built.forEach(function (c) { usedIds[c.id] = true; });

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
    // already used?
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
    paintUnscramble();
  }

  function undoChip() {
    if (locked || !built.length) return;
    built.pop();
    sfx("click");
    paintUnscramble();
  }

  function checkUnscramble() {
    if (locked || !built.length) return;
    locked = true;
    var item = items[order[index]];
    var attempt = built.map(function (c) { return c.word; }).join(" ");
    var ok = normalize(attempt) === normalize(item.answer);
    if (!ok && item.alts) {
      for (var ai = 0; ai < item.alts.length; ai++) {
        if (normalize(attempt) === normalize(item.alts[ai])) {
          ok = true;
          break;
        }
      }
    }

    var card = document.getElementById("wgtCard");
    var feedback = document.getElementById("feedback");
    var undoBtn = document.getElementById("undoBtn");
    var checkBtn = document.getElementById("checkBtn");
    undoBtn.disabled = true;
    checkBtn.disabled = true;

    document.querySelectorAll("#poolArea .su-chip").forEach(function (b) {
      b.disabled = true;
      b.classList.add("used");
    });
    document.querySelectorAll("#slotsArea .su-slot").forEach(function (slot) {
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
      feedback.textContent = streak >= 3 ? "Correct! 🔥 " + streak : "Correct!";
      feedback.className = "wgt-feedback ok show";
      updatePills();
      advanceTimer = setTimeout(next, 850);
    } else {
      streak = 0;
      sfx("wrong");
      if (card) card.classList.add("is-wrong");
      // reveal correct words into slots
      setTimeout(function () {
        var correctWords = item.answer.split(" ");
        var slotsArea = document.getElementById("slotsArea");
        if (slotsArea) {
          slotsArea.innerHTML = correctWords
            .map(function (w) {
              return '<span class="su-slot filled correct">' + escapeHtml(w) + "</span>";
            })
            .join("");
        }
      }, 600);
      feedback.innerHTML =
        'Answer: <strong>' + escapeHtml(item.answer) + "</strong>";
      feedback.className = "wgt-feedback bad show";
      updatePills();
      advanceTimer = setTimeout(next, 1800);
    }
  }

  /* ===== PART 2: Write ===== */
  function renderWrite() {
    var item = items[order[index]];
    app.innerHTML =
      topBar("Write going to") +
      '<div class="wgt-play">' +
      '<div class="wgt-phase">Write · Sentence ' + (index + 1) + "</div>" +
      '<div class="su-prompt" id="wgtCard">' +
      '<p class="wgt-sentence">' +
      escapeHtml(item.before) +
      ' <span class="wgt-blank" id="blank">___ ___ ___</span> ' +
      escapeHtml(item.after) +
      "</p>" +
      "</div>" +
      '<div class="wgt-input-wrap">' +
      '<input class="wgt-input" id="answerInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="am / is / are going to" maxlength="40" />' +
      '<button type="button" class="wgt-check" id="checkBtn">Check</button>' +
      "</div>" +
      '<div class="wgt-feedback" id="feedback"></div>' +
      "</div>";

    var input = document.getElementById("answerInput");
    var checkBtn = document.getElementById("checkBtn");
    input.focus();
    checkBtn.onclick = submitWrite;
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitWrite();
      }
    });
  }

  function submitWrite() {
    if (locked) return;
    var input = document.getElementById("answerInput");
    var val = String(input.value || "").trim();
    if (!val) {
      input.focus();
      sfx("wrong");
      var fb = document.getElementById("feedback");
      fb.textContent = "Type your answer first.";
      fb.className = "wgt-feedback bad show";
      return;
    }

    locked = true;
    var item = items[order[index]];
    var ok = isWriteCorrect(val, item.correct);
    var card = document.getElementById("wgtCard");
    var blank = document.getElementById("blank");
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
      if (blank) {
        blank.textContent = item.correct;
        blank.classList.add("ok");
      }
      feedback.textContent = streak >= 3 ? "Correct! 🔥 " + streak : "Correct!";
      feedback.className = "wgt-feedback ok show";
      updatePills();
      advanceTimer = setTimeout(next, 800);
    } else {
      streak = 0;
      sfx("wrong");
      if (card) card.classList.add("is-wrong");
      if (blank) {
        blank.textContent = val;
        blank.classList.add("bad");
        setTimeout(function () {
          blank.textContent = item.correct;
          blank.classList.remove("bad");
          blank.classList.add("ok");
        }, 550);
      }
      feedback.textContent = "Answer: " + item.correct;
      feedback.className = "wgt-feedback bad show";
      updatePills();
      advanceTimer = setTimeout(next, 1500);
    }
  }

  function next() {
    clearTimer();
    if (index + 1 >= order.length) {
      if (part === 1) {
        part1Score = score;
        if (window.ArcadeFX) ArcadeFX.cheer(0, 2, "Part 1 complete — halfway there!");
        showPart2Intro();
      } else {
        finish();
      }
      return;
    }
    index += 1;
    render();
  }

  function finish() {
    clearTimer();
    sfx("win");
    var total = totalItems();
    var finalScore = part1Score + score;
    try {
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: finalScore,
          total: total,
          timeMs: timeMs,
          onAgain: showStart,
          onModes: showStart,
          backHref: "../",
          save: true
        });
        return;
      }
    } catch (_) {}
    // Fallback when LAFinish is unavailable
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, Math.round((finalScore / total) * 100));
      }
    } catch (_) {}

    app.innerHTML =
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      '<div class="wgt-title-wrap">' +
      '<div class="wgt-kicker">Unit 10B · Grammar</div>' +
      '<h1 class="wgt-title">Complete!</h1>' +
      "</div></div>" +
      '<div class="wgt-done">' +
      '<div class="trophy" aria-hidden="true">🏆</div>' +
      "<h1>Well done!</h1>" +
      '<div class="wgt-score-big">' + finalScore + " / " + total + "</div>" +
      "<p>Part 1: " + part1Score + "/" + PART1.length +
      " · Part 2: " + score + "/" + PART2.length + "</p>" +
      (bestStreak > 1 ? "<p>Best streak: " + bestStreak + "</p>" : "") +
      '<button type="button" class="wgt-btn" id="againBtn">Play again</button>' +
      "</div>";
    document.getElementById("againBtn").onclick = showStart;
  }

  showStart();
})();
