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

/* Choose the verb after going to · AEF 1 Unit 10B */
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

  var GAME_ID = "1-10b-choose-going-to-verb";

  var ITEMS = [
    { before: "I am going to", after: "English.", options: ["study", "studies", "studying"], correct: "study" },
    { before: "She is going to", after: "dinner.", options: ["cooks", "cook", "cooking"], correct: "cook" },
    { before: "They are going to", after: "football.", options: ["play", "plays", "playing"], correct: "play" },
    { before: "He is going to", after: "a movie.", options: ["watches", "watching", "watch"], correct: "watch" },
    { before: "We are going to", after: "pizza.", options: ["eat", "eats", "eating"], correct: "eat" },
    { before: "You are going to", after: "your room.", options: ["cleans", "clean", "cleaning"], correct: "clean" },
    { before: "My mother is going to", after: "a cake.", options: ["make", "makes", "making"], correct: "make" },
    { before: "I am going to", after: "my friend.", options: ["calls", "calling", "call"], correct: "call" },
    { before: "They are going to", after: "to music.", options: ["listen", "listens", "listening"], correct: "listen" },
    { before: "Tom is going to", after: "a new laptop.", options: ["buys", "buy", "buying"], correct: "buy" }
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

  function saveStars(finalScore, total) {
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        var pct = Math.round((finalScore / total) * 100);
        LAStars.saveFromAccuracy(GAME_ID, pct);
      }
    } catch (_) {}
  }

  function showStart() {
    clearTimer();
    locked = false;
    app.innerHTML =
      '<div class="bia-top">' +
      '<a class="bia-back" href="../" aria-label="Back">←</a>' +
      '<div class="bia-title-wrap">' +
      '<div class="bia-kicker">Unit 10B · Grammar</div>' +
      '<h1 class="bia-title">going to + verb</h1>' +
      "</div></div>" +
      '<div class="bia-start">' +
      '<div class="bia-hero" aria-hidden="true">🎯</div>' +
      "<h1>Choose the correct verb</h1>" +
      "<p>After <strong>going to</strong>, use the base form of the verb.</p>" +
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
    var opts = shuffle(item.options.slice());
    var pct = (index / ITEMS.length) * 100;

    app.innerHTML =
      '<div class="bia-top">' +
      '<a class="bia-back" href="../" aria-label="Back">←</a>' +
      '<div class="bia-title-wrap">' +
      '<div class="bia-kicker">Unit 10B · Grammar</div>' +
      '<h1 class="bia-title">Choose the verb</h1>' +
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
      opts
        .map(function (opt) {
          return (
            '<button type="button" class="bia-chip" data-val="' +
            escapeHtml(opt) +
            '">' +
            escapeHtml(opt) +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="bia-feedback" id="feedback"></div>' +
      "</div>";

    requestAnimationFrame(function () {
      var fill = document.getElementById("biaFill");
      if (fill) fill.style.width = ((index + 1) / ITEMS.length) * 100 + "%";
    });

    document.querySelectorAll(".bia-chip").forEach(function (btn) {
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

    document.querySelectorAll(".bia-chip").forEach(function (b) {
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
    if (window.ArcadeFX && order.length >= 8 && index + 1 === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (index + 1) + " of " + order.length + " done");
    index += 1;
    render();
  }

  function finish() {
    clearTimer();
    sfx("win");
    var total = ITEMS.length;
    saveStars(score, total);

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
