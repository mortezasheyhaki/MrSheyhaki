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
  function celebrate(n) {
    var c = CHEERS[Math.min(Math.floor(n / 10) - 1, 2)];
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
    ok: function () {
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
      if (/^\d+\s*\/\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(\d+)\s*\/\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
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

/* Meal Sentences – complete positive & negative meal sentences · AEF Starter 5A */
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

var GAME_ID = "starter-5a-food-meal-sentences";

  /**
   * 6 rounds: + and − for breakfast, lunch, dinner.
   * answers = required chip labels (order-free).
   * pool = answers + distractors.
   * template uses ___ for each blank.
   */
  /**
   * allowed = words that may fill the blanks (any combination, correct count).
   * pool = allowed + distractors shown as chips.
   */
  var ROUNDS = [
    {
      meal: "Breakfast",
      kind: "positive",
      template: "For breakfast, I have ___, ___ and ___.",
      allowed: ["cereal", "bread", "eggs", "milk", "coffee"],
      pool: ["cereal", "bread", "eggs", "milk", "coffee", "meat", "pasta", "fish"]
    },
    {
      meal: "Breakfast",
      kind: "negative",
      template: "For breakfast, I don't have ___ or ___.",
      allowed: ["meat", "pasta", "yogurt", "fish", "salad"],
      pool: ["meat", "pasta", "yogurt", "fish", "salad", "coffee", "tea", "bread"]
    },
    {
      meal: "Lunch",
      kind: "positive",
      template: "For lunch, I have ___, ___ and ___.",
      allowed: ["water", "fruit", "rice", "a sandwich", "salad"],
      pool: ["water", "fruit", "rice", "a sandwich", "salad", "cereal", "coffee", "eggs"]
    },
    {
      meal: "Lunch",
      kind: "negative",
      template: "For lunch, I don't have ___ or ___.",
      allowed: ["butter", "tea", "cheese", "cereal"],
      pool: ["butter", "tea", "cheese", "cereal", "salad", "meat", "pasta"]
    },
    {
      meal: "Dinner",
      kind: "positive",
      template: "For dinner, I have ___, ___ and ___.",
      allowed: ["yogurt", "meat", "fish", "vegetables", "pasta", "rice"],
      pool: ["yogurt", "meat", "fish", "vegetables", "pasta", "rice", "cereal", "coffee"]
    },
    {
      meal: "Dinner",
      kind: "negative",
      template: "For dinner, I don't have ___ or ___.",
      allowed: ["tea", "orange juice"],
      pool: ["tea", "orange juice", "meat", "pasta", "salad", "bread", "cereal"]
    }
  ];

  var TOTAL = ROUNDS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var index = 0;
  var slots = []; // filled labels
  var poolOrder = [];
  var used = {}; // label -> count used (for duplicates)
  var locked = false;
  var score = 0;
  var sfxCtx = null;

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
    try {
      if (window.LASfx && LASfx.click) LASfx.click();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(640, ctx.currentTime, 0.05, "sine", 0.07);
  }

  function sfxOk() { window.ArcadeFX && ArcadeFX.ok();
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

  function sfxBad() { window.ArcadeFX && ArcadeFX.bad();
    try {
      if (window.LASfx && LASfx.wrong) LASfx.wrong();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(200, ctx.currentTime, 0.12, "sawtooth", 0.06);
  }

  function blankCount(tpl) {
    return (tpl.match(/___/g) || []).length;
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    index = 0;
    score = 0;
    phase = "play";
    startRound();
  }

  function startRound() {
    if (index >= TOTAL) {
      finishGame();
      return;
    }
    locked = false;
    var r = ROUNDS[index];
    slots = new Array(blankCount(r.template)).fill(null);
    poolOrder = shuffle(r.pool.slice());
    used = {};
    render();
  }

  function firstEmpty() {
    for (var i = 0; i < slots.length; i++) if (slots[i] == null) return i;
    return -1;
  }

  function pickChip(label) {
    if (locked) return;
    var i = firstEmpty();
    if (i < 0) return;
    sfxTap();
    slots[i] = label;
    used[label] = (used[label] || 0) + 1;
    updateUI();
  }

  function clearSlot(i) {
    if (locked) return;
    if (slots[i] == null) return;
    sfxTap();
    var label = slots[i];
    slots[i] = null;
    used[label] = Math.max(0, (used[label] || 1) - 1);
    updateUI();
    var fb = document.getElementById("ms-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "ms-fb";
    }
  }

  function clearAll() {
    if (locked) return;
    sfxTap();
    slots = slots.map(function () {
      return null;
    });
    used = {};
    updateUI();
    var fb = document.getElementById("ms-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "ms-fb";
    }
  }

  function sameMultiset(a, b) {
    if (a.length !== b.length) return false;
    var ca = {};
    var cb = {};
    a.forEach(function (x) {
      ca[x] = (ca[x] || 0) + 1;
    });
    b.forEach(function (x) {
      cb[x] = (cb[x] || 0) + 1;
    });
    var keys = Object.keys(ca);
    if (keys.length !== Object.keys(cb).length) return false;
    for (var i = 0; i < keys.length; i++) {
      if (ca[keys[i]] !== cb[keys[i]]) return false;
    }
    return true;
  }

  function checkAnswer() {
    if (locked) return;
    var r = ROUNDS[index];
    if (slots.some(function (s) {
      return s == null;
    })) {
      var fb0 = document.getElementById("ms-fb");
      if (fb0) {
        fb0.textContent = "Fill every blank first.";
        fb0.className = "ms-fb bad";
      }
      return;
    }

    // Any words from the allowed list, no duplicates, full blanks
    var allowed = r.allowed;
    var ok = true;
    var seen = {};
    for (var i = 0; i < slots.length; i++) {
      var w = slots[i];
      if (allowed.indexOf(w) < 0) {
        ok = false;
        break;
      }
      if (seen[w]) {
        ok = false;
        break;
      }
      seen[w] = true;
    }
    if (!ok) { try{sfxWrong();}catch(e){}
      sfxBad();
      locked = true;
      document.querySelectorAll(".ms-blank.is-filled").forEach(function (el) {
        el.classList.add("bad");
      });
      var fb = document.getElementById("ms-fb");
      if (fb) {
        fb.textContent = "Not quite — use the meal words from the list.";
        fb.className = "ms-fb bad";
      }
      setTimeout(function () {
        locked = false;
        document.querySelectorAll(".ms-blank").forEach(function (el) {
          el.classList.remove("bad");
        });
      }, 550);
      return;
    }

    locked = true;
    sfxOk();
    score += 1;
    document.querySelectorAll(".ms-blank").forEach(function (el) {
      el.classList.add("ok");
    });
    var fb2 = document.getElementById("ms-fb");
    if (fb2) {
      fb2.textContent = "✓ Correct!";
      fb2.className = "ms-fb ok";
    }
    setTimeout(function () {
      index += 1;
      startRound();
    }, 850);
  }

  function finishGame() {
    phase = "done";
    var stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.7) ? 2 : score >= Math.ceil(TOTAL * 0.4) ? 1 : 0;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () {
            phase = "start";
            render();
          },
          backHref: "../"
        });
        return;
      } catch (e) {
        console.warn(e);
      }
    }
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (stars > 0) LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
    render();
  }

  function buildSentenceHtml(tpl, slotLabels) {
    var parts = tpl.split("___");
    var html = "";
    var si = 0;
    for (var i = 0; i < parts.length; i++) {
      html += '<span class="ms-text">' + escapeHtml(parts[i]) + "</span>";
      if (i < parts.length - 1) {
        var val = slotLabels[si];
        var filled = val != null;
        html +=
          '<button type="button" class="ms-blank' +
          (filled ? " is-filled" : "") +
          '" data-slot="' +
          si +
          '">' +
          (filled ? escapeHtml(val) : "") +
          "</button>";
        si++;
      }
    }
    return html;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateUI() {
    var sent = document.getElementById("ms-sentence");
    if (sent) {
      sent.innerHTML = buildSentenceHtml(ROUNDS[index].template, slots);
      sent.querySelectorAll(".ms-blank").forEach(function (btn) {
        btn.onclick = function () {
          clearSlot(+btn.getAttribute("data-slot"));
        };
      });
    }

    var poolEl = document.getElementById("ms-pool");
    if (poolEl) {
      var counts = {};
      poolOrder.forEach(function (label) {
        counts[label] = (counts[label] || 0) + 1;
      });
      var usedCounts = used;
      var shown = {};
      poolEl.innerHTML = poolOrder
        .map(function (label) {
          if (shown[label]) return "";
          shown[label] = true;
          var total = counts[label];
          var u = usedCounts[label] || 0;
          var disabled = u >= total;
          return (
            '<button type="button" class="ms-chip' +
            (disabled ? " is-used" : "") +
            '" data-label="' +
            escapeHtml(label) +
            '"' +
            (disabled ? " disabled" : "") +
            ">" +
            escapeHtml(label) +
            "</button>"
          );
        })
        .join("");
      poolEl.querySelectorAll(".ms-chip:not(.is-used)").forEach(function (btn) {
        btn.onclick = function () {
          pickChip(btn.getAttribute("data-label"));
        };
      });
    }
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="ms-topbar">' +
        '<a class="ms-back" href="../" aria-label="Back">←</a>' +
        '<span class="ms-title">Meal Sentences</span>' +
        '<span class="ms-badge">5A</span></header>' +
        '<section class="ms-start">' +
        '<div class="ms-hero" aria-hidden="true">🍽️</div>' +
        "<h1>Meal Sentences</h1>" +
        '<p class="ms-sub">Complete positive and negative sentences for breakfast, lunch and dinner.</p>' +
        '<button type="button" class="ms-btn" id="ms-start">Start</button>' +
        "</section>";
      document.getElementById("ms-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      var stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.7) ? 2 : score >= Math.ceil(TOTAL * 0.4) ? 1 : 0;
      app.innerHTML =
        '<header class="ms-topbar">' +
        '<a class="ms-back" href="../" aria-label="Back">←</a>' +
        '<span class="ms-title">Meal Sentences</span>' +
        '<span class="ms-badge">Done</span></header>' +
        '<section class="ms-start">' +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep practicing!") +
        "</h1>" +
        '<p class="ms-sub">You completed <strong>' +
        score +
        "</strong> of " +
        TOTAL +
        " sentences.</p>" +
        '<button type="button" class="ms-btn" id="ms-again">Play again</button>' +
        "</section>";
      document.getElementById("ms-again").onclick = startGame;
      return;
    }

    var r = ROUNDS[index];
    var pct = Math.round((index / TOTAL) * 100);
    app.innerHTML =
      '<header class="ms-topbar">' +
      '<a class="ms-back" href="../" aria-label="Back">←</a>' +
      '<span class="ms-title">' +
      r.meal +
      " · " +
      (r.kind === "positive" ? "Positive" : "Negative") +
      "</span>" +
      '<span class="ms-badge">' +
      (index + 1) +
      " / " +
      TOTAL +
      "</span></header>" +
      '<div class="ms-progress"><div class="ms-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="ms-sentence-card" id="ms-sentence"></div>' +
      '<p class="ms-hint">Tap chips to fill the blanks. Tap a blank to remove a word.</p>' +
      '<div class="ms-pool" id="ms-pool"></div>' +
      '<div class="ms-actions">' +
      '<button type="button" class="ms-btn secondary" id="ms-clear">Clear</button>' +
      '<button type="button" class="ms-btn" id="ms-check">Check ✓</button>' +
      "</div>" +
      '<div class="ms-fb" id="ms-fb" aria-live="polite"></div>';

    document.getElementById("ms-clear").onclick = clearAll;
    document.getElementById("ms-check").onclick = checkAnswer;
    updateUI();
  }

  render();
})();
