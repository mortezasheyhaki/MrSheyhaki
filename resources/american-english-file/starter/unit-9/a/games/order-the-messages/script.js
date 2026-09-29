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

/* Order the Messages + Vocabulary – Starter Unit 9A */
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

const AUDIO_URL = "https://cdn.imgurl.ir/uploads/72018_AEF3e_Starter_SB_9_mp3cut_net.mp3";
  const GAME_ID = "starter-9a-order-the-messages";

  function saveStars(correct, total) {
    try {
      if (!window.LAStars || !total) return;
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, Math.round((correct / total) * 100));
    } catch (_) {}
  }

  // Part 1 – match messages: 1-B, 2-D, 3-A, 4-C, 5-E
  const MESSAGES = [
    { id: 1, text: "Hi. I'm just leaving the house now.", correct: "B" },
    { id: 2, text: "No, I'm not. I'm riding my bike. See you in 20 minutes?", correct: "D" },
    { id: 3, text: "Where are you? I'm at the movie theater, but I can't see you. I'm waiting outside.", correct: "A" },
    { id: 4, text: "It's really cold outside. I'm going in.", correct: "C" },
    { id: 5, text: "I'm standing near the box office. I'm wearing a black jacket. Can you see me?", correct: "E" },
  ];

  const ANSWERS = [
    { id: "A", text: "I'm arriving at the movie theater now. Where are you?" },
    { id: "B", text: "Me too. I'm walking to the bus stop. Are you taking the bus, too?" },
    { id: "C", text: "Sorry, we're in a lot of traffic. There in five minutes." },
    { id: "D", text: "OK. See you then." },
    { id: "E", text: "Yes, I can! Can you see me? I'm walking towards you now!" },
  ];

  // Part 2 – vocabulary fill-in
  const VOCAB = [
    { id: 1, before: "the place where you wait for a bus:", after: "", correct: "bus stop" },
    { id: 2, before: "the opposite of inside:", after: "", correct: "outside" },
    { id: 3, before: "a lot of cars, buses, etc.: a lot of", after: "", correct: "traffic" },
    { id: 4, before: "the place where you buy movie tickets:", after: "", correct: "box office" },
    { id: 5, before: "to walk in the direction of somebody: to walk", after: "somebody", correct: "towards" },
  ];

  const VOCAB_CHIPS = ["bus stop", "outside", "traffic", "box office", "towards"];

  const app = document.getElementById("game-app");
  if (!app) return;

  // phase: match | match-done | vocab | vocab-done
  let phase = "match";

  // Part 1 state
  let slots = { 1: null, 2: null, 3: null, 4: null, 5: null };
  let selectedLetter = null;
  let matchScore = 0;
  let answerOrder = shuffle(ANSWERS.map((a) => a.id));
  let lastPlaced = null;
  let lastPlacedTimer = null;

  // Part 2 state
  let vocabSlots = { 1: null, 2: null, 3: null, 4: null, 5: null };
  let selectedWord = null;
  let vocabScore = 0;
  let vocabOrder = shuffle(VOCAB_CHIPS.slice());
  let vocabChecked = false;

  let currentAudio = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
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

  function getAnswer(id) {
    return ANSWERS.find((a) => a.id === id);
  }

  /* ---------- Audio ---------- */
  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.src = ""; } catch (_) {}
      currentAudio = null;
    }
    const btn = document.getElementById("om-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    const btn = document.getElementById("om-play");
    const status = document.getElementById("om-audio-status");
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      if (status) status.textContent = "Paused — tap to play again";
      return;
    }
    stopAudio();
    if (btn) btn.classList.add("playing");
    if (status) status.textContent = "Playing…";
    const a = new Audio(AUDIO_URL);
    a.preload = "auto";
    currentAudio = a;
    a.onended = () => {
      currentAudio = null;
      if (btn) btn.classList.remove("playing");
      if (status) status.textContent = "Done — tap to listen again";
    };
    a.onerror = () => {
      currentAudio = null;
      if (btn) btn.classList.remove("playing");
      if (status) status.textContent = "Could not load audio";
    };
    const p = a.play();
    if (p && p.catch) {
      p.catch(() => {
        if (btn) btn.classList.remove("playing");
        if (status) status.textContent = "Tap again to play";
      });
    }
  }

  /* ---------- Part 1: Match ---------- */
  function usedLetters() {
    return new Set(Object.values(slots).filter(Boolean));
  }

  function allMatchFilled() {
    return Object.values(slots).every((v) => v !== null);
  }

  function placeLetter(msgId, letter) {
    if (phase !== "match") return;
    Object.keys(slots).forEach((k) => {
      if (slots[k] === letter) slots[k] = null;
    });
    slots[msgId] = letter;
    selectedLetter = null;
    if (window.LASfx) LASfx.pop();
    lastPlaced = { msgId: +msgId, letter };
    if (lastPlacedTimer) clearTimeout(lastPlacedTimer);
    lastPlacedTimer = setTimeout(() => {
      lastPlaced = null;
      lastPlacedTimer = null;
      const slot = app.querySelector('.om-slot[data-msg="' + msgId + '"]');
      if (slot) {
        slot.classList.remove("just-dropped");
        const chip = slot.querySelector(".om-chip");
        if (chip) chip.classList.remove("just-placed");
      }
    }, 500);
    render();
  }

  function clearSlot(msgId) {
    if (phase !== "match") return;
    slots[msgId] = null;
    render();
  }

  function onChipTap(letter) {
    if (phase !== "match") return;
    const used = usedLetters();
    if (used.has(letter)) {
      Object.keys(slots).forEach((k) => {
        if (slots[k] === letter) slots[k] = null;
      });
      selectedLetter = null;
      render();
      return;
    }
    selectedLetter = selectedLetter === letter ? null : letter;
    render();
  }

  function onSlotTap(msgId) {
    if (phase !== "match") return;
    if (selectedLetter) {
      placeLetter(msgId, selectedLetter);
      return;
    }
    if (slots[msgId]) {
      selectedLetter = slots[msgId];
      slots[msgId] = null;
      render();
    }
  }

  function checkMatch() {
    if (!allMatchFilled() || phase !== "match") return;
    matchScore = 0;
    MESSAGES.forEach((m) => {
      if (slots[m.id] === m.correct) matchScore += 1;
    });
    phase = "match-done";
    saveStars(matchScore, 5);
    render();
  }

  function goToVocab() {
    phase = "vocab";
    selectedWord = null;
    vocabChecked = false;
    vocabSlots = { 1: null, 2: null, 3: null, 4: null, 5: null };
    vocabOrder = shuffle(VOCAB_CHIPS.slice());
    render();
  }

  /* ---------- Part 2: Vocab ---------- */
  function usedWords() {
    return new Set(Object.values(vocabSlots).filter(Boolean));
  }

  function allVocabFilled() {
    return Object.values(vocabSlots).every((v) => v !== null);
  }

  function placeWord(itemId, word) {
    if (phase !== "vocab" || vocabChecked) return;
    Object.keys(vocabSlots).forEach((k) => {
      if (vocabSlots[k] === word) vocabSlots[k] = null;
    });
    vocabSlots[itemId] = word;
    selectedWord = null;
    if (window.LASfx) LASfx.pop();
    render();
  }

  function clearVocabSlot(itemId) {
    if (phase !== "vocab" || vocabChecked) return;
    vocabSlots[itemId] = null;
    render();
  }

  function onWordTap(word) {
    if (phase !== "vocab" || vocabChecked) return;
    if (usedWords().has(word)) {
      Object.keys(vocabSlots).forEach((k) => {
        if (vocabSlots[k] === word) vocabSlots[k] = null;
      });
      selectedWord = null;
      render();
      return;
    }
    selectedWord = selectedWord === word ? null : word;
    render();
  }

  function onVocabRowTap(itemId) {
    if (phase !== "vocab" || vocabChecked) return;
    if (selectedWord) {
      placeWord(itemId, selectedWord);
      return;
    }
    if (vocabSlots[itemId]) {
      selectedWord = vocabSlots[itemId];
      vocabSlots[itemId] = null;
      render();
    }
  }

  function checkVocab() {
    if (!allVocabFilled() || vocabChecked || phase !== "vocab") return;
    vocabChecked = true;
    vocabScore = 0;
    VOCAB.forEach((v) => {
      if (vocabSlots[v.id] === v.correct) vocabScore += 1;
    });
    phase = "vocab-done";
    if (window.LASfx) LASfx.win();
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer();
      var totalScore = matchScore + vocabScore;
      LAFinish.show({
        gameId: GAME_ID,
        score: totalScore,
        total: 10,
        timeMs: timeMs,
        onAgain: resetGame,
        onModes: function () { window.location.href = "../"; },
        backHref: "../",
        save: true
      });
      // still render the review page underneath if user closes overlay
      render();
      setTimeout(playAudio, 400);
      return;
    }
    saveStars(matchScore + vocabScore, 10);
    render();
    setTimeout(playAudio, 400);
  }

  function resetGame() {
    stopAudio();
    if (lastPlacedTimer) clearTimeout(lastPlacedTimer);
    lastPlaced = null;
    lastPlacedTimer = null;
    phase = "match";
    slots = { 1: null, 2: null, 3: null, 4: null, 5: null };
    selectedLetter = null;
    matchScore = 0;
    answerOrder = shuffle(ANSWERS.map((a) => a.id));
    vocabSlots = { 1: null, 2: null, 3: null, 4: null, 5: null };
    selectedWord = null;
    vocabScore = 0;
    vocabOrder = shuffle(VOCAB_CHIPS.slice());
    vocabChecked = false;
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  /* ---------- Drag helpers (match) ---------- */
  function onDragStart(e, letter) {
    if (phase !== "match") { e.preventDefault(); return; }
    e.dataTransfer.setData("text/plain", letter);
    e.dataTransfer.effectAllowed = "move";
    const el = e.currentTarget;
    el.classList.add("dragging");
    try {
      const ghost = el.cloneNode(true);
      ghost.style.position = "absolute";
      ghost.style.top = "-9999px";
      ghost.style.left = "-9999px";
      ghost.style.width = el.offsetWidth + "px";
      ghost.style.transform = "rotate(2deg) scale(1.04)";
      ghost.style.boxShadow = "0 16px 32px rgba(15,23,42,0.2)";
      ghost.style.opacity = "0.95";
      ghost.classList.remove("dragging");
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, el.offsetWidth / 2, 24);
      setTimeout(() => ghost.remove(), 0);
    } catch (_) {}
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove("dragging");
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("drag-over");
  }

  function onDragLeave(e) {
    e.currentTarget.classList.remove("drag-over");
  }

  function onDrop(e, msgId) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    if (phase !== "match") return;
    const letter = e.dataTransfer.getData("text/plain");
    if (letter) placeLetter(msgId, letter);
  }

  /* ---------- Drag helpers (vocab) ---------- */
  function onWordDragStart(e, word) {
    if (phase !== "vocab" || vocabChecked) { e.preventDefault(); return; }
    e.dataTransfer.setData("text/plain", word);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  }

  function onWordDrop(e, itemId) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    if (phase !== "vocab" || vocabChecked) return;
    const word = e.dataTransfer.getData("text/plain");
    if (word) placeWord(itemId, word);
  }

  /* ---------- Render chips ---------- */
  function renderMatchChip(letter, opts) {
    const ans = getAnswer(letter);
    const used = usedLetters().has(letter);
    const isSelected = selectedLetter === letter;
    const classes = [
      "om-chip",
      used && !opts.inSlot ? "used" : "",
      isSelected ? "selected" : "",
      opts.inSlot ? "in-slot" : "",
      opts.justPlaced ? "just-placed" : "",
    ].filter(Boolean).join(" ");
    const draggable = phase === "match" && !opts.inSlot && !used;
    return `
      <div class="${classes}" data-letter="${letter}" draggable="${draggable}"
           role="button" tabindex="0" aria-label="Answer ${letter}">
        <span class="om-chip-id">${letter}</span>
        <span class="om-chip-text">${escapeHtml(ans.text)}</span>
      </div>`;
  }

  function renderWordChip(word, opts) {
    const used = usedWords().has(word);
    const isSelected = selectedWord === word;
    const classes = [
      "om-word-chip",
      used && !opts.inSlot ? "used" : "",
      isSelected ? "selected" : "",
      opts.inSlot ? "in-slot" : "",
      opts.result === "correct" ? "is-correct" : "",
      opts.result === "wrong" ? "is-wrong" : "",
    ].filter(Boolean).join(" ");
    const draggable = phase === "vocab" && !vocabChecked && !opts.inSlot && !used;
    return `
      <button type="button" class="${classes}" data-word="${escapeHtml(word)}"
              draggable="${draggable}" ${used && !opts.inSlot ? "disabled" : ""}>
        ${escapeHtml(word)}
      </button>`;
  }

  /* ---------- Screens ---------- */
  function renderMatchDone() {
    const stars = matchScore === 5 ? 3 : matchScore >= 4 ? 2 : matchScore >= 2 ? 1 : 0;
    app.innerHTML = `
      <header class="om-top">
        <a class="om-back" href="../" aria-label="Back">←</a>
        <div class="om-top-center">
          <span class="om-eyebrow">Part 1 · Complete</span>
          <span class="om-title">Message matches</span>
        </div>
        <span class="om-progress">${matchScore} / 5</span>
      </header>
      <div class="om-body">
        <div class="om-result-card">
          <div class="om-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
          <h2>${matchScore === 5 ? "Perfect!" : matchScore >= 3 ? "Nice work!" : "Keep practicing!"}</h2>
          <p class="om-result-score">You matched <strong>${matchScore}</strong> of 5 correctly.</p>
        </div>

        <section class="om-section om-section-review">
          <p class="om-section-label">Correct answers</p>
          <div class="om-review">
            ${MESSAGES.map((m) => {
              const user = slots[m.id];
              const ok = user === m.correct;
              const ans = getAnswer(m.correct);
              return `
                <div class="om-review-row ${ok ? "ok" : "bad"}">
                  <div class="om-msg mike">
                    <span class="om-num">${m.id}</span>
                    <p>${escapeHtml(m.text)}</p>
                  </div>
                  <div class="om-msg lina ${ok ? "is-correct" : "is-wrong"}">
                    <span class="om-chip-id">${m.correct}</span>
                    <p>${escapeHtml(ans.text)}</p>
                    ${!ok ? `<span class="om-yours">You chose ${user}</span>` : ""}
                  </div>
                </div>`;
            }).join("")}
          </div>
        </section>

        <div class="om-actions">
          <button type="button" class="om-btn" id="om-next-part">Continue to Vocabulary →</button>
        </div>
      </div>`;
    document.getElementById("om-next-part").onclick = goToVocab;
  }

  function renderVocabDone() {
    const stars = vocabScore === 5 ? 3 : vocabScore >= 4 ? 2 : vocabScore >= 2 ? 1 : 0;
    const total = matchScore + vocabScore;
    app.innerHTML = `
      <header class="om-top">
        <a class="om-back" href="../" aria-label="Back">←</a>
        <div class="om-top-center">
          <span class="om-eyebrow">Part 2 · Complete</span>
          <span class="om-title">Vocabulary</span>
        </div>
        <span class="om-progress">${vocabScore} / 5</span>
      </header>
      <div class="om-body">
        <div class="om-result-card">
          <div class="om-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
          <h2>${vocabScore === 5 ? "Perfect!" : vocabScore >= 3 ? "Nice work!" : "Keep practicing!"}</h2>
          <p class="om-result-score">
            Vocabulary: <strong>${vocabScore}/5</strong>
            · Total: <strong>${total}/10</strong>
          </p>
        </div>

        <section class="om-section">
          <p class="om-section-label">Listen to the conversation</p>
          <div class="om-audio-bar">
            <button type="button" class="om-play" id="om-play" aria-label="Play audio">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <div class="om-audio-meta">
              <strong>Full conversation</strong>
              <span id="om-audio-status">Tap to listen</span>
            </div>
          </div>
        </section>

        <section class="om-section om-section-review">
          <p class="om-section-label">Correct answers</p>
          <div class="om-review">
            ${VOCAB.map((v) => {
              const user = vocabSlots[v.id];
              const ok = user === v.correct;
              return `
                <div class="om-vocab-review ${ok ? "ok" : "bad"}">
                  <span class="om-num">${v.id}</span>
                  <p>${escapeHtml(v.before)}
                    <strong class="${ok ? "ok" : "bad"}">${escapeHtml(v.correct)}</strong>
                    ${v.after ? " " + escapeHtml(v.after) : ""}
                    ${!ok ? `<span class="om-yours">You: ${escapeHtml(user)}</span>` : ""}
                  </p>
                </div>`;
            }).join("")}
          </div>
        </section>

        <div class="om-actions">
          <button type="button" class="om-btn" id="om-again">Try again</button>
        </div>
      </div>`;
    document.getElementById("om-play").onclick = playAudio;
    document.getElementById("om-again").onclick = resetGame;
  }

  function renderVocab() {
    const used = usedWords();
    const filled = allVocabFilled();
    app.innerHTML = `
      <header class="om-top">
        <a class="om-back" href="../" aria-label="Back">←</a>
        <div class="om-top-center">
          <span class="om-eyebrow">Part 2 · Vocabulary</span>
          <span class="om-title">Complete the phrases</span>
        </div>
        <span class="om-progress">${Object.values(vocabSlots).filter(Boolean).length} / 5</span>
      </header>
      <div class="om-body om-body-vocab">
        <p class="om-intro">Use the chips to complete each phrase.</p>

        <div class="om-word-bank" id="om-word-bank">
          ${vocabOrder.map((w) => renderWordChip(w, { inSlot: false })).join("")}
        </div>

        <div class="om-vocab-list">
          ${VOCAB.map((v) => {
            const word = vocabSlots[v.id];
            return `
              <div class="om-vocab-row ${word ? "filled" : ""} ${selectedWord && !word ? "ready" : ""}"
                   data-vocab="${v.id}">
                <span class="om-num">${v.id}</span>
                <div class="om-vocab-text">
                  <span>${escapeHtml(v.before)}</span>
                  <span class="om-blank ${word ? "has-word" : ""}" data-blank="${v.id}">
                    ${word
                      ? renderWordChip(word, { inSlot: true })
                      : '<span class="om-blank-line">______</span>'}
                  </span>
                  ${v.after ? `<span> ${escapeHtml(v.after)}</span>` : ""}
                </div>
              </div>`;
          }).join("")}
        </div>

        <div class="om-actions">
          <button type="button" class="om-btn secondary" id="om-v-clear"
            ${Object.values(vocabSlots).some(Boolean) ? "" : "disabled"}>Clear</button>
          <button type="button" class="om-btn" id="om-v-check" ${filled ? "" : "disabled"}>Check answers</button>
        </div>
      </div>`;

    // Bind word bank
    app.querySelectorAll("#om-word-bank .om-word-chip").forEach((el) => {
      const word = el.dataset.word;
      if (used.has(word)) return;
      el.addEventListener("click", () => onWordTap(word));
      el.addEventListener("dragstart", (e) => onWordDragStart(e, word));
      el.addEventListener("dragend", onDragEnd);
    });

    // Bind rows
    app.querySelectorAll(".om-vocab-row").forEach((el) => {
      const id = +el.dataset.vocab;
      el.addEventListener("click", (e) => {
        // if clicking placed chip, clear it
        if (e.target.closest(".om-word-chip.in-slot")) {
          e.stopPropagation();
          clearVocabSlot(id);
          return;
        }
        onVocabRowTap(id);
      });
      el.addEventListener("dragover", onDragOver);
      el.addEventListener("dragleave", onDragLeave);
      el.addEventListener("drop", (e) => onWordDrop(e, id));
    });

    document.getElementById("om-v-check").onclick = checkVocab;
    document.getElementById("om-v-clear").onclick = () => {
      vocabSlots = { 1: null, 2: null, 3: null, 4: null, 5: null };
      selectedWord = null;
      render();
    };
  }

  function renderMatch() {
    const used = usedLetters();
    const filled = allMatchFilled();
    app.innerHTML = `
      <header class="om-top">
        <a class="om-back" href="../" aria-label="Back">←</a>
        <div class="om-top-center">
          <span class="om-eyebrow">Part 1 · Messages</span>
          <span class="om-title">Order the Messages</span>
        </div>
        <span class="om-progress">${Object.values(slots).filter(Boolean).length} / 5</span>
      </header>
      <div class="om-body">
        <p class="om-intro">Match Lina’s answers <strong>A–E</strong> to Mike’s messages <strong>1–5</strong>. Drag or tap to place.</p>

        <div class="om-board">
          <section class="om-col om-col-mike" aria-label="Mike's messages">
            <p class="om-col-label">Mike</p>
            ${MESSAGES.map((m) => {
              const letter = slots[m.id];
              const isJust = lastPlaced && lastPlaced.msgId === m.id && lastPlaced.letter === letter;
              return `
                <div class="om-slot ${letter ? "filled" : ""} ${selectedLetter && !letter ? "ready" : ""} ${isJust ? "just-dropped" : ""}"
                     data-msg="${m.id}" role="button" tabindex="0"
                     aria-label="Message ${m.id} drop zone">
                  <div class="om-msg mike">
                    <span class="om-num">${m.id}</span>
                    <p>${escapeHtml(m.text)}</p>
                  </div>
                  <div class="om-dropzone">
                    ${letter
                      ? renderMatchChip(letter, { inSlot: true, justPlaced: isJust })
                      : `<span class="om-placeholder">Drop answer here</span>`}
                  </div>
                </div>`;
            }).join("")}
          </section>

          <section class="om-col om-col-lina" aria-label="Lina's answers">
            <p class="om-col-label">Lina — drag or tap</p>
            <div class="om-chips" id="om-chips">
              ${answerOrder.map((id) => renderMatchChip(id, { inSlot: false })).join("")}
            </div>
          </section>
        </div>

        <div class="om-actions">
          <button type="button" class="om-btn secondary" id="om-reset"
            ${Object.values(slots).some(Boolean) ? "" : "disabled"}>Clear</button>
          <button type="button" class="om-btn" id="om-check" ${filled ? "" : "disabled"}>Check · Next</button>
        </div>
      </div>`;

    app.querySelectorAll(".om-slot").forEach((el) => {
      const msgId = +el.dataset.msg;
      el.addEventListener("click", () => onSlotTap(msgId));
      el.addEventListener("dragover", onDragOver);
      el.addEventListener("dragleave", onDragLeave);
      el.addEventListener("drop", (e) => onDrop(e, msgId));
      const chip = el.querySelector(".om-chip.in-slot");
      if (chip) {
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          clearSlot(msgId);
        });
      }
    });

    app.querySelectorAll("#om-chips .om-chip").forEach((el) => {
      const letter = el.dataset.letter;
      if (used.has(letter)) return;
      el.addEventListener("click", () => onChipTap(letter));
      el.addEventListener("dragstart", (e) => onDragStart(e, letter));
      el.addEventListener("dragend", onDragEnd);
    });

    document.getElementById("om-check").onclick = checkMatch;
    document.getElementById("om-reset").onclick = () => {
      slots = { 1: null, 2: null, 3: null, 4: null, 5: null };
      selectedLetter = null;
      render();
    };
  }

  function render() {
    if (phase === "match-done") return renderMatchDone();
    if (phase === "vocab") return renderVocab();
    if (phase === "vocab-done") return renderVocabDone();
    return renderMatch();
  }

  if (window.LAFinish) LAFinish.startTimer();
  render();
})();
