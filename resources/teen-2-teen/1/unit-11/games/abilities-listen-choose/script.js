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
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; },
    cheer: function (i, n, msg) { if (msg) { var c = ["✨", "Nice!", msg]; burst(c); } }
  };
  function start() {
    if (document.getElementById("afx-combo")) return;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Listen & Choose – Abilities · Teen2Teen 1 Unit 11 */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u11-abilities-listen-choose";
  var TOTAL = 4;

  var ITEMS = [
    {
      audio: "https://cdn.imgurl.ir/uploads/h247182_conv1.mp3",
      options: [
        { text: "She can ride a horse.", correct: false },
        { text: "She can't ride a horse.", correct: true }
      ]
    },
    {
      audio: "https://cdn.imgurl.ir/uploads/d59005_conv2.mp3",
      options: [
        { text: "He can swim.", correct: false },
        { text: "He can't swim.", correct: true }
      ]
    },
    {
      audio: "https://cdn.imgurl.ir/uploads/d144842_conv3.mp3",
      options: [
        { text: "She can dance well.", correct: false },
        { text: "She can't dance well.", correct: true }
      ]
    },
    {
      audio: "https://cdn.imgurl.ir/uploads/b038822_conv4.mp3",
      options: [
        { text: "Yaya can sing well.", correct: true },
        { text: "Yaya can't sing well.", correct: false }
      ]
    }
  ];

  var startScreen = document.getElementById("startScreen");
  var gameScreen = document.getElementById("gameScreen");
  var choicesEl = document.getElementById("choices");
  var playBtn = document.getElementById("playBtn");
  var feedback = document.getElementById("feedback");
  var roundLabel = document.getElementById("roundLabel");
  var progressFill = document.getElementById("progressFill");
  var scoreNum = document.getElementById("scoreNum");
  var startBtn = document.getElementById("startBtn");

  var index = 0;
  var score = 0;
  var accepting = false;
  var currentAudio = null;
  var sfxCtx = null;
  var answered = false;

  function getSfxCtx() {
    if (sfxCtx) return sfxCtx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) sfxCtx = new AC();
    } catch (e) {}
    return sfxCtx;
  }

  function sfxOk() {
    try {
      if (window.LASfx && LASfx.ok) { LASfx.ok(); return; }
      var ctx = getSfxCtx(); if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime;
      [523, 659, 784].forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.08, t + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.18);
        o.connect(g); g.connect(ctx.destination);
        o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.2);
      });
    } catch (e) {}
  }

  function sfxBad() {
    try {
      if (window.LASfx && LASfx.bad) { LASfx.bad(); return; }
      var ctx = getSfxCtx(); if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(110, t + 0.25);
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.3);
    } catch (e) {}
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
      currentAudio = null;
    }
    playBtn.classList.remove("playing");
  }

  function playSound() {
    var item = ITEMS[index];
    if (!item) return;
    stopAudio();
    var a = new Audio(item.audio);
    currentAudio = a;
    playBtn.classList.add("playing");
    a.play().catch(function () {});
    a.onended = function () {
      if (currentAudio === a) {
        playBtn.classList.remove("playing");
        currentAudio = null;
      }
    };
    a.onerror = function () {
      playBtn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function shuffleOptions(opts) {
    var a = opts.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function updateHud() {
    roundLabel.textContent = (index + 1) + " / " + TOTAL;
    scoreNum.textContent = String(score);
    var pct = Math.round((index / TOTAL) * 100);
    if (answered && index === TOTAL - 1) pct = 100;
    progressFill.style.width = pct + "%";
    if (window.ArcadeFX && ArcadeFX.bar) ArcadeFX.bar(pct);
  }

  function renderChoices() {
    var item = ITEMS[index];
    if (!item) return;
    var opts = shuffleOptions(item.options);
    choicesEl.innerHTML = "";
    opts.forEach(function (opt, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.setAttribute("data-correct", opt.correct ? "1" : "0");
      var letter = String.fromCharCode(65 + i);
      btn.innerHTML =
        '<span class="choice-letter" aria-hidden="true">' + letter + "</span>" +
        '<span class="choice-label">' + escapeHtml(opt.text) + "</span>";
      btn.addEventListener("click", function () { onChoose(btn, opt.correct); });
      choicesEl.appendChild(btn);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function beginPrompt() {
    answered = false;
    accepting = true;
    feedback.textContent = "Tap play, then choose the correct sentence.";
    feedback.className = "";
    updateHud();
    renderChoices();
    // Auto-play after a short beat
    setTimeout(function () {
      if (!answered && ITEMS[index]) playSound();
    }, 350);
  }

  function onChoose(btn, correct) {
    if (!accepting || answered) return;
    answered = true;
    accepting = false;
    stopAudio();

    var buttons = choicesEl.querySelectorAll(".choice-btn");
    buttons.forEach(function (b) {
      b.disabled = true;
      var isCorrect = b.getAttribute("data-correct") === "1";
      if (isCorrect) b.classList.add("is-correct");
      else if (b === btn && !correct) b.classList.add("is-wrong");
      else if (b !== btn) b.classList.add("is-dim");
    });

    if (correct) {
      score += 1;
      sfxOk();
      feedback.textContent = "✓ Correct!";
      feedback.className = "ok";
      if (window.ArcadeFX) ArcadeFX.ok();
    } else {
      sfxBad();
      feedback.textContent = "✗ Not quite — look at the green answer.";
      feedback.className = "bad";
      if (window.ArcadeFX) ArcadeFX.bad();
    }

    updateHud();

    setTimeout(function () {
      index += 1;
      if (index >= TOTAL) {
        progressFill.style.width = "100%";
        finishGame();
      } else {
        beginPrompt();
      }
    }, 1100);
  }

  function starsFromScore(s, total) {
    if (s >= total) return 3;
    if (s >= total - 1) return 2;
    if (s >= Math.ceil(total / 2)) return 1;
    return 0;
  }

  function finishGame() {
    stopAudio();
    accepting = false;
    var stars = starsFromScore(score, TOTAL);

    // LAFinish handles star save + play count — do NOT also call LAStars here (avoids double counting)
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
            gameScreen.classList.add("hidden");
            startScreen.classList.remove("hidden");
          },
          backHref: "../"
        });
        return;
      } catch (e) {
        console.warn(e);
      }
    }

    // Fallback only if LAFinish is unavailable
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (stars > 0) LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    if (window.ArcadeFX) ArcadeFX.reset();
    index = 0;
    score = 0;
    answered = false;
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    beginPrompt();
  }

  startBtn.addEventListener("click", startGame);
  playBtn.addEventListener("click", function () {
    if (ITEMS[index]) playSound();
  });
})();
