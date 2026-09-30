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

/* Write the Verb — simple present / continuous forms · Starter Unit 9B */
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

const GAME_ID = "starter-9b-write-the-verb";

  const ITEMS = [
    // —— original set ——
    {
      before: "Sara usually",
      after: "at 7:00.",
      base: "get up",
      answers: ["gets up", "gets-up"],
      display: "gets up",
    },
    {
      before: "She",
      after: "breakfast now.",
      base: "have",
      answers: ["is having", "she's having", "she is having"],
      display: "is having",
    },
    {
      before: "Tom",
      after: "in a bank.",
      base: "work",
      answers: ["works"],
      display: "works",
    },
    {
      before: "He",
      after: "to his boss at the moment.",
      base: "talk",
      answers: ["is talking", "he's talking", "he is talking"],
      display: "is talking",
    },
    {
      before: "We",
      after: "English every week.",
      base: "study",
      answers: ["study"],
      display: "study",
    },
    {
      before: "We",
      after: "English now.",
      base: "study",
      answers: ["are studying", "we're studying", "we are studying"],
      display: "are studying",
    },
    {
      before: "My father",
      after: "TV every evening.",
      base: "watch",
      answers: ["watches"],
      display: "watches",
    },
    {
      before: "He",
      after: "the newspaper now.",
      base: "read",
      answers: ["is reading", "he's reading", "he is reading"],
      display: "is reading",
    },
    {
      before: "They",
      after: "to the gym on Mondays.",
      base: "go",
      answers: ["go"],
      display: "go",
    },
    {
      before: "They",
      after: "now.",
      base: "exercise",
      answers: ["are exercising", "they're exercising", "they are exercising"],
      display: "are exercising",
    },
    // —— book set (complete the sentences) ——
    {
      before: "Do you usually",
      after: "to work?",
      base: "walk",
      answers: ["walk"],
      display: "walk",
    },
    {
      before: "Oh no! It",
      after: "and I don't have my umbrella.",
      base: "rain",
      answers: ["is raining", "it's raining", "it is raining"],
      display: "is raining",
    },
    {
      before: "My father and I",
      after: "dinner together every week.",
      base: "have",
      answers: ["have"],
      display: "have",
    },
    {
      before: "Maya and Jack are on vacation this week. They",
      after: "in Canada.",
      base: "ski",
      answers: ["are skiing", "they're skiing", "they are skiing"],
      display: "are skiing",
    },
    {
      before: "A: Hi, Sam.",
      after: "the basketball game on TV?",
      base: "watch",
      answers: [
        "are you watching",
        "are you watch",
      ],
      display: "Are you watching",
    },
    {
      before: "B: No, I",
      after: "my Spanish homework.",
      base: "do",
      answers: ["am doing", "I'm doing", "i'm doing", "i am doing"],
      display: "am doing",
    },
    {
      before: "I always",
      after: "late.",
      base: "get up",
      answers: ["get up", "get-up"],
      display: "get up",
    },
    {
      before: "I never",
      after: "time for breakfast.",
      base: "have",
      answers: ["have"],
      display: "have",
    },
    {
      before: "My sister",
      after: "in Thailand right now.",
      base: "travel",
      answers: [
        "is traveling",
        "is travelling",
        "she's traveling",
        "she's travelling",
        "she is traveling",
        "she is travelling",
      ],
      display: "is traveling",
    },
    {
      before: "A: What time",
      after: "you usually go to bed?",
      base: "do / go",
      answers: ["do"],
      display: "do",
    },
    {
      before: "A: What time do you usually",
      after: "to bed?",
      base: "go",
      answers: ["go"],
      display: "go",
    },
    {
      before: "Look. That's my brother over there. Can you see him? He",
      after: "a blue hat.",
      base: "wear",
      answers: ["is wearing", "he's wearing", "he is wearing"],
      display: "is wearing",
    },
    {
      before: "A: Hello, Nick. Where",
      after: "?",
      base: "go",
      answers: [
        "are you going",
        "are you go",
      ],
      display: "are you going",
    },
    {
      before: "B: To the gym. I always",
      after: "on Tuesdays.",
      base: "go",
      answers: ["go"],
      display: "go",
    },
  ];

  const startScreen = document.getElementById("startScreen");
  const playScreen = document.getElementById("playScreen");
  const sentenceText = document.getElementById("sentenceText");
  const sentenceCard = document.getElementById("sentenceCard");
  const promptHint = document.getElementById("promptHint");
  const answerInput = document.getElementById("answerInput");
  const checkBtn = document.getElementById("checkBtn");
  const feedback = document.getElementById("feedback");
  const progressLabel = document.getElementById("progressLabel");
  const scorePill = document.getElementById("scorePill");
  const inputRow = document.querySelector(".vw-input-row");

  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let advanceTimer = null;

  function restartAnim(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }


  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function clearTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\s+/g, " ")
      // ignore final . ! ? so answers work with or without a period
      .replace(/[.!?]+\s*$/g, "")
      .trim();
  }

  function isCorrect(input, item) {
    const n = normalize(input);
    if (!n) return false;
    return item.answers.some(function (a) {
      return normalize(a) === n;
    });
  }

  function showStart() {
    clearTimer();
    locked = false;
    startScreen.classList.remove("hidden");
    playScreen.classList.add("hidden");
  }

  function start() {
    clearTimer();
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    locked = false;
    scorePill.textContent = "0";
    startScreen.classList.add("hidden");
    playScreen.classList.remove("hidden");
    if (window.LAFinish) LAFinish.startTimer();
    loadItem();
  }

  function loadItem() {
    locked = false;
    clearTimer();
    const item = ITEMS[order[index]];
    progressLabel.textContent = index + 1 + " / " + order.length;
    scorePill.textContent = String(score);

    sentenceCard.className = "vw-card";
    promptHint.innerHTML = '<span>(' + escapeHtml(item.base) + ')</span>';
    sentenceText.innerHTML =
      escapeHtml(item.before) +
      ' <span class="vw-blank" id="blank">····</span> ' +
      escapeHtml(item.after);

    feedback.innerHTML = "";
    feedback.className = "vw-feedback";

    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.className = "vw-input";
    checkBtn.disabled = true;
    if (inputRow) inputRow.className = "vw-input-row";
    restartAnim(sentenceCard, "anim-in");
    if (inputRow) restartAnim(inputRow, "anim-in");

    setTimeout(function () {
      try { answerInput.focus(); } catch (e) {}
    }, 80);
  }

  function check() {
    if (locked) return;
    const item = ITEMS[order[index]];
    const val = answerInput.value;
    if (!val.trim()) return;

    locked = true;
    answerInput.disabled = true;
    checkBtn.disabled = true;
    restartAnim(checkBtn, "opt-pop");

    const blank = document.getElementById("blank");
    const ok = isCorrect(val, item);

    if (ok) { try{sfxCorrect();}catch(e){}
      score += 1;
      scorePill.textContent = String(score);
      restartAnim(scorePill, "score-bump");
      answerInput.className = "vw-input is-ok";
      if (blank) {
        blank.textContent = item.display;
        blank.classList.add("filled-ok");
        restartAnim(blank, "blank-fill");
      }
      sentenceCard.classList.add("is-correct");
      feedback.innerHTML = '<span class="vw-answer-label">Correct!</span>';
      feedback.className = "vw-feedback ok feedback-in";
      if (window.LASfx) LASfx.correct();
      advanceTimer = setTimeout(next, 800);
    } else {
      // Keep the player's text; only show the answer below.
      answerInput.className = "vw-input is-bad";
      sentenceCard.classList.add("is-wrong");
      feedback.innerHTML = '<span class="vw-answer-label">Answer:</span> <span class="vw-answer-word">' + escapeHtml(item.display) + "</span>";
      feedback.className = "vw-feedback bad feedback-in";
      if (window.LASfx) LASfx.wrong();
      advanceTimer = setTimeout(next, 1400);
    }
  }

  function next() {
    clearTimer();
    if (index + 1 >= order.length) {
      finish();
      return;
    }
    index += 1;
    loadItem();
  }

  function finish() {
    clearTimer();
    if (window.LASfx) LASfx.win();
    var total = order.length;
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: Math.max(total, 1),
        timeMs: timeMs,
        onAgain: start,
        onModes: showStart,
        backHref: "../",
        save: true,
      });
      return;
    }
    if (window.LAStars) {
      try {
        var acc = Math.round((score / total) * 100);
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
      } catch (e) {}
    }
    alert("Done! Score: " + score + " / " + total);
    showStart();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  document.getElementById("startBtn").addEventListener("click", start);
  document.getElementById("exitBtn").addEventListener("click", function () {
    clearTimer();
    showStart();
  });
  checkBtn.addEventListener("click", check);
  answerInput.addEventListener("input", function () {
    if (locked) return;
    checkBtn.disabled = !answerInput.value.trim();
    answerInput.className = "vw-input";
    feedback.textContent = "";
    feedback.className = "vw-feedback";
  });
  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!locked && answerInput.value.trim()) check();
    }
  });
})();
