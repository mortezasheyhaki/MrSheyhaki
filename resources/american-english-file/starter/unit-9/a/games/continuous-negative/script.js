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
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
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

/* Present Continuous − — fully split: I · am · not · working */
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

const GAME_ID = "starter-9a-continuous-negative";
  function saveStars() {
    try {
      if (!window.LAStars || !order || !order.length) return;
      var acc = Math.round((score / order.length) * 100);
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, acc);
    } catch (_) {}
  }


  const ITEMS = [
    {
      prompt: "I / work",
      words: ["I", "am", "not", "working"],
      sentence: "I am not working",
      alts: ["i'm not working", "im not working"],
      audio: "../audio/I'm not working.mp3",
    },
    {
      prompt: "You / sit / in my chair",
      words: ["You", "are", "not", "sitting", "in", "my", "chair"],
      sentence: "You are not sitting in my chair",
      alts: ["you aren't sitting in my chair", "youre not sitting in my chair", "you aren't sitting in my chair"],
      audio: "../audio/You aren't sitting in my chair.mp3",
    },
    {
      prompt: "He / play soccer",
      words: ["He", "is", "not", "playing", "soccer"],
      sentence: "He is not playing soccer",
      alts: ["he isn't playing soccer", "hes not playing soccer"],
      audio: "../audio/He isn't playing soccer.mp3",
    },
    {
      prompt: "She / take a shower",
      words: ["She", "is", "not", "taking", "a", "shower"],
      sentence: "She is not taking a shower",
      alts: ["she isn't taking a shower", "shes not taking a shower"],
      audio: "../audio/She isn't taking a shower.mp3",
    },
    {
      prompt: "It / rain",
      words: ["It", "is", "not", "raining"],
      sentence: "It is not raining",
      alts: ["it isn't raining", "its not raining"],
      audio: "../audio/It isn't raining.mp3",
    },
    {
      prompt: "We / have dinner",
      words: ["We", "are", "not", "having", "dinner"],
      sentence: "We are not having dinner",
      alts: ["we aren't having dinner", "were not having dinner"],
      audio: "../audio/We aren't having dinner.mp3",
    },
    {
      prompt: "They / listen / to the teacher",
      words: ["They", "are", "not", "listening", "to", "the", "teacher"],
      sentence: "They are not listening to the teacher",
      alts: ["they aren't listening to the teacher", "theyre not listening to the teacher"],
      audio: "../audio/They aren't listening to the teacher.mp3",
    },
  ];

  let mode = "chips";
  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let tray = [];
  let bankWords = [];

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endOverlay = $("endOverlay");
  const modeLabel = $("modeLabel");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const leftText = $("leftText");
  const promptText = $("promptText");
  const chipsPanel = $("chipsPanel");
  const writePanel = $("writePanel");
  const answerSlots = $("answerSlots");
  const chipBank = $("chipBank");
  const chipsFeedback = $("chipsFeedback");
  const clearChipsBtn = $("clearChipsBtn");
  const checkChipsBtn = $("checkChipsBtn");
  const chipsActions = $("chipsActions");
  const chipsNextRow = $("chipsNextRow");
  const listenBtn = $("listenBtn");
  const nextChipsBtn = $("nextChipsBtn");
  const answerInput = $("answerInput");
  const writeFeedback = $("writeFeedback");
  const checkWriteBtn = $("checkWriteBtn");
  const writeActions = $("writeActions");
  const writeNextRow = $("writeNextRow");
  const listenWriteBtn = $("listenWriteBtn");
  const nextWriteBtn = $("nextWriteBtn");

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.?!]+/g, "")
      .replace(/,/g, "")
      .replace(/\bi'm\b/g, "i am")
      .replace(/\byou're\b/g, "you are")
      .replace(/\bhe's\b/g, "he is")
      .replace(/\bshe's\b/g, "she is")
      .replace(/\bit's\b/g, "it is")
      .replace(/\bwe're\b/g, "we are")
      .replace(/\bthey're\b/g, "they are")
      .replace(/\bisn't\b/g, "is not")
      .replace(/\baren't\b/g, "are not")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(built, item) {
    const n = normalize(built);
    if (n === normalize(item.sentence)) return true;
    return (item.alts || []).some(function (a) {
      return normalize(a) === n;
    });
  }

  function playAudio(src) {
    if (!src) return;
    new Audio(src).play().catch(function () {});
  }

  function start(m) {
    mode = m;
    order = shuffle(ITEMS.map(function (_, i) {
      return i;
    }));
    index = 0;
    score = 0;
    locked = false;
    startScreen.classList.add("hidden");
    endOverlay.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    modeLabel.textContent = mode === "chips" ? "Word chips" : "Write it";
    chipsPanel.classList.toggle("hidden", mode !== "chips");
    writePanel.classList.toggle("hidden", mode !== "write");
    if (window.LAFinish) LAFinish.startTimer();
    loadItem();
  }

  function loadItem() {
    locked = false;
    const item = ITEMS[order[index]];
    qProgress.textContent = index + 1 + "/" + order.length;
    scoreText.textContent = String(score);
    leftText.textContent = String(order.length - index);
    promptText.textContent = item.prompt;
    chipsFeedback.textContent = "";
    chipsFeedback.className = "feedback";
    writeFeedback.textContent = "";
    writeFeedback.className = "feedback";
    answerSlots.className = "tray";
    answerInput.className = "answer-input";
    answerInput.value = "";
    answerInput.disabled = false;
    chipsActions.classList.remove("hidden");
    chipsNextRow.classList.add("hidden");
    writeActions.classList.remove("hidden");
    writeNextRow.classList.add("hidden");
    checkChipsBtn.disabled = true;
    checkWriteBtn.disabled = true;
    if (mode === "chips") {
      tray = [];
      renderTray();
      renderBank(shuffle(item.words));
    } else {
      setTimeout(function () {
        answerInput.focus();
      }, 50);
    }
  }

  function renderTray() {
    answerSlots.innerHTML = "";
    if (!tray.length) {
      answerSlots.innerHTML = '<p class="tray-empty">Tap chips to build the sentence</p>';
      checkChipsBtn.disabled = true;
      return;
    }
    tray.forEach(function (t, i) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip used";
      b.textContent = t.word;
      b.addEventListener("click", function () {
        if (locked) return;
        tray.splice(i, 1);
        renderTray();
        renderBank(currentBankWords());
      });
      answerSlots.appendChild(b);
    });
    checkChipsBtn.disabled = tray.length === 0;
  }

  function currentBankWords() {
    const item = ITEMS[order[index]];
    const usedCount = {};
    tray.forEach(function (t) {
      usedCount[t.word] = (usedCount[t.word] || 0) + 1;
    });
    const remaining = [];
    const avail = {};
    item.words.forEach(function (w) {
      avail[w] = (avail[w] || 0) + 1;
    });
    Object.keys(avail).forEach(function (w) {
      const left = avail[w] - (usedCount[w] || 0);
      for (let i = 0; i < left; i++) remaining.push(w);
    });
    return shuffle(remaining);
  }

  function renderBank(words) {
    bankWords = words;
    chipBank.innerHTML = "";
    words.forEach(function (w, i) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = w;
      b.addEventListener("click", function () {
        if (locked) return;
        tray.push({ word: w });
        bankWords.splice(i, 1);
        renderTray();
        renderBank(bankWords);
      });
      chipBank.appendChild(b);
    });
  }

  function checkChips() {
    if (locked) return;
    const item = ITEMS[order[index]];
    const built = tray
      .map(function (t) {
        return t.word;
      })
      .join(" ");
    if (isCorrect(built, item)) {
      locked = true;
      score++;
      scoreText.textContent = String(score);
      if (window.LASfx) LASfx.correct();
      answerSlots.className = "tray ok";
      chipsFeedback.textContent = item.sentence + ".";
      chipsFeedback.className = "feedback ok";
      chipsActions.classList.add("hidden");
      chipsNextRow.classList.remove("hidden");
      playAudio(item.audio);
    } else {
      answerSlots.className = "tray bad shake";
      chipsFeedback.textContent = "Try again";
      chipsFeedback.className = "feedback bad";
      if (window.LASfx) LASfx.wrong();
      setTimeout(function () {
        answerSlots.classList.remove("shake");
      }, 300);
    }
  }

  function checkWrite() {
    if (locked) return;
    const item = ITEMS[order[index]];
    if (isCorrect(answerInput.value, item)) {
      locked = true;
      score++;
      scoreText.textContent = String(score);
      if (window.LASfx) LASfx.correct();
      answerInput.className = "answer-input ok";
      answerInput.disabled = true;
      writeFeedback.textContent = item.sentence + ".";
      writeFeedback.className = "feedback ok";
      writeActions.classList.add("hidden");
      writeNextRow.classList.remove("hidden");
      playAudio(item.audio);
    } else {
      answerInput.className = "answer-input bad shake";
      writeFeedback.textContent = "Try again";
      writeFeedback.className = "feedback bad";
      if (window.LASfx) LASfx.wrong();
      setTimeout(function () {
        answerInput.classList.remove("shake");
      }, 300);
    }
  }

  function next() {
    if (index + 1 >= order.length) {
      if (window.LASfx) LASfx.win();
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: Math.max(order.length, 1),
          timeMs: timeMs,
          onAgain: function () { start(mode); },
          onModes: function () {
            gameScreen.classList.add("hidden");
            endOverlay.classList.add("hidden");
            startScreen.classList.remove("hidden");
          },
          backHref: "../",
          save: true
        });
        return;
      }
      endOverlay.classList.remove("hidden");
      $("endTitle").textContent = "Done!";
      $("endMsg").textContent = "You scored " + score + " of " + order.length;
      saveStars();
      return;
    }
    index++;
    loadItem();
  }

  document.querySelectorAll(".mode-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      start(btn.getAttribute("data-mode"));
    });
  });
  $("exitBtn").addEventListener("click", function () {
    gameScreen.classList.add("hidden");
    endOverlay.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
  clearChipsBtn.addEventListener("click", function () {
    if (locked) return;
    tray = [];
    renderTray();
    renderBank(shuffle(ITEMS[order[index]].words));
    chipsFeedback.textContent = "";
    answerSlots.className = "tray";
  });
  checkChipsBtn.addEventListener("click", checkChips);
  nextChipsBtn.addEventListener("click", next);
  listenBtn.addEventListener("click", function () {
    playAudio(ITEMS[order[index]].audio);
  });
  checkWriteBtn.addEventListener("click", checkWrite);
  nextWriteBtn.addEventListener("click", next);
  listenWriteBtn.addEventListener("click", function () {
    playAudio(ITEMS[order[index]].audio);
  });
  answerInput.addEventListener("input", function () {
    checkWriteBtn.disabled = !answerInput.value.trim();
    if (!locked) {
      answerInput.className = "answer-input";
      writeFeedback.textContent = "";
    }
  });
  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      checkWrite();
    }
  });
  $("playAgainBtn").addEventListener("click", function () {
    start(mode);
  });
  $("homeBtn").addEventListener("click", function () {
    endOverlay.classList.add("hidden");
    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
})();
